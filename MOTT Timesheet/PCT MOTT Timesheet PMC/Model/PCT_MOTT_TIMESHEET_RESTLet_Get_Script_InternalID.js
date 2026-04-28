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

Script Name:        PCT_MOTT_RESTLet_Get_Script_Id
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Get Script ID of other scripts.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             Purpose:                                                                               Developer:
 getScriptInternalID		Main function which returns the Internal ID of the searched script					   Anirban Gupta
 findScript					Perform the saved search and export the resultant data			   					   Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log) 
	{
		function getScriptInternalID(datain)
		{			
			log.audit({
				title: 'Request Received.'
			});

			var script_internalid;

			const returnData = {};
			const scriptid = datain.scriptID;

			const result = findScript(scriptid);
			const searchResult = result[0];
			const searchResultCount = result[1];

			if(searchResultCount !=0)
			{
				script_internalid = searchResult[0].getValue("internalid");

				returnData['internal_id'] = script_internalid;
				returnData['message'] = "Script Found";
			}
			else
			{
				returnData['message'] = "Script Not Found";
			}
			return returnData;
		}

		function findScript(scriptID)
		{
			log.audit({
				title: 'Finding Script...'
			});

			var scriptSearchObj = search.create({
				type: "script",
				filters:
				[
				["scripttype","anyof","RESTLET","SCHEDULED","SCRIPTLET","ACTION"], 
				"AND", 
				["scriptid","is",scriptID]
				],
				columns:
				[
				search.createColumn({name: "internalid", label: "Internal ID"}),
				search.createColumn({name: "scripttype", label: "Script Type"}),
				search.createColumn({name: "owner", label: "Owner"}),
				search.createColumn({name: "isinactive", label: "Inactive"})
				]
			});

			var searchResultCount = scriptSearchObj.runPaged().count;

			log.audit({
				title: 'Script Search Result Size',
				details: 'Script Search Result Size is: ' + searchResultCount
			});

			var scriptSearchResult = scriptSearchObj.run().getRange({start :0, end: 5});
			return [scriptSearchResult, searchResultCount];
		}
		return {
			get: getScriptInternalID
		};
	});