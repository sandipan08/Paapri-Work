/**
 *@NApiVersion 2.x
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
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("PCT", "Search Result Count" + searchResultCount);

        var id_array = new Array();
        var start = 0;
        var end = 1000;
        do
        {
            var searchResult = salesorderSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < searchResult.length; getid_index++)
            {
                var record_id = searchResult[getid_index].id;
                // log.debug({
                //     title: "PCT",
                //     details: "Sales Order Record ID : " + record_id
                // })
                id_array.push(record_id);
            }
            start += 1000;
            end += 1000;
            searchResultCount -= 1000;
        }
        while (searchResultCount > 0);
        log.debug({
            title: "PCT",
            details: "Id Array Length : " + id_array.length
        })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT", details: "In Map Function" })
        try
        {
            var id = context.value;
            // var HL_WO_id_load = record.load({
            //     type: 'customrecord_pct_hl_web_order',
            //     id: id
            // });
            var SalesOrder_Delete_Record = record.delete({
                type: "salesorder",
                id: id,
            });
            log.debug({ title: "PCT", details: "Sales Order " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }

    }


    function reduce(context)
    {
        log.debug({ title: "PCT", details: "In Reduce Function" });
        log.debug({
            title: "PCT",
            details: "Sales Order Id : " + context.key
        });
    }

    function summarize(summary)
    {
        log.debug({
            title: "PCT",
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