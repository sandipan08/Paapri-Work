/**
 * ------------------------------------------- PCT Multiple IN Out User Event --------------------------------------------------------
 *@author       Subhankar Nath
 *@NApiVersion  2.1
 *@NScriptType  UserEventScript
 *@license       '© 2024 Paapri Cloud Technologies, all rights reserved'
 *@description  The UserEvent Script is used to adjust output item from input items and update optput item lot numbers for "PCT MULTIPLE IN/OUT"
 */
define(['N/record', 'N/ui/serverWidget', 'N/runtime'], (record, serverWidget, runtime) => {

    const setInventoryAdjustmentSublist = (dataObject) => {
        try {
            let { inventoryAdjustmentRecord, inventoryAdjSublistDataObject } = dataObject,
                sublist = 'inventory',
                invnetoryDetailSublist = 'inventoryassignment'

            inventoryAdjustmentRecord.selectNewLine({
                sublistId: sublist
            }).setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'item',
                value: inventoryAdjSublistDataObject.item,
                ignoreFieldChange: false
            }).setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'location',
                value: inventoryAdjSublistDataObject.location,
                ignoreFieldChange: false
            }).setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'adjustqtyby',
                value: inventoryAdjSublistDataObject.quantity,
                ignoreFieldChange: false
            })

            let sublistSubRecord = inventoryAdjustmentRecord.getCurrentSublistSubrecord({
                sublistId: sublist,
                fieldId: 'inventorydetail'
            })

            sublistSubRecord.selectNewLine({
                sublistId: invnetoryDetailSublist
            }).setCurrentSublistValue({
                sublistId: invnetoryDetailSublist,
                fieldId: inventoryAdjSublistDataObject.inventoryDetail.inventoryNumberFieldId,
                value: inventoryAdjSublistDataObject.inventoryDetail.invnetoryNumber,
                ignoreFieldChange: false
            }).setCurrentSublistValue({
                sublistId: invnetoryDetailSublist,
                fieldId: 'quantity',
                value: inventoryAdjSublistDataObject.inventoryDetail.quantity,
                ignoreFieldChange: false
            }).commitLine({
                sublistId: invnetoryDetailSublist,
                ignoreRecalc: false
            })

            if (!inventoryAdjSublistDataObject.isInputItem)
                inventoryAdjustmentRecord.setCurrentSublistValue({
                    sublistId: sublist,
                    fieldId: 'unitcost',
                    value: inventoryAdjSublistDataObject.unitCost,
                    ignoreFieldChange: false
                })

            inventoryAdjustmentRecord.commitLine({
                sublistId: sublist,
                ignoreRecalc: false
            })

            return { isSuccess: true, data: '' }
        }
        catch (error) {
            log.debug({
                title: 'SetInventoryAdjustmentSublist->Error',
                details: error.message
            })
            return { isSuccess: false, error: error.message }
        }
    }

    const createInventoryAdjustment = (dataObject) => {
        try {
            let multipleInOutDetails = dataObject.multipleInOutDetails,
                mimoBodyFields = multipleInOutDetails.mainFields,
                mimoLineFields = multipleInOutDetails.lineFields,
                inputItemUnitCost = 0,
                outputLotDetails = {},
                inventoryAdjustmentRecord = record.create({
                    type: record.Type.INVENTORY_ADJUSTMENT,
                    isDynamic: true
                }).setValue({
                    fieldId: 'subsidiary',
                    value: mimoBodyFields.custrecord_pct_mimo_subsidiary.value,
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'adjlocation',
                    value: mimoBodyFields.custrecord_pct_mimo_location.value,
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'account',
                    value: mimoBodyFields.custrecord_pct_mimo_adj_account.value,
                    ignoreFieldChange: false
                }).setValue({
                    fieldId: 'trandate',
                    value: new Date(mimoBodyFields.custrecord_pct_mimo_date.value),
                    ignoreFieldChange: false
                })

            mimoLineFields.recmachcustrecord_pct_pct_recycle_link.items.forEach(element => {
                let inventoryAdjSublistDataObject = {
                    item: element.custrecord_pct_inputs_item.value,
                    location: element.custrecord_pct_mimo_input_item_lot_loc.value,
                    quantity: -element.custrecord_pct_inputs_quantity.value,
                    unitCost: 0,
                    isInputItem: true,
                    inventoryDetail: {
                        inventoryNumberFieldId: 'issueinventorynumber',
                        invnetoryNumber: element.custrecord_pct_inputs_lot_number.value,
                        quantity: -element.custrecord_pct_inputs_quantity.value
                    }
                },
                    setInventoryAdjustmentSublistResponse = setInventoryAdjustmentSublist({ inventoryAdjustmentRecord, inventoryAdjSublistDataObject })

                if (!setInventoryAdjustmentSublistResponse.isSuccess) throw Error(setInventoryAdjustmentSublistResponse.error)

                inputItemUnitCost += element.custrecord_pct_mimo_input_item_avg_cost.value * element.custrecord_pct_inputs_quantity.value
            })

            mimoLineFields.recmachcustrecord_pct_api_linked_pct_sort_recyc.items.forEach((element, index) => {
                let outputLotNumber = `${mimoLineFields.recmachcustrecord_pct_pct_recycle_link.items[0].custrecord_pct_inputs_lot_number.text}-${index + 1}`,
                    inventoryAdjSublistDataObject = {
                        item: element.custrecord_pct_api_item.value,
                        location: mimoBodyFields.custrecord_pct_mimo_location.value,
                        quantity: element.custrecord_pct_api_quantity_child.value,
                        unitCost: element.custrecord_pct_api_output_unit.value ? (inputItemUnitCost / mimoLineFields.recmachcustrecord_pct_api_linked_pct_sort_recyc.totalQuantity).toFixed(5) : 0,
                        isInputItem: false,
                        inventoryDetail: {
                            inventoryNumberFieldId: 'receiptinventorynumber',
                            invnetoryNumber: outputLotNumber,
                            quantity: element.custrecord_pct_api_quantity_child.value
                        }
                    },
                    outputLotPrimaryKey = `${element.custrecord_pct_api_item.value}-${element.custrecord_pct_api_quantity_child.value}`,
                    setInventoryAdjustmentSublistResponse = setInventoryAdjustmentSublist({ inventoryAdjustmentRecord, inventoryAdjSublistDataObject })

                if (!(outputLotPrimaryKey in outputLotDetails)) {
                    outputLotDetails[outputLotPrimaryKey] = []
                }
                outputLotDetails[outputLotPrimaryKey].push(outputLotNumber)
            })
            let inventoryAdjustmentId = inventoryAdjustmentRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            })

            return { isSuccess: true, data: { inventoryAdjustmentId: inventoryAdjustmentId, outputLotDetails: outputLotDetails } }
        }
        catch (error) {
            log.debug({
                title: 'CreateInventoryAdjustment-> Error-->',
                details: error.message
            })
            return { isSuccess: false, error: error.message }
        }
    }

    const getFieldData = (dataObject) => {
        try {
            let currentRecord = dataObject.currentRecord,
                field = dataObject.field,
                sublistId = 'sublistId' in dataObject ? dataObject.sublistId : '',
                isSublistField = dataObject.isSublistField,
                fieldValue = '', fieldText = '';

            if (!field) throw Error('No field')

            let fieldDetails = isSublistField ? currentRecord.getCurrentSublistField({
                fieldId: field,
                sublistId: sublistId
            }) : currentRecord.getField({
                fieldId: field
            })

            if (fieldDetails) {
                switch (fieldDetails.type.toUpperCase()) {
                    case serverWidget.FieldType.SELECT:
                        fieldValue = isSublistField ? currentRecord.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: field
                        }) || '' : currentRecord.getValue({
                            fieldId: field
                        }) || ''

                        fieldText = isSublistField ? currentRecord.getCurrentSublistText({
                            sublistId: sublistId,
                            fieldId: field
                        }) : currentRecord.getText({
                            fieldId: field
                        })

                        break;
                    case serverWidget.FieldType.DATE:
                    case serverWidget.FieldType.DATETIME:
                    case serverWidget.FieldType.DATETIMETZ:
                        fieldText = fieldValue = isSublistField ? currentRecord.getCurrentSublistText({
                            sublistId: sublistId,
                            fieldId: field
                        }) : currentRecord.getText({
                            fieldId: field
                        }) || ''

                        break;
                    case serverWidget.FieldType.INTEGER:
                    case serverWidget.FieldType.FLOAT:
                        fieldText = fieldValue = fieldValue = isSublistField ? currentRecord.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: field
                        }) || 0 : currentRecord.getValue({
                            fieldId: field
                        }) || 0

                        break;
                    default:
                        fieldValue = fieldText = isSublistField ? currentRecord.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: field
                        }) || '' : currentRecord.getValue({
                            fieldId: field
                        }) || ''

                        break;
                }
            }
            return { isSuccess: true, data: { text: fieldText, value: fieldValue } }
        }
        catch (error) {
            log.debug({
                title: 'GetFieldData-> Error-->',
                details: error.message
            })
            return { isSuccess: false, error: error.message, data: { text: '', value: '' } }
        }
    }

    const getRecordDetails = (dataObject) => {
        try {
            let currentRecord = dataObject.currentRecord,
                multiInOutRecordDetails = {
                    mainFields: {},
                    lineFields: {}
                },
                mainFields = currentRecord.getFields(),
                sublists = [{ sublist: 'recmachcustrecord_pct_pct_recycle_link', quantityField: 'custrecord_pct_inputs_quantity' }, { sublist: 'recmachcustrecord_pct_api_linked_pct_sort_recyc', quantityField: 'custrecord_pct_api_quantity_child' }],
                isSublistField = false;

            mainFields.forEach(field => {
                if (field && (field.startsWith('custrecord_') || field === 'name'))
                    multiInOutRecordDetails.mainFields[field] = getFieldData({ isSublistField: isSublistField, field: field, sublistId: '', currentRecord: currentRecord }).data
            })

            sublists.forEach(element => {
                let sublistId = element.sublist,
                    sublistFields = currentRecord.getSublistFields({
                        sublistId: sublistId
                    }),
                    sublistLineCount = currentRecord.getLineCount({
                        sublistId: sublistId
                    })

                multiInOutRecordDetails.lineFields[sublistId] = {
                    totalQuantity: 0,
                    items: []
                }

                for (let lineIndex = 0; lineIndex < sublistLineCount; lineIndex++) {
                    let sublistDetails = {}
                    currentRecord.selectLine({
                        sublistId: sublistId,
                        line: lineIndex
                    })

                    sublistFields.forEach(sublistField => {
                        if (sublistField && (sublistField.startsWith('custrecord_') || sublistField === 'id'))
                            sublistDetails[sublistField] = getFieldData({ isSublistField: true, field: sublistField, sublistId: sublistId, currentRecord: currentRecord }).data
                    })
                    multiInOutRecordDetails.lineFields[sublistId]['items'].push(sublistDetails)
                    multiInOutRecordDetails.lineFields[sublistId]['totalQuantity'] += sublistDetails[element.quantityField].value
                }
            })

            return { isSuccess: true, data: multiInOutRecordDetails }
        }
        catch (error) {
            log.debug({
                title: 'GetRecordDetails-> Error-->',
                details: error.message
            })
            return { isSuccess: false, error: error.message }
        }
    }

    const addOrUpdateOutputLotNumbers = (dataObject) => {
        try {
            let outputlotDetails = dataObject.outputlotDetails,
                outputItemSublistData = dataObject.outputItemSublistData

            outputItemSublistData.items.forEach(element => {
                let primaryKey = `${element.custrecord_pct_api_item.value}-${element.custrecord_pct_api_quantity_child.value}`
                if (primaryKey in outputlotDetails) {
                    record.load({
                        type: 'customrecord_pct_api_recycle_child',
                        id: element.id.value,
                        isDynamic: true
                    }).setText({
                        fieldId: 'custrecord_pct_eqs_sieving_out_lotno',
                        text: outputlotDetails[primaryKey][0],
                        ignoreFieldChange: false
                    }).save()

                    outputlotDetails[primaryKey].splice(0, 1)
                }
            })
        }
        catch (error) {
            log.debug({
                title: 'AddOrUpdateOutputLotNumbers',
                details: error.message
            })
        }
    }

    const beforeLoad = (context) => {
        try {
            let currentRecord = context.newRecord,
                currentUser = runtime.getCurrentUser().id

            currentRecord.setValue({
                fieldId: 'custrecord_pct_mimo_operators',
                value: [currentUser],
                ignoreFieldChange: false,
                forceSyncSourcing: true
            })
        }
        catch (error) {
            log.debug({
                title: 'Before Load Error',
                details: error.message
            })
        }
    }

    const afterSubmit = (context) => {
        try {
            if (!(context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT)) return;
            let currentRecordId = context.newRecord.id,
                currentRecordType = context.newRecord.type,
                currentRecord = record.load({
                    type: currentRecordType,
                    id: currentRecordId,
                    isDynamic: true
                }),
                getRecordetailsResponse = getRecordDetails({ currentRecord: currentRecord })

            currentRecord.save()

            if (!getRecordetailsResponse.isSuccess) return;
            log.debug({
                title: 'Response',
                details: getRecordetailsResponse
            })

            if (getRecordetailsResponse.data.mainFields.custrecord_pct_mimo_inv_adj.value)
                record.delete({
                    type: record.Type.INVENTORY_ADJUSTMENT,
                    id: getRecordetailsResponse.data.mainFields.custrecord_pct_mimo_inv_adj.value
                })

            let createInventoryAdjustmentResponse = createInventoryAdjustment({ 'multipleInOutDetails': getRecordetailsResponse.data })

            if (!createInventoryAdjustmentResponse.isSuccess) return;

            record.submitFields({
                type: currentRecordType,
                id: currentRecordId,
                values: {
                    'custrecord_pct_mimo_inv_adj': createInventoryAdjustmentResponse.data.inventoryAdjustmentId
                }
            })

            addOrUpdateOutputLotNumbers({ outputlotDetails: createInventoryAdjustmentResponse.data.outputLotDetails, outputItemSublistData: getRecordetailsResponse.data.lineFields.recmachcustrecord_pct_api_linked_pct_sort_recyc })
        }
        catch (error) {
            log.debug({
                title: 'After Submit-> Error-->',
                details: error.message
            })
        }
    }

    return { beforeLoad, afterSubmit }
});