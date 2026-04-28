/**
 *              //////////     PMC QMS 2.1 | Paste Testing Report Form    //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-09-01 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT QMS, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to render login page Html template.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url)
    {
        /**
             * Definition of the Suitelet script trigger point.
             * 
             * @param {Object} context 
             * @param {ServerRequest} context.request - Encapsulation of the incoming request
             * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
             */
        function onRequest(context)
        {
            var request = context.request;
            var response = context.response;
            if (request.method == 'GET')
            {

                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;
                var documentStatus = request.parameters.documentStatus;
                var productName = request.parameters.productName;
                var qmsForm = request.parameters.qmsForm;
                var serialNumber = request.parameters.serialNumber;
                var partyName = request.parameters.partyName;
                var custparam_userName = request.parameters.custparam_userName;
                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Document Type : " + documentType + ", Document Number : " + documentNumber + ", Product Name : " + productName + ", Form : " + qmsForm + ", Party Name : " + partyName });

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                var logoutPageUrl = GetLogoutPageUrl();
                // Assemble Data Source for Home Page
                if (documentStatus == "Pending")
                {
                    // Assemble Data Source for Home Page
                    var dataSource = {
                        faviconUrl: faviconUrl,
                        bodyImgUrl: bodyImgUrl,
                        isHidden: 'hidden',
                        custparam_userName: custparam_userName,
                        productName: productName,
                        documentType: documentType,
                        documentNumber: documentNumber,
                        documentStatus: documentStatus,
                        logoutPageUrl: logoutPageUrl,
                        batchNo: serialNumber,
                        partyName: partyName
                    };
                }
                else if (documentStatus == "Existing")
                {
                    var customrecord_pct_pp_qms_recordSearchObj = search.create({
                        type: "customrecord_pct_pp_qms_record",
                        filters:
                            [
                                ["custrecord_pct_pp_record_form", "anyof", documentType],
                                "AND",
                                ["custrecord_pct_pp_document_number", "is", documentNumber]
                            ],
                        columns:
                            [

                                search.createColumn({ name: "custrecord_pct_pp_batch_no", label: "Batch No" }),
                                search.createColumn({ name: "custrecord_pct_pp_party_name", label: "Party Name" }),
                                search.createColumn({ name: "custrecord_pct_pp_vehicles_no", label: "Vehicles No" }),
                                search.createColumn({ name: "custrecord_pct_pp_sp_gravity", label: "SP. Gravity" }),
                                search.createColumn({ name: "custrecord_pct_pp_ph_value", label: "PH Value" }),
                                search.createColumn({ name: "custrecord_pct_colour_on_gardner_scale", label: "COLOUR ON GARDNER SCALE" }),
                                search.createColumn({ name: "custrecord_pct_pp_colour_mtchng_take_eco", label: "COLOUR ON MATCHING TAKE ECO-1" }),
                                search.createColumn({ name: "custrecord_pct_pp_colour_on_mtchng_paste", label: "Water AbsorptionCOLOUR ON MATCHING PASTE" }),
                                search.createColumn({ name: "custrecord_pct_pp_report", label: "Report" }),
                                search.createColumn({ name: "custrecord_pct_pp_qc_approved", label: "QC Approved" })
                            ]
                    });
                    var qmsRecordCount = customrecord_pct_pp_qms_recordSearchObj.runPaged().count;
                    log.debug("PCT_QMS", "Qms Record Result Count : " + qmsRecordCount);
                    var qmsRecordResult = customrecord_pct_pp_qms_recordSearchObj.run().getRange({ start: 0, end: qmsRecordCount });
                    for (var qms_index = 0; qms_index < qmsRecordCount; qms_index++)
                    {
                        var batchNo = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_batch_no');
                        var partyName = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_party_name');
                        var vehicleNo = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_vehicles_no');
                        var colorGardnerScale = qmsRecordResult[qms_index].getValue('custrecord_pct_colour_on_gardner_scale');
                        var colorOnMatchingTake = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_colour_mtchng_take_eco');
                        var colorOnMatchingPaste = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_colour_on_mtchng_paste');
                        var phValue = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_ph_value');
                        var spGravity = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_sp_gravity');
                        var report = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_report');
                        var qcChecked = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_qc_approved');
                    }
                    // Assemble Data Source for Home Page
                    var dataSource = {
                        faviconUrl: faviconUrl,
                        bodyImgUrl: bodyImgUrl,
                        isHidden: 'hidden',
                        custparam_userName: custparam_userName,
                        productName: productName,
                        documentType: documentType,
                        documentNumber: documentNumber,
                        documentStatus: documentStatus,
                        batchNo: serialNumber,
                        partyName: partyName,
                        vehicleNo: vehicleNo,
                        colorGardnerScale: colorGardnerScale,
                        colorOnMatchingTake: colorOnMatchingTake,
                        colorOnMatchingPaste: colorOnMatchingPaste,
                        phValue: phValue,
                        spGravity: spGravity,
                        qcChecked: qcChecked,
                        report: report,
                        logoutPageUrl: logoutPageUrl
                    };
                    log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Document Type : " + documentType + ", Document Number : " + documentNumber + ", Product Name : " + productName + ", Form : " + qmsForm });
                    log.debug({
                        title: 'PCT-QMS', details: " Batch No : " + batchNo + ", Party Name : " + partyName +
                            ", Vehicle No :" + vehicleNo + ",  Color Gardner Scale : " + colorGardnerScale + ", Color On MatchingTake : " + colorOnMatchingTake +
                            ", PH Value : " + phValue + ", Sp Gravity :" + spGravity + ", Color On Matching Paste : " + colorOnMatchingPaste + ", QC Approved : " + qcChecked + ", Report : " + report
                    });
                }
                // Load Login HTML Template
                var templateFile = file.load({ id: '../../HTML Files/Forms/pct_qms_paste_testing_report_form.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });

                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                response.write(renderedPage);

            }
            else
            {

                log.debug({ title: "PCT-QMS", details: 'In Post Method' });
                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;
                var qmsForm = request.parameters.qmsForm;
                var productName = request.parameters.productName;
                var batchNo = request.parameters.serialNumber;
                var partyName = request.parameters.partyName;
                var vehicleNo = request.parameters.vehicleNo;
                var spGravity = request.parameters.spGravity;
                var phValue = request.parameters.phValue;
                var colorGardnerScale = request.parameters.colorGardnerScale;
                var colorOnMatchingTake = request.parameters.colorOnMatchingTake;
                var colorOnMatchingPaste = request.parameters.colorOnMatchingPaste;
                var productName = request.parameters.productName;
                var qcChecked = request.parameters.qcChecked;
                var report = request.parameters.subject;

                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Document Type : " + documentType + ", Document Number : " + documentNumber + ", Product Name : " + productName + ", Form : " + qmsForm });
                log.debug({
                    title: 'PCT-QMS', details: " Batch No : " + batchNo + ", Party Name : " + partyName +
                        ", Vehicle No :" + vehicleNo + ",  Color Gardner Scale : " + colorGardnerScale + ", Color On MatchingTake : " + colorOnMatchingTake +
                        ", PH Value : " + phValue + ", Sp Gravity :" + spGravity + ", Color On Matching Paste : " + colorOnMatchingPaste + ", QC Checked : " + qcChecked + ", Report : " + report
                });
                // -------------------------- Save Value in Custom Record ------------------------------
                var pasteFormObj = record.create({ type: "customrecord_pct_pp_qms_record", isDynamic: true });
                pasteFormObj.setText({ fieldId: 'customform', text: "Paste Testing Report Form" });
                if (documentType == "itemreceipt")
                {
                    pasteFormObj.setText({ fieldId: 'custrecord_pct_pp_record_form', text: "Item Receipt" });
                }
                else if (documentType == "assemblybuild")
                {
                    pasteFormObj.setText({ fieldId: 'custrecord_pct_pp_record_form', text: "Assembly Build" });
                }
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_document_number', value: documentNumber });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_material_name_pdct_nme', value: productName });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_batch_no', value: batchNo });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_party_name', value: partyName });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_vehicles_no', value: vehicleNo });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_sp_gravity', value: spGravity });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_material_name_pdct_nme', value: productName });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_ph_value', value: phValue });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_colour_on_gardner_scale', value: colorGardnerScale });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_colour_mtchng_take_eco', value: colorOnMatchingTake });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_colour_on_mtchng_paste', value: colorOnMatchingPaste });
                pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_report', value: report });
                if (qcChecked === "on")
                {
                    pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_qc_approved', value: true });
                }
                else { pasteFormObj.setValue({ fieldId: 'custrecord_pct_pp_qc_approved', value: false }); }
                var qmsRecordId = pasteFormObj.save();
                log.debug({ title: 'PCT-QMS', details: 'New Created Custom Record Id : ' + qmsRecordId });

                // ----------------------------- Search for getting Assembly Build Id Number -----------------------------

                if (documentType == 'assemblybuild')
                {
                    var assemblybuildSearchObj = search.create({
                        type: "assemblybuild",
                        filters:
                            [
                                ["type", "anyof", "Build"],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["numbertext", "is", documentNumber]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "tranid", label: "Document Number" })
                            ]
                    });
                    var assemblybuildCount = assemblybuildSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Assembly Build Result Count : " + assemblybuildCount);
                    var assemblybuildResult = assemblybuildSearchObj.run().getRange({ start: 0, end: assemblybuildCount });
                    var assemblybuildId = assemblybuildResult[0].id;;
                    log.debug("PCT-QMS", "Assembly Build Doc Number : " + documentNumber + ", Internal Id : " + assemblybuildId);
                    var assemblybuildObj = record.load({
                        type: 'assemblybuild',
                        id: assemblybuildId
                    });
                    assemblybuildObj.setText({ fieldId: 'custbody_pct_pp_item_recipt_status', text: "Existing" });
                    assemblybuildObj.save();
                    log.debug("PCT-QMS", "Value Changed in Assembly Build record");
                }
                // ----------------------------- Search for getting Item Receipt Id Number -----------------------------

                else if (documentType == 'itemreceipt')
                {
                    log.debug("PCT-QMS", "Item Receipt If");
                    var itemreceiptSearchObj = search.create({
                        type: "itemreceipt",
                        filters:
                            [
                                ["type", "anyof", "ItemRcpt"],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["numbertext", "is", documentNumber]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "tranid", label: "Document Number" })
                            ]
                    });
                    var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Item Recipt Result Count : " + itemReceiptCount);
                    var itemReceiptResult = itemreceiptSearchObj.run().getRange({ start: 0, end: itemReceiptCount });
                    var itemReceiptId = itemReceiptResult[0].id;
                    log.debug("PCT-QMS", "Item Recipt Doc Number : " + documentNumber + ", Internal Id : " + itemReceiptId);
                    var itemReceiptObj = record.load({
                        type: 'itemreceipt',
                        id: itemReceiptId
                    });
                    var lineCount = itemReceiptObj.getLineCount({ sublistId: 'item' });
                    log.debug({
                        title: "PCT-QMS",
                        details: "Item Fulfillment Item Count : " + lineCount
                    })
                    var count = 0;
                    for (var item_index = 0; item_index < lineCount; item_index++)
                    {
                        var itemName = itemReceiptObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemname',
                            line: item_index
                        });
                        if (itemName === productName)
                        {
                            itemReceiptObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_pct_pp_item_existing',
                                line: item_index,
                                value: true
                            });
                            itemReceiptObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_pct_pp_qc_approved',
                                line: item_index,
                                value: true
                            });
                        }
                        var itemStatus = itemReceiptObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pct_pp_item_existing',
                            line: item_index
                        });
                        if (itemStatus) { count++ };
                        log.debug({
                            title: "PCT-QMS",
                            details: "Item Name : " + itemName + ", Item Status : " + itemStatus
                        })
                    }

                    if (count === lineCount)
                    {
                        itemReceiptObj.setText({ fieldId: 'custbody_pct_pp_item_recipt_status', text: "Existing" });
                    }
                    itemReceiptObj.save();
                    log.debug("PCT-QMS", "Value Changed in Item Receipt record");
                    sendMail(documentNumber);
                }
                redirect.toSuitelet({
                    scriptId: 'customscript_pct_qms_doc_status_form',
                    deploymentId: 'customdeploy_pct_qms_doc_status_form',
                    isExternal: true,
                });

            }
        }
        //------------------------------------------- Custom Function ----------------------------------

        // This method is used to get the paapri favicon url
        function GetFaviconImgUrl()
        {
            var fileObj = file.load({
                id: '../../Images/PCT logo.png'
            });
            return fileObj.url;
        }
        // This method is used to get the paapri full image url
        function GetPaapriFullImgUrl()
        {
            var fileObj = file.load({
                id: '../../Images/PCT logo with name.png'
            });
            return fileObj.url;
        }
        /**
        * This method is used to get the external url of Logout Page
        */
        function GetLogoutPageUrl()
        {
            return url.resolveScript({
                scriptId: 'customscript_pct_qms_home_page',
                deploymentId: 'customdeploy_pct_qms_home_page',
                returnExternalUrl: true
            });
        }
        // This method is used to change the format & datatype of Date
        function FormateDate(entryDate)
        {
            var mydate = new Date(entryDate);
            var dd = mydate.getDate();
            var mm = mydate.getMonth() + 1;
            var yyyy = mydate.getFullYear();
            entryDate = dd + "/" + mm + "/" + yyyy;
            return format.parse({
                value: entryDate,
                type: format.Type.DATE
            });
        }
        // For Sending the Mail to Admin & ppc_purchase_role Employee 
        function sendMail(documentNumber)
        {
            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["role", "anyof", "1012", "3"],
                        "AND",
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "email",
                            summary: "GROUP",
                            label: "Email"
                        })
                    ]
            });
            var employeeCount = employeeSearchObj.runPaged().count;
            log.debug("PCT_QMS", "Employee Result Count : " + employeeCount);
            var employeeResult = employeeSearchObj.run().getRange({ start: 0, end: employeeCount });
            var employeeArray = new Array();
            for (var employeeIndex = 0; employeeIndex < employeeCount; employeeIndex++)
            {
                var employeeEmail = employeeResult[employeeIndex].getValue({
                    name: "email",
                    summary: "GROUP",
                    label: "Email"
                });
                employeeArray.push(employeeEmail);
            }
            log.debug("PCT_QMS", "Employee Mail Array  : " + employeeArray);
            email.send({
                author: -5,
                recipients: [employeeArray], //["asarkar1@paapri.com", "sdas@paapri.com"], 
                subject: 'QC Unchecked',
                body: "For Item Receipt Document Number " + documentNumber + ", You saved the QMS Record without checking the QC Checked Checkbox."
            });
            log.debug("PCT-QMS", "Mail Send to the corresponding Emails");
        }

        return {
            onRequest: onRequest
        }
    });
