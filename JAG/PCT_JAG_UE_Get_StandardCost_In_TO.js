/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search'], function (log, search,) {

    function beforeLoad(context) {
        log.debug("PCT-JAG", "In Before Load Function");
    }

    function beforeSubmit(context) {
        log.debug("PCT-JAG", "In Before Submit Function");
        if (context.type == context.UserEventType.CREATE) {
            var newRecord = context.newRecord;
            let location = newRecord.getValue({
                fieldId: 'location'
            })
            for (itemIndex = 0; itemIndex < newRecord.getLineCount({ sublistId: 'item' }); itemIndex++) {
                let itemId = newRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: itemIndex
                });
                let standardCost = getItemStandardCost(itemId, location)
                log.debug(standardCost);
                newRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: itemIndex,
                    value: standardCost
                });
            }
        }
    }

    function afterSubmit(context) {

    }
    const getItemStandardCost = (itemId, location) => {
        log.debug("PCT-JAG", "Item : " + itemId + ", Location : " + location)
        let itemStandardCost = 0;
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["inventorylocation", "anyof", location],
                    "AND",
                    ["internalid", "anyof", itemId]
                ],
            columns:
                [
                    search.createColumn({ name: "currentstandardcost", label: "Current Standard Cost" })
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("PCT-JAG", "Item Search Cost Count : " + searchResultCount);
        if (searchResultCount > 0) {
            itemSearchObj.run().each(function (result) {
                itemStandardCost = result.getValue('currentstandardcost')
                return true;
            });
            // log.debug("PCT-JAG", "standardCost : "+itemStandardCost);
            return itemStandardCost;
        }
        else {
            return itemStandardCost;
        }
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
