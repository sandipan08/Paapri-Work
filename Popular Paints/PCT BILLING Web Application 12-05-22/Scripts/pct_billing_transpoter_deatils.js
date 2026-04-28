
/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url)
    {
        var soDocumentNo = 0;
        var customerName = '';
        var shipAddress = '';
        var sendFulfillmentNumber = '';
        var location = '';
        var userName = '';
        function onRequest(context)
        {
            var request = context.request;
            var response = context.response;

            if (request.method == 'GET')
            {
                // log.debug({ title: "PCT-Billing", details: 'Request Parameter : ' + JSON.stringify(request.parameters) });
                log.debug({ title: "PCT-Billing", details: 'In Get Method' });
                userName = request.parameters.userName;
                var fulfillmentNumber = request.parameters.fulfillId;
                log.debug({ title: "PCT-Billing", details: 'User Name : ' + userName + ", Fulfillment Id : " + fulfillmentNumber });

                if (isNaN(parseFloat(fulfillmentNumber)))
                {
                    fulfillmentNumber = 0;
                }
                else if (fulfillmentNumber == -1)
                {
                    fulfillmentNumber = 0;
                }
                else
                {
                    fulfillmentNumber = fulfillmentNumber;
                }

                var faviconUrl = GetFaviconImgUrl();
                var fulfillmentData = GetItemFulfillment(fulfillmentNumber);
                var fulfillmentDropdown = fulfillmentData[0];
                var transporterTbody = fulfillmentData[2];
                var transporterThead = fulfillmentData[1];
                var driverDropdown = getVendor(6);
                var transportDropdown = getVendor(5);
                var invoiceDropdown = getInvoice(soDocumentNo);
                var vehicleDropdown = vehicleDropDown();
                var dataSource = {
                    faviconUrl: faviconUrl,
                    isHidden: 'hidden',
                    userName: userName,
                    fulfillmentDropdown: fulfillmentDropdown,
                    sendFulfillmentNumber: sendFulfillmentNumber,
                    transporterThead: transporterThead,
                    transporterTbody: transporterTbody,
                    location: location,
                    customerName: customerName,
                    driverDropdown: driverDropdown,
                    transportDropdown: transportDropdown,
                    invoiceDropdown: invoiceDropdown,
                    vehicleDropdown: vehicleDropdown,
                    shipAddress: shipAddress

                };
                // Load Login HTML Template
                var templateFile = file.load({ id: '../../PCT BILLING Web Application/HTML Files/pct_billing_transporter_details.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource,
                });
                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();

                response.write(renderedPage);
            }
            else
            {
                log.debug({ title: "PCT-Billing", details: 'In Post Method' });

                var dataStore = request.parameters.dataStore;
                log.debug("PCT-Billing", " Data : " + dataStore);
                dataStore = JSON.parse(dataStore)
                // -------------------------- Save Value in Transporter/Party Receipt ------------------------------

                // Set Body Level Details 
                var transporterFormObj = record.create({ type: "customrecord_pct_pp_transporter_receipt", isDynamic: true });
                transporterFormObj.setValue({ fieldId: 'custrecord_pct_pp_tr_parent_link2', value: dataStore.fulfillmentNumber });
                transporterFormObj.setText({ fieldId: 'custrecord_pct_pp_tr_depot', text: dataStore.deport });
                transporterFormObj.setText({ fieldId: 'custrecord_pct_pp_tr_cust_name', text: dataStore.customerName });
                transporterFormObj.setText({ fieldId: 'custrecord_pct_pp_tr_driver_name', text: dataStore.driverName });
                transporterFormObj.setText({ fieldId: 'custrecord_pct_pp_tr_transport_name', text: dataStore.transportName });
                transporterFormObj.setValue({ fieldId: 'custrecord_pct_pp_tr_vehicle_no', value: dataStore.vehicleNumber });

                // var date = dataStore.transporterDate.toDateString()
                // var dd = date.getDate();
                // var mm = date.getMonth() + 1;
                // var yyyy = date.getFullYear();
                // var date = dd + "/" + mm + "/" + yyyy;
                // log.debug("-------", "======= : " + dataStore.transporterDate + ", : " + typeof dataStore.transporterDate)
                var entryDate = FormateDate(entryDate);
                if (entryDate === "NaN/NaN/NaN") { entryDate = "" };
                transporterFormObj.setValue({ fieldId: 'custrecord_pct_pp_tr_date', value: entryDate });
                transporterFormObj.setValue({ fieldId: 'custrecord_pct_pp_tr_inv_no', value: dataStore.invoiceNumber });
                transporterFormObj.setValue({ fieldId: 'custrecord_pct_pp_tr_remarks', value: dataStore.remarks });
                transporterFormObj.setText({ fieldId: 'custrecord_pct_pp_tr_trip', text: dataStore.trip });

                // Set Line Level Details 
                dataStore.lineData.map(element =>
                {
                    transporterFormObj.selectNewLine({ sublistId: 'recmachcustrecord_pct_pp_link_to_parent' });
                    transporterFormObj.setCurrentSublistValue({ sublistId: 'recmachcustrecord_pct_pp_link_to_parent', fieldId: 'custrecord_pct_pp_tr_child_desc', value: element.description });
                    transporterFormObj.setCurrentSublistValue({ sublistId: 'recmachcustrecord_pct_pp_link_to_parent', fieldId: 'custrecord_pct_pp_tr_child_packaging', value: element.packaging });
                    transporterFormObj.setCurrentSublistValue({ sublistId: 'recmachcustrecord_pct_pp_link_to_parent', fieldId: 'custrecord_pct_pp_tr_child_remarks', value: element.remarksLine });
                    transporterFormObj.commitLine({ sublistId: 'recmachcustrecord_pct_pp_link_to_parent' });
                })
                var transporterId = transporterFormObj.save();
                log.debug({ title: 'PCT-Billing', details: 'New Created Transporter Record Id : ' + transporterId });
                // Adding Transporter Receipt to Sales Invoice
                for (var invoiceIndex = 0; invoiceIndex < dataStore.invoiceNumber.length; invoiceIndex++)
                {
                    var invoiceLoad = record.load({ type: "invoice", id: dataStore.invoiceNumber[invoiceIndex], isDynamic: true });
                    dataStore.lineData.map(element =>
                    {
                        invoiceLoad.selectNewLine({ sublistId: 'recmachcustrecord_pct_pp_tr_child_link' });
                        invoiceLoad.setCurrentSublistValue({ sublistId: 'recmachcustrecord_pct_pp_tr_child_link', fieldId: 'custrecord_pct_pp_tr_child_desc', value: element.description });
                        invoiceLoad.setCurrentSublistValue({ sublistId: 'recmachcustrecord_pct_pp_tr_child_link', fieldId: 'custrecord_pct_pp_tr_child_packaging', value: element.packaging });
                        invoiceLoad.setCurrentSublistValue({ sublistId: 'recmachcustrecord_pct_pp_tr_child_link', fieldId: 'custrecord_pct_pp_tr_child_remarks', value: element.remarksLine });
                        invoiceLoad.commitLine({ sublistId: 'recmachcustrecord_pct_pp_tr_child_link' });
                    })
                    invoiceLoad.save();
                    log.debug({ title: 'PCT-Billing', details: 'Transporter Receipt Child Link to ' + dataStore.invoiceNumber[invoiceIndex] });
                }
                // Redirect to PCT Billing Home Page
                redirect.toSuitelet({
                    scriptId: 'customscript_pct_billing_trans_details',
                    deploymentId: 'customdeploy_pct_billing_trans_details',
                    isExternal: true,
                    parameters: {
                        'userName': userName,
                    }
                });
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
        // Search to Get Item Fulfillment Data (Fulfillment No + Transporter Derails) & Populate Fulfillment Dropdown
        function GetItemFulfillment(fulfillmentNumber)
        {
            var transporterTbody = '';
            var transporterThead = '';
            var fulfillmentDropdown = "";
            var itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type", "anyof", "ItemShip"],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "createdfrom", label: "Created From" }),
                        search.createColumn({ name: "shipaddress", label: "Address" }),
                        search.createColumn({ name: "entity", label: "Customer" }),
                        search.createColumn({
                            name: "custentity_pct_pp_location",
                            join: "customerMain",
                            label: "Location"
                        })
                    ]
            });
            var fulfillmentCount = itemfulfillmentSearchObj.runPaged().count;
            log.debug("PCT-Billing", "Fulfillment Result Count : " + fulfillmentCount);
            var start = 0;
            var end = 1000;
            do
            {
                var fulfillmentResult = itemfulfillmentSearchObj.run().getRange({ start: start, end: end });
                for (var fulfillmentIndex = 0; fulfillmentIndex < fulfillmentResult.length; fulfillmentIndex++)
                {
                    var fulfillmentId = fulfillmentResult[fulfillmentIndex].id;
                    var fulfillmentDocumentNo = fulfillmentResult[fulfillmentIndex].getValue("tranid");

                    // ---------------- Populate the Item Fulfillment Dropdown --------------------
                    if (fulfillmentId == fulfillmentNumber)
                    {
                        sendFulfillmentNumber = fulfillmentDocumentNo;
                        // log.debug("PCT-Billing", "Fulfillment No : " + fulfillmentNumber + ", Id " + fulfillmentId)
                        fulfillmentDropdown += `<option  value="${fulfillmentDocumentNo}" data-value=${fulfillmentId} ></option>`;
                        var tableData = transporterTable(fulfillmentId);
                        transporterThead = tableData[0];
                        transporterTbody = tableData[1];
                        soDocumentNo = fulfillmentResult[fulfillmentIndex].getValue("createdfrom");
                        shipAddress = fulfillmentResult[fulfillmentIndex].getValue("shipaddress");
                        customerName = fulfillmentResult[fulfillmentIndex].getText("entity");
                        location = fulfillmentResult[fulfillmentIndex].getText({
                            name: "custentity_pct_pp_location",
                            join: "customerMain",
                            label: "Location"
                        });
                        log.debug("PCT-Billing", "Created Form : " + soDocumentNo + ", Ship Address : " + shipAddress + ", Fulfillment No : " + sendFulfillmentNumber + ", Customer Name : " + customerName + ", Location : " + location)
                    }
                    else
                    {
                        fulfillmentDropdown += `<option  value="${fulfillmentDocumentNo}" data-value=${fulfillmentId} ></option>`;
                    }

                }
                start += 1000;
                end += 1000;
                fulfillmentCount -= 1000;
            }
            while (fulfillmentCount > 0);

            return [fulfillmentDropdown, transporterThead, transporterTbody];
        }
        // Populate the Transporter Details Table for Item Fulfillment
        function transporterTable(fulfillmentId)
        {
            var transporterTbody = '';
            var transporterThead = '';
            // ---------------- Populate the Transporter Table Head in the table --------------------
            transporterThead += '<tr>' +
                '                    <th>Deport</th>' +
                '                    <th>Customer Name</th>' +
                '                    <th>Driver Name</th>' +
                '                    <th>Vehicle No</th>' +
                '                    <th>Transport Name</th>' +
                '                    <th>Date</th>' +
                '                    <th>Invoice No</th>' +
                '                    <th>Remarks</th>';
            transporterThead += `</tr>`;
            var customrecord_pct_pp_transporter_receiptSearchObj = search.create({
                type: "customrecord_pct_pp_transporter_receipt",
                filters:
                    [
                        ["custrecord_pct_pp_tr_parent_link2", "anyof", fulfillmentId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pp_tr_depot", label: "Depot" }),
                        search.createColumn({ name: "custrecord_pct_pp_tr_cust_name", label: "Customer Name" }),
                        search.createColumn({
                            name: "custrecord_pct_pp_tr_driver_name",
                            sort: search.Sort.ASC,
                            label: "Driver Name"
                        }),
                        search.createColumn({ name: "custrecord_pct_pp_tr_vehicle_no", label: "Vehicle Number" }),
                        search.createColumn({ name: "custrecord_pct_pp_tr_transport_name", label: "Transport Name" }),
                        search.createColumn({
                            name: "custrecord_pct_pp_tr_date",
                            sort: search.Sort.ASC,
                            label: "Date"
                        }),
                        search.createColumn({ name: "custrecord_pct_pp_tr_inv_no", label: "Invoice Number" }),
                        search.createColumn({ name: "custrecord_pct_pp_tr_remarks", label: "Remarks" })
                    ]
            });
            var transporterCount = customrecord_pct_pp_transporter_receiptSearchObj.runPaged().count;
            log.debug("PCT-Billing", "Transporter Line Count : " + transporterCount);
            var transporterResult = customrecord_pct_pp_transporter_receiptSearchObj.run().getRange({ start: 0, end: transporterCount });
            for (var transporterIndex = 0; transporterIndex < transporterCount; transporterIndex++)
            {
                var transporterId = transporterResult[transporterIndex].id;
                var deport = transporterResult[transporterIndex].getText("custrecord_pct_pp_tr_depot");
                var customerName = transporterResult[transporterIndex].getText("custrecord_pct_pp_tr_cust_name");
                var driverName = transporterResult[transporterIndex].getText("custrecord_pct_pp_tr_driver_name");
                var vehicleNo = transporterResult[transporterIndex].getValue("custrecord_pct_pp_tr_vehicle_no");
                var transportName = transporterResult[transporterIndex].getText("custrecord_pct_pp_tr_transport_name");
                var date = transporterResult[transporterIndex].getValue("custrecord_pct_pp_tr_date");
                var invoiceNo = transporterResult[transporterIndex].getText("custrecord_pct_pp_tr_inv_no");
                var remarks = transporterResult[transporterIndex].getValue("custrecord_pct_pp_tr_remarks");

                log.debug("PCT-Billing", "Transporter Id : " + transporterId + ", Deport : " + deport + ", Customer Name : " + customerName + ", Driver Name : " + driverName + ", Vehicle No : " + vehicleNo +
                    ", Transport Name : " + transportName + ", Date : " + date + ", Invoice No : " + invoiceNo + ", Remarks : " + remarks);

                // ---------------- Populate the Transporter Table Body in the table --------------------
                transporterTbody += '<tr><td>' + deport + '</td>' +
                    '<td>' + customerName + '</td>' +
                    '<td>' + driverName + '</td>' +
                    '<td>' + vehicleNo + '</td>' +
                    '<td>' + transportName + '</td>' +
                    '<td>' + date + '</td>' +
                    '<td>' + invoiceNo + '</td>' +
                    '<td>' + remarks + '</td>';;
                transporterTbody += `</tr>`;
            }
            return [transporterThead, transporterTbody];
        }


        // Search to Populate Driver & Transporter Dropdown
        function getVendor(vendor)
        {
            var vendorDropdown = '';
            var vendorSearchObj = search.create({
                type: "vendor",
                filters:
                    [
                        ["category", "anyof", vendor]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });
            var vendorCount = vendorSearchObj.runPaged().count;
            log.debug("PCT-Billing", "Vendor Count : " + vendorCount);
            var start = 0;
            var end = 1000;
            do
            {
                var vendorResult = vendorSearchObj.run().getRange({ start: start, end: end });
                for (var vendorIndex = 0; vendorIndex < vendorResult.length; vendorIndex++)
                {
                    var vendorId = vendorResult[vendorIndex].id;
                    var vendorName = vendorResult[vendorIndex].getValue("entityid");
                    vendorDropdown += `<option  value="${vendorName}" data-value=${vendorId}></option>`;
                }
                start += 1000;
                end += 1000;
                vendorCount -= 1000;
            }
            while (vendorCount > 0);

            return vendorDropdown;
        }
        // Search to Get Invoice Number related to that SO
        function getInvoice(soDocumentNo)
        {
            var invoiceDropdown = '';
            var invoiceSearchObj = search.create({
                type: "invoice",
                filters:
                    [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["createdfrom", "anyof", soDocumentNo],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "invoicenum", label: "Invoice Number" }),
                        search.createColumn({ name: "tranid", label: "Document Number" })
                    ]
            });
            var invoiceCount = invoiceSearchObj.runPaged().count;
            log.debug("PCT-Billing", "Invoice Count : " + invoiceCount);
            var start = 0;
            var end = 1000;
            do
            {
                var invoiceResult = invoiceSearchObj.run().getRange({ start: start, end: end });
                for (var invoiceIndex = 0; invoiceIndex < invoiceResult.length; invoiceIndex++)
                {
                    var invoiceId = invoiceResult[invoiceIndex].id;
                    var invoiceName = invoiceResult[invoiceIndex].getValue("tranid");
                    // invoiceDropdown += `<option  value="${invoiceName}" data-value=${invoiceId}></option>`;
                    invoiceDropdown += `<option value=${invoiceId}>${invoiceName}</option>`;
                }
                start += 1000;
                end += 1000;
                invoiceCount -= 1000;
            }
            while (invoiceCount > 0);

            return invoiceDropdown;
        }
        // Search to populate the Vehicle Number on change of Driver
        function vehicleDropDown()
        {
            var driverObj = {};
            var vendorSearchObj = search.create({
                type: "vendor",
                filters:
                    [
                        ["category", "anyof", "6"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "custentity_pct_pp_vendor_vehicle_no", label: "Vehicle Number" })
                    ]
            });
            var driverCount = vendorSearchObj.runPaged().count;
            log.debug("PCT-Billing", "Driver Count :" + driverCount);
            var start = 0;
            var end = 1000;
            do
            {
                var driverResult = vendorSearchObj.run().getRange({ start: start, end: end });
                for (var driverIndex = 0; driverIndex < driverResult.length; driverIndex++)
                {

                    var driverId = driverResult[driverIndex].id;
                    var driverName = driverResult[driverIndex].getValue("entityid");
                    var vehicleNo = driverResult[driverIndex].getValue("custentity_pct_pp_vendor_vehicle_no");
                    driverObj[driverId] = vehicleNo;
                }
                start += 1000;
                end += 1000;
                driverCount -= 1000;
            }
            while (driverCount > 0);
            log.debug("PCT-Billing", "Driver Obj : " + JSON.stringify(driverObj));
            return JSON.stringify(driverObj);
        }
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


        return {
            onRequest: onRequest
        }
    });
