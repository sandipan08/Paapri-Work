/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function beforeLoad(context) {

    }

    function beforeSubmit(context) {

    }

    function afterSubmit(context) {
        try {
            let id = context.newRecord.id
            let type = context.newRecord.type
            let recordObj = record.load({
                type: type,
                id: id,
                isDynamic: true
            })
            let totalLotSize = recordObj.getValue({
                fieldId: 'custrecord_pct_pmc_iqc_lot_size'
            })
             passFailStatusSet(recordObj)
            if (parseInt(totalLotSize) > 0) {
                let sampleSize = getSampleSize(totalLotSize)
                if (sampleSize > 0) {
                    recordObj.setValue({
                        fieldId: 'custrecord_pct_pmc_iqc_sample_size',
                        value: sampleSize
                    }).save()
                }
               
            }
        } catch (error) {
            log.error({
                title: 'error',
                details: error
            })
        }
    }
    const passFailStatusSet = (recordObj) => {
        let lineCount = recordObj.getLineCount({
            sublistId: 'recmachcustrecord_pct_ins_record_link'
        })
        for (let index = 0; index < lineCount; index++) {
            let value = safeNumber(recordObj.getSublistValue({
                sublistId: 'recmachcustrecord_pct_ins_record_link',
                fieldId: 'custrecord_pct_ins_rec_value',
                line: index
            }));

            let posTol = safeNumber(recordObj.getSublistValue({
                sublistId: 'recmachcustrecord_pct_ins_record_link',
                fieldId: 'custrecord_pct_ins_rec_po_tol',
                line: index
            }));

            let negTol = safeNumber(recordObj.getSublistValue({
                sublistId: 'recmachcustrecord_pct_ins_record_link',
                fieldId: 'custrecord_pct_ins_rec_neg_tol',
                line: index
            }));

            let testResult = recordObj.getSublistValue({
                sublistId: 'recmachcustrecord_pct_ins_record_link',
                fieldId: 'custrecord_pct_ins_rec_test_res',
                line: index
            });

            // Tolerance check logic
            let isAccepted = (testResult >= (value - negTol)) && (testResult <= (value + posTol));
            log.debug({
                title: 'isAccepted',
                details: isAccepted
            })
            if ((testResult != '' && testResult != undefined)) {
                recordObj.selectLine({
                    sublistId: 'recmachcustrecord_pct_ins_record_link',
                    line: index
                })
                if (isAccepted) {
                    recordObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_ins_record_link',
                        fieldId: 'custrecord_pct_ins_rec_quality_status',
                        line: index,
                        value: 1
                    })
                } else {
                    recordObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_ins_record_link',
                        fieldId: 'custrecord_pct_ins_rec_quality_status',
                        line: index,
                        value: 2
                    })
                }
                recordObj.commitLine({
                    sublistId: 'recmachcustrecord_pct_ins_record_link'
                })
            }
        }
    }
    function safeNumber(val) {
        val = Number(val);
        return isNaN(val) ? 0 : val;
    }
    const getSampleSize = (totalLotSize) => {
        log.debug({
            title: 'totalLotSize',
            details: totalLotSize
        })
        let sampleSize = 0;
        var customrecord_pct_cbd_iqc_sample_planSearchObj = search.create({
            type: "customrecord_epc_aql_sampling",
            filters:
                [
                    ["custrecord_epc_aql_sample_size_from", "lessthanorequalto", totalLotSize],
                    "AND",
                    ["custrecord_epc_aql_sample_size_to", "greaterthanorequalto", totalLotSize],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "custrecord_epc_aql_sample_size_from", label: "From" }),
                    search.createColumn({ name: "custrecord_epc_aql_sample_size_to", label: "To" }),
                    // search.createColumn({ name: "custrecord_pct_epc_size_iqc_plan", label: "	Sample Size" })
                ]
        });
        let sampleLotSize = 0
        //  var searchResultCount = customrecord_pct_cbd_iqc_sample_planSearchObj.runPaged().count;
        //  log.debug("customrecord_pct_cbd_iqc_sample_planSearchObj result count", searchResultCount);
        customrecord_pct_cbd_iqc_sample_planSearchObj.run().each(function (result) {
            let id = result.id
            let obj = record.load({
                type: 'customrecord_epc_aql_sampling',
                id: id,
                isDynamic: true
            })
            sampleLotSize = obj.getValue('custrecord_pct_epc_size_iqc_plan')
            if (sampleLotSize > totalLotSize) {
                sampleLotSize = totalLotSize
            }
            return true;
        });

        return sampleLotSize
    }

    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});