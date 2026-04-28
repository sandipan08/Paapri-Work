/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function beforeLoad(context)
    {

    }
    function beforeSubmit(context)
    {
        var salesRecord = context.newRecord;
        var soId = salesRecord.getValue({
            fieldId: 'id'
        });
        log.debug({
            title: "PCT-REF",
            details: "Sales Order Id : " + soId
        })
        var item_count = salesRecord.getLineCount({ sublistId: 'item' });
        log.debug({ title: "PCT-REF", details: "Total Item : " + item_count });
        var totalItemCase = 0;
        var itemCase = 0;
        for (item_index = 0; item_index < item_count; item_index++)
        {
            itemCase = salesRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_pct_reftec_case_qty',
                line: item_index
            });
            totalItemCase = parseInt(itemCase) + totalItemCase;
        }
        log.debug({
            title: "PCT-REF",
            details: "Total Item Case : " + totalItemCase + ", Item Case Type : " + typeof (itemCase)
        })
        salesRecord.setValue({ fieldId: 'custbody_pct_reftec_total_case_qty', value: totalItemCase });
        salesRecord.save();
    }
    function afterSubmit(context)
    {
        if (context.type === context.UserEventType.CREATE)
        {

        }
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
