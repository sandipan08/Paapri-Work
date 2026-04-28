/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.           15-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Serialized Tool CheckIn
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
getSerializedTool                                         Fetch Serialized Tool Data                                                   Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search', 'N/record'], function (search, record) {

    function _get(context) {
        log.debug("PCT-PMC", "In PCT PMC Get Serialized Tool CheckIn");
        return getSerializedTool(context.serializedToolId);
    }
    // ----------------------------- Get Serialized Tool Function Start ------------------------------
    const getSerializedTool = (serializedToolId) => {
        var customrecord_pct_toolSearchObj = search.create({
            type: "customrecord_pct_tool",
            filters:
                [
                    ["internalidnumber", "equalto", serializedToolId]
                ],
            columns: []

        });
        var serializedToolCount = customrecord_pct_toolSearchObj.runPaged().count;
        log.debug("PCT-PMC", "Serialized Tool Result Count : " + serializedToolCount);
        if (serializedToolCount > 0) {
            customrecord_pct_toolSearchObj.run().each(function (result) {
                let serializedToolLoad = record.load({
                    type: "customrecord_pct_tool",
                    id: result.id,
                }).setValue({
                    fieldId: "custrecord_pct_tool_status",
                    value: 1,
                }).save();
                return true;
            });


            return { 'isSuccess': true }
        }
        return { 'isSuccess': false }

    }
    // ----------------------------- Get Serialized Tool Function End ----------------------------------
    return {
        get: _get,
    }
});

