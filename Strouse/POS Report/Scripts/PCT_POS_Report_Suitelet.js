/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/log', 'N/file'], function (log, file) {

    function onRequest(context) {

        const response = context.response;
        const request = context.request;
        if (request.method === 'GET') {

            let htmlContent = file.load({
                id: `../View/PCT POS Report.html`
            }).getContents();
            let pathObj = [
                {
                    'fileType': 'controller',
                    'localPath': '../Controller/PCT POS Report Controller.js'
                },
                {
                    'fileType': 'logo',
                    'localPath': '../Assets/paapri_logo.png'
                },
                {
                    'fileType': 'styleSheet',
                    'localPath': '../StyleSheet/PCT POS Report StyleSheet.css'
                },
            ];
            let utilityUrlObj = getUtilityPathUrl(pathObj);
            htmlContent = htmlContent.replace('#FETCH-CONTROLLER#', utilityUrlObj.controller);
            htmlContent = htmlContent.replace('#FETCH-LOGO#', utilityUrlObj.logo);
            htmlContent = htmlContent.replace('#STYLESHEET-URL#', utilityUrlObj.styleSheet);
            log.debug("PCT_POS", utilityUrlObj.controller)
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


    return {
        onRequest: onRequest
    }
});
