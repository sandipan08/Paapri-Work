/**
*@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record', 'N/file',],
    function (serverWidget, xml, log, render, record, file)
    {
        function onRequest(context)
        {
            log.debug({ title: 'PCT-Mott', details: "In Suitelet" });
            if (context.request.method === 'GET')
            {
                {

                    var id = context.request.parameters.recordId;
                    log.debug({ title: 'PCT-Mott', details: "Record Id " + id });
                    var waveRecord = record.load({ type: 'wave', id: id })
                    // Load Login HTML Template
                    var templateFile = file.load({ id: 5956302 });
                    var templateContent = templateFile.getContents();

                    var current_date = new Date();
                    var dd = current_date.getDate();
                    var mm = current_date.getMonth() + 1;
                    var yyyy = current_date.getFullYear();
                    var date = mm + "/" + dd + "/" + yyyy;

                    // var assignedPicker = 
                    // var CustomerName = 
                    // var CustomerPo = 
                    // var shipComplete =

                    // var caseData = s.lookupFields({
                    //     type: s.Type.SUPPORT_CASE,
                    //     id: caseId,
                    //     columns: ["casenumber", "createddate", "enddate", "email"]
                    // });

                    // var address =
                    // var town =
                    // var state =
                    // var zipCode =
                    // var country =

                    // var pickTask = 
                    // var item =
                    // var displayCode = 
                    // var lineNo = 
                    // var pickQty =
                    // var units =
                    // var binQty =
                    // var shippingMethod = 
                    // var freightTerms =
                    // var freightAccountNumber = 
                    // var expectedShipDate =
                    // var certReq = 


                    var tableReplace = '';

                    tableReplace += '<table style="width: 100%; font-size: 10pt;"><tr>' +
                        '                        <td rowspan="3" style="padding: 0; vertical-align:top;"><img src="http://4946548-sb1.shop.netsuite.com/core/media/media.nl?id=5593&c=4946548_SB1&h=ruVtsPs4fT6_JSNMhSvJB37wSBQzUQAR82hupj45oFYhaT6w" alt="mottImage" style="float: left; margin: 7px; display: block; height: 50px; width:200px;" /> </td>' +
                        '                        <td align="center" rowspan="3" style="padding: 0; font-size: 20pt; vertical-align:top;"><b>Pick Ticket</b></td>' +
                        '                        <td align="right" rowspan="3" style="padding: 0; vertical-align:top;"><b>Created : ' + date + ' </b></td>' +
                        '                    </tr></table >';


                    tableReplace += '<table class="tableStyleGeneral" style="width:100%;"><tr>' +
                        '	<td style="align: right; font-size:13pt"><b>Assigned Picker: Test01</b><br /> </td>' +
                        '	</tr>' +
                        '	<tr>' +
                        '	<td style="align: right; font-size:13pt"><b>Customer Name : Test02</b><br /> </td>' +
                        '	</tr>	' +
                        '	<tr>' +
                        '	<td style="align: right; font-size:13pt"><b>Customer PO# : Test03</b><br /> </td>' +
                        '	</tr>	' +
                        '	<tr>' +
                        '	<td style="align: right; font-size:13pt"><b>Ship Complete : Test04</b><br /> </td>' +
                        '	</tr>	' +
                        '</table>';


                    tableReplace +=
                        '<table class="tableStyleSpecific" style="border: 1px solid black; width:33%" align="right"><tr>' +
                        '		<td style="align: right; width: 25%">Address :</td>' +
                        '		<td style="align: right; width: 75%">Ship Address</td>' +
                        '		</tr>' +
                        '		<tr>' +
                        '		<td style="align: right">Town : </td>' +
                        '		<td style="align: right">Town</td>' +
                        '		</tr>' +
                        '		<tr>' +
                        '		<td style="align: right">State :</td>' +
                        '		<td style="align: right">State</td>' +
                        '		</tr>' +
                        '		<tr>' +
                        '		<td style="align: right">Zip Code :</td>' +
                        '		<td style="align: right">zip code</td>' +
                        '		</tr>' +
                        '		<tr>' +
                        '		<td style="align: right">Country :</td>' +
                        '		<td style="align: right">country</td>' +
                        '		</tr></table>';


                    tableReplace += '<table class="tableStyleSpecific" style="width: 100%;">' +
                        '<thead>' +
                        '	<tr>' +
                        '	<th class="thStyleOrderItem" style="width:8%">Pick Task </th>' +
                        '	<th class="thStyleOrderItem" style="width:14%">Item</th>' +
                        '	<th class="thStyleOrderItem" style="width:10%">Display Code</th>' +
                        '	<th class="thStyleOrderItem" style="width:5%">Line #</th>' +
                        '	<th class="thStyleOrderItem" style="width:5%">Pick Qty</th>' +
                        '	<th class="thStyleOrderItem" style="width:5%">Units</th>' +
                        '	<th class="thStyleOrderItem" style="width:14%">Bin (Qty)</th>' +
                        '	<th class="thStyleOrderItem" style="width:6%">Shipping Method</th>' +
                        '	<th class="thStyleOrderItem" style="width:7%">Freight Terms</th>' +
                        '	<th class="thStyleOrderItem" style="width:7%">Freight Account Number</th>' +
                        '	<th class="thStyleOrderItem" style="width:7%">Expected Ship Date</th>' +
                        '    <th class="thStyleOrderItem" style="width:6%">Cert Req</th>' +
                        '	</tr>' +
                        '</thead>';



                    tableReplace +=
                        '<tbody><tr>' +
                        '<td align="center" class="tdStyle" line-height="100%" style="width:8%; padding: 20px 2px 20px 2px;" vertical-align="middle">Test10</td>' +
                        '<td align="center" class="tdStyle" line-height="100%" style="width:14%" vertical-align="middle">Test9</td>' +
                        '	<td align="center" class="tdStyle" line-height="100%" style="width:10%" vertical-align="middle">Test8</td>' +
                        '	<td align="center" class="tdStyle" line-height="100%" style="width:5%" vertical-align="middle">Test7</td>' +
                        '	<td align="center" class="tdStyle" line-height="100%" style="width:5%" vertical-align="middle">Test7</td>' +
                        '	<td align="center" class="tdStyle" line-height="100%" style="width:5%" vertical-align="middle">Test6</td>' +
                        '	<td align="center" class="tdStyle" line-height="100%" style="width:14%" vertical-align="middle">Test5</td>' +
                        '	<td align="center" class="tdStyle" line-height="100%" style="width:6%" vertical-align="middle">Test4</td>' +
                        '		<td align="center" class="tdStyle" line-height="100%" style="width:7%" vertical-align="middle">Test3</td>' +
                        '			<td align="center" class="tdStyle" line-height="100%" style="width:7%" vertical-align="middle">Test2</td>' +
                        '					<td align="center" class="tdStyle" line-height="100%" style="width:7%" vertical-align="middle">Test1</td>' +
                        '  	<td align="center" class="tdStyle" line-height="100%" style="width:6%" vertical-align="middle">Test0</td>' +
                        '	</tr>' +
                        '   </tbody></table>';




                    // Replacing in rendered Login Page

                    tableReplace = htmlizeAmps(tableReplace);
                    var renderedPage = templateContent.replace('#TABLEREPLACE-CONTENTS#', tableReplace);
                    context.response.renderPdf(renderedPage);

                }
            }
        }
        // --------------------------- All Custom Function ---------------------------
        function space(s)
        {

            var result = s.replace(/&nbsp;/g, " ");

            return result;

        }

        function addspace(b)
        {

            var result = b.replace('</br>', '&nbsp;');

            return result;

        }



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

            if (value == null)
            {

                value = ''

            }

            return value;

        }

        return {
            onRequest: onRequest,
        };
    });


