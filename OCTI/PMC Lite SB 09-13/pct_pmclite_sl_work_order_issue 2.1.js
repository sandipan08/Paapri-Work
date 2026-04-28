/**
 *              //////////     PMC Lite 2.1 | LOGOUT PAGE SUITELET     //////////
 * 
*@author       Rajesh Nandi
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-03-28 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC Lite, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
                
 *@description  This Suitelet is used to render logout page html template.
 */
 define(['N/file', 'N/render', 'N/url', 'N/record', 'N/format'],
    function (file, render, url, record, format) {
        /**
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
                // This block is execute when you click "LOGOUT" button on home page.
                // Getting Params [GET REQUEST]
                var userName = request.parameters.custparam_userName;
                var userId = request.parameters.custparam_userId;
                var loginRecordId = request.parameters.custparam_loginRecordId;
                var todayQuantity = request.parameters.custparam_todayQuantity;

                // Getting login page url
                var loginPageUrl = GetLoginPageUrl();
                var faviconUrl = GetFaviconImgUrl();
                var paapriFullImgUrl = GetPaapriFullImgUrl();
                // Updating PMC Transaction Record [ActionType = Logout]
                //UpdateTransactionRecord("Logout", loginRecordId);

                // Assemble Data Source for Home Page
                var dataSource = {
                    userName: userName,
                    userId: userId,
                    todayQuantity: todayQuantity,
                    loginPageUrl: loginPageUrl,
                    faviconUrl: faviconUrl,
                    paapriFullImgUrl: paapriFullImgUrl
                };

                // Load Logout HTML Template
                var templateFile = file.load({ id: './PMC Lite Web Application/PMC Lite 2.1 Templates/pct_pmclite_work_order_issue.html' });
                // Rendering Logout Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });
                var renderedPage = pageRenderer.renderAsString();
                response.write(renderedPage);

            }
        }

       

        /**
         * 
         * @param {string} value 
         */
        function FormateTime(value) {
            return format.parse({
                value: value,
                type: format.Type.DATETIME
            });
        }

        /**
         * This method is used to get the external url of Logout Page
         */
        function GetLoginPageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_pmclite_sl_login_pg',
                deploymentId: 'customdeploy_pct_pmclite_sl_login_pg',
                returnExternalUrl: true
            });
        }

        /**
        * This method is used to get the paapri favicon url
        */
        function GetFaviconImgUrl() {
            var fileObj = file.load({
                id: './PMC Lite Web Application/Images/PCT logo.png'
            });
            return fileObj.url;
        }

        /**
        * This method is used to get the paapri full image url
        */
        function GetPaapriFullImgUrl() {
            var fileObj = file.load({
                id: './PMC Lite Web Application/Images/PCT logo with name.png'
            });
            return fileObj.url;
        }



        return {
            onRequest: onRequest
        }
    });
