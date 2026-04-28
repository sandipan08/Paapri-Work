/**
 * Module Description
 *
 * Version       Date            		Author           Remarks
 * 2.1          27 Oct 2021    	    Rajesh Nandi
 *
 *
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/**********************************************************************************************************************************************

Script Name:        PCT NCS UE Discount Calculation.js
Developer:          Rajesh Nandi    
Development Head:   Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script will Calculate Discount.

© Copyright All Rights Reserved

***/
define(['N/record','N/search'], function (record,search) {



    function afterSubmit(context) {
        if (context.type !== context.UserEventType.DELETE) {
            var id = context.newRecord.id;
            var type = context.newRecord.type;


            var rec = record.load({
                type: type,
                id: id,
                isDynamic: true
            })

            var assemblyitem = rec.getValue({
                fieldId: 'assemblyitem'
            })

            var toolObj = getToolDetails(assemblyitem);
            // UpdateDiscount(id, type)

            log.debug({
                title: 'toolObj assemblyitem ='+assemblyitem,
                details: toolObj
            })
            rec.selectNewLine({
                sublistId: 'recmachcustrecord_pct_jason_work_order'
            })

            if (toolObj.toolItem != null) {
                rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_jason_work_order',
                    fieldId: 'custrecord_pct_jason_tool_family',
                    value: toolObj.toolItem
                })
            }
            if (toolObj.step != null) {
                rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_jason_work_order',
                    fieldId: 'custrecord_pct_jason_op_number',
                    value: toolObj.step
                })
            }
            rec.commitLine({
                sublistId: 'recmachcustrecord_pct_jason_work_order'
            })
            rec.save();
        }
    }

    function getToolDetails(assemblyitem) {
        log.debug({
            title: 'assemblyitem',
            details: assemblyitem
        })
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", assemblyitem]
                ],
            columns:
                [
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "custrecord_used_in_step",
                        join: "CUSTRECORD_TOOL_ASSM_USED",
                        label: "Used in Step Number"
                     }),
                    search.createColumn({
                        name: "custrecord_tool_item",
                        join: "CUSTRECORD_TOOL_ASSM_USED",
                        label: "Tool Item #"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_TOOL_ASSM_USED",
                        label: "TInternalid"
                    })
                ]
        });
        var obj = new Object();
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count", searchResultCount);
        itemSearchObj.run().each(function (result) {
            var toolItem = result.getValue({
                name: "custrecord_tool_item",
                join: "CUSTRECORD_TOOL_ASSM_USED",
                label: "Tool Item #"
            })
            var step = result.getValue({
                name: "custrecord_used_in_step",
                join: "CUSTRECORD_TOOL_ASSM_USED",
                label: "Used in Step Number"
            })

            var id = result.getValue({
                name: "internalid",
                join: "CUSTRECORD_TOOL_ASSM_USED",
                label: "TInternalid"
            })
            log.debug({
                title: 'step',
                details: id
            })
            obj.toolItem = toolItem;
            obj.step = step;
            // .run().each has a limit of 4,000 results
            return true;
        });
        return obj;


    }

    return {
        /* beforeLoad: beforeLoad,
         beforeSubmit: beforeSubmit,*/
        afterSubmit: afterSubmit
    }
});
