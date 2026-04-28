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
*@ScriptName        PCT PMC Get Assembly Tool Family
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
getToolFamily                                           Get Tool Family Internal Id                                                   Sandipan Sau 
getSerializedTool                                                                           Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search'], function (search) {

    function _post(context) {
        let titleArr = ['Item'];
        log.debug("PCT-PMC", "In PCT PMC Get Assembly Tool Family Restlet");
        let toolFamilyResponse = getToolFamily(context);
        log.debug("PCT-PMC", "Response Data : " + JSON.stringify(toolFamilyResponse))
        if (toolFamilyResponse.isSuccess) {

            log.debug("PCT-PMC", "Response Data : " + JSON.stringify(getSerializedTool(toolFamilyResponse.data)))
            return JSON.stringify(getSerializedTool(toolFamilyResponse.data));
            // return { 'isSuccess': true, 'column': generateTableHeader(Object.keys(getToolFamily(context).data[0]), titleArr), 'data': getToolFamily(context).data }
        }
        // return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
        return false;
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
                toolFamilyArray.push(result.getValue("custrecord_pct_jason_tool_family"));
                return true;
            });
            return { 'isSuccess': true, 'data': toolFamilyArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Tool Family Found' }
    }



    // ----------------------------- getToolFamily Function End ----------------------------------

    // ----------------------------- getSerializedTool Function Start ------------------------------
    const getSerializedTool = (dataArray) => {
        var customrecord_pct_toolSearchObj = search.create({
            type: "customrecord_pct_tool",
            filters:
                [
                    ["custrecord_pct_tool_item_no", "anyof", dataArray],
                    "AND",
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_pct_tool_status", "anyof", "1"]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_pct_tool_item_no", label: "Tool Item #" }),
                    search.createColumn({ name: "custrecord_tool_srl_no", label: "Serialized Tool" }),
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_TOOL_SRL_NO",
                        label: "Internal ID"
                    })

                ]
        });
        var serializedToolCount = customrecord_pct_toolSearchObj.runPaged().count;
        if (serializedToolCount > 0) {
            let serializedTool = {};
            customrecord_pct_toolSearchObj.run().each(function (result) {
                // log.debug("PCT-PMC", "Internal Id : " + result.id + ", Serialized Tool : " + result.getValue("custrecord_tool_srl_no"))
                let toolFamily = result.getValue("custrecord_pct_tool_item_no");
                if (!(toolFamily in serializedTool)) {
                    serializedTool[toolFamily] = {};
                    serializedTool[toolFamily]['name'] = result.getText("custrecord_pct_tool_item_no");
                    serializedTool[toolFamily]['options'] = [];
                    let options = {};
                    options['internalId'] = result.getValue({
                        name: "internalid",
                        join: "CUSTRECORD_TOOL_SRL_NO",
                        label: "Internal ID"
                    });
                    options['name'] = result.getText("custrecord_tool_srl_no");
                    serializedTool[toolFamily]['options'].push(options);
                }
                else {
                    let options = {};
                    options['internalId'] = result.getValue({
                        name: "internalid",
                        join: "CUSTRECORD_TOOL_SRL_NO",
                        label: "Internal ID"
                    });
                    options['name'] = result.getText("custrecord_tool_srl_no");
                    serializedTool[toolFamily]['options'].push(options);
                }
                return true;
            });


            return { 'isSuccess': true, 'data': serializedTool }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Tool Family Found' }

    }
    // ----------------------------- getSerializedTool Function End ----------------------------------
    return {
        post: _post,
    }
});

