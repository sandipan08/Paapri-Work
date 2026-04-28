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
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {

    function _get(context) {

        log.debug("PCT", "In Work Order Variance Restlet for get Operational Data");

        log.debug("PCT", JSON.stringify(context.selectWorkOrder));


        // ----------------------- Declare Global Variable Start ------------------
        let costCategoryObj = {};
        let workOrderArray = [];
        // workOrderArray.push(parseInt(context.selectWorkOrder));

        workOrderArray = context.selectWorkOrder.split(",");
        log.debug("PCT", workOrderArray);

        // ----------------------- Declare Global Variable End ------------------
        // workOrderArray = ['13297', '13305', '13309', '13834', '13866', '13901', '14147', '14187', '14214', '14229', '14235', '14713', '14730', '15038']
        costCategoryObj = getCostingCategory();
        let completionRecordIdArray = getCompletionRecordId(workOrderArray)
        let EstimateDataFromMFGOperationTask = getEstimateDataFromMFGOperationTask(workOrderArray, costCategoryObj);
        let ActualDataFromWOCompletion = getActualDataFromWOCompletion(completionRecordIdArray)

        let varianceReportObj = {}

        workOrderArray.forEach(workOrderId => {
            let estimatedDataObj = EstimateDataFromMFGOperationTask[workOrderId]
            if (estimatedDataObj != null) {

                Object.keys(estimatedDataObj).forEach(function (key) {
                    var varianceObj = {}
                    var estTotalSetupCost = 0;
                    var estTotalRunCost = 0;
                    if (!(workOrderId in varianceReportObj)) {
                        varianceReportObj[workOrderId] = {}
                    }

                    log.debug({
                        title: ' estimatedDataObj[key]',
                        details: JSON.stringify(estimatedDataObj[key])
                    })

                    varianceObj.operationName = estimatedDataObj[key].operationName;
                    varianceObj.assemblyName = estimatedDataObj[key].assemblyName;
                    varianceObj.operationSequence = estimatedDataObj[key].operationSequence;
                    varianceObj.estRunTime = estimatedDataObj[key].estRunTime;
                    varianceObj.estSetupTime = estimatedDataObj[key].estSetupTime;
                    varianceObj.completedquantity = estimatedDataObj[key].completedquantity
                    varianceObj.machineresources = estimatedDataObj[key].machineResources;
                    varianceObj.laborResources = estimatedDataObj[key].laborResources;
                    varianceObj.totalMachineSetupRate = estimatedDataObj[key].machineSetUpRate;
                    varianceObj.totalLaborSetupRate = estimatedDataObj[key].laborSetUpRate;
                    varianceObj.totalMachineRunRate = estimatedDataObj[key].machineRunRate;
                    varianceObj.totalLaborRunRate = estimatedDataObj[key].laborRunRate;

                    varianceObj.actRunTime = 0;
                    varianceObj.actSetupTime = 0;

                    varianceObj.actRunCost = 0;
                    varianceObj.actSetupCost = 0;
                    varianceObj.estRunCost = 0;
                    varianceObj.estSetupCost = 0;



                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName] = estimatedDataObj[key]
                    var operationWiseActualDataArray = [];
                    if (ActualDataFromWOCompletion[workOrderId]) {
                        if (ActualDataFromWOCompletion[workOrderId][key]) {
                            operationWiseActualDataArray = ActualDataFromWOCompletion[workOrderId][key]
                        }
                    }

                    var laborResources = 1
                    var machineResources = 1;

                    var totalSetupCost = 0;
                    var totalRunCost = 0;

                    var totalMachineTime = 0
                    var totalRunTime = 0
                    var totalSetupTime = 0
                    operationWiseActualDataArray.forEach(element => {
                        var labourRunTime = 0
                        var labourSetupTime = 0;
                        var MachineRunTime = 0
                        var MachineSetupTime = 0;

                        totalRunTime = parseFloat(totalRunTime) + CheckNull(parseFloat(element.laborruntime)) + CheckNull(parseFloat(element.machineruntime))
                        totalSetupTime = parseFloat(totalSetupTime) + CheckNull(parseFloat(element.laborsetuptime)) + CheckNull(parseFloat(element.machinesetuptime))

                        labourRunTime = parseFloat(labourRunTime) + CheckNull(parseFloat(element.laborruntime))
                        labourSetupTime = parseFloat(labourSetupTime) + CheckNull(parseFloat(element.laborsetuptime))
                        MachineRunTime = parseFloat(MachineRunTime) + CheckNull(parseFloat(element.machineruntime))
                        MachineSetupTime = parseFloat(MachineSetupTime) + CheckNull(parseFloat(element.machinesetuptime))
                        laborResources = element.laborresources
                        machineResources = element.machineresources

                        totalSetupCost = parseFloat(totalSetupCost) + parseFloat((varianceObj.totalMachineSetupRate / 60) * MachineSetupTime * machineResources) + parseFloat((varianceObj.totalLaborSetupRate / 60) * labourSetupTime * laborResources)
                        totalRunCost = parseFloat(totalRunCost) + parseFloat((varianceObj.totalMachineRunRate / 60) * MachineRunTime * machineResources) + parseFloat((varianceObj.totalLaborRunRate / 60) * labourRunTime * laborResources)




                        log.debug({
                            title: 'varianceObj.totalLaborRunRate=' + varianceObj.totalLaborRunRate + 'labourRunTime ' + labourRunTime + ' laborResources =' + laborResources,
                            details: 'varianceObj.totalMachineRunRate =' + varianceObj.totalMachineRunRate + ' MachineRunTime =' + MachineRunTime + ' machineResources =' + machineResources
                        })

                        // log.debug({
                        //     title: 'varianceObj.setUpRate ='+varianceObj.setUpRate + 'MachineSetupTime '+MachineSetupTime +  ' machineResources ='+ machineResources,
                        //     details: 'totalRunCost ='+(varianceObj.setUpRate / 60) * labourSetupTime * laborResources + ' element ='+ JSON.stringify(element)
                        // })

                    });

                    estTotalSetupCost = parseFloat(estTotalSetupCost) + parseFloat((varianceObj.totalMachineSetupRate / 60) * varianceObj.estSetupTime * varianceObj.machineresources) + parseFloat((varianceObj.totalLaborSetupRate / 60) * varianceObj.estSetupTime * varianceObj.laborResources)
                    estTotalRunCost = parseFloat(estTotalRunCost) + parseFloat((varianceObj.totalMachineRunRate / 60) * varianceObj.estRunTime * varianceObj.machineresources) + parseFloat((varianceObj.totalLaborRunRate / 60) * varianceObj.estRunTime * varianceObj.laborResources)

                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actRunTime = totalRunTime;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actSetupTime = totalSetupTime;

                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actRunCost = totalRunCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actSetupCost = totalSetupCost;

                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actCost = totalRunCost + totalSetupCost;

                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].estRunCost = estTotalRunCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].estSetupCost = estTotalSetupCost;


                    varianceReportObj[workOrderId][estimatedDataObj[key].operationName].estCost = estTotalRunCost + estTotalSetupCost;
                    // log.audit({
                    //     title: 'operationWiseActualDataArray',
                    //     details: JSON.stringify(operationWiseActualDataArray)
                    // })


                });
            }
        });
        log.audit({
            title: 'varianceReportObj',
            details: JSON.stringify(varianceReportObj)
        })


        // 
        // operationNameObject = getOperationName(workOrderArray)
        // plannedDataObj = getPlannedDataFromWorkOrder(costCategoryObj, workOrderArray, operationNameObject);
        // operationalDataObj = getActualDataFromCompletion(costCategoryObj, plannedDataObj, workOrderArray);
        // log.debug("PCT", "Script Usage Check in Plugin : " + runtime.getCurrentScript().getRemainingUsage());

        return { 'isSuccess': true, 'data': varianceReportObj }

    }

    const CheckNull = (val) => {
        if (val == '' || val == undefined || isNaN(val)) {
            val = 0
        }
        return val
    }

    const getCompletionRecordId = (workOrderArray) => {
        let completionRecordIdArray = [];
        var workordercompletionSearchObj = search.create({
            type: "workordercompletion",
            filters:
                [
                    ["type", "anyof", "WOCompl"],
                    "AND",
                    ["createdfrom", "anyof", workOrderArray],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [

                    search.createColumn({ name: "tranid", label: "Document Number" }),
                ]
        });
        var searchResultCount = workordercompletionSearchObj.runPaged().count;
        log.debug("workordercompletionSearchObj result count", searchResultCount);
        workordercompletionSearchObj.run().each(function (result) {
            completionRecordIdArray.push(result.id)
            return true;
        });

        return completionRecordIdArray;
    }

    const getActualDataFromWOCompletion = (completionRecordIdArray) => {

        let actOperationNameObj = {};

        completionRecordIdArray.forEach(element => {

            var recordData = record.load({
                type: record.Type.WORK_ORDER_COMPLETION,
                id: element,
                isDynamic: true
            })
            var workOrderId = recordData.getValue('createdfrom')
            var operationLineCount = recordData.getLineCount({
                sublistId: 'operation'
            })
            for (var opLineIndex = 0; opLineIndex < operationLineCount; opLineIndex++) {
                recordData.selectLine({
                    sublistId: 'operation',
                    line: opLineIndex
                })

                var actOperationObj = {}
                actOperationObj.OperanceSecquence = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'operationsequence'
                })
                actOperationObj.operationName = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'operationname'
                })
                actOperationObj.laborruntime = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'laborruntime'
                })
                actOperationObj.laborsetuptime = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'laborsetuptime'
                })
                actOperationObj.machineruntime = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'machineruntime'
                })
                actOperationObj.machinesetuptime = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'machinesetuptime'
                })
                actOperationObj.machineresources = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'machineresources'
                })
                actOperationObj.laborresources = recordData.getCurrentSublistValue({
                    sublistId: 'operation',
                    fieldId: 'laborresources'
                })

                if (!(workOrderId in actOperationNameObj)) {
                    actOperationNameObj[workOrderId] = {}
                    if (actOperationNameObj[workOrderId][actOperationObj.operationName] == null) {
                        actOperationNameObj[workOrderId][actOperationObj.operationName] = []
                    }
                    actOperationNameObj[workOrderId][actOperationObj.operationName].push(actOperationObj)
                    log.audit("PCT-If", actOperationNameObj);
                }
                else {
                    if (actOperationNameObj[workOrderId][actOperationObj.operationName] == null) {
                        actOperationNameObj[workOrderId][actOperationObj.operationName] = []
                    }
                    actOperationNameObj[workOrderId][actOperationObj.operationName].push(actOperationObj)
                    log.audit("PCT-Else", actOperationNameObj);
                }
            }
        });
        log.audit({
            title: 'actOperationNameObj',
            details: JSON.stringify(actOperationNameObj)
        })

        return actOperationNameObj;
    }


    // --------------------- Function for get Costing Type Start ( Account : 1.0, Search Id : 1604 ) ------------------------
    const getEstimateDataFromMFGOperationTask = (workOrderArray, costCategoryObj) => {
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["workorder.internalid", "anyof", workOrderArray]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Operation Name" }),
                    search.createColumn({ name: "sequence", label: "Operation Sequence" }),
                    search.createColumn({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" }),
                    search.createColumn({ name: "startdate", label: "Start Date" }),
                    search.createColumn({ name: "enddate", label: "End Date" }),
                    search.createColumn({ name: "estimatedwork", label: "Estimated Work" }),
                    search.createColumn({ name: "status", label: "Status" }),
                    search.createColumn({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" }),
                    search.createColumn({ name: "actualruntime", label: "Actual Run Time" }),
                    search.createColumn({ name: "actualsetuptime", label: "Actual Setup Time" }),
                    search.createColumn({ name: "runtime", label: "Run Time" }),
                    search.createColumn({ name: "setuptime", label: "Setup Time (Min)" }),
                    search.createColumn({ name: "machineresources", label: "Machine Resources" }),
                    search.createColumn({ name: "laborresources", label: "Labor Resources" }),
                    search.createColumn({ name: "internalid", join: "workorder", label: "Work Order" }),
                    search.createColumn({ name: "completedquantity", label: "Completed Quantity" }),
                    search.createColumn({
                        name: "tranid",
                        join: "workOrder",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "item",
                        join: "workOrder",
                        label: "Item"
                    })
                ]
        });
        let operationNameObj = {};
        var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
        manufacturingoperationtaskSearchObj.run().each(function (result) {
            let operationObj = {};

            let MFGOperationTaskId = result.id
            let costObj = { 'totalMachineSetupRate': 0, 'totalLaborSetupRate': 0, 'totalLaborRunRate': 0, 'totalMachineRunRate': 0 };
            if (MFGOperationTaskId > 0) {
                costObj = getCostDataFromMFGOperationTask(MFGOperationTaskId, costCategoryObj)

            }

            let workOrderId = result.getValue({ name: "internalid", join: "workorder", label: "Work Order" })
            operationObj.WorkOrderNumber = result.getValue({
                name: "tranid",
                join: "workOrder",
                label: "Document Number"
            })
            operationObj.operationName = result.getValue({ name: "name", label: "Operation Name" })
            operationObj.assemblyName = result.getText({ name: "item", join: "workOrder", label: "Item" })
            operationObj.operationSequence = result.getValue({ name: "sequence", label: "Operation Sequence" })
            // operationObj.actRunTime = result.getValue({ name: "actualruntime", label: "Actual Run Time" })
            // operationObj.actSetupTime = result.getValue({ name: "actualsetuptime", label: "Actual Setup Time" })
            operationObj.estRunTime = result.getValue({ name: "runtime", label: "Run Time" })
            operationObj.estSetupTime = result.getValue({ name: "setuptime", label: "Setup Time (Min)" })
            operationObj.machineResources = result.getValue({ name: "machineresources", label: "Machine Resources" })
            operationObj.laborResources = result.getValue({ name: "laborresources", label: "Labor Resources" })
            operationObj.completedquantity = result.getValue({ name: "completedquantity", label: "completedquantity" })
            operationObj.machineSetUpRate = CheckNull(costObj.totalMachineSetupRate)
            operationObj.laborSetUpRate = CheckNull(costObj.totalLaborSetupRate)
            operationObj.machineRunRate = CheckNull(costObj.totalMachineRunRate)
            operationObj.laborRunRate = CheckNull(costObj.totalLaborRunRate)

            // .run().each has a limit of 4,000 results
            log.debug("PCT", "operationVarianceObj Object : " + JSON.stringify(operationObj));

            if (!(workOrderId in operationNameObj)) {
                operationNameObj[workOrderId] = {}
                operationNameObj[workOrderId][operationObj.operationName] = operationObj
            }
            else {
                operationNameObj[workOrderId][operationObj.operationName] = operationObj
            }

            return true;
        });

        log.debug("PCT", "Costing Category Object : " + JSON.stringify(operationNameObj));
        return operationNameObj;
    }
    // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------


    const getCostDataFromMFGOperationTask = (MFGOperationTaskId, costCategoryObj) => {
        var recordData = record.load({
            type: record.Type.MANUFACTURING_OPERATION_TASK,
            id: MFGOperationTaskId,
            isDynamic: true
        })
        var costdetailLineCount = recordData.getLineCount({
            sublistId: 'costdetail'
        })

        let totalLaborSetupRate = 0;
        let totalMachineSetupRate = 0;
        let totalLaborRunRate = 0;
        let totalMachineRunRate = 0;
        for (var opLineIndex = 0; opLineIndex < costdetailLineCount; opLineIndex++) {
            recordData.selectLine({
                sublistId: 'costdetail',
                line: opLineIndex
            })
            var costCategory = recordData.getCurrentSublistText({
                sublistId: 'costdetail',
                fieldId: 'costcategory'
            })
            var runrate = recordData.getCurrentSublistValue({
                sublistId: 'costdetail',
                fieldId: 'runrate'
            })
            var fixedrate = recordData.getCurrentSublistValue({
                sublistId: 'costdetail',
                fieldId: 'fixedrate'
            })
            var labor = recordData.getCurrentSublistValue({
                sublistId: 'costdetail',
                fieldId: 'labor'
            })

            var overhead = recordData.getCurrentSublistValue({
                sublistId: 'costdetail',
                fieldId: 'overhead'
            })
            var setup = recordData.getCurrentSublistValue({
                sublistId: 'costdetail',
                fieldId: 'setup'
            })
            let costCategoryType = costCategoryObj[costCategory].costType;

            log.debug({
                title: 'costCategoryType',
                details: costCategoryType
            })
            // if(setup == true)
            if (parseFloat(fixedrate) > 0 && !isNaN(fixedrate)) {
                if (costCategoryType.includes('LABORSETUP')) {
                    totalLaborSetupRate = parseFloat(totalLaborSetupRate) + parseFloat(fixedrate)
                }
                if (costCategoryType.includes('MACHINESETUP')) {
                    totalMachineSetupRate = parseFloat(totalMachineSetupRate) + parseFloat(fixedrate)
                }
            }
            //if(labor == true)
            if (parseFloat(runrate) > 0 && !isNaN(runrate)) {
                if (costCategoryType.includes('LABORRUN')) {
                    totalLaborRunRate = parseFloat(totalLaborRunRate) + parseFloat(runrate)
                }
                if (costCategoryType.includes('MACHINERUN')) {
                    totalMachineRunRate = parseFloat(totalMachineRunRate) + parseFloat(runrate)
                }

            }

        }
        log.debug({
            title: 'Rate Obj',
            details: { 'totalLaborSetupRate': totalLaborSetupRate, 'totalMachineSetupRate': totalMachineSetupRate, 'totalLaborRunRate': totalLaborRunRate, 'totalMachineRunRate': totalMachineRunRate }
        })
        return { 'totalLaborSetupRate': totalLaborSetupRate, 'totalMachineSetupRate': totalMachineSetupRate, 'totalLaborRunRate': totalLaborRunRate, 'totalMachineRunRate': totalMachineRunRate }
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
    // const getOperationName = (workOrderArray) => {
    //     let operationNameObj = {};
    //     var manufacturingoperationtaskSearchObj = search.create({
    //         type: "manufacturingoperationtask",
    //         filters:
    //             [
    //                 ["status", "anyof", "PROGRESS", "NOTSTART"],
    //                 "AND",
    //                 ["workorder", "anyof", workOrderArray]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "name", label: "Operation Name" }),
    //                 search.createColumn({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" }),
    //                 search.createColumn({ name: "workorder", label: "Work Order" }),
    //                 search.createColumn({
    //                     name: "internalid",
    //                     join: "workOrder",
    //                     label: "Internal ID"
    //                 })
    //             ]
    //     });
    //     var operationCount = manufacturingoperationtaskSearchObj.runPaged().count;
    //     log.debug("Operation count : ", operationCount);

    //     manufacturingoperationtaskSearchObj.run().each(function (result) {
    //         let operationObj = {}
    //         let workOrderId = result.getValue({
    //             name: "internalid",
    //             join: "workOrder",
    //             label: "Internal ID"
    //         });
    //         let costTemplateName = result.getText({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" });
    //         operationObj.operationId = result.id;
    //         operationObj.operationName = result.getValue({ name: "name", label: "Operation Name" });
    //         operationObj.costTemplateId = result.getValue({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" });
    //         operationObj.costTemplateName = costTemplateName
    //         if (!(workOrderId in operationNameObj)) {
    //             operationNameObj[workOrderId] = {}
    //             operationNameObj[workOrderId][costTemplateName] = operationObj
    //         }
    //         else {
    //             operationNameObj[workOrderId][costTemplateName] = operationObj
    //         }

    //         return true;

    //     });
    //     log.debug("PCT", "Operation Object : " + JSON.stringify(operationNameObj))

    //     return operationNameObj;

    // }

    // --------------------- Function for get get Operation Name End ( Account : 1.0, Search Id : 1600 ) ------------------------

    // --------------------- Function for get Planned Data from WorkOrder Start ( Account : 1.0, Search Id : 1592 ) ------------------------

    // const getPlannedDataFromWorkOrder = (costCategoryObj, workOrderArray, operationNameObject) => {
    //     // log.debug("PCT", "COST : " + JSON.stringify(costCategoryObj))
    //     let plannedWorkOrderDataObj = {};
    //     var workorderSearchObj = search.create({
    //         type: "workorder",
    //         filters:
    //             [
    //                 ["type", "anyof", "WorkOrd"],
    //                 "AND",
    //                 ["itemsource", "noneof", "PHANTOM", "PURCHASE_ORDER", "STOCK", "WORK_ORDER"],
    //                 "AND",
    //                 ["mainline", "is", "F"],
    //                 "AND",
    //                 ["item.type", "noneof", "Assembly"],
    //                 "AND",
    //                 ["internalid", "anyof", workOrderArray]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "item", label: "Item" }),
    //                 search.createColumn({
    //                     name: "costcategory",
    //                     join: "item",
    //                     label: "Cost Category"
    //                 }),
    //                 search.createColumn({ name: "quantity", label: "Planned Amt = This * Item Rate" }),
    //                 search.createColumn({
    //                     name: "formulanumeric",
    //                     formula: "60*{quantity}",
    //                     label: "Planned Qty"
    //                 }),
    //                 search.createColumn({ name: "tranid", label: "Document Number" }),
    //                 search.createColumn({
    //                     name: "custitem_pct_item_op_name",
    //                     join: "item",
    //                     label: "Operation Name"
    //                 }),
    //                 search.createColumn({ name: "rate", label: "Rate" }),
    //                 search.createColumn({ name: "quantity", label: "Quantity" }),
    //                 search.createColumn({ name: "built", label: "Built" })
    //             ]
    //     });
    //     var plannedDataCount = workorderSearchObj.runPaged().count;
    //     log.debug("PCT", "Get Planned Data Count : " + plannedDataCount);
    //     let start = 0;
    //     let end = 1000;
    //     do {
    //         var result = workorderSearchObj.run().getRange({ start: start, end: end });
    //         log.debug({
    //             title: "PCT",
    //             details: JSON.stringify(result)
    //         })

    //         log.debug("PCT", JSON.stringify(operationNameObject))
    //         for (let plannedIndex = 0; plannedIndex < result.length; plannedIndex++) {

    //             let workOrderId = result[plannedIndex].id;
    //             let operationId = result[plannedIndex].getValue({
    //                 name: "custitem_pct_item_op_name",
    //                 join: "item",
    //                 label: "Operation Name"
    //             })
    //             let operationCostTemplate = result[plannedIndex].getText({
    //                 name: "custitem_pct_item_op_name",
    //                 join: "item",
    //                 label: "Operation Name"
    //             })
    //             let costCategory = result[plannedIndex].getValue({
    //                 name: "costcategory",
    //                 join: "item",
    //                 label: "Cost Category"
    //             });
    //             log.debug("PCT", operationCostTemplate)
    //             let operationName = operationNameObject[workOrderId][operationCostTemplate].operationName;
    //             let costCategoryType = costCategoryObj[costCategory].costType;
    //             let plannedQty = Math.abs(parseFloat(result[plannedIndex].getValue({
    //                 name: "formulanumeric",
    //                 formula: "60*{quantity}",
    //                 label: "Planned Qty"
    //             })));
    //             let plannedAmount = Math.abs(parseFloat(result[plannedIndex].getValue(({ name: "quantity", label: "Planned Amt = This * Item Rate" }))));
    //             if (plannedAmount == null || plannedAmount == "") {
    //                 plannedAmount = 0;
    //             }
    //             let rate = Math.abs(parseFloat(result[plannedIndex].getValue({ name: "rate", label: "Rate" })));
    //             if (rate == null && rate == "") {
    //                 rate = 0;
    //             }
    //             let totalAmount = Math.abs(parseFloat((plannedAmount * rate)));
    //             if (!(workOrderId in plannedWorkOrderDataObj)) {
    //                 plannedWorkOrderDataObj[workOrderId] = {
    //                     'workOrderNumber': result[plannedIndex].getValue({ name: "tranid", label: "Document Number" }),
    //                     'operation': {}
    //                 };
    //                 if (!(operationId in plannedWorkOrderDataObj[workOrderId]['operation'])) {
    //                     plannedWorkOrderDataObj[workOrderId]['operation'][operationId] = {
    //                         'operationName': operationName
    //                     };
    //                     if (!("run" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"] = {};
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalAmount'] = 0
    //                     }
    //                     if (!("setup" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"] = {};
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalAmount'] = 0
    //                     }
    //                     if (costCategoryType.includes("RUN")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                     else if (costCategoryType.includes("SETUP")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                 }
    //                 else {
    //                     if (costCategoryType.includes("RUN")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                     else if (costCategoryType.includes("SETUP")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                 }

    //             }
    //             else {
    //                 if (!(operationId in plannedWorkOrderDataObj[workOrderId]['operation'])) {
    //                     plannedWorkOrderDataObj[workOrderId]['operation'][operationId] = {
    //                         'operationName': operationName
    //                     };
    //                     if (!("run" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"] = {};
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalAmount'] = 0
    //                     }
    //                     if (!("setup" in plannedWorkOrderDataObj[workOrderId]['operation'][operationId])) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"] = {};
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalQuantity'] = 0
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalAmount'] = 0
    //                     }
    //                     if (costCategoryType.includes("RUN")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                     else if (costCategoryType.includes("SETUP")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                 }
    //                 else {
    //                     if (costCategoryType.includes("RUN")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                     else if (costCategoryType.includes("SETUP")) {
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalQuantity'] += plannedQty;
    //                         plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['plannedTotalAmount'] += totalAmount;
    //                     }
    //                 }
    //             }
    //         }

    //         start += 1000;
    //         end += 1000;
    //         plannedDataCount -= 1000;
    //     }

    //     while (plannedDataCount > 0);
    //     // log.debug("PCT", "Planned Data from Work Order Object : " + JSON.stringify(plannedWorkOrderDataObj))
    //     return plannedWorkOrderDataObj;
    // }

    // --------------------- Function for get Planned Data from WorkOrder End ( Account : 1.0, Search Id : 1592 ) ------------------------

    // --------------------- Function for get Actual Data for WorkOrder Completion Start ( Account : 1.0, Search Id : 1594 ) ------------------------
    // const getActualDataFromCompletion = (costCategoryObj, plannedWorkOrderDataObj, workOrderArray) => {
    //     var workordercompletionSearchObj = search.create({
    //         type: "workordercompletion",
    //         filters:
    //             [
    //                 ["type", "anyof", "WOCompl"],
    //                 "AND",
    //                 ["createdfrom", "anyof", workOrderArray],
    //                 "AND",
    //                 ["mainline", "is", "F"],
    //                 "AND",
    //                 ["item.type", "noneof", "Assembly"],
    //                 "AND",
    //                 ["formulanumeric: {quantity}", "greaterthan", "0"]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "item", label: "Item" }),
    //                 search.createColumn({
    //                     name: "costcategory",
    //                     join: "item",
    //                     label: "Cost Category"
    //                 }),
    //                 search.createColumn({ name: "quantity", label: "Quantity" }),
    //                 search.createColumn({ name: "rate", label: "Item Rate" }),
    //                 search.createColumn({ name: "amount", label: "Amount" }),
    //                 search.createColumn({
    //                     name: "formulanumeric",
    //                     formula: "{quantity}*60",
    //                     label: "Formula (Numeric)"
    //                 }),
    //                 search.createColumn({ name: "createdfrom", label: "Created From" }),
    //                 search.createColumn({
    //                     name: "custitem_pct_item_op_name",
    //                     join: "item",
    //                     label: "Operation Name"
    //                 })
    //             ]
    //     });
    //     var completionDataCount = workordercompletionSearchObj.runPaged().count;
    //     log.debug("PCT", "Work Order Completion Data Count : " + completionDataCount);
    //     let start = 0;
    //     let end = 1000;
    //     do {
    //         var result = workordercompletionSearchObj.run().getRange({ start: start, end: end });
    //         for (let completionIndex = 0; completionIndex < result.length; completionIndex++) {
    //             let workOrderId = result[completionIndex].getValue({ name: "createdfrom", label: "Created From" });
    //             let operationId = result[completionIndex].getValue({
    //                 name: "custitem_pct_item_op_name",
    //                 join: "item",
    //                 label: "Operation Name"
    //             });
    //             let actualQty = parseFloat(result[completionIndex].getValue({
    //                 name: "formulanumeric",
    //                 formula: "{quantity}*60",
    //                 label: "Formula (Numeric)"
    //             }));
    //             let actualAmount = parseFloat(result[completionIndex].getValue({ name: "amount", label: "Amount" }));
    //             if (actualAmount == null || actualAmount == "") {
    //                 actualAmount = 0;
    //             }
    //             let costCategory = result[completionIndex].getValue({
    //                 name: "costcategory",
    //                 join: "item",
    //                 label: "Cost Category"
    //             });
    //             let costCategoryType = costCategoryObj[costCategory].costType;
    //             if (costCategoryType.includes("RUN")) {
    //                 plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalQuantity'] += actualQty;
    //                 plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["run"]['actualTotalAmount'] += actualAmount;
    //             }
    //             else if (costCategoryType.includes("SETUP")) {
    //                 plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalQuantity'] += actualQty;
    //                 plannedWorkOrderDataObj[workOrderId]['operation'][operationId]["setup"]['actualTotalAmount'] += actualAmount;
    //             }

    //         }
    //         start += 1000;
    //         end += 1000;
    //         completionDataCount -= 1000;
    //     }
    //     while (completionDataCount > 0);
    //     log.debug("PCT", "Actual Data from Work Order Completion : " + JSON.stringify(plannedWorkOrderDataObj))
    //     return plannedWorkOrderDataObj;
    // }
    // --------------------- Function for get Actual Data for WorkOrder Completion End ( Account : 1.0, Search Id : 1594 ) ------------------------




    return {
        get: _get,
    }
});
