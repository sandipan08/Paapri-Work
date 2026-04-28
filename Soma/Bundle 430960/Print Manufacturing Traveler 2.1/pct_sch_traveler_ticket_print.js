/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/runtime', 'N/file', 'N/search', 'N/render', 'N/record'], function (runtime, file, search, render, record) {

    function execute(context) {

        var rec_id = runtime.getCurrentScript().getParameter({
            name: 'custscript_pct_traveler_ticket_wo_id'
        });

        log.debug({
            title: 'rec_id',
            details: rec_id
        })

        var fileData = file.load('./Qr Code.html');
        log.debug({
            title: 'After rec_id',
            details: rec_id
        })
        //nlapiLoadFile(4159); //9802,9803,9804,9805,9806

        var strVar = fileData.getContents();

        log.debug({
            title: 'strVar',
            details: strVar
        })


        var tran_id = new Array();
        var opp_name = new Array();
        var seq = new Array();
        var mach = new Array();
        var wo_num = new Array();
        var qty = new Array();
        var w_date = new Array();
        var w_item = new Array();

        var filter = new Array();

        var workOrderObj = search.lookupFields({
            type: 'workorder',
            id: rec_id,
            columns: ['quantity', 'trandate', 'item', 'tranid']
        })
        log.debug({
            title: 'workOrderObj',
            details: JSON.stringify(workOrderObj)
        })
        //"workorder",null,"anyof",wo_id);
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["status", "anyof", "PROGRESS", "NOTSTART"],
                    "AND",
                    ["workorder", "anyof", rec_id]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "name", label: "Operation Name" }),
                    search.createColumn({ name: "sequence", label: "Operation Sequence" }),
                    search.createColumn({ name: "workorder", label: "Work Order" }),
                    search.createColumn({
                        name: "item",
                        join: "workOrder",
                        label: "Item"
                    }),
                    /*search.createColumn({
                       name: "custbody_pct_cut_sheet_number",
                       join: "workOrder",
                       label: "Pct Cut Sheet Number"
                    }),*/
                    search.createColumn({
                        name: "quantity",
                        join: "workOrder",
                        label: "Quantity"
                    }),
                    search.createColumn({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" }),
                    search.createColumn({
                        name: "internalid",
                        join: "workOrder",
                        label: "Internal ID"
                    })
                ]
        });
        var i = 0;
        var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
        manufacturingoperationtaskSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results

            tran_id[i] = result.getValue('internalid');;
            opp_name[i] = result.getValue('name');
            seq[i] = result.getValue('sequence');
            mach[i] = result.getText('manufacturingworkcenter');
            wo_num[i] = result.getValue('workorder');
            // wo_id[i] = result.getValue({
            //     name: "internalid",
            //     join: "workOrder",
            //     label: "Internal ID"
            // });
            // log.debug("------", "Id : "+  wo_id[i])
            qty[i] = workOrderObj['quantity'];
            w_date[i] = workOrderObj['trandate'];
            w_item[i] = workOrderObj['item'][0].text;
            i++;
            return true;
        });


        var itemline = '';
        var l;
        var firstLine = '<table height="1.0in" width="4.0in" padding-top="0.3in" ><tr>' +
            '<td style="font-size:10pt" colspan="5"><strong>' + wo_num[0] + '</strong> </td>  <td style="font-size:10pt"  colspan="4"><strong>' + w_item[0] + '</strong></td><td style="font-size:11pt"  colspan="3"><strong>' + w_date[0] + '</strong></td></tr></table><pbr width="4in" height="1.2in" footer-height="0pt" padding="0in 0in 0in 0in"/>';
        itemline = itemline + firstLine;


        for (l = 0; l < workOrderObj['quantity']; l++) {
            let workOrderNo = workOrderObj['tranid'] + "-" + (l + 1);
            // var itritemline = '<table height="0.7in" width="4.0in" padding-top="-0.1in"><tr>' +
            //     '<td align="center" width = "1.0in" style="font-size:9pt"><barcode codetype="qrcode" showtext="true" width="1in" height="1in" value="' + workOrderNo + '"/> </td>' +
            //     '<td><table width="2.5in" padding-top="0.1in" padding-right=" 0.1in"><tr><td width="10%"></td><td  width="35%" style="font-size:7pt; border: 1 px #E8E8E8">' + w_item[l] + '</td><td width="5%"></td> <td width="25%" style="font-size:7pt; border: 1 px #E8E8E8">' + w_date[l] + '</td>' +
            //     '</tr><tr border ="1 px #E8E8E8"> <td colspan ="2" width="50%" style="font-size:9px">' + workOrderNo + ' </td><td width="50%" colspan ="2"  style="font-size:9px">| Total Qty: ' + qty[l] + ' </td></tr>' +
            //     '</table></td></tr></table>';

            // var itritemline = '<table height="0.7in" width="4.0in" padding-top="-0.1in"><tr>' +
            //     '<td align="center" width = "1.0in" style="font-size:9pt"><barcode codetype="qrcode" showtext="true" width="1in" height="1in" value="' + workOrderNo + '"/> </td>' +
            //     '<td><table style="background-color: aqua;" width="3in" padding-left="0.15in" padding-right="0.15in"><tr><th style="font-size:10pt;">Item</th><th style="font-size:10pt;">Date</th><th style="font-size:10pt;">Work Order</th><th style="font-size:10pt;">Total Quantity</th></tr><tr>' +
            //     '<td style="font-size:10pt;width:20%"><strong>' + w_item[l] + '</strong> </td>  <td style="font-size:10pt;width:40%;"><strong>' + w_date[l] + '</strong></td><td style="font-size:10pt;width:20%"><strong>' + workOrderNo + '</strong></td><td style="font-size:10pt;width:20%"><strong>' + qty[l] + '</strong></td></tr></table>' +
            //     '</td></tr>' +
            //     ' </table>';

            var itritemline = '<table height="0.7in" width="4.0in" padding-top="-0.1in">' +
                '    <tr>' +
                '        <td align="center" width="1.0in" style="font-size:9pt">' +
                '            <barcode codetype="qrcode" showtext="true" width="1in" height="1in" value="' + workOrderNo + '" />' +
                '        <p style="padding-top: -15 px">' + workOrderNo + '</p></td>' +
                '        <td>' +
                '            <table  padding-top="0.1in">' +
                '                <tr>' +
                '                    <th style="font-size:8pt;">Item</th>' +
                '                    <th style="font-size:8pt;">Date</th>' +
                '                    <th style="font-size:8pt;">Work Order</th>' +
                '                    <th style="font-size:8pt;">Total Qty</th>' +
                '                </tr>' +
                '                <tr> ' +
                '  <td style="font-size:7pt;width:10%;"><strong>' + w_item[l] + '</strong></td>' +
                '                    <td style="font-size:7pt;width:10%;"><strong>' + w_date[l] + '</strong></td>' +
                '                    <td style="font-size:7pt;width:40%"><strong>' + workOrderObj['tranid'] + '</strong></td>' +
                '                    <td style="font-size:7pt;width:10%"><strong>' + qty[l] + '</strong></td>' +
                '                </tr>' +
                '            </table>' +
                '        </td>' +
                '    </tr> ' +
                '</table>';


            itemline = itemline + itritemline;
        }
        // for (l = 0; l < searchResultCount; l++) {
        //     var itritemline = '<table height="0.7in" width="4.0in" padding-top="-0.1in"><tr>' +
        //         '<td align="center" width = "1.0in" style="font-size:9pt"><barcode codetype="qrcode" showtext="true" width="1in" height="1in" value="' + seq[l] + '/' + tran_id[l] + '"/> <p style="padding-Top: -20 px">' + seq[l] + '/' + tran_id[l] + '</p></td>' +
        //         '<td><table width="2.5in" padding-top="0.1in" padding-right=" 0.1in"><tr><td width="10%"></td><td  width="35%" style="font-size:7pt; border: 1 px #E8E8E8">' + w_item[l] + '</td><td width="5%"></td> <td width="25%" style="font-size:7pt; border: 1 px #E8E8E8">' + w_date[l] + '</td>' +
        //         '</tr><tr border ="1 px #E8E8E8"> <td colspan ="2" width="50%" style="font-size:9px">' + wo_num[l] + ' </td><td width="50%" colspan ="2"  style="font-size:9px">| Qty: ' + qty[l] + ' </td></tr>' +
        //         '<tr border ="1 px #E8E8E8"> <td colspan ="6" width="100%" style="font-size:9pt;">' + opp_name[l] + ' <br></br>'+mach[l]+ ' </td></tr></table></td></tr></table>';
        //     itemline = itemline + itritemline;
        // }

        strVar = strVar.replace('#item_line#', itemline);
        strVar = htmlizeAmps(strVar);
        strVar = trim(strVar);


        var a = render.create();
        var pdfFile = render.xmlToPdf({

            xmlString: strVar

        });



        pdfFile.name = workOrderObj['tranid'] + ' Traveler Ticket.pdf';

        pdfFile.folder = getFileId()//2172;

        var fileId = pdfFile.save();


        record.submitFields({
            type: 'workorder',
            id: rec_id,
            values: {
                custbody_pct_traveler_ticket: fileId,
            }

        })

        // nlapiLogExecution('DEBUG','Satish-Log','strVar= '+strVar);
        /* var fileData = nlapiXMLToPDF(strVar);
         var file_name = wo_num[0];
         file_name += '.pdf';
         var doc = nlapiCreateFile(file_name, 'PDF', fileData.getValue());
         doc.setFolder(644);
         var file_id = nlapiSubmitFile(doc);
         nlapiLogExecution('DEBUG', 'after submit', file_id);
         nlapiSubmitField('workorder', wo_id, 'custbody_pct_dv_traveler_ticket', file_id);*/
    }

    function getFileId() {
        var folderSearchObj = search.create({
            type: "folder",
            filters:
                [
                    ["name", "is", "PCT Traveler Ticket 2.1"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var id;
        var searchResultCount = folderSearchObj.runPaged().count;
        log.debug("folderSearchObj result count", searchResultCount);
        folderSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            id = result.getValue('internalid')
            // return true;
        });
        return id;
    }
    function find_null(value) {
        if (value == null) { value = '' }
        return value;
    }




    function htmlizeAmps(s) {
        var result = s.replace(/\x26/g, "&amp;");
        return result;
    }

    function trim(str) {
        return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));
    }
    function to_currency(num) {
        nlapiLogExecution('DEBUG', 'Satish-Log', 'num=' + num);
        var temp = num;

        var curr_sym = '$';
        temp = curr_sym + temp;
        return temp;

    }
    function currencyFormat(num) {
        return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    return {
        execute: execute
    }
});
