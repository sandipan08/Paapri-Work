/**
 *              ///////////     PMC Lite 2.1 | BREAK PAGE SUITELET     ///////////
 * 
*@author       Rajesh Nandi
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-03-28 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC Lite, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used render Break Page HTML Template.
 */
 define(['N/file', 'N/render', 'N/url', 'N/record', 'N/format', 'N/redirect', 'N/search'],
    function (file, render, url, record, format, redirect, search) {
        /**
         * 
         * @param {Object} context 
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
         */
        function onRequest(context) {
            // Pre data source
            var request = context.request;
            var response = context.response;
   
            if (request.method == 'GET') {
                // This block is execute when you come from Home Page (onCLick = STOP Button).
                // Getting Params [GET REQUEST]
                var userName = request.parameters.custparam_userName;
                var userId = request.parameters.custparam_userId;
                var loginRecordId = request.parameters.custparam_loginRecordId;
                var selectedBreakOption = request.parameters.custparam_selectedBreakOption;
                var breakCategory = request.parameters.custparam_breakDescription;
                var notes = request.parameters.custparam_notes;
   log.debug({
    title: 'notes',
    details: notes
   })
                var mode = request.parameters.custparam_mode;
                var startRecordId = request.parameters.custparam_startRecordId;
                var ticketNumber = request.parameters.custparam_ticketNumber;
                var ticketNumberNew = request.parameters.custparam_ticketNumberNew;
                var faviconUrl = GetFaviconImgUrl();
   
   
                var operationId = ticketNumber.split('/')[1];
   
   
                var responseData = IsStartRecordAlreadyCreated(operationId, userId);
                log.debug("Team Innovation | PMC Lite 2.1", "recordId = " + responseData);
                if (responseData.isSuccess) {
                    var recordId = responseData.recordId;
                    UpdateTransactionRecord(recordId, userId, selectedBreakOption, breakCategory, operationId,ticketNumber,ticketNumberNew,notes);
   
                }
   
                // Creating PMC transaction (ActionType = Break) and store internal id of recently created record.
                // var recordId = CreateTransactionRecord(userId, selectedBreakOption, breakCategory,operationId);
   
   
   
                // Assemble Data Source for Home Page
                var dataSource = {
                    userName: userName,
                    userId: userId,
                    loginRecordId: loginRecordId,
                    selectedBreakOption: selectedBreakOption,
                    notes:notes,
                    breakRecordId: recordId,
                    mode: mode,
                    startRecordId: startRecordId,
                    ticketNumber: ticketNumber,
                    ticketNumberNew:ticketNumberNew,
                    faviconUrl: faviconUrl
                };
   
                // Load Login HTML Template
                var templateFile = file.load({ id: './PMC Lite Web Application/PMC Lite 2.1 Templates/pct_pmclite_break_page.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });
                var renderedPage = pageRenderer.renderAsString();
                response.write(renderedPage);
   
            } else { //POST
                // This block is execute when you click "Complete Break" button on break page
                // and after updating PMC Transaction record then redirect to Home Page.
                // Getting Params [POST REQUEST]
                var userName = request.parameters.custparam_userName;
                var userId = request.parameters.custparam_userId;
                var loginRecordId = request.parameters.custparam_loginRecordId;
                var breakRecordId = request.parameters.custparam_breakRecordId;
   
                var mode = request.parameters.custparam_mode;
                var startRecordId = request.parameters.custparam_startRecordId;
                var ticketNumber = request.parameters.custparam_ticketNumber;
                var ticketNumberNew = request.parameters.custparam_ticketNumberNew;
                var backFromBreak = request.parameters.custparam_backFromBreak;
   
                // Updating PMC Transaction Record after break is over.
                // UpdateTransactionRecord(breakRecordId);
                var operationId = ticketNumber.split('/')[1];
   
   
                var responseData = IsStartRecordAlreadyCreated(operationId, userId);
                log.debug("Team Innovation | PMC Lite 2.1", "recordId = " + responseData);
                if (responseData.isSuccess) {
                    var recordId = responseData.recordId;
                    UpdateTransactionRecord(recordId, userId, selectedBreakOption, breakCategory, operationId,ticketNumber,ticketNumberNew);
   
                }
   
                // Redirect to Home Page suitelet
                // PCT PMC Lite SL Home Page 's Script Id and deploy id
                redirect.toSuitelet({
                    scriptId: 'customscript_pct_pmclite_sl_home_pg',
                    deploymentId: 'customdeploy_pct_pmclite_sl_home_pg',
                    isExternal: true,
                    parameters: {
                        'custparam_userName': userName,
                        'custparam_userId': userId,
                        'custparam_loginRecordId': loginRecordId,
                        'custparam_mode': mode,
                        'custparam_startRecordId': startRecordId,
                        'custparam_ticketNumber': ticketNumber,
                        'custparam_ticketNumberNew': ticketNumberNew,
                        'custparam_backFromBreak': backFromBreak
                    }
                });
   
            }// POST END
   
   
        }
   
        //==================================================== Helper Methods =======================================//
   
   
        //to update the record
        function UpdateTransactionRecord(recordId, userId, selectedBreakOption, breakCategory, operationId,ticketNumber,ticketNumberNew,notes) {
            var now = new Date();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);
   
   
            log.debug({
                title: 'recordId in UpdateTransactionRecord',
                details: recordId
            })
            var customRecord = record.load({
                type: 'customrecord_pct_pmc_tran_k_fab',
                id: recordId,
                isDynamic: true
            });
   
            var downtimeStart = customRecord.getValue('custrecord_pct_pmc_dwn_start_time');
            var prevDownDuration = customRecord.getValue('custrecord_pct_pmc_dwn_duration');
            if (isNaN(prevDownDuration) || prevDownDuration == '' || prevDownDuration == null)
                prevDownDuration = 0;
   
            if (downtimeStart != null && downtimeStart != '') {
               
                log.debug({
                    title: 'downtimeStart have data',
                    details: downtimeStart
                })
                var diff_actionduration = diff_minutes(now, downtimeStart);
                var durationInMin = parseInt(prevDownDuration) + parseInt(diff_actionduration)
   
                log.debug({
                    title: 'diff_actionduration',
                    details: diff_actionduration + 'durationInMin =' + durationInMin
                })
                customRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_dwn_start_time',
                    value: '',
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_dwn_duration',
                    value: durationInMin,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custrecord_pct_kfab_op_status',
                    value: 3,
                    ignoreFieldChange: true
                })
   
                var downTimeLine = customRecord.getLineCount({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link'
                })
                customRecord.selectLine({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    line: downTimeLine - 1
                })
                customRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_duration',
                    value: diff_actionduration
                })
                customRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_end_time',
                    value: now
                })
   
                customRecord.commitLine({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link'
                })
            }else{
                log.debug({
                    title: 'downtimeStart have No data',
                    details: ''
                })
                customRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_dwn_start_time',
                    value: now,
                    ignoreFieldChange: true
                }).setText({
                    fieldId: 'custrecord_pct_pmc_downtime_reason',
                    text: selectedBreakOption,
                    ignoreFieldChange: true
                }).setText({
                    fieldId: 'custrecord_pct_pmc_downlime_category',
                    text: breakCategory,
                    ignoreFieldChange: true
                }).setText({
                   fieldId: 'custrecord_pct_kfab_op_status',
                   text: 'Downtime',
                   ignoreFieldChange: true
               }).setValue({
                    fieldId: 'custrecord_pct_kfab_op_status',
                    value: 2,
                    ignoreFieldChange: true
                })
   
                customRecord.selectNewLine({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link'
                })
                customRecord.setCurrentSublistText({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_cat',
                    text: breakCategory
                })
                customRecord.setCurrentSublistText({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_reason',
                    text: selectedBreakOption
                })
                customRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_notes',
                    value: notes,
                })
                customRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_start_time',
                    value: now
                })
   
                customRecord.commitLine({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link'
                })
           //
            }
            customRecord.save();
   
   
            //extra record create for Audit Log
            var operationInternalId = SplitInternalId(ticketNumber);
            var operationNumber = SplitOperationId(ticketNumber);
   
            var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId,operationNumber);
   
            /*var recordId = record.create({
                type: 'customrecord_pct_pmc_tran_k_fab',
                isDynamic: true,
            }).setValue({
                fieldId: "custrecord_pct_kfab_emp",
                value: userId,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_kfab_op_status",
                text: 'Downtime',
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_kfab_res_start_date",
                value: now,//formatedTime,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_downlime_category",
                text: breakCategory,//formatedTime,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_downtime_reason",
                text: selectedBreakOption,//formatedTime,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_kfab_op_task_id",
                value: operationInternalId,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmc_p_seq",
                value: operationNumber,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_wo",
                text: mfgOperationSearchObj.workorder,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmc_man_op_task",
                value: mfgOperationSearchObj.internalid,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_wo_center",
                text: mfgOperationSearchObj.manufacturingworkcenter,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "name",
                value: 'Downtime',
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });*///
            //custrecord_pct_pmc_downlime_category
   
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
                        ["custrecord_pct_kfab_res_end_date", "isempty", ""],
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
   log.debug({
    title: 'responseresponseresponseresponseresponse',
    details: JSON.stringify(response)
   })
            return response;
   
        }
   
        /**
         * This method is used craete the custom record i.e. PCT PMC Transaction Table.
         * 
         * @param {string} userId - Internal ID of Employee (Netsuite Employee)
         * @param {string} actionType - Login
         * @param {string} notes 
         */
        function CreateTransactionRecord(userId, actionType, notes, operationId) {
            var now = new Date();
            var createdDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
   
            var recordId = record.create({
                type: 'customrecord_pct_pmc_tran_k_fab',
                isDynamic: true,
            }).setValue({
                fieldId: "custrecord_pct_kfab_emp",
                value: userId,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_kfab_op_status",
                text: actionType,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmclite_trans_date",
                value: FormateDate(createdDate),
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_kfab_res_start_date",
                value: FormateDate(createdTime),
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmc_ref",
                value: notes,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_p_seq",
                text: operationId,
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });
   
            return recordId;
        }
   
   
        /**
         * This method return Manufacturing Operation Task Details
         * 
         * @param {string} internalId - operation's internal id
         */
         function GetManufacturingOperationDetails(internalId,sequence) {
            var searchResults = new Object();
            var mfgOpTaskSearchObj = search.create({
                type: "manufacturingoperationtask",
                filters:
                    [
                        ["status", "anyof", "PROGRESS", "NOTSTART", "COMPLETE"],
                        "AND",
                        ["internalid", "anyof", internalId],
                        "AND",
                        ["sequence","equalto",sequence], 
                    ],
                columns:
                    [//
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "name", label: "Operation Name" }),
                        search.createColumn({ name: "status", label: "Status" }),
                        search.createColumn({ name: "sequence", label: "Operation Sequence" }),
                        search.createColumn({ name: "workorder", label: "Work Order" }),
                        search.createColumn({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" }),
                        search.createColumn({ name: "item", join: "workOrder", label: "Item" }),
                        search.createColumn({ name: "quantity", join: "workOrder", label: "Quantity" }),
                        search.createColumn({ name: "completedquantity", label: "Completed Quantity" }),
                        search.createColumn({ name: "memo", join: "workOrder", label: "Memo" }),
                        search.createColumn({ name: "item", join: "workOrder", label: "Item" }),
                        search.createColumn({
                            name: "tranid",
                            join: "workOrder",
                            label: "Document Number"
                        })
                    ]
            });
            var searchResultCount = mfgOpTaskSearchObj.runPaged().count;
            if (searchResultCount > 0) {
                mfgOpTaskSearchObj.run().each(function (result) {
   
                    var wcLastOPNumber = IsLastOperationCheck(result.getValue({
                        name: "tranid",
                        join: "workOrder"
                    }));
   
                    var IslastOperation = 'hidden';
                    var lastOperation = 0;
   
   
                    if (result.getValue({ name: 'sequence' }) == wcLastOPNumber) {
                        IslastOperation = "";
                        lastOperation = 1;
                    }
   
                    // IsLastOperation(result.getValue({ name: 'workorder' }))
   
                    searchResults.internalid = result.getValue({ name: 'internalid' });
                    searchResults.name = result.getValue({ name: 'name' });
                    searchResults.status = result.getValue({ name: 'status' });
                    searchResults.sequence = result.getValue({ name: 'sequence' });
                    searchResults.workorder = result.getValue({ name: 'workorder' });
                    searchResults.item = result.getValue({ name: "item", join: "workOrder", label: "Item" });
                    searchResults.quantity = result.getValue({ name: "quantity", join: "workOrder", label: "Quantity" });
                    searchResults.completedQuantity = result.getValue({ name: 'completedquantity' });
                    searchResults.description = result.getValue({ name: "memo", join: "workOrder", label: "Memo" });
                    searchResults.assembly = result.getText({ name: "item", join: "workOrder", label: "Item" });
                    searchResults.ticket = result.getValue({ name: 'sequence' }) + "/" + result.getValue({ name: 'internalid' });
                    searchResults.manufacturingworkcenter = result.getText({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" });
                    searchResults.IsLastOperation = IslastOperation;
                    searchResults.lastOperation = lastOperation;
                    searchResults.isSuccess = true;
                    return true;
                });
            } else {
                searchResults.isSuccess = false;
            }
   
            log.debug({
                title: 'searchResults',
                details: JSON.stringify(searchResults)
            })
            return searchResults;
        }
   
   
        /**
          * This method is used to get the last operation sequence of work order
          */
         function IsLastOperationCheck(workorderId) {
   
            var workorderSearchObj = search.create({
                type: "workorder",
                filters:
                    [
                        ["type", "anyof", "WorkOrd"],
                        "AND",
                        ["manufacturingoperationtask.sequence", "isnotempty", ""],
                        "AND",
                        ["numbertext", "is", workorderId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "sequence",
                            join: "manufacturingOperationTask",
                            summary: "GROUP",
                            sort: search.Sort.DESC,
                            label: "Operation Sequence"
                        })
                    ]
            });
            var searchResultCount = workorderSearchObj.runPaged().count;
            // log.debug("workorderSearchObj result count", searchResultCount);
            // workorderSearchObj.run().each(function (result) {
            //     // .run().each has a limit of 4,000 results
            //     return true;
            // });
   
            var operationSeq;
            if (searchResultCount > 0) {
                result = workorderSearchObj.run().getRange({ start: 0, end: 1 });
   
                operationSeq = result[0].getValue({
                    name: "sequence",
                    join: "manufacturingOperationTask",
                    summary: "GROUP",
   
                });
   
            }
            return operationSeq;
        }
   
        /**
         * This method is used to update PMC Transcation Record
         *  
         * @param {string} recordId - internal id
         */
       /* function UpdateTransactionRecord(recordId) {
            var now = new Date();
            log.debug({
                title: 'date',
                details: now
            })
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            log.debug({
                title: 'createdTime',
                details: createdTime
            })
            var formatedTime = FormateTime(createdTime);
   
            var breakStartTime;
   
            var customRecord = record.load({
                type: 'customrecord_pct_pmc_tran_k_fab',
                id: recordId,
                isDynamic: true
            }).setValue({
                fieldId: 'custrecord_pct_kfab_res_end_date',
                value: formatedTime,
                ignoreFieldChange: true
            })
   
            var startDate = customRecord.getValue({
                fieldId: 'custrecord_pct_pmclite_trans_date'
            })
            var startActionTime = customRecord.getValue({
                fieldId: 'custrecord_pct_kfab_res_start_date'
            })
            var startTimeInsec = getsec(startActionTime);
   
            var finalstartTime = new Date(startDate.setSeconds(startTimeInsec));
   
            var endActionTime = now;
            log.debug({
                title: 'endActionTime',
                details: endActionTime
            })
            var diff_actionduration = diff_minutes(endActionTime, finalstartTime);
   
            log.debug({
                title: 'diff_actionduration',
                details: diff_actionduration
            })
            customRecord.setValue({
                fieldId: 'custrecord_pct_pmclite_trans_action_dura',
                value: diff_actionduration,
                ignoreFieldChange: true
            })
   
            customRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });
   
   
   
            // var calduration = actionDuration(breakStartTime,formatedTime);
            // log.debug({
            //     title: 'calduration',
            //     details: calduration
            // })
        }*/
   
        function getsec(timevalue) {
            var timearray = timevalue.split(':');
            var timeinsec = parseInt(timearray[0] * 60 * 60) + parseInt(timearray[1] * 60) + parseInt(timearray[2]);
            return timeinsec;
        }
        /**
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
         * 
         * @param {string} value 
         */
        function FormateTime(value) {
            return format.parse({
                value: value,
                type: format.Type.DATETIME
            });
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
   
        function SplitOperationId(ticketNumber) {
            if(ticketNumber != null || ticketNumber != '')
            if (ticketNumber.length == 0)
                return 0;
            else
                return ticketNumber.split('/')[0];
        }
   
        /**
        * This method is used to get the paapri favicon url
        */
        function GetFaviconImgUrl() {
            var fileObj = file.load({
                id: './PMC Lite Web Application/Images/PCT logo.png'
            });
            return fileObj.url;
        }
   
        // function actionDuration(breakStartTime,breakEndTime)
        // {
        //     var diffHours = breakEndTime.getHours() - breakStartTime.getHours();
        //     var diffMins = breakEndTime.getMinutes() - breakStartTime.getMinutes();
        //     var diffSec = breakEndTime.getSeconds() - breakStartTime.getSeconds();
        //     var diffDuration = diffHours + ":" + diffMins + ":" + diffSec;
   
        //     log.debug({
        //         title: 'diffDuration',
        //         details: diffDuration
        //     })
   
        //     return diffDuration;
        // }
   
        function diff_minutes(dt2, dt1) {
   
            log.debug({
                title: 'dt2 dtq',
                details: dt2 + '  dt2    =' + dt1
            })
            var diff = (dt2.getTime() - dt1.getTime()) / 1000;
            diff /= 60;
            return Math.abs(Math.round(diff));
   
        }
   
   
   
        return {
            onRequest: onRequest
        }
    });