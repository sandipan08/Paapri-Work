/**
*              //////////     MON AMI Invoice to Payment Method Creation  //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for  MON AMI  MON AMI Invoice to Payment Method Creation , you can redistribute
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
            log.debug({
                title: "PCT-MonAmi",
                details: "Context Length : " + context.length + ", Context : [ " + context + " ]"
            });
            for (var fulfillmentIndex = 0; fulfillmentIndex < context.length; fulfillmentIndex++)
            {
                var fulfillmentNumber = context[fulfillmentIndex];
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Item Fulfillment Document Number : " + fulfillmentNumber
                });

                var itemfulfillmentSearchObj = search.create({
                    type: "itemfulfillment",
                    filters:
                        [
                            ["type", "anyof", "ItemShip"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["numbertext", "is", fulfillmentNumber]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "tranid", label: "Document Number" }),
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });

                // var searchResultCount = itemfulfillmentSearchObj.runPaged().count;
                var fulfillmentCount = itemfulfillmentSearchObj.runPaged().count;
                log.debug("PCT-MonAmi", "Item Fulfillment Result Count : " + searchResultCount);
                if (fulfillmentCount > 0)
                {
                    var fulfillmentResult = itemfulfillmentSearchObj.run().getRange({ start: 0, end: fulfillmentCount });
                    for (var fulfillmentIndex = 0; fulfillmentIndex < invoiceCount; fulfillmentIndex++)
                    {
                        var fulfillmentId = fulfillmentResult[fulfillmentIndex].id;
                        var fulfillmentLoad = record.load({
                            type: 'itemfulfillment',
                            id: fulfillmentId
                        });
                        fulfillmentLoad.setValue({
                            fieldId: "custbody_pct_update_to_maisonette",
                            value: false,

                        })
                        fulfillmentLoad.save();
                        sucessCount++;
                    }
                }
                else
                {
                    errorCount++;
                    errorArray.push(fulfillmentNumber);
                }
            }

        }

        catch (ex)
        {
            log.error({ title: 'PCT-MonAmi', details: 'Restlet: Error : ' + ex });

        }
        // return JSON.stringify({ status: 500, message: err.message });
        return JSON.stringify({ NoOfInsertedRecords: sucessCount, NoOfErrorRecords: errorCount });

    }



    return {
        post: _post,
    }
});
