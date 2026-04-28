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
let [hours, minutes, seconds, milliseconds] = new Int32Array($(timerRef).html().trim().split(':'));
let int;
let isUserLoggedIn = false;
let fetchScriptsRestletId;
let scriptInternalIdObj;
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

}

/* ------------------------------------------ GLobal Variables Section ENd --------------------------------------------------------------- */

$(document).ready(async () => {
    console.log("In Controller");
    fetchScriptsRestletId = $('#scriptIdFetchRestletId').html();

    /* --------------------------------------------------- Get Script Id Restlet Call Start --------------------------------------------------- */

    const scriptInternalIdResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${fetchScriptsRestletId}&deploy=1`, restletsScriptObj);
    console.log(scriptInternalIdResponseObj);
    if (scriptInternalIdResponseObj.responseSuccess && scriptInternalIdResponseObj.responseData.isSuccess) {
        scriptInternalIdObj = scriptInternalIdResponseObj.responseData.data
    }
    /* --------------------------------------------------- Get Script Id Restlet Call End --------------------------------------------------- */

    /* --------------------------------------------------- Login Function Start ---------------------------------------------------------- */

    $('#logIn').click(async () => {
        const badgeId = $('#badgeId').val();
        const employeeDetailsObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_badgeid_verify.scriptInternalId}&deploy=1&badgeId=${badgeId}`)
        console.log(employeeDetailsObj);
        if (employeeDetailsObj.responseSuccess && employeeDetailsObj.responseData.isSuccess) {
            isUserLoggedIn = true;
            if (employeeDetailsObj.responseData.data.openWorkOrderSearchCount > 0) {
                getOpenWorkOrders(employeeDetailsObj.responseData.data)
            }
        }
    })
    /* --------------------------------------------------- Login Function End ------------------------------------------------------------ */

    /* --------------------------------------------------- Timer Functions Start --------------------------------------------------------- */
    $('#startTimer').click(() => {
        $('#startTimer').attr('disabled', true);
        $('#pauseTimer').attr('disabled', false);
        $('#stopTimer').attr('disabled', false);
        if (int) {
            clearInterval(int);
        }
        int = setInterval(displayTimer, 10);
    });

    $('#pauseTimer').click(() => {
        $('#pauseTimer').attr('disabled', true);
        $('#stopTimer').attr('disabled', true);
        $('#restartTimer').attr('disabled', false);
        $('#startTimer').attr('disabled', true);
        [hours, minutes, seconds, milliseconds] = new Int32Array($(timerRef).html().trim().split(':'))
        console.log(new Date(Date.now() + tomiliseconds(hours, minutes, seconds, milliseconds)))
        clearInterval(int);
    });

    $('#stopTimer').click(() => {
        $('#startTimer').attr('disabled', false);
        $('#restartTimer').attr('disabled', true);
        $('#stopTimer').attr('disabled', true);
        $('#pauseTimer').attr('disabled', true);
        clearInterval(int);
        [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0];
        $(timerRef).html('00 : 00 : 00 : 000');
    });

    $('#restartTimer').click(() => {
        $('#restartTimer').attr('disabled', true);
        $('#pauseTimer').attr('disabled', false);
        $('#stopTimer').attr('disabled', false);
        if (int) {
            clearInterval(int);
        }
        int = setInterval(displayTimer, 10);
    });

});

/* -------------------------------------------- Get Open Work Order Function Start ----------------------------------------------- */
const getOpenWorkOrders = async (dataObj) => {
    let _start = 0;
    let _division = 1000;
    let _loopCount = Math.ceil(dataObj.openWorkOrderSearchCount / _division)
    let openWorkOrderTable = '';
    let infoToRestlet = {
        'workCenter': dataObj.pmcWorkCenter,
        'location': dataObj.location
    }
    for (let loopIndex = 0; loopIndex < _loopCount; loopIndex++) {
        if (loopIndex === _loopCount - 1) {

            infoToRestlet['start'] = _start;
            infoToRestlet['end'] = _start + (dataObj.openWorkOrderSearchCount % _division);
        }
        else {
            infoToRestlet['start'] = _start;
            infoToRestlet['end'] = _start + _division;
        }
        let url = `/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customdeploy_pct_pmc_get_open_work_order}&deploy=1&data=${encodeURIComponent(infoToRestlet)}`;
        openWorkOrderTable += await fetchGetRequest(url);
        _start += _division
    }
    console.log(openWorkOrderTable);
}
/* -------------------------------------------- Get Open Work Order Function End ---------------------------------------------------- */

/* --------------------------------------------- Timer Functions Start -------------------------------------------------------------- */
const displayTimer = () => {
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

    let h = hours < 10 ? "0" + hours : hours;
    let m = minutes < 10 ? "0" + minutes : minutes;
    let s = seconds < 10 ? "0" + seconds : seconds;
    let ms = milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds;

    $(timerRef).html(`${h} : ${m} : ${s} : ${ms}`);
}
/* --------------------------------------------- Timer Functions End -------------------------------------------------------------- */
const tomiliseconds = (hrs, min, sec, milliSec) => (hrs * 60 * 60 + min * 60 + sec) * 1000 + milliSec;

const fetchGetRequest = async (url) => {
    const response = await fetch(url, {
        'method': 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        return { 'responseSuccess': true, 'responseData': result }
    }
    return { 'responseSuccess': false }
}

const fetchPostRequest = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        return { 'responseSuccess': true, 'responseData': result }
    }
    return { 'responseSuccess': false }
}
