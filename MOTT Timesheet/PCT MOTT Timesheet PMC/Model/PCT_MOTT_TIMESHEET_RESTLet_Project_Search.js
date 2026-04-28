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

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_Project_Search
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Project Search Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             Purpose:                                                                               	Developer:
 listProjects				Main function which lists and returns project data			   						 	Anirban Gupta
 findProject				Perform the saved search and export the resultant data			   					   	Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/log'],
	function (search, log) {
		function listProjects(datain) {
			log.audit({
				title: 'Request Received.'
			});

			const returnData = {};
			const employeeInternalID = datain.employeeInternalID;

			const result = findProject(employeeInternalID);
			const searchResult = result[0];
			const searchResultCount = result[1];


			var tHead = '<tr>\n<th>PROJECT NAME</th>\n<th>PROJECT NUMBER</th>\n<th>PROJECT MANAGER</th>\n<th>PROJECT TYPE</th>\n<th>CUSTOMER</th><th>SUBSIDIARY</th>\n<th>PRIMARY CONTACT</th>\n<th>STATUS</th>\n<th>START DATE</th>\n<th>END DATE</th>\n<th>ACTUAL END DATE</th>\n<th>ADMIN</th>\n<th>ALLOW ALL TASKS</th>\n<th>TIMETRACKING STATUS</th>\n<th>PROJECT INTERNAL ID</th>\n<th>TIMETRACKING RECORD INTERNAL ID</th>\n<th>TIMETRACKING START TIME</th>\n<th>TOTAL BREAK DURATION</th>\n<th>BREAK START TIME</th>\n</tr>';

			returnData['thead'] = tHead;
			returnData['rowcount'] = searchResultCount;

			var tbody = "";
			if (searchResultCount != 0) {
				returnData['message'] = "Projects Found";

				for (var index = 0; index < searchResultCount; index++) {
					tbody += '<tr>\n';

					var projectName = searchResult[index].getValue("companyname");
					log.audit({
						title: 'Project Details',
						details: 'Project Name: ' + projectName
					});

					tbody += '<td>' + projectName + '</td>\n';

					var projectNumber = searchResult[index].getValue("entityid");
					log.audit({
						title: 'Project Details',
						details: 'Project Number: ' + projectNumber
					});

					// var altName = searchResult[index].getValue("altname");
					// log.audit({	
					// 	title: 'Project Details',
					// 	details: 'Alt Name: ' + altName
					// });	
					// tbody += '<td>' + projectNumber + ' ' + altName + '</td>\n';
					tbody += '<td>' + projectNumber + '</td>\n';

					var projectManager = searchResult[index].getText("projectmanager");
					log.audit({
						title: 'Project Details',
						details: 'Project Manager: ' + projectManager
					});

					tbody += '<td>' + projectManager + '</td>\n';

					var projectType = searchResult[index].getValue("jobtype");
					log.audit({
						title: 'Project Details',
						details: 'Project Type: ' + projectType
					});
					tbody += '<td>' + projectType + '</td>\n';

					var customer = searchResult[index].getText("customer");
					log.audit({
						title: 'Project Details',
						details: 'Customer: ' + customer
					});
					tbody += '<td>' + customer + '</td>\n';

					var subsidiary = searchResult[index].getText("subsidiary");
					log.audit({
						title: 'Project Details',
						details: 'Subsidiary: ' + subsidiary
					});
					tbody += '<td>' + subsidiary + '</td>\n';

					var primaryContact = searchResult[index].getValue("contact");
					log.audit({
						title: 'Project Details',
						details: 'Primary Contact: ' + primaryContact
					});
					tbody += '<td>' + primaryContact + '</td>\n';

					var status = searchResult[index].getText("entitystatus");
					log.audit({
						title: 'Project Details',
						details: 'Status: ' + status
					});
					tbody += '<td>' + status + '</td>\n';

					var startDate = searchResult[index].getValue("startdate");
					log.audit({
						title: 'Project Details',
						details: 'Start Date: ' + startDate
					});
					tbody += '<td>' + startDate + '</td>\n';

					var endDate = searchResult[index].getValue("projectedenddate");
					log.audit({
						title: 'Project Details',
						details: 'Projected End Date: ' + endDate
					});
					tbody += '<td>' + endDate + '</td>\n';

					var actualEndDate = searchResult[index].getValue("enddate");
					log.audit({
						title: 'Project Details',
						details: 'Actual End Date: ' + actualEndDate
					});
					tbody += '<td>' + actualEndDate + '</td>\n';

					//var admin = searchResult[index].getText("custentity_planner");
					var admin = '';
					log.audit({
						title: 'Project Details',
						details: 'Admin: ' + admin
					});
					tbody += '<td>' + admin + '</td>\n';

					var allowAllTasks = searchResult[index].getValue("allowtasktimeforrsrcalloc");
					log.audit({
						title: 'Tasks',
						details: 'Allow All Tasks: ' + allowAllTasks
					});
					tbody += '<td>' + allowAllTasks + '</td>\n';


					/* TimeTracking Status column added BELOW */
					tbody += '<td>' + 'None' + '</td>\n';
					/* TimeTracking Status column added ABOVE */

					var projectInternalID = searchResult[index].getValue("internalid");
					log.audit({
						title: 'Project Details',
						details: 'Project Internal ID: ' + projectInternalID
					});
					tbody += '<td>' + projectInternalID + '</td>\n';

					/* TimeTracking Record Internal ID column added BELOW */
					tbody += '<td>' + '</td>\n';
					/* TimeTracking Record Internal ID column added ABOVE */
					/* TimeTracking Start Time added BELOW */
					tbody += '<td>' + '</td>\n';
					/* TimeTracking Start Time added ABOVE */
					/* Total Break Duration column added BELOW */
					tbody += '<td>' + '</td>\n';
					/* Total Break Duration column added ABOVE */
					/* Break Start Time column added BELOW */
					tbody += '<td>' + '</td>\n';
					/* Break Start Time column added ABOVE */

					tbody += '</tr>\n';
				}
				returnData['tbody'] = tbody;
			}
			else {
				returnData['message'] = "Projects Not Found";
				tbody = '<tbody>\n' + '<tr>\n' + '</tr>\n' + '</tbody>\n';
				returnData['tbody'] = tbody;
			}
			return returnData;
		}

		function findProject(employeeInternalID) {
			log.audit({
				title: 'Finding Projects...'
			});

			var projectSearchObj = search.create({
				type: "job",
				filters:
					[
						["jobresource", "anyof", employeeInternalID],
						"AND",
						["status", "noneof", "1"]
					],
				columns:
					[
						search.createColumn({ name: "internalid", label: "Internal ID" }),
						search.createColumn({
							name: "entityid",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						//search.createColumn({name: "altname", label: "Name"}),
						search.createColumn({ name: "jobtype", label: "Project Type" }),
						search.createColumn({ name: "customer", label: "Customer" }),
						search.createColumn({ name: "subsidiary", label: "Subsidiary" }),
						search.createColumn({ name: "contact", label: "Primary Contact" }),
						search.createColumn({ name: "entitystatus", label: "Status" }),
						search.createColumn({ name: "startdate", label: "Start Date" }),
						search.createColumn({ name: "projectedenddate", label: "Projected End Date" }),
						search.createColumn({ name: "enddate", label: "Actual End Date" }),
						//search.createColumn({name: "custentity_planner", label: "Admin"}),
						search.createColumn({ name: "allowtasktimeforrsrcalloc", label: "Allow Allocated Resources to Enter Time to All Tasks" }),
						search.createColumn({ name: "companyname", label: "Project Name" }),
						search.createColumn({ name: "projectmanager", label: "Project Manager" })
					]
			});
			var searchResultCount = projectSearchObj.runPaged().count;

			log.audit({
				title: 'Search Result Size',
				details: 'Search Result Size is: ' + searchResultCount
			});

			var projectSearchResult = projectSearchObj.run().getRange({ start: 0, end: 200 });
			return [projectSearchResult, searchResultCount];
		}
		return {
			get: listProjects
		};
	});