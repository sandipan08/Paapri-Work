/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/record', 'N/runtime', 'N/search', 'N/email', 'N/runtime'],
    function (currentRecord, record, runtime, search, email, runtime)
    {
        function fieldChanged(context)
        {
            log.debug({ title: "PCT-PP", details: "In Client Field Change Function" });
            var specialRebate = context.currentRecord;
            log.debug({
                title: "PCT-PP",
                details: "Record Id : " + specialRebate
            })
            if (context.fieldId == "custrecord_pct_pp_sr_discount_price")
            {
                log.debug({ title: "PCT-PP", details: "Disable Discount Percentage" });
                alert("Now you can not set Discount Percentage");

                // var Field = specialRebate.getSublistField({
                //     sublistId: 'recmachcustrecord_pct_pp_link',
                //     fieldId: 'custrecord_pct_pp_sr_discount_percentage',
                //     line: 0

                // });
                // Field.isDisabled = true;
            }
            else if (context.fieldId == "custrecord_pct_pp_sr_discount_percentage")
            {
                log.debug({ title: "PCT-PP", details: "Disable Discount Price" });
                alert("Now you can not set Discount Price");

                // specialRebate.getSublistField("custrecord_pct_pp_sr_discount_price").isDisabled = true;
            }
            return true;

        }


        return {
            //pageInit: pageInit,
            fieldChanged: fieldChanged,

        }
    });
