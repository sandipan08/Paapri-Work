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
*@ScriptName        PCT PMC Lot Bin Check
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
        log.debug("PCT_PMC", `Context : ${JSON.stringify(context)}`);
        if (context.searchType == "findBinNumbersWithLotNumber") {
            let itemSearchResponse = findBinNumbersWithLotNumber(context);
            log.debug("PCT_PMC", `Response Data : ${JSON.stringify(itemSearchResponse)}`);
            return itemSearchResponse;

        }
        else if (context.searchType == "findBinNumbersWithoutLotNumber") {
            let itemSearchResponse = findBinNumbersWithoutLotNumber(context);
            return itemSearchResponse;

        }

    }
    // ----------------------------- Item Bin Number with Lot Number Search Function Start ------------------------------
    const findBinNumbersWithLotNumber = (dataObj) => {
        log.debug({
            title: 'Data',
            details: `Data = ${JSON.stringify(dataObj)}`
        })
        var binnumberSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["type", "anyof", "InvtPart", "Assembly"],
                    "AND",
                    ["internalid", "anyof", dataObj.itemInternalID],
                    "AND",
                    ["inventorynumberbinonhand.location", "anyof", dataObj.locationInternalID],
                    "AND",
                    ["inventorynumberbinonhand.inventorynumber", "is", dataObj.lotNumber],
                    "AND",
                    ["inventorynumber.internalid", "anyof", dataObj.lotNumberInternalID],
                    "AND",
                    ["inventorynumberbinonhand.quantityavailable", "greaterthan", "0"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: "inventorynumber",
                        join: "inventoryNumberBinOnHand"
                    }),
                    search.createColumn({
                        name: "binnumber",
                        join: "inventoryNumberBinOnHand"
                    }),
                    search.createColumn({
                        name: "quantityavailable",
                        join: "inventoryNumberBinOnHand"
                    })
                ]
        });
        var itemCount = binnumberSearchObj.runPaged().count;
        if (itemCount > 0) {
            let itemArray = [];
            binnumberSearchObj.run().each(function (result) {
                let itemObj = {};
                itemObj['quantityOnHand'] = result.getValue({
                    name: "quantityavailable",
                    join: "inventoryNumberBinOnHand"
                });
                itemObj['inventoryNumber'] = result.getValue({
                    name: "inventorynumber",
                    join: "inventoryNumberBinOnHand"
                });
                itemObj['internalId'] = result.getValue({
                    name: "binnumber",
                    join: "inventoryNumberBinOnHand",
                });
                itemObj['name'] = result.getText({
                    name: "binnumber",
                    join: "inventoryNumberBinOnHand",
                });
                itemArray.push(itemObj);
                return true;
            });
            return { 'isSuccess': true, 'data': itemArray }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Item Found' }
    }
    // ----------------------------- Item Bin Number with Lot Number Search Function End ----------------------------------

    // ----------------------------- Item Bin Number Without Lot Number Search Function Start ------------------------------
    const findBinNumbersWithoutLotNumber = (dataObj) => {
        var binnumberSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["type", "anyof", "Assembly", "InvtPart"],
                    "AND",
                    ["internalid", "anyof", dataObj.itemInternalID],
                    "AND",
                    ["islotitem", "is", "F"],
                    "AND",
                    ["isserialitem", "is", "F"],
                    "AND",
                    ["usebins", "is", "T"],
                    "AND",
                    ["binonhand.quantityavailable", "greaterthan", "0"],
                    "AND",
                    ["binonhand.location", "anyof", dataObj.locationInternalID]
                ],
            columns:
                [
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "location",
                        join: "binOnHand",
                        label: "Location"
                    }),
                    search.createColumn({
                        name: "binnumber",
                        join: "binOnHand",
                        label: "Bin Number"
                    }),
                    search.createColumn({
                        name: "quantityonhand",
                        join: "binOnHand",
                        label: "On Hand"
                    })
                ]
        });
        var itemCount = binnumberSearchObj.runPaged().count;
        if (itemCount > 0) {
            let itemArray = [];
            binnumberSearchObj.run().each(function (result) {
                let itemObj = {};
                itemObj['location'] = result.getValue({
                    name: "location",
                    join: "binOnHand",
                });
                itemObj['internalId'] = result.getValue({
                    name: "binnumber",
                    join: "binOnHand",
                });
                itemObj['name'] = result.getText({
                    name: "binnumber",
                    join: "binOnHand",
                });
                itemObj['quantityOnHand'] = result.getValue({
                    name: "quantityonhand",
                    join: "binOnHand",
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

