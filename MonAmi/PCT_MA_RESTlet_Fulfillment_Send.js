/**
*              //////////     MON AMI Send Fulfillment Response Send    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for MON AMI Send Fulfillment Response Send, you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{


    function _get(context)
    {
        try
        {
            var fulfillmentArray = new Array();
            var itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type", "anyof", "ItemShip"],
                        "AND",
                        ["custbody_pct_update_to_maisonette", "is", "T"],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var fulfillmentCount = itemfulfillmentSearchObj.runPaged().count;
            log.debug("PCT-MonAmi", "Item Fulfillment Result Count : " + fulfillmentCount);
            var start = 0;
            var end = 1000;
            do
            {

                log.debug("PCT-MonAmi", "In Get Input Do");
                var fulfillmentResult = itemfulfillmentSearchObj.run().getRange({ start: start, end: end });
                for (var fulfillmentIndex = 0; fulfillmentIndex < fulfillmentCount; fulfillmentIndex++)
                {
                    var fulfillmentId = fulfillmentResult[fulfillmentIndex].id;
                    var documentNumber = fulfillmentResult[fulfillmentIndex].getValue("tranid");
                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Internal Id : " + fulfillmentId + ", Documnet Number : " + documentNumber
                    })
                    fulfillmentArray.push(documentNumber);
                }
                start += 1000;
                end += 1000;
                fulfillmentCount -= 1000;
            }
            while (fulfillmentCount > 0);
            log.debug({
                title: "PCT-MonAmi",
                details: "MonAmi Fulfillment Record Array : " + JSON.stringify(fulfillmentArray)
            })
            return JSON.stringify(fulfillmentArray);

        }

        catch (ex)
        {
            log.error({ title: 'Restlet: error', details: ex });
            return JSON.stringify({ status: 500, message: err.message });
        }


    }



    return {
        get: _get,
    }
});
