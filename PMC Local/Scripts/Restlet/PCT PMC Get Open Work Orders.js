/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00        28 June 2022          Subhankar Nath
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
Script Name:        PCT PMC Badgeid verification and Get Open WOrk Orders 
Developer:          Subhankar Nath  
Development Head:   Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This restlet will verify employee based on badgeid and get open work orders.
© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_get                                                            Main Function                                                             Subhankar Nath
getOpenWorkOrders                                               Fetches open work oders based on 
                                                                employee's work center and locaiton                                       Subhankar Nath
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/
define(['N/search'], function (search) {

    function _get(context) {
        const dataFromRestlet = context.data;
        log.debug({
            title: 'PCT-PMC',
            details: `Restlet Data = ${JSON.stringify(dataFromRestlet)}`
        })
        const openWorkOrderObj = getOpenWorkOrders(dataFromRestlet)
        return openWorkOrderObj;
    }

    const getOpenWorkOrders = (dataObj) => {
        try {
            var manufacturingoperationtaskSearchObj = search.create({
                type: "manufacturingoperationtask",
                filters:
                    [
                        ["status", "anyof", "PROGRESS", "NOTSTART"],
                        "AND",
                        ["workorder.status", "anyof", "WorkOrd:B", "WorkOrd:D"],
                        "AND",
                        ["manufacturingworkcenter", "anyof", dataObj.workCenter],
                        "AND",
                        ["workorder.location", "anyof", dataObj.location]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "workorder",
                            summary: "GROUP",
                            label: "Work Order"
                        }),
                        search.createColumn({
                            name: "item",
                            join: "workOrder",
                            summary: "GROUP",
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "location",
                            join: "workOrder",
                            summary: "GROUP",
                            label: "Location"
                        }),
                        search.createColumn({
                            name: "sequence",
                            summary: "GROUP",
                            label: "Operation Sequence"
                        }),
                        search.createColumn({
                            name: "manufacturingworkcenter",
                            summary: "GROUP",
                            label: "Manufacturing Work Center"
                        }),
                        search.createColumn({
                            name: "startdate",
                            summary: "GROUP",
                            label: "Start Date"
                        }),
                        search.createColumn({
                            name: "enddate",
                            summary: "GROUP",
                            label: "End Date"
                        }),
                        search.createColumn({
                            name: "inputquantity",
                            summary: "GROUP",
                            label: "Input Quantity"
                        }),
                        search.createColumn({
                            name: "completedquantity",
                            summary: "GROUP",
                            label: "Completed Quantity"
                        }),
                        search.createColumn({
                            name: "status",
                            summary: "GROUP",
                            label: "Status"
                        }),
                        search.createColumn({
                            name: "runrate",
                            summary: "GROUP",
                            label: "Run Rate (Min/Unit)"
                        }),
                        search.createColumn({
                            name: "predecessor",
                            summary: "GROUP",
                            label: "Predecessor"
                        }),
                        search.createColumn({
                            name: "completedquantity",
                            join: "predecessor",
                            summary: "GROUP",
                            label: "Completed Quantity"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_KFAB_MAN_OP_TASK",
                            summary: "MAX",
                            label: "Internal ID"
                        })
                    ]
            });
            var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
            log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
            let searchResult = manufacturingoperationtaskSearchObj.run().getRange({ start: dataObj.start, end: dataObj.end })
            let dataArr = [];
            for (let searchIndex = 0; searchIndex < searchResult.length; searchIndex++) {
                let resData = {};
                resData['workOrderText'] = searchResult[searchIndex].getText({
                    name: "workorder",
                    summary: "GROUP"
                })
                resData['workOrderId'] = searchResult[searchIndex].getValue({
                    name: "workorder",
                    summary: "GROUP"
                })
                resData['itemText'] = searchResult[searchIndex].getText({
                    name: "item",
                    join: "workOrder",
                    summary: "GROUP"
                })
                resData['itemId'] = searchResult[searchIndex].getValue({
                    name: "item",
                    join: "workOrder",
                    summary: "GROUP"
                })
                resData['locationText'] = searchResult[searchIndex].getText({
                    name: "location",
                    join: "workOrder",
                    summary: "GROUP"
                })
                resData['locationValue'] = searchResult[searchIndex].getValue({
                    name: "location",
                    join: "workOrder",
                    summary: "GROUP"
                })
                resData['operationSequence'] = searchResult[searchIndex].getValue({
                    name: "sequence",
                    summary: "GROUP"
                })
                resData['workCenterText'] = searchResult[searchIndex].getText({
                    name: "manufacturingworkcenter",
                    summary: "GROUP"
                })
                resData['workCenterValue'] = searchResult[searchIndex].getValue({
                    name: "manufacturingworkcenter",
                    summary: "GROUP"
                })
                resData['startDate'] = searchResult[searchIndex].getValue({
                    name: "startdate",
                    summary: "GROUP"
                })
                resData['endDate'] = searchResult[searchIndex].getValue({
                    name: "enddate",
                    summary: "GROUP"
                })
                resData['inputQuantity'] = searchResult[searchIndex].getValue({
                    name: "inputquantity",
                    summary: "GROUP"
                })
                resData['completedQuantity'] = searchResult[searchIndex].getValue({
                    name: "completedquantity",
                    summary: "GROUP"
                })
                resData['status'] = searchResult[searchIndex].getValue({
                    name: "status",
                    summary: "GROUP"
                })
                resData['runRate'] = searchResult[searchIndex].getValue({
                    name: "runrate",
                    summary: "GROUP"
                })
                resData['predecessorText'] = searchResult[searchIndex].getText({
                    name: "predecessor",
                    summary: "GROUP"
                })
                resData['predecessorValue'] = searchResult[searchIndex].getValue({
                    name: "predecessor",
                    summary: "GROUP"
                })
                resData['predecessorCompletedQuantity'] = searchResult[searchIndex].getValue({
                    name: "completedquantity",
                    join: "predecessor",
                    summary: "GROUP"
                })
                resData['pmcTransactionId'] = searchResult[searchIndex].getValue({
                    name: "internalid",
                    join: "CUSTRECORD_PCT_KFAB_MAN_OP_TASK",
                    summary: "MAX"
                })
                if (resData.pmcTransactionId) {
                    let pmcTransactionData = search.lookupFields({
                        type: 'customrecord_pct_pmc_tran_k_fab',
                        id: resData.pmcTransactionId,
                        columns: ['custrecord_pct_kfab_emp', 'custrecord_pct_kfab_op_status']
                    })
                    log.debug({
                        title: 'PCT-PMC',
                        details: `PMC Transaction Data = ${JSON.stringify(pmcTransactionData)}`
                    })
                }
                dataArr.push(resData);
            }
            return { 'isSuccess': true, 'data': dataArr }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': error.errorMessage }
        }
    }

    return {
        get: _get
    }
});
