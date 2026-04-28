/**
*              //////////     PCT SHOPIFY INTEGRATION      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  WorkflowActionScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for PCT Shopify Integration, you can redistribute
               it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
               published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email', 'N/runtime'], function (log, record, runtime, file, format, search, email, runtime) {
    function onAction(scriptContext) {
        //-------------------- All HardCore Value ---------------------------


        var mOJUDTCShopifyOneOff = 9750;
        var dTCSubscription = 9751;
        var MojuSampleCust = 10376;
        var subsidiary = 1;
        var discountItem = 703;
        var DTC_Packaging = 1143;
        var DTC_Taster_Packaging = 1144;
        var chargeItemId = 695;
        var shippingItemId = 1222;

        var shopifyAddressee = "E2B Logistics"
        var shopifyAddresss1 = "Unit 1, Symmetry Park"
        var shopifyAddresss2 = "Samian Way"
        var shopifyCity = "Aston Clinton Aylesbury"
        var shopifyZip = "HP22 5WJ"

        //-----------------------------------------------------------------


        log.debug({ title: 'PCT-Shopify-Integration', details: "In WorkFlow OnAction Function" });
        var shopify_weborder_load = scriptContext.newRecord;
        var recordId = shopify_weborder_load.getValue({ fieldId: 'id' });
        log.debug({ title: 'PCT-Shopify-Integration', details: 'Shopify Web Record Id : ' + recordId });
        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "" });
        try {
            // ------------------------------------------------Start Get Body Level Details -----------------------------------------
            var shopify_source = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_source' });
            var shopify_customerName = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customername' });
            var shopify_customerId = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customerid' });
            var shopify_customerMail = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customeremail' });
            var shopify_customerPhnNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customerphonenumber' });
            var shopify_salesOrdrNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_sonumber' });
            var shopify_orderId = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_orderid' });
            var shopify_fulfillment = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_fulfillmentstatus' });

            var shopify_discountCode = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_discountcode' });
            var shopify_totalPrice = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_totalprice' });
            var shopify_totalTax = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_totaltax' });
            var shopify_totalDiscount = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_totaldiscount' });

            var shopify_paymentDetails = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_paymentdetails' });
            var shopify_orderCanceled = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_ordercanceled' });
            var shopify_orderRefund = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_orderrefund' });
            var shopify_refundAmount = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_refundamount' });
            var shopify_subscribed = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_is_subscribed' });
            var shopify_noteAttribute = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_note_attribute' });

            log.debug({
                title: "PCT-Shopify-Integration",
                details: "Shopify Web Order Body Field Deatils : ( Customer Name : " + shopify_customerName + ", Customer Id : " + shopify_customerId + ", Customer Mail : " + shopify_customerMail + ", Customer PhnNo : " + shopify_customerPhnNo + ", Sales Order Number :" + shopify_salesOrdrNo + ", Fulfillment Status :" + shopify_fulfillment +
                    ", Total Price : " + shopify_totalPrice + ", Total Tax : " + shopify_totalTax + ", Total Discount : " + shopify_totalDiscount +
                    "Discount Code : " + shopify_discountCode + ", Payment Deatils : " + shopify_paymentDetails + ", Order Canceled  : " + shopify_orderCanceled + ", Order Refund : " + shopify_orderRefund + ", Order Refund Amount  : " + shopify_refundAmount + ", Is Subscribed : " + shopify_subscribed + ", Note Attribute : " + shopify_noteAttribute + " )"
            })
            // if (shopify_orderCanceled)
            // {
            //     shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Warning : Order Canceled" });
            // }

            // ------------------------------------------------End Get Body Level Details -----------------------------------------

            // ------------------------------------------------ Start Get Shipping Details --------------------------------------------

            var shopify_shippingPhoneNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingphone' });
            //var shopify_shippingCountry = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingcountry' });
            var shopify_shippingCountry = "United Kingdom";
            if (shopify_shippingCountry.length <= 2) {
                shopify_shippingCountry = getCountry(shopify_shippingCountry, shopify_weborder_load); // if shipping country came in Code then it will return the Name Only 
            }
            else {
                var market_place = getCountry(shopify_shippingCountry, shopify_weborder_load); // If shipping country in name then it will return the Code Only 
            }
            var shopify_shippingAddressee = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingaddressee' });
            var shopify_shippingAddresss1 = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingaddresss1' });
            var shopify_shippingAddresss2 = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingaddresss2' });
            var shopify_shippingCity = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingcity' });
            var shopify_shippingState = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingstate' });
            var shopify_shippingZip = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingzip' });
            var shopify_shippingCost = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingcost' });
            shopify_shippingCost = parseFloat(shopify_shippingCost).toFixed(2);
            var shopify_shippingTax = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingtax' });
            var shopify_shippingMethod = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingmethod' });

            log.debug({
                title: "PCT-Shopify-Integration",
                details: "Shopify Web Order Shipping Deatils : ( Shipping Phone No : " + shopify_shippingPhoneNo + ", Shipping Country : " + shopify_shippingCountry + ", Shipping Addresee : " + shopify_shippingAddressee +
                    ", Shipping Address1 : " + shopify_shippingAddresss1 + ", Shipping Address2 : " + shopify_shippingAddresss2 + ", Shipping City : " + shopify_shippingCity + ", Shipping State : " + shopify_shippingState + ", Shipping Zip : " + shopify_shippingZip +
                    ", Shipping Cost : " + shopify_shippingCost + ", Shipping Tax : " + shopify_shippingTax + ", Shipping Method : " + shopify_shippingMethod + ", Shipping Market Place : " + market_place + " )"
            })

            // ------------------------------------------------ End Get Shipping Deatils  ---------------------------------------------------

            // ------------------------------------------------ Start Get Billing Deatils ---------------------------------------------------

            var shopify_billingPhoneNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingphone' });
            //var shopify_billingCountry = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingcountry' });
            var shopify_billingCountry = "United Kingdom";
            if (shopify_billingCountry == 'Great Britain') { shopify_billingCountry = 'United Kingdom' }
            if (shopify_billingCountry.length <= 2) {
                shopify_billingCountry = getCountry(shopify_billingCountry, shopify_weborder_load); // if billing country came in Code then it will return the Name Only 
            }
            var shopify_billingAddressee = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingaddressee' });
            var shopify_billingAddresss1 = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingaddress1' });
            var shopify_billingAddresss2 = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingaddress2' });
            var shopify_billingCity = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingcity' });
            var shopify_billingState = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingstate' });
            var shopify_billingZip = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingzip' });

            log.debug({
                title: "PCT-Shopify-Integration",
                details: "Shopify Web Order Billing Deatils : ( Billing Phone No : " + shopify_billingPhoneNo + ", Billing Country : " + shopify_billingCountry + ", Billing Addresee : " + shopify_billingAddressee +
                    ", Billing Address1 : " + shopify_billingAddresss1 + ", Billing Address2 : " + shopify_billingAddresss2 + ", Billing City : " + shopify_billingCity + ", Billing State : " + shopify_billingState + ", Billing Zip : " + shopify_billingZip + " )"
            })
            // ------------------------------------------------ End Get Shipping Deatils  -------------------------------------------------


            //------------------------------------------------- Creating Sales Order ------------------------------------------------

            var salesOrderobj = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_order_source', value: shopify_source });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_sample_type', value: shopify_noteAttribute });

            if (shopify_subscribed == true) {
                if (shopify_source == "moju_second")
                    salesOrderobj.setValue({ fieldId: 'entity', value: MojuSampleCust });
                else
                    salesOrderobj.setValue({ fieldId: 'entity', value: dTCSubscription });

            }
            else {
                if (shopify_source == "moju_second")
                    salesOrderobj.setValue({ fieldId: 'entity', value: MojuSampleCust });
                else
                    salesOrderobj.setValue({ fieldId: 'entity', value: mOJUDTCShopifyOneOff });
            }

            var getSoCustomer = salesOrderobj.getValue({ fieldId: 'entity' });

            var customerSearchArray = searchCustomer(getSoCustomer);
            var customerClass = customerSearchArray[0];
            var customerSegment = customerSearchArray[1];

            salesOrderobj.setValue({ fieldId: 'custbody_pct_order_id', value: shopify_orderId });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_sales_order_no', value: shopify_salesOrdrNo });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_web_order_no', value: recordId });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_discount_code', value: shopify_discountCode });
            salesOrderobj.setValue({ fieldId: 'orderstatus', value: "B" });
            salesOrderobj.setValue({ fieldId: 'subsidiary', value: subsidiary });
            salesOrderobj.setText({ fieldId: 'location', text: "E2B" });

            salesOrderobj.setValue({ fieldId: 'class', value: customerClass });
            salesOrderobj.setText({ fieldId: 'cseg_pct_moju_cseg', text: customerSegment });

            //------------------------------------------------ Add Shipping in Sales Order --------------------------------------

            var subrec = salesOrderobj.getSubrecord({ fieldId: 'shippingaddress' });
            subrec.setValue({ fieldId: 'addressee', value: shopifyAddressee });
            subrec.setValue({ fieldId: 'addr1', value: shopifyAddresss1 });
            subrec.setValue({ fieldId: 'addr2', value: shopifyAddresss2 });
            subrec.setValue({ fieldId: 'city', value: shopifyCity });

            subrec.setValue({ fieldId: 'zip', value: shopifyZip });
            subrec.setValue({ fieldId: 'override', value: false });

            if (shopify_shippingCost > 0) {
                salesOrderobj.setValue({ fieldId: 'shipmethod', value: shippingItemId });
                //  salesOrderobj.setText({ fieldId: 'shippingtaxcode', text: " " });
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_shippingmethod', value: "Standard Shipping" });


            }
            salesOrderobj.setValue({ fieldId: 'shippingcost', value: shopify_shippingCost });


            // ------------------------------------------------  Get Item Deatils ---------------------------------------------------

            var shopify_item_count = shopify_weborder_load.getLineCount({ sublistId: 'recmachcustrecord_pct_ssoi_child' });
            log.debug({ title: 'PCT-Shopify-Integration', details: "Web Order Item Count : " + shopify_item_count });
            if (shopify_item_count == 0) {
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error :  No Item is there" });
            }
            else {
                var refundObj = {};
                var total_item_count = 0
                for (item_index = 0; item_index < shopify_item_count; item_index++) {
                    var shopify_item_id = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_itemidname',
                        line: item_index
                    });
                    // --------------- Remove "PRO", "SUB", "S" from Item Name -------------

                    shopify_item_id = itemFilter(shopify_item_id);



                    var shopify_item_desc = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_itemdescription',
                        line: item_index
                    });
                    var shopify_item_fulfillable_quantity = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_fulfillablequantity',
                        line: item_index
                    });
                    var shopify_item_quantity = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_quantity',
                        line: item_index
                    });
                    total_item_count += parseInt(shopify_item_quantity);
                    var shopify_item_rate = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_rate',
                        line: item_index
                    });
                    shopify_item_rate = Number(shopify_item_rate).toFixed(5);
                    var shopify_item_net = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_net',
                        line: item_index
                    });
                    var shopify_item_tax_percentage = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_taxrate',
                        line: item_index
                    });
                    shopify_item_tax_percentage = shopify_item_tax_percentage * 100;
                    var shopify_item_lineItemId = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_lineitemid',
                        line: item_index
                    });
                    var shopify_item_discount = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_discount',
                        line: item_index
                    });
                    var shopify_item_isRefund = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_isrefund',
                        line: item_index
                    });
                    log.debug({
                        title: "PCT-Shopify-Integration",
                        details: "Shopify Web Order Item Details: ( Item Name/Id : " + shopify_item_id + ", Item description : " + shopify_item_desc + ", Item Fulfillable Quantity : " + shopify_item_fulfillable_quantity + "Item Quantity : " + shopify_item_quantity +
                            ", Item Rate : " + shopify_item_rate + ", Item Net Price : " + shopify_item_net + "Item Tax Percentage : " + shopify_item_tax_percentage + ", Item Line Item Id : " + shopify_item_lineItemId + ", Item Discount : " + shopify_item_discount + ", Item Refund : " + shopify_item_isRefund + " )"
                    })
                    if (shopify_item_isRefund == true) {


                        refundObj[item_index] = {};
                        refundObj[item_index]["itemName"] = shopify_item_id;
                        refundObj[item_index]["itemPrice"] = shopify_item_net;
                        log.debug("PCT-Shopify-Integration", "Refund Object : " + JSON.stringify(refundObj));


                    }


                    else {
                        var item_search_array = search_item(shopify_item_id, shopify_weborder_load);
                        var item_internal_id = item_search_array[0];
                        var item_type = item_search_array[1];
                        var item_unit = item_search_array[2];

                        //------------------------------------------------ Add Item in Sales Order --------------------------------------

                        var previousItemLine = salesOrderobj.getLineCount('item');

                        salesOrderobj.selectNewLine({ sublistId: 'item' });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: item_internal_id });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: shopify_item_quantity });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });

                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: shopify_item_rate });
                        var tax_obj = getTaxPercent(shopify_item_tax_percentage, market_place);
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_line_item_id', value: shopify_item_lineItemId });
                        salesOrderobj.commitLine({ sublistId: 'item' });

                        //----------------------------------------------- For Group Item --------------------------------------------------------
                        if (item_type == 'Group') {
                            var newItemLine = salesOrderobj.getLineCount('item');
                            var memberQty = groupItemQty(item_internal_id);
                            log.debug({
                                title: "PCT_Shopify",
                                details: "ITem QTy : " + memberQty
                            })
                            var eachItemRate = ((shopify_item_rate) / (memberQty)).toFixed(2);
                            log.debug({ title: 'PCT-Shopify-Integration', details: "Each Item Rate : " + eachItemRate });

                            for (var groupItem_index = (parseInt(previousItemLine) + 1); groupItem_index < (newItemLine - 1); groupItem_index++) {
                                salesOrderobj.selectLine({
                                    sublistId: 'item',
                                    line: groupItem_index
                                })
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: eachItemRate });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
                                salesOrderobj.commitLine({ sublistId: 'item' });
                            }
                        }
                        //------------------------------------------------ Add Discount Item in Sales Order --------------------------------------


                        if (shopify_item_discount != 0) {
                            salesOrderobj.selectNewLine({ sublistId: 'item' });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: discountItem });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: "Discount Item for " + shopify_item_id });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: -(shopify_item_discount) });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: 9 });
                            // salesOrderobj.setCurrentSublistText({ sublistId: 'item', fieldId: 'taxcode', text: tax_obj.taxName });
                            salesOrderobj.commitLine({ sublistId: 'item' });
                        }
                        log.debug({ title: 'PCT-Shopify-Integration', details: "Item Added in Sales Order" });
                    }
                }

                // -------------------------------- Add DTC_PACKAGING_TASTER or DTC_PACKAGING Item ----------------------------

                var DTC_PACKAGING_TASTER = DTC_PACKAGING = 0;
                if (shopify_item_id == 'UKSH1TST060x05' || shopify_item_id == 'UKSH1AMB060x05' || shopify_item_id == 'UKSH1SMP060x05') {
                    DTC_PACKAGING_TASTER = 1;
                }
                else {
                    DTC_PACKAGING = 1;
                }

                if (DTC_PACKAGING_TASTER == 1) {
                    salesOrderobj.selectNewLine({ sublistId: 'item' });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: DTC_Taster_Packaging });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1 });
                    salesOrderobj.commitLine({ sublistId: 'item' });
                }

                if (DTC_PACKAGING == 1) {
                    salesOrderobj.selectNewLine({ sublistId: 'item' });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: DTC_Packaging });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1 });
                    salesOrderobj.commitLine({ sublistId: 'item' });
                }
                // --------------------------- If there are present Price difference between Custom Record & Sales Order ------------------------------------


                // Price Differnece on Total Price
                var salesOrderTotal = salesOrderobj.getValue({ fieldId: 'total' });
                var orderDiff = parseFloat(shopify_totalPrice) - parseFloat(salesOrderTotal);
                log.debug({
                    title: 'PCT-Shopify-Integration',
                    details: 'Sales Order Amount : ' + salesOrderTotal + ' Shopify Web Odrer Total : ' + shopify_totalPrice + ' Price Diff : ' + Math.abs(orderDiff).toFixed(2)
                })

                if (Math.abs(orderDiff).toFixed(2) != 0.00) {
                    var so_item_count = salesOrderobj.getLineCount({ sublistId: 'item' });
                    orderDiff = Math.abs(orderDiff).toFixed(2);
                    for (var index = 0; index < so_item_count; index++) {
                        salesOrderobj.selectLine({
                            sublistId: "item",
                            line: index
                        })
                        var itemType = salesOrderobj.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemtype',

                        });
                        var itemAmount = salesOrderobj.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',

                        });
                        log.debug({
                            title: "PCT-Shopify-Integration refund Function",
                            details: "Item Type : " + itemType + ", Item Amount : " + itemAmount + ", Type of : " + typeof (itemAmount)
                        })
                        if (itemType != "Group" && itemType != "EndGroup") {
                            var itemamt = salesOrderobj.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'grossamt'

                            });
                            if (salesOrderTotal > shopify_totalPrice) { var newAmount = ((parseFloat(itemamt) - parseFloat(orderDiff))).toFixed(2); }
                            else { var newAmount = ((parseFloat(itemamt) + parseFloat(orderDiff))).toFixed(2); }

                            log.debug({ title: 'PCT-Shopify-Integration', details: "Order Diff : " + orderDiff + ", Previous Amount : " + itemamt + ", Now Amout : " + newAmount });
                            // if (itemAmount > 0 && newAmount > 0)
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'grossamt',
                                value: newAmount
                            });
                            salesOrderobj.commitLine({ sublistId: 'item' });
                            break;
                        }


                    }

                }
                var value_have = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_error' });
                if (value_have) {
                    log.debug({ title: 'PCT-Shopify-Integration', details: "ERROR" });
                    email.send({
                        author: -5,
                        recipients: ["mike@mojudrinks.com", "fred@mojudrinks.com",],
                        cc: ["sandipan.paapri@gmail.com"],
                        subject: 'Moju Sales Order Create Error for Web Odrer No : ' + recordId,
                        body: value_have
                    });
                    log.debug({ title: 'PCT-Shopify-Integration', details: 'Mail Sent' });
                }
                else {
                    var salesorder_id = 0;
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["custbody_pct_sales_order_no", "is", shopify_salesOrdrNo],
                                "AND",
                                ["custbody_pct_order_id", "is", shopify_orderId],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({
                                    name: "internalid",
                                    join: "applyingTransaction",
                                    label: "Internal ID"
                                })
                            ]
                    });
                    var soResultCount = salesorderSearchObj.runPaged().count;
                    log.debug("SaleS Order Result Count ", "Sales Order Result Count : " + soResultCount);
                    var soResult = salesorderSearchObj.run().getRange({ start: 0, end: soResultCount });
                    if (soResultCount > 0) {
                        for (var soIndex = 0; soIndex < soResultCount; soIndex++) {


                            salesorder_id = soResult[soIndex].id;
                            salesorder_documentNumber = soResult[soIndex].getValue('tranid');
                            var invoiceInternalNo = invoiceSearch(salesorder_id);
                        }
                        log.debug({ title: 'PCT-Shopify-Integration', details: 'Already Present Sales Order Internal Id : ' + salesorder_id + ", & Invoice Id : " + invoiceInternalNo });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: salesorder_id });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_so_created', value: true });
                        if (shopify_orderCanceled) {

                            cancelSalesOrder(salesorder_id);
                        }
                    }
                    else {

                        salesorder_id = salesOrderobj.save();
                        var invoiceInternalNo = "";

                        log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Sales Order Id : ' + salesorder_id });
                    }
                    if (salesorder_id) {
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: salesorder_id });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_so_created', value: true });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: " " });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_processed', value: true });
                    }


                }

                //----------------------------------------- Item Fulfillment ----------------------------------------

                var itemFulfillemntObj = {};
                if (shopify_fulfillment != '') {
                    var shopify_fulfillment_count = shopify_weborder_load.getLineCount({ sublistId: 'recmachcustrecord_pct_sifi_child' });
                    log.debug({ title: 'PCT-Shopify-Integration', details: "Web Order Fulfillment Count : " + shopify_fulfillment_count });
                    var total_fulfillment_item_count = 0;
                    for (item_index = 0; item_index < shopify_fulfillment_count; item_index++) {

                        var shopify_itemfulfillment_qty = shopify_weborder_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_sifi_child',
                            fieldId: 'custrecord_pct_sifi_quantity',
                            line: item_index
                        });
                        total_fulfillment_item_count += parseInt(shopify_itemfulfillment_qty);

                    }
                    // log.debug({
                    //     title: "PCT-Shopify-Integration 1",
                    //     details: "Shopify Fulfillment Object Array :" + JSON.stringify(itemFulfillemntObj)
                    // })
                    var refundObjLen = Object.keys(refundObj).length
                    log.debug({
                        title: "PCT-Shopify",
                        details: "Shopify Refund Obj Length :" + refundObjLen
                    })

                    var item_fullfillment_id = itemFullfillment(salesorder_id, total_item_count, total_fulfillment_item_count, shopify_item_count, shopify_fulfillment_count, refundObjLen);
                }

                //--------------------------------------------- Billing ----------------------------------------------
                if (!invoiceInternalNo.length) //!invoiceInternalNo.length
                {
                    var billRecord = record.transform({
                        fromType: 'salesorder',
                        fromId: salesorder_id,
                        toType: 'invoice',
                        isDynamic: true
                    });
                    var billId = billRecord.save();
                    log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Bill Id : ' + billId });
                }
                else {
                    log.debug({ title: 'PCT-Shopify-Integration', details: 'Already Present Bill Id : ' + invoiceInternalNo });
                    billId = invoiceInternalNo;
                }



                //----------------------------------------- Refund ----------------------------------------
                if (shopify_orderRefund == true) {
                    log.debug({
                        title: "PCT-Shopify-Integration",
                        details: "Shopify Refund Object Array :" + JSON.stringify(refundObj)
                    })
                    var refund_id = refund(billId, refundObj, shopify_refundAmount);
                    var invoiceLoad = record.load({
                        type: 'invoice',
                        id: billId
                    });
                    invoiceLoad.setValue({ fieldId: 'custbody_pct_moju_credit_memo', value: refund_id });
                    invoiceLoad.save();
                }

            }
            var scriptObj = runtime.getCurrentScript();
            log.debug("PCT-Shopify-Integration", 'Remaining governance units: ' + scriptObj.getRemainingUsage());
        }
        catch (ex) {
            log.debug({ title: 'PCT-Shopify-Integration-WF-ERROR', details: "In Catch : " + ex });
        }

        // ------------------------------------------------------------------ All Custom Functions --------------------------------------------------

        //----------------------------------------------------------------------- Country Function --------------------------------------------------
        function getCountry(country, shopify_weborder_load) {
            log.debug({
                title: "PCT-Shopify-Integration Country Function ",
                details: "Country Code/Name : " + country
            })
            country = country.trim();
            var isoCountries = [
                { 'ccode': 'AF', 'cname': 'Afghanistan' },
                { 'ccode': 'AX', 'cname': 'Aland Islands' },
                { 'ccode': 'AL', 'cname': 'Albania' },
                { 'ccode': 'DZ', 'cname': 'Algeria' },
                { 'ccode': 'AS', 'cname': 'American Samoa' },
                { 'ccode': 'AD', 'cname': 'Andorra' },
                { 'ccode': 'AO', 'cname': 'Angola' },
                { 'ccode': 'AI', 'cname': 'Anguilla' },
                { 'ccode': 'AQ', 'cname': 'Antarctica' },
                { 'ccode': 'AG', 'cname': 'Antigua And Barbuda' },
                { 'ccode': 'AR', 'cname': 'Argentina' },
                { 'ccode': 'AM', 'cname': 'Armenia' },
                { 'ccode': 'AW', 'cname': 'Aruba' },
                { 'ccode': 'AU', 'cname': 'Australia' },
                { 'ccode': 'AT', 'cname': 'Austria' },
                { 'ccode': 'AZ', 'cname': 'Azerbaijan' },
                { 'ccode': 'BS', 'cname': 'Bahamas' },
                { 'ccode': 'BH', 'cname': 'Bahrain' },
                { 'ccode': 'BD', 'cname': 'Bangladesh' },
                { 'ccode': 'BB', 'cname': 'Barbados' },
                { 'ccode': 'BY', 'cname': 'Belarus' },
                { 'ccode': 'BE', 'cname': 'Belgium' },
                { 'ccode': 'BZ', 'cname': 'Belize' },
                { 'ccode': 'BJ', 'cname': 'Benin' },
                { 'ccode': 'BM', 'cname': 'Bermuda' },
                { 'ccode': 'BT', 'cname': 'Bhutan' },
                { 'ccode': 'BO', 'cname': 'Bolivia' },
                { 'ccode': 'BA', 'cname': 'Bosnia And Herzegovina' },
                { 'ccode': 'BW', 'cname': 'Botswana' },
                { 'ccode': 'BV', 'cname': 'Bouvet Island' },
                { 'ccode': 'BR', 'cname': 'Brazil' },
                { 'ccode': 'IO', 'cname': 'British Indian Ocean Territory' },
                { 'ccode': 'BN', 'cname': 'Brunei Darussalam' },
                { 'ccode': 'BG', 'cname': 'Bulgaria' },
                { 'ccode': 'BF', 'cname': 'Burkina Faso' },
                { 'ccode': 'BI', 'cname': 'Burundi' },
                { 'ccode': 'KH', 'cname': 'Cambodia' },
                { 'ccode': 'CM', 'cname': 'Cameroon' },
                { 'ccode': 'CA', 'cname': 'Canada' },
                { 'ccode': 'CV', 'cname': 'Cape Verde' },
                { 'ccode': 'KY', 'cname': 'Cayman Islands' },
                { 'ccode': 'CF', 'cname': 'Central African Republic' },
                { 'ccode': 'TD', 'cname': 'Chad' },
                { 'ccode': 'CL', 'cname': 'Chile' },
                { 'ccode': 'CN', 'cname': 'China' },
                { 'ccode': 'CX', 'cname': 'Christmas Island' },
                { 'ccode': 'CC', 'cname': 'Cocos (Keeling) Islands' },
                { 'ccode': 'CO', 'cname': 'Colombia' },
                { 'ccode': 'KM', 'cname': 'Comoros' },
                { 'ccode': 'CG', 'cname': 'Congo' },
                { 'ccode': 'CD', 'cname': 'Congo, Democratic Republic' },
                { 'ccode': 'CK', 'cname': 'Cook Islands' },
                { 'ccode': 'CR', 'cname': 'Costa Rica' },
                { 'ccode': 'CI', 'cname': 'Cote D\'Ivoire' },
                // { 'ccode': 'HR', 'cname': 'Croatia' },
                { 'ccode': 'HR', 'cname': 'Croatia/Hrvatska' },
                { 'ccode': 'CU', 'cname': 'Cuba' },
                { 'ccode': 'CY', 'cname': 'Cyprus' },
                { 'ccode': 'CZ', 'cname': 'Czech Republic' },
                { 'ccode': 'DK', 'cname': 'Denmark' },
                { 'ccode': 'DJ', 'cname': 'Djibouti' },
                { 'ccode': 'DM', 'cname': 'Dominica' },
                { 'ccode': 'DO', 'cname': 'Dominican Republic' },
                { 'ccode': 'EC', 'cname': 'Ecuador' },
                { 'ccode': 'EG', 'cname': 'Egypt' },
                { 'ccode': 'SV', 'cname': 'El Salvador' },
                { 'ccode': 'GQ', 'cname': 'Equatorial Guinea' },
                { 'ccode': 'ER', 'cname': 'Eritrea' },
                { 'ccode': 'EE', 'cname': 'Estonia' },
                { 'ccode': 'ET', 'cname': 'Ethiopia' },
                { 'ccode': 'FK', 'cname': 'Falkland Islands (Malvinas)' },
                { 'ccode': 'FO', 'cname': 'Faroe Islands' },
                { 'ccode': 'FJ', 'cname': 'Fiji' },
                { 'ccode': 'FI', 'cname': 'Finland' },
                { 'ccode': 'FR', 'cname': 'France' },
                { 'ccode': 'GF', 'cname': 'French Guiana' },
                { 'ccode': 'PF', 'cname': 'French Polynesia' },
                { 'ccode': 'TF', 'cname': 'French Southern Territories' },
                { 'ccode': 'GA', 'cname': 'Gabon' },
                { 'ccode': 'GM', 'cname': 'Gambia' },
                { 'ccode': 'GE', 'cname': 'Georgia' },
                { 'ccode': 'DE', 'cname': 'Germany' },
                { 'ccode': 'AT', 'cname': 'Austria' },
                { 'ccode': 'GH', 'cname': 'Ghana' },
                { 'ccode': 'GI', 'cname': 'Gibraltar' },
                { 'ccode': 'GR', 'cname': 'Greece' },
                { 'ccode': 'GL', 'cname': 'Greenland' },
                { 'ccode': 'GD', 'cname': 'Grenada' },
                { 'ccode': 'GP', 'cname': 'Guadeloupe' },
                { 'ccode': 'GU', 'cname': 'Guam' },
                { 'ccode': 'GT', 'cname': 'Guatemala' },
                { 'ccode': 'GG', 'cname': 'Guernsey' },
                { 'ccode': 'GN', 'cname': 'Guinea' },
                { 'ccode': 'GW', 'cname': 'Guinea-Bissau' },
                { 'ccode': 'GY', 'cname': 'Guyana' },
                { 'ccode': 'HT', 'cname': 'Haiti' },
                { 'ccode': 'HM', 'cname': 'Heard Island & Mcdonald Islands' },
                { 'ccode': 'VA', 'cname': 'Holy See (Vatican City State)' },
                { 'ccode': 'HN', 'cname': 'Honduras' },
                { 'ccode': 'HK', 'cname': 'Hong Kong' },
                { 'ccode': 'HU', 'cname': 'Hungary' },
                { 'ccode': 'IS', 'cname': 'Iceland' },
                { 'ccode': 'IN', 'cname': 'India' },
                { 'ccode': 'ID', 'cname': 'Indonesia' },
                { 'ccode': 'IR', 'cname': 'Iran, Islamic Republic Of' },
                { 'ccode': 'IQ', 'cname': 'Iraq' },
                { 'ccode': 'IE', 'cname': 'Ireland' },
                { 'ccode': 'IM', 'cname': 'Isle Of Man' },
                { 'ccode': 'IL', 'cname': 'Israel' },
                { 'ccode': 'IT', 'cname': 'Italy' },
                { 'ccode': 'JM', 'cname': 'Jamaica' },
                { 'ccode': 'JP', 'cname': 'Japan' },
                { 'ccode': 'JE', 'cname': 'Jersey' },
                { 'ccode': 'JO', 'cname': 'Jordan' },
                { 'ccode': 'KZ', 'cname': 'Kazakhstan' },
                { 'ccode': 'KE', 'cname': 'Kenya' },
                { 'ccode': 'KI', 'cname': 'Kiribati' },
                { 'ccode': 'KR', 'cname': 'Korea' },
                { 'ccode': 'KW', 'cname': 'Kuwait' },
                { 'ccode': 'KG', 'cname': 'Kyrgyzstan' },
                { 'ccode': 'LA', 'cname': 'Lao People\'s Democratic Republic' },
                { 'ccode': 'LV', 'cname': 'Latvia' },
                { 'ccode': 'LB', 'cname': 'Lebanon' },
                { 'ccode': 'LS', 'cname': 'Lesotho' },
                { 'ccode': 'LR', 'cname': 'Liberia' },
                { 'ccode': 'LY', 'cname': 'Libyan Arab Jamahiriya' },
                { 'ccode': 'LI', 'cname': 'Liechtenstein' },
                { 'ccode': 'LT', 'cname': 'Lithuania' },
                { 'ccode': 'LU', 'cname': 'Luxembourg' },
                { 'ccode': 'MO', 'cname': 'Macao' },
                { 'ccode': 'MK', 'cname': 'Macedonia' },
                { 'ccode': 'MG', 'cname': 'Madagascar' },
                { 'ccode': 'MW', 'cname': 'Malawi' },
                { 'ccode': 'MY', 'cname': 'Malaysia' },
                { 'ccode': 'MV', 'cname': 'Maldives' },
                { 'ccode': 'ML', 'cname': 'Mali' },
                { 'ccode': 'MT', 'cname': 'Malta' },
                { 'ccode': 'MH', 'cname': 'Marshall Islands' },
                { 'ccode': 'MQ', 'cname': 'Martinique' },
                { 'ccode': 'MR', 'cname': 'Mauritania' },
                { 'ccode': 'MU', 'cname': 'Mauritius' },
                { 'ccode': 'YT', 'cname': 'Mayotte' },
                { 'ccode': 'MX', 'cname': 'Mexico' },
                { 'ccode': 'FM', 'cname': 'Micronesia, Federated States Of' },
                { 'ccode': 'MD', 'cname': 'Moldova' },
                { 'ccode': 'MC', 'cname': 'Monaco' },
                { 'ccode': 'MN', 'cname': 'Mongolia' },
                { 'ccode': 'ME', 'cname': 'Montenegro' },
                { 'ccode': 'MS', 'cname': 'Montserrat' },
                { 'ccode': 'MA', 'cname': 'Morocco' },
                { 'ccode': 'MZ', 'cname': 'Mozambique' },
                { 'ccode': 'MM', 'cname': 'Myanmar' },
                { 'ccode': 'NA', 'cname': 'Namibia' },
                { 'ccode': 'NR', 'cname': 'Nauru' },
                { 'ccode': 'NP', 'cname': 'Nepal' },
                { 'ccode': 'NL', 'cname': 'Netherlands' },
                { 'ccode': 'AN', 'cname': 'Netherlands Antilles' },
                { 'ccode': 'NC', 'cname': 'New Caledonia' },
                { 'ccode': 'NZ', 'cname': 'New Zealand' },
                { 'ccode': 'NI', 'cname': 'Nicaragua' },
                { 'ccode': 'NE', 'cname': 'Niger' },
                { 'ccode': 'NG', 'cname': 'Nigeria' },
                { 'ccode': 'NU', 'cname': 'Niue' },
                { 'ccode': 'NF', 'cname': 'Norfolk Island' },
                { 'ccode': 'MP', 'cname': 'Northern Mariana Islands' },
                { 'ccode': 'NO', 'cname': 'Norway' },
                { 'ccode': 'OM', 'cname': 'Oman' },
                { 'ccode': 'PK', 'cname': 'Pakistan' },
                { 'ccode': 'PW', 'cname': 'Palau' },
                { 'ccode': 'PS', 'cname': 'Palestinian Territory, Occupied' },
                { 'ccode': 'PA', 'cname': 'Panama' },
                { 'ccode': 'PG', 'cname': 'Papua New Guinea' },
                { 'ccode': 'PY', 'cname': 'Paraguay' },
                { 'ccode': 'PE', 'cname': 'Peru' },
                { 'ccode': 'PH', 'cname': 'Philippines' },
                { 'ccode': 'PN', 'cname': 'Pitcairn' },
                { 'ccode': 'PL', 'cname': 'Poland' },
                { 'ccode': 'PT', 'cname': 'Portugal' },
                { 'ccode': 'PR', 'cname': 'Puerto Rico' },
                { 'ccode': 'QA', 'cname': 'Qatar' },
                { 'ccode': 'RE', 'cname': 'Reunion' },
                { 'ccode': 'RO', 'cname': 'Romania' },
                { 'ccode': 'RU', 'cname': 'Russian Federation' },
                { 'ccode': 'RW', 'cname': 'Rwanda' },
                { 'ccode': 'BL', 'cname': 'Saint Barthelemy' },
                { 'ccode': 'SH', 'cname': 'Saint Helena' },
                { 'ccode': 'KN', 'cname': 'Saint Kitts And Nevis' },
                { 'ccode': 'LC', 'cname': 'Saint Lucia' },
                { 'ccode': 'MF', 'cname': 'Saint Martin' },
                { 'ccode': 'PM', 'cname': 'Saint Pierre And Miquelon' },
                { 'ccode': 'VC', 'cname': 'Saint Vincent And Grenadines' },
                { 'ccode': 'WS', 'cname': 'Samoa' },
                { 'ccode': 'SM', 'cname': 'San Marino' },
                { 'ccode': 'ST', 'cname': 'Sao Tome And Principe' },
                { 'ccode': 'SA', 'cname': 'Saudi Arabia' },
                { 'ccode': 'SN', 'cname': 'Senegal' },
                { 'ccode': 'RS', 'cname': 'Serbia' },
                { 'ccode': 'SC', 'cname': 'Seychelles' },
                { 'ccode': 'SL', 'cname': 'Sierra Leone' },
                { 'ccode': 'SG', 'cname': 'Singapore' },
                { 'ccode': 'SK', 'cname': 'Slovakia' },
                { 'ccode': 'SI', 'cname': 'Slovenia' },
                { 'ccode': 'SB', 'cname': 'Solomon Islands' },
                { 'ccode': 'SO', 'cname': 'Somalia' },
                { 'ccode': 'ZA', 'cname': 'South Africa' },
                { 'ccode': 'GS', 'cname': 'South Georgia And Sandwich Isl.' },
                { 'ccode': 'ES', 'cname': 'Spain' },
                { 'ccode': 'LK', 'cname': 'Sri Lanka' },
                { 'ccode': 'SD', 'cname': 'Sudan' },
                { 'ccode': 'SR', 'cname': 'Suriname' },
                { 'ccode': 'SJ', 'cname': 'Svalbard And Jan Mayen' },
                { 'ccode': 'SZ', 'cname': 'Swaziland' },
                { 'ccode': 'SE', 'cname': 'Sweden' },
                { 'ccode': 'CH', 'cname': 'Switzerland' },
                { 'ccode': 'SY', 'cname': 'Syrian Arab Republic' },
                { 'ccode': 'TW', 'cname': 'Taiwan' },
                { 'ccode': 'TJ', 'cname': 'Tajikistan' },
                { 'ccode': 'TZ', 'cname': 'Tanzania' },
                { 'ccode': 'TH', 'cname': 'Thailand' },
                { 'ccode': 'TL', 'cname': 'Timor-Leste' },
                { 'ccode': 'TG', 'cname': 'Togo' },
                { 'ccode': 'TK', 'cname': 'Tokelau' },
                { 'ccode': 'TO', 'cname': 'Tonga' },
                { 'ccode': 'TT', 'cname': 'Trinidad And Tobago' },
                { 'ccode': 'TN', 'cname': 'Tunisia' },
                { 'ccode': 'TR', 'cname': 'Turkey' },
                { 'ccode': 'TM', 'cname': 'Turkmenistan' },
                { 'ccode': 'TC', 'cname': 'Turks And Caicos Islands' },
                { 'ccode': 'TV', 'cname': 'Tuvalu' },
                { 'ccode': 'UG', 'cname': 'Uganda' },
                { 'ccode': 'UA', 'cname': 'Ukraine' },
                { 'ccode': 'AE', 'cname': 'United Arab Emirates' },
                { 'ccode': 'GB', 'cname': 'United Kingdom' },
                { 'ccode': 'GB', 'cname': 'Great Britain' },
                { 'ccode': 'US', 'cname': 'United States' },
                { 'ccode': 'UM', 'cname': 'United States Outlying Islands' },
                { 'ccode': 'UY', 'cname': 'Uruguay' },
                { 'ccode': 'UZ', 'cname': 'Uzbekistan' },
                { 'ccode': 'VU', 'cname': 'Vanuatu' },
                { 'ccode': 'VE', 'cname': 'Venezuela' },
                { 'ccode': 'VN', 'cname': 'Viet Nam' },
                { 'ccode': 'VG', 'cname': 'Virgin Islands, British' },
                { 'ccode': 'VI', 'cname': 'Virgin Islands, U.S.' },
                { 'ccode': 'WF', 'cname': 'Wallis And Futuna' },
                { 'ccode': 'EH', 'cname': 'Western Sahara' },
                { 'ccode': 'YE', 'cname': 'Yemen' },
                { 'ccode': 'ZM', 'cname': 'Zambia' },
                { 'ccode': 'ZW', 'cname': 'Zimbabwe' }
            ];
            var value = 0;
            for (var index = 0; index < isoCountries.length; index++) {
                if (isoCountries[index].ccode == country) {
                    var cname = isoCountries[index].cname;
                    value = cname;
                    break;

                }
                else if (isoCountries[index].cname == country) {
                    var ccode = isoCountries[index].ccode;
                    value = ccode;
                    break;
                }
            }
            if (value == 0) {
                log.debug({ title: "PCT-Shopify-Integration Country Function ", details: "Country " + country + " is Not Present" });
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Market Place " + country + " is not Valid" });
            }
            return value;
        }
        //----------------------------------------------------------------------- Country Function End --------------------------------------------------

        //----------------------------------------------------------------------- Create Customer Function --------------------------------------------------

        function searchCustomer(getSoCustomer) {
            log.debug({
                title: "PCT-Shopify-Integration Search Customer Function ",
                details: "Customer Id : " + getSoCustomer
            })
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalidnumber", "equalto", getSoCustomer]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custentity_pct_moju_class", label: "Class" }),
                        search.createColumn({
                            name: "name",
                            join: "cseg_pct_moju_cseg",
                            label: "Name"
                        })
                    ]
            });
            var customer_count = customerSearchObj.runPaged().count;
            log.debug("PCT-Shopify-Integration Customer Function", "Customer Count : " + customer_count);
            var customer_searchresult = customerSearchObj.run().getRange({ start: 0, end: customer_count });

            for (customer_index = 0; customer_index < customer_count; customer_index++) {
                var customerClass = customer_searchresult[customer_index].getValue("custentity_pct_moju_class");
                var customerSegment = customer_searchresult[customer_index].getValue({
                    name: "name",
                    join: "cseg_pct_moju_cseg",
                });
            }
            log.debug("PCT-Shopify-Integration Customer Function", "Customer Class : " + customerClass + "Customer Segment : " + customerSegment);
            return [customerClass, customerSegment];
        }
        //----------------------------------------------------------------------- Customer Function End -----------------------------------------------------------

        //----------------------------------------------------------------------- Search Item Function --------------------------------------------------

        function search_item(shopify_item_id, shopify_weborder_load) {

            log.debug({
                title: "PCT-Shopify-Integration Item Function ",
                details: "Item Name : " + shopify_item_id
            })

            if (shopify_item_id.slice(-3) == "x12") { var item_unit = "CS-12" }
            else if (shopify_item_id.slice(-3) == "x06") { var item_unit = "CS-6" }
            else if (shopify_item_id.slice(-3) == "x08") { var item_unit = "CS-8" }

            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["name", "is", shopify_item_id],
                    ],
                columns:
                    [
                        search.createColumn({ name: "type", label: "Type" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var itemsearch_count = itemSearchObj.runPaged().count;
            var item_searchresult = itemSearchObj.run().getRange({ start: 0, end: itemsearch_count });
            if (itemsearch_count > 0) {
                var item_internal_id = item_searchresult[0].id;
                var item_type = item_searchresult[0].getValue('type');
                log.debug({ title: "PCT-Shopify-Integration Item Function", details: "Item " + shopify_item_id + " is Already Present & Present Item ID : " + item_internal_id + ", and Item Type is : " + item_type + ", Item Unit : " + item_unit });
                return [item_internal_id, item_type, item_unit];
            }
            else {
                log.debug({ title: "PCT-Shopify-Integration Item Function ", details: "Item " + shopify_item_id + " is Not Present" });
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Item " + shopify_item_id + " is not Present In System" });
                return 0;
            }
        }
        //----------------------------------------------------------------------- Search Item Function End --------------------------------------------------

        //----------------------------------------------------------------------- Get Tax Percentage Function End -----------------------------------------------------------
        function getTaxPercent(shopify_item_tax_percentage, countryCode) {
            shopify_item_tax_percentage = parseFloat(shopify_item_tax_percentage).toFixed(2);
            log.debug({
                title: "PCT-Shopify-Integration getTaxPercent Function",
                details: "Item Tax Percentage : " + shopify_item_tax_percentage + ", Country Code : " + countryCode
            });
            if (shopify_item_tax_percentage == '' || shopify_item_tax_percentage == null || isNaN(shopify_item_tax_percentage)) {
                shopify_item_tax_percentage = 0;
            }
            var salestaxitemSearchObj = search.create({
                type: "salestaxitem",
                filters:
                    [
                        ["country", "anyof", countryCode],
                        "AND",
                        ["availableon", "anyof", "SALE"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "name", label: "Name" }),
                        search.createColumn({ name: "itemid", label: "Item ID" }),
                        search.createColumn({ name: "rate", label: "Rate" }),
                        search.createColumn({ name: "country", label: "Country" }),
                        search.createColumn({ name: "state", label: "State/Province/County" }),
                        search.createColumn({ name: "county", label: "County" }),
                        search.createColumn({ name: "zip", label: "Zip" }),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "ABS(" + shopify_item_tax_percentage + "-{rate})",
                            sort: search.Sort.ASC,
                            label: "Formula (Numeric)"
                        })
                    ]
            });
            var taxDetailObj = new Object();
            var item;
            var searchResultCount = salestaxitemSearchObj.runPaged().count;
            log.debug("PCT-Shopify-Integration getTaxPercent Function", "Tax Result Count : " + searchResultCount);
            salestaxitemSearchObj.run().each(function (result) {
                item = result.id;
                var taxCodeName = result.getValue('name');
                var taxCodeRate = result.getValue('rate');
                taxDetailObj.id = item;
                taxDetailObj.taxName = taxCodeName;
                taxDetailObj.taxRate = taxCodeRate;
            });
            log.debug({
                title: 'PCT-Shopify-Integration getTaxPercent Function',
                details: "Tax Details : " + taxDetailObj.id + ", Tax Name : " + taxDetailObj.taxName
            })
            return taxDetailObj;
        }
        //----------------------------------------------------------------------- Get Tax Percentage Function End --------------------------------------------------
        //-------------------------------------------------------------- Shipping Method Function Start -----------------------------------------------
        // function shipping_method(shopify_shippingMethod, shopify_weborder_load)
        // {
        //     log.debug({
        //         title: "PCT-Shopify-Integration Shipping Mwthod Function ",
        //         details: "Shipping Method : " + shopify_shippingMethod
        //     })
        //     var shipitemSearchObj = search.create({
        //         type: "shipitem",
        //         filters:
        //             [
        //                 ["itemid", "is", shopify_shippingMethod]
        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "internalid", label: "Internal ID" })
        //             ]
        //     });
        //     var method_count = shipitemSearchObj.runPaged().count;
        //     log.debug("PCT-Shopify-Integration Shipping Mwthod Function", "Shipping Method Result Count : " + method_count);
        //     var method_searchresult = shipitemSearchObj.run().getRange({ start: 0, end: method_count });
        //     if (method_count > 0)
        //     {
        //         log.debug({ title: "PCT-Shopify-Integration Shipping Mwthod Function", details: "Shipping Method " + shopify_shippingMethod + " Already Present " })
        //         for (method_index = 0; method_index < method_count; method_index++)
        //         {
        //             var shipping_method_id = method_searchresult[method_index].id;
        //         }
        //         return shipping_method_id;

        //     }
        //     else
        //     {
        //         log.debug({ title: "PCT-Shopify-Integration Shipping Mwthod Function", details: "Shipping Method " + shopify_shippingMethod + " is not Present" })
        //         shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Shipping Method " + shopify_shippingMethod + " is not Present in System" });
        //         return 0;
        //     }
        // }
        //-------------------------------------------------------------- Shipping Method Function End -----------------------------------------------

        //-------------------------------------------------------------- Get Sales Order Amount Function Start -----------------------------------------------

        // function getSalesOrderAmount(salesOrderInternalId)
        // {
        //     log.debug({
        //         title: "PCT-Shopify-Integration Sales Order Amount Function ",
        //         details: "Getting Sales Order Internal Id : " + salesOrderInternalId
        //     })
        //     var salesorderSearchObj = search.create({
        //         type: "salesorder",
        //         filters: [
        //             ["type", "anyof", "SalesOrd"],
        //             "AND",
        //             ["internalid", "anyof", salesOrderInternalId],
        //             "AND",
        //             ["mainline", "is", "T"]
        //         ],
        //         columns: [
        //             search.createColumn({
        //                 name: "fxamount",
        //                 label: "Amount (Foreign Currency)"
        //             })
        //         ]
        //     });
        //     var amount;
        //     var searchResultCount = salesorderSearchObj.runPaged().count;
        //     log.debug("PCT-Shopify-Integration Sales Order Amount Function", "Sales Order Result Count : " + searchResultCount);
        //     salesorderSearchObj.run().each(function (result)
        //     {
        //         // .run().each has a limit of 4,000 results
        //         //return true;
        //         amount = result.getValue('fxamount')
        //     });
        //     return amount;
        // }
        //-------------------------------------------------------------- Get Sales Order Amount Function End -----------------------------------------------

        //--------------------------------------------------------------- Get Group Items Function Start -----------------------------------------------------

        function groupItemQty(item_internal_id) {
            log.debug({
                title: "PCT-Shopify-Integration groupItemQty Function",
                details: "Item Id : " + item_internal_id
            });
            var itemgroupSearchObj = search.create({
                type: "itemgroup",
                filters:
                    [
                        ["type", "anyof", "Group"],
                        "AND",
                        ["internalid", "anyof", item_internal_id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "memberquantity",
                            summary: "SUM",
                            label: "Member Quantity"
                        })
                    ]
            });
            var qty = 0;
            var searchResultCount = itemgroupSearchObj.runPaged().count;
            log.debug("PCT-Shopify-Integration groupItemQty Function", "Group Item Result Count : " + searchResultCount);
            itemgroupSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                qty = result.getValue({
                    name: "memberquantity",
                    summary: "SUM",
                    label: "Member Quantity"
                })
                // return true;
            });
            return qty;
        }
        //-------------------------------------------------------------- Get Group Items Function END -----------------------------------------------

        //-------------------------------------------------------------- itemFullfillment Function Start -----------------------------------------------
        function itemFullfillment(salesorder_id, total_item_count, total_fulfillment_item_count, shopify_item_count, shopify_fulfillment_count) {
            log.debug({
                title: "PCT-Shopify-Integration itemFullfillment Function",
                details: "Sales Order Id : " + salesorder_id + ", Sales Odrer Total Item : " + total_item_count + ", Fulfillment Odrer Total Item : " + total_fulfillment_item_count + ", Item Tab Line Count : " + shopify_item_count + ", Fulfillment Tab Line Count : " + shopify_fulfillment_count
            });
            var item_fullfillment_id = 0
            if ((total_item_count == total_fulfillment_item_count) && (shopify_item_count == shopify_fulfillment_count) || refundObjLen != 0) {
                log.debug({
                    title: "PCT-Shopify-Integration",
                    details: "Creating Item Fulfillment......."
                })

                var fulfillmentRecord = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: salesorder_id,
                    toType: record.Type.ITEM_FULFILLMENT,
                    isDynamic: true
                });
                fulfillmentRecord.setText({ fieldId: 'shipstatus', text: 'Shipped' });

                // var lineCount = fulfillmentRecord.getLineCount({ sublistId: 'item' });
                // log.debug({
                //     title: "PCT-Shopify-Integration",
                //     details: "Item Fulfillment Item Count : " + lineCount
                // })


                // for (var i = lineCount - 1; i >= 0; i--)
                // {
                //     var itemName = fulfillmentRecord.getSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'itemname',
                //         line: i
                //     });
                //     var itemId = fulfillmentRecord.getSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'item',
                //         line: i
                //     });
                //     var itemType = fulfillmentRecord.getSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'itemtype',
                //         line: i
                //     });
                //     log.debug({
                //         title: "PCT-Shopify-Integration itemFullfillment Function",
                //         details: "Item Id : " + itemId + ", Item Name : " + itemName + ", Item Type : " + itemType
                //     })
                //     // if (itemType == "Group" || itemType == "Discount" || itemType == "InvtPart")
                //     // {
                //     //     fulfillmentRecord.selectLine({ sublistId: 'item', line: i });
                //     //     fulfillmentRecord.setCurrentSublistText({
                //     //         sublistId: 'item',
                //     //         fieldId: 'location',
                //     //         text: "E2B"
                //     //     });
                //     if (!(itemName in itemFulfillemntObj))
                //     {
                //         log.debug({
                //             title: "PCT-Shopify-Integration itemFullfillment Function",
                //             details: "Item " + itemName
                //         })
                //         fulfillmentRecord.removeLine({
                //             sublistId: "item",
                //             line: i,
                //         })
                //         log.debug({
                //             title: "PCT-Shopify-Integration itemFullfillment Function",
                //             details: "Item " + itemName + " Deleted"
                //         })
                //     }
                //     // }
                // }

                item_fullfillment_id = fulfillmentRecord.save();
                log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Item Fulfillemnt Id : ' + item_fullfillment_id });
            }
            return item_fullfillment_id;
        }
        //-------------------------------------------------------------- itemFullfillment Function END -----------------------------------------------

        //-------------------------------------------------------------- isBackOrdered Functuion Start -----------------------------------------------
        function isBackOrdered(salesOrderInternalId, shopify_weborder_load) {
            log.debug({
                title: "PCT-Shopify-Integration isBackOrdered Function",
                details: "Sales Order Id : " + salesOrderInternalId
            });
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["cogs", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["transactiondiscount", "is", "F"],
                        "AND",
                        ["internalid", "anyof", salesOrderInternalId],
                        "AND",
                        // ["item.type", "noneof", "Discount", "NonInvtPart"],
                        ["item.type", "anyof", "Group", "InvtPart"],
                        /*"AND", 
                        ["formulanumeric: case when {item} = 'End of Group' then 1 else 0 end","equalto","0"],*/
                        "AND",
                        ["formulanumeric: {quantity}-nvl({quantityshiprecv},0)-nvl({quantitycommitted},0)", "greaterthan", "0"],
                        "AND",
                        ["formulanumeric: case when {item.type} = 'Item Group' then 0 else 1 end", "equalto", "1"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "item",
                            summary: "GROUP",
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "formulanumeric",
                            summary: "SUM",
                            formula: "{quantity}-nvl({quantityshiprecv},0)-nvl({quantitycommitted},0)",
                            label: "Quantity Backordered"
                        })
                    ]
            });
            var item = '';
            var backOrder = 0;
            var itemArr = new Array();
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug({ title: 'PCT-Shopify-Integration', details: 'Back Order Result Count : ' + searchResultCount });
            var ITEM = 'Item is';
            if (searchResultCount > 1) {
                var ITEM = 'Items are';
            }
            if (searchResultCount > 0) {
                // log.debug("salesorderSearchObj result count", searchResultCount);
                salesorderSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    item = result.getText({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    });

                    itemArr.push(item);
                    backOrder = 1;
                    return true;
                });
                log.debug({ title: 'PCT-Shopify-Integration', details: 'Back Order Mail Send' });
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Fulfillment can not be create because item " + itemArr + " on BackOrder" });
                email.send({
                    author: -5,
                    body: ITEM + ' on Back Order ' + itemArr.join(','),
                    recipients: ["sandipan.paapri@gmail.com", "mike@mojudrinks.com", "fred@mojudrinks.com"],
                    subject: ITEM + ' on Back Order for Sales    Order Internal ID :' + salesOrderInternalId

                })
                itemError = 1;
            }
            return backOrder;
        }
        //-------------------------------------------------------------- isBackOrdered Functuion End -----------------------------------------------

        //-------------------------------------------------------------- refund Functuion Start -----------------------------------------------
        function refund(billId, refundObj, shopify_refundAmount) {
            log.debug({
                title: "PCT-Shopify-Integration refund Function",
                details: "Bill Id : " + billId + ", Refund Object : " + JSON.stringify(refundObj) + ", Refund Amount : " + shopify_refundAmount
            });

            //---------------- Getting Objcet Value -------------
            var creditMemoObj = record.transform({
                fromType: "invoice",
                fromId: billId,
                toType: "creditmemo",
                isDynamic: true

            });

            var applyCount = creditMemoObj.getLineCount({ sublistId: 'apply' });
            log.debug({
                title: "PPCT-Shopify-Integration Refund Function",
                details: "Apply Count Credit Memo : " + applyCount
            })
            for (var applyIndex = 0; applyIndex < applyCount; applyIndex++) {
                creditMemoObj.selectLine({ sublistId: 'apply', line: applyIndex });
                var applyChceck = creditMemoObj.getCurrentSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply'

                });

                if (applyChceck == "T" || applyChceck == true) {
                    creditMemoObj.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        value: false
                    });

                }
            }
            var lineCount = creditMemoObj.getLineCount({ sublistId: 'item' });
            log.debug({
                title: "PPCT-Shopify-Integration refund Function",
                details: "Item Line in Credit Memo : " + lineCount
            })
            for (var itemIndex = lineCount - 1; itemIndex >= 0; itemIndex--) {
                var itemType = creditMemoObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: itemIndex
                });
                // log.debug({
                //     title: "PCT-Shopify-Integration refund Function",
                //     details: "Item Type : " + itemType
                // })
                if (itemType == "Group" || itemType == "Discount" || itemType == "InvtPart") {
                    creditMemoObj.removeLine({
                        sublistId: "item",
                        line: itemIndex
                    })
                }

            }
            log.debug({
                title: "PCT-Shopify-Integration refund Function",
                details: "All Item Deleted"
            })
            var totalRate = 0;
            for (var objIndex = 0; objIndex < Object.keys(refundObj).length; objIndex++) {
                var itemName = refundObj[Object.keys(refundObj)[objIndex]].itemName;
                var itemPrice = refundObj[Object.keys(refundObj)[objIndex]].itemPrice;
                log.debug({
                    title: "PCT-Shopify-Integration refund Function",
                    details: "Item Name : " + itemName + ", Item Price : " + itemPrice
                })
                totalRate = parseFloat(totalRate) + parseFloat(itemPrice);
                log.debug("PCT-Shopify-Integration refund Function", "Total Refund Price : " + totalRate)
            }

            creditMemoObj.selectNewLine({ sublistId: 'item' });
            creditMemoObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: chargeItemId });
            creditMemoObj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: totalRate + Math.abs(shopify_refundAmount) });
            creditMemoObj.commitLine({ sublistId: 'item' });
            var refund_id = creditMemoObj.save();
            log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Credit Memo Id : ' + refund_id });
            return refund_id;




            // var returnAuthorizationRecord = record.transform({
            //     fromType: "invoice",
            //     fromId: billId,
            //     toType: record.Type.RETURN_AUTHORIZATION,
            //     isDynamic: true,
            // });
            // var lineCount = returnAuthorizationRecord.getLineCount({ sublistId: 'item' });
            // log.debug({
            //     title: "PPCT-Shopify-Integration refund Function",
            //     details: "Line : " + lineCount
            // })
            // for (var i = lineCount - 1; i >= 0; i--)
            // {
            //     var itemName = returnAuthorizationRecord.getSublistText({
            //         sublistId: 'item',
            //         fieldId: 'item',
            //         line: i
            //     });
            //     var itemType = returnAuthorizationRecord.getSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'itemtype',
            //         line: i
            //     });
            //     log.debug({
            //         title: "PCT-Shopify-Integration refund Function",
            //         details: "Item Name : " + itemName + ", Item Type : " + itemType
            //     })
            //     if (itemType == "Group" || itemType == "Discount" || itemType == "InvtPart")
            //     {
            //         if (!(itemName in refundObj))
            //         {

            //             returnAuthorizationRecord.removeLine({
            //                 sublistId: "item",
            //                 line: i,
            //             })
            //             log.debug({
            //                 title: "PCT-Shopify-Integration refund Function",
            //                 details: "Item " + itemName + " Deleted"
            //             })
            //         }
            //     }
            // }
            // var refund_id = returnAuthorizationRecord.save();
            // log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Refund Id : ' + refund_id });

        }
        //-------------------------------------------------------------- refund Functuion End -----------------------------------------------



        //-------------------------------------------------------------- refund Functuion Start -----------------------------------------------

        function cancelSalesOrder(salesorder_id) {
            log.debug({
                title: "PCT-Shopify-Integration cancelSalesOrder Function",
                details: "Sales Order Id : " + salesorder_id
            });
            var soLoad = record.load({
                type: 'salesorder',
                id: salesorder_id,
                isDynamic: true,
            });
            soLoad.setText({ fieldId: 'status', value: "Closed" });
            var itemcounts = soLoad.getLineCount({
                sublistId: 'item'
            });
            for (var cancelOrderIndex = 0; cancelOrderIndex < itemcounts; cancelOrderIndex++) {

                soLoad.selectLine({
                    sublistId: "item",
                    line: cancelOrderIndex
                })
                var itemName = soLoad.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item_display',

                });

                var itemType = soLoad.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',

                });
                // log.debug({
                //     title: "PCT-Shopify-Integration cancelSalesOrder Function",
                //     details: "Sales Order Item Type : " + itemType
                // });
                if (itemType != "EndGroup") {

                    soLoad.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'isclosed',
                        value: true
                    });
                    soLoad.commitLine({ sublistId: 'item' });

                }

            }
            soLoad.save();
        }

        //-------------------------------------------------------------- refund Functuion End -----------------------------------------------

        //-------------------------------------------------------------- itemFilter Functtion Start -----------------------------------------------
        function itemFilter(shopify_item_id) {
            if (shopify_item_id.includes("PRO")) {
                shopify_item_id = shopify_item_id.replace('PRO', '');
            }
            else if (shopify_item_id.includes("SUB")) {
                shopify_item_id = shopify_item_id.replace('SUB', '');
            }
            else if (shopify_item_id.slice(-1) == 'S') {
                shopify_item_id = shopify_item_id.slice(0, -1);
            }
            return shopify_item_id;
        }
        //-------------------------------------------------------------- itemFilter Functtion End -----------------------------------------------

        //-------------------------------------------------------------- invoice search Functtion Start -----------------------------------------------
        function invoiceSearch(salesorder_id) {
            var invoiceSearchObj = search.create({
                type: "invoice",
                filters:
                    [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["createdfrom", "anyof", salesorder_id],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });

            var invoiceResultCount = invoiceSearchObj.runPaged().count;
            log.debug("SaleS Order Result Count ", "Sales Order Result Count : " + soResultCount);
            var invoiceResult = invoiceSearchObj.run().getRange({ start: 0, end: soResultCount });
            for (var invoiceIndex = 0; invoiceIndex < soResultCount; invoiceIndex++) {
                var invoiceId = invoiceResult[invoiceIndex].id;
            }
            return invoiceId;
        }
    }
    //-------------------------------------------------------------- invoice search Functtion End -----------------------------------------------

    return {
        onAction: onAction
    }
});
