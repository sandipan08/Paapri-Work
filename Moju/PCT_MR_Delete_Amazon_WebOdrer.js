
/**
*              //////////     PCT SHOPIFY DELETE WEB ORDERS (Including Item Fulfillment & Item Child Records )      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  MapReduceScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for PCT SHOPIFY DELETE WEB ORDERS, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This MapReduceScript is used to Delete PCT SHOPIFY WEB ORDERS
*/


define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        log.debug({ title: "PCT-Amazon_Integration", details: "In Get Input Function" });
        var customrecord_pct_amazon_web_orderSearchObj = search.create({
            type: "customrecord_pct_amazon_web_order",
            filters:
                [
                    // ["created","onorbefore","26/04/2021 23:59"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var PCTAmazon_ResultCount = customrecord_pct_amazon_web_orderSearchObj.runPaged().count;
        log.debug("PCT-Amazon_Integration", "Search Result Count : " + PCTAmazon_ResultCount);
        var start = 0;
        var end = 1000;
        var amazon_weborder_array = new Array();
        do
        {
            log.debug("PCT-Amazon_Integration", "In Get Input Do");
            var PCTAmazon_Result = customrecord_pct_amazon_web_orderSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < PCTAmazon_Result.length; getid_index++)
            {
                var record_id = PCTAmazon_Result[getid_index].id;
                // log.debug({
                //     title: "PCT-HL-Record ID",
                //     details: "Id : " + record_id
                // })
                amazon_weborder_array.push(record_id);
            }
            start += 1000;
            end += 1000;
            PCTAmazon_ResultCount -= 1000;
        }
        while (PCTAmazon_ResultCount > 0);
        log.debug({ title: "PCT-Amazon_Integration", details: "Shopify Web Order Id Array Length : " + amazon_weborder_array.length + ", Shopify Web Order Id Array : [" + amazon_weborder_array + "]" });
        return amazon_weborder_array;

    }

    function map(context)
    {
        log.debug({ title: "PCT-Amazon_Integration", details: "In Map Function & MAP Context : " + context.value })
        var weborder_id = context.value;
        var amazonWebOrderLoad = record.load({
            type: 'customrecord_pct_amazon_web_order',
            id: weborder_id
        });
        // ----------------------- DELETE SHOPIFY ITEM RECORD -----------------------

        var amazonItemCount = amazonWebOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_am_link' });
        for (item_index = 0; item_index < amazonItemCount; item_index++)
        {
            var amazon_item_id = amazonWebOrderLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_am_link',
                fieldId: 'id',
                line: item_index
            });
            var amazon_deletedItem_id = record.delete({
                type: "customrecord_pct_amazon_item_sublist",
                id: amazon_item_id,
            });

        }
        log.debug({ title: "PCT-Amazon_Integration", details: "Shopify All Item Deleted " })

        // // ----------------------- DELETE SHOPIFY ITEM FULFILLMENT RECORD -----------------------

        // var amazonItemCount = amazonWebOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_sifi_child' });
        // for (item_index = 0; item_index < amazonItemCount; item_index++)
        // {
        //     var shopify_item_id = amazonWebOrderLoad.getSublistValue({
        //         sublistId: 'recmachcustrecord_pct_sifi_child',
        //         fieldId: 'id',
        //         line: item_index
        //     });
        //     var shopify_deletedItem_id = record.delete({
        //         type: "recmachcustrecord_pct_sifi_child",
        //         id: shopify_item_id,
        //     });

        // }
        // log.debug({ title: "PCT-Amazon_Integration", details: "Shopify All Item Fulfillment Deleted " })



        var amazon_deletedItem_id = record.delete({
            type: "customrecord_pct_amazon_web_order",
            id: weborder_id,
        });
        log.debug({ title: "PCT-Amazon_Integration", details: "Shopify Web Order " + weborder_id + " Deleted" })
    }

    function reduce(context)
    {
        log.debug({ title: "PCT-Amazon_Integration", details: "In Reduce Function" });

    }

    function summarize(summary)
    {
        log.debug({
            title: "PCT-Amazon_Integration",
            details: "In Summarize Function"
        })
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
