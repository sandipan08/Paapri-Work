/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/currentRecord', 'N/ui/dialog'],

    function (record, runtime, search, currentRecord, dialog)
    {
        var insertLine;
        var lineNumber;


        function pageInit(context)
        {
            log.debug("PCT-Mott", "In PageInit");
        }

        function saveRecord(context)
        {

        }

        function validateField(context)
        {

        }

        function fieldChanged(context)
        {

        }

        // function postSourcing(context)
        // {

        // }

        // function lineInit(context)
        // {
        //     log.debug("PCT-Mott", "In LineInit");

        // }

        function validateDelete(context)
        {
            log.debug("PCT-Mott", "In LineInit");
            return true;
        }

        function validateInsert(context)
        {
            log.debug("PCT-Mott", "In Validate Insert");
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            if (sublistName === 'item')
            {
                lineNumber = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_linenumber'
                });
                log.debug("PCT-Mott", "Line Number : " + lineNumber);

            }
            return true;


        }

        function validateLine(context)
        {
            log.debug("PCT-Mott", "In Validate Line");
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var itemCount = currentRecord.getLineCount({ sublistId: 'item' });
            if (sublistName === 'item')
            {
                for (var itemIndex = lineNumber - 1; itemIndex < itemCount; itemIndex++)
                {
                    var lineSL = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_linenumber',
                        line: itemIndex
                    });
                    var itemName = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item_display',
                        line: itemIndex
                    });
                    log.debug("PCT-Mott", "Line # : " + lineSL + ", Item Name :" + itemName + ", Item Index : " + itemIndex);
                    if (lineSL == lineNumber)
                    {
                        break;
                    }
                    else
                    {
                        var lastValue = lineSL;
                    }

                }
                log.debug("PCT-Mott", "Last Line # : " + lastValue);
                //  log.debug("PCT-Mott", "Line Number Putting : " + (lineNumber - 0.5));
                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_linenumber',
                    value: (lineNumber - 0.5),
                    ignoreFieldChange: true
                });

            }
            return true;
        }

        function sublistChanged(context)
        {

        }

        return {
            pageInit: pageInit,
            //  saveRecord: saveRecord,
            // validateField: validateField,
            // fieldChanged: fieldChanged,
            //  postSourcing: postSourcing,
            //  lineInit: lineInit,
            validateDelete: validateDelete,
            validateInsert: validateInsert,
            validateLine: validateLine,
            //  sublistChanged: sublistChanged
        }
    });
