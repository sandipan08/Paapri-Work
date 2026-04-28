/**
 *              //////////     PMC Lite 2.1 | HOME PAGE SUITELET (MAIN PAGE/SCANNER PAGE)     //////////
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
                
 *@description  This Suitelet is used to scan ticket and complete operations, for every action it will create 
 *              a PMC Transation record.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/url', 'N/record', 'N/format', 'N/runtime'],
    function (file, render, search, log, redirect, url, record, format, runtime) {
        /**
         * Definition of the Suitelet script trigger point.
         * 
         * @param {Object} context 
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
         */
        var _response;
        var _request;
        function onRequest(context) {
            // Pre data source
            // NoteL All global variables are start with '_' sign
            _request = context.request;
            _response = context.response;

            if (_request.method == 'GET') {
                // Getting Params [GET REQUEST]
                var userName = _request.parameters.custparam_userName;
                var userId = _request.parameters.custparam_userId;
                var loginRecordId = _request.parameters.custparam_loginRecordId;
                var qrCode = _request.parameters.qrcode;
                if (qrCode === undefined) {
                    qrCode = "";
                }
                var backFromBreak = _request.parameters.custparam_backFromBreak;
                var mode = _request.parameters.custparam_mode;
                var startRecordId = _request.parameters.custparam_startRecordId;
                var ticketNumber = _request.parameters.custparam_ticketNumber;

                // Getting the external url of all pages.
                var logoutPageUrl = GetLogoutPageUrl();
                var breakPageUrl = GetBreakPageUrl();
                var homePageUrl = GetHomePageUrl();
                var woCompletionUrl = GetWOCompletionUrl();
                var getOperationStatus = _request.parameters.custparam_status;
                var COMPLETION_RECORD_ID = _request.parameters.custparam_completionId;



                var todayQuantity = GetTodayUnitCount(userId);
                log.debug("Team Innovation | PMC Lite 2.1", "mode = " + mode);

                if (backFromBreak == "BREAK_COMPLETE") {
                    // This block is execute when you come from break page
                    // Case-1: VIEW > BREAK > HOME
                    // Case-2: START > BREAK > HOME
                    // Case-3: HOME > BREAK > HOME

                    if (mode == "VIEW_MODE" || mode == "START_MODE" || mode == "BACK_FROM_BREAK_MODE") {

                        var operationInternalId = SplitInternalId(ticketNumber);
                        var operationNumber = SplitOperationId(ticketNumber);
                        var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId, operationNumber);

                        if (mode == "VIEW_MODE") {
                            log.debug("In View mode");
                            // Case-1
                            // Go to the Home Page
                            // NOte: Mode = "VIEW_MORE"
                            PageRendererByMode(userId, userName, todayQuantity, loginRecordId, 0, logoutPageUrl,
                                breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber,
                                "VIEW_MODE", mfgOperationSearchObj, '00', '00', '00');

                        }
                        if (mode == "BACK_FROM_BREAK_MODE") {
                            log.debug("In Break end");
                            hour = _request.parameters.custparam_breakHour;
                            minute = _request.parameters.custparam_breakMin;
                            second = _request.parameters.custparam_breakSec;

                            log.debug("PCT-Time", "Hour : " + hour + ", Minute : " + minute + ", Second : " + second)
                            PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl,
                                breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, "BACK_FROM_BREAK_MODE",
                                mfgOperationSearchObj, hour, minute, second);
                        }
                        if (mode == "START_MODE") {
                            log.debug("In Start mode");
                            // Case-2
                            // Go to the Home Page
                            // NOte: Mode = "START_MODE"
                            PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl,
                                breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, "START_MODE",
                                mfgOperationSearchObj, '00', '00', '00');
                        }

                    } else {
                        // Case-3
                        // Go to the Home Page
                        // NOte: qrCode is ticketNumber,
                        PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl,
                            woCompletionUrl, qrCode, 'HOME_PAGE', getOperationStatus, COMPLETION_RECORD_ID);
                    }

                } else {
                    // This block is execute when you come from login page
                    // Go to the Home Page
                    // NOte: qrCode is ticketNumber,
                    PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl,
                        woCompletionUrl, qrCode, 'HOME_PAGE', getOperationStatus, COMPLETION_RECORD_ID);
                }


            } else {// POST REQUEST BODY
                // Getting Params [POST REQUEST]
                var userName = _request.parameters.custparam_userName;
                var userId = _request.parameters.custparam_userId;
                var loginRecordId = _request.parameters.custparam_loginRecordId;
                var ticketNumber = _request.parameters.custparam_ticketNumber;
                var mode = _request.parameters.custparam_mode;
                var Break_end = _request.parameters.Break_end;


                var operationInternalId = SplitInternalId(ticketNumber);
                var operationNumber = SplitOperationId(ticketNumber);


                // Getting the external url of all pages.
                var logoutPageUrl = GetLogoutPageUrl();
                var breakPageUrl = GetBreakPageUrl();
                var homePageUrl = GetHomePageUrl();
                var woCompletionUrl = GetWOCompletionUrl();

                var todayQuantity = GetTodayUnitCount(userId);
                log.debug("Team Innovation | PMC Lite 2.1", "TodayQuantity = " + todayQuantity);

                if (Break_end == 'Break_end') {
                    // This block is execute when the "Break End" button is clicked

                    var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId, operationNumber);
                    PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl, breakPageUrl,
                        homePageUrl, woCompletionUrl, ticketNumber, "BREAK_END_MODE", mfgOperationSearchObj, '00', '00', '00');//"BREAK_END_MODE",
                }
                else {
                    // Getting Manufacturing Operation Task Details
                    var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId, operationNumber);
                    if (mfgOperationSearchObj.isSuccess) {
                        var status = mfgOperationSearchObj.status;

                        if (status == "COMPLETE") {
                            // This block is execute when the operation task status is "COMPLETE"
                            // Go to the Home Page
                            // Note: Status = "COMPLETE"
                            PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl,
                                homePageUrl, woCompletionUrl, ticketNumber, status, '');

                        } else {
                            // This block is execute only when the operation task status = NOTSTARTED || INPROGRESS
                            if (mode == "VIEW_MODE") {
                                // Go to the Home Page
                                // NOte: Mode = "VIEW_MORE"
                                PageRendererByMode(userId, userName, todayQuantity, loginRecordId, 0, logoutPageUrl, breakPageUrl,
                                    homePageUrl, woCompletionUrl, ticketNumber, "VIEW_MODE", mfgOperationSearchObj, '00', '00', '00');

                            } else { // START_MODE
                                // Creating PMC Transaction table for bundle start
                                var startRecordId = CreateTransactionRecord(userId, "Running", operationInternalId, operationNumber, mfgOperationSearchObj);//"Bundle Start"//In Process
                                // Go to the Home Page
                                // NOte: Mode = "START_MODE"
                                PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl,
                                    breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber,
                                    "START_MODE", mfgOperationSearchObj, '00', '00', '00');
                            }
                        }

                    } else {
                        // This block is execute when you entered wrong ticket number
                        // or wrong manufacturing operation task's internal id
                        var _status = "INVALID_INTERNAL_ID";
                        // Go to the Home Page
                        // NOte: Mode = "START_MODE"
                        PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl,
                            woCompletionUrl, ticketNumber, _status, getOperationStatus);
                    }

                }

            }// POST END
        }


        //==================================================== Helper Methods =======================================//

        /**
         * This method is used to render the Home Page
         * 
         * @param {string} userId 
         * @param {string} userName 
         * @param {string} loginRecordId 
         * @param {string} logoutPageUrl 
         * @param {string} breakPageUrl 
         * @param {string} homePageUrl 
         * @param {string} woCompletionUrl 
         * @param {string} ticketNumber 
         * @param {string} status 
         */
        function PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, status, getOperationStatus, COMPLETION_RECORD_ID) {

            var faviconUrl = GetFaviconImgUrl();
            var downTimeReason = getDownReason('customrecord_pct_pmc_dwn_reason');
            var downTimeCategory = getDownReason('customrecord_pct_pmc_dwn_cat');
            // Assemble Data Source for Home Page
            var dataSource = {
                userId: userId,
                userName: userName,
                loginRecordId: loginRecordId,
                logoutPageUrl: logoutPageUrl,
                breakPageUrl: breakPageUrl,
                ticketNumber: ticketNumber,
                status: status,
                homePageUrl: homePageUrl,
                woCompletionUrl: woCompletionUrl,
                todayQuantity: todayQuantity,
                faviconUrl: faviconUrl,
                startBtnType: 'disabled',
                completeBtnType: 'disabled',
                workInstructionBtnType: 'disabled',
                breakBtn: 'disabled',
                breakStopBtn: 'hidden',
                getOperationStatus: getOperationStatus,
                COMPLETION_RECORD_ID: COMPLETION_RECORD_ID,
                downTimeReason: downTimeReason,
                downTimeCategory: downTimeCategory
            };

            var templateFile = file.load({ id: './PMC Lite Web Application/PMC Lite 2.1 Templates/pct_pmclite_home_page.html' });
            var pageRenderer = render.create();
            pageRenderer.templateContent = templateFile.getContents();
            pageRenderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'ds',
                data: dataSource
            });
            var renderedPage = pageRenderer.renderAsString();
            _response.write(renderedPage);
        }


        /**
         * This method is used to render the Home Page
         * 
         * @param {string} userId 
         * @param {string} userName 
         * @param {string} loginRecordId 
         * @param {string} startRecordId 
         * @param {string} logoutPageUrl 
         * @param {string} breakPageUrl 
         * @param {string} homePageUrl 
         * @param {string} woCompletionUrl 
         * @param {string} ticketNumber 
         * @param {string} mode 
         * @param {string} dataObj 
         */
        function PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl, breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, mode, dataObj, hour, minute, second) {
            let viewMode = 'true';
            let prevDuration = 0
            var quantity = dataObj.quantity;
            var completedQuantity = dataObj.completedQuantity;
            var predecessorCompletedquantity = dataObj.predecessorCompletedquantity;
            var predecessorName = dataObj.predecessorName;
            var remainingQuantity = quantity - completedQuantity;
            if (predecessorCompletedquantity == null || predecessorCompletedquantity == '' || isNaN(predecessorCompletedquantity) || predecessorCompletedquantity == undefined) {
                predecessorCompletedquantity = 0
            }

            // if (mode != 'BREAK_END_MODE') {


            var isOverRunManufacturingWC = isWorkcenterchecked(dataObj.manufacturingworkcenter);
            var isOverRunItem = isAssemblyItemChecked(dataObj.item);
            // }

            var operationId = dataObj.ticket.split('/')[1];
            var checkOperationStatusObj = checkOperationStatus(userId, operationId);
            var checkOpType = checkOperationStatusObj.actionType;
            var checkOpTypeId = checkOperationStatusObj.actionTypeId;

            var downtime = checkOperationStatusObj.downtime;
            var resLength = checkOperationStatusObj.resLength;
            log.debug({
                title: 'checkOpType',
                details: checkOpType + ' downtime =' + downtime
            })
            var workInstructionBtnType = '';
            var startBtnType = '';
            var completeBtnType = 'disabled';
            var breakBtnType = '';
            var breakstopBtnType = 'hidden';

            // for start the operation
            if (checkOpTypeId == '5' || checkOpTypeId == '2' || checkOpTypeId == '3') {
                startBtnType = 'disabled';
                completeBtnType = '';
            }

            // for view the operation
            if (checkOpType == null) {
                startBtnType = '';
                completeBtnType = 'disabled';
                breakBtnType = 'disabled';
                breakstopBtnType = 'hidden';
            }
            // for break the operation
            /* if (checkOpType != 'In Process' && checkOpType != null) {
    
                 startBtnType = 'disabled';
                 completeBtnType = 'disabled';
                 breakBtnType = 'hidden';
                 breakstopBtnType = '';
             }*/

            if (downtime == null || downtime == '') {
                breakBtnType = '';
                breakstopBtnType = 'hidden';
            } else {
                breakBtnType = 'hidden';
                breakstopBtnType = '';
                completeBtnType = 'disabled';
            }

            if (checkOpTypeId == '2') {
                completeBtnType = 'disabled';
                breakBtnType = 'hidden';
                breakstopBtnType = '';
            } else {
                completeBtnType = '';
                breakBtnType = '';
                breakstopBtnType = 'hidden';
            }

            if (resLength == 0) {
                breakBtnType = 'disabled';
            }
            // log.audit({
            //     title: 'checkOpTypeId',
            //     details: checkOpTypeId
            // })
            if (checkOpTypeId == '4' || checkOpTypeId == '' || isNaN(checkOpTypeId)) {
                startBtnType = '';
                completeBtnType = 'disabled';
            }

            //for Break End Button Click
            var transbreakID, breaktype;

            log.debug({
                title: 'mode',
                details: mode
            })
            if (mode == 'BREAK_END_MODE') {
                var breakStatusObj = checkBreakStatus(userId, operationId);
                breakBtnType = '';
                breakstopBtnType = 'hidden';
                completeBtnType = '';
                startBtnType = 'disabled';


                transbreakID = breakStatusObj.internalId;
                breaktype = breakStatusObj.actionType;

                var operationId = ticketNumber.split('/')[1];


                var responseData = IsStartRecordAlreadyCreated(operationId, userId);
                log.debug("Team Innovation | PMC Lite 2.1", "recordId = " + responseData);
                if (responseData.isSuccess) {
                    var recordId = responseData.recordId;
                    prevDuration = UpdateBreakTransactionRecord(recordId);
                    let startTime = responseData.startTime;
                    let downTimeDuration = responseData.downTimeDuration
                    var now = new Date();

                    var timeDiff = diff_minutes(now, startTime, downTimeDuration, prevDuration);
                    hour = parseInt(timeDiff.hour);
                    minute = parseInt(timeDiff.minute);
                    second = parseInt(timeDiff.seconds)

                }
                // updating custom record 
                //  var callcustrecord = UpdateTransactionRecord(transbreakID, breaktype);

            }
            if (mode == 'VIEW_MODE') {
                var responseData = IsStartRecordAlreadyCreated(operationId, userId);
                log.debug("Team Innovation | PMC Lite 2.1", "VIEW_MODE Response = " + JSON.stringify(responseData));
                if (responseData.isSuccess) {
                    if (responseData.operationStatus != 2) {
                        log.debug({
                            title: 'PCT',
                            details: "Status Not Downtime"
                        })
                        let startTime = responseData.startTime;
                        let downTimeDuration = responseData.downTimeDuration
                        var now = new Date();

                        var timeDiff = diff_minutes(now, startTime, downTimeDuration, prevDuration);
                        hour = parseInt(timeDiff.hour);
                        minute = parseInt(timeDiff.minute);
                        second = parseInt(timeDiff.seconds)
                        log.debug("PCT-timeDiff hour", hour)
                        log.debug("PCT-timeDiff minute", minute)
                        log.debug("PCT-timeDiff seconds", second)
                    }
                    else if (responseData.operationStatus == 2) {
                        log.debug({
                            title: 'PCT',
                            details: "Downtime"
                        })
                        let startTime = responseData.startTime;
                        let downTimeStartTime = responseData.downTimeStartTime;
                        let downTimeDuration = responseData.downTimeDuration
                        var now = new Date();

                        var timeDiff = getDownTimeDiffTime(startTime, downTimeStartTime, downTimeDuration, prevDuration);
                        hour = parseInt(timeDiff.hour);
                        minute = parseInt(timeDiff.minute);
                        second = parseInt(timeDiff.seconds)
                        viewMode = 'false';

                        log.debug("PCT-timeDiff hour", hour)
                        log.debug("PCT-timeDiff minute", minute)
                        log.debug("PCT-timeDiff seconds", second)
                    }
                }
            }


            var faviconUrl = GetFaviconImgUrl();
            var isOverRunQty = 0;
            if (isOverRunManufacturingWC == 1 && isOverRunItem == 1) {
                isOverRunQty = 1;
            }

            var downTimeReason = getDownReason('customrecord_pct_pmc_dwn_reason');
            var downTimeCategory = getDownReason('customrecord_pct_pmc_dwn_cat');

            const WorkInstrucionArray = getWorkInstruction(dataObj.sequence, dataObj.workOrderInternalId)
            if (WorkInstrucionArray.length == 0) {
                workInstructionBtnType = 'disabled'
            }
            // log.debug({
            //     title: 'downTimeReason',
            //     details: JSON.stringify(downTimeReason)
            // })
            // Assemble Data Source for Home Page
            var dataSource = {
                userId: userId,
                userName: userName,
                loginRecordId: loginRecordId,
                startRecordId: startRecordId,
                logoutPageUrl: logoutPageUrl,
                breakPageUrl: breakPageUrl,
                opInternalId: dataObj.internalId,
                name: dataObj.assembly,
                status: dataObj.status,
                sequence: dataObj.sequence + " " + dataObj.name,
                workorder: dataObj.workorder,
                item: dataObj.item,
                ticket: dataObj.ticket,
                description: dataObj.description,
                quantity: quantity,
                completedQuantity: completedQuantity,
                predecessorCompletedquantity: predecessorCompletedquantity,
                predecessorName: predecessorName,
                remainingQuantity: remainingQuantity,
                mode: mode,
                ticketNumber: ticketNumber,
                homePageUrl: homePageUrl,
                woCompletionUrl: woCompletionUrl,
                todayQuantity: todayQuantity,
                faviconUrl: faviconUrl,
                isOverRunQty: isOverRunQty,
                IsLastOperation: dataObj.IsLastOperation,
                lastOperation: dataObj.lastOperation,
                startBtnType: startBtnType,
                workInstructionBtnType: workInstructionBtnType,
                completeBtnType: completeBtnType,
                breakBtn: breakBtnType,
                breakStopBtn: breakstopBtnType,
                downTimeReason: downTimeReason,
                downTimeCategory: downTimeCategory,
                WorkInstrucionArray: WorkInstrucionArray,
                hour: hour,//.toFixed(1).split('.'),//hour, 
                minute: minute,//.toFixed(1).split('.'),//minute,
                second: second,//.toFixed(1).split('.')// second
                viewMode: viewMode
            };


            var templateFile = file.load({ id: './PMC Lite Web Application/PMC Lite 2.1 Templates/pct_pmclite_home_page.html' });
            var pageRenderer = render.create();
            pageRenderer.templateContent = templateFile.getContents();
            pageRenderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'ds',
                data: dataSource
            });
            var renderedPage = pageRenderer.renderAsString();
            _response.write(renderedPage);
        }

        const getWorkInstruction = (seq, workorderId) => {
            var customrecord_pct_pmc_instructionSearchObj = search.create({
                type: "customrecord_pct_pmc_instruction",
                filters:
                    [
                        ["custrecord_pct_pmc_ins_workorder", "anyof", workorderId],
                        "AND",
                        ["custrecord_pct_pmc_ins_op_seq", "is", seq]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pmc_ins_item", label: "Assembly Item" }),
                        search.createColumn({ name: "custrecord_pct_pmc_ins_workorder", label: "Work Order" }),
                        search.createColumn({ name: "custrecord_pct_pmc_ins_op_seq", label: "Operation Sequence" }),
                        search.createColumn({ name: "custrecord_pct_pmc_ins_work_ins", label: "Instruction" }),
                        search.createColumn({ name: "custrecord_pct_pmc_ins_url", label: "Url" })
                    ]
            });
            let workInstructionArray = []
            var searchResultCount = customrecord_pct_pmc_instructionSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_instructionSearchObj result count", searchResultCount);
            customrecord_pct_pmc_instructionSearchObj.run().each(function (result) {
                let workInstructionObj = {}
                workInstructionObj.instruction = result.getValue('custrecord_pct_pmc_ins_work_ins')
                workInstructionObj.url = result.getValue('custrecord_pct_pmc_ins_url')
                workInstructionArray.push(workInstructionObj)
                return true;
            });

            return workInstructionArray

        }
        function getDownReason(recordId) {
            var dataArr = new Array();
            var customrecord_pct_pmc_dwn_reasonSearchObj = search.create({
                type: recordId,
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
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = customrecord_pct_pmc_dwn_reasonSearchObj.runPaged().count;
            // log.debug("customrecord_pct_pmc_dwn_reasonSearchObj result count", searchResultCount);
            customrecord_pct_pmc_dwn_reasonSearchObj.run().each(function (result) {
                var dataObj = new Object();
                dataObj.name = result.getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                })
                dataObj.internalid = result.getValue({ name: "internalid", label: "Internal ID" });
                dataArr.push(dataObj);
                // .run().each has a limit of 4,000 results
                return true;
            });
            return dataArr;
        }
        /**
         * 
         * @param {string} userId 
         */
        function GetTodayUnitCount(userId) {
            var count = 0;
            var searchObject = search.create({
                type: "customrecord_pct_pmc_tran",
                filters:
                    [
                        ["custrecord_pct_pmc_res_end_date", "on", "today"],
                        "AND",
                        ["custrecord_pct_pmc_emp", "anyof", userId],
                        /*"AND",
                        ["custrecord_pct_pmc_op_status", "anyof", "4"]*/
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pmc_prod_qty", label: "Quantity" })
                    ]
            });
            var searchResultCount = searchObject.runPaged().count;
            log.debug("Team Innovation | PMC Lite 2.1", "searchResultCount = " + searchResultCount);
            if (searchResultCount > 0) {
                searchObject.run().each(function (result) {
                    // .run().each has a limit of 4,000 results

                    count = parseFloat(count) + parseFloat(result.getValue({ name: "custrecord_pct_pmc_prod_qty", label: "Quantity" }));
                    return true;
                });
            } else {
                return count;
            }

            return count;

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
                        ["custrecord_pct_pmc_res_end_date", "isempty", ""],
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.ASC,
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_res_start_date",

                            label: "Result Start Date Time"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_dwn_duration",

                            label: "DOWNTIME TOTAL DURATION"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_op_status",
                            label: "Operation Status"
                        }),
                        search.createColumn({ name: "custrecord_pct_pmc_dwn_start_time", label: "DOWNTIME START DATE TIME" })
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
                response.startTime = searchResults[0].getValue({
                    name: "custrecord_pct_pmc_res_start_date",
                    label: "Result Start Date Time"
                });
                response.operationStatus = searchResults[0].getValue({
                    name: "custrecord_pct_pmc_op_status",
                    label: "Operation Status"
                });
                if (searchResults[0].getValue({
                    name: "custrecord_pct_pmc_dwn_duration",
                    label: "DOWNTIME TOTAL DURATION"
                })) {
                    response.downTimeDuration = searchResults[0].getValue({
                        name: "custrecord_pct_pmc_dwn_duration",
                        label: "DOWNTIME TOTAL DURATION"
                    })
                }

                else {
                    response.downTimeDuration = 0;
                }

                if (searchResults[0].getValue({ name: "custrecord_pct_pmc_dwn_start_time", label: "DOWNTIME START DATE TIME" })) {
                    response.downTimeStartTime = searchResults[0].getValue({ name: "custrecord_pct_pmc_dwn_start_time", label: "DOWNTIME START DATE TIME" })
                }
                else {
                    response.downTimeStartTime = '';
                }

                response.isSuccess = true;
            } else {
                response.isSuccess = false;
            }

            return response;

        }

        /**
         * This method return Manufacturing Operation Task Details
         * 
         * @param {string} internalId - operation's internal id
         */
        function GetManufacturingOperationDetails(internalId, sequence) {
            var searchResults = new Object();
            var mfgOpTaskSearchObj = search.create({
                type: "manufacturingoperationtask",
                filters:
                    [
                        ["status", "anyof", "PROGRESS", "NOTSTART", "COMPLETE"],
                        "AND",
                        ["internalid", "anyof", internalId],
                        "AND",
                        ["sequence", "equalto", sequence],
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
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "workOrder",
                            label: "internalid"
                        }),
                        search.createColumn({
                            name: "completedquantity",
                            join: "predecessor",
                            label: "Completed Quantity"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "predecessor",
                            label: "Operation Name"
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
                    var predecessorCompletedquantity = result.getValue({
                        name: "completedquantity",
                        join: "predecessor",
                        label: "Completed Quantity"
                    });
                    var predecessorName = result.getValue({
                        name: "name",
                        join: "predecessor",
                        label: "Completed Quantity"
                    });

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
                    searchResults.workOrderInternalId = result.getValue({ name: "internalid", join: "workOrder", label: "internalid" });
                    searchResults.ticket = result.getValue({ name: 'sequence' }) + "/" + result.getValue({ name: 'internalid' });
                    searchResults.manufacturingworkcenter = result.getText({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" });
                    searchResults.IsLastOperation = IslastOperation;
                    searchResults.lastOperation = lastOperation;
                    searchResults.isSuccess = true;
                    searchResults.predecessorCompletedquantity = predecessorCompletedquantity;
                    searchResults.predecessorName = predecessorName;
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
         * This method split the ticket number to operation's internal id
         * 
         * @param {string} ticketNumber - 10/1234
         */
        function SplitInternalId(ticketNumber) {
            if (ticketNumber != null || ticketNumber != '')
                if (ticketNumber.length == 0)
                    return 0;
                else
                    return ticketNumber.split('/')[1];
        }

        function SplitOperationId(ticketNumber) {
            if (ticketNumber != null || ticketNumber != '')
                if (ticketNumber.length == 0)
                    return 0;
                else
                    return ticketNumber.split('/')[0];
        }

        /**
         * This method is used craete the custom record i.e. PCT PMC Transaction Table.
         * 
         * @param {string} userId - Internal ID of Employee (Netsuite Employee)
         * @param {string} actionType - Login, Logout, Break etc.
         * @param {string} operationInternalId - Manufacturing Operation Task' internal id
         * @param {string} operationName - Operation Name
         */
        function CreateTransactionRecord(userId, actionType, operationInternalId, operationNumber, mfgOperationSearchObj) {
            var now = new Date();
            var createdDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedDate = FormateDate(createdDate);
            var formatedTime = FormateTime(createdTime);
            var recordId = record.create({
                type: 'customrecord_pct_pmc_tran',
                isDynamic: true,
            }).setValue({
                fieldId: "custrecord_pct_pmc_emp",
                value: userId,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_op_status",
                text: actionType,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmclite_trans_date",
                value: formatedDate,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmc_res_start_date",
                value: now,//formatedTime,
                ignoreFieldChange: true
            }).setText({
                fieldId: 'custrecord_pct_pmc_res_start_date_wos',
                text: dateFormatterWithOutSec(now),
                ignoreFieldChange: false
            }).setValue({
                fieldId: "custrecord_pct_pmc_op_task_id",
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
                value: 'Production',
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });//
            //
            return recordId;
        }

        const dateFormatterWithOutSec = (date) => {
            log.debug(`PCT-PMC`, `Date Formatter Date ${date}`)

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

        //to update the record
        function UpdateBreakTransactionRecord(recordId) {
            let diff_actionduration = 0;
            var now = new Date();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);


            log.debug({
                title: 'recordId in UpdateTransactionRecord',
                details: recordId
            })
            var customRecord = record.load({
                type: 'customrecord_pct_pmc_tran',
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
                diff_actionduration = diff_minutes(now, downtimeStart, 0, 0).minDiff;
                var durationInMin = parseInt(prevDownDuration) + parseInt(diff_actionduration)

                log.debug({
                    title: 'diff_actionduration',
                    details: diff_actionduration + ', durationInMin =' + durationInMin
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
                    fieldId: 'custrecord_pct_pmc_op_status',
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
            } else {
                log.debug({
                    title: 'downtimeStart have No data',
                    details: ''
                })
                customRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_dwn_start_time',
                    value: now,
                    ignoreFieldChange: true
                })

            }
            customRecord.save();
            //custrecord_pct_pmc_downlime_category
            return diff_actionduration;
        }

        /**
         * This method is used to update the transaction Table
         * 
         * @param {string} actionType - Login, Logout, Break etc.
         * @param {string} recordId - PMC Transaction's record internal id
         */
        /*function UpdateTransactionRecord(recordId, actionType) {
            var now = new Date();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);
            log.debug({
                title: 'formatedTime',
                details: formatedTime
            })
   
            var customRecord = record.load({
                type: 'customrecord_pct_pmc_tran',
                id: recordId,
                isDynamic: true
            }).setText({
                fieldId: "custrecord_pct_pmc_op_status",
                text: actionType,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_pmc_res_end_date',
                value: now,//formatedTime,
                ignoreFieldChange: true
            })
            var startDate = customRecord.getValue({
                fieldId: 'custrecord_pct_pmclite_trans_date'
            })
            var startActionTime = customRecord.getValue({
                fieldId: 'custrecord_pct_pmc_res_start_date'
            })
            var startTimeInsec = getsec(startActionTime);
   
           // var finalstartTime = new Date(startDate.setSeconds(startTimeInsec));
           var finalstartTime = new Date(startDate);
   
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
           
   
            customRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });
        }*/

        function getsec(timevalue) {
            var timearray = timevalue.split(':');
            var timeinsec = parseInt(timearray[0] * 60 * 60) + parseInt(timearray[1] * 60) + parseInt(timearray[2]);
            return timeinsec;
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

        /**
         * This method is used to get the external url of Home Page/Scanner Page
         */
        function GetHomePageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_pmclite_sl_home_pg',
                deploymentId: 'customdeploy_pct_pmclite_sl_home_pg',
                returnExternalUrl: true
            });
        }

        /**
         * This method is used to get the external url of Break Page
         */
        function GetBreakPageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_pmclite_sl_break_pg',
                deploymentId: 'customdeploy_pct_pmclite_sl_break_pg',
                returnExternalUrl: true
            });
        }

        /**
         * This method is used to get the external url of Logout Page
         */
        function GetLogoutPageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_pmclite_sl_logout_pg',
                deploymentId: 'customdeploy_pct_pmclite_sl_logout_pg',
                returnExternalUrl: true
            });
        }

        /**
         * This method is used to get the external url of the suitelet that
         *  perform Work Order Completion
         */
        function GetWOCompletionUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_pmclite_sl_wo_comp_pg',
                deploymentId: 'customdeploy_pct_pmclite_sl_wo_comp_pg',
                returnExternalUrl: true
            });
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

        /**
         * This method is used to check the overrunqty field checkbox in 
         * manufacturing workcenter form is checked or not
         */
        function isWorkcenterchecked(WCname) {
            var entitygroupSearchObj = search.create({
                type: "entitygroup",
                filters:
                    [
                        ["groupname", "is", WCname],
                        /*"AND",
                        ["custentity_pct_overrun_qty", "is", "T"]*/
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "groupname",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "grouptype", label: "Type" }),
                        search.createColumn({ name: "email", label: "Email" }),
                        search.createColumn({ name: "owner", label: "Owner" }),
                        search.createColumn({ name: "savedsearch", label: "Saved Search" }),
                        //search.createColumn({ name: "custentity_pct_overrun_qty", label: "Over Run Qty" })
                    ]
            });
            var WC_searchResultCount = entitygroupSearchObj.runPaged().count;
            //log.debug("entitygroupSearchObj result count", WC_searchResultCount);
            //  entitygroupSearchObj.run().each(function(result){
            //     // .run().each has a limit of 4,000 results
            //     return true;
            //  });
            return WC_searchResultCount;
        }

        /**
           * This method is used to check the overrunqty field checkbox in 
           * assembly item is checked or not
           */
        function isAssemblyItemChecked(itemID) {

            var assemblyitemSearchObj = search.create({
                type: "assemblyitem",
                filters:
                    [
                        ["type", "anyof", "Assembly"],
                        "AND",
                        ["internalid", "is", itemID],
                        /*"AND",
                        ["custitem_pct_overrun_qty", "is", "T"]*/
                    ],
                columns: [

                ]
            });
            var Item_searchResultCount = assemblyitemSearchObj.runPaged().count;
            // log.debug("assemblyitemSearchObj result count", Item_searchResultCount);
            //  assemblyitemSearchObj.run().each(function(result){
            //     // .run().each has a limit of 4,000 results
            //     return true;
            //  });
            return Item_searchResultCount
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
        * This method is used to get the action type (bundle start) of a operation
        */
        function checkOperationStatus(userId, operationId) {

            log.debug({
                title: 'operationId',
                details: operationId
            })
            // var userId = $('#user-id').val();
            var actionType;
            log.debug({
                title: 'userId =' + userId,
                details: 'operationId =' + operationId
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
                        "AND",
                        ["name", "is", "Production"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pmc_op_status", label: "Action Type" }),
                        search.createColumn({ name: "custrecord_pct_pmc_dwn_start_time", label: "DOWNTIME START DATE TIME" }),
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.DESC,
                            label: "Internal ID"
                        }),

                        //
                    ]
            });
            var checkOperationStatusObj = new Object();
            var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
            log.debug(" checkOperationStatusObj customrecord_pct_pmc_tranSearchObj result count", searchResultCount);
            customrecord_pct_pmc_tranSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                var internalId = result.getValue({
                    name: "internalid",
                    sort: search.Sort.DESC,
                    label: "Internal ID"
                })
                checkOperationStatusObj.actionType = result.getText('custrecord_pct_pmc_op_status');
                checkOperationStatusObj.actionTypeId = result.getValue('custrecord_pct_pmc_op_status');
                checkOperationStatusObj.downtime = result.getValue('custrecord_pct_pmc_dwn_start_time');

                log.debug({
                    title: 'Op Status internalId',
                    details: internalId
                })
            });

            checkOperationStatusObj.resLength = searchResultCount
            if (parseInt(searchResultCount) > 0) {
                return checkOperationStatusObj;
            }
            else {
                return checkOperationStatusObj;
            }


        }




        /**
        * This method is used to get the action type (break/quality/restroom/lunch) 
        * and internal id
        * of a operation
        */
        function checkBreakStatus(userId, operationId) {

            var breakObj = new Object();
            var customrecord_pct_pmc_tranSearchObj = search.create({
                type: "customrecord_pct_pmc_tran",
                filters:
                    [
                        ["custrecord_pct_pmc_emp", "anyof", userId],
                        "AND",
                        ["custrecord_pct_pmc_p_seq", "startswith", operationId],
                        "AND",
                        ["name", "is", "Production"],
                        "AND",
                        ["custrecord_pct_pmc_res_end_date", "isempty", ""]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.DESC,
                            label: "Internal ID"
                        }),
                        search.createColumn({ name: "custrecord_pct_pmc_op_status", label: "Action Type" })
                    ]
            });
            var breakStatusResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_tranSearchObj result count", breakStatusResultCount);
            customrecord_pct_pmc_tranSearchObj.run().each(function (result) {
                //     // .run().each has a limit of 4,000 results
                //     transInternalId = result.getValue('internalid');
                breakObj.internalId = result.getValue('internalid');
                breakObj.actionType = result.getText('custrecord_pct_pmc_op_status');

            });
            // var breakStatusResult = customrecord_pct_pmc_tranSearchObj.run().getRange({ start: 0, end: breakStatusResultCount });
            return breakObj;

        }

        /**
        * This method is used to calculate the date time difference
        *
        */
        function diff_minutes(dt2, dt1, downTimeDuration, prevDuration) {

            log.debug({
                title: 'Now Time, Start Time, Downtime Duration, Prev Duration',
                details: dt2 + ' , ' + dt1 + ' , ' + downTimeDuration + ' , ' + prevDuration
            })
            // var diff =(dt2.getTime() - dt1.getTime()) / 1000;
            // diff /= 60;
            // return Math.abs(Math.round(diff));
            var timeStart = new Date(dt1).getTime();
            var timeEnd = new Date(dt2).getTime();
            var hourDiff = timeEnd - timeStart; //in ms
            var secDiff = hourDiff / 1000; //in s
            var minDiff = hourDiff / 60 / 1000; //in minutes
            minDiff = Math.abs(minDiff - parseInt(downTimeDuration) - parseInt(prevDuration));

            log.debug({
                title: 'minDiff',
                details: minDiff
            })

            const hours = Math.floor(Math.round(minDiff) / 60);
            const minutes = minDiff % 60;
            const seconds = (minutes % 1) * 60
            // return `${padToTwoDigits(hours)}:${padToTwoDigits(minutes)}`;

            return { 'hour': padToTwoDigits(hours), 'minute': padToTwoDigits(minutes), 'seconds': seconds, 'minDiff': minDiff }

            // return toHoursAndMinutes(Math.round(minDiff));
            // // return Math.round(hours);

        }

        function getDownTimeDiffTime(startTime, DownTimePauseTime, downTimeDuration, prevDuration) {
            log.debug({
                title: 'Start Time, Downtime Pause Time, Downtime Duartion, Prev Duration',
                details: startTime + ' , ' + DownTimePauseTime + ' , ' + downTimeDuration + ' , ' + prevDuration
            })
            startTime = new Date(startTime).getTime();
            DownTimePauseTime = new Date(DownTimePauseTime).getTime();
            let hourDiff = DownTimePauseTime - startTime; //in ms
            let minDiff = hourDiff / 60 / 1000;
            minDiff = Math.abs(minDiff - parseInt(downTimeDuration) - parseInt(prevDuration));

            log.debug({
                title: 'getDownTimeDiffTime - minDiff',
                details: minDiff
            })

            const hours = Math.floor(Math.round(minDiff) / 60);
            const minutes = minDiff % 60;
            const seconds = (minutes % 1) * 60


            return { 'hour': padToTwoDigits(hours), 'minute': padToTwoDigits(minutes), 'seconds': seconds }
        }

        // function toHoursAndMinutes(totalMinutes) {
        //     const hours = Math.floor(totalMinutes / 60);
        //     const minutes = totalMinutes % 60;
        //     return `${padToTwoDigits(hours)}:${padToTwoDigits(minutes)}`;
        // }
        function padToTwoDigits(num) {
            return num.toString().padStart(2, "0");
        }


        //==================================================== Helper Methods =======================================//

        return {
            onRequest: onRequest
        }
    });