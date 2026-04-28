/**
* @NApiVersion 2.1
* @NScriptType Suitelet
*/
define(['N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record', 'N/search', 'N/currentRecord'], function (serverWidget, xml, log, render, record, search, currentRecord) {

    function onRequest(context) {

        var recId = context.request.parameters.recordId;
        log.debug({ title: 'PCT-OSS', details: "Record Id " + recId });
        var soLoad = record.load({ type: record.Type.SALES_ORDER, id: recId }); //Load Sales Order
        var tranid = soLoad.getValue({ fieldId: 'tranid' });
        var date = soLoad.getValue({ fieldId: 'trandate' });
        var soCredit = soLoad.getValue({ fieldId: 'custbody_pct_oss_so_credit_for' });
        var terms = soLoad.getText({ fieldId: 'terms' });
        var customerName = soLoad.getValue({ fieldId: 'entityname' });
        var billAdd = soLoad.getValue({ fieldId: 'billaddress' });
        var shipAdd = soLoad.getValue({ fieldId: 'shipaddress' });
        var created_by = soLoad.getText({ fieldId: 'custbody_pct_oss_po_created_by' });
        var po_num = soLoad.getValue({ fieldId: 'otherrefnum' });
        var itemGrossProfit = soLoad.getValue({ fieldId: 'estgrossprofit' });
        var salesRep = soLoad.getText({ fieldId: 'salesrep' });
        var itemGrossProfitPercentage = soLoad.getValue({ fieldId: 'estgrossprofitpercent' });
        // var shippingTerm = soLoad.getValue({ fieldId: 'custbody_pct_oss_shipping_terms' });
        if (po_num == '') {
            po_num = '***';
        }
        var itemCount = soLoad.getLineCount({ sublistId: 'item' });


        var slNo = 1;
        var item = soLoad.getSublistText({
            sublistId: 'item',
            fieldId: 'item',
            line: 0
        })
        var partNo = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_customer_part_no',
            line: 0
        })
        var rate = soLoad.getSublistText({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_cust_ven_rate',
            line: 0
        })
        // var rate = soLoad.getValue({ fieldId: 'custrecord_pct_oss_config_sell_price' });
        var poNumber = soLoad.getSublistText({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_transaction_cust_po',
            line: 0
        })
        var uom = soLoad.getSublistText({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_qte_selling_uom',
            line: 0
        })
        if (uom == 'Inch') { uom = 'IN' }
        else if (uom == 'Feet') { uom = 'FT' }
        else if (uom == 'Fix') { uom = 'FIX' }
        else if (uom == 'Pound') { uom = 'LBS' }
        // var uom = soLoad.getValue({ fieldId: 'custrecord_pct_oss_config_selling_uom' })
        var inch = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            line: 0
        })
        var lbs = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_total_itm_weight',
            line: 0
        })
        lbs = parseFloat(lbs).toFixed(2);
        var amt = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'amount',
            line: 0
        })
        var configId = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_so_pct_config_id',
            line: 0
        });
        var requestedDueDate = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_transaction_req_date',
            line: 0
        });
        var dd = requestedDueDate.getDate();
        var mm = requestedDueDate.getMonth() + 1;
        var yyyy = requestedDueDate.getFullYear();
        var requestedDueDate = mm + "/" + dd + "/" + yyyy;

        var itemPO = soLoad.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_pct_oss_transaction_cust_po',
            line: 0
        });
        var ossConfigLoad = record.load({
            type: 'customrecord_pct_oss_configure',
            id: configId
        });
        var shippingTerms = ossConfigLoad.getText({
            fieldId: 'custrecord_pct_oss_config_shipping_terms'
        })
        var itemCount = ossConfigLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_oss_configure_child_link' });



        var myvar = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
            '<pdf>' +
            '<head>' +
            '    <macrolist>' +
            '        <macro id="nlheader">' +
            '           <table style="width: 100%; font-size: 10pt;"><tr>' +
            '<td align="left" rowspan="4" style="margin: 10px 0px 5px 5px;"><img height="60" src="https://5499923.secure.netsuite.com/core/media/media.nl?id=8858&amp;c=5499923&amp;h=NM32-AoRAoao8RsuLf-W5D68f9UGMJvxm1HLb6x8bHfiiVaI" style="float: left;" width="140" /></td></tr>' +
            '       ' +
            '	<tr><td align="left" style="padding: 0 ;"><span style="font-size: 28pt;">Internal Sales Order</span></td>' +
            '	</tr>' +
            '         <tr>' +
            '	<td align="left" style="padding:10px 0px 20px;"><b>Order No</b><span style="padding-left:60px;">' + tranid + '</span><span style="padding-left:60px;">' + (parseInt(date.getMonth()) + 1) + "/" + date.getDate() + "/" + date.getFullYear() + '</span></td>' +
            '	</tr>' +
            '              <tr>' +
            '          <td align="left" style="padding:10px 0px 20px;"><b>Cust ID/Ship-To</b><span style="padding-left:10px;">' + customerName + '</span></td> </tr>' +
            '                         <tr>' +
            '	<td style="padding-left:9px;font-size:10px;  margin-top: -15px; margin-left: 9px;">38839 Spur 149 <b/>Magnolia TX 77354 <b/>United States</td>' +
            '	</tr>' +
            '	</table>' +
            '        </macro>' +
            '        <macro id="nlfooter">' +
            '            <table style="width: 100%; font-size: 8pt;"><tr>' +
            `	<td style="padding: 0;"><barcode codetype="code128" showtext="true" value="${tranid}"/></td> ` +
            '	<td align="right" style="padding: 0;">1 of 1</td>' +
            '	</tr></table>' +
            '        </macro>' +
            '    </macrolist>' +
            '    <style type="text/css">* {' +
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
            '         td.addressheader {' +
            '            font-size: 8pt;' +
            '            padding-top: 12px;' +
            '            padding-bottom: 2px;' +
            '        }' +
            '        td {' +
            '            padding: 4px 6px;' +
            '        }' +
            '		td p { align:left }' +
            '</style>' +
            '</head>' +
            '<body header="nlheader" header-height="15%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">' +
            '    <table style="width: 100%; margin-top: 10px;"><tr>' +
            '	<td class="addressheader" colspan="3"><b>Bill To</b></td>' +
            '      <td colspan="3" style="font-size: 8pt; padding: 6px 0 2px; font-weight: bold; color: #333333;">Ship To</td>' +
            '	</tr>' +
            '	<tr>' +
            '	<td class="address" colspan="3" rowspan="2">' + billAdd + '</td>' +
            '    <td colspan="3" style="padding: 0;">' + shipAdd + '</td>' +
            '	</tr></table>' +
            '   <table style="width: 100%; margin-top: 10px;">' +
            '  <tr style="padding: 5px; border-top: 0.3px; border-bottom: 0.3px;">' +
            '	<td colspan="3" style="padding: 0;"><b>Created By</b></td>' +
            '	<td colspan="3" style="padding: 0;">' + created_by + '</td>' +
            '	<td colspan="3" style="padding: 0;"></td>' +
            '	</tr>' +
            '  <tr style="padding: 5px; border-top: 0.3px; border-bottom: 0.3px;">' +
            '	<td colspan="3" style="padding: 0;"><b>FREIGHT TERMS</b></td>' +
            '	<td colspan="3" style="padding: 0;">' + shippingTerms + '</td>' +
            '	<td colspan="3" style="padding: 0;"></td>' +
            '	</tr>' +
            '</table > ' +
            '' +
            '<table style="width: 100%; margin-top: 10px;">' +
            '<thead>' +
            '	<tr>' +
            '      <th colspan="8" style="padding: 10px 6px;">Requested Due Date</th>' +
            '      <th colspan="6" style="padding: 10px 6px;">Customer PO#</th>' +
            '      <th colspan="6" style="padding: 10px 6px;">Terms</th>' +
            '     <th colspan="6" style="padding: 10px 6px;">Sales Rep</th>' +
            // '     <th colspan="6" style="padding: 10px 6px;">Credit for the Order</th>' +
            '	</tr>' +
            '</thead>' +
            '<tr>' +
            '   <td colspan="8" style="padding: 10px 6px;">' + requestedDueDate + '</td>' +
            ' <td colspan="6" style="padding: 10px 6px;">' + itemPO + '</td>' +
            ' <td colspan="6" style="padding: 10px 6px;">' + terms + '</td>' +
            ' <td colspan="6" style="padding: 10px 6px;">' + salesRep + '</td>' +
            // '   <td colspan="6" style="padding: 10px 6px;">' + soCredit + '</td>' +
            '  </tr>' +
            '</table>' +
            ' <table style="width: 100%; margin-top: 10px;">' +
            '<thead>' +
            '	<tr>' +
            '	<th align="left" colspan="1" style="padding: 10px 6px;">Item</th>' +
            '	<th align="left" colspan="3" style="padding: 10px 6px;">Customer Part No</th>' +
            '	<th align="left"  colspan="4" style="padding: 10px 6px;">Product</th>' +
            '	<th align="left" colspan="2" style="padding: 10px 6px;">Unit Price</th>' +
            '    <th align="left" colspan="2" style="padding: 10px 6px;">UOM</th>' +
            '	<th align="left" colspan="2" style="padding: 10px 6px;">Qty</th>' +
            '	<th align="left" colspan="2" style="padding: 10px 6px;">Line Total</th>' +
            '	</tr>' +
            '</thead>';

        myvar += '<tr>' +
            '	<td align="left" colspan="1" line-height="150%"><b>' + slNo + '</b></td>' +
            '	<td align="left" colspan="3">' + partNo + '</td>' +
            '    <td colspan="4"><span style="font-weight: bold; line-height: 150%; color: #333333;">' + item + '</span></td>' +
            '	<td align="left" colspan="2">$' + rate + '/' + uom + '</td>' +
            '	<td align="left" colspan="2">' + uom + '</td>' +
            '    <td align="left" colspan="2">' + inch + 'in<br/>' + lbs + 'lbs</td>' +
            '	<td align="left" colspan="2">$' + parseFloat(amt).toFixed(2) + '</td>' +
            '	</tr></table>';
        myvar += '<table style="width: 100%; margin-top: 10px;">' +
            '<thead>' +
            '	<tr>' +
            '     <th align="right" colspan="2" style="padding: 10px 6px;">Est. Gross Profit </th>' +
            '    <th align="right" colspan="2" style="padding: 10px 6px;">EST GROSS PROFIT PERCENTAGE</th>' +
            '	</tr>' +
            '</thead>' +
            '<tr>' +
            '    <td align="right" colspan="2">' + itemGrossProfit + '</td>' +
            '  <td align="right" colspan="2">' + parseFloat(itemGrossProfitPercentage).toFixed(2) + '</td>' +
            '	</tr>';

        myvar += '</table>';
        var subtotal = soLoad.getValue({
            fieldId: 'subtotal'
        })
        var tax = soLoad.getValue({
            fieldId: 'taxtotal'
        })
        if (tax == '') {
            tax = 0.00;
        }
        var total = soLoad.getValue({
            fieldId: 'total'
        })
        myvar += '<hr style="width: 100%; color: #d3d3d3; background-color: #d3d3d3; height: 1px;" />';
        var req_atrbts = soLoad.getValue({
            fieldId: 'custbody_pct_oss_cust_req_attributes'
        })
        var atr = req_atrbts.split("\n")
        myvar += '    <table style="width: 100%; margin-top: 10px;">';
        // for (var i = 0; i < atr.length; i++)
        // {
        //     myvar += '<tr>' +
        //         '       <td style="font-size: 8pt; ">' + atr[i] + '</td>' +
        //         '	</tr>';
        // }
        myvar += '</table>' +
            '<table style="page-break-inside: avoid; width: 100%; margin-top: 10px;"><tr>' +
            '	<td colspan="4"></td>' +
            '	<td align="right" style="font-weight: bold; color: #333333;">Subtotal</td>' +
            '	<td align="right">$' + parseFloat(subtotal).toFixed(2) + '</td>' +
            '	</tr>' +
            '	<tr>' +
            '	<td colspan="4"></td>' +
            '	<td align="right" style="font-weight: bold; color: #333333;">Tax(0%)</td>';
        if (tax == '') {
            myvar += '	<td align="right">$0.00</td>';
        }
        else {
            myvar += '	<td align="right">$' + parseFloat(tax).toFixed(2) + '</td>';
        }
        myvar += '	</tr>' +
            '	<tr style="background-color: #e3e3e3; line-height: 200%;">' +
            '	<td background-color="#ffffff" colspan="4"></td>' +
            '	<td align="right" style="font-weight: bold; color: #333333;">Total</td>' +
            '	<td align="right">$' + parseFloat(total).toFixed(2) + '</td>' +
            '	</tr></table>';



        log.debug({ title: 'PCT-OSS', details: "OSS Config Item Count : " + itemCount });
        myvar += '<table style="width: 100%; margin-top: 10px;">' +
            '<thead>' +
            '	<tr>' +
            '      <th colspan="8" style="padding: 10px 6px;">Control Number</th>' +
            '      <th colspan="6" style="padding: 10px 6px;">Lot Number</th>' +
            '      <th colspan="6" style="padding: 10px 6px;">Heat Number</th>' +
            '     <th colspan="6" style="padding: 10px 6px;">Joint Number</th>' +
            '<th  colspan = "6" style = "padding: 10px 6px;" >OD</th > ' +
            '<th colspan = "6" style = "padding: 10px 6px;" >ID</th > ' +
            '<th colspan = "6" style = "padding: 10px 6px;" >WALL</th > ' +
            '	</tr>' +
            '</thead>';
        for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            var controlNo = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_joint_num',
                line: itemIndex
            });
            var jointNo = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_items_joint',
                line: itemIndex
            });
            var lotNo = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_lot_num',
                line: itemIndex
            });
            var heatNo = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_heat_num',
                line: itemIndex
            });
            var OD = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_od',
                line: itemIndex
            });
            var ID = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_id',
                line: itemIndex
            });
            var wall = ossConfigLoad.getSublistValue({
                sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                fieldId: 'custrecord_pct_oss_config_line_wall',
                line: itemIndex
            });


            myvar += '<tr>' +
                '   <td colspan="8" style="padding: 10px 6px;">' + controlNo + '</td>' +
                ' <td colspan="6" style="padding: 10px 6px;">' + lotNo + '</td>' +
                ' <td colspan="6" style="padding: 10px 6px;">' + heatNo + '</td>' +
                '   <td colspan="6" style="padding: 10px 6px;">' + jointNo + '</td>' +
                '   <td colspan="6" style="padding: 10px 6px;">' + OD + '</td>' +
                '   <td colspan="6" style="padding: 10px 6px;">' + ID + '</td>' +
                '   <td colspan="6" style="padding: 10px 6px;">' + wall + '</td>' +
                '  </tr>';

        }
        myvar += '</table>';
        // myvar += '    <table style="width: 100%; margin-top: 10px;"><tr>' +
        //     '       <td style="font-size: 12pt; align:center;"><b>CERTIFICATE OF CONFORMANCE</b></td>' +
        //     '	</tr></table>';
        // for (var i = 0; i < itemCount; i++)
        // {
        //     var qty = soLoad.getSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'quantity',
        //         line: i
        //     })
        //     var grade = soLoad.getSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'custcol_pct_oss_po_grade',
        //         line: i
        //     })

        //     if (grade == '')
        //     {
        //         grade = '***'
        //     }

        //     myvar += '    <table style="width: 100%; margin-top: 10px;"><tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Customer:</b></td>' +
        //         '      <td style="font-size: 10pt;height:25pt;">' + customerName + '</td>' +
        //         '	</tr>' +
        //         '	<tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;"><b>PO Number:</b></td>' +
        //         '    <td style="font-size: 10pt;height:25pt;">' + po_num + '</td>' +
        //         '	</tr>' +
        //         '	<tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;"><b>PART NUMBER:</b></td>' +
        //         '    <td style="font-size: 10pt;height:25pt;">------</td>' +
        //         '	</tr>' +
        //         '	<tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;"><b>GRADE:</b></td>' +
        //         '    <td style="font-size: 10pt;height:25pt;">' + grade + '</td>' +
        //         '	</tr>' +
        //         '	<tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;"><b>SIZE:</b></td>' +
        //         '    <td style="font-size: 10pt;height:25pt;">**size**</td>' +
        //         '	</tr>' +
        //         '	<tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;"><b>QUANTITY:</b></td>' +
        //         '    <td style="font-size: 10pt;height:25pt;">' + qty + '</td>' +
        //         '	</tr>' +
        //         '	<tr>' +
        //         '	<td style="font-size: 10pt;height:25pt;"><b>OSS SO NUMBER:</b></td>' +
        //         '    <td style="font-size: 10pt;height:25pt;">' + tranid + '</td>' +
        //         '	</tr>';
        //     myvar += '</table>';
        //     // var req_atrbts = soLoad.getValue({
        //     //     fieldId: 'custbody_pct_oss_cust_req_attributes'
        //     // })
        //     // var atr = req_atrbts.split("\n")
        //     // for (var i = 0; i < atr.length; i++)
        //     // {
        //     //     var atr_data = atr[i].split(":");
        //     //     if (atr_data[1] == '')
        //     //     {
        //     //         atr_data[1] = '***'
        //     //     }
        //     //     myvar += '	<tr>' +
        //     //         '	<td style="font-size: 10pt;height:25pt;"><b>' + atr_data[0] + ':</b></td>' +
        //     //         '    <td style="font-size: 10pt;height:25pt;">' + atr_data[1] + '</td>' +
        //     //         '	</tr>';
        //     // }
        // }
        myvar +=
            '</body>' +
            '</pdf>';

        //myvar=myvar.replace("&","&amp;");
        //myvar=myvar.replace(" ","&nbsp;");


        context.response.renderPdf(myvar);
    }

    return {
        onRequest: onRequest
    }
});

