
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
 */

define(['N/file', 'N/log', 'N/record', "N/search", "N/runtime", "N/render"],
    function (file, log, record, search, runtime, render) {
        function onRequest(context) {
            log.debug({ title: 'PCT-Strouse', details: "In Suitelet" });

            if (context.request.method === 'GET') {
                var signUrl, pageNumber = 0;
                var id = context.request.parameters.recordId;
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

                if (sign && employee) {
                    var signUrl = file.load({ id: sign }).url;
                }

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
                    '<td rowspan="3" colspan="3" style="padding-bottom: 50px; "><img src="https://4344933.secure.netsuite.com/core/media/media.nl?id=4769&c=4344933&h=XMok3iBMeyuopDBm3vtQcz4-gZmx3YY978MNzfLy8IqXUJ-o" style="float: left;" height="35px" width="150px" /><div><span >1211 Independence Way<br/>Westminster MD 21157<br/>Phone: 410.848.1611<br/>Fax: 410.848.9220<br/>Email: orders@strouse.com <br/>www.strouse.com<br/>Quality Management System<br/>registered to ISO 9001 : 2015</span></div></td>' +
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
                    '    table-layout: fixed;' +
                    '}' +
                    'span.title {' +
                    '    font-size: 20pt;' +
                    '}' +
                    '        th,' +
                    '        td {' +
                    '            padding: 5px;' +
                    '            text-align: left;' +
                    '        }' +
                    '        th{' +
                    '            font-weight: bold;' +
                    '        }' +
                    '.secondTd{' +
                    'align: left;' +
                    '}' +
                    '.contentDiv {' +
                    // '	border: 1px solid;' +
                    '	padding:5px 10px 5px 10px;' +
                    // '	border-radius: 3px;' +
                    '    font-size: 10pt;' +
                    '  display: block;' +
                    '  margin-bottom: 10px' +
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

                        myvar += '<body header="nlheader" header-height="17%"  footer="nlfooter" footer-height="0pt"  padding="0.5in 0.5in 0in 0.5in" size="Letter">' +
                            '<div class="contentDiv"><span ><b>"This document certifies that the listed products sold by The Strouse Corporation, were produced according to, and meet the requirements of, current Strouse Corporation Manufacturing and Quality Standards. These products have been shipped to the destination below."</b></span></div>' +
                            '    <table style="width:100%; font-size: 10pt; margin: 0px; padding: 0px;">' +
                            '                    <tr>' +
                            '                        <td  colspan="2">Ship To</td>' +
                            '                        <td  class="secondTd" colspan="10">' + shipAddress + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">Attention</td>' +
                            '                        <td class="secondTd" colspan="10">' + attention + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">Product Number</td>' +
                            '                        <td class="secondTd" colspan="10">' + productNumber + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">Quantity</td>' +
                            '                        <td class="secondTd" colspan="10">' + quantity + ' ' + unit + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">P.O Number</td>' +
                            '                        <td class="secondTd" colspan="10">' + soFieldLookUp.otherrefnum + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">Description</td>' +
                            '                        <td class="secondTd" colspan="10">' + description + '</td>' +
                            '                    </tr>' +
                            '                    <tr style="margin: 20px;">' +
                            '                        <td colspan="2"></td>' +
                            '                        <td class="secondTd" colspan="10">' + detailedDescription + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">Strouse Lot Number</td>' +
                            '                        <td class="secondTd" colspan="10">' + lotNumberArray + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2">COC Print Date</td>' +
                            '                        <td class="secondTd" colspan="10">' + getCurrentDate() + '</td>' +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2"></td>' +
                            `                        <td class="secondTd" colspan="10">${signUrl ? `<img src="${signUrl}" style="float: left;" height="120px" width="150px" />` : `<div height="120px"></div>`}</td>` +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2"></td>' +
                            `                        <td class="secondTd" colspan="10"><hr style="width: 150px;"></hr></td>` +
                            '                    </tr>' +
                            '                    <tr>' +
                            '                        <td colspan="2"></td>' +
                            `                        <td class="secondTd" colspan="10">${employee}</td>` +
                            '                    </tr>' +
                            '    </table>' +
                            '            <table style="width: 100%; font-size: 10pt; margin-top: 30px;"><tr>' +
                            '	<td><b>"The following is made in lieu of all warranties, expressed or implied: Seller’s only obligation shall be to replace such quantity of the product proved to be defective. Seller shall not be liable for any injury, loss or damage, direct or consequential, arising out of use of or the inability to use the product. Before using, user shall determine the suitability of the product for his intended use and user assumes all risk and liability whatsoever in connection therewith. The foregoing may not be changed except by an agreement by an officer of seller."</b></td>' +
                            `</tr><tr><td style="padding: 0;"><b>${pageNumber} of ${fulfillmentItemCount} </b></td></tr>` +
                            '	</table>' +
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

        // ------------------------------ Get Shipping Attention Search Start -------------------
        const getCurrentDate = () => {
            var current_date = new Date();
            var dd = current_date.getDate();
            var mm = current_date.getMonth() + 1;
            var yyyy = current_date.getFullYear();
            var currentDate = mm + "/" + dd + "/" + yyyy;
            log.debug({
                title: 'PCT-Strouse',
                details: 'Current Date : ' + currentDate
            })

            return currentDate;
        }
        // ------------------------------ Get Shipping Attention Search End -------------------
        // ------------------------------ Get Item from Item Fulfillment Search Start -------------------
        const getItemInFulfillment = (id) => {
            var itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type", "anyof", "ItemShip"],
                        "AND",
                        ["item.type", "noneof", "OthCharge"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["internalid", "anyof", id]
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
