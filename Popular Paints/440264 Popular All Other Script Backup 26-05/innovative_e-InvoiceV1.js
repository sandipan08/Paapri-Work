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
                custbody_in_inter_intra_flg = custbody_in_inter_intra_flg.split('-')[0];
                var homyar_docno = invoice_obj.getValue('custbody_inoday_homyar_docno');
                var trandate = invoice_obj.getText('trandate');
                var entity = invoice_obj.getText('entity');
                var place_of_supply = invoice_obj.getText('custbody_in_gst_pos');
                var e_invoice_res = invoice_obj.getValue('custbody_einvoice_response');
                var irn_no = invoice_obj.getValue('custbody_irn_no');
                if (e_invoice_res == '1' && irn_no) {
                    try {
                        var token_val = get_token(https);
                        var headers = [];
                        headers['Content-Type'] = 'application/json';
                        headers['Accept'] = 'application/json';
                        var request_data = {
                            "access_token": token_val,
                            "user_gstin": subsidiarytaxregnum,
                            "irn": irn_no,
                            "cancel_reason": "1",
                            "cancel_remarks": "Wrong entry"
                        };
                        var postRequest = https.post({
                            url: 'https://pro.mastersindia.co/cancelEinvoice',
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
                                    "custbody_einvoice_response": "",
                                    "custbody_einvoice_qrcode": '',
                                    "custbody_irn_no": '',
                                    "custbody_einvoice_error": ''
                                }
                            });
                        } else {
                            record.submitFields({
                                "type": record_type,
                                "id": transPrintid,
                                "values": {
                                    "custbody_einvoice_error": JSON.stringify(stXMLRequest.results.errorMessage)
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
                                "custbody_einvoice_error": "Error in Netsuite Record-" + JSON.stringify(e.message)
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
                    if (record_type == 'creditmemo') {
                        document_type = 'CRN';
                    } else {
                        document_type = 'INV';
                    }
                    var request_data = {
                        "access_token": "",
                        "user_gstin": subsidiarytaxregnum,
                        "data_source": "erp",
                        "transaction_details": {
                            "supply_type": "B2B",
                            "charge_type": "N",
                            "igst_on_intra": "N",
                            "ecommerce_gstin": ""
                        },

                        "document_details": {
                            "document_type": document_type,
                            "document_number": tranid,
                            "document_date": trandate
                        },
                        "seller_details": {
                            "gstin": subsidiarytaxregnum,
                            "legal_name": 'POPULAR PAINTS AND CHEMICALS',
                            "trade_name": 'POPULAR PAINTS AND CHEMICALS',
                            "address1": address1,
                            "address2": address2,
                            "location": city,
                            "pincode": zip,
                            "state_code": state, //state code
                            "phone_number": 9876543231, //phone
                            "email": ""
                        },
                        "buyer_details": {
                            "gstin": entitytaxregnum,
                            "legal_name": entity,
                            "trade_name": entity,
                            "address1": billaddr1,
                            "address2": billaddr2,
                            "location": billcity,
                            "pincode": billzip,
                            "place_of_supply": place_of_supply,
                            "state_code": billstate,
                            "phone_number": 9876543231,
                            "email": ""
                        },
                        "dispatch_details": {
                            "company_name": 'POPULAR PAINTS AND CHEMICALS',
                            "address1": address1,
                            "address2": address2,
                            "location": city,
                            "pincode": zip,
                            "state_code": state
                        },
                        "ship_details": {
                            "gstin": entitytaxregnum,
                            "legal_name": entity,
                            "trade_name": entity,
                            "address1": billaddr1,
                            "address2": billaddr2,
                            "location": billcity,
                            "pincode": billzip,
                            "state_code": billstate
                        },
                        "export_details": {
                            "ship_bill_number": "",
                            "ship_bill_date": "12/08/2021",
                            "country_code": "IN",
                            "foreign_currency": "INR",
                            "refund_claim": "N",
                            "port_code": "",
                            "export_duty": 2534.34
                        },
                        "value_details": {
                            "total_assessable_value": 0,
                            "total_cgst_value": parseFloat(cgst_taxtotal),
                            "total_sgst_value": parseFloat(sgst_taxtotal),
                            "total_igst_value": parseFloat(igst_taxtotal),
                            "total_cess_value": 0,
                            "total_cess_value_of_state": 0,
                            "total_discount": 0,
                            "total_other_charge": 0,
                            "total_invoice_value": parseFloat(total),
                            "round_off_amount": 0,
                            "total_invoice_value_additional_currency": 0
                        },
                        "reference_details": {
                            "invoice_remarks": "Invoice Remarks",
                            "document_period_details": {
                                "invoice_period_start_date": "2021-08-06",
                                "invoice_period_end_date": "2021-08-07"
                            },
                            "preceding_document_details": [{
                                "reference_of_original_invoice": "CFRT/0006",
                                "preceding_invoice_date": "07/03/2020",
                                "other_reference": "2334"
                            }]
                        },
                        "item_list": []
                    };
                    var round_off = 0;
                    var total_accessable_amount = 0;
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
                        //var custcol_in_hsn_code = invoice_obj.getSublistText({
                        //  sublistId: "item",
                        //fieldId: "custcol_in_hsn_code",
                        //line: i
                        //});
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

                        var itemAmount = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            line: i
                        });
                        var is_service = invoice_obj.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_in_nature_of_item",
                            line: i
                        });
                        if(is_service=='1')
                          {
                            is_service='N';
                          }
                          else if(is_service=='3')
                            {
                              is_service='Y';
                            }
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
                                "item_serial_number": (i + 1),
                                "product_description": description,
                                "is_service": is_service,
                                "hsn_code": sacorhsncode,
                                "bar_code": "1212",
                                "quantity": parseInt(itemQuantity),
                                "free_quantity": 0,
                                "unit": "NOS",
                                "unit_price": parseFloat(itemRate),
                                "total_amount": parseFloat(itemAmount),
                                "pre_tax_value": 0,
                                "discount": 0,
                                "other_charge": 0,
                                "assessable_value": parseFloat(itemAmount),
                                "gst_rate": parseFloat(total_gst),
                                "igst_amount": parseFloat(igstAmt),
                                "cgst_amount": parseFloat(cgstAmt),
                                "sgst_amount": parseFloat(sgstAmt),
                                "cess_rate": 0,
                                "cess_amount": 0,
                                "cess_nonadvol_amount": 0,
                                "state_cess_rate": 0,
                                "state_cess_amount": 0,
                                "state_cess_nonadvol_amount": 0,
                                "total_item_value": parseFloat(grossamt),
                                "country_origin": "",
                                "order_line_reference": "",
                                "product_serial_number": ""
                            };
                            total_accessable_amount += parseFloat(itemAmount);
                            request_data.item_list.push(itemListArray);
                        }
                    }
                    request_data.value_details.total_assessable_value = total_accessable_amount;
                    request_data.value_details.round_off_amount = round_off;
                    var tokken_val = get_token(https);
                    request_data.access_token = tokken_val;
                    log.debug('request_data', request_data);
                    var headers = [];
                    headers['Content-Type'] = 'application/json';
                    headers['Accept'] = 'application/json';
                    var postRequest = https.post({
                        url: 'https://pro.mastersindia.co/generateEinvoice',
                        headers: headers,
                        body: JSON.stringify(request_data)
                    })
                    var stXMLRequest = JSON.parse(postRequest.body);
                    log.debug('stXMLRequest', stXMLRequest);
                    var status = stXMLRequest.results.code;
                    if (status == '200') {
                        var irn_no = stXMLRequest.results.message.Irn;
                        var SignedQrCodeImgUrl = stXMLRequest.results.message.QRCodeUrl;
                        record.submitFields({
                            "type": record_type,
                            "id": transPrintid,
                            "values": {
                                "custbody_einvoice_response": "1",
                                "custbody_einvoice_qrcode": SignedQrCodeImgUrl,
                                "custbody_irn_no": irn_no
                            }
                        });
                    } else if (status == '204') {
                        log.debug("FAILURE Error", stXMLRequest.errors);
                        record.submitFields({
                            "type": record_type,
                            "id": transPrintid,
                            "values": {
                                "custbody_einvoice_response": "",
                                "custbody_einvoice_error": JSON.stringify(stXMLRequest.results.errorMessage)
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
                log.debug('message', e.message);
                record.submitFields({
                    "type": record_type,
                    "id": transPrintid,
                    "values": {
                        "custbody_einvoice_error": "Error in Netsuite Record-" + JSON.stringify(e.message)
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