/***********************************************************************************************************************************************

Script Name:        PCT_MOTT_Timesheet_Controller
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for MOTT Timesheet PMC.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************* Included Functions & Updates **********************************************************
/***********************************************************************************************************************************************

Function Name:             Purpose:                                                                               Developer:
Anirban Gupta
Anirban Gupta

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

************************************************************************************************************************************************/

/* ------------------------------------------------------------------------------- DECLARING GLOBAL VARIABLES ------------------------------------------------------------------------------- */

//Array to store internal ID of all required scripts and dataTable objects on initialization
var script_internal_ids = [], tableObjects = [];

//Variable to keep track of logged in/out status and UI disabled/enabled status
var logged_in = 0, uiIsBlocked = 0;

//Global variable to keep track of the currently selected row
var selectedRow;

//Global variables to store various stuff on page load 
var pct_mott_scriptSearcher_script_internalid, dynamic_part_of_url = "";

//Project Table Elements
var employeeName, employeeInternalID, employee_subsidiaryInternalID, hourlyLaborCost, projectName, projectNumber, projectManager, project_Type, customer, subsidiary, primary_Contact, status, start_Date, end_Date, actual_EndDate, admin, allowAll, timetrackingStatus, projectInternalID, timeTrackingInternalID, timeTrackingStartTime, timeTrackingTotalBreakDuration, timeTrackingBreakStartTime, rowcount = 0, currentRowIndex, timerRefreshIntervalId = false, timerBlinkIntervalId = false;

// Project Data Already Fetched
var dataFetched = false;

$(document).ready(function () {
    /* ---------------------------------------------------------------------- Initializing Moment-Range --------------------------------------------------------------------------------------------- */
    window['moment-range'].extendMoment(moment);

    /* ---------------------------------------------------------------------- FETCHING INTERNAL IDs OF SCRIPT SEARCHER SCRIPTS ---------------------------------------------------------------------- */

    pct_mott_scriptSearcher_script_internalid = $("#script-searcher-script").val();

    /* ------------------------------------------------------------------------- FETCHING INTERNAL IDs OF REQUIRED SCRIPTS ------------------------------------------------------------------------- */

    /* ------------------------------------------- Login RESTLet ------------------------------------------- */

    scriptSearch("customscript_pct_mott_time_login_restlet", "Login RESTLet", 0);

    /* --------------------------------------- Project Search RESTLet --------------------------------------- */

    scriptSearch("customscript_pct_mott_time_projectsearch", "Project Search RESTLet", 1);

    /* ------------------------------------ Time Tracking Entry RESTLet ------------------------------------ */

    scriptSearch("customscript_pct_mott_time_trackingentry", "Time Tracking Entry RESTLet", 2);

    /* ---------------------------------- Saved Time Entries Search RESTLet ---------------------------------- */

    scriptSearch("customscript_pct_mott_time_entry_search", "Saved Time Entries Search RESTLet", 3);

    /* -------------------------------------- Location Search RESTLet -------------------------------------- */

    scriptSearch("customscript_pct_mott_time_location", "Location Search RESTLet", 4);

    /* ------------------------------ Active Time Tracking Record Search RESTLet ------------------------------ */

    scriptSearch("customscript_pct_mott_ts_tt_record_srch", "Active Time Tracking Search RESTLet", 5);

    /* ------------------------------ Record Time Tracking Operations RESTLet ------------------------------ */

    scriptSearch("customscript_pct_mott_ts_tt_record_op", "Record Time Tracking Operations RESTLet", 6);

    /* ------------------------------------ Project Task Search RESTLet ------------------------------------ */

    scriptSearch("customscript_pct_mott_ts_projecttask_src", "Project Task Search RESTLet", 7);

    /* --------------------------------------- Journal Entry RESTLet --------------------------------------- */

    scriptSearch("customscript_pct_mott_time_journalentry", "Journal Entry RESTLet", 8);

    /* --------------------------------------- Open Time Tracking Record Search RESTLet --------------------------------------- */

    scriptSearch("customscript_pct_mott_ts_open_tt_rec_src", "Open Time Tracking Record Search RESTLet", 9);

});

/* ------------------------------------------------------------------------------------ LOGIN FUNCTION ------------------------------------------------------------------------------------ */

$(document).on('click', '#login', function () {

    swal.setDefaults({
        input: 'text',
        confirmButtonText: 'Submit',
        showCancelButton: false,
        animation: true,
        progressSteps: [],
    });
    var steps = [{
        title: 'Log In',
        text: 'Please Provide Your Badge ID'
    }];
    swal.queue(steps).then(function (result) {
        if (result > 0) {
            disableUI();
            $.ajax({
                url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[0] + "&deploy=1&password=" + result,
                method: "GET",
                dataType: "json",
                contentType: "application/json",
                async: true,
                crossDomain: false,
                startTime: performance.now(),
                success: function (data) {
                    if (data.message == "Logged In") {
                        logged_in = 1;
                        sweetAlert('success', 'Logged In', 750);
                        $(".login").hide();
                        $(".logout").show();
                        $("#username").html(data.emp_name);
                        $("#username").attr("title", "Current User");
                        $("#username").removeClass('no-user-logged-in-btn no-user-logged-in-red');
                        $("#username").removeClass('disabled');
                        $("#username").addClass('logged-in-btn peachyellow-custom-color');
                        $("#project-card").show("1000");

                        employeeName = data.emp_name;
                        employeeInternalID = data.internalID;
                        employee_subsidiaryInternalID = data.subsidiaryInternalID;
                        hourlyLaborCost = data.hourlyLaborCost;

                        //Loading dynamic part of url [delay required so it is placed here]
                        dynamic_part_of_url = $("#dynamic-part-of-record-url").val();
                    }
                    else if (data.message == "Please enter correct Badge ID") {
                        sweetAlert('error', 'Account not found');
                    }
                    else {
                        sweetAlert('error', 'Unknown Error Occurred');
                        console.log("Unknown Error Occurred while fetching account details [AJAX Passed as Success]");
                    }
                },
                complete: function () {
                    //logExecutionTime(this.startTime, "Login Restlet Call");
                    if (logged_in) {
                        showAssignedProjects();
                        loadLocations();
                    }
                    enableUI();
                },
                error: function (jqXHR, exception) {
                    errorLogging(jqXHR, exception, "Login Restlet Call");
                },
            });
            swal.resetDefaults();
        }
        else {
            sweetAlert('warning', 'Please enter a Badge ID before submitting', undefined, null);
        }
    }).catch(function () {
        swal.noop;
        swal.resetDefaults();
    });
});

