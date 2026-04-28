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
            let itemReceiptObj = {}
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
                    receiptItemObj['itemType'] = result[receiptIndex].getValue({
                        name: "custitem_pct_eqs_item_type",
                        join: "item",
                        label: "ITEM TYPE"
                    });
                    receiptItemObj['itemDefinedCost'] = result[receiptIndex].getValue({
                        name: "costestimate",
                        join: "item",
                        label: "Item Defined Cost"
                    });
                    receiptItemObj['itemUnit'] = result[receiptIndex].getValue({
                        name: "unitstype",
                        join: "item",
                        label: "Primary Units Type"
                    });
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
                    receiptItemObj['itemId'] = itemId;
                    receiptItemObj['poNumber'] = result[receiptIndex].getText({
                        name: "createdfrom",
                        label: "Created From"
                    });
                    receiptItemObj['poId'] = result[receiptIndex].getValue({
                        name: "createdfrom",
                        label: "Created From"
                    });
                    receiptItemObj['poAmount'] = result[receiptIndex].getValue({
                        name: "amount",
                        join: "createdFrom",
                        label: "Amount"
                    });
                    // let key = `${itemId}-${lotNumber}`;
                    // if (!(key in itemReceiptObj)) {
                    //     itemReceiptObj[key] = []
                    //     itemReceiptObj[key].push(receiptItemObj)
                    // }
                    // else {
                    //     itemReceiptObj[key].push(receiptItemObj)
                    // }
                    if (!(itemId in itemReceiptObj)) {
                        itemReceiptObj[itemId] = {}
                        itemReceiptObj[itemId]['itemReceipt'] = []
                        itemReceiptObj[itemId]['itemReceipt'].push(receiptItemObj)
                    }
                    else {
                        itemReceiptObj[itemId]['itemReceipt'].push(receiptItemObj)
                    }
                }
                end += 1000;
                start += 1000;
                itemReceiptCount -= 1000;
            }
            while (itemReceiptCount > 0);
            log.debug("PCT-Strouse", "Receipt Obj : " + JSON.stringify(itemReceiptObj))
            return { 'isSuccess': true, 'data': itemReceiptObj }
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


// "2590": [
//     {
//         "serialLotNumber": "333174F(17280)\n333208I(155520)",
//         "itemReceiptId": "17572",
//         "itemReceipt": "IR730",
//         "itemType": "",
//         "itemDefinedCost": "",
//         "itemUnit": "7",
//         "itemName": "2380-W1.889",
//         "itemDescription": "",
//         "itemId": "2590",
//         "poNumber": "16552",
//         "poAmount": "5120.64"
//     }
// ],
// "2668": [
//     {
//         "serialLotNumber": "333248D",
//         "itemReceiptId": "19054",
//         "itemReceipt": "IR768",
//         "itemType": "",
//         "itemDefinedCost": "",
//         "itemUnit": "7",
//         "itemName": "2380-W0.94488",
//         "itemDescription": "",
//         "itemId": "2668",
//         "poNumber": "16547",
//         "poAmount": "557.93"
//     },
//     {
//         "serialLotNumber": "333248D",
//         "itemReceiptId": "19277",
//         "itemReceipt": "IR776",
//         "itemType": "",
//         "itemDefinedCost": "",
//         "itemUnit": "7",
//         "itemName": "2380-W0.94488",
//         "itemDescription": "",
//         "itemId": "2668",
//         "poNumber": "17546",
//         "poAmount": "557.93"
//     },
//     {
//         "serialLotNumber": "333247A",
//         "itemReceiptId": "19279",
//         "itemReceipt": "IR777",
//         "itemType": "",
//         "itemDefinedCost": "",
//         "itemUnit": "7",
//         "itemName": "2380-W0.94488",
//         "itemDescription": "",
//         "itemId": "2668",
//         "poNumber": "18299",
//         "poAmount": "1115.86"
//     }
// ],
// "2701": [
//     {
//         "serialLotNumber": "1052A00005(4968)\n1052A00007(4968)",
//         "itemReceiptId": "17583",
//         "itemReceipt": "IR731",
//         "itemType": "",
//         "itemDefinedCost": "",
//         "itemUnit": "7",
//         "itemName": "97057-W0.5",
//         "itemDescription": "",
//         "itemId": "2701",
//         "poNumber": "14275",
//         "poAmount": "4715.40"
//     }
// ],