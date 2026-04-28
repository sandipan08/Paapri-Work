
/**
*@NApiVersion 2.1
*@NScriptType UserEventScript
*/
define(['N/log', 'N/record', 'N/search'], function (log, record, search) {
    function beforeLoad(context) {

        log.debug("PCT-JAG", "In Work Order User Event Before Load");
        // var woRecord = context.newRecord;
        // if (context.type === context.UserEventType.CREATE && context.request.parameters && context.request.parameters.soid && context.request.parameters.soline) {
        //     log.debug({
        //         title: 'PCT-LOG',
        //         details: 'SO ID = ' + context.request.parameters.soid + ', SO Line = ' + context.request.parameters.soline
        //     })
        // }
        // var createdFrom = woRecord.getValue({
        //     fieldId: 'createdfrom'
        // });
        // log.debug("createdFrom", createdFrom);
        // log.debug("woRecord", woRecord);
        // if (createdFrom) {
        //     var salesorderSearchObj = search.create({
        //         type: "salesorder",
        //         filters:
        //             [
        //                 ["type", "anyof", "SalesOrd"],
        //                 "AND",
        //                 ["internalid", "anyof", createdFrom],
        //                 "AND",
        //                 ["applyingtransaction", "anyof", woRecord]
        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "custcol_pct_jag_pieces", label: "Pieces" }),
        //                 search.createColumn({ name: "custcol_pct_jag_length", label: "Length(ft)" }),
        //                 search.createColumn({ name: "custcol_pct_jag_length_inch", label: "Length(in)" }),
        //                 search.createColumn({ name: "custcol_pct_jag_width", label: "Stretch Out (Inch)" }),
        //                 search.createColumn({
        //                     name: "formulatext",
        //                     formula: "{otherrefnum}",
        //                     label: "PO#"
        //                 })
        //             ]
        //     });
        //     var searchResultCount = salesorderSearchObj.runPaged().count;
        //     log.debug("salesorderSearchObj result count", searchResultCount);
        //     if (searchResultCount > 0) {
        //         salesorderSearchObj.run().each(function (result) {
        //             woRecord.setValue({
        //                 fieldId: 'custbody_pct_jag_wo_po',
        //                 value: result.getValue({
        //                     name: "formulatext",
        //                     formula: "{otherrefnum}",
        //                     label: "PO#"
        //                 }).setValue({
        //                     fieldId: 'custbody_pct_jag_wo_stretch_out',
        //                     value: result.getValue('custcol_pct_jag_width')
        //                 }).setValue({
        //                     fieldId: 'custbody_pct_jag_wo_pieces',
        //                     value: result.getValue('custcol_pct_jag_pieces')
        //                 }).setValue({
        //                     fieldId: 'custbody_pct_jag_wo_length_inch',
        //                     value: result.getValue('custcol_pct_jag_length_inch')
        //                 }).setValue({
        //                     fieldId: 'custbody_pct_jag_wo_length',
        //                     value: result.getValue('custcol_pct_jag_length')
        //                 })
        //             })
        //             return true;
        //         });
        //     }

        // }

    }
    function afterSubmit(context) {
        log.debug("PCT-JAG", "In Work Order User Event After Submit");
        let workOrderId = context.newRecord.id;
        var workOrderLoad = record.load({
            type: record.Type.WORK_ORDER,
            id: workOrderId,
            // isDynamic: true
        })
        var createdFrom = workOrderLoad.getValue({
            fieldId: 'createdfrom'
        });
        if (createdFrom) {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["internalid", "anyof", createdFrom],
                        "AND",
                        ["applyingtransaction", "anyof", workOrderId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custcol_pct_jag_pieces", label: "Pieces" }),
                        search.createColumn({ name: "custcol_pct_jag_length", label: "Length(ft)" }),
                        search.createColumn({ name: "custcol_pct_jag_length_inch", label: "Length(in)" }),
                        search.createColumn({ name: "custcol_pct_jag_width", label: "Stretch Out (Inch)" }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "{otherrefnum}",
                            label: "PO#"
                        })
                    ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("salesorderSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                salesorderSearchObj.run().each(function (result) {
                    let pieces = result.getValue('custcol_pct_jag_pieces');
                    log.debug('pieces', pieces)
                    workOrderLoad.setValue({
                        fieldId: 'custbody_pct_jag_wo_pieces',
                        value: pieces
                    })
                    // workOrderLoad.setValue({
                    //     fieldId: 'custbody_pct_jag_wo_po',
                    //     value: result.getValue({ name: "formulatext", formula: "{otherrefnum}", label: "PO#" })
                    // }).setValue({
                    //     fieldId: 'custbody_pct_jag_wo_stretch_out',
                    //     value: result.getValue('custcol_pct_jag_width')
                    // }).setValue({
                    //     fieldId: 'custbody_pct_jag_wo_pieces',
                    //     value: pieces
                    // }).setValue({
                    //     fieldId: 'custbody_pct_jag_wo_length_inch',
                    //     value: result.getValue('custcol_pct_jag_length_inch')
                    // }).setValue({
                    //     fieldId: 'custbody_pct_jag_wo_length',
                    //     value: result.getValue('custcol_pct_jag_length')
                    // })
                    return true;
                })

                workOrderLoad.save()
                log.debug("PCT-JAG", "Saved Record : " + workOrderLoad.save())
            }

        }
    }
    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    }
});


