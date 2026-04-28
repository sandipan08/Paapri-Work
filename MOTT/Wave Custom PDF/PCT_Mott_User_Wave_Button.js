/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/url', 'N/redirect'], function (record, log, url, redirect)
{

    function beforeLoad(context)
    {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Mott', details: "Record Id " + recId });

        if (context.type == context.UserEventType.VIEW)
        {
            context.form.addButton({
                id: 'custpage_suiteletbutton',
                label: 'Print',
                functionName: 'window.open(\"https://4946548-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2329&recordId=' + recId + '&deploy=1")'


            });

        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

