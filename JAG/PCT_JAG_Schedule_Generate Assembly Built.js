/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email', 'N/runtime'], function (log, record, runtime, file, format, search, email, runtime) {

    function execute(context) {
        // if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
        log.debug("PCT-JAG", "In Master work Order Schdule");
        // ----------------- Declare All Global Variable -------------
        let masterWorkOrderComponentObj = {};
        let workOrderArray = [];
        let perQtyIssue = 0;
        let totalWorkOrderQty = 0;
        let totalMasterRecordComponentQuantity = 0;
        // ---------------------------------------------------------
        let masterWorkOrderId = runtime.getCurrentScript().getParameter({ name: 'custscript_pct_master_work_order_id' });
        log.debug("PCT-JAG", masterWorkOrderId)
        let masterWorkOrderLoad = record.load({
            type: 'customtransaction_pct_jag_master_wo',
            id: masterWorkOrderId,
            // isDynamic: true
        })
        let masterWorkOrderNo = masterWorkOrderLoad.getValue('tranid');

        // ------------------------------- Operation Start When the Status is Released -----------------------------------------------------------

        if (masterWorkOrderLoad.getValue('status') == 'Released') {
            let lotNumberArray = [];
            // ------------------------------ Create Component from from Master Work Order Start ---------------------------------------------------
            for (let issueIndex = 0; issueIndex < masterWorkOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_master_wo_issue' }); issueIndex++) {
                let componentObj = {};
                let lotObj = {}
                let componentId = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_item', line: issueIndex });
                componentObj['componentItemId'] = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_item', line: issueIndex });
                componentObj['componentItemName'] = masterWorkOrderLoad.getSublistText({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_item', line: issueIndex });
                let componentQuantity = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_qty', line: issueIndex });
                totalMasterRecordComponentQuantity += componentQuantity;
                let componentLotNoId = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_lot', line: issueIndex });
                lotObj['componentLotNoId'] = componentLotNoId
                lotObj['componentQuantity'] = componentQuantity
                lotObj['componentLotNo'] = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_lot_display', line: issueIndex })
                lotNumberArray.push(lotObj);
                componentObj['lotNumberObject'] = lotNumberArray;
                if (!(componentId in masterWorkOrderComponentObj)) {
                    masterWorkOrderComponentObj[componentId] = {}
                    masterWorkOrderComponentObj[componentId] = componentObj
                }
                else {
                    masterWorkOrderComponentObj[componentId] = componentObj
                }
            }
            log.debug("PCT-JAG", "Master Work Order Component Object : " + JSON.stringify(masterWorkOrderComponentObj));

            // -------------------------------------- masterWorkOrderComponentObj Object structure below -----------------------------
            // {
            //     "2912": {
            //         "componentItemId": "2912",
            //             "componentItemName": "Coil : 26E43AG",
            //                 "lotNumberObject": [
            //                     {
            //                         "componentLotNoId": "823",
            //                         "componentQuantity": 10,
            //                         "componentLotNo": "722125059-1"
            //                     },
            //                     {
            //                         "componentLotNoId": "960",
            //                         "componentQuantity": 8,
            //                         "componentLotNo": "LOT-210923"
            //                     }
            //                 ]
            //     }
            // }
            // ---------------------------------------------------------------------------------------------------------------------

            // ------------------------------ Create Component from from Master Work Order End ---------------------------------------------------

            // ------------------------------ Get All Work Order from the Master Work Order Start  ---------------------------------------------------
            for (var woIndex = 0; woIndex < masterWorkOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_master_work_order_details' }); woIndex++) {
                workOrderArray.push(masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_work_order_details', fieldId: 'custrecord_pct_wo_details_wo_number', line: woIndex }))
            }
            log.debug("PCT-JAG", "Work Order Array : " + workOrderArray)
            // ------------------------------ Get All Work Order from the Master Work Order End  ---------------------------------------------------

            for (let issueIndex = 0; issueIndex < masterWorkOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_master_wo_issue' }); issueIndex++) {
                let componentItem = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_item', line: issueIndex });
                // let componentQuantity = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_wo_issue', fieldId: 'custrecord_pct_master_wo_issue_qty', line: issueIndex });
                // ------------------------------- Search on Work Order to get the sum of Component Quantity Start ---------------------------
                var workorderSearchObj = search.create({
                    type: "workorder",
                    filters:
                        [
                            ["type", "anyof", "WorkOrd"],
                            "AND",
                            ["internalid", "anyof", workOrderArray],
                            "AND",
                            ["item", "anyof", componentItem]
                        ],
                    columns:
                        [

                            search.createColumn({
                                name: "quantity",
                                summary: "SUM",
                                label: "Quantity"
                            })
                        ]
                });
                var workOrderResultCount = workorderSearchObj.runPaged().count;
                log.debug("PCT-JAG", 'Work Order Count : ' + workOrderResultCount);
                if (workOrderResultCount) {
                    workorderSearchObj.run().each(function (result) {
                        totalWorkOrderQty = parseFloat(result.getValue({ name: "quantity", summary: "SUM", label: "Quantity" }));
                        return true;

                    });

                    // ------------------------------- Search on Work Order to get the sum of Component Quantity End ---------------------------
                }
            }
            // Get Per Issue Qty [Master Work Order Component Quantity Total / Work Order Component Quantity Total]
            log.debug("PCT-JAG", "Total Work Order Qty : " + totalWorkOrderQty + ", Master Work Order Component Quantity Total : " + totalMasterRecordComponentQuantity)
            perQtyIssue = totalMasterRecordComponentQuantity / totalWorkOrderQty;
            log.debug("PCT-JAG", "Per Component Quantity : " + perQtyIssue)
            for (var woIndex = 0; woIndex < masterWorkOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_master_work_order_details' }); woIndex++) {
                let workOrderId = masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_work_order_details', fieldId: 'custrecord_pct_wo_details_wo_number', line: woIndex })

                let workOrderCompletedQty = getWorkOrderCompletedQty(masterWorkOrderLoad, workOrderId)
                if (masterWorkOrderLoad.getSublistValue({ sublistId: 'recmachcustrecord_pct_master_work_order_details', fieldId: 'custrecord_pct_master_work_order_build', line: woIndex }) == '') {
                    let createdAssemblyBuildId = generateAssemblyBuild(workOrderId, masterWorkOrderNo, masterWorkOrderComponentObj, perQtyIssue, workOrderCompletedQty)

                    if (parseInt(createdAssemblyBuildId) > 0) {

                        masterWorkOrderLoad.setSublistValue({
                            sublistId: 'recmachcustrecord_pct_master_work_order_details',
                            fieldId: 'custrecord_pct_master_work_order_build',
                            line: woIndex,
                            value: createdAssemblyBuildId
                        });
                    }
                }
            }
        }
        log.debug("OPERATION DONE")
        masterWorkOrderLoad.setValue({
            fieldId: 'transtatus',
            value: 'C',
        });
        let updatedMasterWorkOrder = masterWorkOrderLoad.save()
        // record.submitFields({
        //     type: 'customtransaction_pct_jag_master_wo',
        //     id: masterWorkOrderId,
        //     values: {'status':'C'},

        // })
        log.debug("PCT_JAG", "Operation done for id : " + updatedMasterWorkOrder);
        // }

    }


    const getWorkOrderCompletedQty = (masterWorkOrderLoad, workOrderId) => {
        let woLineCount = masterWorkOrderLoad.getLineCount({
            sublistId: 'recmachcustrecord_pct_master_work_order_details'
        })
        let completedQty = 0;
        for (let woDetailsIndex = 0; woDetailsIndex < woLineCount; woDetailsIndex++) {

            let woId = masterWorkOrderLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_master_work_order_details',
                fieldId: 'custrecord_pct_wo_details_wo_number',
                line: woDetailsIndex
            })
            if (workOrderId == woId) {
                completedQty = masterWorkOrderLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_master_work_order_details',
                    fieldId: 'custrecord_pct_wo_details_completed_qty',
                    line: woDetailsIndex
                })
            }
        }
        return completedQty;
    }
    // ---------------------- Function to generate Assembly Build from Work Order Start ----------------------------
    const generateAssemblyBuild = (workorderId, masterWorkOrderNo, masterWorkOrderComponentObj, perQtyIssue, workOrderCompletedQty) => {
        let woItemArray = []
        log.debug("PCT-JAG", "IN Generate Assembly Build Function")
        let assemblyBuildRecord = record.transform({
            fromType: 'workorder',
            fromId: workorderId,
            toType: 'assemblybuild',
            isDynamic: true
        });
        let quantityToBuild = workOrderCompletedQty//assemblyBuildRecord.getValue('quantity')
        log.debug({
            title: 'quantityToBuild =' + quantityToBuild,
            details: 'workorderId =' + workorderId
        })
        if (parseInt(quantityToBuild) > 0) {
            assemblyBuildRecord.setValue({
                fieldId: 'quantity',
                value: quantityToBuild
            })
            var inventoryDetail = assemblyBuildRecord.getSubrecord('inventorydetail');
            inventoryDetail.selectNewLine('inventoryassignment');
            inventoryDetail.setCurrentSublistValue('inventoryassignment', 'receiptinventorynumber', masterWorkOrderNo);
            inventoryDetail.setCurrentSublistValue('inventoryassignment', 'quantity', quantityToBuild);
            inventoryDetail.commitLine('inventoryassignment');

            for (let assemblyBuildIndex = 0; assemblyBuildIndex < assemblyBuildRecord.getLineCount({ sublistId: 'component' }); assemblyBuildIndex++) {
                assemblyBuildRecord.selectLine({ sublistId: 'component', line: assemblyBuildIndex })
                Object.keys(masterWorkOrderComponentObj).forEach(function (element) {
                    // Checking If Item Present in Object & Item Select in Assembly Build Same or not 
                    if (masterWorkOrderComponentObj[element].componentItemId == assemblyBuildRecord.getCurrentSublistValue({ sublistId: 'component', fieldId: 'item' })) {

                        woItemArray.push(masterWorkOrderComponentObj[element].componentItemId)
                        log.debug("PCT-JAG", "Per Issue Qty : " + perQtyIssue + ", Component Select in Build Qty : " + assemblyBuildRecord.getCurrentSublistValue({ sublistId: 'component', fieldId: 'quantity' }))
                        let issueQty = assemblyBuildRecord.getCurrentSublistValue({ sublistId: 'component', fieldId: 'quantity' }) * perQtyIssue;
                        log.debug("PCT-JAG", "Issue Qty : " + issueQty)
                        assemblyBuildRecord.setCurrentSublistValue({
                            sublistId: 'component',
                            fieldId: 'quantity',
                            value: issueQty,
                        })
                        let remainingIssueQty = issueQty;
                        masterWorkOrderComponentObj[element].lotNumberObject.map((mapElement, index) => {
                            // --------------- Checking if Issue Quantity is higher than the Quantity Present in that Lot --------------------
                            let issueInvQty = 0;
                            if (remainingIssueQty > 0) {
                                let lotAvailableQty = masterWorkOrderComponentObj[element].lotNumberObject[index].componentQuantity;
                                // Checking if the sufficient amount of quantity is present in that LOT, otherwise it will take from another LOT
                                if (lotAvailableQty >= remainingIssueQty) {
                                    issueInvQty = remainingIssueQty
                                } else {
                                    issueInvQty = lotAvailableQty
                                }
                                log.debug("PCT-JAG", "Issue Qty : " + issueInvQty + ", Lot No : " + mapElement.componentLotNo + " Remaining Qty : " + remainingIssueQty)

                                if (issueInvQty > 0) {
                                    // ------------ Set the Inventory Details for the Component Line Start --------------
                                    let inventoryDetail = assemblyBuildRecord.getCurrentSublistSubrecord({
                                        sublistId: 'component',
                                        fieldId: 'componentinventorydetail',
                                    })
                                    inventoryDetail.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    })

                                    inventoryDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        value: mapElement.componentLotNoId
                                    })
                                    inventoryDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: issueInvQty
                                    })
                                    inventoryDetail.commitLine({ sublistId: 'inventoryassignment' });
                                    log.debug("PCT-JAG", "Line Committed")
                                    // ------------ Set the Inventory Details for the Component Line End --------------
                                }
                                masterWorkOrderComponentObj[element].lotNumberObject[index].componentQuantity -= issueInvQty; // subtract the issue qty from quantity present in that particular Lot
                                remainingIssueQty = remainingIssueQty - issueInvQty;
                                return;
                            }
                        })
                        assemblyBuildRecord.commitLine({ sublistId: 'component' })
                    }
                    // else { // As this Component is not present in Master Work Order Record so, we are set the quantity 0
                    //     assemblyBuildRecord.selectLine({ sublistId: 'component', line: assemblyBuildIndex })
                    //     assemblyBuildRecord.setCurrentSublistValue({
                    //         sublistId: 'component',
                    //         fieldId: 'quantity',
                    //         value: 0,
                    //     })

                    // }
                })

            }

            for (let assemblyBuildIndex = 0; assemblyBuildIndex < assemblyBuildRecord.getLineCount({ sublistId: 'component' }); assemblyBuildIndex++) {
                let assemblyId = assemblyBuildRecord.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'item',
                    line: assemblyBuildIndex
                })
                if (woItemArray.includes(assemblyId) == -1) {
                    assemblyBuildRecord.setSublistValue({
                        sublistId: 'component',
                        fieldId: 'quantity',
                        value: 0,
                    })
                }
            }
            let assemblyBuildId = assemblyBuildRecord.save();

            makeInventoryTransfer(assemblyBuildId)
            return assemblyBuildId
        }
    }
    const makeInventoryTransfer = (assemblyBuildId) => {
        let assemblyBuildObj = record.load({
            type: record.Type.ASSEMBLY_BUILD,
            id: assemblyBuildId,
            isDynamic: true
        })
        let invTransferId = assemblyBuildObj.getValue({
            fieldId: 'custbody_pct_jag_inv_transfer'
        })
        log.debug({
            title: 'invTransferId',
            details: invTransferId
        })
        if ((parseInt(invTransferId) == 0) || (invTransferId == null) || (invTransferId == '') || isNaN(invTransferId)) {
            let fromLocation = assemblyBuildObj.getValue({
                fieldId: 'location'
            })
            let toLocation = assemblyBuildObj.getValue({
                fieldId: 'custbody_pct_jag_pick_up_location'
            })
            let item = assemblyBuildObj.getValue({
                fieldId: 'item'
            })
            let quantity = assemblyBuildObj.getValue({
                fieldId: 'quantity'
            })
            log.debug({
                title: 'toLocation',
                details: toLocation
            })
            if (parseInt(fromLocation) != parseInt(toLocation)) {
                if (parseInt(toLocation) > 0) {
                    let invDetails = getInvDetailFromAssemblyBuild(assemblyBuildObj)

                    let dataObj = {}
                    dataObj.invDetails = invDetails
                    dataObj.fromLocation = fromLocation
                    dataObj.toLocation = toLocation
                    dataObj.quantity = quantity
                    dataObj.item = item
                    dataObj.assemblyBuildId = assemblyBuildId
                    createInventoryTransfer(dataObj)
                }
            }
        }
    }

    const createInventoryTransfer = (dataObj) => {

        let inventoryTransterObj = record.create({
            type: record.Type.TRANSFER_ORDER,
            isDynamic: true
        })
        inventoryTransterObj.setValue({
            fieldId: 'location',
            value: dataObj.fromLocation
        })
        inventoryTransterObj.setValue({
            fieldId: 'transferlocation',
            value: dataObj.toLocation
        })
        inventoryTransterObj.setValue({
            fieldId: 'useitemcostastransfercost',
            value: false
        })

        inventoryTransterObj.setValue({
            fieldId: 'incoterm',
            value: 1
        })

        inventoryTransterObj.selectNewLine({
            sublistId: 'item'
        })

        inventoryTransterObj.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: dataObj.item
        })//
        inventoryTransterObj.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: dataObj.quantity
        })
        // Create the subrecord for that line.
        var subrec = inventoryTransterObj.getCurrentSublistSubrecord({
            sublistId: 'item',
            fieldId: 'inventorydetail'
        });

        if (dataObj.invDetails.length > 0) {
            dataObj.invDetails.forEach(element => {

                // Add a line to the subrecord's inventory assignment sublist.
                subrec.selectNewLine({
                    sublistId: 'inventoryassignment'
                });

                subrec.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'quantity',
                    value: element.qty
                });

                subrec.setCurrentSublistText({
                    sublistId: 'inventoryassignment',
                    fieldId: 'receiptinventorynumber',
                    text: element.lot
                });

                // Save the line in the subrecord's sublist.
                subrec.commitLine({
                    sublistId: 'inventoryassignment'
                });
            });
        }

        // Save the line in the record's sublist
        inventoryTransterObj.commitLine({
            sublistId: 'item'
        });

        let invTransferId = inventoryTransterObj.save();

        record.submitFields({
            type: record.Type.ASSEMBLY_BUILD,
            id: dataObj.assemblyBuildId,
            values: {
                custbody_pct_jag_inv_transfer: invTransferId,
            }

        })


    }

    const getInvDetailFromAssemblyBuild = (assemblyBuildObj) => {
        var subrec = assemblyBuildObj.getSubrecord({
            fieldId: 'inventorydetail'
        });

        //  subrec.selectNewLine({
        //         sublistId: 'inventoryassignment',
        //  });
        let invDetailLine = subrec.getLineCount({
            sublistId: 'inventoryassignment'
        })

        let invDetailArray = []
        for (let invIndex = 0; invIndex < invDetailLine; invIndex++) {
            let invDetailObj = {}
            subrec.selectLine({
                sublistId: 'inventoryassignment',
                line: invIndex
            })
            let lot = subrec.getCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'receiptinventorynumber',
                // value: '012345'
            });
            let qty = subrec.getCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                //value: 1
            });
            invDetailObj.lot = lot
            invDetailObj.qty = qty
            invDetailArray.push(invDetailObj)
        }
        log.debug({
            title: 'invDetailArray',
            details: invDetailArray
        })
        return invDetailArray;
    }
    // ---------------------- Function to generate Assembly Build from Work Order End ----------------------------

    return {
        execute: execute
    }
});
