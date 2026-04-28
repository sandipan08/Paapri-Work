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
        let workOrderId = context.currentRecord.getValue({
            fieldId: 'custrecord_pct_sc_opjobdetails_wo'
        });
        let operationTask = context.currentRecord.getValue({
            fieldId: 'custrecord_pct_sc_optask'
        });
        let lookUpObj = search.lookupFields({
            type: search.Type.MANUFACTURING_OPERATION_TASK,
            id: operationTask,
            columns: ['workorder']
        });
        log.debug("PCT", JSON.stringify(lookUpObj));
        log.debug("PCT", lookUpObj.assemblyitem);
    }


    return {
        pageInit: pageInit,

        fieldChanged: fieldChanged,

    }
});
