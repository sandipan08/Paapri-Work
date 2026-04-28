/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        return { 'isSuccess': true, 'data': getItemList() }
    }



    function getItemList() {
        let itemArray = [];
        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var itemCount = assemblyitemSearchObj.runPaged().count;
        log.debug("PCT", "Item Count : " + itemCount);
        var start = 0;
        var end = 1000;
        do {
            var result = assemblyitemSearchObj.run().getRange({
                start: start,
                end: end
            });

            for (let woIndex = 0; woIndex < result.length; woIndex++) {
                let itemObj = {};
                itemObj.internalId = result[woIndex].id;
                itemObj.itemName = result[woIndex].getValue('itemid')
                itemArray.push(itemObj);
            }
            end += 1000;
            start += 1000;
            itemCount -= 1000;
        }
        while (itemCount > 0);
        return itemArray;


    }
    return {
        get: _get,
    }
});
