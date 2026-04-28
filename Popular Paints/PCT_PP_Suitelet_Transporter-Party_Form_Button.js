
/**
 *              //////////     Popular Transporter/Party Receipt Suitelet Pdf      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-12-29 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for Popular Transporter/Party Receipt Suitelet Pdf, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to generate Transporter/Party Receipt Suitelet Pdf      
 */

define(['N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record'],
    function (serverWidget, xml, log, render, record)
    {
        function onRequest(context)
        {
            log.debug({ title: 'PCT-PP', details: "In Suitelet" });
            if (context.request.method === 'GET')
            {
                var id = context.request.parameters.recordId;
                log.debug({ title: 'PCT-PP', details: "Record Id " + id });

                var transporterPartyReceiptLoad = record.load({
                    type: 'customrecord_pct_pp_transporter_receipt',
                    id: id
                });
                // -------------------------- Getting All Body Field Details --------------------------------

                var deport = transporterPartyReceiptLoad.getText({ fieldId: 'custrecord_pct_pp_tr_depot' });
                var cname = transporterPartyReceiptLoad.getText({ fieldId: 'custrecord_pct_pp_tr_cust_name' });
                var driverName = transporterPartyReceiptLoad.getText({ fieldId: 'custrecord_pct_pp_tr_driver_name' });
                var vehicleNo = transporterPartyReceiptLoad.getValue({ fieldId: 'custrecord_pct_pp_tr_vehicle_no' });
                var transportName = transporterPartyReceiptLoad.getText({ fieldId: 'custrecord_pct_pp_tr_transport_name' });
                var date = transporterPartyReceiptLoad.getValue({ fieldId: 'custrecord_pct_pp_tr_date' });


                var invoiceNo = transporterPartyReceiptLoad.getValue({ fieldId: 'custrecord_pct_pp_tr_inv_no' });
                var remarks = transporterPartyReceiptLoad.getValue({ fieldId: 'custrecord_pct_pp_tr_remarks' });
                var linkFromFulfillment = transporterPartyReceiptLoad.getText({ fieldId: 'custrecord_pct_pp_tr_parent_link2' });
                var shipAddress = transporterPartyReceiptLoad.getValue({ fieldId: 'custrecord_pct_pp_ship_address' });

                log.debug({
                    title: 'PCT-PP', details: "Deport :" + deport + ", Customer Name : " + cname + ", Driver Name : " + driverName + ", Vehicle No : " + vehicleNo + ", Transport Name : " + transportName + ", Date : " + date +
                        ", Invoice no : " + invoiceNo + ", Remarks : " + remarks + ", Link From Fulfillment : " + linkFromFulfillment + ", Ship Address : " + shipAddress
                });

                // if (date.length)
                // {
                //     var dd = date.getDate();
                //     var mm = date.getMonth() + 1;
                //     var yyyy = date.getFullYear();
                //     date = dd + "/" + mm + "/" + yyyy;
                // }


                // ------------------------------ HTML File -----------------------------------------

                var myvar = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
                    '<pdf>' +
                    '<head>' +
                    '   <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' +
                    '<macrolist>' +
                    '<macro id="nlheader">' +
                    '</macro>' +
                    '</macrolist>' +
                    '    <style type="text/css">' +
                    '        th,' +
                    '        td {' +
                    '            padding: 5px;' +
                    '            text-align: left;' +
                    '        }' +
                    '        th{' +
                    '            font-weight: bold;' +
                    '        }' +
                    '        .transport_details th,' +
                    '        .transport_details td {' +
                    '            border: 1px solid #dddddd;' +
                    '            text-align: left;' +
                    '            padding: 4px 8px;' +
                    '        }' +
                    '' +
                    '        .transport_details th {' +
                    '            background-color: #dddddd;' +
                    '        }' +
                    '    </style>' +
                    '</head>' +
                    '       <body header="nlheader" header-height="1.00%" padding="0.02in 0.05in 0.02in 0.05in" footer="nlfooter" footer-height="15pt" size="A5-Landscape">' +
                    '    <h2 style="font-size: 15pt;">Transporter / Party Receipt</h2>' +
                    '    <hr style="margin: 5px -100px;"/>' +
                    '    <table style="width:100%; font-size: 7.5pt; margin: 0px; padding: 0px;">' +
                    '        <tr>' +
                    '            <td width="36%">' +
                    '                <table style="width: 100%;">' +
                    '                    <tr>' +
                    '                        <th>Deport</th>' +
                    '                        <td>' + deport + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Customer<br/>Name</th>' +
                    '                        <td style="white-space: nowrap;">' + cname + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Driver<br/> Name</th>' +
                    '                        <td>' + driverName + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Vehicle <br/>Number</th>' +
                    '                        <td>' + vehicleNo + '</td>' +
                    '                    </tr>' +
                    '                </table>' +
                    '            </td>' +
                    '            <td width="35%">' +
                    '                <table style="width: 100%; white-space: nowrap;">' +
                    '                    <tr>' +
                    '                        <th>Transport Name</th>' +
                    '                        <td>' + transportName + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Date</th>' +
                    '                        <td>' + date + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Invoice Number</th>' +
                    '                        <td>' + invoiceNo + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Item Fulfillment</th>' +
                    '                        <td>' + linkFromFulfillment + '</td>' +
                    '                    </tr>' +
                    '                </table>' +
                    '            </td>' +
                    '            <td width="29%">' +
                    '                <table style="width: 100%; ">' +
                    '                    <tr>' +
                    '                        <th width="25%">Ship<br/>Address</th>' +
                    '                        <td width="75%">' + shipAddress + '</td>' +
                    '                    </tr>' +
                    '                    <tr>' +
                    '                        <th>Remarks</th>' +
                    '                        <td width="75%">' + remarks + '</td>' +
                    '                    </tr>' +
                    '                </table>' +
                    '            </td>' +
                    '        </tr>' +
                    '    </table>' +
                    '<hr style="margin: 1px -70px;"/>' +
                    '    <h2 style="font-size: 10pt; margin: 5px 7px;">Transporter / Party Details</h2>' +
                    '        <table class="transport_details" style="width: 100%; font-size: 8pt; margin: 0px;">' +
                    '            <tr>' +
                    '                <th>Description</th>' +
                    '                <th>Packaging</th>' +
                    '                <th>Remarks</th>' +
                    '            </tr>';

                // ------------------------------------------------  Get Line Item Details ---------------------------------------------------

                var lineItemCount = transporterPartyReceiptLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_pp_tr_child_link' });
                log.debug({ title: 'PCT-PP', details: "Line Item Count : " + lineItemCount });
                var totalPackaging = 0;
                for (index = 0; index < lineItemCount; index++)
                {
                    var lineItemDesc = transporterPartyReceiptLoad.getSublistText({
                        sublistId: 'recmachcustrecord_pct_pp_tr_child_link',
                        fieldId: 'custrecord_pct_pp_tr_child_desc',
                        line: index
                    });
                    var lineItemPackaging = transporterPartyReceiptLoad.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pp_tr_child_link',
                        fieldId: 'custrecord_pct_pp_tr_child_packaging',
                        line: index
                    });
                    totalPackaging += lineItemPackaging;
                    var remarks = transporterPartyReceiptLoad.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pp_tr_child_link',
                        fieldId: 'custrecord_pct_pp_tr_child_remarks',
                        line: index
                    });
                    log.debug({ title: 'PCT-PP', details: "Line Item Desc : " + lineItemDesc + ", Line Item Packaging : " + lineItemPackaging + ", Total Packaging : " + totalPackaging + ", Remarks : " + remarks });

                    myvar += '<tr>' +
                        '                <td>' + lineItemDesc + '</td>' +
                        '                <td>' + lineItemPackaging + '</td>' +
                        '                <td>' + remarks + '</td>' +
                        '            </tr>';

                }
                myvar += '</table>';
                myvar += '          <table style="width: 100%; white-space: nowrap; margin-left: 179px; margin-right: 381px; font-size: 8pt; border: 1px solid #dddddd;">' +
                    '                    <tr>' +
                    '                        <th style="white-space: nowrap; padding: 3px 6px;">Total</th>' +
                    '                        <td style="white-space: nowrap; padding: 3px 6px; margin-left: 90px;">' + totalPackaging + '</td>' +
                    '                    </tr>' +
                    '               </table>' +
                    '</body>' +
                    '</pdf>';

                myvar = space(myvar);
                myvar = addspace(myvar);
                myvar = htmlizeAmps(myvar);
                myvar = trim(myvar);
                myvar = myvar.replace('&lt;', '<');
                myvar = myvar.replace('&gt;', '>');
                context.response.renderPdf(myvar);

            }


            function space(s)
            {

                var result = s.replace(/&nbsp;/g, " ");

                return result;

            }

            function addspace(b)
            {

                var result = b.replace('</br>', '&nbsp;');

                return result;

            }



            function htmlizeAmps(s)
            {

                var result = s.replace(/\x26/g, "&amp;");

                return result;

            }



            function trim(str)
            {

                return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));

            }

            function find_null(value)
            {

                if (value == null)
                {

                    value = ''

                }

                return value;

            }

        }

        return {
            onRequest: onRequest,
        };
    });
