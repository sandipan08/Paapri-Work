/***********************************************************************************************************************************************

Script Name:        PMC_Controller
Developer:          Subhankar Nath
Development Head:   Mrs.Ratwika Mondol
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for PMC 2.1


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************* Included Functions & Updates **********************************************************
/***********************************************************************************************************************************************

Function Name:                                      Purpose:                                                                                Developer:

displayTimer()                                                                                                  Subhankar Nath
()                                                                  

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

************************************************************************************************************************************************/



/* ------------------------------------------ Global Variables Section Start ------------------------------------------------------------- */

let timerRef = $('#timerDisplay')[0];
let downtimeTimerRef = $('#downtimeTimerDisplay')[0];
let [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0];
let [downtimeHours, downtimeMinutes, downtimeSeconds, downtimeMilliseconds] = [0, 0, 0, 0];
let int, downtimeInt;
let isUserLoggedIn = false;
let openWorkOrderDataTable, workOrderAdditionalDataResponse, workOrderIssueTable, fetchScriptsRestletId, scriptInternalIdObj, loggedInUserDetails, selectedRowData, workOrderIssueModalClone, badgeId, workCenterIdFromWorkCenterView, badgeIdFromWorkCenterView, qualityData, drawingSpecificationDataTable, rowsOnOnePage, selectedNode, nodePosition, pageNumber;
let uiIsBlocked = 0;
let workOrderIssueTableDataObj = {};
let workOrderAdditionalData = {};
let isBinNumberedItem, isserialitem, islotitem, modalInitialRow;
let lotBinData = {};
let woIssueData = {}
let getDataFromRestletRecursivelyFunctionParameter = {
    'searchCount': '',
    'restletData': {},
    'restletUrl': ''
}
let swalAlertObj = {
    'type': 'success',
    'title': '',
    'message': '',
    'timer': 0,
    'showConfirmButton': true,
    'timerProgressBar': false
}
let serializedToolTable;
let measurmentTableDataTable;
let inspectionTableDataTable;
let drawingTableDataTable
// Script Objects
let restletsScriptObj = {
    'customscript_pct_pmc_badgeid_verify': {
        'scriptName': 'PCT_PMC_Badge_Id_Verification',
        'scriptId': 'customscript_pct_pmc_badgeid_verify',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_get_open_work_order': {
        'scriptName': 'PCT PMC Get Open Work Orders',
        'scriptId': 'customscript_pct_pmc_get_open_work_order',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_create_edit_transac': {
        'scriptName': 'PCT PMC Create Edit PMC Transaction',
        'scriptId': 'customscript_pct_pmc_create_edit_transac',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_wo_completion': {
        'scriptName': 'PCT PMC Create Work Order Completion',
        'scriptId': 'customscript_pct_pmc_wo_completion',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_get_wo_data': {
        'scriptName': 'PCT PMC Get WO Item Operation Data',
        'scriptId': 'customscript_pct_pmc_get_wo_data',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_dt_category_reason': {
        'scriptName': 'PCT PMC Get DownTime Category & Reason',
        'scriptId': 'customscript_pct_pmc_dt_category_reason',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_lot_bin_check': {
        'scriptName': 'PCT PMC Lot Bin Check',
        'scriptId': 'customscript_pct_pmc_lot_bin_check',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_wo_issue_lot_search': {
        'scriptName': 'PCT PMC WO Issue Lot Search',
        'scriptId': 'customscript_pct_pmc_wo_issue_lot_search',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_woissue_bin_get_qty': {
        'scriptName': 'PCT PMC WOIssue Bin Quantity Search',
        'scriptId': 'customscript_pct_pmc_woissue_bin_get_qty',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_create_wo_issue': {
        'scriptName': 'PCT PMC Create Work Order Issue',
        'scriptId': 'customscript_pct_pmc_create_wo_issue',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_get_assembly_tool': {
        'scriptName': 'PCT PMC Get Assembly Tool Family',
        'scriptId': 'customscript_pct_pmc_get_assembly_tool',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_create_wo_issue': {
        'scriptName': 'PCT PMC Create Work Order Issue',
        'scriptId': 'customscript_pct_pmc_create_wo_issue',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_get_toolfamily_tabl': {
        'scriptName': 'PCT PMC Get Tool Family Table',
        'scriptId': 'customscript_pct_pmc_get_toolfamily_tabl',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_serialized_tool': {
        'scriptName': 'PCT PMC Serialized Tool Status Change',
        'scriptId': 'customscript_pct_pmc_serialized_tool',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_serialized_checkin': {
        'scriptName': 'PCT PMC Serialized Tool CheckIn',
        'scriptId': 'customscript_pct_pmc_serialized_checkin',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_date_formatter': {
        'scriptName': 'PCT PMC Date Formatter',
        'scriptId': 'customscript_pct_pmc_date_formatter',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_draw_spec_data_get': {
        'scriptName': 'PCT PMC Drawing Specification Data Get',
        'scriptId': 'customscript_pct_pmc_draw_spec_data_get',
        'scriptInternalId': ''
    },
    'customscript_pct_pmc_update_inspection_d': {
        'scriptName': 'PCT PMC Update Inspection Data',
        'scriptId': 'customscript_pct_pmc_update_inspection_d',
        'scriptInternalId': ''
    }
}
// Main Object for DataTable
let dataTableOptionsObj = {
    data: [],
    columns: [],
    processing: true,
    deferRender: true,
    searching: false,
    paging: false,
    destroy: true,
    ordering: false,
    info: false,
}
/* ------------------------------------------ GLobal Variables Section ENd --------------------------------------------------------------- */
$(function () {
    let blurredTime;
    let thresoldTime = 5
    $(window).on('focus', function () {
        console.log('Focus');
        let bluredDuration = blurredTime ? new Date().getTime() - blurredTime : 0
        if (selectedRowData && parseFloat(bluredDuration / 60000) > thresoldTime)
            updateOpenWorkOrderTable()
    });
    $(window).on('blur', function () {
        blurredTime = new Date().getTime()
    })
});

