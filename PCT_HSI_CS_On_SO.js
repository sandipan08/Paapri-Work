/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/currentRecord', 'N/ui/dialog'],

    function (record, runtime, search, currentRecord, dialog)
    {
        function pageInit(context)
        {
            log.debug("PCT-Holland", "In PageInit");
            var currentRecord = context.currentRecord;
            currentRecord.setValue({ fieldId: 'shipdate', value: "" });
        }

        function fieldChanged(context)
        {
            log.debug("PCT-Holland", "In Field Change");
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;

            if (sublistName == "item")
            {
                log.debug("PCT-Holland", "Sublist : " + sublistName);
                var itemId = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item'
                });
                if (itemId == 33)
                {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        value: -1,
                        ignoreFieldChange: true
                    });
                }
                // log.debug("PCT-Holland", "Item Name : " + itemName);
            }


        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,

        }
    });
