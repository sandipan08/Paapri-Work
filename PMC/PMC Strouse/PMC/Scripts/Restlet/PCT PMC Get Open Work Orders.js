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
        const dataFromRestlet = JSON.parse(context.data);
        const openWorkOrderObj = getOpenWorkOrders(dataFromRestlet)
        // log.debug(`PCT-PMC`, `Open Work Order Obj : ${JSON.stringify(openWorkOrderObj)}`)
        let columnsArr = [];

        const keysArr = openWorkOrderObj.keys;
        // log.debug(`PCT-PMC`, `keysArr : ${JSON.stringify(keysArr)} , Type : ${typeof keysArr}`)
        const titleArr = ['Work Order', 'Work Order Id', 'Item', 'Item Id', 'Location', 'Location Id', 'Operation Id', 'Operation Sequence', 'Work Center', 'Work Center Id', 'Start Date', 'End Date', 'Input Quantity', 'Completed Quantity', 'Status', 'Run Rate', 'Predecessor', 'Predecessor Id', 'Predecessor Completed Quantity', 'Pmc Transaction Id', 'Result Start Time', 'Downtime Start Time', 'PMC Transaction Status', 'PMC Transaction Status Id', 'PMC Transaction Name', 'Downtime End Time', 'Downtime Total Duration']
        Object.keys(keysArr).forEach((element, index) => {
            let obj = {}
            obj['data'] = element;
            obj['title'] = titleArr[index];
            columnsArr.push(obj);
        });

        openWorkOrderObj['columnsArr'] = columnsArr;
        return openWorkOrderObj;
    }

    function _post(context) {
        let openWorkOrderSearchCount = getOpenWorkOrderSearchCount({
            'pmcWorkCenter': context.workCenter,
            'location': context.location
        })
        return openWorkOrderSearchCount
    }

    const getOpenWorkOrders = (dataObj) => {

        let keyObjects = {
            'workOrderText': '',
            'workOrderId': 0,
            'itemText': '',
            'itemId': 0,
            'locationText': '',
            'locationValue': 0,
            'manufacturingOperationTaskId': 0,
            'operationSequence': 0,
            'workCenterText': '',
            'workCenterId': 0,
            'operationStartDate': '',
            'operationEndDate': '',
            'inputQuantity': 0,
            'completedQuantity': 0,
            'status': '',
            'runRate': 0,
            'predecessorText': '',
            'predecessorId': 0,
            'predecessorCompletedQuantity': 0,
            'pmcTransactionId': 0,
            'pmcTransactionResultStartTime': '',
            'pmcTransactionDowntimeStartTime': '',
            'pmcTransactionStatus': '',
            'pmcTransactionStatusId': 0,
            'pmcTransactionName': '',
            'pmcTransactionDowntimeEndTime': '',
            'pmcTransactionDowntimeTotalDuration': 0



        }

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
                            sort: search.Sort.ASC,
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
            if (searchResult.length) {
                for (let searchIndex = 0; searchIndex < searchResult.length; searchIndex++) {
                    let resData = JSON.parse(JSON.stringify(keyObjects))
                    resData.workOrderText = searchResult[searchIndex].getText({
                        name: "workorder",
                        summary: "GROUP"
                    })
                    resData.workOrderId = searchResult[searchIndex].getValue({
                        name: "workorder",
                        summary: "GROUP"
                    })
                    resData.itemText = searchResult[searchIndex].getText({
                        name: "item",
                        join: "workOrder",
                        summary: "GROUP"
                    })
                    resData.itemId = searchResult[searchIndex].getValue({
                        name: "item",
                        join: "workOrder",
                        summary: "GROUP"
                    })
                    resData.locationText = searchResult[searchIndex].getText({
                        name: "location",
                        join: "workOrder",
                        summary: "GROUP"
                    })
                    resData.locationValue = searchResult[searchIndex].getValue({
                        name: "location",
                        join: "workOrder",
                        summary: "GROUP"
                    })
                    resData.manufacturingOperationTaskId = searchResult[searchIndex].getValue({
                        name: "internalid",
                        summary: "GROUP"
                    })
                    resData.operationSequence = searchResult[searchIndex].getValue({
                        name: "sequence",
                        summary: "GROUP"
                    })
                    resData.workCenterText = searchResult[searchIndex].getText({
                        name: "manufacturingworkcenter",
                        summary: "GROUP"
                    })
                    resData.workCenterId = searchResult[searchIndex].getValue({
                        name: "manufacturingworkcenter",
                        summary: "GROUP"
                    })
                    resData.operationStartDate = searchResult[searchIndex].getValue({
                        name: "startdate",
                        summary: "GROUP"
                    })
                    resData.operationEndDate = searchResult[searchIndex].getValue({
                        name: "enddate",
                        summary: "GROUP"
                    })
                    resData.inputQuantity = searchResult[searchIndex].getValue({
                        name: "inputquantity",
                        summary: "GROUP"
                    })
                    resData.completedQuantity = searchResult[searchIndex].getValue({
                        name: "completedquantity",
                        summary: "GROUP"
                    })
                    resData.status = searchResult[searchIndex].getValue({
                        name: "status",
                        summary: "GROUP"
                    })
                    resData.runRate = searchResult[searchIndex].getValue({
                        name: "runrate",
                        summary: "GROUP"
                    })
                    resData.predecessorText = searchResult[searchIndex].getText({
                        name: "predecessor",
                        summary: "GROUP"
                    })
                    resData.predecessorId = searchResult[searchIndex].getValue({
                        name: "predecessor",
                        summary: "GROUP"
                    })
                    let predecessorCompletedQuantity = searchResult[searchIndex].getValue({
                        name: "completedquantity",
                        join: "predecessor",
                        summary: "GROUP"
                    });

                    resData.predecessorCompletedQuantity = predecessorCompletedQuantity ? predecessorCompletedQuantity : '0';
                    resData.pmcTransactionId = searchResult[searchIndex].getValue({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_KFAB_MAN_OP_TASK",
                        summary: "MAX"
                    })
                    if (resData.pmcTransactionId) {
                        let pmcTransactionData = search.lookupFields({
                            type: 'customrecord_pct_pmc_tran_k_fab',
                            id: resData.pmcTransactionId,
                            columns: ['custrecord_pct_kfab_emp', 'custrecord_pct_kfab_op_status', 'custrecord_pct_kfab_res_start_date', 'custrecord_pct_pmc_dwn_start_time', 'name', 'custrecord_pct_pmc_dwn_end_time', 'custrecord_pct_pmc_dwn_duration']
                        })
                        log.debug({
                            title: 'PCT-PMC',
                            details: `PMC Transaction Data = ${JSON.stringify(pmcTransactionData)}`
                        })
                        resData.pmcTransactionStatus = pmcTransactionData.custrecord_pct_kfab_op_status[0].text;
                        resData.pmcTransactionStatusId = pmcTransactionData.custrecord_pct_kfab_op_status[0].value;
                        resData.pmcTransactionResultStartTime = pmcTransactionData.custrecord_pct_kfab_res_start_date;
                        resData.pmcTransactionDowntimeStartTime = pmcTransactionData.custrecord_pct_pmc_dwn_start_time;
                        resData.pmcTransactionDowntimeEndTime = pmcTransactionData.custrecord_pct_pmc_dwn_end_time;
                        resData.pmcTransactionDowntimeTotalDuration = pmcTransactionData.custrecord_pct_pmc_dwn_duration;
                        resData.pmcTransactionName = pmcTransactionData.name;
                    }
                    dataArr.push(resData);
                }
                return { 'isSuccess': true, 'data': dataArr, 'keys': keyObjects }
            }
            return { 'isSuccess': false, 'errorMessage': "No Work Order Found", 'data': [], 'keys': keyObjects }
        }
        catch (error) {
            return { 'isSuccess': false, 'errorMessage': error.message, 'data': [], 'keys': keyObjects }
        }
    }

    const getOpenWorkOrderSearchCount = (dataObj) => {
        log.debug({
            title: 'PCT-LOG',
            details: JSON.stringify(dataObj)
        })
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["status", "anyof", "PROGRESS", "NOTSTART"],
                    "AND",
                    ["workorder.status", "anyof", "WorkOrd:B", "WorkOrd:D"],
                    "AND",
                    ["manufacturingworkcenter", "anyof", dataObj.pmcWorkCenter],
                    "AND",
                    ["workorder.location", "anyof", dataObj.location]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
        return searchResultCount;
    }
    return {
        get: _get,
        post: _post
    }
});