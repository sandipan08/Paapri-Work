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
_get                                                        Main Function                                                             Subhankar Nath
verifyEmployeeWithBadgeId                                   Verifies employee's badgeid and returns employee                
                                                            details if varified                                                       Subhankar Nath
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/runtime'], function (search, record, runtime) {

    function _get(context) {
        let employeeDetailsObj = verifyEmployeeWithBadgeId(context.badgeId);
        if (employeeDetailsObj.isSuccess) {
            createTransactionRecord(employeeDetailsObj.data)
            let getWorkCenter = getWorkCenters();
            let openWorkOrderSearchCount = getOpenWorkOrderSearchCount(employeeDetailsObj.data);
            employeeDetailsObj.data['openWorkOrderSearchCount'] = openWorkOrderSearchCount;
            employeeDetailsObj.data['workCenters'] = getWorkCenter;
        }
        return employeeDetailsObj;
    }

    const verifyEmployeeWithBadgeId = (badgeId) => {
        var getEmployeeSearch = search.create({
            type: "employee",
            filters:
                [
                    ["custentity_pct_cit_badge_id", "is", badgeId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "entityid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "custentity_pct_pmc_emp_work_center", label: "PMC Work Center" }),
                    search.createColumn({ name: "location", label: "Location" })
                ]
        });
        const employeeCount = getEmployeeSearch.runPaged().count;
        log.debug("PCT-PMC", "Employee Result Count : " + employeeCount);
        if (employeeCount > 0) {
            let employeeData = {}
            getEmployeeSearch.run().each(function (result) {
                let employeeName = result.getValue({ name: "entityid" });
                let employeeId = result.id;
                employeeData["internalId"] = employeeId;
                employeeData["employeeName"] = employeeName;
                employeeData['pmcWorkCenterName'] = result.getText({ name: "custentity_pct_pmc_emp_work_center" });
                employeeData['pmcWorkCenter'] = result.getValue({ name: "custentity_pct_pmc_emp_work_center" });
                employeeData['locationName'] = result.getText({ name: "location" })
                employeeData['location'] = result.getValue({ name: "location" });
                employeeData['userRole'] = runtime.getCurrentUser().role;
                return true;
            });
            return { 'isSuccess': true, 'data': employeeData }
        }
        return { 'isSuccess': false, 'errorMessage': 'Badgeid Not Found' }
    }

    const createTransactionRecord = (dataObj) => {
        record.create({
            type: 'customrecord_pct_pmc_tran_k_fab',
            isDynamic: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_emp',
            value: dataObj.internalId,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_op_status',
            value: '6', // 6 = Login
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_wo_center',
            value: dataObj.pmcWorkCenter,
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'custrecord_pct_kfab_res_start_date',
            value: new Date(),
            ignoreFieldChange: false
        }).setValue({
            fieldId: 'name',
            value: 'Login',
            ignoreFieldChange: false
        }).save()
    }

    const getOpenWorkOrderSearchCount = (dataObj) => {
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

    const getWorkCenters = () => {

        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
                [
                    ["ismanufacturingworkcenter", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "groupname",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var searchResultCount = entitygroupSearchObj.runPaged().count;
        log.debug("entitygroupSearchObj result count", searchResultCount);
        let workCenterArr = [];
        entitygroupSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            let res = {};
            res['name'] = result.getValue({ name: "groupname" })
            res['internalId'] = result.id;
            workCenterArr.push(res);
            return true;
        });
        return workCenterArr;
    }

    return {
        get: _get
    }
});