/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/log'], function (record, log) {
    function afterSubmit(context) {
        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
            let storeLastLotNumberId = 1;
            var itemReceipt = context.newRecord;
            var itemCount = itemReceipt.getLineCount({ sublistId: 'item' });

            for (var i = 0; i < itemCount; i++) {
                var itemId = itemReceipt.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });

                var inventoryDetail = itemReceipt.getSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail',
                    line: i
                });

                if (inventoryDetail) {
                    var invLineCount = inventoryDetail.getLineCount({ sublistId: 'inventoryassignment' });


                    for (var invDeatilsIndex = invLineCount - 1; invDeatilsIndex >= 0; invDeatilsIndex--) {
                        var lotNumber = inventoryDetail.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'receiptinventorynumber', // use 'issueinventorynumber' for inventory issue
                            line: invDeatilsIndex
                        });

                        var quantity = inventoryDetail.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity',
                            line: invDeatilsIndex
                        });

                        log.debug('Inventory Lot Detail', `Item: ${itemId}, Lot: ${lotNumber}, Qty: ${quantity}`);
                        record.submitFields({
                            type: 'customrecord_pct_mtc_last_rm_lotno', // Replace with your custom record type
                            id: storeLastLotNumberId, // Internal ID of the record to update
                            values: {
                                name: lotNumber,

                            }
                        });
                        break;
                    }
                }
            }
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
