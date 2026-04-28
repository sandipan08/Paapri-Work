/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00        30 June 2022           Sandipan Sau
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
Script Name:        PCT PMC Get PMC Transaction Record Data
Developer:          Sandipan Sau
Development Head:   Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet will send PMC Transaction Record Data
© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_post                                                           Main Function                                                         Sandipan Sau
getPmcTransactionData                                   Get Data from PMC Transaction Record                                          Sandipan Sau

/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/

define(['N/record'], function (record) {
    function _get(context) {
        context = JSON.parse(context);
        log.debug({
            title: 'PCT-PMC',
            details: `Restlet Data = ${JSON.stringify(context)}`
        })
        let returnObj = getPmcTransactionData(context);
        return returnObj;

    }
    // ------------------- Function to Get Data of PMC Transaction Record ------------------------
    const getPmcTransactionData = (context) => {
        let pmcTransactionRecordObj = {};
        try {
            let pmcTransactionRecordLoad = record.load({
                type: 'customrecord_pct_pmc_tran_k_fab',
                id: context.pmcTransactionId,
                isDynamic: false,
            })
            pmcTransactionRecordObj['name'] = pmcTransactionRecordLoad.getValue({ fieldId: 'name' });
            pmcTransactionRecordObj['recordid'] = pmcTransactionRecordLoad.getValue({ fieldId: 'recordid' });
            pmcTransactionRecordObj['workOrderId'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_wo' });
            pmcTransactionRecordObj['operationSequence'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_p_seq' });
            pmcTransactionRecordObj['operationName'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_op_name' });
            pmcTransactionRecordObj['workCenterId'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_wo_center' });
            pmcTransactionRecordObj['employeeId'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_emp' });
            pmcTransactionRecordObj['operationTaskId'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_op_task_id' });
            pmcTransactionRecordObj['operationStatus'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_op_status' });
            pmcTransactionRecordObj['manufacturingTask'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_man_op_task' });
            pmcTransactionRecordObj['reference'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_ref' });
            pmcTransactionRecordObj['resultStartDateTime'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_res_start_date' });
            pmcTransactionRecordObj['resultEndDateTime'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_res_end_date' });
            pmcTransactionRecordObj['productionQuantity'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_prod_qty' });
            pmcTransactionRecordObj['downTimeCategory'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_downlime_category' });
            pmcTransactionRecordObj['downTimeReason'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_downtime_reason' });
            pmcTransactionRecordObj['downTimeTotalDuration'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_dwn_duration' });
            pmcTransactionRecordObj['downTimeStartDateTime'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_dwn_start_time' });
            pmcTransactionRecordObj['downTimeStartDateTimeSecond'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_dwn_start_time_sec' });
            pmcTransactionRecordObj['setUpStartTimeSecond'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_setup_start_time_sec' });
            pmcTransactionRecordObj['resultStartDateTimeSecond'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_kfab_res_start_date_sec' });
            pmcTransactionRecordObj['completionNumber'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_completion_number' });
            pmcTransactionRecordObj['downTimeEndTime'] = pmcTransactionRecordLoad.getValue({ fieldId: 'custrecord_pct_pmc_dwn_end_time' });

            log.debug({
                title: 'PCT-PMC',
                details: `PMC Transaction Data = ${JSON.stringify(pmcTransactionRecordObj)}`
            })
            return { 'isSuccess': true, 'pmcTransactionRecordObj': pmcTransactionRecordObj };
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    return {
        get: _get,
    }
});