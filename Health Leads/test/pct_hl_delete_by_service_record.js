/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.00          30 March 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        pct_hl_delete_record_mapreduce
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will delete records from HL Web Order and store those records in file cabinet as a json format.

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                Developer:

getInputData()							Get Old Date (7days back from today) and perform a search to find service call id			   		Sandipan Sau
map()                                   All the operation like Create json request (HL_record_array) and push json into file cabinet        Sandipan Sau


/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/file'], function (log, record, runtime, file, format, search, file)
{

    function getInputData()
    {
        log.debug({
            title: "PCT-HL_Get Input",
            details: "In Get Input Function"
        })
        var current_date = new Date();
        log.debug({
            title: 'PCT-HL-Old Date',
            details: 'current_date ' + current_date
        })
        current_date.setDate(current_date.getDate() - 17);
        var dd = current_date.getDate();
        var mm = current_date.getMonth() + 1;
        var yyyy = current_date.getFullYear();
        var old_date = mm + "/" + dd + "/" + yyyy;
        log.debug({
            title: 'PCT-HL-Old Date',
            details: 'Old Date' + old_date
        })
        var customrecord_pct_hl_service_call_historySearchObj = search.create({
            type: "customrecord_pct_hl_service_call_history",
            filters:
                [
                    ["custrecord_pct_hl_service_id.created", "onorbefore", old_date],
                    "AND",
                    ["custrecord_pct_hl_service_id.custrecord_pct_sales_order_created", "is", "T"]
                ],
        });
        var HL_record_ResultCount = customrecord_pct_hl_service_call_historySearchObj.runPaged().count;
        log.debug("HL_record_ResultCount", HL_record_ResultCount);
        // customrecord_pct_hl_service_call_historySearchObj.run().each(function(result){
        //    // .run().each has a limit of 4,000 results
        //    return true;
        // });
        var HL_record_Result = customrecord_pct_hl_service_call_historySearchObj.run().getRange({ start: 0, end: HL_record_ResultCount });
        var service_record_array = new Array();
        for (var getid_index = 0; getid_index < HL_record_ResultCount; getid_index++)
        {
            var service_record_id = HL_record_Result[getid_index].id;
            //  log.debug({
            //      title: "PCT-HL-Searvice Record ID",
            //      details: "Searvice Record Id : " + service_record_id
            //  })
            service_record_array.push(service_record_id);
        }
        log.debug({
            title: "PCT-HL",
            details: "Service Record Array : " + service_record_array
        })
        return service_record_array; //returnn service id in an array
    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        log.debug({ title: "PCT-HL_MAP-Context", details: "Context : " + context.value })
        try
        {
            var service_record_id = context.value;
            log.debug({
                title: "PCT-HL-Searvice Record ID",
                details: "Searvice Record Id : " + service_record_id
            })
            var service_record_load = record.load({
                type: 'customrecord_pct_hl_service_call_history',
                id: service_record_id
            });
            var service_name = service_record_load.getText({ fieldId: 'name' });
            log.debug({
                title: "PCT-HL-Service Name",
                details: "Service Name :" + service_name
            })
            var customrecord_pct_hl_service_call_historySearchObj = search.create({
                type: "customrecord_pct_hl_service_call_history",
                filters:
                    [
                        ["internalidnumber", "equalto", service_record_id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                            label: "Internal ID"
                        })
                    ]
            });
            var HL_record_ResultCount = customrecord_pct_hl_service_call_historySearchObj.runPaged().count;
            log.debug("HL_record_ResultCount", HL_record_ResultCount);
            //  customrecord_pct_hl_service_call_historySearchObj.run().each(function(result){
            //     // .run().each has a limit of 4,000 results
            //     return true;
            //  });
            var HL_record_Result = customrecord_pct_hl_service_call_historySearchObj.run().getRange({ start: 0, end: HL_record_ResultCount });
            for (HL_weborder_index = 0; HL_weborder_index < HL_record_ResultCount; HL_weborder_index++)
            {
                var HL_WO_id = HL_record_Result[HL_weborder_index].getValue({ name: 'internalid', join: 'CUSTRECORD_PCT_HL_SERVICE_ID' });
                log.debug({
                    title: "PCT-HL-Web Order Id",
                    details: "Web Order ID :" + HL_WO_id
                })
                var HL_WO_id_load = record.load({
                    type: 'customrecord_pct_hl_web_order',
                    id: HL_WO_id
                });
                log.debug({ title: "PCT-HL_Map_WO_id", details: "HL_WO_id_load" + HL_WO_id_load })
                //----------------------------------------------- BODY FIELD --------------------------------------------------

                var HL_customer_name = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_name' });
                var HL_netsuite_customer_name = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_netsuite_customer' });
                var HL_customer_error = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_error' });
                var HL_customer_email = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_email' });
                var HL_customer_phnno = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_phone_number' });
                var HL_netsuite_customer_email_address = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_netsuite_email_address' });
                var HL_customer_abs_cid = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_abs_cid' });
                var HL_customer_so_number = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_sales_order_number' });
                var HL_netsuite_customer_shipping_meth = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_netsuite_shipping_meth' });
                var HL_payment_method = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_payment_method' });
                var HL_netsuite_payment_term = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_netsuite_payment_term' });
                var HL_payment_error = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_payment_error' });
                var HL_category_name = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_category_name' });
                var HL_netsuite_category_name = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_netsuite_category_name' });
                var HL_order_date = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_order_date' });
                var HL_weborder_source = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_weborder_source' });
                var HL_service_id = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_service_id' });
                var HL_sales_order_created = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_sales_order_created' });

                log.debug({
                    title: 'PCT-FS-Body',
                    details: 'HL-Web Order Body Data:(Customer Name:' + HL_customer_name + ',Netsuite_customer_name:' + HL_netsuite_customer_name + ',Customer_Error :' + HL_customer_error + ',Customer_email:' + HL_customer_email + ',Customer_phnno:' + HL_customer_phnno + ',Netsuite_Customer_Email_Address' + HL_netsuite_customer_email_address + ',Netsuite_Customer_Email_Address' + HL_customer_abs_cid + ',Customer Sales Order number' + HL_customer_so_number + ',Customer Shipping Method' + HL_netsuite_customer_shipping_meth + ',Payment Method' + HL_payment_method + ',Netsuite Payment Term' + HL_netsuite_payment_term + ',Payment Eror' + HL_payment_error + ',Category Name' + HL_category_name + ',Netsuite Category Name' + HL_netsuite_category_name + ',Order Date' + HL_order_date + ',Web Order Source' + HL_weborder_source + ', Service Id' + HL_service_id + ', Sales Order Created' + HL_sales_order_created + ')'
                });

                //------------------------------------------------- Create Json Obj for Body Field----------------------------------------------------
                var HL_record_obj = new Object();
                var HL_record_array = new Array();

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

                //--------------------------------------------------- ITEM LINE ----------------------------------------------------------

                var item_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_item' });
                log.debug({
                    title: "PCT-HL-Item Count",
                    details: "Item Count" + item_count
                })

                var HL_record_item_array = new Array();
                for (item_index = 0; item_index < item_count; item_index++)
                {
                    var HL_item_upc_code = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_item_upc_code',
                        line: item_index
                    });
                    var HL_item_id = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_item_id',
                        line: item_index
                    });
                    var HL_netsuite_item = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_netsuite_item',
                        line: item_index
                    });
                    var HL_item_error = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_item_error',
                        line: item_index
                    });
                    var HL_item_quantity = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_quantity',
                        line: item_index
                    });
                    var HL_item_rate = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_rate',
                        line: item_index
                    });
                    var HL_item_gross = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_gross',
                        line: item_index
                    });
                    var HL_item_taxable = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_taxable',
                        line: item_index
                    });
                    var HL_item_tax_percentage = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_tax_percentage',
                        line: item_index
                    });
                    var HL_item_tax_amount = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                        fieldId: 'custrecord_pct_hl_tax_amount',
                        line: item_index
                    });
                    log.debug({
                        title: 'PCT-FS-Item',
                        details: 'HL-Web Order Item Data:( Item Upc Code :' + HL_item_upc_code + ',Item Name/Id:' + HL_item_id + ',Netsuite Item :' + HL_netsuite_item + ',Item Error :' + HL_item_error + ',Item Quantity :' + HL_item_quantity + ',Item Rate :' + HL_item_rate + ',Item Gross :' + HL_item_gross + ',Item Taxable :' + HL_item_taxable + ',Item Tax Percentage :' + HL_item_tax_percentage + ',Item Tax Amount :' + HL_item_tax_amount + ')'
                    });

                    //------------------------------------------------- ITEM Json Obj ----------------------------------------------------

                    var HL_record_item_obj = new Object;

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

                    // HL_record_item_array.push(HL_record_item_obj);
                    HL_record_item_array[item_index] = JSON.stringify(HL_record_item_obj);

                    log.debug({
                        title: "PCT-FS-Item Array",
                        details: "Item Array" + HL_record_item_array
                    })
                }
                HL_record_obj['Item'] = HL_record_item_array;
                //------------------------------------------------- SHIPPING LINE ----------------------------------------------------

                var HL_shipping_country = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_country' });
                var HL_shipping_addressee = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_addressee' });
                var HL_shipping_phone_number = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_phone_number' });
                var HL_shipping_address1 = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_address1' });
                var HL_shipping_address2 = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_address2' });
                var HL_shipping_city = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_city' });
                var HL_shipping_state = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_state' });
                var HL_shipping_zip = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_zip' });
                var HL_shipping_address = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_address' });
                var HL_shipping_cost = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_cost' });
                var HL_shipping_method = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_method' });
                var HL_shipping_method_error = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_method_error' });

                log.debug({
                    title: 'PCT-FS-Shipping',
                    details: 'HL-Web Order Shipping Data:( Shipping Country :' + HL_shipping_country + ',Shipping Addressee:' + HL_shipping_addressee + ',Shipping Phone No :' + HL_shipping_phone_number + ',Shipping Address1:' + HL_shipping_address1 + ',Shipping Address2 :' + HL_shipping_address2 + ',Shipping City' + HL_shipping_city + ',Shipping State' + HL_shipping_state + ',Shipping Zip : ' + HL_shipping_zip + ',Shipping Address :' + HL_shipping_address + ',Shipping Cost :' + HL_shipping_cost + ',Shipping Method :' + HL_shipping_method + ',Shipping Payment Error :' + HL_shipping_method_error + ')'
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
                HL_record_shipping_array = JSON.stringify(HL_record_shipping_array);

                log.debug({
                    title: "PCT-FS-Shipping Array",
                    details: "Shipping Array" + HL_record_shipping_array
                })
                HL_record_obj['Shipping'] = HL_record_shipping_array;

                //------------------------------------------------- BILLING LINE ----------------------------------------------------

                var HL_Billing_phone_number = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_phone' });
                var HL_Billing_country = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_country' });
                var HL_Billing_addressee = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_addressee' });
                var HL_Billing_address1 = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_address1' });
                var HL_Billing_address2 = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_address2' });
                var HL_Billing_city = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_city' });
                var HL_Billing_state = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_state' });
                var HL_Billing_zip = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_zip' });
                var HL_Billing_address = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_address' });

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
                HL_record_billing_array = JSON.stringify(HL_record_billing_array);

                log.debug({
                    title: "PCT-FS-Billing Array",
                    details: "Billing Array" + HL_record_billing_array
                })
                HL_record_obj['Billing'] = HL_record_billing_array;

                //------------------------------------------------- PROMOTION LINE ----------------------------------------------------

                var promotion_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code' });
                log.debug({
                    title: "PCT-HL-Promotion Count",
                    details: "Promotion Count" + promotion_count
                })
                var HL_record_promotion_array = new Array();
                for (promotion_index = 0; promotion_index < promotion_count; promotion_index++)
                {
                    var HL_Promotion_coupon_code = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
                        fieldId: 'custrecord_pct_hl_coupon_code',
                        line: promotion_index

                    });
                    var HL_Promotion_coupon_code_error = HL_WO_id_load.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
                        fieldId: 'custrecord_pct_hl_promo_code_error',
                        line: promotion_index

                    });
                    log.debug({
                        title: "PCT-HL-Promotion",
                        details: 'HL-Web Order Promotion Data:( Promotion Coupon Code :' + HL_Promotion_coupon_code + 'Promotion Coupon Error :' + HL_Promotion_coupon_code_error + ')'
                    })
                    //------------------------------------------------- PROMOTION Json Obj ----------------------------------------------------

                    var HL_record_promotion_obj = new Object;
                    HL_record_promotion_obj['Promotion_Coupon_Code'] = HL_Promotion_coupon_code;
                    HL_record_promotion_obj['Promotion_Coupon_Code_Error'] = HL_Promotion_coupon_code_error;
                    HL_record_promotion_array[promotion_index] = JSON.stringify(HL_record_promotion_obj);

                    log.debug({
                        title: "PCT-FS-Promotion Array",
                        details: "Promotion Array" + HL_record_promotion_array
                    })
                }
                log.debug({
                    title: "PCT-FS-Promotion Array outside",
                    details: "Promotion Array Outside" + HL_record_promotion_array
                })

                HL_record_obj['Promotion'] = HL_record_promotion_array;
                //-------------------------------------------------------------------------------------------------------------------------

                HL_record_array.push(HL_record_obj);
                HL_record_array = JSON.stringify(HL_record_array);
                log.debug({
                    title: "PCT-FS-Web Order Record Object",
                    details: "Web Order Record Object : " + JSON.stringify(HL_record_obj)
                })
                log.debug({
                    title: "PCT-FS-Web Order Record Array ",
                    details: "Web Order Record Array : " + HL_record_array
                })
                //---------------------- Regular Expression for get proper json structure ------------------------------------------------

                HL_record_array = HL_record_array.replace(/[\\\*]/g, "");

                //---------------------------------------------- Push Json into File Cabinate ------------------------------------------
                var fileSearchObj = search.create({
                    type: "folder",
                    filters:
                        [
                            ["name", "is", service_name]
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
                            name: HL_WO_id,
                            fileType: file.Type.JSON,
                            contents: HL_record_array,

                            folder: HLFolder_Id
                        });
                        var HL_new_fileId = fileObj.save();
                        log.debug({
                            title: 'PCT-HL-Created File Id',
                            details: 'HL Created File Id:' + HL_new_fileId
                        });
                    }
                }
                else
                {
                    var HLFolder = record.create({
                        type: record.Type.FOLDER,
                    });
                    HLFolder.setValue({
                        fieldId: 'name',
                        value: service_name
                    });
                    var HLFolder_Id = HLFolder.save();
                    var fileObj = file.create({
                        name: HL_WO_id,
                        fileType: file.Type.JSON,
                        contents: HL_record_array,
                        folder: HLFolder_Id
                    });
                    var HL_new_fileId = fileObj.save();
                    log.debug({
                        title: 'PCT-HL-Created File Id',
                        details: 'HL Created File Id :' + HL_new_fileId
                    });
                }
                log.debug({ title: 'PCT-HL-Message', details: 'Json Successfully pushed into the File Cabinate' })


                context.write(HL_record_obj); //write data
            }
        }
        catch (ex) { log.error({ title: 'map: error deleting records', details: ex }); }

    }

    function reduce()
    {
        log.debug({
            title: "PCT-HL-Reduce",
            details: "In Reduce Function"
        })

    }

    function summarize()
    {
        log.debug({
            title: "PCT-HL-Summarize",
            details: "In Summarize Function"
        })

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
