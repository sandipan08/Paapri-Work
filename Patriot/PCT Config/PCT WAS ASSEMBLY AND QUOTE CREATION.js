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
            let customer = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_customer' })
            let orderQty = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_order_qty' })
            let estimateNumber = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_linked_quote_no' })
            let salePrice = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_final_selling_price' })
            let purchasePrice = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_item_unit_cost' })
            let subsidiary = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_subsidiary' })
            let location = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_location' })
            let assemblyItemDesc = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_item_desc' })
            let assemblyItemUnitType = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_ass_unit_type' })
            let assemblyItemSalesUnit = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_ass_sales_unit' })


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
            let bomId = createBom(bomDataObj)
            //END OF BOM CREATE 

            //bomrevision Create 
            let bomrevisionDataObj = {}
            var revisionName = assemblyName + '-Rev';
            bomrevisionDataObj.revisionName = revisionName
            bomrevisionDataObj.subsidiary = subsidiary
            bomrevisionDataObj.bomId = bomId
            bomrevisionDataObj.itemData = itemDataArray
            let revisionId = createBomRevision(bomrevisionDataObj)
            //END OF bomrevision CREATE 


            //Routing Create 
            let routingDataObj = {}
            let routingName = assemblyName + '-Routing';
            routingDataObj.subsidiary = subsidiary;
            routingDataObj.routingName = routingName;
            routingDataObj.bomId = bomId;
            routingDataObj.location = location;
            routingDataObj.processData = processDataArray;

            let routingId = createRouting(routingDataObj)
            //End of Routing Create 


            //CREATE LOT NUMBER ASSEMBLY ITEM

            let itemObj = record.create({
                type: record.Type.ASSEMBLY_ITEM, //record.Type.LOT_NUMBERED_ASSEMBLY_ITEM,
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
                fieldId: 'description',
                value: assemblyItemDesc
            }).setValue({
                fieldId: 'salesdescription',
                value: assemblyItemDesc
            }).setValue({
                fieldId: 'purchasedescription',
                value: assemblyItemDesc
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


            //Price Set
            // itemObj.selectLine({
            //     sublistId: 'price1',
            //     line: 0
            // });

            let priceId = 'price1';
            log.debug("Currency:", priceId);



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

            let itemId = itemObj.save()
            // END OF LOT NUMBER ASSEMBLY ITEM


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
                estimateObj.commitLine({
                    sublistId: 'item'
                })


                estimateRecordId = estimateObj.save()
            }


            //BOM REV ITEM DATA SET IN CONFIG RECORD
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_bom', value: bomId })
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_revision', value: revisionId })
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_itemno', value: itemId })
            configRecordObj.setValue({ fieldId: 'custrecord_pct_cpq_linked_routing', value: routingId })
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
            revObj.commitLine({
                sublistId: 'component'
            })
        });
        return revObj.save()

    }

    return {
        onAction: onAction
    }
});
