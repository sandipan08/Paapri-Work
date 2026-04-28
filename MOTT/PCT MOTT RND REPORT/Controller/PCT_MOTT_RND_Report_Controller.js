/***********************************************************************************************************************************************

Script Name:        PCT_MOTT_RND_Report_Controller
Developer:          Sandipan Sau
Development Head:   Mr.Atul Kesari
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Main Controller for MOTT RND Project Report.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************* Included Functions & Updates **********************************************************
/***********************************************************************************************************************************************

Function Name:              Purpose:                                                                                Developer:

createTable()               To Populate the DataTable                                                               Sandipan Sau
errorLogging()              If Controller Faced any Error it will log that error                                    Sandipan Sau

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

************************************************************************************************************************************************/


/* ------------------------------------------------------------------------------- DECLARING GLOBAL VARIABLES ------------------------------------------------------------------------------- */

var projectName = "allProjectName";
var projectManager = "allProjectManager";
var employeeGroup = "allEmployeeGroup";
var projectStatus = "allStatus";
var userName = "";
var userId = 0;
var pmName = "";



$(document).ready(function ()
{
    console.log("In Controller");
    // ----------------------------------------------- Populate Project Name Dropdown List ------------------------------------
    $.ajax({
        url: "/app/site/hosting/restlet.nl?script=2325&deploy=1",
        method: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        success: function (data)
        {
            var projectNameDropdown = '';
            if (data.length > 0)
            {
                console.log("data Length " + data.length)
                projectNameDropdown +=
                    '<option value="allProjectName">-All-</option>'
                data.map((element) =>
                {
                    console.log("Project Name Map Element : " + JSON.stringify(element));
                    projectNameDropdown +=
                        '<option value="' + element.projectId + '">' + element.projectName + '</option > ';

                })
                $("#projectName").html(projectNameDropdown);
            }
        },
        error: function (jqXHR, exception)
        {
            errorLogging(jqXHR, exception, "Login Restlet Call");
        },
    });
    // ----------------------------------------------- Populate Project Manager Name Dropdown List ------------------------------------
    $.ajax({
        url: "/app/site/hosting/restlet.nl?script=2327&deploy=1",
        method: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        success: function (data)
        {
            var projectManagerDropdown = '';
            if (data[0].length > 0)
            {
                console.log("data Length " + data[0].length)
                projectManagerDropdown +=
                    '<option value="allProjectManager">-All-</option>';
                projectManagerDropdown +=
                    '<option value="' + data[1] + '">-Mine-</option>';
                userId = data[1];
                userName = data[3];

                data[0].map((element) =>
                {
                    console.log("Project Manager Map Element : " + JSON.stringify(element));
                    projectManagerDropdown +=
                        '<option value="' + element.projectManagerID + '">' + element.projectManagerName + '</option > ';



                })
                $("#projectManager").html(projectManagerDropdown);
            }
        },
        error: function (jqXHR, exception)
        {
            errorLogging(jqXHR, exception, "Login Restlet Call");
        },
    });
    // ----------------------------------------------- Populate Employee Group Dropdown List ------------------------------------
    $.ajax({
        url: "/app/site/hosting/restlet.nl?script=2326&deploy=1",
        method: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        success: function (data)
        {
            var employeeGroupDropdown = '';
            if (data.length > 0)
            {
                console.log("data Length " + data.length)
                employeeGroupDropdown +=
                    '<option value="allEmployeeGroup">-All-</option>'
                data.map((element) =>
                {
                    console.log("Employee Group Map Element : " + JSON.stringify(element));
                    employeeGroupDropdown +=
                        '<option value="' + element.empGroupId + '">' + element.employeeGroup + '</option > ';

                })
                $("#employeeGroup").html(employeeGroupDropdown);
            }
        },
        error: function (jqXHR, exception)
        {
            errorLogging(jqXHR, exception, "Login Restlet Call");
        },
    });

    // ---------------------------------------------------- Populate the Data Table ------------------------------------

    createTable(projectName, projectManager, employeeGroup, projectStatus, userName, pmName);

});

// // ----------------- Submit Button Click Event ----------------

// $(document).on("click", "#btnSubmit", function ()
// {
//     projectName = $('#projectName').val();
//     projectManager = $('#projectManager').val();
//     employeeGroup = $('#employeeGroup').val();
//     projectStatus = $('#projectStatus').val();


//     console.log("Button Click Data : [ Project Name : " + projectName + ", Project Manager : " + projectManager + ", Employee Group : " + employeeGroup + ", Project Status : " + projectStatus + " ]")
//     createTable(projectName, projectManager, employeeGroup, projectStatus)
// });

