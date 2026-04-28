/**
 * Module Description
 *
 * Version    Date            		Author           Remarks
 * 1.00       06 October 2020    	Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 
/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_TimeTracking_Entry
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			TimeTracking Entry Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             	Purpose:                                                                               	Developer:
 createAndSaveTimeTracking		Main function which retrieves data from URL and creates TimeTracking 					Anirban Gupta
 								record accordingly.

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/record', 'N/https', 'N/log'],
	function (record, https, log) 
	{
		function createAndSaveTimeTracking(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const requestType = datain.requestType;
			const returnData = {};

			if(requestType == 'save')
			{
				const employeeInternalID = datain.employeeInternalID;
				const projectInternalID = datain.projectInternalID;
				log.audit({
					title: 'Customer Details',
					details: 'Customer Internal ID : ' + projectInternalID
				});
				var duration = datain.duration;

				if(duration.indexOf(':') != -1)
				{
					var hrs = Number(duration.split(':')[0]);
					var min = Number(duration.split(':')[1]);
					duration = hrs + Number((min / 60).toFixed(2));
					log.audit({
						title: 'Duration',
						details: 'Duration : ' + duration
					});
				}

				const location = datain.location;
				const task = datain.task;
				log.audit({
					title: 'Task',
					details: 'Task Internal ID : ' + task
				});
				const memo = datain.memo;

				var objRecord = record.create({
					type: record.Type.TIME_BILL, 
					isDynamic: true
				});

				objRecord.setValue({
					fieldId: 'employee',
					value: employeeInternalID
				});
				objRecord.setValue({
					fieldId: 'customer',
					value: projectInternalID
				});			
				objRecord.setText({
					fieldId: 'hours',
					text: duration
				});
				objRecord.setValue({
					fieldId: 'location',
					value: location
				});
				objRecord.setValue({
					fieldId: 'casetaskevent',
					value: task
				});
				objRecord.setValue({
					fieldId: 'memo',
					value: memo
				});
				objRecord.setText({
					fieldId: 'isbillable',
					text: false
				});

				var recordId = objRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});

				log.audit({
					title: 'Record Details',
					details: 'Internal ID of the saved record: ' + recordId
				});

				returnData['message'] = "Successfully Saved Time Tracking Record";
				returnData['internalID'] = recordId;
			}
			else if(requestType == 'post')
			{
				const internalID = datain.recordInternalID;

				var postRecord = record.load({
					type: record.Type.TIME_BILL,
					id: internalID,
					isDynamic: true,
				});

				postRecord.setValue({
					fieldId: 'posted',
					value: true
				});

				var recordId = postRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});

				returnData['message'] = "Successfully Posted Time Tracking Record";
			}			
			return returnData;
		}
		return {
			get: createAndSaveTimeTracking
		};
	});