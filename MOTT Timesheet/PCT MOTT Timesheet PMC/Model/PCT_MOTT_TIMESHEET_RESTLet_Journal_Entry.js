/**
 * Module Description
 *
 * Version    Date            		Author           Remarks
 * 1.00       20 October 2020    	Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 
/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_Journal_Entry
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Journal Entry Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             	Purpose:                                                                               	Developer:
 createAndSaveJournalEntry		Main function which retrieves data from URL and creates Journal Entry 					Anirban Gupta
 								record accordingly.

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/record', 'N/https', 'N/log'],
	function (record, https, log) 
	{
		function createAndSaveJournalEntry(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const employee_subsidiaryInternalID = datain.employee_subsidiaryInternalID;
			const projectInternalID = datain.projectInternalID;
			const totalLaborCost = datain.totalLaborCost;
			const timeEntryDepartmentInternalID = datain.timeEntryDepartmentInternalID;
			const timeEntryClassInternalID = datain.timeEntryClassInternalID;
			const timeEntryLocationInternalID = datain.timeEntryLocationInternalID;

			/* ------------ CREATING RECORD ------------ */

			var objRecord = record.create({
				type: record.Type.JOURNAL_ENTRY, 
				isDynamic: false
			});

			/* ------------ BODY FIELDS ------------ */

			objRecord.setValue({
				fieldId: 'subsidiary',
				value: employee_subsidiaryInternalID
			});

			objRecord.setValue({
				fieldId: 'custbody34',
				value: projectInternalID
			});

			objRecord.setValue({
				fieldId: 'approved',
				value: true
			});

			/* ------------ DEBIT ------------ */
			objRecord.insertLine({
				sublistId: 'line',
				line: 0
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'account',
				line: 0,
				value: 650
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'debit',
				line: 0,
				value: totalLaborCost
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'entity',
				line: 0,
				value: projectInternalID
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'department',
				line: 0,
				value: timeEntryDepartmentInternalID
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'class',
				line: 0,
				value: timeEntryClassInternalID
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'location',
				line: 0,
				value: timeEntryLocationInternalID
			});

			/* ------------ CREDIT ------------ */

			objRecord.insertLine({
				sublistId: 'line',
				line: 1,
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'account',
				line: 1,
				value: 393
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'credit',
				line: 1,
				value: totalLaborCost
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'entity',
				line: 1,
				value: projectInternalID
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'department',
				line: 1,
				value: timeEntryDepartmentInternalID
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'class',
				line: 1,
				value: timeEntryClassInternalID
			});
			objRecord.setSublistValue({
				sublistId: 'line',
				fieldId: 'location',
				line: 1,
				value: timeEntryLocationInternalID
			});

			/* ------------ SAVING RECORD ------------ */

			var recordId = objRecord.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});

			log.audit({
				title: 'Record Details',
				details: 'Internal ID of the saved record: ' + recordId
			});

			const returnData = {};
			returnData['message'] = "Successfully Saved Journal Entry";
			returnData['internalID'] = recordId;
			return returnData;
		}
		return {
			get: createAndSaveJournalEntry
		};
	});