/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function beforeLoad(context)
    {
        log.debug({ title: "PCT-PP", details: "In Before Load" });
        alert("Test");
    }

    function beforeSubmit(context)
    {
        if (context.type === context.UserEventType.CREATE)
        {
            var specialRebate = context.newRecord;
            log.debug({
                title: "PCT-PP",
                details: "Record : " + specialRebate + ", Record Type : " + context.newRecord.type
            })
            var specialRebateId = specialRebate.getValue({
                fieldId: 'id'
            });
            log.debug({
                title: "PCT-PP",
                details: "specialRebate Id : " + specialRebateId
            })
            var lineCount = specialRebate.getLineCount({ sublistId: 'recmachcustrecord_pct_pp_sr_link' });
            log.debug({ title: "PCT-PP", details: "Total Line Item : " + lineCount });
            for (index = 0; index < lineCount; index++)
            {
                var discountPercentage = context.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_pp_sr_link',
                    fieldId: 'custrecord_pct_pp_sr_discount_percentage',
                    line: index
                });
                var discountPrice = context.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_pp_sr_link',
                    fieldId: 'custrecord_pct_pp_sr_discount_price',
                    line: index
                });
                log.debug({
                    title: "PCT-PP",
                    details: "Discount Price : " + discountPrice + ", Discount Percentage : " + discountPercentage
                })
                if ((discountPercentage) && (discountPrice))
                {
                    const error = new Error("ERROR : Either you can set Discount Price or Discount Percentage");
                    error.code = 400
                    throw error;
                }
            }

        }

    }


    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,

    }
});
