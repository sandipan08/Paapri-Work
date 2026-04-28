/**
* Module Description
*
* Version       Date            		Author                  Remarks
* 2.1          20 May 2021    	        Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        PCT_HL_MapReduce_Update_Record
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will update the qty in HL Item Store Record

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                Developer:

getInputData()							                     Get HL Item Store Record ID                     	                            Sandipan Sau

map()                                     Load that HL Item Store Record and if Item On Hnad Qty in Item Master Record 
                                                have changed then it will update the qty in HL Item Store Record                            Sandipan Sau
                                      

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-HL-GetInput", details: "In Get Input Function" })

        var customrecord_pct_hl_item_store_recordSearchObj = search.create({
            type: "customrecord_pct_hl_item_store_record",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({
                        name: "id",
                        sort: search.Sort.ASC,
                        label: "ID"
                    })
                ]
        });
        var search_count = customrecord_pct_hl_item_store_recordSearchObj.runPaged().count;
        log.debug("PCT-HL", "HL Item Store Record Count " + search_count);
        var search_Result = customrecord_pct_hl_item_store_recordSearchObj.run().getRange({ start: 0, end: search_count });
        var id_array = new Array();
        for (var getid_index = 0; getid_index < search_count; getid_index++)
        {
            var record_id = search_Result[getid_index].id;
            log.debug({
                title: "PCT-HL",
                details: "HL Item Store Record ID : " + record_id
            })
            id_array.push(record_id);
        }
        log.debug({
            title: "PCT HL",
            details: "HL Item Store Array Length : " + id_array.length + " & HL Item Store Array : [ " + id_array + "]"
        })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        try
        {
            var record_id = context.value;
            log.debug({ title: "PCT-HL", details: "HL Item Store Record ID : " + record_id })
            var record_load = record.load({
                type: 'customrecord_pct_hl_item_store_record',
                id: record_id
            });
            var item_name = record_load.getText({ fieldId: 'custrecord_pct_hl_item_name' });
            var item_qty = record_load.getValue({ fieldId: 'custrecord_pct_hl_item_quantity_on_hand' });
            var item_location = record_load.getText({ fieldId: 'custrecord_pct_hl_item_location' });
            var item_location_id = record_load.getValue({ fieldId: 'custrecord_pct_hl_item_location' });
            log.debug({ title: "PCT-FS", details: "HL Item Store Record Details - [ Item Name : " + item_name + " ,Item Loaction : " + item_location + " ,Item Quantity : " + item_qty + " ]" });

            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["inventorylocation", "anyof", item_location_id],
                        "AND",
                        ["name", "is", item_name]
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
            log.debug("PCT-HL", "Item Count :" + item_search_count);
            var item_search_result = itemSearchObj.run().getRange({ start: 0, end: item_search_count });

            for (item_index = 0; item_index < item_search_count; item_index++)
            {
                var item_OnHandQty = item_search_result[item_index].getValue({ name: 'locationquantityonhand', summary: "MAX" });
                log.debug({
                    title: "PCT-HL",
                    details: "Item on Hand Qty in Item Record : " + item_OnHandQty
                })
            }
            if (item_OnHandQty != item_qty)
            {
                log.debug({ title: "PCT-HL", details: " Message : Item Qty is not Same " })
                record_load.setValue({ fieldId: 'custrecord_pct_hl_item_quantity_on_hand', value: item_OnHandQty });
                log.debug({
                    title: "PCT-HL",
                    details: "In HL Item Store Record Previous Item qty was : " + item_qty + " now updated Item qty is : " + item_OnHandQty
                })
            }
            record_load.save();

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

