/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
*/
define(['N/record', 'N/log', 'N/url'], function (record, log, url) {

    function beforeLoad(context) {

       /* log.debug({
            title: 'context',
            details: context.form.title
        })
        var type = context.form.title;
        var recordType;
        var searchType;
        if(type == 'Sales Order')
        {
            recordType = 'salesorder';
            searchType = 'SalesOrd'
        }
        if(type == 'Estimate')
        {
            recordType  = 'estimate';
            searchType = 'Estimate'
        }
        if(type == 'Invoice')
        {
            recordType  = 'invoice';
            searchType = 'CustInvc'
        }
        */

        var Rec_id = context.newRecord.id;
        log.debug({ title: 'item_receipt', details: Rec_id });
        var objForm = context.form;

        if (context.type == context.UserEventType.VIEW) {
            objForm.addButton({
                id: 'custpage_suiteletbutton',
                label: 'Print Label',
                functionName: 'window.open(\"https://7255402.app.netsuite.com/app/site/hosting/scriptlet.nl?script=491&deploy=1&recId=' + Rec_id + '\");'
               // functionName: 'window.open(\"https://6761390.app.netsuite.com/app/site/hosting/scriptlet.nl?script=344&deploy=1&recordType='+recordType+'&searchType='+searchType+'&recId=' + Rec_id + '\")'
            });

        }


    }



    return {
        beforeLoad: beforeLoad
    }
});
