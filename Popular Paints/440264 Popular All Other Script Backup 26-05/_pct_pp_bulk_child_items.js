/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(["N/record", "N/search", "N/ui/dialog", "N/currentRecord"], function (
    record,
    search,
    dialog,
    currentRecord
) {
    function fieldChanged(context) {
        if (context.fieldId == "custrecord_pct_pp_bulk_item") {
            var CurrentRecord = context.currentRecord;
            var bulkItem = CurrentRecord.getValue({
                fieldId: "custrecord_pct_pp_bulk_item",
            });

            var line = CurrentRecord.getLineCount({
                sublistId: "recmachcustrecord_pct_pp_bulk_link",
            });

            for (var i = line - 1; i >= 0; i--) {
                CurrentRecord.removeLine({
                    sublistId: "recmachcustrecord_pct_pp_bulk_link",
                    line: i,
                });
            }
            CurrentRecord.selectLine({
                sublistId: "recmachcustrecord_pct_pp_bulk_link",
                line: 0
            })
            CurrentRecord.setCurrentSublistValue({
                sublistId: "recmachcustrecord_pct_pp_bulk_link",
                fieldId: "custrecord_pct_pp_bulk_item_ch",
                value: bulkItem,
            });

            return true;
        }

        return true;
    }

    function lineInit(context) {
        var CurrentRecord = context.currentRecord;
        var bulkItem = CurrentRecord.getValue({
            fieldId: "custrecord_pct_pp_bulk_item",
        });
        log.debug({
            title: "PCT-PP",
            details: "Bulk Item lineInit : " + bulkItem,
        });

        if (bulkItem != null) {
            var line = CurrentRecord.getLineCount({
                sublistId: "recmachcustrecord_pct_pp_bulk_link",
            });

            log.debug({
                title: "line",
                details: line,
            });

            CurrentRecord.setCurrentSublistValue({
                sublistId: "recmachcustrecord_pct_pp_bulk_link",
                fieldId: "custrecord_pct_pp_bulk_item_ch",
                value: bulkItem,
            });
            return true;
        }

        return true;
    }

    function saveRecord(context) {
        log.debug({
            title: 'submit',
            details: 'TotLineQty '
        })
        var CurrentRecord = context.currentRecord;
        var bulkItem = CurrentRecord.getValue({
            fieldId: "custrecord_pct_pp_bulk_item",
        });

        var qty = CurrentRecord.getValue({
            fieldId: "custrecord_pct_pp_bulk_quantity",
        });

        var unitRelationObj = search.lookupFields({
            type: 'lotnumberedassemblyitem',
            id: bulkItem,
            columns: ['custitem_pct_pp_items_unit_relation']
        })

        var unitRel = unitRelationObj['custitem_pct_pp_items_unit_relation'];
        if (!unitRel) {
            unitRel = 1;
        }
        log.debug({
            title: 'Unit Relation',
            details: "UnitRel= " + unitRel[index]
        })

        log.debug({
            title: 'stringunitRel*',
            details: unitRel + 'qty = ' + qty + ' unitRelationObj' + JSON.stringify(unitRelationObj)
        })
        var totBulkQty = unitRel * qty * 1.05;

        var line = CurrentRecord.getLineCount({
            sublistId: 'recmachcustrecord_pct_pp_bulk_link'
        })

        log.debug({
            title: 'line',
            details: line
        })

        var TotLineQty = 0;
        log.debug({
            title: 'Before loop',
            details: 'Test'
        })
        for (var index = 0; index < line; index++) {
            log.debug({
                title: 'After Loop',
                details: 'Test'
            })

            var lineQty = CurrentRecord.getSublistValue({
                sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                fieldId: 'custrecord_pct_pp_bulk_size',
                line: index
            })

            var lineRel = CurrentRecord.getSublistValue({
                sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                fieldId: 'custrecord_pct_pp_bulk_unit_relation',
                line: index
            })

            var quantity = lineQty * lineRel;

            TotLineQty = parseFloat(TotLineQty) + parseFloat(quantity)

            log.debug({
                title: 'Line details     ',
                details: 'lineQty = ' + lineQty + ' lineRel = ' + lineRel + ' quantity =' + quantity
            })
        }

        log.debug({
            title: 'submit',
            details: 'TotLineQty = ' + TotLineQty + ' totBulkQty = ' + totBulkQty
        })

        var msg = 'You have entered extra quantity!'

        if (TotLineQty > totBulkQty) {
            var options = {
                title: parseFloat(TotLineQty) - parseFloat(totBulkQty),
                message: msg
            };


            dialog.alert(options);
            return false;
        }
        return true;
    }

    return {
        fieldChanged: fieldChanged,
        lineInit: lineInit,
        saveRecord: saveRecord
    };
});
