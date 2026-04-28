/***********************************************************************************************************************************************

Script Name:        PCT_Inventory_Number_Update_Controller
Developer:          Sandipan Sau
Development Head:   Mrs. Ratwika Mondol
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for PCT Inventory Number Update.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************* Included Functions & Updates **********************************************************
/***********************************************************************************************************************************************

Function Name:              Purpose:                                                                                Developer:

           
errorLogging()              If Controller Faced any Error it will log that error                                    Sandipan Sau

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

************************************************************************************************************************************************/


/* ------------------------------------------------------------------------------- DECLARING GLOBAL VARIABLES START ------------------------------------------------------------------------------- */


let fileReader = new FileReader();
let fetchScriptsRestletId;
let uiIsBlocked = 0;

/* ------------------------------------------------------------------------------- DECLARING GLOBAL VARIABLES END ------------------------------------------------------------------------------- */

$(document).ready(() => {
    console.log("In Controller");
    fetchScriptsRestletId = $('#scriptIdFetchRestletId').html();
    console.log(fetchScriptsRestletId)
    $("#formFile").on('input', async function (e) {
        let file = e.target.files[0]
        if (file) {
            fileReader.readAsText(file)
            fileReader.onload = () => {
                console.log(processData())
                let processDataResponse = processData();
                var $table = $('#fieldTable')
                $table.bootstrapTable('destroy').bootstrapTable({
                    columns: processDataResponse.column,
                    data: processDataResponse.data
                })
                $("#updateButton").attr("hidden", false);
                $("#updateButton").click(async function () {
                    // console.log(await generateConfirmation())
                    if (await generateConfirmation()) {
                        // alert("Are You Sure You Want to Update the Value?");
                        const scriptInternalIdResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${fetchScriptsRestletId}&deploy=1`, processDataResponse.data);
                        console.log(scriptInternalIdResponseObj)
                        if (scriptInternalIdResponseObj.responseSuccess && scriptInternalIdResponseObj.responseData.isSuccess) {
                            generateAlert({
                                'type': 'success',
                                'title': 'Value Updated',
                                'message': '',
                                'timer': 1500,
                                'showConfirmButton': false,
                                'timerProgressBar': true
                            })
                            console.log("RestLet Call Success")
                        }
                        else {
                            console.log("RestLet Call Failed")
                            generateError({ 'errorMessage': scriptInternalIdResponseObj.responseData.errorMessage })
                        }
                        enableUI();
                    }
                });

            }
            fileReader.onerror = () => {
                console.log(processDataError())
            }
        };

    });


});
/* ------------------------------------------------------------------------------- ALL CUSTOM FUNCTIONS START ------------------------------------------------------------------------------- */

const processData = () => {
    let resArray = [];
    let fieldNameArray = [];
    let fileArray = fileReader.result.split("\n").filter(n => n);
    fieldNameArray = fileArray[0].split(",");
    let columnObjectArray = headerObject(fieldNameArray)
    for (let fileIndex = 1; fileIndex < fileArray.length; fileIndex++) {
        let res = {};
        let fieldValueArray = fileArray[fileIndex].split(",");
        for (let valueIndex = 0; valueIndex < fieldValueArray.length; valueIndex++) {
            res[columnObjectArray[valueIndex].field] = fieldValueArray[valueIndex]
        }
        resArray.push(res);
    }
    return { 'column': columnObjectArray, 'data': resArray }
}

const processDataError = () => {
    return fileReader.error
}



const headerObject = (fieldNameArray) => {
    let headerObjArray = [];
    for (let headerIndex = 0; headerIndex < fieldNameArray.length; headerIndex++) {
        let headerObj = {};
        headerObj.title = fieldNameArray[headerIndex];
        headerObj.field = fieldNameArray[headerIndex].replace(/ /g, '').toLowerCase();
        headerObjArray.push(headerObj)
    }
    console.log(headerObjArray)
    return headerObjArray;
}
/* ---------------------------------------------------- Restlet 'POST' Request Call Start ------------------------------------------------------------------------- */
const fetchPostRequest = async (url, data) => {
    let responseObj = {
        'responseSuccess': false,
        'responseData': {},
    }
    // disableUI()
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
    return responseObj;
}
/* ---------------------------------------------------- Restlet 'POST' Request Call End ---------------------------------------------------------------------------- */


/* ---------------------------------------------------- All Sweet Alert Function Start ---------------------------------------------------------------------------- */
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

const generateConfirmation = async () => {
    return await Swal.fire({
        title: 'Are you sure?',
        text: "You wont to update the Inventory Number Record?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Updating...',
                'Inventory Record is being updated....',
                'success'
            )

            return 1;
        }
        else { return 0 };

    })
}
const generateError = () => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
        timer: 1500,
        showConfirmButton: true,
        timerProgressBar: false
        // footer: '<a href="">Why do I have this issue?</a>'
    })
}

/* ---------------------------------------------------- All Sweet Alert Function End ---------------------------------------------------------------------------- */

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
/* ------------------------------------------------------------------------------- ALL CUSTOM FUNCTIONS END ------------------------------------------------------------------------------- */

// ----------------------------------------------------------------------------------------- Error Function -------------------------------------------------------------------------------

function errorLogging(jqXHR, exception, scriptPurpose) {
    var error_msg = '[AJAX] ' + scriptPurpose + ' : ';
    if (jqXHR.status === 0) {
        error_msg += 'Not connected.\n Verify Network.';
    } else if (jqXHR.status == 404) {
        error_msg += 'Requested page not found. [404]';
    } else if (jqXHR.status == 500) {
        error_msg += 'Internal Server Error [500].';
    }
    else if (jqXHR.status == 401) {
        error_msg += 'SESSION_TIMED_OUT';
        $('#lost_connection_notification_maindiv').css("z-index", "3");
        $('#lost_connection_notification').toast('show');

    } else if (exception === 'parsererror') {
        error_msg += 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        error_msg += 'Time out error.';
    } else if (exception === 'abort') {
        error_msg += 'Ajax request aborted.';
    } else {
        error_msg += 'Uncaught Error.\n' + jqXHR.responseText;
    }
    console.log(error_msg);
}

