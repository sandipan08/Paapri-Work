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
            if (newRecord.getValue({
                fieldId: 'custbody_pct_sc_req_product_meet'
            })) {
                var createdEvent = record.create({
                    type: record.Type.CALENDAR_EVENT,
                    isDynamic: true
                }).setValue({
                    fieldId: 'title',
                    value: 'REQUIRES PRODUCT MEETING'
                }).setValue({
                    fieldId: 'startdate',
                    value: newRecord.getValue({
                        fieldId: 'trandate'
                    })
                }).setValue({
                    fieldId: 'timedevent',
                    value: false
                }).save()
                log.debug("PCT-SC", "Created Event : " + createdEvent)
                newRecord.setValue({
                    fieldId: 'custbody_pct_sc_created_events',
                    value: createdEvent,
                    // ignoreFieldChange: true
                });
            }
        }
    }



    return {
        beforeSubmit: beforeSubmit
    }
});
