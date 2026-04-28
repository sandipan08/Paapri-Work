/**
*              //////////     PCT QMS Bulk Price Calculation in BOM Revision    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for Bulk Price Calculation in BOM Revision, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This USer Event Script is for ulk Price Calculation BOM Revision    
*/
define(['N/search'], function (search)
{
    function beforeSubmit(context)
    {
        var newRec = context.newRecord;
        log.debug({ title: "PCT-REF", details: "In Bulk Revision" });
        var internalId = newRec.getValue({
            fieldId: 'id'
        });
        log.debug({ title: "PCT-REF", details: "Bom Revision Internal Id : " + internalId });
        var componentCount = newRec.getLineCount({ sublistId: 'component' });
        log.debug({ title: "PCT-REF", details: "Total Component : " + componentCount });
        var totalBomPrice = 0;
        for (componentIndex = 0; componentIndex < componentCount; componentIndex++)   
        {

            var itemId = newRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'item',
                line: componentIndex
            });
            var bomQty = newRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'quantity',
                line: componentIndex
            });
            var purchasePrice = lastPrice(itemId);
            var totalPrice = purchasePrice * bomQty;
            totalBomPrice += totalPrice;
            log.debug({ title: "PCT-REF", details: "Item Name : " + itemId + ", Bom Qty : " + bomQty + ", Price : " + purchasePrice + ", Total Price : " + totalPrice });

            newRec.setSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_reftec_bom_rev_price_line',
                line: componentIndex,
                value: totalPrice
            });

        }
        log.debug({ title: "PCT-REF", details: "Total BOM Price Is  : " + totalBomPrice });
        newRec.setValue({ fieldId: 'custrecord_pct_reftec_bom_rev_total_pric', value: totalBomPrice });

    }


    function lastPrice(itemId)
    {
        var price = 1;
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalidnumber", "equalto", itemId]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "cost", label: "Purchase Price" }),
                    search.createColumn({ name: "lastpurchaseprice", label: "Last Purchase Price" }),
                    search.createColumn({ name: "averagecost", label: "Average Cost" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        //  log.debug("PCT-REF", "Item Count : " + itemCount);
        var itemSearchResult = itemSearchObj.run().getRange({ start: 0, end: itemCount });
        for (var index = 0; index < itemCount; index++)
        {
            var lastPurchasePrice = itemSearchResult[index].getValue("lastpurchaseprice");
            var purchasePrice = itemSearchResult[index].getValue("cost");
            var averageCost = itemSearchResult[index].getValue("averagecost");

            log.debug({ title: "PCT-REF", details: "Last Purchase Price  : " + lastPurchasePrice + ", Purchase Price : " + purchasePrice + ", Average Cost : " + averageCost });


            if (lastPurchasePrice.length)
            {
                price = lastPurchasePrice;
                log.debug("PCT-REF", "1000");

            }
            else if (purchasePrice.length)
            {
                price = purchasePrice;
                log.debug("PCT-REF", "2000");

            }
            else
            {
                price = averageCost;
                log.debug("PCT-REF", "3000");

            }
        }
        log.debug("PCT-REF", "Purchase Price : " + price);
        return price;

    }


    return {

        beforeSubmit: beforeSubmit,

    }
});
