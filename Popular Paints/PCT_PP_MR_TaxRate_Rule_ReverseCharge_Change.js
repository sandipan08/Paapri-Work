/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{

    function getInputData()
    {
        log.debug({ title: "PCT-PP", details: "In Get Input Function" });

        return search.create({
            type: "customrecord_in_gst_tax_rate_rule",
            filters:
                [
                    // ["custrecord_in_gst_rate_rule_rev_charge", "is", "T"],
                    // "AND",
                    // ["internalidnumber", "equalto", "5114"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })

                ]
        });

    }

    function map(context)
    {
        try
        {
            log.debug({ title: "PCT-PP", details: "In Map Function & Map Context : " + JSON.stringify(context) })
            var searchData = JSON.parse(context.value);
            log.debug({ title: "PCT-PP", details: "Operation Starting on " + searchData.id });

            var Item_Delete_Record = record.delete({
                type: "customrecord_in_gst_tax_rate_rule",
                id: searchData.id,
            });


            // var gstTaxRateRuleLoad = record.load({
            //     type: 'customrecord_in_gst_tax_rate_rule',
            //     id: searchData.id
            // });
            // gstTaxRateRuleLoad.setValue({ fieldId: 'custrecord_in_gst_rate_rule_rev_charge', value: false });
            // gstTaxRateRuleLoad.save();
            log.debug({ title: "PCT-PP", details: "Operation Done " + searchData.id + " Deleted" });
        }
        catch (ex)
        {
            log.error({ title: 'PCT-PP', details: "In Catch : " + ex });
        }

    }

    function reduce(context)
    {
        log.debug({ title: "PCT-PP", details: "In Reduce Function" });
    }

    function summarize(summary)
    {
        log.debug({ title: "PCT-PP", details: "In Summarize Function" });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
