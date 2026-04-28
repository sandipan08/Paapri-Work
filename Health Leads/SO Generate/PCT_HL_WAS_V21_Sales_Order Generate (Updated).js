/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1           05 April 2021    	    Sandipan Sau
*
*
*@NApiVersion 2.1
*@NScriptType WorkflowActionScript
*/

/**********************************************************************************************************************************************

Script Name:        PCT_HL_WAS_V21_Sales_Order Generate
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will generate sales order from HL Web Order Record.

© Copyright All Rights Reserved

******************************************************************************************************************************************************/
/******************************************************** Included Function & Update **************************************************************************
/**********************************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:

OnAction()						                	    Generate Sales Order from HL Web Order                                           	    Sandipan Sau
country()                                        Return Country Name associated with that Country Code                                          Sandipan Sau
search_item()                      Search that Item in Netsuite and return Internal Id of that Item                     Sandipan Sau
Create_Customer()              Create a Customer If the customer is not present in Netsuite and return Internal Id of that customer             Sandipan Sau

/************************************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/currentRecord', 'N/record', 'N/runtime', 'N/search', 'N/email', 'N/runtime'],
    function (currentRecord, record, runtime, search, email, runtime)
    {
        //----------------------------------------------------------------------- Country Function --------------------------------------------------
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
                // { 'ccode': 'GB', 'cname': 'United Kingdom' },
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
            for (var index = 0; index < isoCountries.length; index++)
            {
                if (isoCountries[index].ccode == country)
                {
                    var cname = isoCountries[index].cname;
                    return cname;
                    break;

                }
                else if (isoCountries[index].cname == country)
                {
                    var ccode = isoCountries[index].ccode;
                    return ccode;
                    break;
                }
            }

        }
        //----------------------------------------------------------------------- Country Function End --------------------------------------------------

        //----------------------------------------------------------------------- Create Item Function --------------------------------------------------

        function search_item(HL_item_id, HL_item_rate)
        {
            var HL_item_internal_id;
            log.debug({
                title: "PCT-HL",
                details: "InSide Item Function - Item Name/Id : " + HL_item_id + ", Item Rate :" + HL_item_rate
            })
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["name", "is", HL_item_id],
                        "AND",
                        ["type", "anyof", "Assembly", "InvtPart"]
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
                log.debug({ title: "PCT-HL", details: "Item " + HL_item_id + " Already Present " })
                var HL_item_internal_id = item_searchresult[0].id;
                log.debug({ title: "PCT-HL ", details: "Present Item ID :" + HL_item_internal_id })
                return HL_item_internal_id;
            }
            else
            {
                var assemblyitemSearchObj = search.create({
                    type: "assemblyitem",
                    filters:
                        [
                            ["type", "anyof", "Assembly"],
                            "AND",
                            ["custitem_pct_hl_aliascode_amazon", "is", HL_item_id],
                            "AND",
                            ["custitem_pct_hl_aliascode_horeb", "is", HL_item_id],
                            "AND",
                            ["custitem_pct_hl_additional_alias", "is", HL_item_id]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var itemsearch_count = assemblyitemSearchObj.runPaged().count;
                var item_searchresult = assemblyitemSearchObj.run().getRange({ start: 0, end: itemsearch_count });
                if (itemsearch_count > 0)
                {
                    log.debug({ title: "PCT-HL", details: "Item " + HL_item_id + " Already Present " })
                    var HL_item_internal_id = item_searchresult[0].id;
                    log.debug({ title: "PCT-HL ", details: "Present Item ID :" + HL_item_internal_id })
                    return HL_item_internal_id;
                }
                else
                {
                    return 0;
                }
            }
        }
        //----------------------------------------------------------------------- Item Function End --------------------------------------------------

        //----------------------------------------------------------------------- Create Customer Function --------------------------------------------------

        function Create_Customer(HL_customer_name, HL_shipping_country, HL_order_source, HL_customer_phnno, HL_customer_mail, HL_customer_absCid)
        {
            log.debug({
                title: "PCT-HL",
                details: "In Function : " + HL_customer_name + ", Country : " + HL_shipping_country + ", Customer Abs Cid : " + HL_customer_absCid + ", Phone No : " + HL_customer_phnno + ", Email : " + HL_customer_mail
            })
            if (HL_order_source == "ebay")
            {
                return 4117;
            }
            else
            {
                var filteredIDs = [];
                var filter_count = 0;
                if (HL_customer_absCid != null && HL_customer_absCid != '')
                {
                    filteredIDs.push(["custentity_pct_hl_customer_abs_cid", "is", HL_customer_absCid]);
                    filter_count = 1;
                }
                if (HL_customer_mail != null && HL_customer_mail != '')
                {
                    if (filter_count == 1)
                    {
                        filteredIDs.push("OR");
                    }
                    filteredIDs.push(["email", "is", HL_customer_mail]);
                    filter_count = 1;
                }
                if (HL_customer_phnno != null && HL_customer_phnno != '')
                {
                    if (filter_count == 1)
                    {
                        filteredIDs.push("OR");
                    }
                    filteredIDs.push(["phone", "haskeywANDds", HL_customer_phnno]);
                    filter_count = 1;
                }
                if (HL_customer_name != null && HL_customer_name != '')
                {
                    if (filter_count == 1)
                    {
                        filteredIDs.push("OR");
                    }
                    filteredIDs.push(["entityid", "is", HL_customer_name]);
                    filter_count = 1;
                }
                //  HL_customer_name = HL_customer_name.trim();
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            filteredIDs
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({ name: "altname", label: "Name" })
                        ]
                });
                var customer_count = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", customer_count);
                var customer_searchresult = customerSearchObj.run().getRange({ start: 0, end: customer_count });

                if (customer_count > 0)
                {
                    log.debug({ title: "PCT-HL", details: "Customer " + HL_customer_name + " Already Present " })

                    for (customer_index = 0; customer_index < customer_count; customer_index++)
                    {
                        var HL_customer_internal_id = customer_searchresult[customer_index].id;
                        var customer_load = record.load({
                            type: 'customer',
                            id: HL_customer_internal_id,
                            isDynamic: false,
                        });

                        customer_load.setValue({ fieldId: 'isperson', value: "T" });
                        var customerArr = HL_customer_name.split(" ");
                        if (customerArr.length == 3)
                        {
                            customer_load.setValue({ fieldId: 'firstname', value: customerArr[0] });
                            customer_load.setValue({ fieldId: 'middlename', value: customerArr[1] });
                            customer_load.setValue({ fieldId: 'lastname', value: customerArr[2] });
                        }
                        else if (customerArr.length == 2)
                        {
                            customer_load.setValue({ fieldId: 'firstname', value: customerArr[0] });
                            customer_load.setValue({ fieldId: 'lastname', value: customerArr[1] });
                        }
                        customer_load.setValue({ fieldId: 'custentity_pct_hl_customer_abs_cid', value: HL_customer_absCid });
                        customer_load.setValue({ fieldId: 'email', value: HL_customer_mail });
                        customer_load.setValue({ fieldId: 'phone', value: HL_customer_phnno });
                        var addressSubrecord = customer_load.getSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress',
                            line: 0
                        });

                        addressSubrecord.setText({ fieldId: 'country', text: HL_shipping_country });
                        addressSubrecord.setValue({
                            fieldId: 'defaultbilling',
                            value: "T"
                        })
                        addressSubrecord.setValue({
                            fieldId: 'defaultshipping',
                            value: "T"
                        })
                        // customer.commitLine({
                        //     sublistId: 'addressbook'
                        // });
                        customer_load.save();
                    }
                    return HL_customer_internal_id;

                }
                else
                {
                    log.debug({ title: "PCT-HL", details: "Creating a Customer " })
                    var customer = record.create({
                        type: record.Type.CUSTOMER,
                        isDynamic: true
                    });
                    customer.setValue({ fieldId: 'isperson', value: "T" });
                    var customerArr = HL_customer_name.split(" ");
                    if (customerArr.length == 3)
                    {
                        customer.setValue({ fieldId: 'firstname', value: customerArr[0] });
                        customer.setValue({ fieldId: 'middlename', value: customerArr[1] });
                        customer.setValue({ fieldId: 'lastname', value: customerArr[2] });
                    }
                    else if (customerArr.length == 2)
                    {
                        customer.setValue({ fieldId: 'firstname', value: customerArr[0] });
                        customer.setValue({ fieldId: 'lastname', value: customerArr[1] });
                    }
                    customer.setValue({ fieldId: 'custentity_pct_hl_customer_abs_cid', value: HL_customer_absCid });
                    customer.setValue({ fieldId: 'email', value: HL_customer_mail });
                    customer.setValue({ fieldId: 'phone', value: HL_customer_phnno });
                    customer.selectNewLine({
                        sublistId: 'addressbook'
                    });
                    var addressSubrecord = customer.getCurrentSublistSubrecord({
                        sublistId: 'addressbook',
                        fieldId: 'addressbookaddress'
                    });
                    // Set all required values here.
                    addressSubrecord.setText({
                        fieldId: 'country',
                        text: HL_shipping_country
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
                    HL_customer_internal_id = customer.save();
                    log.debug({ title: "PCT-HL", details: "New Customer Created & Customer Id " + HL_customer_internal_id })
                    return HL_customer_internal_id;
                }
            }
        }
        //----------------------------------------------------------------------- Customer Function End -----------------------------------------------------------

        //----------------------------------------------------------------------- Search Shipping Method Function --------------------------------------------------
        function shipping_method(HL_shipping_method)
        {
            var shipitemSearchObj = search.create({
                type: "shipitem",
                filters:
                    [
                        ["itemid", "is", HL_shipping_method]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var method_count = shipitemSearchObj.runPaged().count;
            log.debug("PCT-HL", "Shipping Method Result Count : " + method_count);
            var method_searchresult = shipitemSearchObj.run().getRange({ start: 0, end: method_count });
            if (method_count > 0)
            {
                log.debug({ title: "PCT-HL", details: "Shipping Method " + HL_shipping_method + " Already Present " })
                for (method_index = 0; method_index < method_count; method_index++)
                {
                    var shipping_method_id = method_searchresult[method_index].id;
                }
                return shipping_method_id;

            }
            else
            {
                log.debug({ title: "PCT-HL", details: "Shipping Method " + HL_shipping_method + " Not Present, So We Puting Others as a Shipping Method " })
                return 408;
            }
        }
        //----------------------------------------------------------------------- Shipping Method Function End --------------------------------------------------
        //----------------------------------------------------------------------- Search Payment Method Function --------------------------------------------------
        function getPaymentMethodId(HL_payment_method)
        {
            var paymentmethodSearchObj = search.create({
                type: "paymentmethod",
                filters:
                    [
                        ["name", "is", HL_payment_method]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = paymentmethodSearchObj.runPaged().count;
            log.debug("paymentmethodSearchObj result count", searchResultCount);
            var paymentId = 0;
            if (searchResultCount > 0)
            {
                paymentmethodSearchObj.run().each(function (result)
                {
                    paymentId = result.getValue('internalid');
                    // .run().each has a limit of 4,000 results
                    // return true;
                });
            } else
            {
                log.debug({ title: "PCT-HL", details: "Creating a Payment Method " })
                var PMNTMethod = record.create({
                    type: 'paymentmethod'
                });

                PMNTMethod.setValue({
                    fieldId: 'name',
                    value: HL_payment_method
                });

                paymentId = PMNTMethod.save();
            }
            log.debug({
                title: 'paymentId',
                details: paymentId
            })
            return paymentId;
        }

        //----------------------------------------------------------------------- Search Payment Method End --------------------------------------------------
        function onAction(scriptContext)
        {
            log.debug({ title: 'PCT-HL-WF', details: "In WorkFlow OnAction Function" });
            var HL_WO_id_load = scriptContext.newRecord;
            var id = HL_WO_id_load.getValue({ fieldId: 'id' });
            log.debug({ title: 'PCT-HL-WF', details: 'HL Web Record Id:' + id });
            try
            {

                var HL_date_created = HL_WO_id_load.getValue({ fieldId: 'created' });
                var HL_customer_name = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_name' });
                var HL_customer_so_number = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_sales_order_number' });
                var HL_customer_absCid = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_abs_cid' });
                var HL_customer_mail = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_email' });
                var HL_customer_phnno = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_customer_phone_number' });
                var HL_payment_method = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_payment_method' });
                var HL_discount = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_adjustment_discount' });
                var HL_order_source = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_weborder_source' });
                var HL_subtotal = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_sub_total' });


                log.debug({
                    title: "PCT-HL",
                    details: "HL Web Order Body Field Deatils : ( Customer Name : " + HL_customer_name + ", Customer Abs Cid : " + HL_customer_absCid + ", Customer Mail : " + HL_customer_mail + ", customer PhnNo : " + HL_customer_phnno + ", HL Record Create Date " + HL_date_created + ", Sales Order Number :" + HL_customer_so_number + ", Payment Method : " + HL_payment_method + ", Discount on Total :" + HL_discount + "Order Source : " + HL_order_source + "Subtotal : " + HL_subtotal + " )"
                })
                // ------------------------------ Payment Method ---------------------------------
                var PaymentMethodId = getPaymentMethodId(HL_payment_method);
                // if (HL_order_source = 'magento')
                // {
                //     if (HL_customer_name == null || HL_customer_name === undefined || HL_customer_name.length == 0 || HL_customer_name == '')
                //     {
                //         HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: "For Magento Orders Customer Name can't be Blank " });
                //     }
                // }
                // else
                // {
                //     if (HL_customer_name == null || HL_customer_name === undefined || HL_customer_name.length == 0 || HL_customer_name == '')
                //     {
                //         // HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: "Customer Name is Blank " });
                //         HL_customer_name = "HL Website Orders";
                //     }
                // }
                if (HL_customer_name == null || HL_customer_name === undefined || HL_customer_name.length == 0 || HL_customer_name == '')
                {
                    // HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: "Customer Name is Blank " });
                    HL_customer_name = "HL Website Orders";
                }

                //------------------------------------------------- GET SHIPPING LINE ----------------------------------------------------

                var HL_shipping_country = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_country' });

                if (HL_shipping_country.length <= 2) 
                {
                    HL_shipping_country = country(HL_shipping_country); // if shipping country in Code then only it's go into function
                }
                if (HL_shipping_country == "Jersey")
                {
                    HL_shipping_country = 'United Kingdom';
                }
                // if (HL_shipping_country == "Croatia")
                // {
                //     HL_Billing_country = 'Croatia / Hrvatska';
                // }
                var HL_market_place = HL_shipping_country;
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
                var HL_shipping_tax_rate = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_tax' });
                var HL_shipping_tax_amount = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_tax_amount' });

                log.debug({
                    title: 'PCT-HL',
                    details: 'HL-Web Order Shipping Data:( Shipping Country :' + HL_shipping_country + ',Shipping Addressee:' + HL_shipping_addressee + ',Shipping Phone No :' + HL_shipping_phone_number + ',Shipping Address1:' + HL_shipping_address1 + ',Shipping Address2 :' + HL_shipping_address2 + ',Shipping City' + HL_shipping_city + ',Shipping State' + HL_shipping_state + ',Shipping Zip : ' + HL_shipping_zip + ',Shipping Address :' + HL_shipping_address + ',Shipping Cost :' + HL_shipping_cost + ',Shipping Method :' + HL_shipping_method + ',Shipping Payment Error :' + HL_shipping_method_error + ",Shipping Tax Rate : " + HL_shipping_tax_rate + ",Shipping Tax Amount : " + HL_shipping_tax_amount + ')'
                });
                //------------------------------------------------- GET BILLING LINE ----------------------------------------------------

                var HL_Billing_phone_number = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_phone' });
                var HL_Billing_country = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_country' });
                if (HL_Billing_country != "" && HL_Billing_country.length <= 2) 
                {
                    var HL_Billing_country = country(HL_Billing_country); // if billing country in Code then only it's go into function
                }
                if (HL_Billing_country == "Jersey")
                {
                    HL_Billing_country = 'United Kingdom';
                }
                // if (HL_Billing_country == "Croatia")
                // {
                //     HL_Billing_country = 'Croatia / Hrvatska';
                // }
                var HL_Billing_addressee = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_addressee' });
                var HL_Billing_address1 = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_address1' });
                var HL_Billing_address2 = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_address2' });
                var HL_Billing_city = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_city' });
                var HL_Billing_state = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_state' });
                var HL_Billing_zip = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_zip' });
                var HL_Billing_address = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_billing_address' });

                log.debug({
                    title: 'PCT-HL',
                    details: 'HL-Web Order Billing Data:( Billing Phone No :' + HL_Billing_phone_number + ',Billing Country :' + HL_Billing_country + ',Billing Addressee :' + HL_Billing_addressee + ',Billing Address1:' + HL_Billing_address1 + ',Billing Address2:' + HL_Billing_address2 + ',Billing City' + HL_Billing_city + ',Billing State' + HL_Billing_state + ',Billing Zip' + HL_Billing_zip + ',Billing Address' + HL_Billing_address + ')'
                });


                //------------------------------------------------- Creating Sales Order ------------------------------------------------
                var salesOrderobj = record.create({
                    type: record.Type.SALES_ORDER,
                    isDynamic: true
                });
                //----------------------------------------------- Check Customer is Present or Not ------------------------
                var HL_customer_id = Create_Customer(HL_customer_name, HL_shipping_country, HL_order_source, HL_customer_phnno, HL_customer_mail, HL_customer_absCid);
                //------------------------------------------------------------------------------------------------------------------------
                salesOrderobj.setValue({ fieldId: 'entity', value: HL_customer_id });
                salesOrderobj.setValue({ fieldId: 'custbody_pct_hl_so_number', value: HL_customer_so_number });
                salesOrderobj.setValue({ fieldId: 'custbody_pct_hl_created_transaction', value: id });
                salesOrderobj.setValue({ fieldId: 'orderstatus', value: "B" });
                salesOrderobj.setValue({ fieldId: 'trandate', value: HL_date_created });
                salesOrderobj.setValue({ fieldId: 'subsidiary', value: 1 });
                // ---------------------------------------------------- Add Location -------------------------------------------------
                // if (HL_order_source == "")
                // {
                //     salesOrderobj.setValue({ fieldId: 'location', value: 12 });
                // }
                salesOrderobj.setValue({ fieldId: 'location', value: 10 });


                //----------------------------------------------------- Add Shipping in Sales Order  -----------------------------------------------------

                var subrec = salesOrderobj.getSubrecord({
                    fieldId: 'shippingaddress'
                });
                // subrec.setText({ fieldId: 'country', text: HL_shipping_country });
                if (HL_shipping_phone_number.length != 0 && HL_shipping_phone_number.length < 7) // if shipping phone no is less than 7digit 
                {
                    HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: " Warning : Shipping Phone no can't be less than 7 digit so in Sales Order we put it as blank " });
                }
                else
                {
                    subrec.setValue({ fieldId: 'addrphone', value: HL_shipping_phone_number });
                }
                subrec.setValue({ fieldId: 'addressee', value: HL_shipping_addressee });
                if (HL_order_source == "magento")
                {
                    subrec.setValue({ fieldId: 'addr1', value: HL_shipping_address });
                }
                else
                {
                    subrec.setValue({ fieldId: 'addr1', value: HL_shipping_address1 });
                }
                subrec.setValue({ fieldId: 'addr2', value: HL_shipping_address2 + " , Country : " + HL_shipping_country });
                subrec.setValue({ fieldId: 'city', value: HL_shipping_city });
                subrec.setText({ fieldId: 'state', text: HL_shipping_state });
                subrec.setValue({ fieldId: 'zip', value: HL_shipping_zip });
                subrec.setValue({ fieldId: 'addrtext', value: HL_shipping_address });
                subrec.setValue({ fieldId: 'override', value: false });

                if (HL_shipping_method == "UK_RoyalMailFirstClassStandard")
                { HL_shipping_method = "Royal Mail 1st Class" }

                var shipping_method_id = shipping_method(HL_shipping_method);
                salesOrderobj.setValue({ fieldId: 'shipmethod', value: shipping_method_id });



                // if (HL_shipping_tax_rate == 20)
                // {
                //     salesOrderobj.setValue({ fieldId: 'shippingtaxcode', value: 7 });
                // }
                // else if (HL_shipping_tax_rate == 5)
                // {
                //     salesOrderobj.setValue({ fieldId: 'shippingtaxcode', value: 8 });
                // }
                // else if (HL_shipping_tax_rate == 0)
                // {
                //     salesOrderobj.setValue({ fieldId: 'shippingtaxcode', value: 9 });
                // }

                // salesOrderobj.setValue({ fieldId: 'shippingtax1rate', value: HL_shipping_tax_rate });
                salesOrderobj.setValue({ fieldId: 'custbody_pct_hl_shipping_tax_amount', value: HL_shipping_tax_amount });

                //----------------------------------------------------- Add Billing in Sales Order -----------------------------------------------------
                salesOrderobj.setValue({
                    fieldId: 'custbody_pct_hl_payment_method',
                    value: PaymentMethodId
                });
                var billing_subrec = salesOrderobj.getSubrecord({
                    fieldId: 'billingaddress'
                });
                //  billing_subrec.setText({ fieldId: 'country', text: HL_Billing_country });
                if (HL_Billing_phone_number.length != 0 && HL_Billing_phone_number.length < 7) // if Billing phone no is less than 7digit 
                {
                    HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: "Warning : Billing Phone no can't be less than 7 digit so in Sales Order we put it as blank" });
                }
                else
                {
                    billing_subrec.setValue({ fieldId: 'addrphone', value: HL_Billing_phone_number });
                }

                billing_subrec.setValue({ fieldId: 'addressee', value: HL_Billing_addressee });
                if (HL_order_source == "magento")
                {
                    billing_subrec.setValue({ fieldId: 'addr1', value: HL_Billing_address });
                }
                else
                {
                    billing_subrec.setValue({ fieldId: 'addr1', value: HL_Billing_address1 });
                }

                billing_subrec.setValue({ fieldId: 'addr2', value: HL_Billing_address2 + " , Country : " + HL_Billing_country });
                billing_subrec.setValue({ fieldId: 'city', value: HL_Billing_city });
                billing_subrec.setText({ fieldId: 'state', text: HL_Billing_state });
                billing_subrec.setValue({ fieldId: 'zip', value: HL_Billing_zip });
                billing_subrec.setValue({ fieldId: 'addrtext', value: HL_Billing_address });
                // ----------------------- Add Item in Sales Odrer ------------------------------------
                var item_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_item' });
                if (item_count == 0)
                {
                    HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: " No Item is there " });
                }
                else
                {
                    var total_item_count = 0;
                    var count = 0;
                    for (item_index = 0; item_index < item_count; item_index++)
                    {
                        var HL_item_id = HL_WO_id_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                            fieldId: 'custrecord_pct_hl_item_id',
                            line: item_index
                        });
                        var HL_line_item_id = HL_WO_id_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                            fieldId: 'custrecord_pct_hl_line_item_id',
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
                        var HL_item_net = HL_WO_id_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                            fieldId: 'custrecord_pct_hl_net',
                            line: item_index
                        });
                        var HL_item_tax_percentage = HL_WO_id_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                            fieldId: 'custrecord_pct_hl_tax_percentage',
                            line: item_index
                        });
                        var HL_item_discount = HL_WO_id_load.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                            fieldId: 'custrecord_pct_hl_item_discount',
                            line: item_index
                        });
                        log.debug({
                            title: "PCT-HL",
                            details: "HL Web Order Item Details: ( Item Name/Id : " + HL_item_id + ", HL Line Item Id : " + HL_line_item_id + ", Item Quantity : " + HL_item_quantity + ", Item Rate : " + HL_item_rate + ", Item Tax Percentage : " + HL_item_tax_percentage + " , Item NET Value :" + HL_item_net + "Item Discount : " + HL_item_discount + " )"
                        })
                        var HL_item_internal_id = search_item(HL_item_id, HL_item_rate)
                        if (HL_item_internal_id == 0)
                        {
                            count++;
                            break;
                        }
                        else
                        {
                            //------------------------------------------------ Add Item in Sales Order --------------------------------------
                            salesOrderobj.selectNewLine({ sublistId: 'item' });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: HL_item_internal_id,
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_pct_hl_line_item_id',
                                value: HL_line_item_id,
                            });


                            if (HL_market_place.length > 2) 
                            {
                                HL_market_place = country(HL_market_place); // If Market PLace with name it will return the Code Only 
                            }
                            log.debug({
                                title: "PCT-HL",
                                details: "After : " + HL_market_place
                            })
                            var tax_obj = getTaxPercent(HL_item_tax_percentage, HL_market_place);
                            log.debug({
                                title: "PC-HL",
                                details: "For Item " + HL_item_id + ", Tax code we put : " + tax_obj.id
                            })
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });


                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: HL_item_quantity
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'price',
                                value: -1
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: HL_item_rate
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_pct_hl_item_discount',
                                value: HL_item_discount,
                            });
                            // log.debug({
                            //     title: "PCT-HL",
                            //     details: " Before : " + HL_market_place
                            // })

                            // if (HL_shipping_country == 'United Kingdom' && HL_item_tax_percentage == 0)
                            // {
                            //     salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: 9 });
                            // }
                            // else if (HL_shipping_country == 'United Kingdom' && HL_item_tax_percentage == 20)
                            // {
                            //     salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: 7 });
                            // }
                            // else
                            // {
                            //     salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: 5 });
                            // }
                            salesOrderobj.commitLine({ sublistId: 'item' });
                            var get_tax = salesOrderobj.getSublistValue({ sublistId: 'item', fieldId: 'taxcode', line: item_index });
                            log.debug({
                                title: "PCT-Shopify-Integration",
                                details: "Getting Tax Code after : " + get_tax + " for Item : " + HL_item_id
                            })
                        }

                    }
                    if (count != 0)
                    {
                        HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: " Item is not Present in Netsuite " });
                    }
                    else
                    {
                        //  -------------------------------------- For Magento Order ---------------------------------------------
                        if (HL_order_source == "magento")
                        {
                            salesOrderobj.selectNewLine({ sublistId: 'item' });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: 2042
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'price',
                                value: -1
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: HL_discount
                            });
                            var tax_obj = getTaxPercent(0, HL_market_place);
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
                            //   salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: 5 });
                            salesOrderobj.commitLine({ sublistId: 'item' });
                        }

                        //----------------------------------------------------- Add Promotion Sales Order -----------------------------------------------------

                        var promotion_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code' });
                        log.debug({ title: "PCT-HL", details: "Promotion Count :" + promotion_count })
                        for (promotion_index = 0; promotion_index < promotion_count; promotion_index++)
                        {
                            var HL_Promotion_coupon_code = HL_WO_id_load.getSublistValue({
                                sublistId: 'recmachcustrecord_pct_hl_link_to_promo_code',
                                fieldId: 'custrecord_pct_hl_coupon_code',
                                line: promotion_index
                            });
                            // log.debug({
                            //     title: "PCT-HL-Promotion",
                            //     details: "Promotion Coupon Code : " + HL_Promotion_coupon_code
                            // })
                            // ---------------------------------------------------------- Promotion Search -------------------------------------------------
                            var promotioncodeSearchObj = search.create({
                                type: "promotioncode",
                                filters:
                                    [
                                        ["code", "is", HL_Promotion_coupon_code]
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
                            var PromotionResult = promotioncodeSearchObj.run().getRange({ start: 0, end: PromotionCount });
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
                        //  var HL_totalAmount_withShipping = HL_subtotal + HL_shipping_cost + HL_shipping_tax_amount;
                        // var HL_totalAmount = HL_subtotal - Math.abs(HL_discount);
                        var tax_obj = getTaxPercent(HL_shipping_tax_rate, HL_market_place);
                        if (tax_obj.id == 0)
                        {
                            HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: " Shipping Tax Mixmatch " });
                            log.debug({
                                title: "PCT-HL",
                                details: "Can't Create Sales Order becaue Shipping Tax Mismatch "
                            });
                        }

                        salesOrderobj.setValue({ fieldId: 'shippingtaxcode', value: tax_obj.id });
                        log.debug({
                            title: "PCT-HL",
                            details: "Shipping Tax : " + tax_obj.id
                        });
                        salesOrderobj.setValue({ fieldId: 'shippingcost', value: HL_shipping_cost });



                        var HL_totalAmount = HL_subtotal;
                        var SO_Total_Amount = salesOrderobj.getValue({ fieldId: 'total' });
                        log.debug({
                            title: "PCT_HL",
                            details: "HL Record Total Amount : " + HL_totalAmount + " & Sales Order Total Amount : " + SO_Total_Amount
                        })
                        // --------------------------- If there are present Price difference between Custom Record & Sales Order
                        amountDiff = - (SO_Total_Amount - HL_totalAmount);
                        if (Math.abs(amountDiff).toFixed(2) != 0.00)
                        // if ( )
                        {
                            log.debug({
                                title: "PCT_L",
                                details: "Adjustment Amount : " + amountDiff
                            })
                            //var amountDiff = Math.abs((HL_totalAmount-SO_Total_Amount));
                            salesOrderobj.selectNewLine({ sublistId: 'item' });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: 2272
                            });
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'price',
                                value: -1
                            });
                            if (SO_Total_Amount > HL_totalAmount)
                            {
                                amountDiff = - (SO_Total_Amount - HL_totalAmount);
                            }
                            else
                            {
                                amountDiff = HL_totalAmount - SO_Total_Amount;
                            }
                            salesOrderobj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: amountDiff
                            });
                            var tax_obj = getTaxPercent(0, HL_market_place);
                            salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
                            //  salesOrderobj.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: 5 });
                            salesOrderobj.commitLine({ sublistId: 'item' });
                        }

                        if (total_item_count > 0)
                        {
                            var alredy_created = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_created_transaction' });
                            var so_created_checkbox = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_sales_order_created' });
                            // --------------------- Serach for checking the that with that order number no Sales Order present in Netsuite-----------------
                            var salesorderSearchObj = search.create({
                                type: "salesorder",
                                filters:
                                    [
                                        ["type", "anyof", "SalesOrd"],
                                        "AND",
                                        ["mainline", "is", "T"],
                                        "AND",
                                        ["custbody_pct_hl_so_number", "is", HL_customer_so_number]
                                    ],
                                columns:
                                    [
                                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                                        search.createColumn({ name: "entity", label: "Name" }),
                                        search.createColumn({ name: "tranid", label: "Document Number" })
                                    ]
                            });
                            var so_orderno_count = salesorderSearchObj.runPaged().count;
                            log.debug("PCT-HL", "Already Created : " + alredy_created + ", Sales Order Created Checkbox : " + so_created_checkbox + ", Order Number Present Result Count : " + so_orderno_count);
                            var searchresult = salesorderSearchObj.run().getRange({ start: 0, end: so_orderno_count });
                            for (var i = 0; i < so_orderno_count; i++)
                            {
                                var already_so_number = searchresult[i].getValue({ name: "tranid" });
                            }

                            if (!alredy_created && !so_created_checkbox && so_orderno_count == 0)
                            {
                                var salesorder = salesOrderobj.save();
                                log.debug({ title: 'PCT-HL', details: 'New Created Sales Order Id:' + salesorder });
                                // var get_tax = salesOrderobj.getSublistValue({ sublistId: 'item', fieldId: 'taxcode', line: 2 });
                                // log.debug({
                                //     title: "PCT-Shopify-Integration",
                                //     details: "Tax Code after SO Save : " + get_tax
                                // })

                                // var billId = transformRecord.save();
                                // log.debug({ title: 'PCT-HL', details: 'New Created Billind :' + billId });
                                HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_sales_order_created', value: true });
                                HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_created_transaction', value: salesorder });
                                HL_WO_id_load.setValue({ fieldId: 'custrecord_pct_hl_so_error_message', value: null });

                            }
                            else
                            {
                                log.debug({ title: 'PCT-HL', details: 'Already Present Sales Order Number :' + already_so_number });
                                HL_WO_id_load.setValue({
                                    fieldId: 'custrecord_pct_hl_so_error_message',
                                    value: 'Sales Order is already Present & Sales Oder Number : ' + already_so_number
                                });
                            }
                        }
                        else
                        {
                            log.debug({
                                title: 'PCT-HL',
                                details: 'Error Message : Can Not Create a Sales Order Because of less Item or Sales Order alreday present '
                            });
                            HL_WO_id_load.setValue({
                                fieldId: 'custrecord_pct_hl_so_error_message',
                                value: 'Sales Order can not be created because total Item Qty is 0'
                            });
                        }
                    }
                }

                // -------------------------------------------------------------- For Email Sending of Error Message ---------------------------------------------------

                var value_have = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_so_error_message' });
                if (value_have) 
                {
                    var userObj = runtime.getCurrentUser();
                    log.debug({ title: 'PCT-HL', details: 'Internal ID of current user: ' + userObj.id });
                    email.send({
                        author: -5,
                        //recipients: ["support@healthleadsuk.com", "james@healthleadsuk.com", "accounts@healthleadsuk.com"],
                        recipients: ["sandipan.paapri@gmail.com"],
                        cc: ["rnandi@paapri.com", "sandipan.paapri@gmail.com"],
                        subject: 'Health Leads Sales Order Create Error',
                        body: "Health Leads Sales Order Can Not be Created of Web Order Reocord Id " + id.bold().fontsize("3") + " & " + HL_order_source + ' order number : ' + HL_customer_so_number.bold().fontsize("3") + " , because of " + value_have.bold().fontcolor("#FF0000").fontsize("4")
                    });
                    log.debug({ title: 'PCT-HL', details: 'Mail Sent' });
                }
                HL_WO_id_load.save();



            }

            catch (ex)
            {
                log.error({ title: 'PCT-HL-WF-ERROR', details: "In Catch : " + ex });
            }


            function getTaxPercent(MEGLIO_item_taxPer, countryCode)
            {
                MEGLIO_item_taxPer = parseFloat(MEGLIO_item_taxPer).toFixed(2);
                log.debug({
                    title: "PCT-HL",
                    details: "In getTaxPercent Function, Item Tax Percentage : " + MEGLIO_item_taxPer + ", Country Code : " + countryCode
                });
                if (MEGLIO_item_taxPer == '' || MEGLIO_item_taxPer == null || isNaN(MEGLIO_item_taxPer))
                {
                    MEGLIO_item_taxPer = 0;
                }
                var salestaxitemSearchObj = search.create({
                    type: "salestaxitem",
                    filters: [
                        ["country", "anyof", countryCode]
                    ],
                    columns: [
                        search.createColumn({
                            name: "name",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "itemid",
                            label: "Item ID"
                        }),
                        search.createColumn({
                            name: "rate",
                            label: "Rate"
                        }),
                        search.createColumn({
                            name: "country",
                            label: "Country"
                        }),

                        search.createColumn({
                            name: "state",
                            label: "State/Province/County"
                        }),
                        search.createColumn({
                            name: "county",
                            label: "County"
                        }),
                        search.createColumn({
                            name: "zip",
                            label: "Zip"
                        }),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "ABS(" + MEGLIO_item_taxPer + "-{rate})",
                            sort: search.Sort.ASC,
                            label: "Formula (Numeric)"
                        })
                    ]
                });
                var taxDetailObj = new Object();
                var item;
                var searchResultCount = salestaxitemSearchObj.runPaged().count;
                log.debug("salestaxitemSearchObj result count", searchResultCount);
                if (searchResultCount == 0)
                {
                    taxDetailObj.id = 10;
                    taxDetailObj.taxName = "E-GB";
                    taxDetailObj.taxRate = "0.0%"

                    log.debug({
                        title: 'TAX DETAILS',
                        details: taxDetailObj
                    })
                }
                else
                {
                    salestaxitemSearchObj.run().each(function (result)
                    {
                        // .run().each has a limit of 4,000 results
                        //return true;
                        item = result.id;
                        var taxCodeName = result.getValue('name');
                        var taxCodeRate = result.getValue('rate');

                        taxDetailObj.id = item;
                        taxDetailObj.taxName = taxCodeName;
                        taxDetailObj.taxRate = taxCodeRate
                    });
                    log.debug({
                        title: 'TAX DETAILS',
                        details: taxDetailObj
                    })
                }
                return taxDetailObj;
            }

        }
        return {
            onAction: onAction
        }
    });




