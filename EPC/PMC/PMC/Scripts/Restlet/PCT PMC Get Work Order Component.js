/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         0r-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */


define(['N/search'], function (search) {

    function _get(context) {

        log.debug("PCT-PMC", "In PCT PMC Get Components Restlet");
        return getWorkOrderComponent(context.workOrderId)
    }
    // ----------------------------- getToolFamily Function Start ------------------------------
    const getWorkOrderComponent = (workOrderId) => {
        let componentArray = []
        var workorderSearchObj = search.create({
            type: "workorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }, { "name": "includeperiodendtransactions", "value": "F" }],
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", workOrderId],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["shipping", "is", "F"],
                    "AND",
                    ["cogs", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["item.type", "noneof", "Assembly"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "formulatext",
                        formula: "CASE WHEN {item.type} != 'Assembly' THEN {item} ELSE NULL END",
                        label: "Component"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "item",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            workorderSearchObj.run().each(function (result) {
                let componentObj = {};
                componentObj['internalId'] = result.getValue({
                      name: "internalid",
                        join: "item",
                        label: "Internal ID"
                })
                componentObj['name'] = result.getValue({
                    name: "formulatext",
                    formula: "CASE WHEN {item.type} != 'Assembly' THEN {item} ELSE NULL END",
                    label: "Component"
                })
                componentArray.push(componentObj);
                return true;
            });
            return { 'isSuccess': true, 'data': componentArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Component found' }
    }

    // ----------------------------- getSerializedTool Function End ----------------------------------
    return {
        get: _get,
    }
});
