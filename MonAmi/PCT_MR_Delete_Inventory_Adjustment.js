/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var inventoryadjustmentSearchObj = search.create({
            type: "inventoryadjustment",
            filters:
                [
                    ["type", "anyof", "InvAdjst"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var inventoryAdjustmentCount = inventoryadjustmentSearchObj.runPaged().count;
        log.debug("PCT-MonAmi", "Inventory Adjustment Count", inventoryAdjustmentCount);
        var start = 0;
        var end = 1000;
        var iaArray = new Array();
        do
        {
            var inventoryAdjustmentCountResult = inventoryadjustmentSearchObj.run().getRange({ start: start, end: end });

            for (var getid_index = 0; getid_index < inventoryAdjustmentCountResult.length; getid_index++)
            {
                var iaid = inventoryAdjustmentCountResult[getid_index].id;
                iaArray.push(iaid);
            }
            start += 1000;
            end += 1000;
            inventoryAdjustmentCount -= 1000;
        }
        while (inventoryAdjustmentCount > 0);

        // iaArray.push(200465);
        log.debug({
            title: "PCT MonAmi",
            details: "Inventory Adjustment Array Length : " + iaArray.length + "& Inventory Adjustment Id Array : " + iaArray
        })
        return iaArray;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            // var HL_WO_id_load = record.load({
            //     type: 'customrecord_pct_hl_web_order',
            //     id: id
            // });
            var Item_Delete_Record = record.delete({
                type: "inventoryadjustment",
                id: id,
            });
            log.debug({ title: "PCT-MonAmi", details: "Inventory Adjustment Id :  " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
