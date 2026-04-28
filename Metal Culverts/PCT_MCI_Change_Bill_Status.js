/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/record', 'N/ui/dialog'], function (currentRecord, record, dialog) {

    function pageInit(context) {
        log.debug("PCT", "In Client Script")
        
    }

    function changeTransactionStatus() {
        log.debug("PCT", "In ChangeTransactionStatus")
        var rec = currentRecord.get();
        var recId = rec.id;
        var recType = rec.type;

        try {
            var loadedRec = record.load({
                type: recType,
                id: recId,
                isDynamic: true
            });

            let rejectReason = loadedRec.getValue("custbody_pct_mci_reject_reason");
            if (rejectReason) {
              
                loadedRec.setValue({
                    fieldId: 'approvalstatus', // Field can be different based on transaction type
                    value: 3// Example: 'B' = Pending Fulfillment for Sales Order
                });
                loadedRec.save();
                location.reload();
            }
            else {
                dialog.alert({
                    title: 'Error',
                    message: 'Please choose a valid Reject reason'
                }).then(function () {
                    // success handler
                    console.log('User clicked OK');
                }).catch(function (error) {
                    // failure handler
                    console.error('Dialog failed: ', error);
                });
            }

            // Refresh the page to reflect changes
        } catch (e) {
            dialog.alert({
                title: 'Error',
                message: 'Failed to change status: ' + e.message
            });
        }
        
    }

    return {
        changeTransactionStatus: changeTransactionStatus,
        pageInit: pageInit
    };
});
