/**
 *              //////////     PMC Lite 2.1 | LOGIN PAGE SUITELET     //////////
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

 *@description  This Suitelet is used to render login page Html template.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format'],
    function (file, render, search, log, redirect, record, format) {
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
                var templateFile = file.load({ id: './PMC Lite Web Application/PMC Lite 2.1 Templates/pct_pmclite_login_page.html' });
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
                var userPin = request.parameters.custparam_userpin;
                // Validating User - This function return user object
                var isUserExisit = IsUserExist(userPin);

                if (isUserExisit.isSuccess) {
                    // Creating PCT PMC Transaction Record
                    var loginRecordId = CreateTransactionRecord(isUserExisit.userId, "Login");

                    // PCT PMC Lite SL Home Page 's Script Id and deploy id
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_pmclite_sl_home_pg',
                        deploymentId: 'customdeploy_pct_pmclite_sl_home_pg',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': isUserExisit.userName,
                            'custparam_userId': isUserExisit.userId,
                            'custparam_loginRecordId': loginRecordId
                        }
                    });

                } else {
                    var faviconUrl = GetFaviconImgUrl();
                    var bodyImgUrl = GetPaapriFullImgUrl();
                    log.debug("Team Innovation | PMC Lite 2.1", "faviconUrl = " + faviconUrl);
                    log.debug("Team Innovation | PMC Lite 2.1", "bodyImgUrl = " + bodyImgUrl);
                    // This block will execute when, entered PIN is wrong
                    // Assemble Data Source for Home Page
                    var dataSource = {
                        faviconUrl: faviconUrl,
                        bodyImgUrl: bodyImgUrl,
                        isHidden: " "
                    };

                    // Load Login HTML Template
                    var templateFile = file.load({ id: './PMC Lite Web Application/PMC Lite 2.1 Templates/pct_pmclite_login_page.html' });
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

        //==================================================== Helper Methods =======================================//


        /**
         * This method is accept external password of the Employee (Netsuite Employee), search it
         * in netsuite and return user object.
         * 
         * @param {string} userPin - External password of employee
         */
        function IsUserExist(userPin) {
            var user = new Object();
            var employeeSearchObj = search.create({
                type: "employee",
                filters: [["custentity_pct_cit_badge_id", "is", userPin]],
                columns: [search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Name" }),
                search.createColumn({ name: "internalid", label: "Internal ID" })]
            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            if (searchResultCount > 0) {
                employeeSearchObj.run().each(function (result) {
                    user.userName = result.getValue({ name: 'entityid' });
                    user.userId = result.getValue({ name: 'internalid' });
                    user.isSuccess = true;
                    return true;
                });
            } else {
                user.isSuccess = false
            }
            return user;
        }

        /**
         * This method is used craete the custom record i.e. PCT PMC Transaction Table.
         * 
         * @param {string} userId - Internal ID of Employee (Netsuite Employee)
         * @param {string} actionType - Login
         */
        function CreateTransactionRecord(userId, actionType) {
            var now = new Date();
            var createdDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
           /* var recordId = record.create({
                type: 'customrecord_pct_pmc_tran',
                isDynamic: true,
            }).setValue({
                fieldId: "custrecord_pct_pmc_emp",
                value: userId,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_pmc_op_status",
                text: actionType,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmclite_trans_date",
                value: FormateDate(createdDate),
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_pmc_res_start_date",
                value: FormateTime(createdTime),
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            return recordId;*/
            return true
        }

        /**
         * This method is used to formate the date (string)
         * Note: In SuiteScript 2.1 you have to strickly follow the Date/Time formate
         * 
         * @param {string} value 
         */
        function FormateDate(value) {
            return format.parse({
                value: value,
                type: format.Type.DATE
            });
        }

        /**
         * This method is used to formate the time (string)
         * Note: In SuiteScript 2.1 you have to strickly follow the Date/Time formate
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
