/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
 define(['N/url', 'N/https', 'N/ui/dialog', 'N/ui/message'], function (url, https, dialog, msg) {

    function pageInit(context) {
        
    }

  


    function callClient(id) {

        //call suitelet
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_pct_sl_traveler_ticket_prnt',
            deploymentId: 'customdeploy_pct_sl_traveler_ticket_prnt',
            returnExternalUrl: false,
            params: {
                'woId': id,
            }
        });

        suiteletURL += '&wo_id=' + nlapiGetRecordId();  //pass the internal id of the current record

        window.open(suiteletURL, '_self');
    }
    return {
        pageInit: pageInit,
        callClient:callClient
       
    }
});
