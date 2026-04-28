/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", 'N/search'], function (record, search) {

    function beforeLoad(context) {
        try {
            var recId = context.newRecord.id;
            log.debug({ title: 'PCT-Strouse', details: "Record Id " + recId });
            var fieldLookUp = search.lookupFields({
                type: 'customrecord_pct_api_recycle',
                id: recId,
                columns: ['custrecord_pct_api_work_order', 'custrecord_pct_api_location']
            });
            log.debug({ title: 'PCT-Strouse', details: fieldLookUp.custrecord_pct_api_work_order });
            if (context.type == context.UserEventType.VIEW && fieldLookUp.custrecord_pct_api_work_order[0].value == '') {
                let inputItemQty = getInputIteQty(recId);
                // let responseObj = getItemDetails(recId, inputItemQty);
                // log.debug("PCT-SC", JSON.stringify(responseObj))
                // log.debug("PCT-SC", getInputIteQty(recId))
                context.form.clientScriptModulePath = './PCT_Strouse_Client_Open_WO.js'
                context.form.addButton({
                    id: 'custpage_track_labour_cost_button',
                    label: 'Track Labor Cost',
                    // functionName: `onclickCallClient(${responseObj})`
                    functionName: `onclickCallClient(${inputItemQty},${recId},${fieldLookUp.custrecord_pct_api_location[0].value})`
                });

            }
        }
        catch (error) {
            log.debug("PCT", error.message)
        }
    }

    function getInputIteQty(recId) {
        var inputIteQty = 0;
        var customrecord_pct_recycle_input_itemsSearchObj = search.create({
            type: "customrecord_pct_recycle_input_items",
            filters:
                [
                    ["custrecord_pct_pct_recycle_link", "anyof", recId]
                ],
            columns:
                [
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "custrecord_pct_inputs_item", label: "Input Item" }),
                    search.createColumn({ name: "custrecord_pct_inputs_lot_number", label: "Lot Number" }),
                    search.createColumn({ name: "custrecord_pct_inputs_quantity", label: "Quantity" }),
                    search.createColumn({ name: "custrecord_pct_sc_unit_cost", label: "Unit Cost" })
                ]
        });
        var mimoInputItemCount = customrecord_pct_recycle_input_itemsSearchObj.runPaged().count;
        log.debug("MIMO Input Item Count : ", mimoInputItemCount);
        if (mimoInputItemCount > 0) {
            customrecord_pct_recycle_input_itemsSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                inputIteQty += parseInt(result.getValue({ name: "custrecord_pct_inputs_quantity", label: "Quantity" }))
                return true;
            });
            return inputIteQty;
        }
    }

    // const getItemDetails = (recId, inputItemQty) => {
    //     let itemObj = {};
    //     var assemblyitemSearchObj = search.create({
    //         type: "assemblyitem",
    //         filters:
    //             [
    //                 ["type", "anyof", "Assembly"],
    //                 "AND",
    //                 ["name", "is", "Slitting Assembly"]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "displayname", label: "Display Name" }),
    //                 search.createColumn({
    //                     name: "billofmaterials",
    //                     join: "assemblyItemBillOfMaterials",
    //                     label: "Bill of Materials"
    //                 }),
    //                 search.createColumn({
    //                     name: "billofmaterialsid",
    //                     join: "assemblyItemBillOfMaterials",
    //                     label: "Bill of Materials ID"
    //                 })
    //             ]
    //     });
    //     var itemCount = assemblyitemSearchObj.runPaged().count;
    //     log.debug("PCT-SC", "Item Count : " + itemCount);
    //     if (itemCount > 0) {
    //         assemblyitemSearchObj.run().each(function (result) {
    //             itemObj['internalId'] = result.id;
    //             itemObj['billofmaterials'] = result.getValue({
    //                 name: "billofmaterials",
    //                 join: "assemblyItemBillOfMaterials",
    //                 label: "Bill of Materials"
    //             })
    //             itemObj['billofmaterialsId'] = result.getValue({
    //                 name: "billofmaterialsid",
    //                 join: "assemblyItemBillOfMaterials",
    //                 label: "Bill of Materials ID"
    //             })
    //             return true;
    //         });
    //         itemObj['mimoId'] = recId;
    //         itemObj['inputItemQty'] = inputItemQty;
    //         return itemObj;
    //     }
    //     else {
    //         return itemObj;
    //     }

    // }

    return {
        beforeLoad: beforeLoad,
    }
});
