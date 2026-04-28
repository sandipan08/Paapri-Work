/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 * @param{search} search
 */
    (record) => {

        function beforeLoad(context) {

        }

        function beforeSubmit(context) {

        }

        function afterSubmit(context) {
            log.debug("PCT", "In After Submit Script");
            let salesOrder = context.newRecord;
            log.debug("PCT", salesOrder.getValue('id'));
            var soLoad = record.load({
                type: 'salesorder',
                id: salesOrder.getValue('id')
            });
            for (iteIndex = 0; iteIndex < soLoad.getLineCount({ sublistId: 'item' }); iteIndex++) {
                let sceId = soLoad.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_sc_sce_list',
                    line: item_index
                });
                var updatedSceId = record.submitFields({
                    type: 'customrecord_pct_configure',
                    id: sceId,
                    values: {
                        'custrecord_pct_sc_cost_est_status': 3
                    }
                });
                log.debug("PCT", "Updated SCE ID : " + updatedSceId);

            }




        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }
    });
