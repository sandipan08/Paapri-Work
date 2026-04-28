/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record'], function (log, record) {

    function beforeLoad(context) {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Strouse', details: "Record Id " + recId });
        if (context.type == context.UserEventType.VIEW) {
            var itemFulfillmentLoad = record.load({
                type: 'itemfulfillment',
                id: recId
            });
            var sign = itemFulfillmentLoad.getValue({ fieldId: 'custbody_pct_sc_emp_sign' });
            if (sign) {
                context.form.addButton({
                    id: 'custpage_suiteletbutton',
                    label: 'Print COC',
                    functionName: 'window.open(\"https://4344933.app.netsuite.com/app/site/hosting/scriptlet.nl?script=975&deploy=1&recordId=' + recId + '&deploy=1")'
                });
            }
            // context.form.addButton({
            //     id: 'custpage_fgCoreLabelButton',
            //     label: 'Print FG Core Label',
            //     functionName: 'window.open(\"https://4344933.app.netsuite.com/app/site/hosting/scriptlet.nl?script=981&deploy=1&recordId=' + recId + '&deploy=1")'
            // });

        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

