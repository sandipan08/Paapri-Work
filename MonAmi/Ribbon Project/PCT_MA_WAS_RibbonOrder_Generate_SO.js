/**
*              //////////     Sales Order Generate from Ribbon Order      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  WorkflowActionScript
*@NModuleScope SameAccount
*@since        2021-11-05 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for Sales Order Generate from Ribbon Order, you can redistribute
               it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
               published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Ribbon Order.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{
    //-------------------- All Global Variable ---------------------------
    var salesOrderId = 0;
    //-------------------- All HardCore Value ---------------------------
    var financialPriceLevel = "Wholesale";
    var financialPartner = orderPartner = "3 Keena";
    var financialCategory = "Wholesale";
    var financialTerms = "Net 30";


    var orderStatus = "A" //"Pending Approval";
    var orderClass = "Offline/Rep Wholesale";

    var discountItem = 1854; // Vendor Discount

    //--------------------------------------------------------------------
    function onAction(scriptContext)
    {
        log.debug({ title: 'PCT-MonAmi', details: "In WorkFlow OnAction Function" });
        var ribbonOrderLoad = scriptContext.newRecord;
        var recordId = ribbonOrderLoad.getValue({ fieldId: 'id' });
        var orderId = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_order_id' });
        log.debug({ title: 'PCT-MonAmi', details: 'Ribbon Project Id : ' + recordId + ", Order Id : " + orderId });
        try
        {
            // Check if Sales Order is Already Present or Not 
            if (salesOrderPresent(orderId))
            {
                log.debug({ title: 'PCT-MonAmi', details: 'Already Present Sales Order Id : ' + salesOrderId });
                ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_so_no', value: salesOrderId });
                ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_so_craeted', value: true });
                ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_error', value: '' });
            }
            else
            {
                ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_error', value: '' });
                // ------------------------------------------------ Get Body Level Details -----------------------------------------
                var buyerAccount = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_buyer_account' });
                var buyerName = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_buyer_name' });
                var category = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_category' });
                var buyerMail = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_buyer_email' });
                var buyerTelephone = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_buyer_telephone' });
                var partner = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_partner' });
                var priceLevel = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_price_level' });
                var terms = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_terms' });
                var cardName = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_card_name' });
                var cardDigits = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_card_digits' });
                var cardExpiryMonth = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_card_expiry_m' });
                var cardExpiryYear = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_card_expiry_y' });
                var tokenComponent = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_token_component' });
                var gateway = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_gateway' });
                var date = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_date' });
                var date = dateFormat(date);
                var startDate = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_start_date' });
                var startDate = dateFormat(startDate);
                var po = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_po' });
                var memo = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_memo' });
                var ribbonClass = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_class' });
                var discountPercent = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_discount_percent' });
                // Remove % from Discount
                discountPercent = discountPercent.replace("%", "");
                var shippingBy = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_shipping_by' });
                var shippingBy = dateFormat(shippingBy);
                var soCreated = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_so_craeted' });
                var salesOrderNumber = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_so_no' });

                log.debug("PCT-MonAmi", "Ribbon Project Body Level Details : [ Order Id : " + orderId + ", Buyer Account : " + buyerAccount + ", Buyer Name : " + buyerName + ", Category : " + category + ", Buyer Mail : " + buyerMail +
                    ", Buyer Telephone : " + buyerTelephone + ", Partner : " + partner + ", Price Level : " + priceLevel + ", Terms : " + terms + ", Card Name : " + cardName + ", Card Digits : " + cardDigits +
                    ", Card Expiry Month : " + cardExpiryMonth + ", Card Expiry Year : " + cardExpiryYear + ", Token Component : " + tokenComponent + ", Gateway : " + gateway + ", Date : " + date +
                    ", Start Date : " + startDate + ", PO : " + po + ", Memo : " + memo + ", Ribbon Class : " + ribbonClass + ", Discount Percentage : " + discountPercent + ", Shipping By : " + shippingBy + ", SO Created : " + soCreated + ", Sales Order Number : " + salesOrderNumber
                )

                var buyerObj = {};
                buyerObj["buyerAccount"] = buyerAccount;
                buyerObj["buyerName"] = buyerName;
                buyerObj["buyerMail"] = buyerMail;
                buyerObj["buyerTelephone"] = buyerTelephone;
                buyerObj["terms"] = terms;
                //----------------------------------------------------------------------------------------------------------------------
                // ------------------------------------------------ Get billing Details -----------------------------------------------

                var shippingAttention = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_attention' });
                var shippingCountry = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_country' });
                var shippingAddressee = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_addressee' });
                var shippingPhoneNo = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_phone' });
                var shippingAddress1 = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_address1' });
                var shippingAddress2 = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_address2' });
                var shippingCity = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_city' });
                var shippingState = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_state' });
                var shippingZip = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_sa_zip' });

                log.debug({
                    title: "PCT-MonAmi",
                    details: "Ribbon Project Shipping Details : [ Shipping Attention : " + shippingAttention + ", Shipping Phone No : " + shippingPhoneNo + ", Shipping Country : " + shippingCountry + ", Shipping Addressee : " + shippingAddressee +
                        ", Shipping Address1 : " + shippingAddress1 + ", Shipping Address2 : " + shippingAddress2 + ", Shipping City : " + shippingCity + ", Shipping State : " + shippingState + ", Shipping Zip : " + shippingZip + " ]"
                })

                var shippingObj = {};
                shippingObj["shippingAttention"] = buyerName;
                shippingObj["shippingCountry"] = shippingCountry;
                shippingObj["shippingAddressee"] = shippingAddressee;
                shippingObj["shippingPhoneNo"] = buyerTelephone;
                shippingObj["shippingAddress1"] = shippingAddress1;
                shippingObj["shippingAddress2"] = shippingAddress2;
                shippingObj["shippingState"] = shippingState;
                shippingObj["shippingCity"] = shippingCity;
                shippingObj["shippingState"] = shippingState;
                shippingObj["shippingZip"] = shippingZip;

                //------------------------------------------------------------------------------------------------------------------------
                // ------------------------------------------------ Get Billing Details ---------------------------------------------------

                var billingAttention = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_attention' });
                var billingCountry = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_country' });
                var billingAddressee = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_addressee' });
                var billingPhoneNo = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_phone' });
                var billingAddress1 = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_address1' });
                var billingAddress2 = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_address2' });
                var billingCity = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_city' });
                var billingState = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_state' });
                var billingZip = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_ba_zip' });

                log.debug({
                    title: "PCT-MonAmi",
                    details: "Ribbon Project Billing Details : [ Billing Attention : " + billingAttention + ", Billing Phone No : " + billingPhoneNo + ", Billing Country : " + billingCountry + ", Billing Addressee : " + billingAddressee +
                        ", Billing Address1 : " + billingAddress1 + ", Billing Address2 : " + billingAddress2 + ", Billing City : " + billingCity + ", Billing State : " + billingState + ", Billing Zip : " + billingZip + " ]"
                })

                var billingObj = {};
                billingObj["billingAttention"] = buyerName;
                billingObj["billingCountry"] = billingCountry;
                billingObj["billingAddressee"] = buyerAccount;
                billingObj["billingPhoneNo"] = buyerTelephone;
                billingObj["billingAddress1"] = billingAddress1;
                billingObj["billingAddress2"] = billingAddress2;
                billingObj["billingState"] = billingState;
                billingObj["billingCity"] = billingCity;
                billingObj["billingState"] = billingState;
                billingObj["billingZip"] = billingZip;

                //------------------------------------------------------------------------------------------------------------------------
                // Get Customer Id
                var customerId = createCustomer(buyerObj, shippingObj, billingObj, terms)

                // ---------------------------------------------------- CC Token Part --------------------------------------
                if (!(cardName.length == 0 && cardDigits.length == 0 && cardExpiryMonth.length == 0 && cardExpiryYear.length == 0 && tokenComponent.length == 0))
                {
                    log.debug("PCT-MonAmi", "CC Token Available");
                    var ccTokenId;
                    var customrecord_solupay_cctokenSearchObj = search.create({
                        type: "customrecord_solupay_cctoken",
                        filters:
                            [
                                ["custrecord_solupay_cc_customer", "anyof", customerId],
                                "AND",
                                ["custrecord_solupay_cc_bin", "contains", cardDigits]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),

                            ]
                    });
                    var ccTokenCount = customrecord_solupay_cctokenSearchObj.runPaged().count;
                    // log.debug("PCT-MonAmi", "CC Token Search Result Count : " + ccTokenCount);
                    var ccTokenResult = customrecord_solupay_cctokenSearchObj.run().getRange({ start: 0, end: ccTokenCount });
                    if (ccTokenCount)
                    {
                        log.debug("PCT-MonAmi", "CC Token is Already Present");
                        ccTokenId = ccTokenResult[0].id;
                        log.debug({ title: 'PCT-MonAmi', details: 'Solupay CC Token Id : ' + ccTokenId });
                    }
                    else
                    {
                        log.debug("PCT-MonAmi", "Creating a New CC Token....");
                        var ccTokenName = "RIBBON_" + buyerName + " (*" + cardDigits + ")"  //RIBBON_Diane Johnson (*5799)
                        // Create Solupay CC Token Record 
                        var ccTokenObj = record.create({ type: "customrecord_solupay_cctoken", isDynamic: true });
                        ccTokenObj.setValue({ fieldId: 'name', value: ccTokenName });
                        ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_customer', value: customerId });
                        if (tokenComponent.includes("#"))
                        {
                            var tokenArr = tokenComponent.split("#");
                            ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_token', value: tokenArr[0] });
                        }
                        else
                        {
                            ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_token', value: "No Token is Available" });
                        }
                        var tokenBin = "************" + cardDigits;
                        ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_bin', value: tokenBin });
                        ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_expdate', value: cardExpiryMonth + "/" + cardExpiryYear });
                        if (cardName == "american_express")
                        {
                            ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_cardtype', value: "amex" });
                        }
                        else if (cardName == "master")
                        {
                            ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_cardtype', value: "mastercard" });
                        }
                        else if (cardName == "visa")
                        {
                            ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_cardtype', value: "visa" });
                        }
                        ccTokenObj.setText({ fieldId: 'custrecord_solupay_cc_gateway', text: "Global" });
                        ccTokenObj.setValue({ fieldId: 'custrecord_solupay_cc_default', value: true });

                        ccTokenId = ccTokenObj.save({ ignoreMandatoryFields: true });
                        log.debug({ title: 'PCT-MonAmi', details: 'New Created Solupay CC Token Id : ' + ccTokenId });
                    }


                }
                //------------------------------------------------- Creating Sales Order ------------------------------------------------

                var salesOrderobj = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });

                salesOrderobj.setValue({ fieldId: 'entity', value: customerId });
                salesOrderobj.setValue({ fieldId: 'trandate', value: date });
                salesOrderobj.setValue({ fieldId: 'memo', value: memo });
                salesOrderobj.setValue({ fieldId: 'startdate', value: shippingBy });
                salesOrderobj.setValue({ fieldId: 'orderstatus', value: orderStatus });
                salesOrderobj.setText({ fieldId: 'otherrefnum', text: po });
                salesOrderobj.setText({ fieldId: 'partner', text: orderPartner });
                salesOrderobj.setText({ fieldId: 'class', text: orderClass });
                salesOrderobj.setValue({ fieldId: 'custbody_pct_ma_order_id', value: orderId });
                salesOrderobj.setValue({ fieldId: 'custbody_pct_web_order_number', value: recordId });

                salesOrderobj.setValue({ fieldId: 'shipdate', value: shippingBy });
                if (terms == "net 30 with approval")
                {
                    salesOrderobj.setText({ fieldId: 'terms', text: financialTerms });
                }
                else
                {
                    salesOrderobj.setText({ fieldId: 'terms', text: " " });
                }

                // ------------------------------------------------  Get Item Details of Ribbon Project Record ---------------------------------------------------

                var ribbonItemCount = ribbonOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_ma_ro_item_link' });
                log.debug({ title: 'PCT-MonAmi', details: "Ribbon Order Item Count : " + ribbonItemCount });
                if (ribbonItemCount == 0)
                {
                    ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_error', value: "Error :  No Item is there" });
                }
                else
                {
                    for (item_index = 0; item_index < ribbonItemCount; item_index++)
                    {
                        var ribbonItemId = ribbonOrderLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_ma_ro_item_link',
                            fieldId: 'custrecord_pct_ma_ro_item_child_sku',
                            line: item_index
                        });
                        var ribbonQuantity = ribbonOrderLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_ma_ro_item_link',
                            fieldId: 'custrecord_pct_ma_ro_item_child_quantity',
                            line: item_index
                        });
                        var ribbonItemName = ribbonOrderLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_ma_ro_item_link',
                            fieldId: 'custrecord_pct_ma_ro_item_child_name',
                            line: item_index
                        });
                        var ribbonUpc = ribbonOrderLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_ma_ro_item_link',
                            fieldId: 'custrecord_pct_ma_ro_item_child_upc',
                            line: item_index
                        });
                        log.debug({
                            title: "PCT-MonAmi",
                            details: "Item Details : [ Item Id : " + ribbonItemId + ", Item Quantity : " + ribbonQuantity + ", Item Name : " + ribbonItemName + ", Item Upc : " + ribbonUpc + " ]"
                        })
                        //----------------- Search to Check Item is Present or Not ----------------------
                        var itemInternalId = searchItem(ribbonItemId, ribbonOrderLoad)
                        //-------------------- Item Added in Sales Order ------------------------

                        salesOrderobj.selectNewLine({ sublistId: 'item' });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemInternalId });
                        salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: ribbonQuantity });
                        salesOrderobj.commitLine({ sublistId: 'item' });

                        //------------------------------------------------------------
                    }
                    log.debug({ title: 'PCT-MonAmi', details: "Item Added in Sales Order" });
                    // if (discountPercent && discountPercent != 0)
                    // {
                    //     //-------------------- Discount Item Added in Sales Order ------------------------

                    //     salesOrderobj.selectNewLine({ sublistId: 'item' });
                    //     salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: discountItem });
                    //     salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                    //     salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: -(discountPercent) });
                    //     salesOrderobj.commitLine({ sublistId: 'item' });
                    //     log.debug({ title: 'PCT-MonAmi', details: "Discount Item Added in Sales Order" });
                    // }
                    if (discountPercent && discountPercent != 0)
                    {
                        log.debug("______________________");
                        salesOrderobj.setValue({ fieldId: 'discountitem', value: discountItem });
                        salesOrderobj.setValue({ fieldId: 'discountrate', value: -(discountPercent) });
                    }
                    var value_have = ribbonOrderLoad.getValue({ fieldId: 'custrecord_pct_ma_ro_error' });
                    if (value_have)
                    {
                        log.debug({ title: 'PCT-MonAmi', details: "ERROR" });
                        ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_so_craeted', value: false });
                        // email.send({
                        //     author: -5,
                        //     recipients: [""],
                        //     cc: ["sandipan.paapri@gmail.com"],
                        //     subject: 'MonAmi Sales Order Create Error',
                        //     body: value_have
                        // });
                        // log.debug({ title: 'PCT-MonAmi', details: 'Error Mail Sent' });
                    }
                    else
                    {
                        salesOrderId = salesOrderobj.save({ ignoreMandatoryFields: true });
                        ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_so_no', value: salesOrderId });
                        ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_so_craeted', value: true });
                        ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_error', value: " " });
                        log.debug({ title: 'PCT-MonAmi', details: 'New Created Sales Order Id : ' + salesOrderId });
                    }

                }
            }
        }
        catch (ex)
        {
            log.error({ title: 'PCT-MonAmi-WF-ERROR', details: "In Catch : " + ex });
            ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_error', value: ex.message });
            // ribbonOrderLoad.save();
        }
    }

    // ---------------------------------------------------------------------- All Custom Functions -------------------------------------------------------

    //---------------------------------------------------------------------- Sales Order Search Function Start ---------------------------------------------
    function salesOrderPresent(orderId)
    {
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["custbody_pct_ma_order_id", "is", orderId],
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
        if (soResultCount > 0)
        {
            salesOrderId = soResult[0].id;
        }
        return salesOrderId;
    }
    //---------------------------------------------------------------------- Sales Order Search Function End ---------------------------------------------

    //---------------------------------------------------------------------- Date Format Function Start ---------------------------------------------
    function dateFormat(date)
    {
        log.debug("PCT-MonAmi Date Format Function", "Date : " + date);
        if (date.length)
        {
            var dateArray = date.split(' ');
            var dateArray = dateArray[0].split('-');
            date = dateArray[1] + "/" + dateArray[0] + "/" + dateArray[2];
            return new Date(date);
        }
        else
        {
            return date;
        }

    }
    //---------------------------------------------------------------------- Date Format Function End ---------------------------------------------

    //----------------------------------------------------------------------- Create Customer Function --------------------------------------------------
    function createCustomer(buyerObj, shippingObj, billingObj, terms)
    {
        log.debug({
            title: "PCT-MonAmi Create Customer Function", details: "Buyer Obj : " + JSON.stringify(buyerObj) + ", Shipping Obj : " + JSON.stringify(shippingObj) + ", Billing Obj : " + JSON.stringify(billingObj)
        })
        var customerSearchObj = search.create({
            type: "customer",
            filters:
                [
                    ["stage", "anyof", "CUSTOMER"],
                    "AND",
                    ["entityid", "is", buyerObj.buyerAccount],
                    "OR",
                    ["entityid", "is", buyerObj.buyerName],
                    "AND",
                    ["email", "is", buyerObj.buyerMail],

                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var customerCount = customerSearchObj.runPaged().count;
        log.debug("PCT-MonAmi Create Customer Function", "Customer Count : " + customerCount);
        var customerResult = customerSearchObj.run().getRange({ start: 0, end: customerCount });
        if (customerCount > 0)
        {
            log.debug({ title: "PCT-MonAmi Create Customer Function", details: "Customer " + buyerObj.buyerName + " is Already Present " })
            for (customer_index = 0; customer_index < customerCount; customer_index++)
            {
                var customerId = customerResult[customer_index].id;
                // log.debug({ title: "PCT-MonAmi Create Customer Function", details: "Customer Id : " + customerId })
            }
            var customer = record.load({
                type: record.Type.CUSTOMER,
                id: customerId,
                isDynamic: true
            });
            var addressCount = customer.getLineCount('addressbook');
            log.debug({ title: "PCT-MonAmi Compare Address Function", details: "Total Address Line : " + addressCount })
            if (addressCount)
            {
                compareAddress(customer, addressCount, shippingObj, billingObj);

            }
            else
            {
                addShipping(customer, shippingObj);
                addBilling(customer, billingObj);

            }

            customerId = customer.save();
            log.debug({ title: "PCT-MonAmi Create Customer Function", details: "Saved Customer Id : " + customerId })
            return customerId;

        }
        else
        {
            log.debug({ title: "PCT-MonAmi Create Customer Function", details: "Creating a Customer....." })
            var customer = record.create({
                type: record.Type.CUSTOMER,
                isDynamic: true
            });
            if (buyerObj.buyerAccount.length == 0)
            {
                customer.setValue({ fieldId: 'isperson', value: "T" });
                var customerArr = buyerObj.buyerName.split(" ");
                var firstName = "";
                if (customerArr.length == 1) { firstName = customerArr[0]; }
                var lastName = customerArr[customerArr.length - 1];
                for (index = 0; index < customerArr.length - 1; index++)
                {
                    firstName = firstName + " " + customerArr[index];
                }
                customer.setValue({ fieldId: 'firstname', value: firstName });
                customer.setValue({ fieldId: 'lastname', value: lastName });
            }
            else
            {

                customer.setValue({ fieldId: 'isperson', value: "F" });
                customer.setValue({ fieldId: 'companyname', value: buyerObj.buyerAccount });
            }
            customer.setText({ fieldId: 'email', text: buyerObj.buyerMail });
            customer.setText({ fieldId: 'phone', text: buyerObj.buyerTelephone });
            customer.setText({ fieldId: 'category', text: financialCategory });
            customer.setText({ fieldId: 'partner', text: financialPartner });
            customer.setText({ fieldId: 'pricelevel', text: financialPriceLevel });

            addShipping(customer, shippingObj);
            addBilling(customer, billingObj);


            if (terms.toLowerCase() == "net 30 with approval")
            {
                customer.setText({ fieldId: 'terms', text: financialTerms });
            }
            customerId = customer.save();
            log.debug({ title: "PCT-MonAmi Create Customer Function", details: "New Customer Created & Customer Id " + customerId })
            return customerId;
        }
    }
    //----------------------------------------------------------------------- Customer Function End -----------------------------------------------------------

    //----------------------------------------------------------------------- Compare Address Function Start ------------------------------------------------

    function compareAddress(customer, addressCount, shippingObj, billingObj)
    {
        var shipCount = billCount = 0;
        for (var addressIndex = addressCount - 1; addressIndex >= 0; addressIndex--)
        {
            customer.selectLine({ sublistId: 'addressbook', line: addressIndex });
            var addressId = customer.getCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'addressid' });
            // var addressDefaultBilling = customer.getCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling' });
            // var addressDefaultShipping = customer.getCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping' });
            var addressSubrecord = customer.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
            });
            var customerAddress = addressSubrecord.getValue('addrtext');
            log.debug({
                title: "PCT-MonAmi Compare Address Function", details: "Address Id : " + addressId + ", Customer Address: [ " + customerAddress + " ]"
            })
            var shippingAddress = shippingObj.shippingAttention + " " + shippingObj.shippingAddress1 + " " + shippingObj.shippingAddress2 + " " + shippingObj.shippingCity + " " + shippingObj.shippingState + " " + shippingObj.shippingZip + " United States";
            var billingAddress = billingObj.billingAttention + " " + billingObj.billingAddress1 + " " + billingObj.billingAddress2 + " " + billingObj.billingCity + " " + billingObj.billingState + " " + billingObj.billingZip + " United States";


            // Compare For Shipping Address 
            if ((customerAddress.replace(/\s/g, "")) === (shippingAddress.replace(/\s/g, "")) && shipCount == 0)
            {
                log.debug("PCT-MonAmi Compare Address Function", "Shipping Address Matched");
                log.debug("PCT-MonAmi Compare Address Function", "Customer Address: [ " + customerAddress + " ] Ribbon Shipping Address : [ " + shippingAddress + " ]");
                log.debug("PCT-MonAmi Compare Address Function", "Customer Address Withoit Space: [ " + customerAddress.replace(/\s/g, "") + " ] Ribbon Shipping Address : [ " + shippingAddress.replace(/\s/g, "") + " ]");
                customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: true });
                customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: false });
                customer.commitLine({ sublistId: 'addressbook' });
                shipCount++;

            }
            // Compare For Billing Address 
            else if ((customerAddress.replace(/\s/g, "")) === (billingAddress.replace(/\s/g, "")) && billCount == 0)
            {
                log.debug("PCT-MonAmi Compare Address Function", "Billing Address Matched");
                log.debug("PCT-MonAmi Compare Address Function", "Customer Address: [ " + customerAddress + " ] Ribbon Billing Address : [ " + billingAddress + " ]");
                customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: true });
                customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: false });
                customer.commitLine({ sublistId: 'addressbook' });
                billCount++;
            }
            else
            {
                customer.removeLine({
                    sublistId: 'addressbook',
                    line: addressIndex,
                    ignoreRecalc: true
                });
                log.debug('PCT-MonAmi Compare Address Function', 'Address ' + addressId + ' has been removed.');
            }


        }
        // If Shipping Address not Updated, Add Shipping Address
        if (!shipCount)
        {
            addShipping(customer, shippingObj);
            log.debug("PCT-MonAmi Compare Address Function", "Shipping Address Updated( Added )");

        }
        // If Billing Address not Updated, Add Shipping Address
        if (!billCount)
        {
            addBilling(customer, billingObj);
            log.debug("PCT-MonAmi Compare Address Function", "Billing Address Updated( Added )");
        }
        // customer.save();
    }
    //----------------------------------------------------------------------- Compare Address Function End ------------------------------------------------

    //----------------------------------------------------------------------- Add Shipping Function Start ------------------------------------------------
    function addShipping(customer, shippingObj)
    {
        log.debug({ title: "PCT-MonAmi Add Shipping Function", details: "In Add Shipping Function" })
        //------------- Add Shipping Details --------------------

        customer.selectNewLine({ sublistId: 'addressbook' });
        var addressSubrecord = customer.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
        });
        addressSubrecord.setText({ fieldId: 'country', value: shippingObj.shippingCountry });
        addressSubrecord.setValue({ fieldId: 'attention', value: shippingObj.shippingAttention });
        addressSubrecord.setValue({ fieldId: 'addressee', value: shippingObj.shippingAddressee });
        addressSubrecord.setValue({ fieldId: 'addrphone', value: shippingObj.shippingPhoneNo });
        addressSubrecord.setValue({ fieldId: 'addr1', value: shippingObj.shippingAddress1 });
        addressSubrecord.setValue({ fieldId: 'addr2', value: shippingObj.shippingAddress2 });
        addressSubrecord.setValue({ fieldId: 'city', value: shippingObj.shippingCity });
        addressSubrecord.setText({ fieldId: 'state', text: shippingObj.shippingState });
        addressSubrecord.setValue({ fieldId: 'zip', value: shippingObj.shippingZip });
        customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: true });
        customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: false });
        customer.commitLine({ sublistId: 'addressbook' });
        log.debug({ title: "PCT-MonAmi Add Shipping Function", details: "Shipping Address Added" })
    }
    //----------------------------------------------------------------------- Add Billing Function End ------------------------------------------------

    //----------------------------------------------------------------------- Add Billing Function Start ------------------------------------------------
    function addBilling(customer, billingObj)
    {
        log.debug({ title: "PCT-MonAmi Add Billing Function", details: "In Add Billing Function" })
        //------------- Add Billing Details --------------------

        customer.selectNewLine({ sublistId: 'addressbook' });
        var addressSubrecord = customer.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
        });
        addressSubrecord.setText({ fieldId: 'country', value: billingObj.billingCountry });
        addressSubrecord.setValue({ fieldId: 'attention', value: billingObj.billingAttention });
        addressSubrecord.setValue({ fieldId: 'addressee', value: billingObj.billingAddressee });
        addressSubrecord.setValue({ fieldId: 'addrphone', value: billingObj.billingPhoneNo });
        addressSubrecord.setValue({ fieldId: 'addr1', value: billingObj.billingAddress1 });
        addressSubrecord.setValue({ fieldId: 'addr2', value: billingObj.billingAddress2 });
        addressSubrecord.setValue({ fieldId: 'city', value: billingObj.billingCity });
        addressSubrecord.setText({ fieldId: 'text', value: billingObj.billingState });
        addressSubrecord.setValue({ fieldId: 'zip', value: billingObj.billingZip });
        customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: true });
        customer.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: false });
        customer.commitLine({ sublistId: 'addressbook' });
        log.debug({ title: "PCT-MonAmi Add Shipping Function", details: "Billing Address Added" })
    }
    //----------------------------------------------------------------------- Add Billing Function End ------------------------------------------------

    //----------------------------------------------------------------------- Item Function Start -----------------------------------------------------------
    function searchItem(ribbonItemId, ribbonOrderLoad)
    {
        log.debug({
            title: "PCT-MonAmi Item Function",
            details: "Item Name : " + ribbonItemId
        })
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["name", "is", ribbonItemId],
                ],
            columns:
                [
                    search.createColumn({ name: "type", label: "Type" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        var itemResult = itemSearchObj.run().getRange({ start: 0, end: itemCount });
        if (itemCount > 0)
        {
            var itemId = itemResult[0].id;
            log.debug({ title: "PCT-MonAmi Item Function", details: "Item " + ribbonItemId + " is Already Present & Present Item Id : " + itemId });
            return itemId;
        }
        else
        {
            log.debug({ title: "PCT-MonAmi Item Function ", details: "Item " + ribbonItemId + " is Not Present" });
            ribbonOrderLoad.setValue({ fieldId: 'custrecord_pct_ma_ro_error', value: "Error : Item " + ribbonItemId + " is not Present In System" });
            return 0;
        }
    }
    //-------------------------------------------------------------------- Item Function End -----------------------------------------------------------

    //----------------------------------------------------------------------- Country Function ----------------------------------------------------------------

    // function getCountry()
    // {
    //     return [
    //         { 'ccode': 'AF', 'cname': 'Afghanistan' },
    //         { 'ccode': 'AX', 'cname': 'Aland Islands' },
    //         { 'ccode': 'AL', 'cname': 'Albania' },
    //         { 'ccode': 'DZ', 'cname': 'Algeria' },
    //         { 'ccode': 'AS', 'cname': 'American Samoa' },
    //         { 'ccode': 'AD', 'cname': 'Andorra' },
    //         { 'ccode': 'AO', 'cname': 'Angola' },
    //         { 'ccode': 'AI', 'cname': 'Anguilla' },
    //         { 'ccode': 'AQ', 'cname': 'Antarctica' },
    //         { 'ccode': 'AG', 'cname': 'Antigua And Barbuda' },
    //         { 'ccode': 'AR', 'cname': 'Argentina' },
    //         { 'ccode': 'AM', 'cname': 'Armenia' },
    //         { 'ccode': 'AW', 'cname': 'Aruba' },
    //         { 'ccode': 'AU', 'cname': 'Australia' },
    //         { 'ccode': 'AT', 'cname': 'Austria' },
    //         { 'ccode': 'AZ', 'cname': 'Azerbaijan' },
    //         { 'ccode': 'BS', 'cname': 'Bahamas' },
    //         { 'ccode': 'BH', 'cname': 'Bahrain' },
    //         { 'ccode': 'BD', 'cname': 'Bangladesh' },
    //         { 'ccode': 'BB', 'cname': 'Barbados' },
    //         { 'ccode': 'BY', 'cname': 'Belarus' },
    //         { 'ccode': 'BE', 'cname': 'Belgium' },
    //         { 'ccode': 'BZ', 'cname': 'Belize' },
    //         { 'ccode': 'BJ', 'cname': 'Benin' },
    //         { 'ccode': 'BM', 'cname': 'Bermuda' },
    //         { 'ccode': 'BT', 'cname': 'Bhutan' },
    //         { 'ccode': 'BO', 'cname': 'Bolivia' },
    //         { 'ccode': 'BA', 'cname': 'Bosnia And Herzegovina' },
    //         { 'ccode': 'BW', 'cname': 'Botswana' },
    //         { 'ccode': 'BV', 'cname': 'Bouvet Island' },
    //         { 'ccode': 'BR', 'cname': 'Brazil' },
    //         { 'ccode': 'IO', 'cname': 'British Indian Ocean Territory' },
    //         { 'ccode': 'BN', 'cname': 'Brunei Darussalam' },
    //         { 'ccode': 'BG', 'cname': 'Bulgaria' },
    //         { 'ccode': 'BF', 'cname': 'Burkina Faso' },
    //         { 'ccode': 'BI', 'cname': 'Burundi' },
    //         { 'ccode': 'KH', 'cname': 'Cambodia' },
    //         { 'ccode': 'CM', 'cname': 'Cameroon' },
    //         { 'ccode': 'CA', 'cname': 'Canada' },
    //         { 'ccode': 'CV', 'cname': 'Cape Verde' },
    //         { 'ccode': 'KY', 'cname': 'Cayman Islands' },
    //         { 'ccode': 'CF', 'cname': 'Central African Republic' },
    //         { 'ccode': 'TD', 'cname': 'Chad' },
    //         { 'ccode': 'CL', 'cname': 'Chile' },
    //         { 'ccode': 'CN', 'cname': 'China' },
    //         { 'ccode': 'CX', 'cname': 'Christmas Island' },
    //         { 'ccode': 'CC', 'cname': 'Cocos (Keeling) Islands' },
    //         { 'ccode': 'CO', 'cname': 'Colombia' },
    //         { 'ccode': 'KM', 'cname': 'Comoros' },
    //         { 'ccode': 'CG', 'cname': 'Congo' },
    //         { 'ccode': 'CD', 'cname': 'Congo, Democratic Republic' },
    //         { 'ccode': 'CK', 'cname': 'Cook Islands' },
    //         { 'ccode': 'CR', 'cname': 'Costa Rica' },
    //         { 'ccode': 'CI', 'cname': 'Cote D\'Ivoire' },
    //         { 'ccode': 'HR', 'cname': 'Croatia' },
    //         { 'ccode': 'HR', 'cname': 'Croatia/Hrvatska' },
    //         { 'ccode': 'CU', 'cname': 'Cuba' },
    //         { 'ccode': 'CY', 'cname': 'Cyprus' },
    //         { 'ccode': 'CZ', 'cname': 'Czech Republic' },
    //         { 'ccode': 'DK', 'cname': 'Denmark' },
    //         { 'ccode': 'DJ', 'cname': 'Djibouti' },
    //         { 'ccode': 'DM', 'cname': 'Dominica' },
    //         { 'ccode': 'DO', 'cname': 'Dominican Republic' },
    //         { 'ccode': 'EC', 'cname': 'Ecuador' },
    //         { 'ccode': 'EG', 'cname': 'Egypt' },
    //         { 'ccode': 'SV', 'cname': 'El Salvador' },
    //         { 'ccode': 'GQ', 'cname': 'Equatorial Guinea' },
    //         { 'ccode': 'ER', 'cname': 'Eritrea' },
    //         { 'ccode': 'EE', 'cname': 'Estonia' },
    //         { 'ccode': 'ET', 'cname': 'Ethiopia' },
    //         { 'ccode': 'FK', 'cname': 'Falkland Islands (Malvinas)' },
    //         { 'ccode': 'FO', 'cname': 'Faroe Islands' },
    //         { 'ccode': 'FJ', 'cname': 'Fiji' },
    //         { 'ccode': 'FI', 'cname': 'Finland' },
    //         { 'ccode': 'FR', 'cname': 'France' },
    //         { 'ccode': 'GF', 'cname': 'French Guiana' },
    //         { 'ccode': 'PF', 'cname': 'French Polynesia' },
    //         { 'ccode': 'TF', 'cname': 'French Southern Territories' },
    //         { 'ccode': 'GA', 'cname': 'Gabon' },
    //         { 'ccode': 'GM', 'cname': 'Gambia' },
    //         { 'ccode': 'GE', 'cname': 'Georgia' },
    //         { 'ccode': 'DE', 'cname': 'Germany' },
    //         { 'ccode': 'AT', 'cname': 'Austria' },
    //         { 'ccode': 'GH', 'cname': 'Ghana' },
    //         { 'ccode': 'GI', 'cname': 'Gibraltar' },
    //         { 'ccode': 'GR', 'cname': 'Greece' },
    //         { 'ccode': 'GL', 'cname': 'Greenland' },
    //         { 'ccode': 'GD', 'cname': 'Grenada' },
    //         { 'ccode': 'GP', 'cname': 'Guadeloupe' },
    //         { 'ccode': 'GU', 'cname': 'Guam' },
    //         { 'ccode': 'GT', 'cname': 'Guatemala' },
    //         { 'ccode': 'GG', 'cname': 'Guernsey' },
    //         { 'ccode': 'GN', 'cname': 'Guinea' },
    //         { 'ccode': 'GW', 'cname': 'Guinea-Bissau' },
    //         { 'ccode': 'GY', 'cname': 'Guyana' },
    //         { 'ccode': 'HT', 'cname': 'Haiti' },
    //         { 'ccode': 'HM', 'cname': 'Heard Island & Mcdonald Islands' },
    //         { 'ccode': 'VA', 'cname': 'Holy See (Vatican City State)' },
    //         { 'ccode': 'HN', 'cname': 'Honduras' },
    //         { 'ccode': 'HK', 'cname': 'Hong Kong' },
    //         { 'ccode': 'HU', 'cname': 'Hungary' },
    //         { 'ccode': 'IS', 'cname': 'Iceland' },
    //         { 'ccode': 'IN', 'cname': 'India' },
    //         { 'ccode': 'ID', 'cname': 'Indonesia' },
    //         { 'ccode': 'IR', 'cname': 'Iran, Islamic Republic Of' },
    //         { 'ccode': 'IQ', 'cname': 'Iraq' },
    //         { 'ccode': 'IE', 'cname': 'Ireland' },
    //         { 'ccode': 'IM', 'cname': 'Isle Of Man' },
    //         { 'ccode': 'IL', 'cname': 'Israel' },
    //         { 'ccode': 'IT', 'cname': 'Italy' },
    //         { 'ccode': 'JM', 'cname': 'Jamaica' },
    //         { 'ccode': 'JP', 'cname': 'Japan' },
    //         { 'ccode': 'JE', 'cname': 'Jersey' },
    //         { 'ccode': 'JO', 'cname': 'Jordan' },
    //         { 'ccode': 'KZ', 'cname': 'Kazakhstan' },
    //         { 'ccode': 'KE', 'cname': 'Kenya' },
    //         { 'ccode': 'KI', 'cname': 'Kiribati' },
    //         { 'ccode': 'KR', 'cname': 'Korea' },
    //         { 'ccode': 'KW', 'cname': 'Kuwait' },
    //         { 'ccode': 'KG', 'cname': 'Kyrgyzstan' },
    //         { 'ccode': 'LA', 'cname': 'Lao People\'s Democratic Republic' },
    //         { 'ccode': 'LV', 'cname': 'Latvia' },
    //         { 'ccode': 'LB', 'cname': 'Lebanon' },
    //         { 'ccode': 'LS', 'cname': 'Lesotho' },
    //         { 'ccode': 'LR', 'cname': 'Liberia' },
    //         { 'ccode': 'LY', 'cname': 'Libyan Arab Jamahiriya' },
    //         { 'ccode': 'LI', 'cname': 'Liechtenstein' },
    //         { 'ccode': 'LT', 'cname': 'Lithuania' },
    //         { 'ccode': 'LU', 'cname': 'Luxembourg' },
    //         { 'ccode': 'MO', 'cname': 'Macao' },
    //         { 'ccode': 'MK', 'cname': 'Macedonia' },
    //         { 'ccode': 'MG', 'cname': 'Madagascar' },
    //         { 'ccode': 'MW', 'cname': 'Malawi' },
    //         { 'ccode': 'MY', 'cname': 'Malaysia' },
    //         { 'ccode': 'MV', 'cname': 'Maldives' },
    //         { 'ccode': 'ML', 'cname': 'Mali' },
    //         { 'ccode': 'MT', 'cname': 'Malta' },
    //         { 'ccode': 'MH', 'cname': 'Marshall Islands' },
    //         { 'ccode': 'MQ', 'cname': 'Martinique' },
    //         { 'ccode': 'MR', 'cname': 'Mauritania' },
    //         { 'ccode': 'MU', 'cname': 'Mauritius' },
    //         { 'ccode': 'YT', 'cname': 'Mayotte' },
    //         { 'ccode': 'MX', 'cname': 'Mexico' },
    //         { 'ccode': 'FM', 'cname': 'Micronesia, Federated States Of' },
    //         { 'ccode': 'MD', 'cname': 'Moldova' },
    //         { 'ccode': 'MC', 'cname': 'Monaco' },
    //         { 'ccode': 'MN', 'cname': 'Mongolia' },
    //         { 'ccode': 'ME', 'cname': 'Montenegro' },
    //         { 'ccode': 'MS', 'cname': 'Montserrat' },
    //         { 'ccode': 'MA', 'cname': 'Morocco' },
    //         { 'ccode': 'MZ', 'cname': 'Mozambique' },
    //         { 'ccode': 'MM', 'cname': 'Myanmar' },
    //         { 'ccode': 'NA', 'cname': 'Namibia' },
    //         { 'ccode': 'NR', 'cname': 'Nauru' },
    //         { 'ccode': 'NP', 'cname': 'Nepal' },
    //         { 'ccode': 'NL', 'cname': 'Netherlands' },
    //         { 'ccode': 'AN', 'cname': 'Netherlands Antilles' },
    //         { 'ccode': 'NC', 'cname': 'New Caledonia' },
    //         { 'ccode': 'NZ', 'cname': 'New Zealand' },
    //         { 'ccode': 'NI', 'cname': 'Nicaragua' },
    //         { 'ccode': 'NE', 'cname': 'Niger' },
    //         { 'ccode': 'NG', 'cname': 'Nigeria' },
    //         { 'ccode': 'NU', 'cname': 'Niue' },
    //         { 'ccode': 'NF', 'cname': 'Norfolk Island' },
    //         { 'ccode': 'MP', 'cname': 'Northern Mariana Islands' },
    //         { 'ccode': 'NO', 'cname': 'Norway' },
    //         { 'ccode': 'OM', 'cname': 'Oman' },
    //         { 'ccode': 'PK', 'cname': 'Pakistan' },
    //         { 'ccode': 'PW', 'cname': 'Palau' },
    //         { 'ccode': 'PS', 'cname': 'Palestinian Territory, Occupied' },
    //         { 'ccode': 'PA', 'cname': 'Panama' },
    //         { 'ccode': 'PG', 'cname': 'Papua New Guinea' },
    //         { 'ccode': 'PY', 'cname': 'Paraguay' },
    //         { 'ccode': 'PE', 'cname': 'Peru' },
    //         { 'ccode': 'PH', 'cname': 'Philippines' },
    //         { 'ccode': 'PN', 'cname': 'Pitcairn' },
    //         { 'ccode': 'PL', 'cname': 'Poland' },
    //         { 'ccode': 'PT', 'cname': 'Portugal' },
    //         { 'ccode': 'PR', 'cname': 'Puerto Rico' },
    //         { 'ccode': 'QA', 'cname': 'Qatar' },
    //         { 'ccode': 'RE', 'cname': 'Reunion' },
    //         { 'ccode': 'RO', 'cname': 'Romania' },
    //         { 'ccode': 'RU', 'cname': 'Russian Federation' },
    //         { 'ccode': 'RW', 'cname': 'Rwanda' },
    //         { 'ccode': 'BL', 'cname': 'Saint Barthelemy' },
    //         { 'ccode': 'SH', 'cname': 'Saint Helena' },
    //         { 'ccode': 'KN', 'cname': 'Saint Kitts And Nevis' },
    //         { 'ccode': 'LC', 'cname': 'Saint Lucia' },
    //         { 'ccode': 'MF', 'cname': 'Saint Martin' },
    //         { 'ccode': 'PM', 'cname': 'Saint Pierre And Miquelon' },
    //         { 'ccode': 'VC', 'cname': 'Saint Vincent And Grenadines' },
    //         { 'ccode': 'WS', 'cname': 'Samoa' },
    //         { 'ccode': 'SM', 'cname': 'San Marino' },
    //         { 'ccode': 'ST', 'cname': 'Sao Tome And Principe' },
    //         { 'ccode': 'SA', 'cname': 'Saudi Arabia' },
    //         { 'ccode': 'SN', 'cname': 'Senegal' },
    //         { 'ccode': 'RS', 'cname': 'Serbia' },
    //         { 'ccode': 'SC', 'cname': 'Seychelles' },
    //         { 'ccode': 'SL', 'cname': 'Sierra Leone' },
    //         { 'ccode': 'SG', 'cname': 'Singapore' },
    //         { 'ccode': 'SK', 'cname': 'Slovakia' },
    //         { 'ccode': 'SI', 'cname': 'Slovenia' },
    //         { 'ccode': 'SB', 'cname': 'Solomon Islands' },
    //         { 'ccode': 'SO', 'cname': 'Somalia' },
    //         { 'ccode': 'ZA', 'cname': 'South Africa' },
    //         { 'ccode': 'GS', 'cname': 'South Georgia And Sandwich Isl.' },
    //         { 'ccode': 'ES', 'cname': 'Spain' },
    //         { 'ccode': 'LK', 'cname': 'Sri Lanka' },
    //         { 'ccode': 'SD', 'cname': 'Sudan' },
    //         { 'ccode': 'SR', 'cname': 'Suriname' },
    //         { 'ccode': 'SJ', 'cname': 'Svalbard And Jan Mayen' },
    //         { 'ccode': 'SZ', 'cname': 'Swaziland' },
    //         { 'ccode': 'SE', 'cname': 'Sweden' },
    //         { 'ccode': 'CH', 'cname': 'Switzerland' },
    //         { 'ccode': 'SY', 'cname': 'Syrian Arab Republic' },
    //         { 'ccode': 'TW', 'cname': 'Taiwan' },
    //         { 'ccode': 'TJ', 'cname': 'Tajikistan' },
    //         { 'ccode': 'TZ', 'cname': 'Tanzania' },
    //         { 'ccode': 'TH', 'cname': 'Thailand' },
    //         { 'ccode': 'TL', 'cname': 'Timor-Leste' },
    //         { 'ccode': 'TG', 'cname': 'Togo' },
    //         { 'ccode': 'TK', 'cname': 'Tokelau' },
    //         { 'ccode': 'TO', 'cname': 'Tonga' },
    //         { 'ccode': 'TT', 'cname': 'Trinidad And Tobago' },
    //         { 'ccode': 'TN', 'cname': 'Tunisia' },
    //         { 'ccode': 'TR', 'cname': 'Turkey' },
    //         { 'ccode': 'TM', 'cname': 'Turkmenistan' },
    //         { 'ccode': 'TC', 'cname': 'Turks And Caicos Islands' },
    //         { 'ccode': 'TV', 'cname': 'Tuvalu' },
    //         { 'ccode': 'UG', 'cname': 'Uganda' },
    //         { 'ccode': 'UA', 'cname': 'Ukraine' },
    //         { 'ccode': 'AE', 'cname': 'United Arab Emirates' },
    //         { 'ccode': 'GB', 'cname': 'United Kingdom' },
    //         { 'ccode': 'GB', 'cname': 'Great Britain' },
    //         { 'ccode': 'US', 'cname': 'United States' },
    //         { 'ccode': 'UM', 'cname': 'United States Outlying Islands' },
    //         { 'ccode': 'UY', 'cname': 'Uruguay' },
    //         { 'ccode': 'UZ', 'cname': 'Uzbekistan' },
    //         { 'ccode': 'VU', 'cname': 'Vanuatu' },
    //         { 'ccode': 'VE', 'cname': 'Venezuela' },
    //         { 'ccode': 'VN', 'cname': 'Viet Nam' },
    //         { 'ccode': 'VG', 'cname': 'Virgin Islands, British' },
    //         { 'ccode': 'VI', 'cname': 'Virgin Islands, U.S.' },
    //         { 'ccode': 'WF', 'cname': 'Wallis And Futuna' },
    //         { 'ccode': 'EH', 'cname': 'Western Sahara' },
    //         { 'ccode': 'YE', 'cname': 'Yemen' },
    //         { 'ccode': 'ZM', 'cname': 'Zambia' },
    //         { 'ccode': 'ZW', 'cname': 'Zimbabwe' }
    //     ];

    //     // var allCountries = getCountry();

    //     // var shippingCountryObj = allCountries.find(ele => ele.cname === "Afghanistan")
    //     // //console.log("Country : " + JSON.stringify(shippingCountryObj))
    //     //   console.log("Country : " + shippingCountryObj.ccode)

    // }
    //----------------------------------------------------------------------- Country Function End --------------------------------------------------

    return {
        onAction: onAction
    }
});
