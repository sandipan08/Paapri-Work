/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.          11-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Get Tool Family Table
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

    function _post(context) {
        log.debug("PCT-PMC", "In PCT PMC Get Tool Family Table");
        return getToolFamily(context)
    }
    // ----------------------------- getToolFamily Function Start ------------------------------
    const getToolFamily = (dataObj) => {
        var customrecord_pct_jason_wo_asmbly_tool_fmSearchObj = search.create({
            type: "customrecord_pct_jason_wo_asmbly_tool_fm",
            filters:
                [
                    ["custrecord_pct_jason_work_order", "anyof", dataObj.workOrderId],
                    "AND",
                    ["custrecord_pct_jason_op_number", "equalto", dataObj.operationSequence]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_pct_jason_tool_family", label: "Tool Family" })
                ]
        });
        var toolFamilyCount = customrecord_pct_jason_wo_asmbly_tool_fmSearchObj.runPaged().count;
        log.debug("PCT_PMC", `Tool Family Result Count : ${toolFamilyCount}`);
        if (toolFamilyCount > 0) {
            let toolFamilyArray = [];
            customrecord_pct_jason_wo_asmbly_tool_fmSearchObj.run().each(function (result) {
                let toolFamilyObj = {};
                toolFamilyObj['internalId'] = result.id;
                toolFamilyObj['toolFamily'] = result.getValue("custrecord_pct_jason_tool_family");
                toolFamilyObj['operationSequence'] = dataObj.operationSequence;
                toolFamilyArray.push(toolFamilyObj);
                return true;
            });
            return { 'isSuccess': true, 'data': toolFamilyArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Tool Family Found' }
    }



    // ----------------------------- getToolFamily Function End ----------------------------------


    return {
        post: _post,
    }
});

