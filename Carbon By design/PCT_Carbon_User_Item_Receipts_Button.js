/**
*@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record', 'N/search'],
    function (serverWidget, xml, log, render, record, search) {
        function onRequest(context) {
            if (context.request.method === 'GET') {
                {
                    let itemReceiptId = context.request.parameters.recordId;
                    log.debug({ title: 'PCT-Carbon', details: "Record Id " + itemReceiptId });
                    // let itemReceiptLoad = record.load({ type: 'itemreceipt', id: itemReceiptId })

                    var myvar = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n" +
                        '<pdf>' +
                        '<head>' +
                        "<link name=\"russianfont\" type=\"font\" subtype=\"opentype\" " + "src=\"NetSuiteFonts/verdana.ttf\" " + "srcbold=\"NetSuiteFonts/verdanab.ttf\" " + "src-italic=\"NetSuiteFonts/verdanai.ttf\" " +
                        "src-bolditalic=\"NetSuiteFonts/verdan abi.ttf\" " + "bytes=\"2\"/>\n" +
                        '<style type="text/css">* {' +
                        '		}' +
                        'table {display: flex; align-items: center; justify-content: center;}' +
                        '</style>' +
                        '</head>';

                    // invObjResponse.map((element, index) => {

                    myvar += '<body padding="10px" width="2in" height="2in">' +
                        '<table style="width:100%; ">' +
                        '<tr>' +
                        '<td border-spacing="15px" style="padding-top:20px">' +
                        // '<barcode class="barcode" style="width: 120pt; height:30pt; " codetype="Code128" showtext="true" value="' + element.item + '"></barcode>' +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td border-spacing="15px"  style="padding-top:15px">' +
                        // '<barcode class="barcode" style="width: 120pt; height:30pt;" codetype="Code128" showtext="true" value="' + element.inventoryNumber + '"></barcode>' +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="padding-top:15px ; padding-left:7px">' +
                        // `<h4>Lot Quantity : ${element.lotQuantity} </h4>` +
                        '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</body>';
                    // })

                    myvar += '</pdf>';
                    context.response.renderPdf(myvar);
                }
            }
        }



        return {
            onRequest: onRequest,
        };
    });
