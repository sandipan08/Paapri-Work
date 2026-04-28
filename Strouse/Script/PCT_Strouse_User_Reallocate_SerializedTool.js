/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {

    function beforeLoad(context) {
        log.debug({
            title: "PCT-SC",
            details: "In Before Load"
        })
    }
    function beforeSubmit(context) {
        log.debug({
            title: "PCT-SC",
            details: "In Before Submit"
        })
        try {
            if (context.type == context.UserEventType.EDIT) {
                let newRecord = context.newRecord;
                let item = newRecord.getValue({
                    fieldId: 'custrecord_pct_tool_item_no'
                })
                let serializedToolText = newRecord.getText({
                    fieldId: 'custrecord_tool_srl_no'
                })
                let serializedTool = newRecord.getValue({
                    fieldId: 'custrecord_tool_srl_no'
                })
                let binNumber = newRecord.getValue({
                    fieldId: 'custrecord_pct_mott_tool_location'
                })
                let toolStatus = newRecord.getValue({
                    fieldId: 'custrecord_pct_tool_status'
                })
                log.debug("PCT-JAG", "Tool Item : " + item + ", Serialized Tool : " + serializedTool + ", Bin number : " + binNumber + ", Tool Status : " + toolStatus)
                if (parseInt(toolStatus) == 5) {
                    var newAdjust = record.create({
                        type: record.Type.INVENTORY_ADJUSTMENT,
                        isDynamic: true
                    });
                    newAdjust.setValue({
                        fieldId: 'subsidiary',
                        value: '1'
                    }).setValue({
                        fieldId: 'account',
                        value: '738'
                    });
                    newAdjust.selectNewLine({
                        sublistId: 'inventory'
                    });
                    newAdjust.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                        value: item
                    });
                    newAdjust.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location',
                        value: 1
                    });
                    newAdjust.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                        value: -1
                    });
                    let inventoryDetail = newAdjust.getCurrentSublistSubrecord({
                        sublistId: 'inventory',
                        fieldId: 'inventorydetail',
                    })
                    log.debug("PCT-SC", inventoryDetail)
                    inventoryDetail.selectNewLine({
                        sublistId: 'inventoryassignment'
                    })
                    inventoryDetail.setCurrentSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'issueinventorynumber',
                        value: serializedTool
                    })
                    inventoryDetail.setCurrentSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'binnumber',
                        value: binNumber
                    })
                    // inventoryDetail.setCurrentSublistValue({
                    //     sublistId: 'inventoryassignment',
                    //     fieldId: 'quantity',
                    //     value: -1
                    // })
                    inventoryDetail.commitLine({ sublistId: 'inventoryassignment' });
                    log.debug("PCT-SC", "Line Committed")
                    newAdjust.commitLine({
                        sublistId: 'inventory'
                    });

                    let createdAdjustment = newAdjust.save();
                    log.debug("PCT-SC", "Created Inv Adjustment : " + createdAdjustment);
                    var currentDate = new Date();
                    var dd = currentDate.getDate();
                    var mm = currentDate.getMonth() + 1;
                    var yyyy = currentDate.getFullYear();
                    var date = mm + "/" + dd + "/" + yyyy;
                    newRecord.setValue({
                        fieldId: 'name',
                        value: serializedToolText + '-' + "DNU on " + date,
                    }).setValue({
                        fieldId: 'isinactive',
                        value: true
                    })
                }

            }

        }
        catch (error) {
            log.debug({
                title: 'ERROR',
                details: error.message
            })
        }
    }





    const getSerializedQty = () => {
        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["internalid", "anyof", "262"],
                    "AND",
                    ["inventorynumber.inventorynumber", "is", "FB 93"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "quantityonhand",
                        join: "inventoryNumber",
                        label: "On Hand"
                    }),
                    search.createColumn({
                        name: "quantityavailable",
                        join: "inventoryNumber",
                        label: "Available"
                    })
                ]
        });
        var searchResultCount = assemblyitemSearchObj.runPaged().count;
        log.debug("assemblyitemSearchObj result count", searchResultCount);
        assemblyitemSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            return true;
        });

        /*
        assemblyitemSearchObj.id="customsearch1704276037442";
        assemblyitemSearchObj.title="PCT SC Item Search (copy)";
        var newSearchId = assemblyitemSearchObj.save();
        */
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,

    }
});
