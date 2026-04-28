/**
 *              //////////     Mon Ami MA Web Order to Sales Order Generate      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  MapReduceScript
 *@NModuleScope SameAccount
 *@since        2021-08-12 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for Mon Ami MA Web Order to Sales Order Generate, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This MapReduceScript is used to call the Workflow Action Script.
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search) {
    var orderCount = 0;

    function getInputData() {
        log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });

        var customrecord_pct_ma_web_orderSearchObj = search.create({
            type: "customrecord_pct_ma_web_order",
            filters:
                [
                    ["custrecord_pct_ma_so_created", "is", "F"],
                    "AND",
                    ["custrecord_pct_ma_record_processed", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var maWebOrderCount = customrecord_pct_ma_web_orderSearchObj.runPaged().count;
        orderCount = maWebOrderCount;
        log.debug("PCT-MOonAmi", "MA Web Order Search Count : " + maWebOrderCount);
        var start = 0;
        var end = 1000;
        var maWebOrderArray = new Array();
        do {
            log.debug("PCT-Shopify-Integration", "In Get Input Do");
            var maWebOrderResult = customrecord_pct_ma_web_orderSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < maWebOrderResult.length; getid_index++) {
                var record_id = maWebOrderResult[getid_index].id;
                maWebOrderArray.push(record_id);
            }
            start += 1000;
            end += 1000;
            maWebOrderCount -= 1000;
        }
        while (maWebOrderCount > 0);
        log.debug({ title: "PCT-Shopify-Integration", details: "MA Web Order Id Array Length : " + maWebOrderArray.length + ", MA Web Order Id Array : [" + maWebOrderArray + "]" });
        return maWebOrderArray;
    }

    function map(context) {
        log.debug({ title: "PCT-MonAmi", details: "In Map Function & MAP Context : " + context.value });
        var maWebOrderload = record.load({
            type: 'customrecord_pct_ma_web_order',
            id: context.value
        });
        maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_record_processed', value: true });
        var recordId = maWebOrderload.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
        log.debug({ title: "PCT-MonAmi", details: "Edited Record ID:" + recordId });

    }
    function reduce(context) {
        log.debug({ title: "PCT-MonAmi", details: "In Reduce Function" });
        log.debug({
            title: "PCT-MonAmi",
            details: "Shopify Weborder Id : " + context.key
        });


    }

    function summarize(summary) {
        log.debug({
            title: "PCT-MonAmi",
            details: "In Sumarize Function"
        })

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
        var itemArray = new Array();
        if (itemCount > 0) {
            for (var item_index = 0; item_index < itemCount; item_index++) {
                var itemId = itemResult[item_index].id;
                var itemName = itemResult[item_index].getValue({
                    name: "itemid"
                })
                var qtyAvailable = itemResult[item_index].getValue({
                    name: "locationquantityavailable"
                })
                log.debug("PCT-MonAmi", "For Item " + itemName + " Qty Available : " + qtyAvailable);
                if (qtyAvailable > 0) {
                    var itemObj = {};
                    itemObj["id"] = itemId;
                    itemObj["sku"] = itemName;
                    itemObj["qty"] = qtyAvailable;
                    itemArray.push(itemObj);
                    // adjustmentArray.push(itemAddAdjustment(itemName, qtyAvailable));

                }

            }
            if (orderCount) {
                createTransfer(itemArray);
            }
        }

        //  function itemAddAdjustment(itemName, qtyAvailable)
        //  {
        //      var itemCount = 0;
        //      log.debug("PCT-MonAmi", "In itemAddAdjustment Function Data [ SKU : " + itemName + ", Qty : " + qtyAvailable + " ]");
        //      var inventoryadjustmentSearchObj = search.create({
        //          type: "inventoryadjustment",
        //          filters:
        //              [
        //                  ["type", "anyof", "InvAdjst"],
        //                  "AND",
        //                  ["item.name", "is", itemName],
        //                  "AND",
        //                  ["mainline", "is", "F"],
        //                  "AND",
        //                  ["quantity", "isnotempty", ""]

        //              ],
        //          columns:
        //              [
        //                  search.createColumn({ name: "internalid", label: "Internal ID" }),
        //                  search.createColumn({ name: "quantity", label: "Quantity" }),
        //                  search.createColumn({
        //                      name: "name",
        //                      join: "location",
        //                      label: "Name"
        //                  }),
        //                  search.createColumn({
        //                      name: "itemid",
        //                      join: "item",
        //                      label: "Name"
        //                  })
        //              ]
        //      });

        //      var inventoryAdjustmentCount = inventoryadjustmentSearchObj.runPaged().count;
        //      log.debug("PCT-MonAmi", "Inventory Adjustment Count : " + inventoryAdjustmentCount);
        //      if (inventoryAdjustmentCount > 0)
        //      {
        //          var inventoryAdjustmentResult = inventoryadjustmentSearchObj.run().getRange({ start: 0, end: inventoryAdjustmentCount });
        //          for (var inventoryIndex = 0; inventoryIndex < inventoryAdjustmentCount; inventoryIndex++)
        //          {
        //              var iaid = inventoryAdjustmentResult[inventoryIndex].id;
        //              log.debug("PCT-MonAmi", "Inventory Adjustment Id  : " + iaid);
        //          }
        //          var inventoryAdjustmentLoad = record.load({
        //              type: "inventoryadjustment",
        //              id: iaid,
        //              isDynamic: true,

        //          })
        //          itemCount = inventoryAdjustmentLoad.getLineCount({ sublistId: 'inventory' });
        //          log.debug({ title: "PCT-MonAmi", details: "Total Item in Inventory Adjustment : " + itemCount });
        //          for (var item_index = itemCount; item_index > 0; item_index--)   
        //          {
        //              inventoryAdjustmentLoad.selectLine({
        //                  sublistId: "inventory",
        //                  line: item_index
        //              })
        //              var itemId = inventoryAdjustmentLoad.getCurrentSublistValue({
        //                  sublistId: 'inventory',
        //                  fieldId: 'item',
        //              });
        //              var itemLocation = inventoryAdjustmentLoad.getCurrentSublistValue({
        //                  sublistId: 'inventory',
        //                  fieldId: 'location_display',
        //              });
        //              var itemQty = inventoryAdjustmentLoad.getCurrentSublistValue({
        //                  sublistId: 'inventory',
        //                  fieldId: 'adjustqtyby',
        //              });
        //              if (itemLocation == "MAISONETTE SYSTEM INV LOCK")
        //              {
        //                  // inventoryAdjustmentLoad.removeLine({
        //                  //     sublistId: 'inventory',
        //                  //     line: item_index,
        //                  // });
        //                  inventoryAdjustmentLoad.setCurrentSublistValue({
        //                      sublistId: 'inventory',
        //                      fieldId: 'adjustqtyby',
        //                      value: (itemQty - qtyAvailable),

        //                  });
        //                  inventoryAdjustmentLoad.commitLine({
        //                      sublistId: 'inventory'
        //                  });

        //                  log.debug("PCT-MonAmi", "Item SKU Code/Name : " + itemName + ", Location : " + itemLocation + ", Previous Item Qty : " + itemQty + ", Now Item Qty : " + (itemQty - qtyAvailable),);
        //              }
        //          }
        //          inventoryAdjustmentLoad.selectNewLine({ sublistId: 'inventory' });
        //          inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: itemId });
        //          inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'location', value: 1 });
        //          inventoryAdjustmentLoad.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: qtyAvailable });
        //          inventoryAdjustmentLoad.commitLine({ sublistId: 'inventory' });
        //          var iaIdUpdate = inventoryAdjustmentLoad.save();
        //          if (iaIdUpdate)
        //          {
        //              log.debug("PCT-MonAmi", "Inventory Qty Back main Warehouse");
        //              var adjustmentObj = {};
        //              adjustmentObj["itemName"] = itemName;
        //              adjustmentObj["qtyTransferred"] = qtyAvailable;
        //              return adjustmentObj;
        //          }

        //      }
        //      else
        //      {
        //          return false;
        //      }

        //  }

        function createTransfer(itemArray) {



            log.debug("PCT-MonAmi", "Creating Inventory Transfer...... ");

            var transferObj = record.create({ type: record.Type.INVENTORY_TRANSFER, isDynamic: true });

            transferObj.setValue({ fieldId: 'subsidiary', value: 1 });
            transferObj.setValue({ fieldId: 'location', value: 2 });
            transferObj.setValue({ fieldId: 'transferlocation', value: 1 });


            //-------------------- Item Added in Sales Order ------------------------

            itemArray.forEach(function (itemArray) {
                var itemId = itemArray.id;
                var itemSku = itemArray.sku;
                var adjustmentQty = itemArray.qty;
                log.debug("PCT-MonAmi", "Item Id : " + itemId + ", Qty : " + adjustmentQty + ", Item Sku : " + itemSku);

                transferObj.selectNewLine({ sublistId: 'inventory' });
                transferObj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: itemId });
                transferObj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: adjustmentQty });
                transferObj.commitLine({ sublistId: 'inventory' });

            });
            var inventoryTransferId = transferObj.save();
            log.debug({ title: 'PCT-MonAmi', details: 'New Created Inventory Transfer : ' + inventoryTransferId });


        }
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
