/**
 *              //////////     PMC BILLING 2.1    //////////
 * 
 *@author       Arghadeep Sarkar and Suman Das
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-09-01 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT QMS, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url)
    {
        /**
             * Definition of the Suitelet script trigger point.
             * 
             * @param {Object} context 
             * @param {ServerRequest} context.request - Encapsulation of the incoming request
             * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
             */
        function onRequest(context)
        {

            var request = context.request;
            var response = context.response;
            log.debug("PCT-PP", "Context Response : " + JSON.stringify(context.request.parameters))
            var empName = context.request.parameters.custparam_userName;
            var empId = context.request.parameters.custparam_userId;
            var soArray = context.request.parameters.soArray;
            var invArray = context.request.parameters.invArray;
            var soCount = context.request.parameters.soCount;
            var invCount = context.request.parameters.invCount;
            var custparam_customerName = context.request.parameters.custName;

            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["entityid", "is", empName]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "location", label: "Depot" })
                    ]
            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            var searchResult = employeeSearchObj.run().getRange({ start: 0, end: searchResultCount });
            log.debug("employeeSearchObj result count", searchResultCount);
            for (var empIndex = 0; empIndex < searchResultCount; empIndex++)
            {
                var deportLocation = searchResult[empIndex].getValue({ name: "location", label: "Depot" });
            }


            log.debug("PCT-PP", "User Name  : " + empName + " User Id : " + empId + " Employee Deport : " + deportLocation + ", Customer Name : " + custparam_customerName)

            var pctLogo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15929&c=7255402&h=JQwcI60yognaw9GYp6fd5EeOIT7-Is4SkbaYIMxzBRxM5QOI';
            if (request.method == 'GET')
            {

                log.debug({ title: "PCT-Billing", details: 'SO Array in Get: ' + soArray + ", Type Of : " + typeof (soArray) } + ", So Count : " + soCount);
                var faviconUrl = GetFaviconImgUrl();

                // --------------------start of try catch -----------------------------




                // ----------------------------------- end of try catch -------------------------------
                var customerDropdown = '';
                var soDropDown = ' ';
                var invListDropdown = ' ';


                var customerArr = searchCustomer(deportLocation)
                if (custparam_customerName)
                {

                    customerDropdown = `<input list="customerNames" id="customerName" class="form-control" value ='${custparam_customerName}' name="customerName" autocomplete = "off" onchange = "blankSoCheck(this)" /> `;
                }
                else
                {
                    customerDropdown = `<input list="customerNames" id="customerName" class="form-control" name="customerName" autocomplete = "off" onchange = "blankSoCheck(this)" /> `;
                }
                customerDropdown += '<datalist id="customerNames">';
                customerArr.map((element) =>
                {
                    // log.debug("PCT-Billing", "Employee  Map Element : " + JSON.stringify(element));

                    customerDropdown +=
                        // '<option>' + element.name + '</option>';

                        `<option  value="${element.name}" data-value=${element.internal_id}/>`;
                })
                customerDropdown += '</datalist>';



                if (soArray != undefined)
                {
                    soArray = JSON.parse(soArray);
                    for (var soDropDownIndex = 0; soDropDownIndex < soArray.length; soDropDownIndex++)
                    {
                        var soNumber = soArray[soDropDownIndex];
                        soDropDown +=
                            '<option>' + soNumber + '</option>';
                    }
                }
                if (invArray != undefined)
                {

                    invArray = JSON.parse(invArray);
                    for (var invDropDownIndex = 0; invDropDownIndex < invArray.length; invDropDownIndex++)
                    {
                        var invNumber = invArray[invDropDownIndex];
                        invListDropdown +=
                            '<option>' + invNumber + '</option>';
                    }
                }

                if (custName == -1)
                {
                    var dataSource = {
                        pctLogo: pctLogo,
                        soCount: soCount,
                        empName: empName,
                        custName: custName,
                        invCount: invCount,
                        faviconUrl: faviconUrl


                    }
                }
                else
                {
                    var dataSource = {
                        pctLogo: pctLogo,
                        soCount: soCount,
                        custName: custName,
                        empName: empName,
                        invCount: invCount,
                        faviconUrl: faviconUrl

                    }
                }
                // Load Login HTML Template
                var templateFile = file.load({ id: '../../PCT BILLING Web Application/HTML Files/Billing.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });

                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                renderedPage = renderedPage.replace('#dataList#', customerDropdown);
                renderedPage = renderedPage.replace('#SODROPDOWN-CONTENTS#', soDropDown);
                renderedPage = renderedPage.replace('#DROPDOWN-INVOICE#', invListDropdown);
                response.write(renderedPage);

            }
            else
            {
                var faviconUrl = GetFaviconImgUrl();
                var empName = request.parameters.custparam_userName;
                log.debug("PCT-PP", "Employee Name : " + empName + " Employee Id : " + empId)
                // ---------------------------- start of try catch------------------------------------------------

                // --------------------------------- end of try catch --------------------------------
                var buttonResponse1 = request.parameters.generate_invoice;
                var loadInvoice = request.parameters.loadInvoice;
                var buttonResponse2 = request.parameters.generateSo;
                var buttonResponse3 = request.parameters.checkSo;
                var buttonResponse4 = request.parameters.printSo;
                var buttonResponse5 = request.parameters.printPT;
                var printingSalesOrder = request.parameters.printingSalesOrder;
                if (buttonResponse2 == 'displaySalesOrder')
                {
                    log.debug({ title: "PCT-Billing", details: 'In Post Method' });
                    // Getting params
                    var custparam_customerName = request.parameters.customerName;
                    log.debug({ title: "PCT-Billing", details: "Customer NAme : " + custparam_customerName });

                    var soArray = new Array();
                    var invArray = new Array();

                    //----------------------- Search for getting SO Number --------------------
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["customermain.entityid", "is", custparam_customerName],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["status", "anyof", "SalesOrd:F", "SalesOrd:B", "SalesOrd:E", "SalesOrd:D"]

                            ],
                        columns:
                            [
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "custbody_pct_pp_so_print_check", label: "Printed" })
                            ]
                    });
                    var soSearchResultCount = salesorderSearchObj.runPaged().count;
                    log.debug("PCT-Billing", "Sales Order Result Count: " + soSearchResultCount);
                    var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: soSearchResultCount });
                    for (var soIndex = 0; soIndex < soSearchResultCount; soIndex++)
                    {
                        var soId = searchResult[soIndex].getValue({
                            name: "tranid"
                        })

                        soArray.push(soId);
                        log.debug({ title: "PCT-Billing", details: 'SO Id : ' + soId + ", So Printed : " + soPrinted });
                        // soArray.push(soId + ", " + soPrinted);
                    }
                    log.debug({ title: "PCT-Billing", details: 'SO Array in Post : ' + soArray });

                    // ----------------invoice search--------------------------------------------

                    var invoiceSearchObj = search.create({
                        type: "invoice",
                        filters:
                            [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["customermain.entityid", "is", custparam_customerName]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "tranid", label: "Document Number" })
                            ]
                    });
                    var invSearchResultCount = invoiceSearchObj.runPaged().count;
                    log.debug("PCT-Billing", "Invoice Result Count: " + invSearchResultCount);
                    var searchResult = invoiceSearchObj.run().getRange({ start: 0, end: invSearchResultCount });
                    for (var invIndex = 0; invIndex < invSearchResultCount; invIndex++)
                    {
                        var invId = searchResult[invIndex].getValue({
                            name: "tranid"
                        })
                        invArray.push(invId);
                    }
                    log.debug({ title: "PCT-Billing", details: 'Invoice Array in Post : ' + invArray });

                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_main_page',
                        deploymentId: 'customdeploy_pct_billing_main_page',
                        isExternal: true,
                        parameters: {
                            'soArray': JSON.stringify(soArray),
                            'invArray': JSON.stringify(invArray),
                            'soCount': soSearchResultCount,
                            'invCount': invSearchResultCount,
                            'custName': custparam_customerName,
                            'custparam_userName': empName,
                            'custparam_userId': empId

                        }
                    });
                }
                else if (buttonResponse3 == 'detailsSalesOrder')
                {

                    var transactionId = context.request.parameters.soNumber;
                    if (transactionId)
                    {
                        var so_file_id = file.load({
                            id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON SO DATA/soData.json'
                        })
                        var so_file_content = so_file_id.getContents()
                        log.debug({
                            title: 'so_file_content',
                            details: so_file_content
                        })
                        var soObj = JSON.parse(so_file_content);
                        var soName = new Array();
                        var custName = new Array();
                        for (var i = 0; i < soObj.length; i++)
                        {
                            var soDoc = soObj[i];
                            soName[i] = soDoc.document_number;
                            custName[i] = soDoc.entity;
                        }
                        transactionId = transactionId.split(" ")[0];
                        log.debug({
                            title: `PCT-Billing`,
                            details: `Transaction ID: ${transactionId}`
                        });
                        var transactionSearchObj = search.create({
                            type: "salesorder",
                            filters:
                                [
                                    ["type", "anyof", "SalesOrd"],
                                    "AND",
                                    ["numbertext", "is", transactionId],
                                    "AND",
                                    ["mainline", "is", "F"],
                                    "AND",
                                    ["item.internalidnumber", "greaterthan", "0"],

                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "itemid",
                                        join: "item",
                                        label: "Name"
                                    }),
                                    search.createColumn({ name: "rate", label: "Item Rate" }),
                                    search.createColumn({ name: "quantity", label: "Quantity" }),
                                    search.createColumn({
                                        name: "quantityavailable",
                                        join: "item",
                                        label: "Available"
                                    }),
                                    search.createColumn({ name: "quantitybilled", label: "Quantity Billed" }),
                                    search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Received" }),
                                    search.createColumn({
                                        name: "internalid",
                                        join: "item",
                                        label: "Internal ID"
                                    }),
                                    search.createColumn({
                                        name: "type",
                                        join: "item",
                                        label: "Type"
                                    }),
                                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                                    search.createColumn({ name: "custbody_pct_pp_so_print_check", label: "Printed" })


                                ]
                        });
                        var transactionSearchCount = transactionSearchObj.runPaged().count;
                        var transactionSearchResult = transactionSearchObj.run().getRange({ start: 0, end: transactionSearchCount });
                        log.debug({
                            title: 'Count:',
                            details: transactionSearchCount
                        })

                        var content = `<div class="row item-table" id="itemContainer">`;

                        for (var transactionIndex = 0; transactionIndex < parseInt(transactionSearchCount); transactionIndex++)
                        {
                            var rowCount = parseInt(transactionIndex) + 1;
                            transactionRate = transactionSearchResult[transactionIndex].getValue({ name: "rate" });
                            transactionItem = transactionSearchResult[transactionIndex].getValue({ name: "itemid", join: "item" });
                            transactionQuantity = transactionSearchResult[transactionIndex].getValue({ name: "quantity" });
                            transactionInvoiced = transactionSearchResult[transactionIndex].getValue({ name: "quantitybilled" });
                            transactionQuantityAvailable = transactionSearchResult[transactionIndex].getValue({ name: "quantityavailable", join: "item" });
                            transactionIntId = transactionSearchResult[transactionIndex].getValue({ name: "internalid", join: "item" });
                            transactionFulfilled = transactionSearchResult[transactionIndex].getValue({ name: "quantityshiprecv" });
                            transactionItemType = transactionSearchResult[transactionIndex].getValue({ name: "type", join: "item" });
                            salesorderId = transactionSearchResult[transactionIndex].getValue({ name: "internalid" });
                            var soPrinted = transactionSearchResult[transactionIndex].getValue({ name: "custbody_pct_pp_so_print_check" });


                            transactionQuantityAvailable = returnAvailableQty(deportLocation, transactionIntId)



                            log.debug({
                                title: 'PCT-billing',
                                details: 'Type:' + transactionItemType
                            });


                            if (transactionItemType == 'TaxItem')
                            {
                                log.debug({
                                    title: 'PCT-billing',
                                    details: `In Condition: ${typeof (transactionItemType)}`
                                });
                            }
                            else if (transactionItemType == 'Discount')
                            {
                                log.debug({
                                    title: 'PCT-billing',
                                    details: `In Condition: ${typeof (transactionItemType)}`
                                });
                            }

                            else
                            {

                                log.debug({
                                    title: 'PCT-billing',
                                    details: "Transaction Quantity : " + transactionQuantity + ", Fulfilled Quantity : " + transactionFulfilled
                                });
                                var itemToBilled = parseInt(transactionQuantity) - parseInt(transactionInvoiced);
                                var itemToFulfilled = parseInt(transactionQuantity) - parseInt(transactionFulfilled);


                                content +=

                                    `                    <div class="col-xs-12">` +
                                    `                        <div class="row itemDetails">` +
                                    `                            <div class="col-xs-12 col-sm-3 top-buffer ">` +
                                    `                                <lable for="item-name">Item</lable>` +
                                    `                                <input type="text" class="form-control item-name" id="item-name" value="${transactionItem}" name="item_name" disabled>` +
                                    `                                <input type="hidden" class="form-control item-id" id="item_id" value="${transactionIntId}" name="item_id" disabled>` +
                                    `                                <input type="hidden" class="form-control soId" id="salesorder_id" value="${salesorderId}" disabled>` +
                                    `                            </div>` +
                                    `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                    `                                <lable for="available-quantity">Available</lable>` +
                                    `                                <input type="number" class="form-control available-quantity"` +
                                    `                                    name="available_quantity" value="${transactionQuantityAvailable}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                    `                            </div>` +
                                    `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                    `                                <lable for="shipped-quantity">Shipped</lable>` +
                                    `                                <input type="number" class="form-control shipped-quantity"` +
                                    `                                    name="shipped_quantity" value="${transactionFulfilled}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                    `                            </div>` +
                                    `                            <div class="col-xs-12 col-sm-2 top-buffer  ">` +
                                    `                                <lable for="price">Price</lable>` +
                                    `                                <input type="number" class="form-control price" name="price" value="${transactionRate}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                    `                            </div>` +

                                    `                            <div class="col-xs-12 col-sm-1 top-buffer">` +
                                    `                                <lable for="quantity">Invoice Quantity</lable>` +
                                    `                                <input type="number" class="form-control invoiceQuantity" id="invoiceQuantity" name="invoiceQuantity" value="${itemToBilled}" min="0" max="${itemToBilled}" oninput="validity.valid||(value=\`\`);" >` +
                                    `                            </div>` +
                                    `                            <div class="col-xs-12 col-sm-1 top-buffer">` +
                                    `                                <lable for="quantity">Fulfillment Quantity</lable>` +
                                    `                                <input type="number" class="form-control fulfillmentQuantity" id="fulfillmentQuantity" name="fulfillmentQuantity" value="${itemToFulfilled}" min="0" max="${itemToFulfilled}" oninput="validity.valid||(value=\`\`);" >` +
                                    `                            </div>` +

                                    ` </div>` +
                                    `                    </div>`;



                            }


                        }
                        content += `</div>`;

                        log.debug({
                            title: `PCT-Billing`,
                            details: salesorderId
                        });
                        // }


                    }
                    var htmlFile = file.load({
                        id: 48447
                    }).getContents();

                    var dataSource = {
                        pctLogo: pctLogo,
                        soDocNo: transactionId,
                        empName: empName,
                        faviconUrl: faviconUrl,
                        salesorderId: salesorderId,
                        soPrinted: soPrinted
                    }
                    var pageRenderer = render.create();
                    pageRenderer.templateContent = htmlFile;
                    pageRenderer.addCustomDataSource({
                        format: render.DataSource.OBJECT,
                        alias: 'ds',
                        data: dataSource
                    });
                    var renderedPage = pageRenderer.renderAsString();
                    renderedPage = renderedPage.replace('#ItemRows#', content);
                    response.write(renderedPage);
                    //context.response.write(htmlFile);
                    log.debug({
                        title: `PCT-Billing`,
                        details: `End`
                    });
                }
                else if (buttonResponse1 == 'displayInvoice')
                {
                    log.debug({
                        title: "Button Name:",
                        details: buttonResponse1
                    })
                    var request = context.request;
                    var response = context.response;
                    var id = request.parameters.inv_id;
                    log.debug({
                        title: "Inv No:",
                        details: id
                    })
                    var invoiceSearchObj = search.create({
                        type: "invoice",
                        filters:
                            [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["numbertext", "is", id]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    var searchResultCount = invoiceSearchObj.runPaged().count;
                    var searchResult = invoiceSearchObj.run().getRange({ start: 0, end: searchResultCount });
                    for (var invIndex = 0; invIndex < searchResultCount; invIndex++)
                    {
                        var id = searchResult[invIndex].getValue({
                            name: "internalid"
                        })
                    }
                    var idInt = parseInt(id);

                    var transactionFile = render.transaction({
                        entityId: idInt,
                        printMode: render.PrintMode.PDF,
                        inCustLocale: true
                    });
                    log.debug({
                        title: "Invoice record:",
                        details: transactionFile
                    })

                    context.response.writeFile(transactionFile);
                }
                else if (buttonResponse4 == 'printSalesOrder')
                {
                    log.debug({
                        title: "Button Name:",
                        details: buttonResponse4
                    })
                    var request = context.request;
                    var response = context.response;
                    var soDocNo = request.parameters.soNumber;
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["numbertext", "is", soDocNo],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                            ]
                    });
                    var searchResultCount = salesorderSearchObj.runPaged().count;
                    var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: searchResultCount });
                    for (var soIndex = 0; soIndex < searchResultCount; soIndex++)
                    {
                        var id = searchResult[soIndex].getValue({
                            name: "internalid"
                        })
                    }
                    log.debug({
                        title: "Sales Order Id:",
                        details: id
                    })
                    var soLoad = record.load({
                        type: 'salesorder',
                        id: id
                    });
                    soLoad.setValue({ fieldId: 'custbody_pct_pp_so_print_check', value: true });
                    soLoad.save();

                    var idInt = parseInt(id);

                    var transactionFile = render.transaction({
                        entityId: idInt,
                        printMode: render.PrintMode.PDF,
                        inCustLocale: true
                    });
                    log.debug({
                        title: "Sales Order record:",
                        details: transactionFile
                    })

                    context.response.writeFile(transactionFile);
                }
                else if (buttonResponse5 == 'printPickingTicket')
                {
                    log.debug({
                        title: "Button Name:",
                        details: buttonResponse5
                    })
                    var request = context.request;
                    var response = context.response;
                    var soDocNo = request.parameters.soNumber;
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["numbertext", "is", soDocNo],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                            ]
                    });
                    var searchResultCount = salesorderSearchObj.runPaged().count;
                    var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: searchResultCount });
                    for (var soIndex = 0; soIndex < searchResultCount; soIndex++)
                    {
                        var id = searchResult[soIndex].getValue({
                            name: "internalid"
                        })
                    }
                    log.debug({
                        title: "Sales Order Id:",
                        details: id
                    })
                    var idInt = parseInt(id);

                    var transactionFile = render.pickingTicket({
                        entityId: idInt,
                        printMode: render.PrintMode.PDF,
                        inCustLocale: true
                    });
                    log.debug({
                        title: "Picking Ticket record:",
                        details: transactionFile
                    })

                    context.response.writeFile(transactionFile);
                }
                else if (loadInvoice = 'loadInvoice')
                {
                    var request = context.request;
                    var response = context.response;
                    var invNumber = request.parameters.inv_id;
                    var transactionId = context.request.parameters.soNumber;
                    log.debug("PCT-Billing", "Redirect to Load Invoice Page : " + transactionId);
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_invoice_load',
                        deploymentId: 'customdeploy_pct_billing_invoice_load',
                        isExternal: true,
                        parameters: {
                            'empName': empName,
                            'invNumber': invNumber

                        }
                    });
                }
                else if (printingSalesOrder == 'printingSalesOrder')
                {
                    log.debug({
                        title: "PCT-Billing",
                        details: "Click Print Sales Order Button"
                    })
                }
                else if (printingSalesOrder == 'transportReceipt')
                {
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_trans_details',
                        deploymentId: 'customdeploy_pct_billing_trans_details',
                        isExternal: true,
                        parameters: {
                            'empName': empName,

                        }
                    });
                }
            }
        }
        function GetFaviconImgUrl()
        {
            var fileObj = file.load({
                id: 'SuiteScripts/PCT BILLING Web Application/Images/PCT logo.png'
            });
            return fileObj.url;
        }
        // ---------------------------- Search for Getting Available On Hand Qty -------------------------------------

        function returnAvailableQty(deportLocation, transactionIntId)
        {
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalidnumber", "equalto", transactionIntId],
                        "AND",
                        ["inventorylocation", "anyof", deportLocation]
                    ],
                columns:
                    [
                        search.createColumn({ name: "locationquantityavailable", label: "Depot Available" }),
                        search.createColumn({ name: "locationquantityonhand", label: "Depot On Hand" }),
                        search.createColumn({ name: "inventorylocation", label: "Inventory Depot" })
                    ]
            });
            var searchResultCount = itemSearchObj.runPaged().count;
            log.debug("itemSearchObj result count", searchResultCount);
            var searchResult = itemSearchObj.run().getRange({ start: 0, end: searchResultCount });
            for (var itemIndex = 0; itemIndex < searchResultCount; itemIndex++)
            {
                var availableQty = searchResult[itemIndex].getValue({
                    name: "locationquantityavailable"
                })
            }
            return availableQty;
        }
        // ---------------------------- Search for Getting Customer -------------------------------------
        function searchCustomer(deportLocation)
        {
            var customerArr = new Array();
            var customerSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["mainline", "is", "T"],
                        "AND",
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["status", "anyof", "SalesOrd:F", "SalesOrd:B", "SalesOrd:E", "SalesOrd:D", "SalesOrd:G"],
                        "AND",
                        ["location", "anyof", deportLocation],
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entity",
                            summary: "GROUP",
                            label: "Name"
                        })
                    ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            log.debug("customerSearchObj result count", searchResultCount);

            var start = 0;
            var end = 1000;
            do
            {
                var result = customerSearchObj.run().getRange({ start: start, end: end });
                for (var i = 0; i < result.length; i++)
                {
                    var customerObj = new Object();

                    customerObj["internal_id"] = result[i].getValue({
                        name: "entity",
                        summary: "GROUP",
                        label: "Name"
                    })


                    customerObj["name"] = result[i].getText({
                        name: "entity",
                        summary: "GROUP",
                        label: "Name"
                    });
                    customerArr.push(customerObj);
                }
                end += 1000;
                start += 1000;
                searchResultCount -= 1000;
            } while (searchResultCount > 0)
            log.debug("PCT-Billing", "Customer Array : " + JSON.stringify(customerArr));
            return customerArr;
        }

        return {
            onRequest: onRequest
        }
    });
