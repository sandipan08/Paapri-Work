/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/encode', 'N/https', 'N/url'], function (record, encode, https, url) {

    function beforeLoad(context) {
        log.debug("context", context)
        var newRecord = context.newRecord;
        var recordId = newRecord.id;
        var recType = newRecord.type;
        log.debug("type", recType)
        log.debug({ title: 'id', details: recordId });
        var objForm = context.form;

        if (context.type == context.UserEventType.VIEW) {

            var bolButton = objForm.getButton('custpage_buttonid');
            log.debug("bolButton", bolButton)
            if (bolButton) {
                log.debug("ENyer")
                objForm.removeButton('custpage_buttonid');
            }

            var scriptUrl = url.resolveScript({
                deploymentId: "customdeploy_pct_abi_sl_bg_print_bol",
                scriptId: "customscript_pct_abi_sl_bg_print_bol",
            })

            objForm.addButton({
                id: 'custpage_pct_print_bg_bol',
                label: 'Print BG BOL',
                functionName: 'window.open(\"' + scriptUrl + '&recId=' + recordId + '&recType=' + recType + '\");'
            });
        }
    }

    // function beforeSubmit(context) {

    // }

    // function afterSubmit(context) {

    // }

    return {
        beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        // afterSubmit: afterSubmit
    }
});
