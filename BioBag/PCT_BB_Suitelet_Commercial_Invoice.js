
/**
 *              //////////     BioBag Commercial Invoice Suitelet Pdf      //////////
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

 *@description  This Suitelet is used to generate Commercial Invoice Pdf   
 */

define(['N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record'],
    function (serverWidget, xml, log, render, record)
    {
        function onRequest(context)
        {
            log.debug({ title: 'PCT-BB', details: "In Suitelet" });
            if (context.request.method === 'GET')
            {
                var id = context.request.parameters.recId;
                log.debug({ title: 'PCT-BB', details: "Record Id " + id });

                var soLoad = record.load({
                    type: 'salesorder',
                    id: id
                });
                // ------------------------- Getting Sales Order Value ----------------
                var soDocNo = soLoad.getValue({ fieldId: 'tranid' });
                var soDate = soLoad.getValue({ fieldId: 'trandate' })
                var bill_add = soLoad.getValue({ fieldId: 'billaddress' });
                bill_add = bill_add.replace('&', '&amp;');
                var ship_add = soLoad.getValue({ fieldId: 'shipaddress' });
                ship_add = ship_add.replace('&', '&amp;');
                var po = soLoad.getValue({ fieldId: 'otherrefnum' });
                var terms = soLoad.getText({ fieldId: 'terms' });
                var countryOrigin = soLoad.getValue({ fieldId: 'custbody_country_of_origin' });

                var countryShip = soLoad.getValue({ fieldId: 'shipcountry' });
                var shipDate = soLoad.getValue({ fieldId: 'shipdate' });
                var shipMonth = parseInt(shipDate.getUTCMonth() + 1);
                var subtotal = soLoad.getValue({ fieldId: 'subtotal' });
                var total = soLoad.getValue({ fieldId: 'total' });

                var transport = soLoad.getValue({ fieldId: 'custbody_mode_of_transport' });
                var currency = soLoad.getValue({ fieldId: 'currencysymbol' });
                var soMonth = parseInt(soDate.getUTCMonth() + 1);

                log.debug({
                    title: 'PCT-BB', details: "SO Doc Number : " + soDocNo + ", Date : " + soDate + "Bill Add : " + bill_add + ", Ship Add : " + ship_add + ", Po No : " + po + ", Terms : " + terms +
                        ", Country Origin : " + countryOrigin + ', Ship Country : ' + countryShip + ", Ship Date : " + shipDate + ", Ship Month : " + shipMonth + ", Total : " + total + ", Sub Total : " + subtotal + ', Transport : ' + transport + ", Currency : " + currency
                });


                xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
                xml += "<pdfset>";
                xml += '<pdf>' +
                    '<head>' +
                    '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' +
                    '	' +
                    '<macrolist>' +
                    '<macro id="nlheader">' +
                    '<table style="width: 100%; font-size: 20pt;">' + '<tr>' +
                    '<td width="50%" style="font-size: 10pt;margin-left:20px">BioBag Americas Inc<br/>1059 Broadway Street<br/>Suite F<br/>Dunedin FL 34698</td>' +
                    '<td align="right" style="padding: 0;"><span style="font-size: 28pt;">Commercial Invoice</span></td>' + '</tr>'
                    + '</table>' + '<table style="width: 30%; font-size: 12pt; align: right;">' +
                    '<tr>' +
                    '<td align="right" style="padding: 0;margin-top:-27px"><span style="font-size: 16pt;">' + soDocNo +
                    '</span></td>' + '</tr>'
                    + '<tr>' + '<td align="right" style="padding: 0;">' + soMonth + "/" + soDate.getDate() + "/" + soDate.getUTCFullYear() + '</td>' + '</tr>' + '</table>' +
                    '<table style="width: 100%; margin-top: 10px;">' + '<tr>' +
                    '<td colspan="6"  style="font-size: 8pt; padding: 6px 0 2px; font-weight: bold; color: #333333;margin-left:30px;width:25%">Name/Address' + '</td>' +
                    '<td colspan="3"  style="font-size: 8pt; padding: 6px 0 2px; font-weight: bold; color: #333333;margin-left:30px;width:25%">' + '</td>' +
                    '<td colspan="6" style="font-size: 8pt; padding: 6px 0 2px; font-weight: bold; color: #333333;margin-left:-5px;width:25%">Ship To' + '</td>' +
                    '<td colspan="3"  style="font-size: 8pt; padding: 6px 0 2px; font-weight: bold; color: #333333;margin-left:30px;width:25%">' + '</td>' +
                    //'<td colspan="5" style="font-size: 12pt; background-color: #e3e3e3; font-weight: bold;">TOTAL' + '</td>' +
                    '</tr>' +
                    '<tr>' + '<td colspan="6" rowspan="3" style="padding:0px;margin-left:20px;">' + bill_add + '</td>' +
                    '<td colspan="3" rowspan="4" style="padding:0px;margin-left:-20px;"></td>' +
                    '<td colspan="6" rowspan="3" style="padding:0px;margin-left:-20px;">' + ship_add + '</td>' +
                    '<td colspan="3" rowspan="4" style="padding:0px;margin-left:-20px;"></td>' +
                    // '<td align="right" colspan="5" style="font-size: 28pt; padding-top: 20px; background-color: #e3e3e3;">$' + total.toFixed(2) + '</td>' +
                    '</tr>' + '</table>' +
                    '</macro>' +
                    '<macro id="nlfooter">' +
                    '<table style="width: 100%; font-size: 8pt;">' + '<tr>' +
                    '<td align="right" style="padding: 0;"><pagenumber/> of <totalpages/>' + '</td>' +
                    '</tr>' + '</table>' +
                    '        </macro>' +
                    '    </macrolist>' +
                    '    <style type="text/css">* {' +
                    '		' +
                    '		}' +
                    '		table {' +
                    '			font-size: 9pt;' +
                    '			table-layout: fixed;' +
                    '		}' +
                    '        th {' +
                    '            font-weight: bold;' +
                    '            font-size: 8pt;' +
                    '            vertical-align: middle;' +
                    '            padding: 5px 6px 3px;' +
                    '            background-color: #e3e3e3;' +
                    '            color: #333333;' +
                    '        }' +
                    '        td {' +
                    '            padding: 4px 6px;' +
                    '        }' +
                    '		td p { align:left }' +
                    '</style>' +
                    '</head>' +
                    '<body header="nlheader" header-height="18%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">' +

                    '<table style="width: 100%; margin-top: 10px;">' + '<tr>' +
                    '<th>' + "Country of Origin" + '</th>'
                    + '<th>' + "Country of Shipment" + '</th>' +
                    '<th>' + "Ship Date" + '</th>' +
                    '<th>' + "Terms" + '</th>' +
                    '<th>' + "P.O. No." + '</th>' +
                    '<th>' + "FOB" + '</th>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-top: 2px;">' + countryOrigin + '</td>' +
                    '<td align="center" style="padding-top: 2px;">' + countryShip + '</td>' +
                    '<td style="padding-top: 2px;">' + shipMonth + "/" + shipDate.getDate() + "/" + shipDate.getUTCFullYear() + '</td>' +
                    '<td style="padding-top: 2px;">' + terms + '</td>' +
                    '<td style="padding-top: 2px;">' + po + '</td>' +
                    '<td style="padding-top: 2px;"> </td>' +
                    '</tr>' +
                    '</table>' +

                    '    <table style="width: 100%; margin-top: 10px;">' +
                    '<thead>' +
                    '<tr>' +
                    '<th align="center" colspan="4" style="padding: 10px 6px;">Item' +
                    '</th>' +
                    '<th colspan="8" style="padding: 10px 6px;">Description' +
                    '</th>' +
                    '<th align="center" colspan="3" style="padding: 10px 6px;">Ordered' +
                    '</th>' +
                    '<th align="right" colspan="3" style="padding: 10px 6px;">U/M' +
                    '</th>' +
                    '<th align="right" colspan="4" style="padding: 10px 6px;">Rate' +
                    '</th>' +
                    '<th align="right" colspan="4" style="padding: 10px 6px;">Amount' +
                    '</th>' +
                    '</tr>' +
                    '</thead>';






                var item_count = soLoad.getLineCount({ sublistId: 'item' });
                log.debug({ title: "PCT-BB", details: "Total Item : " + item_count });
                for (item_index = 0; item_index < item_count; item_index++)
                {
                    var itemName = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item_display',
                        line: item_index
                    });
                    itemName = itemName.split(" ")[0];
                    var itemDesc = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: item_index
                    });

                    var itemQty = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: item_index
                    });

                    var itemUnit = soLoad.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: item_index
                    });

                    var itemRate = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: item_index
                    });

                    var itemAmt = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: item_index
                    });


                    log.debug("PCT-BB", "Item Name : " + itemName + ", Item Desc : " + itemDesc + ", Item Qty : " + itemQty + ", Item Rate : " + itemRate + ", Item Amount : " + itemAmt);

                    xml += ' <tr>' +
                        '	<td align="center" colspan="4" line-height="150%">' + itemName + '</td>' +
                        '	<td colspan="8">' + itemDesc + '</td>' +
                        '	<td  align="center" colspan="3">' + itemQty + '</td>' +
                        '	<td  align="right" colspan="3">' + itemUnit + '</td>' +


                        '     <td align="right" colspan="4">' + itemRate + '</td>' +
                        '      <td align="right" colspan="4">' + itemAmt + '</td>' +
                        '      </tr>';

                }

                xml += '</table>' +

                    '<table style="width: 100%; margin-top: 10px;"><tr>\n' +
                    '	<td colspan="2" style="margin-top:25px">Total Weight</td>\n' +
                    '	<td colspan="2" style="margin-top:25px;margin-left:-125px">Transportation</td>\n' +
                    '	<td align="right" style="font-size: 12pt;"><b>Subtotal</b></td>\n' +
                    '	<td align="right" style="margin-top:5px">' + currency + " " + subtotal + '</td>\n' +
                    '	</tr>\n' +
                    '	<tr>\n' +



                    '	<td colspan="2" style="margin-top:-10px"></td>\n' +
                    '	<td colspan="2" style="margin-left:-125px;margin-top:-10px">' + transport + '</td>\n' +
                    '	<td align="right" style="font-size: 16pt;margin-top:-15px"><b>Total</b></td>\n' +
                    '	<td align="right" style="margin-top:-7px">' + currency + " " + total +
                    '</td>\n' +
                    '	</tr>';
                xml += ' </table>' +
                    '' +
                    '</body>' +
                    '</pdf>';
                xml += "</pdfset>";
                var pdfFile = render.xmlToPdf({
                    xmlString: xml
                });
                context.response.renderPdf({ xmlString: xml });
                context.response.write(pdfFile.getContents());




            }




        }

        return {
            onRequest: onRequest,
        };
    });
