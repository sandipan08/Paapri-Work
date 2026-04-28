/**
 *              //////////     PCT BILLING | LOGIN PAGE SUITELET     //////////
 *
 *@Author       Arghadeep Sarkar & Suman Das
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT BILLING, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
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
                var custparam_userid = request.parameters.custparam_userid;

                log.debug({
                    title: 'custparam_useremail',
                    details: custparam_useremail + "--" + custparam_userid
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
                var templateFile = file.load({ id: 'SuiteScripts/PCT BILLING Web Application/HTML Files/pct_billing_login_page.html' });
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
                var userId = request.parameters.custparam_userid;
                //var PCTCookie = 'PCTCookie' + ":" + userPin; //+ timeStap
                var ip = context.request.headers['ns-client-ip'];
                var user_agent = context.request.headers['user-agent'];
                //  log.debug({
                //      title: 'PCTCookie',
                //      details: PCTCookie
                //  })

                log.debug({
                    title: 'userPin',
                    details: userPin + '  ' + userEmail
                })
                // Validating User - This function return user object
                var isUserExisit = IsUserExist(userPin, userEmail, ip, user_agent);


                if (isUserExisit.isSuccess)
                {
                    log.debug({
                        title: "PCT-Billing",
                        details: "User Details : " + JSON.stringify(isUserExisit)
                    })
                    //var loginRecordId = CreateTransactionRecord(isUserExisit.userId, "Login");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_main_page',
                        deploymentId: 'customdeploy_pct_billing_main_page',
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
                    log.debug("PCT BILLING", "faviconUrl = " + faviconUrl);
                    log.debug("PCT BILLING", "bodyImgUrl = " + bodyImgUrl);
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
                    var templateFile = file.load({ id: 'SuiteScripts/PCT BILLING Web Application/HTML Files/pct_billing_login_page.html' });
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
                scriptId: 'customscript_pct_billing_login_email',
                deploymentId: 'customdeploy_pct_billing_login_email',
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

            //  var customrecord_pct_billing_otpSearchObj = search.create({
            //      type: "customrecord_pct_billing_otp",
            //      filters:
            //          [
            //              ["custrecord_pct_billing_otp_email", "is", userEmail],
            //              "AND",
            //              ["custrecord_pct_billing_otp_ip", "is", ip],
            //              "AND",
            //              ["custrecord_pct_billing_otp_device", "is", user_agent]
            //          ],
            //      columns:
            //          [
            //              search.createColumn({ name: "internalid", label: "id" }),
            //              search.createColumn({ name: "custrecord_pct_billing_otp_email", label: "Email" }),
            //              search.createColumn({ name: "custrecord_pct_billing_otp_time", label: "Time" })
            //          ]
            //  });
            //  var custRecId;
            //  var searchResultCountValid = customrecord_pct_billing_otpSearchObj.runPaged().count;
            //  log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCountValid);
            //  customrecord_pct_billing_otpSearchObj.run().each(function (result) {
            //      custRecId = result.getValue('internalid');
            //  });



            //var encUserPin = encodePin(userPin);
            var user = new Object();

            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["email", "is", userEmail],
                        "AND",
                        ["custentity_pct_pp_access_billing", "is", "T"],
                        "AND",
                        ["custentity_pct_pp_billing_password", "is", userPin]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "email", label: "Email" }),
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });

            var count = 0;

            var searchResultCount = employeeSearchObj.runPaged().count;
            log.debug("searchResultCount result count after", searchResultCount);
            if (searchResultCount > 0)
            {
                //  log.debug({
                //      title: 'PCTCookie end',
                //      details: PCTCookie
                //  })
                //  record.submitFields({
                //      type: 'customrecord_pct_billing_otp',
                //      id: custRecId,
                //      values: {
                //          custrecord_pct_billing_otp_cookie: PCTCookie,
                //      }

                //  })
                employeeSearchObj.run().each(function (result)
                {

                    user.userName = result.getValue({ name: 'entityid' });
                    user.userId = result.getValue({ name: 'internalid' });
                    user.isSuccess = true;
                    count = 1;

                });
            } else
            {
                user.isSuccess = false
            }


            return user;
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