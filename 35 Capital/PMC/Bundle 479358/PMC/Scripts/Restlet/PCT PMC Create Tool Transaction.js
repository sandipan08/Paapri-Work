/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.00       13th Feb 2023           Sandipan Sau
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

*@ScriptName        PCT PMC Create Tool Transaction Record
*@Developer         Sandipan Sau
*@DevelopmentHead   Mrs. Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This 2.1 restlet will create tool transaction record

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                              Purpose:                                                              Developer:
_post                                                  Main Function(Create Tool Transaction Record)                                   Sandipan Sau

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/record', 'N/search', 'N/format'], function (record, search, format) {

    function _post(context) {
        try {
            log.debug("PCT-PMC", "In PCT PMC Create Tool Transaction Restlet");
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${JSON.stringify(context)}`
            })
            let createToolTransaction = record.create({ type: 'customrecord_pct_rec_tool_transaction', isDynamic: true }).setValue({
                fieldId: "custrecord_pct_wo_checked_out_to",
                value: context.workOrderId,
            }).setText({
                fieldId: "custrecord_trans_tool_item",
                text: context.toolItem,
            }).setValue({
                fieldId: "custrecord_pct_trans_tool",
                value: context.serializedTool,
            }).setValue({
                fieldId: "custrecord_pct_trans_typ",
                value: context.toolStatus,
            }).setValue({
                fieldId: "custrecord_pct_check_ed_op",
                value: context.checkOutOperation,
            }).setValue({
                fieldId: "custrecord_pct_sc_tool_comp_qty",
                value: context.completedQuantity,
            }).save();
            log.debug("PCT-PMC", "Tool Transaction Id : " + createToolTransaction);
            // Update Serialized Tool
            if (context.toolStatus == 2) {
                var serializedToolLoad = record.load({
                    type: 'customrecord_pct_tool',
                    id: context.serializedTool
                })
                let toolLife = serializedToolLoad.getValue({ fieldId: 'custrecord_tool_life' })
                serializedToolLoad.setValue({ fieldId: 'custrecord_tool_life', value: toolLife - context.completedQuantity }).save();
            }


            return { 'isSuccess': true, 'data': createToolTransaction }
        } catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }
    }



    return {
        post: _post
    }
});
