/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    // function beforeLoad(context) {

    // }

    // function beforeSubmit(context) {

    // }

    function afterSubmit(context) {
        log.debug("context", context);

        if (context.type == "create" || context.type == "copy") {
            var id = context.newRecord.id;
            var currentRecord = record.load({ type: "workorder", id: id, isDynamic: true });

            var itemSpecificationArray = []
            var itemId = currentRecord.getValue("assemblyitem");
            var sampleSize = currentRecord.getValue("quantity");
            var itemRecord = record.load({ type: "assemblyitem", id: itemId, isDynamic: true });
            var businessUnit = itemRecord.getValue("class")
            var itemSpecificationLineCount = itemRecord.getLineCount("recmachcustrecord_pct_drawing_spec_link_parent")
            for (var i = 0; i < itemSpecificationLineCount; i++) {
                itemRecord.selectLine({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", line: i })
                var obj = {};
                obj.operationNo = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_lhl_is_operation_no" })
                obj.version = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_ver" })
                obj.type = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_dra" })
                obj.value = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_nom" })
                obj.positiveTol = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_pto" })
                obj.negativeTol = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_mto" })
                obj.failureAlert = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_spc_failure_alert" })

                itemSpecificationArray.push(obj)
            }

            log.debug("itemSpecificationArray", itemSpecificationArray)

            var MOT = getMOTDetailsByWO(id);
            log.debug("MOT", MOT);

            for (var i = 0; i < MOT.length; i++) {
                var IQCRecord = record.create({ type: "customrecord_pct_pmc_iqc_record", isDynamic: true })
                var rowNumber = 0;
                // let j = 0;

                for (var j = 0; j < itemSpecificationArray.length; j++) {
                    if (MOT[i].sequence == itemSpecificationArray[j].operationNo) {
                        IQCRecord.setValue("custrecord_pct_pmc_iqc_part_number", itemId);
                        IQCRecord.setValue("custrecord_pct_pmc_iqc_op_seq", MOT[i].sequence)
                        IQCRecord.setValue("custrecord_pct_pmc_iqc_tran_num", MOT[i].internalId)
                        IQCRecord.setValue("custrecord_pct_pmc_iqc_revision", itemSpecificationArray[j].version)
                        IQCRecord.setValue("custrecord_pct_pmc_iqc_sample_size", sampleSize)
                        IQCRecord.setValue("custrecord_pct_pmc_iqc_lot_size", sampleSize)
                        IQCRecord.setValue("custrecordcustrecord_pct_pmc_iqc_wo", id)
                        // IQCRecord.setValue("custrecord_pct_pmc_iqc_business_unit", businessUnit)
                        IQCRecord.setValue("custrecord_pct_qms_mfg_work_center", MOT[i].manufacturingworkcenter)
                        IQCRecord.setValue("custrecord_pct_iqc_record_failure_alert", itemSpecificationArray[j].failureAlert)

                        // IQCRecord.selectNewLine({ sublistId: "recmachcustrecord_pct_ins_record_link" });
                        // rowNumber = rowNumber + 1;
                        // IQCRecord.setCurrentSublistValue({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     fieldId: "custrecord_pct_ins_rec_row",
                        //     value: rowNumber,
                        //     ignoreFieldChange: true
                        // })
                        // IQCRecord.setCurrentSublistValue({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     fieldId: "custrecord_pct_ins_rec_ver",
                        //     value: itemSpecificationArray[j].version,
                        //     ignoreFieldChange: true
                        // })
                        // IQCRecord.setCurrentSublistValue({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     fieldId: "custrecord_pct_ins_rec_neg_tol",
                        //     value: itemSpecificationArray[j].negativeTol,
                        //     ignoreFieldChange: true
                        // })
                        // IQCRecord.setCurrentSublistValue({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     fieldId: "custrecord_pct_ins_rec_po_tol",
                        //     value: itemSpecificationArray[j].positiveTol,
                        //     ignoreFieldChange: true
                        // })
                        // IQCRecord.setCurrentSublistValue({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     fieldId: "custrecord_pct_ins_rec_type",
                        //     value: itemSpecificationArray[j].type,
                        //     ignoreFieldChange: true
                        // })
                        // IQCRecord.setCurrentSublistValue({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     fieldId: "custrecord_pct_ins_rec_value",
                        //     value: itemSpecificationArray[j].value,
                        //     ignoreFieldChange: true
                        // })
                        // IQCRecord.commitLine({
                        //     sublistId: "recmachcustrecord_pct_ins_record_link",
                        //     ignoreRecalc: true
                        // })
                        break;
                    }
                }
                IQCRecord.save()
            }

        }

    }

    function getMOTDetailsByWO(id) {
        var MOT = [];
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", id],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "sequence",
                        join: "manufacturingOperationTask",
                        label: "Operation Sequence"
                    }),
                    search.createColumn({
                        name: "name",
                        join: "manufacturingOperationTask",
                        label: "Operation Name"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "manufacturingOperationTask",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "manufacturingworkcenter",
                        join: "manufacturingOperationTask",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            var obj = {}
            obj.sequence = result.getValue({
                name: "sequence",
                join: "manufacturingOperationTask",
                label: "Operation Sequence"
            })
            obj.name = result.getValue({
                name: "name",
                join: "manufacturingOperationTask",
                label: "Operation Name"
            })
            obj.internalId = result.getValue({
                name: "internalid",
                join: "manufacturingOperationTask",
                label: "Internal ID"
            })
            obj.manufacturingworkcenter = result.getValue({
                name: "manufacturingworkcenter",
                join: "manufacturingOperationTask",
                label: "manufacturingworkcenter"
            })

            MOT.push(obj)

            return true;
        });

        return MOT;
    }

    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});