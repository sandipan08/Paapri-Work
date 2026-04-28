/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {


    function beforeSubmit(context) {
        log.debug({
            title: "PCT-SC",
            details: "In Before Submit"
        })
        let newRecord = context.newRecord;

        if (context.type == context.UserEventType.CREATE) {

            newRecord.setValue({
                fieldId: 'sendemail',
                value: createdEvent,
                // ignoreFieldChange: true
            });

        }
    }



    return {
        beforeSubmit: beforeSubmit
    }
});
