/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/currentRecord', 'N/log', 'N/search', 'N/error'], function (record, currentRecord, log, search, error)
{

    function getInputData()
    {
        log.debug({
            title: "as-log",
            details: "In Map Reduce"
        });

        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                ],
            columns:
                [
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "type", label: "Type" })
                ]
        });

        // if (assemblyitemSearchObj != null) 
        // {
        //     var resultSet = new Array();
        //     assemblyitemSearchObj.run().each(
        //         function (result)
        //         {
        //             var dateSet = new Object();
        //             var searchItemID = result.getValue({
        //                 name: 'internalid'
        //             });
        //             var searchItemType = result.getValue({
        //                 name: 'type'
        //             });
        //             dateSet['id'] = searchItemID;
        //             dateSet['type'] = searchItemType;
        //             resultSet.push(dateSet);
        //             return true;
        //         }
        //     );
        //     return resultSet;
        // }



        var searchCount = assemblyitemSearchObj.runPaged().count;
        log.debug("PCT-Shopify-Integration", "Search Result Count : " + searchCount);
        var start = 0;
        var end = 1000;
        var resultSet = new Array();
        do
        {
            log.debug("PCT-Shopify-Integration", "In Get Input Do");
            var searchResult = assemblyitemSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < searchResult.length; getid_index++)
            {
                var dateSet = new Object();
                var searchItemID = searchResult[getid_index].getValue({
                    name: 'internalid'
                });
                var searchItemType = searchResult[getid_index].getValue({
                    name: 'type'
                });
                dateSet['id'] = searchItemID;
                dateSet['type'] = searchItemType;
                resultSet.push(dateSet);
            }
            start += 1000;
            end += 1000;
            searchCount -= 1000;
        }
        while (searchCount > 0);
        log.debug({ title: "PCT-Shopify-Integration", details: "Shopify Web Order Id Array Length : " + resultSet.length + ", Shopify Web Order Id Array : [" + resultSet + "]" });
        return resultSet;

    }

    function map(context)
    {
        var itemID = JSON.parse(context.value).id;
        var itemType = JSON.parse(context.value).type;
        log.debug({
            title: "as-log",
            details: "item ID = " + itemID + " item type = " + itemType
        });

        if (itemType == 'Assembly')
        {
            itemType = 'assemblyitem';
        }

        var loadItem = record.load({
            type: itemType,
            id: itemID,
            isDynamic: true,
        });
        log.debug({
            title: "as-log",
            details: "loadItem" + loadItem
        });

        var bomLineCount = loadItem.getLineCount({
            sublistId: 'billofmaterials'
        });

        log.debug({
            title: "as-log",
            details: 'Bom Count= ' + bomLineCount
        });

        for (var index = bomLineCount - 1; index >= 0; index--)
        {
            loadItem.removeLine({
                sublistId: 'billofmaterials',
                line: index,
                ignoreRecalc: true
            });
            log.debug({
                title: "as-log",
                details: "Item removed"
            });
        }
        loadItem.save();
        log.debug({
            title: "as-log",
            details: "Item saved"
        });
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
