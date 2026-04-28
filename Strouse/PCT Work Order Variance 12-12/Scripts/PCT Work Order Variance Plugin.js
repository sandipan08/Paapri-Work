/**
 * Module Description
 *
 * Version       Date            		Author           Remarks
 * 2.1          31 July 2023           	Sandipan Sau
 *
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType plugintypeimpl
 /**********************************************************************************************************************************************

Script Name:        PCT WorkOrder Variance Plugin
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Plugin is used for master WorkOrder Transaction Create

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

    function PCTWorkOrderVariance(dataObj) {
        log.debug("PCT", "In Work Order Variance Plugin");

        // ----------------------- Declare Global Variable Start ------------------
        let workOrderEstimatedItemDataObj = {};
        let workOrderItemDataObj = {};
        let costCategoryObj = {};
        let plannedDataObj = {};
        let workOrderArray = ['14724', '14734'];
        // ----------------------- Declare Global Variable End ------------------
        workOrderEstimatedItemDataObj = getEstimatedItemDetails(workOrderArray);
        workOrderItemDataObj = getActualItemDetails(workOrderEstimatedItemDataObj, workOrderArray);
        costCategoryObj = getCostingCategory();
        plannedDataObj = getPlannedDataFromWorkOrder(costCategoryObj, workOrderArray);
        getActualDataFromCompletion(costCategoryObj, plannedDataObj, workOrderArray);
        log.debug("PCT", "Script Usage Check in Plugin : " + runtime.getCurrentScript().getRemainingUsage())
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
            for (let woIndex = 0; woIndex < result.length; woIndex++) {
                let itemObj = {};
                let workOrderId = result[woIndex].getValue({
                    name: "internalid",
                    summary: "GROUP",
                    label: "Internal ID"
                });

                let costingMethod = result[woIndex].getValue({
                    name: "costingmethod",
                    join: "item",
                    summary: "GROUP",
                    label: "Costing Method"
                });
                if (costingMethod == 'AVG') {
                    itemObj.itemRate = result[woIndex].getValue({
                        name: "locationaveragecost",
                        join: "item",
                        summary: "MAX",
                        label: "Location Average Cost"
                    });
                } else {
                    itemObj.itemRate = result[woIndex].getValue({
                        name: "locationcost",
                        join: "item",
                        summary: "MAX",
                        label: "Location Standard Cost"
                    });
                }

                // log.debug("PCT", "Item Rate : AVG" + result[woIndex].getText({
                //     name: "locationaveragecost",
                //     join: "item",
                //     summary: "MAX",
                //     label: "Location Average Cost"
                // }) + 'Standard =' + result[woIndex].getText({
                //     name: "locationcost",
                //     join: "item",
                //     summary: "MAX",
                //     label: "Location Standard Cost"
                // }))
                let itemId = result[woIndex].getValue({ name: "item", summary: "GROUP" });
                itemObj.workOrderNumber = result[woIndex].getValue({ name: "tranid", summary: "GROUP" });
                itemObj.item = itemId;
                itemObj.estimatedQuantity = result[woIndex].getValue({ name: "quantity", summary: "SUM" });
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
                itemObj.unit = result[woIndex].getValue({
                    name: "unit",
                    summary: "GROUP",
                    label: "Units"
                });
                itemObj.actualQuantity = 0;
                itemObj.differentiateQuantity = 0;
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
                itemObj.itemId = itemId;
                itemObj.actualQuantity = result[issueIndex].getValue({
                    name: "quantity",
                    summary: "SUM",
                    label: "Quantity"
                });
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
            if (obj && element.itemId in obj) {
                obj[element.itemId]['actualQuantity'] = element.actualQuantity;
                obj[element.itemId]['differentiateQuantity'] = (parseFloat(obj[element.itemId]['estimatedQuantity']) - parseFloat(element.actualQuantity));
            }
        })
        log.debug("PCT", "Work Order Actual Item Details Object : " + JSON.stringify(workOrderEstimatedItemDataObj));
        return workOrderEstimatedItemDataObj;
    }
    // --------------------- Function for get actual Item Quantity Start ( Account : 1.0, Search Id : 1591 ) ------------------------

    // --------------------- Function for get Costing Type Start ( Account : 1.0, Search Id : 1593 ) ------------------------
    const getCostingCategory = () => {
        let costingCategoryObj = {};
        var costcategorySearchObj = search.create({
            type: "costcategory",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "itemcosttype", label: "Cost Type" })
                ]
        });
        var costingCategoryCount = costcategorySearchObj.runPaged().count;
        log.debug("PCT", "Costing Category Count : " + costingCategoryCount);

        costcategorySearchObj.run().each(function (result) {
            let categoryObj = {};
            categoryObj.id = result.id;
            categoryObj.name = result.getValue({
                name: "name",
                sort: search.Sort.ASC,
                label: "Name"
            });
            categoryObj.costType = result.getValue({ name: "itemcosttype", label: "Cost Type" });
            if (!(categoryObj.name in costingCategoryObj)) {
                costingCategoryObj[categoryObj.name] = {}
                costingCategoryObj[categoryObj.name] = categoryObj
            }
            else {
                costingCategoryObj[categoryObj.name] = categoryObj
            }
            return true;
        });

        // log.debug("PCT", "Costing Category Object : " + JSON.stringify(costingCategoryObj));
        return costingCategoryObj;
    }
    // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------

    // --------------------- Function for get Planned Data from WorkOrder Start ( Account : 1.0, Search Id : 1592 ) ------------------------

    const getPlannedDataFromWorkOrder = (costCategoryObj, workOrderArray) => {
        // log.debug("PCT", "COST : " + JSON.stringify(costCategoryObj))
        let plannedWorkOrderDataObj = {};
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["itemsource", "noneof", "PHANTOM", "PURCHASE_ORDER", "STOCK", "WORK_ORDER"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["item.type", "noneof", "Assembly"],
                    "AND",
                    ["internalid", "anyof", workOrderArray]
                ],
            columns:
                [
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({
                        name: "costcategory",
                        join: "item",
                        label: "Cost Category"
                    }),
                    search.createColumn({ name: "quantity", label: "Planned Amt = This * Item Rate" }),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "60*{quantity}",
                        label: "Planned Qty"
                    }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({
                        name: "custitem_pct_item_op_name",
                        join: "item",
                        label: "Operation Name"
                    }),
                    search.createColumn({ name: "rate", label: "Rate" }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({ name: "built", label: "Built" })
                ]
        });
        var plannedDataCount = workorderSearchObj.runPaged().count;
        log.debug("PCT", "Get Planned Data Count : " + plannedDataCount);
        let start = 0;
        let end = 1000;
        do {
            var result = workorderSearchObj.run().getRange({ start: start, end: end });
            for (let plannedIndex = 0; plannedIndex < result.length; plannedIndex++) {

                let workOrderId = result[plannedIndex].id;
                let operationId = result[plannedIndex].getValue({
                    name: "custitem_pct_item_op_name",
                    join: "item",
                    label: "Operation Name"
                })
                let operationName = result[plannedIndex].getText({
                    name: "custitem_pct_item_op_name",
                    join: "item",
                    label: "Operation Name"
                })
                let costCategory = result[plannedIndex].getValue({
                    name: "costcategory",
                    join: "item",
                    label: "Cost Category"
                });
                let costCategoryType = costCategoryObj[costCategory].costType;
                let plannedQty = Math.abs(parseFloat(result[plannedIndex].getValue({
                    name: "formulanumeric",
                    formula: "60*{quantity}",
                    label: "Planned Qty"
                })));
                let plannedAmount = Math.abs(parseFloat(result[plannedIndex].getValue(({ name: "quantity", label: "Planned Amt = This * Item Rate" }))));
                let rate = Math.abs(parseFloat(result[plannedIndex].getValue({ name: "rate", label: "Rate" })));
                let totalAmount = Math.abs(parseFloat((plannedAmount * rate)));
                if (!(workOrderId in plannedWorkOrderDataObj)) {
                    plannedWorkOrderDataObj[workOrderId] = {};
                    if (!(operationId in plannedWorkOrderDataObj[workOrderId])) {
                        plannedWorkOrderDataObj[workOrderId][operationId] = {
                            'operationName': operationName
                        };
                        if (!("run" in plannedWorkOrderDataObj[workOrderId][operationId])) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"] = {};
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['actualTotalAmount'] = 0
                        }
                        if (!("setup" in plannedWorkOrderDataObj[workOrderId][operationId])) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"] = {};
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['actualTotalAmount'] = 0
                        }
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }
                    else {
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }

                }
                else {
                    if (!(operationId in plannedWorkOrderDataObj[workOrderId])) {
                        plannedWorkOrderDataObj[workOrderId][operationId] = {
                            'operationName': operationName
                        };
                        if (!("run" in plannedWorkOrderDataObj[workOrderId][operationId])) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"] = {};
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['actualTotalAmount'] = 0
                        }
                        if (!("setup" in plannedWorkOrderDataObj[workOrderId][operationId])) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"] = {};
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['actualTotalAmount'] = 0
                        }
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }
                    else {
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }
                }
            }

            start += 1000;
            end += 1000;
            plannedDataCount -= 1000;
        }

        while (plannedDataCount > 0);
        log.debug("PCT", "Planned Data from Work Order Object : " + JSON.stringify(plannedWorkOrderDataObj))
        return plannedWorkOrderDataObj;
    }

    // --------------------- Function for get Planned Data from WorkOrder End ( Account : 1.0, Search Id : 1592 ) ------------------------

    // --------------------- Function for get Actual Data for WorkOrder Completion Start ( Account : 1.0, Search Id : 1594 ) ------------------------
    const getActualDataFromCompletion = (costCategoryObj, plannedWorkOrderDataObj, workOrderArray) => {
        var workordercompletionSearchObj = search.create({
            type: "workordercompletion",
            filters:
                [
                    ["type", "anyof", "WOCompl"],
                    "AND",
                    ["createdfrom", "anyof", workOrderArray],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["item.type", "noneof", "Assembly"],
                    "AND",
                    ["formulanumeric: {quantity}", "greaterthan", "0"]
                ],
            columns:
                [
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({
                        name: "costcategory",
                        join: "item",
                        label: "Cost Category"
                    }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({ name: "rate", label: "Item Rate" }),
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "{quantity}*60",
                        label: "Formula (Numeric)"
                    }),
                    search.createColumn({ name: "createdfrom", label: "Created From" }),
                    search.createColumn({
                        name: "custitem_pct_item_op_name",
                        join: "item",
                        label: "Operation Name"
                    })
                ]
        });
        var completionDataCount = workordercompletionSearchObj.runPaged().count;
        log.debug("PCT", "Work Order Completion Data Count : " + completionDataCount);
        let start = 0;
        let end = 1000;
        do {
            var result = workordercompletionSearchObj.run().getRange({ start: start, end: end });
            for (let completionIndex = 0; completionIndex < result.length; completionIndex++) {
                let workOrderId = result[completionIndex].getValue({ name: "createdfrom", label: "Created From" });
                let operationId = result[completionIndex].getValue({
                    name: "custitem_pct_item_op_name",
                    join: "item",
                    label: "Operation Name"
                });
                let actualQty = parseFloat(result[completionIndex].getValue({
                    name: "formulanumeric",
                    formula: "{quantity}*60",
                    label: "Formula (Numeric)"
                }));
                let actualAmount = parseFloat(result[completionIndex].getValue({ name: "amount", label: "Amount" }));
                let costCategory = result[completionIndex].getValue({
                    name: "costcategory",
                    join: "item",
                    label: "Cost Category"
                });
                let costCategoryType = costCategoryObj[costCategory].costType;
                if (costCategoryType.includes("RUN")) {
                    plannedWorkOrderDataObj[workOrderId][operationId]["run"]['actualTotalQuantity'] += actualQty;
                    plannedWorkOrderDataObj[workOrderId][operationId]["run"]['actualTotalAmount'] += actualAmount;
                }
                else if (costCategoryType.includes("SETUP")) {
                    plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['actualTotalQuantity'] += actualQty;
                    plannedWorkOrderDataObj[workOrderId][operationId]["setup"]['actualTotalAmount'] += actualAmount;
                }

            }
            start += 1000;
            end += 1000;
            completionDataCount -= 1000;
        }
        while (completionDataCount > 0);
        log.debug("PCT", "Actual Data from Work Order Completion : " + JSON.stringify(plannedWorkOrderDataObj))
    }
    // --------------------- Function for get Actual Data for WorkOrder Completion End ( Account : 1.0, Search Id : 1594 ) ------------------------


    return {
        PCTWorkOrderVariance: PCTWorkOrderVariance,
    }
});