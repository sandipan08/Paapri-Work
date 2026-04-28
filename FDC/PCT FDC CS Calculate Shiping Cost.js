/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record", "N/search"], function (record, search,
) {

    function pageInit(context) {
        log.debug("PCT", "In Page Init Function")
    }

    function fieldChanged(context) {
        log.debug("PCT", "In Field Change Function");

        if (context.fieldId == 'shipstatus') {
            let shippingCost = context.currentRecord.getValue({
                fieldId: 'shippingcost'
            });
            let customer = context.currentRecord.getValue({
                fieldId: 'entity'
            });
            log.debug("PCT", shippingCost);
            log.debug("PCT", customer);
        }

    }


    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,

    }
});
