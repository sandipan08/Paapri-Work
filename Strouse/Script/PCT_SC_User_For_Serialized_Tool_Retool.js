/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {
    function beforeLoad(context) {
        log.debug("PCT", "In User Event Script")
    }

    function afterSubmit(context) {
        log.debug("PCT", "In After Submit Script");
        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
            log.debug("PCT", "In Event")
            let newItemReceiptRecord = context.newRecord;
            log.debug("PCT-IR Id", newItemReceiptRecord.getValue('id'))
            let createdfrom = newItemReceiptRecord.getValue({
                fieldId: 'createdfrom'
            });
            getPurchaseOrderDetails(createdfrom).map((element) => {
                record.load({
                    type: 'customrecord_pct_tool',
                    id: element.serializedItemId,
                    isDynamic: true,
                }).setValue({
                    fieldId: 'custrecord_pct_tool_status',
                    value: 1,
                }).setValue({
                    fieldId: 'custrecord_pct_created_from',
                    value: newItemReceiptRecord.getValue('id'),
                }).setValue({
                    fieldId: 'custrecord_pct_latest_transaction',
                    value: createToolTransaction(element.tranid, element.toolItem, element.serializedItemId),
                }).save();

            });
        }
        else {
            log.debug("PCT", "ELSE");
        }
    }

    const createToolTransaction = (tranid, toolItem, serializedItem) => {
        let objRecord = record.create({
            type: 'customrecord_pct_rec_tool_transaction',
            isDynamic: true
        }).setValue({
            fieldId: 'custrecord_pct_sc_po_number',
            value: tranid
        })
            .setValue({
                fieldId: 'custrecord_trans_tool_item',
                value: toolItem
            })
            .setValue({
                fieldId: 'custrecord_pct_trans_tool',
                value: serializedItem
            }).setValue({
                fieldId: 'custrecord_pct_trans_typ',
                value: 5
            });
        let createdToolTransactionId = objRecord.save();
        log.debug("PCT", "Craeted Tool Transaction " + createdToolTransactionId)
        return createdToolTransactionId;
    }
    const getPurchaseOrderDetails = (createdfrom) => {
        log.debug("PCT", "PO ID : " + createdfrom);
        let serializedToolObjArray = [];
        var purchaseorderSearchObj = search.create({
            type: "purchaseorder",
            filters:
                [
                    ["type", "anyof", "PurchOrd"],
                    "AND",
                    ["internalid", "anyof", createdfrom],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["custcol_pct_sc_serialized_tool", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document number" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "custcol_pct_sc_serialized_tool", label: "Serialized Tool" })
                ]
        });
        var searchResultCount = purchaseorderSearchObj.runPaged().count;
        log.debug("PCT", "PO Result Count : " + searchResultCount);
        purchaseorderSearchObj.run().each(function (result) {
            let serializedToolObj = {};
            serializedToolObj['tranid'] = result.getValue('tranid');
            serializedToolObj['item'] = result.getValue('item');
            serializedToolObj['serializedItemName'] = result.getText('custcol_pct_sc_serialized_tool');
            serializedToolObj['serializedItemId'] = result.getValue('custcol_pct_sc_serialized_tool');
            var fieldLookUp = search.lookupFields({
                type: 'customrecord_pct_tool',
                id: result.getValue('custcol_pct_sc_serialized_tool'),
                columns: 'custrecord_pct_tool_item_no'
            });
            log.debug("PCT", fieldLookUp)
            log.debug("PCT", fieldLookUp.custrecord_pct_tool_item_no[0].value)
            serializedToolObj['toolItem'] = fieldLookUp.custrecord_pct_tool_item_no[0].value;
            serializedToolObjArray.push(serializedToolObj);
            return true;
        });
        log.debug("PCT", serializedToolObjArray)
        return serializedToolObjArray;

    }
    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
});
