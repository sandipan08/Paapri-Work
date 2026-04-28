
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
                var documentStatus = request.parameters.documentStatus;
                // var createDate = request.parameters.createDate;
                // // createDate = format.format({
                // //     value: new Date(createDate),
                // //     type: format.Type.DATE,
                // //     timezone: 'Asia/Calcutta'
                // // })
                // createDate = FormateDate(createDate);
                // var getDate = new Date(createDate);

                // getDate = format.format({
                //     value: getDate,
                //     type: format.Type.DATETIME,
                //     timezone: format.Timezone.ASIA_CALCUTTA
                // })


                var custparam_userName = request.parameters.custparam_userName;
                log.debug({ title: 'PCT-QMS', details: "Document Type : " + documentType + ", Document Status : " + documentStatus + ", User Name : " + custparam_userName });
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
                    logoutPageUrl: logoutPageUrl
                };
                // Load Login HTML Template
                var templateFile = file.load({ id: '../HTML Files/pct_qms_docList_page.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource,
                    documentType: documentType,
                });
                var list_dropdown = '';
                var documentArray = new Array();
                //--------------------------------- Search for Item Receipt ------------------------
                if (documentType == 'itemreceipt') {
                    if (documentStatus == 'Pending') { doc_status = 1 }
                    else { doc_status = 2 }
                    var itemreceiptSearchObj = search.create({
                        type: "itemreceipt",
                        filters:
                            [
                                ["type", "anyof", "ItemRcpt"],
                                "AND",
                                ["custbody_pct_pp_item_recipt_status", "anyof", doc_status],
                                "AND",
                                ["item.custitem_pct_pp_qc_checking", "is", "T"]
                                // "AND",
                                // ["datecreated", "on", createDate]
                                // ["datecreated", "on", "16/12/2021"]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "entityid",
                                    join: "vendor",
                                    summary: "GROUP",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "tranid",
                                    summary: "GROUP",
                                    label: "Document Number"
                                }),
                                search.createColumn({ name: "datecreated", summary: "GROUP", label: "Date Created" })
                            ]
                    });
                    var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Item Receipt Result Count : " + itemReceiptCount);
                    var start = 0;
                    var end = 1000;
                    do {
                        var itemReceiptResult = itemreceiptSearchObj.run().getRange({ start: start, end: end });
                        for (var itemReceipt_index = 0; itemReceipt_index < itemReceiptResult.length; itemReceipt_index++) {

                            var docNumber = itemReceiptResult[itemReceipt_index].getValue({
                                name: "tranid", summary: "GROUP", label: "Document Number"
                            });

                            if (!documentArray.includes(docNumber)) {
                                documentArray.push(docNumber);
                                var partyName = itemReceiptResult[itemReceipt_index].getValue({
                                    name: "entityid",
                                    join: "vendor",
                                    summary: "GROUP",
                                    label: "Name"
                                });
                                var createdDate = itemReceiptResult[itemReceipt_index].getValue({ name: "datecreated", summary: "GROUP" })
                                log.debug("PCT-QMS", "Item Receipt Result : " + docNumber + ", Party Name : " + partyName + ", Created Date : " + createdDate);

                                list_dropdown +=
                                    '<option value="' + docNumber + '">' + docNumber + ' : ' + partyName + ', ' + createdDate + '</option > ';
                            }
                        }
                        start += 1000;
                        end += 1000;
                        itemReceiptCount -= 1000;
                    }
                    while (itemReceiptCount > 0);
                }
                //--------------------------------- Search for Assembly Build ------------------------

                else if (documentType == 'assemblybuild') {
                    var doc_status = 0;
                    if (documentStatus == 'Pending') { doc_status = 1 }
                    else { doc_status = 2 }
                    var assemblybuildSearchObj = search.create({
                        type: "assemblybuild",
                        filters:
                            [


                                ["type", "anyof", "Build"],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["item.custitem_pct_pp_qc_checking", "is", "T"],
                                "AND",
                                ["custbody_pct_pp_item_recipt_status", "anyof", doc_status]

                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({
                                    name: "itemid",
                                    join: "item",
                                    label: "Name"
                                }),
                                search.createColumn({ name: "datecreated", label: "Date Created" })
                            ]
                    });
                    var assemblybuildCount = assemblybuildSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Assembly Build Result Count : " + assemblybuildCount);
                    var start = 0;
                    var end = 1000;
                    do {
                        var assemblybuildResult = assemblybuildSearchObj.run().getRange({ start: start, end: end });
                        for (var assemblybuild_index = 0; assemblybuild_index < assemblybuildResult.length; assemblybuild_index++) {
                            var docNumber = assemblybuildResult[assemblybuild_index].getValue('tranid');
                            if (!documentArray.includes(docNumber)) {
                                documentArray.push(docNumber);
                                var itemName = assemblybuildResult[assemblybuild_index].getValue({
                                    name: "itemid",
                                    join: "item",
                                });

                                var createdDate = assemblybuildResult[assemblybuild_index].getValue({ name: "datecreated", label: "Date Created" })
                                log.debug("PCT-QMS", "Assembly Build Document Number : " + docNumber + ", Item Name : " + itemName + ", Date Created : " + createdDate);
                                list_dropdown +=
                                    '<option >' + docNumber + ':' + itemName + ', ' + createdDate + '</option>';
                            }
                        }
                        start += 1000;
                        end += 1000;
                        assemblybuildCount -= 1000;
                    }
                    while (assemblybuildCount > 0);
                }
                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                renderedPage = renderedPage.replace('#DROPDOWN-CONTENTS#', list_dropdown);
                response.write(renderedPage);

            }
            else {

                log.debug({ title: "PCT-QMS", details: 'In Post Method' });
                // Getting params
                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;

                //-------------- Split for getting only document number ------------------

                var documentNumberArray = documentNumber.split(":");
                var documentNumber = documentNumberArray[0];

                var custparam_userName = request.parameters.custparam_userName;
                var documentStatus = request.parameters.documentStatus;
                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + "Document Type : " + documentType + ", Document Number : " + documentNumber + ", Document Status : " + documentStatus });

                redirect.toSuitelet({
                    scriptId: 'customscript_pct_pp_item_details',
                    deploymentId: 'customdeploy_pct_pp_item_details',
                    isExternal: true,
                    parameters: {
                        'custparam_userName': custparam_userName,
                        'documentType': documentType,
                        'documentNumber': documentNumber,
                        'documentStatus': documentStatus
                    }
                });
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
        // This method is used to change the format & datatype of Date
        function FormateDate(mydate) {
            log.debug("PCT-QMS", "Date : " + mydate)


            // var today = new Date(entryDate);
            // var dd = String(today.getDate()).padStart(2, '0');
            // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            // var yyyy = today.getFullYear();

            // entryDate = mm + '/' + dd + '/' + yyyy;

            // var mydate = new Date(entryDate);
            var dd = mydate.getDate();
            log.debug("PCT-QMS", "Date : " + dd);
            var mm = mydate.getMonth() + 1;
            log.debug("PCT-QMS", "Month : " + mm);
            var yyyy = mydate.getFullYear();
            log.debug("PCT-QMS", "Year : " + yyyy);
            entryDate = dd + "/" + mm + "/" + yyyy;
            log.debug("PCT-QMS", "Full Date  : " + entryDate);

            return entryDate;
            // return format.parse({
            //     value: entryDate,
            //     type: format.Type.DATE
            // });
        }

        return {
            onRequest: onRequest
        }
    });
