/**
 * Module Description
 *
 * Version    Date            		Author           Remarks
 * 1.00       16 October 2020    	Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 
/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_ProjectTask_Search
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Project Task Search Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             Purpose:                                                                               		Developer:
 listProjectTask			Main function which lists and returns the project tasks based on the criteria			   	Anirban Gupta
 findProjectTask			Perform the saved search and export the resultant data			   					   		Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log) 
	{
		function listProjectTask(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const returnData = [];

			var projectInternalID = datain.projectInternalID;
			var employeeInternalID = datain.employeeInternalID;
			var allowAll  = datain.allowAll;

			var result;	
			if(allowAll == 'true')
			{
				result = findProjectTask(projectInternalID);
			}
			else if(allowAll == 'false')
			{
				result = findProjectTask(projectInternalID, employeeInternalID);
			}

			const searchResult = result[0];
			const searchResultCount = result[1];

			if(searchResultCount !=0)
			{
				for(var index = 0; index < searchResultCount; index++)
				{
					projectTask = {};
					projectTask['taskInternalID'] = searchResult[index].getValue('internalid');
					projectTask['taskName'] = searchResult[index].getValue("title");
					returnData.push(projectTask);
				}
			}
			return returnData;
		}

		function findProjectTask(projectInternalID, employeeInternalID)
		{
			var projecttaskSearchObj;

			if(employeeInternalID == undefined)
			{
				log.audit({
					title: 'Finding Project Task(s) if everyone is allowed...'
				});

				projecttaskSearchObj = search.create({
					type: "projecttask",
					filters:
					[
					["project","anyof",projectInternalID]
					],
					columns:
					[
					search.createColumn({name: "title", label: "Name"}),
					search.createColumn({name: "internalid", label: "Internal ID"})
					]
				});				
			}
			else
			{
				log.audit({
					title: 'Finding Project Task(s) if everyone is not allowed...'
				});

				projecttaskSearchObj = search.create({
					type: "projecttask",
					filters:
					[
					["project","anyof",projectInternalID], 
					"AND", 
					["resourceallocation.resource","anyof",employeeInternalID]
					],
					columns:
					[
					search.createColumn({name: "title", label: "Name"}),
					search.createColumn({name: "internalid", label: "Internal ID"})
					]
				});
			}			
			var searchResultCount = projecttaskSearchObj.runPaged().count;

			log.audit({
				title: 'Search Result Size',
				details: 'Search Result Size is: ' + searchResultCount
			});

			var projectTaskSearchResult = projecttaskSearchObj.run().getRange({start :0, end: 500});
			return [projectTaskSearchResult, searchResultCount];
		}
		return {
			get: listProjectTask
		};
	});