/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */

define(['N/log', 'N/record', 'N/search'], function (log, record, search,) {

    function pageInit(context) {
        log.debug("PCT-JAG", "In Page Init Function");
    }


    function fieldChanged(context) {

        let quantityAvailable = 0;
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        let location = currentRecord.getValue('custbody_pct_master_wo_location')


        // if ((sublistName === 'recmachcustrecord_pct_master_wo_issue' && sublistFieldName === 'custrecord_pct_master_wo_issue_lot') || (sublistName === 'recmachcustrecord_pct_master_wo_issue' && sublistFieldName === 'custrecord_pct_master_wo_issue_item') || (sublistName === 'recmachcustrecord_pct_master_wo_issue' && sublistFieldName === 'custrecord_pct_master_wo_issue_qty')) {
        if ((sublistName === 'recmachcustrecord_pct_master_wo_issue' && sublistFieldName === 'custrecord_pct_master_wo_issue_lot')) {
            log.debug("PCT-JAG", "IN FIELD CHANGED");

            let componentItemId = currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_master_wo_issue',
                fieldId: 'custrecord_pct_master_wo_issue_item'
            })
            let componentLotNoId = currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_master_wo_issue',
                fieldId: 'custrecord_pct_master_wo_issue_lot'
            })

            log.debug("PCT-JAG", "Location : " + location + ", Component Id : " + componentItemId + ", Component Lot : " + componentLotNoId);
            var inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type", "anyof", "InvtPart"],
                        "AND",
                        ["inventorynumber.location", "anyof", location],
                        "AND",
                        ["inventorynumber.internalid", "anyof", componentLotNoId],
                        "AND",
                        ["internalid", "anyof", componentItemId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "quantityavailable",
                            join: "inventoryNumber",
                            label: "Available"
                        }),
                        search.createColumn({
                            name: "quantityonhand",
                            join: "inventoryNumber",
                            label: "On Hand"
                        })
                    ]
            });
            var lotNumberQuantityCount = inventoryitemSearchObj.runPaged().count;
            log.debug("Inventory Location Quantity Count : ", lotNumberQuantityCount);
            if (lotNumberQuantityCount > 0) {
                inventoryitemSearchObj.run().each(function (result) {
                    quantityAvailable = result.getValue({
                        name: "quantityavailable",
                        join: "inventoryNumber",
                        label: "Available"
                    })
                    log.debug("PCT-JAG", "Available Quantity : " + quantityAvailable)

                    return true;
                });
            }
            currentRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_master_wo_issue',
                fieldId: 'custrecord_pct_master_wo_issueqty',
                value: quantityAvailable
            });
        }
    }
    function validateLine(context) {
        log.debug("PCT-JAG", "In Validate Line");
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        if (sublistName === 'recmachcustrecord_pct_master_wo_issue')
            if (currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_master_wo_issue',
                fieldId: 'custrecord_pct_master_wo_issueqty'
            }) === currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_master_wo_issue',
                fieldId: 'custrecord_pct_master_wo_issue_qty'
            })) {

                return true;
            }
            else {
                alert("ERROR : Component's quantity can not be greater than Lot Number's available quantity !!");
                return false;
            }
    }

    function sublistChanged(context) {
        log.debug("PCT-JAG", "Sublist ChNAge");
    }



    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        validateLine: validateLine,


    }
});
