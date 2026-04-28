/**
* Module Description
*
* Version    Date            		Author           Remarks
* 1.00       15 October 2020    	Anirban Gupta
*
*
* @NApiVersion 2.x
* @NScriptType Restlet
* @NModuleScope SameAccount
*/

/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_TimeTrackingRecord_Search
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Active Time Tracking Record Search Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

Function Name:             			Purpose:                                                                             	Developer:
getActiveRecordData						Main function which processes and returns any active record data for the project		Anirban Gupta
findActiveTimeTrackingRecord			Perform the saved search and export the resultant data			   					 	Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log)
	{
		function getActiveRecordData(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const returnData = {};
			const employeeInternalID = datain.employeeInternalID;
			const projectInternalID = datain.projectInternalID;

			const result = findActiveTimeTrackingRecord(employeeInternalID, projectInternalID);
			const searchResult = result[0];
			const searchResultCount = result[1];

			if(searchResultCount !=0)
			{
				const activeRecordInternalID = searchResult[0].getValue("internalid");
				log.audit({
					title: 'Found Active Record',
					details: 'Internal ID is: ' + activeRecordInternalID	
				});

				returnData['internalID'] = activeRecordInternalID;
				returnData['timeTrackingStartTime'] = searchResult[0].getValue("custrecord_pct_mott_timesheet_start_time");
				returnData['status'] = searchResult[0].getText("custrecord_pct_mott_timesheet_status");
				returnData['totalBreakDuration'] = searchResult[0].getValue("custrecord_pct_mott_timesheet_breakspan");
				returnData['breakStartTime'] = searchResult[0].getValue("custrecord_pct_mott_timesheet_breakstart");
				returnData['message'] = "Found Active Record";
			}
			else
			{
				returnData['message'] = "No Active Records Found";
			}
			return returnData;
		}

		function findActiveTimeTrackingRecord(employeeInternalID, projectInternalID)
		{
			log.audit({
				title: 'Finding Records',
				details: 'Finding Active Project Duration Tracking Record(s) for this project...'
			});

			var customrecord_pct_mott_time_entrySearchObj = search.create({
				type: "customrecord_pct_mott_time_entry",
				filters:
				[
				["custrecord_pct_mott_timesheet_employee","anyof",employeeInternalID], 
				"AND", 
				["custrecord_pct_mott_timesheet_jobname.internalid","anyof",projectInternalID],
				"AND", 
				["custrecord_pct_mott_timesheet_status","anyof","1","3"]
				],
				columns:
				[
				search.createColumn({name: "internalid", label: "Internal ID"}),
				search.createColumn({name: "custrecord_pct_mott_timesheet_start_time", label: "Start Time"}),
				search.createColumn({name: "custrecord_pct_mott_timesheet_status", label: "Status"}),
				search.createColumn({name: "custrecord_pct_mott_timesheet_breakspan", label: "Total Break Duration"}),
				search.createColumn({name: "custrecord_pct_mott_timesheet_breakstart", label: "Break Start Time"})
				]
			});
			var searchResultCount = customrecord_pct_mott_time_entrySearchObj.runPaged().count;

			log.audit({
				title: 'Search Result Size',
				details: 'Search Result Size is: ' + searchResultCount
			});

			var customrecord_pct_mott_time_entrySearchResult = customrecord_pct_mott_time_entrySearchObj.run().getRange({start :0, end: 5});
			return [customrecord_pct_mott_time_entrySearchResult, searchResultCount];
		}
		return {
			get: getActiveRecordData
		};
	});