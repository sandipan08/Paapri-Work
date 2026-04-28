/**
*              //////////     MON AMI Update Drop Down Field (Fulfillment Status) in Sales Order     //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for  MON AMI  MON AMI Update Drop Down Field (Fulfillment Status) in Sales Order, you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{


    function _post(context)
    {
        try
        {
            var sucessCount = 0;
            var errorCount = 0;
            var errorArray = new Array();
            var dataLength = context.length;
            log.debug({
                title: "PCT-MonAmi",
                details: "Context Length : " + dataLength + ", Context : [ " + context + " ]"
            });
            for (var soIndex = 0; soIndex < context.length; soIndex++)
            {
                var soNumber = context[soIndex];
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Document Number : " + soNumber
                });
                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters:
                        [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["numbertext", "is", soNumber]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var soCount = salesorderSearchObj.runPaged().count;
                log.debug("PCT-MonAmi", "Sales Order Count : " + soCount);
                var soResult = salesorderSearchObj.run().getRange({ start: 0, end: soCount });
                for (var getid_index = 0; getid_index < soResult.length; getid_index++)
                {
                    var iaid = soResult[getid_index].id;
                    var salesOrderobj = record.load({
                        type: 'salesorder',
                        id: iaid
                    });

                }
                var current_date = new Date();
                var dd = current_date.getDate();
                var mm = current_date.getMonth() + 1;
                var yyyy = current_date.getFullYear();
                var date = mm + "/" + dd + "/" + yyyy;
                salesOrderobj.setText({ fieldId: 'custbody_pct_ma_fulfillment_status', text: "Fulfillment Requested" });
                salesOrderobj.setValue({ fieldId: 'custbody_pct_ma_dof_request', value: new Date(date) });

                salesOrderobj.save();
                sucessCount++;
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Sales Order Updated"
                })
            }

        }

        catch (ex)
        {
            errorCount++;
            var errorObj = {};
            errorObj["soNumber"] = soNumber;
            errorObj["errorMessage"] = ex;
            errorArray.push(errorObj)
            log.error({ title: 'Restlet: error', details: ex });
        }


        return { NoOfInsertedRecords: sucessCount, NoOfErrorRecords: errorCount, ErrorObjects: errorArray };
    }



    return {
        post: _post,
    }
});
