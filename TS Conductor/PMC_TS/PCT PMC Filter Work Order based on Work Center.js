/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00        28 July 2022          Sandipan Sau
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
Script Name:        PCT PMC Filter Work Order based on Work Center
Developer:          Subhankar Nath  
Development Head:   Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet will filter Work Order based on Work Center
© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_get                                                        Main Function                                                             Subhankar Nath

/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/

define(['N/search', 'N/record'], function (search, record) {

    function _get(context) {
        try {
            log.debug({
                title: `PCT-PMC`,
                details: `PCT PMC Filter Work Order based on Work Center RestLet`
            })
            let workCenter = context.workCenter;
            let operationStatus = context.operationStatus;
            let workOrderResponseDetails = getWorkOrderInPMCTransaction(workCenter, operationStatus);
            let tableHeaders = getTableHeaders()
            workOrderResponseDetails['columnsArr'] = generateTableHeader(workOrderResponseDetails.keys, tableHeaders.workOrderTableTitleArr);
            return { 'isSuccess': true, 'workOrderResponseDetails': workOrderResponseDetails }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }

    const getWorkOrderInPMCTransaction = (workCenter, operationStatus) => {
        let keyObjects = {
            'workOrderId': 0,
            'workOrder': '',
            'assemblyItem': 0,
            'productionQuantity': 0,
        }

        var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
            type: "customrecord_pct_pmc_tran_k_fab",
            filters:
                [
                    ["custrecord_pct_kfab_wo_center", "anyof", workCenter],
                    "AND",
                    ["custrecord_pct_kfab_op_status", "anyof", operationStatus],
                    "AND",
                    ["custrecord_pct_kfab_wo.mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_pct_kfab_wo", label: "Work Order" }),
                    search.createColumn({
                        name: "item",
                        join: "CUSTRECORD_PCT_KFAB_WO",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "quantity",
                        join: "CUSTRECORD_PCT_KFAB_WO",
                        label: "Item"
                    }),
                    search.createColumn({ name: "custrecord_pct_kfab_prod_qty", label: "Production Quantity" })
                ]
        });
        var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
        log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let workOrderResArray = [];
            customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
                let workOrderRes = {};
                workOrderRes.workOrderId = result.getValue('custrecord_pct_kfab_wo');
                workOrderRes.workOrder = result.getText('custrecord_pct_kfab_wo');
                workOrderRes.assemblyItem = result.getText({
                    name: "item",
                    join: "CUSTRECORD_PCT_KFAB_WO",
                });
                // workOrderRes.productionQuantity = result.getValue('custrecord_pct_kfab_prod_qty');
                workOrderRes.productionQuantity = result.getValue({
                    name: "quantity",
                    join: "CUSTRECORD_PCT_KFAB_WO",
                });
                workOrderResArray.push(workOrderRes);
                return true;
            });
            return { 'hasContent': true, 'data': workOrderResArray, 'keys': keyObjects }
        }
        return { 'hasContent': false, 'errorMessage': "No Work Order Found", 'data': [], 'keys': keyObjects }

    }


    const getTableHeaders = () => {
        return {
            'workOrderTableTitleArr': ['Work Order Id', 'Work Order', 'Assembly Item', 'Production Quantity']
        }
    }

    const generateTableHeader = (keysArr, titleArr) => {
        let columnsArr = [];
        Object.keys(keysArr).forEach((element, index) => {
            let obj = {}
            obj['data'] = element;
            obj['title'] = titleArr[index];
            columnsArr.push(obj);
        });
        return columnsArr;
    }


    return {
        get: _get,
    }
});