/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function getInputData() {
        return search.create({
            type: "item",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["isinactive", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "itemid", label: "Name" })
                ]
        });
        //  var searchResultCount = itemSearchObj.runPaged().count;
        //  log.debug("itemSearchObj result count",searchResultCount);
        //  itemSearchObj.run().each(function(result){
        //     // .run().each has a limit of 4,000 results
        //     return true;
        //  });


    }

    function map(context) {
        var searchData = JSON.parse(context.value);

        record.delete({
            type: record.Type.ASSEMBLY_ITEM,
            id: searchData.id
        });
    }

    function reduce(context) {

    }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
