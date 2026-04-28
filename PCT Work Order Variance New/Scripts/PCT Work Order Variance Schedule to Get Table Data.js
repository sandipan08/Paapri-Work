/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/task', 'N/record', 'N/error', 'N/log', 'N/format', 'N/search', 'N/runtime'],
    function (task, record, error, log, format, search, runtime) {

        function execute(context) {
            log.debug("PCT", "In Work Order Variance Schedule");
            // ----------------------- Declare Global Variable Start ------------------
            let workOrderEstimatedItemDataObj = {};
            let workOrderItemDataObj = {};
            let workOrderArray = [];
            let costCategoryObj = {};
            let varianceReportObj = {}
            // ----------------------- Declare Global Variable End ------------------

            let workOrderString = runtime.getCurrentScript().getParameter({ name: 'custscript_pct_wov_work_order_id' })
            workOrderArray = workOrderString.split(',').join()
            // workOrderArray = ['8871'];
            log.debug("PCT", workOrderArray);

            let workOrderVarianceDataStoreRecordId = record.create({
                type: 'customrecord_pct_wov_data_store',
                isDynamic: true
            }).setValue({
                fieldId: 'custrecord_pct_wov_data_store_status',
                value: 1,
                ignoreFieldChange: true
            }).save();
            log.debug("PCT", "Created Work Order Variance Record Id : " + workOrderVarianceDataStoreRecordId)

            // ------------------------------ Material Operation Start ---------------------------
            workOrderEstimatedItemDataObj = getEstimatedItemDetails(workOrderArray);
            workOrderItemDataObj = getActualItemDetails(workOrderEstimatedItemDataObj, workOrderArray);
            // ------------------------------ Material Operation End ---------------------------

            // ------------------------------ Operation Function Start ---------------------------
            costCategoryObj = getCostingCategory();
            let completionRecordIdArray = getCompletionRecordId(workOrderArray)
            let EstimateDataFromMFGOperationTask = getEstimateDataFromMFGOperationTask(workOrderArray, costCategoryObj);
            let ActualDataFromWOCompletion = getActualDataFromWOCompletion(completionRecordIdArray)

            // ------------------------------ Operation Function End ---------------------------

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

                    });
                }
            });
            log.audit({
                title: 'varianceReportObj',
                details: JSON.stringify(varianceReportObj)
            })

        }
        // { 'isSuccess': true, 'data': { 'getWorkOrderItemData' : workOrderItemDataObj, 'getOperationalData' : varianceReportObj} }

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
                log.debug("PCT", "actualItemRate : " + element.actualItemRate)
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
        const CheckNull = (val) => {
            if (val == '' || val == undefined || isNaN(val)) {
                val = 0
            }
            return val;
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


        return {
            execute: execute
        }
    });
