/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        log.debug({ title: "PCT-GetInput", details: "In Get Input Function" })
        var SearchObj = search.create({
            type: "invoice",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = SearchObj.runPaged().count;
        log.debug("PCT-GetInput", "Search Reesult Count : " + searchResultCount);
        var searchResult = SearchObj.run().getRange({ start: 0, end: 1000 });
        var deleteArray = new Array();
        for (var getid_index = 0; getid_index < searchResult.length; getid_index++)
        {
            var deletedRecordId = searchResult[getid_index].id;
            deleteArray.push(deletedRecordId);
        }
        log.debug({
            title: "PCT-GetInput",
            details: "Deleted Array Length : " + deleteArray.length + "& Array : " + deleteArray
        })
        return deleteArray;


    }

    function map(context)
    {
        log.debug({ title: "PCT-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            record.delete({
                type: "invoice",
                id: id,
            });
            log.debug({ title: "PCT-MAP", details: "Record Id : " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
