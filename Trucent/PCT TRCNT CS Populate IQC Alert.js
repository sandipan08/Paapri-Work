/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/ui/dialog', 'N/search',], function (dialog, search) {

    function pageInit(context) {
        // if (context.mode === 'create') {
        log.debug("PCT", "In Client" + context.mode)

        var currentRecord = context.currentRecord;


        for (var itemIndex = 0; itemIndex < currentRecord.getLineCount({
            sublistId: 'item'
        }); itemIndex++) {
            var itemId = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: itemIndex
            });
            log.debug('Item ID at line ' + itemIndex + ': ' + itemId);
            if (checkItemSpecification(itemId)) {
                dialog.alert({
                    title: 'Reminder',
                    message: 'Please ensure the Quality Check is completed before receiving the item.'
                });
            }
            break;

        }


        // }
    }

    const checkItemSpecification = (itemId) => {
        var customrecord_pct_drawing_specificationSearchObj = search.create({
            type: "customrecord_pct_drawing_specification",
            filters:
                [
                    ["custrecord_pct_drawing_spec_link_parent", "anyof", itemId]
                ],
            columns:
                [

                ]
        });
        var searchResultCount = customrecord_pct_drawing_specificationSearchObj.runPaged().count;
        log.debug("customrecord_pct_drawing_specificationSearchObj result count", searchResultCount);
        // customrecord_pct_drawing_specificationSearchObj.run().each(function (result) {
        //     // .run().each has a limit of 4,000 results
        //     return true;
        // });
        if (searchResultCount > 0) {
            return true;
        }
        else {
            return false;
        }


    }

    return {
        pageInit: pageInit
    };
});