/* ------------------------------------------------------------------------------------ LOGOUT FUNCTION ------------------------------------------------------------------------------------ */

$(document).on('click', '#logout', function () {

    $('#record_save_notification').toast('hide');
    $(".login").show();
    $(".logout").hide();
    $("#username").html("No User Logged In");
    $("#username").attr("title", 'Please Login');
    $("#username").removeClass('logged-in-btn peachyellow-custom-color');
    $("#username").addClass('disabled');
    $("#username").addClass('no-user-logged-in-btn no-user-logged-in-red');
    $("#project-card").hide("1000");
    $("#timeTracking_InputLocation").find('option').not(':first').remove();

    deselectRow(selectedRow);
    checkAndResetTable(0, "projectsTableHead", "projectsTableBody");
    sweetAlert('success', 'Logged Out', 750);

    logged_in = 0;
});

/* ------------------------------------------------------------------------------------- ADVANCED PROJECT TRACK ------------------------------------------------------------------------------------- */

$(document).on('click', '#openAdvancedProjectTable', function () {
    $(".projectTableContainer").toggleClass('hide');
    $(".advancedProjectTableContainer").toggleClass('hide');

    if (!dataFetched) {
        var d = new Date();
        var weeknumber = moment(d).isoWeek();
        if (weeknumber < 10) {
            $("#weekSelector").val(`${d.getFullYear()}-W0${weeknumber}`);
        }
        else {
            $("#weekSelector").val(`${d.getFullYear()}-W${weeknumber}`);
        }
        const today = moment().year(d.getFullYear()).isoWeek(weeknumber)
        var startDate = moment(today.day(1)).format("MM/DD/YYYY")
        var endDate = moment(today.day(5)).format("MM/DD/YYYY")
        var range = moment.range(startDate, endDate)
        var array = Array.from(range.by("days"));
        createTable(array, startDate, endDate)
    }
})

/* ------------------------------------------------------------------------------------- WEEK SELCTOR FUNCTIONALITY ------------------------------------------------------------------------------------- */
$(document).on('change', "#weekSelector", function () {

    var d = document.getElementById('weekSelector').value
    const today = moment().year(d.split('-')[0]).isoWeek(d.split('-')[1].substr(1));
    var startDate = moment(today.day(1)).format("MM/DD/YYYY");
    var endDate = moment(today.day(5)).format("MM/DD/YYYY");
    console.log("Start Date : " + startDate + ", End Date : " + endDate);
    var range = moment.range(startDate, endDate)
    var array = Array.from(range.by("days"));
    createTable(array, startDate, endDate)
})

function createTable(arr, startDate, endDate) {

    var weeksArr = [];
    var myvar = '<tr><th>Project Name</th><th>Project Number</th>';
    myvar += arr.map((ele) => {
        weeksArr.push(ele.format('MM/DD/YYYY'))
        return `<th>${ele.format('MM/DD/YYYY')}</th>`;
    })

    myvar += '</tr>';

    console.log(weeksArr);

    $.ajax({
        url: "/app/site/hosting/restlet.nl?script=2316&deploy=1&empId=" + employeeInternalID + "&startDate=" + startDate + "&endDate=" + endDate,
        method: "GET",
        dataType: "json",
        contentType: "application/json",
        async: false,
        crossDomain: false,
        success: function (data) {
            console.log(data);
            var tbody = '';
            Object.keys(data).map((element) => {
                tbody += `<tr><td>${data[element].projectName}</td>` +
                    `<td>${data[element].projectId}</td>`;

                var projectData = data[element].projectData;
                Object.keys(projectData).map((dateElement) => {
                    var date = moment(dateElement).format('MM/DD/YYYY').toString()
                    console.log(date);
                    var dateIndex = weeksArr.indexOf(date);
                    for (var i = 0; i < weeksArr.length; i++) {
                        if (i === dateIndex) {
                            if (projectData[dateElement].hasOwnProperty('true') && projectData[dateElement].hasOwnProperty('false')) {

                                tbody += `<td><input type="text" class="form-control" value=${projectData[dateElement].true} disabled /><input type="text" class="form-control" value=${projectData[dateElement].false} /></td>`;
                            }
                            else if (projectData[dateElement].hasOwnProperty('true')) {

                                tbody += `<td><input type="text" class="form-control" value=${projectData[dateElement].true} disabled /><input type="text" class="form-control" /></td>`
                            }
                            else {

                                tbody += `<td><input type="text" class="form-control" disabled /><input type="text" class="form-control" value=${projectData[dateElement].false} /></td>`
                            }
                        }
                        else {

                            tbody += `<td><input type="text" class="form-control" disabled /><input type="text" class="form-control" /></td>`;
                        }
                    }
                    return tbody;
                })
                tbody += `</tr>`;
                return tbody
            })

            $("#advancedProjectsTableBody").html(tbody)
            $("#advancedProjectsTableButtonContainer").attr('hidden', false)
            dataFetched = true
        }
    });

    // var myvar = '<tr><th>Project Name</th><th>Project Number</th>';
    // myvar += arr.map((ele) => {
    //     return `<th>${ele.format('MM/DD/YYYY')}</th>`;
    // })
    // myvar += '</tr>';

    $("#advancedProjectsTableHead").html(myvar);

    $("#advancedProjectsTable").DataTable({
        retrieve: true,
        "pageLength": 10,
        "processing": true,
        "language": {
            "emptyTable": "No projects found",
            "infoEmpty": ""
        },
        "columnDefs": [
            { "targets": [], "visible": false }
        ],
        preDrawCallback: function (settings) {
            var api = new $.fn.dataTable.Api(settings);
            $(this).closest('.dataTables_wrapper').find('.dataTables_paginate').toggle(api.page.info().pages > 1);
        }
    });
}


/* ------------------------------------------------------------------------------------ USERNAME CLICK FUNCTION ------------------------------------------------------------------------------------ */

