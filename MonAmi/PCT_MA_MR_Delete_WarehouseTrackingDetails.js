/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{
    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });
        var customrecord_pct_warehouse_trackingSearchObj = search.create({
            type: "customrecord_pct_warehouse_tracking",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var warehouseTrackingDetailsCount = customrecord_pct_warehouse_trackingSearchObj.runPaged().count;
        log.debug("PCT-MonAmi", "Warehouse Tracking Details Search : " + warehouseTrackingDetailsCount);
        var start = 0;
        var end = 1000;
        var wtdItemArray = new Array();
        do
        {
            log.debug("PCT-MonAmi", "In Get Input Do");
            var warehouseTrackingDetailsResult = customrecord_pct_warehouse_trackingSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < warehouseTrackingDetailsResult.length; getid_index++)
            {
                var record_id = warehouseTrackingDetailsResult[getid_index].id;
                wtdItemArray.push(record_id);
            }
            start += 1000;
            end += 1000;
            warehouseTrackingDetailsCount -= 1000;
        }
        while (warehouseTrackingDetailsCount > 0);
        log.debug({ title: "PCT-MonAmi", details: "Inventory Warehouse Array Length : " + wtdItemArray.length + ", SInventory Warehouse Array : [" + wtdItemArray + "]" });
        return wtdItemArray;

    }

    function map(context)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Map Function & Map Context : " + context.value });
        try
        {
            var id = context.value;
            var wtdItemRecord = record.delete({
                type: "customrecord_pct_warehouse_tracking",
                id: id,
            });
            log.debug({ title: "PCT-MonAmi", details: "Deleted Record Id :  " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }

    }

    function reduce(context)
    {

    }

    function summarize(summary)
    {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
