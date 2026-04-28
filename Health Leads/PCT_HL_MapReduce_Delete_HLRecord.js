/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.00          30 March 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        PCT_HL_MapReduce_Delete_HLRecord
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das    
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will delete records from HL Web Order and store those records in file cabinet as a json format.

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                Developer:

getInputData()							Get Old Date (7days back from today) and perform a search to find hl web order id			   		Sandipan Sau
map()                                   All the operation like Create json request (HL_record_array) and push json into file cabinet        Sandipan Sau
                                            and delete those records which already pushed into file cabinet


/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{
    var HL_record_array = new Array();

    function getInputData()
    {
        log.debug({
            title: "PCT-HL_Get Input",
            details: "In Get Input Function"
        })
        var current_date = new Date();
        log.debug({
            title: 'PCT-HL-Old Date',
            details: 'current_date' + current_date
        })
        current_date.setDate(current_date.getDate() - 30); //Will Delete Order 30 Days Ago
        var dd = current_date.getDate();
        var mm = current_date.getMonth() + 1;
        var yyyy = current_date.getFullYear();
        var old_date = mm + "/" + dd + "/" + yyyy;
        log.debug({
            title: 'PCT-HL-Old Date',
            details: 'Old Date' + old_date
        })

        Hl_id_filter = new Array();
        // Hl_id_filter.push(search.createFilter({ name: 'custrecord_pct_sales_order_created', operator: search.Operator.IS, values: 'T', }));
        Hl_id_filter.push(search.createFilter({ name: 'created', operator: search.Operator.ON, values: "21/04/2021 11:59 pm" }));
        var customrecord_pct_hl_web_orderSearchObj = search.create({
            type: "customrecord_pct_hl_web_order",
            filters: Hl_id_filter,
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var HL_id_ResultCount = customrecord_pct_hl_web_orderSearchObj.runPaged().count;
        log.debug("PCT-HL", "HL ID ResultCount :" + HL_id_ResultCount);
        var HL_id_Result = customrecord_pct_hl_web_orderSearchObj.run().getRange({ start: 0, end: HL_id_ResultCount });

        var id_array = new Array();
        for (var getid_index = 0; getid_index < HL_id_ResultCount; getid_index++)
        {
            var record_id = HL_id_Result[getid_index].id;
            // log.debug({
            //     title: "PCT-HL-Record ID",
            //     details: "Id" + record_id
            // })
            id_array.push(record_id);
        }
        log.debug({
            title: "PCT-HL",
            details: "HL Item Store Array Length : " + id_array.length + " & HL Item Store Array : [ " + id_array + "]"
        })
        return id_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        log.debug({ title: "PCT-HL_MAP-Context", details: "Context " + context.value })
        try
        {
            var id = context.value;
            var HL_WO_id = record.load({
                type: 'customrecord_pct_hl_web_order',
                id: id
            });
            // log.debug({ title: "PCT-HL_Map_WO_id", details: "HL_WO_id " + id })
            log.debug({ title: "PCT-HL_Map_WO_id Load", details: "HL_WO_id " + HL_WO_id })

            //----------------------------------------------- BODY FIELD --------------------------------------------------

            var HL_customer_name = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_customer_name' });
            var HL_netsuite_customer_name = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_netsuite_customer' });
            var HL_customer_error = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_customer_error' });
            var HL_customer_email = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_customer_email' });
            var HL_customer_phnno = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_customer_phone_number' });
            var HL_netsuite_customer_email_address = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_netsuite_email_address' });
            var HL_customer_abs_cid = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_customer_abs_cid' });
            var HL_customer_so_number = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_sales_order_number' });
            var HL_netsuite_customer_shipping_meth = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_netsuite_shipping_meth' });
            var HL_payment_method = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_payment_method' });
            var HL_netsuite_payment_term = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_netsuite_payment_term' });
            var HL_payment_error = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_payment_error' });
            var HL_category_name = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_category_name' });
            var HL_netsuite_category_name = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_netsuite_category_name' });
            var HL_order_date = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_order_date' });
            var HL_weborder_source = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_weborder_source' });
            var HL_service_id = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_service_id' });
            var HL_sales_order_created = HL_WO_id.getValue({ fieldId: 'custrecord_pct_sales_order_created' });
            var HL_sales_order_name = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_created_transaction' });
            var HL_total_discount = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_adjustment_discount' });
            var HL_subtotal = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_sub_total' });

            var service_record_load = record.load({
                type: 'customrecord_pct_hl_service_call_history',
                id: HL_service_id
            });
            var HL_service_name = service_record_load.getText({ fieldId: 'name' });
            var HL_service_length = service_record_load.getText({ fieldId: 'custrecord_pct_hl_service_data_length' });
            log.debug({
                title: "PCT-HL-Service Name",
                details: "Service Name :" + HL_service_name + " Service Length : " + HL_service_length
            })
            log.debug({
                title: 'PCT-FS-Body',
                details: 'HL-Web Order Body Data:(Customer Name:' + HL_customer_name + ',Netsuite_customer_name:' + HL_netsuite_customer_name + ',Customer_Error :' + HL_customer_error + ',Customer_email:' + HL_customer_email + ',Customer_phnno:' + HL_customer_phnno + ',Netsuite_Customer_Email_Address' + HL_netsuite_customer_email_address + ',Netsuite_Customer_Email_Address' + HL_customer_abs_cid + ',Customer Sales Order number' + HL_customer_so_number + ',Customer Shipping Method' + HL_netsuite_customer_shipping_meth + ',Payment Method' + HL_payment_method + ',Netsuite Payment Term' + HL_netsuite_payment_term + ',Payment Eror' + HL_payment_error + ',Category Name' + HL_category_name + ',Netsuite Category Name' + HL_netsuite_category_name + ',Order Date' + HL_order_date + ',Web Order Source' + HL_weborder_source + ', Service Id' + HL_service_id + ', Sales Order Created' + HL_sales_order_created + ", Created Sales Order Name " + HL_sales_order_name + ", Total Discount" + HL_total_discount + ", Subtotal " + HL_subtotal + ')'
            });

            //------------------------------------------------- Create Json Obj for Body Field----------------------------------------------------
            var HL_record_obj = new Object();

            HL_record_obj['Customer_Name'] = HL_customer_name;
            HL_record_obj['Netsuite_Customer_Name'] = HL_netsuite_customer_name;
            HL_record_obj['Customer_Error'] = HL_customer_error;
            HL_record_obj['Customer_Email'] = HL_customer_email;
            HL_record_obj['Customer_Phnno'] = HL_customer_phnno;
            HL_record_obj['Netsuite_Customer_Email'] = HL_netsuite_customer_email_address;
            HL_record_obj['Customer_abs_cid'] = HL_customer_abs_cid;
            HL_record_obj['Netsuite_Customer_SO_Number'] = HL_customer_so_number;
            HL_record_obj['Customer_Shipping_Method'] = HL_netsuite_customer_shipping_meth;
            HL_record_obj['HL_Payment_Method'] = HL_payment_method;
            HL_record_obj['Netsuite_Payment_Term'] = HL_netsuite_payment_term;
            HL_record_obj['Payment_Error'] = HL_payment_error;
            HL_record_obj['Category_Name'] = HL_category_name;
            HL_record_obj['Netsuite_Category_Name'] = HL_netsuite_category_name;
            HL_record_obj['Order_Date'] = HL_order_date;
            HL_record_obj['Weborder_Source'] = HL_weborder_source;
            HL_record_obj['Service_Id'] = HL_service_id;
            HL_record_obj['Sales_Order_Created'] = HL_sales_order_created;
            HL_record_obj['Service_Name'] = HL_service_name;

            //--------------------------------------------------- ITEM LINE ----------------------------------------------------------

            var item_count = HL_WO_id.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_item' });
            log.debug({
                title: "PCT-HL-Item Count",
                details: "Item Count" + item_count
            })

            var HL_record_item_array = new Array();
            for (item_index = 0; item_index < item_count; item_index++)
            {
                var HL_item_internal_id = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'id',
                    line: item_index
                });
                var HL_item_upc_code = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_item_upc_code',
                    line: item_index
                });
                var HL_item_id = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_item_id',
                    line: item_index
                });

                var HL_netsuite_item = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_netsuite_item',
                    line: item_index
                });
                var HL_item_error = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_item_error',
                    line: item_index
                });
                var HL_item_quantity = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_quantity',
                    line: item_index
                });
                var HL_item_rate = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_rate',
                    line: item_index
                });
                var HL_item_gross = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_gross',
                    line: item_index
                });
                var HL_item_taxable = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_taxable',
                    line: item_index
                });
                var HL_item_tax_percentage = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_tax_percentage',
                    line: item_index
                });
                var HL_item_tax_amount = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_tax_amount',
                    line: item_index
                });
                var HL_item_discount = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_item_discount',
                    line: item_index
                });
                var HL_item_net = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                    fieldId: 'custrecord_pct_hl_net',
                    line: item_index
                });
                log.debug({
                    title: 'PCT-FS-Item',
                    details: 'HL-Web Order Item Data:( Item_internal_id : ' + HL_item_internal_id + 'Item Upc Code :' + HL_item_upc_code + ',Item Name/Id:' + HL_item_id + ',Netsuite Item :' + HL_netsuite_item + ',Item Error :' + HL_item_error + ',Item Quantity :' + HL_item_quantity + ',Item Rate :' + HL_item_rate + ',Item Gross :' + HL_item_gross + ',Item Taxable :' + HL_item_taxable + ',Item Tax Percentage :' + HL_item_tax_percentage + ',Item Tax Amount :' + HL_item_tax_amount + ", Item Discount :" + HL_item_discount + ", Item Net Amount :" + HL_item_net + ')'
                });

                //------------------------------------------------- ITEM Json Obj ----------------------------------------------------

                var HL_record_item_obj = new Object;

                HL_record_item_obj['Item_Internal_Id'] = HL_item_internal_id;
                HL_record_item_obj['Item_UPC_Code'] = HL_item_upc_code;
                HL_record_item_obj['Item_Id'] = HL_item_id;
                HL_record_item_obj['Netsuite_Item'] = HL_netsuite_item;
                HL_record_item_obj['Item_Error'] = HL_item_error;
                HL_record_item_obj['Item_Quantity'] = HL_item_quantity;
                HL_record_item_obj['Item_Rate'] = HL_item_rate;
                HL_record_item_obj['Item_Gross'] = HL_item_gross;
                HL_record_item_obj['Item_Taxable'] = HL_item_taxable;
                HL_record_item_obj['Item_Tax_Percentage'] = HL_item_tax_percentage;
                HL_record_item_obj['Item_Tax_Amount'] = HL_item_tax_amount;

                HL_record_item_array.push(HL_record_item_obj);

                // log.debug({
                //     title: "PCT-FS-Item Array",
                //     details: "Item Array" + HL_record_item_array
                // })
                //  ------------------------------------------ Item Record Delete Record -----------------------------------------------------
                var Item_Delete_Record = record.delete({
                    type: "customrecord_pct_hl_item_web_order",
                    id: HL_item_internal_id,
                });
                log.debug({
                    title: 'PCT-HL-Child Item Record Delete',
                    details: 'Item Record Successfully Deleted Record Id :' + Item_Delete_Record
                });
            }
            HL_record_obj['Item'] = HL_record_item_array;

            //------------------------------------------------- SHIPPING LINE ----------------------------------------------------

            var HL_shipping_country = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_country' });
            var HL_shipping_addressee = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_addressee' });
            var HL_shipping_phone_number = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_phone_number' });
            var HL_shipping_address1 = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_address1' });
            var HL_shipping_address2 = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_address2' });
            var HL_shipping_city = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_city' });
            var HL_shipping_state = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_state' });
            var HL_shipping_zip = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_zip' });
            var HL_shipping_address = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_address' });
            var HL_shipping_cost = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_cost' });
            var HL_shipping_method = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_method' });
            var HL_shipping_method_error = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_method_error' });
            var HL_shipping_tax = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_tax' });
            var HL_shipping_tax_amount = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_shipping_tax_amount' });

            log.debug({
                title: 'PCT-FS-Shipping',
                details: 'HL-Web Order Shipping Data:( Shipping Country :' + HL_shipping_country + ',Shipping Addressee:' + HL_shipping_addressee + ',Shipping Phone No :' + HL_shipping_phone_number + ',Shipping Address1:' + HL_shipping_address1 + ',Shipping Address2 :' + HL_shipping_address2 + ',Shipping City' + HL_shipping_city + ',Shipping State' + HL_shipping_state + ',Shipping Zip : ' + HL_shipping_zip + ',Shipping Address :' + HL_shipping_address + ',Shipping Cost :' + HL_shipping_cost + ',Shipping Method :' + HL_shipping_method + ',Shipping Payment Error :' + HL_shipping_method_error + ", Shipping Tax Rate :" + HL_shipping_tax + ", Shipping Tax Amount :" + HL_shipping_tax_amount + ')'
            });

            //------------------------------------------------- SHIPPING Json Obj ----------------------------------------------------
            var HL_record_shipping_obj = new Object;
            var HL_record_shipping_array = new Array();

            HL_record_shipping_obj['Shipping_Country'] = HL_shipping_country;
            HL_record_shipping_obj['Shipping_Addressee'] = HL_shipping_addressee;
            HL_record_shipping_obj['Shipping_PhnNo'] = HL_shipping_phone_number;
            HL_record_shipping_obj['Shipping_Address1'] = HL_shipping_address1;
            HL_record_shipping_obj['Shipping_Address2'] = HL_shipping_address2;
            HL_record_shipping_obj['Shipping_City'] = HL_shipping_city;
            HL_record_shipping_obj['Shipping_State'] = HL_shipping_state;
            HL_record_shipping_obj['Shipping_Zip'] = HL_shipping_zip;
            HL_record_shipping_obj['Shipping_Address'] = HL_shipping_address;
            HL_record_shipping_obj['Shipping_Cost'] = HL_shipping_cost;
            HL_record_shipping_obj['Shipping_Method'] = HL_shipping_method;
            HL_record_shipping_obj['Shipping_Method_Error'] = HL_shipping_method_error;

            HL_record_shipping_array.push(HL_record_shipping_obj);

            // log.debug({
            //     title: "PCT-FS-Shipping Array",
            //     details: "Shipping Array :" + HL_record_shipping_array
            // })
            HL_record_obj['Shipping'] = HL_record_shipping_array;

            //------------------------------------------------- BILLING LINE ----------------------------------------------------

            var HL_Billing_phone_number = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_phone' });
            var HL_Billing_country = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_country' });
            var HL_Billing_addressee = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_addressee' });
            var HL_Billing_address1 = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_address1' });
            var HL_Billing_address2 = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_address2' });
            var HL_Billing_city = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_city' });
            var HL_Billing_state = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_state' });
            var HL_Billing_zip = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_zip' });
            var HL_Billing_address = HL_WO_id.getValue({ fieldId: 'custrecord_pct_hl_billing_address' });

            log.debug({
                title: 'PCT-FS-Billing',
                details: 'HL-Web Order Billing Data:( Billing Phone No :' + HL_Billing_phone_number + ',Billing Country :' + HL_Billing_country + ',Billing Addressee :' + HL_Billing_addressee + ',Billing Address1:' + HL_Billing_address1 + ',Billing Address2:' + HL_Billing_address2 + ',Billing City' + HL_Billing_city + ',Billing State' + HL_Billing_state + ',Billing Zip' + HL_Billing_zip + ',Billing Address' + HL_Billing_address + ')'
            });

            //------------------------------------------------- BILLING Json Obj ----------------------------------------------------

            var HL_record_billing_obj = new Object;
            var HL_record_billing_array = new Array();

            HL_record_billing_obj['Billing_PhnNo'] = HL_Billing_phone_number;
            HL_record_billing_obj['Billing_Country'] = HL_Billing_country;
            HL_record_billing_obj['Billing_Addressee'] = HL_Billing_addressee;
            HL_record_billing_obj['Billing_Address1'] = HL_Billing_address1;
            HL_record_billing_obj['Billing_Address2'] = HL_shipping_address2;
            HL_record_billing_obj['Billing_City'] = HL_Billing_city;
            HL_record_billing_obj['Billing_State'] = HL_Billing_state;
            HL_record_billing_obj['Billing_Zip'] = HL_Billing_zip;
            HL_record_billing_obj['Billing_Address'] = HL_Billing_address;

            HL_record_billing_array.push(HL_record_billing_obj);

            // log.debug({
            //     title: "PCT-FS-Billing Array",
            //     details: "Billing Array : " + HL_record_billing_array
            // })
            HL_record_obj['Billing'] = HL_record_billing_array;

            //------------------------------------------------- PROMOTION LINE ----------------------------------------------------

            var promotion_count = HL_WO_id.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code' });
            log.debug({
                title: "PCT-HL-Promotion Count",
                details: "Promotion Count" + promotion_count
            })
            var HL_record_promotion_array = new Array();
            for (promotion_index = 0; promotion_index < promotion_count; promotion_index++)
            {
                var HL_Promotion_internal_id = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
                    fieldId: 'id',
                    line: promotion_index
                });
                var HL_Promotion_coupon_code = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
                    fieldId: 'custrecord_pct_hl_coupon_code',
                    line: promotion_index

                });
                var HL_Promotion_coupon_code_error = HL_WO_id.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
                    fieldId: 'custrecord_pct_hl_promo_code_error',
                    line: promotion_index

                });
                log.debug({
                    title: "PCT-HL-Promotion",
                    details: 'HL-Web Order Promotion Data:( Promotion_internal_id : ' + HL_Promotion_internal_id + 'Promotion Coupon Code :' + HL_Promotion_coupon_code + 'Promotion Coupon Error :' + HL_Promotion_coupon_code_error + ')'
                })
                //------------------------------------------------- PROMOTION Json Obj ----------------------------------------------------

                var HL_record_promotion_obj = new Object;
                HL_record_promotion_obj['Promotion_Coupon_Code'] = HL_Promotion_coupon_code;
                HL_record_promotion_obj['Promotion_Coupon_Code_Error'] = HL_Promotion_coupon_code_error;

                HL_record_promotion_array.push(HL_record_promotion_obj);

                // log.debug({
                //     title: "PCT-FS-Promotion Array",
                //     details: "Promotion Array : " + HL_record_promotion_array
                // })
                var Promotion_Delete_Record = record.delete({
                    type: "customrecord_pct_hl_item_web_order",
                    id: HL_Promotion_internal_id,
                });
                log.debug({
                    title: 'PCT-HL-Child Promotion Record Delete',
                    details: 'Promotion Record Successfully Deleted Record Id :' + Promotion_Delete_Record
                });
            }
            HL_record_obj['Promotion'] = HL_record_promotion_array;
            //-------------------------------------------------------------------------------------------------------------------------

            HL_record_array.push(HL_record_obj);

            log.debug({
                title: "PCT-FS-Web Order Record Object",
                details: "Web Order Record Object : " + JSON.stringify(HL_record_obj)
            })
            log.debug({
                title: "PCT-FS-Web Order Record Array",
                details: "Web Order Record Array : " + JSON.stringify(HL_record_array)
            })

            //---------------------------------------------- Push Json into File Cabinate ------------------------------------------
            var current_date = new Date();
            var dd = current_date.getDate();
            var mm = current_date.getMonth() + 1;
            var yyyy = current_date.getFullYear();
            var current_date = mm + "-" + dd + "-" + yyyy;
            log.debug({
                title: 'PCT-HL-Old Date',
                details: 'Current Date' + current_date
            })
            var fileSearchObj = search.create({
                type: "folder",
                filters:
                    [
                        ["name", "is", "PCT Web Record"]
                    ]
            });
            var HLFolderCount = fileSearchObj.runPaged().count;
            log.debug("PCT-HL-HLFolderCount : ", HLFolderCount);
            // fileSearchObj.run().each(function(result){
            //    // .run().each has a limit of 4,000 results
            //    return true;
            // });
            var HLFolderSearchResult = fileSearchObj.run().getRange({
                start: 0,
                end: HLFolderCount
            });
            var HLFolder_Id = 0;
            if (HLFolderCount > 0)
            {
                for (var HLFolder_Index = 0; HLFolder_Index < HLFolderCount; HLFolder_Index++)
                {
                    HLFolder_Id = HLFolderSearchResult[HLFolder_Index].id;
                    log.debug({
                        title: 'PCT-HL-Folder-Search',
                        details: 'HL Folder Id:' + HLFolder_Id
                    });
                    var fileObj = file.create({
                        name: current_date,
                        fileType: file.Type.JSON,
                        contents: JSON.stringify(HL_record_array),
                        folder: HLFolder_Id
                    });
                    var HL_new_fileId = fileObj.save();
                    log.debug({
                        title: 'PCT-HL-Created File Id',
                        details: 'HL Created File Id:' + HL_new_fileId
                    });
                }
                log.debug({ title: 'PCT-HL-Message If', details: 'Json Successfully pushed into the File Cabinate' })
            }
            else
            {
                var HLFolder = record.create({
                    type: record.Type.FOLDER,
                });
                HLFolder.setValue({
                    fieldId: 'name',
                    value: "PCT Web Record"
                });
                var HLFolder_Id = HLFolder.save();
                var fileObj = file.create({
                    name: current_date,
                    fileType: file.Type.JSON,
                    contents: JSON.stringify(HL_record_array),
                    folder: HLFolder_Id
                });
                var HL_new_fileId = fileObj.save();
                log.debug({
                    title: 'PCT-HL-Created File Id',
                    details: 'HL Created File Id :' + HL_new_fileId
                });
                log.debug({ title: 'PCT-HL-Message Else', details: 'Json Successfully pushed into the File Cabinate' })
            }
            //  ------------------------ HL RECORD DELETE ------------------

            var HL_Web_Delete_Record = record.delete({
                type: "customrecord_pct_hl_web_order",
                id: id
            });
            log.debug({
                title: 'PCT-HL-HL Web Record Record Delete',
                details: 'HL Web Record Successfully Deleted Record Id :' + HL_Web_Delete_Record
            });
            //   ------------------------ SERVICE CALL REDORD DELETE ------------------
            HL_service_length = HL_service_length - 1;
            log.debug({
                title: "PCT-HL-Service Length in Last",
                details: "Inlast Service Name :" + HL_service_name + ", Service Length : " + HL_service_length
            })
            service_record_load.setValue({
                fieldId: 'custrecord_pct_hl_service_data_length',
                value: HL_service_length
            });
            service_record_load.save();
            if (HL_service_length == 0)
            {

                var ServiceCall_Delete_Record = record.delete({
                    type: "customrecord_pct_hl_service_call_history",
                    id: HL_service_id
                });
                log.debug({
                    title: 'PCT-HL- Service Call Record Record Delete',
                    details: 'Service Call Record Successfully Deleted Record Id :' + ServiceCall_Delete_Record
                });
            }

        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }
    }

    function reduce(context)
    {


    }

    function summarize(summary)
    {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
