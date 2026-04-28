/**
 * @author      Rehan Nawaz
 * @NScriptName PCT Work Instrutcion Set on Transcation
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * CHANGELOG 
 * -----------
 * 04-10-2023           Rehan Nawaz         Initial Commit
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {


        const afterSubmit = (context) => {
            // Get the assembly item information 
            // Search and find all work instruction associated with the assembly item.
            // Set PCT Work Instruction on trsnaction i.e. work order

            if (context.type !== context.UserEventType.CREATE) return;

            try {

                const newRecord = context.newRecord;

                const currentRecord = record.load({
                    type: 'workorder',
                    id: newRecord.id,
                    isDynamic: true
                })
                const assemblyItem = currentRecord.getValue({ fieldId: 'assemblyitem' })

                log.debug({
                    title: "assemblyItem",
                    details: assemblyItem
                })

                const assemblyItemRecord = record.load({
                    type: 'assemblyitem',
                    id: assemblyItem,
                    isDynamic: false
                });

                // Getting the work order instruction from assembly item record
                const workInstructions = [];
                const instructionLineCount = assemblyItemRecord.getLineCount({
                    sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item'
                })

                for (let idx = 0; idx < instructionLineCount; idx++) {
                    const instruction = {};

                    // instruction.folder = assemblyItemRecord.getSublistValue({
                    //     sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                    //     fieldId: 'custrecord_pct_pmc_work_ins_folder',
                    //     line: idx
                    // })

                    // instruction.fileName = assemblyItemRecord.getSublistValue({
                    //     sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                    //     fieldId: 'custrecord_pct_pmc_work_ins_file',
                    //     line: idx
                    // })

                    instruction.url = assemblyItemRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                        fieldId: 'custrecord_pct_pmc_work_instruction_url',
                        line: idx
                    })

                    instruction.operationSequence = assemblyItemRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                        fieldId: 'custrecord_pct_pmcinc_asmbly_op_seq',
                        line: idx
                    })

                    // instruction.workCenter = assemblyItemRecord.getSublistValue({
                    //     sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                    //     fieldId: 'custrecord_pct_pmcinc_workcenter',
                    //     line: idx
                    // })

                    // instruction.operationName = assemblyItemRecord.getSublistValue({
                    //     sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                    //     fieldId: 'custrecord_pct_pmcinc_asmbly_op_name',
                    //     line: idx
                    // })

                    instruction.instruction = assemblyItemRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pmcinc_asmbly_item',
                        fieldId: 'custrecord_pct_pmcinc_asmbly_instruction',
                        line: idx
                    })

                    workInstructions.push(instruction);
                }

                for (let idx = 0; idx < instructionLineCount; idx++) {

                    try {
                        const pmcWorkInstructionRecord = record.create({
                            type: "customrecord_pct_pmc_instruction",
                        }).setValue({
                            fieldId: "custrecord_pct_pmc_ins_workorder",
                            value: currentRecord.id,
                        }).setValue({
                            fieldId: "custrecord_pct_pmc_ins_item",
                            value: assemblyItem
                        }).setValue({
                            fieldId: "custrecord_pct_pmc_ins_url",
                            value: workInstructions[idx].url
                        }).setValue({
                            fieldId: "custrecord_pct_pmc_ins_op_seq",
                            value: workInstructions[idx].operationSequence
                        }).setValue({
                            fieldId: "custrecord_pct_pmc_ins_work_ins",
                            value: workInstructions[idx].instruction
                        }).save();

                        log.debug({
                            title: "pmcWorkInstructionRecord",
                            details: pmcWorkInstructionRecord
                        })

                    } catch (error) {
                        log.debug({
                            title: "Error",
                            details: error
                        })
                    }
                }

            } catch (error) {
                log.debug({
                    title: "Error",
                    details: error
                })
            }



        }

        return { afterSubmit }

    });