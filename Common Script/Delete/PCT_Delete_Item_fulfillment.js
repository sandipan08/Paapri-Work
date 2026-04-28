/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var itemfulfillmentSearchObj = search.create({
            type: "itemfulfillment",
            filters:
                [
                    ["type", "anyof", "ItemShip"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = itemfulfillmentSearchObj.runPaged().count;
        log.debug("itemfulfillmentSearchObj result count", searchResultCount);
        var searchResult = itemfulfillmentSearchObj.run().getRange({ start: 0, end: searchResultCount });
        var id_array = new Array();
        for (var getid_index = 0; getid_index < searchResultCount; getid_index++)
        {
            var record_id = searchResult[getid_index].id;
            //  log.debug({
            //      title: "PCT-HL",
            //      details: "Sales Order Record ID : " + record_id
            //  })
            id_array.push(record_id);
        }
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
                type: "itemfulfillment",
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
