/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00       1st July 2022           ubhankar Nath
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

*@ScriptName        PCT PMC Create WOrk Order Completion
*@Developer         Subhankar Nath 
*@DevelopmentHead   Mrs. Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This 2.1 restlet will create Work order completion

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                              Purpose:                                                              Developer:
_post                                                  Main Function(Generates data for Work Order Completion)                         Subhankar Nath
createWorkOrderCompletion                              Creates Work Order Completion                                                   Subhankar Nath
getWorkOrderDetails                                    Fetches Work Order Assembly Last operation Sequence
                                                       and work order Document Number                                                  Subhankar Nath   
checkIsLotNumberedItem                                 Checkes if Work Order assembly is lot numbered or not                           Subhankar Nath 
/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/record', 'N/search', 'N/format'], function (record, search, format) {

    function _post(context) {
        try {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${JSON.stringify(context)}`
            })
            const workOrderCompletionObj = {};
            const pmcTransactionId = context.pmcTransactionId;
            const inputQuantity = context.inputQuantity;
            const loadPmcTransaction = record.load({
                type: 'customrecord_pct_pmc_tran_k_fab',
                id: pmcTransactionId,
                isDynamic: false
            })
            const workOrderId = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_kfab_wo'
            })
            const pmcTransactionOperationSequenceId = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_kfab_op_task_id'
            })
            const operationText = loadPmcTransaction.getValue({
                fieldId: 'custrecord_pct_kfab_p_seq'
            }).toString();
            const productionTime = context.productionTime;
            const completedQuantity = parseFloat(context.productionQuantity)
            log.debug({
                title: 'PCT-PMC',
                details: `Production Time = ${productionTime}`
            })

            workOrderCompletionObj['laborRuntimeOrLaborsetUptime'] = productionTime
            let errorMessage;
            workOrderCompletionObj['workOrderId'] = workOrderId;
            if (workOrderId) {
                const workOrderDetailsObj = getWorkOrderDetails(workOrderId);
                if (workOrderDetailsObj.isSuccess) {
                    workOrderCompletionObj['pmcTransactionName'] = loadPmcTransaction.getText({
                        fieldId: 'name'
                    })
                    workOrderCompletionObj['workOrderAssembly'] = workOrderDetailsObj.data.assembly;
                    workOrderCompletionObj['lastOperationSequence'] = workOrderDetailsObj.data.lastOperationSeq
                    workOrderCompletionObj['operationSequenceId'] = pmcTransactionOperationSequenceId;
                    workOrderCompletionObj['operationSequenceText'] = operationText;
                    workOrderCompletionObj['completedQuantity'] = completedQuantity;

                    log.debug({
                        title: 'PCT-PMC',
                        details: `Work Order Details = ${JSON.stringify(workOrderDetailsObj)}`
                    })
                    workOrderCompletionObj['isLastOperation'] = operationText === workOrderDetailsObj.data.lastOperationSeq ? true : false;
                    const itemObj = checkIsLotNumberedItem(workOrderDetailsObj.data.assembly);
                    if (itemObj.isSuccess) {
                        workOrderCompletionObj['isLotItem'] = itemObj.data.isLotItem ? true : false;
                        workOrderCompletionObj['lotNumber'] = workOrderDetailsObj.data.documentNumber;
                        workOrderCompletionObj['isSerialItem'] = itemObj.data.isSerialItem ? true : false;
                        workOrderCompletionObj['serialNumber'] = workOrderDetailsObj.data.documentNumber;
                    }
                    let workOrderCompletionResponseObj = createWorkOrderCompletion(workOrderCompletionObj);
                    if (workOrderCompletionResponseObj.isSuccess) {
                        loadPmcTransaction.setValue({
                            fieldId: 'custrecord_pct_pmc_completion_number',
                            value: workOrderCompletionResponseObj.data,
                            ignoreFieldChange: false
                        }).save();
                    }

                    return workOrderCompletionResponseObj
                }
                else {
                    errorMessage = workOrderDetailsObj.errorMessage
                }
            }
            else {
                errorMessage = 'Work Order Not Found'
            }
            return { 'isSuccess': false, 'errorMessage': errorMessage }
        } catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    const createWorkOrderCompletion = (dataObj) => {
        log.debug({
            title: 'PCT-PMC',
            details: `Data Obj = ${JSON.stringify(dataObj)}`
        })
        let workOrderCompletionRecord = record.transform({
            fromType: record.Type.WORK_ORDER,
            fromId: dataObj.workOrderId,
            toType: record.Type.WORK_ORDER_COMPLETION,
            isDynamic: false
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'startoperation',
            value: dataObj.operationSequenceId
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'endoperation',
            value: dataObj.operationSequenceId
        })
        workOrderCompletionRecord.setValue({
            fieldId: 'completedquantity',
            value: dataObj.completedQuantity,
        })
        log.debug("PCT", dataObj.completedQuantity)
        if (dataObj.isLastOperation && dataObj.isLotItem  && dataObj.completedQuantity > 0) {
            // For Lot Number Assembly
            let subRecord = workOrderCompletionRecord.getSubrecord({
                fieldId: 'inventorydetail'
            })
            subRecord.setSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'receiptinventorynumber',
                line: 0,
                value: dataObj.lotNumber,

            })
            subRecord.setSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                line: 0,
                value: dataObj.completedQuantity,
            })
        }
        if (dataObj.isLastOperation && dataObj.isSerialItem && dataObj.completedQuantity > 0) {
            // For Serialized Assembly
            for (let invDetailsQuantityIndex = 0; invDetailsQuantityIndex < dataObj.completedQuantity; invDetailsQuantityIndex++) {
                let subRecord = workOrderCompletionRecord.getSubrecord({
                    fieldId: 'inventorydetail'
                })
                subRecord.setSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'receiptinventorynumber',
                    line: invDetailsQuantityIndex,
                    value: `${dataObj.lotNumber}-${invDetailsQuantityIndex + 1}`
    
                })
                subRecord.setSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'quantity',
                    line: invDetailsQuantityIndex,
                    value: 1,
                })
                // subRecord.selectNewLine({ sublistId: 'inventoryassignment' });
                // subRecord.setCurrentSublistValue({
                //     sublistId: 'inventoryassignment',
                //     fieldId: 'receiptinventorynumber',
                //     value: `${dataObj.lotNumber}-${invDetailsQuantityIndex + 1}`
                // });
                // subRecord.setCurrentSublistValue({
                //     sublistId: 'inventoryassignment',
                //     fieldId: 'receiptinventorynumber',
                //     value: invDetailsQuantityIndex + 1,
                // });
                // subRecord.commitLine({ sublistId: 'inventoryassignment' });

                // subRecord.setSublistValue({
                //     sublistId: 'inventoryassignment',
                //     fieldId: 'receiptinventorynumber',
                //     line: 0,
                //     value: `${dataObj.lotNumber}-${invDetailsQuantityIndex + 1}`,

                // })
                // subRecord.setSublistValue({
                //     sublistId: 'inventoryassignment',
                //     fieldId: 'quantity',
                //     line: 0,
                //     value: invDetailsQuantityIndex + 1,
                // })
            }
        }
        else if (dataObj.isLastOperation && dataObj.completedQuantity > 0) {
            // For Normal Assembly with Bin
            let binResponse = getItemBinNumber(dataObj.workOrderAssembly)
            if (binResponse.isSuccess) {
                let subRecord = workOrderCompletionRecord.getSubrecord({
                    fieldId: 'inventorydetail'
                })
                subRecord.setSublistText({
                    sublistId: 'inventoryassignment',
                    fieldId: 'binnumber',
                    line: 0,
                    text: binResponse.data

                })
                subRecord.setSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'quantity',
                    line: 0,
                    value: dataObj.completedQuantity,
                })
            }

        }

        let lineCount = workOrderCompletionRecord.getLineCount({
            sublistId: 'operation'
        });
        for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
            let woLineOperationSequence = workOrderCompletionRecord.getSublistValue({
                sublistId: 'operation',
                fieldId: 'operationsequence',
                line: lineIndex
            })
            log.debug({
                title: 'PCT-PMC',
                details: `Operation Sequence = ${woLineOperationSequence}`
            })
            if (woLineOperationSequence.toString() === dataObj.operationSequenceText) {
                log.debug({
                    title: 'PCT-PMC',
                    details: `Operation Sequence = ${woLineOperationSequence}`
                })
                workOrderCompletionRecord.setSublistValue({
                    sublistId: 'operation',
                    fieldId: 'recordsetup',
                    line: lineIndex,
                    value: true,
                })
                if (dataObj.pmcTransactionName.toLowerCase() === 'setup') {
                    log.debug({
                        title: 'PCT-PMC',
                        details: `Labor setup time = ${dataObj.laborRuntimeOrLaborsetUptime}`
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborsetuptime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machinesetuptime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })

                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborruntime',
                        line: lineIndex,
                        value: 0,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineruntime',
                        line: lineIndex,
                        value: 0,
                    })

                }
                else {
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborruntime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineruntime',
                        line: lineIndex,
                        value: dataObj.laborRuntimeOrLaborsetUptime,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborsetuptime',
                        line: lineIndex,
                        value: 0,
                    })
                    workOrderCompletionRecord.setSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machinesetuptime',
                        line: lineIndex,
                        value: 0,
                    })
                }
            }
        }
        let workOrderCompletionId = workOrderCompletionRecord.save();
        log.debug(workOrderCompletionId)
        if (workOrderCompletionId)
            return { 'isSuccess': true, 'data': workOrderCompletionId }
        return { 'isSuccess': false, 'errorMessage': 'Unexpected Error' }
    }

    const getWorkOrderDetails = (workOrderId) => {
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", workOrderId],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "sequence",
                        join: "manufacturingOperationTask",
                        summary: "MAX",
                        label: "Operation Sequence"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let woData = {}
            workorderSearchObj.run().each(function (result) {
                woData['assembly'] = result.getValue({
                    name: "item",
                    summary: "GROUP"
                })
                woData['lastOperationSeq'] = result.getValue({
                    name: "sequence",
                    join: "manufacturingOperationTask",
                    summary: "MAX"
                })
                woData['documentNumber'] = result.getValue({
                    name: "tranid",
                    summary: "GROUP"
                })
                return true;
            });
            return { 'isSuccess': true, 'data': woData }
        }
        return { 'isSuccess': false, 'errorMessage': 'Data Not Found' }
    }

    const checkIsLotNumberedItem = (itemId) => {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemId],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "islotitem", label: "Is Lot Numbered Item" }),
                    search.createColumn({ name: "isserialitem", label: "Is Serialized Item" })
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let itemDataObj = {};
            itemSearchObj.run().each(function (result) {
                itemDataObj['isLotItem'] = result.getValue({ name: "islotitem" })
                itemDataObj['isSerialItem'] = result.getValue({ name: "isserialitem" })
                // .run().each has a limit of 4,000 results
                return true;
            });
            return { 'isSuccess': true, 'data': itemDataObj }
        }
        return { 'isSuccess': false, 'errorMessage': 'Item Details Not Found' }
    }

    const dateFormatter = (date) => {
        return date ? format.format({
            value: new Date(date),
            type: format.Type.DATETIME,
            timezone: format.Timezone.ASIA_CALCUTTA
        }) : format.format({
            value: new Date(),
            type: format.Type.DATETIME,
            timezone: format.Timezone.ASIA_CALCUTTA
        });
    }
    const getItemBinNumber = (itemId) => {
        log.debug(itemId)
        let binNumber = 0;
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemId],
                    "AND",
                    ["preferredbin", "is", "T"],
                    "AND",
                    ["usebins", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "preferredbin", label: "Preferred Bin" }),
                    search.createColumn({ name: "binnumber", label: "Bin Number" })
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("Bin count", searchResultCount);
        if (searchResultCount > 0) {
            itemSearchObj.run().each(function (result) {
                binNumber = result.getValue({ name: "binnumber", label: "Bin Number" });
                return true;
            });
            return { 'isSuccess': true, 'data': binNumber }
        }
        return { 'isSuccess': false, 'errorMessage': 'Bin Number is not Preferred' }

    }

    return {
        post: _post
    }
});
