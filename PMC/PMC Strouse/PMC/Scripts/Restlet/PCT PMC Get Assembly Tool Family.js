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


define(['N/record', 'N/search', 'N/format'], function (record, search, format) {

    function _post(context) {

        log.debug("PCT-PMC", "In PCT Get Assembly Tool Family and Serialized Tool");
        log.debug({
            title: 'PCT-PMC',
            details: `Context = ${JSON.stringify(context)}`
        })
        // log.debug("PCT-PMC", "Response Data : " + JSON.stringify(getToolRouting(context.itemId)))
        return getToolRouting(context.itemId);
    }
    // ----------------------------- getToolRouting Function Start ------------------------------
    const getToolRouting = (itemId) => {
        try {
            var customrecord_rec_tool_routingSearchObj = search.create({
                type: "customrecord_rec_tool_routing",
                filters:
                    [
                        ["custrecord_tool_assm_used", "anyof", itemId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_tool_item", label: "Tool Item #" }),
                        search.createColumn({ name: "custrecord_pct_sc_toolrouting_serialtool", label: "Serialized Tool" }),
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_tool_status",
                            join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                            label: "Tool Status"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_mott_tool_location",
                            join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                            label: "Tool Location"
                        })
                    ]
            });
            var toolRoutingCount = customrecord_rec_tool_routingSearchObj.runPaged().count;

            log.debug("PCT-PMC Count", toolRoutingCount);
            if (toolRoutingCount > 0) {
                let serializedTool = {};
                customrecord_rec_tool_routingSearchObj.run().each(function (result) {

                    // log.debug("PCT-PMC", "Internal Id : " + result.id + ", Serialized Tool : " + result.getValue("custrecord_tool_srl_no"))
                    let toolFamily = result.getValue("custrecord_tool_item");
                    let serializedToolStatus = result.getValue({
                        name: "custrecord_pct_tool_status",
                        join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                        label: "Tool Status"
                    });
                    // log.debug("PCT-PMC Status", serializedToolStatus);
                    log.debug("PCT-PMC", result.getText("custrecord_pct_sc_toolrouting_serialtool") + " , " + serializedToolStatus);
                    if (serializedToolStatus == 1) {
                        if (!(toolFamily in serializedTool)) {
                            serializedTool[toolFamily] = {};
                            serializedTool[toolFamily]['name'] = result.getText("custrecord_tool_item");
                            serializedTool[toolFamily]['options'] = [];
                            let options = {};
                            options['internalId'] = result.getValue({
                                name: "internalid",
                                join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                                label: "Internal ID"
                            });
                            options['name'] = result.getText("custrecord_pct_sc_toolrouting_serialtool") + '( Location : ' + result.getText({
                                name: "custrecord_pct_mott_tool_location",
                                join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                                label: "Tool Location"
                            }) + ' )';
                            serializedTool[toolFamily]['options'].push(options);
                        }
                        else {
                            let options = {};
                            options['internalId'] = result.getValue({
                                name: "internalid",
                                join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                                label: "Internal ID"
                            });
                            options['name'] = result.getText("custrecord_pct_sc_toolrouting_serialtool") + ' ( Tool Location : ' + result.getText({
                                name: "custrecord_pct_mott_tool_location",
                                join: "CUSTRECORD_PCT_SC_TOOLROUTING_SERIALTOOL",
                                label: "Tool Location"
                            }) + ' )';;
                            serializedTool[toolFamily]['options'].push(options);
                        }

                    }
                    return true;
                });
                return Object.keys(serializedTool).length > 0 ? { 'isSuccess': true, 'data': serializedTool } : { 'isSuccess': false, 'errorMessage': 'No Data Found' }
            }
        }
        catch (error) {
            return { 'hasContent': false, 'errorMessage': error.message }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Serialized Tool Found' }


    }

    // ----------------------------- getToolRouting Function End ----------------------------------

    return {
        post: _post
    }
});

