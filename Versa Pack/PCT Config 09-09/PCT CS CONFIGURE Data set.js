/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@author       Rajesh Nandi
 *@since        2024-05-01 yyyy-MM-dd
 *@copyright    Paapri Cloud Technology
 *@license      This ClientScript script is for set new Item name based on item name 

*@description  This ClientScript is designed to update the item name based on certain conditions. If the item name is not custom or custom lot numbered, it will duplicate the item name into the new item name field. Otherwise, it will leave the field value blank. 
Process Cost calculate
 */
define(["N/record", "N/search", 'N/error'], function (record, search, error
) {

    function pageInit(context) {

    }

    function saveRecord(context) {
        let badSheetDesc = context.currentRecord.getValue('custrecord_pct_vp_config_po_bosd'); // Replace with the ID of your mandatory field
        if (!badSheetDesc.includes("X"))
            throw error.create({
                name: 'WRONG FORMATTING',
                message: 'Please enter the Bag or Sheet Description value in "value x value x value x value" format '
            });
        return true;
    }

    function validateField(context) {

    }

    function fieldChanged(context) {
        try {
            var currentRecord = context.currentRecord;
            var sublistId = context.sublistId;
            var sublistFieldName = context.fieldId;
            // if (sublistId === 'recmachcustrecord_pct_cpq_linkpctconfprocesteps' && (sublistFieldName === 'custrecord_pct_cpq_setup_time') || (sublistFieldName === 'custrecord_pct_cpq_run_time') || (sublistFieldName === 'custrecord_pct_cpq_setup_cost') || (sublistFieldName === 'custrecord_pct_cpq_run_cost')) {
            if (sublistId === 'recmachcustrecord_pct_cpq_linkpctconfprocesteps' && (sublistFieldName === 'custrecord_pct_cpq_setup_time') || (sublistFieldName === 'custrecord_pct_cpq_run_time') || (sublistFieldName === 'custrecord_pct_cpq_setup_cost') || (sublistFieldName === 'custrecord_pct_cpq_run_cost')) {
                var totalQty = currentRecord.getValue('custrecord_pct_cpq_order_qty');
                if (totalQty == '' || totalQty == null || isNaN(totalQty) || totalQty == undefined) {
                    totalQty = 1;
                }
                let setUpTime = checkNull(currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_setup_time'
                }))
                let runUpTime = checkNull(currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_run_time'
                }))

                let setUpCost = checkNull(currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_setup_cost'
                }))
                let runCost = checkNull(currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_run_cost'
                }))

                let totalProcessCost = (setUpTime * (setUpCost/totalQty)) + (runUpTime * runCost)
                currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_process_cost',
                    value: totalProcessCost
                })
            }

            //------------------------------------- Fetch BOM Template Start --------------------------------------------------
            if (sublistFieldName == 'custrecord_pct_vp_bom_template') {
                let templateId = currentRecord.getValue({
                    fieldId: 'custrecord_pct_vp_bom_template'
                })
                if (parseInt(templateId) > 0) {

                    let itemLineCount = currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config'
                    })

                    for (let itemIndex = (itemLineCount - 1); itemIndex >= 0; itemIndex--) {
                        currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            line: itemIndex
                        })
                    }


                    let routingTemplateObj = record.load({
                        type: 'customrecord_pct_cpq_bom_template',
                        id: templateId,
                        isDynamic: true
                    })
                    let routingLineCount = routingTemplateObj.getLineCount({
                        sublistId: 'recmachcustrecord_pct_cpq_bom_list'
                    })

                    for (let routingLine = 0; routingLine < routingLineCount; routingLine++) {
                        let itemId = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_cpq_bom_item',
                            line: routingLine
                        })
                        let itemdesc = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_cpq_bom_description',
                            line: routingLine
                        })
                        let itemQty = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_cpq_bom_quantity',
                            line: routingLine
                        })
                        let unitCost = search.lookupFields({
                            type: search.Type.INVENTORY_ITEM, // or other item type like NON_INVENTORY_ITEM
                            id: itemId,
                            columns: ['costestimate'] // this usually gives the defined cost
                        }).costestimate

                        log.debug("PCT-Unit Cost", unitCost)
                        // routingTemplateObj.getSublistValue({
                        //     sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                        //     fieldId: 'custrecord_pct_cpq_bom_unit_cost',
                        //     line: routingLine
                        // })
                        let unitType = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_cpq_bom_unit_type',
                            line: routingLine
                        })
                        let layer = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_vp_bom_temp_ref',
                            line: routingLine
                        })
                        let layerPercentage = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_vp_bom_temp_layer_per',
                            line: routingLine
                        })
                        let compositionPercentage = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_vp_cn_bom_tem_comp',
                            line: routingLine
                        })
                        log.debug("compositionPercentage", compositionPercentage)
                        let overAllPercentage = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_vp_bom_temp_overall_per',
                            line: routingLine
                        })
                        log.debug("overAllPercentage", overAllPercentage)
                        let destinyOverAllPercentage = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_vp_bom_temp_den_overall',
                            line: routingLine
                        })
                        let destiny = routingTemplateObj.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_bom_list',
                            fieldId: 'custrecord_pct_vp_bom_temp_density_field',
                            line: routingLine
                        })



                        currentRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            //  line: routingLine
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_cpq_items',
                            value: itemId,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_cpq_consumption_unit',
                            value: unitType
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_cpq_new_item_desc',
                            value: itemdesc
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_cpq_qty',
                            value: itemQty,
                            ignoreFieldChange: false
                        })
                        // currentRecord.setCurrentSublistValue({
                        //     sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                        //     fieldId: 'custrecord_pct_cpq_unit_cost',
                        //     value: unitCost,
                        //     ignoreFieldChange: false
                        // })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_vp_config_items_layer_',
                            value: layer,
                            ignoreFieldChange: false
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_vp_config_line_layer_per',
                            value: layerPercentage,
                            ignoreFieldChange: false
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_vp_config_item_compositio',
                            value: compositionPercentage,
                            ignoreFieldChange: false
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_vp_config_overall_per_',
                            value: overAllPercentage.toFixed(5),
                            ignoreFieldChange: false
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_vp_config_density_overall',
                            value: destinyOverAllPercentage,
                            ignoreFieldChange: false
                        })
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_vp_config_line_density',
                            value: destiny,
                            ignoreFieldChange: false
                        })
                        currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',

                        })

                    }
                }
            }
            //------------------------------------- Fetch BOM Template End --------------------------------------------------

            // if (sublistId === 'recmachcustrecord_pct_cpq_link_to_pct_config' && (sublistFieldName === 'custrecord_pct_cpq_qty') || (sublistFieldName === 'custrecord_pct_cpq_unit_cost')) {
            //     //
            //     let qty = checkNull(currentRecord.getCurrentSublistValue({
            //         sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
            //         fieldId: 'custrecord_pct_cpq_qty'
            //     }))
            //     let unitCost = checkNull(currentRecord.getCurrentSublistValue({
            //         sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
            //         fieldId: 'custrecord_pct_cpq_unit_cost'
            //     }))

            //     currentRecord.setCurrentSublistValue({
            //         sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
            //         fieldId: 'custrecord_pct_cpq_items_total_cost',
            //         value: (qty * unitCost),
            //         // ignoreFieldChange: true,
            //         // forceSyncSourcing: true
            //     })
            // }
            //  ---------------------------------------- Calculate Total Pound Operation Start ------------------------------------------
            if (sublistFieldName == 'custrecord_pct_vp_config_po_per_ctn_roll' || sublistFieldName == 'custrecord_pct_vp_config_core_qty' || sublistFieldName == 'custrecord_pct_vp_config_carton_quantity') {
                log.debug("Calculate Total Pound Operation ")
                let totalPound = '';
                let coreQty = 1;
                let cartonQty = 1;
                let weightCtnRoll = 1;
                if (weightCtnRoll == '' || weightCtnRoll == null || isNaN(weightCtnRoll) || weightCtnRoll == undefined) {
                    weightCtnRoll = 1
                }
                if (sublistFieldName == 'custrecord_pct_vp_config_core_qty') {
                    coreQty = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_core_qty' });
                    weightCtnRoll = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_po_per_ctn_roll' })
                    if (coreQty == '' || coreQty == null || isNaN(coreQty) || coreQty == undefined) {
                        coreQty = 1
                    }

                    totalPound = coreQty * weightCtnRoll

                }
                else if (sublistFieldName == 'custrecord_pct_vp_config_carton_quantity') {
                    cartonQty = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_carton_quantity' });
                    weightCtnRoll = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_po_per_ctn_roll' })
                    if (cartonQty == '' || cartonQty == null || isNaN(cartonQty) || cartonQty == undefined) {
                        cartonQty = 1
                    }
                    totalPound = cartonQty * weightCtnRoll

                }
                else if (sublistFieldName == 'custrecord_pct_vp_config_po_per_ctn_roll') {
                    cartonQty = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_carton_quantity' });
                    weightCtnRoll = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_po_per_ctn_roll' })
                    if (cartonQty == '' || cartonQty == null || isNaN(cartonQty) || cartonQty == undefined) {
                        cartonQty = 1
                    }
                    coreQty = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_core_qty' });
                    if (coreQty == '' || coreQty == null || isNaN(coreQty) || coreQty == undefined) {
                        coreQty = 1
                    }
                    totalPound = cartonQty * weightCtnRoll * coreQty

                }
                // log.debug("cartonQty", cartonQty)
                // log.debug("coreQty", coreQty)
                // log.debug("weightCtnRoll", weightCtnRoll)
                // log.debug("totalPound", totalPound)

                currentRecord.setValue({
                    fieldId: 'custrecord_pct_vp_config_po_bq',
                    value: parseInt(totalPound)
                });

            }
            //  ---------------------------------------- Calculate Total Pound Operation End ------------------------------------------

            //  ---------------------------------------- Calculate Bubble Size Operation Start ------------------------------------------

            if (sublistFieldName == 'custrecord_pct_vp_config_po_bosd') {
                if (!currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_po_bosd' }).includes("X")) {
                    alert('Please enter the Bag or Sheet Description value in "value x value x value x value" format ')
                }
                log.debug("Calculate Bubble Size Operation")
                let bagSheetDesc = currentRecord.getValue({ fieldId: 'custrecord_pct_vp_config_po_bosd' }).split("X");
                let bubbleSize = parseFloat(bagSheetDesc[0]) + parseFloat(bagSheetDesc[1])

                currentRecord.setValue({
                    fieldId: 'custrecord_pct_vp_config_po_bs',
                    value: bubbleSize
                });
            }
            //  ---------------------------------------- Calculate Bubble Size Operation End ------------------------------------------
            //  ---------------------------------------- Margin Calculation Operation Start ------------------------------------------

            if (sublistFieldName == 'custrecord_pct_cpq_order_qty') {


                // --------------------- Total Process cost Calculation Start -------------
                var totalQty = currentRecord.getValue('custrecord_pct_cpq_order_qty');
                var lineCount = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps'
                });
                if (lineCount > 0 && totalQty > 0) {
                    for (var processIndex = 0; processIndex < lineCount; processIndex++) {

                        currentRecord.selectLine({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                            line: processIndex
                        });
                        let setUpTime = checkNull(currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                            fieldId: 'custrecord_pct_cpq_setup_time'
                        }))
                        log.debug("PCT-Set up Time", setUpTime)
                        let runUpTime = checkNull(currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                            fieldId: 'custrecord_pct_cpq_run_time'
                        }))

                        let setUpCost = checkNull(currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                            fieldId: 'custrecord_pct_cpq_setup_cost'
                        }))
                        let runCost = checkNull(currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                            fieldId: 'custrecord_pct_cpq_run_cost'
                        }))

                        let totalProcessCost = (setUpTime * (setUpCost / totalQty)) + (runUpTime * runCost)
                        //  let totalProcessCost = (setUpTime *  setUpCost) + (runUpTime * runCost)
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                            fieldId: 'custrecord_pct_cpq_process_cost',
                            value: totalProcessCost
                        })
                        currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps'
                        });
                    }
                }
                let marginCost = 0.0;
                let tolerance = 0.0;

                log.debug("Calculate Margin Size Operation")
                currentRecord.setValue({
                    fieldId: 'custrecord_pct_cpq_total_markup',
                    value: '',

                });
                currentRecord.setValue({
                    fieldId: 'custrecord_pct_cpq_margin_cost',
                    value: ''
                });
                currentRecord.setValue({
                    fieldId: 'custrecord_pct_cpq_order_tolerance',
                    value: ''
                });

                // let totalPound = currentRecord.getValue({ fieldId: 'custrecord_pct_cpq_order_qty' })

                var customrecord_pct_vp_margin_by_total_pounSearchObj = search.create({
                    type: "customrecord_pct_vp_margin_by_total_poun",
                    filters:
                        [

                            ["custrecord_pct_vp_margin_adjst_min", "lessthanorequalto", currentRecord.getValue({ fieldId: 'custrecord_pct_cpq_order_qty' })],
                            "AND",
                            [[["custrecord_pct_vp_margin_adjst_max", "isempty", ""], "OR", [["custrecord_pct_vp_margin_adjst_max", "isnotempty", ""], "AND", ["custrecord_pct_vp_margin_adjst_max", "greaterthanorequalto", currentRecord.getValue({ fieldId: 'custrecord_pct_cpq_order_qty' })]]]]

                        ],
                    columns:
                        [
                            search.createColumn({ name: "id", label: "ID" }),
                            search.createColumn({ name: "custrecord_pct_vp_margin_adjst_margin", label: "Margin" }),
                            search.createColumn({ name: "custrecord_pct_vp_margin_adjst_tolerance", label: "Tolerance" })
                        ]
                });
                var searchResultCount = customrecord_pct_vp_margin_by_total_pounSearchObj.runPaged().count;
                log.debug("customrecord_pct_vp_margin_by_total_pounSearchObj result count", searchResultCount);
                customrecord_pct_vp_margin_by_total_pounSearchObj.run().each(function (result) {
                    marginCost = result.getValue({ name: "custrecord_pct_vp_margin_adjst_margin", label: "Margin" })
                    tolerance = result.getValue({ name: "custrecord_pct_vp_margin_adjst_tolerance", label: "Tolerance" })
                    return true;
                });
                currentRecord.setValue({
                    fieldId: 'custrecord_pct_cpq_total_markup',
                    value: marginCost
                });
                currentRecord.setValue({
                    fieldId: 'custrecord_pct_cpq_margin_cost',
                    value: marginCost
                });
                currentRecord.setValue({
                    fieldId: 'custrecord_pct_cpq_order_tolerance',
                    value: tolerance
                });


            }
            //  ---------------------------------------- Margin Calculation Operation End ------------------------------------------

            //  ---------------------------------------- Margin Tolerance Calculation Operation Start ------------------------------------------

            if (context.fieldId === 'custrecord_pct_cpq_total_markup') {
                log.debug("Margin Tolerance Calculation Operation")
                const TARGET_VALUE = parseFloat(currentRecord.getValue({ fieldId: 'custrecord_pct_cpq_margin_cost' }));
                const TOLERANCE = parseFloat(currentRecord.getValue({ fieldId: 'custrecord_pct_cpq_order_tolerance' }))
                const actualValue = parseFloat(currentRecord.getValue({ fieldId: 'custrecord_pct_cpq_total_markup' }))

                const lowerLimit = (TARGET_VALUE - TOLERANCE).toFixed(3);
                const upperLimit = (TARGET_VALUE + TOLERANCE).toFixed(3);

                if (actualValue < lowerLimit || actualValue > upperLimit) {
                    alert(`❌ Value ${actualValue} is out of tolerance. Allowed range: ${lowerLimit} - ${upperLimit} !!`);
                } else {
                    console.log(`✅ Value ${actualValue} is within tolerance.`);
                }
            }

            //  ---------------------------------------- Margin Tolerance Calculation Operation End ------------------------------------------


            return true
        }
        catch (error) {
            log.debug("Catch", error.message)
        }
    }

    const checkNull = (val) => {
        if (val == '' || val == null || isNaN(val) || val == undefined) {
            val = 0
        }
        return val
    }

    function postSourcing(context) {
        var currentRecord = context.currentRecord;
        var sublistId = context.sublistId;
        var sublistFieldName = context.fieldId;
        if (sublistId === 'recmachcustrecord_pct_cpq_link_to_pct_config' && sublistFieldName === 'custrecord_pct_cpq_items') {
            let itemId = currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_items'
            })
            currentRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_consumption_unit',
                value: ''
            })
            if (parseInt(itemId) > 0) {
                let consumptionunitObj = search.lookupFields({
                    type: search.lookupFields({ type: 'item', id: itemId, columns: 'recordtype' })['recordtype'],
                    id: itemId,
                    columns: ['consumptionunit']
                })
                if (consumptionunitObj['consumptionunit'].length > 0) {
                    let consumptionunitId = consumptionunitObj['consumptionunit'][0].value
                    log.debug({
                        title: 'consumptionunit',
                        details: consumptionunitId
                    })
                    if (consumptionunitId > 0) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_cpq_consumption_unit',
                            value: consumptionunitId
                        })
                    }
                } else {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                        fieldId: 'custrecord_pct_cpq_consumption_unit',
                        value: ''
                    })
                }
                //
            }

            let itemName = currentRecord.getCurrentSublistText({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_items'
            })
            if (itemName == 'CUSTOM' || itemName == 'CUSTOM LOT NUMBERED') {
                currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_new_item',
                    value: ''
                })
            } else {
                currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_new_item',
                    value: itemName
                })
            }
        }
        return true
    }

    function lineInit(context) {

    }

    function validateDelete(context) {

    }

    function validateInsert(context) {

    }

    function validateLine(context) {


    }

    function sublistChanged(context) {

    }

    return {
        // pageInit: pageInit,
        saveRecord: saveRecord,
        // validateField: validateField,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
