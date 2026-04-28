/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        log.debug("PCT-Strouse", "In Invoice Details Restlet");
        log.debug("PCT-SC", context.params);
        return getInvoiceDetails(context.params)
    }
    const getInvoiceDetails = (itemId) => {
        log.debug("PCT", "Item : " + itemId + ", type : " + typeof itemId)
        try {
            let invoiceArray = [];
            var invoiceSearchObj = search.create({
                type: "invoice",
                filters:
                    [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["item", "anyof", itemId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            join: "customerMain",
                            label: "Name"
                        }),
                        search.createColumn({ name: "shipaddress", label: "Shipping Address" }),
                        search.createColumn({ name: "shipaddress1", label: "Shipping Address 1" }),
                        search.createColumn({ name: "shipaddressee", label: "Shipping Addressee" }),
                        search.createColumn({ name: "shippingattention", label: "Shipping Attention" }),
                        search.createColumn({ name: "shipcity", label: "Shipping City" }),
                        search.createColumn({ name: "shipcountry", label: "Shipping Country" }),
                        search.createColumn({ name: "shipphone", label: "Shipping Phone" }),
                        search.createColumn({ name: "shipaddress2", label: "Shipping Address 2" }),
                        search.createColumn({ name: "shipstate", label: "Shipping State/Province" }),
                        search.createColumn({ name: "shipzip", label: "Shipping Zip" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "quantity", label: "Quantity" }),
                        search.createColumn({ name: "item", label: "Item" })
                    ]
            });
            var invoiceCount = invoiceSearchObj.runPaged().count;
            log.debug("PCT_SC", "Invoice Search Count : " + invoiceCount);
            if (invoiceCount > 0) {
                var start = 0;
                var end = 1000;
                do {
                    var result = invoiceSearchObj.run().getRange({
                        start: start,
                        end: end
                    });
                    for (let invoiceIndex = 0; invoiceIndex < result.length; invoiceIndex++) {
                        let invoiceObj = {};
                        invoiceObj['internalId'] = result[invoiceIndex].id;
                        invoiceObj['shipaddress'] = result[invoiceIndex].getValue('shipaddress');
                        invoiceObj['shipaddress1'] = result[invoiceIndex].getValue('shipaddress1');
                        invoiceObj['shipaddressee'] = result[invoiceIndex].getValue('shipaddressee');
                        invoiceObj['shipcity'] = result[invoiceIndex].getValue('shipcity');
                        invoiceObj['shipcountry'] = result[invoiceIndex].getValue('shipcountry');
                        invoiceObj['shipstate'] = result[invoiceIndex].getValue('shipstate');
                        invoiceObj['shipzip'] = result[invoiceIndex].getValue('shipzip');
                        invoiceObj['date'] = result[invoiceIndex].getValue('trandate');
                        invoiceObj['documentNumber'] = result[invoiceIndex].getValue('tranid');
                        invoiceObj['itemQuantity'] = result[invoiceIndex].getValue('quantity');
                        invoiceArray.push(invoiceObj);
                    }
                    end += 1000;
                    start += 1000;
                    invoiceCount -= 1000;
                }
                while (invoiceCount > 0);
                log.debug("PCT-Strouse", "Invoice Response Array If : " + JSON.stringify(invoiceArray))
                return { 'isSuccess': true, 'data': invoiceArray }
            }
            else {
                let invoiceObj = {};
                invoiceObj['internalId'] = '';
                invoiceObj['shipaddress'] = ''
                invoiceObj['shipaddress1'] = '';
                invoiceObj['shipaddressee'] = '';
                invoiceObj['shipcity'] = '';
                invoiceObj['shipcountry'] = '';
                invoiceObj['shipstate'] = '';
                invoiceObj['shipzip'] = '';
                invoiceObj['date'] = '';
                invoiceObj['documentNumber'] = '';
                invoiceObj['itemQuantity'] = '';
                invoiceArray.push(invoiceObj);
                log.debug("PCT-Strouse", "Issue Response Array If : " + JSON.stringify(invoiceArray))
                return { 'isSuccess': true, 'data': invoiceArray }
            }

        }
        catch (error) {
            log.debug("PCT-Strouse", error.message)
            return { 'isSuccess': false, 'data': error.message }
        }
    }


    return {
        get: _get,
    }
});
