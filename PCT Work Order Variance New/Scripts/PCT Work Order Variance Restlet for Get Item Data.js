/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          31 July 2023           	Sandipan Sau
*
*
* @NApiVersion 2.1
* @NModuleScope Public
* @NScriptType Restlet
/**********************************************************************************************************************************************

Script Name:        PCT WorkOrder Variance Restlet for get Item Data
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet is used to get Item Data

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary



***********************************************************************************************************************************************/
define(['N/log', 'N/search', 'N/runtime'], function (log, search, runtime) {

    function _get(context) {

        log.debug("PCT", "In Work Order Variance restlet");

        log.debug(JSON.stringify(context.selectWorkOrder));

        log.debug(typeof JSON.stringify(context.selectWorkOrder));

        // ----------------------- Declare Global Variable Start ------------------
        let workOrderEstimatedItemDataObj = {};
        let workOrderItemDataObj = {};
        let workOrderArray = [];
        // workOrderArray.push(parseInt(context.selectWorkOrder));
        workOrderArray = context.selectWorkOrder.split(",");
        log.debug("PCT", workOrderArray);
        // ----------------------- Declare Global Variable End ------------------
        workOrderEstimatedItemDataObj = getEstimatedItemDetails(workOrderArray);
        workOrderItemDataObj = getActualItemDetails(workOrderEstimatedItemDataObj, workOrderArray);
        // log.debug("PCT", "Script Usage Check in Plugin : " + runtime.getCurrentScript().getRemainingUsage());

        return { 'isSuccess': true, 'data': workOrderItemDataObj }

    }
    // --------------------- Function for get estimated Item Quantity Start ( Account : 1.0, Search Id : 1590 ) ------------------------
    const getEstimatedItemDetails = (workOrderArray) => {
        let getEstimatedItemDetailsFilterArray = [];
        let workOrderDetailObj = {};
        getEstimatedItemDetailsFilterArray.push(["type", "anyof", "WorkOrd"]);
        getEstimatedItemDetailsFilterArray.push("AND");
        getEstimatedItemDetailsFilterArray.push(["mainline", "is", "F"]);
        getEstimatedItemDetailsFilterArray.push("AND");
        getEstimatedItemDetailsFilterArray.push(["formulanumeric: CASE WHEN ({location} = {item.inventorylocation}) THEN 1 ELSE 0 END", "equalto", "1"])
        getEstimatedItemDetailsFilterArray.push("AND");
        getEstimatedItemDetailsFilterArray.push(["quantity", "greaterthan", "0"]);
        getEstimatedItemDetailsFilterArray.push("AND");
        getEstimatedItemDetailsFilterArray.push(["internalid", "anyof", workOrderArray]);

        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    getEstimatedItemDetailsFilterArray
                ],
            columns:
                [
                    search.createColumn({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "quantity",
                        summary: "SUM",
                        label: "Quantity"
                    }),
                    search.createColumn({
                        name: "locationaveragecost",
                        join: "item",
                        summary: "MAX",
                        label: "Location Average Cost"
                    }),
                    search.createColumn({
                        name: "locationcost",
                        join: "item",
                        summary: "MAX",
                        label: "Location Standard Cost"
                    }),
                    search.createColumn({
                        name: "costingmethod",
                        join: "item",
                        summary: "GROUP",
                        label: "Costing Method"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "unit",
                        summary: "GROUP",
                        label: "Units"
                    }),
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    }),
                ]
        });
        var workOrderItemSearchCount = workorderSearchObj.runPaged().count;
        log.debug("PCT", "Work Order Search Item Count : ", workOrderItemSearchCount);
        let start = 0;
        let end = 1000;
        do {
            var result = workorderSearchObj.run().getRange({ start: start, end: end });
            // log.debug("PCT", "Result : " + JSON.stringify(result))
            for (let woIndex = 0; woIndex < result.length; woIndex++) {
                let itemObj = {};
                let workOrderId = result[woIndex].getValue({
                    name: "internalid",
                    summary: "GROUP",
                    label: "Internal ID"
                });
                let itemEstimatedQuantity = result[woIndex].getValue({ name: "quantity", summary: "SUM" });

                let costingMethod = result[woIndex].getValue({
                    name: "costingmethod",
                    join: "item",
                    summary: "GROUP",
                    label: "Costing Method"
                });
                if (costingMethod == 'AVG') {
                    itemObj.estimatedItemRate = itemEstimatedQuantity * parseFloat(result[woIndex].getValue({
                        name: "locationaveragecost",
                        join: "item",
                        summary: "MAX",
                        label: "Location Average Cost"
                    }))
                } else {
                    itemObj.estimatedItemRate = itemEstimatedQuantity * parseFloat(result[woIndex].getValue({
                        name: "locationcost",
                        join: "item",
                        summary: "MAX",
                        label: "Location Standard Cost"
                    }))
                }

                if (itemObj.estimatedItemRate == null || itemObj.estimatedItemRate == "") {
                    itemObj.estimatedItemRate = 0;
                }

                // log.debug("PCT", "Item Rate : AVG" + result[woIndex].getText({
                //     name: "locationaveragecost",
                //     join: "item",
                //     summary: "MAX",
                //     label: "Location Average Cost"
                // }) + 'Standard =' + result[woIndex].getValue({
                //     name: "locationaveragecost",
                //     join: "item",
                //     summary: "MAX",
                //     label: "Location Average Cost"
                // }))
                let itemId = result[woIndex].getValue({ name: "item", summary: "GROUP" });
                itemObj.workOrderNumber = result[woIndex].getValue({ name: "tranid", summary: "GROUP" });
                itemObj.item = itemId;
                itemObj.estimatedQuantity = itemEstimatedQuantity
                itemObj.averageCost = result[woIndex].getValue({
                    name: "locationaveragecost",
                    join: "item",
                    summary: "AVG",
                    label: "Location Average Cost"
                });
                itemObj.itemName = result[woIndex].getText({ name: "item", summary: "GROUP" });
                itemObj.standardCost = result[woIndex].getValue({
                    name: "locationcost",
                    join: "item",
                    summary: "AVG",
                    label: "Location Average Cost"
                });
                itemObj.costingMethod = result[woIndex].getValue({
                    name: "costingmethod",
                    join: "item",
                    summary: "GROUP",
                    label: "Costing Method"
                });
                itemObj.unit = result[woIndex].getText({
                    name: "unit",
                    summary: "GROUP",
                    label: "Units"
                });
                itemObj.actualQuantity = 0;
                itemObj.differentiateQuantity = 0;
                itemObj.actualItemCost = 0;
                itemObj.differentiateItemCost = 0;
                if (!(workOrderId in workOrderDetailObj)) {
                    workOrderDetailObj[workOrderId] = {}
                    workOrderDetailObj[workOrderId][itemId] = itemObj
                }
                else {
                    workOrderDetailObj[workOrderId][itemId] = itemObj
                }
            }
            start += 1000;
            end += 1000;
            workOrderItemSearchCount -= 1000;
        }
        while (workOrderItemSearchCount > 0);
        log.debug("PCT", "Estimated Item Object : " + JSON.stringify(workOrderDetailObj))
        return workOrderDetailObj;
    }

    // --------------------- Function for get estimated Item Quantity End ( Account : 1.0, Search Id : 1590 ) ------------------------

    // --------------------- Function for get actual Item Quantity Start ( Account : 1.0, Search Id : 1591 ) ------------------------
    const getActualItemDetails = (workOrderEstimatedItemDataObj, workOrderArray) => {
        let getActualItemDetailsFilterArray = [];
        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["type", "anyof", "WOIssue"],
                    "AND",
                    ["formulanumeric: CASE WHEN ({location}={item.inventorylocation}) THEN 1 ELSE 0 END", "equalto", "1"],
                    "AND",
                    ["formulanumeric: CASE WHEN {quantity} > 0 THEN 1 ELSE 0 END", "equalto", "1"],
                    "AND",
                    ["createdfrom", "anyof", workOrderArray]
                ],
            columns:
                [
                    search.createColumn({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "quantity",
                        summary: "SUM",
                        label: "Quantity"
                    }),
                    search.createColumn({
                        name: "createdfrom",
                        summary: "GROUP",
                        label: "Created From"
                    }),
                    search.createColumn({
                        name: "rate",
                        summary: "AVG",
                        label: "Item Rate"
                    })
                ]
        });
        var workOrderIssueItemCount = transactionSearchObj.runPaged().count;
        log.debug("PCT", "Work Order Issue Search Item Count : " + workOrderIssueItemCount);
        let start = 0;
        let end = 1000;
        do {
            var result = transactionSearchObj.run().getRange({ start: start, end: end });
            for (let issueIndex = 0; issueIndex < result.length; issueIndex++) {
                let itemObj = {};
                let workOrderId = result[issueIndex].getValue({
                    name: "createdfrom",
                    summary: "GROUP",
                    label: "Created From"
                });
                let itemId = result[issueIndex].getValue({
                    name: "item",
                    summary: "GROUP",
                    label: "Item"
                });
                let itemActualQuantity = result[issueIndex].getValue({
                    name: "quantity",
                    summary: "SUM",
                    label: "Quantity"
                });
                itemObj.itemId = itemId;
                itemObj.actualQuantity = itemActualQuantity;
                itemObj.actualItemRate = itemActualQuantity * result[issueIndex].getValue({
                    name: "rate",
                    summary: "AVG",
                    label: "Item Rate"
                })
                if (itemObj.actualItemRate == null || itemObj.actualItemRate == "") {
                    itemObj.actualItemRate = 0;
                }
                itemObj.workOrderId = workOrderId;
                getActualItemDetailsFilterArray.push(itemObj)
            }
            start += 1000;
            end += 1000;
            workOrderIssueItemCount -= 1000;
        }
        while (workOrderIssueItemCount > 0);

        getActualItemDetailsFilterArray.forEach(element => {
            let obj = workOrderEstimatedItemDataObj[element.workOrderId];
            log.debug("PCT", "estimatedItemRate : " + obj[element.itemId]['estimatedItemRate']);
            log.debug("PCT", "actualItemRate : " + element.actualItemRate )
            if (obj && element.itemId in obj) {
               
                obj[element.itemId]['actualQuantity'] = element.actualQuantity;
                obj[element.itemId]['actualItemCost'] = parseFloat(element.actualItemRate);
                obj[element.itemId]['differentiateQuantity'] = (parseFloat(obj[element.itemId]['estimatedQuantity']) - parseFloat(element.actualQuantity));
                obj[element.itemId]['differentiateItemCost'] = (parseFloat(obj[element.itemId]['estimatedItemRate']) - parseFloat(element.actualItemRate));
            }
        })
        log.debug("PCT", "Work Order Actual Item Details Object : " + JSON.stringify(workOrderEstimatedItemDataObj));
        return workOrderEstimatedItemDataObj;
    }
    // --------------------- Function for get actual Item Quantity End ( Account : 1.0, Search Id : 1591 ) ------------------------




    return {
        get: _get,
    }
});
