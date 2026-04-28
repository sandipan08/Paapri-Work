/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-HL-GetInput", details: "In Get Input Function" })

        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["item", "anyof", "2272"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["datecreated", "onorafter", "15/09/2021 12:00 am"]
                ],
            columns:
                [
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({ name: "custbody_pct_hl_created_transaction", label: "HL Web Order Form" }),
                    search.createColumn({ name: "tranid", label: "Document Number" })
                ]
        });
        var SO_count = salesorderSearchObj.runPaged().count;
        log.debug("PCT-HL", "SO result count : " + SO_count);
        var SO_Result = salesorderSearchObj.run().getRange({ start: 0, end: SO_count });
        var SO_id_array = new Array();
        for (var getid_index = 0; getid_index < SO_count; getid_index++)
        {
            var record_id = SO_Result[getid_index].id;
            var amount = SO_Result[getid_index].getValue("amount");
            amount = Math.abs(amount);
            if (amount > 0.5)
            {
                //SO_id_array.push(record_id);
            }
            // log.debug({
            //     title: "PCT-HL",
            //     details: "Sales Order Record ID : " + record_id
            // })
        }
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + SO_id_array.length
        })
        SO_id_array.push(22664);
        return SO_id_array;

    }

    function map(context)
    {
        log.debug({ title: "PCT-HL-MAP", details: "In Map Function" })
        try
        {
            var SO_id = context.value;
            log.debug({
                title: "PCT-HL",
                details: "SO Id : " + SO_id
            })
            var salesOrder_load = record.load({
                type: 'salesorder',
                id: SO_id,
                isDynamic: false,
            });

            // ------------------- Sales Odder Related Record Get ---------------------------------------

            var relatedRecord = salesOrder_load.getLineCount({ sublistId: 'links' });
            for (related_index = 0; related_index < relatedRecord; related_index++)   
            {
                var relatedRecordType = salesOrder_load.getSublistValue({
                    sublistId: 'links',
                    fieldId: 'type',
                    line: related_index
                });
                if (relatedRecordType == "Invoice")
                {
                    var relatedRecordId = salesOrder_load.getSublistValue({
                        sublistId: 'links',
                        fieldId: 'id',
                        line: related_index
                    });
                    log.debug({
                        title: "PCT-HL",
                        details: "Related Record [ Record Type : " + relatedRecordType + ", Record Id : " + relatedRecordId + " ]"
                    })
                }
            }


            var webOrderNumber = salesOrder_load.getValue("custbody_pct_hl_created_transaction");


            //------------------------ Web Order Search ----------------------------------------

            var customrecord_pct_hl_web_orderSearchObj = search.create({
                type: "customrecord_pct_hl_web_order",
                filters:
                    [
                        ["custrecord_pct_hl_shipping_country", "is", "GB"],
                        "AND",
                        ["internalidnumber", "equalto", webOrderNumber]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "custrecord_pct_hl_created_transaction", label: "Created Transaction" })
                    ]
            });
            var WebOrdercount = customrecord_pct_hl_web_orderSearchObj.runPaged().count;
            log.debug("PCT-HL", "Web Order Count : " + WebOrdercount);
            var WebOrderResult = customrecord_pct_hl_web_orderSearchObj.run().getRange({ start: 0, end: WebOrdercount });
            var webOrderId = WebOrderResult[0].id;

            invoiceEdit(webOrderId, relatedRecordId);

            // var HL_shipping_tax_rate = HL_WO_id_load.getValue({ fieldId: 'custrecord_pct_hl_shipping_tax' });

            // // ------------------------------------ Shipping Tax Code Change  -----------------------------

            // if (HL_shipping_tax_rate == 20)
            // {
            //     salesOrder_load.setText({ fieldId: 'shippingtaxcode', text: "VAT:S-GB" });
            // }
            // else if (HL_shipping_tax_rate == 0)
            // {
            //     salesOrder_load.setText({ fieldId: 'shippingtaxcode', text: "VAT:UNDEF-GB" });
            // }



            // var salesorder = salesOrder_load.save();
            // log.debug({ title: 'PCT-HL', details: 'Edited & Save SO Id : ' + salesorder });






        }
        catch (ex) { log.error({ title: 'map: error ', details: ex }); }


        //----------------------------------------------------------------------- Item Function End --------------------------------------------------

    }

    function invoiceEdit(webOrderId, relatedRecordId)
    {
        var invoiceLoad = record.load({
            type: 'invoice',
            id: relatedRecordId,
            isDynamic: true,
        });
        var HL_WO_id_load = record.load({
            type: 'customrecord_pct_hl_web_order',
            id: webOrderId,
            isDynamic: false,
        });
        log.debug({ title: "PCT-HL-invoiceEdit", details: "In Invoice Edit Function" });
        var item_count = HL_WO_id_load.getLineCount({ sublistId: 'recmachcustrecord_pct_hl_link_to_item' });
        for (item_index = 0; item_index < item_count; item_index++)
        {
            var HL_item_id = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_item_id',
                line: item_index
            });
            var HL_line_item_id = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_line_item_id',
                line: item_index
            });
            var HL_item_quantity = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_quantity',
                line: item_index
            });
            var HL_item_rate = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_rate',
                line: item_index
            });
            var HL_item_net = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_net',
                line: item_index
            });
            var HL_item_tax_percentage = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_tax_percentage',
                line: item_index
            });
            var HL_item_discount = HL_WO_id_load.getSublistValue({
                sublistId: 'recmachcustrecord_pct_hl_link_to_item',
                fieldId: 'custrecord_pct_hl_item_discount',
                line: item_index
            });
            log.debug({
                title: "PCT-HL",
                details: "HL Web Order Item Details: ( Item Name/Id : " + HL_item_id + ", HL Line Item Id : " + HL_line_item_id + ", Item Quantity : " + HL_item_quantity + ", Item Rate : " + HL_item_rate + ", Item Tax Percentage : " + HL_item_tax_percentage + " , Item NET Value :" + HL_item_net + "Item Discount : " + HL_item_discount + " )"
            })
            var HL_item_internal_id = search_item(HL_item_id, HL_item_rate);
            var itemCount = invoiceLoad.getLineCount({ sublistId: 'item' });
            for (index = itemCount - 1; index >= 0; index--)
            {
                invoiceLoad.removeLine({ sublistId: 'item', line: index });
            }
            log.debug({ title: "PCT-HL-invoiceEdit", details: "All Line Item deleted" });
            //------------------------------------------------ Add Item in Order --------------------------------------
            invoiceLoad.selectLine({
                sublistId: 'item',
                line: item_index
            });


            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: HL_item_internal_id });
            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_hl_line_item_id', value: HL_line_item_id });
            var tax_obj = getTaxPercent(HL_item_tax_percentage, "GB");
            log.debug({
                title: "PC-HL",
                details: "For Item " + HL_item_id + ", Tax code we put : " + tax_obj.id
            })
            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: tax_obj.id });
            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: HL_item_quantity });
            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: HL_item_rate });
            invoiceLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_pct_hl_item_discount', value: HL_item_discount });
            invoiceLoad.commitLine({ sublistId: 'item' });

            invoiceLoad.save();


        }
    }




    function getTaxPercent(MEGLIO_item_taxPer, countryCode)
    {
        MEGLIO_item_taxPer = parseFloat(MEGLIO_item_taxPer).toFixed(2);
        log.debug({
            title: "PCT-HL",
            details: "In getTaxPercent Function, Item Tax Percentage : " + MEGLIO_item_taxPer + ", Country Code : " + countryCode
        });
        if (MEGLIO_item_taxPer == '' || MEGLIO_item_taxPer == null || isNaN(MEGLIO_item_taxPer))
        {
            MEGLIO_item_taxPer = 0;
        }
        var salestaxitemSearchObj = search.create({
            type: "salestaxitem",
            filters: [
                ["country", "anyof", countryCode]
            ],
            columns: [
                search.createColumn({
                    name: "name",
                    label: "Name"
                }),
                search.createColumn({
                    name: "itemid",
                    label: "Item ID"
                }),
                search.createColumn({
                    name: "rate",
                    label: "Rate"
                }),
                search.createColumn({
                    name: "country",
                    label: "Country"
                }),

                search.createColumn({
                    name: "state",
                    label: "State/Province/County"
                }),
                search.createColumn({
                    name: "county",
                    label: "County"
                }),
                search.createColumn({
                    name: "zip",
                    label: "Zip"
                }),
                search.createColumn({
                    name: "formulanumeric",
                    formula: "ABS(" + MEGLIO_item_taxPer + "-{rate})",
                    sort: search.Sort.ASC,
                    label: "Formula (Numeric)"
                })
            ]
        });
        var taxDetailObj = new Object();
        var item;
        var searchResultCount = salestaxitemSearchObj.runPaged().count;
        log.debug("salestaxitemSearchObj result count", searchResultCount);
        salestaxitemSearchObj.run().each(function (result)
        {
            // .run().each has a limit of 4,000 results
            //return true;
            item = result.id;
            var taxCodeName = result.getValue('name');
            var taxCodeRate = result.getValue('rate');

            taxDetailObj.id = item;
            taxDetailObj.taxName = taxCodeName;
            taxDetailObj.taxRate = taxCodeRate
        });
        log.debug({
            title: 'TAX DETAILS',
            details: taxDetailObj
        })

        return taxDetailObj;
    }

    //----------------------------------------------------------------------- Create Item Function --------------------------------------------------

    function search_item(HL_item_id, HL_item_rate)
    {
        var HL_item_internal_id;
        log.debug({
            title: "PCT-HL",
            details: "InSide Item Function - Item Name/Id : " + HL_item_id + ", Item Rate :" + HL_item_rate
        })
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["name", "is", HL_item_id],
                    "AND",
                    ["type", "anyof", "Assembly", "InvtPart"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var itemsearch_count = itemSearchObj.runPaged().count;
        var item_searchresult = itemSearchObj.run().getRange({ start: 0, end: itemsearch_count });
        if (itemsearch_count > 0)
        {
            log.debug({ title: "PCT-HL", details: "Item " + HL_item_id + " Already Present " })
            var HL_item_internal_id = item_searchresult[0].id;
            log.debug({ title: "PCT-HL ", details: "Present Item ID :" + HL_item_internal_id })
            return HL_item_internal_id;
        }
        else
        {
            var assemblyitemSearchObj = search.create({
                type: "assemblyitem",
                filters:
                    [
                        ["type", "anyof", "Assembly"],
                        "AND",
                        ["custitem_pct_hl_aliascode_amazon", "is", HL_item_id],
                        "AND",
                        ["custitem_pct_hl_aliascode_horeb", "is", HL_item_id],
                        "AND",
                        ["custitem_pct_hl_additional_alias", "is", HL_item_id]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var itemsearch_count = assemblyitemSearchObj.runPaged().count;
            var item_searchresult = assemblyitemSearchObj.run().getRange({ start: 0, end: itemsearch_count });
            if (itemsearch_count > 0)
            {
                log.debug({ title: "PCT-HL", details: "Item " + HL_item_id + " Already Present " })
                var HL_item_internal_id = item_searchresult[0].id;
                log.debug({ title: "PCT-HL ", details: "Present Item ID :" + HL_item_internal_id })
                return HL_item_internal_id;
            }
            else
            {
                return 0;
            }
        }
    }
    return {
        getInputData: getInputData,
        map: map
    }
});
