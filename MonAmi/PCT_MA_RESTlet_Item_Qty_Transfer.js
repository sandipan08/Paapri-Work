/**
*              //////////     MON AMI Item Inventory Location Update (MAISONETTE SYSTEM INV LOCK to The Warehouse USA (3PL partner) Location )   //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for MON AMI Item Inventory Location Update (MAISONETTE SYSTEM INV LOCK to The Warehouse USA (3PL partner) Location ), you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This Restlet is used to MON AMI Item Inventory Location Update (MAISONETTE SYSTEM INV LOCK to The Warehouse USA (3PL partner) Location )   
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{

    function _get(context)
    {
        try
        {
            var adjustmentArray = new Array();
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        // ["name", "is", "10136"],
                        // "AND",
                        ["inventorylocation.name", "is", "MAISONETTE SYSTEM INV LOCK"],
                        "AND",
                        ["locationquantityavailable", "notequalto", "0"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "locationquantityavailable", label: "Location Available" }),
                        // search.createColumn({ name: "locationquantityonhand", label: "Location On Hand" })

                    ]
            });
            var itemCount = itemSearchObj.runPaged().count;
            log.debug("PCT-MonAmi", "Item Count : " + itemCount);
            var itemResult = itemSearchObj.run().getRange({ start: 0, end: itemCount });
            for (var item_index = 0; item_index < itemCount; item_index++)
            {
                var itemId = itemResult[item_index].id;
                var itemName = itemResult[item_index].getValue({
                    name: "itemid"
                })
                var qtyAvailable = itemResult[item_index].getValue({
                    name: "locationquantityavailable"
                })
                log.debug("PCT-MonAmi", "For Item " + itemName + " Qty Available : " + qtyAvailable);
                if (qtyAvailable > 0)
                {
                    adjustmentArray.push(itemAddAdjustment(itemName, qtyAvailable));

                }
            }
            return JSON.stringify({ status: 200, adjustmentArray: adjustmentArray });


        }
        catch (ex)
        {

            log.error({ title: 'Restlet: error', details: ex });
            return JSON.stringify({ status: 500, message: ex.message });

        }
        function itemAddAdjustment(itemName, qtyAvailable)
        {
            var itemCount = 0;
            log.debug("PCT-MonAmi", "In itemAddAdjustment Function Data [ SKU : " + itemName + ", Qty : " + qtyAvailable + " ]");
            var inventoryadjustmentSearchObj = search.create({
                type: "inventoryadjustment",
                filters:
                    [
                        ["type", "anyof", "InvAdjst"],
                        "AND",
                        ["item.name", "is", itemName],
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
                    log.debug("PCT-MonAmi", "Inventory Adjustment Id  : " + iaid);
                }
                var inventoryAdjustmentLoad = record.load({
                    type: "inventoryadjustment",
                    id: iaid,
                    isDynamic: true,

                })
                itemCount = inventoryAdjustmentLoad.getLineCount({ sublistId: 'inventory' });
                log.debug({ title: "PCT-MonAmi", details: "Total Item in Inventory Adjustment : " + itemCount });
                for (var item_index = itemCount; item_index > 0; item_index--)   
                {
                    inventoryAdjustmentLoad.selectLine({
                        sublistId: "inventory",
                        line: item_index
                    })
                    var itemId = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                    });
                    var itemLocation = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location_display',
                    });
                    var itemQty = inventoryAdjustmentLoad.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                    });
                    if (itemLocation == "MAISONETTE SYSTEM INV LOCK")
                    {
                        // inventoryAdjustmentLoad.removeLine({
                        //     sublistId: 'inventory',
                        //     line: item_index,
                        // });
                        inventoryAdjustmentLoad.setCurrentSublistValue({
                            sublistId: 'inventory',
                            fieldId: 'adjustqtyby',
                            value: (itemQty - qtyAvailable),

                        });
                        inventoryAdjustmentLoad.commitLine({
                            sublistId: 'inventory'
                        });

                        log.debug("PCT-MonAmi", "Item SKU Code/Name : " + itemName + ", Location : " + itemLocation + ", Previous Item Qty : " + itemQty + ", Now Item Qty : " + (itemQty - qtyAvailable),);
                    }
                }
                inventoryAdjustmentLoad.selectNewLine({ sublistId: 'inventory' });
                inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: itemId });
                inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'location', value: 1 });
                inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: qtyAvailable });
                inventoryAdjustmentLoad.commitLine({ sublistId: 'inventory' });
                var iaIdUpdate = inventoryAdjustmentLoad.save();
                if (iaIdUpdate)
                {
                    log.debug("PCT-MonAmi", "Inventory Qty Back main Warehouse");
                    var adjustmentObj = {};
                    adjustmentObj["itemName"] = itemName;
                    adjustmentObj["qtyTransferred"] = qtyAvailable;
                    return adjustmentObj;
                }

            }
            else
            {
                return false;
            }

        }
    }

    return {
        get: _get,
    }
});