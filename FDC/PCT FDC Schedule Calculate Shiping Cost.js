/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(["N/record", "N/search"], function (record, search,
) {

    function execute(context) {
        //  if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
        try {
            let finalShipCost = 0
            log.debug("PCT", "In After Submit Script");

            // let newRecord = context.newRecord;
            let newRecord = record.load({
                type: 'itemfulfillment',
                id: scriptContext.newRecord.id,
                isDynamic: true
            })
            let shippingCostCalculation = newRecord.getValue({ fieldId: 'custbody_pct_fdc_ship_cost_calculation' });
            let shipstatus = newRecord.getValue({ fieldId: 'shipstatus' });
            if (!shippingCostCalculation && shipstatus == 'C') {

                let customer = newRecord.getValue({ fieldId: 'entity' });
                let salesOrder = newRecord.getValue({ fieldId: 'createdfrom' });
                let totalListCharges = 0;
                let totalListSurCharges = 0
                let serviceName = '';

                let packagineLine = newRecord.getLineCount({
                    sublistId: 'package'
                })
                let totalWeight = 0;
                let lineWeight = 0
                for (let packageLineIndex = 0; packageLineIndex < packagineLine; packageLineIndex++) {
                    lineWeight = newRecord.getSublistValue({
                        sublistId: 'package',
                        fieldId: 'packageweight',
                        line: packageLineIndex
                    })
                    if (lineWeight == '' || lineWeight == null || isNaN(lineWeight)) {
                        lineWeight = 0
                    }
                    totalWeight = parseInt(totalWeight) + parseInt(lineWeight)
                }

                for (let packageLineIndex = 0; packageLineIndex < newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_sj_pkg_item_fulfillment'
                }); packageLineIndex++) {
                    totalListCharges += newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sj_pkg_item_fulfillment',
                        fieldId: 'custrecord_sj_pkg_listcharges',
                        line: packageLineIndex
                    })
                    totalListSurCharges += newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sj_pkg_item_fulfillment',
                        fieldId: 'custrecord_sj_pkg_listsurcharges',
                        line: packageLineIndex
                    })
                    serviceName = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sj_pkg_item_fulfillment',
                        fieldId: 'custrecord_sj_pkg_service_name',
                        line: packageLineIndex
                    })

                }
                // log.debug('totalListCharges', totalListCharges)
                // log.debug('totalListSurCharges', totalListSurCharges)
                let fdcShipDiscountPercentage = getDiscountFromDisCountPercentageRecord(customer, serviceName);
                let valueAfterDiscount = (totalListCharges - (totalListCharges * fdcShipDiscountPercentage) + totalListSurCharges).toFixed(3)
                log.debug("PCT-valueAfterDiscount", valueAfterDiscount)
                finalShipCost = valueAfterDiscount;
                // let shippingCost = newRecord.getValue({ fieldId: 'shippingcost' });
                // let shippingCost1 = newRecord.getValue({ fieldId: 'custbody_shipengine_shippiing_cost' });
                // let shippingCostBeforeDiscount = parseFloat(shippingCost1, 2)
                // let shippingCost = shippingCostBeforeDiscount;
                // if (parseInt(shippingDiscountObj.discountRate) > 0) {
                //     shippingCost = (shippingCostBeforeDiscount / (1 - (shippingDiscountObj.discountRate / 100)))
                // }
                // log.debug({
                //     title: 'shippingCostBeforeDiscount =' + shippingCostBeforeDiscount,
                //     details: 'shippingCost =' + shippingCost
                // })
                // //shippingCost

                // let customer = newRecord.getValue({ fieldId: 'entity' });
                // let salesOrder = newRecord.getValue({ fieldId: 'createdfrom' });
                let shipMethod = newRecord.getValue({ fieldId: 'shipmethod' });
                let getDiscountPercentageResponse = getDiscountPercentage(customer, shipMethod)
                // //'minCharge' : minCharge,'perLabelCharge':perLabelCharge
                // log.debug({
                //     title: 'getDiscountPercentageResponse',
                //     details: getDiscountPercentageResponse
                // })
                // if (getDiscountPercentageResponse.isSuccess) {
                //     if (getDiscountPercentageResponse.value > 0) {
                //         finalShipCost = shippingCost * (1 - getDiscountPercentageResponse.value);
                //     } else {
                //         finalShipCost = shippingCost
                //     }
                // }
                // else {
                //     finalShipCost = shippingCost
                // }
                // let finalShipCostBeforeCustomerDiscount = finalShipCost

                log.debug("PCT-finalShipCost 1", finalShipCost);
                let subtotal = getSOSubtotal(salesOrder)
                // log.debug("PCT-FDC Sales Order Subtotal", subtotal);
                let subTotalCost = Math.ceil(subtotal / 100) * 0.4//shippingDiscountObj.selfInsurenceRate//0.4;
                if (subTotalCost == null || isNaN(subTotalCost)) {
                    subTotalCost = 0
                }
                log.debug({
                    title: 'subTotalCost',
                    details: subTotalCost
                })
                finalShipCost = parseFloat(finalShipCost, 2) + parseFloat(subTotalCost, 2)
                log.debug("PCT-finalShipCost 2", finalShipCost);
                // log.debug({
                //     title: "newRecord.getLineCount({ sublistId: 'packagefedex' })",
                //     details: newRecord.getLineCount({ sublistId: 'packagefedex' })
                // })
                let packigingLine = newRecord.getLineCount({ sublistId: 'packagefedex' })
                if (packigingLine == -1) {
                    packigingLine = newRecord.getLineCount({ sublistId: 'package' })
                }
                let weightCharge = 0
                // log.debug({
                //     title: 'getDiscountPercentageResponse.value',
                //     details: getDiscountPercentageResponse.value
                // })
                // if (getDiscountPercentageResponse.value == 0) {
                //     weightCharge = totalWeight * getDiscountPercentageResponse.perLabelCharge
                //     if (weightCharge < getDiscountPercentageResponse.minCharge) {
                //         weightCharge = getDiscountPercentageResponse.minCharge
                //     }
                //     finalShipCost = weightCharge
                // } else {

                //     // for (let IfIndex = 0; IfIndex < packigingLine; IfIndex++) {
                //     //     finalShipCost += parseInt(shippingDiscountObj.perPackageFee)//3;
                //     // }
                // }
                // if (finalShipCost == 0) {
                //     finalShipCost = finalShipCostBeforeCustomerDiscount
                //     for (let IfIndex = 0; IfIndex < packigingLine; IfIndex++) {
                //         finalShipCost += 3//parseInt(shippingDiscountObj.perPackageFee)//3;
                //     }

                //     let subTotalCost = Math.ceil(subtotal / 100) * 0.4//shippingDiscountObj.selfInsurenceRate//0.4;
                //     if (subTotalCost == null || isNaN(subTotalCost)) {
                //         subTotalCost = 0
                //     }
                //     log.debug({
                //         title: 'subTotalCost',
                //         details: subTotalCost
                //     })
                //     finalShipCost += parseFloat(subTotalCost)
                // }
                // log.debug("PCT-finalShipCost 3", finalShipCost + ' packigingLine =' + packigingLine + ' shippingDiscountObj.perPackageFee =' + shippingDiscountObj.perPackageFee);
                for (let IfIndex = 0; IfIndex < packigingLine; IfIndex++) {
                    finalShipCost += 3;
                }

                if (parseFloat(finalShipCost) > 0) {
                    let updatedIFId = record.submitFields({
                        type: record.Type.ITEM_FULFILLMENT,
                        id: newRecord.getValue({ fieldId: 'id' }),
                        values: {

                            'shippingcost': parseFloat(finalShipCost, 2),
                            'custbody_pct_fdc_ship_cost_calculation': true,
                        }
                    });
                    /*
                     'custbody_pct_fdc_ns_ship_cost': shippingCost,
                            'custbody_shipengine_shippiing_cost':shippingCost,*/
                    log.debug("PCT", "Value Updated for : " + updatedIFId);
                }
            }
        }
        catch (error) {
            log.debug("PCT", error.message);
        }
        // }
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
    const getShiipingItemId = (shipMethod) => {
        let shippingInternalId = 0;
        var shipitemSearchObj = search.create({
            type: "shipitem",
            filters:
                [
                    ["itemid", "is", shipMethod]
                ],
            columns:
                [
                    search.createColumn({ name: "itemid", label: "Name" })
                ]
        });
        var searchResultCount = shipitemSearchObj.runPaged().count;
        // log.debug("shipitemSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {


            shipitemSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                shippingInternalId = result.id;
                return;
            });
        }
        return shippingInternalId;

    }
    const getDiscountFromDisCountPercentageRecord = (customer, shipMethod) => {
        // log.debug(getShiipingItemId(shipMethod))

        let discountPercentage = 0;
        // let minCharge = 0
        // let perLabelCharge = 0
        var customrecord_fdc_ship_disc_tableSearchObj = search.create({
            type: "customrecord_fdc_ship_disc_table",
            filters:
                [
                    ["custrecord_fdc_ship_disc_cust", "anyof", customer],
                    "AND",
                    ["custrecord_fdc_ship_disc_table.custrecord1398", "anyof", getShiipingItemId(shipMethod)]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_fdc_ship_disc_percentage",
                        join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                        label: "Discount Percentage"
                    }),
                    search.createColumn({
                        name: "custrecord_fdc_per_lb_charge",
                        join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                        label: "per Label Charge"
                    })
                    , search.createColumn({
                        name: "custrecord_fdc_ship_disc_min_charge",
                        join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                        label: "Min Charge"
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
                // minCharge = result.getValue({
                //     name: "custrecord_fdc_ship_disc_min_charge",
                //     join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                //     label: "Min Charge"
                // })
                // perLabelCharge = result.getValue({
                //     name: "custrecord_fdc_per_lb_charge",
                //     join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                //     label: "per Label Charge"
                // })

                return true;
            });
            log.debug({
                title: 'discountPercentage',
                details: discountPercentage
            })

        }
        return parseFloat(discountPercentage) / 100.0;

    }

    const getDiscountPercentage = (customer, shipMethod) => {
        let discountPercentage = '0%';
        let minCharge = 0
        let perLabelCharge = 0
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
                    }),
                    search.createColumn({
                        name: "custrecord_fdc_per_lb_charge",
                        join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                        label: "per Label Charge"
                    })
                    , search.createColumn({
                        name: "custrecord_fdc_ship_disc_min_charge",
                        join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                        label: "Min Charge"
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
                minCharge = result.getValue({
                    name: "custrecord_fdc_ship_disc_min_charge",
                    join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                    label: "Min Charge"
                })
                perLabelCharge = result.getValue({
                    name: "custrecord_fdc_per_lb_charge",
                    join: "CUSTRECORD_FDC_SHIP_DISC_TABLE",
                    label: "per Label Charge"
                })
                log.debug({
                    title: 'discountPercentage',
                    details: discountPercentage
                })
                return true;
            });
            return { 'isSuccess': true, 'value': parseFloat(discountPercentage) / 100.0, 'minCharge': minCharge, 'perLabelCharge': perLabelCharge }

        } else {
            return { 'isSuccess': true, 'value': parseFloat(discountPercentage) / 100.0, 'minCharge': minCharge, 'perLabelCharge': perLabelCharge }
        }

    }

    return {
        execute: execute
    }
});
