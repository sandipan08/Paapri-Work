/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(["N/record", 'N/search'], function (record, search) {

    function onAction(scriptContext) {
        log.debug("PCT-SC", "In Workflow Action Script");
        let newRecord = scriptContext.newRecord;
        let fieldLookUp = search.lookupFields({
            type: newRecord.type,
            id: newRecord.id,
            columns: ['custrecord_pct_sc_est_req_link']
        });
        log.debug({
            title: "PCT-SC",
            details: "Record = " + JSON.stringify(fieldLookUp)
        });
        var estimateLoad = record.load({
            type: 'customrecord_pct_sc_estimaterequestform',
            id: fieldLookUp.custrecord_pct_sc_est_req_link[0].value
        });
        for (let sceIndex = 0; sceIndex < estimateLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_sc_est_req_link' }); sceIndex++) {
            let sceId = estimateLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_est_req_link',
                fieldId: 'id',
                line: sceIndex
            });
            log.debug("PCT-SC", sceId)
            record.submitFields({
                type: newRecord.type,
                id: sceId,
                values: {
                    'custrecord_pct_sc_cost_est_status': 3
                }
            });
        }

    }

    return {
        onAction: onAction
    }
});