$(document).ready(async () => {
    console.log("In Controller");
    workOrderIssueModalClone = $("#woIssueModal").clone(true);
    fetchScriptsRestletId = $('#scriptIdFetchRestletId').html();
    if (localStorage.getItem('userInfo')) {
        // workCenterIdFromWorkCenterView = $('#workCenterId').html();
        loggedInUserDetails = JSON.parse(localStorage.getItem('userInfo'))
    }

    /* --------------------------------------------------- Get Script Id Restlet Call Start ---------------------------------------------- */

    const scriptInternalIdResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${fetchScriptsRestletId}&deploy=1`, restletsScriptObj);
    console.log(scriptInternalIdResponseObj);
    if (scriptInternalIdResponseObj.responseSuccess && scriptInternalIdResponseObj.responseData.isSuccess) {
        scriptInternalIdObj = scriptInternalIdResponseObj.responseData.data
    }
    else {
        generateError({ 'errorMessage': scriptInternalIdResponseObj.responseData.errorMessage })
    }
    enableUI();
    /* --------------------------------------------------- Get Script Id Restlet Call End --------------------------------------------------- */
    if (loggedInUserDetails) {
        let basicDetailsHtml = `<span>Location: ${loggedInUserDetails.locationName}</span><span id='userWorkCenter'> Work Center: ${loggedInUserDetails.pmcWorkCenterName}</span> <span>${generateSelectField({ 'fieldId': 'workCenterFilter', 'fieldName': 'Work Center Filter', 'options': loggedInUserDetails.workCenters })}</span>`
        $('#user').html(loggedInUserDetails.employeeName)
        $('#logOut').attr('hidden', false)
        $("#logInFormContainer").attr('hidden', true);
        $('#basicDetails').html(basicDetailsHtml);
        $('#basicDetailsContainers').attr('hidden', false);
        $('#workCenterFilter').val(loggedInUserDetails.pmcWorkCenter)
        let hasDatatableGenarated = await getOpenWorkOrders()
        if (hasDatatableGenarated.isSuccess) {
            $("#openWorkOrderContainer").attr('hidden', false);
        }
        else {
            generateError({ 'errorMessage': 'No Open work orders found' })
        }
        enableUI()
    }
    else {
        $('#logInFormContainer').attr('hidden', false);
    }

    /* --------------------------------------------------- Login Function Start ------------------------------------------------------------- */
    $('#logIn').click(async (e) => {
        e.preventDefault()
        badgeId = $('#badgeId').val();
        const employeeDetailsObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_badgeid_verify.scriptInternalId}&deploy=1&badgeId=${badgeId}`)
        if (employeeDetailsObj.responseSuccess && employeeDetailsObj.responseData.isSuccess) {
            isUserLoggedIn = true;
            loggedInUserDetails = employeeDetailsObj.responseData.data;
            console.log(loggedInUserDetails);
            let basicDetailsHtml = `<span>Location: ${loggedInUserDetails.locationName}</span><span id='userWorkCenter'> Work Center: ${loggedInUserDetails.pmcWorkCenterName}</span> <span>${generateSelectField({ 'fieldId': 'workCenterFilter', 'fieldName': 'Work Center Filter', 'options': loggedInUserDetails.workCenters })}</span>`
            $('#user').html(loggedInUserDetails.employeeName)
            $('#logOut').attr('hidden', false)
            $('#logInFormContainer').attr('hidden', true)
            $('#basicDetails').html(basicDetailsHtml);
            $('#basicDetailsContainers').attr('hidden', false);
            $('#workCenterFilter').val(loggedInUserDetails.pmcWorkCenter)
            if (loggedInUserDetails.userRole !== 3) {
                $('#workCenterFilter').attr('disabled', true)
            }
            let hasDatatableGenarated = await getOpenWorkOrders()
            if (hasDatatableGenarated.isSuccess) {
                $("#openWorkOrderContainer").attr('hidden', false);
            }
            else {
                generateError({ 'errorMessage': 'No Open work orders found' })
            }
        }
        else {
            generateError({ 'errorMessage': 'Badge Id Not found' })
        }
        enableUI()
    })
    /* --------------------------------------------------- Login Function End ------------------------------------------------------------------ */

    /* --------------------------------------------------- Logout Function Start --------------------------------------------------------------- */
    $('#logOut').click(() => {
        localStorage.clear();
        window.location.reload();
    })
    /* --------------------------------------------------- Logout Function End ----------------------------------------------------------------- */

    /* --------------------------------------------------- Work Center Filter Function Start --------------------------------------------------- */
    $(document).on('change', '#workCenterFilter', async (e) => {
        let workCenter = $(e.target).val()
        let workCenterText = e.target.options[e.target.selectedIndex].text;
        $('#userWorkCenter').html(workCenterText)
        loggedInUserDetails.pmcWorkCenter = workCenter;
        let hasDatatableGenarated = await getOpenWorkOrders()
        if (hasDatatableGenarated.isSuccess) {
            $("#openWorkOrderContainer").attr('hidden', false);
        }
        else {
            $("#openWorkOrderContainer").attr('hidden', true);
            generateError({ 'errorMessage': 'No Work Orders Found', 'timer': 0, 'showConfirmButton': true })
        }
        enableUI()
    })
    /* --------------------------------------------------- Work Center Filter Function End ----------------------------------------------------- */

    /* --------------------------------------------------- Record Setup Function Start --------------------------------------------------------- */
    $('#setup').click(async (e) => {
        if (!($(e.target).hasClass('active'))) {
            let pmcTransactionRecordObjForSetup = {
                'recordName': "Setup",
                'employeeId': loggedInUserDetails.internalId,
                'workOrderId': selectedRowData.workOrderId,
                'operationSequence': selectedRowData.operationSequence,
                'workCenterId': selectedRowData.workCenterId,
                'operationStatus': 3, //3 = Running 
                'manufacturingOperationTaskId': selectedRowData.manufacturingOperationTaskId,
                'pmcTransactionId': '',
                'startDate': new Date()
            };
            let response = createEditPmcTransaction(pmcTransactionRecordObjForSetup)
            if (response) {
                generateAlert({
                    'type': 'success',
                    'title': 'Setup Started',
                    'message': '',
                    'timer': 1500,
                    'showConfirmButton': false,
                    'timerProgressBar': true
                })
                $('#production').attr('disabled', true);
                $(e.target).addClass('active')
            }
            else {
                generateError({ 'errorMessage': 'Unexpected Error' })
            }
        }
        else {
            stopTimerClock();
        }
    })
    /* --------------------------------------------------- Record Setup Function End ---------------------------------------------------------------- */

    /* --------------------------------------------------- Record Production Function Start --------------------------------------------------------- */
    $('#production').click(async (e) => {
        if (!($(e.target).hasClass('active'))) {
            let pmcTransactionRecordObjForProduction = {
                'recordName': "Production",
                'employeeId': loggedInUserDetails.internalId,
                'workOrderId': selectedRowData.workOrderId,
                'operationSequence': selectedRowData.operationSequence,
                'workCenterId': selectedRowData.workCenterId,
                'operationStatus': 3, //3 = Running 
                'manufacturingOperationTaskId': selectedRowData.manufacturingOperationTaskId,
                'pmcTransactionId': '',
                'startDate': new Date()
            };
            console.log(new Date());
            let response = createEditPmcTransaction(pmcTransactionRecordObjForProduction)
            if (response) {
                generateAlert({
                    'type': 'success',
                    'title': 'Production Started',
                    'message': '',
                    'timer': 1500,
                    'showConfirmButton': false,
                    'timerProgressBar': true
                })
                $('#setup').attr('disabled', true);
            }
            else {
                generateError({ 'errorMessage': 'Unexpected Error' })
            }
        }
        else {
            stopTimerClock();
        }
    })
    /* --------------------------------------------------- Record Production Function End ----------------------------------------------------------- */

    /* ---------------------------------------------------Work Order Issue Function Start ----------------------------------------------------------- */
    $("#workOrderIssue").click(async () => {
        let selectedRowWorkOrderId = selectedRowData.workOrderId
        let workOderIssueTableData = JSON.parse(JSON.stringify(workOrderAdditionalData[selectedRowWorkOrderId].workOrderItemDetails))
        workOderIssueTableData.columnsArr.push({ 'title': 'Issue Quantity', 'defaultContent': '<input type="number" class="form-control issueQuantity" value="0">' });
        workOderIssueTableData.columnsArr.push({ 'title': '', 'data': null });
        let workOrderIssueOptionsObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        workOrderIssueOptionsObj.data = workOderIssueTableData.data;
        workOrderIssueOptionsObj.columns = workOderIssueTableData.columnsArr;
        workOrderIssueOptionsObj.columnDefs = [
            {
                targets: -1,
                render: function (data, type, row, meta) {
                    return !row.isLotItem && !row.isSerialItem && !row.isBinItem ? `<button type="button" class="btn btn-primary btn-sm inventoryDetail" disabled>Process</button>` : `<button type="button" class="btn btn-primary btn-sm inventoryDetail">Process</button>`
                }
            }
        ]
        workOrderIssueTable = generateDataTable("#workOrderIssueTable", workOrderIssueOptionsObj);
        $("#workOrderIssueTableContainer").attr('hidden', false);
        $(window).scrollTop($("#workOrderIssueTableContainer").position().top);

        $(document).on('click', '.inventoryDetail', async (e) => {
            $("#woIssueModal").replaceWith(workOrderIssueModalClone.clone(true))
            workOrderIssueTableDataObj = {}
            let workOrdetIssueTableItemDefination = {
                'isLotItem': false,
                'isSerialItem': false,
                'hasBinNumber': false,
                'binNumbers': [],
                'lotNumbers': [],
                'serialNumbers': []
            }
            let currentRow = $(e.target).parents('tr');
            let rowIndex = $(currentRow).index()
            let issueQuantity = parseFloat($(currentRow).find('.issueQuantity').val());
            let itemInternalID = workOrderIssueTable.row(rowIndex).data().itemId;
            let isSerialItem = workOrderIssueTable.row(rowIndex).data().isSerialItem;
            let isLotItem = workOrderIssueTable.row(rowIndex).data().isLotItem;
            let hasBin = workOrderIssueTable.row(rowIndex).data().isBinItem;
            if (issueQuantity > 0) {
                $("#woissue_modal_item_quantity").html(issueQuantity);
                $("#woissue_modal_item_name").html(itemInternalID);
                $("#woissue_modal_committed_item_quantity").html(0);
                $("#issue_row_no").html(rowIndex)
                if (!(itemInternalID in workOrderIssueTableDataObj)) {
                    if (isLotItem && !hasBin) {
                        workOrdetIssueTableItemDefination.isLotItem = true;
                        const lotDataResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_wo_issue_lot_search.scriptInternalId}&deploy=1&itemInternalID=${itemInternalID}&locationInternalID=${loggedInUserDetails.location}&searchType=findLotNumbersWithoutBinNumber`);
                        if (lotDataResponse.responseSuccess && lotDataResponse.responseData.isSuccess && lotDataResponse.responseData.data) {
                            workOrdetIssueTableItemDefination.lotNumbers = lotDataResponse.responseData.data;
                            workOrderIssueTableDataObj[itemInternalID] = workOrdetIssueTableItemDefination;
                            lotSelectField = generateSelectField({ 'fieldId': 'woIssueModalLotSelect', 'fieldName': '', 'options': lotDataResponse.responseData.data })
                            binSelectField = generateSelectField({ 'fieldId': 'woIssueModalBinSelect', 'fieldName': '', 'options': '' })
                            $('.lotDropdownTd').html(lotSelectField)
                            $('.binDropdownTd').html(binSelectField)
                            $('.binDropdownTd select').attr('disabled', true);
                        }
                        else {
                            generateError({ 'errorMessage': 'No Lot number found' })
                            $(currentRow).find('.issueQuantity').val(0)
                            // return;
                        }
                    }
                    else if (!isLotItem && hasBin) {
                        workOrdetIssueTableItemDefination.hasBinNumber = true;
                        let binSelectField, lotSelectField;
                        const binDataResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_woissue_bin_get_qty.scriptInternalId}&deploy=1&itemInternalID=${itemInternalID}&locationInternalID=${loggedInUserDetails.location}&searchType=findBinNumbersWithoutLotNumber`);
                        if (binDataResponse.responseSuccess && binDataResponse.responseData.isSuccess && binDataResponse.responseData.data) {
                            workOrdetIssueTableItemDefination.binNumbers = binDataResponse.responseData.data;
                            workOrderIssueTableDataObj[itemInternalID] = workOrdetIssueTableItemDefination;
                            lotSelectField = generateSelectField({ 'fieldId': 'woIssueModalLotSelect', 'fieldName': '', 'options': '' })
                            binSelectField = generateSelectField({ 'fieldId': 'woIssueModalBinSelect', 'fieldName': '', 'options': binDataResponse.responseData.data })
                            $('.lotDropdownTd').html(lotSelectField)
                            $('.lotDropdownTd select').attr('disabled', true);
                            $('.binDropdownTd').html(binSelectField)
                        }
                        else {
                            generateError({ 'errorMessage': 'No Bin number found' })
                            $(currentRow).find('.issueQuantity').val(0)
                            // return;
                        }
                    }
                    else if (isLotItem && hasBin) {
                        workOrdetIssueTableItemDefination.isLotItem = true;
                        workOrdetIssueTableItemDefination.hasBinNumber = true;
                        const lotWithBinDataResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_wo_issue_lot_search.scriptInternalId}&deploy=1&itemInternalID=${itemInternalID}&locationInternalID=${loggedInUserDetails.location}&searchType=findLotNumbersWithBinNumber`)
                        if (lotWithBinDataResponse.responseSuccess && lotWithBinDataResponse.responseData.isSuccess && lotWithBinDataResponse.responseData.data) {
                            workOrdetIssueTableItemDefination.lotNumbers = lotWithBinDataResponse.responseData.data;
                            workOrderIssueTableDataObj[itemInternalID] = workOrdetIssueTableItemDefination;
                            let lotSelectField = generateSelectField({ 'fieldId': 'woIssueModalLotSelect', 'fieldName': '', 'options': lotWithBinDataResponse.responseData.data })
                            $('.lotDropdownTd').html(lotSelectField)
                        }
                        else {
                            generateError({ 'errorMessage': 'No lot number found' })
                            $(currentRow).find('.issueQuantity').val(0)
                            // return;
                        }
                    }
                    else {
                        workOrdetIssueTableItemDefination.isLotItem = false;
                        workOrdetIssueTableItemDefination.hasBinNumber = false;
                        workOrderIssueTableDataObj[itemInternalID] = workOrdetIssueTableItemDefination;
                        if (!(selectedRowData.manufacturingOperationTaskId in woIssueData)) {
                            woIssueData[selectedRowData.manufacturingOperationTaskId] = {}
                            woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID] = {}
                            woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID]['issueQty'] = issueQuantity
                            woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalData = '';
                            woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalHtml = '';

                        }
                        else {
                            if (!(itemInternalID in woIssueData[selectedRowData.manufacturingOperationTaskId])) {
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID] = {}
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID]['issueQty'] = issueQuantity
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalData = '';
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalHtml = '';
                            }
                            else {
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID]['issueQty'] = issueQuantity
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalData = '';
                                woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalHtml = '';
                            }
                        }
                        // return;
                    }
                }
                if (woIssueData[selectedRowData.manufacturingOperationTaskId] && woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID] && woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].issueQty === issueQuantity && woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalData && woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalData.length > 0) {
                    let savedModalData = woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalData;
                    $('#woIssueModal').replaceWith(woIssueData[selectedRowData.manufacturingOperationTaskId][itemInternalID].modalHtml.clone(true))
                    $('#woIssueModal_body_table tbody tr').each((index, element) => {
                        $(element).find('.woIssueModalLotSelect').val(savedModalData[index].lotNumber);
                        $(element).find('.woIssueModalBinSelect').val(savedModalData[index].binNumber);
                    })
                }
                modalInitialRow = $("#woIssueModal_body_table").find('tbody').find('tr:first').clone()
                $('#woIssueModal').modal('show');
            }
            else {
                alert('Quantity must be greater than 0');
            }
            enableUI()
        });
    })
    /* ---------------------------------------------------Work Order Issue Function End --------------------------------------------------------------------- */

    // $(document).on('input', '.issueQuantity', (e) => {
    //     let currentRow = $(e.target).parents('tr');
    //     let rowIndex = $(currentRow).index()
    //     let issueQuantity = parseFloat($(currentRow).find('.issueQuantity').val());
    //     let itemInternalID = workOrderIssueTable.row(rowIndex).data().itemId;
    //     let isSerialItem = workOrderIssueTable.row(rowIndex).data().isSerialItem;
    //     let isLotItem = workOrderIssueTable.row(rowIndex).data().isLotItem;
    //     let hasBin = workOrderIssueTable.row(rowIndex).data().isBinItem;
    //     console.log(issueQuantity, itemInternalID, isSerialItem, isLotItem, hasBin);
    //     if (!isSerialItem && !isLotItem && !hasBin) {
    //          if(issueQuantity > 0){

    //          }
    //     }
    // })

    /* --------------------------------------------------- Tools Function Start ----------------------------------------------------------------------------- */
    $('#tool').click(async () => {
        let toolObj = {
            'workOrderId': selectedRowData.workOrderId,
            'operationSequence': selectedRowData.operationSequence
        }
        const toolsDetailsResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_get_assembly_tool.scriptInternalId}&deploy=1`, toolObj)
        if (toolsDetailsResponseObj.responseSuccess && toolsDetailsResponseObj.responseData.isSuccess) {
            let toolsData = toolsDetailsResponseObj.responseData.data;
            let toolsDataArr = []
            Object.keys(toolsData).map((element) => {
                let keyData = toolsData[element]
                let res = {};
                res['toolFamily'] = keyData.name;
                res['toolFamilyId'] = element;
                res['serializedTool'] = generateSelectField({ 'fieldId': 'serializedTools', 'fieldName': '', 'options': keyData.options });
                toolsDataArr.push(res);
            })
            // let toolsDataTable = $('#toolsTable').DataTable({
            //     data: toolsDataArr,
            //     columns: [
            //         { data: 'toolFamily', title: 'Tool Family' },
            //         { data: 'toolFamilyId', title: 'Tool Family Id' },
            //         { data: 'serializedTool', title: 'Serialized Tool' },
            //         { title: '', defaultContent: '<button type="button" class="btn btn-primary checkOut">CheckOut</button>' }
            //     ],
            //     destroy: true,
            //     searching: false,
            //     paging: false,
            //     info: false,
            //     ordering: false,
            //     columnDefs: [
            //         {
            //             "className": "text-center",
            //             "width": "4%"
            //         }]
            // })

            let toolsTableOptionsObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
            toolsTableOptionsObj.data = toolsDataArr;
            toolsTableOptionsObj.columns = [
                { data: 'toolFamily', title: 'Tool Family' },
                { data: 'toolFamilyId', title: 'Tool Family Id' },
                { data: 'serializedTool', title: 'Serialized Tool' },
                { title: '', defaultContent: '<button type="button" class="btn btn-primary checkOut">CheckOut</button>' }
            ];
            toolsTableOptionsObj.columnDefs = [
                {
                    "className": "text-center",
                    "width": "4%"
                }];
            let toolsDataTable = generateDataTable('#toolsTable', toolsTableOptionsObj)
            $("#toolsDataSection").attr('hidden', false);
            $(window).scrollTop($("#toolsDataSection").position().top);

            toolsDataTable.on('click', '.checkOut', async (e) => {

                let currentRow = $(e.target).parents('tr');
                let rowIndex = $(currentRow).index();
                let serializedTool = $(currentRow).find('.serializedTools').html();
                let toolFamilyInternalID = toolsDataTable.row(rowIndex).data().toolFamilyId;
                let statusChangeResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_serialized_tool.scriptInternalId}&deploy=1&toolFamilyInternalID=${toolFamilyInternalID}&serializedTool=${serializedTool}`);
                if (statusChangeResponse.responseSuccess && statusChangeResponse.responseData.isSuccess) {
                    generateAlert({
                        'type': 'success',
                        'title': 'Tool Checkout',
                        'message': '',
                        'timer': 1500,
                        'showConfirmButton': false,
                        'timerProgressBar': true
                    })
                    updateOpenWorkOrderTable();
                    $("#toolsDataSection").attr('hidden', true);
                }
            })
        }
        else {
            generateError({ 'errorMessage': 'Tools not found' })
        }
        enableUI()
    })

    /* --------------------------------------------------- Tools Function End ------------------------------------------------------------------------------ */
    /* ------------------------------------- Serialized Tool Check In Function Start ---------------------------------------------------------------------- */
    $(document).on('click', '.checkIn', async (e) => {
        let currentRow = $(e.target).parents('tr');
        let rowIndex = $(currentRow).index();
        let serializedToolId = serializedToolTable.row(rowIndex).data().internalId;
        const serializedToolCheckInResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_serialized_checkin.scriptInternalId}&deploy=1&serializedToolId=${serializedToolId}`)
        if (serializedToolCheckInResponse.responseSuccess && serializedToolCheckInResponse.responseData.isSuccess) {
            generateAlert({
                'type': 'success',
                'title': 'Serialized Tool Available',
                'message': '',
                'timer': 1500,
                'showConfirmButton': false,
                'timerProgressBar': true
            })
            updateOpenWorkOrderTable();
        }
        enableUI()
    })

    /* --------------------------------------------------- Serialized Tool Check In Function End ------------------------------------------------------------ */

    /*---------------------------------------------------- Quality Function Start --------------------------------------------------------------------------- */
    let greenColourCode = '#66ff66';
    let redColourCode = '#ff4d4d';
    let yellowCOlourCode = '#ffe14d';
    $('#quality').click(async () => {
        let params = {
            'workOrderId': selectedRowData.workOrderId,
            'workCenter': selectedRowData.workCenterId,
            'operationSequence': selectedRowData.operationSequence,
            'item': selectedRowData.itemId
        }
        let qualityDataResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_draw_spec_data_get.scriptInternalId}&deploy=1&params=${JSON.stringify(params)}`)
        console.log(qualityDataResponse);
        if (qualityDataResponse.responseSuccess && qualityDataResponse.responseData.isSuccess) {
            qualityData = qualityDataResponse.responseData;
            //Drawing Specification Table
            let drawingSpecificationThead = ['Version', 'Drawing#', 'CTF?', 'Nominal', '+Tol', '-Tol'];
            let drawingSpecificationTbody = qualityDataResponse.responseData.drawingSpecificationData;
            let drawingTable = generateTable(drawingSpecificationThead, drawingSpecificationTbody).data;
            $("#drawingSpecificationTable").html(drawingTable);

            //Measurement Table
            let measurementTbody = qualityDataResponse.responseData.measurementData;
            let measurementThead = `<thead>
                    <tr>
                        <th colspan=2>Accept/Reject</th>
                        <th colspan=2>%Tolerance</th>
                        <th rowspan=2>Mean</th>
                    </tr>
                    <tr>
                        <th>Accept</th>
                        <th>Reject</th>
                        <th>Upper</th>
                        <th>Lower</th>
                    </tr>
                </thead>`
            if (!qualityDataResponse.responseData.isSavedData) {
                measurementTbody = Array(qualityDataResponse.responseData.drawingSpecificationData.length).fill(qualityDataResponse.responseData.measurementData)
            }
            let measurementTable = generateTable([], measurementTbody).data;
            $("#measurmentTable").html(`${measurementThead}${measurementTable}`);

            $('#measurmentTable tbody tr').each((index, element) => {
                let highValue = $(element).find('.high').val()
                let lowValue = $(element).find('.low').val()
                highValue.toLowerCase() === 'accept' ? $(element).find('.high').css('background', greenColourCode) : highValue.toLowerCase() === 'reject' ? $(element).find('.high').css('background', redColourCode) : highValue.toLowerCase() === 'alert' ? $(element).find('.high').css('background', yellowCOlourCode) : $(element).find('.high').css('background', 'none');
                lowValue.toLowerCase() === 'accept' ? $(element).find('.low').css('background', greenColourCode) : lowValue.toLowerCase() === 'reject' ? $(element).find('.low').css('background', redColourCode) : lowValue.toLowerCase() === 'alert' ? $(element).find('.low').css('background', yellowCOlourCode) : $(element).find('.low').css('background', 'none');
            })

            //Inspection Table
            let inspectionResponse = qualityDataResponse.responseData.additionalData;
            let inspectionTbodyResponse = qualityDataResponse.responseData.inspectionData;
            let inspectionThead = `<thead> <tr> `;
            for (let inspectionHeaderIndex = 0; inspectionHeaderIndex < inspectionResponse.sampleSize; inspectionHeaderIndex++) {
                inspectionThead += `<th> ${inspectionHeaderIndex + 1}</th> `;
            }
            inspectionThead += `</tr></thead >`;

            let inspectionTbody = ``;
            for (let inspectionHeaderIndex = 0; inspectionHeaderIndex < drawingSpecificationTbody.length; inspectionHeaderIndex++) {
                inspectionTbody += `<tr>`;
                for (let sampleIndex = 0; sampleIndex < inspectionResponse.sampleSize; sampleIndex++) {
                    inspectionTbody += qualityDataResponse.responseData.isSavedData ? qualityDataResponse.responseData.additionalData.submitted ? `<td><input type="text" class="form-control inspectionTextBox" value='${inspectionTbodyResponse[inspectionHeaderIndex][sampleIndex]}' disabled></td>` : `<td><input type="text" class="form-control inspectionTextBox" value='${inspectionTbodyResponse[inspectionHeaderIndex][sampleIndex]}'></td>` : `<td><input type="text" class="form-control inspectionTextBox" value=''></td>`;
                }
                inspectionTbody += `</tr>`
            }

            $("#inspectionTable").html(`${inspectionThead}${inspectionTbody}`);
            $('#qualityTableContainer').attr('hidden', false);
            $(window).scrollTop($("#qualityTableContainer").position().top);

        }
        else {
            generateAlert({
                'type': 'error',
                'title': 'No Data Found',
                'message': '',
                'timer': 1500,
                'showConfirmButton': false,
                'timerProgressBar': true
            })
        }
        enableUI();
    })

    $(document).on('input', '.inspectionTextBox', (e) => {
        // let greenColourCode = '#66ff66';
        // let redColourCode = '#ff4d4d';
        // let yellowCOlourCode = '#ffe14d';
        let currentRow = $(e.target).closest('tr');
        let currentRowIndex = $(e.target).closest('tr').index()
        let rowData = [];
        currentRow.find('.inspectionTextBox').each((index, value) => {
            rowData.push($(value).val())
        })
        let rowSum = new Int32Array(rowData).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        let rowMaxValue = Math.max(...new Int32Array(rowData));
        let rowMinValue = Math.min(...new Int32Array(rowData))
        let rowMean = rowSum / parseFloat(qualityData.additionalData.sampleSize)
        // let version = $(`#drawingSpecificationTable tbody tr:eq(${currentRowIndex})`).find('.version').val();
        // let cif = $(`#drawingSpecificationTable tbody tr:eq(${currentRowIndex})`).find('.cif').val();
        // let drawingHash = $(`#drawingSpecificationTable tbody tr:eq(${currentRowIndex})`).find('.drawingHash').val();
        //Upper Calculation
        let nominal = $(`#drawingSpecificationTable tbody tr:eq(${currentRowIndex})`).find('.nominal').val();
        let positiveTolerance = $(`#drawingSpecificationTable tbody tr:eq(${currentRowIndex})`).find('.positiveTol').val();
        let negetiveTolerance = $(`#drawingSpecificationTable tbody tr:eq(${currentRowIndex})`).find('.negativeTol').val();
        let upperValue = rowData[0] === '' ? '' : positiveTolerance === 0 ? '-' : (rowMaxValue - nominal) / nominal < 0 ? 0 : (rowMaxValue - nominal) / nominal;
        let lowerValue = rowData[0] === '' ? '' : negetiveTolerance === 0 ? '-' : (nominal - rowMinValue) / nominal < 0 ? 0 : (nominal - rowMinValue) / nominal;
        let highValue = upperValue === '' ? '' : rowMaxValue > (nominal + positiveTolerance) ? 'Reject' : positiveTolerance === 0 && rowMaxValue > nominal - (17.5 * negetiveTolerance) ? 'Alert' : upperValue === '-' ? 'Accept' : upperValue > 65 ? 'Alert' : 'Accept';
        let lowValue = lowerValue === '' ? '' : rowMinValue < (nominal - negetiveTolerance) ? 'Reject' : negetiveTolerance === 0 && rowMinValue < nominal + (17.5 * positiveTolerance) ? 'Alert' : lowerValue === '-' ? 'Accept' : lowerValue < 65 ? 'Accept' : 'Alert';
        $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.mean').val(rowMean.toFixed(3));
        $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.upper').val(!isNaN(parseFloat(upperValue)) ? parseFloat(upperValue).toFixed(3) : upperValue);
        $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.lower').val(!isNaN(parseFloat(lowerValue)) ? parseFloat(lowerValue).toFixed(3) : lowerValue);
        $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.high').val(highValue);
        $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.low').val(lowValue);

        highValue.toLowerCase() === 'accept' ? $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.high').css('background', greenColourCode) : highValue.toLowerCase() === 'reject' ? $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.high').css('background', redColourCode) : highValue.toLowerCase() === 'alert' ? $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.high').css('background', yellowCOlourCode) : $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.high').css('background', 'none');
        lowValue.toLowerCase() === 'accept' ? $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.low').css('background', greenColourCode) : lowValue.toLowerCase() === 'reject' ? $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.low').css('background', redColourCode) : lowValue.toLowerCase() === 'alert' ? $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.low').css('background', yellowCOlourCode) : $(`#measurmentTable tbody tr:eq(${currentRowIndex})`).find('.low').css('background', 'none');
    })

    $('#qualitySave').click(async (e) => {
        let qualityDataArray = [];
        for (let dataCountIndex = 0; dataCountIndex < qualityData.drawingSpecificationData.length; dataCountIndex++) {
            let qualityDataObj = {};
            qualityDataObj['inspectionRecordId'] = qualityData.additionalData.inspectionRecordId;
            qualityDataObj['sampleSize'] = qualityData.additionalData.sampleSize;
            // -------------------- Operation for Drawing Specification Data ----------------------------
            let drawingTableDataArray = [], testResult = [];
            $(`#drawingSpecificationTable tbody tr:eq(${dataCountIndex}) td input`).each((key, element) => {
                drawingTableDataArray.push($(element).val())
            });
            console.log(drawingTableDataArray);
            let version = drawingTableDataArray.join(';');
            qualityDataObj['drawingSpecification'] = version;
            // -------------------- Operation for Measurement Record Data  ----------------------------
            let measurementObject = {};
            $(`#measurmentTable tbody tr:eq(${dataCountIndex}) td input`).each((key, element) => {
                if ($(element).hasClass('high'))
                    measurementObject['high'] = $(element).val();
                else if ($(element).hasClass('low'))
                    measurementObject['low'] = $(element).val();
                else if ($(element).hasClass('upper'))
                    measurementObject['upper'] = $(element).val();
                else if ($(element).hasClass('lower'))
                    measurementObject['lower'] = $(element).val();
                else
                    measurementObject['mean'] = $(element).val();
            });
            qualityDataObj['measurmentResults'] = measurementObject;
            // -------------------- Operation for Inspection Record Data ----------------------------
            $(`#inspectionTable tbody tr:eq(${dataCountIndex}) td input`).each((key, element) => {
                testResult.push($(element).val())
            });
            qualityDataObj['inspectionRecord'] = testResult.join(';');
            let drawingSpecificationChildResponse = qualityData.drawingSpecificationChildId;
            qualityDataObj['internalId'] = qualityData.isSavedData ? drawingSpecificationChildResponse[dataCountIndex].internalId : '';
            qualityDataArray.push(qualityDataObj)
        }
        console.log(qualityDataArray);
        let updateInspectionRecordResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_update_inspection_d.scriptInternalId}&deploy=1`, qualityDataArray);
        if (updateInspectionRecordResponseObj.responseSuccess && updateInspectionRecordResponseObj.responseData.isSuccess) {
            generateAlert({
                'type': 'success',
                'title': 'Inspection Record Updated/Created',
                'message': '',
                'timer': 1500,
                'showConfirmButton': false,
                'timerProgressBar': true
            })
            enableUI();
        }
    })

    $('#qualityCancel').click(() => {
        $("#qualityTableContainer").attr('hidden', true);
        $(window).scrollTop($("#openWorkOrderContainer").position().top);
    })
    /*---------------------------------------------------- Quality Function End ----------------------------------------------------------------------------- */

    /* --------------------------------------------------- Timer Functions Start ---------------------------------------------------------------------------- */
    $('#pauseTimer').click(async (e) => {
        if (!($(e.target).hasClass('active'))) {
            const downTimeCategoryReasonResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_dt_category_reason.scriptInternalId}&deploy=1`)
            if (downTimeCategoryReasonResponse.responseSuccess && downTimeCategoryReasonResponse.responseData.isSuccess) {
                let reasonSelectField = generateSelectField(downTimeCategoryReasonResponse.responseData.reason);
                reasonSelectField ? $('#downtimeReason').html(reasonSelectField) : null;
                let categorySelectField = generateSelectField(downTimeCategoryReasonResponse.responseData.category);
                categorySelectField ? $('#downtimeCategory').html(categorySelectField) : null;
                $('#pmcModal').modal('show');
                enableUI()
            }
            else {
                generateError({ 'errorMessage': downTimeCategoryReasonResponse.responseData.errorMessage })
            }
            $('#downTimeModalSubmit').click(async () => {
                if ($('#categoryType').val() && $('#reasonType').val()) {
                    let pmcTransactionRecordObjPauseTime = {
                        'pmcTransactionId': selectedRowData.pmcTransactionId,
                        'pmcTransactionPauseTime': new Date(),
                        'operationStatus': 2, //1 = Setup 

                    }
                    $('#pmcModal').modal('hide');
                    const response = createEditPmcTransaction(pmcTransactionRecordObjPauseTime);
                    if (response) {
                        $(e.target).addClass('active')
                    }
                    else {
                        generateError({ 'errorMessage': 'Unexpected Error' })
                    }
                }
                else {
                    generateAlert({
                        'type': 'error',
                        'title': 'Please Put the Value of Downtime Category & Downtime Reason',
                        'message': '',
                        'timer': 1500,
                        'showConfirmButton': false,
                        'timerProgressBar': true
                    })
                }
            });
        }
        else {
            let pmcTransactionRecordObjRestartTime = {
                'pmcTransactionId': selectedRowData.pmcTransactionId,
                'pmcTransactionDowntimeStartTime': selectedRowData.pmcTransactionDowntimeStartTime,
                'pmcTransactionDownTimeEndTime': new Date(),
                'operationStatus': 3, //3 = Running
                'modalCategoryType': $('#categoryType').val(),
                'modalReasonType': $('#reasonType').val(),
                'modalNotes': $('#modalNotes').val()
            }
            const response = createEditPmcTransaction(pmcTransactionRecordObjRestartTime);
            if (response) {
                $(e.target).removeClass('active')
            }
        }
    });

    $(document).on('click', '.woIssueModalCommitLineButton', (e) => {
        let canProceed = false;
        let itemId = $('#woissue_modal_item_name').html()
        let issueQty = parseFloat($("#woissue_modal_item_quantity").html());
        if (itemId in workOrderIssueTableDataObj) {
            let tr = $(e.target).parents('tr')
            let lotValue = $(tr).find('.woIssueModalLotSelect').val();
            let binValue = $(tr).find('.woIssueModalBinSelect').val();
            if (workOrderIssueTableDataObj[itemId].isLotItem || workOrderIssueTableDataObj[itemId].isSerialItem) {
                if (lotValue) {
                    if (workOrderIssueTableDataObj[itemId].hasBinNumber) {
                        binValue ? canProceed = true : alert('Please Select Bin');
                    }
                    else {
                        canProceed = true;
                    }
                }
                else {
                    alert('Please Select Lot Number')
                }
            }
            else if (workOrderIssueTableDataObj[itemId].hasBinNumber) {
                binValue ? canProceed = true : alert('Please Select Bin')
            }
            else {
                alert('Please Select Bin Number')
            }
            if (canProceed) {
                let lineQty = parseFloat($(tr).find('.woIssueModalCommitLineQuantity').val());
                $(tr).find('.woissue_modal_line_is_committed').attr('checked', true)
                // $(tr).find('.woissue_modal_removeLine_button').attr('disabled', false)
                if (lineQty > 0) {
                    let qtyAlreadyAdded = 0;
                    $("tr .woIssueModalCommitLineQuantity").each((key, element) => {
                        qtyAlreadyAdded += parseFloat($(element).val());
                    })
                    if (!(qtyAlreadyAdded > issueQty)) {
                        let avilableQty = parseFloat($(tr).find('.woIssueAvailableLineQuantity').html());
                        let qtyEntered = parseFloat($(tr).find('.woIssueModalCommitLineQuantity').val());
                        if (avilableQty - qtyEntered >= 0) {
                            if (qtyAlreadyAdded < issueQty) {
                                $("#woIssueModal_body_table").find('tbody').find('tr:last').after($(modalInitialRow).clone());
                                $(tr).find('.woIssueModalCommitLineButton').removeClass('btn-warning')
                                $(tr).find('.woIssueModalCommitLineButton').addClass('btn-success')
                                $(tr).find('.woIssueModalCommitLineButton').html('Committed')
                                $(tr).find('.woIssueModalCommitLineButton').attr('disabled', true)
                            }
                            else if (qtyAlreadyAdded === issueQty) {
                                $(tr).find('.woIssueModalCommitLineButton').removeClass('btn-warning')
                                $(tr).find('.woIssueModalCommitLineButton').addClass('btn-success')
                                $(tr).find('.woIssueModalCommitLineButton').html('Committed')
                                $(tr).find('.woIssueModalCommitLineButton').attr('disabled', true)
                            }
                            $('#woissue_modal_committed_item_quantity').html(qtyAlreadyAdded);
                        }
                        else {
                            alert(`Quantity not available`)
                        }
                    }
                    else {
                        alert(`Inventory Detail Quantity must be ${issueQty}`)
                    }
                }
                else {
                    alert('Please enter quantity to commit line');
                }
            }
        }
    })

    $(document).on('click', '.woissue_modal_removeLine_button', (e) => {
        let qtyAlreadyAdded = 0;
        let currentTableRow = $(e.target).parents('tr');
        let rowIndex = $(currentTableRow).index();
        let quantityRemoved = parseFloat($(currentTableRow).find('.woIssueModalCommitLineQuantity').val())
        let removedLot = $(currentTableRow).find('.woIssueModalLotSelect').val()
        let removedBin = $(currentTableRow).find('.woIssueModalBinSelect').val()

        if (rowIndex === 0) {
            if (!$(currentTableRow).next().find('.woissue_modal_line_is_committed').prop('checked'))
                $("#woIssueModal_body_table").find('tbody').html($(modalInitialRow).clone());
            else {
                $(currentTableRow).remove();
                $("#woIssueModal_body_table").find('tbody').find('tr:last').find('.woissue_modal_line_is_committed').prop('checked') ? $("#woIssueModal_body_table").find('tbody').find('tr:last').after($(modalInitialRow).clone()) : null
            }
        }
        else {
            $(currentTableRow).remove();
            $("#woIssueModal_body_table").find('tbody').find('tr:last').find('.woissue_modal_line_is_committed').prop('checked') ? $("#woIssueModal_body_table").find('tbody').find('tr:last').after($(modalInitialRow).clone()) : null
        }
        console.log(quantityRemoved);

        $("#woIssueModal_body_table tbody tr").each((key, element) => {
            if (key >= rowIndex) {
                let availableQuantity = parseFloat($(element).find('.woIssueAvailableLineQuantity').html())
                let currentLot = $(element).find('.woIssueModalLotSelect').val()
                let currentBin = $(element).find('.woIssueModalBinSelect').val()

                if (availableQuantity) {
                    if (removedLot && removedBin)
                        removedLot === currentLot && removedBin === currentBin ? $(element).find('.woIssueAvailableLineQuantity').html(availableQuantity + quantityRemoved) : null
                    else if (removedLot && !removedBin)
                        removedLot === currentLot ? $(element).find('.woIssueAvailableLineQuantity').html(availableQuantity + quantityRemoved) : null
                    else
                        removedBin === currentBin ? $(element).find('.woIssueAvailableLineQuantity').html(availableQuantity + quantityRemoved) : null
                }
            }
            qtyAlreadyAdded += parseFloat($(element).val());
        })
        $('#woissue_modal_committed_item_quantity').html(qtyAlreadyAdded);
    })

    $(document).on('click', '#woIssueModalSave', (e) => {
        let modalData = []
        let itemId = $('#woissue_modal_item_name').html();
        let qtyToBeCommited = parseFloat($('#woissue_modal_item_quantity').html());
        let commitedQuantity = parseFloat($('#woissue_modal_committed_item_quantity').html());
        if (qtyToBeCommited === commitedQuantity) {
            $('#woIssueModal_body_table tbody tr').each((index, element) => {
                let eachRowData = {};
                eachRowData['lotNumber'] = $(element).find('.woIssueModalLotSelect').val();
                eachRowData['binNumber'] = $(element).find('.woIssueModalBinSelect').val();
                eachRowData['quantity'] = $(element).find('.woIssueModalCommitLineQuantity').val();
                modalData.push(eachRowData)
            })

            $('#woIssueModal').modal('hide')
            console.log(woIssueData);
            if (!(selectedRowData.manufacturingOperationTaskId in woIssueData)) {
                woIssueData[selectedRowData.manufacturingOperationTaskId] = {}
                woIssueData[selectedRowData.manufacturingOperationTaskId][itemId] = {}
                woIssueData[selectedRowData.manufacturingOperationTaskId][itemId]['issueQty'] = qtyToBeCommited
                woIssueData[selectedRowData.manufacturingOperationTaskId][itemId].modalData = modalData;
                woIssueData[selectedRowData.manufacturingOperationTaskId][itemId].modalHtml = $('#woIssueModal').clone();

            }
            else {
                if (!(itemId in woIssueData[selectedRowData.manufacturingOperationTaskId])) {
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId] = {}
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId]['issueQty'] = qtyToBeCommited
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId].modalData = modalData;
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId].modalHtml = $('#woIssueModal').clone();
                }
                else {
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId]['issueQty'] = qtyToBeCommited
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId].modalData = modalData;
                    woIssueData[selectedRowData.manufacturingOperationTaskId][itemId].modalHtml = $('#woIssueModal').clone();
                }
            }
        }
        else {
            alert(`Inventory Detail Quantity must be ${qtyToBeCommited}`)
        }
    })

    $(document).on('change', '.woIssueModalLotSelect', async (e) => {
        let currentRow = $(e.target).parents('tr');
        let lotItemId = $(e.target).val();
        let lotItemText = e.target.options[e.target.selectedIndex].text;
        let itemInternalId = $('#woissue_modal_item_name').html();
        if (lotItemId) {
            if (workOrderIssueTableDataObj[itemInternalId].isLotItem && workOrderIssueTableDataObj[itemInternalId].hasBinNumber) {
                if (!(lotItemId in lotBinData)) {
                    let binData = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_woissue_bin_get_qty.scriptInternalId}&deploy=1&itemInternalID=${itemInternalId}&locationInternalID=${loggedInUserDetails.location}&searchType=findBinNumbersWithLotNumber&lotNumberInternalID=${lotItemId}&lotNumber=${lotItemText}`)
                    if (binData.responseSuccess && binData.responseData.isSuccess && binData.responseData.data) {
                        let binSelectField = generateSelectField({ 'fieldId': 'woIssueModalBinSelect', 'fieldName': '', 'options': binData.responseData.data })
                        $(currentRow).find('.binDropdownTd').html(binSelectField)
                        lotBinData[lotItemId] = binData.responseData.data;
                    }
                    else {
                        // $("#woIssueModal_body_table").find('tbody').find(`tr:eq(${$(currentRow).index()})`).replace($(modalInitialRow).clone());
                        let binSelectField = generateSelectField({ 'fieldId': 'woIssueModalBinSelect', 'fieldName': '', 'options': [] })
                        $(currentRow).find('.binDropdownTd').html(binSelectField)
                        alert('No Bin Found. Try different lot');
                    }
                }
                else {
                    let binSelectField = generateSelectField({ 'fieldId': 'woIssueModalBinSelect', 'fieldName': '', 'options': lotBinData[lotItemId] })
                    $(currentRow).find('.binDropdownTd').html(binSelectField)
                }
            }
            else {
                let selectedLotQuantity = parseFloat(workOrderIssueTableDataObj[itemInternalId].lotNumbers.find(e => e.internalId === lotItemId).quantityOnHand)
                let lotCommitedQty = getWorkOrderIssueAlreadyCommitedQty({ 'lotId': lotItemId, 'binId': '', 'rowIndex': $(currentRow).index() })
                $(currentRow).find('.woIssueAvailableLineQuantity').html(selectedLotQuantity - lotCommitedQty.quantity)
            }
        }
        enableUI()
    });

    $(document).on('change', '.woIssueModalBinSelect', (e) => {
        let commitedQty, selectedBinQuantity;
        let currentRow = $(e.target).parents('tr');
        let itemInternalId = $('#woissue_modal_item_name').html();
        let selectedBin = $(e.target).val();
        let lotId = $(currentRow).find('.woIssueModalLotSelect').val();

        if (lotId && selectedBin) {
            selectedBinQuantity = parseFloat(lotBinData[lotId].find(e => e.internalId === selectedBin).quantityOnHand);
            commitedQty = getWorkOrderIssueAlreadyCommitedQty({ 'lotId': lotId, 'binId': selectedBin, 'rowIndex': $(currentRow).index() })
        }
        else if (selectedBin) {
            selectedBinQuantity = parseFloat(workOrderIssueTableDataObj[itemInternalId].binNumbers.find(e => e.internalId === selectedBin).quantityOnHand)
            commitedQty = getWorkOrderIssueAlreadyCommitedQty({ 'lotId': '', 'binId': selectedBin, 'rowIndex': $(currentRow).index() })
        }
        $(currentRow).find('.woIssueAvailableLineQuantity').html(selectedBinQuantity - commitedQty.quantity)
    })

    $(document).on('click', '.modalClose', () => {
        let woIssueTablerowIndex = $("#issue_row_no").html();
        $(`#workOrderIssueTable tr:eq(${woIssueTablerowIndex})`).find('.issueQuantity').val(0)
        $("#woIssueModal").replaceWith(workOrderIssueModalClone.clone(true))
    })

    $("#woissue_submit_inventoryDetail").click(async () => {
        console.log(woIssueData);
        let manufacturingOperationTaskId = selectedRowData.manufacturingOperationTaskId;
        if (woIssueData[manufacturingOperationTaskId]) {
            let workOrderId = selectedRowData.workOrderId;
            let woIssueCreateResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_create_wo_issue.scriptInternalId}&deploy=1`, { 'workOrderId': workOrderId, 'operationTaskId': manufacturingOperationTaskId, 'issueData': woIssueData[manufacturingOperationTaskId] });
            if (woIssueCreateResponseObj.responseSuccess && woIssueCreateResponseObj.responseData.isSuccess) {
                generateAlert({
                    'type': 'success',
                    'title': `Work Order Issue Created.Work Order Issue Id is ${woIssueCreateResponseObj.responseData.data}`,
                    'message': '',
                    'timer': 1500,
                    'showConfirmButton': false,
                    'timerProgressBar': true
                })
                generateToast({ 'message': 'Work Order Issue has created successfully', 'url': '/app/accounting/transactions/woissue.nl?id=', 'id': woIssueCreateResponseObj.responseData.data })
            }
            else {
                generateError({ 'errorMessage': woIssueCreateResponseObj.responseData.errorMessage })
            }
        }
        else {
            generateError({ 'errorMessage': 'Please provide inventory detail for atleast one line item' })
        }
        enableUI()
    })

    $("#worOrderTableRefresh").click(async () => {
        updateOpenWorkOrderTable()
    })

    $('#work-order-issue-cancel').click(async () => {
        $("#workOrderIssueTableContainer").attr('hidden', true);
        $(window).scrollTop($("#openWorkOrderContainer").position().top);
    })

    $('.collapse-button').click(function (e) {
        $(e.target).toggleClass('la la-plus la la-minus');
    })

});

const getWorkOrderIssueAlreadyCommitedQty = (dataObj) => {
    let quantity = 0;
    $('#woIssueModal_body_table tbody tr').each((index, element) => {
        let issueQuantity = parseFloat($(element).find('.woIssueModalCommitLineQuantity').val())
        if (dataObj.rowIndex !== index) {
            if (dataObj.lotId && dataObj.binId) {
                let lotId = $(element).find('.woIssueModalLotSelect').val();
                let binId = $(element).find('.woIssueModalBinSelect').val();
                if (dataObj.lotId === lotId && dataObj.binId === binId) {
                    quantity += issueQuantity
                }
            }
            else if (dataObj.lotId) {
                let lotId = $(element).find('.woIssueModalLotSelect').val();
                if (dataObj.lotId === lotId) {
                    quantity += issueQuantity
                }
            }
            else if (dataObj.binId) {
                let binId = $(element).find('.woIssueModalBinSelect').val();
                if (dataObj.binId === binId) {
                    quantity += issueQuantity
                }
            }
        }
    })
    return { 'quantity': quantity }
}

const createEditPmcTransaction = async (dataObj) => {
    const response = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_create_edit_transac.scriptInternalId}&deploy=1`, dataObj);
    if (response.responseSuccess && response.responseData.isSuccess) {
        updateOpenWorkOrderTable()
        return true
    }
    return false
}

const stopTimerClock = async () => {
    let currentAccountDate = await getAccountDate()
    let resultStartDateTime = selectedRowData.pmcTransactionResultStartTime;
    let downTimeTotalDuration = selectedRowData.pmcTransactionDowntimeTotalDuration;
    let productionTime = new Date(currentAccountDate) - new Date((new Date(resultStartDateTime).getTime() + downTimeTotalDuration * 60000))
    console.log(productionTime)
    let endTime = new Date()
    console.log(productionTime / 60000);
    let completionObj = {
        'pmcTransactionId': selectedRowData.pmcTransactionId,
        'productionTime': productionTime / 60000,
        'productionQuantity': 0
    }
    if (selectedRowData.pmcTransactionName.toLowerCase() === 'production') {
        enableUI();
        if (int)
            clearInterval(int);
        Swal.fire({
            title: 'Production Quantity',
            html: `
                <input
                type="number"
                value=""
                step=""
                class="swal2-input"
                id="productionQuantity"
                min=0
                step='0.01'
                >
                `,
            // html: `<input type="number" id="productionQuantity" class="swal2-input" placeholder="" value = '' step='0.01'/>`,
            confirmButtonText: 'Ok',
            focusConfirm: false,
            preConfirm: () => {
                const productionQuantity = Swal.getPopup().querySelector('#productionQuantity').value
                if (!productionQuantity) {
                    Swal.showValidationMessage(`Please enter Production Quantity`)
                }
                return { productionQuantity: productionQuantity }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                let qtyEntered = result.value.productionQuantity
                if (!selectedRowData.predecessorId) {
                    completionObj.productionQuantity = qtyEntered;
                }
                else {
                    let completedQty = selectedRowData.completedQuantity ? selectedRowData.completedQuantity : 0
                    if (parseFloat(selectedRowData.predecessorCompletedQuantity) >= parseFloat(completedQty) + parseFloat(qtyEntered)) {
                        completionObj.productionQuantity = qtyEntered
                    }
                    else {
                        swalAlertObj.type = 'error';
                        swalAlertObj.title = 'Predecessor quantity is less than current input quantity';
                        generateAlert(swalAlertObj)
                        return;
                    }
                }
                let woCompletionResponseObj = await createWorkOrderCompletion(completionObj);
                console.log(woCompletionResponseObj);
                if (woCompletionResponseObj.responseSuccess && woCompletionResponseObj.responseData.isSuccess) {
                    stopTimer();
                    let pmcTransactionRecordObjEndTime = {
                        'pmcTransactionId': selectedRowData.pmcTransactionId,
                        'pmcTransactionEndTime': endTime,
                        'operationStatus': 4, //4 = Setup Complete
                    }
                    const response = createEditPmcTransaction(pmcTransactionRecordObjEndTime);
                    if (response) {
                        generateAlert({
                            'type': 'success',
                            'title': `Work Order Completion Created.Completion Id is ${woCompletionResponseObj.responseData.data}`,
                            'message': '',
                            'timer': 1500,
                            'showConfirmButton': false,
                            'timerProgressBar': true
                        })
                        generateToast({ 'message': 'Work Order Completion has created successfully', 'url': '/app/accounting/transactions/wocompl.nl?id=', 'id': woCompletionResponseObj.responseData.data })
                        $('#production').attr('disabled', false);
                        $('#setup').attr('disabled', false);
                        $('#production').removeClass('active');
                    }
                    else {
                        generateError({ 'errorMessage': 'Unexpected Error' })
                    }
                }
                else {
                    generateError({ 'errorMessage': 'Unexpected Error' })
                }
            }
            else {
                await resetTimer()
                enableUI();
            }
        })
    }
    else {
        let woCompletionResponseObj = await createWorkOrderCompletion(completionObj);
        if (woCompletionResponseObj.responseSuccess && woCompletionResponseObj.responseData.isSuccess) {
            stopTimer();
            let pmcTransactionRecordObjEndTime = {
                'pmcTransactionId': selectedRowData.pmcTransactionId,
                'pmcTransactionEndTime': endTime,
                'operationStatus': 4, //4 = Setup Complete
            }
            const response = createEditPmcTransaction(pmcTransactionRecordObjEndTime);
            if (response) {
                generateAlert({
                    'type': 'success',
                    'title': `Work Order Completion Created.Completion Id is ${woCompletionResponseObj.responseData.data}`,
                    'message': '',
                    'timer': 1500,
                    'showConfirmButton': false,
                    'timerProgressBar': true
                })
                generateToast({ 'message': 'Work Order Completion has created successfully', 'url': '/app/accounting/transactions/wocompl.nl?id=', 'id': woCompletionResponseObj.responseData.data })
                $('#production').attr('disabled', false);
                $('#setup').attr('disabled', false);
                $('#setup').removeClass('active');
            }
            else {
                generateError({ 'errorMessage': 'Unexpected Error' })
            }
        }
        else {
            generateError({ 'errorMessage': 'Unexpected Error' })
        }
    }
    [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0]
}

/* ------------------------------------------------ Rerender Data Table Function Start -------------------------------------------------------------------- */
const updateOpenWorkOrderTable = async () => {
    let previousSelectedRowData = openWorkOrderDataTable.rows('.rowSelected').data()[0];
    $("#informationAndButtomsSection").attr('hidden', true);
    $("#openWorkOrderContainer").attr('hidden', true);
    let hasDatatableGenarated = await getOpenWorkOrders()
    if (hasDatatableGenarated.isSuccess) {
        autoSelectRowAndSetTimer(previousSelectedRowData);
        $("#openWorkOrderContainer").attr('hidden', false);
    }
}
/* ------------------------------------------------ Rerender Data Table Function End ---------------------------------------------------------------------- */
/* ------------------------------------------------ Auto Row Selection Function Start --------------------------------------------------------------------- */
const autoSelectRowAndSetTimer = (rowData) => {
    if (rowData) {
        console.log(rowData)
        if (workOrderAdditionalDataResponse.responseSuccess && workOrderAdditionalDataResponse.responseData.isSuccess) {
            workOrderAdditionalData = workOrderAdditionalDataResponse.responseData;
        }
        openWorkOrderDataTable.rows().data().map((element, index) => {
            if ((element.workOrderId === rowData.workOrderId) && (element.manufacturingOperationTaskId === rowData.manufacturingOperationTaskId)) {
                openWorkOrderDataTable.row(index).select();
            }
        })
    }
}
/* ------------------------------------------------ Auto Row Selection Function End ----------------------------------------------------------------------- */

const createWorkOrderCompletion = async (dataObj) => {
    const response = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_wo_completion.scriptInternalId}&deploy=1`, dataObj)
    return response
}

/* -------------------------------------- Get Open Work Order Function start ------------------------------------------------------------------------------- */
const getOpenWorkOrders = async () => {
    let searchCount = 0;
    console.log(loggedInUserDetails);
    let data = {
        'workCenter': loggedInUserDetails.pmcWorkCenter,
        'location': loggedInUserDetails.location
    }
    let getOpenWorkOrdersCountResponse = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_get_open_work_order.scriptInternalId}&deploy=1`, data)
    if (getOpenWorkOrdersCountResponse.responseSuccess) {
        searchCount = getOpenWorkOrdersCountResponse.responseData
    }
    getDataFromRestletRecursivelyFunctionParameter.searchCount = searchCount;
    getDataFromRestletRecursivelyFunctionParameter.restletData = {
        'workCenter': loggedInUserDetails.pmcWorkCenter,
        'location': loggedInUserDetails.location,
        'employeeId': loggedInUserDetails.internalId,
        'employeeName': loggedInUserDetails.employeeName,
    }
    getDataFromRestletRecursivelyFunctionParameter.restletUrl = `/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_get_open_work_order.scriptInternalId}&deploy=1`;
    let openWorkOrders = await getDataFromRestletRecursively(getDataFromRestletRecursivelyFunctionParameter);
    // openWorkOrderDataTable = $('#openWorkOrderTable').DataTable({
    //     data: openWorkOrders.data,
    //     columns: openWorkOrders.columnsArr,
    //     processing: true,
    //     deferRender: true,
    //     select: {
    //         style: 'single',
    //         className: 'rowSelected'
    //     },
    //     ordering: false,
    //     destroy: true,
    //     initComplete: function (settings, json) {
    //         $("#openWorkOrderTable").wrap("<div class='text-center' style='overflow:auto; width:100%;position:relative;'></div>");
    //     }
    // })
    let openWorkOrderObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
    openWorkOrderObj.data = openWorkOrders.data;
    openWorkOrderObj.columns = openWorkOrders.columnsArr;
    openWorkOrderObj.select = {
        style: 'single',
        className: 'rowSelected'
    };
    // openWorkOrderObj.initComplete = function (settings, json) {
    //     $("#openWorkOrderTable").wrap("<div class='text-center' style='overflow:auto; width:100%;position:relative;'></div>");
    // }
    openWorkOrderDataTable = generateDataTable("#openWorkOrderTable", openWorkOrderObj)
    /* ---------------------------------- DataTable row selection Function start ---------------------------------------------------------------------------- */
    openWorkOrderDataTable.on('select', async () => {
        /* --------------------------------------- Getteing Open Work Order Table Page And Row Select Start ------------------------------------------------- */
        if (!pageNumber && !nodePosition) {
            selectedNode = openWorkOrderDataTable.row('.rowSelected').node();
            nodePosition = openWorkOrderDataTable.rows({ order: 'current' }).nodes().indexOf(selectedNode);
            rowsOnOnePage = openWorkOrderDataTable.page.len()
            pageNumber = Math.floor(nodePosition / rowsOnOnePage);
            openWorkOrderDataTable.page(pageNumber).draw(false);
        }
        else {
            openWorkOrderDataTable.page(pageNumber).draw(false);
        }
        /* ----------------------------------------- Getteing Open Work Order Table Page And Row Select End ------------------------------------------------ */

        selectedRowData = openWorkOrderDataTable.rows('.rowSelected').data()[0];
        console.log(selectedRowData);
        let selectedRowWorkOrderId = selectedRowData.workOrderId;
        $("#informationAndButtonsSection").attr('hidden', false);
        $(window).scrollTop($("#informationAndButtonsSection").position().top);
        await resetTimer()
        if (!(selectedRowWorkOrderId in workOrderAdditionalData)) {
            workOrderAdditionalDataResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_get_wo_data.scriptInternalId}&deploy=1&workOrderId=${selectedRowData.workOrderId}&operationSequence=${selectedRowData.operationSequence}&operationTaskId=${selectedRowData.manufacturingOperationTaskId}&itemId=${selectedRowData.itemId}`);
            if (workOrderAdditionalDataResponse.responseSuccess && workOrderAdditionalDataResponse.responseData.isSuccess) {
                workOrderAdditionalData[selectedRowWorkOrderId] = workOrderAdditionalDataResponse.responseData;
            }
        }
        // $('#workOrderItemTable').DataTable({
        //     data: workOrderAdditionalData[selectedRowWorkOrderId].workOrderItemDetails.data,
        //     columns: workOrderAdditionalData[selectedRowWorkOrderId].workOrderItemDetails.columnsArr,
        //     processing: true,
        //     deferRender: true,
        //     destroy: true,
        //     initComplete: function (settings, json) {
        //         $("#workOrderItemTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        //     }
        // });
        let workOrderItemTableObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        workOrderItemTableObj.data = workOrderAdditionalData[selectedRowWorkOrderId].workOrderItemDetails.data;
        workOrderItemTableObj.columns = workOrderAdditionalData[selectedRowWorkOrderId].workOrderItemDetails.columnsArr;
        // workOrderItemTableObj.initComplete = function (settings, json) {
        // $("#workOrderItemTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        // }
        generateDataTable("#workOrderItemTable", workOrderItemTableObj)
        $('#workOrderItemTableContainer-span').html(workOrderAdditionalData[selectedRowWorkOrderId].workOrderItemDetails.data.length)

        // $('#workOrderRoutingTable').DataTable({
        //     data: workOrderAdditionalData[selectedRowWorkOrderId].workOrderOperationTaskDetails.data,
        //     columns: workOrderAdditionalData[selectedRowWorkOrderId].workOrderOperationTaskDetails.columnsArr,
        //     processing: true,
        //     deferRender: true,
        //     destroy: true,
        //     initComplete: function (settings, json) {
        //         $("#workOrderRoutingTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        //     }
        // });
        let workOrderRoutingTableObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        workOrderRoutingTableObj.data = workOrderAdditionalData[selectedRowWorkOrderId].workOrderOperationTaskDetails.data;
        workOrderRoutingTableObj.columns = workOrderAdditionalData[selectedRowWorkOrderId].workOrderOperationTaskDetails.columnsArr;
        // workOrderRoutingTableObj.initComplete = function (settings, json) {
        // $("#workOrderRoutingTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        // }
        generateDataTable("#workOrderRoutingTable", workOrderRoutingTableObj)
        $('#workOrderRoutingTableContainer-span').html(workOrderAdditionalData[selectedRowWorkOrderId].workOrderOperationTaskDetails.data.length)

        // $('#toolFamilyTable').DataTable({
        //     data: workOrderAdditionalData[selectedRowWorkOrderId].toolFamilyDetails.data,
        //     columns: workOrderAdditionalData[selectedRowWorkOrderId].toolFamilyDetails.columnsArr,
        //     processing: true,
        //     deferRender: true,
        //     destroy: true,
        //     initComplete: function (settings, json) {
        //         $("#toolFamilyTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        //     }
        // });
        let workOrderAdditionalDataObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        workOrderAdditionalDataObj.data = workOrderAdditionalData[selectedRowWorkOrderId].toolFamilyDetails.data;
        workOrderAdditionalDataObj.columns = workOrderAdditionalData[selectedRowWorkOrderId].toolFamilyDetails.columnsArr;
        // workOrderAdditionalDataObj.initComplete = function (settings, json) {
        // $("#toolFamilyTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        // }
        generateDataTable("#toolFamilyTable", workOrderAdditionalDataObj)
        $('#assemblyToolFamily-span').html(workOrderAdditionalData[selectedRowWorkOrderId].toolFamilyDetails.data.length)

        // serializedToolTable = $('#serializedToolTable').DataTable({
        //     data: workOrderAdditionalData[selectedRowWorkOrderId].serializedToolDetails.data,
        //     columns: workOrderAdditionalData[selectedRowWorkOrderId].serializedToolDetails.columnsArr,
        //     processing: true,
        //     deferRender: true,
        //     destroy: true,
        //     initComplete: function (settings, json) {
        //         $("#serializedToolTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        //     }
        // });

        let serializedToolTableObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        serializedToolTableObj.data = workOrderAdditionalData[selectedRowWorkOrderId].serializedToolDetails.data;
        serializedToolTableObj.columns = workOrderAdditionalData[selectedRowWorkOrderId].serializedToolDetails.columnsArr;
        // serializedToolTableObj.initComplete = function (settings, json) {
        // $("#serializedToolTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        // }
        serializedToolTable = generateDataTable("#serializedToolTable", serializedToolTableObj)
        $('#serializedTool-span').html(workOrderAdditionalData[selectedRowWorkOrderId].serializedToolDetails.data.length)

        // $('#pmcTransactionTable').DataTable({
        //     data: workOrderAdditionalData[selectedRowWorkOrderId].pmcTransactionDetails.data,
        //     columns: workOrderAdditionalData[selectedRowWorkOrderId].pmcTransactionDetails.columnsArr,
        //     processing: true,
        //     deferRender: true,
        //     destroy: true,
        //     initComplete: function (settings, json) {
        //         $("#pmcTransactionTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        //     }
        // });
        let pmcTransactionTableObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        pmcTransactionTableObj.data = workOrderAdditionalData[selectedRowWorkOrderId].pmcTransactionDetails.data;
        pmcTransactionTableObj.columns = workOrderAdditionalData[selectedRowWorkOrderId].pmcTransactionDetails.columnsArr;
        // pmcTransactionTableObj.initComplete = function (settings, json) {
        // $("#pmcTransactionTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        // }
        generateDataTable("#pmcTransactionTable", pmcTransactionTableObj)

        $('#pmcTransactionTableContainer-span').html(workOrderAdditionalData[selectedRowWorkOrderId].pmcTransactionDetails.data.length)

        // $('#pmcworkInstructionTable').DataTable({
        //     data: workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.data,
        //     columns: workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.columnsArr,
        //     columnDefs: [
        //         {
        //             targets: workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.columnsArr.findIndex(element => element.data === 'url'),
        //             data: workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.data,
        //             render: function (data, type, row) {
        //                 data = `<a href='${data}' target="_blank">${data}</a>`
        //                 return data
        //             }
        //         }
        //     ],
        //     processing: true,
        //     deferRender: true,
        //     destroy: true,
        //     initComplete: function (settings, json) {
        //         $("#pmcworkInstructionTable").wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
        //     }
        // });
        let pmcworkInstructionTableObj = JSON.parse(JSON.stringify(dataTableOptionsObj));
        pmcworkInstructionTableObj.data = workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.data;
        pmcworkInstructionTableObj.columns = workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.columnsArr;
        pmcworkInstructionTableObj.select = {
            style: 'single',
            className: 'rowSelected'
        };
        pmcworkInstructionTableObj.columnDefs = [
            {
                targets: workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.columnsArr.findIndex(element => element.data === 'url'),
                data: workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.data,
                render: function (data, type, row) {
                    data = `<a href='${data}' target="_blank">${data}</a>`
                    return data
                }
            }
        ];
        // pmcworkInstructionTableObj.initComplete = function (settings, json) {
        //     $("#pmcworkInstructionTable").wrap("<div class='text-center' style='overflow:auto; width:100%;position:relative;'></div>");
        // }
        generateDataTable("#pmcworkInstructionTable", pmcworkInstructionTableObj)
        $('#pmcWorkInstructionTableContainer-span').html(workOrderAdditionalData[selectedRowWorkOrderId].workInstructionDetails.data.length)

        let informationObj = {
            'operator': {
                'fieldName': 'Operator',
                'fieldId': 'operator',
                'fieldValue': loggedInUserDetails.employeeName
            },
            'startTime': {
                'fieldName': 'Start Time',
                'fieldId': 'startTime',
                'fieldValue': selectedRowData.pmcTransactionDowntimeStartTime
            },
            'workOrderPlanedQty': {
                'fieldName': 'Work Order Plan Qty',
                'fieldId': 'workOrderPlanedQty',
                'fieldValue': selectedRowData.inputQuantity
            },
            'previousOperationSequenceActualQty': {
                'fieldName': 'Previous Operation Sequence Actual Qty',
                'fieldId': 'previousOperationSequenceActualQty',
                'fieldValue': selectedRowData.inputQuantity
            },
            'operatorSequenceRemainingQty': {
                'fieldName': 'Operation Sequence Remaining Qty',
                'fieldId': 'operatorSequenceRemainingQty',
                'fieldValue': (selectedRowData.inputQuantity - selectedRowData.completedQuantity) > 0 ? selectedRowData.inputQuantity - selectedRowData.completedQuantity : 0
            },
            'runRate': {
                'fieldName': 'Run Rate',
                'fieldId': 'runRate',
                'fieldValue': selectedRowData.runRate
            },
            'status': {
                'fieldName': 'Status',
                'fieldId': 'status',
                'fieldValue': selectedRowData.status
            }
        }
        $("#informationTbody").html(generateInformation(informationObj));
        $("#additionalDataSection").attr('hidden', false);
        enableUI()
    })
    /* ---------------------------- DataTable row selection Function End ------------------------------------------------------------------------------------- */

    /* ---------------------------- DataTable row Deselection Function End ----------------------------------------------------------------------------------- */
    openWorkOrderDataTable.on('deselect', () => {
        selectedRowData = '';
        workOrderAdditionalData = {}
        $("#informationAndButtonsSection").attr('hidden', true);
        $("#additionalDataSection").attr('hidden', true);
        $("#workOrderIssueTableContainer").attr('hidden', true);
        $("#qualityTableContainer").attr('hidden', true);
    })
    /* --------------------------- DataTable row Deselection Function End ------------------------------------------------------------------------------------- */
    enableUI()
    if (openWorkOrderDataTable)
        return { 'isSuccess': true }
    return { 'isSuccess': false }
}
/* -------------------------------------------- Get Open Work Order Function End ------------------------------------------------------------------------------- */

/* -------------------------------------------- Get Data From Restelet Function Start -------------------------------------------------------------------------- */
const getDataFromRestletRecursively = async (dataObj) => {
    let _start = 0;
    let _division = 1000;
    let _loopCount = Math.ceil(dataObj.searchCount / _division)
    let dataReturnedFromRestlet = [];
    let tableHeaderArr;
    let infoToRestlet = dataObj.restletData;

    if (dataObj.searchCount === 0) {
        infoToRestlet['start'] = _start;
        infoToRestlet['end'] = _start + (dataObj.searchCount % _division);
        let url = `${dataObj.restletUrl}&data=${encodeURIComponent(JSON.stringify(infoToRestlet))}`
        let response = await fetchGetRequest(url);
        if (response.responseSuccess && response.responseData.isSuccess) {
            dataReturnedFromRestlet.push(response.responseData.data)
        }
        tableHeaderArr = response.responseData.columnsArr;
    }
    else {
        for (let loopIndex = 0; loopIndex < _loopCount; loopIndex++) {
            if ((loopIndex === _loopCount - 1) && (dataObj.searchCount % _division !== 0)) {

                infoToRestlet['start'] = _start;
                infoToRestlet['end'] = _start + (dataObj.searchCount % _division);
            }
            else {
                infoToRestlet['start'] = _start;
                infoToRestlet['end'] = _start + _division;
            }
            let url = `${dataObj.restletUrl}&data=${encodeURIComponent(JSON.stringify(infoToRestlet))}`
            let response = await fetchGetRequest(url);
            console.log(response)
            if (response.responseSuccess && response.responseData.isSuccess) {
                dataReturnedFromRestlet.push(response.responseData.data)
            }
            tableHeaderArr = response.responseData.columnsArr;
            _start += _division
        }
    }
    let flattedArr = dataReturnedFromRestlet.flat(1)
    return { 'data': flattedArr, 'columnsArr': tableHeaderArr }
}
/* --------------------------------------------  Get Data From Restelet Function End --------------------------------------------------------------------------- */

/* --------------------------------------------- All Timer Functions Start ------------------------------------------------------------------------------------- */
const startTimer = (type, dateTimeValue) => {
    [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0]
    [downtimeHours, downtimeMinutes, downtimeSeconds, downtimeMilliseconds] = [0, 0, 0, 0]
    if (selectedRowData.pmcTransactionName.toLowerCase() === 'setup') {
        $('#timerDisplay').css('background', '#00abfe')
        $('#timerDisplay').css('color', 'white');
        $('#informationAndButtomsSection .card-header').css('background', '#00abfe')
        $('#informationAndButtomsSection .card-header').css('color', 'white')
        $('.informationHeader').css('background', '#00AAFF')
        $('.actionHeader').css('background', '#00AAFF')
        $('#pauseTimer').removeClass('active')
        $('#setup').addClass('active')
        $('#production').attr('disabled', true)
        $('#setup').attr('disabled', false)
        $('#timerTitle').html('Setup')
        $('#timerTitle').attr('hidden', false)
        $('#pauseTimer').attr('disabled', true);
    }
    else {
        $('#timerDisplay').css('background', '#CCCC00');
        $('#timerDisplay').css('color', 'white');
        $('#informationAndButtomsSection .card-header').css('background', '#CCCC00')
        $('#informationAndButtomsSection .card-header').css('color', 'white')
        $('#timerDisplay').css('background', '#CCCC00');
        $('#timerDisplay').css('color', 'white');
        $('#pauseTimer').removeClass('active')
        $('#timerTitle').html('Production')
        $('#timerTitle').attr('hidden', false)
        $('#pauseTimer').attr('disabled', false);
        $('#production').addClass('active')
        $('#setup').attr('disabled', true)
        $('#production').attr('disabled', false)
    }

    if (int) {
        clearInterval(int);
    }
    if (downtimeInt) {
        clearInterval(downtimeInt);
    }
    if (type === 'start') {
        [hours, minutes, seconds, milliseconds] = new Int32Array(convertMsToTime(dateTimeValue).trim().split(':'))
        int = setInterval(displayTimer, 10, 'start');
        $("#downtimeTimerDisplayContainer").attr('hidden', true)
    }
    else {
        [downtimeHours, downtimeMinutes, downtimeSeconds, downtimeMilliseconds] = new Int32Array(convertMsToTime(dateTimeValue).trim().split(':'))
        downtimeInt = setInterval(displayTimer, 10, 'downtime');
        $("#downtimeTimerDisplayContainer").attr('hidden', false)
        $("#downtimeTimerDisplayContainer").attr('hidden', false)
        $('#informationAndButtomsSection .card-header').css('background', '#800080')
        $('#informationAndButtomsSection .card-header').css('color', 'white')
        $('#stopTimer').attr('disabled', true);
        $('.startTimer').attr('disabled', true);
        $('#pauseTimer').attr('disabled', false);
        $('#downtimeTimerDisplay').css('background', '#800080');
        $('#downtimeTimerDisplay').css('color', 'white')
    }
}

const stopTimer = () => {
    $('#timerDisplay').css('background', 'white')
    $('#informationAndButtomsSection .card-header').css('background', 'none')
    $('#informationAndButtomsSection .card-header').css('color', 'black')
    $('#timerDisplay').css('color', '#0381bb');
    $('.startTimer').attr('disabled', false);
    $('#stopTimer').attr('disabled', true);
    $('#pauseTimer').attr('disabled', true);
    $("#timerTitle").attr('hidden', true)
    $("#downtimeTimerDisplayContainer").attr('hidden', true)
    $('#setup').removeClass('active')
    $('#production').removeClass('active')
    if (int)
        clearInterval(int);
    if (downtimeInt) {
        clearInterval(downtimeInt)
    }
    [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0];
    [downtimeHours, downtimeMinutes, downtimeSeconds, downtimeMilliseconds] = [0, 0, 0, 0]
    $(timerRef).html('00 : 00 : 00 : 000');
    $(downtimeTimerRef).html('00 : 00 : 00 : 000');
}

/* --------------------------------------------- Calculate Display Timer Function Start ------------------------------------------------------------------------- */
const displayTimer = (type) => {
    if (type === 'start') {
        $(timerRef).html('00:00:00:000');
        milliseconds += 10;
        if (milliseconds == 1000) {
            milliseconds = 0;
            seconds++;
            if (seconds == 60) {
                seconds = 0;
                minutes++;
                if (minutes == 60) {
                    minutes = 0;
                    hours++;
                }
            }
        }
        let dateString = formatTime(hours, minutes, seconds, milliseconds)
        $(timerRef).html(dateString);
        $(downtimeTimerRef).html(`00 : 00: 00 : 000`);
    }
    else if (type === 'downtime') {
        downtimeMilliseconds += 10;
        if (downtimeMilliseconds == 1000) {
            downtimeMilliseconds = 0;
            downtimeSeconds++;
            if (downtimeSeconds == 60) {
                downtimeSeconds = 0;
                downtimeMinutes++;
                if (downtimeMinutes == 60) {
                    downtimeMinutes = 0;
                    downtimeHours++;
                }
            }
        }
        let dateString = formatTime(downtimeHours, downtimeMinutes, downtimeSeconds, downtimeMilliseconds)
        $(downtimeTimerRef).html(dateString);
    }
}
/* --------------------------------------------- Calculate Display Timer Function End ------------------------------------------------------------------------- */

const formatTime = (hour, min, sec, millisec) => {
    let h = hour < 10 ? "0" + hour : hour;
    let m = min < 10 ? "0" + min : min;
    let s = sec < 10 ? "0" + sec : sec;
    let ms = millisec < 10 ? "00" + millisec : millisec < 100 ? "0" + millisec : millisec;
    return `${h} : ${m} : ${s} : ${ms}`
}
const tomiliseconds = (hrs, min, sec, milliSec) => { return (hrs * 60 * 60 + min * 60 + sec) * 1000 + milliSec; }
/* --------------------------------------------- All Timer Functions End ----------------------------------------------------------------------------------------- */

/* ---------------------------------------------------- Restlet 'GET' Request Call Start ------------------------------------------------------------------------- */
const fetchGetRequest = async (url) => {
    let responseObj = {
        'responseSuccess': false,
        'responseData': {},
    }
    disableUI()
    const response = await fetch(url, {
        'method': 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        responseObj.responseSuccess = true
        responseObj.responseData = result;
    }
    return responseObj
}
/* ---------------------------------------------------- Restlet 'GET' Request Call End ---------------------------------------------------------------------------- */

/* ---------------------------------------------------- Restlet 'POST' Request Call Start ------------------------------------------------------------------------- */
const fetchPostRequest = async (url, data) => {
    let responseObj = {
        'responseSuccess': false,
        'responseData': {},
    }
    disableUI()
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        responseObj.responseSuccess = true;
        responseObj.responseData = result;
    }
    return responseObj
}
/* ---------------------------------------------------- Restlet 'POST' Request Call End ---------------------------------------------------------------------------- */

/* ---------------------------------------------------- Reset Timer Function Start --------------------------------------------------------------------------------- */
const resetTimer = async () => {
    // $(timerRef).html('00 : 00 : 00 : 000');
    let currentAccountDate = await getAccountDate();
    let resultStartDateTime = selectedRowData.pmcTransactionResultStartTime;
    let downTimeStartDateTime = selectedRowData.pmcTransactionDowntimeStartTime;
    let downTimeTotalDuration = selectedRowData.pmcTransactionDowntimeTotalDuration;
    if (selectedRowData.pmcTransactionStatusId === '3') {
        if (resultStartDateTime) {
            let dateTime = new Date(currentAccountDate) - new Date((new Date(resultStartDateTime).getTime() + downTimeTotalDuration * 60000))
            startTimer('start', dateTime);
            $('#pauseTimer').removeClass('active')
        }
    }
    else if (selectedRowData.pmcTransactionStatusId === '2') {
        if (downTimeStartDateTime) {
            let downTimeDateTime = new Date(currentAccountDate) - new Date(downTimeStartDateTime);
            let dateTime = new Date(downTimeStartDateTime).getTime() - (new Date(resultStartDateTime).getTime() + downTimeTotalDuration * 60000)
            let [hrs, min, sec, millisec] = new Int32Array(convertMsToTime(dateTime).trim().split(':'))
            $(timerRef).html(formatTime(hrs, min, sec, millisec))
            startTimer('downtime', downTimeDateTime);
            $('#pauseTimer').addClass('active')
        }
    }
    else {
        stopTimer();
        $('#pauseTimer').removeClass('active')
    }
}
/* ---------------------------------------------------- Reset Timer Function End ------------------------------------------------------------------------------------ */

/* ---------------------------------------------------- Convert Milliseconds to 'hh:mm:ss:mss' Start----------------------------------------------------------------- */
const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
}

const convertMsToTime = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;
    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
        seconds,
    )}:000`;
}
/* ---------------------------------------------------- Convert Milliseconds to 'hh:mm:ss:mss' End------------------------------------------------------------------- */

const disableUI = () => {
    if (!uiIsBlocked) {
        $('#loader').modal('show')
        uiIsBlocked = true;
    }
}
const enableUI = () => {
    if (uiIsBlocked) {
        $('#loader').modal('hide');
        uiIsBlocked = false;
    }
}

/* --------------------------------- Generate Downtime Reason & Category Dropdown Population Function Start ------------------------------------------------------- */
const generateSelectField = (dataObj) => {
    let field = '';
    field += dataObj.fieldName ? `<label for=${dataObj.fieldId} class="col-form-label">${dataObj.fieldName} </label>` : '';
    field += `<select class="form-select ${dataObj.fieldId}" id=${dataObj.fieldId}><option value="">-Select-</option>`;
    if (dataObj.options && dataObj.options.length > 0) {
        dataObj.options.map((element) => {
            field += `<option value=${element.internalId}>${element.name}</option>`;
        })
    }
    field += `</select>`;
    return field;
}
/* -------------------------------- Generate Downtime Reason & Category Dropdown Population Function End ---------------------------------------------------------- */
/* ----------------------------------------------------------- Generate Information Div Function Start ------------------------------------------------------------- */
const generateInformation = (dataObj) => {
    if (Object.keys(dataObj).length > 0) {
        let informationTbody = '';
        Object.keys(dataObj).map(function (key, index) {
            informationTbody += `<tr>
                <td><b>${dataObj[key].fieldName} : </b>${dataObj[key].fieldValue}</td>
                <td></td>
            </tr>`;
        });
        return informationTbody;
    }
    return null;
}
/* -------------------------------------------------------- Generate Information Div Function End ---------------------------------------------------------- */

/* ------------------------------------------------------------------- Date Formatter Function Start ------------------------------------------------------- */
const getAccountDate = async () => {
    let accountDateResponse = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_date_formatter.scriptInternalId}&deploy=1`);
    return accountDateResponse.responseSuccess && accountDateResponse.responseData ? accountDateResponse.responseData : null;
}
/* ------------------------------------------------------------------- Date Formatter Function Start ------------------------------------------------------- */

const generateTable = (toolsTableHead, toolsTableBody) => {
    let table = '';
    if (toolsTableHead.length > 0) {
        // Populate Tools Head
        table += `<thead><tr>`;
        toolsTableHead.map((element) => {
            table += `<th>${element}</th>`;
        });
        table += `</tr></thead> `;
    }
    // Populate Tools Body
    table += `<tbody>`;
    toolsTableBody.map((element) => {
        table += `<tr>`;
        Object.keys(element).map((keys) => {
            table += `<td><input type=text value ='${element[keys].data}' class="form-control ${element[keys].class}" disabled/></td>`;
        })
        table += `</tr>`;
    });
    table += '</tbody>'
    return { 'isSuccess': true, 'data': table };
}

const generateAlert = (dataObj) => {
    Swal.fire({
        icon: dataObj.type,
        title: dataObj.title,
        text: dataObj.message,
        timer: dataObj.timer,
        showConfirmButton: dataObj.showConfirmButton,
        timerProgressBar: dataObj.timerProgressBar
    })
}

const generateToast = (dataObj) => {
    $('#toastHeader').html('Success').addClass('alert-success');
    $("#toastBody").html(`${dataObj.message}. TO see record <a href=${dataObj.url}${dataObj.id} target="_blank">Click Here</a>`)
    $(".toast").toast('show')
}

const generateError = (dataObj) => {
    swalAlertObj.type = 'error';
    swalAlertObj.title = dataObj.errorMessage;
    swalAlertObj.timer = dataObj.timer ? dataObj.timer : 1500;
    swalAlertObj.timerProgressBar = true;
    swalAlertObj.showConfirmButton = dataObj.showConfirmButton ? dataObj.showConfirmButton : false
    generateAlert(swalAlertObj)
}

// Drag & Drop Utility Functions Start
const allowDrop = (ev) => {
    ev.preventDefault();
}

const drag = (ev) => {
    ev.dataTransfer.setData("src", ev.target.id);
}

const drop = (ev) => {
    ev.preventDefault();
    var src = document.getElementById(ev.dataTransfer.getData("src"));
    var srcParent = src.parentNode;
    var tgt = ev.currentTarget.firstElementChild;
    console.log(ev.currentTarget.id)
    ev.currentTarget.replaceChild(src, tgt);
    srcParent.appendChild(tgt);
}
// Drag & Drop Utility Functions End

// DataTable Create Function Start
const generateDataTable = (tableId, optionsObj) => {
    optionsObj.initComplete = function (settings, json) {
        $(tableId).wrap("<div style='overflow:auto; width:100%;position:relative;'></div>");
    }
    return $(tableId).DataTable(optionsObj);
}
    // DataTable Create Function End