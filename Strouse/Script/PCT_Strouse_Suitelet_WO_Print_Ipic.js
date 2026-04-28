/**
 *              //////////     Strouse IPIC Pdf      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2023-03-21 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for Strouse Ipic Pdf, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to generate Strouse Ipic Suitelet Pdf      
 */

define(['N/file', 'N/log', 'N/record', "N/search", "N/runtime", "N/render"],
    function (file, log, record, search, runtime, render) {
        function onRequest(context) {
            log.debug({ title: 'PCT-Strouse', details: "In Suitelet" });
            //  log.debug({ title: 'PCT-Strouse-Response', details: context.response });
            //  log.debug({ title: 'PCT-Strouse-Request', details: context.request });
            //  log.debug({ title: 'PCT-Strouse-Form', details: context.form });
            var pageNo = 0;
            if (context.request.method === 'GET') {
                var id = context.request.parameters.recordId;
                log.debug({ title: 'PCT-Strouse', details: "Record Id " + id });

                var workOrderLoad = record.load({
                    type: 'workorder',
                    id: id
                });
                // ------------- Get Work Order Details -----------------
                let workOrderNumber = workOrderLoad.getValue({ fieldId: 'tranid' });
                let customerName = workOrderLoad.getText({ fieldId: 'entity' });
                let itemInternalId = workOrderLoad.getValue({ fieldId: 'assemblyitem' });
                // let itemName = workOrderLoad.getValue({ fieldId: 'displayname' });
                var itemFieldLookUp = search.lookupFields({
                    type: 'lotnumberedassemblyitem',
                    id: workOrderLoad.getValue({ fieldId: 'assemblyitem' }),
                    columns: ['itemid', 'displayname']
                });
                let itemId = itemFieldLookUp.itemid;
                let itemName = itemFieldLookUp.displayname;
                let itemDesc = workOrderLoad.getText({ fieldId: 'custbody_atlas_assy_desc' });
                let comments = workOrderLoad.getText({ fieldId: 'custbody_pct_sc_drawing_comments' });
                let sampleFreq = workOrderLoad.getText({ fieldId: 'custbody_pct_sc_sample_freq' });
                let measuringMethod = workOrderLoad.getText({ fieldId: 'custbody_pct_sc_pref_measuring_method' });
                let fanFolder = workOrderLoad.getText({ fieldId: 'custbody_pct_sc_fan_folder' });

                // ------------- Get Work Order Details -----------------
                let drawingSpecificationsCount = workOrderLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_sc_link_trans' });
                log.debug({ title: 'PCT', details: "Strouse Drawing Specifications Count " + drawingSpecificationsCount });

                var myvar = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
                    '<pdf>' +
                    '<head>' +
                    '   <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' +
                    '<macrolist>' +
                    '<macro id="nlheader">' +
                    '</macro>' +
                    '</macrolist>' +
                    '<style>' +
                    'hr{width: 100%;}' +
                    '' +
                    '' +
                    '        .partRepeat {' +
                    '            width: 30px;' +
                    '            height: 30px;' +
                    '            border: 1px solid black;' +
                    // '            display: inline-block;' +
                    '        }' +
                    '' +
                    '        .maxTaxMin {' +
                    '            width: 200px;' +
                    '            border: 1px solid black;' +
                    '            text-align: center;' +
                    '        }' +
                    '' +
                    '        .maxTaxMinBox {' +
                    '            width: 30px;' +
                    // '            height: auto;' +
                    '            border: 1px solid black;' +
                    '        }' +
                    '' +
                    '    </style>    </head>';
                let valueObj = {};
                for (let drawingSpecificationsIndex = 0; drawingSpecificationsIndex < drawingSpecificationsCount; drawingSpecificationsIndex++) {
                    let step = workOrderLoad.getSublistText({
                        sublistId: 'recmachcustrecord_pct_sc_link_trans',
                        fieldId: 'custrecord_pct_sc_step',
                        line: drawingSpecificationsIndex
                    });
                    // '    <!-- ----------------------------------------------- Create Object for Value Start --------------------------------------------------------->' +
                    if (!(step in valueObj)) {
                        valueObj[step] = {};
                        valueObj[step]['workOrderNumber'] = workOrderNumber;
                        valueObj[step]['itemId'] = itemId;
                        valueObj[step]['itemName'] = itemName;
                        valueObj[step]['itemInternalId'] = itemInternalId;
                        valueObj[step]['itemDesc'] = itemDesc;
                        valueObj[step]['comments'] = comments;
                        valueObj[step]['sampleFreq'] = sampleFreq;
                        valueObj[step]['measuringMethod'] = measuringMethod;
                        valueObj[step]['fanFolder'] = fanFolder;
                        valueObj[step]['drawingSpecifications'] = [];

                        let drawingSpecifications = {};
                        drawingSpecifications['step'] = step;
                        drawingSpecifications['sequence'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_sequence',
                            line: drawingSpecificationsIndex
                        });
                        drawingSpecifications['parameter'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_parameter',
                            line: drawingSpecificationsIndex
                        });
                        drawingSpecifications['scTarget'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_target',
                            line: drawingSpecificationsIndex
                        });
                        valueObj[step]['drawingSpecifications'].push(drawingSpecifications);
                    } else {
                        let drawingSpecifications = {};
                        drawingSpecifications['step'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_step',
                            line: drawingSpecificationsIndex
                        });
                        drawingSpecifications['sequence'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_sequence',
                            line: drawingSpecificationsIndex
                        });
                        drawingSpecifications['parameter'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_parameter',
                            line: drawingSpecificationsIndex
                        });
                        drawingSpecifications['scTarget'] = workOrderLoad.getSublistText({
                            sublistId: 'recmachcustrecord_pct_sc_link_trans',
                            fieldId: 'custrecord_pct_sc_target',
                            line: drawingSpecificationsIndex
                        });
                        valueObj[step]['drawingSpecifications'].push(drawingSpecifications);
                    }
                    // '    <!-- ----------------------------------------------- Create Object for Value End --------------------------------------------------------->' +
                }
                log.debug("PCT", "Obj : " + JSON.stringify(valueObj))
                for (var key in valueObj) {
                    pageNo++;

                    myvar += '<body header="nlheader" header-height="0%"  footer="nlfooter" footer-height="0pt"  padding="0.2in 0.2in 0.2in 0.2in" size="A4-Landscape">' +
                        '<hr></hr>' +
                        // '    <!-- ----------------------------------------------- Header Part Start --------------------------------------------------------->' +
                        '    <div>' +
                        '        <table style="width:100%">' +
                        '            <tr>' +
                        '                <td width="45%">' +
                        '                    <table style="width: 100%">' +
                        '                        <tr>' +
                        `                            <td colspan="4">In-Process Inspection Sheet for : <b>${customerName}</b></td>` +
                        '                        </tr>' +
                        '                        <tr>' +
                        '                            <td colspan="12">Complete form after set up then request sign off. Return with' +
                        '                                Work' +
                        '                                Order.</td>' +
                        '                        </tr>' +
                        '                        <tr>' +
                        `                            <td>Product : <b>${valueObj[key].itemName}</b></td>` +
                        '                        </tr>' +
                        '                        <tr>' +
                        `                            <td style=" text-decoration: underline;">Part Number : <b>${valueObj[key].itemId}</b></td>` +
                        '                        </tr>' +
                        '                    </table>' +
                        '                </td>' +
                        '                <td width="35%">' +
                        '                    <table style="width: 100%">' +
                        '                        <tr><td></td>' +
                        '                        </tr>' +
                        '                        <tr>' +
                        `                            <td style="font-size: 30px; margin-top: 30px; margin-left: 30px; "><b>${workOrderLoad.getValue({ fieldId: 'custbody_pct_sc_obsolete_field' })}</b></td>` +
                        '                        </tr>' +
                        '                    </table>' +
                        '                </td>' +
                        '                <td width="20%">' +
                        '                    <table style="width: 100%">' +
                        '                        <tr>' +
                        `                            <td>Work Order : <b>${valueObj[key].workOrderNumber}</b></td>` +
                        '                        </tr>' +
                        '                        <tr>' +
                        `                            <td>Job Ticket : <b>${valueObj[key].itemInternalId}</b></td>` +
                        '                        </tr>' +
                        '                    </table>' +
                        '                </td>' +
                        '            </tr>' +
                        '        </table>' +
                        '    </div>' +
                        // '    <!-- ----------------------------------------------- Header Part End ---------------------------------------------------------->' +
                        // '    <!-- ------------------------------------------ Comments Sampling Part Start --------------------------------------------------------->' +

                        '        <table width="100%">' +
                        '            <tr>' +
                        // `                <td width="307px" style="border:1px solid black">Comments : ${valueObj[key].comments}</td>` +
                        // `<td> <table width="100%" style="padding:5px"><tr><td><span><b>Preferred Measuring Device:</b> ${valueObj[key].measuringMethod}</span><br/><span><b>Frequency :</b> ${valueObj[key].sampleFreq}</span><br/><span><b>Inspection Notes:</b> ${valueObj[key].fanFolder}  </span></td></tr></table><table width="100%"><tr><td width="128px" style="inline-block; border: 1px solid black;">Sampling Number</td>`;
                        `                <td width="304px" style="border:1px solid black; border-bottom:none">Comments : ${valueObj[key].comments}</td>` +
                        `<td> <table width="100%" style="padding-left:5px; padding-top:5px;" ><tr><td><span><b>Preferred Measuring Device:</b> ${valueObj[key].measuringMethod}</span><br/><span><b>Frequency :</b> ${valueObj[key].sampleFreq}</span><br/></td></tr></table><table style="padding-right:-2.2px" width="100%"><tr><td width="126.8px" style="inline-block; border: 1px solid black;">Sampling Number</td>`;
                    for (let tdIndex = 0; tdIndex < 19; tdIndex++) {
                        myvar += `<td class="partRepeat"></td>`;
                    }
                    myvar += `</tr ></table ></td >`;
                    myvar += '          </tr></table>';

                    // '    <!-- ------------------------------------------ Comments Sampling Part End --------------------------------------------------------->' +
                    let finalData = JSON.parse(JSON.stringify(valueObj[key].drawingSpecifications));
                    finalData.map(element => {

                        //  '    <!-- ------------------------------------------ Part Table Start --------------------------------------------------------->' +

                        myvar += '        <table style="width: 100%;">' +
                            '            <tr>' +
                            `                <td width="240px" style="border:1px solid black; border-right: none;"><div><p style="padding-top:-10px; padding-bottom:-10px">${element.parameter}</p><hr width="240px" style="margin-left:-3px; "/><p style="padding-top:-10px; padding-bottom:-10px">Step : ${element.step}<br/>Sequence : ${element.sequence}</p></div></td>` +
                            `                <td width="130px" style="border:1px solid black" valign="middle">${element.scTarget.split('\n').join('<br/>')}</td>`;
                        for (let tdIndex = 0; tdIndex < 19; tdIndex++) {
                            myvar += `<td width="30px" style="border:1px solid black"></td>`;
                        }
                        // '<td ><table style="margin-left: -5px; margin-top: -5px; margin-bottom: -5px;">' +
                        // '            <tr>';

                        // for (let tdIndex = 0; tdIndex < 19; tdIndex++) {
                        //     myvar += `<td class="maxTaxMinBox"></td>`;
                        // }
                        // myvar += '                  </tr></table></td>';
                        myvar += '                  </tr>' +
                            '        </table>';
                    })
                    // '    <!-- ------------------------------------------ Part Table End --------------------------------------------------------->' +
                    myvar += '    <hr style="margin-bottom: 30px"/>' +
                        // '    <!-- ------------------------------------------ Upper Footer Part Start --------------------------------------------------------->' +

                        '        <table style="width:100%">' +
                        '            <tr>' +
                        '                <td style="display: inline-block; margin-top: -10px">' +
                        '                    APPROVED : ' +
                        '                </td>' +
                        '                <td width="25%">' +
                        '                    <hr/>' +
                        '                </td>' +
                        '                <td width="20%">' +
                        '                    <hr/>' +
                        '                </td>' +
                        '                <td style="display: inline-block;  margin-top: -10px">' +
                        '                    DATE : ' +
                        '                </td>' +
                        '                <td width="15%">' +
                        '                    <hr/>' +
                        '                </td>' +
                        '                <td width="25%">' +
                        '                    <hr/>' +
                        '                </td>' +
                        '            </tr>' +
                        '            <tr  style="padding-top:-20px;">' +
                        '                <td style="display: inline-block;">' +
                        '                </td>' +
                        '                <td style="display: inline-block; padding-top:10px;" width="20%"><p align="center">' +
                        '                    Press Operator' +
                        '                </p></td>' +
                        '                <td style="display: inline-block; padding-top:10px;" width="20%"><p align="center">' +
                        '                    Authorized Personnel' +
                        '                </p></td>' +
                        '                <td style="display: inline-block;"></td>' +
                        '                <td style="display: inline-block;" width="15%"></td>' +
                        '                <td style="display: inline-block; padding-top:10px;" width="25%"><p align="center">Measurement Devices(s) Used</p></td>' +
                        '            </tr>' +
                        '' +
                        '        </table>' +

                        //  '    <!-- ------------------------------------------ Upper Footer Part End --------------------------------------------------------->' +
                        // '    <!-- ------------------------------------------ Footer Part Start --------------------------------------------------------->' +
                        '    <div>' +
                        '        <table style="width:100%">' +
                        '            <tr>' +
                        '                <td>' +
                        '                    <table style="width: 100%">' +
                        '                        <tr>' +
                        '                            <td colspan="4">3M Medical Solutions Division - Hose Card, Standard/Hose Card</td>' +
                        '                        </tr>' +
                        '                    </table>' +
                        '                </td>' +
                        '                <td>' +
                        '                    <table style="width: 100%">' +
                        '                        <tr>' +
                        '                            <td colspan="4">In-Process Inspection Sheet ' + getCurrentDate() + '  Page No ' + pageNo + '</td>' +
                        '                        </tr>' +
                        '                    </table>' +
                        '                </td>' +
                        '            </tr>' +
                        '        </table>' +
                        '    </div>' +
                        // // '    <!-- ------------------------------------------ Footer Part End --------------------------------------------------------->' +
                        '    <hr/></body>';

                }

                myvar += '</pdf>';
                myvar = space(myvar);
                myvar = addspace(myvar);
                myvar = htmlizeAmps(myvar);
                myvar = trim(myvar);
                myvar = myvar.replace('&lt;', '<');
                myvar = myvar.replace('&gt;', '>');
                context.response.renderPdf(myvar);
                log.debug({ title: 'PCT-Strouse-Response', details: context.response });

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

        const getCurrentDate = () => {
            var current_date = new Date();
            var dd = current_date.getDate();
            var mm = current_date.getMonth() + 1;
            var yyyy = current_date.getFullYear();
            var currentDate = mm + "/" + dd + "/" + yyyy;
            log.debug({
                title: 'PCT-Strouse',
                details: 'Current Date : ' + currentDate
            })

            return currentDate;
        }
        return {
            onRequest: onRequest,
        };
    });
