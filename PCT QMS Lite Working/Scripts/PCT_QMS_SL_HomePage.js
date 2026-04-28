/**
 *              //////////     PCT QMS Lite | LOGIN EMAIL PAGE SUITELET     //////////
 *
 *@Author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT QMS Lite, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This Suitelet is used to render the login email page Html.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect'],
    function (file, render, search, log, redirect) {
        /**
         * Definition of the Suitelet script trigger point.
         * 
         * @param {Object} context 
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
         */
        function onRequest(context) {
            // Pre data source
            var request = context.request;
            var response = context.response;

            if (request.method == 'GET') {

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    isHidden: 'hidden'
                };
                // Load Login HTML Template
                var templateFile = file.load({ id: '../HTML Files/pct_qms_lite_home_page.html' });
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

            } else {// POST

                // Getting params
                var userEmail = request.parameters.custparam_useremail;
                // Validating User - This function return user object
                var isUserExisit = IsUserExist(userEmail);


                if (isUserExisit) {
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_login_page',
                        deploymentId: 'customdeploy_pct_qms_login_page',
                        isExternal: true,
                        parameters: {
                            'custparam_userEmail': userEmail,
                        }
                    });

                } else {
                    var faviconUrl = GetFaviconImgUrl();
                    var bodyImgUrl = GetPaapriFullImgUrl();
                    log.debug("PCT qms", "faviconUrl = " + faviconUrl);
                    log.debug("PCT qms", "bodyImgUrl = " + bodyImgUrl);
                    // This block will execute when, entered PIN is wrong
                    // Assemble Data Source for Home Page
                    var dataSource = {
                        faviconUrl: faviconUrl,
                        bodyImgUrl: bodyImgUrl,
                        isHidden: " "
                    };

                    // Load Login HTML Template
                    var templateFile = file.load({ id: '../HTML Files/pct_qms_home_page.html' });
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

            }// POST END

        }



        // }
        /**
         * @param {string} userPin - External password of employee
         */
        function IsUserExist(userEmail) {
            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["email", "is", userEmail],
                        "AND",
                        ["custentity_pct_pp_access_qms", "is", "T"]
                    ],
                columns:
                    [

                    ]


            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            log.debug("PCT-QMS", "Employee Search : " + searchResultCount);
            if (searchResultCount) {
                return true;
            }
            else {
                return false;

            }

        }

        /**
         * This method is used to get the paapri favicon url
         */
        function GetFaviconImgUrl() {
            var fileObj = file.load({
                id: '../Images/PCT logo.png'
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

        return {
            onRequest: onRequest
        }
    });
