/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         0r-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Get Item Bin Number
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
getBinNumber                                           Get Tool Family Internal Id                                                   Sandipan Sau 
getSerializedTool                                                                           Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search'], function (search) {

    function _post(context) {

        log.debug("PCT-PMC", "In PCT PMC Get Bin Number Restlet : " + JSON.parse(context));

        return getBinNumber(JSON.parse(context));
    }
    // ----------------------------- getBinNumber Function Start ------------------------------
    const getBinNumber = (dataObj) => {
        let binNumberArray = new Array();
        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["internalid", "anyof", dataObj.itemId],
                    "AND",
                    ["usebins", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "binnumber",
                        join: "binOnHand",
                        label: "Bin Number"
                    }),
                    search.createColumn({
                        name: "binnumber",
                        join: "binNumber",
                        label: "Bin Number"
                    })
                ]
        });
        var searchResultCount = assemblyitemSearchObj.runPaged().count;
        log.debug("Bin result count", searchResultCount);
        if (searchResultCount > 0) {
            assemblyitemSearchObj.run().each(function (result) {
                let binNumberObj = {};
                binNumberObj['internalId'] = result.id;
                binNumberObj['name'] = result.getValue({
                    name: "binnumber",
                    join: "binNumber",
                    label: "Bin Number"
                })
                binNumberArray.push(binNumberObj);
                return true;
            });
            return { 'isSuccess': true, 'data': binNumberArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'Bin Numbers Not Found' }

    }



    // ----------------------------- getBinNumber Function End ----------------------------------


    return {
        post: _post,
    }
});