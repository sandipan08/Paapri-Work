/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          4 April 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        PCT_MapReduce_ItemFullfillment
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will fullfilled item from sales order 

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                Developer:

getInputData()							Get item id and corresponding sales order id depends on 
                                        item backorder quantity =0 and item fullfilled quantity =0	                                        Sandipan Sau

map()                                     Fullfilled Item from Sales order                                                                  Sandipan Sau
                                      

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/


/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-HL-GetInput", details: "In Get Input Function" })
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["status", "anyof", "SalesOrd:D", "SalesOrd:B", "SalesOrd:E"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["cogs", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["shipping", "is", "F"],
                    "AND",
                    ["formulanumeric: {quantity}-nvl({quantityshiprecv},0)-nvl({quantitycommitted},0)", "equalto", "0"],
                    "AND",
                    ["location", "anyof", "12", "11", "13", "9", "8", "7", "6"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        join: "item",
                        label: "Internal ID"
                    })
                ]
        });
        var SO_count = salesorderSearchObj.runPaged().count;
        log.debug("PCT-HL", "SO result count : " + SO_count);
        var SO_Result = salesorderSearchObj.run().getRange({ start: 0, end: SO_count });
        var SO_id_array = new Array();
        for (var getid_index = 0; getid_index < SO_count; getid_index++)
        {
            var record_id = SO_Result[getid_index].id;
            log.debug({
                title: "PCT-HL",
                details: "Sales Order Record ID : " + record_id
            })
            SO_id_array.push(record_id);
        }
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + SO_id_array.length
        })


        return SO_id_array;

    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        try
        {
            var SO_id = context.value;
            log.debug({
                title: "PCT-HL",
                details: "SO Id : " + SO_id
            })
            var fulfillmentRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: SO_id,
                toType: record.Type.ITEM_FULFILLMENT,
                isDynamic: true
            });
            fulfillmentRecord.setText({
                fieldId: 'shipstatus',
                text: 'Shipped'
            });
            var lineCount = fulfillmentRecord.getLineCount({ sublistId: 'item' });
            log.debug({
                title: "PCT-HL",
                details: "Item Count : " + lineCount
            })
            // for (var item_index = 0; item_index < lineCount; item_index++)
            // {
            //     fulfillmentRecord.selectLine({ sublistId: 'item', line: item_index });
            //     // fulfillmentRecord.setCurrentSublistText({
            //     //     sublistId: 'item',
            //     //     fieldId: 'statusRef',
            //     //     value: 'Shipped' //Enter the location internal id, instead of name i.e San Francisco
            //     // });

            // }
            var item_fullfillment = fulfillmentRecord.save();
            log.debug({
                title: "PCT-HL",
                details: "Item Fullfillment Id : " + item_fullfillment
            })

        }
        catch (ex) { log.error({ title: 'map: error create Item Fulfillment', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