$(document).on('click', '#username', function () {
    if (logged_in) {
        window.open(dynamic_part_of_url + 'common/entity/employee.nl?id=' + employeeInternalID, '_blank');
    }
});

/* ---------------------------------------------------------------------------------- DATATABLE ROW CLICK FUNCTION ---------------------------------------------------------------------------------- */

$(document).on("click", "#projectsTable tbody tr", function () {
    var already_selected = $(this).hasClass("datatable-row-selected");
    if (already_selected) {
        deselectRow(this);
    }
    else {
        selectRow(this);
    }
});

/* ------------------------------------------------------------------------------ RECORD TIME BUTTON CLICK FUNCTION ------------------------------------------------------------------------------ */

$(document).on('click', '#record-time-button', function () {
    if ($(this).hasClass('shadow')) {
        startTimeTracking();
    }
    else {
        stopTimeTracking();
    }
});

/* ------------------------------------------------------------------------------- NEW TIME BUTTON CLICK FUNCTION ------------------------------------------------------------------------------- */

$(document).on('click', '#new-time-button', function () {
    if ($(this).hasClass('shadow')) {
        newtimeButtonPressed();
    }
    else {
        newtimeButtonReleased();
    }
});

/* -------------------------------------------------------------------------------- PAUSE BUTTON CLICK FUNCTION -------------------------------------------------------------------------------- */

$(document).on('click', '#pause-button', function () {
    if ($(this).hasClass('shadow')) {
        pauseTimeTracking();
    }
    else {
        resumeTimeTracking();
    }
});

/* ------------------------------------------------------------------------- TIME TRACKING SUBMIT BUTTON CLICK FUNCTION ------------------------------------------------------------------------- */

$(document).on('click', '#timeTracking_FormSubmit', function () {
    var duration = $("#timeTracking_InputDuration").val();
    var location = $("#timeTracking_InputLocation").val();
    var task = $("#timeTracking_InputTask").val();
    var memo = $("#timeTracking_InputMemo").val();
    var approval = $("#timeTracking_formCheck").is(":checked");
    convertToHHMM($("#timeTracking_InputDuration").val());
    if (duration != null && duration != "" && location != null && location != "" && approval == true) {
        editOrPostTimeEntries('save', duration, location, passAmpersandInUrl(task), passAmpersandInUrl(memo));
    }
});

/* ------------------------------------------------------------------------------- POST TIME BUTTON CLICK FUNCTION ------------------------------------------------------------------------------- */

$(document).on('click', '#savedTimeEntriesTable tbody #post_time', function () {

    var row_index = tableObjects[1].row((this).closest('tr')).index();
    var duration = tableObjects[1].cell(row_index, 2).data();
    var timeEntryDepartmentInternalID = tableObjects[1].cell(row_index, 11).data();
    var timeEntryClassInternalID = tableObjects[1].cell(row_index, 7).data();
    var timeEntryLocationInternalID = tableObjects[1].cell(row_index, 9).data();
    var recordInternalID = tableObjects[1].cell(row_index, 12).data();

    var hrs = Number(duration.split(':')[0]);
    var min = Number(duration.split(':')[1]);
    duration = (hrs * 60) + Number(min);
    var totalLaborCost = duration * (hourlyLaborCost / 60);
    postTime(row_index, totalLaborCost, timeEntryDepartmentInternalID, timeEntryClassInternalID, timeEntryLocationInternalID, recordInternalID);
});

/* ------------------------------------------------------------------------- TIME TRACKING CANCEL BUTTON CLICK FUNCTION ------------------------------------------------------------------------- */

$(document).on('click', '#timeTracking_FormCancel', function () {
    newtimeButtonReleased();
    timeTrackingResetInputFields();
});

/* ---------------------------------------------------------------------- Pulling notification behind the body upon close ---------------------------------------------------------------------- */

$('#record_save_notification').on('hidden.bs.toast', function () {
    $('#record_save_notification_maindiv').css("z-index", "-1");
});
$('#lost_connection_notification').on('hidden.bs.toast', function () {
    $('#lost_connection_notification_maindiv').css("z-index", "-1");
});

/* ---------------------------------------------------------------------------------- Refresh Button Functions ---------------------------------------------------------------------------------- */

$(document).on('click', '#refreshProjectsCard', function () {
    deselectRow(selectedRow);
    newtimeButtonReleased();
    timeTrackingResetInputFields();
    showAssignedProjects();
});
$(document).on('click', '#refreshTimeTrackingCard', function () {
    timeTrackingResetInputFields();
    $("#timeTracking_InputDuration").focus();
});
$(document).on('click', '#refreshSavedTimeEntriesCard', function () {
    showSavedTimeEntriesCard();
});

/* ---------------------------------------------------------------------------------- FUNCTIONS FOR MULTI USE ----------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------ Show Assigned Projects Function ------------------------------------------------------------------------------ */

function showAssignedProjects() {
    checkAndResetTable(0, "projectsTableHead", "projectsTableBody");
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[1] + "&deploy=1&employeeInternalID=" + employeeInternalID,
        startTime: performance.now(),
        success: function (data) {

            rowcount = data.rowcount;
            $("#projectsTableHead").html(data.thead);
            if (data.message == "Projects Found") {
                $("#projectsTableBody").html(data.tbody);
            }
            else if (data.message == "Projects Not Found") {
                sweetAlert('warning', 'No projects found for this user.', 5000);
            }
            else {
                console.log("Unknown Error Occurred while fetching projects and project details [AJAX Passed as Success]");
            }
            tableObjects[0] = $('#projectsTable').DataTable({
                retrieve: true,
                "pageLength": 10,
                "processing": true,
                "language": {
                    "emptyTable": "No projects found",
                    "infoEmpty": ""
                },
                "columnDefs": [
                    { "targets": [3, 5, 6, 9, 10, 11, 12, 13, 14, 15], "visible": false }
                ],
                preDrawCallback: function (settings) {
                    var api = new $.fn.dataTable.Api(settings);
                    $(this).closest('.dataTables_wrapper').find('.dataTables_paginate').toggle(api.page.info().pages > 1);
                }
            });
        },
        complete: function () {
            for (var index = 0; index < rowcount; index++) {
                findActiveRecordData(tableObjects[0].cell(index, 14).data(), index);
            }
            enableUI();
            //logExecutionTime(this.startTime, "Project Search Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Project Search Restlet Call");
        },
    });
}

