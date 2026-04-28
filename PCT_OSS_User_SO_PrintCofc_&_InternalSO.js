/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/log', 'N/redirect', 'N/url'], function (serverWidget, log, redirect, url) 
{
    function beforeLoad_addButton(scriptContext)
    {
        var form = scriptContext.form;
        var recordId = scriptContext.newRecord.id;

        var internalSo = url.resolveScript({
            deploymentId: 'customdeploy_pct_oss_suit_sales_order_pr',
            scriptId: 'customscript_pct_oss_suit_sales_order_pr',
            params: { 'recordId': recordId },
            returnExternalUrl: false
        })


        var printCofc = url.resolveScript({
            deploymentId: 'customdeploy_pct_oss_so_print_cofc',
            scriptId: 'customscript_pct_oss_so_print_cofc',
            params: { 'recordId': recordId },
            returnExternalUrl: false
        })


        form.addButton({
            id: 'custpage_buttonid',
            label: 'Print Internal Sales Order',
            //functionName : 'window.open("https://5499923.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1094&deploy=1")'
            functionName: 'window.open("' + internalSo + '")'
        });


        form.addButton({
            id: 'custpage_printCofc',
            label: 'Print COFC',
            functionName: 'window.open("' + printCofc + '")'
        });


    }
    return {
        beforeLoad: beforeLoad_addButton
    }
});