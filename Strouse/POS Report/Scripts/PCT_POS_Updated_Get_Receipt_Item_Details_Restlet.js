/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        log.debug("PCT-Strouse", "In Generate POS Report Restlet");
        let filterObjResponse = JSON.parse(context.params);
        let vendorId = filterObjResponse.vendorId;
        let fromDate = filterObjResponse.fromDate;
        let toDate = filterObjResponse.toDate;
        return getItemFromReceipt(vendorId, changeDateFormat(fromDate), changeDateFormat(toDate));
    }

    const getItemFromReceipt = (vendorId, fromDate, toDate) => {
        try {
            let itemReceiptArray = []
            var itemreceiptSearchObj = search.create({
                type: "itemreceipt",
                filters:
                    [
                        ["type", "anyof", "ItemRcpt"],
                        "AND",
                        // ["vendor.internalid", "anyof", "3141"],
                        ["vendor.internalid", "anyof", vendorId],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        // ["datecreated", "within", "10/1/2023 12:00 am", "11/1/2023 11:59 pm"]
                        ["trandate", "within", fromDate, toDate]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({
                            name: "custitem_pct_eqs_item_type",
                            join: "item",
                            label: "ITEM TYPE"
                        }),
                        search.createColumn({
                            name: "costestimate",
                            join: "item",
                            label: "Item Defined Cost"
                        }),
                        search.createColumn({
                            name: "unitstype",
                            join: "item",
                            label: "Primary Units Type"
                        }),
                        search.createColumn({
                            name: "itemid",
                            join: "item",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "vendorname",
                            join: "item",
                            label: "Vendor Name"
                        }),
                        search.createColumn({
                            name: "salesdescription",
                            join: "item",
                            label: "Description"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "item",
                            label: "Internal ID"
                        }),
                        search.createColumn({ name: "serialnumbers", label: "Serial/Lot Numbers" }),
                        search.createColumn({ name: "createdfrom", label: "Created From" }),
                        search.createColumn({
                            name: "amount",
                            join: "createdFrom",
                            label: "Amount"
                        })
                    ]
            });
            var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
            log.debug("Item Receipt Count", itemReceiptCount);
            var start = 0;
            var end = 1000;
            do {
                var result = itemreceiptSearchObj.run().getRange({
                    start: start,
                    end: end
                });
                for (let receiptIndex = 0; receiptIndex < result.length; receiptIndex++) {
                    let receiptItemObj = {};
                    let itemId = result[receiptIndex].getValue({
                        name: "internalid",
                        join: "item",
                        label: "Internal ID"
                    });
                    let lotNumber = result[receiptIndex].getValue({ name: "serialnumbers", label: "Serial/Lot Numbers" })
                    receiptItemObj['serialLotNumber'] = lotNumber;
                    receiptItemObj['itemReceiptId'] = result[receiptIndex].id;
                    receiptItemObj['itemReceipt'] = result[receiptIndex].getValue({ name: "tranid", label: "Document Number" });
                    receiptItemObj['itemName'] = result[receiptIndex].getValue({
                        name: "itemid",
                        join: "item",
                        label: "Name"
                    });
                    receiptItemObj['itemDescription'] = result[receiptIndex].getValue({
                        name: "salesdescription",
                        join: "item",
                        label: "Description"
                    });
                    receiptItemObj['itemId'] = parseInt(itemId);
                    receiptItemObj['poNumber'] = result[receiptIndex].getText({
                        name: "createdfrom",
                        label: "Created From"
                    });
                    receiptItemObj['poAmount'] = result[receiptIndex].getValue({
                        name: "amount",
                        join: "createdFrom",
                        label: "Amount"
                    });
                    itemReceiptArray.push(receiptItemObj)
                }
                end += 1000;
                start += 1000;
                itemReceiptCount -= 1000;
            }
            while (itemReceiptCount > 0);
            log.debug("PCT-Strouse", "Receipt Obj : " + JSON.stringify(itemReceiptArray))
            return { 'isSuccess': true, 'data': itemReceiptArray }
        }
        catch (error) {
            return { 'isSuccess': false, 'data': error.message }
        }
    }
    function changeDateFormat(dateFormat) {
        let date = new Date(dateFormat);
        let dd = date.getDate()
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        let nowDate = mm + "/" + dd + "/" + yyyy;
        return nowDate;
    }

    return {
        get: _get,
    }
});


