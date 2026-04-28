/**
 *        Health Lead - PCT Connect using REST Service
 *@author       Arup Sarkar
 *@since        2020-02-23 (yyyy-MM-dd)
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.0 code in this page is for Health Lead, you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
                
 *@description  This Restlet is used to add/get Ebay Web Order custom record.
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary
03-19-2021			   Kunal_Das				                				 Generate Service name, Create Parent Record 
****************************************************************************************/
define(['N/task', 'N/record', 'N/error', 'N/log', 'N/format', 'N/search'],
    function (task, record, error, log, format, search)
    {
        var CUST_REC_Ebay_Web_Order = "customrecord_pct_hl_web_order";
        var CUST_REC_Web_Ordr_Line_Item = "recmachcustrecord_pct_hl_link_to_item";
        function _post(context)
        {
            var datTimeStamp = new Date();
            var currentHours = datTimeStamp.getHours();
            var currentMinutes = datTimeStamp.getMinutes();
            var checkampm = currentHours >= 12 ? 'PM' : 'AM';
            currentHours = currentHours % 12;
            currentHours = currentHours ? currentHours : 12;
            currentMinutes = currentMinutes < 10 ? '0' + currentMinutes : currentMinutes;
            var currentDate = datTimeStamp.getDate() + "/" + (datTimeStamp.getMonth() + 1) + "/" + datTimeStamp.getFullYear();
            var currentTime = currentHours + ':' + currentMinutes + ' ' + checkampm;
            var intervals = 4
            var serviceName = getService(intervals, currentDate, currentTime);
            var generatedServiceName = currentDate + " " + currentTime + " " + serviceName;
            log.debug({
                title: "Team Innovation",
                details: 'Curren Date:' + generatedServiceName
            });

            var dataLength = context.length;
            var parentRecord = checkAvailableService(generatedServiceName);
            if (parseInt(parentRecord) == 0)
            {
                var serviceRecord = record.create({
                    type: 'customrecord_pct_hl_service_call_history',
                    isDynamic: true
                });
                serviceRecord.setValue({
                    fieldId: 'name',
                    value: generatedServiceName,
                }).setValue({
                    fieldId: 'custrecord_pct_hl_service_date',
                    value: currentDate,
                }).setValue({
                    fieldId: 'custrecord_pct_hl_service_time',
                    value: currentTime,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custrecord_pct_hl_service_data_length',
                    value: dataLength,
                    ignoreFieldChange: true
                });

                var parentRecord = serviceRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }
            else
            {
                var serviceLookUp = search.lookupFields({
                    type: 'customrecord_pct_hl_service_call_history',
                    id: parentRecord,
                    columns: ['custrecord_pct_hl_service_data_length']
                });
                var previousLength = serviceLookUp.custrecord_pct_hl_service_data_length;
                log.debug({
                    title: "Team Innovation",
                    details: 'Previous Data Length:' + previousLength
                });
                log.debug({
                    title: "Team Innovation",
                    details: 'Old Data Length:' + dataLength
                });
                dataLength = parseInt(previousLength) + parseInt(dataLength);
                log.debug({
                    title: "Team Innovation",
                    details: 'Updated Data Length:' + dataLength
                });
                var otherId = record.submitFields({
                    type: 'customrecord_pct_hl_service_call_history',
                    id: parentRecord,
                    values: {
                        'custrecord_pct_hl_service_data_length': dataLength
                    }
                });
            }
            log.debug({
                title: "Team Innovation",
                details: 'Parent Record ID:' + parentRecord
            });
            log.debug({
                title: "Team Innovation | Incoming data",
                details: context
            });
            return AddCustomRecord(context, dataLength, parentRecord);

        }

        /**
         * This method is used to add custom record in netsuite.
         * 
         * @param {Object} data is the json object coming from PCT Connect
         * This method create the custom record of type = CUST_REC_Web_Orders
         */
        function AddCustomRecord(data, length, serviceId)
        {
            var _dataCount = length;
            log.debug({
                title: "PCT Connect | Team Innovation",
                details: "Data Count " + _dataCount
            });
            var createdRecordsCount = 0;
            var errorRecordsCount = 0;
            var errorRecords = new Array();
            var insertedRecord = new Array();
            data.forEach(function (order)
            {
                var customRecord = record.create({
                    type: CUST_REC_Ebay_Web_Order,
                    isDynamic: true
                });
                //adding body fields
                AddBodyField(customRecord, order, serviceId);
                //adding line items
                AddLineItem(customRecord, order.Items);
                // // Saving custom record. 

                if (customRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: false
                }))
                {
                    createdRecordsCount++;
                    insertedRecord.push({ "OrderNumber": order.SalesOrderNumber });
                }
                else
                {
                    errorRecordsCount++;
                    errorRecords.push({ "OrderNumber": order.SalesOrderNumber });
                }
            });
            var returnObj = new Object();
            returnObj.NoOfInsertedRecords = createdRecordsCount;
            returnObj.NoOfErrorRecords = errorRecordsCount;
            returnObj.ErrorObjects = errorRecords;
            returnObj.InsertedRecords = insertedRecord;

            return returnObj;
        }

        /**
        * This method is used to add body fields in given record object
        *
        * @param {Object} record
        * @param {Object} value
        */
        function AddBodyField(record, value, serviceId)
        {
            // log.debug({
            //     title: "Team Innovation",
            //     details: value
            // });
            record.setValue({
                fieldId: 'custrecord_pct_hl_customer_email',
                value: NullCheck(value.CustomerEmail),//"asarkar@paapri.com",//function(){if((value.CustomerEmail) == "Invalid Request"){return "asarkar@paapri.com";}},
                ignoreFieldChange: true
                //  }).setValue({
                //      fieldId : 'custrecord_pct_hl_customer_error',
                //      value : value.CustomerError,
                //      ignoreFieldChange : true
            }).setValue({
                fieldId: 'custrecord_pct_hl_customer_name',
                value: value.CustomerName,//value.CustomerName,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_customer_phone_number',
                value: value.CustomerPhoneNumber,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_order_date',
                value: value.OrderDate,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_customer_abs_cid',
                value: value.CustomerAbsCid,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_sales_order_number',
                value: value.SalesOrderNumber,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_payment_method',
                value: value.PaymentMethod,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_category_name',
                value: value.CategoryName,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_order_date',
                value: FormateDate(value.OrderDate),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_address1',
                value: value.ShippingAddress1,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_address2',
                value: value.ShippingAddress2,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_addressee',
                value: value.ShippingAddressee,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_city',
                value: value.ShippingCity,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_cost',
                value: value.ShippingCost,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_country',
                value: value.ShippingCountry,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_method',
                value: value.ShippingMethod,
                ignoreFieldChange: true
                //  }).setValue({
                //      fieldId : 'custrecord_pct_hl_shipping_method_error',
                //      value : true,//value.ShippingMethodError,
                //      ignoreFieldChange : true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_phone_number',
                value: value.ShippingPhoneNumber,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_state',
                value: value.ShippingState,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_zip',
                value: value.ShippingZip,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_weborder_source',
                value: value.Source,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_order_status',
                value: value.OrderStatus,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_phone',
                value: value.BillingPhone,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_country',
                value: value.BillingCountry,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_addressee',
                value: value.BillingAddressee,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_address1',
                value: value.BillingAddress1,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_address2',
                value: value.BillingAddress2,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_city',
                value: value.BillingCity,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_state',
                value: value.BillingState,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_zip',
                value: value.BillingZip,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_billing_address',
                value: value.BillingAddress,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_adjustment_discount',
                value: value.DiscountAdjustment,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_sub_total',
                value: value.Subtotal,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_packages_weight',
                value: value.Weight,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_packages_tracking_id',
                value: value.TrackingID,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_packages_description',
                value: value.TrackingDescription,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_tax_amount',
                value: value.ShippingTax,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_shipping_tax',
                value: value.ShippingTaxRate,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_hl_service_id',
                value: serviceId,
                ignoreFieldChange: true
            });
        }
        /**
          * This method is used to add line item on a given record object. 
          * 
          * @param {Object} record 
          * @param {Object} value 
          */
        function AddLineItem(record, value)
        {

            // log.debug({
            //     title: "PCT Connect | Team Innovation",
            //     details: value
            // });

            value.forEach(function (eachValue)
            {
                record.selectNewLine({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_amount',
                    value: eachValue.ItemAmount
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_item_id',
                    value: eachValue.ItemSKU
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_quantity',
                    value: eachValue.Quantity
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_rate',
                    value: eachValue.ItemRate
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_gross',
                    value: eachValue.ItemAmount
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_tax_percentage',
                    value: eachValue.TaxPercentage
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_tax_amount',
                    value: eachValue.TaxAmount
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_net',
                    value: eachValue.NET
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_taxable',
                    value: BoolCheck(eachValue.ItemTaxable)
                }).setCurrentSublistValue({
                    sublistId: CUST_REC_Web_Ordr_Line_Item,
                    fieldId: 'custrecord_pct_hl_item_discount',
                    value: eachValue.Discount
                }).commitLine({
                    sublistId: CUST_REC_Web_Ordr_Line_Item
                });
            });
        }
        function checkAvailableService(serviceName)
        {
            log.debug({
                title: 'PCT Connect',
                details: 'Param Service Name:' + serviceName
            });
            var serviceNameSearch = search.create({
                type: "customrecord_pct_hl_service_call_history",
                filters:
                    [
                        ["name", "haskeywords", serviceName]
                    ],
                columns: [

                ]
            });
            var serviceSearchResultCount = serviceNameSearch.runPaged().count;
            log.debug("PCT Connect", 'Service Name Search Count:' + serviceSearchResultCount);
            var serviceNameResult = serviceNameSearch.run().getRange({
                start: 0,
                end: serviceSearchResultCount
            });
            var recordServiceId = 0;
            if (serviceSearchResultCount > 0)
            {
                recordServiceId = serviceNameResult[parseInt(serviceSearchResultCount) - 1].id;
                log.debug({
                    title: 'PCT Connect',
                    details: 'Founded Service Id:' + recordServiceId
                });
            }
            return recordServiceId;
        }
        /**
         * This method is used to formate the date (string)
         * Note: In SuiteScript 2.0 you have to strickly follor the Date/Time formate
         * 
         * @param {string} value 
         */
        function FormateDate(value)
        {
            return format.parse({
                value: value,
                type: format.Type.DATE
            });
        }

        /**
        * This method is used to check null value
        * @param {string} value 
        */

        function NullCheck(value)
        {
            if (value == null || value == undefined)
                return "";
            else
                return value;
        }

        /**
        * This method is used to check Boolean value
        * @param {string} value 
        */

        function BoolCheck(value)
        {
            if (value == null || value == undefined || value == "false")
                return false;
            else
                return true;
        }

        return {
            post: _post
        }
    });
