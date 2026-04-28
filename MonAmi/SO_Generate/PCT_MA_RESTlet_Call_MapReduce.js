/**
 *              //////////     Mon Ami Restlet to Call MapReduce Script for Sales Order Generate      //////////
 *
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Restlet
 *@NModuleScope SameAccount
 *@since        2021-08-12 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for Mon Ami Restlet to Call MapReduce Script for Sales Order Generate, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This MapReduceScript is used to call the Workflow Action Script.
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
                    scriptId: 'customscript_pct_ma_so_call_generate',
                    deploymentId: 'customdeploy_pct_ma_so_call_generate'
                });
                job.submit();
                log.debug({
                    title: 'PCT-MonAmi',
                    details: 'Call Success'
                });
                return { status: 200, message: "Call Success" };
            }
            catch (err)
            {
                return { status: 500, message: err.message };
            }

        }
        return {
            get: _get,
        }
    });
