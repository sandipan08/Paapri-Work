/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var customrecord_pct_amazon_item_sublistSearchObj = search.create({
            type: "customrecord_pct_amazon_web_order",

            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var HL_AmzonItemRecord_Count = customrecord_pct_amazon_item_sublistSearchObj.runPaged().count;
        log.debug("PCT-HL", "Amazon Custom Record Search Result Count : " + HL_AmzonItemRecord_Count);
        var start = 0;
        var end = 1000;
        var Amzon_item_array = new Array();
        do
        {
            log.debug("PCT-HL", "In Do");
            var HL_AmzonItemRecord_Result = customrecord_pct_amazon_item_sublistSearchObj.run().getRange({ start: start, end: end });

            for (var item_index = 0; item_index < HL_AmzonItemRecord_Result.length; item_index++)
            {
                var itemRecord_id = HL_AmzonItemRecord_Result[item_index].id;
                // log.debug({
                //     title: "PCT-HL",
                //     details: "Id :"+itemRecord_id
                // })
                Amzon_item_array.push(itemRecord_id);
            }
            end += 1000;
            start += 1000;
            HL_AmzonItemRecord_Count -= 1000;
        }
        while (HL_AmzonItemRecord_Count > 0);
        log.debug({
            title: "PCT HL",
            details: "Item Id Array Length : " + Amzon_item_array.length + "& Item Id Array : " + Amzon_item_array
        })
        return Amzon_item_array;
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
                type: "customrecord_pct_amazon_web_order",
                id: id,
            });
            log.debug({ title: "PCT-HL", details: "Amzon Custom Item Id :  " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
