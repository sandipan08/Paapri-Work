/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record'], function (log, record) {

    function beforeLoad(context) {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Kelco', details: "Record Id " + recId });
        if (context.type == context.UserEventType.VIEW) {
            var woLoad = record.load({
                type: record.Type.WORK_ORDER,
                id: recId
            });

            context.form.addButton({
                id: 'custpage_suiteletbutton',
                label: 'Print Finished Good Label',
                functionName: 'window.open(\"https://3998177-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2162&deploy=1&recordId=' + recId + '&deploy=1")'
            });
            // https://3998177-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2162&deploy=1

        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

