/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/log', 'N/record', 'N/search'], function (log, record, search,) {

    function pageInit(context) {
        log.debug("PCT-JAG", "In Page Init Function");
    }

    function saveRecord(context) {
        log.debug("PCT-JAG", "In Save Record Function");
        var currentRecord = context.currentRecord;
        let location = currentRecord.getValue({
            fieldId: 'location'
        })
        for (let toIndex = 0; toIndex < currentRecord.getLineCount({ sublistId: 'item' }); toIndex++) {
            currentRecord.selectLine({
                sublistId: 'item',
                line: toIndex
            });
            let itemId = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            })
            let standardCost = getItemStandardCost(itemId, location)
            log.debug(standardCost)
            currentRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: standardCost
            })
        }
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
            return itemStandardCost;
        }
        else {
            return itemStandardCost;
        }
    }


    return {
        pageInit: pageInit,
        saveRecord: saveRecord,

    }
});
