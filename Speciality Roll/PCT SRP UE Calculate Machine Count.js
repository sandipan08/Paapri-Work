/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], function (record, log) {
    function beforeLoad(context) {
        log.debug("PCT-SPC", "In Before load")
    }
    // function beforeSubmit(context) {
    //     try {
    //         log.debug("PCT-SPC", "In Before Submit" + record.Type.ASSEMBLY_ITEM)
    //         let rangerAssemblyForm = 785;
    //         const newRecord = context.newRecord;
    //         // Only proceed for Assembly Item
    //         if (newRecord.type == record.Type.ASSEMBLY_ITEM) {
    //             // Get the selected Custom Form
    //             log.debug("PCT-SPC", "For Assembly")
    //             const formId = newRecord.getValue({ fieldId: 'customform' });

    //             // Example: Only take action if form ID is 123 (replace with actual)
    //             if (formId == rangerAssemblyForm) {
    //                 log.debug('Assembly Item Create with Form 785', 'Proceed with your logic here');
    //                 var length = checkNull(newRecord.getValue({ fieldId: 'custitem_pct_srl_length' }));
    //                 var columnSpace = checkNull(newRecord.getValue({ fieldId: 'custitem_pct_srp_column_space' }));
    //                 // Example: Set a default value (optional)
    //                 newRecord.setValue({
    //                     fieldId: 'custitem_pct_ranger_machine_count',
    //                     value: (length + columnSpace) * 100
    //                 });
    //             }
    //         }
    //     } catch (error) {
    //         log.error({
    //             title: 'Error in beforeSubmit',
    //             details: error
    //         });
    //     }
    // }

function afterSubmit(context){
   log.debug("PCT-SPC", "In After Submit")
}
    const checkNull = (val) => {
        if (val == '' || val == null || isNaN(val) || val == undefined) {
            val = 0
        }
        return val
    }
    return {
        beforeLoad: beforeLoad,
        afterSubmit:afterSubmit
        // beforeSubmit: beforeSubmit
    };
});
