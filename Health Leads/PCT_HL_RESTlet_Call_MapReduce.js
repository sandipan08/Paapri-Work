/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.00          09 April 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

Script Name:        PCT_RESTlet_Call_MapReduce
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will call map reduce script of sales order generate

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


define(['N/task', 'N/record', 'N/error', 'N/log', 'N/format', 'N/search'],
    function (task, record, error, log, format, search)
    {

        function _get(context)
        {
            try
            {
                var job = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_pct_hl_hl_wo_so_generate_mr',
                    deploymentId: 'customdeploy_pct_hl_hl_wo_so_generate_mr'
                });
                job.submit();
                log.debug({
                    title: 'Team Innovation',
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
