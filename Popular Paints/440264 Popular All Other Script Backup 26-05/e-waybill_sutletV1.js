define(["N/ui/dialog", 'N/ui/serverWidget', 'N/search', 'N/redirect', 'N/record', "N/url",
        "N/http", "N/https", "N/ui/message", "N/format", 'N/render', 'N/file', 'N/log', 'N/encode'
    ],

    function(dialog, serverWidget, search, redirect, record, url, http, https, message, format, render, file, log, encode) {
        /**
         * Module Description...
         *
         * @exports XXX
         *
         * @copyright 2019 ${organization}
         * @author ${author} <${email}>
         *
         * @NApiVersion 2.x
         * @NScriptType Suitelet
         */
        var exports = {};

        function onRequest(context) {
            var request = context.request;
            var response = context.response;
            var transPrintid = (context.request.parameters.transPrintid);
            var record_type = (context.request.parameters.record_type);
            record_type == 'custcred' ? record_type = 'creditmemo' : record_type = 'invoice';
            main_function(context, transPrintid, record_type);
        }

        function main_function(context, transPrintid, record_type) {
            try {
                var response = context.response;
                var invoice_obj = record.load({
                    type: record_type,
                    id: transPrintid,
                    isDynamic: true
                });
                var search_tran;
                var search_type;
                var docType;
                var document_type;
                var subsidiarytaxregnum = invoice_obj.getText('subsidiarytaxregnum').split(' ')[0];
                //subsidiarytaxregnum = subsidiarytaxregnum.substring(0, 2);
                var custbody_in_inter_intra_flg = invoice_obj.getValue('custbody_in_inter_intra_flg'); //split
                var transporter_id = invoice_obj.getValue('custbody_transporter_id');
                var transporter_name = invoice_obj.getText('custbody_transporter_name');
                var transporter_document_number = invoice_obj.getValue('custbody_transporter_document_number');
                var transporter_document_date = invoice_obj.getText('custbody_transporter_document_date');
                var transportation_mode = invoice_obj.getValue('custbody_transporter_mode');
                var transportation_distance = invoice_obj.getValue('custbody_transporter_distance');
                var vehicle_number = invoice_obj.getValue('custbody_vehicle_number');
                var vehicle_type = invoice_obj.getText('custbody_vehicle_type');
                custbody_in_inter_intra_flg = custbody_in_inter_intra_flg.split('-')[0];
                var homyar_docno = invoice_obj.getValue('custbody_inoday_homyar_docno');
                var trandate = invoice_obj.getText('trandate');
                var entity = invoice_obj.getText('entity');
                var place_of_supply = invoice_obj.getText('custbody_in_gst_pos');
                var custbody_eway_bill_number = invoice_obj.getValue('custbody_eway_bill_number');
                var custbody_eway_bill_response = invoice_obj.getValue('custbody_eway_bill_response');
                if (custbody_eway_bill_response == '1' && custbody_eway_bill_number) {
                    try {
                        var token_val = get_token(https);
                        var headers = [];
                        headers['Content-Type'] = 'application/json';
                        headers['Accept'] = 'application/json';
                        var request_data = {
                            "access_token": token_val,
                            "userGstin": subsidiarytaxregnum,
                            "eway_bill_number": parseInt(custbody_eway_bill_number),
                            "reason_of_cancel": "Others",
                            "cancel_remark": "Cancelled the order",
                            "data_source": "erp"
                        };
                        var postRequest = https.post({
                            url: 'https://pro.mastersindia.co/ewayBillCancel',
                            headers: headers,
                            body: JSON.stringify(request_data)
                        })
                        var stXMLRequest = JSON.parse(postRequest.body);
                        log.debug('stXMLRequest', stXMLRequest);
                        var status = stXMLRequest.results.code;
                        if (status == '200') {
                            record.submitFields({
                                "type": record_type,
                                "id": transPrintid,
                                "values": {
                                    "custbody_eway_bill_response": "",
                                    "custbody_eway_bill_number": '',
                                    "custbody_eay_pdf_url": '',
                                    "custbody_eway_bill_error": ''
                                }
                            });
                        } else {
                            record.submitFields({
                                "type": record_type,
                                "id": transPrintid,
                                "values": {
                                    "custbody_eway_bill_error": JSON.stringify(stXMLRequest.results.errorMessage)
                                }
                            });
                        }
                        if (record_type == 'invoice') {
                            redirect.redirect({
                                url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custinvc.nl?id=' + transPrintid + '&whence='
                            });
                        } else {
                            redirect.redirect({
                                url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custcred.nl?id=' + transPrintid + '&whence='
                            });
                        }
                    } catch (e) {
                        record.submitFields({
                            "type": record_type,
                            "id": transPrintid,
                            "values": {
                                "custbody_eway_bill_error": "Error in Netsuite Record-" + JSON.stringify(e.message)
                            }
                        });
                        if (record_type == 'invoice') {
                            redirect.redirect({
                                url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custinvc.nl?id=' + transPrintid + '&whence='
                            });
                        } else {
                            redirect.redirect({
                                url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custcred.nl?id=' + transPrintid + '&whence='
                            });

                        }
                    }
                } else {
                    if (place_of_supply) {
                        place_of_supply = place_of_supply.split('-')[0];
                    }
                    var location_id = invoice_obj.getValue('location');
                    //    var location_id = invoice_obj.getValue('subsidiary');
                    var entitytaxregnum = invoice_obj.getText('entitytaxregnum');
                    var total = invoice_obj.getValue('total');
                    var total_tax = invoice_obj.getValue('taxtotal');
                    var subtotal = invoice_obj.getValue('subtotal');
                    var tranid = invoice_obj.getValue('tranid');
                    var igst_taxtotal = invoice_obj.getValue('taxtotal2') == undefined ? 0.00 : invoice_obj.getValue('taxtotal2');
                    var cgst_taxtotal = invoice_obj.getValue('taxtotal3') == undefined ? 0.00 : invoice_obj.getValue('taxtotal3');
                    var sgst_taxtotal = invoice_obj.getValue('taxtotal4') == undefined ? 0.00 : invoice_obj.getValue('taxtotal4');
                    var legalname;
                    var city;
                    var state;
                    var country;
                    var zip;
                    var address1;
                    var address2;
                    var legalname;
                    var billaddr1;
                    var billaddr2;
                    var billcity;
                    var billstate;
                    var billzip;
                    var subsidiarySearchObj = search.create({
                        type: "location",
                        filters: [
                            ["internalid", "anyof", location_id]
                        ],
                        columns: [
                            search.createColumn({
                                name: "addressee",
                                join: "address",
                                label: " Addressee"
                            }),
                            search.createColumn({
                                name: "city",
                                join: "address",
                                label: " City"
                            }),
                            search.createColumn({
                                name: "state",
                                join: "address",
                                label: " State"
                            }),
                            search.createColumn({
                                name: "country",
                                join: "address",
                                label: "Country"
                            }),
                            search.createColumn({
                                name: "address1",
                                join: "address",
                                label: " Address 1"
                            }),
                            search.createColumn({
                                name: "address2",
                                join: "address",
                                label: " Address 2"
                            }),
                            search.createColumn({
                                name: "address3",
                                join: "address",
                                label: " Address 3"
                            }),
                            search.createColumn({
                                name: "zip",
                                join: "address",
                                label: " Zip"
                            })
                        ]
                    });
                    subsidiarySearchObj.run().each(function(result) {
                        legalname = result.getValue({
                            name: "addressee",
                            join: "address",
                            label: " Addressee"
                        });
                        city = result.getValue({
                            name: "city",
                            join: "address",
                            label: " City"
                        });
                        state = result.getValue({
                            name: "state",
                            join: "address",
                            label: " State"
                        });
                        if (state) {
                            state = state.split('-')[0];
                        }
                        country = result.getValue({
                            name: "country",
                            join: "address",
                            label: "Country"
                        });
                        zip = result.getValue({
                            name: "zip",
                            join: "address",
                            label: " Zip"
                        });
                        address1 = result.getValue({
                            name: "address1",
                            join: "address",
                            label: " Address 1"
                        });
                        address2 = result.getValue({
                            name: "address2",
                            join: "address",
                            label: " Address 2"
                        });
                    });
                    record_type == 'creditmemo' ? search_type = 'CustCred' : search_type = 'CustInvc';
                    record_type == 'creditmemo' ? docType = 'C' : docType = 'RI';
                    var invoiceSearchObj = search.create({
                        type: record_type,
                        filters: [
                            ["type", "anyof", search_type],
                            "AND",
                            ["internalid", "anyof", transPrintid],
                            "AND",
                            ["mainline", "is", "T"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "address1",
                                join: "shippingAddress",
                                label: " Address 1"
                            }),
                            search.createColumn({
                                name: "address2",
                                join: "shippingAddress",
                                label: " Address 2"
                            }),
                            search.createColumn({
                                name: "city",
                                join: "shippingAddress",
                                label: " City"
                            }),
                            search.createColumn({
                                name: "zip",
                                join: "shippingAddress",
                                label: " Zip"
                            }),
                            search.createColumn({
                                name: "billstate",
                                label: "Billing State/Province"
                            })
                        ]
                    });
                    invoiceSearchObj.run().each(function(result) {
                        billaddr1 = result.getValue({
                            name: "address1",
                            join: "shippingAddress",
                            label: " Address 1"
                        });
                        billaddr2 = result.getValue({
                            name: "address2",
                            join: "shippingAddress",
                            label: " Address 2"
                        });
                        billcity = result.getValue({
                            name: "city",
                            join: "shippingAddress",
                            label: " City"
                        });

                        billstate = result.getValue({
                            name: "billstate",
                            label: "Billing State/Province"
                        })
                        if (billstate) {
                            billstate = billstate.split('-')[0];
                        }
                        billzip = result.getValue({
                            name: "zip",
                            join: "shippingAddress",
                            label: " Zip"
                        });
                    });
                    var request_data = {
                        "access_token": "",
                        "userGstin": subsidiarytaxregnum,
                        "supply_type": "Outward",
                        "sub_supply_type": "Supply",
                        // "sub_supply_description": supply_type,
                        "document_type": "Tax Invoice",
                        "document_number": tranid,
                        "document_date": trandate,
                        "gstin_of_consignor": subsidiarytaxregnum,
                        "legal_name_of_consignor": 'POPULAR PAINTS AND CHEMICALS',
                        "address1_of_consignor": address1,
                        "address2_of_consignor": address2,
                        "place_of_consignor": null,
                        "pincode_of_consignor": zip,
                        "state_of_consignor": state,
                        "actual_from_state_name": state,
                        "gstin_of_consignee": entitytaxregnum ? entitytaxregnum : entitytaxregnum = 'URP',
                        "legal_name_of_consignee": entity,
                        "address1_of_consignee": billaddr1,
                        "address2_of_consignee": billaddr2,
                        "place_of_consignee": billstate,
                        "pincode_of_consignee": billzip,
                        "state_of_supply": place_of_supply,
                        "actual_to_state_name": place_of_supply,
                        "transaction_type": "",
                        "other_value": "",
                        "total_invoice_value": parseFloat(total),
                        "taxable_amount": parseFloat(subtotal),
                        "cgst_amount": 0,
                        "sgst_amount": 0,
                        "igst_amount": 0,
                        "cess_amount": "0",
                        "cess_nonadvol_value": "0",
                        "transporter_id": transporter_id,
                        "transporter_name": transporter_name,
                        "transporter_document_number": transporter_document_number,
                        "transporter_document_date": transporter_document_date,
                        "transportation_mode": transportation_mode,
                        "transportation_distance": transportation_distance,
                        "vehicle_number": vehicle_number,
                        "vehicle_type": vehicle_type,
                        "generate_status": "1",
                        "data_source": "erp",
                        "user_ref": "",
                        "location_code": "SINGRAULI",
                        "eway_bill_status": '',
                        "auto_print": "Y",
                        "email": "",
                        "itemList": []
                    };
                    var round_off = 0;
                    var taxamount = 0;
                    var total_accessable_amount = 0;
                    var total_cgst = 0;
                    var total_sgst = 0;
                    var total_igst = 0;
                    for (var i = 0; i < invoice_obj.getLineCount({
                            "sublistId": "item"
                        }); i++) {
                        var itemName = invoice_obj.getSublistText({
                            sublistId: "item",
                            fieldId: "item",
                            line: i
                        });
                        var item_id = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "item",
                            line: i
                        });
                        var line_id = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "id",
                            line: i
                        });
                        var itemDescription = invoice_obj.getSublistText({
                            sublistId: "item",
                            fieldId: "description",
                            line: i
                        });
                        var sacorhsncode = invoice_obj.getSublistText({
                            sublistId: "item",
                            fieldId: "custcol_in_hsn_code",
                            line: i
                        });
                        var itemQuantity = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "quantity",
                            line: i
                        });
                        var itemRate = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "rate",
                            line: i
                        });
                        var grossamt = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "grossamt",
                            line: i
                        });
                        taxamount = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "taxamount",
                            line: i
                        });
                        var itemAmount = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            line: i
                        });
                        var description = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "description",
                            line: i
                        });
                        if (item_id == '12597') {
                            var roundoffAmount = invoice_obj.getSublistValue({
                                sublistId: "item",
                                fieldId: "amount",
                                line: i
                            });
                            round_off = roundoffAmount;
                        }

                        var igstRate = 0.00;
                        var cgstRate = 0.00;
                        var sgstRate = 0.00;
                        var igstAmt = 0.00;
                        var cgstAmt = 0.00;
                        var sgstAmt = 0.00;
                        var total_gst = 0;
                        for (var j = 0; j < invoice_obj.getLineCount({
                                "sublistId": "taxdetails"
                            }); j++) {
                            var taxdetailsreference = invoice_obj.getSublistText({
                                sublistId: "taxdetails",
                                fieldId: "taxdetailsreference",
                                line: j
                            });
                            var taxtype = invoice_obj.getSublistValue({
                                sublistId: "taxdetails",
                                fieldId: "taxtype",
                                line: j
                            });

                            if (line_id == taxdetailsreference && taxtype == 2) //IGST
                            {
                                igstRate = invoice_obj.getSublistValue({
                                    sublistId: "taxdetails",
                                    fieldId: "taxrate",
                                    line: j
                                });
                                total_gst += parseFloat(igstRate);
                                igstAmt = invoice_obj.getSublistValue({
                                    sublistId: "taxdetails",
                                    fieldId: "taxamount",
                                    line: j
                                });
                            }
                            if (line_id == taxdetailsreference && taxtype == 3) //CGST
                            {
                                cgstRate = invoice_obj.getSublistValue({
                                    sublistId: "taxdetails",
                                    fieldId: "taxrate",
                                    line: j
                                });
                                total_gst += parseFloat(cgstRate);
                                cgstAmt = invoice_obj.getSublistValue({
                                    sublistId: "taxdetails",
                                    fieldId: "taxamount",
                                    line: j
                                });
                            }
                            if (line_id == taxdetailsreference && taxtype == 4) //SGST
                            {
                                sgstRate = invoice_obj.getSublistValue({
                                    sublistId: "taxdetails",
                                    fieldId: "taxrate",
                                    line: j
                                });
                                total_gst += parseFloat(sgstRate);
                                sgstAmt = invoice_obj.getSublistValue({
                                    sublistId: "taxdetails",
                                    fieldId: "taxamount",
                                    line: j
                                });
                            }
                        }
                        if (item_id != '12597') {
                            var itemListArray = {
                                "product_name": itemName,
                                "product_description": description,
                                "hsn_code": sacorhsncode,
                                "quantity": parseInt(itemQuantity),
                                "unit_of_product": 'NOS',
                                "cgst_rate": cgstRate,
                                "sgst_rate": sgstRate,
                                "igst_rate": igstRate,
                                "cess_rate": "0",
                                "cessNonAdvol": "0",
                                "taxable_amount": itemAmount
                            };

                            request_data.itemList.push(itemListArray);
                            total_accessable_amount += parseFloat(itemAmount);
                            total_cgst += parseFloat(cgstAmt);
                            total_sgst += parseFloat(sgstAmt);
                            total_igst += parseFloat(igstAmt);
                        }
                    }
                    request_data.cgst_amount = total_cgst;
                    request_data.sgst_amount = total_sgst;
                    request_data.igst_amount = total_igst;
                    var tokken_val = get_token(https);
                    request_data.access_token = tokken_val;
                    log.debug('request_data', request_data);
                    var headers = [];
                    headers['Content-Type'] = 'application/json';
                    headers['Accept'] = 'application/json';
                    var postRequest = https.post({
                        url: 'https://pro.mastersindia.co/ewayBillsGenerate',
                        headers: headers,
                        body: JSON.stringify(request_data)
                    })
                    var stXMLRequest = JSON.parse(postRequest.body);
                    log.debug('stXMLRequest', stXMLRequest);
                    var status = stXMLRequest.results.code;
                    if (status == '200') {
                        var bill_pdf = stXMLRequest.results.message.url;
                        var eway_billno = stXMLRequest.results.message.ewayBillNo;
                        record.submitFields({
                            "type": record_type,
                            "id": transPrintid,
                            "values": {
                                "custbody_eway_bill_response": "1",
                                "custbody_eway_bill_number": JSON.stringify(eway_billno),
                                "custbody_eay_pdf_url": bill_pdf,
                                "custbody_eway_bill_error": ""
                            }
                        });
                    } else if (status == '204') {
                        log.debug("FAILURE Error", stXMLRequest.results.message);
                        record.submitFields({
                            "type": record_type,
                            "id": transPrintid,
                            "values": {
                                "custbody_eway_bill_response": "",
                                "custbody_eway_bill_error": stXMLRequest.results.message
                            }
                        });
                    }
                    if (record_type == 'invoice') {
                        redirect.redirect({
                            url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custinvc.nl?id=' + transPrintid + '&whence=&cmid=1628230206628_2374'
                        });
                    } else {
                        redirect.redirect({
                            url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custcred.nl?id=' + transPrintid + '&whence='
                        });

                    }
                }
            } catch (e) {
                record.submitFields({
                    "type": record_type,
                    "id": transPrintid,
                    "values": {
                        "custbody_eway_bill_error": "Error in Netsuite Record-" + JSON.stringify(e.message)
                    }
                });
                if (record_type == 'invoice') {
                    redirect.redirect({
                        url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custinvc.nl?id=' + transPrintid + '&whence=&cmid=1628230206628_2374'
                    });
                } else {
                    redirect.redirect({
                        url: 'https://7255402.app.netsuite.com/app/accounting/transactions/custcred.nl?id=' + transPrintid + '&whence='
                    });

                }
            }

        }

        exports.onRequest = onRequest;
        return exports;
    }
);

function get_token(https) {
    var headers = [];
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    var data = {
        "username": "Popular@iappc.in",
        "password": "Popular@12345",
        "client_id": "lOBqFHsbysxYMwrLsZ",
        "client_secret": "GkjnwSgPLcUlnU5nTOnSEgBK",
        "grant_type": "password"
    };
    var postRequest = https.post({
        url: 'https://pro.mastersindia.co/oauth/access_token',
        headers: headers,
        body: JSON.stringify(data)
    })
    var response_data = JSON.parse(postRequest.body);
    var tokken_val = response_data.access_token;
    return tokken_val;
}