/* ------------------------------------------------------------------------------------ Row Selection Function ------------------------------------------------------------------------------------ */

function selectRow(sRow) {
    if (tableObjects[0].data().any()) {

        $("#timeTracking_InputTask").find('option').not(':first').remove();

        selectedRow = sRow;
        tableObjects[0].$('tr.datatable-row-selected').removeClass('datatable-row-selected');
        $(sRow).addClass('datatable-row-selected');
        $("#new-time-button").attr("aria-expanded", "true");
        if ($("#time-tracking-card").is(":visible")) {
            newtimeButtonReleased();
        }
        if ($("#timer").is(":visible")) {
            hideClock();
        }

        projectName = replaceAmp(tableObjects[0].row(sRow).data()[0].trim());
        projectNumber = replaceAmp(tableObjects[0].row(sRow).data()[1].trim());
        projectManager = replaceAmp(tableObjects[0].row(sRow).data()[2].trim());
        project_Type = replaceAmp(tableObjects[0].row(sRow).data()[3].trim());
        customer = replaceAmp(tableObjects[0].row(sRow).data()[4].trim());
        subsidiary = replaceAmp(tableObjects[0].row(sRow).data()[5].trim());
        primary_Contact = replaceAmp(tableObjects[0].row(sRow).data()[6].trim());
        status = replaceAmp(tableObjects[0].row(sRow).data()[7].trim());
        start_Date = tableObjects[0].row(sRow).data()[8].trim();
        end_Date = tableObjects[0].row(sRow).data()[9].trim();
        actual_EndDate = tableObjects[0].row(sRow).data()[10].trim();
        admin = replaceAmp(tableObjects[0].row(sRow).data()[11].trim());
        allowAll = tableObjects[0].row(sRow).data()[12].trim();
        timetrackingStatus = replaceAmp(tableObjects[0].row(sRow).data()[13].trim());
        projectInternalID = tableObjects[0].row(sRow).data()[14].trim();
        timeTrackingInternalID = tableObjects[0].row(sRow).data()[15];
        timeTrackingStartTime = tableObjects[0].row(sRow).data()[16];
        timeTrackingTotalBreakDuration = tableObjects[0].row(sRow).data()[17] || 0;
        timeTrackingBreakStartTime = tableObjects[0].row(sRow).data()[18];

        currentRowIndex = tableObjects[0].row(sRow).index();

        $("#timeTracking_InputEmployee").attr("value", employeeName);
        $("#timeTracking_InputCustomer").attr("value", projectNumber);

        if ($("#pause-button").is(":visible")) {
            timeTrackingButtonAppearReleased();
        }

        if (timetrackingStatus != "None") {
            timeTrackingButtonAppearPressed();
            if (timetrackingStatus == "Paused") {
                pauseButtonAppearPressed();
                displayClock(timetrackingStatus, timeTrackingStartTime, timeTrackingTotalBreakDuration, timeTrackingBreakStartTime);
            }
            else {
                displayClock(timetrackingStatus, timeTrackingStartTime, timeTrackingTotalBreakDuration);
            }
        }
        showInformationAndActionCards();
        showSavedTimeEntriesCard();
        loadProjectTasks();
        timeTrackingResetInputFields();
    }
}

/* ----------------------------------------------------------------------------------- Row Deselection Function ----------------------------------------------------------------------------------- */

function deselectRow(sRow) {
    $(sRow).removeClass('datatable-row-selected');
    $("#time-tracking-card").hide("1000");
    $("#new-time-button").attr("aria-expanded", "false");
    $("#information-action-cards").hide("1000");
    $("#saved-time-entries-card").hide("1000");

    newtimeButtonReleased();
    timeTrackingButtonAppearReleased();
    timeTrackingResetInputFields();
    hideClock();
}


/* ------------------------------------------------------------------------- Load Locations Based on Employee Function ------------------------------------------------------------------------- */

function loadLocations() {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[4] + "&deploy=1&subsidiaryInternalID=" + employee_subsidiaryInternalID,
        startTime: performance.now(),
        success: function (data) {
            $.each(data, function (key, obj) {
                $("#timeTracking_InputLocation").append('<option value="' + obj.location_internalID + '">' + obj.location_name + '</option>');
            });
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, "Location Search Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Location Search Restlet Call");
        },
    });
}

/* --------------------------------------------------------- Load Project Tasks Based on Employee/Project/Allow All Permission Function --------------------------------------------------------- */

function loadProjectTasks() {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[7] + "&deploy=1&employeeInternalID=" + employeeInternalID + "&projectInternalID=" + projectInternalID + "&allowAll=" + allowAll,
        startTime: performance.now(),
        success: function (data) {
            $.each(data, function (key, obj) {
                $("#timeTracking_InputTask").append('<option value="' + obj.taskInternalID + '">' + obj.taskName + '</option>');
            });
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, "Project Task Search Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Project Task Search Restlet Call");
        },
    });
}

/* -------------------------------------------------------------------- Time Tracking Record Start/Stop/Pause/Resume Function -------------------------------------------------------------------- */

