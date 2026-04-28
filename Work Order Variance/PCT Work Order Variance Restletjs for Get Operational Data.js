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

Script Name:        PCT WorkOrder Variance Restlet for Operational Data
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet is used for get Operational Data

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary



***********************************************************************************************************************************************/
define(['N/log', 'N/search'], function (log, search) {

    function _get(context) {

        log.debug("PCT", "In Work Order Variance Restlet for get Operational Data");

        log.debug("PCT", JSON.stringify(context.selectWorkOrder));


        // ----------------------- Declare Global Variable Start ------------------
        let costCategoryObj = {};
        let operationNameObject = {};
        let plannedDataObj = {};
        let operationalDataObj = {};
        let workOrderArray = [];
        // workOrderArray.push(parseInt(context.selectWorkOrder));

        workOrderArray = context.selectWorkOrder.split(",");
        log.debug("PCT", workOrderArray);

        // ----------------------- Declare Global Variable End ------------------

        costCategoryObj = getCostingCategory();
        operationNameObject = getOperationName(workOrderArray)
        plannedDataObj = getPlannedDataFromWorkOrder(costCategoryObj, workOrderArray, operationNameObject);
        operationalDataObj = getActualDataFromCompletion(costCategoryObj, plannedDataObj, workOrderArray);
        // log.debug("PCT", "Script Usage Check in Plugin : " + runtime.getCurrentScript().getRemainingUsage());

        return { 'isSuccess': true, 'data': operationalDataObj }

    }

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

        log.debug("PCT", "Costing Category Object : " + JSON.stringify(costingCategoryObj));
        return costingCategoryObj;
    }
    // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------
    // --------------------- Function for get Operation Name Start ( Account : 1.0, Search Id : 1600 ) ------------------------
    const getOperationName = (workOrderArray) => {
        let operationNameObj = {};
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["status", "anyof", "PROGRESS", "NOTSTART"],
                    "AND",
                    ["workorder", "anyof", workOrderArray]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Operation Name" }),
                    search.createColumn({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" }),
                    search.createColumn({ name: "workorder", label: "Work Order" }),
                    search.createColumn({
                        name: "internalid",
                        join: "workOrder",
                        label: "Internal ID"
                    })
                ]
        });
        var operationCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("Operation count : ", operationCount);

        manufacturingoperationtaskSearchObj.run().each(function (result) {
            let operationObj = {}
            let workOrderId = result.getValue({
                name: "internalid",
                join: "workOrder",
                label: "Internal ID"
            });
            let costTemplateName = result.getText({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" });
            operationObj.operationId = result.id;
            operationObj.operationName = result.getValue({ name: "name", label: "Operation Name" });
            operationObj.costTemplateId = result.getValue({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" });
            operationObj.costTemplateName = costTemplateName
            if (!(workOrderId in operationNameObj)) {
                operationNameObj[workOrderId] = {}
                operationNameObj[workOrderId][costTemplateName] = operationObj
            }
            else {
                operationNameObj[workOrderId][costTemplateName] = operationObj
            }

            return true;

        });
        log.debug("PCT", "Operation Object : " + JSON.stringify(operationNameObj))

        return operationNameObj;

    }

    // --------------------- Function for get get Operation Name End ( Account : 1.0, Search Id : 1600 ) ------------------------

    // --------------------- Function for get Planned Data from WorkOrder Start ( Account : 1.0, Search Id : 1592 ) ------------------------

    const getPlannedDataFromWorkOrder = (costCategoryObj, workOrderArray, operationNameObject) => {
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
            log.debug({
                title: "PCT",
                details: JSON.stringify(result)
            })

            log.debug("PCT", JSON.stringify(operationNameObject))
            for (let plannedIndex = 0; plannedIndex < result.length; plannedIndex++) {

                let workOrderId = result[plannedIndex].id;
                let operationId = result[plannedIndex].getValue({
                    name: "custitem_pct_item_op_name",
                    join: "item",
                    label: "Operation Name"
                })
                let operationCostTemplate = result[plannedIndex].getText({
                    name: "custitem_pct_item_op_name",
                    join: "item",
                    label: "Operation Name"
                })
                let costCategory = result[plannedIndex].getValue({
                    name: "costcategory",
                    join: "item",
                    label: "Cost Category"
                });
                log.debug("PCT", operationCostTemplate)
                let operationName = operationNameObject[workOrderId][operationCostTemplate].operationName;
                let costCategoryType = costCategoryObj[costCategory].costType;
                let plannedQty = Math.abs(parseFloat(result[plannedIndex].getValue({
                    name: "formulanumeric",
                    formula: "60*{quantity}",
                    label: "Planned Qty"
                })));
                let plannedAmount = Math.abs(parseFloat(result[plannedIndex].getValue(({ name: "quantity", label: "Planned Amt = This * Item Rate" }))));
                if (plannedAmount == null || plannedAmount == "") {
                    plannedAmount = 0;
                }
                let rate = Math.abs(parseFloat(result[plannedIndex].getValue({ name: "rate", label: "Rate" })));
                if (rate == null && rate == "") {
                    rate = 0;
                }
                let totalAmount = Math.abs(parseFloat((plannedAmount * rate)));
                if (!(workOrderId in plannedWorkOrderDataObj)) {
                    plannedWorkOrderDataObj[workOrderId] = {
                        'workOrderNumber': result[plannedIndex].getValue({ name: "tranid", label: "Document Number" }),
                        'operation': {}
                    };
                    if (!(operationId in plannedWorkOrderDataObj[workOrderId]['operation'])) {
                        plannedWorkOrderDataObj[workOrderId]['operation'][operationId] = {
                            'operationName': operationName
                        };
                        if (!("run" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"] = {};
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalAmount'] = 0
                        }
                        if (!("setup" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"] = {};
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalAmount'] = 0
                        }
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }
                    else {
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }

                }
                else {
                    if (!(operationId in plannedWorkOrderDataObj[workOrderId]['operation'])) {
                        plannedWorkOrderDataObj[workOrderId]['operation'][operationId] = {
                            'operationName': operationName
                        };
                        if (!("run" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"] = {};
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalAmount'] = 0
                        }
                        if (!("setup" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"] = {};
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalQuantity'] = 0
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalAmount'] = 0
                        }
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }
                    else {
                        if (costCategoryType.includes("RUN")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
                        }
                        else if (costCategoryType.includes("SETUP")) {
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
                            plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
                        }
                    }
                }
            }

            start += 1000;
            end += 1000;
            plannedDataCount -= 1000;
        }

        while (plannedDataCount > 0);
        // log.debug("PCT", "Planned Data from Work Order Object : " + JSON.stringify(plannedWorkOrderDataObj))
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
                if (actualAmount == null || actualAmount == "") {
                    actualAmount = 0;
                }
                let costCategory = result[completionIndex].getValue({
                    name: "costcategory",
                    join: "item",
                    label: "Cost Category"
                });
                let costCategoryType = costCategoryObj[costCategory].costType;
                if (costCategoryType.includes("RUN")) {
                    plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalQuantity'] += actualQty;
                    plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalAmount'] += actualAmount;
                }
                else if (costCategoryType.includes("SETUP")) {
                    plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalQuantity'] += actualQty;
                    plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalAmount'] += actualAmount;
                }

            }
            start += 1000;
            end += 1000;
            completionDataCount -= 1000;
        }
        while (completionDataCount > 0);
        log.debug("PCT", "Actual Data from Work Order Completion : " + JSON.stringify(plannedWorkOrderDataObj))
        return plannedWorkOrderDataObj;
    }
    // --------------------- Function for get Actual Data for WorkOrder Completion End ( Account : 1.0, Search Id : 1594 ) ------------------------




    return {
        get: _get,
    }
});
