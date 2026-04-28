/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function () {

    function beforeLoad(context) {
        log.debug("PCT-SC", "In Before Load Function")
    }

    function beforeSubmit(context) {
        log.debug({
            title: "PCT-SC",
            details: "In Before Submit"
        })
        let newRecord = context.newRecord;
        // if (context.type == context.UserEventType.CREATE) {
        let subRecord = newRecord.getSubrecord({
            fieldId: 'inventorydetail'
        })
        log.debug("PCT-SC", subRecord)
        if ('id' in subRecord) {
            for (let invIndex = 0; invIndex < subRecord.getLineCount({
                sublistId: 'inventoryassignment'
            }); invIndex++) {
                subRecord.setSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'inventorystatus',
                    line: invIndex,
                    value: 2,
                })
            }
        }
        // }
    }

    function afterSubmit(context) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
