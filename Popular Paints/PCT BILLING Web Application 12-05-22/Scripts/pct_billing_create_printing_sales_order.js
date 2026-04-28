
/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url)
    {
        function onRequest(context)
        {
            var request = context.request;
            var response = context.response;

            if (request.method == 'GET')
            {
                log.debug({ title: "PCT-Billing", details: 'Request Parameter : ' + JSON.stringify(request.parameters) });
                log.debug({ title: "PCT-Billing", details: 'In Get Method' });
                var userName = request.parameters.userName;
                var zone = request.parameters.zone; //undefined
                if (isNaN(parseFloat(zone)))
                {
                    zone = 0;
                }
                else if (zone == -1)
                {
                    zone = 0;
                }
                else
                {
                    zone = zone;
                }
                log.debug({ title: 'PCT-Billing', details: "User Name : " + userName + " , Zone : " + zone });

                var faviconUrl = GetFaviconImgUrl();
                var dataSource = {
                    faviconUrl: faviconUrl,
                    isHidden: 'hidden',
                    userName: userName,

                };


                // Load Login HTML Template
                var templateFile = file.load({ id: '../../PCT BILLING Web Application/HTML Files/pct_billing_printing_sales_order.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource,
                });
                var zoneDropdown = zoneSearch(zone);
                var tableArray = soStatusSearch(zone);
                var thead = tableArray[0];
                var tbody = tableArray[1];
                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                renderedPage = renderedPage.replace('#ZONE-DROPDOWN#', zoneDropdown);
                renderedPage = renderedPage.replace('#TABLE-HEAD-CONTENTS#', thead);
                renderedPage = renderedPage.replace('#TABLE-BODY-CONTENTS#', tbody);
                response.write(renderedPage);

            }
            else
            {
                log.debug({ title: "PCT-Billing", details: 'In Post Method' });
                // Getting params
                var zone = request.parameters.hiddenZoneId;
                var userName = request.parameters.userName;
                var printSo = request.parameters.printSo;
                log.debug({ title: 'PCT-Billing', details: "User Name : " + userName + ", Zone : " + zone + ", Print So : " + printSo + ", ==" + typeof (printSo) });
                // if (isNaN(parseFloat(printSo)))
                if (typeof printSo !== 'undefined')
                {

                    log.debug({ title: "PCT-Billing", details: 'IF' });
                    printSalesOrde(printSo, context);
                }
                else
                {
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_billing_printing_so',
                        deploymentId: 'customdeploy_pct_billing_printing_so',
                        isExternal: true,
                        parameters: {
                            'zone': zone,
                            'userName': userName,
                        }
                    });
                    log.debug({ title: "PCT-Billing", details: 'ELSE' });
                }


            }
        }

        // -------------------------- All Custom Functions ---------------------------
        function GetFaviconImgUrl()
        {
            var fileObj = file.load({
                id: 'SuiteScripts/PCT BILLING Web Application/Images/PCT logo.png'
            });
            return fileObj.url;
        }
        function zoneSearch(zone) // Search Id : 1904
        {
            var zoneDropdown = "";
            var customrecord_pct_pp_territorySearchObj = search.create({
                type: "customrecord_pct_pp_territory",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });

            var zoneCount = customrecord_pct_pp_territorySearchObj.runPaged().count;
            log.debug("PCT-Billing", "Zone Result Count : " + zoneCount);
            var zoneResult = customrecord_pct_pp_territorySearchObj.run().getRange({ start: 0, end: zoneCount });
            zoneDropdown +=
                '<option value="-1">-None-</option > ';
            for (var zoneIndex = 0; zoneIndex < zoneCount; zoneIndex++)
            {
                var zoneId = zoneResult[zoneIndex].id;
                var zoneName = zoneResult[zoneIndex].getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                });
                // log.debug("PCT-Billing", "Zone Id : " + zoneId + ", Zone Name : " + zoneName);
                if (zone == zoneId)
                {
                    zoneDropdown +=
                        '<option value="' + zoneId + '"selected>' + zoneName + '</option > ';
                }
                else
                {
                    zoneDropdown +=
                        '<option value="' + zoneId + '">' + zoneName + '</option > ';
                }



            }
            return zoneDropdown;
        }

        function soStatusSearch(zone)  // Search Id : 1904
        {
            var thead = "";
            var tbody = "";
            var filterArray = [];
            log.debug("PCT-Billing SO Function", "Zone : " + zone)
            if (zone || zone < 0)
            {
                filterArray.push(["customermain.custentity_pct_pp_zone", "anyof", zone]);
                filterArray.push("AND");
            }
            filterArray.push(["type", "anyof", "SalesOrd"]);
            filterArray.push("AND");
            filterArray.push(["mainline", "is", "T"]);
            filterArray.push("AND");
            filterArray.push(["status", "anyof", "SalesOrd:B"]);


            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        filterArray
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({
                            name: "altname",
                            join: "customerMain",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "custentity_pct_pp_zone",
                            join: "customerMain",
                            label: "Zone"
                        }),
                        search.createColumn({ name: "custbody_pct_pp_so_print_check", label: "custbody_pct_pp_so_print_check" }),
                        search.createColumn({
                            name: "datecreated",
                            sort: search.Sort.DESC,
                            label: "Date Created"
                        }),
                        search.createColumn({ name: "status", label: "Status" }),

                    ]
            });
            var soCount = salesorderSearchObj.runPaged().count;
            log.debug("PCT-Billing", "Sales Order Result Count : " + soCount);
            // var soResult = salesorderSearchObj.run().getRange({ start: 0, end: soCount });
            // ---------------- Populate the THead in the table --------------------
            thead += '<tr>' +
                '                    <th>Document Number</th>' +
                '                    <th>Date Created</th>' +
                '                    <th>Status</th>' +
                '                    <th>Customer Name</th>' +
                '                    <th>Zone</th>' +
                '                    <th>Printed Status</th>' +
                '                    <th>Print</th>' +

                `</tr>`

            var start = 0;
            var end = 1000;
            do
            {
                var soResult = salesorderSearchObj.run().getRange({ start: start, end: end });
                for (var soIndex = 0; soIndex < soResult.length; soIndex++)
                {
                    var documentNumber = soResult[soIndex].getValue({ name: "tranid", label: "Document Number" });
                    var customerName = soResult[soIndex].getValue({
                        name: "altname",
                        join: "customerMain",
                    });
                    var zone = soResult[soIndex].getText({
                        name: "custentity_pct_pp_zone",
                        join: "customerMain",
                    });
                    var printed = soResult[soIndex].getValue({ name: "custbody_pct_pp_so_print_check", label: "custbody_pct_pp_so_print_check" });
                    var dateCreated = soResult[soIndex].getValue({
                        name: "datecreated",
                        sort: search.Sort.DESC,
                        label: "Date Created"
                    });
                    var soStatus = soResult[soIndex].getValue({ name: "status", label: "Status" });
                    log.debug("PCT-Billing", "So Document Number : " + documentNumber + ", Customer Name : " + customerName + ", Zone : " + zone + " Printed : " + printed + ", Date Created : " + dateCreated + ", Status : " + soStatus);
                    if (printed) { printed = "Yes" } else { printed = "No" }
                    // ---------------- Populate the TBody in the table --------------------
                    tbody += '<tr><td>' + documentNumber + '</td>' +
                        '<td >' + dateCreated + '</td>' +
                        '<td >' + soStatus + '</td>' +
                        '<td >' + customerName + '</td>' +
                        '<td>' + zone + '</td>' +
                        '<td>' + printed + '</td>' +
                        `<td><input class="btn btn-success" type="submit" id="printSo" name ="printSo" value= ${documentNumber} style="width: fit-content"></td>` +

                        ' </tr > ';

                    tbody += `</tr>`;

                }
                start += 1000;
                end += 1000;
                soCount -= 1000;

            }
            while (soCount > 0);




            return [thead, tbody];

        }
        function printSalesOrde(soDocNo, context)
        {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["numbertext", "is", soDocNo],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                    ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: searchResultCount });
            for (var soIndex = 0; soIndex < searchResultCount; soIndex++)
            {
                var id = searchResult[soIndex].getValue({
                    name: "internalid"
                })
            }
            log.debug({
                title: "Sales Order Id:",
                details: id
            })
            var soLoad = record.load({
                type: 'salesorder',
                id: id
            });
            soLoad.setValue({ fieldId: 'custbody_pct_pp_so_print_check', value: true });
            soLoad.save();

            var idInt = parseInt(id);

            var transactionFile = render.transaction({
                entityId: idInt,
                printMode: render.PrintMode.PDF,
                inCustLocale: true
            });
            log.debug({
                title: "Sales Order record:",
                details: transactionFile
            })

            context.response.writeFile(transactionFile);
        }


        return {
            onRequest: onRequest
        }
    });