function recordOperations(requestType) {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[6] + "&deploy=1&employeeInternalID=" + employeeInternalID + "&projectInternalID=" + projectInternalID + "&requestType=" + requestType + "&recordInternalID=" + timeTrackingInternalID,
        startTime: performance.now(),
        success: function (data) {

            if (data.message == "Time Tracking Successfully Started") {
                sweetAlert('success', 'Time Tracking Started', 750);
                tableObjects[0].cell(currentRowIndex, 13).data("Open").draw();
                tableObjects[0].cell(currentRowIndex, 15).data(data.internalID).draw();
                tableObjects[0].cell(currentRowIndex, 16).data(data.startTime).draw();
                tableObjects[0].cell(currentRowIndex, 17).data(0).draw();
                timeTrackingInternalID = data.internalID;
                displayClock("Open", data.startTime, 0);
            }
            else if (data.message == "Time Tracking Successfully Paused") {
                sweetAlert('success', 'Time Tracking Paused', 750);
                tableObjects[0].cell(currentRowIndex, 13).data("Paused").draw();
                tableObjects[0].cell(currentRowIndex, 18).data(data.breakStartTime).draw();
                displayClock("Paused", data.startTime, timeTrackingTotalBreakDuration, data.breakStartTime);
            }
            else if (data.message == "Time Tracking Successfully Resumed") {
                sweetAlert('success', 'Time Tracking Resumed', 750);
                tableObjects[0].cell(currentRowIndex, 13).data("Open").draw();
                tableObjects[0].cell(currentRowIndex, 17).data(data.totalBreakDuration).draw();
                tableObjects[0].cell(currentRowIndex, 18).data("").draw();
                displayClock("Resume", data.startTime, data.totalBreakDuration);
            }
            else if (data.message == "Time Tracking Successfully Stopped") {
                if (data.durationInMinutes == 0) {
                    sweetAlert('warning', 'Time Tracking Stopped', undefined, undefined, undefined, 'Total work duration was less than a minute, so a new time entry is not required.');
                }
                else {
                    sweetAlert('success', 'Time Tracking Stopped', 750);

                    newtimeButtonPressed();
                    $("#timeTracking_InputDuration").prop('type', 'text');
                    $("#timeTracking_InputDuration").val(data.duration);
                    $("#timeTracking_InputDuration").prop('readonly', true);
                    $("#timeTracking_InputLocation").focus();
                }
                timeTrackingButtonAppearReleased();
                tableObjects[0].cell(currentRowIndex, 13).data("None").draw();
                tableObjects[0].cell(currentRowIndex, 15).data("").draw();
                tableObjects[0].cell(currentRowIndex, 16).data("").draw();
                tableObjects[0].cell(currentRowIndex, 17).data("").draw();
                tableObjects[0].cell(currentRowIndex, 18).data("").draw();
                hideClock();
                timeTrackingInternalID = undefined;
            }
            else {
                console.log("Unknown Error Occurred while saving time tracking record for : " + projectName + " [AJAX Passed as Success]");
            }
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, "Time Tracking Record Operations Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, requestType + "Time Tracking Record Operations Restlet Call");
        },
    });
}

/* ------------------------------------------------------------------------- Active Time Tracking Record Search Function ------------------------------------------------------------------------- */

function findActiveRecordData(project_internalID, rowNumber) {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[5] + "&deploy=1&employeeInternalID=" + employeeInternalID + "&projectInternalID=" + project_internalID,
        startTime: performance.now(),
        success: function (data) {

            if (data.message == "Found Active Record") {
                tableObjects[0].cell(rowNumber, 13).data(data.status).draw();
                tableObjects[0].cell(rowNumber, 15).data(data.internalID).draw();
                tableObjects[0].cell(rowNumber, 16).data(data.timeTrackingStartTime).draw();
                tableObjects[0].cell(rowNumber, 17).data(data.totalBreakDuration).draw();
                tableObjects[0].cell(rowNumber, 18).data(data.breakStartTime).draw();
            }
            else if (data.message == "No Active Records Found") {
                //console.log("No Active Records Found");
            }
            else {
                console.log("Unknown Error Occurred while fetching active time tracking records with project internal id : " + project_internalID + " [AJAX Passed as Success]");
            }
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, "Active Time Tracking Record Search Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Active Time Tracking Record Search Restlet Call");
        },
    });
}

/* ----------------------------------------------------------------------------------- Display Clock Function ----------------------------------------------------------------------------------- */

function displayClock(timetrackingStatus, timeTrackingStartTime, timeTrackingTotalBreakDuration, timeTrackingBreakStartTime) {
    var clock = document.getElementById('time');
    if (timetrackingStatus == "Paused") {
        updateTime(timeTrackingStartTime, timeTrackingTotalBreakDuration, timeTrackingBreakStartTime);
        clearClockIntervals();
        timerBlinkIntervalId = setInterval(function () {
            clock.style.opacity = (clock.style.opacity == 0 ? 1 : 0);
            clock.style.transition = "0.2s";
        }, 500);
    }
    else if (timetrackingStatus == "Open") {
        clearClockIntervals();
        clock.style.opacity = 1;
        timerRefreshIntervalId = setInterval(function () {
            updateTime(timeTrackingStartTime, timeTrackingTotalBreakDuration);
        }, 1000);
    }
    else if (timetrackingStatus == "Resume") {
        clearClockIntervals();
        clock.style.opacity = 1;
        timerRefreshIntervalId = setInterval(function () {
            updateTime(timeTrackingStartTime, timeTrackingTotalBreakDuration);
        }, 1000);
    }
}

/* ------------------------------------------------------------------------------------ Hide Clock Function ------------------------------------------------------------------------------------ */

function hideClock(timetrackingStatus, timeTrackingStartTime, timeTrackingTotalBreakDuration, timeTrackingBreakStartTime) {
    $('#timer').hide("drop", { direction: "bottom" }, "fast");
    clearClockIntervals();
}

/* ------------------------------------------------------------------------------------ Hide Clock Function ------------------------------------------------------------------------------------ */

function clearClockIntervals() {
    if (timerRefreshIntervalId) {
        clearInterval(timerRefreshIntervalId);
        timerRefreshIntervalId = false;
    }
    if (timerBlinkIntervalId) {
        clearInterval(timerBlinkIntervalId);
        timerBlinkIntervalId = false;
    }
}

/* ------------------------------------------------------------------------------ Edit or Post Time Entries Function ------------------------------------------------------------------------------ */

function editOrPostTimeEntries(requestType, duration, location, task, memo, recordInternalID, row_index) {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[2] + "&deploy=1&requestType=" + requestType + "&employeeInternalID=" + employeeInternalID + "&projectInternalID=" + projectInternalID + "&duration=" + duration + "&location=" + location + "&task=" + task + "&memo=" + memo + "&recordInternalID=" + recordInternalID,
        startTime: performance.now(),
        success: function (data) {
            if (data.message == "Successfully Saved Time Tracking Record") {
                sweetAlert('success', 'Time Tracking Data Successfully Recorded', 750);

                var timebill_internal_id = data.internalID;
                var saved_timebill_link = dynamic_part_of_url + "accounting/transactions/timebill.nl?id=" + timebill_internal_id;
                $("#record_save_notification_body").html('Time tracking record has been created, you can view the record <a href="' + saved_timebill_link + '" target="_blank">here.</a>');
                $('#record_save_notification_maindiv').css("z-index", "3");
                $('#record_save_notification').toast('show');
                showSavedTimeEntriesCard();
            }
            else if (data.message == "Successfully Posted Time Tracking Record") {
                // Changing posted status to Yes and removing Post Time button from the row
                tableObjects[1].cell(row_index, 6).data("Yes").draw();
                tableObjects[1].cell(row_index, 13).data("").draw();
            }
            else {
                sweetAlert('warning', 'An error occured while saving new time entry');
                console.log("Unknown Error Occurred while saving record in NetSuite [AJAX Passed as Success]");
            }
            if (requestType == 'save') {
                newtimeButtonReleased();
                timeTrackingResetInputFields();
            }
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, requestType + " Time Entries Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, requestType + " Time Entries Restlet Call");
            sweetAlert('warning', 'An error occured while saving new time entry');
        }
    });
}

