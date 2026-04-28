/**
 *@NApiVersion 2.0
 *@NScriptType Restlet
 *@NModuleScope SameAccount
 *@since        2021-12-27 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The Restlet 2.0 code in this page is for Print Barcode Label, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Restlet is used to Print Item Label
 *              UPDATE LOG:
 *. 
 */
define(['N/file', 'N/render', 'N/log', 'N/url', 'N/search', 'N/record'],
    function (file, render, log, url, search, record) {

        function _get(context) {
            var crID = context.recId;
            //var crID = '9239';
            log.debug({
                title: 'data',
                details: crID
            })

            var assNameObj = search.lookupFields({
                type: 'assemblybuild',
                id: crID,
                columns: ['item', 'quantity', 'custbody_pct_pp_batch_number', 'trandate']
            });

            var assName = assNameObj['item'][0].value;
            var noOfLabel = assNameObj['quantity']

            log.debug({
                title: 'assNameObj',
                details: JSON.stringify(assNameObj) + ' assName =' + assName
            })


            var barcodeObj = search.lookupFields({
                type: 'assemblyitem',
                id: assName,
                columns: ['itemid', 'upccode', 'displayname', 'custitem_pct_pp_item_size', 'custitem_pct_pp_mrp', 'custitem_pct_pp_label_selection','custitem_pct_pp_med_small_label']
            });

           
            var labelType = barcodeObj['custitem_pct_pp_label_selection'][0].value;
           

            log.debug({
                title: 'barcodeObj',
                details: JSON.stringify(barcodeObj) + ' labelType ='+labelType
            })
            var tranDate = assNameObj['trandate'].split('/')
            var date = tranDate[1] + '/' + tranDate[2];




            var myvar = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>";
            for (var index = 0; index < noOfLabel; index++) {
                if (labelType == 1) {//small
                    myvar += "<body width='2.8cm' height='1.5cm' style='text-align:left; padding-top:5px;'>";
                    myvar += '<table style="font-size:4;text-align:left; padding-left:-38px; padding-top:-5px; font-weight:bold;" >' +
                        '  <tr>' +
                        '    <td colspan="3" style="padding-left:-1px; white-space: pre;">' + barcodeObj['custitem_pct_pp_med_small_label'] + '</td>' +
                        '    ' +
                        '  </tr>' +
                       '  <tr style="padding-top:-5px;">' +
                        '    <td  style="padding-left:-1px; white-space: nowrap;">Packing  <br/> M.R.P <br/> Mfg. <br/> Batch<br/> </td>' +
                        '    <td  style="padding-left:0px;white-space: nowrap;">'
                         + barcodeObj['custitem_pct_pp_item_size'][0].text + '<br/>'+
                         ' Rs. ' + parseFloat(barcodeObj['custitem_pct_pp_mrp']).toFixed(2) +'<br/>'
                         + date +' <br/>' +  assNameObj['custbody_pct_pp_batch_number'] +'</td>' +
                         '<td align="right" style="padding-right: -47px; padding-top:-3px;"> <barcode codetype="qrcode" showtext="true" width="1.1cm" height="1cm" value="' + barcodeObj['displayname'] + '"/> </td>'+
                        '  </tr>' +
                        '</table>';

                    myvar += "</body>";
                }

               else if (labelType == 2) { //medium
                    myvar += "<body width='3.8cm' height='3.8cm' style='text-align:left; padding-top:5px;'>";
                    myvar += '<table style="font-size:7;text-align:left; padding-left:-38px; font-weight:bold;" >' +
                        '  <tr>' +
                        '    <td colspan="2" style="padding-left:-1px; white-space: pre;">'+ barcodeObj['custitem_pct_pp_med_small_label']+' </td>' +
                        //'<td> <barcode codetype="qrcode" showtext="true" width="1cm" height="1cm" value="' + barcodeObj['displayname'] + '"/> </td>'
                        '  </tr>' +
                        '  <tr style="padding-top:-5px;">' +
                        '    <td  style="padding-left:-1px; white-space: nowrap;">Packing : <br/>M.R.P <br/> Mfg. <br/>Batch<br/> </td>' +
                        '    <td  style="padding-left:0px;white-space: nowrap;">'
                         + barcodeObj['custitem_pct_pp_item_size'][0].text + '<br/><br/>'+
                         ' Rs. ' + parseFloat(barcodeObj['custitem_pct_pp_mrp']).toFixed(2) +'<br/><br/>'
                         + date +' <br/>' +  assNameObj['custbody_pct_pp_batch_number'] +'</td>' +
                         '<td align="right" style="padding-right: -38px; padding-top:-3px;"> <barcode codetype="qrcode" showtext="true" width="1.5cm" height="1.5cm" value="' + barcodeObj['displayname'] + '"/> </td>'+
                        '  </tr>' +
                       
                        '</table>';


                    myvar += "</body>";
                }

                else{ //big
                    myvar += "<body width='7.5cm' height='4.0cm' style='text-align:left; padding-top:5px;'>";
                    myvar += '<table style="font-size:8;text-align:left; padding-left:-38px; font-weight:bold;" >' +
                        '  <tr>' +
                        '    <td  style=" padding-left:10px;">' + barcodeObj['itemid'] + '</td>' +
                        '  </tr>' +
                        '  <tr style="padding-top:-5px;">' +
                        '    <td style="padding-left:10px; ">Packing  <br/> M.R.P <br/> Mfg. Month  <br/> Batch No. <br/> </td>' +
                        '    <td  style="padding-left:-132px;">'
                         + barcodeObj['custitem_pct_pp_item_size'][0].text + '<br/>'+
                         ' Rs. ' + parseFloat(barcodeObj['custitem_pct_pp_mrp']).toFixed(2) +'<br/>'
                         + date +' <br/>' +  assNameObj['custbody_pct_pp_batch_number'] +'</td>' +
                        '  </tr>' +
                       
                       
                        '  <tr>' +
                        '   <td style="padding-left:-10px;"><barcode style="width:268px; height:16px;"  codetype="code128" showtext="false" value="' + barcodeObj['displayname'] + '"></barcode></td> <td></td>' +

                        '  </tr>' +
                        '</table>';


                    myvar += "</body>";
                }
            }

            //end of packing Label















            var strVar = myvar + '</pdf>'
            strVar = htmlizeAmps(strVar);
            strVar = trim(strVar);

            log.debug({
                title: 'strVar',
                details: strVar
            })

            var a = render.create();
            var pdfFile = render.xmlToPdf({

                xmlString: strVar

            });

            log.debug({

                title: "pdfFile",

                details: pdfFile

            })

            pdfFile.name = crID + ' item_label.pdf';

            pdfFile.folder = 2394;

            var fileId = pdfFile.save();

            log.debug('Saved PDF to file ' + fileId);
            //return context.response.renderPdf(strVar);

            //  var pdfFile = strVar.renderAsPdf()

            var pdfId = getFileURL(fileId);

            //return strVar;
            return pdfId;
            //PDF FILE SAVE INTO FILE CABINET

            // return JSON.stringify(packingDataArr)
        }

        function _post(context) {
            //html file id =18806




            var itemline = context.reportData;






            log.debug({
                title: 'itemline',
                details: itemline
            })
            var fileData = file.load({
                id: 18806
            })

            var strVar = fileData.getContents();



            strVar = strVar.replace('#item_line#', itemline);
            strVar = strVar.replace('#heightWidth#', 'height="3.0in" width="6.75in"');
            strVar = htmlizeAmps(strVar);
            strVar = trim(strVar);

            log.debug({
                title: 'strVar',
                details: strVar
            })
            var a = render.create();
            var pdfFile = render.xmlToPdf({

                xmlString: strVar

            });

            //return pdfFile;
            log.debug({

                title: "pdfFile",

                details: pdfFile

            })




            pdfFile.name = 'label.pdf';

            pdfFile.folder = 1266;

            var fileId = pdfFile.save();



            log.debug('Saved PDF to file ' + fileId);
            //return context.response.renderPdf(strVar);

            //  var pdfFile = strVar.renderAsPdf()




            return getFileURL(fileId)


            //var renderer = render.create();
            //renderer.templateContent = strVar;

            //return  renderer.renderAsPdf();

            // return pdfFile

        }









        function getFileURL(fileId) {
            var fileSearchObj = search.create({
                type: "file",
                filters:
                    [
                        ["internalid", "anyof", fileId]
                    ],
                columns:
                    [

                        search.createColumn({ name: "url", label: "URL" }),

                    ]
            });
            var url;
            var searchResultCount = fileSearchObj.runPaged().count;

            log.debug("fileSearchObj result count", searchResultCount);
            fileSearchObj.run().each(function (result) {
                url = result.getValue('url')
                // .run().each has a limit of 4,000 results
                return true;
            });
            return url;
        }
        function htmlizeAmps(s) {
            // var result = s.replace(/\x26/g, "&amp;");
            var result = s.split('&').join('&amp;')
            return result;
        }

        function trim(str) {
            // return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));
            return str
        }

        return {
            get: _get,
            post: _post

        }
    });