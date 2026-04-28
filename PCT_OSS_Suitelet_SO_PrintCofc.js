/**
*@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(["N/search", 'N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record'],
    function (search, serverWidget, xml, log, render, record) {
        let cofcFieldsOrder = ['Customer Name', 'PO Number', 'Grade', 'Size', 'Quantity', 'OSS SO Number', 'Part Number', 'Job Number']
        function onRequest(context) {
            if (context.request.method === 'GET') {

                var id = context.request.parameters.recordId;
                log.debug({ title: 'PCT-OSS', details: "Record Id " + id });
                var soLoad = record.load({ type: record.Type.SALES_ORDER, id: id });
                var customerId = soLoad.getValue({ fieldId: 'entity' });
                var customerName = soLoad.getValue({ fieldId: 'entityname' });
                // Get OSS Config Id
                var itemCount = soLoad.getLineCount({ sublistId: 'item' });
                for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                    var configId = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_pct_oss_so_pct_config_id',
                        line: itemIndex
                    });

                    let workOrderNumber = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'createwo',
                        line: itemIndex
                    });
                    let salesDescription = soLoad.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: itemIndex
                    });

                    log.debug({ title: "PCT-POC", details: "Customer Id : " + customerId + ", Customer Name : " + customerName + ", OSS Config Id : " + configId });
                    // Load OSS Config
                    var ossConfigLoad = record.load({
                        type: 'customrecord_pct_oss_configure',
                        id: configId
                    });
                    var customerPONo = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_configure_customer_po' });
                    var customerPartNo = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_config_customer_part' });
                    var grade = ossConfigLoad.getText({ fieldId: 'custrecord_pct_oss_config_grade' });
                    var finish = ossConfigLoad.getText({ fieldId: 'custrecord_pct_oss_config_finish' });
                    var OdInch = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_config_outside_dia' });
                    var IdInch = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_config_inside_dia' });
                    var wallId = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_config_wall' });
                    var size = OdInch + " OD X " + IdInch + " ID X " + wallId + " WALL";
                    var soNo = ossConfigLoad.getText({ fieldId: 'custrecord_pct_oss_config_linked_so_no' }).split("SO")[1];
                    // log.debug("PCT-OSS", `So No : ${soNo}`)
                    var qty = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_configure_len_notes' });
                    var warehouse = ossConfigLoad.getText({ fieldId: 'custrecord_pct_oss_config_warehouse' });
                    var cofcFields = JSON.stringify(ossConfigLoad.getText({
                        fieldId: "custrecord_pct_oss_configure_req_attr"
                    }))

                    // Get Customer Attributes Field Value


                    var customerAttributesArray = [specs, hardnessRange, jobNumber, hsCode, importerOfRecord, coo, eccnNumber, joNumber, woNumber, gNumber, qrd, diValue, otNumber, tagNumber, commCode, customOptionOne, customOptionTwo, customOptionThree, customerAttributesArray]

                    // log.debug("PCT-OSS", "PO Number : " + customerPONo + ", Part No : " + customerPartNo + ", Grade : " + grade + ", Size : " + size + ", Sales Order No : " + soNo + ", Qty : " + qty + ", Warehouse : " + warehouse);
                    let qtyArr = [];
                    let getEachLinesOfQty = qty.split('\n');
                    log.debug({
                        title: 'PCT-LOG',
                        details: `Each Lines = ${getEachLinesOfQty}`
                    })
                    if (getEachLinesOfQty.length > 0) {
                        getEachLinesOfQty.map((element) => {
                            let splitEachElement = element.split('@')
                            log.debug(`PCT-LOG`, `${splitEachElement[0]}`)
                            if (splitEachElement[0] > 1) {
                                qtyArr.push(`${splitEachElement[0].trim()} PCS @ ${splitEachElement[1].trim()}" LONG`)
                            }
                            else {
                                qtyArr.push(`${splitEachElement[0].trim()} PC @ ${splitEachElement[1].trim()}" LONG`)
                            }
                        })
                    }
                    log.debug({
                        title: 'PCT-LOG',
                        details: `Qty arr = ${qtyArr}`
                    })

                    var header = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
                        '<pdf>' +
                        '<head>' +
                        '    <macrolist>' +
                        '        <macro id="nlheader">' +
                        '           <table style="width: 100%; font-size: 10pt;"><tr>' +
                        '<td align="left" rowspan="4" style="margin: 10px 0px 5px 5px;"><img height="60" src="https://5499923.secure.netsuite.com/core/media/media.nl?id=8858&amp;c=5499923&amp;h=NM32-AoRAoao8RsuLf-W5D68f9UGMJvxm1HLb6x8bHfiiVaI" style="float: left;" width="140" /></td></tr>' +
                        '	</table>' +
                        '        </macro>' +
                        '        <macro id="nlfooter">' +
                        '            <table style="width: 100%; font-size: 10pt;"><tr>' +
                        // '<!--	<td style="padding: 0;"><barcode codetype="code128" showtext="true" value="SO62"/></td> -->' +
                        '	<td align="center" style="padding: 0;">38839 Spur 149 | Magnolia TX 77354 | Main : 281-789-2380</td>' +
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
                        '            font-size: 12pt;' +
                        '            vertical-align: middle;' +
                        '            padding: 5px 6px 3px;' +
                        '            color: #333333;' +
                        '        }' +
                        '         td.addressheader {' +
                        '            font-size: 10pt;' +
                        '            padding-top: 12px;' +
                        '            padding-bottom: 2px;' +
                        '        }' +
                        '        td {' +
                        '            padding: 4px 6px;' +
                        '        }' +
                        '		td p { align:left }' +

                        //  'body{' +
                        // '    width: 100%;' +
                        // '    height: 100%;' +
                        // '    margin: 0; /* Space from this element (entire page) and others*/' +
                        // '    padding: 0; /*space from content and border*/' +
                        // '    border: solid blue;' +
                        // '    border-width: thin;' +
                        // '    overflow:hidden;' +
                        // '    display:block;' +
                        // '}'+


                        '</style>' +
                        '</head>' +
                        '<body header="nlheader" header-height="15%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter" >' +
                        '    <table style="width: 100%; margin-top: 10px;"><tr>' +
                        '       <td style="font-size: 12pt; align:center;"><b>CERTIFICATE OF CONFORMANCE</b></td>' +
                        '	</tr></table>';

                    // --------------------------------- Get COFC Fields from Customer -------------------------
                    var myvar = '    <table style="width: 100%; margin-top: 10px;">';

                    if (cofcFields.length) {
                        var cofcArray = JSON.parse(cofcFields.split(","));
                        log.debug("PCT-OSS", "COFC Array: " + cofcArray + typeof cofcArray);
                        for (var cofcIndex = 0; cofcIndex < cofcFieldsOrder.length; cofcIndex++) {
                            log.debug("PCT-OSS", "COFC Fields : " + cofcFieldsOrder[cofcIndex]);
                            if (cofcArray.includes(cofcFieldsOrder[cofcIndex])) {
                                if (cofcFieldsOrder[cofcIndex] == "Customer Name" && customerName) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        '      <td style="font-size: 10pt;height:25pt;">' + customerName + '</td>' +
                                        '	</tr>';
                                }
                                else if (cofcFieldsOrder[cofcIndex] == "PO Number" && customerPONo) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        '      <td style="font-size: 10pt;height:25pt;">' + customerPONo + '</td>' +
                                        '	</tr>';
                                }
                                else if (cofcFieldsOrder[cofcIndex] == "Grade" && grade && finish) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        `      <td style="font-size: 10pt;height:25pt;">${grade} ${finish}</td>` +
                                        '	</tr>';
                                }
                                else if (cofcFieldsOrder[cofcIndex] == "Size" && salesDescription) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        '      <td style="font-size: 10pt;height:25pt;">' + salesDescription + '</td>' +
                                        '	</tr>';
                                }
                                else if (cofcFieldsOrder[cofcIndex] == "Quantity" && qtyArr.length > 0) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        '      <td style="font-size: 10pt;height:25pt;">' + qtyArr.join('\n') + '</td>' +
                                        '	</tr>';
                                }
                                else if (cofcFieldsOrder[cofcIndex] == "OSS SO Number" && soNo) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        '      <td style="font-size: 10pt;height:25pt;">' + soNo + '</td>' +
                                        '	</tr>';
                                }
                                else if (cofcFieldsOrder[cofcIndex] == "Part Number" && customerPartNo) {
                                    myvar += '	<tr>' +
                                        '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                        '      <td style="font-size: 10pt;height:25pt;">' + customerPartNo + '</td>' +
                                        '	</tr>';
                                }

                            }

                        }
                    }



                    var specs = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_specs' });
                    if (specs) {

                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Specs(S)</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + specs + '</td>' +
                            '	</tr>';
                    }

                    var hardnessRange = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_hardnessrange' });
                    if (hardnessRange) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Hardness Range</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + hardnessRange + '</td>' +
                            '	</tr>';
                    }
                    var jobNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_jobno' });
                    if (jobNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Job Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + jobNumber + '</td>' +
                            '	</tr>';
                    }
                    var hsCode = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_hscode' });
                    if (hsCode) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>HS Code</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + hsCode + '</td>' +
                            '	</tr>';
                    }
                    var importerOfRecord = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_importerofrecord' });
                    if (importerOfRecord) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Importer Of Record</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + importerOfRecord + '</td>' +
                            '	</tr>';
                    }
                    var coo = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_coo' });
                    if (coo) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>COO</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + coo + '</td>' +
                            '	</tr>';
                    }
                    var eccnNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_eccnno' });
                    if (eccnNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>ECNN Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + eccnNumber + '</td>' +
                            '	</tr>';
                    }
                    var joNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_jono' });
                    if (joNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>JO Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + joNumber + '</td>' +
                            '	</tr>';
                    }
                    var woNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_wono' });
                    if (woNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>WO Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + woNumber + '</td>' +
                            '	</tr>';
                    }
                    var gNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_gno' });
                    if (gNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>G Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + gNumber + '</td>' +
                            '	</tr>';
                    }
                    var qrd = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_qrd' });
                    if (qrd) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>QRD</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + qrd + '</td>' +
                            '	</tr>';
                    }
                    var diValue = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_divalue' });
                    if (diValue) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>DI Value</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + diValue + '</td>' +
                            '	</tr>';
                    }
                    var otNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_otno' });
                    if (otNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>OT Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + otNumber + '</td>' +
                            '	</tr>';
                    }
                    var tagNumber = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_tagno' });
                    if (tagNumber) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Tag Number</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + tagNumber + '</td>' +
                            '	</tr>';
                    }
                    var commCode = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_commcode' });
                    if (commCode) {
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>Commodity Code</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + commCode + '</td>' +
                            '	</tr>';
                    }
                    var customOptionOne = soLoad.getValue({ fieldId: 'custbody_pct_oss_tran_custopt1' });
                    if (customOptionOne) {
                        var customOptionOneTitle = customOptionOne.split(':')[0];
                        var customOptionOneValue = customOptionOne.split(':')[1];
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + customOptionOneTitle + '</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + customOptionOneValue + '</td>' +
                            '	</tr>';
                    }
                    var customOptionTwo = soLoad.getValue({ fieldId: 'custbody_pct_oss_custopt2' });
                    if (customOptionTwo) {
                        var customOptionTwoTitle = customOptionTwo.split(':')[0];
                        var customOptionTwoValue = customOptionTwo.split(':')[1];
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + customOptionTwoTitle + '</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + customOptionTwoValue + '</td>' +
                            '	</tr>';
                    }
                    var customOptionThree = soLoad.getValue({ fieldId: 'custbody_pct_oss_custopt3' });
                    if (customOptionThree) {
                        var customOptionThreeTitle = customOptionThree.split(':')[0];
                        var customOptionThreeValue = customOptionThree.split(':')[1];
                        myvar += '	<tr>' +
                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + customOptionThreeTitle + '</b></td>' +
                            '      <td style="font-size: 10pt;height:25pt;">' + customOptionThreeValue + '</td>' +
                            '	</tr>';
                    }
                    myvar += '</table>';
                    myvar += '<div style="width: 100%">' +
                        '        <table width="50%" align="center" style="text-align: center" >' +
                        '            <thead>' +
                        '                <tr>' +
                        '                    <th>HEAT #</th>' +
                        '                    <th>LOT #</th>' +
                        '                    <th>JT#</th>' +
                        '                    <th>ORIGIN</th>' +

                        '                </tr>' +
                        '            </thead>' +
                        '            <tbody>';
                    var itemCount = ossConfigLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_oss_configure_child_link' });
                    log.debug({ title: 'PCT-Shopify-Integration', details: "OSS Config Item Count : " + itemCount });
                    for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                        var itemId = ossConfigLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                            fieldId: 'custrecord_pct_oss_config_item_name',
                            line: itemIndex
                        });
                        var controlNo = ossConfigLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                            fieldId: 'custrecord_pct_oss_config_joint_num',
                            line: itemIndex
                        });
                        var jointNumber = ossConfigLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                            fieldId: 'custrecord_pct_oss_config_items_joint',
                            line: itemIndex
                        });
                        var lotNumber = ossConfigLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                            fieldId: 'custrecord_pct_oss_config_lot_num',
                            line: itemIndex
                        });
                        var heatNumber = ossConfigLoad.getSublistValue({
                            sublistId: 'recmachcustrecord_pct_oss_configure_child_link',
                            fieldId: 'custrecord_pct_oss_config_heat_num',
                            line: itemIndex
                        });

                        var mill = getJointMill(itemId, controlNo);
                        myvar += '<tr>' +
                            '                    <td>' + heatNumber + '</td>' +
                            '                    <td>' + lotNumber + '</td>' +
                            '                    <td>' + jointNumber + '</td>' +
                            '                    <td>' + mill + '</td>' +
                            '                </tr>';
                    }
                    myvar += '   </tbody>' +
                        '        </table>' +
                        '    </div>';
                }
                myvar += `<br/><table width="100%" style="font-size:12px; font-weight:bold; margin-top:10px;"><tr><td align="center" line-height="50%">Oilfield Steel Supply certifies that the material above and on the attached test report(s) complies with the </td></tr><tr><td align="center" line-height="50%"> order contract and to the specification(s) stated above. This order was processed in accordance with Oilfield </td></tr><tr><td align="center" line-height="50%"> Steel Supply's current Quality Management System.</td></tr></table>`
                myvar += '</body>' +
                    '</pdf>';

                var newMyvar = removeAmp(myvar)
                var fullString = header + newMyvar
                context.response.renderPdf(fullString);
            }
        }

        function removeAmp(myvar) {
            return myvar.split('&').join('&amp;')
        }
        function getJointMill(itemId, controlNo) {
            var inventorynumberSearchObj = search.create({
                type: "inventorynumber",
                filters:
                    [
                        ["item", "anyof", itemId],
                        "AND",
                        ["inventorynumber", "is", controlNo]
                    ],
                columns:
                    [
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({
                            name: "inventorynumber",
                            sort: search.Sort.ASC,
                            label: "Number"
                        }),
                        search.createColumn({ name: "custitemnumber_pct_oss_item_number_mill", label: "Mill" }),
                        search.createColumn({
                            name: "custrecord_pct_oss_country_of_origin",
                            join: "CUSTITEMNUMBER_PCT_OSS_ITEM_NUMBER_MILL",
                            label: "Country Of Origin"
                        })
                    ]
            });
            var inventoryNumberCount = inventorynumberSearchObj.runPaged().count;
            var inventoryNumberResult = inventorynumberSearchObj.run().getRange({ start: 0, end: inventoryNumberCount });
            for (let iNIndex = 0; iNIndex < inventoryNumberCount; iNIndex++) {
                var inventoryNumber = inventoryNumberResult[iNIndex].getValue({
                    name: "inventorynumber",
                    sort: search.Sort.ASC,
                    label: "Number"
                })
                var mill = inventoryNumberResult[iNIndex].getValue({
                    name: "custrecord_pct_oss_country_of_origin",
                    join: "CUSTITEMNUMBER_PCT_OSS_ITEM_NUMBER_MILL",
                    label: "Country Of Origin"
                })
            }
            return mill;
        }

        return {
            onRequest: onRequest,
        };
    });