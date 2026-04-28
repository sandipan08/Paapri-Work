/**
*              //////////     MON AMI Invoice Generate from Sales Order     //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  MapReduceScript
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for  MON AMI Invoice Generate from Sales Order, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi-Get Input Data", details: "In Get Input Data Function" })
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["status", "anyof", "SalesOrd:B"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["class", "anyof", "5", "2"],
                    // "AND",
                    // ["datecreated", "on", "11/30/2021 11:59 pm"]
                    //  ["class", "noneof", "1", "8", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "Document Number" })
                ]
        });

        var SO_count = salesorderSearchObj.runPaged().count;
        log.debug("PCT-MonAmi", "SO result count" + SO_count);
        var SO_Result = salesorderSearchObj.run().getRange({ start: 0, end: SO_count });
        var id_array = new Array();
        for (var getid_index = 0; getid_index < SO_count; getid_index++)
        {
            var record_id = SO_Result[getid_index].id;
            // log.debug({
            //     title: "PCT-MonAmi",
            //     details: "Sales Order Record ID : " + record_id
            // })

            id_array.push(record_id);

        }
        // id_array.push(9339);
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + id_array.length + ", & Id Array : [ " + id_array + " ]"
        })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-MonAmi-MAP", details: "In Map Function" })
        try
        {
            var orderId = context.value;
            log.debug({
                title: "PCT-MonAmi",
                details: "Sales Order Id : " + orderId
            })

            var salesObj = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: orderId,
                toType: record.Type.INVOICE,
                isDynamic: true,
            });

            var invoice_generate = salesObj.save();
            log.debug({
                title: "PCT-MonAmi",
                details: "Generated Invoice Id : " + invoice_generate
            })

        }
        catch (ex) { log.error({ title: 'Map: error ', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