/* ------------------------------------------------------------------------------ Show Saved Time Entries Function ------------------------------------------------------------------------------ */

function showSavedTimeEntriesCard() {
    checkAndResetTable(1, "savedTimeEntriesTableHead", "savedTimeEntriesTableBody");
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[3] + "&deploy=1&projectInternalID=" + projectInternalID + "&employeeInternalID=" + employeeInternalID,
        startTime: performance.now(),
        success: function (data) {

            $("#savedTimeEntriesTableHead").html(data.thead);
            if (data.message == "Time Entries Found") {
                $("#savedTimeEntriesTableBody").html(data.tbody);
            }
            else if (data.message == "No Time Entries Found") {
                //console.log("No Time Entries Found");
            }
            else {
                console.log("Unknown Error Occurred while fetching time entries for project with internal id : " + projectInternalID + " [AJAX Passed as Success]");
            }
            tableObjects[1] = $('#savedTimeEntriesTable').DataTable({
                retrieve: true,
                "pageLength": 10,
                "processing": true,
                "language": {
                    "emptyTable": "No time entries found",
                    "infoEmpty": ""
                },
                "scrollX": true,
                responsive: {
                    details: false
                },
                "columnDefs": [
                    { "targets": [7, 9, 11, 12], "visible": false }
                ],
                "order": [[13, "desc"]],
                preDrawCallback: function (settings) {
                    var api = new $.fn.dataTable.Api(settings);
                    $(this).closest('.dataTables_wrapper').find('.dataTables_paginate').toggle(api.page.info().pages > 1);
                }
            });
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, "Time Entry Search Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Time Entry Search Restlet Call");
        },
    });

    if (!$("#saved-time-entries-card").is(":visible")) {
        $("#saved-time-entries-card").show("1000");
    }
}

/* --------------------------------------------------------------------------------- Journal Entry Create Function --------------------------------------------------------------------------------- */

function postTime(row_index, totalLaborCost, timeEntryDepartmentInternalID, timeEntryClassInternalID, timeEntryLocationInternalID, recordInternalID) {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[8] + "&deploy=1&employee_subsidiaryInternalID=" + employee_subsidiaryInternalID + "&projectInternalID=" + projectInternalID + "&totalLaborCost=" + totalLaborCost + "&timeEntryDepartmentInternalID=" + timeEntryDepartmentInternalID + "&timeEntryClassInternalID=" + timeEntryClassInternalID + "&timeEntryLocationInternalID=" + timeEntryLocationInternalID,
        startTime: performance.now(),
        success: function (data) {

            if (data.message == "Successfully Saved Journal Entry") {
                editOrPostTimeEntries('post', undefined, undefined, undefined, undefined, recordInternalID, row_index);
                var journal_internal_id = data.internalID;
                var saved_journal_link = dynamic_part_of_url + "accounting/transactions/journal.nl?id=" + journal_internal_id;
                $("#record_save_notification_body").html('Journal Entry has been created, you can view the record <a href="' + saved_journal_link + '" target="_blank">here.</a>');
                $('#record_save_notification_maindiv').css("z-index", "3");
                $('#record_save_notification').toast('show');
            }
            else {
                console.log("Unknown Error Occurred while creating Journal Entry for Saved Time Entry with Internal ID: " + projectInternalID + " [AJAX Passed as Success]");
            }
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, "Creating Journal Entry Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Creating Journal Entry Restlet Call");
            sweetAlert('warning', 'An error occured while posting journal for this time entry');
        },
    });
}

/* -------------------------------------------------------------------------- Show Information and Action Cards Function -------------------------------------------------------------------------- */

function showInformationAndActionCards() {
    $("#project_name_description").html(addBrIfNull(projectName));
    $("#customer_description").html(addBrIfNull(customer));
    $("#subsidiary_description").html(addBrIfNull(subsidiary));
    $("#primary_contact_description").html(addBrIfNull(primary_Contact));
    $("#start_date_description").html(addBrIfNull(start_Date));
    $("#end_date_description").html(addBrIfNull(end_Date));
    $("#admin_description").html(addBrIfNull(admin));

    if (!$("#information-action-cards").is(":visible")) {
        $("#information-action-cards").show("1000");
    }
}

/* ------------------------------------------------------------------------- Time Tracking Button Appear Pressed Function ------------------------------------------------------------------------- */

function timeTrackingButtonAppearPressed() {
    $("#record-time-button").removeClass('shadow');
    $("#record-time-button").removeClass('peachyellow-custom-color');
    $("#record-time-button").addClass('peachyellow-custom-color-darker');

    $("#record-time-button").prop('value', 'Stop Timetracking');

    if ($("#time-tracking-card").is(':visible')) {
        $("#time-tracking-card").hide("1000");
    }

    $("#new-time-button").removeClass('lightblue-custom-color');
    $("#new-time-button").addClass('lightblue-custom-color-disabled');
    $("#new-time-button").prop('disabled', true);
    $("#new-time-button").css('pointer-events', 'none');

    /* ------------------------ Adjusting Pause Button Related CSS Start ------------------------ */

    $(".time-tracking-btn").css({ "margin-left": "1.5rem" });
    $(".newtime-btn").css({ "margin-left": "1.5rem", "margin-right": "0rem" });

    /* ------------------------- Adjusting Pause Button Related CSS End ------------------------- */

    $("#pause-button").show("drop", { direction: "right" }, "fast");
    $("#new-time-button").hide("drop", { direction: "top" }, "fast");
    //console.log("Start Time Tracking Button Pressed");
}

