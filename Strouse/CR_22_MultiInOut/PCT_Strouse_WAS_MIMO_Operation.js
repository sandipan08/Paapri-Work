/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(["N/record", 'N/search'], function (record, search) {

    function onAction(scriptContext) {
        let materialCost = 0, labourCost = 0;
        let outputItemCostObj = {}
        log.debug({ title: 'PCT-Strouse', details: "In Workflow Action" });
        let newRecord = scriptContext.newRecord;
        log.debug({ title: 'PCT-Strouse', details: newRecord });
        var recId = newRecord.id;
        var recType = newRecord.type;
        log.debug({
            title: "PCT-LOG",
            details: "Record Id = " + recId + ", Type : " + recType,
        });
        //Load Record
        var loadRecord = record.load({
            type: recType,
            id: recId,
        });

        // Getting Body Field values
        var recycleSerialNo = loadRecord.getValue({
            fieldId: "name",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Recycle Serial No = " + recycleSerialNo,
        });

        var location = loadRecord.getValue({
            fieldId: "custrecord_pct_api_location",
        });

        var adjAccount = loadRecord.getValue({
            fieldId: "custrecord_pct_eqs_sieve_adjust_account",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Location = " + location,
        });

        var subsidiary = loadRecord.getValue({
            fieldId: "custrecord_pct_api_subsidiary",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Subsidiary = " + subsidiary,
        });


        var adjustmentAccount = loadRecord.getValue({
            fieldId: "custrecord_pct_eqs_sieve_adjust_account",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Adjustment Account = " + adjustmentAccount,
        });
        var workOrderId = loadRecord.getValue({
            fieldId: "custrecord_pct_api_work_order",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Work Order Id = " + workOrderId,
        });
        // Creating Inventory Adjustment & Setting Body Fields
        var invAdjRec = record.create({
            type: record.Type.INVENTORY_ADJUSTMENT,
        });
        invAdjRec.setValue({
            fieldId: "subsidiary",
            value: subsidiary,
        });

        invAdjRec.setValue({
            fieldId: "adjlocation",
            value: location,
        });

        invAdjRec.setValue({
            fieldId: "account",
            value: adjAccount,
        });

        // Input Items fetch
        var inputItemCount = loadRecord.getLineCount({
            sublistId: "recmachcustrecord_pct_pct_recycle_link",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Input Item Count = " + inputItemCount,
        });

        // var allInputItemsData = new Array();

        for (
            var inputLineIndex = 0;
            inputLineIndex < inputItemCount;
            inputLineIndex++
        ) {
            // var inputItemsObject = {};
            var inputItem = loadRecord.getSublistValue({
                sublistId: "recmachcustrecord_pct_pct_recycle_link",
                fieldId: "custrecord_pct_inputs_item",
                line: inputLineIndex,
            });

            log.debug({
                title: "PCT-LOG",
                details: "Input Item = " + inputItem,
            });

            var inputLotNumber = loadRecord.getSublistValue({
                sublistId: "recmachcustrecord_pct_pct_recycle_link",
                fieldId: "custrecord_pct_inputs_lot_number",
                line: inputLineIndex,
            });

            log.debug({
                title: "PCT-LOG",
                details: "Input Lot = " + inputLotNumber,
            });

            var inputQty = loadRecord.getSublistValue({
                sublistId: "recmachcustrecord_pct_pct_recycle_link",
                fieldId: "custrecord_pct_inputs_quantity",
                line: inputLineIndex,
            });

            log.debug({
                title: "PCT-LOG",
                details: "Input Qty = " + inputQty,
            });

            var inputAvgCost = loadRecord.getSublistValue({
                sublistId: "recmachcustrecord_pct_pct_recycle_link",
                fieldId: "custrecord_pct_sc_unit_cost",
                line: inputLineIndex,
            });
            log.debug({
                title: "PCT-LOG",
                details: "Input Avg Cost = " + inputAvgCost,
            });

            materialCost += (inputAvgCost * inputQty);

            var lotLocation = getLotLocation(inputItem, inputLotNumber);
            log.debug({
                title: "PCT-LOG",
                details: "Input Lot Location = " + lotLocation['location'],
            });

            invAdjRec.setSublistValue({
                sublistId: "inventory",
                fieldId: "item",
                line: inputLineIndex,
                value: inputItem,
            });

            invAdjRec.setSublistValue({
                sublistId: "inventory",
                fieldId: "location",
                line: inputLineIndex,
                value: lotLocation['location'],
            });

            invAdjRec.setSublistValue({
                sublistId: "inventory",
                fieldId: "adjustqtyby",
                line: inputLineIndex,
                value: -inputQty,
            });

            // Setting up Inventory Detail
            var subRecord = invAdjRec.getSublistSubrecord({
                sublistId: "inventory",
                fieldId: "inventorydetail",
                line: inputLineIndex,
            });

            subRecord.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "issueinventorynumber",
                line: 0,
                value: inputLotNumber,
            });

            subRecord.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "quantity",
                line: 0,
                value: -inputQty,
            });
        }

        // Output Items Details

        var outputLineCount = loadRecord.getLineCount({
            sublistId: "recmachcustrecord_pct_api_linked_pct_sort_recyc",
        });

        log.debug({
            title: "PCT-LOG",
            details: "Output Item Count = " + outputLineCount,
        });

        var outputLotObject = {};
        log.debug("PCT", "LABOUR COST : " + getProjectedValue(workOrderId))
        labourCost = getProjectedValue(workOrderId);
        for (
            var outputLineIndex = 0;
            outputLineIndex < outputLineCount;
            outputLineIndex++
        ) {
            let slittingCost = 0, outputUnitCost = 0;

            var outputChildId = loadRecord.getSublistValue({
                sublistId: 'recmachcustrecord_pct_api_linked_pct_sort_recyc',
                fieldId: 'id',
                line: outputLineIndex
            });

            log.debug({
                title: "PCT-LOG",
                details: "Output Sublist Id = " + outputChildId,
            });

            var outputItem = loadRecord.getSublistValue({
                sublistId: "recmachcustrecord_pct_api_linked_pct_sort_recyc",
                fieldId: "custrecord_pct_api_item",
                line: outputLineIndex,
            });

            log.debug({
                title: "PCT-LOG",
                details: "Output Item  = " + outputItem,
            });

            var outputQty = loadRecord.getSublistValue({
                sublistId: "recmachcustrecord_pct_api_linked_pct_sort_recyc",
                fieldId: "custrecord_pct_api_quantity_child",
                line: outputLineIndex,
            });


            log.debug("PCT", "Material Cost : " + materialCost)
            log.debug("PCT", "Labour Cost : " + labourCost)
            slittingCost = parseFloat(labourCost) + parseFloat(materialCost);
            log.debug("PCT", "Slitting Cost : " + slittingCost)
            outputUnitCost = parseFloat(slittingCost) / outputQty;

            // var outputUnitCost = loadRecord.getSublistValue({
            //     sublistId: "recmachcustrecord_pct_api_linked_pct_sort_recyc",
            //     fieldId: "custrecord_pct_sc_unit_cost_output",
            //     line: outputLineIndex,
            // });

            log.debug({
                title: "PCT-LOG",
                details: "Output Lot Unit Cost  = " + outputUnitCost,
            });
            outputItemCostObj[outputChildId] = outputUnitCost;
            invAdjRec.setSublistValue({
                sublistId: "inventory",
                fieldId: "item",
                line: inputItemCount + outputLineIndex,
                value: outputItem,
            });

            invAdjRec.setSublistValue({
                sublistId: "inventory",
                fieldId: "location",
                line: inputItemCount + outputLineIndex,
                value: location,
            });

            invAdjRec.setSublistValue({
                sublistId: "inventory",
                fieldId: "adjustqtyby",
                line: inputItemCount + outputLineIndex,
                value: outputQty,
            });

            if (outputUnitCost)
                invAdjRec.setSublistValue({
                    sublistId: "inventory",
                    fieldId: "unitcost",
                    line: inputItemCount + outputLineIndex,
                    value: outputUnitCost.toFixed(2),
                });

            // Setting up Inventory Details
            var subRecord = invAdjRec.getSublistSubrecord({
                sublistId: "inventory",
                fieldId: "inventorydetail",
                line: inputItemCount + outputLineIndex,
            });

            subRecord.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "receiptinventorynumber",
                line: 0,
                value: recycleSerialNo + "-" + (outputLineIndex + 1),
            });

            subRecord.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "quantity",
                line: 0,
                value: outputQty,
            });

            outputLotObject[outputChildId] = recycleSerialNo + "-" + (outputLineIndex + 1);

        }

        log.debug({
            title: 'PCT-log',
            details: 'Output Lot Object = ' + JSON.stringify(outputLotObject)
        })

        var invAdjId = invAdjRec.save();
        log.debug({
            title: "PCT-LOG",
            details: "Created Adjustment Id  = " + invAdjId,
        });

        loadRecord.setValue({
            fieldId: "custrecord_pct_api_inventory_adjustment",
            value: invAdjId,
        });
        loadRecord.save();

        log.debug({
            title: "PCT-LOG",
            details: "Output Lot Object Length  = " + Object.keys(outputLotObject).length,
        });
        log.debug("PCT-Obj", JSON.stringify(outputItemCostObj))
        for (var lotSetIndex = 0; lotSetIndex < Object.keys(outputLotObject).length; lotSetIndex++) {
            // record.submitFields({
            //   type: 'customrecord_pct_api_recycle_child',
            //   id: Object.keys(outputLotObject)[lotSetIndex],
            //   values: {
            //     custrecord_pct_eqs_sieving_out_lotno:outputLotObject[Object.keys(outputLotObject)[lotSetIndex]]
            //   },
            // })

            log.debug({
                title: "PCT-LOG",
                details: "Output Lot Object key = " + Object.keys(outputLotObject)[lotSetIndex],
            });

            log.debug({
                title: "PCT-LOG",
                details: "Output Lot Object Value = " + outputLotObject[Object.keys(outputLotObject)[lotSetIndex]],
            });

            var childRecordLoad = record.load({
                type: 'customrecord_pct_api_recycle_child',
                id: Object.keys(outputLotObject)[lotSetIndex],
                isDynamic: true,
            });

            childRecordLoad.setText({
                fieldId: 'custrecord_pct_eqs_sieving_out_lotno',
                text: outputLotObject[Object.keys(outputLotObject)[lotSetIndex]]
            })
            Object.keys(outputItemCostObj).forEach(key => {
                const value = outputItemCostObj[key];
                log.debug(value, key)
                if (key == Object.keys(outputLotObject)[lotSetIndex]) {
                    childRecordLoad.setValue({
                        fieldId: 'custrecord_pct_sc_unit_cost_output',
                        value: value.toFixed(2)
                    })
                    log.debug("PCT", "GET VALUE : " + childRecordLoad.getValue({
                        fieldId: 'custrecord_pct_sc_unit_cost_output',

                    }))
                    childRecordLoad.save();
                }
            });
        }

    }

    function getLotLocation(item, lot) {
        var inventorynumberSearchObj = search.create({
            type: "inventorynumber",
            filters:
                [
                    ["item", "anyof", item],
                    "AND",
                    ["internalidnumber", "equalto", lot]
                ],
            columns:
                [
                    search.createColumn({ name: "location", label: "Location" })
                ]
        });
        var returnData = {};
        var searchResultCount = inventorynumberSearchObj.runPaged().count;
        log.debug("inventorynumberSearchObj result count", searchResultCount);
        inventorynumberSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            returnData['location'] = result.getValue({ name: "location" });
            log.debug({
                title: 'PCT-LOG',
                details: 'Location = ' + returnData['location']
            })
        });
        return returnData;

    }
    const getProjectedValue = (workOrderId) => {
        let projectedValue = 0;
        var workordercompletionSearchObj = search.create({
            type: "workordercompletion",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "WOCompl"],
                    "AND",
                    ["account", "anyof", "727"],
                    "AND",
                    ["creditamount", "greaterthan", "0.00"],
                    "AND",
                    ["createdfrom.internalid", "anyof", workOrderId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "createdfrom",
                        summary: "GROUP",
                        label: "Created From"
                    }),
                    search.createColumn({
                        name: "creditamount",
                        summary: "SUM",
                        label: "Amount (Credit)"
                    })
                ]
        });
        var searchResultCount = workordercompletionSearchObj.runPaged().count;
        log.debug("workordercompletionSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {

            workordercompletionSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                projectedValue = result.getValue({
                    name: "creditamount",
                    summary: "SUM",
                    label: "Amount (Credit)"
                })
                return true;
            });
            return projectedValue;
        }
        else {
            return projectedValue;
        }

    }

    return {
        onAction: onAction
    }
});
