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
            let updatedRecordsArray = [], createdRecordsArray = [];
            responseArray.map((element, index) => {
                log.debug("element", element)
                log.debug("element", index)
                log.debug(`PCT-PMC`, `Operation Start for Record Id : ${element.internalId}`)
                if (element.internalId) {
                    let inspectionRecordLoad = record.load({
                        type: 'customrecord_pct_acme_ins_rec_data',
                        id: element.internalId,
                        isDynamic: true,
                    })
                    let previousTestResult = inspectionRecordLoad.getValue('custrecord_pct_ins_rec_test_res')
                    if(previousTestResult != element.inspectionRecord){
                        let previousLog =  inspectionRecordLoad.getValue('custrecord_pct_qc_change_log')
                        previousLog += '\n'+ element.employeeInternalId + ' - '+ element.inspectionRecord;
                        inspectionRecordLoad.setValue({
                            fieldId: 'custrecord_pct_qc_change_log',
                            value: previousLog,
                            ignoreFieldChange: false
                        })
                    }
                    inspectionRecordLoad.setValue({
                        fieldId: 'custrecord_pct_ins_rec_row',
                        value: index + 1,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_type',
                        value: (element.drawingSpecification).toString().split(";")[0],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_uom',
                        value: (element.drawingSpecification).toString().split(";")[1],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_value',
                        value: (element.drawingSpecification).toString().split(";")[2],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_po_tol',
                        value: (element.drawingSpecification).toString().split(";")[3],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_neg_tol',
                        value: (element.drawingSpecification).toString().split(";")[4],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_test_res',
                        value: element.inspectionRecord,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_lhl_no_of_testing2',
                        value: (element.drawingSpecification).toString().split(";")[5],
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
                  if(element.measurmentResults.high == 'Reject' || element.measurmentResults.low == 'Reject'){
                    inspectionRecordLoad.setValue({
                        fieldId: 'custrecord_pct_ins_rec_quality_status',
                        value: 2,
                        ignoreFieldChange: false
                    });
                  }else{
                   inspectionRecordLoad.setValue({
                        fieldId: 'custrecord_pct_ins_rec_quality_status',
                        value: 1,
                        ignoreFieldChange: false
                    }); 
                  }
                    inspectionRecordId = inspectionRecordLoad.save();
                    log.debug("PCT-PMC", `Edited Inspection Record Id : ${inspectionRecordId}`);
                    updatedRecordsArray.push(inspectionRecordId)
                }
                else {
                    let inspectionRecordLoad = record.create({
                        type: 'customrecord_pct_acme_ins_rec_data',
                        isDynamic: true,
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_row',
                        value: index + 1,
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_type',
                        value: (element.drawingSpecification).toString().split(";")[0],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_uom',
                        value: (element.drawingSpecification).toString().split(";")[1],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_value',
                        value: (element.drawingSpecification).toString().split(";")[2],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_po_tol',
                        value: (element.drawingSpecification).toString().split(";")[3],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_neg_tol',
                        value: (element.drawingSpecification).toString().split(";")[4],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_lhl_no_of_testing2',
                        value: (element.drawingSpecification).toString().split(";")[5],
                        ignoreFieldChange: false
                    }).setValue({
                        fieldId: 'custrecord_pct_ins_rec_value',
                        value: (element.drawingSpecification).toString().split(";")[2],
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
                    if(element.inspectionRecord != ''){
                      var  previousLog =  element.employeeInternalId + ' - '+ element.inspectionRecord;
                        inspectionRecordLoad.setValue({
                            fieldId: 'custrecord_pct_qc_change_log',
                            value: previousLog,
                            ignoreFieldChange: false
                        })
                    }
                  if(element.measurmentResults.high == 'Reject' || element.measurmentResults.low == 'Reject'){
                    inspectionRecordLoad.setValue({
                        fieldId: 'custrecord_pct_ins_rec_quality_status',
                        value: 2,
                        ignoreFieldChange: false
                    });
                  }else{
                   inspectionRecordLoad.setValue({
                        fieldId: 'custrecord_pct_ins_rec_quality_status',
                        value: 1,
                        ignoreFieldChange: false
                    }); 
                  }
                    inspectionRecordId = inspectionRecordLoad.save();
                    log.debug("PCT-PMC", `Created Inspection Record Id : ${inspectionRecordId}`);
                    createdRecordsArray.push(inspectionRecordId)
                }
            })

            let iqcRecordLoad = record.load({
                type: 'customrecord_pct_pmc_iqc_record',
                id: responseArray[0].inspectionRecordId,
                isDynamic: true,
            }).setValue({
                fieldId: 'custrecord_pct_pmc_iqc_submitted',
                value: responseArray[0].toBesaved,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'custrecord_pct_pmc_iqc_op_seq',
                value: responseArray[0].selectedRowOperationSequence,
                ignoreFieldChange: false
            }).save();

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