/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        log.debug("PCT-PMC", "In PCT PMC Get All Work Odrer");
        return getAllWorkOrders();
    }

    const getAllWorkOrders = () => {

        let workOdrerArray = []
        var workorderSearchObj = search.create({

            type: "workorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["status", "anyof", "WorkOrd:B", "WorkOrd:D"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [

                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "Document Number" })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {

            workorderSearchObj.run().each(function (result) {
                let res = {};
                res['name'] = result.getValue({ name: "tranid", label: "Document Number" })
                res['internalId'] = result.getValue({ name: "internalid", label: "Internal ID" })
                workOdrerArray.push(res);
                return true;
            });
            return { 'isSuccess': true, 'data': workOdrerArray }
        }
        else {
            return { 'isSuccess': false, 'errorMessage': 'Work Order List Not Found' }
        }


    }

    return {
        get: _get,

    }
});
