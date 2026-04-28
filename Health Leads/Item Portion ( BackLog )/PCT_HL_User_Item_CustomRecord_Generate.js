/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function beforeLoad(context)
    {
    }
    function beforeSubmit(context)
    {
    }
    function afterSubmit(context)
    {
        if (context.type === context.UserEventType.CREATE)
        {
            var item_record = context.newRecord;
            var item_id = item_record.getValue({
                fieldId: 'id'
            });
            log.debug({
                title: "PCT-HL",
                details: "Item Id : " + item_id // item_id
            })
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalidnumber", "equalto", item_id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "type",
                            summary: "GROUP",
                            label: "Type"
                        }),
                        search.createColumn({
                            name: "inventorylocation",
                            summary: "GROUP",
                            label: "Inventory Location"
                        }),
                        search.createColumn({
                            name: "locationquantityonhand",
                            summary: "MAX",
                            label: "Location On Hand"
                        })
                    ]
            });
            var item_search_count = itemSearchObj.runPaged().count;
            log.debug("PCT-HL", "Item Count : " + item_search_count);
            var item_search_result = itemSearchObj.run().getRange({ start: 0, end: item_search_count });

            for (item_index = 0; item_index < item_search_count; item_index++)
            {
                var item_name = item_search_result[item_index].getValue({ name: 'itemid', summary: "GROUP" });
                var item_type = item_search_result[item_index].getValue({ name: 'type', summary: "GROUP" });
                var item_loaction = item_search_result[item_index].getValue({ name: 'inventorylocation', summary: "GROUP" });
                var item_loaction_name = item_search_result[item_index].getText({ name: 'inventorylocation', summary: "GROUP" });
                var item_qty = item_search_result[item_index].getValue({ name: 'locationquantityonhand', summary: "MAX" });
                if (item_qty == "")
                {
                    item_qty = 0;
                }
                log.debug({ title: "PCT-FS", details: "Item Details - [ Item Name : " + item_name + " ,Item Type : " + item_type + " ,Item Loaction : " + item_loaction_name + " ,Item Quantity : " + item_qty + " ]" });

                var item_qty_record = record.create({
                    type: 'customrecord_pct_hl_item_store_record',
                    isDynamic: true
                });
                item_qty_record.setValue({
                    fieldId: 'custrecord_pct_hl_item_name',
                    value: item_id,
                }).setValue({
                    fieldId: 'custrecord_pct_hl_item_quantity_on_hand',
                    value: item_qty,
                }).setValue({
                    fieldId: 'custrecord_pct_hl_item_location',
                    value: item_loaction
                });
                item_qty_record_id = item_qty_record.save();
                log.debug({ title: "PCT-HL", details: "New Item Created Record Id " + item_qty_record_id })
            }

        }
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
