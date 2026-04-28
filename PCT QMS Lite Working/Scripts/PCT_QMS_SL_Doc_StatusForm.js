/**
 *              //////////     PMC QMS Lite | Doc Status Form PAGE SUITELET     //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-03-25 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC QMS, you can redistribute
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
            if (request.method == 'GET') {
                var custparam_userName = request.parameters.custparam_userName;
                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName });

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                var paapriLogoUrl = GetPaapriFullImgUrl();
                var logoutPageUrl = GetLogoutPageUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    paapriLogoUrl: paapriLogoUrl,
                    isHidden: 'hidden',
                    custparam_userName: custparam_userName,
                    logoutPageUrl: logoutPageUrl,
                    itemReceiptCount: getItemReceiptCount(),
                    assemblybuildCount: getAssemblyBuildCount()
                };
                // Load Login HTML Template
                var templateFile = file.load({ id: '../HTML Files/pct_qms_lite_docStatus_page.html' });
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
                response.write(renderedPage);

            }
            else {

                log.debug({ title: "PCT-QMS", details: 'In Post Method' });
                // Getting params
                var custparam_userName = request.parameters.custparam_userName;
                var documentType = request.parameters.documentType;
                var documentStatus = request.parameters.documentStatus;
                //var createDate = request.parameters.createDate;
                log.debug({ title: 'PCT-QMS', details: "Document Type : " + documentType + ", Document Status : " + documentStatus });

                redirect.toSuitelet({
                    scriptId: 'customscript_pct_qms_doc_list_page',
                    deploymentId: 'customdeploy_pct_qms_doc_list_page',
                    isExternal: true,
                    parameters: {
                        'custparam_userName': custparam_userName,
                        'documentType': documentType,
                        'documentStatus': documentStatus,
                        //'createDate': createDate
                    }
                });


            }
        }
        //------------------------------------------- Custom Function ----------------------------------

        // This method is used to get the paapri favicon url
        function GetFaviconImgUrl() {
            var fileObj = file.load({
                id: '../Images/PCT logo.png'
            });
            return fileObj.url;
        }
        // This method is used to get the paapri full image url
        function GetPaapriFullImgUrl() {
            var fileObj = file.load({
                id: '../Images/PCT logo with name.png'
            });
            return fileObj.url;
        }
        /**
         * This method is used to get the paapri full image url
         */
        function GetPaapriFullImgUrl() {
            var fileObj = file.load({
                id: '../Images/PCT logo with name.png'
            });
            return fileObj.url;
        }
        /**
        * This method is used to get the external url of Logout Page
        */
        function GetLogoutPageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_qms_home_page',
                deploymentId: 'customdeploy_pct_qms_home_page',
                returnExternalUrl: true
            });
        }

        // ---------------------- Search Function for Getting Item Receipt Pending Status Count -----------------------------
        const getItemReceiptCount = () => {
            var itemreceiptSearchObj = search.create({
                type: "itemreceipt",
                filters:
                    [
                        ["type", "anyof", "ItemRcpt"],
                        "AND",
                        ["custbody_pct_pp_item_recipt_status", "anyof", "1"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["item.custitem_pct_pp_qc_checking", "is", "T"]

                    ],
                columns:
                    [
                        search.createColumn({
                            name: "tranid",
                            summary: "GROUP",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "itemid",
                            join: "item",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "custitem_pct_pp_qc_checking",
                            join: "item",
                            summary: "GROUP",
                            label: "Quality Checking Require"
                        })
                    ]
            });
            var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
            if (!itemReceiptCount) { itemReceiptCount = 0 }
            log.debug("PCT-QMS", "Item Receipt Pending Status Result Count : " + itemReceiptCount);
            return itemReceiptCount;
        }
        // ---------------------- Search for Getting Assembly Build Pending Status Count -----------------------------
        const getAssemblyBuildCount = () => {

            var assemblybuildSearchObj = search.create({
                type: "assemblybuild",
                filters:
                    [
                        ["type", "anyof", "Build"],
                        "AND",
                        ["custbody_pct_pp_item_recipt_status", "anyof", "1"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["item.custitem_pct_pp_qc_checking", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "tranid",
                            summary: "GROUP",
                            label: "Document Number"
                        })
                    ]
            });
            var assemblybuildCount = assemblybuildSearchObj.runPaged().count;
            log.debug("PCT-QMS", "Assembly Build Pending Status Result Count : " + assemblybuildCount);
            return assemblybuildCount;
        }
        return {
            onRequest: onRequest
        }
    });
