/**
 *              //////////     PCT QMS | LOGIN EMAIL PAGE SUITELET     //////////
 *
 *@Author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT QMS, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This Suitelet is used to render login email page Html template.
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

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                var popularImgUrl = GetPopularImgUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    popularImgUrl: popularImgUrl,
                    isHidden: 'hidden'
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

            } else
            {// POST

                // Getting params
                var userEmail = request.parameters.custparam_useremail;
                // Validating User - This function return user object
                var isUserExisit = IsUserExist(userEmail);


                if (isUserExisit)
                {
                    // var userId = isUserExisit.userId;
                    //  var rowDel = deleteRecord(userEmail);
                    // var ip = context.request.headers['ns-client-ip'];
                    // var user_agent = context.request.headers['user-agent'];
                    // var cookie = context.request.headers['cookie']

                    // log.debug({
                    //     title: 'rowDel',
                    //     details: rowDel
                    // })


                    // sendEmail(userEmail,ip,user_agent,userId,cookie);

                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_login_page',
                        deploymentId: 'customdeploy_pct_qms_login_page',
                        isExternal: true,
                        parameters: {
                            'custparam_userEmail': userEmail,
                        }
                    });

                } else
                {
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

        // function deleteRecord(email_id)
        // {

        //     log.debug({
        //         title: 'delete email id',
        //         details: email_id
        //     })
        //     var customrecord_pct_qms_otpSearchObj = search.create({
        //         type: "customrecord_pct_qms_otp",
        //         filters:
        //             [
        //                 ["custrecord_pct_qms_otp_email", "is", email_id]
        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "internalid", label: "Internal Id" }),
        //             ]
        //     });
        //     if (customrecord_pct_qms_otpSearchObj != null)
        //     {
        //         var searchResultCount = customrecord_pct_qms_otpSearchObj.runPaged().count;
        //         log.debug("customrecord_pct_qms_otpSearchObj result count", searchResultCount);
        //         customrecord_pct_qms_otpSearchObj.run().each(function (result)
        //         {
        //             var id = result.getValue({ name: "internalid", label: "Internal Id" });

        //             log.debug({
        //                 title: 'deleted rec id',
        //                 details: id
        //             })
        //             record.delete({
        //                 type: 'customrecord_pct_qms_otp',
        //                 id: id
        //             });
        //             // .run().each has a limit of 4,000 results
        //             return true;
        //         });
        //     }
        //     return searchResultCount;
        // }
        // //==================================================== Helper Methods =======================================//

        // function sendEmail(email_id, ip, user_agent, userId, cookie)
        // {
        //     var random = Math.floor(Math.random() * 899999) + 100000;
        //     log.debug({
        //         title: 'random',
        //         details: random
        //     });

        //     var Record = record.create({
        //         type: 'customrecord_pct_qms_otp',
        //         isDynamic: true,
        //     });

        //     Record.setText({
        //         fieldId: 'custrecord_pct_qms_otp_email',
        //         text: email_id
        //     });

        //     Record.setText({
        //         fieldId: 'custrecord_pct_qms_otp_pin',
        //         text: random
        //     });

        //     Record.setText({
        //         fieldId: 'custrecord_pct_qms_otp_ip',
        //         text: ip
        //     });

        //     Record.setText({
        //         fieldId: 'custrecord_pct_qms_otp_device',
        //         text: user_agent
        //     });
        //     Record.setText({
        //         fieldId: 'custrecord_pct_qms_otp_cookie',
        //         text: cookie
        //     });


        //     Record.setValue({
        //         fieldId: 'custrecord_pct_qms_otp_employee',
        //         value: userId
        //     });


        //     var id = Record.save({
        //         enableSourcing: true,
        //         ignoreMandatoryFields: true
        //     });

        //     log.debug({
        //         title: 'id',
        //         details: id
        //     });

        //     log.debug({
        //         title: 'PCT-email_id',
        //         details: email_id
        //     });
        //     email.send({
        //         author: -5,
        //         recipients: [email_id],
        //         subject: "PCT QMS PASSWORD",
        //         body: "Your OTP is : " + random
        //     });


        // }
        /**
         * @param {string} userPin - External password of employee
         */
        function IsUserExist(userEmail)
        {
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
         * 
         * @param {string} userId - Internal ID of Employee (Netsuite Employee)
         * @param {string} actionType - Login
         */

        /**
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
         * 
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