// ----------------- Drop Down Field Event ----------------
$('#projectName, #projectManager,#employeeGroup, #projectStatus ').change(function ()
{
    projectName = $('#projectName').val();
    projectManager = $('#projectManager').val();
    pmName = $('#projectManager').html();
    employeeGroup = $('#employeeGroup').val();
    projectStatus = $('#projectStatus').val();



    console.log("Button Click Data : [ Project Name : " + projectName + ", Project Manager Id : " + projectManager + ", Project Manager Name : " + pmName + ", Employee Group : " + employeeGroup + ", Project Status : " + projectStatus + " ]")
    $('#rndReport').DataTable().destroy();
    createTable(projectName, projectManager, employeeGroup, projectStatus, userName, pmName)
});


/* ------------------------------------------------------------------------------- ALL CUSTOM FUNCTIONS ------------------------------------------------------------------------------- */


// ------------------------------------------------------------------------------ Function for Populate the Table -----------------------------------------------------------------------

function createTable(projectName, projectManager, employeeGroup, projectStatus, userName, pmName)
{
    console.log("In Create Table Function");

    $.ajax({
        url: "/app/site/hosting/restlet.nl?script=2323&deploy=1&projectName=" + projectName + "&projectManager=" + projectManager + "&employeeGroup=" + employeeGroup + "&projectStatus=" + projectStatus,
        method: "GET",
        dataType: "json",
        contentType: "application/json",
        async: true,
        crossDomain: false,
        success: function (data)
        {
            var tbody = '';
            var thead = '';
            if (data.length > 0)
            {
                console.log("data Length " + data.length)
                // ---------------- Populate the THead in the table --------------------
                thead += '<tr>' +
                    '                    <th>Project Name</th>' +
                    '                    <th>Status</th>' +
                    '                    <th>Project Revenue</th>' +
                    '                    <th>Project Current Cost</th>' +
                    '                    <th>Current Margin</th>' +
                    '                    <th>Estimated Cost</th>' +
                    '                    <th>As Sold Cost</th>';
                thead += `</tr>`;

                data.map((element) =>
                {
                    // console.log("Map Element : " + JSON.stringify(element));
                    //  console.log("Data : [ Project Name : " + element.mottProject + ", Status : " + element.status + ", Sum Of Project Revenue : " + element.formulaCurrency + ", Maximum Of Project Current Cost : " + element.projectCurrentCost + ", Sum Of Current Margin : " + element.formulaPercent + ", Estimated Cost : " + element.estimatedCost + ", As Sold Cost : " + element.asSoldCost + "]")

                    // ---------------- Populate the TBody in the table --------------------
                    tbody += '<tr><td>' + element.mottProject + '</td>' +
                        '<td>' + element.status + '</td>' +
                        '<td>' + element.formulaCurrency + '</td>' +
                        '<td>' + element.projectCurrentCost + '</td>' +
                        '<td>' + element.formulaPercent + '</td>' +
                        '<td>' + element.estimatedCost + '</td>' +
                        '<td>' + element.asSoldCost + '</td>';;
                    tbody += `</tr>`;

                })
                $("#rndReportThead").html(thead);
                $("#rndReportTbody").html(tbody);
                $('#rndReport').DataTable({
                    "pageLength": 50,
                    "retrieve": true,
                });

            }
            else
            {
                if (projectManager == userId)
                {
                    alert(userName + " You are not assigned as Project Manager");
                }

                else
                {
                    // alert(projectManagerName+" has not been assign for any projects");
                    alert(pmName + " No Data Found");
                }

                location.reload();
            }

        },
        complete: function ()
        {
            $.unblockUI();
        },
        error: function (jqXHR, exception)
        {
            errorLogging(jqXHR, exception, "Login Restlet Call");
        },
    });
}

// ----------------------------------------------------------------------------------------- Error Function -------------------------------------------------------------------------------

function errorLogging(jqXHR, exception, scriptPurpose)
{
    var error_msg = '[AJAX] ' + scriptPurpose + ' : ';
    if (jqXHR.status === 0)
    {
        error_msg += 'Not connected.\n Verify Network.';
    } else if (jqXHR.status == 404)
    {
        error_msg += 'Requested page not found. [404]';
    } else if (jqXHR.status == 500)
    {
        error_msg += 'Internal Server Error [500].';
    }
    else if (jqXHR.status == 401)
    {
        error_msg += 'SESSION_TIMED_OUT';
        $('#lost_connection_notification_maindiv').css("z-index", "3");
        $('#lost_connection_notification').toast('show');

    } else if (exception === 'parsererror')
    {
        error_msg += 'Requested JSON parse failed.';
    } else if (exception === 'timeout')
    {
        error_msg += 'Time out error.';
    } else if (exception === 'abort')
    {
        error_msg += 'Ajax request aborted.';
    } else
    {
        error_msg += 'Uncaught Error.\n' + jqXHR.responseText;
    }
    console.log(error_msg);
}

