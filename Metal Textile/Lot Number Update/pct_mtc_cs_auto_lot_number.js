/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/log','N/currentRecord', 'N/url', 'N/record'], function (search, log,currentRecord, url, record) {
    // let newLotNumber = '';

    function pageInit(context) {
        // Called when the page is initialized
        log.debug('PCT_MTC', 'In Page Init');
        log.debug('PCT_MTC', currentRecord.type);
        var itemReceiptNewUrl = url.resolveRecord({
            recordType: 'itemreceipt',
            recordId: null,
            isEditMode: true
        });
        log.debug('PCT_MTC', itemReceiptNewUrl);
        console.log('New Item Receipt URL:', itemReceiptNewUrl);
    
    }


    function validateLine(context) {

        const currentRecord = context.currentRecord;

        if (context.sublistId === 'inventoryassignment' && context.currentRecord.type === 'itemreceipt') {
            log.debug('Validate Line Triggered', '...');
            log.debug('Fetching Last Lot Sequence', 'Starting search...');
            var customrecordSearch = search.create({
                type: "customrecord_pct_mtc_last_rm_lotno",
                filters: [["internalidnumber", "equalto", "1"]],
                columns: [search.createColumn({ name: "name" })]
            });

            var lastSequence = 0;
            customrecordSearch.run().each(function (result) {
                lastSequence = parseInt(result.getValue("name")) || 0;
                log.debug('Last Sequence Retrieved', lastSequence);
                return true;
            });
            let newLotNumber = lastSequence + 1;
            log.debug('New Lot Number Generated', newLotNumber);
            if (currentRecord.getCurrentSublistIndex({
                sublistId: 'inventoryassignment'
            }) == 0) {
                // Set the new lot number in the Serial/Lot Number field
                currentRecord.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'receiptinventorynumber',
                    value: newLotNumber.toString()
                });
            }
        }

        return true; // allow line to be added
    }

    function lineInit(context) {
        try {
            if (context.sublistId === 'inventoryassignment' && context.currentRecord.type === 'itemreceipt') {
                const currentRecord = context.currentRecord;
                log.debug('lineInit Triggered', '....');
                var currentLine = currentRecord.getCurrentSublistIndex({
                    sublistId: 'inventoryassignment'
                });
                var previousLotNumber = currentRecord.getSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'receiptinventorynumber',
                    line: currentLine - 1
                });
                log.debug('Prev Lot No', currentLine);
                log.debug('Prev Lot No', previousLotNumber);
                // Fetch the last sequence from the custom record
                // log.debug('Fetching Last Lot Sequence', 'Starting search...');
                // var customrecordSearch = search.create({
                //     type: "customrecord_pct_mtc_last_rm_lotno",
                //     filters: [["internalidnumber", "equalto", "1"]],
                //     columns: [search.createColumn({ name: "name" })]
                // });

                // var lastSequence = 0;
                // customrecordSearch.run().each(function (result) {
                //     lastSequence = parseInt(result.getValue("name")) || 0;
                //     log.debug('Last Sequence Retrieved', lastSequence);
                //     return true;
                // });

                // Increment the sequence by 1
                newLotNumber = parseInt(previousLotNumber) + 1;
                log.debug('New Lot Number Generated', newLotNumber);

                // Set the new lot number in the Serial/Lot Number field
                currentRecord.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'receiptinventorynumber',
                    value: newLotNumber.toString()
                });
                // log.debug('Lot Number Assigned to Line', `Lot Number: ${newLotNumber}`);
            }
        } catch (e) {
            log.error('Error in lineInit', e);
        }
    }

    return {
        lineInit: lineInit,
        validateLine: validateLine,
        pageInit: pageInit
    };
});
