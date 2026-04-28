/**
 *              //////////     PCT BILLING | PDF GENERATION SUITELET     //////////
 *
 *@Author       Arghadeep Sarkar & Suman Das
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT BILLING, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This Suitelet is used to download the pdf of required invoice.
 */
define(['N/record', 'N/render', 'N/log'],
    function (record, render, log) {
        function onRequest(context) {
            var pct_logo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15879&c=7255402&h=1GdiaCo-ZxSq4b7ZW5Crn8zJIeA6ud9GGocx3xg56jFatBrf';
            var request = context.request;
            var response = context.response;
            var id = request.parameters.recordname;

            var invoiceObjRecord = record.load({
                type: record.Type.INVOICE,
                id: id,
                isDynamic: true,
            });
            log.debug({
                title: "Invoice Id:",
                details: id
            })
            var idInt=parseInt(id);
            
            var transactionFile = render.transaction({
                entityId: idInt,
                printMode: render.PrintMode.PDF,
                inCustLocale: true
            });
            log.debug({
                title: "Invoice record:",
                details: transactionFile
            })
           
             context.response.writeFile(transactionFile);


            // response.renderPdf(transactionFile)
        }
        return {

            onRequest: onRequest

        };


    });