/* ------------------------------------------ Global Variables Section Start ------------------------------------------------------------- */

let badgeId = 1234;

/* ------------------------------------------ GLobal Variables Section ENd --------------------------------------------------------------- */
$(document).ready(async () => {
    console.log(`In PMC Work Center View Controller`);
    fetchScriptsRestletId = $('#scriptIdFetchRestletId').html();
    let restletsScriptObj = {
        'customscript_pct_pmc_badgeid_verify': {
            'scriptName': 'PCT_PMC_Badge_Id_Verification',
            'scriptId': 'customscript_pct_pmc_badgeid_verify',
            'scriptInternalId': ''
        },
        'customscript_pct_pmc_get_work_center_dta': {
            'scriptName': 'PCT PMC Get Work Center Data',
            'scriptId': 'customscript_pct_pmc_get_work_center_dta',
            'scriptInternalId': ''
        },
        'customscript_pct_pmc_filter_work_order': {
            'scriptName': 'PCT PMC Filter Work Odrer',
            'scriptId': 'customscript_pct_pmc_filter_work_order',
            'scriptInternalId': ''
        },
        'customscript_pct_pmc_suitelet': {
            'scriptName': 'PCT PMC Filter Work Odrer',
            'scriptId': 'customscript_pct_pmc_suitelet',
            'scriptInternalId': ''
        }
    }

    /* --------------------------------------------------- Get Script Id Restlet Call Start ---------------------------------------------- */
    console.log(`${fetchScriptsRestletId}`)
    const scriptInternalIdResponseObj = await fetchPostRequest(`/app/site/hosting/restlet.nl?script=${fetchScriptsRestletId}&deploy=1`, restletsScriptObj);
    console.log(scriptInternalIdResponseObj);
    if (scriptInternalIdResponseObj.responseSuccess && scriptInternalIdResponseObj.responseData.isSuccess) {
        scriptInternalIdObj = scriptInternalIdResponseObj.responseData.data
    }
    else {
        generateError({ 'errorMessage': scriptInternalIdResponseObj.responseData.errorMessage })
    }

    /* --------------------------------------------------- Get Script Id Restlet Call End --------------------------------------------------- */

    /* --------------------------------------------------- Login Function Start ------------------------------------------------------------- */
    $('#logIn').click(async () => {
        badgeId = $('#badgeId').val();
        const employeeDetailsObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_badgeid_verify.scriptInternalId}&deploy=1&badgeId=${badgeId}`)
        if (employeeDetailsObj.responseSuccess && employeeDetailsObj.responseData.isSuccess) {
            isUserLoggedIn = true;
            loggedInUserDetails = employeeDetailsObj.responseData.data;
            console.log(loggedInUserDetails);
            $('#user').html(loggedInUserDetails.employeeName)
            $('#logOut').attr('hidden', false)
            $("#logInFormContainer").addClass('m-fadeOut');
            let hasDatatableGenarated = await getWorkCenter()

            $("#workCenterContainer").removeClass('m-fadeOut');
            $("#workCenterContainer").addClass('m-fadeIn');


        }
        else {
            generateError({ 'errorMessage': 'Badge Id Not found' })
        }

        /* --------------------------------------------------- Logout Function Start --------------------------------------------------------------- */

        $('#logOut').click(() => {
            window.location.reload();
        })
        /* --------------------------------------------------- Logout Function End ----------------------------------------------------------------- */
    })

    /* --------------------------------------------------- Login Function End ------------------------------------------------------------------ */
    /* --------------------------------------------------- Work center Data Get Restlet Call Start ------------------------------------------ */

    const getWorkCenter = async () => {
        const getWorkCenterDataObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_get_work_center_dta.scriptInternalId}&deploy=1`)
        console.log(getWorkCenterDataObj);
        if (getWorkCenterDataObj.responseSuccess) {
            let workCenterDiv = '';
            let workCenterData = getWorkCenterDataObj.responseData
            Object.keys(workCenterData).map(async (element, index) => {
                workCenterDiv += `<div class="card mt-4" id=${workCenterData[element].internalId}>
                <div class="card-header"></div>
                <div class="card-body">
                    <h5 class="card-title text-center">${workCenterData[element].name}</h5>
                    
                    <span class='workCenterClass' hidden>${workCenterData[element].internalId}</span>
                    <div class="image"></div>
                    <div class="d-flex justify-content-center mt-4 floatingButton">
                    ${workCenterData[element].runningWorkOrderCount > 0 ? '<button class="btn btn-success runningButton position-relative"><i class="las la-running"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">' + workCenterData[element].runningWorkOrderCount + '</span></button>' : '<button class="btn btn-success runningButton position-relative disabled"><i class="las la-running"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">' + workCenterData[element].runningWorkOrderCount + '</span></button>'}
                    <button class="btn btn-primary pmcLinkButton shadow ml-2"><i class="las la-home"></i></button>
                    ${workCenterData[element].downtimeWorkOrderCount > 0 ? '<button class="btn btn-danger downTimeButton position-relative shadow ml-2"><i class="las la-pause"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">' + workCenterData[element].downtimeWorkOrderCount + '</span></button>' : '<button class="btn btn-danger position-relative downTimeButton shadow ml-2 disabled"><i class="las la-pause"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">' + workCenterData[element].downtimeWorkOrderCount + '</span></button>'}
                    </div>
                </div>
            </div>`;
            })
            $("#workCenterDiv").html(workCenterDiv);
            Object.keys(workCenterData).map(async (element, index) => {
                $(`#${workCenterData[element].internalId} .image`).css('background-image', `url(${workCenterData[element].image})`);
                if (workCenterData[element].runningWorkOrderCount > 0) {
                    $(`#${workCenterData[element].internalId}`).css('box-shadow', '5px 10px 18px rgb(201, 240, 201)');
                    $(`#${workCenterData[element].internalId} .card-header`).css('background', '#50C878');
                }
                else if (workCenterData[element].downtimeWorkOrderCount > 0) {
                    $(`#${workCenterData[element].internalId}`).css('box-shadow', '5px 10px 18px rgb(253, 214, 214)');
                    $(`#${workCenterData[element].internalId} .card-header`).css('background', '#FAA0A0');

                }
                else {
                    $(`#${workCenterData[element].internalId}`).css('box-shadow', '5px 10px 18px #C5C5C5');
                    $(`#${workCenterData[element].internalId} .card-header`).css('background', '#C5C5C5');
                    $(`#${workCenterData[element].internalId} .pmcLinkButton`).attr('disabled', true);

                }
            })
        }

    }

    /* --------------------------------------------------- Work center Data Get Restlet Call End ------------------------------------------ */

    $(document).on('click', '.runningButton', async (e) => {
        let workCenter = $(e.target).parents('.card-body').find('.workCenterClass').html();
        let operationStatus = 3;
        let workOrderResponseObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_filter_work_order.scriptInternalId}&deploy=1&operationStatus=${operationStatus}&workCenter=${workCenter}`)
        console.log(workOrderResponseObj)
        if (workOrderResponseObj.responseSuccess && workOrderResponseObj.responseData.isSuccess) {
            $('#workCeneterDataTable').DataTable({
                data: workOrderResponseObj.responseData.workOrderResponseDetails.data,
                columns: workOrderResponseObj.responseData.workOrderResponseDetails.columnsArr,
                destroy: true
            });
        }
        $('#workCenterModal').modal('show');
    })

    $(document).on('click', '.downTimeButton', async (e) => {
        let workCenter = $(e.target).parents('.card-body').find('.workCenterClass').html();
        let operationStatus = 2;
        let workOrderResponseObj = await fetchGetRequest(`/app/site/hosting/restlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_filter_work_order.scriptInternalId}&deploy=1&operationStatus=${operationStatus}&workCenter=${workCenter}`)
        if (workOrderResponseObj.responseSuccess && workOrderResponseObj.responseData.isSuccess) {
            $('#workCeneterDataTable').DataTable({
                data: workOrderResponseObj.responseData.workOrderResponseDetails.data,
                columns: workOrderResponseObj.responseData.workOrderResponseDetails.columnsArr,
                destroy: true
            });
        }
        $('#workCenterModal').modal('show');
    })
    $(document).on('click', '.pmcLinkButton', async (e) => {
        console.log("CLICK")
        let workCenterId = $(e.target).parents('.card-body').find('.workCenterClass').html();
        window.open(`/app/site/hosting/scriptlet.nl?script=${scriptInternalIdObj.customscript_pct_pmc_suitelet.scriptInternalId}&deploy=1&badgeId=1234&workCenter=${workCenterId}`, '_self');
    })

})

/* ---------------------------------------------------- Restlet 'GET' Request Call Start ------------------------------------------------------------------------- */
const fetchGetRequest = async (url) => {
    let responseObj = {
        'responseSuccess': false,
        'responseData': {},
    }
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
    return responseObj;
}
/* ---------------------------------------------------- Restlet 'GET' Request Call End ---------------------------------------------------------------------------- */

/* ---------------------------------------------------- Restlet 'POST' Request Call Start ------------------------------------------------------------------------- */
const fetchPostRequest = async (url, data) => {
    let responseObj = {
        'responseSuccess': false,
        'responseData': {},
    }
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

const generateError = (dataObj) => {
    swalAlertObj.type = 'error';
    swalAlertObj.title = dataObj.errorMessage;
    swalAlertObj.timer = dataObj.timer ? dataObj.timer : 1500;
    swalAlertObj.timerProgressBar = true;
    swalAlertObj.showConfirmButton = dataObj.showConfirmButton ? dataObj.showConfirmButton : false
    generateAlert(swalAlertObj)
}


const enableUI = () => {
    if (uiIsBlocked) {
        $.unblockUI();
        uiIsBlocked = false;
    }
}
const disableUI = () => {
    if (!uiIsBlocked) {
        $.blockUI({
            message: `<div class="d-flex justify-content-center">
                <div class= "spinner-border" role="status" >
                <span class="visually-hidden">Loading...</span></div></div > `,
            css: {
                width: '100%',
                top: '0%',
                left: '0%',
                border: 'none',
                padding: '25%',
                backgroundColor: '#666666',
                opacity: 1,
                height: '100vh'
            }
        });
        uiIsBlocked = true;
    }
}