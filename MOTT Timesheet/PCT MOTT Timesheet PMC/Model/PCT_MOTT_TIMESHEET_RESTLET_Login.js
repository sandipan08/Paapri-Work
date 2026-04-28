/**
 * Module Description
 *
 * Version    Date            		Author           Remarks
 * 1.00       01 October 2020    	Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 
/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_Login
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Login Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             Purpose:                                                                               Developer:
 operatorLogin				Main function which returns operator data			   								   Anirban Gupta
 findOperator				Perform the saved search and export the resultant data			   					   Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log) 
	{
		function operatorLogin(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const returnData = {};
			const operator_password = datain.password;

			const result = findOperator(operator_password);
			const searchResult = result[0];
			const searchResultCount = result[1];

			if(searchResultCount !=0)
			{
				const emp_name = searchResult[0].getValue("entityid");
				log.audit({
					title: 'Employee Name',
					details: 'Employee Name is: ' + emp_name
				});

				returnData['emp_name'] = emp_name;
				returnData['internalID'] = searchResult[0].getValue("internalid");
				returnData['subsidiaryInternalID'] = searchResult[0].getValue("subsidiary");
				returnData['hourlyLaborCost'] = searchResult[0].getValue("laborcost");
				returnData['message'] = "Logged In";

				// Loading date and time 
				/*const today = new Date();
				const date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
				const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
				const loginDate = date;
				const loginTime = time;

				log.audit({
					title: 'Date-Check-Log',
					details: 'Login Date is: ' + loginDate
				});
				log.audit({
					title: 'Time-Check-Log',
					details: 'Login Time is: ' + loginTime
				});*/
			}
			else
			{
				returnData['message'] = "Please enter correct Badge ID";
			}
			return returnData;
		}

		function findOperator(password)
		{
			log.audit({
				title: 'Finding Operator...'
			});

			var operatorSearchObj = search.create({
				type: "employee",
				filters:
				[
				["custentity_pct_mott_badge_id","is",password]
				],
				columns:
				[
				search.createColumn({name: "entityid", sort: search.Sort.ASC, label: "Name"}),
				search.createColumn({name: "internalid", label: "Internal ID"}),
				search.createColumn({name: "subsidiary", label: "Subsidiary"}),
				search.createColumn({name: "laborcost", label: "Labor Cost"})
				]
			});

			var searchResultCount = operatorSearchObj.runPaged().count;

			log.audit({
				title: 'Search Result Size',
				details: 'Search Result Size is: ' + searchResultCount
			});

			var operatorSearchResult = operatorSearchObj.run().getRange({start :0, end: 5});
			return [operatorSearchResult, searchResultCount];
		}
		return {
			get: operatorLogin
		};
	});