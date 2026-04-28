/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/log', 'N/runtime', 'N/file', 'N/search'], function (log, runtime, file, search) {

    function onRequest(context) {

        const response = context.response;
        const request = context.request;
        if (request.method === 'GET') {

            let htmlContent = file.load({
                id: `../View/PCT Work Order Variance.html`
            }).getContents();
            let pathObj = [
                {
                    'fileType': 'controller',
                    'localPath': '../Controller/PCT WOV Report Controller.js'
                },
                {
                    'fileType': 'logo',
                    'localPath': '../Assets/paapri_logo.png'
                },
            ];
            let utilityUrlObj = getUtilityPathUrl(pathObj);
            htmlContent = htmlContent.replace('#FETCH-CONTROLLER#', utilityUrlObj.controller);
            htmlContent = htmlContent.replace('#FETCH-LOGO#', utilityUrlObj.logo);
            log.debug("PCT_WMV", utilityUrlObj.controller)
            const scriptIdFetchRestletObj = getScriptId('customscript_pct_wmv_get_all_script_id');
            scriptIdFetchRestletObj.isSuccess ? scriptIdFetchRestletObj.data ? htmlContent = htmlContent.replace('#FETCH-SCRIPTID-RESTLET#', scriptIdFetchRestletObj.data.scriptInternalId) : null : null
            response.write(htmlContent)

            log.debug("PCT", "Script Usage Check in SuiteLet : " + runtime.getCurrentScript().getRemainingUsage())
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
