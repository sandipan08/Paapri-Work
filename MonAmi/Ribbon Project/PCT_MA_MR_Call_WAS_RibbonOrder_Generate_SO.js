/**
 *              //////////     PCT MonAmi Ribbon Project      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  MapReduceScript
 *@NModuleScope SameAccount
 *@since        2021-08-12 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for MonAmi Ribbon Project, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This MapReduceScript is used to trigger workflow which will create Sales Order.
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });

        return search.create({
            type: "customrecord_pct_ma_ribbon_order_data",
            filters:
                [
                    ["custrecord_pct_ma_so_craeted", "is", "F"],
                    "AND",
                    ["custrecord_pct_ma_ro_order_processed", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });

    }

    function map(context)
    {

        var searchData = JSON.parse(context.value);
        log.debug({ title: "PCT-MonAmi", details: "In Map Function & MAP Context : " + context.value })
        var ribbonOrderLoad = record.load({
            type: 'customrecord_pct_ma_ribbon_order_data',
            id: searchData.id
        });
        ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_order_processed', value: true });
        var recordId = ribbonOrderLoad.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
        log.debug({ title: "PCT-MonAmi", details: "Edited Record ID:" + recordId });
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
