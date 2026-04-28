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
            let toolFamilyTaskDetails = getToolRouting(itemId);
            let PMCworkInstructionDetails = getWorkInstructionData(workOrderId, operationSequence);
            let workInstructionDetails = getWorkInstructionData(workOrderId, operationSequence);//getPMCWorkInstructionData(workOrderId);
            let processInputsDetails = getProcessInputsData(workOrderId, workCenterId)
            let pmcTransactionDetails = getPMCTransactionDetails(workOrderId, operationTaskId);
            let serializedToolTaskDetails = getSerializedTool(workOrderId);
            let isLastOperation = checkIsLastOperation(workOrderId, operationTaskId)

            let tableHeaders = getTableHeaders()
            workOrderItemDetails['columnsArr'] = generateTableHeader(workOrderItemDetails.keys, tableHeaders.itemsTableTitleArr)
            workOrderOperationTaskDetails['columnsArr'] = generateTableHeader(workOrderOperationTaskDetails.keys, tableHeaders.routingTableTitleArr)
            toolFamilyTaskDetails['columnsArr'] = generateTableHeader(toolFamilyTaskDetails.keys, tableHeaders.toolFamilyTableTitleArr);
            pmcTransactionDetails['columnsArr'] = generateTableHeader(pmcTransactionDetails.keys, tableHeaders.pmcTransactionTableTitleArr);
            serializedToolTaskDetails['columnsArr'] = generateTableHeader(serializedToolTaskDetails.keys, tableHeaders.serializedToolTitleArr);
            PMCworkInstructionDetails['columnsArr'] = generateTableHeader(PMCworkInstructionDetails.keys, tableHeaders.workInstructionTitleArr);
            workInstructionDetails['columnsArr'] = generateTableHeader(workInstructionDetails.keys, tableHeaders.PMCworkInstructionTitleArr);
            processInputsDetails['columnsArr'] = generateTableHeader(processInputsDetails.keys, tableHeaders.processInputsTitleArr)

            return { 'isSuccess': true, 'workOrderItemDetails': workOrderItemDetails, 'workOrderOperationTaskDetails': workOrderOperationTaskDetails, 'toolFamilyDetails': toolFamilyTaskDetails, 'pmcTransactionDetails': pmcTransactionDetails, 'serializedToolDetails': serializedToolTaskDetails, 'PMCworkInstructionDetails': PMCworkInstructionDetails, 'workInstructionDetails': workInstructionDetails, 'processInputDetails': processInputsDetails, 'isLastOperation': isLastOperation.isSuccess }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    const getWorkOrderItemDetails = (workOrderId) => {
        let keyObjects = {
            'itemText': '',
            'itemDesc': '',
            'itemId': '',
            'quantity': 0,
            'usedInBuild': 0,
           // 'commited': 0,
           // 'backOrdered': 0,
           // 'componentYield': 0,
           // 'bomQuantity': 0,
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
                    res.itemDesc = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
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
                    // log.debug("PCT-BOM", workOrderRecord.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'bomquantity',
                    //     line: lineIndex
                    // }))
                    // res.bomQuantity = workOrderRecord.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'bomquantity',
                    //     line: lineIndex
                    // })
                    // res.bomQuantity = workOrderRecord.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'custcol_oct_iea',
                    //     line: lineIndex
                    // })
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
                log.debug("PCT", JSON.stringify(itemsDataArr))
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
            'runRate': ''
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
                            name: "startdate",
                            join: "manufacturingOperationTask",
                            label: "Start Date/Time"
                        }),
                        search.createColumn({
                            name: "enddate",
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
                        })
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
                        name: "startdate",
                        join: "manufacturingOperationTask"
                    })
                    res.operationEndDateTime = result.getValue({
                        name: "enddate",
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
                    manufacturingOperationTaskDataArr.push(res)
                    // log.debug({
                    //     title: 'res',
                    //     details: JSON.stringify(res)
                    // })
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
    // ----------------------------- getToolRouting Function Start ------------------------------
    const getToolRouting = (itemId) => {
        let keyObjects = {
            'internalId': 0,
            'name': '',
            'routingName': '',
            'toolItem': '',
            'usedInStepNumber': '',
            'available': false,
            'quantity': 0,
            // 'serializedTool': '',
            // 'serializedToolLocation': '',
        }
        let toolFamilyArray = [];
        try {
            // var customrecord_pct_jason_wo_asmbly_tool_fmSearchObj = search.create({
            //     type: "customrecord_pct_jason_wo_asmbly_tool_fm",
            //     filters:
            //         [
            //             ["custrecord_pct_jason_work_order", "anyof", workOrderId],
            //             "AND",
            //             ["custrecord_pct_jason_op_number", "equalto", operationSequence],
            //             "AND",
            //             ["isinactive", "is", "F"]
            //         ],
            //     columns:
            //         [
            //             search.createColumn({ name: "custrecord_pct_jason_tool_family", label: "Tool Family" }),
            //             search.createColumn({ name: "custrecord_pct_jason_op_number", label: "Operation Number" })
            //         ]
            // });
            var customrecord_rec_tool_routingSearchObj = search.create({
                type: "customrecord_rec_tool_routing",
                filters:
                    [
                        ["custrecord_tool_assm_used", "anyof", itemId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({ name: "altname", label: "Name" }),
                        search.createColumn({ name: "custrecord_tool_item", label: "Tool Item #" }),
                        search.createColumn({ name: "custrecord_tool_assm_used", label: "Assembly Used" }),
                        search.createColumn({ name: "custrecord_used_in_step", label: "Used in Step Number" }),
                        search.createColumn({ name: "custrecord_pct_mott_tool_routing_select", label: "Available" }),
                        search.createColumn({ name: "custrecord_pct_mott_qty", label: "Quantity" }),
                        // search.createColumn({ name: "custrecord_pct_sc_toolrouting_serialtool", label: "Serialized Tool" }),
                        // search.createColumn({
                        //     name: "custrecord_pct_mott_tool_location",
                        //     join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                        //     label: "Tool Location"
                        // })
                    ]
            });
            var toolFamilyCount = customrecord_rec_tool_routingSearchObj.runPaged().count;
            log.debug("PCT_PMC", `Tool Routing Result Count : ${toolFamilyCount}`);
            if (toolFamilyCount > 0) {
                customrecord_rec_tool_routingSearchObj.run().each(function (result) {
                    let toolRoutingObj = JSON.parse(JSON.stringify(keyObjects));
                    toolRoutingObj.internalId = result.id;
                    toolRoutingObj.name = result.getValue({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "ID"
                    });
                    toolRoutingObj.routingName = result.getValue("altname");
                    toolRoutingObj.toolItem = result.getText("custrecord_tool_item");
                    toolRoutingObj.usedInStepNumber = result.getValue("custrecord_used_in_step");
                    toolRoutingObj.available = result.getValue("custrecord_pct_mott_tool_routing_select");
                    toolRoutingObj.quantity = result.getValue("custrecord_pct_mott_qty");
                    // toolRoutingObj.serializedTool = result.getText("custrecord_pct_sc_toolrouting_serialtool");
                    // toolRoutingObj.serializedToolLocation = result.getText({
                    //     name: "custrecord_pct_mott_tool_location",
                    //     join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                    //     label: "Tool Location"
                    // });
                    toolFamilyArray.push(toolRoutingObj);
                    return true;
                });
                return { 'hasContent': true, 'data': toolFamilyArray, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'errorMessage': "No Item Found", 'data': toolFamilyArray, 'keys': keyObjects }

        }
        catch (error) {
            log.error({
                title: 'error',
                details: error
            })
            return { 'hasContent': false, 'errorMessage': error.message, 'data': toolFamilyArray, 'keys': keyObjects }
        }
    }

    // ----------------------------- getToolRouting Function End ----------------------------------

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
            var customrecord_pct_pmc_tranSearchObj = search.create({
                type: "customrecord_pct_pmc_tran",
                filters:
                    [
                        ["custrecord_pct_pmc_wo", "anyof", workOrderId],
                        "AND",
                        ["custrecord_pct_pmc_man_op_task", "anyof", operationTaskId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "custrecord_pct_pmc_p_seq", label: "Operation Sequence" }),
                        search.createColumn({ name: "custrecord_pct_pmc_man_op_task", label: "Manufacturing Operation Task" }),
                        search.createColumn({ name: "custrecord_pct_pmc_wo", label: "Work Center" }),
                        search.createColumn({ name: "custrecord_pct_pmc_wo", label: "Work Order" }),
                        search.createColumn({ name: "custrecord_pct_pmc_emp", label: "Employee" }),
                        search.createColumn({ name: "custrecord_pct_pmc_res_start_date", label: "Result Start Date Time" }),
                        search.createColumn({ name: "custrecord_pct_pmc_res_end_date", label: "Result End Date Time" }),
                        search.createColumn({ name: "custrecord_pct_pmc_prod_qty", label: "Production Quantity" }),
                        search.createColumn({ name: "custrecord_pct_pmc_completion_number", label: "Completion Number" }),
                        search.createColumn({ name: "custrecord_pct_pmc_op_status", label: "Operation Status" }),
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
            var searchResultCount = customrecord_pct_pmc_tranSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_tranSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                customrecord_pct_pmc_tranSearchObj.run().each(function (result) {
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    res.pmcTransactionName = result.getValue({ name: "name" });
                    res.operationSequence = result.getValue({ name: "custrecord_pct_pmc_p_seq" });
                    res.operationTask = result.getText({ name: "custrecord_pct_pmc_man_op_task" })
                    res.workCneter = result.getText({ name: "custrecord_pct_pmc_wo_center" })
                    res.workOrder = result.getText({ name: "custrecord_pct_pmc_wo" })
                    res.employee = result.getText({ name: "custrecord_pct_pmc_emp" })
                    res.resultStartDate = result.getValue({ name: "custrecord_pct_pmc_res_start_date" })
                    res.resultEndDate = result.getValue({ name: "custrecord_pct_pmc_res_end_date" })
                    res.productionQuantity = result.getValue({ name: "custrecord_pct_pmc_prod_qty" })
                    res.completionNumber = result.getText({ name: "custrecord_pct_pmc_completion_number" })
                    res.operationStatus = result.getText({ name: "custrecord_pct_pmc_op_status" })
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
    const getSerializedTool = (workOrderId) => {

        let keyObjects = {
            'toolItem': '',
            'serializedToolInternalId': 0,
            'serializedTool': '',
            'toolLife': '',
            'toolLocation': '',
            'checkIn': ''
        }
        try {
            var customrecord_pct_rec_tool_transactionSearchObj = search.create({
                // type: "customrecord_pct_tool",
                // filters:
                //     [
                //         ["custrecord_pct_tool_item_no", "anyof", toolArray],
                //         "AND",
                //         ["custrecord_pct_tool_status", "anyof", "2"],
                //         "AND",
                //         ['isinactive', "is", "F"]
                //     ],
                // columns:
                //     [
                //         search.createColumn({
                //             name: "name",
                //             sort: search.Sort.ASC,
                //             label: "Name"
                //         }),
                //         search.createColumn({ name: "scriptid", label: "Script ID" }),
                //         search.createColumn({ name: "custrecord_pct_tool_item_no", label: "Tool Item #" }),
                //         search.createColumn({ name: "custrecord_tool_srl_no", label: "Serialized Tool" }),
                //         search.createColumn({ name: "custrecord_tool_life", label: "Tool Life" }),
                //         search.createColumn({ name: "custrecord_pct_created_from", label: "Created From" }),
                //         search.createColumn({ name: "custrecord_pct_tool_status", label: "Tool Status" })
                //     ]
                type: "customrecord_pct_rec_tool_transaction",
                filters:
                    [
                        ["custrecord_pct_wo_checked_out_to", "anyof", workOrderId],
                        "AND",
                        ["custrecord_pct_trans_tool.custrecord_pct_tool_status", "anyof", "2"],
                        "AND",
                        ['isinactive', "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_trans_tool_item",
                            summary: "GROUP",
                            label: "Tool Item #"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_trans_tool",
                            summary: "GROUP",
                            label: "Serialized Tool"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_TRANS_TOOL",
                            summary: "GROUP",
                            label: "Serialized Tool Id"
                        }),
                        search.createColumn({
                            name: "custrecord_tool_life",
                            join: "CUSTRECORD_PCT_TRANS_TOOL",
                            summary: "GROUP",
                            label: "Tool Life"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_mott_tool_location",
                            join: "CUSTRECORD_PCT_TRANS_TOOL",
                            summary: "GROUP",
                            label: "Tool Location"
                        }),
                    ]
            })
            var toolTransactionCount = customrecord_pct_rec_tool_transactionSearchObj.runPaged().count;
            log.debug("PCT-PMC", "Tool Result Count : " + toolTransactionCount);
            if (toolTransactionCount > 0) {
                let serializedToolArray = [];
                customrecord_pct_rec_tool_transactionSearchObj.run().each(function (result) {
                    let serializedToolObj = JSON.parse(JSON.stringify(keyObjects));

                    // serializedToolObj.name = result.getValue({ name: "name", sort: search.Sort.ASC, label: "ID" });
                    serializedToolObj.toolItem = result.getText({
                        name: "custrecord_trans_tool_item",
                        summary: "GROUP",
                        label: "Tool Item #"
                    });
                    serializedToolObj.serializedToolInternalId = result.getValue({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_TRANS_TOOL",
                        summary: "GROUP",
                        label: "Internal ID"
                    });
                    serializedToolObj.serializedTool = result.getText({
                        name: "custrecord_pct_trans_tool",
                        summary: "GROUP",
                        label: "Serialized Tool"
                    });
                    serializedToolObj.toolLife = result.getValue({
                        name: "custrecord_tool_life",
                        join: "CUSTRECORD_PCT_TRANS_TOOL",
                        summary: "GROUP",
                        label: "Tool Life"
                    });
                    serializedToolObj.toolLocation = result.getText({
                        name: "custrecord_pct_mott_tool_location",
                        join: "CUSTRECORD_PCT_TRANS_TOOL",
                        summary: "GROUP",
                        label: "Tool Location"
                    });

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

    const getWorkInstructionData = (workOrderId, operationSequence) => {
        log.debug({
            title: 'getWorkInstructionData',
            details: 'getWorkInstructionData = ' + workOrderId
        })
        let keyObjects = {
            'operationSequence': '',
            // 'operationName': '',
            //'WorkCenter': '',
            'workInstruction': '',
            'workInstructionurl': '',
            //'url': ''
        }
        try {
            var customrecord_pct_pmc_work_instructionSearchObj = search.create({
                type: "customrecord_pct_pmc_instruction",
                filters:
                    [
                        ["custrecord_pct_pmc_ins_workorder", "anyof", workOrderId],
                        "AND",
                        ["custrecord_pct_pmc_ins_op_seq", "is", operationSequence]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pmc_ins_op_seq", label: "OPERATION SEQUENCE" }),
                        //search.createColumn({ name: "custrecord_pct_pmc_ins_op_name", label: "OPERATION NAME" }),
                        //search.createColumn({ name: "custrecord_pct_pmc_ins_work_center", label: "WORK CENTER" }),
                        search.createColumn({ name: "custrecord_pct_pmc_ins_work_ins", label: "WORK INSTRUCTIONS" }),
                        search.createColumn({ name: "custrecord_pct_pmc_ins_url", label: "WORK INSTRUCTIONS URL" })
                    ]
            });
            var searchResultCount = customrecord_pct_pmc_work_instructionSearchObj.runPaged().count;
            log.debug("customrecord_pct_pmc_work_instructionSearchObj result count", searchResultCount);
            let dataArr = [];
            if (searchResultCount > 0) {
                customrecord_pct_pmc_work_instructionSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    res.operationSequence = result.getValue({ name: "custrecord_pct_pmc_ins_op_seq" })
                    //  res.operationName = result.getValue({ name: "custrecord_pct_pmc_ins_op_name" })
                   // res.WorkCenter = result.getText({ name: "custrecord_pct_pmc_ins_work_center" })
                    res.workInstruction = result.getValue({ name: "custrecord_pct_pmc_ins_work_ins" })
                    var url = result.getValue({ name: "custrecord_pct_pmc_ins_url" })
                    res.workInstructionurl = url//`<a href='${url}' target="_blank">${url}</a>`

                    dataArr.push(res);
                    return true;
                });
                return { 'isSuccess': true, 'data': dataArr, 'keys': keyObjects }
            }
            return { 'isSuccess': false, 'errorMessage': "No data Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            log.debug({
                title: 'error',
                details: error
            })
            return { 'isSuccess': false, 'errorMessage': "No data Found", 'data': [], 'keys': keyObjects }
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    // ---------------------------- Get PMC Work Instruction Data Start --------------------------------
    const getPMCWorkInstructionData = (workOrderId) => {
        let keyObjects = {
            // 'item': '',
            // 'itemId': '',
            // 'folder': '',
            'file': '',
            'url': ''
        }
        // return true
        try {
            var customrecord_pct_pmc_work_instructionSearchObj = search.create({
                type: "customrecord_pct_pmc_work_instruction_wo",
                filters:
                    [
                        ["custrecord_pct_pmc_instruction_wo", "anyof", workOrderId]
                    ],
                columns:
                    [
                        //search.createColumn({ name: "custrecord_pct_pmc_work_ins_item", label: "ITEM" }),
                        //search.createColumn({ name: "custrecord_pct_pmc_work_ins_folder_wo", label: "FOLDER" }),
                        search.createColumn({ name: "custrecord_pct_pmc_work_ins_file_wo", label: "File Name" }),
                        search.createColumn({ name: "custrecord_pct_pmc_work_ins_url_wo", label: "url" })
                    ]
            });
            var searchResultCount = customrecord_pct_pmc_work_instructionSearchObj.runPaged().count;
            log.debug("11customrecord_pct_pmc_work_instructionSearchObj result count", searchResultCount);
            let dataArr = [];
            if (searchResultCount > 0) {
                customrecord_pct_pmc_work_instructionSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    // res.item = result.getText({ name: "custrecord_pct_pmc_work_ins_item" })
                    // res.itemId = result.getValue({ name: "custrecord_pct_pmc_work_ins_item" })
                    // res.folder = result.getValue({ name: "custrecord_pct_pmc_work_ins_folder_wo" })
                    res.file = result.getValue({ name: "custrecord_pct_pmc_work_ins_file_wo" })
                    res.url = result.getValue({ name: "custrecord_pct_pmc_work_ins_url_wo" })
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

    // ---------------------------- Check if last operation Start -----------------------------------
    const checkIsLastOperation = (workOrderId, operationTaskId) => {
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
                        name: "internalid",
                        join: "manufacturingOperationTask",
                        sort: search.Sort.DESC,
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "sequence",
                        join: "manufacturingOperationTask",
                        label: "Operation Sequence"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            let searchedOpertionTaskId;
            log.debug("workorderSearchObj result count", searchResultCount);
            workorderSearchObj.run().each(function (result) {
                searchedOpertionTaskId = result.getValue({
                    name: "internalid",
                    join: "manufacturingOperationTask"
                })

            });
            if (operationTaskId.toString() === searchedOpertionTaskId.toString())
                return { 'isSuccess': true };
            return { 'isSuccess': false }
        }
        else {
            return { 'isSuccess': false }
        }
    }
    // ---------------------------- Check if last operation End -------------------------------------

    const getTableHeaders = () => {
        return {
            'itemsTableTitleArr': ['Item', 'Description', 'Item Id', 'Quantity', 'Total Qty Issued', 'Unit of Measure', 'Line No'],//'Remaining Qty', 'Back Ordered', 'Component Yield',
            'routingTableTitleArr': ['Operation Sequence', 'Operation Name', 'Work Center', 'Predecessor', 'Start Date', 'End Date', 'Input Quantity', 'Completed Quantity', 'Setup Time', 'Run Rate'],
            'toolFamilyTableTitleArr': ['Internal Id', 'Document Number', 'Routing Name', 'Tool Item #', 'Used In Step Number', 'Available', 'Quantity'],//, 'Serialized Tool', 'Serialized Tool Location'
            'pmcTransactionTableTitleArr': ['PMC Transaction', 'Operation Sequence', 'Operation Task', 'Work Center', 'Work Order', 'Employee', 'Result Start Date', 'Result End Date', 'Production Quantity', 'Completion Number', 'Operation Status', 'Downtime Total Duration', 'Downtime Category', 'Downtime Reason', 'Downtime Start Date/Time', 'Downtime End Date/Time', 'Downtime Duration'],
            'serializedToolTitleArr': ['Tool Item #', 'Serialized Internal Id', 'Serialized Tool', 'Tool Life', 'Tool Location'],
            'PMCworkInstructionTitleArr': ['File', 'URL'],
            'workInstructionTitleArr': ['OPERATION SEQUENCE',  'WORK INSTRUCTION', 'URL'],//, 'OPERATION NAME', 'WORK CENTER',
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