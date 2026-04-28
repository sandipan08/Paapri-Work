/**
 *@NApiVersion 2.1
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
            var type = context.newRecord.type;
            var currentRecord = record.load({ type: type, id: id, isDynamic: true });

            var supplier = currentRecord.getValue({
                fieldId: 'entity'
            })

            var itemLineCount = currentRecord.getLineCount("item");
            log.debug("itemLineCount", itemLineCount)

            for (var i = 0; i < itemLineCount; i++) {
                currentRecord.selectLine({ sublistId: "item", line: i })
                var itemId = currentRecord.getCurrentSublistValue({ sublistId: "item", fieldId: "item", line: i })
                var quantity = currentRecord.getCurrentSublistValue({ sublistId: "item", fieldId: "quantity", line: i })
                var qualityCheckReq = currentRecord.getCurrentSublistValue({ sublistId: "item", fieldId: "custcol_epc_qc_checkbox", line: i })

                if (qualityCheckReq) {
                    var itemRecord = record.load({ type: search.lookupFields({ type: 'item', id: itemId, columns: 'recordtype' })['recordtype'], id: itemId, isDynamic: true });
                    //var businessUnit = itemRecord.getValue("class");

                    var IQCRecord = record.create({ type: "customrecord_pct_pmc_iqc_record", isDynamic: true })
                    var rowNumber = 0;

                    IQCRecord.setValue({
                        fieldId: 'custrecord_pct_pmc_iqc_vendor',
                        value: supplier
                    })
                    IQCRecord.setValue({
                        fieldId: 'custrecord_pct_pmc_iqc_lot_size',
                        value: quantity
                    })

                    IQCRecord.setValue("custrecord_pct_pmc_iqc_part_number", itemId);
                    IQCRecord.setValue("custrecord_pct_lhl_item_receipt", id)
                    IQCRecord.setValue("custrecord_pct_pmc_iqc_revision", version)
 let sampleSize = 1
                    try {


                        var inventoryDetail = currentRecord.getCurrentSublistSubrecord({
                            sublistId: "item",
                            fieldId: "inventorydetail",
                        })


                        log.debug("inventoryDetail", inventoryDetail);

                        var invLine = inventoryDetail.getLineCount({
                            sublistId: "inventoryassignment",
                        });
                        log.debug("invLine", invLine)

                        for (
                            var inventoryIndex = 0;
                            inventoryIndex < invLine;
                            inventoryIndex++
                        ) {
                            inventoryDetail.selectLine({
                                sublistId: "inventoryassignment",
                                line: inventoryIndex
                            });

                            var quantity = inventoryDetail.getCurrentSublistValue({
                                sublistId: "inventoryassignment",
                                fieldId: "quantity"
                            })
                            var lotNumber = inventoryDetail.getCurrentSublistText({
                                sublistId: "inventoryassignment",
                                fieldId: "receiptinventorynumber"
                            })

                            IQCRecord.setValue("custrecord_pct_pmc_iqc_lot_num", lotNumber)
                            IQCRecord.setValue("custrecord_pct_pmc_iqc_lot_size", quantity)
                           
                            if (parseInt(quantity) > 0) {
                                sampleSize = getSampleSize(quantity)
                            }
                            if (sampleSize > 0) {
                                IQCRecord.setValue("custrecord_pct_pmc_iqc_sample_size", sampleSize)
                            } else {
                                IQCRecord.setValue("custrecord_pct_pmc_iqc_sample_size", 1)
                            }

                            log.debug("quantity**", quantity);
                            log.debug("lotNumber**", lotNumber);

                        }
                    } catch (error) {
                        log.debug("error**", error);
                    }

                    var itemSpecificationLineCount = itemRecord.getLineCount("recmachcustrecord_pct_drawing_spec_link_parent")
                    for (var j = 0; j < itemSpecificationLineCount; j++) {
                        itemRecord.selectLine({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", line: j })
                        var version = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_ver" })
                        var drawingLocation = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_loc" })
                        var type = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_dra" })
                        var value = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_nom" })
                        var positiveTol = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_pto" })
                        var negativeTol = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_mto" })
                        var uom = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_drawing_specification_uom" })
                        var testingNumber = itemRecord.getCurrentSublistValue({ sublistId: "recmachcustrecord_pct_drawing_spec_link_parent", fieldId: "custrecord_pct_lhl_no_of_testing" })
                        //


                        // IQCRecord.setValue("custrecord_pct_pmc_iqc_sample_size", 4);

                        //
                        // IQCRecord.setValue("custrecord_pct_pmc_iqc_business_unit", businessUnit)

                        for (let lineIndex = 0; lineIndex < sampleSize; lineIndex++) {
                            IQCRecord.selectNewLine({ sublistId: "recmachcustrecord_pct_ins_record_link" });
                            rowNumber = rowNumber + 1;
                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_row",
                                value: rowNumber,
                                ignoreFieldChange: true
                            })
                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_lhl_no_of_testing2",
                                value: testingNumber,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_uom",
                                value: uom,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_ver",
                                value: version,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_neg_tol",
                                value: negativeTol,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_po_tol",
                                value: positiveTol,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_type",
                                value: type,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_rec_value",
                                value: value,
                                ignoreFieldChange: true
                            })

                            IQCRecord.setCurrentSublistValue({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                fieldId: "custrecord_pct_ins_draw_loc",
                                value: drawingLocation,
                                ignoreFieldChange: true
                            })

                            IQCRecord.commitLine({
                                sublistId: "recmachcustrecord_pct_ins_record_link",
                                ignoreRecalc: true
                            })

                        }

                    }

                    // currentRecord.selectLine({sublistId: "item", line: i})



                    var IQCRecordId = IQCRecord.save();
                    log.debug("IQCRecordId " + i + " => ", IQCRecordId)

                }

            }

        }

    }

    // const getSampleSize = (totalLotSize) => {
    //     let sampleSize = 0;
    //     var customrecord_pct_cbd_iqc_sample_planSearchObj = search.create({
    //         type: "customrecord_pct_cbd_iqc_sample_plan",
    //         filters:
    //             [
    //                 ["custrecord_pct_cbd_from_iqc_sample_plan", "lessthanorequalto", totalLotSize],
    //                 "AND",
    //                 ["custrecord_pct_cbd_to_iqc_sample_plan", "greaterthanorequalto", totalLotSize],
    //                 "AND",
    //                 ["isinactive", "is", "F"]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "internalid", label: "Internal ID" }),
    //                 search.createColumn({ name: "custrecord_pct_cbd_from_iqc_sample_plan", label: "From" }),
    //                 search.createColumn({ name: "custrecord_pct_cbd_to_iqc_sample_plan", label: "To" }),
    //                 search.createColumn({ name: "custrecord_pct_cbd_size_iqc_sample_plan", label: "Sample Size" })
    //             ]
    //     });
    //     var searchResultCount = customrecord_pct_cbd_iqc_sample_planSearchObj.runPaged().count;
    //     log.debug("customrecord_pct_cbd_iqc_sample_planSearchObj result count", searchResultCount);
    //     customrecord_pct_cbd_iqc_sample_planSearchObj.run().each(function (result) {
    //         totalLotSize = result.getValue({ name: "custrecord_pct_cbd_size_iqc_sample_plan", label: "Sample Size" })
    //         return true;
    //     });

    //     return totalLotSize
    // }
    const getSampleSize = (totalLotSize) => {
        log.debug({
            title: 'totalLotSize',
            details: totalLotSize
        })
        let sampleSize = 0;
        var customrecord_pct_cbd_iqc_sample_planSearchObj = search.create({
            type: "customrecord_epc_aql_sampling",
            filters:
                [
                    ["custrecord_epc_aql_sample_size_from", "lessthanorequalto", totalLotSize],
                    "AND",
                    ["custrecord_epc_aql_sample_size_to", "greaterthanorequalto", totalLotSize],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "custrecord_epc_aql_sample_size_from", label: "From" }),
                    search.createColumn({ name: "custrecord_epc_aql_sample_size_to", label: "To" }),
                    // search.createColumn({ name: "custrecord_pct_epc_size_iqc_plan", label: "	Sample Size" })
                ]
        });
        let sampleLotSize = 0
        //  var searchResultCount = customrecord_pct_cbd_iqc_sample_planSearchObj.runPaged().count;
        //  log.debug("customrecord_pct_cbd_iqc_sample_planSearchObj result count", searchResultCount);
        customrecord_pct_cbd_iqc_sample_planSearchObj.run().each(function (result) {
            let id = result.id
            let obj = record.load({
                type: 'customrecord_epc_aql_sampling',
                id: id,
                isDynamic: true
            })
            sampleLotSize = obj.getValue('custrecord_pct_epc_size_iqc_plan')
            if (sampleLotSize > totalLotSize) {
                sampleLotSize = totalLotSize
            }
            return true;
        });

        return sampleLotSize
    }
    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});