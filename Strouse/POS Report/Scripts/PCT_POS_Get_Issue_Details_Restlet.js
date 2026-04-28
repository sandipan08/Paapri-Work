/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {

        log.debug("PCT-Strouse", "In Issue Details Restlet");
        log.debug("PCT-SC", context.params);
        return getAssemblyItem(context.params)

    }

    const getAssemblyItem = (itemId) => {
        try {
            let issueArray = [];
            var workorderissueSearchObj = search.create({
                type: "workorderissue",
                filters:
                    [
                        ["type", "anyof", "WOIssue"],
                        "AND",
                        ["item", "anyof", itemId],
                        "AND",
                        ["createdfrom.mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "tranid",
                            summary: "GROUP",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "item",
                            join: "createdFrom",
                            summary: "GROUP",
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "item",
                            summary: "GROUP",
                            label: "Item"
                        })
                    ]
            });
            var issueCount = workorderissueSearchObj.runPaged().count;
            log.debug("PCT-Strouse", "Issue Result Count : " + issueCount);
            if (issueCount > 0) {
                workorderissueSearchObj.run().each(function (result) {
                    let issueObj = {};
                    issueObj['component'] = parseInt(itemId)
                    issueObj['assemblyItem'] = result.getValue({
                        name: "item",
                        join: "createdFrom",
                        summary: "GROUP",
                        label: "Item"
                    })
                    issueObj['assemblyItemName'] = result.getText({
                        name: "item",
                        join: "createdFrom",
                        summary: "GROUP",
                        label: "Item"
                    })
                    issueObj['workOrderNo'] = result.getValue({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    })
                    issueArray.push(issueObj);
                    return true;
                });

                log.debug("PCT-Strouse", "Issue Response Array : " + JSON.stringify(issueArray))
                return { 'isSuccess': true, 'data': issueArray }
            }
            else {
                let issueObj = {};
                issueObj['component'] = parseInt(itemId);
                issueObj['assemblyItem'] = 0;
                issueObj['assemblyItemName'] = ''
                issueObj['workOrderNo'] = 0;
                issueArray.push(issueObj);
                log.debug("PCT-Strouse", "Issue Response Array : " + JSON.stringify(issueArray))
                return { 'isSuccess': true, 'data': issueArray }
            }
        }
        catch (error) {
            log.debug("PCT-Strouse", error.message)
            return { 'isSuccess': false, 'data': error.message }
        }
    }


    return {
        get: _get,
    }
});
