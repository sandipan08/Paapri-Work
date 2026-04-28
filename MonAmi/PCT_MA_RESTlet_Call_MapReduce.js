/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.01          28 October 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

define(['N/task', 'N/record', 'N/error', 'N/log', 'N/format', 'N/search'],
    function (task, record, error, log, format, search)
    {

        function _get(context)
        {
            try
            {
                var job = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_pct_ma_onhandqty_update',
                    deploymentId: 'customdeploy_pct_ma_onhandqty_update'
                });
                var myTaskId = job.submit();
                var taskStatus = task.checkStatus({
                    taskId: myTaskId
                });
                log.debug({
                    title: 'PCT-MonAmi',
                    details: 'Call Success'
                });
                return JSON.stringify({ status: 200, message: taskStatus.status.toString() });
            }
            catch (err)
            {
                return JSON.stringify({ status: 500, message: err.message });
            }

        }
        return {
            get: _get
        }
    });
