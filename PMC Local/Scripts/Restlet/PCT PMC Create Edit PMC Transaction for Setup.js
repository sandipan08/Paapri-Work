/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00        29 June 2022           Sandipan Sau
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
Script Name:        PCT PMC Create Edit PMC Transaction for Setup 
Developer:          Sandipan Sau
Development Head:   Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet will create and edit PMC Transaction Record for Setup
© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_post                                                           Main Function                                                         Sandipan Sau
createPMCTransaction                                   Create PMC Transaction Record                                                  Sandipan Sau
editPMCTransaction                                     Edit PMC Transaction Record                                                    Sandipan Sau
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/

define([], function () {
    let dataObj = {};
    function _post(context) {
        log.debug({
            title: 'PCT-PMC',
            details: `Restlet Data = ${JSON.stringify(context)}`
        })
        var recordName = "Setup";
        var recordId = 1;
        var woId = 13804;
        var woOpeSeq = 10;
        var woCenter = 2574;
        var employeeName = 2590;
        var operationStatus = 1;
        var operationId = 94;
        var startDateTime = "6/29/2022 4:07:29 am";
        var endDateTime = "6/29/2022 4:07:29 am";

        dataObj['recordName'] = recordName;
        dataObj['recordId'] = recordId;
        dataObj['woId'] = woId;
        dataObj['woOpeSeq'] = woOpeSeq;
        dataObj['woCenter'] = woCenter;
        dataObj['employeeName'] = employeeName;
        dataObj['operationStatus'] = operationStatus;
        dataObj['operationId'] = operationId;
        dataObj['startDateTime'] = startDateTime;

        log.debug({
            title: 'PCT-PMC',
            details: `Record Name : ${recordName}, Record Id : ${recordId}, Work Order Id : ${woId}, Work Order Sequence : ${woOpeSeq}, Work Order Center : ${woCenter}, Employee Name : ${employeeName},
             Operation Status : ${operationStatus}, Operation Id ${operationId}, Start Date Time : ${startDateTime}, End Date Time : ${endDateTime}`
        })
        if (recordId) {
            createPMCTransaction(dataObj);
        }
        else {
            editPMCTransaction(recordId, endDateTime)
        }
    }
    // ------------------- Function to Crete PMC Transaction ------------------------
    const createPMCTransaction = (dataObj) => {
        let pmcTransactionRecordId = record.create({
            type: 'customrecord_pct_pmc_tran_k_fab',
            isDynamic: false
        }).setValue({
            fieldId: 'name',
            value: dataObj.recordName,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_wo',
            value: dataObj.woId,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_p_seq',
            value: dataObj.woOpeSeq,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_wo_center',
            value: dataObj.woCenter,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_emp',
            value: dataObj.employeeName,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_op_status',
            value: dataObj.operationStatus,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_op_task_id',
            value: dataObj.operationId,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_prod_qty',
            value: 0,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_res_start_date',
            value: dataObj.startDateTime,
            ignoreFieldChange: false
        }).save();
        log.debug("PCT-PMC", `New Created PMC Transaction : ${pmcTransactionRecordId}`);
        return pmcTransactionRecordId;
    }
    // ------------------- Function to Edit PMC Transaction ------------------------
    const editPMCTransaction = (recordId, endDateTime) => {
        var pmcTransactionRecordId = record.load({
            type: 'customrecord_pct_pmc_tran_k_fab',
            id: recordId,
            isDynamic: false,
        }).setValue({
            fieldId: 'custrecord_pct_kfab_res_end_date',
            value: endDateTime,
            ignoreFieldChange: false
        }).save();
        log.debug("PCT-PMC", `Edited PMC Transaction : ${pmcTransactionRecordId}`);
        return pmcTransactionRecordId;
    }

    return {
        post: _post
    }
});