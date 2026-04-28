/**
* @NApiVersion 2.1
* @NModuleScope Public
* @NScriptType plugintypeimpl
*/
define(['N/log', 'N/search'], function (log, search)
{

    function HL_record(service_name)
    {
        var customrecord_pct_hl_service_call_historySearchObj = search.create({
            type: "customrecord_pct_hl_service_call_history",
            filters:
                [
                    ["name", "is", service_name]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                        label: "Internal ID"
                    })
                ]
        });
        var HL_id_ResultCount = customrecord_pct_hl_service_call_historySearchObj.runPaged().count;
        log.debug("PCT-HL", "HL ID ResultCount :" + HL_id_ResultCount);
        var HL_id_Result = customrecord_pct_hl_service_call_historySearchObj.run().getRange({ start: 0, end: HL_id_ResultCount });
        return [HL_id_ResultCount, HL_id_Result]

    }

    return {
        HL_record: HL_record
    }
});

// var customPlugin = plugin.loadImplementation({
//     type: 'customscript_pct_hl_cp_return_hl_id'
// });