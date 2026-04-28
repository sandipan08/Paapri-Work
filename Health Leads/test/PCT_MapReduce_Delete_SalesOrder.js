/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    function getInputData()
    {
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["status", "anyof", "SalesOrd:D", "SalesOrd:B"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("Search result count", searchResultCount);
        var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: searchResultCount });
        var SO_id_array = new Array();
        for (var getid_index = 0; getid_index < searchResultCount; getid_index++)
        {
            var record_id = searchResult[getid_index].id;
            // log.debug({
            //     title: "PCT-Fushi",
            //     details: "Sales Order Record ID : " + record_id
            // })
            SO_id_array.push(record_id);
        }
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + SO_id_array.length
        })
        return SO_id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-Fushi-MAP", details: "In Map Function" })
        try
        {
            var id = context.value;
            log.debug({ title: "PCT-Fushi-MAP", details: "Opration Start For Sales Order Id :" + id })
            var SalesOrder_Load = record.load({
                type: "salesorder",
                id: id
            });
            var item_count = SalesOrder_Load.getLineCount({ sublistId: 'item' });   // This will count the total item present in SO
            log.debug({ title: "PCT-Fushi", details: "Total Item : " + item_count });
            for (var item_index = 0; item_index < item_count; item_index++)   
            {
                var item_id = SalesOrder_Load.getSublistValue({    // This will Load each item in SO
                    sublistId: 'item',
                    fieldId: 'item',
                    line: item_index
                });
                log.debug({ title: "PCT-Fushi", details: "Item Id: " + item_id });
                // //------------------------------ Search for Find Item On Hand Qty ----------------------------------
                // var itemSearchObj = search.create({
                //     type: "item",
                //     filters:
                //         [
                //             ["type", "anyof", "InvtPart", "Assembly", "Group", "Kit", "NonInvtPart", "OthCharge"],
                //             "AND",
                //             ["internalidnumber", "equalto", item_id]
                //         ],
                //     columns:
                //         [
                //             search.createColumn({
                //                 name: "itemid",
                //                 sort: search.Sort.ASC,
                //                 label: "Name"
                //             }),
                //             search.createColumn({ name: "totalquantityonhand", label: "Total Quantity On Hand" }),
                //             search.createColumn({ name: "internalid", label: "Internal ID" })
                //         ]
                // });
                // var searchResultCount = itemSearchObj.runPaged().count;
                // log.debug("itemSearchObj result count", searchResultCount);
                // var searchResult = itemSearchObj.run().getRange({ start: 0, end: searchResultCount });
                // var item_name = searchResult[0].getValue({ name: 'itemid' });
                // var item_onHandQty = searchResult[1].getValue({ name: 'totalquantityonhand' });
                // log.debug({ title: "PCT-Fushi", details: item_name + " Item on Hand Qty  :" + item_onHandQty })
            }

        }
        catch (ex) { log.error({ title: 'map: error', details: ex }); }

    }


    return {
        getInputData: getInputData,
        map: map
    }
});
