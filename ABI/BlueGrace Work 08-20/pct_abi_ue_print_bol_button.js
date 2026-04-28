/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/url'], function (log, record, url) {

    function beforeLoad(context) {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Abi', details: "Record Id " + recId });
        if (context.type == context.UserEventType.VIEW) {
            let itemFulfillmentLoad = record.load({
                type: 'itemfulfillment',
                id: recId
            });
            if (itemFulfillmentLoad.getValue({ fieldId: 'custbody_bg_booking_request_number' }) != '') {
                var scriptUrl = url.resolveScript({
                    deploymentId: "customdeploy_pct_abi_sl_bg_print_bol",
                    scriptId: "customscript_pct_abi_sl_bg_print_bol",
                })
                context.form.addButton({
                    id: 'custpage_pct_print_bg_bol',
                    label: 'Print BG BOL',
                    functionName: 'window.open(\"' + scriptUrl + '&recId=' + recordId + '&recType=' + recType + '&bolNumber=' + itemFulfillmentLoad.getValue('custbody_bg_booking_request_number') + '\");'
                });

            }

        }
    }

    return {
        beforeLoad: beforeLoad
    }
});

