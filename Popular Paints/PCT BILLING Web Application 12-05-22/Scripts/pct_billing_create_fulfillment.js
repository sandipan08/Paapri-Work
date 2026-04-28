/**
 *              //////////     PCT BILLING | ITEM Fulfillment GENERATION SUITELET     //////////
 *
 *@Author       Arghadeep Sarkar & Suman Das
*@NApiVersion  2.1
*@NScriptType  Suitelet
*@NModuleScope SameAccount
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for PCT BILLING, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
*@description  This Suitelet is used to generate invoice from respective sales order and show the ID.
*/
define(['N/search', 'N/record', 'N/log', 'N/url', 'N/redirect'], function (search, record, log, url, redirect)
{
    function onRequest(context)
    {
        var pct_logo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15929&c=7255402&h=JQwcI60yognaw9GYp6fd5EeOIT7-Is4SkbaYIMxzBRxM5QOI';
        var request = context.request;
        var data = JSON.parse(request.parameters.datalist);
        var id = request.parameters.recordname;
        var custparam_userName = request.parameters.custparam_userName;

        log.debug({
            title: "PCT-PP",
            details: "Sales Order Id : " + id + ", User Name :  " + custparam_userName
        })
        log.debug({
            title: 'Data',
            details: data
        })

        // function redirectToLoginPage()
        // {
        //     redirect.toSuitelet({
        //         scriptId: 'customscript_pct_billing_login_email',
        //         deploymentId: 'customdeploy_pct_billing_login_email',
        //         isExternal: true,
        //     });
        // }



        var salesObjRecord = record.load({
            type: record.Type.SALES_ORDER,
            id: id,
            isDynamic: true,
        });

        var docNo = salesObjRecord.getValue({ fieldId: "tranid" });
        log.debug({
            title: "Doc-number",
            details: docNo
        })

        var invoiceSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["numbertext", "is", docNo],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["applyingtransaction.type", "anyof", "CustInvc"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "tranid",
                        join: "applyingTransaction",
                        label: "Document Number"
                    }),
                    search.createColumn({ name: "applyingtransaction", label: "Applying Transaction" }),
                    search.createColumn({
                        name: "internalid",
                        join: "applyingTransaction",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = invoiceSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", searchResultCount);
        var invoiceSearchResult = invoiceSearchObj.run().getRange({ start: 0, end: searchResultCount });



        var objRecord = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: id,
            toType: record.Type.ITEM_FULFILLMENT
        });
        log.debug({
            title: 'AS-log',
            details: id
        });
        var itemLineCount = objRecord.getLineCount({
            sublistId: 'item'
        })
        for (var itemIndex = 0; itemIndex < itemLineCount; itemIndex++)
        {
            var itemId = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: itemIndex
            })
            log.debug({
                title: 'PCT Billing',
                details: "Item Id : " + itemId + ", Qty : " + data[itemId]
            });
            if (data[itemId])
            {
                objRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: itemIndex,
                    value: parseFloat(data[itemId])
                })
            }
            else
            {
                objRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemreceive',
                    line: itemIndex,
                    value: false
                });
            }


        }
        objRecord.setText({ fieldId: 'custbody_pct_pp_if_fulfilled_by', text: custparam_userName });
        var recId = objRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        })
        log.debug({
            title: 'AS-log',
            details: recId
        });
        var invoiceObjRecord = record.load({
            type: record.Type.ITEM_FULFILLMENT,
            id: recId,
            isDynamic: true,
        });
        var invoiceId = invoiceObjRecord.getValue({
            fieldId: 'tranid'
        })
        invoiceInternalId = recId;
        //}
        var content = `<!DOCTYPE html>` +
            `<html lang="en">` +
            `<head>` +
            `    <title>PCT Billing</title>` +
            `    <meta charset="utf-8">` +
            `    <meta name="viewport" content="width=device-width, initial-scale=1">` +
            `    <link rel="icon" href="${pct_logo}">` +
            `    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">` +
            `    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>` +
            `    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>` +
            `    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>` +
            `</head>` +
            `<style>` +
            `    img.logo-navbar {` +
            `        width: 2.5rem !important;` +
            `        height: 2.5rem !important;` +
            `    }` +
            `    .item-table {` +
            `        background-color: #f5f4f5;` +
            `        margin: 10px 0px 0px 1px;` +
            `        padding: 5px;` +
            `        border-radius: 5px;` +
            `        text-align: center;` +
            `        vertical-align: middle;` +
            `    }` +
            `    .top-buffer {` +
            `        margin-top: 10px;` +
            `    }` +
            `.body {` +
            ` background: #1FA2FF;  ` +
            `background: -webkit-linear-gradient(to right, #A6FFCB, #12D8FA, #1FA2FF); ` +
            `background: linear-gradient(to right, #A6FFCB, #12D8FA, #1FA2FF);}` +
            `</style>` +
            `<body class="body">` +
            `    <nav class="navbar navbar-default">` +
            `        <div class="container-fluid">` +
            `            <div class="navbar-header">` +
            `                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">` +
            `                    <span class="icon-bar"></span>` +
            `                    <span class="icon-bar"></span>` +
            `                    <span class="icon-bar"></span>` +
            `                </button>` +
            `                <a class="navbar-brand" href="#"><img src="${pct_logo}"` +
            `                        class="logo-navbar" width="auto" height="auto"></a>` +
            `            </div>` +
            `            <div class="collapse navbar-collapse" id="myNavbar">` +
            `                <ul class="nav navbar-nav navbar-right">` +
            `                    <li><a><span class="glyphicon glyphicon-user"></span> Welcome, ${custparam_userName}</a></li>` +
            `                    <li><a href=\'scriptlet.nl?script=196&deploy=1&compid=7255402&h=38a57cec7478fc49f8d3\'><span class="glyphicon glyphicon-off"></span> Logout</a></li>` +
            `                </ul>` +
            `            </div>` +
            `        </div>` +
            `    </nav>`;
        content +=
            `<div class="text-center">` +
            //            ` <div class="col-1">` + `<label for="pwd" id="date">${datetime}</label>` + `</div>` +
            `<label >Fulfillment Generated</label>` +
            `</div>` +
            `        <div class="text-center">` +
            `             <button type="submit" class="btn btn-success status">Check Status</button>` +
            `             <button type="submit" class="btn btn-info back">Go Back</button>` +
            `             <button type="submit" class="btn btn-danger print">Download</button>` +
            `</div>` + `</body>`;
        content += `<script>` +
            `    $(".status").click(function(){` +

            `                swal({` +
            `                        title: \`Success!\`,` +
            `                        text: \`Fulfillment Id: ${invoiceId}\`,` +
            `                        icon: \`success\`,` +
            `                    });` +
            `    });` +
            // `    $(".back").click(function(){` +


            // `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=466&custparam_userName=${custparam_userName}&deploy=1&compid=7255402&h=741700278bc9a50d40eb'` +

            // `);` +
            // `    });` +
            `    $(".back").click(function(){` +
            `   window.location.replace(document.referrer) ` + //
            ` }); ` +
            `    $(".print").click(function(){` +
            `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=204&recordname=${invoiceInternalId}&deploy=1&compid=7255402&h=2d71d4925fcc37fa7ce5'` +

            `);` +
            `    });` +
            `</script>` +
            `</html>`;

        context.response.write(content);
    }

    return {
        onRequest: onRequest
    }

});