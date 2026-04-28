/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{

    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });
        return search.create({
            type: "inventoryadjustment",
            filters:
                [
                    ["type", "anyof", "InvAdjst"],
                    "AND",
                    ["datecreated", "within", "4/6/2022 12:00 am", "4/8/2022 11:59 pm"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),

                ]
        });

    }

    function map(context)
    {

        log.debug({ title: "PCT-MonAmi", details: "In Map Function & Map Context : " + JSON.stringify(context) })
        var searchData = JSON.parse(context.value);
        record.delete({
            type: "inventoryadjustment",
            id: searchData.id,
        });
        log.debug({ title: "PCT-MAP", details: "Record Id : " + searchData.id + " Deleted" })






    }

    function reduce(context)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Reduce Function" });
    }

    function summarize(summary)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Summarize Function" });
    }






    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
