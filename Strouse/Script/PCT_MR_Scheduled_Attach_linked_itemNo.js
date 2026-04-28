/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/email', 'N/file', 'N/record', 'N/search', 'N/runtime'], function (email, file, record, search, runtime) {

    function getInputData() {
        log.debug({ title: "PCT-SC", details: "In Get Input Function" });
        return search.create({
            type: "customrecord_pct_configure",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_pct_cpq_linked_itemno", "anyof", "@NONE@"],
                    "AND",
                    ["custrecord_pct_linked_quote_no", "noneof", "@NONE@"],
                    // "AND",
                    // ["internalid", "anyof", "2682"]
                    // "AND",

                    // ["created", "onorafter", "7/1/2024 12:00 am"]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_pct_sc_assname", label: "Assembly Name" })
                ]
        });
    }


    function map(context) {
        log.debug({ title: "PCT-SC", details: "In Map Function & Map Context : " + JSON.stringify(context) })
        var searchData = JSON.parse(context.value);
        log.debug("PCT-searchData", searchData)
        let itemResponse = findAssembly(searchData.values.custrecord_pct_sc_assname)
        log.debug("PCT", itemResponse)
        if (itemResponse.isSuccess) {
            record.submitFields({
                type: 'customrecord_pct_configure',
                id: context.key,
                values: {
                    'custrecord_pct_cpq_linked_itemno': itemResponse.data,
                    // 'custrecord_pct_cpq_linked_bom': itemResponse.data.bomId,
                    // 'custrecord_pct_cpq_linked_revision': itemResponse.data.bomRev,
                }
            });
            log.debug("PCT", "Value Updated in SCE :" + result.id)
        }
    }

    function reduce(context) {

    }

    function summarize(summary) {

    }
    const findAssembly = (item) => {
        log.debug("PCT-findAssembly Name", item)

        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["name", "is", item]
                ],
            columns:
                [
                    search.createColumn({ name: "itemid", label: "Name" })
                ]
        });
        var searchResultCount = assemblyitemSearchObj.runPaged().count;
        log.debug("assemblyitemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let itemId = 0
            assemblyitemSearchObj.run().each(function (result) {
                itemId = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': parseInt(itemId) }
        }
        else {
            return { 'isSuccess': false, 'data': 0 }
        }

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize

    }
});
