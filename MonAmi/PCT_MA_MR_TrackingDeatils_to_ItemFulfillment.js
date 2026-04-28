/**
*              //////////     MON AMI PCT Warehouse Tracking Details Record to Item Fulfillment      //////////
* 
*@author       Arghadeep Sarkar
*@NApiVersion  2.1
*@NScriptType  MapReduceScript
*@NModuleScope SameAccount
*@since        2021-12-09 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for  MON AMI PCT Warehouse Tracking Details Record to Item Fulfillment based on Order Id , you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This MapReduceScript is used to create Item Fulfilment from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{
    function getInputData()
    {
        try
        {

            log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });
            var customrecord_pct_warehouse_trackingSearchObj = search.create({
                type: "customrecord_pct_warehouse_tracking",
                filters:
                    [
                        ["custrecord_pct_ma_record_fulfilled", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var trackingDetailsCount = customrecord_pct_warehouse_trackingSearchObj.runPaged().count;
            log.debug("PCT_MonAmi", "Tracking Details Record Count : " + trackingDetailsCount);
            var start = 0;
            var end = 1000;
            var trackingDetailsArray = new Array();
            do
            {
                log.debug("PCT-MonAmi", "In Get Input Do");
                var trackingDetailsResult = customrecord_pct_warehouse_trackingSearchObj.run().getRange({ start: start, end: end });
                for (var getid_index = 0; getid_index < trackingDetailsResult.length; getid_index++)
                {
                    var record_id = trackingDetailsResult[getid_index].id;
                    trackingDetailsArray.push(record_id);
                }
                start += 1000;
                end += 1000;
                trackingDetailsCount -= 1000;
            }
            while (trackingDetailsCount > 0);
            // trackingDetailsArray.push(12502);
            log.debug({ title: "PCT-MonAmi", details: "Inventory Warehouse Array Length : " + trackingDetailsArray.length + ", Inventory Warehouse Array : [" + trackingDetailsArray + "]" });
            return trackingDetailsArray;
        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }
    }





    function map(context)
    {
        try
        {

            log.debug({ title: "PCT-MonAmi", details: "In Map Function & Map Context : " + context.value });
            var trackingDeatilsLoad = record.load({
                type: 'customrecord_pct_warehouse_tracking',
                id: context.value
            });
            var orderId = trackingDeatilsLoad.getValue({ fieldId: "custrecord_pct_wt_order_id" });

            log.debug({
                title: "PCT-MonAMi",
                details: "Invoice Order Id : " + orderId
            });
            orderId = orderId.split("_")[0];
            log.debug({
                title: "PCT-MonAMi",
                details: "Invoice Id : " + orderId
            })
            var soId = soPresetSearch(orderId, trackingDeatilsLoad);
            if (soId)
            {
                //-------------------- Item Fulfillment -------------------------

                var fulfillmentRecord = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: soId,
                    toType: record.Type.ITEM_FULFILLMENT,
                    isDynamic: true
                });
                fulfillmentRecord.setText({ fieldId: 'shipstatus', text: 'Shipped' });

                var lineCount = fulfillmentRecord.getLineCount({ sublistId: 'item' });
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Item Fulfillment Record : " + fulfillmentRecord
                })
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Item Fulfillment Item Count : " + lineCount
                })

                var totalQty = 0;
                for (var item_index = 0; item_index < lineCount; item_index++)
                {

                    fulfillmentRecord.selectLine({ sublistId: 'item', line: item_index });
                    var item = fulfillmentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    })
                    var getInvoiceItemArray = getInvoiceItem(orderId, item);
                    var quantity = getInvoiceItemArray[0];
                    if (quantity > 0)
                    {
                        totalQty = parseInt(totalQty) + parseInt(quantity)


                        var getInvoiceItemArray = getInvoiceItem(orderId, item);
                        var iClass = getInvoiceItemArray[1];
                        var invoiceId = getInvoiceItemArray[2];
                        log.debug({
                            title: "PCT-MonAmi",
                            details: " Invoice Class: " + iClass + ", Invoice Internal Id : " + invoiceId
                        })

                        if (iClass == 5) 
                        {
                            fulfillmentRecord.setValue({ fieldId: 'custbody_pct_ma_maisonette_class', value: true });
                            fulfillmentRecord.setCurrentSublistText({
                                sublistId: 'item',
                                fieldId: 'location',
                                text: "MAISONETTE SYSTEM INV LOCK"
                            });

                        }
                        else
                        {
                            fulfillmentRecord.setCurrentSublistText({
                                sublistId: 'item',
                                fieldId: 'location',
                                text: "The Warehouse USA (3PL partner)"
                            });
                        }




                        fulfillmentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemreceive',
                            value: true

                        });



                        fulfillmentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: quantity
                        });




                    } else
                    {
                        fulfillmentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemreceive',
                            value: false

                        })
                    }

                }
                // fulfillmentRecord.removeLine({ sublistId: 'package', line: 0 });

                // ------------------------------------------------  Get Item Details from Web Order ---------------------------------------------------

                var itemCount = trackingDeatilsLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_wt_package_link' });
                log.debug({ title: 'PCT-MonAmi', details: "MA Web OrderItem Count : " + itemCount });
                for (item_index = 0; item_index < itemCount; item_index++)
                {
                    var itemTracking = trackingDeatilsLoad.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_wt_package_link',
                        fieldId: 'custrecord_pct_wt_package_tracking',
                        line: item_index
                    });
                    var itemweight = trackingDeatilsLoad.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_wt_package_link',
                        fieldId: 'custrecord_pct_wt_package_weight',
                        line: item_index
                    });
                    var itemSSCC = trackingDeatilsLoad.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_wt_package_link',
                        fieldId: 'custrecord_pct_wt_package_sscc',
                        line: item_index
                    });
                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Order Id : " + orderId + ", Item Details [ Item Tracking Number : " + itemTracking + ", Weight : " + itemweight + ", Item SSCC : " + itemSSCC + " ]"
                    })




                    if (itemweight == 0.00) { itemweight = 0.01 }
                    fulfillmentRecord.selectNewLine({ sublistId: 'package' });
                    fulfillmentRecord.setCurrentSublistValue({ sublistId: 'package', fieldId: 'packageweight', value: itemweight, });
                    fulfillmentRecord.setCurrentSublistValue({ sublistId: 'package', fieldId: 'packagedescr', value: orderId, line: item_index });
                    fulfillmentRecord.setCurrentSublistValue({ sublistId: 'package', fieldId: 'packagetrackingnumber', value: itemSSCC, line: item_index });

                    fulfillmentRecord.commitLine({ sublistId: 'package' });
                }

                if (iClass == 5) 
                {

                    fulfillmentRecord.setValue({ fieldId: 'custbody_pct_ma_maisonette_tracking_no', value: itemTracking });
                }
                if (totalQty > 0)
                {
                    var itemFullfillmentId = fulfillmentRecord.save();
                }

                //------------------------------------------------------------------------

                if (itemFullfillmentId) 
                {
                    trackingDeatilsLoad.setValue({ fieldId: 'custrecord_pct_ma_record_fulfilled', value: true });
                    var salesOrderLoad = record.load({
                        type: "salesorder",
                        id: soId
                    });
                    salesOrderLoad.setText({ fieldId: 'custbody_pct_ma_fulfillment_status', text: "Fulfilled" });
                    var invoiceLoad = record.load({
                        type: "invoice",
                        id: invoiceId
                    });
                    invoiceLoad.setText({ fieldId: 'custbody_pct_ma_fulfillment_status', text: "Fulfilled" });


                }
                trackingDeatilsLoad.save();
                salesOrderLoad.save();
                invoiceLoad.save();
                log.debug({ title: 'PCT-MonAmi', details: 'New Created Item Fulfillment Id : ' + itemFullfillmentId });



                log.debug("PCT_MonAmi", "Operation Done");
            }
        }
        catch (ex)
        {
            log.error({ title: 'PCT-MonAmi In Catch ', details: "In Catch : " + ex });
        }

    }

    function reduce(context)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Reduce Function" });

    }

    function summarize(summary)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Summarize Function" });
    }

    function getInvoiceItem(orderId, itemId)
    {

        //search ID-268
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["numbertext", "is", orderId],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["shipping", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["cogs", "is", "F"],
                    "AND",
                    ["item", "anyof", itemId]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "createdfrom", label: "Created From" }),
                    search.createColumn({
                        name: "internalid",
                        join: "createdFrom",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "itemid",
                        join: "item",
                        label: "Name"
                    }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({ name: "class", label: "class" })
                ]
        });
        var qty = 0;
        var searchResultCount = invoiceSearchObj.runPaged().count;

        var invoiceSearchObjResult = invoiceSearchObj.run().getRange({ start: 0, end: searchResultCount });
        for (var getIndex = 0; getIndex < searchResultCount; getIndex++)
        {
            qty = Math.abs(invoiceSearchObjResult[getIndex].getValue({ name: "quantity" }));
            var invClass = invoiceSearchObjResult[getIndex].getValue({ name: "class" });
            var invId = invoiceSearchObjResult[getIndex].id;
        }
        log.debug("invoiceSearchObj result count", searchResultCount + ' itemId =' + itemId + ' qty=' + qty + ' orderId =' + orderId + 'class=' + invClass + ", Invoice Internal Id : " + invId);
        return [qty, invClass, invId];

    }

    function soPresetSearch(orderId, trackingDeatilsLoad)
    {

        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["numbertext", "is", orderId],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "tranid",
                        join: "createdFrom",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "createdFrom",
                        label: "Internal ID"
                    })
                ]
        });

        var invoiceOrderCount = invoiceSearchObj.runPaged().count;
        log.debug("PCT_MonAmi", "Invoice Count : " + invoiceOrderCount);
        if (invoiceOrderCount > 0)
        {
            var invoiceOrderResult = invoiceSearchObj.run().getRange({ start: 0, end: invoiceOrderCount });
            for (var getid_index = 0; getid_index < invoiceOrderCount; getid_index++)
            {
                var soId = invoiceOrderResult[getid_index].getValue({
                    name: "internalid",
                    join: "createdFrom",
                })
            }
            log.debug("PCT_MonAmi", "Find Sales Order Id  : " + soId);
            return soId;
        }
        else
        {
            trackingDeatilsLoad.setValue({ fieldId: 'custrecord_pct_wt_package_error_message', value: "No Invoice Found with This Number" });
            trackingDeatilsLoad.setValue({ fieldId: 'custrecord_pct_ma_record_fulfilled', value: true });
            //email.send({
            //    author: -5,
            //    recipients: ["sandipan.paapri@gmail.com"],
            //    cc: ["sandipan.paapri@gmail.com"],
            //    subject: 'MonAmi Tracking Details to Fulfillment Process Error',
            //    body: "Sales Order is not created for this record"
            //});
            trackingDeatilsLoad.save();
            return false;
        }
    }





    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});