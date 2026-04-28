/**
 *              //////////     PMC 2.1  | SUITELET PAGE for PCT Inventory Number Update  //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2023-03-14 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT Inventory Number Update, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is for PCT Inventory Number Update
 */
define(['N/file', 'N/render', 'N/log', 'N/search'],
    function (file, render, log, search) {
        function onRequest(context) {
            var request = context.request;
            var response = context.response;
            if (request.method == 'GET') {
                log.debug({ title: "PCT", details: 'In Get Method' });
                // Load Login HTML Template
                var templateFile = file.load({ id: '../View/PCT_Inventory_Number_Index.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                const scriptIdFetchRestletObj = getScriptId('customscript_pct_inv_no_update_call_mp');
                scriptIdFetchRestletObj.isSuccess ? scriptIdFetchRestletObj.data ? renderedPage = renderedPage.replace('#FETCH-SCRIPTID-RESTLET#', scriptIdFetchRestletObj.data.scriptInternalId) : null : null

                response.write(renderedPage);

            }
            else {
                log.debug({ title: "PCT", details: 'In Post Method' });
            }
        }

        const getScriptId = scriptId => {
            log.debug("PCT", "Script Id : " + scriptId)
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
