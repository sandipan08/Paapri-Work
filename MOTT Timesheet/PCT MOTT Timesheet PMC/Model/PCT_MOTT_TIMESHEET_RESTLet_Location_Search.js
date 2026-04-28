/**
 * Module Description
 *
 * Version    Date            		Author           Remarks
 * 1.00       14 October 2020    	Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 
/**********************************************************************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_RESTLet_Location_Search
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Location Search Script for MOTT Timesheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

 Function Name:             Purpose:                                                                               		Developer:
 listLocation				Main function which lists and returns location data			   						 		Anirban Gupta
 findLocation				Perform the saved search and export the resultant data			   					   		Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/search', 'N/record', 'N/https', 'N/log'],
	function (search, record, https, log) 
	{
		function listLocation(datain)
		{
			log.audit({
				title: 'Request Received.'
			});

			const returnData = [];
			var subsidiaryInternalID = datain.subsidiaryInternalID;

			const result = findLocation(subsidiaryInternalID);
			const searchResult = result[0];
			const searchResultCount = result[1];

			if(searchResultCount !=0)
			{
				for(var index = 0; index < searchResultCount; index++)
				{
					location = {};
					location['location_name'] = searchResult[index].getValue("name");
					location['location_internalID'] = searchResult[index].getValue("internalid");
					returnData.push(location);

					log.audit({
						title: 'Location Name',
						details: 'Location ' + (index+1) + ' is: ' + searchResult[index].getValue("name")
					});
				}
			}
			return returnData;
		}

		function findLocation(subsidiaryInternalID)
		{
			log.audit({
				title: 'Finding Location(s)...'
			});

			var locationSearchObj = search.create({
				type: "location",
				filters:
				[
				["subsidiary","is",subsidiaryInternalID], 
				"AND",
				["isinactive","is","F"]
				],
				columns:
				[
				search.createColumn({
					name: "name",
					sort: search.Sort.ASC,
					label: "Name"
				}),
				search.createColumn({name: "internalid", label: "Internal ID"})
				]
			});

			var searchResultCount = locationSearchObj.runPaged().count;

			log.audit({
				title: 'Search Result Size',
				details: 'Search Result Size is: ' + searchResultCount
			});

			var locationSearchResult = locationSearchObj.run().getRange({start :0, end: 500});
			return [locationSearchResult, searchResultCount];
		}
		return {
			get: listLocation
		};
	});