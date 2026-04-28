/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search', 'N/task', 'N/runtime'], function (record, search, task, runtime) {

    function onAction(context) {
        var type = context.newRecord.type;
        var rec_id = context.newRecord.id;

        log.debug({
            title: 'type =' + type,
            details: 'rec_id =' + rec_id
        })


       
        try {

            var mapReduceTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                //deploymentId: 'customdeploy_pct_pp_sch_tran_discount_cl',
                scriptId: 'customscript_pct_pp_sch_tran_discount_cl',
                params: {
                    custscript_pct_pp_type: type,
                    custscript_pct_pp_id: rec_id
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
        onAction: onAction
    }
});
