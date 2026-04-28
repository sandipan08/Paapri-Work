/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          19 May 2021    	         Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        PCT_HL_MapReduce_Item_CustomRecord_Generate
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will Generate HL Item Store Record from Items

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                Developer:

getInputData()							                Get item id of Items                    	                                        Sandipan Sau

map()                                     Search Which will get Item On hand Qty & Location from Item Master Record 
                                                        and Create a HL Item Store Record from that                                         Sandipan Sau
                                      

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-HL-GET INPUT", details: "In Get Input Function" })
        var inventoryitemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["type", "noneof", "Discount", "Subtotal"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = inventoryitemSearchObj.runPaged().count;
        log.debug("PCT-HL", "Search Reesult Count :" + searchResultCount);
        var searchResult = inventoryitemSearchObj.run().getRange({ start: 0, end: searchResultCount });
        var item_array = new Array();
        for (var getid_index = 0; getid_index < searchResultCount; getid_index++)
        {
            var item_id = searchResult[getid_index].id;
            //item_array.push(item_id);
        }
        log.debug({
            title: "PCT HL",
            details: "Item Id Array Length : " + item_array.length + " & Item Id Array : [ " + item_array + "]"
        })
        item_array.push(416);
        return item_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        log.debug({ title: "PCT-HL", details: "MAP-Context " + context.value })
        try
        {
            var item_id = context.value;
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalidnumber", "equalto", item_id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "type",
                            summary: "GROUP",
                            label: "Type"
                        }),
                        search.createColumn({
                            name: "inventorylocation",
                            summary: "GROUP",
                            label: "Inventory Location"
                        }),
                        search.createColumn({
                            name: "locationquantityonhand",
                            summary: "MAX",
                            label: "Location On Hand"
                        })
                    ]
            });
            var item_search_count = itemSearchObj.runPaged().count;
            log.debug("PCT-HL", "Item Count" + item_search_count);
            var item_search_result = itemSearchObj.run().getRange({ start: 0, end: item_search_count });

            for (item_index = 0; item_index < item_search_count; item_index++)
            {

                var item_name = item_search_result[item_index].getValue({ name: 'itemid', summary: "GROUP" });
                var item_type = item_search_result[item_index].getValue({ name: 'type', summary: "GROUP" });
                var item_loaction = item_search_result[item_index].getValue({ name: 'inventorylocation', summary: "GROUP" });
                var item_qty = item_search_result[item_index].getValue({ name: 'locationquantityonhand', summary: "MAX" });

                log.debug({ title: "PCT-FS", details: "Item Details - [ Item Name : " + item_name + " ,Item Type : " + item_type + " ,Item Loaction : " + item_loaction + " ,Item Quantity : " + item_qty + " ]" });

                var item_qty_record = record.create({
                    type: 'customrecord_pct_hl_item_store_record',
                    isDynamic: true
                });
                item_qty_record.setValue({
                    fieldId: 'custrecord_pct_hl_item_name',
                    value: item_id,
                }).setValue({
                    fieldId: 'custrecord_pct_hl_item_quantity_on_hand',
                    value: item_qty,
                }).setValue({
                    fieldId: 'custrecord_pct_hl_item_location',
                    value: item_loaction
                });
                item_qty_record_id = item_qty_record.save();
                log.debug({ title: "PCT-HL", details: "New Item Created Record Id " + item_qty_record_id })

            }
        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }
    }
    function reduce(context)
    {

    }

    function summarize(summary)
    {

    }



    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
