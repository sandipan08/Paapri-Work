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

define(['N/record', 'N/format', 'N/search'], function (record, format, search) {
    function _post(context) {
        let returnObj;
        log.debug({
            title: 'PCT-PMC',
            details: `Restlet Data = ${JSON.stringify(context)}`
        })
        if (context.pmcTransactionId) {
            returnObj = editPMCTransaction(context);
        }
        else {
            returnObj = createPMCTransaction(context);
        }
        return returnObj;
    }
    // ------------------- Function to Crete PMC Transaction ------------------------
    const createPMCTransaction = (setupDataObj) => {
        try {
            log.debug({
                title: 'Data',
                details: `Data = ${JSON.stringify(setupDataObj)}`
            })
            let pmcTransactionRecordId = record.create({
                type: 'customrecord_pct_pmc_tran_k_fab',
                isDynamic: false
            }).setValue({
                fieldId: 'name',
                value: setupDataObj.recordName,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_wo',
                value: setupDataObj.workOrderId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_p_seq',
                value: setupDataObj.operationSequence,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_op_name',
                value: setupDataObj.operation,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_wo_center',
                value: setupDataObj.workCenterId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_emp',
                value: setupDataObj.employeeId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_op_status',
                value: setupDataObj.operationStatus,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_op_task_id',
                value: setupDataObj.manufacturingOperationTaskId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_man_op_task',
                value: setupDataObj.manufacturingOperationTaskId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_kfab_prod_qty',
                value: 0,
                ignoreFieldChange: false
            }).setText({
                fieldId: 'custrecord_pct_kfab_res_start_date',
                text: dateFormatter(setupDataObj.startDate),
                ignoreFieldChange: false
            }).save();
            log.debug("PCT-PMC", `New Created PMC Transaction : ${pmcTransactionRecordId}`);
            return { 'isSuccess': true, 'pmcTransactionRecordId': pmcTransactionRecordId };
        }
        catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Catch Message = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }
    // ------------------- Function to Edit PMC Transaction ------------------------
    const editPMCTransaction = (setupDataObj) => {
        try {
            let pmcTransactionRecordId;
            let pmcTransactionRecordLoad = record.load({
                type: 'customrecord_pct_pmc_tran_k_fab',
                id: setupDataObj.pmcTransactionId,
                isDynamic: true,
            })
            // ----------------- For End Date Time --------------
            if (setupDataObj.pmcTransactionEndTime) {
                pmcTransactionRecordId = pmcTransactionRecordLoad.setText({
                    fieldId: 'custrecord_pct_kfab_res_end_date',
                    text: dateFormatter(setupDataObj.pmcTransactionEndTime),
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_kfab_prod_qty',
                    value: setupDataObj.productionQty,
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_kfab_op_status',
                    value: setupDataObj.operationStatus,
                    ignoreFieldChange: false
                }).save();
            }
            // ----------------- For Downtime Start --------------
            else if (setupDataObj.pmcTransactionPauseTime) {
                pmcTransactionRecordId = pmcTransactionRecordLoad.setText({
                    fieldId: 'custrecord_pct_pmc_dwn_start_time',
                    text: dateFormatter(setupDataObj.pmcTransactionPauseTime),
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_kfab_op_status',
                    value: setupDataObj.operationStatus,
                    ignoreFieldChange: false
                }).selectNewLine({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                }).setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_cat',
                    value: setupDataObj.modalCategoryType,
                }).setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_reason',
                    value: setupDataObj.modalReasonType,
                }).setCurrentSublistText({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link',
                    fieldId: 'custrecord_pct_pmc_down_start_time',
                    text: dateFormatter(setupDataObj.pmcTransactionPauseTime)
                }).commitLine({
                    sublistId: 'recmachcustrecord_pct_pmc_downtime_link'
                }).save();
            }
            // ----------------- For Downtime End --------------
            else if (setupDataObj.pmcTransactionDownTimeEndTime) {
                let downTimeId = getDowntimeRecordId(setupDataObj).data.internalId;
                let downTimeTotalDuration = pmcTransactionRecordLoad.getValue("custrecord_pct_pmc_dwn_duration");
                let downtimeStartTime = dateFormatter(pmcTransactionRecordLoad.getValue({
                    fieldId: 'custrecord_pct_pmc_dwn_start_time'
                }))
                let downtimeEndTime = dateFormatter(setupDataObj.pmcTransactionDownTimeEndTime)
                record.submitFields({
                    type: 'customrecord_pct_pmc_downtime',
                    id: downTimeId,
                    values: {
                        'custrecord_pct_pmc_down_end_time': dateFormatter(setupDataObj.pmcTransactionDownTimeEndTime),
                        'custrecord_pct_pmc_down_duration': calculateTimeDuration(downtimeStartTime, downtimeEndTime),
                        'custrecord_pct_pmc_down_cat': setupDataObj.modalCategoryType,
                        'custrecord_pct_pmc_down_reason': setupDataObj.modalReasonType,
                        'custrecord_pct_pmc_down_notes': setupDataObj.modalNotes,
                    }
                });
                pmcTransactionRecordId = pmcTransactionRecordLoad.setText({
                    fieldId: 'custrecord_pct_pmc_dwn_end_time',
                    text: dateFormatter(setupDataObj.pmcTransactionDownTimeEndTime),
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_kfab_op_status',
                    value: setupDataObj.operationStatus,
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_dwn_duration',
                    value: downTimeTotalDuration ? downTimeTotalDuration + calculateTimeDuration(downtimeStartTime, downtimeEndTime) : calculateTimeDuration(downtimeStartTime, downtimeEndTime),
                    ignoreFieldChange: false
                }).save();
            }
            log.debug("PCT-PMC", `Edited PMC Transaction : ${pmcTransactionRecordId}`);
            return { 'isSuccess': true, 'pmcTransactionRecordId': pmcTransactionRecordId };
        }
        catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Catch Message = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    // -------------------- Function for Get Downtime Id -------------------
    const getDowntimeRecordId = (setupDataObj) => {
        var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
            type: "customrecord_pct_pmc_tran_k_fab",
            filters:
                [
                    ["internalid", "anyof", setupDataObj.pmcTransactionId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                        summary: "MAX",
                        sort: search.Sort.ASC,
                        label: "Internal ID"
                    })
                ]
        });
        var downTimeIdCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
        log.debug("PCT-PMC", "DownTime Id Result Count : " + downTimeIdCount);
        if (downTimeIdCount > 0) {
            let downTimeRecordObj = {};
            customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
                downTimeRecordObj["internalId"] = result.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                    summary: "MAX",
                    sort: search.Sort.ASC,
                    label: "Internal ID"
                })
                return true;
            });
            return { 'isSuccess': true, 'data': downTimeRecordObj }
        }
        return { 'isSuccess': false, 'errorMessage': 'DownTime Not Found' }
    }
    // -------------------- Function for Get Downtime Id -------------------
    const calculateTimeDuration = (startTime, endTime) => {
        log.debug(`downTimeEndTime : ${endTime}`)
        log.debug(`downtimeStartTime : ${startTime}`)
        let timeDuration = new Date(endTime) - new Date(startTime);
        log.debug("PCT-PMC", "Time Duration : " + timeDuration);
        return (timeDuration / 1000) / 60;
    }
    // -------------------- Function for Date Formatter -------------------
    const dateFormatter = (date) => {
        log.debug(`PCT-PMC`, `Date Formatter Date ${date}`)
        return date ? format.format({
            value: new Date(date),
            type: format.Type.DATETIME
        }) : format.format({
            value: new Date(),
            type: format.Type.DATETIME
        });
    }
    return {
        post: _post
    }
});