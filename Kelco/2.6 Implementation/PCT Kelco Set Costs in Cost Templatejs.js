/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {

    function beforeSubmit(context) {
        log.debug({
            title: "PCT-Kelco",
            details: "In After Submit"
        })
        let machineSetupCost = 0, machineRunCost = 0;
        let newRecord = context.newRecord;
        // if (context.type == context.UserEventType.CREATE) {
        let costDetailsCount = newRecord.getLineCount({
            sublistId: 'costdetail'
        })
        log.debug(costDetailsCount)
        for (let costIndex = 0; costIndex < costDetailsCount; costIndex++) {
            let itemName = newRecord.getSublistValue({
                sublistId: 'costdetail',
                fieldId: 'item_display',
                line: costIndex
            });

            if (itemName.includes("MR")) {
                machineRunCost += newRecord.getSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'runrate',
                    line: costIndex
                });
            }
            else if (itemName.includes("MS")) {
                machineSetupCost += newRecord.getSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'fixedrate',
                    line: costIndex
                });
            }
            else if (itemName.includes("LR")) {
                machineRunCost += newRecord.getSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'runrate',
                    line: costIndex
                });
            }
            else if (itemName.includes("LS")) {
                machineSetupCost += newRecord.getSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'fixedrate',
                    line: costIndex
                });
            }
            log.debug("PCT-Kelco", costIndex + "-Total Run Cost : " + machineRunCost + ", Total Setup Cost : " + machineSetupCost);
        }
        log.debug("PCT-Kelco", "Total Run Cost : " + machineRunCost + ", Total Setup Cost : " + machineSetupCost);
        newRecord.setValue({
            fieldId: 'custrecord_pct_kelco_manufacturing_setup',
            value: machineSetupCost,
            // ignoreFieldChange: true
        }).setValue({
            fieldId: 'custrecord_pct_kelco_manufacturing_run',
            value: machineRunCost,
            // ignoreFieldChange: true
        });
        log.debug("PCT-Kelco", "Value Updated");

        // }
    }
    return {
        beforeSubmit: beforeSubmit,
    }
});
