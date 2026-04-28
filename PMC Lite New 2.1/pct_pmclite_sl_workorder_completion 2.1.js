/**
 *              //////////     PMC Lite 2.1 | WORK ORDER COMPLETION SUITELET     //////////
 * 
 *@author       Rajesh Nandi
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-03-28 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC Lite, you can redistribute it and/or modify it uder the
                terms of PCT General Public License (PCT GPL) as published by the Paapri's TEAM INNOVATION.
                
 *@description  This Suitelet is used to create work order completion record as well as 
 *                  the PMC Lite Transation record.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/url', 'N/record', 'N/format', 'N/error', 'N/runtime'],
    function (file, render, search, log, redirect, url, record, format, error, runtime) {
        /**
         * 
         * @param {Object} context 
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
         */
        var _request;
        var _response;
        function onRequest(context) {
            // Pre data source
            _request = context.request;
            _response = context.response;
            if (_request.method == 'GET') {
                try {

                    // Getting Params [GET REQUEST]
                    var userName = _request.parameters.custparam_userName;
                    var userId = _request.parameters.custparam_userId;
                    var loginRecordId = _request.parameters.custparam_loginRecordId;
                    var startRecordId = _request.parameters.custparam_startRecordId;
                    var ticketNumber = _request.parameters.custparam_ticketNumber;
                    var operationName = _request.parameters.custparam_operationName;
                    var requestedQtyToComplete = _request.parameters.custparam_quantityToComplete;
                    var scrapQuantity = _request.parameters.custparam_scrap_quantity;
                    var operationNotes = _request.parameters.custparam_operationNotes;
                    var quantityRework = _request.parameters.custparam_quantity_rework;
                    var custparam_build = _request.parameters.custparam_build;
                    var finishHour = parseInt(_request.parameters.custparam_finishHour);
                    var finishMin = parseInt(_request.parameters.custparam_finishMin);
                    var finishSecond = _request.parameters.custparam_finishSec;
                    log.debug("PCT-finishHour", finishHour)
                    log.debug("PCT-finishMin", finishMin)
                    log.debug("PCT-finishSecond", finishSecond)
                    let duration = (finishHour * 60) + finishMin
                    var now = new Date();
                    var operationInternalId = SplitInternalId(ticketNumber);
                    log.debug("PCT-duration", duration)
                    var response = IsStartRecordAlreadyCreated(operationInternalId, userId);
                    let dataObject = getTotalDurationObj(response.recordId, now)
                    var totalDuration = parseFloat(duration)//dataObject.labor_differenceInMinutes
                    var operationText = dataObject.operationText
                    //{labor_differenceInMinutes:labor_differenceInMinutes , operationText:operationText}
                    // Spliting Manufacturing operation task's internal id


                    var getMFGTaskDetail = GetManufacturingOperationDetails(operationInternalId);
                    if (getMFGTaskDetail.status != 'COMPLETE') {

                        // Loading MFG operation tas to get the work order internal id
                        var manufacturingoperationtaskRecord = record.load({
                            type: 'manufacturingoperationtask',
                            id: operationInternalId,
                            isDynamic: true
                        });

                        var wordorderId = manufacturingoperationtaskRecord.getValue("workorder");
                        log.debug("Team Innovation | PMC Lite 2.1", "wordorder Internal Id = " + wordorderId);

                        var woObject = search.lookupFields({
                            type: search.Type.WORK_ORDER,
                            id: wordorderId,
                            columns: ['tranid', 'item']
                        });
                        var tranid = woObject.tranid;
                        var itemId = woObject.item[0].value

                        log.debug({
                            title: "Team Innovation | PMC Lite 2.1",
                            details: itemId + "  " + tranid
                        })

                        var completedQty = search.lookupFields({
                            type: search.Type.WORK_ORDER,
                            id: wordorderId,
                            columns: 'quantity'
                        }).quantity;

                        log.debug("Team Innovation | PMC Lite 2.1", "completedQty = " + completedQty);
                        var machineRunTime;

                        machineRunTime = totalDuration//calSumofAction(userId, operationInternalId, now);
                        log.debug({
                            title: 'machineRunTime',
                            details: machineRunTime
                        })

                        //set values to WO Completion page
                        var transformRecordObject = record.transform({
                            fromType: record.Type.WORK_ORDER,
                            fromId: wordorderId,
                            toType: record.Type.WORK_ORDER_COMPLETION,
                            isDynamic: true,
                        }).setValue({
                            fieldId: "startoperation",
                            value: operationInternalId,
                            //ignoreFieldChange: true
                        }).setValue({
                            fieldId: "custbody_pct_pmc_transaction_table",
                            value: response.recordId,
                            //ignoreFieldChange: true
                        }).setValue({
                            fieldId: "endoperation",
                            value: operationInternalId,
                            //ignoreFieldChange: true
                        }).setValue({
                            fieldId: "completedquantity",
                            value: requestedQtyToComplete,
                            //ignoreFieldChange: true
                        }).setValue({
                            fieldId: "memo",
                            value: operationNotes,
                            //ignoreFieldChange: true
                        }).setValue({
                            fieldId: "scrapquantity",
                            value: scrapQuantity,
                            //ignoreFieldChange: true
                        })/*.setValue({
                            fieldId: "custbody_quantityrework",
                            value: quantityRework,
                            //ignoreFieldChange: true
                        });*/

                        //counting the particular line to set the value
                        var matchRow;
                        var operationSequence = ticketNumber.split('/')[0];
                        var itemCount = transformRecordObject.getLineCount({ "sublistId": "operation" });
                        for (var line = 0; line < itemCount; line++) {
                            var os = transformRecordObject.getSublistValue({
                                sublistId: 'operation',
                                fieldId: 'operationsequence',
                                line: line
                            });
                            log.debug({
                                title: 'os',
                                details: os
                            })

                            if (os == operationSequence) {
                                matchRow = line;
                            }
                        }

                        log.debug({
                            title: 'matchRow',
                            details: matchRow
                        })
                        var details = transformRecordObject.selectLine({
                            sublistId: 'operation',
                            line: matchRow
                        });

                        //set the value to machineruntime and laborruntime 
                        transformRecordObject.setCurrentSublistValue({
                            sublistId: 'operation',
                            fieldId: 'machineruntime',
                            value: machineRunTime,
                            line: matchRow
                        });

                        transformRecordObject.setCurrentSublistValue({
                            sublistId: 'operation',
                            fieldId: 'laborruntime',
                            value: machineRunTime,
                            line: matchRow
                        });








                        // If last operation add inventory details
                        // "You cannot create an inventory detail for this item" can be encountered 
                        // when the item in the sublist is not a serial/lot numbered item or does not 
                        // use bins or for the selected location the item doesn't have any inventory...
                        const workOrderDetailsObj = getWorkOrderDetails(wordorderId);
                        let lastOperation = operationText === workOrderDetailsObj.data.lastOperationSeq ? true : false;
                        if (lastOperation) {

                            if (IsInventoryItem(itemId) && requestedQtyToComplete > 0) {
                                var subRecordObject = transformRecordObject.getSubrecord({
                                    fieldId: 'inventorydetail'
                                });
                                log.debug("Team Innovation | PMC Lite 2.1", "subRecordObject = " + subRecordObject);
                                subRecordObject.selectNewLine({
                                    sublistId: 'inventoryassignment',
                                });
                                subRecordObject.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'receiptinventorynumber',
                                    value: tranid,//FormateDate("12/11/2019"),
                                });
                                subRecordObject.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: requestedQtyToComplete,
                                    //ignoreFieldChange: true,
                                    //forceSyncSourcing: true
                                });
                                subRecordObject.commitLine({
                                    sublistId: 'inventoryassignment'
                                });
                            }

                            if ((completedQty - requestedQtyToComplete) >= 0 && custparam_build == 1) {

                                var otherId = record.submitFields({
                                    type: record.Type.WORK_ORDER,
                                    id: wordorderId,
                                    values: {
                                        'orderstatus': 'G'
                                    }
                                });
                                log.debug("Team Innovation | PMC Lite 2.1", "otherId = " + otherId);

                            }


                        }


                        transformRecordObject.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: false
                        });
                        var transformRecordId = transformRecordObject.id;
                        var workOrderCompletionDocumentNumber = search.lookupFields({
                            type: search.Type.WORK_ORDER_COMPLETION,
                            id: transformRecordId,
                            columns: 'tranid'
                        }).tranid

                        log.debug("Team Innovation | PMC Lite 2.1", "transformRecordObject = " + transformRecordId);



                        log.debug("Team Innovation | PMC Lite 2.1", "recordId = " + response);
                        if (response.isSuccess) {
                            var id = response.recordId;
                            UpdateTransactionRecord(id, "Bundle Complete", requestedQtyToComplete, transformRecordId, operationName, scrapQuantity, quantityRework, now, totalDuration);

                        } else {
                            UpdateTransactionRecord(startRecordId, "Bundle Complete", requestedQtyToComplete, transformRecordId, operationName, scrapQuantity, quantityRework, now, totalDuration);

                        }

                    }



                    // PCT PMC Lite SL Home Page 's Script Id and deploy id
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_pmclite_sl_home_pg',
                        deploymentId: 'customdeploy_pct_pmclite_sl_home_pg',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': userName,
                            'custparam_userId': userId,
                            'custparam_loginRecordId': loginRecordId,
                            'custparam_status': getMFGTaskDetail.status,
                            'custparam_completionId': workOrderCompletionDocumentNumber
                        }
                    });

                } catch (e) {

                    var errorObj = error.create({ name: 'Something Went Wrong', message: e.message });
                    throw errorObj.name + '\n\n' + errorObj.message;


                    return false;
                }

            }

            else {//POST

            }

        }

        /**
         * 
         */
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
        const getTotalDurationObj = (pmcTransactionId, now) => {
            const loadPmcTransaction = record.load({
                type: 'customrecord_pct_pmc_tran',
                id: pmcTransactionId,
                isDynamic: false
            })
            var downTimeDuration = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_dwn_duration',
            })
            let emp = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_emp'
            })
            let operationText = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_pmc_p_seq'
            }).toString();
            let labor_start_date_time = loadPmcTransaction.getText({
                fieldId: 'custrecord_pct_pmc_res_start_date_wos'
            })



            let productionEndTimeWOS = getProductionEndTimeWithOutSec(now)
            var labor_end_date_time = productionEndTimeWOS

            loadPmcTransaction.setText({
                fieldId: 'custrecord_pct_pmc_res_end_date_wos',
                text: productionEndTimeWOS
            }).save();






            var labor_hr_finalObj = get_labor_hr(labor_start_date_time, labor_end_date_time, emp);
            var labor_hr_final = labor_hr_finalObj.hr;
            var numberofRunningWo = labor_hr_finalObj.no_wo;
            var labor_differenceInMinutes = labor_hr_final / (1000 * 60);


            if (downTimeDuration == '' || downTimeDuration == null || downTimeDuration == undefined) {
                downTimeDuration = 0
            }
            labor_differenceInMinutes = parseFloat(labor_differenceInMinutes) - downTimeDuration

            if (labor_differenceInMinutes == null || labor_differenceInMinutes == '' || labor_differenceInMinutes < 0) {
                labor_differenceInMinutes = 0
            }


            log.emergency({
                title: 'labor_start_date_time =' + labor_start_date_time,
                details: 'labor_end_date_time =' + labor_end_date_time + ' emp =' + emp + ' labor_differenceInMinutes =' + labor_differenceInMinutes + ' labor_hr_final =' + labor_hr_final //+ ' actual ='+reminder
            })


            return { labor_differenceInMinutes: labor_differenceInMinutes, operationText: operationText }

            // workOrderCompletionObj['laborRuntimeOrLaborsetUptime'] = labor_differenceInMinutes//productionTime
        }
        //savedsearch to get the status of an operation
        function GetManufacturingOperationDetails(internalId) {
            var searchResults = new Object();
            var mfgOpTaskSearchObj = search.create({
                type: "manufacturingoperationtask",
                filters:
                    [
                        ["status", "anyof", "PROGRESS", "NOTSTART", "COMPLETE"],
                        "AND",
                        ["internalid", "anyof", internalId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "status", label: "Status" }),
                        // search.createColumn({ name: "title", label: "OPERATION NAME" })
                    ]
            });
            var status;
            var searchResultCount = mfgOpTaskSearchObj.runPaged().count;
            let optaskObj = { status: '', title: '' }
            mfgOpTaskSearchObj.run().each(function (result) {
                optaskObj.status = result.getValue({ name: 'status' });
                // optaskObj.title = result.getValue({ name: 'title' });
            });
            return optaskObj;
        }
        function TransformRecord() {

            var transformRecordObject = record.transform({
                fromType: record.Type.WORK_ORDER,
                fromId: wordorderId,
                toType: record.Type.WORK_ORDER_COMPLETION,
                isDynamic: true,
            }).setValue({
                fieldId: "startoperation",
                value: operationInternalId,
                //ignoreFieldChange: true
            }).setValue({
                fieldId: "endoperation",
                value: operationInternalId,
                //ignoreFieldChange: true
            }).setValue({
                fieldId: "completedquantity",
                value: requestedQtyToComplete,
                //ignoreFieldChange: true
            }).setValue({
                fieldId: "scrapquantity",
                value: scrapQuantity,
                //ignoreFieldChange: true
            }).setValue({
                fieldId: "memo",
                value: operationNotes,
                //ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

        }

        /**
         * This method is used to find the last operation 
         * @param {string} wordorderId 
         */
        function IsLastOperation(wordorderId) {
            var workorderSearchObj = search.create({
                type: "workorder",
                filters:
                    [
                        ["type", "anyof", "WorkOrd"],
                        "AND",
                        ["internalid", "anyof", wordorderId],
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
            // var searchObject = search.create({
            //     type: "manufacturingoperationtask",
            //     filters: [["status", "anyof", "PROGRESS", "NOTSTART"], "AND", ["workorder", "anyof", wordorderId]],
            //     columns: [search.createColumn("internalid")]
            // });
            // var searchResultCount = searchObject.runPaged().count;
            // log.debug("Team Innovation | PMC Lite 2.1", "Is Last Operation searchResultCount = " + searchResultCount);
            // if (searchResultCount == 1)
            //     return true;
            // return false;
        }


        //to update the record
        function UpdateTransactionRecord(recordId, actionType, quantity, transactionId, operationName, scrapQuantity, quantityRework, now, totalDuration) {
            // var now = new Date();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);


            log.debug({
                title: 'recordId in UpdateTransactionRecord',
                details: recordId + ' transactionId =' + transactionId
            })
            let productionEndTimeWOS = getProductionEndTimeWithOutSec(now)
            var customRecord = record.load({
                type: 'customrecord_pct_pmc_tran',
                id: recordId,
                isDynamic: true
            }).setValue({
                fieldId: "custrecord_pct_pmc_op_status",
                value: 4,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_pmc_res_end_date',
                value: now,//formatedTime,
                ignoreFieldChange: true
            }).setText({
                fieldId: 'custrecord_pct_pmc_res_end_date_wos',
                text: productionEndTimeWOS
            }).setValue({
                fieldId: 'custrecord_pct_pmc_prod_time_duration',
                value: totalDuration,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_prod_qty',
                value: quantity,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_pmc_completion_number',
                value: transactionId,
                ignoreFieldChange: true
            })/*.setValue({
             fieldId: 'custrecord_pct_pmc_op_name',
             value: operationName,
             ignoreFieldChange: true
         }).setValue({
             fieldId: 'custrecord_pct_pmc_p_seq',
             value: '',
             ignoreFieldChange: true
         })*/.setValue({
                fieldId: 'custrecord_pct_pmclite_trans_scrap_qty',
                value: scrapQuantity,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_pmc_prod_qty_rework',
                value: quantityRework,
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

        }

        /**
         * 
         * @param {string} mfgOperationTaskInternalId 
         */
        function IsStartRecordAlreadyCreated(mfgOperationTaskInternalId, userId) {

            log.debug({
                title: 'mfgOperationTaskInternalId =' + mfgOperationTaskInternalId,
                details: 'userId = ' + userId
            })
            var response = new Object();
            var searchObject = search.create({
                type: "customrecord_pct_pmc_tran",
                filters:
                    [
                        ["name", "is", "Production"],
                        "AND",
                        ["custrecord_pct_pmc_emp", "anyof", userId],
                        "AND",
                        ["custrecord_pct_pmc_op_task_id", "is", mfgOperationTaskInternalId],
                        "AND",
                        ["custrecord_pct_pmc_res_end_date", "isempty", ""]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.ASC,
                            label: "Internal ID"
                        })
                    ]
            });
            var searchResultCount = searchObject.runPaged().count;
            log.debug("customrecord_pct_pmc_tranSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                var searchResults = searchObject.run().getRange({
                    start: 0,
                    end: 1
                });
                response.recordId = searchResults[0].getValue({
                    name: "internalid", sort: search.Sort.DESC, label: "Internal ID"
                });
                response.isSuccess = true;
            } else {
                response.isSuccess = false;
            }

            return response;

        }

        // function CreateInventoryDetails(receiptInventoryNumber, quantity) {

        //     var subRecordObject = transformRecordObject.getSubrecord({
        //         fieldId: 'inventorydetail'
        //     });
        //     subRecordObject.selectNewLine({
        //         sublistId: 'inventoryassignment',
        //     });
        //     subRecordObject.setCurrentSublistValue({
        //         sublistId: 'inventoryassignment',
        //         fieldId: 'receiptinventorynumber',
        //         value: receiptInventoryNumber,
        //     });
        //     subRecordObject.setCurrentSublistValue({
        //         sublistId: 'inventoryassignment',
        //         fieldId: 'quantity',
        //         value: quantity,
        //     });
        //     subRecordObject.commitLine({
        //         sublistId: 'inventoryassignment'
        //     });

        // }

        function IsInventoryItem(itemId) {

            var itemSearchObj = search.create({
                type: "item",
                filters: [
                    [["internalidnumber", "equalto", itemId], "AND",
                    [["islotitem", "is", "T"], "OR",
                    ["isserialitem", "is", "T"]]]],
                columns: [search.createColumn({ name: "itemid", sort: search.Sort.ASC, label: "Name" })]
            });
            var searchResultCount = itemSearchObj.runPaged().count;
            log.debug("itemSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                return true;
            } else {
                return false;
            }
        }


        //calculate the total time for bundle completion excluding break time (also user specific)
        function calSumofAction(userId, operationId, now) {
            var totalTime = 0;

            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);

            log.debug({
                title: 'operationId',
                details: operationId
            })
            var customrecord_pct_pmc_tranSearchObj = search.create({
                type: "customrecord_pct_pmc_tran",
                filters:
                    [
                        ["custrecord_pct_pmc_emp", "anyof", userId],
                        "AND",
                        ["custrecord_pct_pmc_op_task_id", "is", operationId],
                        "AND",
                        ["custrecord_pct_pmc_res_end_date", "isempty", ""],

                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pmc_res_start_date", label: "RESULT START DATE TIME" }),
                        search.createColumn({ name: "internalid", label: "Internalid" }),
                        search.createColumn({ name: "custrecord_pct_pmc_res_end_date", label: "RESULT END DATE TIME" }),
                        search.createColumn({ name: "custrecord_pct_pmc_dwn_duration", label: "DOWNTIME TOTAL DURATION" })

                    ]
            });
            var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_tranSearchObj result count", searchResultCount);
            var check = 0;
            customrecord_pct_pmc_tranSearchObj.run().each(function (result) {
                var internalid = result.getValue('internalid')

                var customRecord = record.load({
                    type: 'customrecord_pct_pmc_tran',
                    id: internalid,
                    isDynamic: true
                });

                var startActionTime = customRecord.getValue('custrecord_pct_pmc_res_start_date');

                // var startActionTime = result.getValue('custrecord_pct_pmc_res_start_date');
                var endActionTime = result.getValue('custrecord_pct_pmc_res_end_date');
                var downTimeDuration = result.getValue('custrecord_pct_pmc_dwn_duration');

                if (isNaN(downTimeDuration) || downTimeDuration == '' || downTimeDuration == null) {
                    downTimeDuration = 0;
                }

                log.debug({
                    title: 'startActionTime =' + startActionTime,
                    details: 'downTimeDuration =' + downTimeDuration
                })

                var duration = diff_minutes(now, startActionTime);
                log.debug({
                    title: 'duration',
                    details: duration
                })
                totalTime = parseFloat(duration) - parseFloat(downTimeDuration);

                //break;

            });
            return totalTime;

        }


        /**
        * This method split the ticket number to operation's internal id
        * 
        * @param {string} ticketNumber - 10/1234
        */
        function SplitInternalId(ticketNumber) {
            if (ticketNumber.length == 0)
                return 0;
            else
                return ticketNumber.split('/')[1];
        }

        /**
        * This method is used to formate the date (string)
        * Note: In SuiteScript 2.1 you have to strickly follor the Date/Time formate
        * 
        * @param {string} value 
        */
        function FormateDate(value) {
            return format.parse({
                value: value,
                type: format.Type.DATE
            });
        }

        /**
         * This method is used to formate the time (string)
         * Note: In SuiteScript 2.1 you have to strickly follor the Date/Time formate
         * 
         * @param {string} value 
         */
        function FormateTime(value) {
            return format.parse({
                value: value,
                type: format.Type.DATETIME
            });
        }

        //converting the time to sec
        function getsec(timevalue) {
            var timearray = timevalue.split(':');
            var timeinsec = parseInt(timearray[0] * 60 * 60) + parseInt(timearray[1] * 60) + parseInt(timearray[2]);
            return timeinsec;
        }

        //calclate difference of startTime and endTime in minutes
        function diff_minutes(dt2, dt1) {

            log.debug({
                title: 'dt2 dtq',
                details: dt2 + '  dt2    =' + dt1
            })
            var diff = (dt2.getTime() - dt1.getTime()) / 1000;
            diff /= 60;
            return Math.abs(Math.round(diff));

        }
        const getProductionEndTimeWithOutSec = (date) => {
            // let timeArray = productionEndTime.split(':')

            // let ampm = timeArray[2].split(' ')
            // return newDate = timeArray[0] + ':' + timeArray[1] + ' ' + ampm[1]
            let dateTime = format.format({
                value: new Date(date),
                type: format.Type.DATETIME,
                timezone: runtime.getCurrentUser().getPreference({
                    name: 'timezone'
                })
            })
            let timeArray = dateTime.split(':')

            let ampm = timeArray[2].split(' ')
            return newDate = timeArray[0] + ':' + timeArray[1] + ' ' + ampm[1]
        }



        /////////////////////////////////////////////////////////////////SPLIT TIME START

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

                    log.audit({
                        title: 'no_wo',
                        details: no_wo + ' diff =' + diff
                    })
                    if (no_wo == 0)
                        no_wo = 1;


                    hr = hr + (diff / no_wo);

                }
            }
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

        }
        function setup_start_check(start_date_time, emp) {
            var tmp_time = start_date_time + 60000;
            var final_start_time = new Date(tmp_time);

            var start_setup = gettime(final_start_time, "S");
            var end_setup = gettime(new Date(start_date_time), "E");
            var user = emp;


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
                return "F";
            }



        }

        function get_no_wo(labor_start_date_time, labor_end_date_time, emp) {
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
                        ["custrecord_pct_pmc_wo", "noneof", "@NONE@"],
                        "AND",
                        ["custrecord_pct_pmc_emp", "anyof", user],
                    ],
                columns:
                    [

                        search.createColumn({ name: "custrecord_pct_pmc_res_start_date_wos", label: "start date" }),
                        search.createColumn({ name: "custrecord_pct_pmc_res_end_date_wos", label: "end date" }),

                    ]
            });
            var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
            return searchResultCount



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

        return {
            onRequest: onRequest
        }
    });
