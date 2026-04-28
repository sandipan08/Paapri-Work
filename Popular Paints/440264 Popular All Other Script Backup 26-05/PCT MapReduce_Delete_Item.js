/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    //["isinactive", "is", "T"]
                    ["type", "anyof", "Assembly", "InvtPart"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("PCT-PP", "Search Reesult Count" + searchResultCount);

        var start = 0;
        var end = 1000;
        var item_array = new Array();
        do
        {
            var searchResult = itemSearchObj.run().getRange({ start: start, end: end });


            for (var getid_index = 0; getid_index < searchResult.length; getid_index++)
            {
                var item_id = searchResult[getid_index].id;
                item_array.push(item_id);
            }
            start += 1000;
            end += 1000;
            searchResultCount -= 1000;
        }


        while (searchResultCount > 0)
        log.debug({
            title: "PCT PP",
            details: "Item Id Array Length : " + item_array.length + "& Item Id Array : " + item_array
        })
        return item_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-PP-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            // var PP_WO_id_load = record.load({
            //     type: 'customrecord_pct_PP_web_order',
            //     id: id
            // });
            var Item_Delete_Record = record.delete({
                type: "inventoryitem",
                id: id,
            });
            log.debug({ title: "PCT-PP", details: "Item Id :  " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
