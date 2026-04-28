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
                var subsidiarytaxregnum = invoice_obj.getText('subsidiarytaxregnum').split(' ')[0];
                //subsidiarytaxregnum = subsidiarytaxregnum.substring(0, 2);
                var custbody_in_inter_intra_flg = invoice_obj.getValue('custbody_in_inter_intra_flg'); //split
                var transporter_id = invoice_obj.getValue('custbody_transporter_id');
                var reason_code_for_vehicle_updation = invoice_obj.getText('custbody_reason_code_for_vehicle_updat');
                var reason_for_vehicle_updation = invoice_obj.getValue('custbody_reason_for_vehicle_updation');
                var transporter_name = invoice_obj.getText('custbody_transporter_name');
                var custbody_remaining_distance = invoice_obj.getValue('custbody_remaining_distance');
                var custbody_extend_reason = invoice_obj.getText('custbody_reason_for_vehicle_updation');
                var transporter_document_number = invoice_obj.getValue('custbody_transporter_document_number');
                var transporter_document_date = invoice_obj.getText('custbody_transporter_document_date');
                var transportation_mode = invoice_obj.getText('custbody_transporter_mode');
                var transportation_distance = invoice_obj.getValue('custbody_transporter_distance');
                var vehicle_number = invoice_obj.getValue('custbody_vehicle_number');
                var eway_billno = invoice_obj.getValue('custbody_eway_bill_number');
                var vehicle_type = invoice_obj.getText('custbody_vehicle_type');
                custbody_in_inter_intra_flg = custbody_in_inter_intra_flg.split('-')[0];
                var homyar_docno = invoice_obj.getValue('custbody_inoday_homyar_docno');
                var trandate = invoice_obj.getText('trandate');
                var entity = invoice_obj.getText('entity');
                var place_of_supply = invoice_obj.getText('custbody_in_gst_pos');
                var custbody_eway_bill_number = invoice_obj.getValue('custbody_eway_bill_number');
                var custbody_eway_bill_response = invoice_obj.getValue('custbody_eway_bill_response');
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
                var state_name;
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
                        label: "Addressee"
                    });
                    city = result.getValue({
                        name: "city",
                        join: "address",
                        label: "City"
                    });
                    state = result.getValue({
                        name: "state",
                        join: "address",
                        label: "State"
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
                    "eway_bill_number": parseInt(eway_billno),
                    "vehicle_number": vehicle_number,
                    "vehicle_type": "Regular", //need to open
                    "place_of_consignor": city,
                    "state_of_consignor": state,
                    "reason_code_for_vehicle_updation": reason_code_for_vehicle_updation,
                    "reason_for_vehicle_updation": reason_for_vehicle_updation,
                    "transporter_document_number": transporter_document_number,
                    "transporter_document_date": transporter_document_date,
                    "mode_of_transport": transportation_mode,
                    "data_source": "erp"
                };
                var tokken_val = get_token(https);
                request_data.access_token = tokken_val;
                log.debug('request_data', request_data);
                var headers = [];
                headers['Content-Type'] = 'application/json';
                headers['Accept'] = 'application/json';
                var postRequest = https.post({
                    url: 'https://pro.mastersindia.co/updateVehicleNumber',
                    headers: headers,
                    body: JSON.stringify(request_data)
                })
                var stXMLRequest = JSON.parse(postRequest.body);
                log.debug('stXMLRequest', stXMLRequest);
                var status = stXMLRequest.results.code;
                var url = stXMLRequest.results.message.url;
                if (status == '200') {
                    record.submitFields({
                        "type": record_type,
                        "id": transPrintid,
                        "values": {
                            "custbody_eay_pdf_url": url,
                            "custbody_update_vehicle":""
                        }
                    });
                } else if (status == '204') {
                    log.debug("FAILURE Error", stXMLRequest.results.message);
                    record.submitFields({
                        "type": record_type,
                        "id": transPrintid,
                        "values": {
                            "custbody_update_vehicle": stXMLRequest.results.message
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