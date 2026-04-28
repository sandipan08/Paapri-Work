/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([], function () {
    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var form = context.form;
            var currentRecord = context.newRecord;
            if (currentRecord.getValue({ fieldId: 'approvalstatus' }) == '1') {
                form.clientScriptModulePath = 'SuiteScripts/PCT_MCI_Change_Bill_Status.js';

                form.addButton({
                    id: 'custpage_change_status',
                    label: 'Reject',
                    functionName: 'changeTransactionStatus'
                });
            }
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});
