/**
 * Module Description
 *
 * Version    Date            		Author           Remarks
 * 1.00       08 October 2020    	Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 
/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_TimeEntry_Search
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Time Entry Search Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             	Purpose:                                                                               	Developer:
 listTimeEntries				Main function which lists and returns saved time data			   						Anirban Gupta
 findTimeEntries				Perform the saved search and export the resultant data			   					   	Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log) 
	{
		function listTimeEntries(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const returnData = {};
			const projectInternalID = datain.projectInternalID;
			const employeeInternalID = datain.employeeInternalID;

			const result = findTImeEntries(projectInternalID, employeeInternalID);
			const searchResult = result[0];
			const searchResultCount = result[1];

			log.audit({
				title: 'Time Entry Search Length',
				details: 'Length: ' + searchResultCount
			});

			
			var tHead = '<tr>\n<th style="text-align: center">DATE</th>\n<th style="text-align: center">INQUIRY/TASK/EVENT</th>\n<th style="text-align: center">DURATION</th><th style="text-align: center">APPROVED</th>\n<th style="text-align: center">STATUS</th>\n<th style="text-align: center">TYPE</th>\n<th style="text-align: center">POSTED</th>\n<th style="text-align: center">CLASS</th>\n<th style="text-align: center">LOCATION</th>\n<th style="text-align: center">LOCATION INTERNAL ID</th>\n<th style="text-align: center">DEPARTMENT</th>\n<th style="text-align: center">DEPARTMENT INTERNAL ID</th>\n<th style="text-align: center">INTERNAL ID</th>\n<th style="text-align: center">CLICK TO POST</th>\n</tr>';

			returnData['thead'] = tHead;

			var tbody = "";
			if(searchResultCount !=0)
			{				
				returnData['message'] = "Time Entries Found";
				
				for(var index = 0; index < searchResultCount; index++)
				{
					tbody += '<tr>\n';					

					var date = searchResult[index].getValue("date");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Date: ' + date
					});
					tbody += '<td style="text-align: center">'+date+'</td>\n'; //0

					var casetaskevent = searchResult[index].getText("casetaskevent");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Item: ' + casetaskevent
					});
					tbody += '<td style="text-align: center">'+casetaskevent+'</td>\n';  //1

					var duration = searchResult[index].getValue("hours");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Duration: ' + duration
					});
					tbody += '<td style="text-align: center">'+duration+'</td>\n'; //2

					var approval = convertTrueToYes(searchResult[index].getValue("supervisorapproval"));
					
					log.audit({
						title: 'Time Tracking Details',
						details: 'Approval: ' + approval
					});
					tbody += '<td style="text-align: center">'+approval+'</td>\n'; //3

					var status = searchResult[index].getValue("status");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Status: ' + status
					});
					tbody += '<td style="text-align: center">'+status+'</td>\n'; //4

					var type = searchResult[index].getText("type");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Type: ' + type
					});
					tbody += '<td style="text-align: center">'+type+'</td>\n'; //5

					var postedStatus = convertTrueToYes(searchResult[index].getValue("posted"));
					log.audit({
						title: 'Time Tracking Details',
						details: 'Posted: ' + postedStatus
					});
					tbody += '<td style="text-align: center">'+postedStatus+'</td>\n'; //6

					var timeEntryClass = searchResult[index].getValue("class");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Class: ' + timeEntryClass
					});
					tbody += '<td style="text-align: center">'+timeEntryClass+'</td>\n'; //7

					var location = searchResult[index].getText("location");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Location: ' + location
					});
					tbody += '<td style="text-align: center">'+location+'</td>\n'; //8

					var locationInternalID = searchResult[index].getValue("location");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Location Internal ID: ' + locationInternalID
					});
					tbody += '<td style="text-align: center">'+locationInternalID+'</td>\n'; //9

					var department = searchResult[index].getText("department");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Department: ' + department
					});
					tbody += '<td style="text-align: center">'+department+'</td>\n'; //10

					var departmentInternalID = searchResult[index].getValue("department");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Department: ' + departmentInternalID
					});
					tbody += '<td style="text-align: center">'+departmentInternalID+'</td>\n'; //11

					var timeTrackingInternalID = searchResult[index].getValue("internalid");
					log.audit({
						title: 'Time Tracking Details',
						details: 'Internal ID: ' + timeTrackingInternalID
					});
					tbody += '<td style="text-align: center">'+timeTrackingInternalID+'</td>\n'; //12

					if(postedStatus ==  'No' && approval == 'Yes')
					{
						tbody += '<td style="text-align: center"><button type="button" class="btn btn-sm btn-info nobr my-sm-n1" id="post_time">Post And Approve Time</button></td>'; //13
					}
					else
					{
						tbody += '<td style="text-align: center" class="py-sm-3"></td>'; //13
					}

					tbody += '</tr>\n';
				}				
				returnData['tbody'] = tbody;
			}
			else
			{
				returnData['message'] = "No Time Entries Found";
				tbody = '<tbody>\n'+'<tr>\n'+'</tr>\n'+'</tbody>\n';
				returnData['tbody'] = tbody;
			}
			return returnData;
		}

		function findTImeEntries(projectInternalID, employeeInternalID)
		{
			log.audit({
				title: 'Finding Time Entries...'
			});

			var timebillSearchObj = search.create({
				type: "timebill",
				filters:
				[
				["job.internalid","anyof",projectInternalID], 
				"AND", 
				["employee","anyof",employeeInternalID], 
				"AND", 
				["type","anyof","A"]
				],
				columns:
				[
				search.createColumn({name: "internalid", label: "Internal ID"}),
				search.createColumn({
					name: "date",
					sort: search.Sort.ASC,
					label: "Date"
				}),				
				search.createColumn({name: "hours", label: "Duration"}),
				search.createColumn({name: "supervisorapproval", label: "Approved"}),
				search.createColumn({name: "status", label: "Status"}),
				search.createColumn({name: "type", label: "Type"}),
				search.createColumn({name: "casetaskevent", label: "Case/Task/Event"}),
				search.createColumn({name: "posted", label: "Posted"}),
				search.createColumn({name: "class", label: "Class"}),
				search.createColumn({name: "location", label: "Location"}),
				search.createColumn({name: "department", label: "Department"})
				/*search.createColumn({name: "customer", label: "Customer"}),
				search.createColumn({name: "item", label: "Item"}),
				search.createColumn({name: "memo", label: "Note"}),
				search.createColumn({name: "rejectionnote", label: "Rejection Note"}),
				search.createColumn({name: "approvalstatus", label: "Approval Status"})
				*/
				]
			});
			var searchResultCount = timebillSearchObj.runPaged().count;

			log.audit({
				title: 'Search Result Size',
				details: 'Search Result Size is: ' + searchResultCount
			});

			var timeBillSearchResult = timebillSearchObj.run().getRange({start :0, end: 500});
			return [timeBillSearchResult, searchResultCount];
		}
		function convertTrueToYes(value)
		{
			if(value)
				value = 'Yes';
			else
				value = 'No';
			return value;
		}
		return {
			get: listTimeEntries
		};
	});