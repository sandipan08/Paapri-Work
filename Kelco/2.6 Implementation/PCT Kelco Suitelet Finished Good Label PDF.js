/**
 *@NApiVersion 2.1
 *@NScriptType  Suitelet
 */
define(['N/runtime', 'N/file', 'N/search', 'N/render', 'N/record'], function (runtime, file, search, render, record) {

    function onRequest(context) {
        log.debug({ title: 'PCT-Kelo', details: "In Suitelet" });
        if (context.request.method === 'GET') {
            let workOrderId = context.request.parameters.recordId;
            log.debug({ title: 'PCT-Strouse', details: "Record Id " + workOrderId });

            var workOrderLoad = record.load({
                type: 'workorder',
                id: workOrderId
            });
            // ------------- Get Work Order Details -----------------
            let workOrderNumber = workOrderLoad.getValue({ fieldId: 'tranid' });
            let quantity = workOrderLoad.getValue({ fieldId: 'quantity' });
            let manufacturingDate = workOrderLoad.getText({ fieldId: 'trandate' });
            var itemFieldLookUp = search.lookupFields({
                type: 'lotnumberedassemblyitem',
                id: workOrderLoad.getValue({ fieldId: 'assemblyitem' }),
                columns: ['custitem_pct_kelco_old_part_number', 'description', 'weight']
            });
            let legacyPartNumber = itemFieldLookUp.custitem_pct_kelco_old_part_number;
            let customerPartNumber = itemFieldLookUp.description;
            let itemWeight = itemFieldLookUp.weight;
            log.debug({ title: 'PCT-Strouse', details: "itemWeight : " + itemWeight });
            log.debug({ title: 'PCT-Strouse', details: "quantity : " + quantity });
            let totalWeight = (parseFloat(itemFieldLookUp.weight) * parseInt(quantity)).toFixed(3)

            log.debug({ title: 'PCT-Strouse', details: "totalWeight : " + totalWeight });
            let componentArray = [];
            for (woIndex = 0; woIndex < workOrderLoad.getLineCount({ sublistId: 'item' }); woIndex++) {

                componentArray.push(getComponentName(workOrderLoad.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: woIndex
                })))
            }
            var myvar = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' +
                '<pdf>' +
                '<head>' +
                '   <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' +
                '<macrolist>' +
                '<macro id="nlheader">' +
                '</macro>' +
                '</macrolist>' +
                '<style>' +
                '.fieldHeader {' +
                '			font-size: 9pt;' +
                '		}' +
                '.fieldValue {' +
                '			font-size: 20pt;' +
                '			 font-weight: bold;' +
                '		}' +
                `.tab-top { transform-origin: 100% 0%; transform: rotate(270deg);  top: 5px; /*Border Size*/ right: 5px; /*Border Size*/ }` +

                '    </style>    </head>';

            myvar += '<body header="nlheader" header-height="0%"  footer="nlfooter" footer-height="0pt"  padding="0.2in 0.2in 0.2in 0.2in" width="4.5in" height="6in">' +
                '  <table width="100%" height="90%">' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader"> WCT Part No</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `         <td align="left"  class="fieldValue"> ${legacyPartNumber}</td> ` +
                '          <td align=""  class="">  <barcode class="barcode" horizantal-align="center" vertical-align="middle" bar-width="1.5" codetype="Code128" showtext="false"  value="' + legacyPartNumber + '"></barcode> </td>' +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">Release#</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `         <td align="left"  class="fieldValue"> ${workOrderNumber}</td> ` +
                '          <td align=""  class="">  <barcode class="barcode" horizantal-align="center" vertical-align="middle"  bar-width="1.5" codetype="Code128" showtext="false" value="' + workOrderNumber + '"></barcode> </td>' +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">Quantity#</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `         <td align="left"  class="fieldValue"> ${quantity}</td> ` +
                '          <td align=""  class="">  <barcode class="barcode" horizantal-align="center" vertical-align="middle"  bar-width="1.5" codetype="Code128" showtext="false" value="' + quantity + '"></barcode> </td>' +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">Weight</td>' +
                '          <td align="left" class="">Customers Part #</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `          <td align=""  class="fieldValue"> ${totalWeight} </td>` +
                `         <td align="left"   style="font-weight: bold;"> ${customerPartNumber}</td> ` +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">APW</td>' +

                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `          <td align=""  class="fieldValue"> ${itemWeight} </td>` +
                // `         <td align="left"  style="font-weight: bold;"> 9:41</td> ` +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">Lot #</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `         <td align="left"  class="fieldValue"> ${workOrderNumber}</td> ` +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">MATL CODE</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `         <td align="left"  class="fieldValue"> ${componentArray}</td> ` +
                '        </tr>' +

                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                '          <td align="left" class="fieldHeader">Manufacturing Date</td>' +
                // '          <td align="right" class="tab-top">Passed</td>' +
                '        </tr>' +
                '        <tr width="15%" style="font-size: 20px; padding-top: 2px;">' +
                `         <td align="left"  class="fieldValue"> ${manufacturingDate}</td> ` +
                '        </tr>' +

                '      </table>' +
                '   </body>' +
                '</pdf>';


            myvar = space(myvar);
            myvar = addspace(myvar);
            myvar = htmlizeAmps(myvar);
            myvar = trim(myvar);
            myvar = myvar.replace('&lt;', '<');
            myvar = myvar.replace('&gt;', '>');
            context.response.renderPdf(myvar);
            log.debug({ title: 'PCT-Kelco-Response', details: context.response });



        }

        function getComponentName(internalId) {
            let itemName = '';
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalid", "anyof", internalId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "itemid", label: "Name" }),

                    ]
            });
            var searchResultCount = itemSearchObj.runPaged().count;
            log.debug("itemSearchObj result count", searchResultCount);
            itemSearchObj.run().each(function (result) {
                itemName = result.getValue({ name: "itemid", label: "Name" })
                // .run().each has a limit of 4,000 results
                return true;
            });
            return itemName;

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
        onRequest: onRequest
    }
});
