/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log'], function (log) {

    function beforeLoad(context) {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Carbon', details: "Record Id " + recId });

        if (context.type == context.UserEventType.VIEW) {
            context.form.addButton({
                id: 'custpage_suiteletbutton',
                label: 'Print COC',
                functionName: 'window.open(\"https://4309238.app.netsuite.com/app/site/hosting/scriptlet.nl?script=160&recordId=' + recId + '&deploy=1")'
            });
        }
    }

    return {
        beforeLoad
    }
});

