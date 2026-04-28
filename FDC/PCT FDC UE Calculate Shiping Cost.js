/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search"], function (record, search,
) {

    function beforeLoad(context) {



    }

    function beforeSubmit(context) {

    }

    function afterSubmit(context) {
        if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
            try {
                let finalShipCost = 0
                log.debug("PCT", "In After Submit Script");

                let newRecord = context.newRecord;
                let shippingCostCalculation = newRecord.getValue({ fieldId: 'custbody_pct_fdc_ship_cost_calculation' });
                if (!shippingCostCalculation) {
                    let shippingCost = newRecord.getValue({ fieldId: 'shippingcost' });

                    let customer = newRecord.getValue({ fieldId: 'entity' });
                    let salesOrder = newRecord.getValue({ fieldId: 'createdfrom' });
                    let shipMethod = newRecord.getValue({ fieldId: 'shipmethod' });
                    let getDiscountPercentageResponse = getDiscountPercentage(customer, shipMethod)
                    if (getDiscountPercentageResponse.isSuccess) {
                        finalShipCost = shippingCost * getDiscountPercentageResponse.value;
                    }
                    else {
                        finalShipCost = shippingCost
                    }

                    log.debug("PCT-finalShipCost 1", finalShipCost);
                    let subtotal = getSOSubtotal(salesOrder)
                    log.debug("PCT-FDC Sales Order Subtotal", subtotal);
                    finalShipCost += Math.ceil(subtotal / 100) * 0.4;
                    log.debug("PCT-finalShipCost 2", finalShipCost);
                    for (let IfIndex = 0; IfIndex < newRecord.getLineCount({ sublistId: 'packagefedex' }); IfIndex++) {
                        finalShipCost += 3;
                    }
                    log.debug("PCT-finalShipCost 3", finalShipCost);
                    let updatedIFId = record.submitFields({
                        type: record.Type.ITEM_FULFILLMENT,
                        id: newRecord.getValue({ fieldId: 'id' }),
                        values: {
                            'custbody_pct_fdc_ns_ship_cost': shippingCost,
                            'shippingcost': finalShipCost,
                            'custbody_pct_fdc_ship_cost_calculation': true,

                        }
                    });
                    log.debug("PCT", "Value Updated for : " + updatedIFId);
                }
            }
            catch (error) {
                log.debug("PCT", error.message);
            }
        }
    }


    const getSOSubtotal = (salesOrder) => {
        let subtotal = 0;
        var salesorderSearchObj = search.create({
            type: "salesorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["internalid", "anyof", salesOrder],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "formulacurrency",
                        formula: "{amount} - nvl({taxtotal},0) - nvl({shippingamount},0)",
                        label: "SubTotal"
                    })
                ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            salesorderSearchObj.run().each(function (result) {
                subtotal = result.getValue({
                    name: "formulacurrency",
                    formula: "{amount} - nvl({taxtotal},0) - nvl({shippingamount},0)",
                    label: "SubTotal"
                })
                return true;
            });
            return subtotal;
        }
        else {
            return subtotal;
        }


    }
    const getDiscountPercentage = (customer, shipMethod) => {
        let discountPercentage = '0%';
        var customrecord_fdc_ship_disc_tableSearchObj = search.create({
            type: "customrecord_fdc_ship_disc_table",
            filters:
                [
                    ["custrecord_fdc_ship_disc_cust", "anyof", customer],
                    "AND",
                    ["custrecord_fdc_ship_disc_table.custrecord1398", "anyof", shipMethod]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_fdc_ship_disc_percentage",
                        join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                        label: "Discount Percentage"
                    })
                ]
        });
        var searchResultCount = customrecord_fdc_ship_disc_tableSearchObj.runPaged().count;
        log.debug("customrecord_fdc_ship_disc_tableSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            customrecord_fdc_ship_disc_tableSearchObj.run().each(function (result) {
                discountPercentage = result.getValue({
                    name: "custrecord_fdc_ship_disc_percentage",
                    join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                    label: "Discount Percentage"
                })
                return true;
            });
            return { 'isSuccess': true, 'value': parseFloat(discountPercentage) / 100.0 }

        } else {
            return { 'isSuccess': true, 'value': parseFloat(discountPercentage) / 100.0 }
        }

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
