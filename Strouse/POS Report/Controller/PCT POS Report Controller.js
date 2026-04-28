/***********************************************************************************************************************************************

Script Name:        PCT Strouse POS Report Controller
Developer:          Sandipan Sau
Development Head:   Mr.Aman Khan
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for Strouse POS Report


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
let uiIsBlocked = 0, restletBaseUrl = `/app/site/hosting/restlet.nl?script=SCRIPT_ID&deploy=DEPLOYMENT_ID`, vendorDropdown = '', posReportData = [], issueResponseData = [], itemReceiptData = '';


/* ------------------------------------------ Global Variables Section End ------------------------------------------------------------- */

$(document).ready(async () => {
    console.log("In POS Report Controller");
    // enableUI()
    getVendorList()
})

/* -------------------------------------------------- Get Vendor List Start ---------------------------------------------------------- */
const getVendorList = async () => {
    let responseObj = await fetchGetRequest(generateFullRestletUrl({ scriptId: 'customscript_pct_sc_pos_get_vendor', deploymentId: 'customdeploy_pct_pos_get_po_list' }))
    console.log(responseObj);
    if (responseObj.responseSuccess && responseObj.responseData.isSuccess) {
        const vendorListData = responseObj.responseData.data;
        vendorDropdown +=
            '<option value="-1">-Select Any Vendor-</option>'
        vendorListData.map((element) => {
            vendorDropdown +=
                '<option value="' + element.internalId + '">' + element.documentNumber + '</option > ';
        })
        $("#vendor").html(vendorDropdown);
        // let dataSelectObj = {
        //     'fieldLabel': 'Vendor',
        //     'fieldValue': '',
        //     'fieldId': 'vendor-list',
        //     'options': responseObj.responseData.data,
        //     'class': 'form-control-lg'
        // }
        // let dataOptions = generateDataSelect(dataSelectObj)
        // if (dataOptions.isSuccess)
        //     $('#vendor-list-container').html(dataOptions.data)
    }
    else {
        generateError({ 'errorMessage': 'No Vendor Present' })
    }
    enableUI()
}
/* ----------------------------------------------- Get Vendor List End ----------------------------------------------------------- */

$('#btnSubmit').click(async () => {
    // $('#posReportTable').DataTable().destroy();
    // $('#posReportTable').dataTable().fnDestroy();
    let posReportTbody = '', posReportThead = '';
    // console.log("buttonClick");
    // console.log($('#vendor').val());
    // console.log($('#fromDate').val());
    // console.log($('#toDate').val());
    let filterObj = {
        'vendorId': $('#vendor').val(),
        'fromDate': $('#fromDate').val(),
        'toDate': $('#toDate').val()
    }
    let itemReceiptResponse = await fetchGetRequest(generateFullRestletUrl({ scriptId: 'customscript_pct_sc_pos_get_receipt_item', deploymentId: 'customdeploy_pct_sc_pos_get_receipt_item', paramsObj: filterObj }))
    // console.log(itemReceiptResponse);
    // --------------------- Loop through Item Receipt Response Start ---------------------------
    if (itemReceiptResponse.responseSuccess && itemReceiptResponse.responseData.isSuccess) {
        issueResponseData = [];
        itemReceiptData = itemReceiptResponse.responseData.data;
        if (itemReceiptData.length > 0) {
            // ---------------------  Get Assembly Item & Work Order No from Work Order Issue Start ---------------------------
            for (let irIndex = 0; irIndex < itemReceiptData.length; irIndex++) {
                // let issueOperationResponse = await getIssueOperation(receiptElement)
                let issueOperationResponse = await getIssueOperation(itemReceiptData[irIndex])
                // console.log(issueOperationResponse)
                if (issueOperationResponse.isSuccess) {
                    issueResponseData[irIndex] = issueOperationResponse.data
                }
            }
            // --------------------- Get Assembly Item & Work Order No from Work Order Issue End ---------------------------
            console.log('Array Result after Issue Operation')
            console.log(issueResponseData)
            console.log(issueResponseData.length)
        }
        else {
            generateError({ 'errorMessage': 'No Result Found' })
        }
        enableUI()
    }
    // --------------------- Loop through Item Receipt Response End ---------------------------
    if (issueResponseData.length > 0) {
        // --------------------- Get Customer Shipping details, Invoice Details from Invoice Start ---------------------------
        for (let issueIndex = 0; issueIndex < issueResponseData.length; issueIndex++) {
            for (let issueChildIndex = 0; issueChildIndex < issueResponseData[issueIndex].length; issueChildIndex++) {
                let invoiceOperationResponse = await getInvoiceOperation(issueResponseData[issueIndex][issueChildIndex])
                // console.log(invoiceOperationResponse)
                if (invoiceOperationResponse.isSuccess) {
                    posReportData.push(invoiceOperationResponse.data)
                }
            }
        }
        // --------------------- Get Customer Shipping details, Invoice Details from Invoice End ---------------------------
        console.log('Array Result after Invoice Operation')
        console.log(posReportData.length)
        console.log(posReportData)
    }
    else {
        generateError({ 'errorMessage': 'No Result Found' })
    }
    enableUI();
    console.log("Length : " + posReportData.length)
    // $('#posReportTable').DataTable().destroy();
    if (posReportData.length > 0) {
        // ---------------- Populate the THead in POS table --------------------
        posReportThead += '<tr>' +
            '                    <th>Item Receipt</th>' +
            '                    <th>Purchase Order</th>' +
            '                    <th>Purchase Amount</th>' +
            '                    <th>Inventory Item</th>' +
            '                    <th>Invoice Number</th>' +
            '                    <th>Invoice Date</th>' +
            '                    <th>Invoice Quantity</th>' +
            '                    <th>Ship Addressee</th>' +
            '                    <th>Ship Address</th>' +
            '                    <th>Ship City</th>' +
            '                    <th>Ship Country</th>' +
            '                    <th>Ship State</th>' +
            '                    <th>Ship Zip</th>';

        posReportThead += `</tr>`;
        posReportData.map((element, index) => {
            element.map((posElement) => {
                posReportTbody += `<tr>`;
                posReportTbody += '<td>' + posElement.itemReceipt + '</td>' +
                    '<td>' + posElement.poNumber + '</td>' +
                    '<td>' + posElement.poAmount + '</td>' +
                    '<td>' + posElement.itemName + '</td>' +
                    '<td>' + posElement.documentNumber + '</td>' +
                    '<td>' + posElement.date + '</td>' +
                    '<td>' + posElement.itemQuantity + '</td>' +
                    '<td>' + posElement.shipaddressee + '</td>' +
                    '<td>' + posElement.shipaddress + '</td>' +
                    '<td>' + posElement.shipcity + '</td>' +
                    '<td>' + posElement.shipcountry + '</td>' +
                    '<td>' + posElement.shipstate + '</td>' +
                    '<td>' + posElement.shipzip + '</td>';
                posReportTbody += `</tr>`;
            })
        })
        $("#posReportThead").html(posReportThead);
        $("#posReportTbody").html(posReportTbody);
        // $('#posReportTable').DataTable().clear().destroy();
        $('#posReportTable').DataTable({
            "pageLength": 50,
            "retrieve": true,
            'paging': false,
            'info': true,
            'searching': true,
            'dom': 'Bfrtip',
            'scrollX': true,
            'buttons': [
                'csv', 'excel',
            ]
        });

        $('.selectPOSReportClass').hide();
    }
    else {
        generateError({ 'errorMessage': 'No Result Found' })
    }
    enableUI()
});

