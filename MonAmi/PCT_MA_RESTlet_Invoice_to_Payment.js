/**
*              //////////     MON AMI Invoice to Payment Method Creation  //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for  MON AMI  MON AMI Invoice to Payment Method Creation , you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{


    function _post(context)
    {
        try
        {
            var sucessCount = 0;
            var errorCount = 0;
            var errorArray = new Array();
            log.debug({
                title: "PCT-MonAmi",
                details: "Context Length : " + context.length + ", Context : [ " + context + " ]"
            });
            for (var invoiceIndex = 0; invoiceIndex < context.length; invoiceIndex++)
            {
                var invoiceNumber = context[invoiceIndex];
                log.debug({
                    title: "PCT-MonAmi",
                    details: "Invoice Document Number : " + invoiceNumber
                });

                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["type", "anyof", "CustInvc"],
                            "AND",
                            ["numbertext", "is", invoiceNumber],
                            "AND",
                            ["mainline", "is", "T"]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({ name: "class", label: "Class" })
                        ]
                });
                var invoiceCount = invoiceSearchObj.runPaged().count;
                log.debug("PCT-MonAmi", "Invoice Result Count : " + invoiceCount);
                if (invoiceCount > 0)
                {
                    var invoiceResult = invoiceSearchObj.run().getRange({ start: 0, end: invoiceCount });
                    for (var getid_index = 0; getid_index < invoiceCount; getid_index++)
                    {
                        var invoiceId = invoiceResult[getid_index].id;
                        var soClass = invoiceResult[getid_index].getText({ name: "class" });

                        log.debug("PCT-MonAmi", "Invoice Id : " + invoiceId + ", Class : " + soClass);


                        var status = search.lookupFields({
                            type: "invoice",
                            id: invoiceId,
                            columns: "status"
                        }).status[0].value
                        log.debug({
                            title: "PCT-MonAmi",
                            details: "Invoice Status : " + status
                        })

                        // ------------------- For Class Maisonette Payment Method will be "External (Maisonette)" & SEND TO WAREHOUSE UnCheck -------------------
                        if (soClass == "Maisonette" && status != "paidInFull")
                        {
                            var paymentObj = record.transform({
                                fromType: "invoice",
                                fromId: invoiceId,
                                toType: "customerpayment",
                                isDynamic: true,
                            });
                            paymentObj.setText({ fieldId: "paymentmethod", text: "External (Maisonette)" })

                            var paymentId = paymentObj.save();
                            log.debug("PCT-MonAmi", "Payment Id : " + paymentId);
                            if (paymentId)
                            {
                                sucessCount++;
                                var invoiceLoad = record.load({
                                    type: 'invoice',
                                    id: invoiceId
                                });
                                invoiceLoad.setValue({
                                    fieldId: "custbody_pct_ma_send_to_warehouse",
                                    value: false,

                                })
                                invoiceLoad.setText({
                                    fieldId: "custbody_pct_ma_fulfillment_status",
                                    text: "Fulfillment Requested",

                                })
                                invoiceLoad.save();
                            }
                        }
                        // ------------------- For Class Shopify B2C Payment Method will be "External (Shopify Retail)" & SEND TO WAREHOUSE UnCheck -------------------
                        else if (soClass == "Shopify B2C" && status != "paidInFull")
                        {
                            var paymentObj = record.transform({
                                fromType: "invoice",
                                fromId: invoiceId,
                                toType: "customerpayment",
                                isDynamic: true,
                            });
                            paymentObj.setText({ fieldId: "paymentmethod", text: "External (Shopify Retail)" })

                            var paymentId = paymentObj.save();
                            log.debug("PCT-MonAmi", "Payment Id : " + paymentId);
                            if (paymentId)
                            {
                                sucessCount++;
                                var invoiceLoad = record.load({
                                    type: 'invoice',
                                    id: invoiceId
                                });
                                invoiceLoad.setValue({
                                    fieldId: "custbody_pct_ma_send_to_warehouse",
                                    value: false,

                                })
                                invoiceLoad.setText({
                                    fieldId: "custbody_pct_ma_fulfillment_status",
                                    text: "Fulfillment Requested",

                                })
                                invoiceLoad.save();
                            }
                        }
                        else
                        {
                            var invoiceLoad = record.load({
                                type: 'invoice',
                                id: invoiceId
                            });

                            invoiceLoad.setValue({
                                fieldId: "custbody_pct_ma_send_to_warehouse",
                                value: false,

                            })
                            invoiceLoad.setText({
                                fieldId: "custbody_pct_ma_fulfillment_status",
                                text: "Fulfillment Requested",

                            })
                            invoiceLoad.save();
                            sucessCount++;
                        }


                    }
                }
                else
                {
                    errorCount++;
                    errorArray.push(invoiceNumber);
                }
            }

        }

        catch (ex)
        {
            log.error({ title: 'PCT-MonAmi', details: 'Restlet: Error : ' + ex });
            errorCount++;
            errorArray.push(invoiceNumber);
        }
        // return JSON.stringify({ status: 500, message: err.message });
        return JSON.stringify({ NoOfInsertedRecords: sucessCount, NoOfErrorRecords: errorCount, ErrorObjects: errorArray });

    }



    return {
        post: _post,
    }
});