/* ------------------------------------------------------------------------- Time Tracking Button Appear Released Function ------------------------------------------------------------------------- */

function timeTrackingButtonAppearReleased() {
    $("#record-time-button").addClass('shadow');
    $("#record-time-button").addClass('peachyellow-custom-color');
    $("#record-time-button").removeClass('peachyellow-custom-color-darker');

    $("#record-time-button").prop('value', 'Start Timetracking');

    $("#new-time-button").prop('disabled', false);
    $("#new-time-button").removeClass('lightblue-custom-color-disabled');
    $("#new-time-button").addClass('lightblue-custom-color');
    $("#new-time-button").css('pointer-events', '');

    /* ------------------------ Adjusting Pause Button Related CSS Start ------------------------ */

    $(".time-tracking-btn").css({ "margin-left": "2rem" });
    $(".newtime-btn").css({ "margin-left": "2rem", "margin-right": "2rem" });
    $("#pause-button").hide("drop", { direction: "right" }, "fast");
    $("#new-time-button").show("drop", { direction: "top" }, "fast");
    pauseButtonAppearReleased();

    /* ------------------------- Adjusting Pause Button Related CSS End ------------------------- */
    //console.log("Stop Time Tracking Button Released");
}

/* ---------------------------------------------------------------------------------- Start Time Tracking Function ---------------------------------------------------------------------------------- */

function startTimeTracking() {
    var startRequestIsValid = false;
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + script_internal_ids[9] + "&deploy=1&employeeInternalID=" + employeeInternalID,
        startTime: performance.now(),
        success: function (data) {

            if (data.message == "Found Open Record") {
                sweetAlert('warning', 'Cannot Start Time Tracking', undefined, undefined, undefined, 'You are already actively tracking time for ' + data.projectName + '. Please pause or stop the time tracking for that project before proceeding to track time for this project.');
            }
            else if (data.message == "No Open Records Found") {
                startRequestIsValid = true;
            }
            else {
                console.log("Unknown Error Occurred while fetching open time tracking records. [AJAX Passed as Success]");
            }
        },
        complete: function () {
            enableUI();
            if (startRequestIsValid) {
                timeTrackingResetInputFields();
                timeTrackingButtonAppearPressed();
                newtimeButtonReleased();
                recordOperations('Start');
                //console.log("Started Time Tracking");
            }
            //logExecutionTime(this.startTime, "Open Time Tracking Record Search Restlet Call");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, "Open Time Tracking Record Search Restlet Call");
        },
    });
}

/* ---------------------------------------------------------------------------------- Stop Time Tracking Function ---------------------------------------------------------------------------------- */

function stopTimeTracking() {
    recordOperations('Stop');
    //console.log("Stopped Time Tracking");
}

/* -------------------------------------------------------------------------------- NewTime Button Pressed Function -------------------------------------------------------------------------------- */

function newtimeButtonPressed() {
    timeTrackingResetInputFields();
    $("#new-time-button").removeClass('shadow');
    $("#new-time-button").removeClass('lightblue-custom-color');
    $("#new-time-button").addClass('lightblue-custom-color-darker');

    $("#time-tracking-card").show("1000");
    $("#timeTracking_InputDuration").focus();
    //console.log("New Time Button Pressed");
}

/* -------------------------------------------------------------------------------- NewTime Button Release Function -------------------------------------------------------------------------------- */

function newtimeButtonReleased() {
    $("#new-time-button").addClass('shadow');
    $("#new-time-button").addClass('lightblue-custom-color');
    $("#new-time-button").removeClass('lightblue-custom-color-darker');

    $("#time-tracking-card").hide("1000");
    //console.log("New Time Button Released");
}

/* ----------------------------------------------------------------------------- Pause Button Appear Pressed Function ----------------------------------------------------------------------------- */

function pauseButtonAppearPressed() {
    $("#pause-button").removeClass('shadow');
    $("#pause-button").prop('value', 'Resume');
    //console.log("Pause Button Pressed");
}

/* ----------------------------------------------------------------------------- Pause Button Appear Released Function ----------------------------------------------------------------------------- */

function pauseButtonAppearReleased() {
    $("#pause-button").addClass('shadow');
    $("#pause-button").prop('value', 'Pause');
    //console.log("Pause Button Released");
}

/* --------------------------------------------------------------------------------- Pause Time Tracking Function --------------------------------------------------------------------------------- */

function pauseTimeTracking() {
    pauseButtonAppearPressed();
    recordOperations('Pause');
    //console.log("Paused Time Tracking");
}

/* --------------------------------------------------------------------------------- Resume Time Tracking Function --------------------------------------------------------------------------------- */

function resumeTimeTracking() {
    pauseButtonAppearReleased();
    recordOperations('Resume');
    //console.log("Resumed Time Tracking");
}

/* --------------------------------------------------------------------------- Time Tracking Input Fields Reset Function --------------------------------------------------------------------------- */

function timeTrackingResetInputFields() {
    $("#timeTracking_InputDuration").val("");
    $("#timeTracking_InputLocation").val("");
    $("#timeTracking_InputTask").val("");
    $("#timeTracking_InputMemo").val("");
    $("#timeTracking_formCheck").prop("checked", false);
    $("#timeTracking_Form").removeClass('was-validated');
    $("#timeTracking_InputDuration").prop('type', 'number');
    $("#timeTracking_InputDuration").prop('type', 'number');
    $("#timeTracking_InputDuration").prop('readonly', false);
}

/* ----------------------------------------------------------------------------------- Script Search Function ----------------------------------------------------------------------------------- */

function scriptSearch(scriptID, scriptPurpose, position) {
    disableUI();
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        url: "/app/site/hosting/restlet.nl?script=" + pct_mott_scriptSearcher_script_internalid + "&deploy=1&scriptID=" + scriptID,
        startTime: performance.now(),
        success: function (data) {
            if (data.message == "Script Found") {
                script_internal_ids[position] = data.internal_id;
            }
            else if (data.message == "Script Not Found") {
                console.log(scriptPurpose + " Not Found");
            }
            else {
                console.log("Unknown Error Occurred while fetching Internal ID of " + scriptPurpose + " [AJAX Passed as Success]");
            }
        },
        complete: function () {
            enableUI();
            //logExecutionTime(this.startTime, scriptPurpose+ " Script Search");
        },
        error: function (jqXHR, exception) {
            errorLogging(jqXHR, exception, scriptPurpose + " Script Search");
        },
    });
}

