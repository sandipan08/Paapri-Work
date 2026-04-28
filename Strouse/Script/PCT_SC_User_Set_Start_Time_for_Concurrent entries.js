/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/email', 'N/file', 'N/record', 'N/search', 'N/runtime'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 * @param{search} search
 */
    (email, file, record, search, runtime) => {

        function beforeLoad(context) {

        }

        function beforeSubmit(context) {

        }

        function afterSubmit(context) {
            if (context.type == context.UserEventType.EDIT) {
                log.debug("PCT", "In After Submit Script");
                let pmcTransactionRecord = context.newRecord;
                let pmcTransactionId = pmcTransactionRecord.getValue('id')
                log.debug("PCT", pmcTransactionId);

                let loadPMCTransaction = record.load({
                    type: 'customrecord_pct_pmc_tran_k_fab',
                    id: pmcTransactionId,
                    // isDynamic: true,
                });
                let name = loadPMCTransaction.getValue('name')
                let workOrder = loadPMCTransaction.getValue('custrecord_pct_kfab_wo')
                let operationSequence = loadPMCTransaction.getValue('custrecord_pct_kfab_p_seq')
                let employee = loadPMCTransaction.getValue('custrecord_pct_kfab_emp')
                let starDateTime = loadPMCTransaction.getValue('custrecord_pct_kfab_res_start_date')
                let operationTaskId = loadPMCTransaction.getValue('custrecord_pct_kfab_op_task_id')

                var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
                    type: "customrecord_pct_pmc_tran_k_fab",
                    filters:
                        [
                            ["custrecord_pct_kfab_wo", "anyof", workOrder],
                            "AND",
                            ["custrecord_pct_kfab_emp", "anyof", employee],
                            "AND",
                            ["custrecord_pct_kfab_p_seq", "equalto", operationSequence],
                            "AND",
                            ["custrecord_pct_kfab_op_task_id", "is", operationTaskId],
                            "AND",
                            ["custrecord_pct_kfab_op_status", "anyof", "3"],
                            "AND",
                            ["custrecord_pct_kfab_res_end_date", "isempty", ""],
                            "AND",
                            ["name", "is", name],
                            "AND",
                            ["internalid", "noneof", pmcTransactionId]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
                log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
                customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
                    let pmcTransaction = record.submitFields({
                        type: 'customrecord_pct_pmc_tran_k_fab',
                        id: result.id,
                        values: {
                            'custrecord_pct_kfab_res_end_date': starDateTime,
                            'custrecord_pct_kfab_op_status': 4
                        }
                    });
                    log.debug("PCT", "Value Updated for : " + pmcTransaction);
                    return true;
                });
            }


        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }
    });
