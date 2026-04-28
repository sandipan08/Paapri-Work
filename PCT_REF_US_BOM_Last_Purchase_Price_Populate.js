/**
*              //////////     PCT REF Last Purchase Price Populate in BOM Material   //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for Last Purchase Price Populate in BOM Material, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This USer Event Script is for Last Purchase Price Populate in BOM Material
*/
define(['N/search', 'N/record'], function (search, record)
{
    function beforeSubmit(context)
    {
        try
        {
            var newRec = context.newRecord;
            log.debug({ title: "PCT-REF", details: "In Bulk Revision" });

            var internalId = newRec.getValue({ fieldId: 'id' });
            log.debug({ title: "PCT-REF", details: "Bom Revision Internal Id : " + internalId });

            var bomName = newRec.getValue({ fieldId: 'name' });
            log.debug({ title: "PCT-REF", details: "Bom Name : " + bomName });

            var assemblyCount = newRec.getLineCount({ sublistId: 'assembly' });
            log.debug({ title: "PCT-REF", details: "Total Component : " + assemblyCount });

            for (assemblyIndex = 0; assemblyIndex < assemblyCount; assemblyIndex++)   
            {

                var assemblyId = newRec.getSublistValue({
                    sublistId: 'assembly',
                    fieldId: 'assembly',
                    line: assemblyIndex
                });
                var itemArray = itemSearch(assemblyId);
                var purchasePrice = itemArray[0];
                var lvlOnePrice = itemArray[1];

                var bomRevisionId = bomSearch(bomName);
                var bomRevisionLoad = record.load({
                    type: 'bomrevision',
                    id: bomRevisionId
                });

                var bomRevisionTotalPrice = bomRevisionLoad.getValue('custrecord_pct_reftec_bom_rev_total_pric');

                log.debug({
                    title: "PCT-REF", details: "Assembly Id : " + assemblyId + ", Purchase Price : " + purchasePrice + ", Level One Price : " + lvlOnePrice + ", Type of Level One Price : " + typeof (lvlOnePrice) +
                        ", Bom Revision Id : " + bomRevisionId + ", Bom Revision Total Price : " + bomRevisionTotalPrice
                });
                lvlOnePrice = parseInt(lvlOnePrice);
                if (lvlOnePrice)
                {
                    var profitMargin = Math.abs((lvlOnePrice - bomRevisionTotalPrice)) / lvlOnePrice;
                    profitMargin = profitMargin * 100;
                    log.debug({ title: "PCT-REF", details: "Profit Margin : " + profitMargin });
                }
                else
                {

                    throw new Error("Level 1 Price of Item is 0, So Profit Margin Calculation is not Possible");

                }


                bomRevisionLoad.setValue({ fieldId: 'custrecord_pct_ref_last_purchase_price', value: purchasePrice });
                bomRevisionLoad.setValue({ fieldId: 'custrecord_pct_ref_profit_margin', value: profitMargin });
                bomRevisionLoad.save();

            }
            log.debug({ title: "PCT-REF", details: "Operation Done" });
        }
        catch (ex)
        {
            log.error({ title: 'PCT-REF-Error', details: "In Catch : " + ex });
            throw new Error((ex.message).bold());

        }
    }

    // ---------------------------------------- All Custom Function --------------------------
    function itemSearch(itemId)
    {
        log.debug({ title: "PCT-REF_Item_Search", details: "Item Id : " + itemId });
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalidnumber", "equalto", itemId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "unitprice",
                        join: "pricing",
                        label: "Unit Price"
                    }),
                    search.createColumn({ name: "lastpurchaseprice", label: "Last Purchase Price" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        var itemSearchResult = itemSearchObj.run().getRange({ start: 0, end: itemCount });
        for (var index = 0; index < itemCount; index++)
        {
            var lastPurchasePrice = itemSearchResult[index].getValue("lastpurchaseprice");
            var lvlOnePrice = itemSearchResult[index].getValue({
                name: "unitprice",
                join: "pricing",
            });
            log.debug({ title: "PCT-REF", details: "Last Purchase Price  : " + lastPurchasePrice + ", Level One Price : " + lvlOnePrice });

        }
        log.debug("PCT-REF", "Purchase Price : " + lastPurchasePrice);
        return [lastPurchasePrice, lvlOnePrice];

    }

    function bomSearch(bomName)
    {
        log.debug({ title: "PCT-REF_BOM_Search", details: "BOm Name : " + bomName });
        var bomSearchObj = search.create({
            type: "bom",
            filters:
                [
                    ["name", "is", bomName]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "revisionname", label: "Revision : Name" }),
                    search.createColumn({
                        name: "internalid",
                        join: "revision",
                        label: "Internal ID"
                    })
                ]
        });
        var bomCount = bomSearchObj.runPaged().count;
        var bomSearchResult = bomSearchObj.run().getRange({ start: 0, end: bomCount });
        for (var bomIndex = 0; bomIndex < bomCount; bomIndex++)
        {
            var bomRevisionId = bomSearchResult[bomIndex].getValue({
                name: "internalid",
                join: "revision",
            });
            log.debug({ title: "PCT-REF", details: "Bom Revision Id  : " + bomRevisionId });

        }
        return bomRevisionId;


    }


    return {

        beforeSubmit: beforeSubmit,

    }
});
