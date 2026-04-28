

/**
*              //////////     Popular Create Print Button in Transporter/Party Receipt      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2021-12-29 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for Create Print Button in Transporter/Party Receipt , you can redistribute
               it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
               published by the Paapri's TEAM INNOVATION.

*@description  This UserEventScript is used to Create Print Button in Transporter/Party Receipt       
*/

define(['N/record', 'N/log', 'N/url', 'N/redirect'], function (record, log, url, redirect)
{

    function beforeLoad(context)
    {
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-PP', details: "Record Id " + recId });



        if (context.type == context.UserEventType.VIEW)
        {
            context.form.addButton({
                id: 'custpage_pct_pp_tr',
                label: 'Print',
                functionName: 'window.open(\"https://7255402.app.netsuite.com/app/site/hosting/scriptlet.nl?script=494&recordId=' + recId + '&deploy=1")'
                //  functionName: 'window.open(\"https://7255402.app.netsuite.com/app/site/hosting/scriptlet.nl?script=494&recordId=' + recId + '&deploy=1")'
            });

        }

    }

    return {
        beforeLoad: beforeLoad
    }
});