/* ----------------------------------------------- Generate Options for SELECT and DATA SELECT Start ---------------------------------------- */
// const generateDataSelect = (fieldObj) => {
//     try {
//         let dataSelect = fieldObj.fieldLabel ? `<label for= "${fieldObj.fieldId}-input" class= "form-label" > ${fieldObj.fieldLabel}</label> ` : ``
//         dataSelect += `<input type = "text" name = "${fieldObj.fieldName ? fieldObj.fieldName : fieldObj.fieldId}" id = "${fieldObj.fieldId}-input"
//             class="form-control fst-italic ${fieldObj.class ? fieldObj.class : ''}" list = "${fieldObj.fieldId}" value = '${fieldObj.fieldValue ? fieldObj.fieldValue : ''}' ${fieldObj.isDisabled ? 'disabled' : ''} ${fieldObj.isHidden ? 'hidden' : ''}>
//                 <datalist id="${fieldObj.fieldId}">`

//         if (fieldObj.options.length > 0) {
//             fieldObj.options.forEach(element => {
//                 dataSelect += `<option data-value="${element.internalId}" value="${element.documentNumber}"></option>`
//             })
//         }
//         dataSelect += `</datalist>`;
//         return { 'isSuccess': true, 'data': dataSelect }
//     }
//     catch (error) {
//         return { 'isSuccess': false, 'error': error.message }
//     }
// }
/* ----------------------------------------------- Generate Options for SELECT and DATA SELECT End ------------------------------------------- */

