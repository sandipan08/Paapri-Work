/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search',], (record, runtime, search) => {

    function beforeLoad(context) {
        log.debug({
            title: "PCT-Patriot",
            details: "In Page Init"
        })
    }

    function beforeSubmit(context) {
        log.debug({
            title: "PCT-Patriot",
            details: "In Before Submit"
        })

    }

    function afterSubmit(context) {
        log.debug({
            title: "PCT-Patriot",
            details: "In After Submit"
        })
        let outSourceLocation = 9;
        if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
            let newRecord = context.newRecord;
            let itemObjArray = [];


            var itemCount = newRecord.getLineCount({ sublistId: 'item' });
            for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                let itemId = newRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: itemIndex
                });
                let itemSource = newRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: itemIndex
                });

                if (itemSource == 'Assembly') {
                    var fieldLookUp = search.lookupFields({
                        type: search.Type.ASSEMBLY_ITEM,
                        id: itemId,
                        columns: ['preferredlocation']
                    });
                    // log.debug({
                    //     title: "PCT-Patriot",
                    //     details: fieldLookUp.preferredlocation[0].value
                    // })
                    if (fieldLookUp.preferredlocation[0].value == outSourceLocation) {
                        let workOrder = record.create({
                            type: record.Type.WORK_ORDER,
                            isDynamic: true
                        }).setValue({
                            fieldId: 'assemblyitem',
                            value: itemId
                        }).setValue({
                            fieldId: 'location',
                            value: fieldLookUp.preferredlocation[0].value
                        }).save();
                        log.debug({
                            title: "PCT-Patriot",
                            details: "Created Work Order : " + workOrder
                        })
                        if (workOrder) {
                            let itemObj = {
                                'itemId': itemId,
                                'createdWorkOrder': workOrder,
                                'mainWorkOrder': newRecord.getValue('id')
                            }
                            itemObjArray.push(itemObj)
                        }
                    }
                }

            }
            log.debug({
                title: "PCT-Patriot",
                details: itemObjArray
            })
            itemObjArray.forEach(element => {
                var workOrder = record.load({
                    type: record.Type.WORK_ORDER,
                    id: element.mainWorkOrder,
                    isDynamic: true
                });
                var targetItemId = element.itemId; // Replace with the item ID you want to check
                var sublistId = 'item'; // Sublist internal ID in work order
                var sublistFieldId = 'custcol_pct_patriot_linked_wo'; // Replace with the actual custom field ID


                for (var updatedItemIndex = 0; updatedItemIndex < workOrder.getLineCount({ sublistId: sublistId }); updatedItemIndex++) {
                    var itemId = workOrder.getSublistValue({
                        sublistId: sublistId,
                        fieldId: 'item',
                        line: updatedItemIndex
                    });

                    if (itemId == targetItemId) { // Condition: If this specific item exists
                        workOrder.selectLine({ sublistId: sublistId, line: updatedItemIndex });
                        workOrder.setCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: sublistFieldId,
                            value: element.createdWorkOrder // Set the new value
                        });
                        workOrder.commitLine({ sublistId: sublistId });
                        log.debug("Updated Sublist", "Updated field for item ID: " + itemId);
                    }
                }
                workOrder.save();
                log.debug("Work Order Updated", "Work Order ID: " + workOrder);
            })
        }
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
