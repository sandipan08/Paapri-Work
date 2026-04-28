require(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    var HL_WO_id_load = record.load({
        type: 'customrecord_pct_hl_web_order',
        id: 3832
    });
    //log.debug({ title: "PCT-HL_Map_WO_id", details: "HL_WO_id " + HL_WO_id_load })

    var HL_date_created = HL_WO_id_load.getValue({ fieldId: 'created' });
    var HL_customer_name = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_name' });
    var HL_weborder_source = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_weborder_source' });

    //----------------------------------------------- Check Customer is Present or Not ------------------------
    //var HL_customer_id = Customer(HL_customer_name);
    //------------------------------------------------- GET SHIPPING LINE ----------------------------------------------------

    var HL_shipping_country = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_country' });
    if (HL_shipping_country.length > 2) // if shipping country in name tyen only returns 
    {
        var HL_shipping_country = country(HL_shipping_country);
    }
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
    //------------------------------------------------- GET BILLING LINE ----------------------------------------------------

    var HL_Billing_phone_number = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_phone' });
    var HL_Billing_country = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_country' });
    if (HL_Billing_country.length > 2) // if billing country in name tyen only returns 
    {
        var HL_Billing_country = country(HL_Billing_country);
    }
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
    //------------------------------------------------- Creating Sales Order ------------------------------------------------
    var salesOrderobj = record.create({
        type: record.Type.SALES_ORDER,
        isDynamic: true
    });
    salesOrderobj.setValue({ fieldId: 'entity', value: 326 });
    // salesOrderobj.setValue({ fieldId: 'entity', value: HL_customer_id });
    salesOrderobj.setValue({ fieldId: 'trandate', value: HL_date_created });
    salesOrderobj.setValue({ fieldId: 'subsidiary', value: 1 });

    var item_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_item' });
    log.debug({
        title: "PCT-HL-Item Count",
        details: "Item Count" + item_count
    })
    var total_item_count = 0;
    for (item_index = 0; item_index < item_count; item_index++)
    {
        var HL_item_id = HL_WO_id_load.getSublistValue({
            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
            fieldId: 'custrecord_pct_hl_item_id',
            line: item_index
        });
        var HL_item_quantity = HL_WO_id_load.getSublistValue({
            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
            fieldId: 'custrecord_pct_hl_quantity',
            line: item_index
        });
        total_item_count = total_item_count + HL_item_quantity;
        var HL_item_rate = HL_WO_id_load.getSublistValue({
            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
            fieldId: 'custrecord_pct_hl_rate',
            line: item_index
        });
        var HL_item_internal_id = create_item(HL_item_id, HL_item_rate)
        log.debug({
            title: "PCT HL Item Internal Id",
            details: "item_Id: " + HL_item_internal_id
        })

        //------------------------------------------------ Add Item in Sales Order --------------------------------------

        salesOrderobj.selectNewLine({ sublistId: 'item' });
        salesOrderobj.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: HL_item_internal_id,
        });
        salesOrderobj.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: HL_item_quantity
        });
        salesOrderobj.commitLine({ sublistId: 'item' });
    }
    // log.debug({
    //     title: "PCT-HL-Total Item Count",
    //     details: " Total Item Count" + total_item_count
    // })

    //----------------------------------------------------- Add Shipping in Sales Order  -----------------------------------------------------

    var subrec = salesOrderobj.getSubrecord({
        fieldId: 'shippingaddress'
    });

    subrec.setValue({ fieldId: 'addressee', value: HL_shipping_addressee });
    subrec.setValue({ fieldId: 'country', value: HL_shipping_country });
    subrec.setValue({ fieldId: 'addrphone', value: HL_shipping_phone_number });
    subrec.setValue({ fieldId: 'addr1', value: HL_shipping_address1 });
    subrec.setValue({ fieldId: 'addr2', value: HL_shipping_address2 });
    subrec.setValue({ fieldId: 'city', value: HL_shipping_city });
    subrec.setValue({ fieldId: 'state', value: HL_shipping_state });
    subrec.setValue({ fieldId: 'zip', value: HL_shipping_zip });
    subrec.setValue({ fieldId: 'addrtext', value: HL_shipping_address });

    //salesOrderobj.setValue({ fieldId: 'shippingcost', value: HL_shipping_cost });
    salesOrderobj.setValue({ fieldId: 'shipmethod', value: 408 });

    //----------------------------------------------------- Add Billing in Sales Order -----------------------------------------------------

    var billing_subrec = salesOrderobj.getSubrecord({
        fieldId: 'billingaddress'
    });

    billing_subrec.setValue({ fieldId: 'addressee', value: HL_Billing_addressee });
    billing_subrec.setValue({ fieldId: 'country', value: HL_Billing_country });
    billing_subrec.setValue({ fieldId: 'addrphone', value: HL_Billing_phone_number });
    billing_subrec.setValue({ fieldId: 'addr1', value: HL_Billing_address1 });
    billing_subrec.setValue({ fieldId: 'addr2', value: HL_Billing_address2 });
    billing_subrec.setValue({ fieldId: 'city', value: HL_Billing_city });
    billing_subrec.setValue({ fieldId: 'state', value: HL_Billing_state });
    billing_subrec.setValue({ fieldId: 'zip', value: HL_Billing_zip });
    billing_subrec.setValue({ fieldId: 'addrtext', value: HL_Billing_address });

    //----------------------------------------------------- Add Promotion Sales Order -----------------------------------------------------

    var promotion_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code' });
    log.debug({ title: "PCT-HL-Promotion Count", details: "Promotion Count" + promotion_count })
    for (promotion_index = 0; promotion_index < promotion_count; promotion_index++)
    {
        var HL_Promotion_coupon_code = HL_WO_id_load.getSublistValue({
            sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
            fieldId: 'custrecord_pct_hl_coupon_code',
            line: promotion_index
        });
        log.debug({
            title: "PCT-HL-Promotion",
            details: "Promotion Coupon Code : " + HL_Promotion_coupon_code
        })
        // ---------------------------------------------------------- Promotion Search -------------------------------------------------
        var promotioncodeSearchObj = search.create({
            type: "promotioncode",
            filters:
                [
                    ["code", "is", "Test"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var PromotionCount = promotioncodeSearchObj.runPaged().count;
        log.debug("promotioncodeSearchObj result count", PromotionCount);
        // promotioncodeSearchObj.run().each(function(result){
        //    // .run().each has a limit of 4,000 results
        //     return true;
        // });
        var PromotionResult = promotioncodeSearchObj.run().getRange({
            start: 0,
            end: PromotionCount
        });
        for (promotion_index = 0; promotion_index < PromotionCount; promotion_index++)
        {
            var promotion_name = PromotionResult[promotion_index].getValue({ name: 'name' });
            var promotion_id = PromotionResult[promotion_index].id;
            log.debug(" PCT-HL-Promotion Name ", "Promotion Code Name : " + promotion_name + ' and Internal Id is : ' + promotion_id);

            salesOrderobj.selectNewLine({ sublistId: 'promotions' });
            salesOrderobj.setCurrentSublistValue({
                sublistId: 'promotions',
                fieldId: 'promocode',
                value: promotion_id
            });
            salesOrderobj.commitLine({ sublistId: 'promotions' });
        }
    }
    if (total_item_count > 0)
    {
        var salesorder = salesOrderobj.save();
        log.debug({
            title: 'PCT-HL-SalesOrder',
            details: 'Craeted Sales Order Id:' + salesorder
        });
        HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_sales_order_created', value: true });
        HL_WO_id_load.save();
        // HL_WO_id_load.getField("custrecord_pct_sales_order_created").isDisabled = true;
    }
    else
    {
        log.debug({
            title: 'PCT-HL-Message',
            details: 'Message : Can NOt Create a Sales Order Because of less Item '
        });
    }


    // ------------------------------------------------------------ Custom Function ------------------------------------
    // For Item Search - >

    function create_item(HL_item_id, HL_item_rate)
    {
        var HL_item_internal_id;
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["name", "is", HL_item_id]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var itemsearch_count = itemSearchObj.runPaged().count;
        log.debug("item result count", itemsearch_count);
        var item_searchresult = itemSearchObj.run().getRange({ start: 0, end: itemsearch_count });
        // return item_count;
        if (itemsearch_count > 0)
        {
            log.debug({ title: "PCT-HL-Item", details: "Item Already Present " })
            var HL_item_internal_id = item_searchresult[0].id;
            log.debug({ title: "PCT-HL-Item ID : ", details: HL_item_internal_id })
            return HL_item_internal_id;
        }
        else
        {
            log.debug({ title: "PCT-HL-Item", details: "Creating a Item " })
            var item = record.create({
                type: record.Type.INVENTORY_ITEM,
                isDynamic: true
            });

            item.setValue({ fieldId: 'itemid', value: HL_item_id });
            item.selectLine({ sublistId: 'price1', line: 0 });
            item.setCurrentSublistValue({ sublistId: 'price1', fieldId: 'price_1_', value: HL_item_rate, line: 0 });
            item.commitLine({ sublistId: 'price1' });
            item.setText({ fieldId: 'taxschedule', text: 'Standard 20%' });
            item.setText({ fieldId: 'costcategory', text: 'Default' });
            HL_item_internal_id = item.save();
            log.debug({ title: "PCT-HL- New Item Id", details: "New Item Created & Item Id " + HL_item_internal_id })
            return HL_item_internal_id;
        }
    }
    // For Customer Search - >

    // function Customer(HL_customer_name)
    // {
    //     var customerSearchObj = search.create({
    //         type: "customer",
    //         filters:
    //             [
    //                 ["entityid", "is", HL_customer_name]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "internalid", label: "Internal ID" })
    //             ]
    //     });
    //     var customer_count = customerSearchObj.runPaged().count;
    //     log.debug("Customer result count", customer_count);
    //     //  customerSearchObj.run().each(function(result){
    //     //     // .run().each has a limit of 4,000 results
    //     //     return true;
    //     //  });
    //     var customer_searchresult = customerSearchObj.run().getRange({ start: 0, end: customer_count });
    //     for (customer_index = 0; customer_index < customer_count; customer_index++)
    //     {
    //         var HL_customer_internal_id = customer_searchresult[customer_index].id;
    //     }
    //     return HL_customer_internal_id;

    // }
    function country(country)
    {
        log.debug({
            title: "PCT-HL-IN COUNTRY FUNCTION ",
            details: "Country : " + country
        })

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
            { 'ccode': 'HR', 'cname': 'Croatia' },
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
        for (var index = 0; index < isoCountries.length; index++)
        {
            if (isoCountries[index].cname == country)
            {
                var ccode = isoCountries[index].ccode;

                log.debug({
                    title: "PCT-HL-Country",
                    details: "Country Code : " + ccode
                })
                // console.log("Country Code ::" + ccode)
                break;
            }

        }
    }
});