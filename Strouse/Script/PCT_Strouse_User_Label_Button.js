/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log'], function (log) {

    function beforeLoad(context) {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Strouse', details: "Record Id " + recId });
        if (context.type == context.UserEventType.VIEW) {


            context.form.addButton({
                id: 'custpage_suiteletbutton',
                label: 'Print RM Box & Core Label',
                functionName: 'window.open(\"https://4344933.app.netsuite.com/app/site/hosting/scriptlet.nl?script=992&deploy=1&recordId=' + recId + '&deploy=1")'
            });


        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

