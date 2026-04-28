/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function onAction(scriptContext)
    {
        // log.debug({
        //     title: 'PCT-HL-WF'
        // });
        // var HL_WO_id_load = scriptContext.newRecord;
        // var id = HL_WO_id_load.getValue({
        //     fieldId: 'id'
        // });
        // log.debug({
        //     title: 'PCT-HL-WF',
        //     details: 'Record Id:' + id
        // });
        try
        {

            var orderId = 5685;
            var fulfillmentRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: orderId,
                toType: record.Type.ITEM_FULFILLMENT,
                isDynamic: true
            });
            var lineCount = fulfillmentRecord.getLineCount({ sublistId: 'item' });
            log.debug({
                title: "PCT-HL",
                details: "Item Count : " + lineCount
            })
            for (var item_index = 0; item_index < lineCount; item_index++)
            {
                fulfillmentRecord.selectLine({ sublistId: 'item', line: item_index });
                // fulfillmentRecord.setCurrentSublistText({
                //     sublistId: 'item',
                //     fieldId: 'statusRef',
                //     value: 'Shipped' //Enter the location internal id, instead of name i.e San Francisco
                // });
                fulfillmentRecord.setText({
                    fieldId: 'shipstatus',
                    text: 'Shipped'
                });
            }
            var item_fullfillment = fulfillmentRecord.save();
            log.debug({
                title: "PCT-HL",
                details: "Item Fullfillment Id : " + item_fullfillment
            })
        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }
    }

    return {
        onAction: onAction
    }
});
