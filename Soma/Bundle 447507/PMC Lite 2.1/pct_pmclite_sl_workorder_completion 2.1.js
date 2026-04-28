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
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/url', 'N/record', 'N/format', 'N/error'],
    function (file, render, search, log, redirect, url, record, format, error) {
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
                    log.debug("PCT", "Parameters : " + JSON.stringify(_request.parameters))
                    var userName = _request.parameters.custparam_userName;
                    var userId = _request.parameters.custparam_userId;
                    var loginRecordId = _request.parameters.custparam_loginRecordId;
                    var startRecordId = _request.parameters.custparam_startRecordId;
                    var ticketNumber = _request.parameters.custparam_ticketNumber;
                    var operationName = _request.parameters.custparam_operationName;
                    var requestedQtyToComplete = _request.parameters.custparam_quantityToComplete;
                    var scrapQuantity = _request.parameters.custparam_scrap_quantity;
                    var quantityRework = _request.parameters.custparam_quantity_rework;
                    var custparam_build = _request.parameters.custparam_build;
                    var operationInternalId = _request.parameters.custparam_opInternalId;
                    var sequenceId = _request.parameters.custparam_sequence;
                    var workCenter = _request.parameters.custparam_workCenter;
                    var workCenterName = _request.parameters.custparam_workCenterName;
                    var now = new Date();
                    log.debug("PCT_GET", "Work Center name : " + workCenterName)
                    // log.debug({
                    //     title: 'scrapQuantity',
                    //     details: scrapQuantity
                    // })


                    // Spliting Manufacturing operation task's internal id
                    // var operationInternalId = SplitInternalId(ticketNumber);

                    var checkStatus = GetManufacturingOperationDetails(operationInternalId);
                    if (checkStatus != 'COMPLETE') {

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

                        machineRunTime = calSumofAction(userId, operationInternalId, now);
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
                            fieldId: "custbody_quantityrework",
                            value: quantityRework,
                            //ignoreFieldChange: true
                        }).setValue({
                            fieldId: "custbody_pct_soma_traveler_tckt_no",
                            value: ticketNumber,
                            //ignoreFieldChange: true
                        });

                        //counting the particular line to set the value
                        var matchRow;
                        // var operationSequence = ticketNumber.split('/')[0];
                        var operationSequence = sequenceId;
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
                        if (IsLastOperation(wordorderId)) {
                            // if (1 && requestedQtyToComplete > 0) {
                            if (IsInventoryItem(itemId) && requestedQtyToComplete > 0) {
                                //  log.debug("PCT-Soma", "Completion Id : " + transformRecordObject.getValue('tranid'))
                                let completionId = transformRecordObject.getValue('tranid');
                                for (let completionIndex = 1; completionIndex <= requestedQtyToComplete; completionIndex++) {
                                    var subRecordObject = transformRecordObject.getSubrecord({
                                        fieldId: 'inventorydetail'
                                    });
                                    log.debug("Team Innovation | PMC Lite 2.1", "subRecordObject = " + subRecordObject);
                                    subRecordObject.selectNewLine({
                                        sublistId: 'inventoryassignment',
                                    });
                                    // log.debug("PCT", "---- : " + subRecordObject.getCurrentSublistValue({
                                    //     sublistId: 'inventoryassignment',
                                    //     fieldId: 'binnumber',
                                    // }))
                                    subRecordObject.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'receiptinventorynumber',
                                        value: completionId + "-" + completionIndex,//FormateDate("12/11/2019"),
                                    });
                                    subRecordObject.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: 1,
                                        //ignoreFieldChange: true,
                                        //forceSyncSourcing: true
                                    });
                                    subRecordObject.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'inventorystatus',
                                        value: 5,
                                        //ignoreFieldChange: true,
                                        //forceSyncSourcing: true
                                    });
                                    subRecordObject.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });
                                }
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
                        log.debug("Team Innovation | PMC Lite 2.1", "transformRecordObject = " + transformRecordId);


                        var response = IsStartRecordAlreadyCreated(operationInternalId, userId);
                        log.debug("Team Innovation | PMC Lite 2.1", "recordId = " + response);
                        if (response.isSuccess) {
                            var id = response.recordId;

                            UpdateTransactionRecord(id, "Bundle Complete", requestedQtyToComplete, transformRecordId, operationName, scrapQuantity, quantityRework, now);

                        } else {
                            UpdateTransactionRecord(startRecordId, "Bundle Complete", requestedQtyToComplete, transformRecordId, operationName, scrapQuantity, quantityRework, now);

                        }


                    }



                    // PCT PMC Lite SL Home Page 's Script Id and deploy id
                    log.debug("PCT", "Work Center : " + workCenter)
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_pmclite_sl_home_pg',
                        deploymentId: 'customdeploy_pct_pmclite_sl_home_pg',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': userName,
                            'custparam_userId': userId,
                            'custparam_loginRecordId': loginRecordId,
                            'custparam_workCenter': workCenter,
                            'custparam_workCenterName': workCenterName,
                            'custparam_status': checkStatus
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

        //savedsearch to get the status of an operation
        function GetManufacturingOperationDetails(internalId) {
            log.debug("PCT GetManufacturingOperationDetails", internalId)
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
                        search.createColumn({ name: "status", label: "Status" })
                    ]
            });
            var status;
            var searchResultCount = mfgOpTaskSearchObj.runPaged().count;

            mfgOpTaskSearchObj.run().each(function (result) {
                status = result.getValue({ name: 'status' });
            });
            return status;
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
            var searchObject = search.create({
                type: "manufacturingoperationtask",
                filters: [["status", "anyof", "PROGRESS", "NOTSTART"], "AND", ["workorder", "anyof", wordorderId]],
                columns: [search.createColumn("internalid")]
            });
            var searchResultCount = searchObject.runPaged().count;
            log.debug("Team Innovation | PMC Lite 2.1", "Is Last Operation searchResultCount = " + searchResultCount);
            if (searchResultCount == 1)
                return true;
            return false;
        }


        //to update the record
        function UpdateTransactionRecord(recordId, actionType, quantity, transactionId, operationName, scrapQuantity, quantityRework, now) {
            // var now = new Date();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);


            log.debug({
                title: 'recordId in UpdateTransactionRecord',
                details: recordId + ' transactionId =' + transactionId
            })
            var customRecord = record.load({
                type: 'customrecord_pct_pmc_tran_k_fab',
                id: recordId,
                isDynamic: true
            }).setValue({
                fieldId: "custrecord_pct_kfab_op_status",
                value: 4,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_kfab_res_end_date',
                value: now,//formatedTime,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_kfab_prod_qty',
                value: quantity,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_pmc_completion_number',
                value: transactionId,
                ignoreFieldChange: true
            })/*.setValue({
          fieldId: 'custrecord_pct_kfab_op_name',
          value: operationName,
          ignoreFieldChange: true
      }).setValue({
          fieldId: 'custrecord_pct_kfab_p_seq',
          value: '',
          ignoreFieldChange: true
      })*/.setValue({
                fieldId: 'custrecord_pct_pmclite_trans_scrap_qty',
                value: scrapQuantity,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_kfab_prod_qty_rework',
                value: quantityRework,
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            var completionId = record.submitFields({
                type: record.Type.WORK_ORDER_COMPLETION,
                id: transactionId,
                values: {
                    'custbody_pct_bq_pmc_tran_link': recordId
                }
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
                type: "customrecord_pct_pmc_tran_k_fab",
                filters:
                    [
                        ["name", "is", "Production"],
                        "AND",
                        ["custrecord_pct_kfab_emp", "anyof", userId],
                        "AND",
                        ["custrecord_pct_kfab_op_task_id", "is", mfgOperationTaskInternalId],
                        "AND",
                        ["custrecord_pct_kfab_res_end_date", "isempty", ""]
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
            log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
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

        function CreateInventoryDetails(receiptInventoryNumber, quantity) {

            var subRecordObject = transformRecordObject.getSubrecord({
                fieldId: 'inventorydetail'
            });
            subRecordObject.selectNewLine({
                sublistId: 'inventoryassignment',
            });
            subRecordObject.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'receiptinventorynumber',
                value: receiptInventoryNumber,
            });
            subRecordObject.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                value: quantity,
            });
            subRecordObject.commitLine({
                sublistId: 'inventoryassignment'
            });

        }

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
            var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
                type: "customrecord_pct_pmc_tran_k_fab",
                filters:
                    [
                        ["custrecord_pct_kfab_emp", "anyof", userId],
                        "AND",
                        ["custrecord_pct_kfab_op_task_id", "is", operationId],
                        "AND",
                        ["custrecord_pct_kfab_res_end_date", "isempty", ""],

                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_kfab_res_start_date", label: "RESULT START DATE TIME" }),
                        search.createColumn({ name: "internalid", label: "Internalid" }),
                        search.createColumn({ name: "custrecord_pct_kfab_res_end_date", label: "RESULT END DATE TIME" }),
                        search.createColumn({ name: "custrecord_pct_pmc_dwn_duration", label: "DOWNTIME TOTAL DURATION" })

                    ]
            });
            var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
            var check = 0;
            customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
                var internalid = result.getValue('internalid')

                var customRecord = record.load({
                    type: 'customrecord_pct_pmc_tran_k_fab',
                    id: internalid,
                    isDynamic: true
                });

                var startActionTime = customRecord.getValue('custrecord_pct_kfab_res_start_date');

                // var startActionTime = result.getValue('custrecord_pct_kfab_res_start_date');
                var endActionTime = result.getValue('custrecord_pct_kfab_res_end_date');
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
            return Math.abs(diff)
            //  return Math.abs(Math.round(diff));

        }



        return {
            onRequest: onRequest
        }
    });
