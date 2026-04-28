/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {

    function afterSubmit(context) {
        log.debug({
            title: "PCT-SC",
            details: "In After Submit"
        })
        let newRecord = context.newRecord;
        if (context.type == context.UserEventType.CREATE) {
            let mimoId = newRecord.getValue({
                fieldId: 'custbody_pct_sc_linked_mimo'
            })
            log.debug("PCT-SC", newRecord.getValue("id"))
            if (mimoId) {
                var updatedMimoId = record.submitFields({
                    type: 'customrecord_pct_api_recycle',
                    id: mimoId,
                    values: {
                        'custrecord_pct_api_work_order': newRecord.getValue("id")
                    }
                });
            }
            log.debug("PCT-SC", "Updated MIMO Id : " + updatedMimoId)
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});
