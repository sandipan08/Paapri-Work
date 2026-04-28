/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(["N/record", 'N/search', "N/https", "N/encode",], function (record, search, https, encode,) {

    function onAction(scriptContext) {
        try {
            log.debug("PCT-ABI", "In Workflow Action Script");
            let soArray = [], itemArray = [], commonShippingObj = {}, shippingInformationArray = [], referencesArray = [];
            let shipFromAddress = {
                'sequence': 1,
                'name': '',
                'address1': '',
                'address2': null,
                'city': '',
                'stateProvince': '',
                'country': '',
                'postalCode': '',
                'locationCode': null,
                'earliestDate': null,
                'latestDate': null,
                'earliestAppointmentDateTime': null,
                'latestAppointmentDateTime': null,
                'appointmentNumber': null,
                'accessorials': '',
                'addressComment': null,
                'contact': {
                    'name': null,
                    'email': null,
                    'phone': null,
                    'fax': null
                }
            }
            let shipToAddress = {
                'sequence': 2,
                'name': '',
                'address1': '',
                'address2': null,
                'city': '',
                'stateProvince': '',
                'country': '',
                'postalCode': '',
                'locationCode': null,
                'earliestDate': null,
                'latestDate': null,
                'earliestAppointmentDateTime': null,
                'latestAppointmentDateTime': null,
                'appointmentNumber': null,
                'accessorials': '',
                'addressComment': null,
                'contact': {
                    'name': null,
                    'email': null,
                    'phone': null,
                    'fax': null
                }
            }
            let newRecord = scriptContext.newRecord;
            let fulfillmentId = newRecord.getValue({ fieldId: 'id' });
            let fulfillmentLoad = record.load({ type: search.Type.ITEM_FULFILLMENT, id: fulfillmentId });
            let addressSubRecord = fulfillmentLoad.getSubrecord({ fieldId: 'shippingaddress' })

            // ----------- Ship To Obj Start ----------------
            shipToAddress['name'] = addressSubRecord.getValue("addressee");
            shipToAddress['address1'] = addressSubRecord.getValue("addr1");
            shipToAddress['city'] = addressSubRecord.getValue("city");
            shipToAddress['stateProvince'] = addressSubRecord.getValue("state");
            shipToAddress['country'] = addressSubRecord.getValue("country");
            shipToAddress['postalCode'] = addressSubRecord.getValue("zip");
            // log.debug("PCT-ABI", JSON.stringify(shipToAddress));
            // ----------- Ship To Obj End ----------------

            for (let soIndex = 0; soIndex < fulfillmentLoad.getLineCount({ sublistId: 'recmachcustrecord_pct_bg_mbs_if' }); soIndex++) {
                let soObj = {};
                soObj['soId'] = fulfillmentLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_bg_mbs_if',
                    fieldId: 'custrecord_pct_bg_mbs_sales_order',
                    line: soIndex
                })
                soObj['weight'] = fulfillmentLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_bg_mbs_if',
                    fieldId: 'custrecord_pct_bg_mbs_weight',
                    line: soIndex
                })
                soObj['length'] = fulfillmentLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_bg_mbs_if',
                    fieldId: 'custrecord_pct_bg_mbs_length',
                    line: soIndex
                })
                soObj['width'] = fulfillmentLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_bg_mbs_if',
                    fieldId: 'custrecord_pct_bg_mbs_width',
                    line: soIndex
                })
                soObj['height'] = fulfillmentLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_bg_mbs_if',
                    fieldId: 'custrecord_pct_bg_mbs_height',
                    line: soIndex
                })
                soObj['salesOrder'] = fulfillmentLoad.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_bg_mbs_if',
                    fieldId: 'custrecord_pct_bg_mbs_sales_order_display',
                    line: soIndex
                })
                soArray.push(soObj)
            }
            // log.debug("PCT-SO Array", JSON.stringify(soArray))
            // ---------------------------------------- Get Sales Order Details Start ----------------------------------------------

            soArray.forEach(element => {
                // let shippingInformationObj = {};
                let soLoad = record.load({ type: search.Type.SALES_ORDER, id: parseInt(element.soId) })
                commonShippingObj['scacId'] = soLoad.getValue({ fieldId: 'custbody_abi_blue_grace_scac' })
                commonShippingObj['shipToLocation'] = soLoad.getValue({ fieldId: 'location' })
                // for (let itemIndex = 0; itemIndex < fulfillmentLoad.getLineCount({ sublistId: 'item' }); itemIndex++) {
                let itemIndex = 0;
                let itemWeight = element.weight;
                if (parseFloat(itemWeight) == 0)
                    itemWeight = 1;
                let itemFields = search.lookupFields({
                    type: search.Type.ITEM,
                    id: parseInt(soLoad.getSublistValue({ sublistId: 'item', fieldId: 'item', line: itemIndex })),
                    columns: ['displayname', 'custitem_abi_bluegrace_nmfc']
                });

                // ----------- Sales Order's Item Obj Start ----------------

                let itemObj = {};
                itemObj.description = itemFields.displayname;
                itemObj.orderReferenceNumber = soLoad.getValue("tranid");
                itemObj.poLineRef = null;
                itemObj.customerPartNumber = null;
                itemObj.upc = null;
                itemObj.classificationType = null;
                itemObj.class = soLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_abi_bluegrace_fright_class', line: itemIndex });// var classX = 150;;
                itemObj.nmfcCode = itemFields.custitem_abi_bluegrace_nmfc;
                // itemObj.commodityCodes = ["string"];
                itemObj.weight = Number(parseFloat(itemWeight)) * Number(parseFloat(soLoad.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: itemIndex })));
                itemObj.weightUnits = "lbs";
                itemObj.handlingQty = parseFloat(soLoad.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: itemIndex }));
                itemObj.handlingUnits = "Pallets";
                itemObj.pieceQty = null;
                itemObj.pieceUnits = null;
                itemObj.valueOfGoods = null;
                itemObj.glCode = null;
                itemObj.isStackable = null;
                itemObj.fluidVolume = null;
                itemObj.fluidVolumeUnits = null;
                itemObj.dimensions = {
                    length: element.length,
                    width: element.width,
                    height: element.height,
                    dimUnits: "in"
                };
                itemObj.pickupLocationCode = null;
                itemObj.dropLocationCode = null;
                itemObj.pickupSequenceID = null;
                itemObj.dropSequenceID = null;

                // ----------- Sales Order's Item Obj End ----------------
                itemArray.push(itemObj)
                referencesArray.push(element.salesOrder)
                // shippingInformationObj['salesOrder'] = element.salesOrder
                // shippingInformationObj['serialNumber'] = soLoad.getValue({ fieldId: 'custbody_abi_blue_grace_serial_number' })
                // shippingInformationObj['companyNotes'] = soLoad.getValue({ fieldId: 'custbody_abi_blue_grace_company_notes' })
                // shippingInformationArray.push(shippingInformationObj)
                // }

            });
            // --------------------------------------------- Get Sales Order Details End -----------------------------------------------

            let addressLoad = record.load({ type: search.Type.LOCATION, id: commonShippingObj.shipToLocation })
            let locationSubRecord = addressLoad.getSubrecord({ fieldId: 'mainaddress' })

            // ----------- Ship From Obj Start ----------------
            shipFromAddress['name'] = locationSubRecord.getValue("addressee");
            shipFromAddress['address1'] = locationSubRecord.getValue("addr1");
            shipFromAddress['city'] = locationSubRecord.getValue("city");
            shipFromAddress['stateProvince'] = locationSubRecord.getValue("state");
            shipFromAddress['country'] = locationSubRecord.getValue("country");
            shipFromAddress['postalCode'] = locationSubRecord.getValue("zip");
            // log.debug("PCT-ABI", JSON.stringify(shipFromAddress));
            // ----------- Ship From Obj End ----------------

            let bodyData = {
                bol: null,
                action: "Book",
                businessUnit: null,
                accountNumber: null,
                mode: "LTL",
                addresses: [
                    shipFromAddress,
                    shipToAddress
                ],
                accessorials: null,
                items: itemArray,
                rateSelection: {
                    method: "Carrier",
                    criteria: {
                        scac: commonShippingObj.scacId,
                        days: null,
                        threshold: null
                    },
                    serviceLevel: null
                },
                references: '',//referencesArray
                specialInstructions: fulfillmentLoad.getValue("custbody_bol_delivery_instructions"),
                notes: null,
                linearFeet: null
            }

            // log.debug("PCT-ABI", JSON.stringify(bodyData));
            // ----------- Integration Call ---------------- 
            var credentialRecord = record.load({
                type: "customrecord_blue_grace_config_rec",
                id: 2,
                isDynamic: true,
            });
            var username = credentialRecord.getValue("name");
            var password = credentialRecord.getValue(
                "custrecord_blue_grace_config_password"
            );

            log.debug("Username and Password", username + "   " + password)
            // Build the authorization header using encode
            var authHeader = 'Basic ' + encode.convert({
                string: username + ':' + password,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            log.debug("Header", authHeader)
            log.debug("FINAL BODY", bodyData)

            // Send the request to third party with the Authorization header
            const response = https.post({
                url: "https://integration.myblueship.com/api/v1/Shipment",
                body: JSON.stringify(bodyData),
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json",
                },
            });

            log.debug("response", response)
            // Log the response code
            var data = JSON.parse(response.body)
            log.debug("resp-code", data);
            log.debug("resp-code", data.bol);
            record.submitFields({
                type: record.Type.ITEM_FULFILLMENT,
                id: fulfillmentId,
                values: {
                    custbody_bg_booking_request_number: data.bol
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });
        }
        catch (e) {
            log.debug("ERROR", e.message)

        }

    }
    return {
        onAction: onAction
    }
});
