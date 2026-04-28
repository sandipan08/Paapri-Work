/**
*              //////////     Sales Order Generate from MA Web Order      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  WorkflowActionScript
*@NModuleScope SameAccount
*@since        2021-11-05 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for Sales Order Generate from MA Web Order, you can redistribute
               it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
               published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email) {
    function onAction(scriptContext) {
        log.debug({ title: 'PCT-MonAmi', details: "In WorkFlow OnAction Function" });
        var maWebOrderload = scriptContext.newRecord;
        var recordId = maWebOrderload.getValue({ fieldId: 'id' });
        log.debug({ title: 'PCT-MonAmi', details: 'MA Web Order Id : ' + recordId });
        try {
            //-------------------- All HardCore Value ---------------------------
            var subsidiary = 1;
            var inventoryLocation = "MAISONETTE SYSTEM INV LOCK";
            var webOrderclass = "Maisonette";
            var customerInternalId = 72704; //createCustomer(cName)
            var discountItem = 2011;

            //--------------------------------------------------------------------

            var customerLookUp = search.lookupFields({
                type: "customer",
                id: customerInternalId,
                columns: ['custentity_pct_monami_sao_entiti_field']
            });

            var shippingAccountOverRide = customerLookUp.custentity_pct_monami_sao_entiti_field[0].text

            // ------------------------------------------------Start Get Body Level Deatils -----------------------------------------

            var cName = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_customer_name' });
            var cEmail = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_customer_email' });
            var cPhoneNo = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_customer_phone_number' });
            var companyName = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_company_name' });
            var jobTitle = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_job_title' });
            var soClass = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_class' });
            var commercialId = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_commercial_id' });
            var craeteDate = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_create_date' });
            var OrderId = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_order_id' });
            var orderState = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_order_state' });
            var paymentType = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_payment_type' });
            var totalPrice = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_total_price' });
            var orderStatus = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_order_status' });
            var packingSlipName = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_packing_slip_name' });


            log.debug({
                title: 'PCT-MonAmi',
                details: "MA Web Order Body Level Details : [ Customer Name : " + cName + ", Customer Email : " + cEmail + ", Customer Phone No : " + cPhoneNo + ", Copamy NAme : " + companyName +
                    ", Job Title : " + jobTitle + ", So Class : " + soClass + ", Commercial Id : " + commercialId + ", Crated Date : " + craeteDate + ", Order Id : " + OrderId +
                    ", Order State : " + orderState + ", Payment Type : " + paymentType + ", Total Price : " + totalPrice + ", Order Status : " + orderStatus + ", Packing Slip Name : " + packingSlipName + "]"
            })
            // ------------------------------------------------End Get Body Level Details -------------------------------------------

            // ------------------------------------------------ Start Get Shipping Details --------------------------------------------

            var shippingPhoneNo = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_phone_number' });
            var shippingCountry = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_country' });
            shippingCountry = shippingCountry.toUpperCase();
            var allCountries = getCountry();
            var shippingCountryObj = allCountries.find(ele => ele.cname.toUpperCase() === shippingCountry)
            log.debug("PCT-MonAmi", "--------------" + shippingCountryObj)
            var shippingCountryCode = shippingCountryObj.ccode;
            //  log.debug("PCT-MonAmi", "----- : " + JSON.stringify(shippingCountryObj) + ", Code : " + shippingCountryCode)
            var shippingAddressee = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_addressee' });
            var shippingAddresss1 = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_address1' });
            var shippingAddresss2 = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_address2' });
            var shippingCity = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_city' });
            var shippingState = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_state' });
            var shippingZip = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_zip' });
            var shippingCost = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_cost' });
            var shippingMethod = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_shipping_method' });


            log.debug({
                title: "PCT-MonAmi",
                details: "Maisonette Web Order Shipping Details : [ Shipping Phone No : " + shippingPhoneNo + ", Shipping Country : " + shippingCountry + ",Shipping Country Code : :" + shippingCountryCode + ", Shipping Addresee : " + shippingAddressee +
                    ", Shipping Address1 : " + shippingAddresss1 + ", Shipping Address2 : " + shippingAddresss2 + ", Shipping City : " + shippingCity + ", Shipping State : " + shippingState + ", Shipping Zip : " + shippingZip +
                    ", Shipping Cost : " + shippingCost + ", Shipping Method : " + shippingMethod + " ]"
            })

            // ------------------------------------------------ End Get Shipping Details  ---------------------------------------------------
            // ------------------------------------------------ Start Get Billing Details ---------------------------------------------------

            var billingPhoneNo = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_phone' });
            var billingCountry = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_country' });
            billingCountry = billingCountry.toUpperCase();
            var billingCountryObj = allCountries.find(ele => ele.cname.toUpperCase() === billingCountry)
            var billingCountryCode = billingCountryObj.ccode;
            //  log.debug("PCT-MonAmi", "----- : " + JSON.stringify(billingCountryObj) + ", Code : " + billingCountryCode)
            var billingAddressee = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_addressee' });
            var billingAddresss1 = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_address1' });
            var billingAddresss2 = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_address2' });
            var billingCity = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_city' });
            var billingState = maWebOrderload.getValue({ fieldId: 'custrecord_pct_hl_billing_state' });
            var billingZip = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_billing_zip' });



            log.debug({
                title: "PCT-MonAmi",
                details: "Maisonette Web Order Billing Details : ( Billing Phone No : " + billingPhoneNo + ", Billing Country : " + billingCountry + ",Shipping Country Code : :" + shippingCountryCode + ", Billing Addresee : " + billingAddressee +
                    ", Billing Address1 : " + billingAddresss1 + ", Billing Address2 : " + billingAddresss2 + ", Billing City : " + billingCity + ", Billing State : " + billingState + ", Billing Zip : " + billingZip + " )"
            })

            // ------------------------------------------------ End Get Billing Details  -------------------------------------------------

            //------------------------------------------------- Creating Sales Order ------------------------------------------------



            var salesOrderobj = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });

            salesOrderobj.setValue({ fieldId: 'entity', value: customerInternalId });
            salesOrderobj.setValue({ fieldId: 'otherrefnum', value: OrderId });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_ma_order_id', value: OrderId });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_web_order_number', value: recordId });
            salesOrderobj.setValue({ fieldId: 'custbody_pct_ma_so_psn', value: packingSlipName });
            salesOrderobj.setValue({ fieldId: 'orderstatus', value: "B" });
            salesOrderobj.setValue({ fieldId: 'subsidiary', value: subsidiary });
            salesOrderobj.setText({ fieldId: 'location', text: inventoryLocation });
            salesOrderobj.setText({ fieldId: 'class', text: webOrderclass });

            // ----------------------------------- Add Shipping Method ---------------------------------------------


            var subrec = salesOrderobj.getSubrecord({ fieldId: 'shippingaddress' });
            subrec.setValue({ fieldId: 'country', value: shippingCountryCode });
            subrec.setValue({ fieldId: 'addressee', value: shippingAddressee });
            subrec.setValue({ fieldId: 'addr1', value: shippingAddresss1 });
            subrec.setValue({ fieldId: 'addr2', value: shippingAddresss2 });
            subrec.setValue({ fieldId: 'city', value: shippingCity });
            subrec.setValue({ fieldId: 'zip', value: shippingZip });
            subrec.setValue({ fieldId: 'addrphone', value: shippingPhoneNo });
            subrec.setValue({ fieldId: 'override', value: false });
            subrec.setValue({
                fieldId: 'shipisresidential',
                value: true
            });

            salesOrderobj.setText({ fieldId: 'custbody_pct_monami_sao_tran_field', text: shippingAccountOverRide });
            if (shippingMethod == "Ground") {
                //salesOrderobj.setText({ fieldId: 'shipcarrier', text: "FedEx/More" });
                salesOrderobj.setText({ fieldId: 'shipmethod', text: "Ground" });
            }
            else if (shippingMethod == "Second Day") {
                salesOrderobj.setText({ fieldId: 'shipmethod', text: "2nd day air" }); // Change By sasaha@paapri.com at 02/05/2022
            }
            else if (shippingMethod == "Next Day") {
                salesOrderobj.setText({ fieldId: 'shipmethod', text: "Next Day Air Saver" }); // Change By sasaha@paapri.com at 02/05/2022
            }
            else {
                salesOrderobj.setValue({ fieldId: 'shippingcost', value: 0 }); // Added By sasaha@paapri.com at 02/05/2022
            }


            // ----------------------------------- Add Billing Details ---------------------------------------------


            var billing_subrec = salesOrderobj.getSubrecord({
                fieldId: 'billingaddress'
            });
            billing_subrec.setValue({ fieldId: 'country', value: billingCountryCode });
            billing_subrec.setValue({
                fieldId: 'billisresidential',
                value: true
            });
            billing_subrec.setValue({ fieldId: 'addr1', value: billingAddresss1 });
            billing_subrec.setValue({ fieldId: 'addr2', value: billingAddresss2 });
            billing_subrec.setValue({ fieldId: 'city', value: billingCity });
            billing_subrec.setText({ fieldId: 'state', text: billingState });
            billing_subrec.setValue({ fieldId: 'zip', value: billingZip });
            billing_subrec.setValue({ fieldId: 'addrtext', value: billingAddressee });
            billing_subrec.setValue({ fieldId: 'addrphone', value: billingPhoneNo });
            billing_subrec.setValue({ fieldId: 'override', value: false });


            // ------------------------------------------------  Get Item Details ---------------------------------------------------

            var maisonetteItemCount = maWebOrderload.getLineCount({ sublistId: 'recmachcustrecord_pct_ma_link_to_item' });
            log.debug({ title: 'PCT-MonAmi', details: "Maisonette Web Order Item Count : " + maisonetteItemCount });
            if (maisonetteItemCount == 0) {
                maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_error', value: "Error :  No Item is there" });
            }
            else {
                for (item_index = 0; item_index < maisonetteItemCount; item_index++) {
                    var maisonetteItemId = maWebOrderload.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ma_link_to_item',
                        fieldId: 'custrecord_pct_ma_item_id',
                        line: item_index
                    });
                    var maisonetteOrderId = maWebOrderload.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ma_link_to_item',
                        fieldId: 'custrecord_pct_ma_order_line_id',
                        line: item_index
                    });
                    var maisonetteItemQty = maWebOrderload.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ma_link_to_item',
                        fieldId: 'custrecord_pct_ma_quantity',
                        line: item_index
                    });
                    var maisonetteTotalPrice = maWebOrderload.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ma_link_to_item',
                        fieldId: 'custrecord_pct_ma_item_total_price',
                        line: item_index
                    });
                    var maisonetteUnitPrice = maWebOrderload.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ma_link_to_item',
                        fieldId: 'custrecord_pct_ma_item_unit_price',
                        line: item_index
                    });
                    var maisonetteItemCommission = maWebOrderload.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_ma_link_to_item',
                        fieldId: 'custrecord_pct_ma_item_commission',
                        line: item_index
                    });

                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Item Details : [ Item Id : " + maisonetteItemId + ", Order Line Id : " + maisonetteOrderId + ", Item Qty : " + maisonetteItemQty + ", Total Price : " + maisonetteTotalPrice + ", Unit Price : " + maisonetteUnitPrice + ", Commission : " + maisonetteItemCommission
                    })
                    //----------------- Search to Check Item is Present or Not ----------------------
                    var itemInternalId = search_item(maisonetteItemId, maWebOrderload)
                    //-------------------- Item Added in Sales Order ------------------------

                    salesOrderobj.selectNewLine({ sublistId: 'item' });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemInternalId });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: maisonetteItemQty });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'commitinventory', value: 2 });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: (maisonetteUnitPrice / maisonetteItemQty) });
                    salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_ma_order_line_id', value: maisonetteOrderId });
                    salesOrderobj.commitLine({ sublistId: 'item' });

                    //--------------------------------------------------------------------------------
                    //-------------------- Discount Item Added in Sales Order ------------------------
                    if (maisonetteItemCommission != 0) {
                        salesOrderobj.selectNewLine({ sublistId: 'item' });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: discountItem });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: "Discount Item for " + maisonetteItemId });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: -(maisonetteItemCommission) });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_ma_order_line_id', value: maisonetteOrderId });
                        salesOrderobj.commitLine({ sublistId: 'item' });
                    }
                    //----------------------------------------------------------------------------------
                }
                log.debug({ title: 'PCT-MonAmi', details: "Item Added in Sales Order" });
                var value_have = maWebOrderload.getValue({ fieldId: 'custrecord_pct_ma_error' });
                if (value_have) {
                    log.debug({ title: 'PCT-MonAmi', details: "ERROR" });
                    maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_so_created', value: false });
                    // email.send({
                    //     author: -5,
                    //     recipients: [""],
                    //     cc: ["sandipan.paapri@gmail.com"],
                    //     subject: 'MonAmi Sales Order Create Error',
                    //     body: value_have
                    // });
                    log.debug({ title: 'PCT-MonAmi', details: 'Error Mail Sent' });
                }
                else {
                    var salesorder_id = 0;
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["custbody_pct_ma_order_id", "is", OrderId],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "tranid", label: "Document Number" })
                            ]
                    });
                    var soResultCount = salesorderSearchObj.runPaged().count;
                    log.debug("PCT-MonAmi", "Sales Order Result Count : " + soResultCount);
                    var soResult = salesorderSearchObj.run().getRange({ start: 0, end: soResultCount });
                    if (soResultCount > 0) {
                        salesorder_id = soResult[0].id;
                        salesorder_documentNumber = soResult[0].getValue('tranid');
                        log.debug({ title: 'PCT-MonAmi', details: 'Already Present Sales Order Id : ' + salesorder_id });
                        maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_sales_order', value: salesorder_id });
                        maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_so_created', value: true });
                    }
                    else {
                        salesorder_id = salesOrderobj.save({

                            ignoreMandatoryFields: true
                        });

                        maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_sales_order', value: salesorder_id });
                        maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_so_created', value: true });
                        maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_error', value: " " });
                        log.debug({ title: 'PCT-MonAmi', details: 'New Created Sales Order Id : ' + salesorder_id });
                    }

                }
                //--------------------------------------------- Billing ----------------------------------------------

                var billRecord = record.transform({
                    fromType: 'salesorder',
                    fromId: salesorder_id,
                    toType: 'invoice',
                    isDynamic: true
                });
                billRecord.setValue({
                    fieldId: "custbody_pct_ma_send_to_warehouse",
                    value: true,

                })
                var billId = billRecord.save();
                log.debug({ title: 'PCT-MonAmi', details: 'New Created Bill Id : ' + billId });
            }

        }
        catch (ex) {
            log.error({ title: 'PCT-MonAmi-WF-ERROR', details: "In Catch : " + ex });
        }
        // ---------------------------------------------------------------------------- All Custom Functions -----------------------------------------------------------------------------------------

        //----------------------------------------------------------------------- Create Customer Function --------------------------------------------------

        // function createCustomer(cName)
        // {
        //     log.debug({
        //         title: "PCT-MonAmi Create Customer Function", details: "Customer NAme :"+cName
        //     })
        //     // shippingObj = JSON.parse(shippingObj);
        //     // billingObj = JSON.parse(billingObj);
        //     var customerSearchObj = search.create({
        //         type: "customer",
        //         filters:
        //             [
        //                 ["stage", "anyof", "CUSTOMER"],
        //                 "AND",
        //                 ["entityid", "is", cName],

        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "internalid", label: "Internal ID" })
        //             ]
        //     });
        //     var customer_count = customerSearchObj.runPaged().count;
        //     log.debug("PCT-MonAmi Create Customer Function", "Customer Count : " + customer_count);
        //     var customer_searchresult = customerSearchObj.run().getRange({ start: 0, end: customer_count });
        //     if (customer_count > 0)
        //     {
        //         log.debug({ title: "PCT-MonAmi Create Customer Function", details: "Customer " + cName + " is Already Present " })
        //         for (customer_index = 0; customer_index < customer_count; customer_index++)
        //         {
        //             var customer_internal_id = customer_searchresult[customer_index].id;
        //         }
        //         return customer_internal_id;

        //     }
        //     else
        //     {
        //         log.debug({ title: "PCT-MonAmi Create Customer Function", details: "Creating a Customer" })
        //         var customer = record.create({
        //             type: record.Type.CUSTOMER,
        //             isDynamic: true
        //         });
        //         customer.setValue({ fieldId: 'isperson', value: "T" });

        //         var customerArr = cName.split(" ");
        //         var firstName = " ";
        //         if (customerArr.length == 1) { firstName = customerArr[0]; }
        //         var lastName = customerArr[customerArr.length - 1];
        //         for (index = 0; index < customerArr.length - 1; index++)
        //         {
        //             firstName = firstName + " " + customerArr[index];
        //         }
        //         customer.setValue({ fieldId: 'firstname', value: firstName });
        //         customer.setValue({ fieldId: 'lastname', value: lastName });
        //         customer.setText({ fieldId: 'category', text: "Maisonette" });

        //         customer.setValue({ fieldId: 'partner', value: 53852 });
        //         // //------------- Add Shipping Details --------------------
        //         // customer.selectNewLine({ sublistId: 'addressbook' });
        //         // var addressSubrecord = customer.getCurrentSublistSubrecord({
        //         //     sublistId: 'addressbook',
        //         //     fieldId: 'addressbookaddress'
        //         // });
        //         // addressSubrecord.setText({ fieldId: 'country', value: shippingObj.shippingCountry });
        //         // //  addressSubrecord.setValue({ fieldId: 'attention', value:  });
        //         // addressSubrecord.setValue({ fieldId: 'addressee', value: shippingObj.shippingAddressee });
        //         // addressSubrecord.setValue({ fieldId: 'addrphone', value: shippingObj.shippingPhoneNo });
        //         // addressSubrecord.setValue({ fieldId: 'addr1', value: shippingObj.shippingAddresss1 });
        //         // addressSubrecord.setValue({ fieldId: 'addr2', value: shippingObj.shippingAddresss2 });
        //         // addressSubrecord.setValue({ fieldId: 'city', value: shippingObj.shippingCity });
        //         // addressSubrecord.setText({ fieldId: 'state', text: shippingObj.shippingState });
        //         // addressSubrecord.setValue({ fieldId: 'zip', value: shippingObj.shippingZip });
        //         // addressSubrecord.setValue({ fieldId: 'defaultshipping', value: true })
        //         // addressSubrecord.setValue({ fieldId: 'defaultbilling', value: false })
        //         // customer.commitLine({ sublistId: 'addressbook' });

        //         // //------------- Add Billing Details --------------------

        //         // customer.selectNewLine({ sublistId: 'addressbook' });
        //         // var addressSubrecord = customer.getCurrentSublistSubrecord({
        //         //     sublistId: 'addressbook',
        //         //     fieldId: 'addressbookaddress'
        //         // });
        //         // addressSubrecord.setText({ fieldId: 'country', value: billingObj.billingCountry });
        //         // //  addressSubrecord.setValue({ fieldId: 'attention', value:  });
        //         // addressSubrecord.setValue({ fieldId: 'addressee', value: billingObj.billingAddressee });
        //         // addressSubrecord.setValue({ fieldId: 'addrphone', value: billingObj.billingPhoneNo });
        //         // addressSubrecord.setValue({ fieldId: 'addr1', value: billingObj.billingAddresss1 });
        //         // addressSubrecord.setValue({ fieldId: 'addr2', value: billingObj.billingAddresss2 });
        //         // addressSubrecord.setValue({ fieldId: 'city', value: billingObj.billingCity });
        //         // addressSubrecord.setText({ fieldId: 'text', value: billingObj.billingState });
        //         // addressSubrecord.setValue({ fieldId: 'zip', value: billingObj.billingZip });
        //         // addressSubrecord.setValue({ fieldId: 'defaultshipping', value: false })
        //         // addressSubrecord.setValue({ fieldId: 'defaultbilling', value: true })
        //         // customer.commitLine({ sublistId: 'addressbook' });

        //         customer_internal_id = customer.save();
        //         log.debug({ title: "PCT-MonAmi Create Customer Function", details: "New Customer Created & Customer Id " + customer_internal_id })
        //         return customer_internal_id;
        //     }
        // }
        //----------------------------------------------------------------------- Customer Function End -----------------------------------------------------------
        // ---------------------------------------------------------------------- Item Search Function -------------------------------------------

        function search_item(maisonetteItemId, maWebOrderload) {
            log.debug({
                title: "PCT-MonAmi Item Function",
                details: "Item Name : " + maisonetteItemId
            })
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["name", "is", maisonetteItemId],
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
                log.debug({ title: "PCT-MonAmi Item Function", details: "Item " + maisonetteItemId + " is Already Present & Present Item ID : " + item_internal_id + ", and Item Type is : " + item_type });
                return item_internal_id;
            }
            else {
                log.debug({ title: "PCT-MonAmi Item Function ", details: "Item " + maisonetteItemId + " is Not Present" });
                maWebOrderload.setValue({ fieldId: 'custrecord_pct_ma_error', value: "Error : Item " + maisonetteItemId + " is not Present In System" });
                return 0;
            }
        }
        //  ----------------------------------------------------------------------- Customer Function End-----------------------------------------------------------
        function shipping_method(shippingMethod, maWebOrderload) {
            log.debug({
                title: "PCT-MonAmi Shipping Method Function",
                details: "Shipping Method : " + shippingMethod
            })
            var shipitemSearchObj = search.create({
                type: "shipitem",
                filters:
                    [
                        ["itemid", "is", shippingMethod]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var method_count = shipitemSearchObj.runPaged().count;
            log.debug("PCT-MonAmi Shipping Method Function", "Shipping Method Result Count : " + method_count);
            var method_searchresult = shipitemSearchObj.run().getRange({ start: 0, end: method_count });
            if (method_count > 0) {
                log.debug({ title: "PCT-MonAmi Shipping Method Function", details: "Shipping Method " + shippingMethod + " Already Present " })
                for (method_index = 0; method_index < method_count; method_index++) {
                    var shipping_method_id = method_searchresult[method_index].id;
                }
                return shipping_method_id;

            }
            else {
                log.debug({ title: "PCT-MonAmi Shipping Method Function", details: "Shipping Method " + shippingMethod + " is not Present" })
                shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_ma_error', value: "Error : Shipping Method " + shippingMethod + " is not Present in System" });
                return 0;
            }
        }

        //----------------------------------------------------------------------- Country Function --------------------------------------------------
        function getCountry() {

            return [
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

        }
        //----------------------------------------------------------------------- Country Function End --------------------------------------------------
    }

    return {
        onAction: onAction
    }
});