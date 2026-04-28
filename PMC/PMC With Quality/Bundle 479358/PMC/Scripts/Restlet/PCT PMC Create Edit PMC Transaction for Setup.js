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

define(['N/record', 'N/format', 'N/search', 'N/runtime'], function (record, format, search, runtime) {
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
                type: 'customrecord_pct_pmc_transaction',
                isDynamic: false
            }).setValue({
                fieldId: 'name',
                value: setupDataObj.recordName,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_work_order',
                value: setupDataObj.workOrderId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_operation_sequence',
                value: setupDataObj.operationSequence,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_operation_name',
                value: setupDataObj.operationName,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_work_center',
                value: setupDataObj.workCenterId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_employee',
                value: setupDataObj.employeeId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_operation_status',
                value: setupDataObj.operationStatus,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_operation_task_id',
                value: setupDataObj.manufacturingOperationTaskId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_manufacturing_task_id',
                value: setupDataObj.manufacturingOperationTaskId,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_production_quantity',
                value: 0,
                ignoreFieldChange: false
            }).setText({
                fieldId: 'custrecord_pct_pmc_res_start_date_time',
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
                type: 'customrecord_pct_pmc_transaction',
                id: setupDataObj.pmcTransactionId,
                isDynamic: true,
            })
            // ----------------- For End Date Time --------------
            if (setupDataObj.pmcTransactionEndTime) {
                pmcTransactionRecordLoad.setText({
                    fieldId: 'custrecord_pct_pmc_res_end_date_time',
                    text: dateFormatter(setupDataObj.pmcTransactionEndTime),
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_operation_status',
                    value: setupDataObj.operationStatus,
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_production_quantity',
                    value: setupDataObj.productionQuantity,
                    ignoreFieldChange: false
                }).save();
            }
            // ----------------- For Downtime Start --------------
            else if (setupDataObj.pmcTransactionPauseTime) {
                log.debug({
                    title: 'Downtime Creation',
                    details: 'Downtime Creation'
                })
                pmcTransactionRecordLoad.setText({
                    fieldId: 'custrecord_pct_pmc_dwn_start_time',
                    text: dateFormatter(setupDataObj.pmcTransactionPauseTime),
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_operation_status',
                    value: setupDataObj.operationStatus,
                    ignoreFieldChange: false
                }).save();

                let pctPmcDowntimRecord = record.create({
                    type: 'customrecord_pct_pmc_downtime',
                    isDynamic: true
                })
                pctPmcDowntimRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_down_start_time',
                    value: dateFormatter(setupDataObj.pmcTransactionPauseTime),
                    ignoreFieldChange: true
                })
                pctPmcDowntimRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_down_cat',
                    value: setupDataObj.modalCategoryType,
                    ignoreFieldChange: true
                })
                pctPmcDowntimRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_down_reason',
                    value: setupDataObj.modalReasonType,
                    ignoreFieldChange: true
                })
                pctPmcDowntimRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_down_notes',
                    value: setupDataObj.modalNotes,
                    ignoreFieldChange: true
                })
                pctPmcDowntimRecord.setValue({
                    fieldId: 'custrecord_pct_pmc_downtime_link',
                    value: setupDataObj.pmcTransactionId,
                    ignoreFieldChange: true
                })
                pctPmcDowntimRecord.save()
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
                        // 'custrecord_pct_pmc_down_cat': setupDataObj.modalCategoryType,
                        // 'custrecord_pct_pmc_down_reason': setupDataObj.modalReasonType,
                        // 'custrecord_pct_pmc_down_notes': setupDataObj.modalNotes,
                    }
                });
                pmcTransactionRecordLoad.setText({
                    fieldId: 'custrecord_pct_pmc_dwn_end_time',
                    text: dateFormatter(setupDataObj.pmcTransactionDownTimeEndTime),
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_operation_status',
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
        var customrecord_pct_pmc_transactionSearchObj = search.create({
            type: "customrecord_pct_pmc_transaction",
            filters:
                [
                    ["internalid", "anyof", setupDataObj.pmcTransactionId],
                    "AND",
                    ["custrecord_pct_pmc_downtime_link.custrecord_pct_pmc_down_start_time", "isnotempty", ""],
                    "AND",
                    ["custrecord_pct_pmc_downtime_link.custrecord_pct_pmc_down_end_time", "isempty", ""],
                    "AND",
                    ["custrecord_pct_pmc_downtime_link.internalid", "noneof", "@NONE@"]
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
        var downTimeIdCount = customrecord_pct_pmc_transactionSearchObj.runPaged().count;
        log.debug("PCT-PMC", "DownTime Id Result Count : " + downTimeIdCount);
        if (downTimeIdCount > 0) {
            let downTimeRecordObj = {};
            customrecord_pct_pmc_transactionSearchObj.run().each(function (result) {
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
            type: format.Type.DATETIME,
            timezone: runtime.getCurrentUser().getPreference({
                name: 'timezone'
            })
        }) : format.format({
            value: new Date(),
            type: format.Type.DATETIME,
            timezone: runtime.getCurrentUser().getPreference({
                name: 'timezone'
            })
        });
    }
    return {
        post: _post
    }
});