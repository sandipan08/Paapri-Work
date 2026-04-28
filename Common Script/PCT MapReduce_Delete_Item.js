/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var inventoryitemSearchObj = search.create({
            type: "inventoryitem",
            filters:
                [
                    ["type", "anyof", "InvtPart"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = inventoryitemSearchObj.runPaged().count;
        log.debug("PCT-HL", "Search Reesult Count" + searchResultCount);
        var searchResult = inventoryitemSearchObj.run().getRange({ start: 0, end: searchResultCount });
        var item_array = new Array();
        for (var getid_index = 0; getid_index < searchResultCount; getid_index++)
        {
            var item_id = searchResult[getid_index].id;
            item_array.push(item_id);
        }
        log.debug({
            title: "PCT HL",
            details: "Item Id Array Length : " + item_array.length + "& Item Id Array : " + item_array
        })
        return item_array;
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
            var Item_Delete_Record = record.delete({
                type: "inventoryitem",
                id: id,
            });
            log.debug({ title: "PCT-HL", details: "Item Id :  " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
