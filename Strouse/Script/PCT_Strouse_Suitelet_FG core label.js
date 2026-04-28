
/**
 *              //////////     Strouse FG Core label Pdf      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2023-03-27 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for Strouse FG Core label Pdf, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to generate Strouse FG Core label Suitelet Pdf      
 */

define(['N/file', 'N/log', 'N/record', "N/search", "N/runtime", "N/render"],
    function (file, log, record, search, runtime, render) {
        function onRequest(context) {
            log.debug({ title: 'PCT-Strouse', details: "In Suitelet" });

            if (context.request.method === 'GET') {
                var id = context.request.parameters.recordId;
                log.debug({ title: 'PCT-Strouse', details: "Record Id " + id });
                // var id = 3081;
                var itemFulfillmentLoad = record.load({
                    type: 'itemfulfillment',
                    id: id
                });


                var myvar = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
                    '<pdf>' +
                    '<head>' +
                    '   <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' +
                    '<macrolist>' +
                    '<macro id="nlheader">' +
                    '</macro>' +
                    '</macrolist>' +
                    '    <style>' +
                    '        .grid-container {' +
                    '            display: grid;' +
                    '     grid-template-columns: repeat(6, 200px)' +
                    // '            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))' +
                    '            gap: 20px;' +
                    '            padding: 10px;' +
                    '        }' +
                    '' +
                    '        .grid-container>div {' +
                    '            border: 1px solid black;' +
                    '            width: 250px;' +
                    '            height: 100px;' +
                    '            display: inline-flex' +
                    '            justify-content: flex-start' +
                    '            font-size: 30px;' +
                    '        }' +
                    '' +
                    '        .fgCoreTable {' +
                    '            width: 100%;' +
                    '            font-size: 10pt;' +
                    '            font-weight: bold;' +
                    '            padding: 10px;' +
                    '        }' +
                    '    </style>' +
                    '</head>' +
                    '' +
                    '<body header="nlheader" header-height="0%"  footer="nlfooter" footer-height="0pt"  padding="0.2in 0.2in 0.2in 0.2in" size="Letter">' +
                    '      <div class="grid-container">';
                for (var itemIndex = 0; itemIndex < itemFulfillmentLoad.getLineCount({ sublistId: 'item' }); itemIndex++) {
                    var productNumber = itemFulfillmentLoad.getSublistValue({ sublistId: 'item', fieldId: 'itemname', line: itemIndex });
                    var inventoryDetailsRecord = itemFulfillmentLoad.getSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: itemIndex
                    })
                    for (var inventoryDetailsIndex = 0; inventoryDetailsIndex < inventoryDetailsRecord.getLineCount({ sublistId: 'inventoryassignment' }); inventoryDetailsIndex++) {

                        var lotNumberFieldLookUp = search.lookupFields({
                            type: 'inventorynumber',
                            id: inventoryDetailsRecord.getSublistValue({ sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', line: inventoryDetailsIndex }),
                            columns: ['inventorynumber']
                        });
                        // lotNumberArray.push(lotNumberFieldLookUp.inventorynumber)

                        myvar += '        <div>' +
                            '            <table class="fgCoreTable">' +
                            '                <tr>' +
                            '                    <td>Part # </td>' +
                            `                    <td>${productNumber}</td>` +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td>Lot # </td>' +
                            `                    <td>${lotNumberFieldLookUp.inventorynumber}</td>` +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td>Op # </td>' +
                            `                    <td>${runtime.getCurrentUser().id}</td>` +
                            '                </tr>' +
                            '            </table>' +
                            '        </div>';
                    }
                }

                myvar += '</div></body></pdf>';
                myvar = space(myvar);
                myvar = addspace(myvar);
                myvar = htmlizeAmps(myvar);
                myvar = trim(myvar);
                myvar = myvar.replace('&lt;', '<');
                myvar = myvar.replace('&gt;', '>');
                context.response.renderPdf(myvar);

            }


            function space(s) {

                var result = s.replace(/&nbsp;/g, " ");

                return result;

            }

            function addspace(b) {

                var result = b.replace('</br>', '&nbsp;');

                return result;

            }



            function htmlizeAmps(s) {

                var result = s.replace(/\x26/g, "&amp;");

                return result;

            }



            function trim(str) {

                return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));

            }

            function find_null(value) {

                if (value == null) {

                    value = ''

                }

                return value;

            }

        }


        return {
            onRequest: onRequest,
        };
    });
