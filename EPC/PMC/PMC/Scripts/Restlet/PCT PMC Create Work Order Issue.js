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
                let assetArray = []
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
                    // log.debug({
                    //     title: 'PCT-PMC',
                    //     details: `Component = ${component}`
                    // })
                    let lineNo = workOrderIssueRecord.getSublistValue({
                        sublistId: 'component',
                        fieldId: 'linenumber',
                        line: lineIndex
                    });
                    // log.debug({
                    //     title: 'PCT-PMC',
                    //     details: `Line = ${lineNo}`
                    // })
                    let primaryKey = `${component}-${lineNo}`
                    log.debug({
                        title: 'PCT-PMC',
                        details: `primaryKey = ${primaryKey}`
                    })
                    if (primaryKey in issueData) {

                        log.debug("PCT-Component", component)
                        let assetObj = {
                            component: component,
                            assetValue: issueData[primaryKey].assetValue
                        }
                        assetArray.push(assetObj)
                        workOrderIssueRecord.setSublistValue({
                            sublistId: 'component',
                            fieldId: 'quantity',
                            line: lineIndex,
                            value: issueData[primaryKey].issueQty
                        });
                        if (issueData[primaryKey].modalData.length > 0) {
                            let inventoryDetail = workOrderIssueRecord.getSublistSubrecord({
                                sublistId: 'component',
                                fieldId: 'componentinventorydetail',
                                line: lineIndex
                            })
                            issueData[primaryKey].modalData.map((data, index) => {

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
                                    value: parseFloat(data.quantity)
                                })

                                // if (data?.customLotNumber?.length > 0) {
                                //     let assetObj = {
                                //         component: component,
                                //         lotNumber: data.customLotNumber

                                //     }
                                //     assetArray.push(assetObj)
                                // }

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
                log.debug('PCT', 'Created Issue Id: ' + woIssueId);
                createAssetRecord(assetArray, woIssueId, workOrderId)

                let woIssueDocumentNumber = search.lookupFields({
                    type: search.Type.WORK_ORDER_ISSUE,
                    id: woIssueId,
                    columns: 'tranid'
                }).tranid
                return { 'isSuccess': true, 'data': { 'id': woIssueId, 'name': woIssueDocumentNumber } }
            }
            catch (error) {
                log.debug({
                    title: 'PCT-PMC',
                    details: error
                })
                return { 'isSuccess': false, 'errorMessage': error.message }
            }

        }

        const createAssetRecord = (assetArray, woIssueId, workOrderId) => {
            log.debug("PCT-createAssetRecord", assetArray)
            assetArray.forEach(asset => {
                let assetRecord = record.create({
                    type: 'customrecord_epc_asset_record',
                    isDynamic: true
                }).setValue({
                    fieldId: 'altname',
                    value: asset.assetValue
                }).setValue({
                    fieldId: 'custrecord_epc_item_asset',
                    value: asset.component
                }).setValue({
                    fieldId: 'custrecord_epc_work_order',
                    value: workOrderId
                }).setValue({
                    fieldId: 'custrecord_epc_work_order_issue',
                    value: woIssueId
                }).save()
                log.debug('Custom Record Created', 'ID: ' + assetRecord);

            });
        }

        return {
            post: createWorkOrderIssue
        };
    });