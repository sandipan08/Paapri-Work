/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget'], function (log, record, search, serverWidget) {


    function beforeLoad(context) {
        log.debug("PCT", "In Before Load Function");
        if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.VIEW) {
            let flag = false;
            var newRecord = context.newRecord;
            var form = context.form;
            let linkedTransactionCount = newRecord.getLineCount({ sublistId: 'links' });
            var woLoad = record.load({ type: record.Type.WORK_ORDER, id: newRecord.getValue('id') })
            log.debug("PCT", newRecord.getValue('id'));
            log.debug("PCT", linkedTransactionCount);

            for (var index = 0; index < linkedTransactionCount; index++) {
                let recordType = woLoad.getSublistValue({
                    sublistId: 'links',
                    fieldId: 'type',
                    line: index
                });
                log.debug("PCT", recordType);
                if (recordType == 'Work Order Issue') {
                    flag = true;
                }

            }

            if (!flag) {
                form.removeButton('entercompletion');
                form.removeButton('entercompletionwithbackflush');
            }
        }
    }







    function beforeSubmit(context) {

    }

    function afterSubmit(context) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
