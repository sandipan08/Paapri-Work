
/**
*              //////////     GFI Alert Show on PCT 2D Cut Record   //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  ClientScript
*@NModuleScope SameAccount
*@since        2022-04-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The ClientScript 2.1 code in this page is for GFI Project, you can redistribute
               it and/or modify it under the terms of PCT General Public License (PCT GPL) as
               published by the Paapri Business Technologies.
*@description  This ClientScript is used to show an alert on Item & Lot Number Checking.
*/


define(['N/search'],

    function (search)
    {
        function pageInit(context)
        {
            log.debug("PCT-GFI", "In PageInit");
        }

        function fieldChanged(context)
        {
            if (context.fieldId == 'custrecord_pct_cs_sheet_no_list')
            {
                log.debug("PCT-GFI", "In Field Change");
                var currentRecord = context.currentRecord;
                var itemToBeCutId = currentRecord.getValue({ fieldId: "custrecord_pct_metal_item" });
                var lotNumberId = currentRecord.getText({ fieldId: "custrecord_pct_cs_sheet_no_list" });

                log.debug("PCT-GFI", "Item To Be Cut : " + itemToBeCutId + ", Lot Number : " + lotNumberId);
                if (lotNumberId != "")
                {
                    var itemArray = getAvailableQty(itemToBeCutId);
                    log.debug("PCT-GFI", "Item Array : " + JSON.stringify(itemArray));

                    var value = false;
                    itemArray.map((element) =>
                    {
                        if (element.lotNumber != lotNumberId)
                        {
                            value = true;
                        }

                    })
                    if (value) { alert("This Lot Number is not available for this Item"); }
                }

            }
            if (context.fieldId == 'custrecord_pct_metal_length_in_ft')
            {
                log.debug("PCT-GFI", "In Field Change");
                var currentRecord = context.currentRecord;
                var itemToBeCutId = currentRecord.getValue({ fieldId: "custrecord_pct_metal_item" });
                var quantity = currentRecord.getValue({ fieldId: "custrecord_pct_metal_length_in_ft" });

                log.debug("PCT-GFI", "Item To Be Cut : " + itemToBeCutId + ", Quantity : " + quantity);
                if (quantity != "")
                {
                    var itemArray = getAvailableQty(itemToBeCutId);
                    log.debug("PCT-GFI", "Item Array : " + JSON.stringify(itemArray));

                    var value = false;
                    itemArray.map((element) =>
                    {
                        if (element.availableQty < quantity)
                        {
                            value = true;
                        }

                    })
                    if (value) { alert("Available Quantity is less than your putting Quantity"); }
                }

            }
        }

        // ------------------------------------- Search to Get Available Quantity for a Particular Lot Numbered Inventory Item --------------------------------
        function getAvailableQty(itemToBeCutId)
        {
            // Search Id =1120 
            var inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type", "anyof", "InvtPart"],
                        "AND",
                        ["internalidnumber", "equalto", itemToBeCutId],
                        "AND",
                        ["inventorynumber.quantityavailable", "greaterthan", "0"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "quantityavailable",
                            join: "inventoryNumber",
                            label: "Available"
                        }),
                        search.createColumn({
                            name: "location",
                            join: "inventoryNumber",
                            label: "Location"
                        }),
                        search.createColumn({
                            name: "inventorynumber",
                            join: "inventoryNumber",
                            label: "Number"
                        }),
                        search.createColumn({
                            name: "item",
                            join: "inventoryNumber",
                            label: "Item"
                        })
                    ]
            });
            var itemResultCount = inventoryitemSearchObj.runPaged().count;
            log.debug("PCT-GFI", "Item Search Result Count : " + itemResultCount);
            var availableQty = 0;
            var lotNumber = 0;
            var itemArray = new Array();
            if (itemResultCount > 0)
            {
                var itemResult = inventoryitemSearchObj.run().getRange({ start: 0, end: itemResultCount });
                for (var itemIndex = 0; itemIndex < itemResultCount; itemIndex++)
                {
                    var itemObj = {};
                    availableQty = itemResult[itemIndex].getValue({
                        name: "quantityavailable",
                        join: "inventoryNumber",
                        label: "Available"
                    })
                    lotNumber = itemResult[itemIndex].getValue({
                        name: "inventorynumber",
                        join: "inventoryNumber",
                        label: "Number"
                    })
                    itemObj["availableQty"] = availableQty;
                    itemObj["lotNumber"] = lotNumber;
                    itemArray.push(itemObj);
                    // log.debug("PCT-GFI", " Item Obj : " + JSON.parse(itemObj));
                }
            }
            return itemArray;
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,

        }
    });
