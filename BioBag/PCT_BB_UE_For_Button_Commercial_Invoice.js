/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/url', 'N/redirect'], function (record, log, url, redirect)
{

    function beforeLoad(context)
    {
        log.debug("PCT-BB", "In User Event");
        var recId = context.newRecord.id;
        var recType = context.newRecord.type
        log.debug({ title: 'PCT-BB', details: "Record Id " + recId + ", Type : " + recType });
        if (recType == "invoice")
        {
            if (context.type == context.UserEventType.VIEW)
            {
                context.form.addButton({
                    id: 'custpage_suiteletbutton_commercialinvoice_invoice',
                    label: 'Print Commercial Invoice',
                    functionName: 'window.open(\"https://3310509.app.netsuite.com/app/site/hosting/scriptlet.nl?script=575&recId=' + recId + '&deploy=1")'
                });

            }
        }
        else if (recType == "salesorder")
        {
            if (context.type == context.UserEventType.VIEW)
            {
                context.form.addButton({
                    id: 'custpage_suiteletbutton_commercialinvoice_so',
                    label: 'Print Commercial Invoice',
                    functionName: 'window.open(\"https://3310509.app.netsuite.com/app/site/hosting/scriptlet.nl?script=577&recId=' + recId + '&deploy=1")'
                });

            }
        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

