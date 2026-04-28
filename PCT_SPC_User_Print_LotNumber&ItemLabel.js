/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/url', 'N/redirect'], function (record, log, url, redirect)
{

    function beforeLoad(context)
    {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-Spectrum', details: "Record Id " + recId });

        if (context.type == context.UserEventType.VIEW)
        {
            context.form.addButton({
                id: 'custpage_assemblybuild_itemLabel',
                label: 'Spectrum Item Label',
                functionName: 'window.open(\"https://262176.app.netsuite.com/app/site/hosting/scriptlet.nl?script=747&recordname=' + recId + '&deploy=1")'
            });

            // context.form.addButton({
            //     id: 'custpage_assemblybuild_lotNumber',
            //     label: 'Spectrum Lot Number',
            //     functionName: 'window.open(\"https://262176.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1158&recordname=' + recId + '&deploy=1")'

            // });

        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

