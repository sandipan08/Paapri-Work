/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/search', 'N/record'], function (search, record) {



    function afterSubmit(context) {
        log.debug("PCT_Kelco", "In after Submit")
        let recordId = context.newRecord.id
        let recordType = context.newRecord.type;
        if ((context.type == context.UserEventType.CREATE) || (context.type == context.UserEventType.EDIT) || (context.type == context.UserEventType.COPY)) {

            cehckNewItemCreation(recordType, recordId)

            calculateCost(recordType, recordId)
        }
    }

    const calculateCost = (recordType, recordId) => {
        let materialCost = 0;
        let processCost = 0;
        let perUnitCost = 0;


        let configRecordObj = record.load({
            type: recordType,
            id: recordId,
            isDynamic: true
        })
        //CALCULATE MATERIAL COST
        let itemLineCount = configRecordObj.getLineCount({
            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config'
        })

        for (let itemLine = 0; itemLine < itemLineCount; itemLine++) {
            configRecordObj.selectLine({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                line: itemLine
            })
            let qty = chcekNull(configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_qty'
            }))
            let unitCost = chcekNull(configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_unit_cost'
            }))

            materialCost += (qty * unitCost);
            log.debug("PCT_Kelco", "Total Cost : " + (qty * unitCost))
            configRecordObj.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_item_cost',
                value: (qty * unitCost),
                // ignoreFieldChange: true,
                // forceSyncSourcing: true
            });
            configRecordObj.commitLine({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config'
            })
            // log.debug("PCT-Total Cost", configRecordObj.getCurrentSublistValue({
            //     sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
            //     fieldId: 'custrecord_pct_cpq_item_cost'
            // }))
        }
        log.debug({
            title: 'materialCost',
            details: materialCost
        })

        configRecordObj.setValue({
            fieldId: 'custrecord_pct_cpq_mat_total_matril_cost',
            value: materialCost
        })
        //END OF CALCULATE MATERIAL COST

        //CALCULATE PROCESS COST 
        let operationSequence = 10;
        let ProcessLineCount = configRecordObj.getLineCount({
            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps'
        })
        for (let processLine = 0; processLine < ProcessLineCount; processLine++) {
            configRecordObj.selectLine({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                line: processLine
            })

            let lineProcessCost = chcekNull(configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_process_cost'
            }))

            // configRecordObj.setCurrentSublistValue({
            //     sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
            //     fieldId: 'custrecord_pct_cpq_s_no',
            //     value: operationSequence
            // })
            configRecordObj.commitLine({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps'
            })
            operationSequence = parseInt(operationSequence) + 10

            processCost += lineProcessCost

        }
        log.debug({
            title: 'processCost',
            details: processCost
        })
        configRecordObj.setValue({
            fieldId: 'custrecord_pct_cpq_pro_total_process',
            value: processCost
        })
        //END CALCULATE PROCESS COST 

        perUnitCost = parseFloat(processCost) + parseFloat(materialCost)

        configRecordObj.setValue({
            fieldId: 'custrecord_pct_cpq_item_unit_cost',
            value: perUnitCost
        })

        let markUp = parseFloat(configRecordObj.getValue({
            fieldId: 'custrecord_pct_cpq_markup',
        }))

        let markupCost = (perUnitCost * markUp) / 100

        log.debug({
            title: 'markUp =' + markUp,
            details: 'markupCost =' + markupCost.toFixed(4) + ' perUnitCost =' + perUnitCost
        })
        configRecordObj.setValue({
            fieldId: 'custrecord_pct_cpq_total_markup',
            value: markupCost
        })

        log.debug({
            title: 'PCT',
            details: 'Final Price =' + (perUnitCost + parseFloat(markupCost)).toFixed(4)
        })
        configRecordObj.setValue({
            fieldId: 'custrecord_pct_cpq_final_selling_price',
            value: (perUnitCost + parseFloat(markupCost)).toFixed(4)
        })
        configRecordObj.save()
    }

    const chcekNull = (val) => {
        if (val == '' || val == null || isNaN(val) || val == undefined) {
            val = 0
        }
        return val
    }
    const cehckNewItemCreation = (recordType, recordId) => {
        let configRecordObj = record.load({
            type: recordType,
            id: recordId,
            isDynamic: true
        })

        let itemLineCount = configRecordObj.getLineCount({
            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config'
        })

        for (let itemLine = 0; itemLine < itemLineCount; itemLine++) {
            configRecordObj.selectLine({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                line: itemLine
            })
            let oldItemName = configRecordObj.getCurrentSublistText({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_items'
            })

            let oldItemId = configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_items'
            })

            let newItemName = configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_new_item'
            })

            let itemDesc = configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_new_item_desc'
            })

            let unitCost = configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_unit_cost'
            })

            let unitType = configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_unit_type'
            })

            let consumptionunit = configRecordObj.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_consumption_unit'
            })
            //
            if (oldItemName == 'CUSTOM' || oldItemName == 'CUSTOM LOT NUMBERED') {
                let itemObj = {
                    itemId: oldItemId,
                    itemDesc: itemDesc,
                    unitCost: unitCost,
                    newItemName: newItemName,
                    unitType: unitType,
                    consumptionunit: consumptionunit

                }
                let newCreatedItemId = createNewItem(itemObj)

                configRecordObj.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_items',
                    value: newCreatedItemId
                })

                configRecordObj.commitLine({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                })
            }

        }

        configRecordObj.save();
    }

    const createNewItem = (itemObj) => {
        let newItemObj = record.copy({
            type: search.lookupFields({ type: 'item', id: itemObj.itemId, columns: 'recordtype' })['recordtype'],
            id: itemObj.itemId,
            isDynamic: true,
        })
        newItemObj.setValue({
            fieldId: 'itemid',
            value: itemObj.newItemName
        })
        newItemObj.setValue({
            fieldId: 'salesdescription',
            value: itemObj.itemDesc
        })
        newItemObj.setValue({
            fieldId: 'unitstype',
            value: itemObj.unitType
        })
        newItemObj.setValue({
            fieldId: 'consumptionunit',
            value: itemObj.consumptionunit
        })
        newItemObj.setValue({
            fieldId: 'cost',
            value: itemObj.unitCost
        })
        return newItemObj.save();
    }
    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
