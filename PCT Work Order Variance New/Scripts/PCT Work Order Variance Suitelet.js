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
            // const scriptIdFetchRestletObj = getScriptId('customscript_pct_wmv_get_all_script_id');
            // scriptIdFetchRestletObj.isSuccess ? scriptIdFetchRestletObj.data ? htmlContent = htmlContent.replace('#FETCH-SCRIPTID-RESTLET#', scriptIdFetchRestletObj.data.scriptInternalId) : null : null
            response.write(htmlContent)

            let scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
            scriptTask.scriptId = 'customscript_pct_wov_get_table_data';
            scriptTask.deploymentId = '	customdeploy_pct_wov_get_table_data';
            // scriptTask.params = {
            //     custscript_searchfilter_report: JSON.stringify(filters)
            // };
            var myTaskId = scriptTask.submit();

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



    return {
        onRequest: onRequest
    }
});
