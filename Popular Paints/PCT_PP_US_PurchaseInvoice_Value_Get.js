/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/search'], function (search)
{

    function beforeLoad(context)
    {
        var newRec = context.newRecord;
        log.debug({ title: "PCT-PP", details: "In Bill Payment" });
        var paymentId = newRec.getValue({
            fieldId: 'id'
        });
        log.debug({ title: "PCT-PP", details: "Vendor Bill Payment Id : " + paymentId });
        var applyCount = newRec.getLineCount({ sublistId: 'apply' });
        log.debug({ title: "PCT-PP", details: "Total Apply Count : " + applyCount });
        for (applyIndex = 0; applyIndex < applyCount; applyIndex++)   
        {
            var purchaseInvoiceId = newRec.getSublistValue({
                sublistId: 'apply',
                fieldId: 'internalid',
                line: applyIndex
            });
            var fieldLookUp = search.lookupFields({
                type: "vendorbill",
                id: purchaseInvoiceId,
                columns: ['custbody_in_eway_ap_doc_num']
            });
            log.debug({ title: "PCT-PP", details: JSON.stringify(fieldLookUp.custbody_in_eway_ap_doc_num) });
            log.debug({ title: "PCT-PP", details: "Vendor Doc No : " + fieldLookUp.custbody_in_eway_ap_doc_num });


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
