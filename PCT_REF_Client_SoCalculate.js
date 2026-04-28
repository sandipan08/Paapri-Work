/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function ()
{

    function pageInit(context)
    {

    }


    function fieldChanged(context)
    {
        if (context.fieldId == 'custbody_pct_reftec_cal_total_weight_c')
        {
            var salesRecord = context.currentRecord;
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
                itemQty = salesRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'rcvdquantity',
                    line: item_index
                });
                itemWeight = salesRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_reftec_item_weight',
                    line: item_index
                });
                log.debug({
                    title: "PCT-REF",
                    details: "Item Case : " + itemCase + ", Item Qty : " + itemQty + ", Item Weight : " + itemWeight
                })
                totalItemCase = parseInt(itemCase) + totalItemCase;
            }
            log.debug({
                title: "PCT-REF",
                details: "Total Item Case : " + totalItemCase + ", Item Case Type : " + typeof (itemCase)
            })
        }


    }



    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged

    }
});
