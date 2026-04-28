/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(["N/record", 'N/search'], function (record, search) {

    function onAction(scriptContext) {
        log.debug("PCT-SC", "In Workflow Action Script");
        let newRecord = scriptContext.newRecord;

        // ----------- Set SCE# Operation Start --------------------
        let sceNumber = newRecord.getValue({
            fieldId: 'custbody_pct_config_number_in_wo'
        })


        log.debug("PCT-SCE Number", sceNumber)

        if (!sceNumber) {
            let getSceNumber = getSCENumber(newRecord.getValue({ fieldId: 'createdfrom' }), newRecord.getValue({ fieldId: 'assemblyitem' }), newRecord.getValue({
                fieldId: 'id'
            }))
            let updatedWoId = record.submitFields({
                type: record.Type.WORK_ORDER,
                id: newRecord.getValue("id"),
                values: {

                    'custbody_pct_config_number_in_wo': getSceNumber,

                }
            });
            log.debug("PCT-SC", "Updated Wo Id : " + updatedWoId)

        }

    }

    const getSCENumber = (salesorderId, item, workOrder) => {
        let sceNumber = '';
        var salesorderSearchObj = search.create({
            type: "salesorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["internalid", "anyof", salesorderId],
                    "AND",
                    ["item", "anyof", item],
                    "AND",
                    ["applyingtransaction", "anyof", workOrder]
                ],
            columns:
                [
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "custcol_pct_sc_sce_list", label: "SCE #" })
                ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            salesorderSearchObj.run().each(function (result) {
                sceNumber = result.getValue('custcol_pct_sc_sce_list')
                return true;
            });
        }
        return sceNumber;

    }
    return {
        onAction: onAction
    }
});
