/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/log', 'N/record'], function (log, record) {

    function pageInit(context) {
        log.debug("PCT", "In Page Init Function");
    }

    function saveRecord(context) {
        log.debug("PCT", "In Save Record Function");
        let flag = false;
        let createdForm = context.currentRecord.getValue({
            fieldId: 'createdfrom'
        });
        log.debug("PCT", createdForm);
        var woLoad = record.load({ type: record.Type.WORK_ORDER, id: createdForm })

        for (var index = 0; index < woLoad.getLineCount({ sublistId: 'links' }); index++) {
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
            alert("Please Issue the Component first !! ");
            return false;
        }
        else {
            return true;
        }
    }



    return {
        pageInit: pageInit,
        saveRecord: saveRecord,

    }
});
