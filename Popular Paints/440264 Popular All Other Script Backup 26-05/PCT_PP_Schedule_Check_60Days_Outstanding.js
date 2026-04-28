/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function execute(context)
    {
        try
        {
            log.debug("PCT-PP", "In Schedule Script");
            // search id - 2045
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["accounttype", "anyof", "AcctRec"],
                        "AND",
                        ["mainline", "is", "T"],
                        // "AND",
                        // ["customermain.custentity_pct_pp_60_days_outstandings", "is", "F"]

                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entity",
                            summary: "GROUP",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "CASE WHEN ({recordtype} = 'invoice' AND {duedate} IS NOT NULL AND TRUNC({today})-{duedate} BETWEEN 61 AND 90) THEN {amountremaining} WHEN ({recordtype} = 'invoice' AND {duedate} IS NULL AND TRUNC({today})-{trandate} BETWEEN 61 AND 90) THEN {amountremaining} END",
                            label: "Formula (Currency)"
                        })
                    ]
            });

            var customerCount = transactionSearchObj.runPaged().count;
            log.debug("PCT-PP", "Customer Result Count : " + customerCount);
            var start = 0;
            var end = 1000;
            do
            {
                log.debug("PCT-PP", "In Get Input Do");
                var customerResult = transactionSearchObj.run().getRange({ start: start, end: end });
                for (var getid_index = 0; getid_index < customerResult.length; getid_index++)
                {
                    // var customerId = customerResult[getid_index].id;
                    var customerId = customerResult[getid_index].getValue({
                        name: "entity",
                        summary: "GROUP",
                        label: "Name"
                    })
                    var customerName = customerResult[getid_index].getText({
                        name: "entity",
                        summary: "GROUP",
                        label: "Name"
                    })
                    var agingValue = customerResult[getid_index].getValue({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "CASE WHEN ({recordtype} = 'invoice' AND {duedate} IS NOT NULL AND TRUNC({today})-{duedate} BETWEEN 61 AND 90) THEN {amountremaining} WHEN ({recordtype} = 'invoice' AND {duedate} IS NULL AND TRUNC({today})-{trandate} BETWEEN 61 AND 90) THEN {amountremaining} END",
                        label: "Formula (Currency)"
                    })
                    log.debug({
                        title: "PCT-PP",
                        details: "Customer Id : " + customerId + ", Customer Name : " + customerName + ", 61-90Days Value : " + agingValue
                    })
                    if (customerId.length)
                    {
                        var customerLoad = record.load({
                            type: 'customer',
                            id: customerId
                        });
                        if (agingValue > 0)
                        {
                            log.debug("PCT-PP", "60 DAYS OUTSTANDINGS Checkbox Checked");
                            customerLoad.setValue({ fieldId: 'custentity_pct_pp_60_days_outstandings', value: true });
                        }
                        else
                        {
                            log.debug("PCT-PP", "60 DAYS OUTSTANDINGS Checkbox Uncheck");
                            customerLoad.setValue({ fieldId: 'custentity_pct_pp_60_days_outstandings', value: false });
                        }
                        customerId = customerLoad.save();
                        log.debug({ title: "PCT-PP", details: "Edited Customer Record ID:" + customerId });
                    }



                }
                start += 1000;
                end += 1000;
                customerCount -= 1000;
            }
            while (customerCount > 0);


        }
        catch (ex)
        {
            log.error({ title: 'PCT-PP', details: "In Catch : " + ex });
        }


    }

    return {
        execute: execute
    }
});
