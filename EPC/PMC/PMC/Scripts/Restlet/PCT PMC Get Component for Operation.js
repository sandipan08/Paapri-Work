/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/log', 'N/record', 'N/search'], function (log, record, search) {

    function _get(context) {

    }

    function _post(context) {
        log.debug({
            title: 'PCT-PMC',
            details: `Context = ${JSON.stringify(context)}`
        })

        return getRoutingComponentsByOperation(parseInt(context.operationTaskId), parseInt(context.workOrderId))
    }

    const getRoutingComponentsByOperation = (operationSequence, workOrderId) => {
        let issueObj = {
            'workOrderId': workOrderId,
            'issueData': {}
        }
        let PowayCALocation = 1;
        let GreenvilleSCLocation = 2;
        var workorderSearchObj = search.create({
            type: "workorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }, { "name": "includeperiodendtransactions", "value": "F" }],
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", workOrderId],
                    "AND",
                    ["operationdisplaytext", "equalto", operationSequence],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["quantity", "greaterthan", "0"],
                    "AND",
                    ["formulanumeric: CASE WHEN ({quantity} - {quantityshiprecv}) > 0 THEN 1 ELSE 0 END", "equalto", "1"],
                    "AND",
                    ["item.custitem_pct_epc_asset_required", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({
                        name: "internalid",
                        join: "item",
                        label: "Internal ID"
                    }),
                    search.createColumn({ name: "line", label: "Line ID" }),
                    search.createColumn({
                        name: "custitem_pct_epc_asset_required",
                        join: "item",
                        label: "Asset # Required"
                    }),
                    search.createColumn({ name: "location", label: "Location" }),
                    search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Received" }),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "{quantity} - {quantityshiprecv}",
                        label: "Formula (Numeric)"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            workorderSearchObj.run().each(function (result) {
                let responseObj = {};
                let assetRequired = result.getValue({
                    name: "custitem_pct_epc_asset_required",
                    join: "item",
                    label: "Asset # Required"
                })
                responseObj['issueQty'] = result.getValue({ name: "quantity", label: "Quantity" })
                responseObj['componentItem'] = result.getValue({
                    name: "internalid",
                    join: "item",
                    label: "Internal ID"
                })
                responseObj['assetRequired'] = assetRequired
                responseObj['location'] = result.getValue({ name: "location", label: "Location" })
                if (result.getValue({ name: "location", label: "Location" }) == PowayCALocation) {
                    responseObj['modalData'] = [{
                        lotNumber: "",
                        binNumber: 2,
                        quantity: result.getValue({ name: "quantity", label: "Quantity" })
                    }]
                }
                else if (result.getValue({ name: "location", label: "Location" }) == GreenvilleSCLocation) {
                    responseObj['modalData'] = [{
                        lotNumber: "",
                        binNumber: 702,
                        quantity: result.getValue({ name: "quantity", label: "Quantity" })
                    }]
                }
                issueObj['issueData'][`${result.getValue({
                    name: "internalid",
                    join: "item",
                    label: "Internal ID"
                })}-${parseInt(result.getValue({ name: "line", label: "Line ID" }))}`] = responseObj


                return true;
            });
            log.debug('Components with Operation Sequences', issueObj);
            return createWorkOrderIssue(workOrderId, issueObj['issueData'])
        }
        else {
            return { 'isSuccess': false, 'errorMessage': "A Work Order Issue has already been created for the components associated with this operation" }
        }
    }

   
    const binOnHandQtySearch = (itemId, binNumber, quantity) => {
        var inventoryitemSearchObj = search.create({
            type: "inventoryitem",
            filters:
                [

                    ["internalidnumber", "equalto", "18"],
                    "AND",
                    ["binonhand.quantityavailable", "greaterthan", "0"],
                    "AND",
                    ["binonhand.binnumber", "anyof", "15"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "quantityavailable",
                        join: "binOnHand",
                        label: "Available"
                    }),
                    search.createColumn({
                        name: "binnumber",
                        join: "binOnHand",
                        label: "Bin Number"
                    }),
                    search.createColumn({
                        name: "location",
                        join: "binOnHand",
                        label: "Location"
                    }),
                    search.createColumn({
                        name: "quantityonhand",
                        join: "binOnHand",
                        label: "On Hand"
                    })
                ]
        });
        var searchResultCount = inventoryitemSearchObj.runPaged().count;
        log.debug("inventoryitemSearchObj result count", searchResultCount);
        return searchResultCount ? true : false;
        // inventoryitemSearchObj.run().each(function (result) {
        //     // .run().each has a limit of 4,000 results
        //     return true;
        // });


    }
    const createWorkOrderIssue = (workOrderId, issueData) => {
        log.debug("PCT", "In Create Issue Function")
        try {
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
                // log.debug({
                //     title: 'PCT-PMC',
                //     details: `Line = ${lineNo}`
                // })
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
                            // log.debug({
                            //     title: 'PCT-PMC',
                            //     details: `Data = ${JSON.stringify(data)}`
                            // })

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

                            //   inventoryDetail.setSublistText({
                            //     sublistId: 'inventoryassignment',
                            //     fieldId: 'binnumber',
                            //     line: index,
                            //     text: "MFG"//data.binNumber
                            // })
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
            log.debug("PCT", "Created Issue No : " + woIssueId)
            let woIssueDocumentNumber = search.lookupFields({
                type: search.Type.WORK_ORDER_ISSUE,
                id: woIssueId,
                columns: 'tranid'
            }).tranid

            return { 'isSuccess': true, 'data': { 'id': woIssueId, 'name': woIssueDocumentNumber } }
        }
        catch (error) {
            log.debug({
                title: 'PCT-PMC-Catch',
                details: error
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }


    }

    return {
        get: _get,
        post: _post,

    }
});