/* ---------------------------------------------------- Restlet 'GET' Request Cal------------------------------------------------------------- */
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
/* ---------------------------------------------------- Restlet 'GET' Request Call End -------------------------------------------------------- */
/* ---------------------------------------------------- Restlet 'POST' Request Call Start ----------------------------------------------------- */
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
/* ---------------------------------------------------- Restlet 'POST' Request Call End -------------------------------------------------------- */
/* ------------------------------------------------- Disable And Enable UI Functions Start -----------------------------------------------------*/
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
/* ------------------------------------------------- Disable And Enable UI Functions End -------------------------------------------------------*/
/* -------------------------------------------------------- Alert Functions Start --------------------------------------------------------------*/
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
    swalAlertObj = {}
    swalAlertObj.type = 'error';
    swalAlertObj.title = dataObj.errorMessage;
    swalAlertObj.timer = dataObj.timer ? dataObj.timer : 1500;
    swalAlertObj.timerProgressBar = true;
    swalAlertObj.showConfirmButton = dataObj.showConfirmButton ? dataObj.showConfirmButton : false
    generateAlert(swalAlertObj)
}
const generateSucess = (dataObj) => {
    swalAlertObj = {}
    swalAlertObj.type = 'success';
    swalAlertObj.title = dataObj.sucessMessage;
    swalAlertObj.timer = dataObj.timer ? dataObj.timer : 1500;
    swalAlertObj.timerProgressBar = true;
    swalAlertObj.showConfirmButton = dataObj.showConfirmButton ? dataObj.showConfirmButton : false
    generateAlert(swalAlertObj)
}
/* -------------------------------------------------------- Alert Functions End ----------------------------------------------------------------*/
/* ----------------------------------------------- Generate Full Restlet URL Start ----------------------------------------------------------- */
const generateFullRestletUrl = (restletObj) => {
    let url = restletBaseUrl;
    url = url.replace('SCRIPT_ID', restletObj.scriptId).replace('DEPLOYMENT_ID', restletObj.deploymentId)
    if ('paramsObj' in restletObj)
        url = `${url}&params=${JSON.stringify(restletObj.paramsObj)} `
    return url;
}
/* ----------------------------------------------- Generate Full Restlet URL End ------------------------------------------------------------ */
// function Export() {//xls
//     $("#posReportTable").table2excel({
//         filename: "Table.xls"
//     });
// }


const getIssueOperation = async (receiptElement) => {
    try {
        let issueArray = [];
        let issueResponseObj = await fetchGetRequest(generateFullRestletUrl({ scriptId: 'customscript_pct_sc_pos_get_issue_detail', deploymentId: 'customdeploy_pct_sc_pos_get_issue_detail', paramsObj: receiptElement.itemId }))
        if (issueResponseObj.responseSuccess && issueResponseObj.responseData.isSuccess) {
            console.log(issueResponseObj.responseData.data.length);
            // await issueResponseObj.responseData.data.forEach((issueElement, index) => {
            for (let index = 0; index < issueResponseObj.responseData.data.length; index++) {
                issueResponseObj.responseData.data[index]['poAmount'] = receiptElement.poAmount;
                issueResponseObj.responseData.data[index]['itemReceipt'] = receiptElement.itemReceipt;
                issueResponseObj.responseData.data[index]['poNumber'] = receiptElement.poNumber;
                issueResponseObj.responseData.data[index]['itemName'] = receiptElement.itemName;
                // console.log(issueResponseObj.responseData.data[index]);
                issueArray.push(issueResponseObj.responseData.data[index])
                // return { 'isSuccess': true, 'data': issueResponseObj.responseData.data[index] }
            }
            // })
            return { 'isSuccess': true, 'data': issueArray };
        }
        else {
            return { 'isSuccess': false, 'data': "No Data Found" }
        }
    }
    catch (error) {
        return { 'isSuccess': false, 'data': error.message }
    }

}


const getInvoiceOperation = async (invoiceParentElement) => {
    try {
        let invoiceArray = []
        let invoiceResponseObj = await fetchGetRequest(generateFullRestletUrl({ scriptId: 'customscript_pct_sc_pos_get_inv_details', deploymentId: 'customdeploy_pct_sc_pos_get_inv_details', paramsObj: parseInt(invoiceParentElement.assemblyItem) }))
        if (invoiceResponseObj.responseSuccess && invoiceResponseObj.responseData.isSuccess) {
            // console.log(invoiceResponseObj.responseData.data);
            // invoiceResponseObj.responseData.data.map((invoiceChildElement) => {
            console.log(invoiceResponseObj.responseData.data.length)
            for (let index = 0; index < invoiceResponseObj.responseData.data.length; index++) {
                invoiceResponseObj.responseData.data[index]['poAmount'] = invoiceParentElement.poAmount;
                invoiceResponseObj.responseData.data[index]['itemReceipt'] = invoiceParentElement.itemReceipt;
                invoiceResponseObj.responseData.data[index]['poNumber'] = invoiceParentElement.poNumber;
                invoiceResponseObj.responseData.data[index]['itemName'] = invoiceParentElement.itemName;
                // console.log(invoiceResponseObj.responseData.data[index]);
                invoiceArray.push(invoiceResponseObj.responseData.data[index])
                // return { 'isSuccess': true, 'data': invoiceResponseObj.responseData.data[index] }

                // })
            }
            return { 'isSuccess': true, 'data': invoiceArray };
        }
        else {
            return { 'isSuccess': false, 'data': "No Data Found" }
        }
    }
    catch (error) {
        return { 'isSuccess': false, 'data': error.message }
    }

}