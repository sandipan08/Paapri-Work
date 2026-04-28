/**
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/record'], function (record) {

    function _post(context) {
        let responseArray = context
        log.debug({
            title: 'PCT-PMC',
            details: `Context = ${JSON.stringify(context)}`
        })
        return updateInspectionRecord(responseArray);

    }
    const updateInspectionRecord = (responseArray) => {
        try {
            let inspectionRecordId;
            let updatedRecordsArray = createdRecordsArray = [];
            responseArray.map((element) => {
                log.debug(`PCT-PMC`, `Operation Start for Record Id : ${element.internalId}`)
                if (element.internalId) {
                    let inspectionRecordLoad = record.load({
                        type: 'customrecord_pct_acme_ins_rec_data',
                        id: element.internalId,
                        isDynamic: true,
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_ver',
                        value: element.drawingSpecification,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_test_res',
                        value: element.inspectionRecord,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_high',
                        value: element.measurmentResults.high,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_low',
                        value: element.measurmentResults.low,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_upper',
                        value: element.measurmentResults.upper,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_lower',
                        value: element.measurmentResults.lower,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_mean',
                        value: element.measurmentResults.mean,
                        ignoreFieldChange: false
                    });
                    inspectionRecordId = inspectionRecordLoad.save();
                    log.debug("PCT-PMC", `Edited Inspection Record Id : ${inspectionRecordId}`);
                    updatedRecordsArray.push(inspectionRecordId)
                }
                else {
                    let inspectionRecordLoad = record.create({
                        type: 'customrecord_pct_acme_ins_rec_data',
                        isDynamic: true,
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_ver',
                        value: element.drawingSpecification,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_test_res',
                        value: element.inspectionRecord,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_high',
                        value: element.measurmentResults.high,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_low',
                        value: element.measurmentResults.low,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_upper',
                        value: element.measurmentResults.upper,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_lower',
                        value: element.measurmentResults.lower,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_mean',
                        value: element.measurmentResults.mean,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_record_link',
                        value: element.inspectionRecordId,
                        ignoreFieldChange: false
                    });
                    inspectionRecordId = inspectionRecordLoad.save();
                    log.debug("PCT-PMC", `Created Inspection Record Id : ${inspectionRecordId}`);
                    createdRecordsArray.push(inspectionRecordId)
                }
                let iqcRecordLoad = record.load({
                    type: 'customrecord_pct_pmc_iqc_record',
                    id: element.inspectionRecordId,
                    isDynamic: true,
                }).setValue({
                    fieldId: 'custrecord_pct_pmc_iqc_submitted',
                    value: true,
                    ignoreFieldChange: false
                }).save();
            })

            return { 'isSuccess': true, 'updatedRecordsId': updatedRecordsArray, 'createdRecordsId': createdRecordsArray };
        }
        catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Catch Message = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }


    }
    return {
        post: _post
    }
});
