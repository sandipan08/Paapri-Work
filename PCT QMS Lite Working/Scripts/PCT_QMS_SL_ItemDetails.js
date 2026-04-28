/**
 *              //////////     PMC QMS 2.1 | Doc Item Details Page    //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-03-25 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC QMS, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url) {
        /**
             * Definition of the Suitelet script trigger point.
             * 
             * @param {Object} context 
             * @param {ServerRequest} context.request - Encapsulation of the incoming request
             * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
             */
        function onRequest(context) {
            var request = context.request;
            var response = context.response;
            if (request.method == 'GET') {

                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;
                var custparam_userName = request.parameters.custparam_userName;
                var documentStatus = request.parameters.documentStatus;

                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Document Type : " + documentType + ", Document Number : " + documentNumber + ", Document Status : " + documentStatus });

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                var logoutPageUrl = GetLogoutPageUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    isHidden: 'hidden',
                    custparam_userName: custparam_userName,
                    documentType: documentType,
                    documentNumber: documentNumber,
                    documentStatus: documentStatus,
                    logoutPageUrl: logoutPageUrl,

                };

                // Load Login HTML Template
                var templateFile = file.load({ id: '../HTML Files/pct_qms_itemDetails_page.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });
                var table_html = '';
                var list_dropdown = '';
                var form_dropdown = ' ';

                //-------------------------------------- Search for Assembly Build Item Get ----------------------------------
                if (documentType == 'assemblybuild') {
                    var assemblybuildSearchObj = search.create({
                        type: "assemblybuild",
                        filters:
                            [
                                ["type", "anyof", "Build"],
                                "AND",
                                ["numbertext", "is", documentNumber],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["item.custitem_pct_pp_qc_checking", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "item", label: "Item" }),
                                search.createColumn({ name: "serialnumbers", label: "Serial/Lot Numbers" }),
                                search.createColumn({
                                    name: "itemid",
                                    join: "item",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "custitem_pct_pp_qms_form",
                                    join: "item",
                                    label: "QMS Form"
                                }),
                                search.createColumn({ name: "datecreated", label: "Date Created" }),
                                search.createColumn({ name: "tranid", label: "Document Number" })
                            ]
                    });
                    var assemblybuildCount = assemblybuildSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Assembly Build Result Count : " + assemblybuildCount);
                    var assemblybuildResult = assemblybuildSearchObj.run().getRange({ start: 0, end: assemblybuildCount });
                    for (var assemblybuild_index = 0; assemblybuild_index < assemblybuildCount; assemblybuild_index++) {
                        var itemId = assemblybuildResult[assemblybuild_index].getValue('item');
                        var itemName = assemblybuildResult[assemblybuild_index].getValue({ name: "itemid", join: "item" });
                        var itemForm = assemblybuildResult[assemblybuild_index].getText({
                            name: "custitem_pct_pp_qms_form",
                            join: "item"
                        });
                        var serialNumber = assemblybuildResult[assemblybuild_index].getValue('serialnumbers');
                        var createdDate = assemblybuildResult[assemblybuild_index].getValue('datecreated');
                        var documentNumber = assemblybuildResult[assemblybuild_index].getValue('tranid');
                        log.debug("PCT-QMS", "Document No" + documentNumber + "Item Id : " + itemId + ", Item Name : " + itemName + ", Serial Number : " + serialNumber + ", Form NAme : " + itemForm + ", Date Created : " + createdDate);
                        table_html +=
                            '<tr>' +
                            '<td>' + (assemblybuild_index + 1) + '</td>' +
                            '<td class="productName">' + itemName + '</td>' +
                            '<td>' + documentNumber + '</td>' +
                            '<td>' + createdDate + '</td>' +
                            '<td class="serialNumber">' + serialNumber + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            '<td class="formName">' + itemForm + '</td>';

                        if (documentStatus == "Existing") {
                            table_html +=
                                '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="View Form"></td>' +
                                ' </tr > ';
                        }
                        else {

                            if (itemForm == "Alkyd Resin Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Alkyd Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Paste Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Paste Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Filler Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Filler Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Additives Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Additives Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Powder Base Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Powder Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Standard PCT QMS Record Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Standard Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Solvent Testing Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Solvent Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Muller Grinding Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Muller Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Bulk Testing Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Bulk Form" style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                        }


                    }
                }
                //-------------------------------------- Search for Item Receipt Item Get ----------------------------------
                else if (documentType == 'itemreceipt') {

                    var itemreceiptSearchObj = search.create({
                        type: "transaction",
                        filters:
                            [
                                ["mainline", "is", "F"],
                                "AND",
                                ["appliedtotransaction.custcol_pct_pp_item_existing", "is", "F"],
                                "AND",
                                ["appliedtotransaction.numbertext", "is", documentNumber],
                                "AND",
                                ["item.custitem_pct_pp_qc_checking", "is", "T"]

                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "internalid",
                                    summary: "GROUP",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "tranid",
                                    summary: "GROUP",
                                    label: "Document Number"
                                }),
                                search.createColumn({
                                    name: "internalid",
                                    join: "item",
                                    summary: "GROUP",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "itemid",
                                    join: "item",
                                    summary: "GROUP",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "custbody_pct_pp_party_build_number",
                                    summary: "GROUP",
                                    label: "Party Build Number"
                                }),
                                search.createColumn({
                                    name: "custbody_pct_pp_vehicle_number",
                                    summary: "GROUP",
                                    label: "Vehicle Number"
                                }),

                                search.createColumn({
                                    name: "entityid",
                                    join: "vendor",
                                    summary: "GROUP",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "custitem_pct_pp_qms_form",
                                    join: "item",
                                    summary: "GROUP",
                                    label: "QMS Form"
                                }),
                                search.createColumn({
                                    name: "datecreated",
                                    summary: "GROUP",
                                    label: "Date Created"
                                })
                                // search.createColumn({
                                //     name: "custcol_pct_pp_batch_no_text",
                                //     summary: "GROUP",
                                //     label: "Batch No Text"
                                // })

                            ]
                    });
                    var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Item Receipt Result Count : " + itemReceiptCount);
                    var itemReceiptResult = itemreceiptSearchObj.run().getRange({ start: 0, end: itemReceiptCount });
                    var itemArray = new Array();
                    for (var itemReceipt_index = 0; itemReceipt_index < itemReceiptCount; itemReceipt_index++) {
                        var itemId = itemReceiptResult[itemReceipt_index].getValue({ name: "internalid", join: "item", summary: "GROUP" });
                        log.debug("PCT-QMS", "Item Receipt Item Id : " + itemId);
                        if (!itemArray.includes(itemId)) {
                            itemArray.push(itemId)
                            //-------------------- Search for get Item Name ---------------------

                            var itemName = itemReceiptResult[itemReceipt_index].getValue({ name: "itemid", join: "item", summary: "GROUP" });
                            var itemForm = itemReceiptResult[itemReceipt_index].getText({ name: "custitem_pct_pp_qms_form", join: "item", summary: "GROUP" });
                            var partyName = itemReceiptResult[itemReceipt_index].getValue({
                                name: "entityid",
                                join: "vendor",
                                summary: "GROUP",
                            });
                            var partyBuildNumber = itemReceiptResult[itemReceipt_index].getValue({ name: "custbody_pct_pp_party_build_number", summary: "GROUP", });
                            var vehicleNo = itemReceiptResult[itemReceipt_index].getValue({ name: "custbody_pct_pp_vehicle_number", summary: "GROUP", });
                            var createdDate = itemReceiptResult[itemReceipt_index].getValue({ name: "datecreated", summary: "GROUP" });
                            log.debug("PCT-QMS", "Item Id : " + itemId + ", Item Name : " + itemName + ", Item Form : " + itemForm + ", Vehicle No : " + vehicleNo + "Party :" + partyName + ", Date Created : " + createdDate + ", Party Build Number : " + partyBuildNumber);
                        }
                        table_html +=
                            '<tr>' +
                            '<td>' + (itemReceipt_index + 1) + '</td>' +
                            '<td class="productName">' + itemName + '</td>' +
                            '<td>' + documentNumber + '</td>' +
                            '<td>' + createdDate + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            '<td class="partyName">' + partyName + '</td>' +
                            '<td>' + vehicleNo + '</td>' +
                            '<td>' + partyBuildNumber + '</td>' +
                            '<td class="formName">' + itemForm + '</td>';
                        if (documentStatus == "Existing") {
                            table_html +=
                                '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="View Form"></td>' +
                                ' </tr > ';
                        }
                        else {

                            if (itemForm == "Alkyd Resin Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Alkyd Form"style="width: fit-content" ></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Paste Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Paste Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Filler Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Filler Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Additives Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Additives Form" style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Powder Base Testing Report Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Powder Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Standard PCT QMS Record Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Standard Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Solvent Testing Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Solvent Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Muller Grinding Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Muller Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                            else if (itemForm == "Bulk Testing Form") {
                                table_html +=
                                    '<td><input class="qmsForm" type="submit" id="qmsForm" name ="qmsForm" value="Bulk Form"style="width: fit-content"></td>' +
                                    ' </tr > ';
                            }
                        }

                    }


                }



                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();

                renderedPage = renderedPage.replace('#TABLE-CONTENTS#', table_html);
                renderedPage = renderedPage.replace('#DROPDOWN-CONTENTS#', list_dropdown);
                renderedPage = renderedPage.replace('#FORMDROPDOWN-CONTENTS#', form_dropdown);
                response.write(renderedPage);

            }
            else {

                log.debug({ title: "PCT-QMS", details: 'In Post Method' });
                // log.debug({
                //     title: "---------------",
                //     details: "Context : " + JSON.parse(request.parameters.formData)
                // })

                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;
                var documentStatus = request.parameters.documentStatus;
                log.debug({ title: 'PCT-QMS', details: "Document Type : " + documentType + ", Document Number : " + documentNumber + ", Document Status : " + documentStatus });


                var productName = JSON.parse(request.parameters.formData).productName;
                var qmsForm = JSON.parse(request.parameters.formData).formName;
                var serialNumber = JSON.parse(request.parameters.formData).serialNumber;
                var partyName = JSON.parse(request.parameters.formData).partyName;
                var custparam_userName = request.parameters.custparam_userName;
                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Product Name : " + productName + ", Form : " + qmsForm + ", Serial Number : " + serialNumber + ", Party Name : " + partyName });

                if (qmsForm == "Filler Testing Report Form") {
                    log.debug("PCT-QMS", "Redirect to Filler Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_filler_standing',
                        deploymentId: 'customdeploy_pct_qms_filler_standing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Standard PCT QMS Record Form") {
                    log.debug("PCT-QMS", "Redirect to Standard Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_qms_standard_form',
                        deploymentId: 'customdeploy_pct_qms_qms_standard_form',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Paste Testing Report Form") {
                    log.debug("PCT-QMS", "Redirect to Paste Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_paste_testing',
                        deploymentId: 'customdeploy_pct_qms_paste_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Additives Testing Report Form") {
                    log.debug("PCT-QMS", "Redirect to Additives Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_additives_testing',
                        deploymentId: 'customdeploy_pct_qms_additives_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Powder Base Testing Report Form") {
                    log.debug("PCT-QMS", "Redirect to Powder Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_powder_base_testing',
                        deploymentId: 'customdeploy_pct_qms_powder_base_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Alkyd Resin Testing Report Form") {
                    log.debug("PCT-QMS", "Redirect to Alkyd Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_alkyd_resin_testing',
                        deploymentId: 'customdeploy_pct_qms_alkyd_resin_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Solvent Testing Form") {
                    log.debug("PCT-QMS", "Redirect to Solvent Testing Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_solvent_testing',
                        deploymentId: 'customdeploy_pct_qms_solvent_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Bulk Testing Form") {
                    log.debug("PCT-QMS", "Redirect to Bulk Testing Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_bulk_testing_form',
                        deploymentId: 'customdeploy_pct_qms_bulk_testing_form',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
                else if (qmsForm == "Muller Grinding Form") {
                    log.debug("PCT-QMS", "Redirect to Muller Grinding Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_muller_testing_form',
                        deploymentId: 'customdeploy_pct_qms_muller_testing_form',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                            'serialNumber': serialNumber,
                            'partyName': partyName
                        }
                    });
                }
            }
        }
        //------------------------------------------- Custom Function ----------------------------------

        // This method is used to get the paapri favicon url
        function GetFaviconImgUrl() {
            var fileObj = file.load({
                id: '../Images/PCT logo.png'
            });
            return fileObj.url;
        }
        // This method is used to get the paapri full image url
        function GetPaapriFullImgUrl() {
            var fileObj = file.load({
                id: '../Images/PCT logo with name.png'
            });
            return fileObj.url;
        }

        /**
        * This method is used to get the external url of Logout Page
        */
        function GetLogoutPageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_qms_home_page',
                deploymentId: 'customdeploy_pct_qms_home_page',
                returnExternalUrl: true
            });
        }


        return {
            onRequest: onRequest
        }
    });
