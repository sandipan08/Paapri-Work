/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 */
define(["N/record", "N/search", "N/format", "N/error"], function (
    record,
    search,
    format,
    error
) {
    function onAction(scriptContext) {
        log.debug({
            title: "AS_LOG",
            details: "In WorkFlow OnAction Function",
        });
        var QMS_file_load = scriptContext.newRecord;
        var recordId = QMS_file_load.getValue({ fieldId: "id" });
        log.debug({
            title: "AS_LOG",
            details: "record id : " + recordId,
        });
        var qmsCheck = QMS_file_load.getValue({
            fieldId: "custrecord_pct_pp_qc_approved",
        });
        log.debug({title: "QMS Value: "
        ,details: qmsCheck });
        if (qmsCheck == true) {
            var itemId = QMS_file_load.getValue({
                fieldId: "custrecord_pct_pp_material_name_pdct_nme",
            });
            log.debug({
                title: "AS_LOG",
                details: "item: " + itemId,
            });

            var batch = QMS_file_load.getValue({
                fieldId: "custrecord_pct_pp_batch_no",
            });
            log.debug({
                title: "AS_LOG",
                details: "batch no : " + batch,
            });
            var itemSearchObj = search.create({
                type: "item",
                filters: [
                    ["name", "is", itemId],
                    "AND",
                    ["inventorynumber.inventorynumber", "is", batch],
                    "AND",
                    ["isinactive", "is", "F"],
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        join: "inventoryNumber",
                        label: "Internal ID",
                    }),
                ],
            });
            var searchResultCount = itemSearchObj.runPaged().count;
            log.debug("itemSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                var lotId;
                var searchResultObj = itemSearchObj.run().getRange({ start: 0, end: searchResultCount });
                for (var getid_index = 0; getid_index < searchResultCount; getid_index++) {
                    lotId = searchResultObj[getid_index].getValue({
                        name: "internalid",
                        join: "inventoryNumber",
                    });
                }
                log.debug({
                    title: "PCT-PP",
                    details: "lotID : " + lotId,
                });
                if (lotId) {
                    var recordLoad = record.load({
                        type: record.Type.INVENTORY_NUMBER,
                        id: lotId,
                        // isDynamic: boolean,
                        // defaultValues: Object
                    });
                    recordLoad.setValue({
                        fieldId: "custitemnumber_pct_ppcl_qc_approved",
                        value: true,
                        ignoreFieldChange: true,
                    });
                    recordLoad.save();
                }
            }
        }
    }

    return {
        onAction: onAction,
    };
});
