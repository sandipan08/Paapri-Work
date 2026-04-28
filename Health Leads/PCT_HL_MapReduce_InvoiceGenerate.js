/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["status", "anyof", "SalesOrd:F"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "Document Number" })
                ]
        });

        var SO_count = salesorderSearchObj.runPaged().count;
        log.debug("PCT-HL", "SO result count" + SO_count);
        var SO_Result = salesorderSearchObj.run().getRange({ start: 0, end: SO_count });
        var id_array = new Array();
        for (var getid_index = 0; getid_index < SO_count; getid_index++)
        {
            var record_id = SO_Result[getid_index].id;
            // log.debug({
            //     title: "PCT-HL",
            //     details: "Sales Order Record ID : " + record_id
            // })
            var id_present = id_array.includes(record_id);
            if (!id_present)
            {
                id_array.push(record_id);
            }
        }
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + id_array.length + "& Id Array : [ " + id_array + " ]"
        })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        try
        {
            var orderId = context.value;
            log.debug({
                title: "PCT-HL",
                details: "Sales Order Id : " + orderId
            })
            var objRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: orderId,
                toType: record.Type.INVOICE,
                isDynamic: true,
            });

            var invoice_generate = objRecord.save();
            log.debug({
                title: "PCT-HL",
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