function getService(setInterval, currentDate, currentTime)
{
    var interval = setInterval
    var convertedMinute = 60 * interval;
    var times = new Array();
    var timeTrack = 0;
    var timeFlag = '';
    for (var timeIndex = 0; timeTrack <= 24 * 60; timeIndex++)
    {
        var hh = Math.floor(timeTrack / 60);
        var mm = (timeTrack % 60);
        var convertedMinutes = mm < 10 ? '0' + mm : mm;
        var calculateAMPM = hh >= 12 && hh < 24 ? 'PM' : 'AM';
        if (hh == 0 || hh == 24)
        {
            var genretedHours = '00';
        }
        else
        {
            var genretedHours = hh % 12;
            genretedHours = genretedHours ? '0' + genretedHours : 12;
        }
        var generatedRange = genretedHours + ':' + convertedMinutes + ' ' + calculateAMPM;
        if (timeIndex == 0)
        {
            timeFlag = generatedRange;
        }
        else
        {
            var range = new Object();
            range['startTime'] = timeFlag;
            range['endTime'] = generatedRange;
            times.push(range);
            timeFlag = generatedRange;
        }
        timeTrack = timeTrack + convertedMinute;
    }
    var timesLength = times.length;
    for (var checkTimeIndex = 0; checkTimeIndex < timesLength; checkTimeIndex++)
    {
        var currentStartTime = times[checkTimeIndex].startTime;
        var currentEndTime = times[checkTimeIndex].endTime;
        var currentFormatedDate = currentDate + " " + currentTime;
        var startFormatedDate = currentDate + " " + currentStartTime;
        var endFormatedDate = currentDate + " " + currentEndTime;
        var now = new Date(currentFormatedDate).getTime();
        var startTime = new Date(startFormatedDate).getTime();
        var endTime = new Date(endFormatedDate);
        if ((checkTimeIndex + 1) == timesLength && currentEndTime == '00:00 AM')
        {
            endTime.setDate(endTime.getDate() + 1);
            endTime = endTime.getTime();
        }
        else
        {
            endTime = endTime.getTime();
        }
        if (now >= startTime && now < endTime)
        {
            return 'Service ' + (checkTimeIndex + 1);
            break;
        }
    }
}
Date.prototype.addDays = function (days)
{
    this.setDate(this.getDate() + parseInt(days));
    return this;
};