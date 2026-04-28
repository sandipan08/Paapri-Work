/**
 *@NApiVersion 2.1
 *@NScriptType Portlet
 * Version Date Author Remarks
 * 2.1 5th April 2021 Kunal Das
 */
/**************************************************************************************
Script Name: Portlet
Developer: Kunal Das
Development Head: Kunal Das
Company Name: Paapri Cloud Technologies
Purpose: Service Call UI

© Copyright All Right
***********************************************************************************************************************************************/
define(['N/file', 'N/url', 'N/http'],
    function (file, url, http)
    {
        function render(params)
        {
            params.portlet.title = 'Services';


            // var fileObj = file.load({
            //     id: 5723
            // });
            // var fileContent = fileObj.getContents();
            // // alert('Hello');
            // params.portlet.html = fileContent;

            var suiteletUrl = url.resolveScript({
                scriptId: "customscript_pct_hl_suitelet_call_html",
                deploymentId: "customdeploy_pct_hl_suitelet_call_html",
                returnExternalUrl: false
            });
            suiteletUrl = suiteletUrl + '&quota=1';
            // suiteletUrl="https://6809951.app.netsuite.com/app/site/hosting/scriptlet.nl?script=572&deploy=1"
            // var response = http.get({
            //     url: suiteletUrl,
            // });
            // params.portlet.html = response;

            var html = '<iframe id="snavPortlet" style="height: 350px; width: 100%" frameborder="0" src="' + suiteletUrl + '"></iframe>';


            params.portlet.html = html;


        }
        return {
            render: render
        };
    });