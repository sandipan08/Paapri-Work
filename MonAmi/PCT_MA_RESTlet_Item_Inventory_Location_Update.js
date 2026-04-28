/**
*              //////////     MON AMI Item Inventory Location Update    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for  MON AMI  MON AMI Item Inventory Location Update, you can redistribute
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
            var successArray = new Array();
            var errorCount = 0;
            var sucessCount = 0;
            // context = [{ "SKU": "55320", "qty": 2 }, { "SKU": "ST1018", "qty": 2 }, { "SKU": "10136", "qty": 1 }]
            // context = [{ "SKU": "10136", "qty": 1 }];
            var dataLength = context.length;
            log.debug({
                title: "PCT-MonAmi",
                details: "Context Length : " + dataLength + ", Context : [ " + JSON.stringify(context) + " ]"
            });
            context.forEach(function (context)
            {
                var sku = context.SKU;
                var qty = context.qty;
                log.debug("PCT-MonAmi", "SKU Code : " + sku + ", Qty : " + qty);
                var returnArray = transferInventory(sku, qty);
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Return Array : " + returnArray
                })
                if (returnArray.length)
                {

                    var returnsSku = returnArray[0];
                    var returnQty = returnArray[1];
                    var successObj = {};
                    successObj["SKU"] = returnsSku;
                    successObj["qty"] = returnQty;
                    successArray.push(successObj);
                }

            });

        }
        catch (ex)
        {
            // errorCount++;
            // var errorObj = {};
            // errorObj["skuNumber"] = context.SKU;
            // errorObj["itemQty"] = context.qty;
            // errorArray.push(errorObj)
            log.error({ title: 'Restlet: error', details: ex });

        }
        return successArray;
        // return JSON.stringify({ TotalDataSent: dataLength, NoOfUpdatedInventory: sucessCount, NoOfError: errorCount, ErrorObjects: errorArray });
    }
    function transferInventory(sku, qty)
    {
        var itemCount = 0;
        log.debug("PCT-MonAmi", "In TransferInventory Function DATA [ SKU : " + sku + ", Qty : " + qty + " ]");
        var inventoryadjustmentSearchObj = search.create({
            type: "inventoryadjustment",
            filters:
                [
                    ["type", "anyof", "InvAdjst"],
                    "AND",
                    ["item.name", "is", sku],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["quantity", "isnotempty", ""]

                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({
                        name: "name",
                        join: "location",
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "itemid",
                        join: "item",
                        label: "Name"
                    })
                ]
        });

        var inventoryAdjustmentCount = inventoryadjustmentSearchObj.runPaged().count;
        log.debug("PCT-MonAmi", "Inventory Adjustment Count : " + inventoryAdjustmentCount);
        if (inventoryAdjustmentCount > 0)
        {
            var inventoryAdjustmentResult = inventoryadjustmentSearchObj.run().getRange({ start: 0, end: inventoryAdjustmentCount });
            for (var inventoryIndex = 0; inventoryIndex < inventoryAdjustmentCount; inventoryIndex++)
            {
                var iaid = inventoryAdjustmentResult[inventoryIndex].id;
                var item = inventoryAdjustmentResult[inventoryIndex].getValue({
                    name: "itemid",
                    join: "item",
                });
                var location = inventoryAdjustmentResult[inventoryIndex].getValue({
                    name: "name",
                    join: "location",
                });
                var quantity = inventoryAdjustmentResult[inventoryIndex].getValue({ name: "quantity" });
                log.debug("PCT-MonAmi", "Inventory Adjustment Id  : " + iaid + ", Item Name : " + item + ", Location : " + location + ", Quantity : " + quantity);
                var inventoryAdjustmentLoad = record.load({
                    type: "inventoryadjustment",
                    id: iaid,
                    isDynamic: true,

                })
                itemCount = inventoryAdjustmentLoad.getLineCount({ sublistId: 'inventory' });
                log.debug({ title: "PCT-MonAmi", details: "Total Item in Inventory Adjustment : " + itemCount });
                for (var item_index = 0; item_index < itemCount; item_index++)   
                {
                    inventoryAdjustmentLoad.selectLine({
                        sublistId: "inventory",
                        line: item_index
                    })
                    var itemId = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                    });
                    var itemName = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item_display',
                    });
                    var itemLocation = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location_display',
                    });
                    var itemQty = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                    });
                    var itemTotalQty = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'newquantity',
                    });
                    log.debug("PCT-MonAmi", "In Inventory Adjustment Item SKU Code/Name : " + itemName + ", Location : " + itemLocation + ", Qty : " + itemQty);

                    if (itemLocation == "The Warehouse USA (3PL partner)")
                    {
                        if (itemQty > 0)
                        {
                            if (qty > itemQty)
                            {
                                qty = itemQty;
                            }
                            inventoryAdjustmentLoad.setCurrentSublistValue({
                                sublistId: 'inventory',
                                fieldId: 'adjustqtyby',
                                value: (itemQty - qty)
                            });
                            inventoryAdjustmentLoad.commitLine({ sublistId: 'inventory' });

                            inventoryAdjustmentLoad.selectNewLine({ sublistId: 'inventory' });
                            inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: itemId });
                            inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'location', value: 2 });
                            inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: qty });
                            inventoryAdjustmentLoad.commitLine({ sublistId: 'inventory' });

                            var iaIdUpdate = inventoryAdjustmentLoad.save();
                            if (iaIdUpdate && qty != 0)
                            {
                                log.debug("PCT-MonAmi", "Inventory Transferred");
                                return [sku, qty];
                            }
                        }
                        else
                        {
                            return [];
                        }

                    }
                }

            }

        }
        else
        {
            return false;
        }

        log.debug("PCT-MonAmi", "Operation Done for Item : " + sku + " in Inventory Adjustment : " + iaid);
    }

    return {
        post: _post,
    }
});
