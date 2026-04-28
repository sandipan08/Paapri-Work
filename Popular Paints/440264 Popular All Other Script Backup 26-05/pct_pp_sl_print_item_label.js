/**
 *              //////////     PCT Popular Paints | Item Label SUITELET     //////////
 * 
 *@author       Rajesh Nandi
 *@NApiVersion  2.0
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-12-270 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.0 code in this page is for PCT Northcott Popular Paints Label Print, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to Print Packing Label.
 */

 define(['N/file', 'N/render', 'N/log', 'N/url','N/search'],
 function (file, render, log, url,search) {
   
     function onRequest(context) {
         // Pre data source
         var request = context.request;
         var response = context.response;
         var recId = request.parameters.recId;
             var templateFile = file.load({ id: '48460' });

            
             var dataSource = {
                recId : recId
             }

             log.debug({
                 title: 'recId',
                 details: recId
             })
             var pageRenderer = render.create();
             pageRenderer.templateContent = templateFile.getContents();

             pageRenderer.addCustomDataSource({
                 format: render.DataSource.OBJECT,
                 alias: 'ds',
                 data: dataSource
             });

             var renderedPage = pageRenderer.renderAsString();
             response.write(renderedPage);
     }

     
 return {
     onRequest: onRequest
 }
});



