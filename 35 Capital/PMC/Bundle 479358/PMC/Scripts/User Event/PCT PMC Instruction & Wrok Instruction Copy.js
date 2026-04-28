/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@NModuleScope SameAccount
 *@since        2023-06-05 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.0 code in this page is for Copy PMC Instruction & work Instruction data from item, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This User Event is created for Copy PMC Instruction & work Instruction data from item to Work order.
 */

 define(['N/file', 'N/record', 'N/error'], function (file, record, error) {


    function beforeLoad(context) {

    }

    function beforeSubmit(context) {

    }

    function afterSubmit(context) {
        try {
            if ((context.type === context.UserEventType.CREATE) || (context.type === context.UserEventType.COPY)) {
                var recordType = context.newRecord.type;
                var recordId = context.newRecord.id;
                var WOrecordData = record.load({
                    type: recordType,
                    id: recordId,
                    isDynamic: true
                })

                var assemblyItem = WOrecordData.getValue({
                    fieldId: 'assemblyitem'
                })

                var itemData = record.load({
                    type: record.Type.ASSEMBLY_ITEM,
                    id: assemblyItem,
                    isDynamic: true
                })


                // //COPY PMC INSTRUCTION
                // var PMCInstructionLine = itemData.getLineCount({
                //     sublistId: 'recmachcustrecord_pct_pmc_work_ins_item'
                // })

                // for (var PMCInstructionIndex = 0; PMCInstructionIndex < PMCInstructionLine; PMCInstructionIndex++) {
                //     var fileName = itemData.getSublistValue({
                //         sublistId: 'recmachcustrecord_pct_pmc_work_ins_item',
                //         fieldId: 'custrecord_pct_pmc_work_ins_file',
                //         line: PMCInstructionIndex
                //     })
                //     var URL = itemData.getSublistValue({
                //         sublistId: 'recmachcustrecord_pct_pmc_work_ins_item',
                //         fieldId: 'custrecord_pct_pmc_work_ins_url',
                //         line: PMCInstructionIndex
                //     })


                //     WOrecordData.selectNewLine({
                //         sublistId: 'recmachcustrecord_pct_pmc_instruction_wo'
                //     })

                //     WOrecordData.setCurrentSublistValue({
                //         sublistId: 'recmachcustrecord_pct_pmc_instruction_wo',
                //         fieldId: 'custrecord_pct_pmc_work_ins_url_wo',
                //         value: URL
                //     })

                //     WOrecordData.setCurrentSublistValue({
                //         sublistId: 'recmachcustrecord_pct_pmc_instruction_wo',
                //         fieldId: 'custrecord_pct_pmc_work_ins_file_wo',
                //         value: fileName
                //     })

                //     WOrecordData.setCurrentSublistValue({
                //         sublistId: 'recmachcustrecord_pct_pmc_instruction_wo',
                //         fieldId: 'custrecord_pct_pmc_instruction_wo',
                //         value: recordId
                //     })

                //     WOrecordData.commitLine({
                //         sublistId: 'recmachcustrecord_pct_pmc_instruction_wo'
                //     })

                // }
                // //END COPY PMC INSTRUCTION

                //COPY WORK INSTRUCTION
                var PMCWorkInstruction = itemData.getLineCount({
                    sublistId: 'recmachcustrecord_pct_sc_wi_itemlink'
                })

                for (var PMCInstructionIndex = 0; PMCInstructionIndex < PMCWorkInstruction; PMCInstructionIndex++) {
                    var workInstruction = itemData.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_sc_wi_itemlink',
                        fieldId: 'custrecord_pct_sc_workins',
                        line: PMCInstructionIndex
                    })
                    var workCenter = itemData.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_sc_wi_itemlink',
                        fieldId: 'custrecord_pct_str_mfg_work_center',
                        line: PMCInstructionIndex
                    })
                    var operationName = itemData.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_sc_wi_itemlink',
                        fieldId: 'custrecord_pct_str_operation_name',
                        line: PMCInstructionIndex
                    })
                    var operationSequence = itemData.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_sc_wi_itemlink',
                        fieldId: 'custrecord_pct_str_operation_sequence',
                        line: PMCInstructionIndex
                    })
                    var operationSequenceURL = itemData.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_sc_wi_itemlink',
                        fieldId: 'custrecord_pct_work_ins_url',
                        line: PMCInstructionIndex
                    })
                    var assembly = itemData.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_sc_wi_itemlink',
                        fieldId: 'custrecord_pct_sc_wi_itemlink',
                        line: PMCInstructionIndex
                    })


                    WOrecordData.selectNewLine({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo'
                    })

                    WOrecordData.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                        fieldId: 'custrecord_pct_sc_workins_wo',
                        value: workInstruction
                    })

                    WOrecordData.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                        fieldId: 'custrecord_pct_str_mfg_work_center_wo',
                        value: workCenter
                    })

                    WOrecordData.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                        fieldId: 'custrecord_pct_str_operation_name_wo',
                        value: operationName
                    })

                    WOrecordData.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                        fieldId: 'custrecord_pct_str_operation_sequence_wo',
                        value: operationSequence
                    })
                    WOrecordData.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                        fieldId: 'custrecord_pct_wo_ins_url',
                        value: operationSequenceURL
                    })

                    // WOrecordData.setCurrentSublistValue({
                    //     sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                    //     fieldId: 'custrecord_pct_sc_wi_itemlink_wo',
                    //     value: assemblyItem
                    // })



                    WOrecordData.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo',
                        fieldId: 'custrecord_pct_str_link_field_wo',
                        value: recordId
                    })

                    WOrecordData.commitLine({
                        sublistId: 'recmachcustrecord_pct_str_link_field_wo'
                    })

                }
                //END COPY WORK INSTRUCTION


                WOrecordData.save()
            }
        } catch (e) {
            var myCustomError = {
                name: 'Something Wrong',
                message: e.message
            }
            throw myCustomError;

        }

    }

    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
