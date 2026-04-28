/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function ()
{

    function pageInit(context)
    {
        log.debug("PCT-POC", "In PageIniT");
    }



    function postSourcing(context)
    {
        log.debug("PCT-POC", "In POst Sourcing");
        var cRecord = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        log.debug({
            title: 'Success',
            details: 'cRecord: ' + cRecord + ' sublistid: ' + sublistId + ' fieldId: ' + fieldId
        });

        cRecord.selectLine({
            sublistId: "item",
            line: 0
        })
        var value = cRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol7',

        });
        log.debug("PCT-POC", "Value : " + value);

        cRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol8',
            value: (value * 10)
        });
        cRecord.commitLine({ sublistId: 'item' });
        log.debug("PCT-POC", "Operation Done 2");
    }
    function fieldChanged(context)
    {

    }

    function sublistChanged(context)
    {
        var currentRecord = context.currentRecord;
        var sublistId = context.sublistId;
        // log.debug({
        //     title: 'Success',
        //     details: 'cRecord: ' + currentRecord + ' sublistid: ' + sublistId
        // });
        // if (context.sublistId == 'initquantity')
        // {
        //     log.debug("PCT-POC", "In Sublist Change");
        // }
        currentRecord.selectLine({
            sublistId: "item",
            line: 0
        })
        var qty = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'initquantity',

        });


        log.debug("PCT-POC", "Qty : " + qty);
        currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol7',
            value: (qty * 10)
        });
        currentRecord.commitLine({ sublistId: 'item' });

        log.debug("PCT-POC", "Operation Done 1");

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged
    }
});
