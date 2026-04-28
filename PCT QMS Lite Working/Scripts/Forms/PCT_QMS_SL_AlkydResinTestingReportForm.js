/**
 *              //////////     PMC QMS 2.1 | Alkyd Resin Testing Report Form    //////////
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
                var productName = request.parameters.productName;
                var documentStatus = request.parameters.documentStatus;
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
                    log.debug("Type: ", documentType);
                    log.debug("Number: ", documentNumber);
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
                                search.createColumn({ name: "custrecord_pct_pp_viscosity", label: "Viscosity" }),
                                search.createColumn({ name: "custrecord_pct_pp_temperature", label: "Temperature @ (30 degree C)" }),
                                search.createColumn({ name: "custrecord_pct_colour_on_gardner_scale", label: "COLOUR ON GARDNER SCALE" }),
                                search.createColumn({ name: "custrecord_pct_pp_ph_value", label: "PH Value" }),
                                search.createColumn({ name: "custrecord_pct_pp_solid", label: "Solid %" }),
                                search.createColumn({ name: "custrecord_pct_pp_drying_time_surface", label: "Drying Time Surface" }),
                                search.createColumn({ name: "custrecord_pct_pp_report", label: "Report" }),
                                search.createColumn({ name: "custrecord_pct_pp_acid_value", label: "Acid Value" }),
                                search.createColumn({ name: "custrecord_pct_pp_drying_time_hard", label: "Drying Time Hard" }),
                                search.createColumn({ name: "custrecord_pct_pp_drying_time_tack_free", label: "Drying Time Tack Free" }),
                                search.createColumn({ name: "custrecord_pct_pp_tolerancy", label: "Tolerancy" }),
                                search.createColumn({ name: "custrecord_pct_pp_gloss_on_meter", label: "Gloss on meter" }),
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
                        var spGravity = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_sp_gravity');
                        var viscosity = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_viscosity');
                        var clearity = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_clearity');
                        var phValue = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_ph_value');
                        var solid = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_solid');
                        var dryingTimeSurface = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_drying_time_surface');
                        var report = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_report');
                        var colOnGardnerScale = qmsRecordResult[qms_index].getValue('custrecord_pct_colour_on_gardner_scale');
                        var dryingTimeTackFree = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_drying_time_tack_free');
                        var dryingTimeHard = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_drying_time_hard');
                        var acidValue = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_acid_value');
                        var tolerancy = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_tolerancy');
                        var glossOnMeter = qmsRecordResult[qms_index].getValue('custrecord_pct_pp_gloss_on_meter');
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
                        phValue: phValue,
                        spGravity: spGravity,
                        viscosity: viscosity,
                        solid: solid,
                        report: report,
                        colOnGardnerScale: colOnGardnerScale,
                        dryingTimeSurface: dryingTimeSurface,
                        dryingTimeTackFree: dryingTimeTackFree,
                        dryingTimeHard: dryingTimeHard,
                        acidValue: acidValue,
                        tolerancy: tolerancy,
                        glossOnMeter: glossOnMeter,
                        clearity: clearity,
                        qcChecked: qcChecked,
                        report: report,
                        logoutPageUrl: logoutPageUrl
                    };
                    log.debug({
                        title: 'PCT-QMS', details: "Product Name : " + productName + ", Party Name : " + partyName + ", Vehicle No :" + vehicleNo + ", colOnGardnerScale : "
                            + colOnGardnerScale + ", PH Value : " + phValue + ", Sp Gravity :" + spGravity + ", Report : " + report + ", acidValue : " + acidValue
                            + ", dryingTimeHard : " + dryingTimeHard + ", tolerancy : " + tolerancy + ", glossOnMeter : " + glossOnMeter + ", clearity : " + clearity
                            + ", viscosity : " + viscosity + ", solid : " + solid + ", dryingTimeSurface : " + dryingTimeSurface + ", dryingTimeTackFree : " + dryingTimeTackFree
                    });
                }
                // Load Login HTML Template
                var templateFile = file.load({ id: '../../HTML Files/Forms/pct_qms_alkyd_resin_testing_report_form.html' });
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
                var phValue = request.parameters.phValue;
                var spGravity = request.parameters.spGravity;
                var viscosity = request.parameters.viscosity;
                var solidPercentage = request.parameters.solidPercentage;
                var dryingTimeHard = request.parameters.dryingTimeHard;
                var colOnGardnerScale = request.parameters.colOnGardnerScale;
                var acidValue = request.parameters.acidValue;
                var glossOnMeter = request.parameters.glossOnMeter;
                var tolerancy = request.parameters.tolerancy;
                var clearity = request.parameters.clearity;
                var dryingTimeSurface = request.parameters.dryingTimeSurface;
                var dryingTimeTackFree = request.parameters.dryingTimeTackFree;
                var qcChecked = request.parameters.qcChecked;
                var report = request.parameters.subject;

                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Document Type : " + documentType + ", Document Number : " + documentNumber + ", Product Name : " + productName + ", Form : " + qmsForm });
                log.debug({
                    title: 'PCT-QMS', details: " Batch No : " + batchNo + ", Product Name : " + productName + ", Party Name : " + partyName +
                        ", Vehicle No :" + vehicleNo + ", Viscosity : " + viscosity + ", colOnGardnerScale :" + colOnGardnerScale + ", glossOnMeter : " + glossOnMeter + ", tolerancy : " + tolerancy + ", Solid Percentage : " + solidPercentage +
                        ", PH Value : " + phValue + ", Sp Gravity :" + spGravity + ", dryingTimeSurface : " + dryingTimeSurface + ", clearity : " + clearity + ", dryingTimeTackFree : " + dryingTimeTackFree + ", dryingTimeHard :" + dryingTimeHard + ", QC Checked : " + qcChecked + ", Report : " + report
                });
                // /-------------------------- Save Value in Custom Record ------------------------------
                var alkydResinFormObj = record.create({ type: "customrecord_pct_pp_qms_record", isDynamic: true });
                if (documentType == "itemreceipt")
                {
                    alkydResinFormObj.setText({ fieldId: 'custrecord_pct_pp_record_form', text: "Item Receipt" });
                }
                else if (documentType == "assemblybuild")
                {
                    alkydResinFormObj.setText({ fieldId: 'custrecord_pct_pp_record_form', text: "Assembly Build" });
                }
                alkydResinFormObj.setText({ fieldId: 'customform', text: "Alkyd Resin Testing Report Form" });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_document_number', value: documentNumber });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_material_name_pdct_nme', value: productName });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_party_name', value: partyName });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_sp_gravity', value: spGravity });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_ph_value', value: phValue });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_drying_time_hard', value: dryingTimeHard });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_colour_on_gardner_scale', value: colOnGardnerScale });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_acid_value', value: acidValue });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_gloss_on_meter', value: glossOnMeter });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_tolerancy', value: tolerancy });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_clearity', value: clearity });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_drying_time_surface', value: dryingTimeSurface });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_drying_time_tack_free', value: dryingTimeTackFree });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_batch_no', value: batchNo });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_vehicles_no', value: vehicleNo });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_viscosity_solution', value: viscosity });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_solid', value: solidPercentage });
                alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_report', value: report });
                if (qcChecked === "on")
                {
                    alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_qc_approved', value: true });
                }
                else { alkydResinFormObj.setValue({ fieldId: 'custrecord_pct_pp_qc_approved', value: false }); }

                var qmsRecordId = alkydResinFormObj.save();
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
                        if (itemStatus) (count++);
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
            // email.send({
            //     author: -5,
            //     recipients: [employeeArray], //["asarkar1@paapri.com", "sdas@paapri.com"], 
            //     subject: 'PCT TEST for QMS Error',
            //     body: "Test Mail Body"
            // });
            log.debug("PCT-QMS", "Mail Send to the corresponding Emails");
        }

        return {
            onRequest: onRequest
        }
    });
