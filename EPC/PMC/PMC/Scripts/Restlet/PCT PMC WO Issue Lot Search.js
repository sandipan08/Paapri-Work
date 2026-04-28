/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         04-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT_PMC_WOIssue_Lot_Search
*@Developer         Sandipan Sau
*@DevelopmentHead   Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This RestLet is for to fetch all the Script Id.


© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_get                                                           Main Function                                                          Sandipan Sau
itemSearch                                    Fetch Item Lot Number, Bin Number, Serial Number                                        Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search'], function (search) {

	function _get(context) {
		log.debug("PCT-PMC", "In PCT PMC Lot Bin Check Restlet");

		if (context.searchType == "findLotNumbersWithBinNumber") {
			let itemSearchResponse = findLotNumbersWithBinNumber(context);
			return { 'isSuccess': true, 'data': itemSearchResponse.data }
		}
		else if (context.searchType == "findLotNumbersWithoutBinNumber") {
			let itemSearchResponse = findLotNumbersWithoutBinNumber(context);
			return { 'isSuccess': true, 'data': itemSearchResponse.data }
		}
		return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
	}
	// ----------------------------- Item Bin Number with Lot Number Search Function Start ------------------------------
	const findLotNumbersWithBinNumber = (dataObj) => {

		var lotnumberSearchObj = search.create({
			type: "inventorynumber",
			filters:
				[
					["item", "anyof", dataObj.itemInternalID],
					"AND",
					["location", "anyof", dataObj.locationInternalID],
					"AND",
					["quantityavailable", "greaterthan", "0"]
				],
			columns:
				[
					search.createColumn({
						name: "inventorynumber",
						sort: search.Sort.ASC,
						label: "Number"
					}),
					search.createColumn({ name: "internalid", label: "Internal ID" })
				]
		});
		var itemCount = lotnumberSearchObj.runPaged().count;
		if (itemCount > 0) {
			let itemArray = [];
			lotnumberSearchObj.run().each(function (result) {
				let itemObj = {};
				itemObj['name'] = result.getValue({
					name: "inventorynumber",
					sort: search.Sort.ASC,
					label: "Number"
				});
				itemObj['internalId'] = result.getValue({
					name: "internalid",
				});

				itemArray.push(itemObj)
				return true;
			});
			return { 'isSuccess': true, 'data': itemArray }

		}
		return { 'isSuccess': false, 'errorMessage': 'No Item Found' }
	}
	// ----------------------------- Item Bin Number with Lot Number Search Function End ----------------------------------

	// ----------------------------- Item Bin Number Without Lot Number Search Function Start ------------------------------
	const findLotNumbersWithoutBinNumber = (dataObj) => {
		var lotnumberSearchObj = search.create({
			type: "item",
			filters:
				[
					["internalid", "anyof", dataObj.itemInternalID],
					"AND",
					["inventorynumber.quantityavailable", "greaterthan", "0"],
					"AND",
					["inventorynumber.quantityonhand", "greaterthan", "0"],
					"AND",
					["isavailable", "is", "T"],
					"AND",
					["inventorynumber.location", "anyof", dataObj.locationInternalID],
					"AND",
					[["islotitem", "is", "T"], "OR", ["isserialitem", "is", "T"]]
				],
			columns:
				[
					search.createColumn({
						name: "itemid",
						sort: search.Sort.ASC,
						label: "Name"
					}),
					search.createColumn({
						name: "internalid",
						join: "inventoryNumber",
						label: "Internal ID"
					}),
					search.createColumn({
						name: "inventorynumber",
						join: "inventoryNumber",
						label: "Number"
					}),
					search.createColumn({
						name: "quantityonhand",
						join: "inventoryNumber",
						label: "On Hand"
					})
				]
		});
		var itemCount = lotnumberSearchObj.runPaged().count;
		if (itemCount > 0) {
			let itemArray = [];
			lotnumberSearchObj.run().each(function (result) {
				let itemObj = {};

				itemObj['internalId'] = result.getValue({
					name: "internalid",
					join: "inventoryNumber",
					label: "Internal ID"
				});
				itemObj['name'] = result.getValue({
					name: "inventorynumber",
					join: "inventoryNumber",
					label: "Number"
				});
				itemObj['quantityOnHand'] = result.getValue({
					name: "quantityonhand",
					join: "inventoryNumber",
					label: "On Hand"
				});
				itemArray.push(itemObj);
				return true;
			});
			return { 'isSuccess': true, 'data': itemArray }

		}
		return { 'isSuccess': false, 'errorMessage': 'No Item Found' }
	}
	// ----------------------------- Item Bin Number Without Lot Number Search Function End ----------------------------------
	return {
		get: _get,
	}
});

