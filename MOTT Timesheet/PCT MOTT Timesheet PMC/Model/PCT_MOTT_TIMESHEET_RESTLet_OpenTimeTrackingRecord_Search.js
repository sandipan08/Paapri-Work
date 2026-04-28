/**
* Module Description
*
* Version    Date            		Author           Remarks
* 1.00       09 December 2021    	Anirban Gupta
*
*
* @NApiVersion 2.x
* @NScriptType Restlet
* @NModuleScope SameAccount
*/

/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_OpenTimeTrackingRecord_Search
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Active Time Tracking Record Search Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

Function Name:             			Purpose:                                                                             	Developer:
getOpenRecordData					Main function which processes and returns any open record data for the employee 		Anirban Gupta
findOpenTimeTrackingRecord			Perform the saved search and export the resultant data			   					 	Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/log'],
    function (search, log) {
        function getOpenRecordData(datain) {
            log.audit({
                title: 'Request Received.'
            });

            const returnData = {};
            const employeeInternalID = datain.employeeInternalID;

            const result = findOpenTimeTrackingRecord(employeeInternalID);
            const searchResult = result[0];
            const searchResultCount = result[1];

            if (searchResultCount > 0) {
                const openRecordJobName = searchResult[0].getText("custrecord_pct_mott_timesheet_jobname");
                log.audit({
                    title: 'Found Open Record',
                    details: 'Project Name is: ' + openRecordJobName
                });

                returnData['message'] = "Found Open Record";
                returnData['projectName'] = openRecordJobName;
                returnData['status'] = searchResult[0].getText("custrecord_pct_mott_timesheet_status");
            }
            else {
                returnData['message'] = "No Open Records Found";
            }
            return returnData;
        }

        function findOpenTimeTrackingRecord(employeeInternalID) {
            log.audit({
                title: 'Finding Records',
                details: 'Finding Open Project Duration Tracking Record(s)...'
            });

            var customrecord_pct_mott_time_entrySearchObj = search.create({
                type: "customrecord_pct_mott_time_entry",
                filters:
                    [
                        ["custrecord_pct_mott_timesheet_employee", "anyof", employeeInternalID],
                        "AND",
                        ["custrecord_pct_mott_timesheet_status", "anyof", "1"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_mott_timesheet_status", label: "Status" }),
                        search.createColumn({ name: "custrecord_pct_mott_timesheet_jobname", label: "Job Name" })
                    ]
            });
            var searchResultCount = customrecord_pct_mott_time_entrySearchObj.runPaged().count;

            log.audit({
                title: 'Search Result Size',
                details: 'Search Result Size is: ' + searchResultCount
            });

            var customrecord_pct_mott_time_entrySearchResult = customrecord_pct_mott_time_entrySearchObj.run().getRange({ start: 0, end: 5 });
            return [customrecord_pct_mott_time_entrySearchResult, searchResultCount];
        }
        return {
            get: getOpenRecordData
        };
    });