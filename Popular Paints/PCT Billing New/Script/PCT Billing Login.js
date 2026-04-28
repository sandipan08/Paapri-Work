/**
 *              //////////     PMC 2.1  | PCT Billing Login Page   //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-09-20 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT Billing Login Page 2.1, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is for PCT Billing Login Page 2.1
 */
define(['N/file', 'N/search', 'N/redirect', 'N/https'], function (file, search, redirect, https) {

    function onRequest(context) {
        const response = context.response;
        const request = context.request;
        if (request.method === 'GET') {
            log.debug(`PCT-Billing`, `In Get Method`)
            let htmlContent = file.load({
                id: `../HTML Files/PCT Billing Login.html`
            }).getContents();
            let pathObj = [
                {
                    'fileType': 'stylesheet',
                    'localPath': '../Stylesheet/PCT Billing Login StyleSheet.css'
                },
                {
                    'fileType': 'logo',
                    'localPath': '../Assets/logo.png'
                },
                {
                    'fileType': 'companyLogo',
                    'localPath': '../Assets/logo_with_name.png'
                },
            ];
            let utilityUrlObj = getUtilityPathUrl(pathObj);
            log.debug("PCT-Billing", "Utility Obj : " + JSON.stringify(utilityUrlObj))
            htmlContent = htmlContent.replace('#FETCH-LOGO#', utilityUrlObj.logo);
            htmlContent = htmlContent.replace('#FETCH-PAAPRI-LOGO#', utilityUrlObj.companyLogo);
            htmlContent = htmlContent.replace('#FETCH-STYLESHEET#', utilityUrlObj.stylesheet);
            response.write(htmlContent)
        }
        else {
            log.debug(`PCT-Billing`, `In Post Method`);
            // Getting params
            let emailId = request.parameters.emailId;
            let loginPassword = request.parameters.loginPassword;
            log.debug(`PCT-Billing`, `Email Id : ${emailId}, Password : ${loginPassword}`);
            if (isUserExist(emailId, loginPassword)) {
                redirect.toSuitelet({
                    scriptId: 'customscript_pct_billing_home_page',
                    deploymentId: 'customdeploy_pct_billing_home_page',
                    isExternal: true,
                    parameters: {
                        'emailId': emailId,
                        'loginPassword': loginPassword
                    }
                });
            }
            else {
                let response = https.get({
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js'
                });
                log.debug(`PCT-Billing`, `Response : ${response.body}`)
                response.Swal.fire(
                    'The Internet?',
                    'That thing is still around?',
                    'question'
                )
                // alert("Login Failed");
            }
        }
    }

    const getUtilityPathUrl = dataObj => {
        let urlObj = {};
        dataObj.map((value) => {
            urlObj[value.fileType] = file.load({
                id: value.localPath
            }).url;
        })
        return urlObj;
    }

    const isUserExist = (emailId, loginPassword) => {
        var employeeSearchObj = search.create({
            type: "employee",
            filters:
                [
                    ["email", "is", emailId],
                    "AND",
                    ["custentity_pct_access_billling", "is", "T"],
                    "AND",
                    ["custentity_pct_billing_password", "is", loginPassword]
                ],
            columns:
                []
        });
        let userCount = employeeSearchObj.runPaged().count;
        return (userCount ? true : false);
    }

    return {
        onRequest: onRequest
    }
});
