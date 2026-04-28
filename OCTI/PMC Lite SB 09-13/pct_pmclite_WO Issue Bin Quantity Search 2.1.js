/**
 *              //////////     PMC Lite 2.1 | HOME PAGE SUITELET (MAIN PAGE/SCANNER PAGE)     //////////
 * 
*@author       Rajesh Nandi
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-03-28 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC Lite, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
                
 *@description  This Suitelet is used to scan ticket and complete operations, for every action it will create 
 *              a PMC Transation record.
 */
 define(['N/record', 'N/search'], function (record, search) {
    var _response;
    var _request;
    var itemSearchResponse;
    function onRequest(context) {
        _request = context.request;
        _response = context.response;

        if (_request.method == 'GET') {

            // Getting Params [GET REQUEST]
            var searchType = _request.parameters.searchType;
            var itemInternalID = _request.parameters.itemInternalID;
            var locationInternalID = _request.parameters.locationInternalID;
            var lotNumber = _request.parameters.lotNumber;
            var lotNumberInternalID = _request.parameters.lotNumberInternalID;
            let dataObj = {
                searchType: searchType,
                itemInternalID: itemInternalID,
                locationInternalID: locationInternalID,
                lotNumber:lotNumber,
                lotNumberInternalID : lotNumberInternalID
            }
            if (searchType == "findBinNumbersWithLotNumber") {
                 itemSearchResponse = findBinNumbersWithLotNumber(dataObj);
                log.debug("PCT_PMC", `Response Data : ${JSON.stringify(itemSearchResponse)}`);
                // itemSearchResponse;
    
            }
            else if (searchType == "findBinNumbersWithoutLotNumber") {
                 itemSearchResponse = findBinNumbersWithoutLotNumber(dataObj);
                // itemSearchResponse;
    
            }

            _response.write(JSON.stringify(itemSearchResponse))

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
        onRequest: onRequest
    }
});
