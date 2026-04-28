/**
* Module Description
*
* Version    Date            		Author           Remarks
* 1.00       04 February 2021    	Anirban Gupta
*
*
* @NApiVersion 2.1
* @NScriptType Restlet
* @NModuleScope SameAccount
*/

/**********************************************************************************************************************************************

Script Name:        PCT_PMC_WOIssueComponents
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			WO Issue Components Script for PCT PMC.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

Function Name:             	Purpose:                                                                               				  Developer:
woIssueComponents			Main function which retrieves data from URL and creates WO Issue Components record accordingly.		  Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/record', 'N/search'],
    function (record, search) {
        function createWorkOrderIssue(context) {
            try {
                log.audit({
                    title: 'Request Received.'
                });
                log.debug({
                    title: 'PCT-PMC',
                    details: `Context = ${JSON.stringify(context)}`
                })
                let workOrderId = context.workOrderId;
                let manufacturingOperationTaskId = context.operationTaskId;
                let issueData = context.issueData;

                let workOrderIssueRecord = record.transform({
                    fromType: record.Type.WORK_ORDER,
                    fromId: workOrderId,
                    toType: record.Type.WORK_ORDER_ISSUE,
                    isDynamic: true
                })

                let lineCount = workOrderIssueRecord.getLineCount({
                    sublistId: 'component'
                })
                if (lineCount > 0) {
                    for (let lineIndex = lineCount - 1; lineIndex >= 0; lineIndex--) {
                        workOrderIssueRecord.selectLine({
                            sublistId: 'component',
                            line: lineIndex
                        })

                        let component = workOrderIssueRecord.getCurrentSublistValue({
                            sublistId: 'component',
                            fieldId: 'item',
                        });
                        log.debug({
                            title: 'PCT-PMC',
                            details: `Component = ${component}`
                        })
                        let lineNo = workOrderIssueRecord.getCurrentSublistValue({
                            sublistId: 'component',
                            fieldId: 'linenumber',
                        });
                        log.debug({
                            title: 'PCT-PMC',
                            details: `Line = ${lineNo}`
                        })
                        let primaryKey = `${component}`//-${lineNo}

                        if (primaryKey in issueData) {
                            workOrderIssueRecord.setCurrentSublistValue({
                                sublistId: 'component',
                                fieldId: 'quantity',
                                value: parseFloat(issueData[primaryKey].issueQty),
                                ignoreFieldChange: false
                            })

                            if (issueData[primaryKey].modalData.length > 0) {
                                let inventoryDetail = workOrderIssueRecord.getCurrentSublistSubrecord({
                                    sublistId: 'component',
                                    fieldId: 'componentinventorydetail',
                                })
                                
                                let sublistSubrecordLineCount = inventoryDetail.getLineCount({
                                    sublistId: 'inventoryassignment'
                                })
                                log.debug({
                                    title: "sublistSubrecordLineCount",
                                    details: sublistSubrecordLineCount
                                })
                                if (sublistSubrecordLineCount > 0) {
                                    for (let subRecordLineIndex = sublistSubrecordLineCount - 1; subRecordLineIndex >= 0; subRecordLineIndex--) {
                                        inventoryDetail.removeLine({
                                            sublistId: 'inventoryassignment',
                                            line: subRecordLineIndex,
                                            ignoreRecalc: false
                                        })
                                    }
                                }

                                issueData[primaryKey].modalData.map((data, index) => {
                                    inventoryDetail.selectLine({
                                        sublistId: 'inventoryassignment',
                                        line: index
                                    })
                                    log.debug({
                                        title: 'PCT-PMC',
                                        details: {
                                            'Data': JSON.stringify(data),
                                            'index': index
                                        }
                                    })
                                    log.debug({
                                        title: 'PCT-PMC',
                                        details: {
                                            'bin': data.binNumber,
                                            'lot': data.lotNumber,
                                            'quantity': parseFloat(data.quantity)
                                        }
                                    })
                                    if (data.lotNumber) {
                                        log.debug({
                                            title: 'Inside lot',
                                            details: data.lotNumber
                                        })
                                        inventoryDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'issueinventorynumber',
                                            value: data.lotNumber,
                                            ignoreFieldChange: false
                                        })
                                    }
                                    if (data.binNumber) {
                                        log.debug({
                                            title: 'Inside bin',
                                            details: data.binNumber
                                        })
                                        inventoryDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'binnumber',
                                            value: data.binNumber,
                                            ignoreFieldChange: false
                                        })
                                    }
                                    // inventoryDetail.setSublistValue({
                                    //     sublistId: 'inventoryassignment',
                                    //     fieldId: 'inventorystatus',
                                    //     line: index,
                                    //     value: '1'
                                    // })
                                    log.debug({
                                        title: 'Inside qty',
                                        details: parseFloat(data.quantity)
                                    })
                                    inventoryDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: parseFloat(data.quantity),
                                        ignoreFieldChange: false
                                    })
                                    inventoryDetail.commitLine({
                                        sublistId: 'inventoryassignment',
                                    })
                                });
                                workOrderIssueRecord.commitLine({
                                    sublistId: 'component',
                                })
                            }
                            else {
                                log.debug({
                                    title: 'Herer again',
                                    details: lineIndex
                                })
                                workOrderIssueRecord.setCurrentSublistValue({
                                    sublistId: 'component',
                                    fieldId: 'quantity',
                                    value: 0,
                                    ignoreFieldChange: false
                                });
                                workOrderIssueRecord.removeCurrentSublistSubrecord({
                                    sublistId: 'component',
                                    fieldId: 'componentinventorydetail'
                                })
                                workOrderIssueRecord.commitLine({
                                    sublistId: 'component',
                                })
                            }

                        }
                        else {
                            log.debug({
                                title: 'Hehrerer',
                                details: lineIndex
                            })
                            workOrderIssueRecord.setCurrentSublistValue({
                                sublistId: 'component',
                                fieldId: 'quantity',
                                value: 0,
                                ignoreFieldChange: false
                            })
                            workOrderIssueRecord.removeCurrentSublistSubrecord({
                                sublistId: 'component',
                                fieldId: 'componentinventorydetail'
                            })
                            workOrderIssueRecord.commitLine({
                                sublistId: 'component',
                            })
                        }
                    }
                }
                log.debug({
                    title: 'here',
                    details: 'after loop'
                })
                let woIssueId = workOrderIssueRecord.save();
                let woIssueDocumentNumber = search.lookupFields({
                    type: search.Type.WORK_ORDER_ISSUE,
                    id: woIssueId,
                    columns: 'tranid'
                }).tranid
                return { 'isSuccess': true, 'data': { 'id': woIssueId, 'name': woIssueDocumentNumber } }
            }
            catch (error) {
                log.error({
                    title: 'ERROR',
                    details: error.message
                })
                return { 'isSuccess': false, 'errorMessage': error.message }
            }

        }
        return {
            post: createWorkOrderIssue
        };
    });