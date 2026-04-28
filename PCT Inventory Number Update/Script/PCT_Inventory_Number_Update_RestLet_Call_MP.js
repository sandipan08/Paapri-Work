/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.01         17 March 2023    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

Script Name:        PCT_Inventory_Number_Update_RestLet_Call_MP
Developer:          Sandipan Sau
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will call map reduce script for update the Inventory Number Record

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:
_get()							                                Call Map Reduce Script                  		   		                        Sandipan Sau


/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/task', 'N/log'],
    function (task, log) {

        function _post(context) {


            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${JSON.stringify(context)}`
            })
            return callMapReduce(context);
        }

        const callMapReduce = (context) => {
            log.debug("PCT", context)
            try {
                var job = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_pct_inv_no_update_mr',
                    deploymentId: 'customdeploy_pct_inv_no_update_mr',
                    params: { "custscript_pct_inv_update_dataobj": context }

                });
                var myTaskId = job.submit();
                var taskStatus = task.checkStatus({
                    taskId: myTaskId
                });
                log.debug({
                    title: 'PCT',
                    details: 'Call Success'
                });
                log.debug("PCT", "")
                return { 'isSuccess': true, 'message': taskStatus.status.toString() };
            }
            catch (error) {
                log.debug({
                    title: 'PCT-PMC',
                    details: `Catch Message = ${error.message}`
                })
                return { 'isSuccess': false, 'message': error.message }
            }


        }

        const _getCurrentTaskId = () => {
            // let scriptObj = runtime.getCurrentScript();
            // let scriptId = scriptObj.id;
            // let scriptDeploymentId = scriptObj.deploymentId;

            let mapReduceTaskSearch = search.create({
                type: search.Type.SCHEDULED_SCRIPT_INSTANCE,
                filters: [
                    ['status', 'anyof', 'PROCESSING'],
                    'AND',
                    ['script.scriptid', 'is', 1787],
                    'AND',
                    ['scriptdeployment.scriptid', 'is', 4672]
                ],
                columns: [
                    'taskid'
                ]
            });

            let taskId;

            mapReduceTaskSearch.run().each(function (result) {
                taskId = result.getValue('taskid');
            });

            return taskId;
        }

        return {
            post: _post
        }
    });