/* --------------------------------------------------------------------------------------- Timer Functions --------------------------------------------------------------------------------------- */

function updateTime(timeTrackingStartTime, timeTrackingTotalBreakDuration, timeTrackingBreakStartTime) {
    //var projectStartTime = Date.parse("Fri Oct 16 2020 17:25:01 GMT-0700 (PDT)");
    var currentDateAndTime = new Date();
    var difference = 0;
    if (timeTrackingBreakStartTime) {
        difference = Math.abs(Date.parse(timeTrackingStartTime) - Date.parse(timeTrackingBreakStartTime)) / 1000;
    }
    else {
        difference = Math.abs(Date.parse(timeTrackingStartTime) - Date.parse(currentDateAndTime)) / 1000;
    }
    difference -= (timeTrackingTotalBreakDuration * 60);

    // calculate (and subtract) whole hours
    var hours = Math.floor(difference / 3600);
    difference -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(difference / 60) % 60;
    difference -= minutes * 60;

    // what's left is seconds
    var seconds = difference % 60;  // in theory the modulus is not required
    $('#time').html('<i>' + zeroPadding(hours, hours.toString().length) + ':' + zeroPadding(minutes, 2) + ':' + zeroPadding(seconds, 2) + '</i>');
    $('#timer').show("drop", { direction: "bottom" }, "fast");;
};

function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}

/* ---------------------------------------------------------------------------------------- Miscellaneous ---------------------------------------------------------------------------------------- */

function sweetAlert(type, title, timer, input, confirmButtonText, text) {
    if (timer === undefined)
        timer = null;
    if (input === undefined)
        input = null;
    if (confirmButtonText === undefined)
        confirmButtonText = 'OK';
    swal({
        type: type,
        title: title,
        timer: timer,
        input: input,
        confirmButtonText: confirmButtonText,
        text: text,
    }, function () {
        swal.resetDefaults();
    }).catch(function () {
        swal.noop;
        swal.resetDefaults();
    });
}
function logExecutionTime(startTime, scriptPurpose) {
    var time = performance.now() - startTime;
    var seconds = time / 1000;
    //Round to 3 decimal places.
    seconds = seconds.toFixed(3);

    var result = scriptPurpose + ' took ' + seconds + ' seconds to complete.';
    console.log(result);
}
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
function replaceAmp(str) {
    while (str.includes("&amp;")) {
        str = str.replace("&amp;", "&");
    }
    return str;
}
function passAmpersandInUrl(str) {
    while (str.includes("&")) {
        str = str.replace("&", "%26");
    }
    return str;
}
function addBrIfNull(str) {
    if (str == null || str == undefined || str == "")
        str = '<br>';
    return str;
}
function checkAndResetTable(tableObjectPosition, tableHeadIDName, tableBodyIDName) {
    if (!($(document.getElementById(tableHeadIDName)).is(':empty'))) {
        tableObjects[tableObjectPosition].destroy();
        $(document.getElementById(tableHeadIDName)).empty();
        $(document.getElementById(tableBodyIDName)).empty();
    }
}
function disableUI() {
    if (!uiIsBlocked) {
        $.blockUI({
            message: $('#loading_screen'),
            css: {
                width: '100%',
                top: '0%',
                left: '0%',
                border: 'none',
                padding: '25%',
                backgroundColor: '#666666',
                opacity: .5,
            }
        });
        uiIsBlocked = true;
    }
}
function enableUI() {
    if (uiIsBlocked) {
        $.unblockUI();
        uiIsBlocked = false;
    }
}
function convertToHHMM(info) {
    var hrs, min;
    if (info.indexOf(':') == -1 && $("#time-tracking-card").is(":visible") && info != '') {
        $("#timeTracking_InputDuration").prop('type', 'text');
        hrs = parseInt(Number(info));
        min = Math.round((Number(info) - hrs) * 60);
        if (hrs <= 0 && min <= 0) {
            hrs = "";
            min = "";
            $("#timeTracking_InputDuration").val('');
        }
        else {
            if (min < 10) min = '0' + min;
            $("#timeTracking_InputDuration").val(hrs + ':' + min);
        }
    }
    else if (info != '') {
        hrs = info.split(':')[0];
        min = info.split(':')[1];

        if (min.indexOf('.') != -1) {
            min = Math.round((Number(min)) * 60);
        }
        if (hrs.length < 1 || min.length != 2) {
            alert("Invalid minute value (must be in MM format or in decimals) [e.g. '4.5' or 4:30 or 04:30]");
            $("#timeTracking_InputDuration").val('');
            $("#timeTracking_InputDuration").focus();
        }
    }
}
function HorizontalScrollExists(domElement) {
    return domElement.scrollWidth > domElement.clientWidth;
}

/* ------------------------------------------------------------------------------------------ LISTENERS ------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------- Horizontal Scroll on Project Table ------------------------------------------------------------------------------- */

$('#projectsTable').mousewheel(function (e, delta) {
    if (HorizontalScrollExists(this)) {
        this.scrollLeft -= (delta * 50);
        e.preventDefault();
    }
});

/* ---------------------------------------------------------------------- Change Input Type on Pressing Colon In Duration Field ---------------------------------------------------------------------- */

(function () {
    $('#timeTracking_InputDuration').on('change keypress paste textInput input', function (evt) {
        evt = evt || window.event;
        var charStr = String.fromCharCode(evt.keyCode || evt.which);
        if (charStr == ':') {
            $("#timeTracking_InputDuration").prop('type', 'text');
            var newVal = document.getElementById('timeTracking_InputDuration').value;
            $("#timeTracking_InputDuration").val('');
            $("#timeTracking_InputDuration").val(newVal);
        }
        else {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode != 46 && charCode > 31
                && (charCode < 48 || charCode > 57))
                return false;

            return true;
        }
    });
}());

/* ------------------------------------------------------------------------------- Duration Auto Convert Function ------------------------------------------------------------------------------- */

$("#timeTracking_InputDuration").focusout(function () {
    convertToHHMM($("#timeTracking_InputDuration").val());
});