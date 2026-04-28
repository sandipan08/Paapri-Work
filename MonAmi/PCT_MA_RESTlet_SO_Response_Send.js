
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
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["status", "anyof", "SalesOrd:B"],
                        "AND",
                        ["internalid", "anyof", "5835", "5836"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({
                            name: "email",
                            join: "customer",
                            label: "Email"
                        }),
                        search.createColumn({ name: "class", label: "Class" }),
                        search.createColumn({ name: "otherrefnum", label: "PO/Check Number" }),
                        search.createColumn({ name: "custbody_pct_ma_so_psn", label: "Packing Slip Name" }),
                        search.createColumn({ name: "shipphone", label: "Shipping Phone" }),
                        search.createColumn({ name: "shipaddress1", label: "Shipping Address 1" }),
                        search.createColumn({ name: "shipaddress2", label: "Shipping Address 2" }),
                        search.createColumn({ name: "shipaddress3", label: "Shipping Address 3" }),
                        search.createColumn({ name: "shipaddressee", label: "Shipping Addressee" }),
                        search.createColumn({ name: "shippingattention", label: "Shipping Attention" }),
                        search.createColumn({ name: "shipcarrier", label: "Shipping Carrier" }),
                        search.createColumn({ name: "shipmethod", label: "Ship Via" }),
                        search.createColumn({ name: "isshipaddress", label: "Residential Address" }),
                        search.createColumn({ name: "shipcity", label: "Shipping City" }),
                        search.createColumn({ name: "shipcountry", label: "Shipping Country" }),
                        search.createColumn({ name: "shipzip", label: "Shipping Zip" }),
                        search.createColumn({ name: "shipstate", label: "Shipping State/Province" }),

                        search.createColumn({ name: "billaddressee", label: "Billing Addressee" }),
                        search.createColumn({ name: "billaddress1", label: "Billing Address 1" }),
                        search.createColumn({ name: "billaddress2", label: "Billing Address 2" }),
                        search.createColumn({ name: "billcity", label: "Billing City" }),
                        search.createColumn({ name: "billcountry", label: "Billing Country" }),
                        search.createColumn({ name: "billstate", label: "Billing State/Province" }),
                        search.createColumn({ name: "billzip", label: "Billing Zip" }),
                        search.createColumn({ name: "billphone", label: "Billing Phone" }),
                        search.createColumn({ name: "billattention", label: "Company" }),

                        search.createColumn({
                            name: "itemid",
                            join: "item",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "salesdescription",
                            join: "item",
                            label: "Description"
                        }),
                        search.createColumn({ name: "quantity", label: "Quantity" })

                    ]
            });
            var soCount = salesorderSearchObj.runPaged().count;
            log.debug("PCT-MonAmi", "Sales Order Count : " + soCount);
            var start = 0;
            var end = 1000;
            var soObjArray = new Array();
            var soItemObjArray = new Array();
            do
            {
                log.debug("PCT-MonAmi", "In POST Do");
                var soResult = salesorderSearchObj.run().getRange({ start: start, end: end });
                for (var getid_index = 0; getid_index < soResult.length; getid_index++)
                {

                    //-------------------------- Getting So Details ------------------------------

                    var internalId = soResult[getid_index].id;
                    var documentNumber = soResult[getid_index].getValue({ name: "tranid" });
                    var soClass = soResult[getid_index].getText({ name: "class" });
                    var poNumber = soResult[getid_index].getValue({ name: "otherrefnum" });
                    var packingSlipName = soResult[getid_index].getValue({ name: "custbody_pct_ma_so_psn" });
                    var cEmail = soResult[getid_index].getValue({ name: "email", join: "customer" });
                    var cPhnNo = soResult[getid_index].getValue({ name: "shipphone" });

                    var shipAddress1 = soResult[getid_index].getValue({ name: "shipaddress1" });
                    var shipAddress2 = soResult[getid_index].getValue({ name: "shipaddress2" });
                    var shipaddressee = soResult[getid_index].getValue({ name: "shipaddressee" });
                    var shipAttention = soResult[getid_index].getValue({ name: "shippingattention" });
                    var shipCarrier = soResult[getid_index].getValue({ name: "shipcarrier" });
                    var shipMethod = soResult[getid_index].getText({ name: "shipmethod" });
                    var shipPhnNo = soResult[getid_index].getValue({ name: "shipphone" });
                    var shipCity = soResult[getid_index].getValue({ name: "shipcity" });
                    var shipCountry = soResult[getid_index].getText({ name: "shipcountry" });
                    var shipZip = soResult[getid_index].getValue({ name: "shipzip" });
                    var shipState = soResult[getid_index].getValue({ name: "shipstate" });

                    var billAddress1 = soResult[getid_index].getValue({ name: "billaddress1" });
                    var billAddress2 = soResult[getid_index].getValue({ name: "billaddress2" });
                    var billaddressee = soResult[getid_index].getValue({ name: "billaddressee" });
                    var billCity = soResult[getid_index].getValue({ name: "billcity" });
                    var billCountry = soResult[getid_index].getText({ name: "billcountry" });
                    var billZip = soResult[getid_index].getValue({ name: "billzip" });
                    var billState = soResult[getid_index].getValue({ name: "billstate" });
                    var billPhnNo = soResult[getid_index].getValue({ name: "billphone" });
                    var billAttention = soResult[getid_index].getValue({ name: "billattention" });

                    var residentialAddress = soResult[getid_index].getValue({ name: "isshipaddress" });

                    var itemName = soResult[getid_index].getValue({
                        name: "itemid",
                        join: "item",
                    });
                    var itemDesc = soResult[getid_index].getValue({
                        name: "salesdescription",
                        join: "item",
                    });
                    var itemQty = soResult[getid_index].getValue({ name: "quantity" });

                    log.debug({
                        title: "PCT-MonAmi", details: "Sales Order Body Details : [ Internal Number : " + internalId + ", Document Number : " + documentNumber + ", Class : " + soClass + ", PO# : " + poNumber +
                            ", Packing Slip Name : " + packingSlipName + ", Customer Mail : " + cEmail + ", Customer Phn No : " + cPhnNo + "]"
                    });
                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Sales Order Shipping Details : [ Ship Address 1 : " + shipAddress1 + ", Ship Address 2 : " + shipAddress2 +
                            ", Ship Attention : " + shipAttention + ", Ship Carrier : " + shipCarrier + ", Ship Method : " + shipMethod + ", Residential Address : " + residentialAddress +
                            ", Shipping Phone Number : " + shipPhnNo + ", Ship City : " + shipCity + ", Ship Country : " + shipCountry + ", Ship Zip : " + shipZip + ", Ship State : " + shipState + "]"
                    })
                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Sales Order Billing Details : [ Billing Address1 : " + billAddress1 + ", Billing Address2 : " + billAddress2 + ", Bill Addressee : " + billaddressee + ", Bill City : " + billCity +
                            ", Bill Country : " + billCountry + ", Bill Zip : " + billZip + ", Bill State : " + billState + ", Bill Phn No : " + billPhnNo + ", Billing Attention : " + billAttention + "]"
                    })

                    log.debug({
                        title: "PCT-MonAmi",
                        details: "Item Details : [ Item NAme : " + itemName + ", Item Desc : " + itemDesc + ", Item Qty : " + itemQty + " ]"
                    })
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

                    soObj['billPhnNo'] = billPhnNo;
                    soObj['billCity'] = billCity;
                    soObj['billCountry'] = billCountry;
                    soObj['billZip'] = billZip;
                    soObj['billState'] = billState;
                    soObj['billAddress1'] = billAddress1;
                    soObj['billAddress2'] = billAddress2;
                    soObj['billaddressee'] = billaddressee;
                    soObj['billAttention'] = billAttention;

                    soObj['itemName'] = itemName;
                    soObj['itemDesc'] = itemDesc;
                    soObj['itemQty'] = itemQty;

                    soObjArray.push(soObj);

                    // //-------------------------- Getting Item Details ------------------------------
                    // var soLoad = record.load({
                    //     type: 'salesorder',
                    //     id: internalId
                    // });
                    // var item_count = soLoad.getLineCount({ sublistId: 'item' });
                    // log.debug({ title: "PCT-Mon Ami", details: "Total Item in Sales Order : " + item_count });
                    // for (item_index = 0; item_index < item_count; item_index++)
                    // {
                    //     var itemName = soLoad.getSublistValue({
                    //         sublistId: 'item',
                    //         fieldId: 'item_display',
                    //         line: item_index
                    //     });
                    //     var itemDesc = soLoad.getSublistValue({
                    //         sublistId: 'item',
                    //         fieldId: 'description',
                    //         line: item_index
                    //     });
                    //     var itemQty = soLoad.getSublistValue({
                    //         sublistId: 'item',
                    //         fieldId: 'quantity',
                    //         line: item_index
                    //     });
                    //     log.debug({ title: "PCT-Mon Ami", details: "Item Details [ Item Name/SKU : " + itemName + ", Item Desc : " + itemDesc + ", Item Qty : " + itemQty });

                    //     //---------------------------- Create Item Json Obj --------------------
                    //     var soItemObj = new Object;
                    //     soItemObj['itemName'] = itemName;
                    //     soItemObj['itemDesc'] = itemDesc;
                    //     soItemObj['itemQty'] = itemQty;
                    //     soItemObjArray.push(soItemObj);
                    // }
                    // soObj['Item'] = soItemObjArray;

                    log.debug({
                        title: "PCT-MonAmi",
                        details: "MonAmi SO Record Array : " + JSON.stringify(soObjArray)
                    })
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
