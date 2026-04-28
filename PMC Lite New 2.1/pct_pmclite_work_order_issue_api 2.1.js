/**
 *              //////////     PMC Lite 2.1 | HOME PAGE SUITELET (MAIN PAGE/SCANNER PAGE)     //////////
 * 
*@author       Rajesh Nandi
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-03-28 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC Lite, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
                
 *@description  This Suitelet is used to scan ticket and complete operations, for every action it will create 
 *              a PMC Transation record.
 */
define(['N/record', 'N/search'], function (record, search) {
    var _response;
    var _request;
    var result;
    function onRequest(context) {
        _request = context.request;
        _response = context.response;

        if (_request.method == 'GET') {
            try {
                // Getting Params [GET REQUEST]
                var userName = _request.parameters.custparam_userName;
                var userId = _request.parameters.custparam_userId;
                var workOrderText = _request.parameters.workOrderId;
                let workOrderId = getWorkOrderId(workOrderText)

                let workOrderItemDetails = getWorkOrderItemDetails(workOrderId);

                let tableHeaders = getTableHeaders()
                workOrderItemDetails['columnsArr'] = generateTableHeader(workOrderItemDetails.keys, tableHeaders.itemsTableTitleArr)

                result = { 'isSuccess': true, 'workOrderItemDetails': workOrderItemDetails, 'workOrderId': workOrderId }
                log.debug({
                    title: 'result',
                    details: result
                })
                _response.write(JSON.stringify(result))
            }
            catch (error) {
                result = { 'isSuccess': false, 'errorMessage': error.message }
                log.debug({
                    title: 'result',
                    details: result
                })
                _response.write(JSON.stringify(result))
            }
        } else {// POST REQUEST BODY
            var userName = _request.parameters.custparam_userName;
            var userId = _request.parameters.custparam_userId;
        }
    }

    const getWorkOrderId = (workOrderText) => {
        var workorderSearchObj = search.create({
            type: "workorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["formulanumeric: CASE WHEN {number}= '" + workOrderText + "' THEN 1 ELSE 0 END", "equalto", "1"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internalid" }),
                    
                ]
        });
        let internalid = 0;
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            internalid = result.id
            return true;
        });

        return internalid
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
    const getTableHeaders = () => {
        return {
            'itemsTableTitleArr': ['Item', 'Item Id', 'Quantity', 'Total Quantity Issued', 'Remaining Qty', 'Back Ordered',  'Unit of Measure', 'Line No'],
        }
    }
    const getWorkOrderItemDetails = (workOrderId) => {
        let keyObjects = {
            'itemText': '',
            'locationId': '',
            'itemId': '',
            'quantity': 0,
            'usedInBuild': 0,
            'commited': 0,
            'backOrdered': 0,
            //'componentYield': 0,
           // 'bomQuantity': 0,
            'units': '',
            'presentOnWoLine': ''
        }
        try {
            const workOrderRecord = record.load({
                type: record.Type.WORK_ORDER,
                id: workOrderId,
                isDynamic: false
            })
            const itemLineCount = workOrderRecord.getLineCount({
                sublistId: 'item'
            })
            let itemsDataArr = [];
            if (itemLineCount > 0) {
                for (let lineIndex = 0; lineIndex < itemLineCount; lineIndex++) {
                    let res = JSON.parse(JSON.stringify(keyObjects));
                    res.locationId = workOrderRecord.getValue({
                        fieldId: 'location',
                    })
                    res.itemText = workOrderRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: lineIndex
                    })
                    res.itemId = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: lineIndex
                    })
                    res.quantity = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: lineIndex
                    })
                    res.usedInBuild = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantityfulfilled',
                        line: lineIndex
                    })
                    res.commited = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantitycommitted',
                        line: lineIndex
                    })
                    res.backOrdered = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantitybackordered',
                        line: lineIndex
                    })
                    res.componentYield = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'componentyield',
                        line: lineIndex
                    })
                    res.bomQuantity = workOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'bomquantity',
                        line: lineIndex
                    })
                    res.units = workOrderRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: lineIndex
                    })
                    res.presentOnWoLine = workOrderRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'line',
                        line: lineIndex
                    })
                    itemsDataArr.push(res);
                }
                return { 'hasContent': true, 'data': itemsDataArr, 'keys': keyObjects }
            }
            return { 'hasContent': false, 'errorMessage': "No Item Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            return { 'hasContent': false, 'errorMessage': error.message, 'data': [], 'keys': keyObjects }
        }
    }
    return {
        onRequest: onRequest
    }
});
