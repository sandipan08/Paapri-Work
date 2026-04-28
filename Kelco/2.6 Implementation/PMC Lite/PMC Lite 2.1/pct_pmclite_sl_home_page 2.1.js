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
 define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/url', 'N/record', 'N/format'],
 function (file, render, search, log, redirect, url, record, format) {
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



             var todayQuantity = GetTodayUnitCount(userId);
             log.debug("Team Innovation | PMC Lite 2.1", "TodayQuantity = " + todayQuantity);

             if (backFromBreak == "BREAK_COMPLETE") {
                 // This block is execute when you come from break page
                 // Case-1: VIEW > BREAK > HOME
                 // Case-2: START > BREAK > HOME
                 // Case-3: HOME > BREAK > HOME

                 if (mode == "VIEW_MODE" || mode == "START_MODE") {

                     var operationInternalId = SplitInternalId(ticketNumber);
                     var operationNumber = SplitOperationId(ticketNumber);
                     var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId,operationNumber);

                     if (mode == "VIEW_MODE") {
                         // Case-1
                         // Go to the Home Page
                         // NOte: Mode = "VIEW_MORE"
                         PageRendererByMode(userId, userName, todayQuantity, loginRecordId, 0, logoutPageUrl,
                             breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber,
                             "VIEW_MODE", mfgOperationSearchObj);

                     }
                     if (mode == "START_MODE") {
                         // Case-2
                         // Go to the Home Page
                         // NOte: Mode = "START_MODE"
                         PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl,
                             breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, "START_MODE",
                             mfgOperationSearchObj);
                     }

                 } else {
                     // Case-3
                     // Go to the Home Page
                     // NOte: qrCode is ticketNumber,
                     PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl,
                         woCompletionUrl, qrCode, 'HOME_PAGE', getOperationStatus);
                 }

             } else {
                 // This block is execute when you come from login page
                 // Go to the Home Page
                 // NOte: qrCode is ticketNumber,
                 PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl,
                     woCompletionUrl, qrCode, 'HOME_PAGE', getOperationStatus);
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

                 var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId,operationNumber);
                 PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl, breakPageUrl,
                     homePageUrl, woCompletionUrl, ticketNumber, "BREAK_END_MODE", mfgOperationSearchObj);//"BREAK_END_MODE",
             }
             else {
                 // Getting Manufacturing Operation Task Details
                 var mfgOperationSearchObj = GetManufacturingOperationDetails(operationInternalId,operationNumber);
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
                                 homePageUrl, woCompletionUrl, ticketNumber, "VIEW_MODE", mfgOperationSearchObj);

                         } else { // START_MODE
                             // Creating PMC Transaction table for bundle start
                             var startRecordId = CreateTransactionRecord(userId, "Running", operationInternalId,operationNumber, mfgOperationSearchObj);//"Bundle Start"//In Process
                             // Go to the Home Page
                             // NOte: Mode = "START_MODE"
                             PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl,
                                 breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber,
                                 "START_MODE", mfgOperationSearchObj);
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
     function PageRenderer(userId, userName, todayQuantity, loginRecordId, logoutPageUrl, breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, status, getOperationStatus) {

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
             breakBtn: '',
             breakStopBtn: 'hidden',
             getOperationStatus: getOperationStatus,
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
     function PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl, breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, mode, dataObj) {

         // if (mode != 'BREAK_END_MODE') {
         var quantity = dataObj.quantity;
         var completedQuantity = dataObj.completedQuantity;
         var remainingQuantity = quantity - completedQuantity;

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
             details: checkOpType + ' downtime ='+downtime
         })
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

         if(downtime == null || downtime == '')
         {
             breakBtnType = '';
             breakstopBtnType = 'hidden';
         }else{
             breakBtnType = 'hidden';
             breakstopBtnType = '';
             completeBtnType = 'disabled';
         }

         if (checkOpTypeId == '2') {
            completeBtnType = 'disabled';
             breakBtnType = 'hidden';
             breakstopBtnType = '';
         }else{
            completeBtnType = '';
            breakBtnType = '';
            breakstopBtnType = 'hidden';
         }

         if(resLength == 0)
         {
             breakBtnType = 'disabled';
         }
