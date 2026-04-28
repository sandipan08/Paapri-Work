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
        log.debug('PCT-PMC', context.itemInternalID)
        let itemSearchResponse = itemSearch(context.itemInternalID, context.locid);
        if (itemSearchResponse.isSuccess) {
            return { 'isSuccess': true, 'data': itemSearchResponse.data }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
    }
    // ----------------------------- Item Search Function Start ------------------------------
    function itemSearch(itemInternalID, location) {
        log.debug({
            title: "PCT-itemSearch",
            details: itemInternalID
        })
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
                itemObj['lotNumber'] = result.getValue({
                    name: "islotitem",
                });
                itemObj['serialNumber'] = result.getValue({
                    name: "isserialitem",
                });
                itemObj['binNumber'] = result.getValue({
                    name: "usebins",
                });
                itemObj['internalId'] = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': itemObj }

        }
        else if (itemTypeSearch(itemInternalID)) {
            return { 'isSuccess': true, 'data': { 'binNumber': false, 'lotNumber': false, 'serialNumber': false, 'internalId': itemInternalID } }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }


    }

    // ----------------------------- Item Search Function End ----------------------------------
    function itemTypeSearch(itemInternalID) {
        log.debug({
            title: "PCT-itemTypeSearch",
            details: itemInternalID
        })
        var otherchargeitemSearchObj = search.create({
            type: "otherchargeitem",
            filters:
                [
                    ["internalid", "anyof", itemInternalID],
                    "AND",
                    ["type", "anyof", "OthCharge"]
                ],
            columns: []


        });
        var searchResultCount = otherchargeitemSearchObj.runPaged().count;
        log.debug("otherchargeitemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            return true;
        }
        else {
            return false;
        }
        // otherchargeitemSearchObj.run().each(function (result) {
        //     // .run().each has a limit of 4,000 results
        //     return true;
        // });


    }

    return {
        get: _get,
    }
});

