/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        let data = getWorkOrderCommittedData(context.workOrderId)
        log.debug({
            title: 'data',
            details: data
        })
        return data
    }

    const getWorkOrderCommittedData = (workOrderId) => {
        var itemreceiptSearchObj = search.create({
            type: "itemreceipt",
            filters:
                [
                    ["type", "anyof", "ItemRcpt"],
                    "AND",
                    ["createdfrom.createdfrom", "anyof", workOrderId],
                    "AND",
                    ["mainline", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "quantity",
                        join: "inventoryDetail",
                        summary: "SUM",
                        label: "Quantity"
                    }),
                    search.createColumn({
                        name: "binnumber",
                        join: "inventoryDetail",
                        summary: "GROUP",
                        label: "Bin Number"
                    }),
                    search.createColumn({
                        name: "inventorynumber",
                        join: "inventoryDetail",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: " Number"
                    }),
                    search.createColumn({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "isserialitem",
                        join: "item",
                        summary: "GROUP",
                        label: "Is Serialized Item"
                    }),
                    search.createColumn({
                        name: "islotitem",
                        join: "item",
                        summary: "GROUP",
                        label: "Is Lot Numbered Item"
                    }),
                    search.createColumn({
                        name: "usebins",
                        join: "item",
                        summary: "GROUP",
                        label: "Use Bins"
                    })
                ]
        });
        var searchResultCount = itemreceiptSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let mainObj = {};
            itemreceiptSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                let item = result.getValue({
                    name: "item",
                    summary: "GROUP"
                });
                let lotNumberId = result.getValue({
                    name: "inventorynumber",
                    join: "inventoryDetail",
                    summary: "GROUP",
                })
                let lotNumberText = result.getText({
                    name: "inventorynumber",
                    join: "inventoryDetail",
                    summary: "GROUP",
                })
                let binNumberId = result.getValue({
                    name: "binnumber",
                    join: "inventoryDetail",
                    summary: "GROUP",
                })
                let binNumberText = result.getText({
                    name: "binnumber",
                    join: "inventoryDetail",
                    summary: "GROUP",
                })
                let quantity = result.getValue({
                    name: "quantity",
                    join: "inventoryDetail",
                    summary: "SUM",
                })
                let isLotItem = result.getValue({
                    name: "islotitem",
                    join: "item",
                    summary: "GROUP",
                })
                let useBins = result.getValue({
                    name: "usebins",
                    join: "item",
                    summary: "GROUP",
                })
                let lotObj = {
                    'name': lotNumberText,
                    'internalId': lotNumberId,
                    'quantityOnhand': quantity
                }
                let binObj = {
                    'name': binNumberText,
                    'internalId': binNumberId,
                    'quantityOnhand': quantity
                }
                if (!(item in mainObj)) {
                    mainObj[item] = {};
                    mainObj[item]['lotData'] = []
                    mainObj[item]['binData'] = []
                    mainObj[item]['lotWithBin'] = {}
                    if (isLotItem && !useBins) {
                        mainObj[item]['lotData'].push(lotObj)
                    }
                    else if (!isLotItem && useBins) {
                        mainObj[item]['binData'].push(binObj)
                    }
                    else {
                        mainObj[item]['lotData'].push(lotObj)
                        if (!(lotNumberId in mainObj[item]['lotWithBin'])) {
                            mainObj[item]['lotWithBin'][lotNumberId] = []
                            let binDataObj = {
                                'name': binNumberText,
                                'internalId': binNumberId,
                                'quantityOnHand': quantity
                            }
                            mainObj[item]['lotWithBin'][lotNumberId].push(binDataObj)
                        }
                        else {
                            mainObj[item]['lotWithBin'][lotNumberId] = []
                            let binDataObj = {
                                'name': binNumberText,
                                'internalId': binNumberId,
                                'quantityOnHand': quantity
                            }
                            mainObj[item]['lotWithBin'][lotNumberId].push(binDataObj)
                        }
                    }
                }
                else {
                    if (isLotItem && !useBins) {
                        mainObj[item]['lotData'].push(lotObj)
                    }
                    else if (!isLotItem && useBins) {
                        mainObj[item]['binData'].push(binObj)
                    }
                    else {
                        mainObj[item]['lotData'].push(lotObj)
                        if (!(lotNumberId in mainObj[item]['lotWithBin'])) {
                            mainObj[item]['lotWithBin'][lotNumberId] = []
                            let binDataObj = {
                                'name': binNumberText,
                                'internalId': binNumberId,
                                'quantityOnHand': quantity
                            }
                            mainObj[item]['lotWithBin'][lotNumberId].push(binDataObj)
                        }
                        else {
                            mainObj[item]['lotWithBin'][lotNumberId] = []
                            let binDataObj = {
                                'name': binNumberText,
                                'internalId': binNumberId,
                                'quantityOnHand': quantity
                            }
                            mainObj[item]['lotWithBin'][lotNumberId].push(binDataObj)
                        }
                    }
                }
                return true;
            });
            return { 'isSuccess': true, 'data': mainObj }
        }
        return { 'isSuccess': false }
    }
    return {
        get: _get
    }
});
