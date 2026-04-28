/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function (search, record) {
    let itemClassIdArray = [18, 19, 20, 21, 22, 23, 24, 25, 26]

    function afterSubmit(context) {
        log.debug({
            title: "PCT",
            details: "In After Submit"
        })
        let totalDensityPercentage = 0
        let recordId = context.newRecord.id
        let recordType = context.newRecord.type;
        let configRecordObj = record.load({
            type: recordType,
            id: recordId,
            isDynamic: true
        })

        for (let itemLine = 0; itemLine < configRecordObj.getLineCount({
            sublistId: 'recmachcustrecord_pct_cpq_bom_list'
        }); itemLine++) {
            configRecordObj.selectLine({
                sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                line: itemLine
            })
            let itemId = chcekNull(configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                fieldId: 'custrecord_pct_cpq_bom_item'
            }))
            let classLength = search.lookupFields({ type: 'item', id: itemId, columns: ['class'] }).class.length
            if (classLength) {
                // log.debug("PCT-itemId", itemClassIdArray.includes(parseInt(search.lookupFields({ type: 'item', id: itemId, columns: ['class'] }).class[0].value)))

                if (!itemClassIdArray.includes(parseInt(search.lookupFields({ type: 'item', id: itemId, columns: ['class'] }).class[0].value))) {

                    let layerPercentage = chcekNull(configRecordObj.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_vp_bom_temp_layer_per'
                    }))
                    let consumptionPercentage = chcekNull(configRecordObj.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_vp_cn_bom_tem_comp'
                    }))
                    let density = chcekNull(configRecordObj.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_vp_bom_temp_density_field'
                    }))
                    let overallPercentage = (parseFloat(consumptionPercentage) * parseFloat(layerPercentage)).toFixed(5)
                    let densityPercentage = (overallPercentage / 100) * parseFloat(density);
                    totalDensityPercentage += densityPercentage;
                    configRecordObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_vp_bom_temp_overall_per',
                        value: overallPercentage
                    })
                    configRecordObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_vp_bom_temp_den_overall',
                        value: densityPercentage.toFixed(5)
                    })
                    configRecordObj.commitLine({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list'
                    })
                }
            }
        }

        for (let itemLine = 0; itemLine < configRecordObj.getLineCount({
            sublistId: 'recmachcustrecord_pct_cpq_bom_list'
        }); itemLine++) {
            configRecordObj.selectLine({
                sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                line: itemLine
            })
            let itemId = chcekNull(configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                fieldId: 'custrecord_pct_cpq_bom_item'
            }))
            let classLength = search.lookupFields({ type: 'item', id: itemId, columns: ['class'] }).class.length
            if (classLength) {
                if (!itemClassIdArray.includes(parseInt(search.lookupFields({ type: 'item', id: itemId, columns: ['class'] }).class[0].value))) {

                    let densityPercentage = chcekNull(configRecordObj.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_vp_bom_temp_den_overall'
                    }))

                    configRecordObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        fieldId: 'custrecord_pct_cpq_bom_quantity',
                        value: (parseFloat(densityPercentage) / totalDensityPercentage).toFixed(5)
                    })
                    configRecordObj.commitLine({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list'
                    })
                }
            }
        }
        configRecordObj.save();
    }
    const chcekNull = (val) => {
        if (val == '' || val == null || isNaN(val) || val == undefined) {
            val = 0
        }
        return val
    }
    return {

        afterSubmit: afterSubmit
    }
});
