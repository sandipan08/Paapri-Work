/**
* Module Description
*
* Version       Date            		Author            Remarks
* 2.00        22 August 2022          Sandipan Sau
*
*
*@NApiVersion 2.1
*@NScriptType UserEventScript
*/

/**********************************************************************************************************************************************
Script Name:        PCT_BLC_User_QtyReceive
Developer:          Sandipan Sau  
Development Head:   Subha Paul
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This UserEvent Script will fetch Qty Receive from Purchase Order & Item Receipt and put it in Bill.
© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
 * 
Function Name:             			                              Purpose:                                                               Developer:
beforeLoad                                                     Main Function                                                             Sandipan Sau
afterSubmit                                                    Main Function                                                             Sandipan Sau
qtyReceiveChange                              Change the Quantity of Qty Receive in Vendor Bill                                          Sandipan Sau
purchaseOrderDataGet                          Get Purchase Order Line Level Data (Qty Receive Qty)                                       Sandipan Sau
itemReceiveDataGet                            Get Item Receive Line Level Data (Qty Receive Qty)                                         Sandipan Sau
vendorBillQtyReceive                          Function to find Qty Receive of Item in Object Array                                       Sandipan Sau
getBillId                                     Function to get Bill Id of corresponding Purchase Order                                    Sandipan Sau
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/

define(['N/record', 'N/search'], function (record, search) {
    function beforeLoad(context) {
        let recordLoad = context.newRecord;
        log.debug(`PCT-BLC`, `In Before Load`);
        // ---------------------------------------- Operation from PO -------------------------
        if (context.type === context.UserEventType.CREATE && context.newRecord.type == 'vendorbill') {
            log.debug({
                title: `PCT-BLC`,
                details: `Context from Purchase Order | Create : ${JSON.stringify(context.request.parameters)}`
            })
            if (context.request.parameters.id) {
                let recordFromId = context.request.parameters.id;
                if (recordFromId) {
                    let objArray = purchaseOrderDataGet(recordFromId, context.type);
                    qtyReceiveChange(objArray, recordLoad);
                }
            }
        }
        if (context.type === context.UserEventType.EDIT && context.newRecord.type == 'vendorbill') {
            // let poCount = context.newRecord.getLineCount({ sublistId: 'purchaseorders' });

            let poId = context.newRecord.getSublistValue({
                sublistId: 'purchaseorders',
                fieldId: 'id',
                line: 0
            });
            log.debug(`PCT-BLC`, `PO ID : ` + poId);
            if (poId) {
                let objArray = purchaseOrderDataGet(poId, context.type);
                qtyReceiveChange(objArray, recordLoad);
            }
        }
        // ---------------------------------------- Operation from PO -------------------------
        if (context.type === context.UserEventType.CREATE && context.newRecord.type == 'vendorbill') {
            log.debug({
                title: `PCT-BLC`,
                details: `Context from Item Receipt | Create : ${JSON.stringify(context.request.parameters)}`
            })
            if (context.request.parameters.itemrcpt) {
                let objArray = itemReceiveDataGet(context.request.parameters.itemrcpt);
                qtyReceiveChange(objArray, recordLoad);
            }
        }

    }
    // function afterSubmit(context) {
    //     log.debug(`PCT-BLC`, `In After Submit`);
    //     if (context.newRecord.type == 'itemreceipt') {
    //         let createdFrom = context.newRecord.getValue('createdfrom');
    //         log.debug(`PCT-BLC`, `Created From : ${createdFrom}`);
    //         let poId = getBillId(createdFrom);
    //         if (poId) {
    //             let billLoad = record.load({
    //                 type: 'vendorbill',
    //                 id: getBillId(createdFrom)
    //             });
    //             let objArray = purchaseOrderDataGet(createdFrom);
    //             qtyReceiveChange(objArray, billLoad);
    //             billLoad.save();
    //         }
    //     }
    // }

    // Function to Change the Qty Receive
    const qtyReceiveChange = (objArray, recordLoad) => {
        log.debug(`PCT-BLC`, `Operation Started for Vendor Bill`);
        let vendorBillItemCount = recordLoad.getLineCount({ sublistId: 'item' });
        for (itemIndex = 0; itemIndex < vendorBillItemCount; itemIndex++) {
            let item = recordLoad.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: itemIndex
            });
            var vendorBillQtyReceiveResponse = vendorBillQtyReceive(objArray, item);
            log.debug(`--------------------- : ${vendorBillQtyReceiveResponse}`)
            if (vendorBillQtyReceiveResponse) {
                // log.debug(`PCT-BLC`, `Qty Received : ${vendorBillQtyReceive(objArray, item)} for Item ${item}`)
                recordLoad.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_qty_received_field',
                    line: itemIndex,
                    value: vendorBillQtyReceiveResponse.quantityReceived
                });
            }
        }

    }

    // ----------------------------------------------- Function to Get Purchase Order Data Get ----------------------------------
    const purchaseOrderDataGet = (recordFromId, type) => {
        let purchaseOrderLoad = record.load({
            type: 'purchaseorder',
            id: recordFromId
        });
        let itemCount = purchaseOrderLoad.getLineCount({ sublistId: 'item' });
        let objArray = [];
        for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            let obj = {};
            let item = purchaseOrderLoad.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: itemIndex
            });
            let quantityReceived = purchaseOrderLoad.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantityreceived',
                line: itemIndex
            });
            let billedQty = purchaseOrderLoad.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantitybilled',
                line: itemIndex
            });
            obj['item'] = item;
            if (type == 'create') {
                obj['quantityReceived'] = quantityReceived - billedQty;
            }
            else {
                obj['quantityReceived'] = quantityReceived;
            }
            objArray.push(obj)
            // log.debug(`PCT-BLC`, `Qty Received : ${quantityReceived} for Item ${item}`)
        }
        log.debug(`PCT-BLC`, `Object : ${JSON.stringify(objArray)}`);
        return objArray;
    }


    // ------------------------------- Function to Get Item Receive Data Get ------------------------------------
    const itemReceiveDataGet = (recordFromId) => {
        let itemReceiveLoad = record.load({
            type: 'itemreceipt',
            id: recordFromId
        });
        let itemCount = itemReceiveLoad.getLineCount({ sublistId: 'item' });
        let objArray = [];
        for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            let obj = {};
            let item = itemReceiveLoad.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: itemIndex
            });

            let quantityReceived = itemReceiveLoad.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: itemIndex
            });
            obj['item'] = item;
            obj['quantityReceived'] = quantityReceived;
            objArray.push(obj)
            // log.debug(`PCT-BLC`, `Qty Received : ${quantityReceived} for Item ${item}`)
        }
        log.debug(`PCT-BLC`, `Object : ${JSON.stringify(objArray)}`);
        return objArray;
    }

    // ------------------------------- Function to Get Qty Receive of Item in Purchase Order -----------------------------
    const vendorBillQtyReceive = (objArray, item) => {
        log.debug(`PCT-BLC`, `Object : ${JSON.stringify(objArray)}`);
        return objArray.find((element) => element.item.toString() === item.toString());
        // var returnArray = objArray.find((element) => {
        //     if (element.item.toString() === item.toString()) {
        //         log.debug(`PCT-BLC`, `Element : ${JSON.stringify(element)}`);
        //     }
        // })
        // log.debug(`PCT-BLC`, `Return Array : ${returnArray} `);
        // return returnArray;
    }

    // Function to Get Qty Receive of Item in Purchase Order 
    // const getBillId = (poId) => {
    //     let billId;
    //     var vendorbillSearchObj = search.create({
    //         type: "vendorbill",
    //         filters:
    //             [
    //                 ["type", "anyof", "VendBill"],
    //                 "AND",
    //                 ["createdfrom", "anyof", poId],
    //                 "AND",
    //                 ["mainline", "is", "T"]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "internalid", label: "Internal ID" })
    //             ]
    //     });
    //     // var searchResultCount = vendorbillSearchObj.runPaged().count;
    //     // log.debug("vendorbillSearchObj result count", searchResultCount);
    //     vendorbillSearchObj.run().each(function (result) {
    //         billId = result.id;

    //         return true;
    //     });
    //     return billId;

    // }


    return {
        beforeLoad: beforeLoad,
        // afterSubmit: afterSubmit
    }
});