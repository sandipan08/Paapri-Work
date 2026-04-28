/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1           05 April 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        pct_hl_so_generate_mapreduce
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will generate sales order from Hl Web Order Record.

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:

getInputData()							Get those hl web order id which sales order not genereated                          		   		    Sandipan Sau
map()                                   Call A Workflow to Generate the Sales Order From This                                                   Sandipan Sau


/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        log.debug({ title: "PCT-HL_Get Input", details: "In Get Input Function" })
        var current_date = new Date();
        var dd = current_date.getDate();
        var mm = current_date.getMonth() + 1;
        var yyyy = current_date.getFullYear();
        //  var current_date = mm + "/" + dd + "/" + yyyy;
        var current_date = dd + "/" + mm + "/" + yyyy;
        log.debug({
            title: 'PCT-HL_Get Input',
            details: 'Current Date :' + current_date
        })
        var customrecord_pct_hl_web_orderSearchObj = search.create({
            type: "customrecord_pct_hl_web_order",
            filters:
                [
                    // ["created", "onorbefore", "14/07/2021 11:59 pm"],
                    //   "AND",
                    ["custrecord_pct_hl_is_processed", "is", "F"],
                    "AND",
                    ["custrecord_pct_hl_so_error_message", "isempty", ""],
                    "AND",
                    ["custrecord_pct_sales_order_created", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var HL_id_ResultCount = customrecord_pct_hl_web_orderSearchObj.runPaged().count;
        log.debug("PCT-HL_Get Input ", "HL ID ResultCount :" + HL_id_ResultCount);
        var HL_id_Result = customrecord_pct_hl_web_orderSearchObj.run().getRange({ start: 0, end: HL_id_ResultCount });
        var id_array = new Array();
        for (var getid_index = 0; getid_index < HL_id_ResultCount; getid_index++)
        {
            var record_id = HL_id_Result[getid_index].id;
            // log.debug({
            //     title: "PCT-HL-Record ID",
            //     details: "Id : " + record_id
            // })
            id_array.push(record_id);
        }

        log.debug({ title: "PCT-HL_Get Input :", details: "HL Web Order Id Array : [" + id_array + "]" })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" });
        log.debug({ title: "PCT-HL-MAP", details: "MAP Context " + context.value });
        var id = context.value;
        var HL_WO_id_load = record.load({
            type: 'customrecord_pct_hl_web_order',
            id: id
        });
        HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_is_processed', value: true });
        var recordId = HL_WO_id_load.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
        log.debug({ title: "PCT-HL-MAP", details: "Edited Record ID:" + recordId });
    }
    // ------------------------------------------------------------ Custom Function ------------------------------------
    function reduce(context)
    {
        log.debug({
            title: "PCT-HL-Reduce",
            details: "HL_WO_id : " + context.key
        });
    }

    function summarize(summary)
    {
        log.debug({
            title: "PCT-HL-Summarize",
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
