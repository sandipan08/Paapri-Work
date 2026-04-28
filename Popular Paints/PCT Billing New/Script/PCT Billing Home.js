/**
 *              //////////     PMC 2.1  | PCT Billing Home Page   //////////
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
define(['N/file', 'N/search'], function (file, search) {

    function onRequest(context) {
        const response = context.response;
        const request = context.request;
        if (request.method === 'GET') {
            // Getting params
            let emailId = request.parameters.emailId;
            let loginPassword = request.parameters.loginPassword;
            log.debug(`PCT-Billing`, `Email Id : ${emailId}, Password : ${loginPassword}`);

            let htmlContent = file.load({
                id: `../HTML Files/PCT Billing Home.html`
            }).getContents();
            let pathObj = [
                {
                    'fileType': 'stylesheet',
                    'localPath': '../Stylesheet/PCT Billing Home StyleSheet.css'
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
            let customerData = getCustomer();
            let customerDatalist = generateDataList({
                'inputId': 'customer-id',
                'datalistId': 'customer-datalist',
                'data': customerData
            })
            htmlContent = htmlContent.replace('#DROPDOWN-CONTENTS#', customerDatalist);
            response.write(htmlContent);
        }
        else {
            log.debug(`PCT-Billing`, `In Post Method`);
            log.debug({
                title: 'LOG',
                details: JSON.stringify(context.request)
            })
        }
    }

    const getUtilityPathUrl = dataObj => {

        let urlObj = {};
        dataObj.map((value) => {
            urlObj[value.fileType] = file.load({
                id: value.localPath
            }).url;
        })
        return urlObj
    }

    const getCustomer = () => {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
                [
                    ["stage", "anyof", "CUSTOMER"],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "altname", label: "Name" })
                ]
        });
        var customerCount = customerSearchObj.runPaged().count;
        log.debug("customerSearchObj result count", customerCount);
        let customerArray = [];
        customerSearchObj.run().each(function (result) {
            let customerObj = {};
            customerObj['id'] = result.id;
            customerObj['name'] = result.getValue({ name: "altname" });
            customerArray.push(customerObj)
            return true;
        });
        return customerArray;
    }

    const generateDataList = (dataObj) => {
        return `<input list="${dataObj.datalistId}" id="${dataObj.inputId}" name="${dataObj.inputId}" class='form-control' />
        <datalist id="${dataObj.datalistId}">
        ${dataObj.data.map((element) => {
            return `<option value="${element.name}" data-value='${element.id}'>${element.name}</option>`
        })}
        </datalist>`
    }

    return {
        onRequest: onRequest
    }
});