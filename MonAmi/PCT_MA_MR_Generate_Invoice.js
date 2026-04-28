/**
 *              //////////     PCT MonAmi Invoice Generate from Web Order     //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  MapReduceScript
 *@NModuleScope SameAccount
 *@since        2021-08-12 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT MonAmi Invoice Generate from Web Order , you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This MapReduceScript is used to call the Workflow Action Script.
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["quantitybilled", "equalto", "0"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["formulanumeric: {quantity}-{quantitycommitted}", "equalto", "0"],
                    "AND",
                    ["class", "anyof", "5", "2"],
                    // "AND",
                    // ["datecreated", "on", "11/30/2021 11:59 pm"]

                ],
            columns:
                [
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    })
                ]
        });
        var SalesOrderCount = salesorderSearchObj.runPaged().count;
        log.debug("PCT-MonAmi", "Search Result Count : " + SalesOrderCount);
        var start = 0;
        var end = 1000;
        var soArray = new Array();
        do
        {
            log.debug("PCT-MonAmi", "In Get Input Do");
            var SalesOrderResult = salesorderSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < SalesOrderResult.length; getid_index++)
            {
                var soId = SalesOrderResult[getid_index].getValue({
                    name: "internalid",
                    summary: "GROUP",
                });
                // log.debug("PCT-MonAmi", "Sales Order Id : " + soId);
                soArray.push(soId);
            }
            start += 1000;
            end += 1000;
            SalesOrderCount -= 1000;
        }
        while (SalesOrderCount > 0);
        log.debug({ title: "PCT-MonAmi", details: "Sales Order Array Length : " + soArray.length + ", Shopify Web Order Id Array : [" + soArray + "]" });
        return soArray;
    }

    function map(context)
    {
        try
        {


            log.debug({ title: "PCT-MonAmi", details: "In Map Function & Map Context : " + context.value })

            var soId = context.value;
            log.debug({ title: "PCT-MonAmi", details: "Sales Order Id : " + soId });

            //--------------------------------------------- Billing ----------------------------------------------
            var billRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: soId,
                toType: record.Type.INVOICE,
                isDynamic: true,
            });
            billRecord.setValue({
                fieldId: "custbody_pct_ma_send_to_warehouse",
                value: true,

            })
            var billId = billRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            log.debug({ title: 'PCT-MonAmi', details: 'New Created Invoice Id : ' + billId });
        }
        catch (ex)
        {
            log.error({ title: 'PCT-Shopify-Integration-WF-ERROR', details: "In Catch : " + ex });
        }
    }

    function reduce(context)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Reduce Function" });
    }

    function summarize(summary)
    {
        log.debug({
            title: "PCT-MonAmi",
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
