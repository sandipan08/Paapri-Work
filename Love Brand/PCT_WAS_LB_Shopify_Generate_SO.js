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

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email', 'N/runtime'], function (log, record, runtime, file, format, search, email, runtime)
{
    function onAction(scriptContext)
    {
        //-------------------- All HardCore Value ---------------------------

        var shippingItemAccount = 108;
        var shippingItemTax = 1;
        var chargeItemId = 14038;



        // -------------------------------------------------------------


        log.debug({ title: 'PCT-Shopify-Integration', details: "In WorkFlow OnAction Function" });
        var shopify_weborder_load = scriptContext.newRecord;
        var recordId = shopify_weborder_load.getValue({ fieldId: 'id' });
        log.debug({ title: 'PCT-Shopify-Integration', details: 'Shopify Web Record Id : ' + recordId });
        try
        {
            shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: " " });
            // ------------------------------------------------Start Get Body Level Deatils -----------------------------------------
            var shopify_orderSource = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_source' });
            var shopify_customerName = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customername' });
            var shopify_customerMail = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customeremail' });
            var shopify_customerPhnNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_customerphonenumber' });
            var shopify_salesOrdrNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_sonumber' });
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

            log.debug({
                title: "PCT-Shopify-Integration",
                details: "Shopify Web Order Body Field Deatils : ( Order Source : " + shopify_orderSource + ", Customer Name : " + shopify_customerName + ", Customer Mail : " + shopify_customerMail + ", Customer PhnNo : " + shopify_customerPhnNo + ", Sales Order Number :" + shopify_salesOrdrNo + ", Fulfillment Status :" + shopify_fulfillment +
                    ", Total Price : " + shopify_totalPrice + ", Total Tax : " + shopify_totalTax + ", Total Discount : " + shopify_totalDiscount +
                    "Discount Code : " + shopify_discountCode + ", Payment Deatils : " + shopify_paymentDetails + ", Order Canceled  : " + shopify_orderCanceled + ", Order Refund : " + shopify_orderRefund + ", Order Refund Amount  : " + shopify_refundAmount + ", Is Subscribed : " + shopify_subscribed + " )"
            })

            // ------------------------------------------------End Get Body Level Deatils -----------------------------------------

            // ------------------------------------------------ Start Get Shipping Deatils --------------------------------------------

            var shopify_shippingPhoneNo = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingphone' });
            var shopify_shippingCountry = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingcountry' });
            if (shopify_shippingCountry.length <= 2) 
            {
                shopify_shippingCountry = getCountry(shopify_shippingCountry, shopify_weborder_load); // if shipping country came in Code then it will return the Name Only 
            }
            else
            {
                var market_place = getCountry(shopify_shippingCountry, shopify_weborder_load); // If shipping country in name then it will return the Code Only 
            }
            var shopify_shippingAddressee = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingaddressee' });
            var shopify_shippingAddresss1 = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingaddresss1' });
            var shopify_shippingAddresss2 = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingaddresss2' });
            var shopify_shippingCity = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingcity' });
            var shopify_shippingState = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingstate' });
            var shopify_shippingZip = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingzip' });
            var shopify_shippingCost = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_shippingcost' });
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
            var shopify_billingCountry = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_swo_billingcountry' });
            if (shopify_billingCountry == 'Great Britain') { shopify_billingCountry = 'United Kingdom' }
            if (shopify_billingCountry.length <= 2) 
            {
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

            if (!shopify_customerName || shopify_customerName === "undefined")
            {
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Customer Name is not Define " });
            }
            else
            {
                var customer_id = searchCustomer(shopify_customerName, shopify_shippingCountry, shopify_customerMail, shopify_customerPhnNo);
            }
            //------------------------------------------------- Creating Sales Order ------------------------------------------------

            var salesOrderobj = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });

            salesOrderobj.setValue({ fieldId: 'custbody_pct_lb_order_source', value: shopify_orderSource });
            salesOrderobj.setValue({ fieldId: 'entity', value: customer_id });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_sales_order_no', value: shopify_salesOrdrNo });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_web_order_no', value: recordId });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_discount_code', value: shopify_discountCode });
            salesOrderobj.setValue({ fieldId: 'orderstatus', value: "B" });
            salesOrderobj.setValue({ fieldId: 'subsidiary', value: 1 });

            var shopifyLocation = locationSearch();
            salesOrderobj.setText({ fieldId: 'location', text: shopifyLocation });
            if (!shopify_shippingCountry)
            {
                var market_place = "GB"

            }
            else
            {    //------------------------------------------------ Add Shipping in Sales Order --------------------------------------

                var subrec = salesOrderobj.getSubrecord({ fieldId: 'shippingaddress' });
                if (shopify_shippingPhoneNo.length != 0 && shopify_shippingPhoneNo.length < 7) // if shipping phone no is less than 7digit 
                {
                    shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: "Warning : Shipping Phone No can't be less than 7 digit so in Sales Order we put it as blank " });
                }
                else
                {
                    subrec.setValue({ fieldId: 'addrphone', value: shopify_shippingPhoneNo });
                }
                subrec.setValue({ fieldId: 'addressee', value: shopify_shippingAddressee });
                subrec.setValue({ fieldId: 'addr1', value: shopify_shippingAddresss1 });
                subrec.setValue({ fieldId: 'addr2', value: shopify_shippingAddresss2 + ", State : " + shopify_shippingState + " , Country : " + shopify_shippingCountry });
                subrec.setValue({ fieldId: 'city', value: shopify_shippingCity });
                subrec.setText({ fieldId: 'state', text: shopify_shippingState });
                subrec.setValue({ fieldId: 'zip', value: shopify_shippingZip });
                subrec.setValue({ fieldId: 'override', value: false });
                var shipping_method_id = shipping_method(shopify_shippingMethod)
                salesOrderobj.setValue({ fieldId: 'shipmethod', value: shipping_method_id });
                salesOrderobj.setValue({ fieldId: 'shippingcost', value: shopify_shippingCost });


                //--------------------------------------------------- Shipping Added ---------------------------------------------- 
            }

            if (shopify_billingCountry)
            {
                //------------------------------------------------ Add Billing in Sales Order --------------------------------------

                var billing_subrec = salesOrderobj.getSubrecord({ fieldId: 'billingaddress' });
                billing_subrec.setText({ fieldId: 'country', text: shopify_billingCountry });
                if (shopify_billingPhoneNo.length != 0 && shopify_billingPhoneNo.length < 7) // if billing phone no is less than 7digit 
                {
                    shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: "Warning : Shipping Phone No can't be less than 7 digit so in Sales Order we put it as blank " });
                }
                else
                {
                    billing_subrec.setValue({ fieldId: 'addrphone', value: shopify_billingPhoneNo });
                }
                billing_subrec.setValue({ fieldId: 'addressee', value: shopify_billingAddressee });
                billing_subrec.setValue({ fieldId: 'addr1', value: shopify_billingAddresss1 });
                billing_subrec.setValue({ fieldId: 'addr2', value: shopify_billingAddresss2 });
                billing_subrec.setValue({ fieldId: 'city', value: shopify_billingCity });
                billing_subrec.setValue({ fieldId: 'state', value: shopify_billingState });
                billing_subrec.setValue({ fieldId: 'zip', value: shopify_billingZip });

                //------------------------------------------------ Billing Added --------------------------------------
            }

            // ------------------------------------------------ Start Get Item Deatils ---------------------------------------------------

            var shopify_item_count = shopify_weborder_load.getLineCount({ sublistId: 'recmachcustrecord_pct_ssoi_child' });
            log.debug({ title: 'PCT-Shopify-Integration', details: "Web Order Item Count : " + shopify_item_count });
            if (shopify_item_count == 0)
            {
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error :  No Item is there" });
            }
            else
            {
                var refundObj = {};
                var total_item_count = 0
                var shopifyLineItemCount = 0;
                for (item_index = 0; item_index < shopify_item_count; item_index++)
                {
                    var shopify_item_id = shopify_weborder_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ssoi_child',
                        fieldId: 'custrecord_pct_ssoi_itemidname',
                        line: item_index
                    });
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
                    if (shopify_item_isRefund)
                    {
                        total_item_count += parseInt(shopify_item_quantity);
                        shopifyLineItemCount++;
                    }
                    log.debug({
                        title: "PCT-Shopify-Integration",
                        details: "Shopify Web Order Item Details: ( Item Name/Id : " + shopify_item_id + ", Item description : " + shopify_item_desc + ", Item Fulfillable Quantity : " + shopify_item_fulfillable_quantity + "Item Quantity : " + shopify_item_quantity +
                            ", Item Rate : " + shopify_item_rate + ", Item Net Price : " + shopify_item_net + ", Item Tax Percentage : " + shopify_item_tax_percentage + ", Item Line Item Id : " + shopify_item_lineItemId + ", Item Discount : " + shopify_item_discount + ", Item Refund : " + shopify_item_isRefund + " )"
                    })
                    // if (!(shopify_item_id in refundObj))
                    // {
                    //     refundObj[shopify_item_id] = {};
                    //     if (shopify_item_isRefund == true)
                    //     {
                    //         refundObj[shopify_item_id]["Item Name"] = shopify_item_id;
                    //         refundObj[shopify_item_id]["Item Qty"] = shopify_item_quantity;
                    //         refundObj[shopify_item_id]["Item Rate"] = shopify_item_rate;
                    //         refundObj[shopify_item_id]["Item Percentage"] = shopify_item_tax_percentage;
                    //         refundObj[shopify_item_id]["Item Market Pkace"] = market_place;

                    //     }
                    // }
                    // else
                    // {
                    //     if (shopify_item_isRefund == true)
                    //     {
                    //         refundObj[shopify_item_id]["Item Name"] = shopify_item_id;
                    //         refundObj[shopify_item_id]["Item Qty"] = shopify_item_quantity;
                    //         refundObj[shopify_item_id]["Item Rate"] = shopify_item_rate;
                    //         refundObj[shopify_item_id]["Item Percentage"] = market_place;

                    //     }
                    // }
                    // log.debug({
                    //     title: "PCT-Shopify-Integration 1",
                    //     details: "Shopify Refund Object Array :" + JSON.stringify(refundObj)
                    // })

                    if (shopify_item_isRefund == true)
                    {


                        refundObj[item_index] = {};
                        refundObj[item_index]["itemName"] = shopify_item_id;
                        refundObj[item_index]["itemPrice"] = shopify_item_net;
                        log.debug("PCT-Shopify-Integration", "Refund Object : " + JSON.stringify(refundObj));

                    }
                    else
                    {

                        var item_internal_id = search_item(shopify_item_id, shopify_weborder_load);
                        if (item_internal_id != 0)
                        {

                            //------------------------------------------------ Add Item in Sales Order --------------------------------------
                            salesOrderobj.selectNewLine({ sublistId: 'item' });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: item_internal_id });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: shopify_item_quantity });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: shopify_item_rate });
                            var tax_obj = getTaxPercent(shopify_item_tax_percentage, market_place, shopify_weborder_load);
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_line_item_id', value: shopify_item_lineItemId });
                            salesOrderobj.commitLine({ sublistId: 'item' });
                            //------------------------------------------------ Add Discount Item in Sales Order --------------------------------------
                            if (shopify_item_discount != 0)
                            {
                                salesOrderobj.selectNewLine({ sublistId: 'item' });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: 63 });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: "Discount Item for " + shopify_item_id });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: -(shopify_item_discount) });
                                salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
                                // salesOrderobj.setCurrentSublistText({ sublistId: 'item', fieldId: 'taxcode', text: tax_obj.taxName });
                                salesOrderobj.commitLine({ sublistId: 'item' });
                            }
                        }
                    }
                }
                // --------------------------- If there are present Price difference between Custom Record & Sales Order ------------------------------------

                var salesOrderTotal = salesOrderobj.getValue({ fieldId: 'total' });
                // var salesOrderTotal = getSalesOrderAmount(salesorder_id);
                var orderDiff = parseFloat(shopify_totalPrice) - parseFloat(salesOrderTotal);
                log.debug({
                    title: 'PCT-Shopify-Integration',
                    details: 'Sales Order Amount : ' + salesOrderTotal + ' Shopify Web Odrer Total : ' + shopify_totalPrice + ' Price Diff : ' + Math.abs(orderDiff).toFixed(2)
                })
                if (Math.abs(orderDiff).toFixed(2) != 0.00)
                {
                    // addDiscountItem(salesOrderInternalId, orderDiff);
                    orderDiff = parseFloat(orderDiff).toFixed(2);
                    salesOrderobj.selectNewLine({ sublistId: 'item' });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: 62 });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: "Item for Adjust the Price difference between Sales Order & Shopify Web Order" });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: -(orderDiff) });
                    salesOrderobj.commitLine({ sublistId: 'item' });
                }



                var value_have = shopify_weborder_load.getValue({ fieldId: 'custrecord_pct_hl_so_error_message' });
                if (value_have)
                {
                    log.debug({ title: 'PCT-Shopify-Integration', details: "ERROR" });
                    email.send({
                        author: -5,
                        recipients: ["sandipan.paapri@gmail.com"],
                        cc: ["sandipan.paapri@gmail.com"],
                        subject: 'Moju Sales Order Create Error',
                        body: "Test"
                    });
                    log.debug({ title: 'PCT-Shopify-Integration', details: 'Mail Sent' });
                }
                else
                {
                    var salesorder_id = 0;
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["custbody_pct_sales_order_no", "is", shopify_salesOrdrNo],
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
                    if (soResultCount > 0)
                    {
                        salesorder_id = soResult[0].id;
                        salesorder_documentNumber = soResult[0].getValue('tranid');
                        var invoiceInternalNo = soResult[0].getValue({
                            name: "internalid",
                            join: "applyingTransaction"
                        });
                        log.debug({ title: 'PCT-Shopify-Integration', details: 'Already Present Sales Order Internal Id : ' + salesorder_id + ", & Invoice Id : " + invoiceInternalNo });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: salesorder_id });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_so_created', value: true });
                        // shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Sales Order " + salesorder_documentNumber + " is Already Created for this Order" });
                    }
                    else
                    {

                        salesorder_id = salesOrderobj.save();
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: salesorder_id });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_so_created', value: true });
                        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: " " });
                        var invoiceInternalNo = "";
                        log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Sales Order Id : ' + salesorder_id });
                    }
                    // var salesorder_id = salesOrderobj.save();
                    // shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_nssonumber', value: salesorder_id });
                    // shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_so_created', value: true });
                    // shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: " " });
                    // log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Sales Order Id : ' + salesorder_id });
                }

                // //----------------------------------------- Item Fulfillment ----------------------------------------
                // var fulfillmentRecord = record.transform({
                //     fromType: record.Type.SALES_ORDER,
                //     fromId: salesorder_id,
                //     toType: record.Type.ITEM_FULFILLMENT,
                //     isDynamic: true
                // });
                // fulfillmentRecord.setText({ fieldId: 'shipstatus', text: 'Shipped' });
                // var lineCount = fulfillmentRecord.getLineCount({ sublistId: 'item' });
                // log.debug({
                //     title: "PCT-Shopify-Integration",
                //     details: "Item Fulfillment Item Count : " + lineCount
                // })
                // for (var item_index = 0; item_index < lineCount; item_index++)
                // {
                //     fulfillmentRecord.selectLine({ sublistId: 'item', line: item_index });
                //     fulfillmentRecord.setCurrentSublistText({
                //         sublistId: 'item',
                //         fieldId: 'location',
                //         text: "Love Brand - Warehouse"
                //     });
                // }
                // var item_fullfillment = fulfillmentRecord.save();
                // log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Item Fulfillemnt Id : ' + item_fullfillment });
                //----------------------------------------- Item Fulfillment ----------------------------------------


                var itemFulfillemntObj = {};
                if (shopify_fulfillment != ' ')
                {
                    var shopify_fulfillment_count = shopify_weborder_load.getLineCount({ sublistId: 'recmachcustrecord_pct_sifi_child' });
                    log.debug({ title: 'PCT-Shopify-Integration', details: "Web Order Fulfillment Count : " + shopify_fulfillment_count });
                    var total_fulfillment_item_count = 0;
                    for (item_index = 0; item_index < shopify_fulfillment_count; item_index++)
                    {
                        var shopify_itemfulfillment_id = shopify_weborder_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_sifi_child',
                            fieldId: 'custrecord_pct_sifi_itemidname',
                            line: item_index
                        });
                        var shopify_itemfulfillment_qty = shopify_weborder_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_sifi_child',
                            fieldId: 'custrecord_pct_sifi_quantity',
                            line: item_index
                        });
                        var shopify_itemfulfillment_desc = shopify_weborder_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_sifi_child',
                            fieldId: 'custrecord_pct_sifi_itemdescription',
                            line: item_index
                        });
                        log.debug({ title: 'PCT-Shopify-Integration', details: "Shopify Item Fulfillment Details: ( Item Name/Id : " + shopify_itemfulfillment_id + " Item Qty : " + shopify_itemfulfillment_qty + ", Item Description : " + shopify_itemfulfillment_desc + " )" });
                        if (!(shopify_itemfulfillment_id in itemFulfillemntObj))
                        {
                            itemFulfillemntObj[shopify_itemfulfillment_id] = {};
                            itemFulfillemntObj[shopify_itemfulfillment_id]["Item Name"] = shopify_itemfulfillment_id;
                            itemFulfillemntObj[shopify_itemfulfillment_id]["Item Qty"] = shopify_itemfulfillment_qty;
                            itemFulfillemntObj[shopify_itemfulfillment_id]["Item Description"] = shopify_itemfulfillment_desc;
                        }
                        total_fulfillment_item_count += parseInt(shopify_itemfulfillment_qty);
                    }
                    log.debug({
                        title: "PCT-Shopify-Integration",
                        details: "Shopify Item Fulfilment Object Array :" + JSON.stringify(itemFulfillemntObj)
                    })
                    if (shopify_fulfillment == 'fulfilled')
                    {

                        if (isBackOrdered(salesorder_id) == 0)
                        {
                            //   itemFullfillment(salesorder_id, itemFulfillemntObj, shopifyLocation);
                            var item_fullfillment_id = itemFullfillment(salesorder_id, shopifyLocation, total_item_count, total_fulfillment_item_count, shopify_fulfillment_count, shopifyLineItemCount);
                        }

                    }
                }
                //----------------------------------------- Bill ----------------------------------------
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
                else
                {
                    log.debug({ title: 'PCT-Shopify-Integration', details: 'Already Present Bill Id : ' + invoiceInternalNo });
                    billId = invoiceInternalNo;
                }
                //----------------------------------------- Refund ----------------------------------------
                if (shopify_orderRefund == true)
                {
                    refund(billId, refundObj, shopify_refundAmount);
                }

            }

        }
        catch (ex)
        {
            log.error({ title: 'PCT-Shopify-Integration-WF-ERROR', details: "In Catch : " + ex });
            // shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : " + ex.message });
        }

        // ------------------------------------------------------------------ All Custom Functions --------------------------------------------------

        //----------------------------------------------------------------------- Country Function --------------------------------------------------
        function getCountry(country, shopify_weborder_load)
        {
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
            for (var index = 0; index < isoCountries.length; index++)
            {
                if (isoCountries[index].ccode == country)
                {
                    var cname = isoCountries[index].cname;
                    value = cname;
                    break;

                }
                else if (isoCountries[index].cname == country)
                {
                    var ccode = isoCountries[index].ccode;
                    value = ccode;
                    break;
                }
            }
            if (value == 0)
            {
                log.debug({ title: "PCT-Shopify-Integration Country Function ", details: "Country " + country + " is Not Present" });
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Market Place " + country + " is not Valid" });
            }
            return value;
        }
        //----------------------------------------------------------------------- Country Function End --------------------------------------------------

        //----------------------------------------------------------------------- Create Customer Function --------------------------------------------------

        function searchCustomer(shopify_customerName, shopify_shippingCountry, shopify_customerMail, shopify_customerPhnNo)
        {
            log.debug({
                title: "PCT-Shopify-Integration Customer Function ",
                details: "Customer Name : " + shopify_customerName + ", Email : " + shopify_customerMail + ", Shiiping Country : " + shopify_shippingCountry + ", Phn No : " + shopify_customerPhnNo
            })
            // log.debug({
            //     title: "PCT-Shopify-Integration Customer Function ",
            //     details: "Customer Name : " + typeof (shopify_customerName) + ", Email : " + typeof (shopify_customerMail)
            // })
            // if (shopify_customerName == " ")
            // {
            //     shopify_customerName = 'Shopify Default Customer';
            // }
            // shopify_customerName = shopify_customerName.toString();
            // shopify_customerMail = shopify_customerMail.toString();
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["stage", "anyof", "CUSTOMER"],
                        "AND",
                        ["entityid", "is", shopify_customerName],
                        "AND",
                        ["email", "is", shopify_customerMail]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });


            var customer_count = customerSearchObj.runPaged().count;
            log.debug("PCT-Shopify-Integration Customer Function", "Customer Result Count : " + customer_count);
            var customer_searchresult = customerSearchObj.run().getRange({ start: 0, end: customer_count });
            if (customer_count > 0)
            {
                log.debug({ title: "PCT-Shopify-Integration Customer Function", details: "Customer " + shopify_customerName + " is Already Present " })
                for (customer_index = 0; customer_index < customer_count; customer_index++)
                {
                    var customer_internal_id = customer_searchresult[customer_index].id;
                }
                return customer_internal_id;

            }
            else
            {
                log.debug({ title: "PCT-Shopify-Integration Customer Function", details: "Creating a Customer " })
                var customer = record.create({
                    type: record.Type.CUSTOMER,
                    isDynamic: true
                });
                //customer.setValue({ fieldId: 'companyname', value: shopify_customerName });
                customer.setValue({ fieldId: 'isperson', value: "T" });
                var customerArr = shopify_customerName.split(" ");
                var firstName = " ";
                if (customerArr.length == 1) { firstName = customerArr[0]; }
                var lastName = customerArr[customerArr.length - 1];
                for (index = 0; index < customerArr.length - 1; index++)
                {
                    firstName = firstName + " " + customerArr[index];
                }
                customer.setValue({ fieldId: 'firstname', value: firstName });
                customer.setValue({ fieldId: 'lastname', value: lastName });
                customer.setValue({ fieldId: 'email', value: shopify_customerMail });
                customer.setValue({ fieldId: 'phone', value: shopify_customerPhnNo });
                customer.selectNewLine({ sublistId: 'addressbook' });
                var addressSubrecord = customer.getCurrentSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress'
                });
                // Set all required values here.
                addressSubrecord.setText({
                    fieldId: 'country',
                    value: shopify_shippingCountry
                })
                addressSubrecord.setValue({
                    fieldId: 'defaultbilling',
                    value: "T"
                })
                addressSubrecord.setValue({
                    fieldId: 'defaultshipping',
                    value: "T"
                })
                customer.commitLine({
                    sublistId: 'addressbook'
                });
                customer_internal_id = customer.save();
                log.debug({ title: "PCT-Shopify-Integration", details: "New Customer Created & Customer Id " + customer_internal_id })
                return customer_internal_id;
            }

        }
        //----------------------------------------------------------------------- Customer Function End -----------------------------------------------------------

        //----------------------------------------------------------------------- Search Item Function --------------------------------------------------

        function search_item(shopify_item_id, shopify_weborder_load)
        {
            log.debug({
                title: "PCT-Shopify-Integration Item Function ",
                details: "Item Name : " + shopify_item_id
            })
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["name", "is", shopify_item_id],
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var itemsearch_count = itemSearchObj.runPaged().count;
            var item_searchresult = itemSearchObj.run().getRange({ start: 0, end: itemsearch_count });
            if (itemsearch_count > 0)
            {
                var item_internal_id = item_searchresult[0].id;
                log.debug({ title: "PCT-Shopify-Integration Item Function", details: "Item " + shopify_item_id + " is Already Present & Present Item ID : " + item_internal_id });
                return item_internal_id;
            }
            else
            {
                log.debug({ title: "PCT-Shopify-Integration Item Function ", details: "Item " + shopify_item_id + " is Not Present" });
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Item " + shopify_item_id + " is not Present In System" });
                return 0;
            }
        }
        //----------------------------------------------------------------------- Search Item Function End --------------------------------------------------

        //----------------------------------------------------------------------- Get Tax Percentage Function End -----------------------------------------------------------
        function getTaxPercent(shopify_item_tax_percentage, countryCode, shopify_weborder_load)
        {
            shopify_item_tax_percentage = parseFloat(shopify_item_tax_percentage).toFixed(2);
            log.debug({
                title: "PCT-Shopify-Integration getTaxPercent Function",
                details: "Item Tax Percentage : " + shopify_item_tax_percentage + ", Country Code : " + countryCode
            });
            if (shopify_item_tax_percentage == '' || shopify_item_tax_percentage == null || isNaN(shopify_item_tax_percentage))
            {
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
            if (searchResultCount)
            {
                salestaxitemSearchObj.run().each(function (result)
                {
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
            }
            else
            {
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_swo_error', value: "Error : Tax Code is not Present" });
            }
            return taxDetailObj;
        }
        //----------------------------------------------------------------------- Get Tax Percentage Function End --------------------------------------------------
        //-------------------------------------------------------------- Shipping Method Function Start -----------------------------------------------
        function shipping_method(shopify_shippingMethod)
        {
            log.debug({
                title: "PCT-Shopify-Integration Shipping Mwthod Function ",
                details: "Shipping Method : " + shopify_shippingMethod
            })
            var shipitemSearchObj = search.create({
                type: "shipitem",
                filters:
                    [
                        ["itemid", "is", shopify_shippingMethod]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var method_count = shipitemSearchObj.runPaged().count;
            log.debug("PCT-Shopify-Integration Shipping Mwthod Function", "Shipping Method Result Count : " + method_count);
            var method_searchresult = shipitemSearchObj.run().getRange({ start: 0, end: method_count });
            if (method_count > 0)
            {
                log.debug({ title: "PCT-Shopify-Integration Shipping Mwthod Function", details: "Shipping Method " + shopify_shippingMethod + " Already Present " })
                for (method_index = 0; method_index < method_count; method_index++)
                {
                    var shipping_method_id = method_searchresult[method_index].id;
                }
                return shipping_method_id;

            }
            else
            {
                log.debug({ title: "PCT-Shopify-Integration Shipping Mwthod Function", details: "Shipping Method " + shopify_shippingMethod + " is not Present" })
                log.debug({ title: "PCT-Shopify-Integration Shipping Mwthod Function ", details: "Createing a Shipping Item" });
                var shippingItem = record.create({
                    type: "shipItem",
                    isDynamic: true
                });
                shippingItem.setValue({ fieldId: 'itemid', value: shopify_shippingMethod });
                shippingItem.setValue({ fieldId: 'displayname', value: shopify_shippingMethod });
                shippingItem.setValue({ fieldId: 'shippingflatrateamount', value: 0.00 });
                shippingItem.setValue({ fieldId: 'account', value: shippingItemAccount });
                shippingItem.setValue({ fieldId: 'taxschedule', value: shippingItemTax });
                var shippingItemID = shippingItem.save();
                log.debug({ title: "PCT-Shopify-Integration Shipping Mwthod Function ", details: "New Shipping Item " + shippingItemID });
                return shippingItemID;
            }
        }
        //-------------------------------------------------------------- Shipping Method Function End -----------------------------------------------


        //-------------------------------------------------------------- itemFullfillment Function Start -----------------------------------------------
        function itemFullfillment(salesorder_id, shopifyLocation, total_item_count, total_fulfillment_item_count, shopify_fulfillment_count, shopify_item_count)
        {
            log.debug({
                title: "PCT-Shopify-Integration itemFullfillment Function",
                details: "Sales Order Id : " + salesorder_id + ", Sales Odrer Total Item : " + total_item_count + ", Fulfillment Odrer Total Item : " + total_fulfillment_item_count + ", Item Tab Line Count : " + shopify_item_count + ", Fulfillment Tab Line Count : " + shopify_fulfillment_count + ", Location : " + shopifyLocation
            });
            var item_fullfillment_id = 0
            if ((total_item_count == total_fulfillment_item_count) && (shopifyLineItemCount == shopify_fulfillment_count))
            {
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
                item_fullfillment_id = fulfillmentRecord.save();
                log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Item Fulfillemnt Id : ' + item_fullfillment_id });
            }
            return item_fullfillment_id;
            // var fulfillmentRecord = record.transform({
            //     fromType: record.Type.SALES_ORDER,
            //     fromId: salesorder_id,
            //     toType: record.Type.ITEM_FULFILLMENT,
            //     isDynamic: true
            // });
            // fulfillmentRecord.setText({ fieldId: 'shipstatus', text: 'Shipped' });
            // var lineCount = fulfillmentRecord.getLineCount({ sublistId: 'item' });
            // log.debug({
            //     title: "PCT-Shopify-Integration",
            //     details: "Item Fulfillment Item Count : " + lineCount
            // })
            // for (var item_index = 0; item_index < lineCount; item_index++)
            // {
            //     fulfillmentRecord.selectLine({ sublistId: 'item', line: item_index });
            //     fulfillmentRecord.setCurrentSublistText({
            //         sublistId: 'item',
            //         fieldId: 'location',
            //         text: shopifyLocation
            //     });
            // }
            // var item_fullfillment_id = fulfillmentRecord.save();
            // log.debug({ title: 'PCT-Shopify-Integration', details: 'New Created Item Fulfillemnt Id : ' + item_fullfillment_id });
        }
        //-------------------------------------------------------------- itemFullfillment Function END -----------------------------------------------
        //-------------------------------------------------------------- isBackOrdered Functuion Start -----------------------------------------------
        function isBackOrdered(salesOrderInternalId)
        {
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
                        ["item.type", "noneof", "Discount"],
                        /*"AND", 
                        ["formulanumeric: case when {item} = 'End of Group' then 1 else 0 end","equalto","0"],*/
                        "AND",
                        ["formulanumeric: {quantity}-nvl({quantityshiprecv},0)-nvl({quantitycommitted},0)", "greaterthan", "0"]
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
            var ITEM = 'Item is';
            if (searchResultCount > 1)
            {
                var ITEM = 'Items are';
            }
            if (searchResultCount > 0)
            {
                log.debug("Item Back Odrer Count : ", searchResultCount);
                salesorderSearchObj.run().each(function (result)
                {
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
                email.send({
                    author: -5,
                    body: ITEM + ' on Back Order ' + itemArr.join(','),
                    recipients: ["sandipan.paapri@gmail.com"],
                    subject: ITEM + ' on Back Order for Sales Order Internal ID :' + salesOrderInternalId

                })
                itemError = 1;
            }
            return backOrder;
        }
        //-------------------------------------------------------------- isBackOrdered Functuion End -----------------------------------------------

        //-------------------------------------------------------------- refund Functuion Start -----------------------------------------------
        function refund(billId, refundObj, shopify_refundAmount)
        {
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
            for (var applyIndex = 0; applyIndex < applyCount; applyIndex++)
            {
                creditMemoObj.selectLine({ sublistId: 'apply', line: applyIndex });
                var applyChceck = creditMemoObj.getCurrentSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply'

                });

                if (applyChceck == "T" || applyChceck == true)
                {
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
            for (var itemIndex = lineCount - 1; itemIndex >= 0; itemIndex--)
            {
                var itemType = creditMemoObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: itemIndex
                });
                // log.debug({
                //     title: "PCT-Shopify-Integration refund Function",
                //     details: "Item Type : " + itemType
                // })
                if (itemType == "Group" || itemType == "Discount" || itemType == "InvtPart")
                {
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
            for (var objIndex = 0; objIndex < Object.keys(refundObj).length; objIndex++)
            {
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


        }
        //-------------------------------------------------------------- refund Functuion End -----------------------------------------------

        //-------------------------------------------------------------- Location Search Functuion Start -----------------------------------------------
        function locationSearch(shopify_weborder_load)
        {
            var customrecord_pct_shopofy_preferenceSearchObj = search.create({
                type: "customrecord_pct_shopofy_preference",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_shopify_location", label: "Location" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var locationCount = customrecord_pct_shopofy_preferenceSearchObj.runPaged().count;
            log.debug("PCT-Shopify-Integration", "Location Count : " + locationCount);
            var locationResult = customrecord_pct_shopofy_preferenceSearchObj.run().getRange({ start: 0, end: locationCount });
            if (locationCount > 0)
            {
                for (var locationIndex = 0; locationIndex < locationCount; locationIndex++)
                {
                    var shopifyLocation = locationResult[locationIndex].getText("custrecord_pct_shopify_location");
                }
                log.debug("PCT-Shopify-Integration", "Location : " + shopifyLocation);
                return shopifyLocation;
            }
            else
            {
                shopify_weborder_load.setValue({
                    fieldId: 'custrecord_pct_swo_nssonumber', value: "Warning : Please Set the Location in Shopify Preference Record"
                });
                return null;

            }
        }
        //-------------------------------------------------------------- Location Search Functuion End -----------------------------------------------
    }

    return {
        onAction: onAction
    }
});
