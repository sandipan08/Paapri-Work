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

define(['N/record'],
    function (record) {
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
                    toType: record.Type.WORK_ORDER_ISSUE
                })

                let lineCount = workOrderIssueRecord.getLineCount({
                    sublistId: 'component'
                })

                for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
                    let component = workOrderIssueRecord.getSublistValue({
                        sublistId: 'component',
                        fieldId: 'item',
                        line: lineIndex
                    });
                    log.debug({
                        title: 'PCT-PMC',
                        details: `Component = ${component}`
                    })
                    log.debug({
                        title: 'PCT-PMC',
                        details: `Data = ${JSON.stringify(issueData[component])}`
                    })
                    if (component in issueData) {
                        workOrderIssueRecord.setSublistValue({
                            sublistId: 'component',
                            fieldId: 'quantity',
                            line: lineIndex,
                            value: issueData[component].issueQty
                        });
                        if (issueData[component].modalData.length > 0) {
                            let inventoryDetail = workOrderIssueRecord.getSublistSubrecord({
                                sublistId: 'component',
                                fieldId: 'componentinventorydetail',
                                line: lineIndex
                            })
                            issueData[component].modalData.map((data, index) => {
                                log.debug({
                                    title: 'PCT-PMC',
                                    details: `Data = ${JSON.stringify(data)}`
                                })
                                log.debug({
                                    title: 'PCT-PMC',
                                    details: `Data = ${data.binNumber}`
                                })
                                if (data.lotNumber)
                                    inventoryDetail.setSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        line: index,
                                        value: data.lotNumber
                                    })
                                if (data.binNumber)
                                    inventoryDetail.setSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'binnumber',
                                        line: index,
                                        value: data.binNumber
                                    })
                                inventoryDetail.setSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'inventorystatus',
                                    line: index,
                                    value: '1'
                                })
                                inventoryDetail.setSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    line: index,
                                    value: data.quantity
                                })
                            });
                        }
                    }
                    else {
                        workOrderIssueRecord.setSublistValue({
                            sublistId: 'component',
                            fieldId: 'quantity',
                            line: lineIndex,
                            value: 0
                        });
                    }
                }
                let woIssueId = workOrderIssueRecord.save();
                return { 'isSuccess': true, 'data': woIssueId }
            }
            catch (error) {
                return { 'isSuccess': false, 'errorMessage': error.message }
            }

        }
        return {
            post: createWorkOrderIssue
        };
    });