/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = invoiceSearchObj.runPaged().count;
        log.debug("invoiceSearchObj result count", searchResultCount);

        var start = 0;
        var end = 1000;
        var id_array = new Array();
        do
        {
            var searchResult = invoiceSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < searchResult.length; getid_index++)
            {

                var record_id = searchResult[getid_index].id;
                //  log.debug({
                //      title: "PCT-HL",
                //      details: "Sales Order Record ID : " + record_id
                //  })
                id_array.push(record_id);
            }
            start += 1000;
            end += 1000;
            searchResultCount -= 1000;
        }
        while (searchResultCount > 0);
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + id_array.length
        })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            // var HL_WO_id_load = record.load({
            //     type: 'customrecord_pct_hl_web_order',
            //     id: id
            // });
            var SalesOrder_Delete_Record = record.delete({
                type: "invoice",
                id: id,
            });
            log.debug({ title: "PCT-HL", details: "Sales Order " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }

    }


    return {
        getInputData: getInputData,
        map: map
    }
});
