/**
 *              //////////     PMC 2.1  | SUITELET PAGE   //////////
 * 
 *@author       Subhankar Nath
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2022-06-27 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC 2.1, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is for PMC 2.1
 */
define(['N/file', 'N/search'], function (file, search) {

    function onRequest(context) {
        const response = context.response;
        const request = context.request;
        if (request.method === 'GET') {
            let htmlContent = file.load({
                id: `../../View/PMC_Console.html`
            }).getContents();
            let pathObj = [
                {
                    'fileType': 'stylesheet',
                    'localPath': '../../Stylesheet/PMC_StyleSheet.css'
                },
                {
                    'fileType': 'controller',
                    'localPath': '../../Controller/PMC_Controller.js'
                },
                {
                    'fileType': 'logo',
                    'localPath': '../../Assets/logo.jpg'
                },
            ];
            let utilityUrlObj = getUtilityPathUrl(pathObj);

            htmlContent = htmlContent.replace('#FETCH-LOGO#', utilityUrlObj.logo);
            htmlContent = htmlContent.replace('#FETCH-STYLESHEET#', utilityUrlObj.stylesheet);
            htmlContent = htmlContent.replace('#FETCH-CONTROLLER#', utilityUrlObj.controller);

            log.debug("PCT-PMC", "Utility Obj : " + utilityUrlObj)
            const scriptIdFetchRestletObj = getScriptId('customscript_pct_pmc_get_all_script_ids');
            scriptIdFetchRestletObj.isSuccess ? scriptIdFetchRestletObj.data ? htmlContent = htmlContent.replace('#FETCH-SCRIPTID-RESTLET#', scriptIdFetchRestletObj.data.scriptInternalId) : null : null
            response.write(htmlContent)
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

    const getScriptId = scriptId => {
        log.debug("PCT-PMC-GetScriptId Function", "Script Id : " + scriptId)
        var scriptSearchObj = search.create({
            type: "script",
            filters:
                [
                    ["scriptid", "is", scriptId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "scripttype", label: "Script Type" }),
                    search.createColumn({ name: "owner", label: "Owner" }),
                    search.createColumn({ name: "isinactive", label: "Inactive" })
                ]
        });
        var searchResultCount = scriptSearchObj.runPaged().count;
        log.debug("PCT-PMC-GetScriptId Function", "Script Count : " + searchResultCount);
        if (searchResultCount > 0) {
            let scriptData = {}
            scriptSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                let scriptId = result.getValue({ name: "scriptid" })
                let scriptInternalId = result.id
                scriptData['scriptInternalId'] = scriptInternalId;
                scriptData['scriptId'] = scriptId;
                return true;
            });
            return { 'isSuccess': true, 'data': scriptData }
        }
        return { 'isSuccess': false }
    }

    return {
        onRequest: onRequest
    }
});
