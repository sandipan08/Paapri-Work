/**
*@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(["N/search", 'N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record'],
    function (search, serverWidget, xml, log, render, record) {
        let cofcFieldsOrder = ['Customer Name', 'PO Number', 'Grade', 'Size', 'Quantity', 'OSS SO Number', 'Part Number', 'SPEC (S)', 'Job Number', 'IMPORTER OF RECORD']
        // var fieldsObj = [
        //     {
        //         "value": "8",
        //         "text": "Customer Name"
        //     },
        //     {
        //         "value": "3",
        //         "text": "Grade"
        //     },
        //     {
        //         "value": "7",
        //         "text": "Job Number"
        //     },
        //     {
        //         "value": "9",
        //         "text": "OSS SO Number"
        //     },
        //     {
        //         "value": "1",
        //         "text": "PO Number"
        //     },
        //     {
        //         "value": "2",
        //         "text": "Part Number"
        //     },
        //     {
        //         "value": "4",
        //         "text": "Quantity"
        //     },
        //     {
        //         "value": "5",
        //         "text": "SIze"
        //     },
        //     {
        //         "value": "6",
        //         "text": "SPEC (S)"
        //     }
        // ]

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
                    var soNo = ossConfigLoad.getText({ fieldId: 'custrecord_pct_oss_config_linked_so_no' });
                    var qty = ossConfigLoad.getValue({ fieldId: 'custrecord_pct_oss_configure_len_notes' });
                    var warehouse = ossConfigLoad.getText({ fieldId: 'custrecord_pct_oss_config_warehouse' });

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
                            log.debug({
                                title: 'PCT-LOG',
                                details: `Each Lines after splitting = ${splitEachElement}`
                            })
                            qtyArr.push(`${splitEachElement[0]} PCS @ ${splitEachElement[1]}" LONG`)
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
                        '            <table style="width: 100%; font-size: 8pt;"><tr>' +
                        '<!--	<td style="padding: 0;"><barcode codetype="code128" showtext="true" value="SO62"/></td> -->' +
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

                    // var customerData = search.lookupFields({ type: "customer", id: customerId, columns: ["custentity_pct_oss_cofc_fields", "custentity_pct_oss_cust_order_spec"] });
                    // // log.debug("PCT-OSS", "Customer Data : " + JSON.stringify(customerData));
                    // log.debug("PCT-OSS", "Customer All COFC Fields : " + JSON.stringify(customerData.custentity_pct_oss_cofc_fields) + ", Customer Order Specs : " + customerData.custentity_pct_oss_cust_order_spec);
                    var customerSearchObj = search.create({
                        type: "customer",
                        filters:
                            [
                                ["internalidnumber", "equalto", customerId]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "custentity_pct_oss_cofc_fields", label: "COFC Fields" }),
                                search.createColumn({ name: "custentity_pct_oss_req_attributes", label: "Required Attributes" }),
                                search.createColumn({ name: "custentity_pct_oss_cust_order_spec", label: "Order Specification" })
                            ]
                    });
                    var customerCount = customerSearchObj.runPaged().count;
                    log.debug("PCT-OSS", "Customer Count : " + customerCount);
                    var customerResult = customerSearchObj.run().getRange({ start: 0, end: customerCount });
                    for (let customerIndex = 0; customerIndex < customerCount; customerIndex++) {
                        var cofcFields = customerResult[customerIndex].getText({
                            name: "custentity_pct_oss_cofc_fields"
                        })
                        var spec = customerResult[customerIndex].getValue({
                            name: "custentity_pct_oss_cust_order_spec"
                        })
                        log.debug("PCT-OSS", "Cofc Fields : " + cofcFields + ", Spec : " + spec)
                        if (cofcFields.length) {
                            // log.debug("PCT-OSS", "COFC Fields : " + cofcFields);
                            var cofcArray = cofcFields.split(",");
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
                                    else if (cofcFieldsOrder[cofcIndex] == "Size" && size) {
                                        myvar += '	<tr>' +
                                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                            '      <td style="font-size: 10pt;height:25pt;">' + size + '</td>' +
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
                                    else if (cofcFieldsOrder[cofcIndex] == "SPEC (S)" && spec) {
                                        myvar += '	<tr>' +
                                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                            '      <td style="font-size: 10pt;height:25pt;">' + spec + '</td>' +
                                            '	</tr>';
                                    }
                                    else if (cofcFieldsOrder[cofcIndex] == "Job Number" && workOrderNumber) {
                                        myvar += '	<tr>' +
                                            '	<td style="font-size: 10pt;height:25pt;padding-right:-20pt;"><b>' + cofcFieldsOrder[cofcIndex] + '</b></td>' +
                                            '      <td style="font-size: 10pt;height:25pt;">' + workOrderNumber + '</td>' +
                                            '	</tr>';
                                    }
                                }
                            }
                        }
                    }

                    // customerData.custentity_pct_oss_cofc_fields.map((element) =>
                    // {
                    //     log.debug("PCT-OSS", "COFC Fields : " + JSON.stringify(element));

                    //     if (element.value == 2)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + customerPONo + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 7)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + customerPartNo + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 3)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + grade + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 5)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + qty + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 4)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + size + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 8)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + customerData.custentity_pct_oss_cust_order_spec + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 9)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + "----" + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 1)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + customerName + '</td>' +
                    //             '	</tr>';
                    //     }
                    //     else if (element.value == 6)
                    //     {
                    //         myvar += '	<tr>' +
                    //             '	<td style="font-size: 10pt;height:25pt;paddin-right:-20pt;"><b>' + element.text + '</b></td>' +
                    //             '      <td style="font-size: 10pt;height:25pt;">' + soNo + '</td>' +
                    //             '	</tr>';
                    //     }

                    // })

                    myvar += '</table>';
                    myvar += '<div style="width: 100%">' +
                        '        <table width="50%" align="center" style="text-align: center" >' +
                        '            <thead>' +
                        '                <tr>' +
                        '                    <th>HEAT #</th>' +
                        '                    <th>LOT #</th>' +
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
                            '                    <td>' + mill + '</td>' +
                            '                </tr>';
                    }
                    myvar += '   </tbody>' +
                        '        </table>' +
                        '    </div>';
                }
                myvar += `<table style="font-size:15px; font-weight:bold;margin-top:10px"><thead></thead><tbody><tr><td>Oilfield Steel Supply certifies that the material above and on the attached test reorder contact and to the specification(s) stated above. This order was processed in Steel Supply's current Quality Managment System</td></tr></tbody></table>`
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