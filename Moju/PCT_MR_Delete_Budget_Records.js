/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        log.debug({ title: "PCT-GetInput", details: "In Get Input Function" })
        var budgetimportSearchObj = search.create({
            type: "budgetimport",
            filters:
                [

                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = budgetimportSearchObj.runPaged().count;
        var start = 0;
        var end = 1000;
        var deleteArray = new Array();
        do
        {
            var searchResult = budgetimportSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < searchResult.length; getid_index++)
            {
                var deletedRecordId = searchResult[getid_index].id;
                // deleteArray.push(deletedRecordId);
            }
            start += 1000;
            end += 1000;
            searchResultCount -= 1000;
        }
        while (searchResultCount > 0);
        deleteArray.push(57);
        log.debug({
            title: "PCT-GetInput",
            details: "Deleted Array Length : " + deleteArray.length + " & Array : " + deleteArray
        })
        return deleteArray;


    }

    function map(context)
    {
        log.debug({ title: "PCT-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            log.debug({ title: "PCT-MAP", details: "Record Id : " + id })
            record.delete({
                type: "budgetImport",
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
