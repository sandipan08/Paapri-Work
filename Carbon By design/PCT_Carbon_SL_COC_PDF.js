/**
 *              //////////     Strouse COC Suitelet Pdf      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2023-03-27 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for Strouse COC Suitelet Pdf, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to generate Strouse COC  Suitelet Pdf   

 * Copyright (c) 2023, Oracle and/or its affiliates.
 * 500 Oracle Parkway Redwood Shores, CA 94065
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 * Version    Date          Author              Remarks
 * 1.00       12/2023       Cecilia Mullin      Update
 *
 */


define(['N/file', 'N/log', 'N/record', "N/search", "N/runtime", "N/render"],
    function (file, log, record, search, runtime, render) {
        function onRequest(context) {
            log.debug({ title: 'PCT-Strouse', details: "In Suitelet" });

            if (context.request.method === 'GET') {
                var signUrl, pageNumber = 0;
                var id = context.request.parameters.recId;
                log.debug({ title: 'PCT-Strouse', details: "Record Id " + id });

                var itemFulfillmentLoad = record.load({
                    type: 'itemfulfillment',
                    id: id
                });
                // -------------------------- Getting All Body Field Details --------------------------------
                var customerId = itemFulfillmentLoad.getValue({ fieldId: 'entity' });
                var employee = itemFulfillmentLoad.getText({ fieldId: 'custbody_pct_sc_coc_signed_by' });
                var shipAddress = itemFulfillmentLoad.getValue({ fieldId: 'shipaddress' });
                var sign = itemFulfillmentLoad.getValue({ fieldId: 'custbody_pct_sc_emp_sign' });

                var customerPartner = itemFulfillmentLoad.getSublistText({
                    sublistId: 'item',
                    fieldId: 'custcol_scm_customerpartnumber',
                    line: 0
                });




                var attention = getShippingAttention(itemFulfillmentLoad.getText({ fieldId: 'shipaddresslist' }), customerId)
                var soFieldLookUp = search.lookupFields({
                    type: search.Type.SALES_ORDER,
                    id: itemFulfillmentLoad.getValue({ fieldId: 'createdfrom' }),
                    columns: ['otherrefnum', 'shipdate']
                });
                // ------------------------------ HTML File -----------------------------------------

                var myvar = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
                    '<pdf>' +
                    '<head>' +
                    '    <macrolist>' +
                    '        <macro id="nlheader">' +
                    '           <table style="width: 100%; font-size: 10pt;"><tr>' +
                    '<td rowspan="3" colspan="4" style="padding-bottom: 50px; "><img src="https://8454393.secure.netsuite.com/core/media/media.nl?id=5621&c=8454393&h=zFfq875cvFRzYhvhx5bdy6NJF8Gzm4FSbSSyiTexcerJLRzU" style="float: left;" height="45px" width="160px" /><div><span >1491 Poinsettia Ave, Suite 136<br/>Vista CA 92081<br/></span></div></td>' +
                    '<td align="right" colspan="6"><span class="title">Certificate Of<br/> Conformance</span></td></tr > ' +
                    '	</table>' +
                    '        </macro>' +
                    // '        <macro id="nlfooter">' +
                    // '            <table style="width: 100%; font-size: 8pt;"><tr>' +
                    // '	<td><b>The following is made in lieu of all warranties, expressed or implied: Seller’s only obligation shall be to replace such quantity of the product proved to be defective. Seller shall not be liable for any injury, loss or damage, direct or consequential, arising out of use of or the inability to use the product. Before using, user shall determine the suitability of the product for his intended use and user assumes all risk and liability whatsoever in connection therewith. The foregoing may not be changed except by an agreement by an officer of seller.</b></td>' +
                    // '</tr><tr><td style="padding: 0;"><b><pagenumber/> of <totalpages/> Rev C ' + getCurrentDate() + '</b></td></tr>' +
                    // '	</table>' +
                    // '        </macro>' +
                    '    </macrolist>' +
                    '    <style type="text/css">' +
                    'table {' +
                    '			font-size: 9pt;' +
                    '			table-layout: fixed;' +
                    '		}' +
                    '        th {' +
                    '            font-weight: bold;' +
                    '            font-size: 10pt;' +
                    '            vertical-align: middle;' +
                    '            padding: 2px 2px 2px;' +
                    '            background-color: #e3e3e3;' +
                    '            color: #333333;' +
                    '        }' +
                    '        td {' +
                    '            padding: 4px 6px;' +
                    '        }' +
                    '		td p { align:left }' +
                    'span.title {' +
                    '    font-size: 20pt;' +
                    '}' +
                    '    </style>' +
                    '</head>';

                var fulfillmentItemCount = getItemInFulfillment(id);
                for (var itemIndex = 0; itemIndex < itemFulfillmentLoad.getLineCount({ sublistId: 'item' }); itemIndex++) {
                    // -------------------------- Get All Line Field Details ---------------------------------------------------
                    var productNumber = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'itemname', line: itemIndex });
                    var quantity = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: itemIndex });
                    var description = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'itemdescription', line: itemIndex });
                    var detailedDescription = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_sc_coc_detailed_desc', line: itemIndex });
                    var customerPartnerNumber = itemFulfillmentLoad.getSublistText({ sublistId: 'item', fieldId: 'custcol_scm_customerpartnumber', line: itemIndex });
                    var unit = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'unitsdisplay', line: itemIndex });
                    var itemtype = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: itemIndex });
                    log.debug({ title: 'PCT-Strouse', details: "Item Type " + itemtype });
                    if ((itemtype != 'OthCharge')) {
                        pageNumber += 1;
                        var inventoryDetailsRecord = itemFulfillmentLoad.getSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                            line: itemIndex
                        })
                        // var units = inventoryDetailsRecord.getValue({ fieldId: 'unit' });
                        let lotNumberArray = [];
                        for (var inventoryDetailsIndex = 0; inventoryDetailsIndex < inventoryDetailsRecord.getLineCount({ sublistId: 'inventoryassignment' }); inventoryDetailsIndex++) {

                            var lotNumberFieldLookUp = search.lookupFields({
                                type: 'inventorynumber',
                                id: inventoryDetailsRecord.getSublistValue({ sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', line: inventoryDetailsIndex }),
                                columns: ['inventorynumber']
                            });
                            lotNumberArray.push(lotNumberFieldLookUp.inventorynumber)
                        }
                        log.debug({ title: 'PCT-Strouse', details: "Lot Number Array " + lotNumberArray });

                        myvar += '<body header="nlheader" header-height="14%"  footer="nlfooter" footer-height="0pt"  padding="0.5in 0.5in 0in 0.5in" size="Letter">' +

                            '    <table style="width: 100%; padding-top: 3px">' +
                            '                <thead>' +
                            '                <tr>' +
                            '                    <th colspan="3" align="center" style="padding: 10px 6px;">Customer</th>' +
                            '                    <th colspan="4" style="padding: 10px 6px;">Purchase Order</th>' +
                            '                    <th colspan="4" align="right" style="padding: 10px 6px;">Working</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">PO Line</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Qty</th>' +
                            '                </tr>' +
                            '                </thead>' +
                            '            <tr>' +
                            '                <td colspan="3" line-height="150%" align="center">${item.quantity}</td>' +
                            '                <td colspan="4"><span style="font-weight: bold; line-height: 150%; color: #333333;">${item.item}</span><br />${item.description}</td>' +
                            '                <td colspan="4" align="right">${item.rate}</td>' +
                            '                <td colspan="2" align="right">${item.amount}</td>' +
                            '                <td colspan="2" align="right">${item.amount}</td>' +
                            '            </tr>' +
                            '    </table>' +

                            '    <table style="width: 100%; padding-top: 3px">' +
                            '                <thead>' +
                            '                <tr>' +
                            '                    <th colspan="3" align="center" style="padding: 10px 6px;">Part Description</th>' +
                            '                    <th colspan="4" style="padding: 10px 6px;">Drawing Number</th>' +
                            '                    <th colspan="4" align="right" style="padding: 10px 6px;">Rev</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Inspected By</th>' +
                            '                </tr>' +
                            '                </thead>' +
                            '            <tr>' +
                            '                <td colspan="3" line-height="150%" align="center">${item.quantity}</td>' +
                            '                <td colspan="4"><span style="font-weight: bold; line-height: 150%; color: #333333;">${item.item}</span><br />${item.description}</td>' +
                            '                <td colspan="4" align="right">${item.rate}</td>' +
                            '                <td colspan="2" align="right">${item.amount}</td>' +
                            '            </tr>' +
                            '    </table>' +

                            '    <table style="width: 100%;">' +
                            '                <thead>' +
                            '                <tr>' +
                            '                    <th colspan="3" align="center" style="padding: 10px 6px;">QC Representative</th>' +
                            '                    <th colspan="4" style="padding: 10px 6px;">Title</th>' +
                            '                    <th colspan="4" align="right" style="padding: 10px 6px;">Signature</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Date</th>' +
                            '                </tr>' +
                            '                </thead>' +
                            '            <tr>' +
                            '                <td colspan="3" line-height="150%" align="center">${item.quantity}</td>' +
                            '                <td colspan="4"><span style="font-weight: bold; line-height: 150%; color: #333333;">${item.item}</span><br />${item.description}</td>' +
                            '                <td colspan="4" align="right">${item.rate}</td>' +
                            '                <td colspan="2" align="right">${item.amount}</td>' +
                            '            </tr>' +
                            '    </table>' +


                            '    <table style="width: 100%; margin-top: 10px;">' +
                            '                <thead>' +
                            '                <tr>' +
                            '                    <th colspan="2" align="center" style="padding: 10px 6px;">Sl No</th>' +
                            '                    <th colspan="4" style="padding: 10px 6px;">Characteristic</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Lot Code</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Batch No</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Nominal</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">U Limit</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">L Limit</th>' +
                            '                    <th colspan="2" align="right" style="padding: 10px 6px;">Measured</th>' +

                            '                </tr>' +
                            '                </thead>' +
                            '            <tr>' +
                            '                <td colspan="2" align="center"></td>' +
                            '                <td colspan="4"></td>' +
                            '                <td colspan="2" align="right"></td>' +
                            '                <td colspan="2" align="right"></td>' +
                            '                <td colspan="2" align="right"></td>' +
                            '                <td colspan="2" align="right"></td>' +
                            '                <td colspan="2" align="right"></td>' +
                            '                <td colspan="2" align="right"></td>' +
                            '            </tr>' +
                            '    </table>' +
                            '</body>';
                    }
                }
                myvar += '</pdf>';
                myvar = space(myvar);
                myvar = addspace(myvar);
                myvar = htmlizeAmps(myvar);
                myvar = trim(myvar);
                myvar = myvar.replace('&lt;', '<');
                myvar = myvar.replace('&gt;', '>');
                context.response.renderPdf(myvar);
                // var pdfFile = render.xmlToPdf({
                //     xmlString: myvar
                // });
                // pdfFile.name = 'Test123.pdf';
                // pdfFile.folder = -4;
                // pdfFile.save();

            }


            function space(s) {

                var result = s.replace(/&nbsp;/g, " ");

                return result;

            }

            function addspace(b) {

                var result = b.replace('</br>', '&nbsp;');

                return result;

            }



            function htmlizeAmps(s) {

                var result = s.replace(/\x26/g, "&amp;");

                return result;

            }



            function trim(str) {

                return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));

            }

            function find_null(value) {

                if (value == null) {

                    value = ''

                }

                return value;

            }

        }
        // ------------------------------ Get Shipping Attention Search Start -------------------
        const getShippingAttention = (shipAddress, customerId) => {
            var attention = '';
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", customerId],
                        "AND",
                        ["addresslabel", "is", shipAddress]
                    ],
                columns:
                    [
                        search.createColumn({ name: "attention", label: "Attention" })
                    ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            // log.debug("customerSearchObj result count", searchResultCount);
            customerSearchObj.run().each(function (result) {
                attention = result.getValue('attention')
                // .run().each has a limit of 4,000 results
                return true;
            });
            return attention;
        }
        // ------------------------------ Get Shipping Attention Search End -------------------


        // ------------------------------ Get Item from Item Fulfillment Search Start -------------------
        const getItemInFulfillment = (id) => {
            var itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type", "anyof", "ItemShip"],
                        // "AND",
                        // ["mainline", "is", "T"],
                        "AND",
                        ["internalid", "anyof", id],
                        "AND",
                        ["item.type", "noneof", "OthCharge"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["cogs", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"]

                    ],
                columns:
                    [
                        search.createColumn({
                            name: "item",
                            summary: "GROUP",
                            label: "Item"
                        })
                    ]
            });
            var fulfillmentItemCount = itemfulfillmentSearchObj.runPaged().count;
            log.debug("itemfulfillmentSearchObj result count", fulfillmentItemCount);
            itemfulfillmentSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                return true;
            });
            return fulfillmentItemCount;
        }
        // ------------------------------ Get Item from Item Fulfillment Search End -------------------


        return {
            onRequest: onRequest,
        };
    });
