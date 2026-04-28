/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log'], function (log) {

    function beforeLoad(context) {

    }

    function beforeSubmit(context) {
        if (context.type == context.UserEventType.EDIT) {
            log.debug("IN BEFORE SUBMIT")
            var newRecord = context.newRecord;
            var oldRecord = context.oldRecord;
            for (let lineIndex = 0; lineIndex < oldRecord.getLineCount({
                sublistId: 'operation'
            }); lineIndex++) {
                let woLineOperationSequence = oldRecord.getSublistValue({
                    sublistId: 'operation',
                    fieldId: 'operationsequence',
                    line: lineIndex
                })
                let woLineOperationLaborRunTime = oldRecord.getSublistValue({
                    sublistId: 'operation',
                    fieldId: 'laborruntime',
                    line: lineIndex
                })

                log.debug({
                    title: 'PCT-PMC',
                    details: `Operation Sequence = ${woLineOperationSequence}, Labor Run Time : ${woLineOperationLaborRunTime}`
                })


                newRecord.setSublistValue({
                    sublistId: 'operation',
                    fieldId: 'laborsetuptime',
                    line: lineIndex,
                    value: oldRecord.getSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborsetuptime',
                        line: lineIndex
                    }),
                })
                newRecord.setSublistValue({
                    sublistId: 'operation',
                    fieldId: 'machinesetuptime',
                    line: lineIndex,
                    value: oldRecord.getSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machinesetuptime',
                        line: lineIndex
                    }),
                })
                newRecord.setSublistValue({
                    sublistId: 'operation',
                    fieldId: 'machineruntime',
                    line: lineIndex,
                    value: oldRecord.getSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineruntime',
                        line: lineIndex
                    }),
                })
                newRecord.setSublistValue({
                    sublistId: 'operation',
                    fieldId: 'laborruntime',
                    line: lineIndex,
                    value: oldRecord.getSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborruntime',
                        line: lineIndex
                    }),
                })

            }
        }
    }

    function afterSubmit(context) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
