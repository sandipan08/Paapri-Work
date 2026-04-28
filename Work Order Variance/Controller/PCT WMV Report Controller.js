/***********************************************************************************************************************************************

Script Name:        Work Order Variance Controller
Developer:          Sandipan Sau
Development Head:   Ms.Ratwika Mondol
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for Work Order Variance Report


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************* Included Functions & Updates **********************************************************
/***********************************************************************************************************************************************

Function Name:                                      Purpose:                                                                                Developer:
                                                               

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

************************************************************************************************************************************************/



/* ------------------------------------------ Global Variables Section Start ------------------------------------------------------------- */
let fetchScriptsRestletId;
let summaryObject = {};
let swalAlertObj = {
    'type': 'success',
    'title': '',
    'message': '',
    'timer': 0,
    'showConfirmButton': true,
    'timerProgressBar': false
}

// ------------------ Script Objects ----------------
let restletsScriptObj = {
    'customscript_pct_wov_get_item_data': {
        'scriptName': 'PCT WOV get Item Data',
        'scriptId': 'customscript_pct_wov_get_item_data',
        'scriptInternalId': ''
    },
    'customscript_pct_wov_get_operational_dat': {
        'scriptName': 'PCT WOV get Operational Data',
        'scriptId': 'customscript_pct_wov_get_operational_dat',
        'scriptInternalId': ''
    },
    'customscript_pct_wov_get_workorder_list': {
        'scriptName': 'PCT WMV Get Work Order List',
        'scriptId': 'customscript_pct_wov_get_workorder_list',
        'scriptInternalId': ''
    },
    'customscript_pct_wmv_get_item': {
        'scriptName': 'PCT WMV Get Item List',
        'scriptId': 'customscript_pct_wmv_get_item',
        'scriptInternalId': ''
    },
    'customscript_pct_wov_get_wo_from_item': {
        'scriptName': 'PCT WOV get WO from Item',
        'scriptId': 'customscript_pct_wov_get_wo_from_item',
        'scriptInternalId': ''
    },
}
$(document).ready(async () => {

    console.log("In Work Order Variance Report Controller");
    fetchScriptsRestletId = $('#scriptIdFetchRestletId').html();

    /* --------------------------------------------------- Get Script Id Restlet Call Start ---------------------------------------------- */

    const scriptInternalIdResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${fetchScriptsRestletId}&deploy=1`, restletsScriptObj);
    // console.log(scriptInternalIdResponseObj);
    if (scriptInternalIdResponseObj.responseSuccess && scriptInternalIdResponseObj.responseData.isSuccess) {
        scriptInternalIdObj = scriptInternalIdResponseObj.responseData.data
    }
    else {
        generateError({ 'errorMessage': scriptInternalIdResponseObj.responseData.errorMessage })
    }
    $.unblockUI();
    /* --------------------------------------------------- Get Script Id Restlet Call End --------------------------------------------------- */

    // ------------------------------------------------ Drop Down Filter Field Event Start --------------------------------------------------
    $('#filterType').change(async function () {
        selectFilter = $('#filterType').val();
        console.log(selectFilter);
        if (selectFilter == 1) {
            $('#workOrderFilter').removeAttr('hidden');
            $("#itemFilter").attr("hidden", true);

            /* --------------------------------------------------- Get Work Order List Restlet Call Start ---------------------------------------------- */
            let workOrderDropdown = '';
            const getWorkOrderListObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_wov_get_workorder_list.scriptInternalId}&deploy=1`)
            if (getWorkOrderListObj.responseSuccess && getWorkOrderListObj.responseData.isSuccess) {
                const getItemListData = getWorkOrderListObj.responseData.data;
                // console.log(getItemListData);
                if (getItemListData.length > 0) {
                    workOrderDropdown +=
                        '<option value="-1">-Select Work Order-</option>'
                    getItemListData.map((element) => {
                        workOrderDropdown +=
                            '<option value="' + element.internalId + '">' + element.woName + '</option > ';
                    })
                    $("#workOrder").html(workOrderDropdown);

                    // workOrderDropdown += ` <option value="-1" label="-ALL-"></option>`
                    // getItemListData.map((element) => {
                    //     workOrderDropdown += `<option value="${element.internalId}" label="${element.woName}"></option>`
                    // })
                    // $("#workOrderList").html(workOrderDropdown);

                }
            }
            else {
                generateError({ 'errorMessage': 'No Work Order Found' })
            }
            $.unblockUI();
            /* --------------------------------------------------- Get Work Order List Restlet Call End --------------------------------------------------- */
        }
        else if (selectFilter == 2) {
            $('#itemFilter').removeAttr('hidden');
            $("#workOrderFilter").attr("hidden", true);

            /* --------------------------------------------------- Get Item List Restlet Call Start ---------------------------------------------- */

            let itemDropdown = '';
            const getItemListObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_wmv_get_item.scriptInternalId}&deploy=1`)
            if (getItemListObj.responseSuccess && getItemListObj.responseData.isSuccess) {
                const getWorkOrderListData = getItemListObj.responseData.data;
                // console.log(getWorkOrderListData);
                if (getWorkOrderListData.length > 0) {
                    itemDropdown +=
                        '<option value="-1">-Select Item-</option>'
                    getWorkOrderListData.map((element) => {
                        itemDropdown +=
                            '<option value="' + element.internalId + '">' + element.itemName + '</option > ';
                    })
                    $("#itemValue").html(itemDropdown);

                    // itemDropdown += ` <option value="-1" label="-ALL-"></option>`
                    // getWorkOrderListData.map((element) => {
                    //     itemDropdown += `<option value="${element.internalId}" label="${element.woName}"></option>`
                    // })
                    // $("#workOrderList").html(itemDropdown);

                }
            }
            else {
                generateError({ 'errorMessage': 'No Item Found' })
            }
            $.unblockUI();
            /* --------------------------------------------------- Get Item List Restlet Call End --------------------------------------------------- */

        }
        else {
            $("#workOrderFilter").attr("hidden", true);
            $("#itemFilter").attr("hidden", true);
        }
    })
    // ------------------------------------------------- Work Order & Item Dropdown Field Event Start ----------------------------------------
    $('#workOrder, #itemValue').change(async function () {
        populateAllTable();
    });
    // ------------------------------------------------ Work Order & Item Dropdown Field Event End ----------------------------------------------------

    $('#refreshAllTableButton').on('click', function () {
        populateAllTable();
    });
    // ------------------------------------------------ Drop Down Filter Field Event End --------------------------------------------------

})

const populateAllTable = async () => {
    console.log("IN Function")
    // ------------------------------------------------- Work Order & Item Dropdown Field Event Start ----------------------------------------
    let filterValue = $('#filterType').val();
    selectWorkOrder = $('#workOrder').val();
    if (filterValue == 2) {
        selectItem = $('#itemValue').val();
        // // selectItem = $("select#itemList option").filter(":selected").val();
        console.log("ITEM" + selectItem)
        /* --------------------------------------------------- Get Work Order from Item Restlet Call Start --------------------------------------------------- */
        const getWoFromItemObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_wov_get_wo_from_item.scriptInternalId}&deploy=1&selectItem=${selectItem}`)
        // console.log(getWoFromItemObj);
        if (getWoFromItemObj.responseSuccess && getWoFromItemObj.responseData.isSuccess) {
            selectWorkOrder = getWoFromItemObj.responseData.data;
            console.log(selectWorkOrder)
        }
        else {
            generateError({ 'errorMessage': 'No Work Order is Present with this Item' })
        }
        /* --------------------------------------------------- Get Work Order from Item Restlet Call End --------------------------------------------------- */
    }
    // selectWorkOrder = ['14752', '14739']

    /* --------------------------------------------------- Generate Item Table Start ---------------------------------------------- */

    // const getWorkOrderItemDataObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_wov_get_item_data.scriptInternalId}&deploy=1&selectWorkOrder=${selectWorkOrder}`)
    const getWorkOrderItemDataObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=customscript_pct_wov_get_item_data&deploy=customdeploy_pct_wov_get_item_data&selectWorkOrder=${selectWorkOrder}`)

    if (getWorkOrderItemDataObj.responseSuccess && getWorkOrderItemDataObj.responseData.isSuccess) {
        getWorkOrderItemData = getWorkOrderItemDataObj.responseData.data;
        console.log(getWorkOrderItemData);
        let itemTableTbody = '';
        let itemTableThead = '';
        if (Object.keys(getWorkOrderItemData).length > 0) {
            // ---------------- Populate the THead in Item table --------------------
            itemTableThead += '<tr>' +
                '                    <th>Work Order</th>' +
                '                    <th>Materials</th>' +
                '                    <th>Planned Material Cost</th>' +
                '                    <th>Actual Material Cost</th>' +
                '                    <th>Cost Variance</th>' +
                '                    <th>Planned Material Quantity</th>' +
                '                    <th>Actual Material Quantity</th>' +
                '                    <th>Quantity Variance</th>' +
                '                    <th>UOM</th>';
            itemTableThead += `</tr>`;


            Object.keys(getWorkOrderItemData).forEach(woElement => {
                Object.keys(getWorkOrderItemData[woElement]).forEach(itemElement => {
                    let costVariance = parseFloat(getWorkOrderItemData[woElement][itemElement].estimatedItemRate - getWorkOrderItemData[woElement][itemElement].actualItemCost).toFixed(3);
                    let differentiateQuantity = getWorkOrderItemData[woElement][itemElement].estimatedQuantity - getWorkOrderItemData[woElement][itemElement].actualQuantity;
                    itemTableTbody += `<tr>`;
                    // ---------------- Populate the TBody in Item table --------------------
                    itemTableTbody += '<td>' + getWorkOrderItemData[woElement][itemElement].workOrderNumber + '</td>' +
                        '<td>' + getWorkOrderItemData[woElement][itemElement].itemName + '</td>' +
                        '<td>' + parseFloat(getWorkOrderItemData[woElement][itemElement].estimatedItemRate).toFixed(3) + '</td>' +
                        '<td>' + parseFloat(getWorkOrderItemData[woElement][itemElement].actualItemCost).toFixed(3) + '</td>' +
                        `<td style="color:${costVariance > 0 ? 'green' : 'red'}">${costVariance}</td>` +
                        '<td>' + getWorkOrderItemData[woElement][itemElement].estimatedQuantity + '</td>' +
                        '<td>' + getWorkOrderItemData[woElement][itemElement].actualQuantity + '</td>' +
                        '<td>' + differentiateQuantity + '</td>' +
                        '<td>' + getWorkOrderItemData[woElement][itemElement].unit + '</td>';
                    itemTableTbody += `</tr>`;
                })
            })
            $("#itemTableReportThead").html(itemTableThead);
            $("#itemTableReportTbody").html(itemTableTbody);
            $('#itemTableReport').DataTable({
                "pageLength": 50,
                "retrieve": true,
                'paging': false,
                'info': false,
                'searching': false
            });
        }
    }
    else {
        generateError({ 'errorMessage': 'Item Data Not found' })
    }
    $.unblockUI();
    $('.selectWorkOrderClass').hide();
    /* --------------------------------------------------- Generate Item Table End ---------------------------------------------- */


    /* --------------------------------------------------- Generate Operational Table Start ---------------------------------------------- */
    const getOperationalDataObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_wov_get_operational_dat.scriptInternalId}&deploy=1&selectWorkOrder=${selectWorkOrder}`)
    if (getOperationalDataObj.responseSuccess && getOperationalDataObj.responseData.isSuccess) {
        getOperationalData = getOperationalDataObj.responseData.data;
        console.log(getOperationalData);
        let operationalTableTbody = '';
        let operationalTableThead = '';
        if (Object.keys(getOperationalData).length > 0) {
            // ---------------- Populate the THead in Operation table --------------------
            operationalTableThead += '<tr>' +
                '                    <th>Work Order</th>' +
                '                    <th>Operation</th>' +
                '                    <th>Total Setup Time(Planned)</th>' +
                '                    <th>Total Setup Time(Actual)</th>' +
                '                    <th>Total Run Time(Planned)</th>' +
                '                    <th>Total Run Time(Actual)</th>' +
                '                    <th>Completed Quantity</th>' +
                '                    <th>Total Cost(Planned)</th>' +
                '                    <th>Total Cost(Actual)</th>' +
                '                    <th>Cost Variance</th>';

            operationalTableThead += `</tr>`;

            // Object.keys(getOperationalData).forEach(woElement => {
            //     Object.keys(getOperationalData[woElement].operation).forEach(operationElement => {
            //         let plannedTotalCost = (getOperationalData[woElement].operation[operationElement].run.plannedTotalAmount + getOperationalData[woElement].operation[operationElement].setup.plannedTotalAmount)
            //         let actualTotalCost = (getOperationalData[woElement].operation[operationElement].run.actualTotalAmount + getOperationalData[woElement].operation[operationElement].setup.actualTotalAmount)
            //         let costVariance = parseFloat(plannedTotalCost - actualTotalCost);
            //         operationalTableTbody += `<tr>`;
            //         // ---------------- Populate the TBody in Item table --------------------
            //         operationalTableTbody += '<td>' + getOperationalData[woElement].workOrderNumber + '</td>' +
            //             '<td>' + getOperationalData[woElement].operation[operationElement].operationName + '</td>' +
            //             '<td>' + getOperationalData[woElement].operation[operationElement].setup.plannedTotalQuantity + '</td>' +
            //             '<td>' + getOperationalData[woElement].operation[operationElement].setup.actualTotalQuantity + '</td>' +
            //             '<td>' + getOperationalData[woElement].operation[operationElement].run.plannedTotalQuantity + '</td>' +
            //             '<td>' + getOperationalData[woElement].operation[operationElement].run.actualTotalQuantity + '</td>' +
            //             '<td>' + plannedTotalCost + '</td>' +
            //             '<td>' + actualTotalCost + '</td>' +
            //             `<td style="color:${costVariance > 0 ? 'green' : 'red'}">${costVariance}</td>`;

            //         operationalTableTbody += `</tr>`;

            //     })
            // })

            Object.keys(getOperationalData).forEach(woElement => {
                Object.keys(getOperationalData[woElement]).forEach(operationElement => {
                    let costVariance = parseFloat(getOperationalData[woElement][operationElement].estCost - getOperationalData[woElement][operationElement].actCost).toFixed(3);
                    operationalTableTbody += `<tr>`;
                    // ---------------- Populate the TBody in Item table --------------------
                    operationalTableTbody += '<td>' + getOperationalData[woElement][operationElement].WorkOrderNumber + '</td>' +
                        '<td>' + operationElement + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].estSetupTime + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].actSetupTime + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].estRunTime + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].actRunTime + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].completedquantity + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].estCost.toFixed(3) + '</td>' +
                        '<td>' + getOperationalData[woElement][operationElement].actCost.toFixed(3) + '</td>' +
                        `<td style="color:${costVariance > 0 ? 'green' : 'red'}">${costVariance}</td>`;

                    operationalTableTbody += `</tr>`;

                })
            })
            $("#operationTableReportThead").html(operationalTableThead);
            $("#operationTableReportTbody").html(operationalTableTbody);
            $('#operationTableReport').DataTable({
                "pageLength": 50,
                "retrieve": true,
                'paging': false,
                'info': false,
                'searching': false
            });
        }
    }
    else {
        generateError({ 'errorMessage': 'Operational Data Not found' })
    }
    $.unblockUI();
    $('.selectWorkOrderClass').hide();

    /* --------------------------------------------------- Generate Operational Table End ---------------------------------------------- */

    /* --------------------------------------------------- Generate Summary Table End ---------------------------------------------- */
    summaryObject = createSummaryObject(getWorkOrderItemData, getOperationalData);
    let summaryTableTbody = '';
    let summaryTableThead = '';
    if (Object.keys(summaryObject).length > 0) {

        // ---------------- Populate the THead in Summary table --------------------
        summaryTableThead += '<tr>' +
            '                    <th>Work Order</th>' +
            '                    <th>Planned Cost</th>' +
            '                    <th>Actual Cost</th>' +
            '                    <th>Variance</th>';

        summaryTableThead += `</tr>`;

        Object.keys(summaryObject).forEach(element => {

            summaryTableTbody += `<tr>`;
            // ---------------- Populate the TBody in Summary table --------------------
            summaryTableTbody += '<td>' + summaryObject[element].workOrderNumber + '</td>' +
                '<td>' + summaryObject[element].plannedCost.toFixed(3) + '</td>' +
                '<td>' + summaryObject[element].actualCost.toFixed(3) + '</td>' +
                `<td style="color:${summaryObject[element].variance > 0 ? 'green' : 'red'}">${summaryObject[element].variance.toFixed(3)}</td>`;
            summaryTableTbody += `</tr>`;
        })
    }
    $("#summaryTableReportThead").html(summaryTableThead);
    $("#summaryTableReportTbody").html(summaryTableTbody);
    $('#summaryTableReport').DataTable({
        "pageLength": 50,
        "retrieve": true,
        'paging': false,
        'info': false,
        'searching': false
    });
    /* --------------------------------------------------- Generate Summary Table End ---------------------------------------------- */

    // ------------------------------------------------ Work Order & Item Dropdown Field Event End ----------------------------------------------------

}
// ------------------------------------ Create Summary Object Start ---------------------------------------------
const createSummaryObject = (getWorkOrderItemData, getOperationalData) => {
    let summaryObj = {};
    Object.keys(getWorkOrderItemData).forEach(woElement => {
        Object.keys(getWorkOrderItemData[woElement]).forEach(itemElement => {
            let estimatedCost = parseFloat(getWorkOrderItemData[woElement][itemElement].estimatedItemRate);
            let actualCost = parseFloat(getWorkOrderItemData[woElement][itemElement].actualItemCost);
            if (!(woElement in summaryObj)) {
                summaryObj[woElement] = {
                    'workOrderNumber': getWorkOrderItemData[woElement][itemElement].workOrderNumber,
                    'plannedCost': estimatedCost,
                    'actualCost': actualCost,
                    'variance': estimatedCost - actualCost
                };
            }
            else {
                summaryObj[woElement]['plannedCost'] += estimatedCost;
                summaryObj[woElement]['actualCost'] += actualCost
            }

        })
    })

    Object.keys(getOperationalData).forEach(woElement => {
        Object.keys(getOperationalData[woElement]).forEach(operationElement => {
            let plannedTotalCost = getOperationalData[woElement][operationElement].estCost;
            let actualTotalCost = getOperationalData[woElement][operationElement].actCost;
            if (!(woElement in summaryObj)) {
                summaryObj[woElement] = {
                    'workOrderNumber': getOperationalData[woElement][operationElement].WorkOrderNumber,
                    'plannedCost': plannedTotalCost,
                    'actualCost': actualTotalCost,
                    'variance': plannedTotalCost - actualTotalCost
                };
            }
            else {
                summaryObj[woElement]['plannedCost'] += plannedTotalCost;
                summaryObj[woElement]['actualCost'] += actualTotalCost;
                summaryObj[woElement]['variance'] += plannedTotalCost - actualTotalCost;
            }

        })
    })
    console.log(summaryObj);
    return summaryObj;

}
// ------------------------------------ Create Summary Object End ---------------------------------------------


/* ---------------------------------------------------- Restlet 'GET' Request Call Start ------------------------------------------------------------------------- */
const fetchGetRequest = async (url) => {
    let responseObj = {
        'responseSuccess': false,
        'responseData': {},
    }
    $.blockUI();
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
    $.blockUI();
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
const generateError = (dataObj) => {
    swalAlertObj.type = 'error';
    swalAlertObj.title = dataObj.errorMessage;
    swalAlertObj.timer = dataObj.timer ? dataObj.timer : 1500;
    swalAlertObj.timerProgressBar = true;
    swalAlertObj.showConfirmButton = dataObj.showConfirmButton ? dataObj.showConfirmButton : false
    generateAlert(swalAlertObj)
}
