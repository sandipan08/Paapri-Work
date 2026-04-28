
/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          31 July 2023           	Sandipan Sau
*
*
* @NApiVersion 2.1
* @NModuleScope Public
* @NScriptType Restlet
/**********************************************************************************************************************************************

Script Name:        PCT WorkOrder Variance Restlet for get Work Order from Item
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet is used to get  Work Order from Item

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary



***********************************************************************************************************************************************/
define(['N/log', 'N/search', 'N/task'], function (log, search, task) {

    function _get(context) {

        log.debug("PCT", "In Work Order Variance Restlet");
        let workOrders = 0;
        let selectItem = 0;
        workOrders = parseInt(context.selectWorkOrder);
        selectItem = parseInt(context.selectItem);

        if (selectItem) {
            workOrders = getWorkOrderFromItem(selectItem);
            callSchedule(workOrders);
        }
        else {
            callSchedule(workOrders);
        }
        // return { 'isSuccess': true, 'data': getWorkOrderFromItem(parseInt(context.selectItem)) }
        return true;

    }
    // --------------------- Function for get work Order from Item Start  ------------------------
    const getWorkOrderFromItem = (item) => {
        let workOrderArray = [];
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["item", "anyof", item],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            workOrderArray.push(result.getValue({ name: "internalid", label: "Internal ID" }))
            return true;
        });
        log.debug("PCT", "Work Order Array  : " + workOrderArray);
        return workOrderArray;
    }

    // --------------------- Function for get work Order from Item End ------------------------

    // --------------------- Call Schedule to get Table Data Start ------------------------
    const callSchedule = (workOrders) => {
        log.debug("PCT", "In Schedule Call Function : " + workOrders)
        let scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
        scriptTask.scriptId = 'customscript_pct_wov_get_table_data';
        scriptTask.deploymentId = 'customdeploy_pct_wov_get_table_data';
        scriptTask.params = {
            custscript_pct_wov_work_order_id: workOrders
        };
        var myTaskId = scriptTask.submit();
    }
    // --------------------- Call Schedule to get Table Data End ------------------------

    return {
        get: _get,
    }
});
