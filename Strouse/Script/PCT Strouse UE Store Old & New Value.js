/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/log'], function (log) {

    function beforeSubmit(context) {
        if (context.type !== context.UserEventType.CREATE) {
            var oldRec = context.oldRecord;
            var sublistId = 'routingstep';

            var lineCount = oldRec.getLineCount({ sublistId: sublistId });

            for (var i = 0; i < lineCount; i++) {
                var oldOpName = oldRec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'operationname', // Change as needed
                    line: i
                });

                log.debug('OLD Operation Name - Line ' + i, oldOpName);
            }
        }
    }

    function afterSubmit(context) {
        var newRec = context.newRecord;
        var sublistId = 'routingstep';

        var lineCount = newRec.getLineCount({ sublistId: sublistId });

        for (var i = 0; i < lineCount; i++) {
            var newOpName = newRec.getSublistValue({
                sublistId: sublistId,
                fieldId: 'operationname', // Change as needed
                line: i
            });

            log.debug('NEW Operation Name - Line ' + i, newOpName);

            if (context.type !== context.UserEventType.CREATE) {
                var oldOpName = context.oldRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'operationname',
                    line: i
                });

                if (oldOpName !== newOpName) {
                    log.audit('Sublist Change', 'Line ' + i + ' operationname changed from "' + oldOpName + '" to "' + newOpName + '"');
                }
            }
        }
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
