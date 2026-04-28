/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/email', 'N/file', 'N/record', 'N/search', 'N/runtime'], function (email, file, record, search, runtime) {

    function execute(context) {
        var customrecord_pct_configureSearchObj = search.create({
            type: "customrecord_pct_configure",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_pct_cpq_linked_itemno", "anyof", "@NONE@"],
                    "AND",
                    ["custrecord_pct_linked_quote_no", "noneof", "@NONE@"],
                    // "AND",
                    // ["created", "onorafter", "7/1/2024 12:00 am"]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_pct_sc_assname", label: "Assembly Name" })
                ]
        });
        var searchResultCount = customrecord_pct_configureSearchObj.runPaged().count;
        log.debug("customrecord_pct_configureSearchObj result count", searchResultCount);
        customrecord_pct_configureSearchObj.run().each(function (result) {

            // let itemResponse = findAssemblyId(result.getValue('custrecord_pct_sc_assname'))
            let itemResponse = findAssembly(result.getValue('custrecord_pct_sc_assname'))
            log.debug("PCT", itemResponse)
            if (itemResponse.isSuccess) {
                record.submitFields({
                    type: 'customrecord_pct_configure',
                    id: result.id,
                    values: {
                        'custrecord_pct_cpq_linked_itemno': itemResponse.data,
                        // 'custrecord_pct_cpq_linked_bom': itemResponse.data.bomId,
                        // 'custrecord_pct_cpq_linked_revision': itemResponse.data.bomRev,
                    }
                });
                log.debug("PCT", "Value Updated in SCE :" + result.id)

            }
            return true;
        });
    }

    const findAssembly = (item) => {
        log.debug("PCT-findAssembly Name", item)

        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["name", "is", item]
                ],
            columns:
                [
                    search.createColumn({ name: "itemid", label: "Name" })
                ]
        });
        var searchResultCount = assemblyitemSearchObj.runPaged().count;
        log.debug("assemblyitemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let itemId = 0
            assemblyitemSearchObj.run().each(function (result) {
                itemId = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': parseInt(itemId) }
        }
        else {
            return { 'isSuccess': false, 'data': 0 }
        }

    }


    // const findAssemblyId = (item) => {
    //     let itemObj = {
    //         'itemId': 0,
    //         'bomId': 0,
    //         'bomRev': 0,
    //         'routing': 0
    //     }
    //     var assemblyitemSearchObj = search.create({
    //         type: "assemblyitem",
    //         filters:
    //             [
    //                 ["type", "anyof", "Assembly"],
    //                 "AND",
    //                 ["name", "is", item]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "itemid", label: "Name" })
    //             ]
    //     });
    //     var searchResultCount = assemblyitemSearchObj.runPaged().count;
    //     log.debug("assemblyitemSearchObj result count", searchResultCount);
    //     if (searchResultCount > 0) {
    //         assemblyitemSearchObj.run().each(function (result) {
    //             itemObj.itemId = result.id;
    //             let itemLoad = record.load({
    //                 type: record.Type.ASSEMBLY_ITEM,
    //                 id: result.id,
    //                 // isDynamic: true
    //             });
    //             for (let itemIndex = 0; itemIndex < itemLoad.getLineCount({ sublistId: 'billofmaterials' }); itemIndex++) {
    //                 let masterDefault = itemLoad.getSublistValue({
    //                     sublistId: 'billofmaterials',
    //                     fieldId: 'masterdefault',
    //                     line: itemIndex
    //                 });
    //                 log.debug("PCT", masterDefault)
    //                 if (masterDefault) {
    //                     itemObj.bomId = itemLoad.getSublistValue({
    //                         sublistId: 'billofmaterials',
    //                         fieldId: 'billofmaterials',
    //                         line: itemIndex
    //                     }),
    //                         itemObj.bomRev = itemLoad.getSublistValue({
    //                             sublistId: 'billofmaterials',
    //                             fieldId: 'currentrevision',
    //                             line: itemIndex
    //                         })
    //                 }
    //             }
    //             return true;
    //         });

    //         return { 'isSuccess': true, 'data': itemObj }
    //     }
    //     else {
    //         return { 'isSuccess': false, 'data': itemObj }
    //     }

    // }

    return {
        execute: execute
    }
});
