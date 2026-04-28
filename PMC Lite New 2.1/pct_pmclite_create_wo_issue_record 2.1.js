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
 define(['N/record', 'N/search','N/file'], function (record, search,file) {
    var _response;
    var _request;
    var result;
    function onRequest(context) {
        _request = context.request;
        _response = context.response;

        if (_request.method == 'POST') {

            log.debug({
                title: 'context',
                details: _request
            })
            let data = JSON.parse(_request.body)
file.create({
    name: 'context.json',
    fileType: file.Type.JSON,
    contents: JSON.stringify(data),
    folder: 1490
}).save()

            // Getting Params [GET REQUEST]
            var workOrderId = JSON.parse(data).workOrderId;
            var issueData = JSON.parse(data).issueData;
            try {
                log.audit({
                    title: 'workOrderId =.+'+JSON.parse(data).workOrderId
                });
                log.debug({
                    title: 'PCT-PMC',
                    details: `Context = ${JSON.stringify(context)}`
                })
                //let workOrderId = context.workOrderId;
//let manufacturingOperationTaskId = context.operationTaskId;
               // let issueData = context.issueData;

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
                    let lineNo = workOrderIssueRecord.getSublistValue({
                        sublistId: 'component',
                        fieldId: 'linenumber',
                        line: lineIndex
                    });
                    log.debug({
                        title: 'PCT-PMC',
                        details: `Line = ${lineNo}`
                    })
                    let primaryKey = `${component}-${lineNo}`

                    if (primaryKey in issueData) {
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
                                    value: parseFloat(data.quantity)
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
                let woIssueDocumentNumber = search.lookupFields({
                    type: search.Type.WORK_ORDER_ISSUE,
                    id: woIssueId,
                    columns: 'tranid'
                }).tranid
                result = { 'isSuccess': true, 'data': { 'id': woIssueId, 'name': woIssueDocumentNumber } }
            }
            catch (error) {
                result = { 'isSuccess': false, 'errorMessage': error.message }
            }
            _response.write(JSON.stringify(result))

        }
    }
    // ----------------------------- Item Search Function Start ------------------------------
    function itemSearch(itemInternalID, location) {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemInternalID],
                    "AND",
                    ["inventorylocation", "anyof", location]
                ],
            columns:
                [
                    search.createColumn({ name: "usebins", label: "Use Bins" }),
                    search.createColumn({ name: "isserialitem", label: "Is Serialized Item" }),
                    search.createColumn({ name: "islotitem", label: "Is Lot Numbered Item" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        log.debug("Item Count : " + itemCount);
        if (itemCount > 0) {
            let itemObj = {};
            itemSearchObj.run().each(function (result) {
                itemObj['lotNumber'] = false
                let lotNumber = result.getValue({
                    name: "islotitem",
                });
                let serialNumber = result.getValue({
                    name: "isserialitem",
                });
                if(lotNumber ==  true || serialNumber == true){
                    itemObj['lotNumber'] = true   
                }
                // itemObj['lotNumber'] = result.getValue({
                //     name: "islotitem",
                // });
                // itemObj['serialNumber'] = result.getValue({
                //     name: "isserialitem",
                // });
                itemObj['binNumber'] = result.getValue({
                    name: "usebins",
                });
                itemObj['internalId'] = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': itemObj }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
    }
    // ----------------------------- Item Search Function End ----------------------------------
    return {
        onRequest: onRequest
    }
});
