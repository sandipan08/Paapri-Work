/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(['N/log', 'N/search', 'N/record', 'N/email', 'N/runtime'], function (log, search, record, email, runtime) {

    function onAction(scriptContext) {
        let toddMcglynn = 2932;
        let stevenTreadwell = 2930;
        let recipientsMail = ['TMcGlynn@Strouse.com', 'strousetrainer@strouse.com']
        log.debug({ title: 'PCT-SC', details: "In WorkFlow OnAction Function" });
        var woLoad = scriptContext.newRecord;
        log.debug({ title: 'PCT-SC', details: woLoad });
        var recordId = woLoad.getValue({ fieldId: 'tranid' });
        log.debug({ title: 'PCT-SC', details: recordId });
        if (woLoad.getValue({
            fieldId: 'custbody_pct_sc_sop_added'
        }) && woLoad.getValue({
            fieldId: 'custbody_pct_sc_created_events'
        }) == '') {
            var createdEvent = record.create({
                type: record.Type.CALENDAR_EVENT,
                isDynamic: true
            }).setValue({
                fieldId: 'title',
                value: 'SOP ADDED Meeting - ' + recordId
            }).setValue({
                fieldId: 'startdate',
                value: woLoad.getValue({
                    fieldId: 'trandate'
                })
            }).setValue({
                fieldId: 'timedevent',
                value: false
            })
            // log.debug({ title: 'PCT-SC-Checkbox Before Save Value', details: createdEvent.getValue('sendemail') });
            createdEvent.removeLine({
                sublistId: 'attendee',
                line: 0,
            });
            // Add Aman
            createdEvent.selectNewLine({ sublistId: 'attendee' });
            createdEvent.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'attendee', value: 4 });
            createdEvent.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'sendemail', value: true });
            createdEvent.commitLine({ sublistId: 'attendee' });
            // Add Rich
            createdEvent.selectNewLine({ sublistId: 'attendee' });
            createdEvent.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'attendee', value: 411 });
            // createdEvent.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'sendemail', value: true });
            createdEvent.commitLine({ sublistId: 'attendee' });
            // Add Sandipan
            createdEvent.selectNewLine({ sublistId: 'attendee' });
            createdEvent.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'attendee', value: 310 });
            // createdEvent.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'sendemail', value: true });
            createdEvent.commitLine({ sublistId: 'attendee' });

            let createdEventId = createdEvent.save();

            // log.debug({ title: 'PCT-SC-Checkbox After Save Vakue', details: createdEvent.getValue('sendemail') });
            log.debug("PCT-SC", "Created Event : " + createdEventId);
            email.send({
                author: runtime.getCurrentUser().id,
                recipients: ['ssau@paapri.com', 'akhan@paapri.com', 'rburnette@strouse.com'],
                subject: `[EXT] SOP ADDED Meeting - ${recordId}`,
                body: `
<div><b>Title:</b> SOP ADDED Meeting - ${recordId}</div>
<div><b>Message:</b> no message</div>
<div><b>Date:</b>${woLoad.getValue({ fieldId: 'trandate' })}</div>
<div><b>Frequency:</b>One time event on ${woLoad.getValue({ fieldId: 'trandate' })}</div>
`
            })
            log.debug("PCT-SC", "Email Sent ");
            woLoad.setValue({
                fieldId: 'custbody_pct_sc_created_events',
                value: createdEventId,
                // ignoreFieldChange: true
            });
        }
    }

    return {
        onAction: onAction
    }
});
