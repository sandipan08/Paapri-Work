/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi-Integration", details: "In Get Input Function" });
        var customrecord_pct_inventpry_warehouseSearchObj = search.create({
            type: "customrecord_pct_inventpry_warehouse",
            filters:
                [
                    ["created", "onorbefore", "lastweek"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "scriptid",
                        sort: search.Sort.ASC,
                        label: "Script ID"
                    }),
                    search.createColumn({ name: "custrecord_pct_iw_vendor_sku", label: "Vendor Sku" }),
                    search.createColumn({ name: "custrecord_pct_iw_qty_on_hand", label: "Quantity On Hand" }),
                    search.createColumn({ name: "custrecord_pct_iw_description", label: "Description" }),
                    search.createColumn({ name: "custrecord_pct_iw_item_available", label: "Item Available" }),
                    search.createColumn({ name: "custrecord_pct_iw_item_processed", label: "Item Processed" }),
                    search.createColumn({ name: "custrecord_pct_iw_error", label: "Error Message" })
                ]
        });
        var PCTMonAmi_ResultCount = customrecord_pct_inventpry_warehouseSearchObj.runPaged().count;
        log.debug("PCT-MonAmi-Integration", "Search Result Count : " + PCTMonAmi_ResultCount);
        var start = 0;
        var end = 1000;
        var MonAmi_weborder_array = new Array();
        do
        {
            log.debug("PCT-MonAmi-Integration", "In Get Input Do");
            var PCTMonAmi_Result = customrecord_pct_inventpry_warehouseSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < PCTMonAmi_Result.length; getid_index++)
            {
                var record_id = PCTMonAmi_Result[getid_index].id;
                // log.debug({
                //     title: "PCT-HL-Record ID",
                //     details: "Id : " + record_id
                // })
                MonAmi_weborder_array.push(record_id);
            }
            start += 1000;
            end += 1000;
            PCTMonAmi_ResultCount -= 1000;
        }
        while (PCTMonAmi_ResultCount > 0);
        log.debug({ title: "PCT-MonAmi-Integration", details: "MonAmi Web Order Id Array Length : " + MonAmi_weborder_array.length + ", MonAmi Web Order Id Array : [" + MonAmi_weborder_array + "]" });
        return MonAmi_weborder_array;


    }

    function map(context)
    {
        log.debug({ title: "PCT-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            record.delete({
                type: "customrecord_pct_inventpry_warehouse",
                id: id,
            });
            log.debug({ title: "PCT-MAP", details: "Record Id : " + id + " Deleted" })
        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }
    }


    return {
        getInputData: getInputData,
        map: map
    }
});
