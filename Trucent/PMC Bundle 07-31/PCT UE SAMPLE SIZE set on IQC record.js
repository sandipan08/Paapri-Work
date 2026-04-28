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
    const getSampleSize = (totalLotSize) => {
        let sampleSize = 0;
        var customrecord_pct_cbd_iqc_sample_planSearchObj = search.create({
            type: "customrecord_pct_cbd_iqc_sample_plan",
            filters:
                [
                    ["custrecord_pct_cbd_from_iqc_sample_plan", "lessthanorequalto", totalLotSize],
                    "AND",
                    ["custrecord_pct_cbd_to_iqc_sample_plan", "greaterthanorequalto", totalLotSize],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "custrecord_pct_cbd_from_iqc_sample_plan", label: "From" }),
                    search.createColumn({ name: "custrecord_pct_cbd_to_iqc_sample_plan", label: "To" }),
                    search.createColumn({ name: "custrecord_pct_cbd_size_iqc_sample_plan", label: "Sample Size" })
                ]
        });
        var searchResultCount = customrecord_pct_cbd_iqc_sample_planSearchObj.runPaged().count;
        log.debug("customrecord_pct_cbd_iqc_sample_planSearchObj result count", searchResultCount);
        customrecord_pct_cbd_iqc_sample_planSearchObj.run().each(function (result) {
            totalLotSize = result.getValue({ name: "custrecord_pct_cbd_size_iqc_sample_plan", label: "Sample Size" })
            return true;
        });

        return totalLotSize
    }

    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
