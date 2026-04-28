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
    var result;
    function onRequest(context) {
        _request = context.request;
        _response = context.response;

        if (_request.method == 'GET') {

            // Getting Params [GET REQUEST]
            var searchType = _request.parameters.searchType;
            var itemInternalID = _request.parameters.itemInternalID;
            var locationInternalID = _request.parameters.locationInternalID;
            let dataObj = {
                searchType: searchType,
                itemInternalID: itemInternalID,
                locationInternalID: locationInternalID
            }
            if (searchType == "findLotNumbersWithBinNumber") {
                let itemSearchResponse = findLotNumbersWithBinNumber(dataObj);
                result = { 'isSuccess': true, 'data': itemSearchResponse.data }
            }
            else if (searchType == "findLotNumbersWithoutBinNumber") {
                let itemSearchResponse = findLotNumbersWithoutBinNumber(dataObj);
                result = { 'isSuccess': true, 'data': itemSearchResponse.data }
            } else {
                result = { 'isSuccess': false, 'errorMessage': 'No Data Found' }
            }

            _response.write(JSON.stringify(result))

        }
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
        onRequest: onRequest
    }
});
