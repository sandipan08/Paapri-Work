/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          15 September 2023        Sandipan Sau
*
*
* @NApiVersion 2.1
* @NModuleScope Public
 *@NScriptType WorkflowActionScript
/**********************************************************************************************************************************************

Script Name:        PCT_JAG_CS_GenerateMasterWorkOrder.js
Developer:          Sandipan Sau    

Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This WorkflowActionScript PCT_JAG_CS_GenerateMasterWorkOrder.jst Script will generate the Master Work Order

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary



***********************************************************************************************************************************************/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email', 'N/runtime'], function (log, record, runtime, file, format, search, email, runtime) {

    function onAction(scriptContext) {
        log.debug("In Generate Master work Order Function");
        // var wOLocation = 0;
        let masterWorkOrderCompletionObj = {}
        let masterWorkOrderArray = []
        let soLoad = scriptContext.newRecord;
        let soId = soLoad.getValue({ fieldId: 'id' });
        let entity = soLoad.getValue({ fieldId: 'entity' });
        let subsidiary = soLoad.getValue({ fieldId: 'subsidiary' });
        // let location = soLoad.getValue({ fieldId: 'location' });
        const soDataObj = getSodata(soLoad)[0];
        let wOLocation = getSodata(soLoad)[1];
        log.debug("LOCATION : ", wOLocation)

        Object.keys(soDataObj).forEach(function (groupElement) {

            let soData = soDataObj[groupElement]
            if (soData.length > 0) {
                let masterWorkOrderObj = record.create({
                    type: 'customtransaction_pct_jag_master_wo',
                    isDynamic: true
                }).setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                }).setValue({
                    fieldId: 'custbody_pct_master_wo_location',
                    value: wOLocation
                }).setValue({
                    fieldId: 'custbody_pct_master_wo_createdfrom',
                    value: soId
                }).setValue({
                    fieldId: 'custbody_pct_master_wo_customername',
                    value: entity
                })
                //
                log.debug({
                    title: 'soData type= ' + typeof soData,
                    details: soData
                })
                let groupBy = ''
                soData.forEach(element => {
                    masterWorkOrderObj.selectNewLine({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details'
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: 'custrecord_pct_wo_details_wo_number',
                        value: element.workOrderId,
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: '	custrecord_pct_master_work_order_po',
                        value: element.PO,
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: 'custrecord_pct_master_work_order_pcs',
                        value: element.pieces,
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: 'custrecord_pct_master_work_order_length',
                        value: element.lengthInFt,
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: 'custrecord_pct_master_work_order_len_in',
                        value: element.lengthInInch,
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: 'custrecord_pct_master_work_order_strech',
                        value: element.strech,
                    })
                    masterWorkOrderObj.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details',
                        fieldId: 'custrecord_pct_master_work_order_desc',
                        value: element.description,
                    })
                    masterWorkOrderObj.commitLine({
                        sublistId: 'recmachcustrecord_pct_master_work_order_details'
                    })
                    groupBy = element['SUBITEM'] + ' ' + element['COLOR']
                });
                let masterWorkOrderId = masterWorkOrderObj.save()
                masterWorkOrderArray.push(masterWorkOrderId)
                masterWorkOrderCompletionObj[groupBy] = masterWorkOrderId //= '';
            }

        });


        log.debug({
            title: 'masterWorkOrderObj',
            details: JSON.stringify(masterWorkOrderCompletionObj)
        })
        // record.submitFields({
        //     type: record.Type.SALES_ORDER,
        //     id: soId,
        //     values: {
        //         custbody_pct_master_work_order: masterWorkOrderArray,
        //     }

        // })


        let soObj = record.load({
            type: record.Type.SALES_ORDER,
            id: soId,
            isDynamic: true
        })
        soObj.setValue({
            fieldId: 'custbody_pct_master_work_order',
            value: masterWorkOrderArray
        })

        let itemLine = soObj.getLineCount({
            sublistId: 'item'
        })
        for (let soIndex = 0; soIndex < itemLine; soIndex++) {

            soObj.selectLine({
                sublistId: 'item',
                line: soIndex
            })
            let woid = soObj.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'woid'
            })
            if (parseInt(woid) > 0) {
                let subItemOf = soObj.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_subitem', line: soIndex });
                let color = soObj.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_line_color', line: soIndex });
                let groupName = subItemOf + ' ' + color

                let masterWorkOrderId = masterWorkOrderCompletionObj[groupName]
                log.debug({
                    title: 'masterWorkOrderId',
                    details: JSON.stringify(masterWorkOrderId)
                })
                soObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_master_work_order',
                    value: masterWorkOrderId
                })
                soObj.commitLine({
                    sublistId: 'item'
                })
            }


        }
        soObj.save()



    }

    const getSodata = (soLoad) => {
        let masterWorkOrderArray = []
        let masterWorkOrderObj = {};
        let wOLocation = 0
        for (let itemIndex = 0; itemIndex < soLoad.getLineCount({ sublistId: 'item' }); itemIndex++) {
            let createWoCheck = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'createwo', line: itemIndex });
            let createWoId = soLoad.getSublistText({ sublistId: 'item', fieldId: 'createwo', line: itemIndex });
            log.debug(createWoId)
            if (createWoCheck) {
                let itemObj = {};
                let itemId = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'item', line: itemIndex });
                itemObj['internalId'] = soLoad.getValue({ fieldId: 'id' });
                itemObj['customerId'] = soLoad.getValue({ fieldId: 'entity' });
                itemObj['dateCreated'] = soLoad.getValue({ fieldId: 'trandate' });
                itemObj['itemName'] = soLoad.getSublistText({ sublistId: 'item', fieldId: 'item', line: itemIndex });
                let workOrderId = soLoad.getSublistText({ sublistId: 'item', fieldId: 'woid', line: itemIndex });
                var workOrderLookUp = search.lookupFields({
                    type: 'workorder',
                    id: workOrderId,
                    columns: 'location'
                });
                log.debug("PCT-JAG", "Location : " + JSON.stringify(workOrderLookUp))
                wOLocation = workOrderLookUp.location[0].value;
                log.debug({
                    title: "PCT",
                    details: "--------------------------------- " + wOLocation
                })
                itemObj['workOrderId'] = soLoad.getSublistText({ sublistId: 'item', fieldId: 'woid', line: itemIndex });
                itemObj['itemId'] = itemId;
                itemObj['quantity'] = soLoad.getSublistText({ sublistId: 'item', fieldId: 'quantity', line: itemIndex });
                itemObj['pieces'] = soLoad.getSublistText({ sublistId: 'item', fieldId: 'custcol_pct_jag_pieces', line: itemIndex });
                itemObj['lengthInFt'] = soLoad.getSublistText({ sublistId: 'item', fieldId: 'custcol_pct_jag_length', line: itemIndex });
                itemObj['lengthInInch'] = soLoad.getSublistText({ sublistId: 'item', fieldId: 'custcol_pct_jag_length_inch', line: itemIndex });
                // itemObj['pieces'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_pieces', line: itemIndex });
                itemObj['description'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'description', line: itemIndex });
                itemObj['strech'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_width', line: itemIndex });
                itemObj['PO'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'createpo', line: itemIndex });
                itemObj['SUBITEM'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_subitem', line: itemIndex });
                itemObj['COLOR'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_line_color', line: itemIndex });
                let subItemOf = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_subitem', line: itemIndex });
                let color = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_line_color', line: itemIndex });
                //createpo
                // itemObj['length_in'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_length_inch', line: itemIndex });
                // itemObj['weight'] = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_jag_tot_weight', line: itemIndex });
                let groupName = subItemOf + ' ' + color
                if (!(groupName in masterWorkOrderObj)) {
                    masterWorkOrderObj[groupName] = []
                    masterWorkOrderObj[groupName].push(itemObj)
                }
                else {
                    masterWorkOrderObj[groupName].push(itemObj)
                }
                masterWorkOrderArray.push(itemObj)
            }
            log.debug("PCT-JAG", "Master Work Order Object : " + JSON.stringify(masterWorkOrderObj))

        }
        return [masterWorkOrderObj, wOLocation];
    }

    return {
        onAction: onAction
    }
});
