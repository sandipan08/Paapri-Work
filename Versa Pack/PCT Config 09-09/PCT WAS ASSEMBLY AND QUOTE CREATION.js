/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(["N/record", "N/search", 'N/runtime'], function (record, search, runtime) {

    function onAction(scriptContext) {
        try {
            var newRecord = scriptContext.newRecord;
            var CustomRecordId = newRecord.id;

            var createQuote = runtime.getCurrentScript().getParameter({
                name: 'custscript_pct_cpq_create_quote'
            });
            log.debug({
                title: 'createQuote',
                details: createQuote
            })

            let configRecordObj = record.load({
                type: 'customrecord_pct_configure',
                id: CustomRecordId,
                isDynamic: true
            })
            
            let assemblyName = configRecordObj.getValue({ fieldId: 'name' })
            // let assemblyName = configRecordObj.getValue({ fieldId: 'altname' })
            let customer = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_customer' })
            let customerPartNumber = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_cust_part_number' })
            let orderQty = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_order_qty' })
            let estimateNumber = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_linked_quote_no' })
            let salePrice = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_final_selling_price' })
            let purchasePrice = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_item_unit_cost' })
            let subsidiary = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_subsidiary' })
            let location = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_location' })
            let assemblyItemDesc = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_item_desc' })
            let assemblyItemUnitType = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_ass_unit_type' })
            let assemblyItemSalesUnit = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_ass_sales_unit' })
            let custQty = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_cust_qty' })
            let custUom = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_cust_uom' })
            let custRate = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_cust_rate' })
            let compliance = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_compliance' })
            let firstPieceAudit = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_first_piece_aud' })
            let salesRep = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_sales_rep_field' })



            // Get Production Order Details Fields
            let line = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_line' })
            let totalBagQuantity = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_bq' })
            let typeOfPackaging = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_type_of_packag' })
            let label = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_label' })

            // Get PRODUCT DESCRIPTION Fields
            let bubleSize = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_bs' })
            let productType = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_product_type' })
            let weightPerCTNRoll = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_wght_ctn_fie' })
            let rollDiameter = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_roll_diam' })
            let mil = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_mil' })
            let bagSheetDesc = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_bosd' })

            // Get SETUP DESCRIPTION Fields
            let perCtnRoll = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_per_ctn_roll' })
            let fda = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_fda' })
            let vent = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_vent' })
            let ventType = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_vent_type' })
            let ventPattern = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_vent_pattern' })
            let filmColor = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_film_color' })
            let filmOpacity = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_film_opacity' })
            let filmColorNotes = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_film_color_note' })
            let print = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_print' })
            let printPlateNumber = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_print_plate_number' })
            let PrintColor = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_color_prin' })
            let printInstruction = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_print_ins' })
            let printImage = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_print_image' })
            let treated = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_treated' })
            let treatDesc = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_treat_descripti' })
            let dyneLevel = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_dyne_level' })
            let treatNotes = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_treat_notes' })
            let slipLevel = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_slip_level' })
            let wind = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_wind' })
            let resinBlendAdditives = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_resin_blend_add' })
            let extraSetupNotes = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_extra_setup_not' })

            // Get PACKAGING INSTRUCTIONS Fields  
            let coreThickness = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_core_thickness' })
            let coreDiameter = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_core_diameter' })
            let coreQty = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_core_qty' })
            let coreSize = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_cs' })
            let cartonSize = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_confog_po_carton' })
            let cartonQuantity = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_cc' })
            let individualBoxRollsInCartons = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_ib' })
            let cartonCaps = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_carton_caps' })
            let corePlugs = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_cp' })
            let rollWrap = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_roll_wrap' })
            let cradlePAck = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_cradle' })
            let palletSize = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_pallets' })
            let quantityPerPallet = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_qty_per_pallet' })
            let weightAndRecordSkidSheet = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_wrss' })
            let officeTallySheet = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_ots' })

            let retainSamples = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_rs' })
            let sampleNotes = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_sample_notes' })
            let specialPackingInstruction = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_spe_pack_ins' })
            let notes = configRecordObj.getValue({ fieldId: 'custrecord_pct_vp_config_po_notes' })


            //GET Input Item Data 
            let itemLineCount = configRecordObj.getLineCount({ sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config' })

            let itemDataArray = [];
            for (let itemLine = 0; itemLine < itemLineCount; itemLine++) {
                let itemDataObj = {};

                configRecordObj.selectLine({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    line: itemLine
                })
                itemDataObj.item = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_items',
                })
                itemDataObj.qunatity = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_qty',
                })
                itemDataObj.layer = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_vp_config_items_layer_',
                })

                itemDataObj.layerPercentage = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_vp_config_line_layer_per',

                })
                itemDataObj.compositionPercentage = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_vp_config_item_compositio',

                })
                itemDataObj.overAllPercentage = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_vp_config_overall_per_',

                })
                itemDataObj.destinyOverAllPercentage = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_vp_config_density_overall',

                })
                itemDataObj.destiny = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_vp_config_line_density',

                })
                itemDataObj.source = 'STOCK'

                itemDataArray.push(itemDataObj)
            }
            //END GET Input Item Data \


            //GET Process Step Data 
            let processLineCount = configRecordObj.getLineCount({ sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps' })

            let processDataArray = [];
            for (let processLine = 0; processLine < processLineCount; processLine++) {
                let processDataObj = {};

                configRecordObj.selectLine({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    line: processLine
                })
                processDataObj.sequence = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_s_no',
                })
                processDataObj.operationname = configRecordObj.getCurrentSublistText({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_processes',
                })
                processDataObj.manufacturingworkcenter = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_prost_work_center',
                })
                processDataObj.manufacturingcosttemplate = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_prost_cost_temp',
                })
                processDataObj.setuptime = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_setup_time',
                })
                processDataObj.runrate = configRecordObj.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                    fieldId: 'custrecord_pct_cpq_run_time',
                })

                processDataArray.push(processDataObj)
            }
            //END Process Step Data \

            //BOM Create 
            let bomDataObj = {}
            var bomName = assemblyName + '-BOM';
            bomDataObj.bomName = bomName
            bomDataObj.subsidiary = subsidiary
            let bomId = 0;
            if (searchBom(bomName).isSuccess) {
                bomId = searchBom(bomName).data
            }
            else {
                bomId = createBom(bomDataObj)

            }
            log.debug("PCT", "BOM Id : " + bomId)
            //END OF BOM CREATE 

            //bomrevision Create 
            let bomrevisionDataObj = {}
            var revisionName = assemblyName + '-REV';
            bomrevisionDataObj.revisionName = revisionName
            bomrevisionDataObj.subsidiary = subsidiary
            bomrevisionDataObj.bomId = bomId
            bomrevisionDataObj.itemData = itemDataArray
            let revisionId = 0;
            if (searchRevison(revisionName).isSuccess) {
                revisionId = searchRevison(revisionName).data
            }
            else {
                revisionId = createBomRevision(bomrevisionDataObj)
            }
            log.debug("PCT", "BOM Rev Id : " + revisionId)


            //END OF bomrevision CREATE 


            //Routing Create 
            let routingDataObj = {}
            let routingName = assemblyName + '-RTNG';
            routingDataObj.subsidiary = subsidiary;
            routingDataObj.routingName = routingName;
            routingDataObj.bomId = bomId;
            routingDataObj.location = location;
            routingDataObj.processData = processDataArray;


            let routingId = 0;
            if (searchRouting(routingName).isSuccess) {
                routingId = searchRouting(routingName).data
            }
            else {
                routingId = createRouting(routingDataObj)
            }
            log.debug("PCT", "Routing Id : " + routingId)


            //End of Routing Create 
            let itemId = 0
            if (searchItem(assemblyName).isSuccess) {
                itemId = searchItem(assemblyName).data
                // throw error.create({
                //     name: 'MY_CUSTOM_ERROR',
                //     message: 'This record cannot be processed because of a business rule.',
                //     notifyOff: false  // Ensures the error displays as a popup alert
                // });
            }
            else {
                //CREATE LOT NUMBER ASSEMBLY ITEM

                let itemObj = record.create({
                    type: record.Type.LOT_NUMBERED_ASSEMBLY_ITEM,
                    isDynamic: true
                }).setValue({
                    fieldId: 'itemid',
                    value: assemblyName
                }).setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                }).setValue({
                    fieldId: 'taxschedule',
                    value: 1
                }).setValue({
                    fieldId: 'isspecialworkorderitem',
                    value: true
                }).setValue({
                    fieldId: 'salesdescription',
                    value: assemblyItemDesc
                }).setValue({
                    fieldId: 'description',
                    value: assemblyItemDesc
                }).setValue({
                    fieldId: 'assetaccount',
                    value: 211
                }).setValue({
                    fieldId: 'cogsaccount',
                    value: 212
                })
                // if (parseInt(assemblyItemUnitType) > 0) {
                //     itemObj.getValue({
                //         fieldId: 'unitstype',
                //         value: assemblyItemUnitType
                //     })
                //     if (parseInt(assemblyItemUnitType) > 0) {
                //         itemObj.setValue({
                //             fieldId: 'saleunit',
                //             value: assemblyItemSalesUnit
                //         })
                //     }
                // }
                itemObj.setValue({
                    fieldId: 'unitstype',
                    value: assemblyItemUnitType
                })
                // Enter VP Configure Details Fields
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_compliance', value: compliance })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_first_piece_aud', value: firstPieceAudit })
                itemObj.setValue({ fieldId: 'custitem_pct_cpq_cust_qty', value: custQty })
                itemObj.setValue({ fieldId: 'custitem_pct_cpq_cust_uom', value: custUom })
                itemObj.setValue({ fieldId: 'custitem_pct_cpq_cust_rate', value: custRate })

                // Enter Production Order Details Fields
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_line', value: line })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_bq', value: totalBagQuantity })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_type_of_packag', value: typeOfPackaging })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_label', value: label })

                // Enter PRODUCT DESCRIPTION Fields
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_bs', value: bubleSize })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_product_type', value: productType })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_wght_ctn_fie', value: weightPerCTNRoll })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_roll_diam', value: rollDiameter })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_mil', value: mil })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_bosd', value: bagSheetDesc })

                // Enter SETUP DESCRIPTION Fields
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_per_ctn_roll', value: perCtnRoll })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_fda', value: fda })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_vent', value: vent })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_vent_type', value: ventType })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_vent_pattern', value: ventPattern })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_film_color', value: filmColor })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_film_opacity', value: filmOpacity })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_film_color_note', value: filmColorNotes })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_print', value: print })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_print_plate_number', value: printPlateNumber })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_color_prin', value: PrintColor })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_print_ins', value: printInstruction })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_print_image', value: printImage })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_treated', value: treated })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_treat_descripti', value: treatDesc })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_dyne_level', value: dyneLevel })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_treat_notes', value: treatNotes })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_slip_level', value: slipLevel })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_wind', value: wind })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_resin_blend_add', value: resinBlendAdditives })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_extra_setup_not', value: extraSetupNotes })

                // Get PACKAGING INSTRUCTIONS Fields  
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_core_thickness', value: coreThickness })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_core_diameter', value: coreDiameter })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_core_qty', value: coreQty })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_cs', value: coreSize })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_confog_po_carton', value: cartonSize })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_cc', value: cartonQuantity })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_ib', value: individualBoxRollsInCartons })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_carton_caps', value: cartonCaps })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_cp', value: corePlugs })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_roll_wrap', value: rollWrap })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_cradle', value: cradlePAck })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_pallets', value: palletSize })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_qty_per_pallet', value: quantityPerPallet })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_wrss', value: weightAndRecordSkidSheet })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_ots', value: officeTallySheet })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_rs', value: retainSamples })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_sample_notes', value: sampleNotes })
                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_spe_pack_ins', value: specialPackingInstruction })

                itemObj.setValue({ fieldId: 'custitem_pct_vp_config_po_notes', value: notes })


                itemObj.selectNewLine({
                    sublistId: 'billofmaterials'
                })
                itemObj.setCurrentSublistValue({
                    sublistId: 'billofmaterials',
                    fieldId: 'billofmaterials',
                    value: bomId
                })
                itemObj.setCurrentSublistValue({
                    sublistId: 'billofmaterials',
                    fieldId: 'masterdefault',
                    value: true
                })
                itemObj.commitLine({
                    sublistId: 'billofmaterials'
                })
                for (let locationIndex = 0; locationIndex < itemObj.getLineCount({ sublistId: 'locations' }); locationIndex++) {

                    itemObj.selectLine({ sublistId: 'locations', line: locationIndex })
                    let itemLocation = itemObj.getCurrentSublistValue({ sublistId: 'locations', fieldId: 'location' })
                    // log.debug("PCT-MCI", location)
                    if (parseInt(itemLocation) == parseInt(location)) {

                        // log.debug({ title: 'PCT-MCI-IF', details: itemObj.getCurrentSublistValue({ sublistId: 'locations', fieldId: 'isWip' }) })
                        itemObj.setCurrentSublistValue({
                            sublistId: 'locations',
                            fieldId: 'iswip',
                            value: true
                        })
                        itemObj.commitLine({
                            sublistId: 'locations'
                        })
                        break;
                    }
                }

                //Price Set
                // itemObj.selectLine({
                //     sublistId: 'price1',
                //     line: 0
                // });

                let priceId = 'price1';
                // log.debug("Currency:", priceId);



                itemObj.selectLine(priceId, 0); //Base Price

                itemObj.setCurrentMatrixSublistValue(priceId, 'price', 0, salePrice);
                itemObj.commitLine(priceId);


                // itemObj.setMatrixSublistValue({
                //     sublistId: 'price1',
                //     fieldId: 'price_1_',
                //     column: 0,
                //     line: 1,
                //     value: salePrice
                // });
                // itemObj.commitLine({
                //     sublistId: 'price1'
                // });

                itemId = itemObj.save()
                log.debug("PCT", "Newly Created Item : " + itemId)
                uncheckAvailableForAllAssemblies(bomId)
                // END OF LOT NUMBER ASSEMBLY ITEM
            }

            if (customerPartNumber != '') {
                createCustomerPartNumber(customer, itemId, customerPartNumber)
            }
            let estimateRecordId = 0;

            if (createQuote == true) {
                let estimateObj = record.create({
                    type: record.Type.ESTIMATE,
                    isDynamic: true
                }).setValue({
                    fieldId: 'entity',
                    value: customer
                }).setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                }).setValue({
                    fieldId: 'location',
                    value: location
                }).setValue({
                    fieldId: 'salesrep',
                    value: salesRep
                })
                /*8.setText({
                    fieldId: 'shipcarrier',
                    value: nonups
                }).setValue({
                    fieldId: 'shippingcost',
                    value: 0
                })*/

                estimateObj.selectNewLine({
                    sublistId: 'item'
                })
                estimateObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                })
                estimateObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: salePrice
                })
                estimateObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: orderQty
                })
                estimateObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_vp_cust_qty',
                    value: custQty
                })
                estimateObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_vp_cust_rate',
                    value: custRate
                })
                estimateObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_vp_cust_uom',
                    value: custUom
                })
                estimateObj.commitLine({
                    sublistId: 'item'
                })


                estimateRecordId = estimateObj.save()
            }


            //BOM REV ITEM DATA SET IN CONFIG RECORD
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_bom', value: bomId })
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_revision', value: revisionId })
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_routing', value: routingId })
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_itemno', value: itemId })
            if (parseInt(estimateRecordId) > 0) {
                configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_quote_no', value: estimateRecordId })
            }
            configRecordObj.save();
            //BOM REV ITEM DATA SET IN CONFIG RECORD
        } catch (e) {

            var myCustomError = {
                name: 'Something Wrong',
                message: e.message
            }
            throw myCustomError;
        }




    }

    const createRouting = (routingDataObj) => {
        let routingObj = record.create({
            type: record.Type.MANUFACTURING_ROUTING,
            isDynamic: true
        }).setValue({
            fieldId: 'subsidiary',
            value: routingDataObj.subsidiary
        }).setValue({
            fieldId: 'billofmaterials',
            value: routingDataObj.bomId
        }).setValue({
            fieldId: 'location',
            value: routingDataObj.location
        }).setValue({
            fieldId: 'name',
            value: routingDataObj.routingName
        }).setValue({
            fieldId: 'isdefault',
            value: true
        })

        routingDataObj.processData.forEach(routingData => {
            routingObj.selectNewLine({
                sublistId: 'routingstep'
            })
            routingObj.setCurrentSublistValue({
                sublistId: 'routingstep',
                fieldId: 'operationsequence',
                value: routingData.sequence
            })
            routingObj.setCurrentSublistValue({
                sublistId: 'routingstep',
                fieldId: 'operationname',
                value: routingData.operationname
            })
            routingObj.setCurrentSublistValue({
                sublistId: 'routingstep',
                fieldId: 'manufacturingworkcenter',
                value: routingData.manufacturingworkcenter
            })
            routingObj.setCurrentSublistValue({
                sublistId: 'routingstep',
                fieldId: 'manufacturingcosttemplate',
                value: routingData.manufacturingcosttemplate
            })
            routingObj.setCurrentSublistValue({
                sublistId: 'routingstep',
                fieldId: 'setuptime',
                value: routingData.setuptime
            })
            routingObj.setCurrentSublistValue({
                sublistId: 'routingstep',
                fieldId: 'runrate',
                value: routingData.runrate
            })
            routingObj.commitLine({
                sublistId: 'routingstep'
            })

        })
        return routingObj.save();
    }

    const uncheckAvailableForAllAssemblies = (bomId) => {
        var bomRec = record.load({
            type: record.Type.BOM,
            id: bomId,
            isDynamic: true
        });

        // Uncheck the "Available For All Assemblies" checkbox
        bomRec.setValue({
            fieldId: 'availableforallassemblies',
            value: false
        });

        // Save the record
        var updatedId = bomRec.save();

        log.debug('BOM updated successfully', 'ID: ' + updatedId);
    }
    const createBom = (bomDataObj) => {
        return record.create({
            type: record.Type.BOM,
            isDynamic: true
        }).setValue({
            fieldId: 'name',
            value: bomDataObj.bomName
        }).setValue({
            fieldId: 'availableforalllocations',
            value: true
        }).setValue({
            fieldId: 'availableforallassemblies',
            value: true
        }).setValue({
            fieldId: 'subsidiary',
            value: bomDataObj.subsidiary
        }).save()

    }

    const createBomRevision = (bomrevisionDataObj) => {
        let revObj = record.create({
            type: record.Type.BOM_REVISION,
            isDynamic: true
        }).setValue({
            fieldId: 'name',
            value: bomrevisionDataObj.revisionName
        }).setValue({
            fieldId: 'billofmaterials',
            value: bomrevisionDataObj.bomId
        })

        bomrevisionDataObj.itemData.forEach(itemData => {

            revObj.selectNewLine({
                sublistId: 'component'
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'item',
                value: itemData.item
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'bomquantity',
                value: itemData.qunatity
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'itemsource',
                value: itemData.source
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_vp_rev_layer_field',
                value: itemData.layer
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_vp_rev_layer_percentage',
                value: itemData.layerPercentage
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_vp_rev_comp_per',
                value: itemData.compositionPercentage
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_vp_rev_density_field',
                value: itemData.destiny
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_vp_rev_overall_per_field',
                value: itemData.overAllPercentage
            })
            revObj.setCurrentSublistValue({
                sublistId: 'component',
                fieldId: 'custrecord_pct_vp_rev_den_over_formula_f',
                value: itemData.destinyOverAllPercentage
            })
            revObj.commitLine({
                sublistId: 'component'
            })
        });
        return revObj.save()

    }

    const searchBom = (bomName) => {
        let bomId = 0;
        var bomSearchObj = search.create({
            type: "bom",
            filters:
                [
                    ["name", "is", bomName],
                    "AND",
                    ["restricttoassemblies", "noneof", "@NONE@"]
                ],
            columns: []

        });
        var searchResultCount = bomSearchObj.runPaged().count;
        log.debug("bomSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            bomSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                bomId = result.id
                return true;
            });
            return { 'isSuccess': true, 'data': bomId }
        }
        else
            return { 'isSuccess': false, 'errorMessage': 'BOM Not Found' }
    }

    const searchRevison = (bomRevName) => {
        let bomRevId = 0;
        var bomSearchObj = search.create({
            type: "bomrevision",
            filters:
                [
                    ["name", "is", bomRevName]
                ],
            columns: []

        });
        var searchResultCount = bomSearchObj.runPaged().count;
        log.debug("bom rev result count", searchResultCount);
        if (searchResultCount > 0) {
            bomSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                bomRevId = result.id
                return true;
            });
            return { 'isSuccess': true, 'data': bomRevId }
        }
        else
            return { 'isSuccess': false, 'errorMessage': 'BOM Rev Not Found' }
    }

    const searchRouting = (routingName) => {
        let routingId = 0;
        var bomSearchObj = search.create({
            type: "manufacturingrouting",
            filters:
                [
                    ["name", "is", routingName]
                ],
            columns: []

        });
        var searchResultCount = bomSearchObj.runPaged().count;
        log.debug("routing result count", searchResultCount);
        if (searchResultCount > 0) {
            bomSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                routingId = result.id
                return true;
            });
            return { 'isSuccess': true, 'data': routingId }
        }
        else
            return { 'isSuccess': false, 'errorMessage': 'Routing Not Found' }
    }

    const searchItem = (itemName) => {
        let itemId = 0;
        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["name", "is", itemName],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns: []
        });
        var searchResultCount = assemblyitemSearchObj.runPaged().count;
        log.debug("assemblyitemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            assemblyitemSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                itemId = result.id
                return true;
            });
            return { 'isSuccess': true, 'data': itemId }
        }
        else
            return { 'isSuccess': false, 'errorMessage': 'Item Not Found' }
    }

    const createCustomerPartNumber = (customerId, itemId, partNumber) => {
        var customRec = record.create({
            type: 'customrecord_scm_customerpartnumber', // Replace with your record type ID
            isDynamic: true
        });
        customRec.setValue({ fieldId: 'custrecord_scm_cpn_item', value: itemId });
        customRec.setValue({ fieldId: 'custrecord_scm_cpn_customer', value: customerId });
        customRec.setValue({ fieldId: 'name', value: partNumber });

        var recId = customRec.save();
        log.debug('Customer Part Number Record Created', 'ID: ' + recId);
    }

    return {
        onAction: onAction
    }
});
