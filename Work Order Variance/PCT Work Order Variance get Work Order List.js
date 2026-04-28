/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        return { 'isSuccess': true, 'data': getWorkOrderList() }
    }

    function getWorkOrderList() {
        let workOrderArray = [];
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "internalid", label: "Internalid" }),
                ]
        });
        var workOrderCount = workorderSearchObj.runPaged().count;
        log.debug("PCT-WMV", "Work Order Search Count : " + workOrderCount);
        var start = 0;
        var end = 1000;
        do {
            var result = workorderSearchObj.run().getRange({
                start: start,
                end: end
            });

            for (let woIndex = 0; woIndex < result.length; woIndex++) {
                let woObj = {};
                woObj.internalId = result[woIndex].id;
                woObj.woName = result[woIndex].getValue('tranid')
                workOrderArray.push(woObj);
            }
            end += 1000;
            start += 1000;
            workOrderCount -= 1000;
        }
        while (workOrderCount > 0);
        return workOrderArray;
    }


    return {
        get: _get,
    }
});
