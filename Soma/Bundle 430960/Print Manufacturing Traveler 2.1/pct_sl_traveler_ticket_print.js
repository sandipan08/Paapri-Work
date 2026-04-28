/**
*@NApiVersion  2.1
*@NScriptType  Suitelet 
*@author       Rajesh Nandi
*@since        2022-03-31 yyyy-MM-dd
*@copyright    Paapri Cloud Technology
*@license      This UE sript will give a button "Print Manufacturing Traveler" on the Item Work Order form. To print Traveler Ticket.

*@description  This script will give a button on the item Work Order form.

*/
define(['N/record','N/search','N/task','N/file','N/redirect'], function(record,search,task,file,redirect) {

   
    var _response;
    var _request;
    function onRequest(context) {
        // Pre data source
        // NoteL All global variables are start with '_' sign
        _request = context.request;
        _response = context.response;

        if (_request.method == 'GET') {
            // Getting Params [GET REQUEST]
            var woId = _request.parameters.woId;

            log.debug({
                title: 'woId',
                details: woId
            })
            callSchedule(woId)

            redirect.toRecord({
                type : 'workorder',
                id : woId
               });
               
        }
    }

    function callSchedule(woId)
    {
        try {

            var mapReduceTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                deploymentId: 'customdeploy_pct_sch_traveler_ticket',
                scriptId: 'customscript_pct_sch_traveler_ticket',
                params: {
                    custscript_pct_traveler_ticket_wo_id: woId
                }
            });

            var taskId = mapReduceTask.submit();
            var taskStatus = task.checkStatus(taskId);
            log.debug({
                title: "Scheduled Script Call Status ",
                details: taskStatus.status
            });
            return JSON.stringify({ status: 200, message: taskStatus.status.toString() });
        }
        catch (err) {
            return JSON.stringify({ status: 500, message: err.message });
        }
    }

    return {
        onRequest: onRequest
    }
});
