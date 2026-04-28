/*********************************************************************************************************
Developer: REHAN NAWAZ
Development Head: RATWIKA
Company Name: PCT
Project : mott
Purpose: To print QUALITY ALERT form in pdf format
1> Create PREVIEW Button through script
2> After click on PREVIEW button, a new tab will open.
3> In the new tab you will see product details and it's quality alert details in pdf format. 

© Copyright All Right

**********************************************************************************************************/
function qualityAlertSuiteScript(request, response)
{
    var currentDate = sysDate(); // returns the date
    var currentTime = formatAMPM(new Date); // returns the time stamp in HH:MM:SS
    var currentDateAndTime = currentDate + ' ' + currentTime;
    nlapiLogExecution('DEBUG', 'User Event Script', currentDateAndTime);

    var recId = request.getParameter('id');
    var rec_load = nlapiLoadRecord('customrecord_pct_mott_qa_form', recId);
    var issued_to = rec_load.getFieldValue('custrecord_pct_mott_qlty_issuedto_field');
    var alert_no = rec_load.getFieldValue('name');
    var referance = rec_load.getFieldValue('custrecord_pct_mott_qlty_reference');
    var qty = rec_load.getFieldValue('custrecord_pct_mott_qlty_qty');
    var job = rec_load.getFieldValue('custrecord_pct_mott_qlty_job');
    var value_stream = rec_load.getFieldText('custrecord_pct_mott_qlty_value_stream');
    nlapiLogExecution('DEBUG', 'Amal-log', 'value_stream=' + value_stream);
    /*var n = value_stream.indexOf('-');
  var result = value_stream.substring(n + 1);
    nlapiLogExecution('DEBUG','Amal-log','result='+result);*/
    var case_ = rec_load.getFieldValue('custrecord_pct_mott_qlty_case');
    var customer = rec_load.getFieldValue('custrecord_pct_mott_qlty_customer');
    var item = rec_load.getFieldValue('	custrecord_pct_mott_qlty_item');
    // var alert_no = rec_load.getFieldValue('custrecord_pct_mott_qlty_alert_no');
    var issue_date = rec_load.getFieldValue('custrecord_pct_mott_qlty_issue_date');
    var removal_date = rec_load.getFieldValue('custrecord_pct_mott_qlty_removal_date');
    var alert_details = rec_load.getFieldValue('custrecord_pct_mott_qlty_alert_detail');
    var pic1 = rec_load.getFieldValue('custrecord_pct_mott_qlty_picture1_link');
    var pic2 = rec_load.getFieldValue('custrecord_pct_mott_qlty_picture2_link');
    var line_count = rec_load.getLineItemCount('recmachcustrecord_pct_mott_section_link');
    var type = rec_load.getFieldText('custrecord_pct_mott_qlty_type_list');

    var item = new Array();
    var who = new Array();
    var what = new Array();
    var when = new Array();
    for (var i = 1; i <= line_count; i++)
    {
        item[i] = rec_load.getLineItemText('recmachcustrecord_pct_mott_section_link', 'custrecord_pct_mott_qlty_sec_item', i);
        who[i] = rec_load.getLineItemValue('recmachcustrecord_pct_mott_section_link', 'custrecord_pct_mott_qlty_sec_who', i);
        what[i] = rec_load.getLineItemValue('recmachcustrecord_pct_mott_section_link', '	custrecord_pct_mott_qlty_sec_what', i);
        when[i] = rec_load.getLineItemValue('recmachcustrecord_pct_mott_section_link', '	custrecord_pct_mott_qlty_sec_when', i);
    }



    var myvar = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
        '<pdf>' +
        '<head>' +
        '	<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' +
        '	' +
        '    <macrolist>' +
        '           <macro id="nlheader">' +
        '        </macro>' +
        '        <macro id="nlfooter">' +
        '            <table style="width: 100%; font-size: 8pt;"><tr>' +
        '	<td style="padding: 0;"><i>Printed: ' + currentDateAndTime + '</i></td>' +
        '	<td align="right" style="padding: 0;"><pagenumber/> of <totalpages/></td>' +
        '	</tr></table>' +
        '        </macro>' +
        '    </macrolist>' +
        '    <style type="text/css">* {' +
        '		' +
        '		}' +
        '		table {' +
        '			font-size: 9pt;' +
        '			table-layout: fixed;' +
        '		}' +
        '        th {' +
        '            font-weight: bold;' +
        '            font-size: 8pt;' +
        '            vertical-align: middle;' +
        '            padding: 5px 6px 3px;' +
        '            background-color: #e3e3e3;' +
        '            color: #333333;' +
        '        }' +
        '        td {' +
        '            padding: 5px 7px;' +
        '        }' +
        '		td p { align:left }' +
        '</style>' +
        '</head>' +
        '<body header="nlheader" header-height="0" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">' +
        ' ' +
        '  <table border="1" width="100%" >' +
        '    <tr>' +
        '      <td border-right="1" >' +
        '        <table width="100%">' +
        '          <tr >' +
        '            <td><img src="https://tstdrv1795129.app.netsuite.com/core/media/media.nl?id=10468&c=TSTDRV1795129&h=4c9c24a1e5fa1b5a96ed" width="300px" height="60px"/>' +
        '            </td>' +
        '          </tr>' +
        '        </table></td><td>' +
        '        <table width="100%">' +
        '          <tr>' +
        '            <td align="right" style="font-size:9pt;"><i>Alert No:</i>' +
        '            </td>' +
        '            <td style="font-size:9pt;">' + find_null(alert_no) + '' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td align="right" style="font-size:9pt;"><i>Issue Date:</i>' +
        '            </td>' +
        '            <td style="font-size:9pt;">' + find_null(issue_date) + '' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td align="right" style="font-size:9pt;">Removal Date:' +
        '            </td>' +
        '            <td style="font-size:9pt;">' + find_null(removal_date) + '' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td align="right" style="font-size:9pt;"><i>Type:</i>' +
        '            </td>' +
        '            <td style="font-size:9pt;">' + find_null(type) + '' +
        '            </td>' +
        '          </tr>' +
        '        </table>' +
        '      </td>' +
        '    </tr>' +
        '  </table>' +
        '  ' +
        '  <table width="100%">' +
        '  <tr width="300px" height="60px"><td align="center" style="font-size: 20pt; solid #FF0101; padding: 10px 0px -10px 0px; color: #FF0101; font-weight: bold;">Quality Alert</td></tr>' +
        '  </table>' +
        '  ' +
        '  ' +
        '' +
        '' +
        '  ' +
        '  <table border="1" style="width:100%;">' +
        '    <tr height="25">' +
        '      <td align="left" style="border-right:0px solid #000000; border-bottom:0px solid #000000;font-size:10pt;" colspan="2"><i>Issued To: </i></td>' +
        '      <td align="left" style="border-right:0px solid #000000; border-bottom:0px solid #000000;font-size:10pt;" colspan="3">' + find_null(issued_to) + '</td>' +
        '      <td align="left" style="border-right:0px solid #000000; border-bottom:0px solid #000000;font-size:10pt;" colspan="2"><i>Value Stream: </i></td>' +
        '      <td align="left" style="border-right:0px solid #000000; border-bottom:0px solid #000000;font-size:10pt;" colspan="5">' + find_null(value_stream) + '</td>' +
        '      ' +
        '    </tr>' +
        '    <tr height="25"><td align="left" style="border-right:0px solid #000000; border-bottom:1px solid #000000;font-size:10pt;" colspan="2"><i>Referance: </i></td>' +
        '      <td align="left" style="border-right:0px solid #000000; border-bottom:1px solid #000000;" colspan="10">' + find_null(referance) + '</td>' +
        '    </tr>' +
        '    <tr><td style="border-right:0px solid #000000; border-bottom:0px solid #000000;font-size:10pt;" colspan="12" height="50">' + find_null(alert_details) + '</td>' +
        '    </tr>' +
        '  </table>' +
        '  ' +
        '  <table style="width:100%;">' +
        '<tr>';
    if (pic1 != null && pic1 != '' || pic1 != undefined)
    {
        myvar += '<td colspan="6" style="border-right:0px solid #000000;"> <img src="' + pic1 + '" width="175px" height="160px"/></td>';
    }
    else
    {
        myvar += '<td colspan="6" style="border-right:0px solid #000000;"> </td>';
    }
    if (pic2 != null && pic2 != '' || pic2 != undefined)
    {
        myvar += '<td colspan="6" style="border-right:0px solid #000000;"> <img src="' + pic2 + '" width="175px" height="160px"/></td>';
    }
    else
    {
        myvar += '<td colspan="6" style="border-right:0px solid #000000;"> </td>';
    }


    myvar += '            ' +
        '    </tr></table>' +
        '' +
        '  ' +
        ' ' +
        '  ' +
        '  <table width="100%" padding-top="30pt">' +
        '    <tr>' +
        '      <td style="border-bottom:1px solid #000000;font-size:10pt;" colspan="3" ><i>Action</i></td>' +
        '      <td style="border-bottom:1px solid #000000;font-size:10pt;" colspan="3" ><i>Who</i></td>' +
        '      <td style="border-bottom:1px solid #000000;font-size:10pt;" colspan="4" ><i>What</i></td>' +
        '      <td style="border-bottom:1px solid #000000;font-size:10pt;" colspan="3" ><i>When</i></td>' +
        '    </tr>';
    for (var i = 1; i <= line_count; i++)
    {
        myvar += '     <tr height="30" >' +
            '      <td style="border-right:1px solid #000000; border-left:1px solid #000000; border-bottom:1px solid #000000;" colspan="3">' + find_null(rec_load.getLineItemValue('recmachcustrecord_pct_mott_section_link', 'custrecord_pct_mott_qlty_sec_item', i)) + '</td>' +
            '     <td style="border-right:1px solid #000000; border-left:0px solid #000000; border-bottom:1px solid #000000;" colspan="3">' + find_null(rec_load.getLineItemText('recmachcustrecord_pct_mott_section_link', 'custrecord_pct_mott_qlty_sec_who', i)) + '</td>' +
            '     <td style="border-right:1px solid #000000; border-left:0px solid #000000; border-bottom:1px solid #000000;" colspan="4">' + find_null(rec_load.getLineItemValue('recmachcustrecord_pct_mott_section_link', 'custrecord_pct_mott_qlty_sec_what', i)) + '</td>' +
            '     <td style="border-right:1px solid #000000; border-left:0px solid #000000; border-bottom:1px solid #000000;" colspan="3">' + find_null(rec_load.getLineItemValue('recmachcustrecord_pct_mott_section_link', 'custrecord_pct_mott_qlty_sec_when', i)) + '</td>' +
            '    </tr>';

    }
    myvar += '  </table>' +
        '  ' +
        '  ' +
        '    ' +
        '  ' +
        '  ' +
        '</body>' +
        '</pdf>';

    myvar = htmlizeAmps(myvar);
    myvar = trim(myvar);
    myvar = myvar.replace('&lt;', '<');
    myvar = myvar.replace('&gt;', '>');
    nlapiLogExecution('DEBUG', 'rehan-log', '5.myvar=' + myvar);
    var file = nlapiXMLToPDF(myvar);
    response.setContentType('PDF', 'ZVSFDVA.pdf', 'inline');
    response.write(file.getValue());

    function htmlizeAmps(s)
    {
        var result = s.replace(/\x26/g, "&amp;");
        return result;
    }

    function trim(str)
    {
        return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));
    }



    function find_null(value)
    {
        if (value == null) { value = '' }
        return value;
    }

    function sysDate()
    {
        var date = new Date();
        date.setHours(date.getHours() + 16);
        var tdate = date.getDate();
        var mm = date.getMonth() + 1; // jan = 0
        var month;
        if (mm == 1)
            month = '1';
        else if (mm == 2)
            month = '2';
        else if (mm == 3)
            month = '3';
        else if (mm == 4)
            month = '4';
        else if (mm == 5)
            month = '5';
        else if (mm == 6)
            month = '6';
        else if (mm == 7)
            month = '7';
        else if (mm == 8)
            month = '8';
        else if (mm == 9)
            month = '9';
        else if (mm == 10)
            month = '10';
        else if (mm == 11)
            month = '11 ';
        else if (mm == 12)
            month = '12';

        var year = date.getFullYear();
        return currentDate = month + '/' + tdate + '/' + year;
    }

    function formatAMPM(date)
    {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }



}