/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00       1st July 2022           ubhankar Nath
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

*@ScriptName        PCT PMC Create WOrk Order Completion
*@Developer         Subhankar Nath 
*@DevelopmentHead   Mrs. Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This 2.1 restlet will create Work order completion

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                              Purpose:                                                              Developer:
_post                                                  Main Function(Generates data for Work Order Completion)                         Subhankar Nath
createWorkOrderCompletion                              Creates Work Order Completion                                                   Subhankar Nath
getWorkOrderDetails                                    Fetches Work Order Assembly Last operation Sequence
                                                       and work order Document Number                                                  Subhankar Nath   
checkIsLotNumberedItem                                 Checkes if Work Order assembly is lot numbered or not                           Subhankar Nath 
/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/record', 'N/search', 'N/format'], function (record, search, format) {

    function _post(context) {
        try {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${JSON.stringify(context)}`
            })
            const workOrderCompletionObj = {};
            const pmcTransactionId = context.pmcTransactionId;

            const productionEndTime = context.productionEndTime
            const loadPmcTransaction1 = record.load({
                type: 'customrecord_pct_pmc_tran',
                id: pmcTransactionId,
                isDynamic: false
            })

            var downTimeDuration = loadPmcTransaction1.getValue({
                fieldId: 'custrecord_pct_pmc_dwn_duration',
                //text: productionEndTime
            })

            //  var labor_end_date_time = productionEndTime

            let productionEndTimeWOS = getProductionEndTimeWithOutSec(productionEndTime)
            var labor_end_date_time = productionEndTimeWOS
            loadPmcTransaction1.setText({
                fieldId: 'custrecord_pct_pmc_res_end_date',
                text: productionEndTime
            })
            loadPmcTransaction1.setText({
                fieldId: 'custrecord_pct_pmc_res_end_date_wos',
                text: productionEndTimeWOS
            }).save();
            log.debug({
                title: 'PCT-PMC 1',
                details: `Context = ${JSON.stringify(context)}`
            })

            const loadPmcTransaction = record.load({
                type: 'customrecord_pct_pmc_tran',
                id: pmcTransactionId,
                isDynamic: false
            })

            const emp = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_emp'
            })

            var labor_start_date_time = loadPmcTransaction.getText({
                fieldId: 'custrecord_pct_pmc_res_start_date_wos'
            })

            const workOrderId = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_wo'
            })
            const pmcTransactionOperationSequenceId = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_op_task_id'
            })
            const operationText = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_p_seq'
            }).toString();
            const productionTime = context.productionTime;
            const completedQuantity = parseFloat(context.productionQuantity)
            const productionScrapQuantity = parseFloat(context.productionScrapQuantity)

            log.debug({
                title: 'PCT-PMC',
                details: `Production Time = ${productionTime}`
            })


            // var labor_hr_finalObj = get_labor_hr(labor_start_date_time, labor_end_date_time, emp);
            // var labor_hr_final = labor_hr_finalObj.hr;
            // var numberofRunningWo = labor_hr_finalObj.no_wo;
            // var labor_differenceInMinutes = labor_hr_final / (1000 * 60);

            // // let indivisualDuration = 0;
            // // if (parseFloat(downTimeDuration) > 0) {
            // //     indivisualDuration = downTimeDuration / numberofRunningWo
            // //     if (parseFloat(indivisualDuration) > 0) {
            // //         log.debug({
            // //             title: 'PCT-PMC DOWNTIME CALC',
            // //             details: `labor_differenceInMinutes = ${labor_differenceInMinutes}  indivisualDuration = ${indivisualDuration}`
            // //         })
            // //         labor_differenceInMinutes = parseFloat(labor_differenceInMinutes) - indivisualDuration
            // //     }
            // // }
            // if (downTimeDuration == '' || downTimeDuration == null || downTimeDuration == undefined) {
            //     downTimeDuration = 0
            // }
            // labor_differenceInMinutes = parseFloat(labor_differenceInMinutes) - downTimeDuration

            // if (labor_differenceInMinutes == null || labor_differenceInMinutes == '' || labor_differenceInMinutes < 0) {
            //     labor_differenceInMinutes = 0
            // }
            // // var labourDiffInsec =  labor_hr_final / 1000
            // // var labourDiffInMin = Math.floor(labourDiffInsec/60)
            // // var reminder = parseFloat(labourDiffInMin) //parseFloat(labourDiffInsec-(labourDiffInMin * 60))


            // log.emergency({
            //     title: 'labor_start_date_time =' + labor_start_date_time,
            //     details: 'labor_end_date_time =' + labor_end_date_time + ' emp =' + emp + ' labor_differenceInMinutes =' + labor_differenceInMinutes + ' labor_hr_final =' + labor_hr_final //+ ' actual ='+reminder
            // })

            // // const loadPmcTransaction = record.load({
            // //     type: 'customrecord_pct_pmc_tran',
            // //     id: pmcTransactionId,
            // //     isDynamic: false
            // // })
            // // const workOrderId = loadPmcTransaction.getValue({
            // //     fieldId: 'custrecord_pct_pmc_wo'
            // // })
            // // const pmcTransactionOperationSequenceId = loadPmcTransaction.getValue({
            // //     fieldId: 'custrecord_pct_pmc_op_task_id'
            // // })
            // // const operationText = loadPmcTransaction.getValue({
            // //     fieldId: 'custrecord_pct_pmc_p_seq'
            // // }).toString();
            // // const productionTime = context.productionTime;
            // // const completedQuantity = parseFloat(context.productionQuantity)
            // // log.debug({
            // //     title: 'PCT-PMC',
            // //     details: `Production Time = ${productionTime}`
            // // })

            // log.debug({
            //     title: 'workOrderId',
            //     details: workOrderId
            // })
            workOrderCompletionObj['pmcTransactionId'] = pmcTransactionId
            workOrderCompletionObj['laborRuntimeOrLaborsetUptime'] = productionTime//labor_differenceInMinutes
            let errorMessage;
            workOrderCompletionObj['workOrderId'] = workOrderId;
            if (workOrderId) {
                log.debug({
                    title: 'workOrderCompletionObj',
                    details: JSON.stringify(workOrderCompletionObj)
                })
                const workOrderDetailsObj = getWorkOrderDetails(workOrderId);
                if (workOrderDetailsObj.isSuccess) {
                    workOrderCompletionObj['pmcTransactionName'] = loadPmcTransaction.getText({
                        fieldId: 'name'
                    })
                    workOrderCompletionObj['workOrderAssembly'] = workOrderDetailsObj.data.assembly;
                    workOrderCompletionObj['lastOperationSequence'] = workOrderDetailsObj.data.lastOperationSeq
                    workOrderCompletionObj['operationSequenceId'] = pmcTransactionOperationSequenceId;
                    workOrderCompletionObj['operationSequenceText'] = operationText;
                    workOrderCompletionObj['completedQuantity'] = completedQuantity
                    workOrderCompletionObj['productionScrapQuantity'] = productionScrapQuantity
                    log.debug({
                        title: 'PCT-PMC',
                        details: `Work Order Details = ${JSON.stringify(workOrderDetailsObj)}`
                    })
                    workOrderCompletionObj['isLastOperation'] = operationText === workOrderDetailsObj.data.lastOperationSeq ? true : false;
                    const itemObj = checkIsLotNumberedItem(workOrderDetailsObj.data.assembly);
                    if (itemObj.isSuccess) {
                        workOrderCompletionObj['isLotItem'] = itemObj.data.isLotItem ? true : false;
                        workOrderCompletionObj['isserialitem'] = itemObj.data.isserialitem ? true : false;
                        workOrderCompletionObj['lotNumber'] = workOrderDetailsObj.data.documentNumber;
                    }
                    let workOrderCompletionResponseObj = createWorkOrderCompletion(workOrderCompletionObj);
                    if (workOrderCompletionResponseObj.isSuccess) {
                        // log.debug('labor_differenceInMinutes', labor_differenceInMinutes)
                        // loadPmcTransaction.setValue({
                        //     fieldId: 'custrecord_pct_pmc_prod_time_duration',
                        //     value: labor_differenceInMinutes,
                        //     ignoreFieldChange: false
                        // })
                        loadPmcTransaction.setValue({
                            fieldId: 'custrecord_pct_pmc_completion_number',
                            value: workOrderCompletionResponseObj.data.id,
                            ignoreFieldChange: false
                        }).save();
                    }

                    return workOrderCompletionResponseObj
                }
                else {
                    errorMessage = workOrderDetailsObj.errorMessage
                }
            }
            else {
                errorMessage = 'Work Order Not Found'
            }
            return { 'isSuccess': false, 'errorMessage': errorMessage }
        } catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    const createWorkOrderCompletion = (dataObj) => {
        log.debug({
            title: 'PCT-PMC',
            details: `Data Obj = ${JSON.stringify(dataObj)}`
        })
        let workOrderCompletionRecord = record.transform({
            fromType: record.Type.WORK_ORDER,
            fromId: dataObj.workOrderId,
            toType: record.Type.WORK_ORDER_COMPLETION,
            isDynamic: false
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'startoperation',
            value: dataObj.operationSequenceId
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'endoperation',
            value: dataObj.operationSequenceId
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'completedquantity',
            value: dataObj.completedQuantity,
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'scrapquantity',
            value: dataObj.productionScrapQuantity,
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'custbody_pct_pmc_transaction',
            value: dataObj.pmcTransactionId,
        })
        if (dataObj.isLastOperation && dataObj.isLotItem && dataObj.completedQuantity > 0) {
            let subRecord = workOrderCompletionRecord.getSubrecord({
                fieldId: 'inventorydetail'
            })
            subRecord.setSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'receiptinventorynumber',
                line: 0,
                value: dataObj.lotNumber,

            })
            subRecord.setSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                line: 0,
                value: dataObj.completedQuantity,
            })
        }

        if (dataObj.isLastOperation && dataObj.isserialitem && dataObj.completedQuantity > 0) {
            let completionSerailCount = 1;
            let completionSerailCountObj = getWoCompletionSerial(dataObj.workOrderId)
            if (completionSerailCountObj.isSuccess) {
                completionSerailCount = parseInt(completionSerailCountObj.data) + 1
            }

            let subRecord = workOrderCompletionRecord.getSubrecord({
                fieldId: 'inventorydetail'
            })
            for (let index = 0; index < dataObj.completedQuantity; index++) {
                log.debug({
                    title: 'dataObj.lotNumber',
                    details: dataObj.lotNumber + '-' + completionSerailCount
                })
                subRecord.setSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'receiptinventorynumber',
                    line: index,
                    value: dataObj.lotNumber + '-' + completionSerailCount,

                })
                subRecord.setSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'quantity',
                    line: index,
                    value: 1//dataObj.completedQuantity,
                })
                completionSerailCount++
            }
        }

        let lineCount = workOrderCompletionRecord.getLineCount({
            sublistId: 'operation'
        });
        for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
            let woLineOperationSequence = workOrderCompletionRecord.getSublistValue({
                sublistId: 'operation',
                fieldId: 'operationsequence',
                line: lineIndex
            })
            log.debug({
                title: 'PCT-PMC',
                details: `Operation Sequence = ${woLineOperationSequence}`
            })
            if (woLineOperationSequence.toString() === dataObj.operationSequenceText) {
                log.debug({
                    title: 'PCT-PMC',
                    details: `Operation Sequence = ${woLineOperationSequence}`
                })
                workOrderCompletionRecord.setSublistValue({
                    sublistId: 'operation',
                    fieldId: 'recordsetup',
                    line: lineIndex,
                    value: true,
                })
                if (dataObj.pmcTransactionName.toLowerCase() === 'setup') {
                    log.debug({
                        title: 'PCT-PMC',
                        details: `Labor setup time = ${dataObj.laborRuntimeOrLaborsetUptime}`
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborsetuptime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machinesetuptime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineruntime',
                        line: lineIndex,
                        value: 0,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborruntime',
                        line: lineIndex,
                        value: 0,
                    })
                }
                else {
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborruntime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborsetuptime',
                        line: lineIndex,
                        value: 0,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machinesetuptime',
                        line: lineIndex,
                        value: 0,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineruntime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                }
            }
        }
        let workOrderCompletionId = workOrderCompletionRecord.save();
        let workOrderCompletionDocumentNumber = search.lookupFields({
            type: search.Type.WORK_ORDER_COMPLETION,
            id: workOrderCompletionId,
            columns: 'tranid'
        }).tranid
        log.debug({
            title: 'LOg',
            details: JSON.stringify(workOrderCompletionDocumentNumber)
        })
        if (workOrderCompletionId)
            return {
                'isSuccess': true, 'data': { 'id': workOrderCompletionId, 'name': workOrderCompletionDocumentNumber }
            }
        return { 'isSuccess': false, 'errorMessage': 'Unexpected Error' }
    }
    const getWoCompletionSerial = (workOrderId) => {
        var workordercompletionSearchObj = search.create({
            type: "workordercompletion",
            filters:
                [
                    ["type", "anyof", "WOCompl"],
                    "AND",
                    ["createdfrom", "anyof", workOrderId],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["inventorydetail.internalid", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "inventorynumber",
                        join: "inventoryDetail",
                        label: " Number"
                    })
                ]
        });
        var searchResultCount = workordercompletionSearchObj.runPaged().count;
        log.debug("workordercompletionSearchObj result count", searchResultCount);
        //  workordercompletionSearchObj.run().each(function(result){
        //     // .run().each has a limit of 4,000 results
        //     return true;
        //  });

        return { 'isSuccess': true, 'data': searchResultCount }
    }
    const getWorkOrderDetails = (workOrderId) => {
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", workOrderId],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "sequence",
                        join: "manufacturingOperationTask",
                        summary: "MAX",
                        label: "Operation Sequence"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let woData = {}
            workorderSearchObj.run().each(function (result) {
                woData['assembly'] = result.getValue({
                    name: "item",
                    summary: "GROUP"
                })
                woData['lastOperationSeq'] = result.getValue({
                    name: "sequence",
                    join: "manufacturingOperationTask",
                    summary: "MAX"
                })
                woData['documentNumber'] = result.getValue({
                    name: "tranid",
                    summary: "GROUP"
                })
                return true;
            });
            return { 'isSuccess': true, 'data': woData }
        }
        return { 'isSuccess': false, 'errorMessage': 'Data Not Found' }
    }

    const checkIsLotNumberedItem = (itemId) => {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemId],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "islotitem", label: "Is Lot Numbered Item" }),
                    search.createColumn({ name: "isserialitem", label: "Is Serialized Item" })
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let itemDataObj = {};
            itemSearchObj.run().each(function (result) {
                itemDataObj['isLotItem'] = result.getValue({ name: "islotitem" })
                itemDataObj['isserialitem'] = result.getValue({ name: "isserialitem" })
                // .run().each has a limit of 4,000 results
                return true;
            });
            return { 'isSuccess': true, 'data': itemDataObj }
        }
        return { 'isSuccess': false, 'errorMessage': 'Item Details Not Found' }
    }

    const dateFormatter = (date) => {
        return date ? format.format({
            value: new Date(date),
            type: format.Type.DATETIME,
            timezone: format.Timezone.ASIA_CALCUTTA
        }) : format.format({
            value: new Date(),
            type: format.Type.DATETIME,
            timezone: format.Timezone.ASIA_CALCUTTA
        });
    }



    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function get_labor_hr(labor_start_date_time, labor_end_date_time, emp) {
        var time_set = new Array();
        var time_set_num = new Array();
        var sort_time = new Array();
        var sort_date_time = new Array();
        var diff;
        var hr = 0;
        var no_wo;
        var setup_flag;
        time_set = get_time_set(labor_start_date_time, labor_end_date_time, emp);
        log.debug({
            title: 'time_set',
            details: time_set
        })

        if (time_set != null) {
            for (var i = 0; i < time_set.length; i++) {
                if (time_set[i] != null) {

                    time_set_num[i] = new Date(time_set[i]).getTime();
                }

            }
        }
        sort_time = sort(time_set_num);

        for (var i = 0; i < sort_time.length; i++) {
            sort_date_time[i] = new Date(sort_time[i]);
        }

        log.debug({
            title: 'sort_date_time=',
            details: sort_date_time
        })
        log.debug({
            title: 'ssort_time',
            details: sort_time
        })

        var flag = "not";

        // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'time_set_num[0]=' + time_set_num[0]);
        var start_point = new Date(labor_start_date_time).getTime();
        for (var j = 0; j < (sort_date_time.length) - 1; j++) {



            if (start_point == sort_time[j] && flag == "not") {
                flag = "start";
            }
            log.emergency({
                title: 'flag',
                details: flag
            })
            // flag = "start";

            if (sort_time[j + 1] != sort_time[j] && flag == "start") {

                diff = (sort_time[j + 1] - sort_time[j]);

                setup_flag = setup_start_check(sort_time[j], emp);

                if (setup_flag == "T") {
                    //  diff = 0;
                }

                no_wo = get_no_wo(sort_date_time[j], sort_date_time[j + 1], emp);
                // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'sort_date_time[j]=' + sort_date_time[j] + 'sort_date_time[j+1]=' + sort_date_time[j + 1]);
                // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'no_wo=' + no_wo);

                log.audit({
                    title: 'no_wo',
                    details: no_wo + ' diff =' + diff
                })
                if (no_wo == 0)
                    no_wo = 1;


                hr = hr + (diff / no_wo);

                //nlapiLogExecution('DEBUG','Shrabanti-Log','hr='+hr);
            }
        }
        // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'time_set_num=' + time_set_num);
        return { hr: hr, no_wo: no_wo };
    }

    function sort(time_set_num) {
        var time = new Array();
        time = time_set_num;
        var j = 0;
        var a;

        for (i = 0; i <= time.length; i++) {

            for (j = i + 1; j <= time.length; j++) {

                if (time[i] > time[j]) {

                    a = time[i];
                    time[i] = time[j];
                    time[j] = a;

                }

            }
        }

        return time;
    }

    function get_time_set(labor_start_date_time, labor_end_date_time, emp) {
        // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'start=' + labor_start_date_time);
        // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'end=' + labor_end_date_time);
        log.debug({
            title: 'labor_start_date_time =' + labor_start_date_time,
            details: 'labor_end_date_time =' + labor_end_date_time + ' emp =' + emp
        })
        var set_index = 0;
        var time_set = new Array();
        var start = gettime(labor_start_date_time, "S");
        var end = gettime(labor_end_date_time, "E");
        var user = emp;

        var customrecord_pct_pmc_tranSearchObj = search.create({
            type: "customrecord_pct_pmc_tran",
            filters:
                [
                    ["custrecord_pct_pmc_res_start_date_wos", "notonorafter", end],
                    "AND",
                    [["custrecord_pct_pmc_res_end_date_wos", "notonorbefore", start], "OR", ["custrecord_pct_pmc_res_end_date_wos", "isempty", ""]],
                    "AND",
                    ["custrecord_pct_pmc_wo", "noneof", "@NONE@"],
                    "AND",
                    ["custrecord_pct_pmc_emp", "anyof", user],
                    // "AND",
                    // ["custrecord_pct_pmc_tran_created_from", "anyof", 1]

                    //     ["custrecord_pct_pmc_res_start_date", "onorbefore", timestamp(runningWorkOrderObj.endTime)],
                    //     "AND",
                    //     [["custrecord_pct_pmc_res_end_date", "onorafter", timestamp(runningWorkOrderObj.startTime)],"OR",["custrecord_pct_pmc_res_end_date","isempty",""]], 
                    //     "AND", 
                    //     ["custrecord_pct_pmc_emp","anyof",runningWorkOrderObj.employee], 
                    //     "AND", 
                    //     ["custrecord_pct_pmc_wo","noneof","@NONE@"]
                ],
            columns:
                [

                    search.createColumn({ name: "custrecord_pct_pmc_res_start_date_wos", label: "start date" }),
                    search.createColumn({ name: "custrecord_pct_pmc_res_end_date_wos", label: "end date" }),

                ]
        });
        var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
        log.debug("customrecord_pct_pmc_tranSearchObj result count", searchResultCount);
        customrecord_pct_pmc_tranSearchObj.run().each(function (result) {
            if (result.getValue("custrecord_pct_pmc_res_start_date_wos") != null && result.getValue("custrecord_pct_pmc_res_start_date_wos") != "") {
                time_set[set_index] = result.getValue("custrecord_pct_pmc_res_start_date_wos");
                set_index++;
            }
            if (result.getValue("custrecord_pct_pmc_res_end_date_wos") != null && result.getValue("custrecord_pct_pmc_res_end_date_wos") != "") {
                time_set[set_index] = result.getValue("custrecord_pct_pmc_res_end_date_wos");
                set_index++;
            }
            return true;
        });
        return time_set
        // var customrecord_pct_mott_pmc_transactionSearch = nlapiSearchRecord("customrecord_pct_mott_pmc_transaction", null,
        //     [

        //         [["custrecord_pct_mott_labor_end_date_time", "notbefore", start], "OR", ["custrecord_pct_mott_labor_end_date_time", "isempty", ""]],
        //         "AND",
        //         ["custrecord_pct_mott_labor_date_time", "notonorafter", end],
        //         "AND",
        //         ["custrecord_pct_mott_emp", "anyof", user],
        //         "AND",
        //         ["custrecord_pct_mott_work_order", "noneof", "@NONE@"]
        //     ],
        //     [
        //         new nlobjSearchColumn("name"),
        //         new nlobjSearchColumn("id"),
        //         new nlobjSearchColumn("custrecord_pct_mott_work_order").setSort(false),
        //         new nlobjSearchColumn("custrecord_pct_mott_op_seq"),
        //         new nlobjSearchColumn("custrecord_pct_mott_op_name"),
        //         new nlobjSearchColumn("custrecord_pct_mott_labor_date_time"),
        //         new nlobjSearchColumn("custrecord_pct_mott_labor_end_date_time"),
        //     ]
        // );
        // var set_index = 0;
        // if (customrecord_pct_mott_pmc_transactionSearch != null) {
        //     //nlapiLogExecution('DEBUG','Shrabanti-Log','length='+customrecord_pct_mott_pmc_transactionSearch.length);
        //     for (var i = 0; i < customrecord_pct_mott_pmc_transactionSearch.length; i++) {
        //         if (customrecord_pct_mott_pmc_transactionSearch[i].getValue("custrecord_pct_mott_labor_date_time") != null && customrecord_pct_mott_pmc_transactionSearch[i].getValue("custrecord_pct_mott_labor_date_time") != "") {
        //             time_set[set_index] = customrecord_pct_mott_pmc_transactionSearch[i].getValue("custrecord_pct_mott_labor_date_time");
        //             set_index++;
        //         }
        //         if (customrecord_pct_mott_pmc_transactionSearch[i].getValue("custrecord_pct_mott_labor_end_date_time") != null && customrecord_pct_mott_pmc_transactionSearch[i].getValue("custrecord_pct_mott_labor_end_date_time") != "") {
        //             time_set[set_index] = customrecord_pct_mott_pmc_transactionSearch[i].getValue("custrecord_pct_mott_labor_end_date_time");
        //             set_index++;
        //         }

        //     }


        //     return time_set;
        // }
        // else
        //     return time_set;
    }
    function setup_start_check(start_date_time, emp) {
        var tmp_time = start_date_time + 60000;
        var final_start_time = new Date(tmp_time);

        var start_setup = gettime(final_start_time, "S");
        var end_setup = gettime(new Date(start_date_time), "E");
        var user = emp;

        // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'Setup start=' + start_setup);

        var customrecord_pct_pmc_tranSearchObj = search.create({
            type: "customrecord_pct_pmc_tran",
            filters:
                [
                    ["name", "is", "Setup"],
                    "AND",
                    ["custrecord_pct_pmc_res_start_date_wos", "notonorafter", start_setup],
                    "AND",// 23/05/2024
                    [["custrecord_pct_pmc_res_end_date_wos", "notbefore", end_setup], "OR", ["custrecord_pct_pmc_res_end_date_wos", "isempty", ""]],
                    "AND",
                    ["custrecord_pct_pmc_wo", "noneof", "@NONE@"],
                    "AND",
                    ["custrecord_pct_pmc_emp", "anyof", user],
                    // "AND",
                    // ["custrecord_pct_pmc_tran_created_from", "anyof", 1]

                    //     ["custrecord_pct_pmc_res_start_date", "onorbefore", timestamp(runningWorkOrderObj.endTime)],
                    //     "AND",
                    //     [["custrecord_pct_pmc_res_end_date", "onorafter", timestamp(runningWorkOrderObj.startTime)],"OR",["custrecord_pct_pmc_res_end_date","isempty",""]], 
                    //     "AND", 
                    //     ["custrecord_pct_pmc_emp","anyof",runningWorkOrderObj.employee], 
                    //     "AND", 
                    //     ["custrecord_pct_pmc_wo","noneof","@NONE@"]
                ],
            columns:
                [

                    search.createColumn({ name: "custrecord_pct_pmc_res_start_date_wos", label: "start date" }),
                    search.createColumn({ name: "custrecord_pct_pmc_res_end_date_wos", label: "end date" }),

                ]
        });
        var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            return "T";
        } else {
            //nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'Setup = F');
            return "F";
        }

        // var customrecord_pct_mott_pmc_transactionSearch_setup = nlapiSearchRecord("customrecord_pct_mott_pmc_transaction", null,
        //     [
        //         ["name", "is", "Setup"],
        //         "AND",
        //         [["custrecord_pct_mott_labor_end_date_time", "notonorbefore", end_setup], "OR", ["custrecord_pct_mott_labor_end_date_time", "isempty", ""]],
        //         "AND",
        //         ["custrecord_pct_mott_labor_date_time", "notonorafter", start_setup],
        //         "AND",
        //         ["custrecord_pct_mott_emp", "anyof", user],
        //         "AND",
        //         ["custrecord_pct_mott_work_order", "noneof", "@NONE@"]
        //     ],
        //     [
        //         new nlobjSearchColumn("name"),
        //         new nlobjSearchColumn("id"),
        //         new nlobjSearchColumn("custrecord_pct_mott_work_order").setSort(false),
        //     ]
        // );

        // if (customrecord_pct_mott_pmc_transactionSearch_setup != null) {
        //     nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'Setup = T');
        //     return "T";
        // }
        // else {
        //     nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'Setup = F');
        //     return "F";
        // }



    }

    function get_no_wo(labor_start_date_time, labor_end_date_time, emp) {
        // nlapiLogExecution('DEBUG','Shrabanti-Log','start='+labor_start_date_time);
        //  nlapiLogExecution('DEBUG','Shrabanti-Log','end='+labor_end_date_time);
        //  
        var tmp_time = (new Date(labor_start_date_time).getTime())// + 60000;
        var final_start_time = new Date(tmp_time);

        var start = gettime(final_start_time, "S");
        var end = gettime(labor_end_date_time, "E");
        var user = emp;


        log.debug({
            title: 'start =' + start,
            details: 'end =' + end
        })
        var customrecord_pct_pmc_tranSearchObj = search.create({
            type: "customrecord_pct_pmc_tran",
            filters:
                [
                    ["custrecord_pct_pmc_res_start_date_wos", "notonorafter", end],
                    "AND",
                    [["custrecord_pct_pmc_res_end_date_wos", "notonorbefore", start], "OR", ["custrecord_pct_pmc_res_end_date_wos", "isempty", ""]],
                    "AND",
                    // ["custrecord_pct_pmc_res_start_date_wos", "notonorafter", end],
                    // "AND",//
                    // [["custrecord_pct_pmc_res_end_date_wos", "notbefore", start], "OR", ["custrecord_pct_pmc_res_end_date_wos", "isempty", ""]],
                    // "AND",
                    ["custrecord_pct_pmc_wo", "noneof", "@NONE@"],
                    "AND",
                    ["custrecord_pct_pmc_emp", "anyof", user],
                    // "AND",
                    // ["custrecord_pct_pmc_tran_created_from", "anyof", 1]

                    //     ["custrecord_pct_pmc_res_start_date", "onorbefore", timestamp(runningWorkOrderObj.endTime)],
                    //     "AND",
                    //     [["custrecord_pct_pmc_res_end_date", "onorafter", timestamp(runningWorkOrderObj.startTime)],"OR",["custrecord_pct_pmc_res_end_date","isempty",""]], 
                    //     "AND", 
                    //     ["custrecord_pct_pmc_emp","anyof",runningWorkOrderObj.employee], 
                    //     "AND", 
                    //     ["custrecord_pct_pmc_wo","noneof","@NONE@"]
                ],
            columns:
                [

                    search.createColumn({ name: "custrecord_pct_pmc_res_start_date_wos", label: "start date" }),
                    search.createColumn({ name: "custrecord_pct_pmc_res_end_date_wos", label: "end date" }),

                ]
        });
        var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
        return searchResultCount


        // nlapiLogExecution('DEBUG', 'Shrabanti-Log', 'start=' + start + ',end=' + end);
        //nlapiLogExecution('DEBUG','Shrabanti-Log','end='+end);
        //nlapiLogExecution('DEBUG','Shrabanti-Log','User name='+user);

        // var customrecord_pct_mott_pmc_transactionSearch = nlapiSearchRecord("customrecord_pct_mott_pmc_transaction", null,
        //     [

        //         [["custrecord_pct_mott_labor_end_date_time", "notbefore", start], "OR", ["custrecord_pct_mott_labor_end_date_time", "isempty", ""]],
        //         "AND",
        //         ["custrecord_pct_mott_labor_date_time", "notonorafter", end],
        //         "AND",
        //         ["custrecord_pct_mott_emp", "anyof", user],
        //         "AND",
        //         ["custrecord_pct_mott_work_order", "noneof", "@NONE@"]
        //     ],
        //     [
        //         new nlobjSearchColumn("name"),
        //         new nlobjSearchColumn("id"),
        //         new nlobjSearchColumn("custrecord_pct_mott_work_order").setSort(false),
        //     ]
        // );

        // if (customrecord_pct_mott_pmc_transactionSearch != null) {
        //     // nlapiLogExecution('DEBUG','Shrabanti-Log','length='+customrecord_pct_mott_pmc_transactionSearch.length);
        //     return customrecord_pct_mott_pmc_transactionSearch.length;
        // }
        // else
        //     return 0;
    }


    function gettime(time, flag) {

        var currentdate = new Date(time);
        var setup_hours = currentdate.getHours();
        var setup_minutes = currentdate.getMinutes();
        var sec = currentdate.getSeconds();
        var setup_ampm = setup_hours >= 12 ? 'pm' : 'am';
        setup_hours = setup_hours % 12;
        setup_hours = setup_hours ? setup_hours : 12; // the hour '0' should be '12'
        setup_minutes = setup_minutes < 10 ? '0' + setup_minutes : setup_minutes;
        var current_setup_seconds = "00";
        var setup_strTime = (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + "/"
            + currentdate.getFullYear() + " " + setup_hours + ':' + setup_minutes + ' ' + setup_ampm;
        return setup_strTime;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    const getProductionEndTimeWithOutSec = (productionEndTime) => {
        let timeArray = productionEndTime.split(':')

        let ampm = timeArray[2].split(' ')
        return newDate = timeArray[0] + ':' + timeArray[1] + ' ' + ampm[1]
    }

    return {
        post: _post
    }
});