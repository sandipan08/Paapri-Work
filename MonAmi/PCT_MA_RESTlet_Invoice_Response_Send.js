
/**
*              //////////     MON AMI Send Response of Sales Order Number which are in Pending Fulfillment      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for  MON AMI Send Response of Sales Order Number which are in Pending Fulfillment, you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{

    function _get(context)
    {
        try
        {
            log.debug({ title: "PCT-MonAmi", details: "In Post" });
            var salesorderSearchObj = search.create({
                type: "invoice",
                filters:
                    [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["custbody_pct_ma_send_to_warehouse", "is", "T"],
                        "AND",
                        // ["internalidnumber", "equalto", "96584"],
                        // "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["item.type", "noneof", "Discount"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID", summary: "GROUP", }),
                        search.createColumn({ name: "tranid", label: "Document Number", summary: "GROUP", }),
                        search.createColumn({
                            name: "email",
                            join: "customer",
                            summary: "GROUP",
                            label: "Customer Email"
                        }),
                        search.createColumn({
                            name: "phone",
                            join: "customer",
                            summary: "GROUP",
                            label: "Customer Phone"
                        }),
                        search.createColumn({
                            name: "itemid",
                            join: "item",
                            summary: "GROUP",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "salesdescription",
                            join: "item",
                            summary: "GROUP",
                            label: "Description"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "item",
                            summary: "GROUP",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "displayname",
                            join: "item",
                            summary: "GROUP",
                            label: "Item Display Name"
                        }),

                        search.createColumn({ name: "quantity", label: "Quantity", summary: "GROUP", }),
                        search.createColumn({ name: "shipaddress1", label: "Shipping Address 1", summary: "GROUP", }),
                        search.createColumn({ name: "shipaddress2", label: "Shipping Address 2", summary: "GROUP", }),
                        search.createColumn({ name: "shipaddress3", label: "Shipping Address 3", summary: "GROUP", }),
                        search.createColumn({ name: "shipaddressee", label: "Shipping Addressee", summary: "GROUP", }),
                        search.createColumn({ name: "shipphone", label: "Shipping Phone", summary: "GROUP", }),
                        search.createColumn({ name: "shipcity", label: "Shipping City", summary: "GROUP", }),
                        search.createColumn({ name: "shipstate", label: "Shipping State/Province", summary: "GROUP", }),
                        search.createColumn({ name: "shipstate", label: "Shipping State/Province", summary: "GROUP", }),
                        search.createColumn({ name: "shipzip", label: "Shipping Zip", summary: "GROUP", }),
                        search.createColumn({ name: "shipmethod", label: "Ship Via", summary: "GROUP", }),
                        search.createColumn({ name: "shippingattention", label: "Shipping Attention", summary: "GROUP", }),
                        search.createColumn({ name: "shipcarrier", label: "Shipping Carrier", summary: "GROUP", }),
                        search.createColumn({ name: "custbody_pct_ma_so_psn", label: "Packing Slip Name", summary: "GROUP", }),
                        search.createColumn({ name: "isshipaddress", label: "Residential Address", summary: "GROUP", }),
                        search.createColumn({ name: "class", label: "Class", summary: "GROUP", }),
                        search.createColumn({ name: "otherrefnum", label: "PO/Check Number", summary: "GROUP", }),
                        search.createColumn({ name: "createdfrom", label: "Created From", summary: "GROUP", }),
                        search.createColumn({ name: "shipcountry", label: "Shipping Country", summary: "GROUP", })
                    ]
            });
            var soCount = salesorderSearchObj.runPaged().count;
            log.debug("PCT-MonAmi", "Invoice Count : " + soCount);
            var start = 0;
            var end = 1000;
            var soObjArray = new Array();
            var itemArray = new Array();
            do
            {
                log.debug("PCT-MonAmi", "In POST Do");
                var soResult = salesorderSearchObj.run().getRange({ start: start, end: end });
                for (var getid_index = 0; getid_index < soResult.length; getid_index++)
                {

                    //-------------------------- Getting So Details ------------------------------

                    var internalId = soResult[getid_index].id;
                    var documentNumber = soResult[getid_index].getValue({ name: "tranid", summary: "GROUP" });
                    var soClass = soResult[getid_index].getText({ name: "class", summary: "GROUP" });
                    var poNumber = soResult[getid_index].getValue({ name: "otherrefnum", summary: "GROUP" });
                    var packingSlipName = soResult[getid_index].getValue({ name: "custbody_pct_ma_so_psn", summary: "GROUP" });
                    var cEmail = soResult[getid_index].getValue({ name: "email", join: "customer", summary: "GROUP" });
                    var cPhnNo = soResult[getid_index].getValue({ name: "shipphone", summary: "GROUP" });

                    var shipAddress1 = soResult[getid_index].getValue({ name: "shipaddress1", summary: "GROUP" });
                    var shipAddress2 = soResult[getid_index].getValue({ name: "shipaddress2", summary: "GROUP" });
                    var shipaddressee = soResult[getid_index].getValue({ name: "shipaddressee", summary: "GROUP" });
                    var shipAttention = soResult[getid_index].getValue({ name: "shippingattention", summary: "GROUP" });
                    var shipCarrier = soResult[getid_index].getValue({ name: "shipcarrier", summary: "GROUP" });
                    var shipMethod = soResult[getid_index].getText({ name: "shipmethod", summary: "GROUP" });
                    var shipPhnNo = soResult[getid_index].getValue({ name: "shipphone", summary: "GROUP" });
                    var shipCity = soResult[getid_index].getValue({ name: "shipcity", summary: "GROUP" });
                    var shipCountry = soResult[getid_index].getText({ name: "shipcountry", summary: "GROUP" });
                    var shipZip = soResult[getid_index].getValue({ name: "shipzip", summary: "GROUP" });
                    var shipState = soResult[getid_index].getValue({ name: "shipstate", summary: "GROUP" });

                    // var billAddress1 = soResult[getid_index].getValue({ name: "billaddress1" });
                    // var billAddress2 = soResult[getid_index].getValue({ name: "billaddress2" });
                    // var billaddressee = soResult[getid_index].getValue({ name: "billaddressee" });
                    // var billCity = soResult[getid_index].getValue({ name: "billcity" });
                    // var billCountry = soResult[getid_index].getText({ name: "billcountry" });
                    // var billZip = soResult[getid_index].getValue({ name: "billzip" });
                    // var billState = soResult[getid_index].getValue({ name: "billstate" });
                    // var billPhnNo = soResult[getid_index].getValue({ name: "billphone" });
                    // var billAttention = soResult[getid_index].getValue({ name: "billattention" });

                    var residentialAddress = soResult[getid_index].getValue({ name: "isshipaddress", summary: "GROUP" });

                    var itemName = soResult[getid_index].getValue({
                        name: "itemid",
                        join: "item",
                        summary: "GROUP",
                    });
                    var itemDesc = soResult[getid_index].getValue({
                        name: "salesdescription",
                        join: "item",
                        summary: "GROUP",
                    });
                    var itemQty = soResult[getid_index].getValue({ name: "quantity" });
                    var itemId = soResult[getid_index].getValue({
                        name: "internalid",
                        join: "item",
                        summary: "GROUP",
                    });
                    var itemDisplayName = soResult[getid_index].getValue({
                        name: "displayname",
                        join: "item",
                        summary: "GROUP",
                    });


                    log.debug({
                        title: "PCT-MonAmi", details: "Invoice Body Details : [ Internal Number : " + internalId + ", Document Number : " + documentNumber + ", Class : " + soClass + ", PO# : " + poNumber +
                            ", Packing Slip Name : " + packingSlipName + ", Customer Mail : " + cEmail + ", Customer Phn No : " + cPhnNo + "]"
                    });
                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Invoice Shipping Details : [ Ship Address 1 : " + shipAddress1 + ", Ship Address 2 : " + shipAddress2 +
                            ", Ship Attention : " + shipAttention + ", Ship Carrier : " + shipCarrier + ", Ship Method : " + shipMethod + ", Residential Address : " + residentialAddress +
                            ", Shipping Phone Number : " + shipPhnNo + ", Ship City : " + shipCity + ", Ship Country : " + shipCountry + ", Ship Zip : " + shipZip + ", Ship State : " + shipState + "]"
                    })
                    // log.debug({
                    //     title: "PCT-MonAmi",
                    //     details: "Sales Order Billing Details : [ Billing Address1 : " + billAddress1 + ", Billing Address2 : " + billAddress2 + ", Bill Addressee : " + billaddressee + ", Bill City : " + billCity +
                    //         ", Bill Country : " + billCountry + ", Bill Zip : " + billZip + ", Bill State : " + billState + ", Bill Phn No : " + billPhnNo + ", Billing Attention : " + billAttention + "]"
                    // })

                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Item Details : [ Item Name : " + itemName + ", Item Id : " + itemId + ", Display Name : " + itemDisplayName + ", Item Desc : " + itemDesc + ", Item Qty : " + itemQty + " ]"
                    })
                    if (!itemArray.includes(itemId))
                    {
                        itemArray.push(itemId)
                        //----------------------------- Create Json Obj ---------------------------

                        var soObj = new Object();
                        soObj['internalId'] = internalId;
                        soObj['documentNumber'] = documentNumber;
                        soObj['soClass'] = soClass;
                        soObj['po#'] = poNumber;
                        soObj['packingSlipName'] = packingSlipName;
                        soObj['customerEmail'] = cEmail;
                        soObj['customerPhnNo'] = cPhnNo;

                        soObj['shipPhnNo'] = shipPhnNo;
                        soObj['shipCity'] = shipCity;
                        soObj['shipCountry'] = shipCountry;
                        soObj['shipZip'] = shipZip;
                        soObj['shipState'] = shipState;
                        soObj['shipAddress1'] = shipAddress1;
                        soObj['shipAddress2'] = shipAddress2;
                        soObj['shipaddressee'] = shipaddressee;
                        soObj['shipAttention'] = shipAttention;
                        soObj['shipCarrier'] = shipCarrier;
                        soObj['shipMethod'] = shipMethod;
                        soObj['residentialAddress'] = residentialAddress;

                        // soObj['billPhnNo'] = billPhnNo;
                        // soObj['billCity'] = billCity;
                        // soObj['billCountry'] = billCountry;
                        // soObj['billZip'] = billZip;
                        // soObj['billState'] = billState;
                        // soObj['billAddress1'] = billAddress1;
                        // soObj['billAddress2'] = billAddress2;
                        // soObj['billaddressee'] = billaddressee;
                        // soObj['billAttention'] = billAttention;

                        soObj['itemName'] = itemName;
                        soObj['itemDesc'] = itemDisplayName;
                        soObj['itemQty'] = itemQty;

                        soObjArray.push(soObj);

                        log.debug({
                            title: "PCT-MonAmi",
                            details: "MonAmi SO Record Array : " + JSON.stringify(soObjArray)
                        })
                    }
                }
                start += 1000;
                end += 1000;
                soCount -= 1000;
            }
            while (soCount > 0);
            log.debug({
                title: "PCT-MonAmi",
                details: "MonAmi SO Record Array : " + JSON.stringify(soObjArray)
            })

            return JSON.stringify(soObjArray);
        }
        catch (err)
        {
            return JSON.stringify({ status: 500, message: err.message });
        }
    }


    return {
        get: _get,
    }
});
