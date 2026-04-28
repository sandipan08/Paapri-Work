/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/currentRecord', 'N/log', 'N/search', 'N/error'], function (record, currentRecord, log, search, error) {

    function getInputData() {
        log.debug({
            title: "as-log",
            details: "In Map Reduce"
        });

        var bomSearchObj = search.create({
            type: "bom",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.ASC,
                        label: "Internal ID"
                    }),
                    search.createColumn({ name: "name", label: "Name" })
                ]
        });

        if (bomSearchObj != null) {
            var resultSet = new Array();
            bomSearchObj.run().each(
                function (result) {
                    var dateSet = new Object();
                    var searchItemID = result.getValue({
                        name: 'internalid'
                    });
                    dateSet['id'] = searchItemID;
                    resultSet.push(dateSet);
                    return true;
                }
            );
            return resultSet;
        }
    }

    function map(context) {
        var itemID = JSON.parse(context.value).id;
        log.debug({
            title: "as-log",
            details: "item ID = " + itemID
        });

        var loadBOM = record.load({
            type: record.Type.BOM,
            id: itemID,
            isDynamic: true,
        });
        log.debug({
            title: "as-log",
            details: "loadBOM" + loadBOM
        });

        /*var memo = loadBOM.setValue({
            fieldId: 'memo',
            value: 'Testing Again'
        });

        loadBOM.save();
        log.debug({
            title: "as-log",
            details: "Item saved"
        });**/
        var bomDelete = record.delete({
            type: record.Type.BOM,
            id: itemID
        });
        log.debug({
            title: "as-log",
            details: "BOM deleted"
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
