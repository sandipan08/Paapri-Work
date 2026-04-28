/***********************************************************************************************************************************************

Script Name:        PCT Strouse PMC Production Hour Report Controller
Developer:          Sandipan Sau
Development Head:   Mr.Aman Khan
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for Strouse PMC Production Hour Report


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

let uiIsBlocked = 0, restletBaseUrl = `/app/site/hosting/restlet.nl?script=SCRIPT_ID&deploy=DEPLOYMENT_ID`, shiftDropdown = '';

/* ------------------------------------------ Global Variables Section End ------------------------------------------------------------- */
$(document).ready(async () => {
    console.log("PMC Production Hour Report Controller");
    // enableUI()
    getDepartmentList()

})


// $('#btnSubmit').click(async () => {
document.getElementById("getReportForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    let startDateTime = $('#startDateTime').val()
    console.log(startDateTime)
    startDateTime = getDate(startDateTime.split('T')[0]) + ' ' + formatAMPM(startDateTime.split('T')[1])
    let endDateTime = $('#endDateTime').val()
    endDateTime = getDate(endDateTime.split('T')[0]) + ' ' + formatAMPM(endDateTime.split('T')[1])
    console.log(startDateTime)
    console.log(endDateTime)
    let filterObj = {
        'shift': $('#shift').val(),
        'startDateTime': startDateTime,
        'endDateTime': endDateTime,
        'email': $('#email').val(),
    }
    console.log(filterObj)
    let reportResponse = await fetchGetRequest(generateFullRestletUrl({ scriptId: 'customscript_pct_sc_get_pmc_prod_hur_rep', deploymentId: 'customdeploy_pct_sc_get_pmc_prod_hur_rep', paramsObj: filterObj }))
    console.log(reportResponse);
    if (reportResponse.responseSuccess && reportResponse.responseData.isSuccess) {
        generateAlert({
            'type': 'success',
            'title': 'Email Sent',
            'message': '',
            'timer': 1500,
            'showConfirmButton': false,
            'timerProgressBar': true
        })
    }
    else {
        generateError({ 'errorMessage': 'No Data Found' })
    }
    enableUI()

})

/* -------------------------------------------------- Get Department List Start ---------------------------------------------------------- */
const getDepartmentList = async () => {
    let responseObj = await fetchGetRequest(generateFullRestletUrl({ scriptId: 'customscript_pct_sc_prod_report_dept', deploymentId: 'customdeploy_pct_sc_prod_report_dept' }))
    console.log(responseObj);
    if (responseObj.responseSuccess && responseObj.responseData.isSuccess) {
        const shiftList = responseObj.responseData.data;
        shiftDropdown +=
            '<option selected disabled value="">Choose...</option>'
        shiftList.map((element) => {
            shiftDropdown +=
                '<option value="' + element.internalId + '">' + element.department + '</option > ';
        })
        $("#shift").html(shiftDropdown);
    }
    else {
        generateError({ 'errorMessage': 'No Shift/Department Present' })
    }
    enableUI()
}
/* ----------------------------------------------- Get Department List End ----------------------------------------------------------- */

/* ----------------------------------------------- Conversation of Date & Time Start ----------------------------------------------------------- */
const getDate = (date) => {
    console.log("Date : " + date)
    var year = parseInt(date.split('-')[0]);
    var month = parseInt(date.split('-')[1]);
    var day = parseInt(date.split('-')[2]);
    // let responseDate = new Date(date);
    // console.log("responseDate : " + responseDate)
    // responseDate.toLocaleString('en-US', { timeZone: 'Canada/Eastern' })
    // console.log("responseDate.getMonth() : " + responseDate.getMonth())
    // console.log("responseDate.getDate() : " + responseDate.getDate())
    // console.log("responseDate.getFullYear() : " + responseDate.getFullYear())
    let returnDate = month + "/" + day + "/" + year;
    // let returnDate = responseDate.getMonth() + 1 + "/" + responseDate.getDate() + "/" + responseDate.getFullYear();
    return returnDate;
}

function formatAMPM(responseTime) {
    let hours = responseTime.split(':')[0]
    let minutes = responseTime.split(':')[1]
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
/* ----------------------------------------------- Conversation of Date & Time End ----------------------------------------------------------- */

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