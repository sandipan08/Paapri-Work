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
                // Load Login HTML Template
                var templateFile = file.load({ id: './PCT QMS/main.html' });
                var pageContent = templateFile.getContents();
                response.write(pageContent);


            }

        }




        return {
            onRequest: onRequest
        }
    });
