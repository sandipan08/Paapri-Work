/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         07-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Get Serialized Tool Status Change
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
serializedToolCheckout                                    Serialized Tool                                         Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search', 'N/record'], function (search, record) {

    function _get(context) {
        log.debug("PCT-PMC", "In PCT PMC Serialized Tool Status Change Restlet");
        return serializedToolCheckout(context);
    }
    // ----------------------------- getSerializedTool Function Start ------------------------------
    const serializedToolCheckout = (dataObj) => {
        log.debug("PCT_PMC", "Data Obj : " + JSON.stringify(dataObj))
        var customrecord_pct_toolSearchObj = search.create({
            type: "customrecord_pct_tool",
            filters:
                [
                    ["custrecord_pct_tool_item_no", "anyof", dataObj.toolFamilyInternalID],
                    "AND",
                    ["custrecord_tool_srl_no", "anyof", dataObj.serializedToolId]

                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = customrecord_pct_toolSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            customrecord_pct_toolSearchObj.run().each(function (result) {
                let serializedToolLoad = record.load({
                    type: "customrecord_pct_tool",
                    id: result.id,
                }).setValue({
                    fieldId: "custrecord_pct_tool_status",
                    value: 2,
                }).save();
                return true;
            });
            return { 'isSuccess': true }
        }
        return { 'isSuccess': false }

    }
    // ----------------------------- getSerializedTool Function End ----------------------------------
    return {
        get: _get,
    }
});