log.audit({
    title: 'checkOpTypeId',
    details: checkOpTypeId
})
         if(checkOpTypeId == '4' || checkOpTypeId == '' || isNaN(checkOpTypeId))
         {
            startBtnType = '';
             completeBtnType = 'disabled';
         }

         //for Break End Button Click
         var transbreakID, breaktype;

         log.debug({
             title:'mode',
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
                 UpdateBreakTransactionRecord(recordId);

             }
             // updating custom record 
           //  var callcustrecord = UpdateTransactionRecord(transbreakID, breaktype);

         }

         var faviconUrl = GetFaviconImgUrl();
         var isOverRunQty = 0;
         if (isOverRunManufacturingWC == 1 && isOverRunItem == 1) {
             isOverRunQty = 1;
         }

         var downTimeReason = getDownReason('customrecord_pct_pmc_dwn_reason');
         var downTimeCategory = getDownReason('customrecord_pct_pmc_dwn_cat');

         log.debug({
             title: 'downTimeReason',
             details: JSON.stringify(downTimeReason)
         })
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
             completeBtnType: completeBtnType,
             breakBtn: breakBtnType,
             breakStopBtn: breakstopBtnType,
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


     function getDownReason(recordId)
     {
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
                search.createColumn({name: "internalid", label: "Internal ID"})
             ]
          });
          var searchResultCount = customrecord_pct_pmc_dwn_reasonSearchObj.runPaged().count;
          log.debug("customrecord_pct_pmc_dwn_reasonSearchObj result count",searchResultCount);
          customrecord_pct_pmc_dwn_reasonSearchObj.run().each(function(result){
              var dataObj = new Object();
              dataObj.name = result.getValue({
                 name: "name",
                 sort: search.Sort.ASC,
                 label: "Name"
              })
              dataObj.internalid = result.getValue({name: "internalid", label: "Internal ID"});
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
             type: "customrecord_pct_pmc_tran_k_fab",
             filters:
                 [
                     ["custrecord_pct_kfab_res_end_date", "on", "today"],
                     "AND",
                     ["custrecord_pct_kfab_emp", "anyof", userId],
                     /*"AND",
                     ["custrecord_pct_kfab_op_status", "anyof", "4"]*/
                 ],
             columns:
                 [
                     search.createColumn({ name: "custrecord_pct_kfab_prod_qty", label: "Quantity" })
                 ]
         });
         var searchResultCount = searchObject.runPaged().count;
         log.debug("Team Innovation | PMC Lite 2.1", "searchResultCount = " + searchResultCount);
         if (searchResultCount > 0) {
             searchObject.run().each(function (result) {
                 // .run().each has a limit of 4,000 results
                 
                 count = parseFloat(count) + parseFloat(result.getValue({ name: "custrecord_pct_kfab_prod_qty", label: "Quantity" }));
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

         return response;

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
      * This method split the ticket number to operation's internal id
      * 
      * @param {string} ticketNumber - 10/1234
      */
     function SplitInternalId(ticketNumber) {
         if(ticketNumber != null || ticketNumber != '')
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
      * This method is used craete the custom record i.e. PCT PMC Transaction Table.
      * 
      * @param {string} userId - Internal ID of Employee (Netsuite Employee)
      * @param {string} actionType - Login, Logout, Break etc.
      * @param {string} operationInternalId - Manufacturing Operation Task' internal id
      * @param {string} operationName - Operation Name
      */
     function CreateTransactionRecord(userId, actionType, operationInternalId,operationNumber,mfgOperationSearchObj) {
         var now = new Date();
         var createdDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
         var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
         var formatedDate = FormateDate(createdDate);
         var formatedTime = FormateTime(createdTime);
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
             value: formatedDate,
             ignoreFieldChange: true
         }).setValue({
             fieldId: "custrecord_pct_kfab_res_start_date",
             value: now,//formatedTime,
             ignoreFieldChange: true
         }).setValue({
             fieldId: "custrecord_pct_kfab_op_task_id",
             value: operationInternalId,
             ignoreFieldChange: true
         }).setValue({
             fieldId: "custrecord_pct_kfab_p_seq",
             value: operationNumber,
             ignoreFieldChange: true
         }).setText({
             fieldId: "custrecord_pct_kfab_wo",
             text: mfgOperationSearchObj.workorder,
             ignoreFieldChange: true
         }).setValue({
             fieldId: "custrecord_pct_kfab_man_op_task",
             value: mfgOperationSearchObj.internalid,
             ignoreFieldChange: true
         }).setText({
             fieldId: "custrecord_pct_kfab_wo_center",
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


     //to update the record
     function UpdateBreakTransactionRecord(recordId) {
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
             })
        
         }
         customRecord.save();
         //custrecord_pct_pmc_downlime_category

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
             type: 'customrecord_pct_pmc_tran_k_fab',
             id: recordId,
             isDynamic: true
         }).setText({
             fieldId: "custrecord_pct_kfab_op_status",
             text: actionType,
             ignoreFieldChange: true
         }).setValue({
             fieldId: 'custrecord_pct_kfab_res_end_date',
             value: now,//formatedTime,
             ignoreFieldChange: true
         })
         var startDate = customRecord.getValue({
             fieldId: 'custrecord_pct_pmclite_trans_date'
         })
         var startActionTime = customRecord.getValue({
             fieldId: 'custrecord_pct_kfab_res_start_date'
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
         return  WC_searchResultCount;
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
             title: 'userId ='+userId,
             details: 'operationId ='+operationId
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
                     "AND", 
                     ["name","is","Production"]
                 ],
             columns:
                 [
                     search.createColumn({ name: "custrecord_pct_kfab_op_status", label: "Action Type" }),
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
         var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
          log.debug(" checkOperationStatusObj customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
         customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
             // .run().each has a limit of 4,000 results
             var internalId = result.getValue({
                 name: "internalid",
                 sort: search.Sort.DESC,
                 label: "Internal ID"
             })
             checkOperationStatusObj.actionType = result.getText('custrecord_pct_kfab_op_status');
             checkOperationStatusObj.actionTypeId = result.getValue('custrecord_pct_kfab_op_status');
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
         var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
             type: "customrecord_pct_pmc_tran_k_fab",
             filters:
                 [
                     ["custrecord_pct_kfab_emp", "anyof", userId],
                     "AND",
                     ["custrecord_pct_kfab_p_seq", "startswith", operationId],
                     "AND",
                     ["name", "is", "Production"],
                     "AND",
                     ["custrecord_pct_kfab_res_end_date", "isempty", ""]
                 ],
             columns:
                 [
                     search.createColumn({
                         name: "internalid",
                         sort: search.Sort.DESC,
                         label: "Internal ID"
                     }),
                     search.createColumn({ name: "custrecord_pct_kfab_op_status", label: "Action Type" })
                 ]
         });
         var breakStatusResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
         log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", breakStatusResultCount);
         customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
             //     // .run().each has a limit of 4,000 results
             //     transInternalId = result.getValue('internalid');
             breakObj.internalId = result.getValue('internalid');
             breakObj.actionType = result.getText('custrecord_pct_kfab_op_status');

         });
         // var breakStatusResult = customrecord_pct_pmc_tran_k_fabSearchObj.run().getRange({ start: 0, end: breakStatusResultCount });
         return breakObj;

     }

     /**
     * This method is used to calculate the date time difference
     *
     */
     function diff_minutes(dt2, dt1) {

         log.debug({
             title: 'dt2 dtq',
             details: dt2 + '  dt2    =' + dt1
         })
         var diff = (dt2.getTime() - dt1.getTime()) / 1000;
         diff /= 60;
         return Math.abs(Math.round(diff));

     }

     //==================================================== Helper Methods =======================================//

     return {
         onRequest: onRequest
     }
 });
