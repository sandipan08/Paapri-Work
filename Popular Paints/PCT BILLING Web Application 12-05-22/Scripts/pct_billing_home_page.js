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
    function (file, render, search, log, redirect, record, format, email, runtime, url) {
        /**
             * Definition of the Suitelet script trigger point.
             * 
             * @param {Object} context 
             * @param {ServerRequest} context.request - Encapsulation of the incoming request
             * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
             */
        function onRequest(context) {

            var request = context.request;
            var response = context.response;
            var soArray = context.request.parameters.soArray;
            var invArray = context.request.parameters.invArray;
            var soCount = context.request.parameters.soCount;
            var invCount = context.request.parameters.invCount;
            var custName = context.request.parameters.custName;


            var pctLogo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15929&c=7255402&h=JQwcI60yognaw9GYp6fd5EeOIT7-Is4SkbaYIMxzBRxM5QOI';
            if (request.method == 'GET') {
                log.debug({ title: "PCT-Billing", details: 'SO Array in Get: ' + soArray + ", Type Of : " + typeof (soArray) } + ", So Count : " + soCount);

                // --------------------start of try catch -----------------------------
                try {
                    var deviceip = context.request.headers['ns-client-ip'];
                    var customrecord_pct_billing_otpSearchObj = search.create({
                        type: "customrecord_pct_billing_otp",
                        filters:
                            [
                                ["custrecord_pct_billing_otp_ip", "is", deviceip]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                }),
                                search.createColumn({ name: "custrecord_pct_billing_otp_cookie", label: "Cookie" }),
                                search.createColumn({ name: "custrecord_pct_billing_otp_employee", label: "Employee" })
                            ]
                    });
                    var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;

                    log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                    var customrecord_pct_billing_otpSearchResult = customrecord_pct_billing_otpSearchObj.run().getRange({ start: 0, end: searchResultCount });

                    decodedCookie = customrecord_pct_billing_otpSearchResult[searchResultCount - 1].getValue({ name: "custrecord_pct_billing_otp_cookie" });
                    var userId = customrecord_pct_billing_otpSearchResult[searchResultCount - 1].getValue({ name: "custrecord_pct_billing_otp_employee" });
                    var employeeSearchObj = search.create({
                        type: "employee",
                        filters:
                            [
                                ["internalidnumber", "equalto", userId]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "entityid",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                })
                            ]
                    });
                    var searchResultCount1 = employeeSearchObj.runPaged().count;
                    var employeeSearchObj = employeeSearchObj.run().getRange({ start: 0, end: searchResultCount1 });
                    var empName = employeeSearchObj[searchResultCount1 - 1].getValue({ name: "entityid" });
                    log.debug({
                        title: 'Employee Name: ',
                        details: empName
                    })
                    log.debug({
                        title: 'decodedCookie',
                        details: decodedCookie
                    })

                    if (decodedCookie == '') {
                        redirectToLoginPage();
                    }

                    var decodedCookieArr = new Array();
                    decodedCookieArr = decodedCookie.split(';');
                    var indexOfArr = getIndexOf(decodedCookieArr)
                    var passVal = decodedCookieArr[indexOfArr].trim();

                    log.debug({
                        title: 'passVal1',
                        details: passVal
                    })
                } catch (ex) {
                    redirectToLoginPage();
                }

                var USERDevice = context.request.headers['user-agent'];
                var deviceip = context.request.headers['ns-client-ip'];

                var cookie = passVal;


                log.debug({
                    title: 'Fetched ID',
                    details: userId
                })


                if (cookie != '') {
                    var validUrl = urlValidation(USERDevice, deviceip, userId, cookie)
                }
                if (validUrl == 0) {
                    redirectToLoginPage();
                }



                function getIndexOf(decodedCookieArr) {
                    var length = decodedCookieArr.length;
                    for (var index = 0; index < length; index++) {
                        var value = decodedCookieArr[index];
                        if (value.includes("PCTCookie")) {
                            log.debug({
                                title: 'PCTCookie',
                                details: value
                            })
                            return index;
                            break;
                        }
                    }

                }

                function urlValidation(USERDevice, deviceip, userId, cookie) {
                    try {
                        log.debug({
                            title: 'validURL CHECK',
                            details: 'userId =' + userId + ' deviceip =' + deviceip + ' USERDevice =' + USERDevice + ' cookie =' + cookie
                        })
                        var customrecord_pct_billing_otpSearchObj = search.create({
                            type: "customrecord_pct_billing_otp",
                            filters:
                                [
                                    ["custrecord_pct_billing_otp_employee", "anyof", userId],
                                    "AND",
                                    ["custrecord_pct_billing_otp_ip", "is", deviceip],
                                    "AND",
                                    ["custrecord_pct_billing_otp_device", "is", USERDevice],
                                    "AND",
                                    ["custrecord_pct_billing_otp_cookie", "is", cookie]
                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "id",
                                        sort: search.Sort.ASC,
                                        label: "ID"
                                    }),
                                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_email", label: "Email" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_pin", label: "PIN" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_time", label: "Time" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_ip", label: "IP" })
                                ]
                        });
                        var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;
                        log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                        customrecord_pct_billing_otpSearchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results
                            return true;
                        });
                        return searchResultCount
                    }
                    catch (ex) {
                        redirectToLoginPage();

                    }

                }

                function redirectToLoginPage() {
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_login_email',
                        deploymentId: 'customdeploy_pct_billing_login_email',
                        isExternal: true,
                    });
                }

                // ----------------------------------- end of try catch -------------------------------
                //customer json file
                var JSON_file_id = file.load({
                    id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON CUSTOMER DATA/customerData.json'
                })

                var JSON_file_content = JSON_file_id.getContents()
                var customerDropdown = ' ';
                var soDropDown = ' ';
                var invListDropdown = ' ';
                var CustomerObj = JSON.parse(JSON_file_content);
                for (var index = 0; index < CustomerObj.length; index++) {
                    var custDoc = CustomerObj[index];
                    var customerName = custDoc.name;
                    customerDropdown +=
                        '<option>' + customerName + '</option>';
                }



                if (soArray != undefined) {
                    soArray = JSON.parse(soArray);
                    for (var soDropDownIndex = 0; soDropDownIndex < soArray.length; soDropDownIndex++) {
                        var soNumber = soArray[soDropDownIndex];
                        soDropDown +=
                            '<option>' + soNumber + '</option>';
                    }
                }
                if (invArray != undefined) {

                    invArray = JSON.parse(invArray);
                    for (var invDropDownIndex = 0; invDropDownIndex < invArray.length; invDropDownIndex++) {
                        var invNumber = invArray[invDropDownIndex];
                        invListDropdown +=
                            '<option>' + invNumber + '</option>';
                    }
                }

                if (custName == -1) {
                    var dataSource = {
                        pctLogo: pctLogo,
                        soCount: soCount,
                        empName: empName,
                        invCount: invCount


                    }
                }
                else {
                    var dataSource = {
                        pctLogo: pctLogo,
                        soCount: soCount,
                        custName: custName,
                        empName: empName,
                        invCount: invCount

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
                renderedPage = renderedPage.replace('#CUSTOMER-CONTENTS#', customerDropdown);
                renderedPage = renderedPage.replace('#SODROPDOWN-CONTENTS#', soDropDown);
                renderedPage = renderedPage.replace('#DROPDOWN-INVOICE#', invListDropdown);
                response.write(renderedPage);

            }
            else {
                // ---------------------------- start of try catch------------------------------------------------
                try {
                    var deviceip = context.request.headers['ns-client-ip'];
                    var customrecord_pct_billing_otpSearchObj = search.create({
                        type: "customrecord_pct_billing_otp",
                        filters:
                            [
                                ["custrecord_pct_billing_otp_ip", "is", deviceip]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                }),
                                search.createColumn({ name: "custrecord_pct_billing_otp_cookie", label: "Cookie" }),
                                search.createColumn({ name: "custrecord_pct_billing_otp_employee", label: "Employee" })
                            ]
                    });
                    var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;

                    log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                    var customrecord_pct_billing_otpSearchResult = customrecord_pct_billing_otpSearchObj.run().getRange({ start: 0, end: searchResultCount });

                    decodedCookie = customrecord_pct_billing_otpSearchResult[searchResultCount - 1].getValue({ name: "custrecord_pct_billing_otp_cookie" });
                    var userId = customrecord_pct_billing_otpSearchResult[searchResultCount - 1].getValue({ name: "custrecord_pct_billing_otp_employee" });
                    var employeeSearchObj = search.create({
                        type: "employee",
                        filters:
                            [
                                ["internalidnumber", "equalto", userId]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "entityid",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                })
                            ]
                    });
                    var searchResultCount1 = employeeSearchObj.runPaged().count;
                    var employeeSearchObj = employeeSearchObj.run().getRange({ start: 0, end: searchResultCount1 });
                    var empName = employeeSearchObj[searchResultCount1 - 1].getValue({ name: "entityid" });
                    log.debug({
                        title: 'Employee Name: ',
                        details: empName
                    })
                    log.debug({
                        title: 'decodedCookie',
                        details: decodedCookie
                    })

                    if (decodedCookie == '') {
                        redirectToLoginPage();
                    }

                    var decodedCookieArr = new Array();
                    decodedCookieArr = decodedCookie.split(';');
                    var indexOfArr = getIndexOf(decodedCookieArr)
                    var passVal = decodedCookieArr[indexOfArr].trim();

                    log.debug({
                        title: 'passVal1',
                        details: passVal
                    })
                } catch (ex) {
                    redirectToLoginPage();
                }

                var USERDevice = context.request.headers['user-agent'];
                var deviceip = context.request.headers['ns-client-ip'];

                var cookie = passVal;


                log.debug({
                    title: 'Fetched ID',
                    details: userId
                })


                if (cookie != '') {
                    var validUrl = urlValidation(USERDevice, deviceip, userId, cookie)
                }
                if (validUrl == 0) {
                    redirectToLoginPage();
                }



                function getIndexOf(decodedCookieArr) {
                    var length = decodedCookieArr.length;
                    for (var index = 0; index < length; index++) {
                        var value = decodedCookieArr[index];
                        if (value.includes("PCTCookie")) {
                            log.debug({
                                title: 'PCTCookie',
                                details: value
                            })
                            return index;
                            break;
                        }
                    }

                }

                function urlValidation(USERDevice, deviceip, userId, cookie) {
                    try {
                        log.debug({
                            title: 'validURL CHECK',
                            details: 'userId =' + userId + ' deviceip =' + deviceip + ' USERDevice =' + USERDevice + ' cookie =' + cookie
                        })
                        var customrecord_pct_billing_otpSearchObj = search.create({
                            type: "customrecord_pct_billing_otp",
                            filters:
                                [
                                    ["custrecord_pct_billing_otp_employee", "anyof", userId],
                                    "AND",
                                    ["custrecord_pct_billing_otp_ip", "is", deviceip],
                                    "AND",
                                    ["custrecord_pct_billing_otp_device", "is", USERDevice],
                                    "AND",
                                    ["custrecord_pct_billing_otp_cookie", "is", cookie]
                                ],
                            columns:
                                [
                                    search.createColumn({
                                        name: "id",
                                        sort: search.Sort.ASC,
                                        label: "ID"
                                    }),
                                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_email", label: "Email" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_pin", label: "PIN" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_time", label: "Time" }),
                                    search.createColumn({ name: "custrecord_pct_billing_otp_ip", label: "IP" })
                                ]
                        });
                        var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;
                        log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                        customrecord_pct_billing_otpSearchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results
                            return true;
                        });
                        return searchResultCount
                    }
                    catch (ex) {
                        redirectToLoginPage();

                    }

                }

                function redirectToLoginPage() {
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_login_email',
                        deploymentId: 'customdeploy_pct_billing_login_email',
                        isExternal: true,
                    });
                }

                // --------------------------------- end of try catch --------------------------------
                var buttonResponse1 = request.parameters.generate_invoice;
                var buttonResponse2 = request.parameters.generateSo;
                var buttonResponse3 = request.parameters.checkSo;
                var buttonResponse4 = request.parameters.printSo;
                var buttonResponse5 = request.parameters.printPT;
                if (buttonResponse2 == 'displaySalesOrder') {
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
                                ["status", "anyof", "SalesOrd:F", "SalesOrd:B", "SalesOrd:E"]

                            ],
                        columns:
                            [
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    var soSearchResultCount = salesorderSearchObj.runPaged().count;
                    log.debug("PCT-Billing", "Sales Order Result Count: " + soSearchResultCount);
                    var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: soSearchResultCount });
                    for (var soIndex = 0; soIndex < soSearchResultCount; soIndex++) {
                        var soId = searchResult[soIndex].getValue({
                            name: "tranid"
                        })
                        soArray.push(soId);
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
                    for (var invIndex = 0; invIndex < invSearchResultCount; invIndex++) {
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
                            'custName': custparam_customerName
                        }
                    });
                }
                else if (buttonResponse3 == 'detailsSalesOrder') {

                    var transactionId = context.request.parameters.soNumber;
                    if (transactionId) {
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
                        for (var i = 0; i < soObj.length; i++) {
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
                                    search.createColumn({name: "quantitybilled", label: "Quantity Billed"}),
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
                                    search.createColumn({ name: "internalid", label: "Internal ID" })

                                ]
                        });
                        var transactionSearchCount = transactionSearchObj.runPaged().count;
                        var transactionSearchResult = transactionSearchObj.run().getRange({ start: 0, end: transactionSearchCount });
                        log.debug({
                            title: 'Count:',
                            details: transactionSearchCount
                        })
                       
                        var content = `<div class="row item-table" id="itemContainer">`;

                        for (var transactionIndex = 0; transactionIndex < parseInt(transactionSearchCount); transactionIndex++) {
                            var rowCount = parseInt(transactionIndex) + 1;
                            transactionRate = transactionSearchResult[transactionIndex].getValue({ name: "rate" });
                            transactionItem = transactionSearchResult[transactionIndex].getValue({ name: "itemid", join: "item" });
                            transactionQuantity = transactionSearchResult[transactionIndex].getValue({ name: "quantity" });
                            transactionInvoiced= transactionSearchResult[transactionIndex].getValue({name:"quantitybilled"});
                            transactionQuantityAvailable = transactionSearchResult[transactionIndex].getValue({ name: "quantityavailable", join: "item" });
                            transactionIntId = transactionSearchResult[transactionIndex].getValue({ name: "internalid", join: "item" });
                            transactionBilled = transactionSearchResult[transactionIndex].getValue({ name: "quantityshiprecv" });
                            transactionItemType = transactionSearchResult[transactionIndex].getValue({ name: "type", join: "item" });
                            salesorderId = transactionSearchResult[transactionIndex].getValue({ name: "internalid" });
                            

                            log.debug({
                                title: 'PCT-billing',
                                details: 'Type:' + transactionItemType
                            });

                            
                            if (transactionItemType == 'TaxItem') {
                                log.debug({
                                    title: 'PCT-billing',
                                    details: `In Condition: ${typeof (transactionItemType)}`
                                });
                            }
                            // else if (transactionItemType == 'Discount') {
                            //     log.debug({
                            //         title: 'PCT-billing',
                            //         details: `In Condition: ${typeof (transactionItemType)}`
                            //     });
                            // }

                            else {

                                transactionQuantity = parseInt(transactionQuantity) - parseInt(transactionBilled) -parseInt(transactionInvoiced);
                                var max=transactionQuantity;
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
                                    `                                    name="shipped_quantity" value="${transactionBilled}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                    `                            </div>` +
                                    `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                    `                                <lable for="price">Price</lable>` +
                                    `                                <input type="number" class="form-control price" name="price" value="${transactionRate}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                    `                            </div>` +

                                    `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                    `                                <lable for="quantity">Quantity</lable>` +
                                    `                                <input type="number" class="form-control quantity" id="quantity" name="quantity" value="${transactionQuantity}" min="0" max="${max}" onblur="checkValue(this);" oninput="validity.valid||(value=\`\`);">` +
                                  
                                    `                            </div>` +
                                    ` </div>` +
                                    `                    </div>`;

                            }


                        }
                        content += `</div>`;
                        content+=`<script>`+
                        `function checkValue(sender) {`+
                        `   let min = sender.min;`+
                        `    let max = sender.max;`+
                        `    let value = int(sender.value);`+
                         `   if (value>max) {`+
                        `        sender.value = min;`+
                        `    } else if (value<min) {`+
                        `        sender.value = max;`+
                        `    }`+
                        `}`;
                        
                        
                        
                            `</script>`;
                       
                        log.debug({
                            title: `PCT-Billing`,
                            details: salesorderId
                        });
                        // }


                    }
                    var htmlFile = file.load({
                        id: 48447
                    }).getContents();
                    htmlFile = htmlFile.replace('#ItemRows#', content)
                    context.response.write(htmlFile);
                    log.debug({
                        title: `PCT-Billing`,
                        details: `End`
                    });
                }
                else if (buttonResponse1 == 'displayInvoice') {
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
                    for (var invIndex = 0; invIndex < searchResultCount; invIndex++) {
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
                else if (buttonResponse4 == 'printSalesOrder') {
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
                    for (var soIndex = 0; soIndex < searchResultCount; soIndex++) {
                        var id = searchResult[soIndex].getValue({
                            name: "internalid"
                        })
                    }
                    log.debug({
                        title: "Sales Order Id:",
                        details: id
                    })
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
                else if (buttonResponse5 == 'printPickingTicket') {
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
                    for (var soIndex = 0; soIndex < searchResultCount; soIndex++) {
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
            }
        }
        

        return {
            onRequest: onRequest
        }
    });
