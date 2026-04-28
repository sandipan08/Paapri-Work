
/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url)
    {
        function onRequest(context)
        {
            var request = context.request;
            var response = context.response;
            if (request.method == 'GET')
            {
                log.debug({ title: "PCT-MOTT", details: 'In Get Method' });
                // Load Login HTML Template
                var templateFile = file.load({ id: 5955669 }); //'./View/PCT_Mott_Report_Index.html' 
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                response.write(renderedPage);

            }
            else
            {
                log.debug({ title: "PCT-MOTT", details: 'In Post Method' });
            }
        }

        return {
            onRequest: onRequest
        }
    });
