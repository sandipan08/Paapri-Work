/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(["N/record", "N/search"], function (record, search,
) {

    function onAction(scriptContext) {
        log.debug("PCT-FDC", "In Workflow Action Script");
        let newRecord = scriptContext.newRecord;
        let shippingCost = newRecord.getValue({
            fieldId: 'shippingcost'
        });
        let customer = newRecord.getValue({
            fieldId: 'entity'
        });
        log.debug("PCT", shippingCost);
        log.debug("PCT", customer);
    }

    return {
        onAction: onAction
    }
});
