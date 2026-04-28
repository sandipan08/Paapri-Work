/**
 *              //////////     PCT BILLING | Invoice Load SUITELET     //////////
 *
 *@Author       Arghadeep Sarkar & Suman Das
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT BILLING, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This Suitelet is used to render invoice load page.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email'],
    function (file, render, search, log, redirect, record, format, email)
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
            // Pre data source
            var request = context.request;
            var response = context.response;
            if (request.method == 'GET')
            {

                var empName = request.parameters.empName;
                var invNumber = request.parameters.invNumber;
                log.debug({ title: 'PCT-Billing', details: "Employee Name : " + empName + ", Invoice Number : " + invNumber });

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                var popularImgUrl = GetPopularImgUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    popularImgUrl: popularImgUrl,
                    empName: empName,
                    invNumber: invNumber,
                    isHidden: 'hidden'
                };
                // Load Login HTML Template
                var templateFile = file.load({ id: 'SuiteScripts/PCT BILLING Web Application/HTML Files/pct_billing_invoice_load.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });
                // -------------------------- Vendor Drop Down ---------------

                var vendorDropdown = '';
                var vendorSearchObj = search.create({
                    type: "vendor",
                    filters:
                        [
                            ["category", "anyof", "5"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var vendorCount = vendorSearchObj.runPaged().count;
                log.debug("PCT-Billing", "Invoice Result Count: " + vendorCount);
                var vendorResult = vendorSearchObj.run().getRange({ start: 0, end: vendorCount });
                for (var invIndex = 0; invIndex < vendorCount; invIndex++)
                {
                    var vendorId = vendorResult[invIndex].getValue({ name: "internalid" })
                    var vendorName = vendorResult[invIndex].getValue({ name: "entityid" })
                    vendorDropdown +=
                        '<option value="' + vendorId + '">' + vendorName + '</option > ';
                }


                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                renderedPage = renderedPage.replace('#VENDOR-DROPDOWN', vendorDropdown);
                response.write(renderedPage);

            }
            else
            {
                // In Post 

                log.debug({ title: "PCT-Billing", details: 'In Post Method' });

                var empName = request.parameters.empName;
                var invNumber = request.parameters.invNumber;
                var transporterName = request.parameters.transporterName;
                var transporterDocumentNumber = request.parameters.transporterDocumentNumber;
                var transporterDocumentDate = request.parameters.transporterDocumentDate;

                var dateArr = transporterDocumentDate.split('-');
                var transporterDocumentDate = dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
                var transporterDocumentDate = new Date(transporterDocumentDate);

                log.debug("PCT-Billing", "Employee Name : " + empName);
                log.debug({
                    title: "PCT-Billing", details: 'Invoice Number : ' + invNumber + ", Transporter Name : " + transporterName + ", Transporter Document Number: " + transporterDocumentNumber + ", Transporter Document Date : " + transporterDocumentDate
                });
                // Search for Getting Invoice Id -----------------------
                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["type", "anyof", "CustInvc"],
                            "AND",
                            ["numbertext", "is", invNumber],
                            "AND",
                            ["mainline", "is", "T"]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var invSearchResultCount = invoiceSearchObj.runPaged().count;
                log.debug("PCT-Billing", "Invoice Result Count: " + invSearchResultCount);
                var searchResult = invoiceSearchObj.run().getRange({ start: 0, end: invSearchResultCount });
                for (var invIndex = 0; invIndex < invSearchResultCount; invIndex++)
                {
                    var invId = searchResult[invIndex].getValue({
                        name: "internalid"
                    })
                }
                var invoiceObj = record.load({
                    type: 'invoice',
                    id: invId
                });
                if (transporterName != -1)
                {
                    invoiceObj.setValue({ fieldId: 'custbody_transporter_name', value: transporterName });
                }
                invoiceObj.setValue({ fieldId: 'custbody_transporter_document_number', value: transporterDocumentNumber });
                invoiceObj.setValue({ fieldId: 'custbody_transporter_document_date', value: transporterDocumentDate });
                invoiceObj.save();
                log.debug("PCT-Billing", "Value Changed in Invoice");
                redirect.toSuitelet({
                    scriptId: 'customscript_pct_billing_main_page',
                    deploymentId: 'customdeploy_pct_billing_main_page',
                    isExternal: true,
                    parameters: {
                        'custparam_userName': empName,


                    }
                });

            }

        }
        /**
         * This method is used to get the paapri favicon url
         */
        function GetFaviconImgUrl()
        {
            var fileObj = file.load({
                id: 'SuiteScripts/PCT BILLING Web Application/Images/PCT logo.png'
            });
            return fileObj.url;
        }

        /**
         * This method is used to get the paapri full image url
         */
        function GetPaapriFullImgUrl()
        {
            var fileObj = file.load({
                id: 'SuiteScripts/PCT BILLING Web Application/Images/PCT logo with name.png'
            });
            return fileObj.url;
        }
        function GetPopularImgUrl()
        {
            var fileObj = file.load({
                id: 'SuiteScripts/PCT BILLING Web Application/Images/PP Logo small.png'
            });
            return fileObj.url;
        }




        return {
            onRequest: onRequest
        }
    });
