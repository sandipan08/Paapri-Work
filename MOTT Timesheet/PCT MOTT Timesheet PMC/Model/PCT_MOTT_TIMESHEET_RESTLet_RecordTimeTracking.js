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
recordTimeTracking				Main function which retrieves start/stop request from URL and starts recording 			Anirban Gupta
TimeTracking accordingly.

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log)
	{
		function recordTimeTracking(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const returnData = {};
			const employeeInternalID = datain.employeeInternalID;
			const projectInternalID = datain.projectInternalID;
			const requestType = datain.requestType;
			const internalID = datain.recordInternalID;
			const status = "Open";

			var today = new Date();
			var currentDateAndTime = today.toString();

			if(requestType === 'Start')
			{
				var startTimeTrackingRecord = record.create({
					type: 'customrecord_pct_mott_time_entry',
					isDynamic: true
				});

				startTimeTrackingRecord.setValue({
					fieldId: 'custrecord_pct_mott_timesheet_employee',
					value: employeeInternalID
				});
				startTimeTrackingRecord.setValue({
					fieldId: 'custrecord_pct_mott_timesheet_jobname',
					value: projectInternalID
				});
				startTimeTrackingRecord.setValue({
					fieldId: 'custrecord_pct_mott_timesheet_start_time',
					value: currentDateAndTime
				});
				startTimeTrackingRecord.setText({
					fieldId: 'custrecord_pct_mott_timesheet_status',
					text: 'Open'
				});

				var recordId = startTimeTrackingRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});

				log.audit({
					title: 'Date',
					details: 'Date: ' + currentDateAndTime
				});

				log.audit({
					title: 'Record Details',
					details: 'Internal ID of the saved record: ' + recordId
				});

				returnData['message'] = "Time Tracking Successfully Started";
				returnData['startTime'] = currentDateAndTime;
				returnData['internalID'] = recordId;
			}
			else if(requestType === 'Stop')
			{
				var stopTimeTrackingRecord = record.load({
					type: 'customrecord_pct_mott_time_entry',
					id: internalID,
					isDynamic: true,
				});

				var currentStatus = stopTimeTrackingRecord.getText({
					fieldId: 'custrecord_pct_mott_timesheet_status'
				});

				if(currentStatus == 'Paused')
				{
					resumeRecording(currentDateAndTime, internalID);
					stopTimeTrackingRecord = record.load({
						type: 'customrecord_pct_mott_time_entry',
						id: internalID,
						isDynamic: true,
					});
				}

				var totalBreakDuration = stopTimeTrackingRecord.getValue({
					fieldId: 'custrecord_pct_mott_timesheet_breakspan'
				});

				stopTimeTrackingRecord.setValue({
					fieldId: 'custrecord_pct_mott_timesheet_end_time',
					value: currentDateAndTime
				});
				var startTime = stopTimeTrackingRecord.getValue({
					fieldId: 'custrecord_pct_mott_timesheet_start_time'
				});

				currentDateAndTime = Date.parse(currentDateAndTime);
				startTime = Date.parse(startTime);  
				var minutes = parseInt(Number(currentDateAndTime - startTime) / 60000);

				/* Subtracting total breakspan from total duration */
				minutes = minutes - parseInt(totalBreakDuration);
				if(minutes < 0)
				{
					minutes = 0;
				}
				returnData['durationInMinutes'] = minutes;

				var hours = parseInt(minutes / 60).toString(); 
				minutes = minutes % 60;

				if(minutes < 10)
				{
					minutes = '0' + minutes.toString();
				}
				else
				{
					minutes.toString();
				}

				stopTimeTrackingRecord.setText({
					fieldId: 'custrecord_pct_mott_timesheet_status',
					text: 'Closed'
				});

				var recordId = stopTimeTrackingRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});

				returnData['message'] = "Time Tracking Successfully Stopped";
				returnData['duration'] = hours + ':' + minutes;

				log.audit({
					title: 'Duration',
					details: 'Work Duration: ' + hours + ':' + minutes
				});
			}
			else if(requestType === 'Pause')
			{
				var pauseTimeTrackingRecord = record.load({
					type: 'customrecord_pct_mott_time_entry',
					id: internalID,
					isDynamic: true,
				});

				var startTime = pauseTimeTrackingRecord.getValue({
					fieldId: 'custrecord_pct_mott_timesheet_start_time'
				});

				pauseTimeTrackingRecord.setValue({
					fieldId: 'custrecord_pct_mott_timesheet_breakstart',
					value: currentDateAndTime
				});

				pauseTimeTrackingRecord.setText({
					fieldId: 'custrecord_pct_mott_timesheet_status',
					text: 'Paused'
				});

				var recordId = pauseTimeTrackingRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});

				returnData['startTime'] = startTime;
				returnData['breakStartTime'] = currentDateAndTime;
				returnData['message'] = "Time Tracking Successfully Paused";
			}
			else if(requestType === 'Resume')
			{
				var resumeReturnedData = resumeRecording(currentDateAndTime, internalID);
				returnData['startTime'] = resumeReturnedData.startTime;
				returnData['totalBreakDuration'] = resumeReturnedData.totalBreakDuration;
				returnData['message'] = "Time Tracking Successfully Resumed";
			}
			return returnData;
		}
		function resumeRecording(currentDateAndTime, internalID)
		{
			const resumeReturnData = {};

			var resumeTimeTrackingRecord = record.load({
				type: 'customrecord_pct_mott_time_entry',
				id: internalID,
				isDynamic: true,
			});

			var startTime = resumeTimeTrackingRecord.getValue({
				fieldId: 'custrecord_pct_mott_timesheet_start_time'
			});

			var previousBreakDuration = resumeTimeTrackingRecord.getValue({
				fieldId: 'custrecord_pct_mott_timesheet_breakspan'
			});

			if(previousBreakDuration == '')
			{
				previousBreakDuration = 0;
			}

			var pauseStartTime = resumeTimeTrackingRecord.getValue({
				fieldId: 'custrecord_pct_mott_timesheet_breakstart'
			});

			var pauseEndTime = resumeTimeTrackingRecord.getValue({
				fieldId: 'custrecord_pct_mott_timesheet_breakstart'
			});

			resumeTimeTrackingRecord.setValue({
				fieldId: 'custrecord_pct_mott_timesheet_breakend',
				value: currentDateAndTime
			});

			currentDateAndTime = Date.parse(currentDateAndTime);
			pauseStartTime = Date.parse(pauseStartTime);  
			var minutes = parseInt(Number(currentDateAndTime - pauseStartTime) / 60000);

			var totalBreakDuration = minutes + parseInt(previousBreakDuration);

			resumeTimeTrackingRecord.setValue({
				fieldId: 'custrecord_pct_mott_timesheet_breakspan',
				value: totalBreakDuration
			});				

			resumeTimeTrackingRecord.setText({
				fieldId: 'custrecord_pct_mott_timesheet_status',
				text: 'Open'
			});

			var recordId = resumeTimeTrackingRecord.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});

			log.audit({
				title: 'Break Duration',
				details: 'Total Break Duration: ' + totalBreakDuration
			});

			resumeReturnData['startTime'] = startTime;
			resumeReturnData['totalBreakDuration'] = totalBreakDuration;

			return resumeReturnData;
		}
		return {
			get: recordTimeTracking
		};
	});