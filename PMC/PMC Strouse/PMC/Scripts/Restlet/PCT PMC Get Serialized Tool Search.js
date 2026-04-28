/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         06-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Get Serialized Tool Search
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
getSerializedTool                                            Fetch Serialized Tool                                                    Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search'], function (search) {

    function _get(context) {
        log.debug("PCT-PMC", "In PCT PMC Get Serialized Tool Search");
        if (getSerializedTool().isSuccess) {
            return { 'isSuccess': true, 'data': { 'fieldId': 'serializedTool', 'fieldName': '', 'options': getSerializedTool().data } }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
    }
    // ----------------------------- Item Search Function Start ------------------------------
    const getSerializedTool = () => {
        var customrecord_pct_toolSearchObj = search.create({
            type: "customrecord_pct_tool",
            filters:
                [
                    ["custrecord_pct_tool_item_no", "anyof", "@ALL@"],
                    "AND",
                    ["isinactive", "is", "F"],
                ],
            columns:
                [

                    search.createColumn({ name: "custrecord_tool_srl_no", label: "Serialized Tool" }),

                ]
        });
        var serializedToolCount = customrecord_pct_toolSearchObj.runPaged().count;
        log.debug("PCT-PMC", "Serialized Tool Result Count : " + serializedToolCount);
        if (serializedToolCount > 0) {
            let serializedToolArray = [];
            customrecord_pct_toolSearchObj.run().each(function (result) {
                log.debug("PCT-PMC", "Internal Id : " + result.id + ", Serialized Tool : " + result.getValue("custrecord_tool_srl_no"))
                let serializedTool = {};
                serializedTool['fieldId'] = result.id;
                serializedTool['name'] = result.getText("custrecord_tool_srl_no");
                serializedToolArray.push(serializedTool);
                return true;
            });

            return { 'isSuccess': true, 'data': serializedToolArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Tool Family Found' }

    }
    // ----------------------------- Item Search Function End ----------------------------------
    return {
        get: _get,
    }
});

