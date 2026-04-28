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
            var itemInternalID = _request.parameters.itemInternalID;
            var locid = _request.parameters.locid;
            log.debug({
                title: 'itemInternalID =' + itemInternalID,
                details: 'locid =' + locid
            })
            let itemSearchResponse = itemSearch(itemInternalID, locid);
            if (itemSearchResponse.isSuccess) {
                result = { 'isSuccess': true, 'data': itemSearchResponse.data }
            } else {
                result = { 'isSuccess': false, 'errorMessage': 'No Data Found' }
            }
            _response.write(JSON.stringify(result))

        }
    }
    // ----------------------------- Item Search Function Start ------------------------------
    function itemSearch(itemInternalID, location) {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemInternalID],
                    "AND",
                    ["inventorylocation", "anyof", location]
                ],
            columns:
                [
                    search.createColumn({ name: "usebins", label: "Use Bins" }),
                    search.createColumn({ name: "isserialitem", label: "Is Serialized Item" }),
                    search.createColumn({ name: "islotitem", label: "Is Lot Numbered Item" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        log.debug("Item Count : " + itemCount);
        if (itemCount > 0) {
            let itemObj = {};
            itemSearchObj.run().each(function (result) {
                itemObj['lotNumber'] = false
                let lotNumber = result.getValue({
                    name: "islotitem",
                });
                let serialNumber = result.getValue({
                    name: "isserialitem",
                });
                if(lotNumber ==  true || serialNumber == true){
                    itemObj['lotNumber'] = true   
                }
                // itemObj['lotNumber'] = result.getValue({
                //     name: "islotitem",
                // });
                // itemObj['serialNumber'] = result.getValue({
                //     name: "isserialitem",
                // });
                itemObj['binNumber'] = result.getValue({
                    name: "usebins",
                });
                itemObj['internalId'] = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': itemObj }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
    }
    // ----------------------------- Item Search Function End ----------------------------------
    return {
        onRequest: onRequest
    }
});
