/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/search'], function (search) {

    const saveRecord = (context) => {
        try {
            let currentRecord = context.currentRecord,
                inputItemLineCount = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_pct_pct_recycle_link'
                }),
                outputItemLineCount = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_pct_api_linked_pct_sort_recyc'
                }),
                errorMessage = inputItemLineCount > 0 ? outputItemLineCount > 0 ? '' : 'Please Enter Atleast One line in Output Items' : 'Please Enter Atleast One line in Input Items'

            if (errorMessage) {
                alert(errorMessage)
                return false;
            }
            return true;
        }
        catch (error) {
            console.log(`SaveRecord->Error-->${error.message}`)
        }
    }

    function validateLine(context) {
        try {
            var currentRecord = context.currentRecord,
                sublistId = context.sublistId

            if (sublistId === 'recmachcustrecord_pct_pct_recycle_link') {
                var item = currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                    fieldId: 'custrecord_pct_inputs_item'
                }),
                    lotNo = currentRecord.getCurrentSublistText({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_inputs_lot_number'
                    }),
                    lotAvailableQuantity = currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_mimo_input_item_lot_qty'
                    }),
                    lotLocation = currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_mimo_input_item_lot_loc'
                    }),
                    lotLocationText = currentRecord.getCurrentSublistText({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_mimo_input_item_lot_loc'
                    })

                // if (onHandQty['onHand'] == 0) {
                //     alert('Please Select a Different Lot')
                //     return false;
                // }
                // else {
                var itemQty = currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                    fieldId: 'custrecord_pct_inputs_quantity'
                })
                // log.debug({
                //     title: 'PCT-LOG',
                //     details: 'Item Qty = ' + itemQty
                // })
                if (itemQty > lotAvailableQuantity) {
                    alert(`You have only ${lotAvailableQuantity} qty available for lot: ${lotNo} at location: ${lotLocationText} !!`)
                    return false;
                }
                else {
                    let getAverageCostResponse = getItemLocationAvgCost({ item, itemLocation: lotLocation })
                    console.log(getAverageCostResponse);
                    if (getAverageCostResponse.isSuccess)
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                            fieldId: 'custrecord_pct_mimo_input_item_avg_cost',
                            value: getAverageCostResponse.data,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        })
                    return true;
                }
                // }
            }
            return true;
        }
        catch (error) {
            console.log(error);
            return true;
        }
    }

    const fieldChanged = (context) => {
        try {
            const currentRecord = context.currentRecord,
                sublistId = context.sublistId,
                fieldId = context.fieldId

            if (sublistId === 'recmachcustrecord_pct_pct_recycle_link' && (fieldId === 'custrecord_pct_mimo_input_item_lot_loc' || fieldId === 'custrecord_pct_inputs_lot_number')) {
                var item = currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                    fieldId: 'custrecord_pct_inputs_item'
                }),
                    lotNo = currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_inputs_lot_number'
                    }),
                    lotLocation = currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_mimo_input_item_lot_loc'
                    })

                if (lotLocation && lotNo && item) {
                    let lotAvailableQty = 0
                    const getLotQuantityResponse = getLotQuantity(item, lotNo, lotLocation)
                    console.log(getLotQuantityResponse)
                    if (getLotQuantityResponse.isSuccess) {
                        lotAvailableQty = getLotQuantityResponse.data.onHand || 0
                    }
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                        fieldId: 'custrecord_pct_mimo_input_item_lot_qty',
                        value: lotAvailableQty,
                        ignoreFieldChange: false,
                        forceSyncSourcing: true
                    })
                }
            }
        }
        catch (error) {
            console.log(`Field Change Error = ${error.message}`)
        }
    }

    function getLotQuantity(item, lot, location) {
        try {
            var inventorynumberSearchObj = search.create({
                type: "inventorynumber",
                filters:
                    [
                        ["item", "anyof", item],
                        "AND",
                        ["internalid", "anyof", lot],
                        "AND",
                        ["location", "anyof", location]
                    ],
                columns:
                    [
                        search.createColumn({ name: "location", label: "Location" }),
                        search.createColumn({ name: "quantityonhand", label: "On Hand" }),
                        search.createColumn({ name: "quantityavailable", label: "Available" })
                    ]
            });

            var res = {};
            var searchResultCount = inventorynumberSearchObj.runPaged().count;
            log.debug("inventorynumberSearchObj result count", searchResultCount);
            if (searchResultCount === 0) throw new Error('No data found')
            inventorynumberSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                res['onHand'] = result.getValue({ name: "quantityavailable" });
                res['location'] = result.getValue({ name: "location" });
            });
            return { isSuccess: true, data: res };
        }
        catch (error) {
            return { isSuccess: false }
        }
    }

    const getItemLocationAvgCost = (dataObject) => {
        try {
            let { item, itemLocation } = dataObject,
                averageCost = 0,
                itemSearchObj = search.create({
                    type: "item",
                    filters:
                        [
                            ["internalid", "anyof", item],
                            "AND",
                            ["isinactive", "is", "F"],
                            "AND",
                            ["inventorylocation", "anyof", itemLocation]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "locationaveragecost", label: "Location Average Cost" })
                        ]
                }),
                searchResultCount = itemSearchObj.runPaged().count;

            log.debug("itemSearchObj result count", searchResultCount);
            if (searchResultCount === 0) throw Error("No Data Found")

            itemSearchObj.run().each(function (result) {
                averageCost = result.getValue({
                    name: "locationaveragecost"
                })
                return true;
            });

            return { isSuccess: true, data: averageCost }
        }
        catch (error) {
            return { isSuccess: false, error: error.message }
        }
    }

    return { validateLine, saveRecord, fieldChanged }
});