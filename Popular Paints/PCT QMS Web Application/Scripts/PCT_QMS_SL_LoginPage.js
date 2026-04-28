/**
 *              //////////     PCT QMS | LOGIN PAGE SUITELET     //////////
 *
 *@Author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT QMS, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This Suitelet is used to render login page Html template.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/url'],
    function (file, render, search, log, redirect, record, format, url)
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
                var custparam_useremail = request.parameters.custparam_userEmail;

                log.debug({
                    title: 'custparam_useremail',
                    details: custparam_useremail
                })
                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                var loginEmailUrl = GetLoginEmailUrl();
                var popularImgUrl = GetPopularImgUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    popularImgUrl: popularImgUrl,
                    isHidden: 'hidden',
                    custparam_useremail: custparam_useremail,
                    loginEmailPageUrl: loginEmailUrl
                };
                // Load Login HTML Template
                var templateFile = file.load({ id: '../HTML Files/pct_qms_login_page.html' });
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

            } else
            {// POST

                log.debug({
                    title: 'in post',
                    details: 'in post'
                })

                // Getting params
                var userPin = request.parameters.custparam_userpin;
                var userEmail = request.parameters.custparam_useremail;
                //  var timeStap = request.parameters.timeStap;
                // var PCTCookie = 'PCTCookie' + ":" + userPin; //+ timeStap
                // var ip = context.request.headers['ns-client-ip'];
                // var user_agent = context.request.headers['user-agent'];
                // log.debug({
                //     title: 'PCTCookie',
                //     details: PCTCookie
                // })

                log.debug({
                    title: 'userPin',
                    details: userPin + '  ' + userEmail
                })
                // Validating User - This function return user object
                var isUserExisit = IsUserExist(userPin, userEmail);


                if (isUserExisit)
                {
                    //var loginRecordId = CreateTransactionRecord(isUserExisit.userId, "Login");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_doc_status_form',
                        deploymentId: 'customdeploy_pct_qms_doc_status_form',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': isUserExisit.userName,
                            'custparam_userId': isUserExisit.userId
                        }
                    });

                } else
                {
                    var faviconUrl = GetFaviconImgUrl();
                    var bodyImgUrl = GetPaapriFullImgUrl();
                    var loginEmailUrl = GetLoginEmailUrl();
                    log.debug("PCT qms", "faviconUrl = " + faviconUrl);
                    log.debug("PCT qms", "bodyImgUrl = " + bodyImgUrl);
                    // This block will execute when, entered PIN is wrong
                    // Assemble Data Source for Home Page
                    var dataSource = {
                        faviconUrl: faviconUrl,
                        bodyImgUrl: bodyImgUrl,
                        isHidden: " ",
                        custparam_useremail: userEmail,
                        loginEmailPageUrl: loginEmailUrl
                    };

                    // Load Login HTML Template
                    var templateFile = file.load({ id: '../HTML Files/pct_qms_login_page.html' });
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

        function GetLoginEmailUrl()
        {


            return url.resolveScript({
                scriptId: 'customscript_pct_qms_home_page',
                deploymentId: 'customdeploy_pct_qms_home_page',
                returnExternalUrl: true
            });
        }

        /**
         * This method is accept external password of the Employee (Netsuite Employee), search it
         * in netsuite and return user object.
         * 
         * @param {string} userPin - External password of employee
         */
        function IsUserExist(userPin, userEmail)
        {


            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["email", "is", userEmail],
                        "AND",
                        ["custentity_pct_pp_access_qms", "is", "T"],
                        "AND",
                        ["custentity_pct_pp_qms_password", "is", userPin]
                    ],
                columns:
                    [

                    ]


            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            log.debug("PCT-QMS", "Employee Search : " + searchResultCount);
            if (searchResultCount)
            {
                return true;
            }
            else
            {
                return false;

            }
        }

        /**
         * @param {string} userId - Internal ID of Employee (Netsuite Employee)
         * @param {string} actionType - Login
         */

        /**
         * This method is used to formate the date (string)
         * Note: In SuiteScript 2.0 you have to strickly follow the Date/Time formate
         * 
         * @param {string} value 
         */
        function FormateDate(value)
        {
            return format.parse({
                value: value,
                type: format.Type.DATE
            });
        }

        /**
         * @param {string} value 
         */
        function FormateTime(value)
        {
            return format.parse({
                value: value,
                type: format.Type.DATETIME
            });
        }

        /**
         * This method is used to get the paapri favicon url
         */
        function GetFaviconImgUrl()
        {
            var fileObj = file.load({
                id: '../Images/PCT logo.png'
            });
            return fileObj.url;
        }

        /**
         * This method is used to get the paapri full image url
         */
        function GetPaapriFullImgUrl()
        {
            var fileObj = file.load({
                id: '../Images/PCT logo with name.png'
            });
            return fileObj.url;
        }
        function GetPopularImgUrl()
        {
            var fileObj = file.load({
                id: '../Images/PP Logo small.png'
            });
            return fileObj.url;
        }

        return {
            onRequest: onRequest
        }
    });