/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00 
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

*@ScriptName        PCT PMC Get Work Order Data
*@Developer         Subhankar Nath
*@DevelopmentHead   Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                              Purpose:                                                              Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/record', 'N/search'], function (record, search) {
    let toolArray = [];
    function _get(context) {
        try {
            let workOrderId = context.workOrderId;
            let operationSequence = context.operationSequence;
            let operationTaskId = context.operationTaskId;
            let itemId = context.itemId;
            let workCenterId = context.workCenterId;
            let workOrderItemDetails = getWorkOrderItemDetails(workOrderId);
            let workOrderOperationTaskDetails = getManufacturingOperationTaskData(workOrderId);
            let toolFamilyTaskDetails = getToolFamily(workOrderId, operationSequence);
            let workInstructionDetails = getWorkInstructionData(itemId);
            let processInputsDetails = getProcessInputsData(workOrderId, workCenterId)

            toolFamilyTaskDetails.data.map((element) => {
                toolArray.push(element.toolFamilyInternalId)
            })
            let pmcTransactionDetails = getPMCTransactionDetails(workOrderId, operationTaskId);
            let serializedToolTaskDetails = getSerializedTool(toolArray);
            log.debug({
                title: 'PCT-PMC',
                details: `Data = Work Order : ${JSON.stringify(workOrderItemDetails)}, Routing :  ${JSON.stringify(workOrderOperationTaskDetails)} , Tool Family : ${JSON.stringify(toolFamilyTaskDetails)} , Serialized Tool : ${JSON.stringify(serializedToolTaskDetails)} `
            })
            let tableHeaders = getTableHeaders()
            workOrderItemDetails['columnsArr'] = generateTableHeader(workOrderItemDetails.keys, tableHeaders.itemsTableTitleArr)
            workOrderOperationTaskDetails['columnsArr'] = generateTableHeader(workOrderOperationTaskDetails.keys, tableHeaders.routingTableTitleArr)
            toolFamilyTaskDetails['columnsArr'] = generateTableHeader(toolFamilyTaskDetails.keys, tableHeaders.toolFamilyTableTitleArr);
            pmcTransactionDetails['columnsArr'] = generateTableHeader(pmcTransactionDetails.keys, tableHeaders.pmcTransactionTableTitleArr);
            serializedToolTaskDetails['columnsArr'] = generateTableHeader(serializedToolTaskDetails.keys, tableHeaders.serializedToolTitleArr);
            workInstructionDetails['columnsArr'] = generateTableHeader(workInstructionDetails.keys, tableHeaders.workInstructionTitleArr);
            processInputsDetails['columnsArr'] = generateTableHeader(processInputsDetails.keys, tableHeaders.processInputsTitleArr)
            return { 'isSuccess': true, 'workOrderItemDetails': workOrderItemDetails, 'workOrderOperationTaskDetails': workOrderOperationTaskDetails, 'toolFamilyDetails': toolFamilyTaskDetails, 'pmcTransactionDetails': pmcTransactionDetails, 'serializedToolDetails': serializedToolTaskDetails, 'workInstructionDetails': workInstructionDetails, 'processInputDetails': processInputsDetails }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    const getWorkOrderItemDetails = (workOrderId) => {
        let keyObjects = {
            'itemText': '',
            'itemId': '',
            'quantity': 0,
            'usedInBuild': 0,
            'commited': 0,
            'backOrdered': 0,
            'componentYield': 0,
            'bomQuantity': 0,
            'units': '',
            'presentOnWoLine': ''
        }
        try {
            const workOrderRecord = record.load({
                type: record.Type.WORK_ORDER,
                id: workOrderId,
                isDynamic: false
            })
            const itemLineCount = workOrderRecord.getLineCount({
                sublistId: 'item'
            })
            let itemsDataArr = [];
            if (itemLineCount > 0) {
                for (let lineIndex = 0; lineIndex < itemLineCount; lineIndex++) {
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    res.itemText = workOrderRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: lineIndex
                    })
                    res.itemId = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: lineIndex
                    })
                    res.quantity = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: lineIndex
                    })
                    res.usedInBuild = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantityfulfilled',
                        line: lineIndex
                    })
                    res.commited = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantitycommitted',
                        line: lineIndex
                    })
                    res.backOrdered = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantitybackordered',
                        line: lineIndex
                    })
                    res.componentYield = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'componentyield',
                        line: lineIndex
                    })
                    res.bomQuantity = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'bomquantity',
                        line: lineIndex
                    })
                    res.units = workOrderRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: lineIndex
                    })
                    res.presentOnWoLine = workOrderRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'line',
                        line: lineIndex
                    })
                    itemsDataArr.push(res);
                }
                return { 'hasContent': true, 'data': itemsDataArr, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'errorMessage': "No Item Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            return { 'hasContent': false, 'errorMessage': error.message, 'data': [], 'keys': keyObjects }
        }
    }

    const getManufacturingOperationTaskData = (workOrderId) => {
        let keyObjects = {
            'operationSequence': '',
            'operationName': '',
            'workCenter': 0,
            'predecessor': 0,
            'operationStartDateTime': '',
            'operationEndDateTime': '',
            'inputQuantity': 0,
            'completedQuantity': 0,
            'setupTime': 0,
            'runRate': '',
            'units': ''
        }
        try {
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
                            name: "sequence",
                            join: "manufacturingOperationTask",
                            label: "Operation Sequence"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "manufacturingOperationTask",
                            label: "Operation Name"
                        }),
                        search.createColumn({
                            name: "manufacturingworkcenter",
                            join: "manufacturingOperationTask",
                            label: "Manufacturing Work Center"
                        }),
                        search.createColumn({
                            name: "predecessor",
                            join: "manufacturingOperationTask",
                            label: "Predecessor"
                        }),
                        search.createColumn({
                            name: "startdatetime",
                            join: "manufacturingOperationTask",
                            label: "Start Date/Time"
                        }),
                        search.createColumn({
                            name: "enddatetime",
                            join: "manufacturingOperationTask",
                            label: "End Date/Time"
                        }),
                        search.createColumn({
                            name: "inputquantity",
                            join: "manufacturingOperationTask",
                            label: "Input Quantity"
                        }),
                        search.createColumn({
                            name: "completedquantity",
                            join: "manufacturingOperationTask",
                            label: "Completed Quantity"
                        }),
                        search.createColumn({
                            name: "setuptime",
                            join: "manufacturingOperationTask",
                            label: "Setup Time (Min)"
                        }),
                        search.createColumn({
                            name: "runrate",
                            join: "manufacturingOperationTask",
                            label: "Run Rate (Min/Unit)"
                        }),
                        search.createColumn({ name: "unit", label: "Units" })
                    ]
            });
            var searchResultCount = workorderSearchObj.runPaged().count;
            log.debug("workorderSearchObj result count", searchResultCount);
            let manufacturingOperationTaskDataArr = []
            if (searchResultCount > 0) {
                workorderSearchObj.run().each(function (result) {
                    let res = JSON.parse(JSON.stringify(keyObjects))
                    res.operationSequence = result.getValue({
                        name: "sequence",
                        join: "manufacturingOperationTask"
                    })
                    res.operationName = result.getValue({
                        name: "name",
                        join: "manufacturingOperationTask"
                    })
                    res.workCenter = result.getText({
                        name: "manufacturingworkcenter",
                        join: "manufacturingOperationTask"
                    })

                    res.predecessor = result.getText({
                        name: "predecessor",
                        join: "manufacturingOperationTask"
                    })
                    res.operationStartDateTime = result.getValue({
                        name: "startdatetime",
                        join: "manufacturingOperationTask"
                    })
                    res.operationEndDateTime = result.getValue({
                        name: "enddatetime",
                        join: "manufacturingOperationTask"
                    })
                    res.inputQuantity = result.getValue({
                        name: "inputquantity",
                        join: "manufacturingOperationTask"
                    })
                    res.completedQuantity = result.getValue({
                        name: "completedquantity",
                        join: "manufacturingOperationTask"
                    })
                    res.setupTime = result.getValue({
                        name: "setuptime",
                        join: "manufacturingOperationTask"
                    })
                    res.runRate = result.getValue({
                        name: "runrate",
                        join: "manufacturingOperationTask"
                    })
                    res.units = result.getValue({ name: "unit", label: "Units" })

                    manufacturingOperationTaskDataArr.push(res)
                    return true;
                });
                return { 'hasContent': true, 'data': manufacturingOperationTaskDataArr, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'errorMessage': "No Item Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            return { 'hasContent': false, 'errorMessage': error.message, 'data': [], 'keys': keyObjects }
        }

    }
    // ----------------------------- getToolFamily Function Start ------------------------------
    const getToolFamily = (workOrderId, operationSequence) => {
        let keyObjects = {
            'toolFamily': '',
            'toolFamilyInternalId': 0,
            'operationSequence': ''
        }
        let toolFamilyArray = [];
        try {
            var customrecord_pct_jason_wo_asmbly_tool_fmSearchObj = search.create({
                type: "customrecord_pct_jason_wo_asmbly_tool_fm",
                filters:
                    [
                        ["custrecord_pct_jason_work_order", "anyof", workOrderId],
                        "AND",
                        ["custrecord_pct_jason_op_number", "equalto", operationSequence],
                        "AND",
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_jason_tool_family", label: "Tool Family" }),
                        search.createColumn({ name: "custrecord_pct_jason_op_number", label: "Operation Number" })
                    ]
            });
            var toolFamilyCount = customrecord_pct_jason_wo_asmbly_tool_fmSearchObj.runPaged().count;
            log.debug("PCT_PMC", `Tool Family Result Count : ${toolFamilyCount}`);
            if (toolFamilyCount > 0) {
                customrecord_pct_jason_wo_asmbly_tool_fmSearchObj.run().each(function (result) {
                    let toolFamilyObj = JSON.parse(JSON.stringify(keyObjects));
                    // toolFamilyObj['internalId'] = result.id;
                    toolFamilyObj.toolFamilyInternalId = result.getText("custrecord_pct_jason_tool_family");
                    toolFamilyObj.toolFamily = result.getValue("custrecord_pct_jason_tool_family");
                    toolFamilyObj.operationSequence = result.getValue("custrecord_pct_jason_op_number");
                    toolFamilyArray.push(toolFamilyObj);
                    return true;
                });
                return { 'hasContent': true, 'data': toolFamilyArray, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'errorMessage': "No Item Found", 'data': toolFamilyArray, 'keys': keyObjects }

        }
        catch (error) {
            return { 'hasContent': false, 'errorMessage': error.message, 'data': toolFamilyArray, 'keys': keyObjects }
        }
    }

    // ----------------------------- getToolFamily Function End ----------------------------------

    const getPMCTransactionDetails = (workOrderId, operationTaskId) => {
        let keyObjects = {
            'pmcTransactionName': '',
            'operationSequence': '',
            'operationTask': '',
            'workCneter': '',
            'workOrder': '',
            'employee': '',
            'resultStartDate': '',
            'resultEndDate': '',
            'productionQuantity': '',
            'completionNumber': '',
            'operationStatus': '',
            'downtimeTotalDuration': 0,
            'downtimeCategory': '',
            'downtimeReason': '',
            'downtimeStartTime': '',
            'downtimeEndTime': '',
            'downtimeDuration': 0
        }
        let pmcTransactionArr = []
        try {
            var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
                type: "customrecord_pct_pmc_tran_k_fab",
                filters:
                    [
                        ["custrecord_pct_kfab_wo", "anyof", workOrderId],
                        "AND",
                        ["custrecord_pct_kfab_man_op_task", "anyof", operationTaskId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "custrecord_pct_kfab_p_seq", label: "Operation Sequence" }),
                        search.createColumn({ name: "custrecord_pct_kfab_man_op_task", label: "Manufacturing Operation Task" }),
                        search.createColumn({ name: "custrecord_pct_kfab_wo_center", label: "Work Center" }),
                        search.createColumn({ name: "custrecord_pct_kfab_wo", label: "Work Order" }),
                        search.createColumn({ name: "custrecord_pct_kfab_emp", label: "Employee" }),
                        search.createColumn({ name: "custrecord_pct_kfab_res_start_date", label: "Result Start Date Time" }),
                        search.createColumn({ name: "custrecord_pct_kfab_res_end_date", label: "Result End Date Time" }),
                        search.createColumn({ name: "custrecord_pct_kfab_prod_qty", label: "Production Quantity" }),
                        search.createColumn({ name: "custrecord_pct_pmc_completion_number", label: "Completion Number" }),
                        search.createColumn({ name: "custrecord_pct_kfab_op_status", label: "Operation Status" }),
                        search.createColumn({ name: "custrecord_pct_pmc_dwn_duration", label: "DOWNTIME TOTAL DURATION" }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_down_cat",
                            join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                            label: "Category"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_down_reason",
                            join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                            label: "Reason"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_down_start_time",
                            join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                            label: "Start Time"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_down_end_time",
                            join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                            label: "End Time"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pmc_down_duration",
                            join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                            label: "Duration"
                        })
                    ]
            });
            var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    res.pmcTransactionName = result.getValue({ name: "name" });
                    res.operationSequence = result.getValue({ name: "custrecord_pct_kfab_p_seq" });
                    res.operationTask = result.getText({ name: "custrecord_pct_kfab_man_op_task" })
                    res.workCneter = result.getText({ name: "custrecord_pct_kfab_wo_center" })

                    res.workOrder = result.getText({ name: "custrecord_pct_kfab_wo" })
                    res.employee = result.getText({ name: "custrecord_pct_kfab_emp" })
                    res.resultStartDate = result.getValue({ name: "custrecord_pct_kfab_res_start_date" })
                    res.resultEndDate = result.getValue({ name: "custrecord_pct_kfab_res_end_date" })
                    res.productionQuantity = result.getValue({ name: "custrecord_pct_kfab_prod_qty" })
                    res.completionNumber = result.getText({ name: "custrecord_pct_pmc_completion_number" })
                    res.operationStatus = result.getText({ name: "custrecord_pct_kfab_op_status" })
                    res.downtimeTotalDuration = result.getValue({ name: "custrecord_pct_pmc_dwn_duration" })
                    res.downtimeCategory = result.getText({
                        name: "custrecord_pct_pmc_down_reason",
                        join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK"
                    })
                    res.downtimeReason = result.getText({
                        name: "custrecord_pct_pmc_down_reason",
                        join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK"
                    })
                    res.downtimeStartTime = result.getValue({
                        name: "custrecord_pct_pmc_down_start_time",
                        join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK"
                    })
                    res.downtimeEndTime = result.getValue({
                        name: "custrecord_pct_pmc_down_end_time",
                        join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK"
                    })
                    res.downtimeDuration = result.getValue({
                        name: "custrecord_pct_pmc_down_duration",
                        join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK"
                    })
                    pmcTransactionArr.push(res)
                    return true;
                });
                return { 'hasContent': true, 'data': pmcTransactionArr, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'data': pmcTransactionArr, 'keys': keyObjects, 'errorMessage': 'No data found' }
        }
        catch (error) {
            return { 'hasContent': false, 'data': pmcTransactionArr, 'keys': keyObjects, 'errorMessage': error.message }
        }
    }

    // ----------------------------- Get Serialized Tool Function Start ------------------------------
    const getSerializedTool = (toolArray) => {

        let keyObjects = {
            'internalId': 0,
            'name': '',
            'toolItem': '',
            'serializedTool': '',
            'toolLife': '',
            'toolStatus': '',
            'checkIn': ''
        }
        try {
            var customrecord_pct_toolSearchObj = search.create({
                type: "customrecord_pct_tool",
                filters:
                    [
                        ["custrecord_pct_tool_item_no", "anyof", toolArray],
                        "AND",
                        ["custrecord_pct_tool_status", "anyof", "2"],
                        "AND",
                        ['isinactive', "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "scriptid", label: "Script ID" }),
                        search.createColumn({ name: "custrecord_pct_tool_item_no", label: "Tool Item #" }),
                        search.createColumn({ name: "custrecord_tool_srl_no", label: "Serialized Tool" }),
                        search.createColumn({ name: "custrecord_tool_life", label: "Tool Life" }),
                        search.createColumn({ name: "custrecord_pct_created_from", label: "Created From" }),
                        search.createColumn({ name: "custrecord_pct_tool_status", label: "Tool Status" })
                    ]
            })
            var serializedToolCount = customrecord_pct_toolSearchObj.runPaged().count;
            log.debug("PCT-PMC", "Serialized Tool Result Count : " + serializedToolCount);
            if (serializedToolCount > 0) {
                let serializedToolArray = [];
                customrecord_pct_toolSearchObj.run().each(function (result) {
                    let serializedToolObj = JSON.parse(JSON.stringify(keyObjects));
                    serializedToolObj.internalId = result.id;
                    serializedToolObj.name = result.getValue("name");
                    serializedToolObj.toolItem = result.getText("custrecord_pct_tool_item_no");
                    serializedToolObj.serializedTool = result.getText("custrecord_tool_srl_no");
                    serializedToolObj.toolLife = result.getValue("custrecord_tool_life");
                    serializedToolObj.toolStatus = result.getText("custrecord_pct_tool_status");
                    serializedToolObj.checkIn = '<button type="button" class="btn btn-primary btn-sm checkIn">Check In</button>';
                    serializedToolArray.push(serializedToolObj);
                    return true;
                });
                // serializedToolArray.push({ 'title': '', 'defaultContent': '<button type="button" class="btn btn-primary btn-sm inventoryDetail">Process</button>' });

                return { 'hasContent': true, 'data': serializedToolArray, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'errorMessage': "No Serialized Tool Found", 'data': [], 'keys': keyObjects }

        }
        catch (error) {
            return { 'hasContent': false, 'errorMessage': error.message, 'data': [], 'keys': keyObjects }
        }

    }
    // ----------------------------- Get Serialized Tool Function End ------------------------------

    // ---------------------------- Get Work Instruction Data Start --------------------------------
    const getWorkInstructionData = (itemId) => {
        let keyObjects = {
            // 'item': '',
            // 'itemId': '',
            'operationSequence': '',
            'workinstruction': '',
            'url': ''
        }
        try {
            var customrecord_pct_pmc_work_instructionSearchObj = search.create({
                type: "customrecord_pct_pmc_work_instruction",
                filters:
                    [
                        ["custrecord_pct_pmc_work_ins_item", "anyof", itemId]
                    ],
                columns:
                    [
                        // search.createColumn({ name: "custrecord_pct_pmc_work_ins_item", label: "ITEM" }),
                        search.createColumn({ name: "custrecord_pct_pmc_work_instruction", label: "FOLDER" }),
                        search.createColumn({ name: "custrecord_pct_pmc_operation_sequence", label: "File Name" }),
                        search.createColumn({ name: "custrecord_pct_pmc_work_ins_url", label: "url" })
                    ]
            });
            var searchResultCount = customrecord_pct_pmc_work_instructionSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_work_instructionSearchObj result count", searchResultCount);
            let dataArr = [];
            if (searchResultCount > 0) {
                customrecord_pct_pmc_work_instructionSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    // res.item = result.getText({ name: "custrecord_pct_pmc_work_ins_item" })
                    // res.itemId = result.getValue({ name: "custrecord_pct_pmc_work_ins_item" })
                    res.operationSequence = result.getValue({ name: "custrecord_pct_pmc_operation_sequence" })
                    res.workinstruction = result.getValue({ name: "custrecord_pct_pmc_work_instruction" })
                    res.url = result.getValue({ name: "custrecord_pct_pmc_work_ins_url" })
                    dataArr.push(res);
                    return true;
                });
                return { 'isSuccess': true, 'data': dataArr, 'keys': keyObjects }
            }
            return { 'isSuccess': false, 'errorMessage': "No data Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': "No data Found", 'data': [], 'keys': keyObjects }
        }
    }
    // ---------------------------- Get Work Instruction Data End ----------------------------------

    // ---------------------------- Get Process Inputs Data Start -----------------------------------
    const getProcessInputsData = (workOrderId, workCenterId) => {
        let keyObjects = {
            'workOrder': '',
            'workCenter': '',
            'textQc1': '',
            'textQc2': '',
            'textQc3': '',
            'textQc4': '',
            'textQc5': '',
            'textQc6': '',
            'textQc7': '',
            'textQc8': '',
            'textQc9': '',
            'textQc10': '',
        }
        try {
            var customrecord_pct_process_inputsSearchObj = search.create({
                type: "customrecord_pct_process_inputs",
                filters:
                    [
                        ["custrecord_pct_wc_pro_in", "anyof", workCenterId],
                        "AND",
                        ["custrecord_pct_wo_pro_in", "anyof", workOrderId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "scriptid",
                            sort: search.Sort.ASC,
                            label: "Script ID"
                        }),
                        search.createColumn({ name: "custrecord_pct_wo_pro_in", label: "Work Order" }),
                        search.createColumn({ name: "custrecord_pct_wc_pro_in", label: "Work Center" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_1", label: "Weight" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_2", label: "Text QC 2" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_3", label: "Text QC 3" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_4", label: "Text QC 4" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_5", label: "Text QC 5" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_6", label: "Text QC 6" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_7", label: "Text QC 7" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_8", label: "Text QC 8" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_9", label: "Text QC 9" }),
                        search.createColumn({ name: "custrecord_pct_text_qc_10", label: "Text QC 10" })
                    ]
            });
            var searchResultCount = customrecord_pct_process_inputsSearchObj.runPaged().count;
            log.debug("customrecord_pct_process_inputsSearchObj result count", searchResultCount);
            let dataArr = [];
            if (searchResultCount > 0) {
                customrecord_pct_process_inputsSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    res.workOrder = result.getText({ name: "custrecord_pct_wo_pro_in" });
                    res.workCenter = result.getText({ name: "custrecord_pct_wc_pro_in" });
                    res.textQc1 = result.getValue({ name: "custrecord_pct_text_qc_1" });
                    res.textQc2 = result.getValue({ name: "custrecord_pct_text_qc_2" });
                    res.textQc3 = result.getValue({ name: "custrecord_pct_text_qc_3" });
                    res.textQc4 = result.getValue({ name: "custrecord_pct_text_qc_4" });
                    res.textQc5 = result.getValue({ name: "custrecord_pct_text_qc_5" });
                    res.textQc6 = result.getValue({ name: "custrecord_pct_text_qc_6" });
                    res.textQc7 = result.getValue({ name: "custrecord_pct_text_qc_7" });
                    res.textQc8 = result.getValue({ name: "custrecord_pct_text_qc_8" });
                    res.textQc9 = result.getValue({ name: "custrecord_pct_text_qc_9" });
                    res.textQc10 = result.getValue({ name: "custrecord_pct_text_qc_10" });
                    dataArr.push(res)
                    return true;
                });
                return { 'isSuccess': true, 'data': dataArr, 'keys': keyObjects }
            }
            return { 'isSuccess': false, 'errorMessage': "No data Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': "No data Found", 'data': [], 'keys': keyObjects }
        }
    }
    // ---------------------------- Get Process Inputs Data End -------------------------------------

    // ---------------------------- Get Committed Data in WO  Start ---------------------------------
    const getWorkOrderCommittedQuantity = () => {
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", "2280"],
                    "AND",
                    ["item", "anyof", "233"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["inventorydetail.quantity", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({
                        name: "inventorynumber",
                        join: "inventoryDetail",
                        label: " Number"
                    }),
                    search.createColumn({
                        name: "binnumber",
                        join: "inventoryDetail",
                        label: "Bin Number"
                    }),
                    search.createColumn({
                        name: "quantity",
                        join: "inventoryDetail",
                        label: "Quantity"
                    }),
                    search.createColumn({
                        name: "item",
                        join: "inventoryDetail",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "location",
                        join: "inventoryDetail",
                        label: "Location"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            return true;
        });
    }
    // ---------------------------- Get Committed Data in WO  End -----------------------------------

    const getTableHeaders = () => {
        return {
            'itemsTableTitleArr': ['Item', 'ItemId', 'Quantity', 'Issued', 'Committed', 'Back Ordered', 'Component Yield', 'BOM Quantity', 'Units', 'Line No'],
            'routingTableTitleArr': ['Operation Sequence', 'Operation Name', 'Work Center', 'Predecessor', 'Start Date', 'End Date', 'WO Quantity', 'Completed Quantity', 'Setup Time', 'Run Time', "Units"],
            'toolFamilyTableTitleArr': ['Tool Family Internal Id', 'Tool Family', 'Operation Number'],
            'pmcTransactionTableTitleArr': ['PMC Transaction', 'Operation Sequence', 'Operation Task', 'Work Center', 'Work Order', 'Employee', 'Result Start Date', 'Result End Date', 'Production Quantity', 'Completion Number', 'Operation Status', 'Downtime Total Duration', 'Downtime Category', 'Downtime Reason', 'Downtime Start Date/Time', 'Downtime End Date/Time', 'Downtime Duration'],
            'serializedToolTitleArr': ['Internal Id', 'Name', 'Tool Item', 'Serialized Tool', 'Tool Life', 'Tool Status'],
            'workInstructionTitleArr': ['Operation Sequence', 'Work Instruction', 'URL'],
            'processInputsTitleArr': ['Work Order', 'Work Center', 'Text QC 1', 'Text QC 2', 'Text QC 3', 'Text QC 4', 'Text QC 5', 'Text QC 6', 'Text QC 7', 'Text QC 8', 'Text QC 9', 'Text QC 10']
        }
    }

    const generateTableHeader = (keysArr, titleArr) => {
        let columnsArr = [];
        Object.keys(keysArr).forEach((element, index) => {
            let obj = {}
            obj['data'] = element;
            obj['title'] = titleArr[index];
            columnsArr.push(obj);
        });
        return columnsArr;
    }

    return {
        get: _get
    }
});