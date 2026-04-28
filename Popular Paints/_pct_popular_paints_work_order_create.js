/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search", "N/format", "N/error"], function (record, search, format, error) {
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        try {
            var customerRecord = context.newRecord;
            var int_id = customerRecord.id;
            log.debug({
                title: 'int_id',
                details: int_id
            })
            /*    var assem_build_create = customerRecord.getValue({
                    fieldId:'custrecord_pct_assembly_build_created'
                })
               log.debug({
                    title: 'inven_check_before_sub',
                    details: assem_build_create
                })*/

            var count = customerRecord.getLineCount({
                sublistId: 'recmachcustrecord_pct_pp_bulk_link'
            })
            log.debug({
                title: 'count',
                details: count
            })
            var qty = customerRecord.getValue({
                fieldId: 'custrecord_pct_pp_bulk_quantity'
            })
            log.debug({
                title: 'qty',
                details: qty
            })
            var batch_no = customerRecord.getValue({
                fieldId: 'custrecord_pct_pp_bulk_batchno'
            })
            var batch_no_text = getBatchnoText(batch_no);
            log.debug({
                title: 'batch_no',
                details: batch_no
            })
            log.debug({
                title: 'batch_no_text',
                details: batch_no_text
            })
            var bulk_item = customerRecord.getValue({
                fieldId: 'custrecord_pct_pp_bulk_item'
            })
            log.debug({
                title: 'bulk_item',
                details: bulk_item
            })
            log.debug({ title: "count", details: count })
            if (count == 0) {
                var errorObj = error.create({ name: 'Can not save this record.', message: 'Please enter at least one line field' });
                throw errorObj.name + '\n\n' + errorObj.message;
                //throw errorObj.message;
                return false;
            }
            else {
                for (var i = 0; i < count; i++) {
                    var item_qty = customerRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                        fieldId: 'custrecord_pct_pp_bulk_size',
                        line: i
                    })
                    log.debug({
                        title: 'item_qty',
                        details: item_qty
                    })
                    var unit_relation = customerRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                        fieldId: 'custrecord_pct_pp_bulk_unit_relation',
                        line: i
                    })
                    log.debug({
                        title: 'unit_relation',
                        details: unit_relation
                    })
                    var line_item = customerRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                        fieldId: 'custrecord_pct_pp_bulk_output',
                        line: i
                    })
                    log.debug({
                        title: 'line_item',
                        details: line_item
                    })
                    var line_qty = item_qty * unit_relation;
                    var item_NaN = isNaN(line_item);
                    log.debug({
                        title: 'item_NaN',
                        details: item_NaN
                    })
                    if (line_item == '') {
                        var errorObj = error.create({ name: 'Can not save this record.', message: 'Please enter finished assembly.' });
                        throw errorObj.name + '\n\n' + errorObj.message;
                        //throw errorObj.message;
                        return false;
                    }
                    if (line_qty == '') {
                        var errorObj = error.create({ name: 'Can not save this record.', message: 'Enter valid quantity.' });
                        throw errorObj.name + '\n\n' + errorObj.message;
                        //throw errorObj.message;
                        return false;
                    }
                    // if(line_qty > qty){
                    //     var errorObj = error.create({ name: 'Can not save this record.', message: 'Enter valid quantity.' });
                    //     throw errorObj.name + '\n\n' + errorObj.message;
                    //     //throw errorObj.message;
                    //     return false;
                    // }
                    // qty = qty - line_qty;

                    var wo_id = workOrderCreate(line_item, item_qty);
                    log.debug({
                        title: 'wo_id',
                        details: wo_id
                    })
                    var assembly_built_id = transferToAssemblyBuild(wo_id, qty, bulk_item, batch_no_text);
                    log.debug({
                        title: 'assembly_built_id',
                        details: assembly_built_id
                    })
                    var is_assem_id = isNaN(assembly_built_id)
                    var is_wo_id = isNaN(wo_id)
                    log.debug({
                        title: 'is_assem_id  + is_wo_id',
                        details: is_assem_id + ' ' + is_wo_id
                    })
                    if (is_wo_id == false && is_assem_id == false) {
                        customerRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                            fieldId: 'custrecord_pct_pp_bulk_wo',
                            line: i,
                            value: wo_id
                        })
                        customerRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_pct_pp_bulk_link',
                            fieldId: 'custrecord_pct_pp_wo_build',
                            line: i,
                            value: assembly_built_id
                        })
                        // record.submitFields({ type: 'customrecord_pct_pp_bulk_manf_child', id: internalID, values: { 'custrecord_pct_pp_bulk_wo': wo_id} });
                        //record.submitFields({ type: 'customrecord_pct_pp_bulk_manf_child', id: internalID, values: { 'custrecord_pct_pp_wo_build': assembly_built_id} });
                    }
                    else {
                        if (is_wo_id == false) {
                            record.delete({
                                type: 'workorder',
                                id: wo_id
                            })
                        }
                    }

                }
            }
        }
        catch (e) {
            log.debug({
                title: 'FAIL',
                details: 'Before Submit'
            })

            var errorObj = error.create({ name: 'Can not save this record.', message: 'Please enter valid Details' });
            throw errorObj.name + '\n\n' + errorObj.message;
            return false;
        }
    }
    function afterSubmit(context) {
        try {
            var newRecord = context.newRecord;
            var id = newRecord.id;
            log.debug({
                title: 'id',
                details: id
            })
            var bulk_item = newRecord.getValue({
                fieldId: 'custrecord_pct_pp_bulk_item'
            })
            log.debug({
                title: 'bulk_item',
                details: bulk_item
            })
            var batch_no = newRecord.getValue({
                fieldId: 'custrecord_pct_pp_bulk_batchno'
            })
            var batch_no_text = getBatchnoText(batch_no);
            log.debug({
                title: 'batch_no',
                details: batch_no
            })
            log.debug({
                title: 'batch_no_text',
                details: batch_no_text
            })
            var customrecord_pct_pp_bulk_manufacturingSearchObj = search.create({
                type: "customrecord_pct_pp_bulk_manufacturing",
                filters:
                    [
                        ["internalid", "anyof", id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_pct_pp_bulk_output",
                            join: "CUSTRECORD_PCT_PP_BULK_LINK",
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_pp_bulk_size",
                            join: "CUSTRECORD_PCT_PP_BULK_LINK",
                            label: "Quantity"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_PP_BULK_LINK",
                            label: "Internal ID"
                        })
                    ]
            });
            var searchResultCount = customrecord_pct_pp_bulk_manufacturingSearchObj.runPaged().count;
            log.debug("customrecord_pct_pp_bulk_manufacturingSearchObj result count", searchResultCount);
            customrecord_pct_pp_bulk_manufacturingSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                var item = result.getValue({
                    name: "custrecord_pct_pp_bulk_output",
                    join: "CUSTRECORD_PCT_PP_BULK_LINK",
                    label: "Item"
                })
                log.debug({
                    title: 'item',
                    details: item
                })
                var qty = result.getValue({
                    name: "custrecord_pct_pp_bulk_size",
                    join: "CUSTRECORD_PCT_PP_BULK_LINK",
                    label: "Quantity"
                })

                var internalID = result.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_PCT_PP_BULK_LINK",
                    label: "Internal ID"
                })
                log.debug({
                    title: 'qty',
                    details: qty
                })
                /*   if(!item){
                    var errorObj = error.create({ name: 'Can not save this record.', message: 'Please enter Assembly Item' });
                    throw errorObj.name + '\n\n' + errorObj.message;
                    //throw errorObj.message;
                    return false;
                   }
                   else{*/
                var wo_id = workOrderCreate(item, qty);
                log.debug({
                    title: 'wo_id',
                    details: wo_id
                })
                //var assembly_built_id = transferToAssemblyBuild(wo_id, qty,bulk_item, batch_no_text);


                // log.debug({
                //     title: 'assembly_built_id',
                //     details: assembly_built_id
                // })
                // if(!wo_id && !assembly_built_id){
                //     record.submitFields({ type: 'customrecord_pct_pp_bulk_manf_child', id: internalID, values: { 'custrecord_pct_pp_bulk_wo': wo_id} });
                //    record.submitFields({ type: 'customrecord_pct_pp_bulk_manf_child', id: internalID, values: { 'custrecord_pct_pp_wo_build': assembly_built_id} });
                // }
                // else{
                //     log.debug({
                //         title: 'Test',
                //         details: 'Pass'
                //     })
                //     var errorObj = error.create({ name: 'Can not save this record.', message: 'Please enter valid Item' });
                //     throw errorObj.name + '\n\n' + errorObj.message;
                //     return false;
                // }

                // }


                return true;
            });
        }
        catch (e) {
            log.debug({
                title: 'FAIL',
                details: 'After Submit'
            })
        }
    }
    function workOrderCreate(item, qty) {
        var work_order = record.create({
            type: record.Type.WORK_ORDER,
            isDynamic: true
        });
        work_order.setValue({
            fieldId: 'assemblyitem',
            value: item

        })
        work_order.setValue({
            fieldId: 'location',
            value: 4
        })
        var load_item = record.load({
            type: 'assemblyitem',
            id: item
        })
        var bom_rev = load_item.getSublistValue({
            sublistId: 'billofmaterials',
            fieldId: 'currentrevision',
            line: 0
        })

        log.debug({
            title: 'bom_rev',
            details: bom_rev
        })
        var bom_rev_id = getRevId(bom_rev)
        var bom_rev_load = record.load({
            type: 'bomrevision',
            id: bom_rev_id
        })
        log.debug({
            title: 'bom_rev_load',
            details: bom_rev_load
        })
        log.debug({
            title: 'bom_rev_id',
            details: bom_rev_id
        })
        var count = bom_rev_load.getLineCount({
            sublistId: 'component'
        })
        log.debug({
            title: 'count',
            details: count
        })
        work_order.setValue({
            fieldId: 'quantity',
            value: qty
        })
        work_order.setText({
            fieldId: 'orderstatus',
            text: 'Released'
        })

        log.debug({
            title: 'work_order',
            details: work_order
        })

        var line = work_order.getLineCount('item');

        log.debug({
            title: 'line Count WO Item',
            details: line
        })
        var backOrderError = 0;
        for (var index = 0; index < line; index++) {
            var quantityavailable = work_order.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantityavailable',
                line: index
            })

            var quantity = work_order.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: index
            })

            log.debug({
                title: 'quantityavailable =' + quantityavailable,
                details: 'quantity =' + quantity
            })

            if (quantity > quantityavailable) {
                backOrderError++;
                var errorObj = error.create({ name: 'Can not save this record.', message: 'Item is on Backordered' });
                throw errorObj.name + '\n\n' + errorObj.message;
                 return false;
            }
        }

        //
        if (backOrderError == 0) {
            var work_order_id = work_order.save();
            var wo_load = record.load({
                type: 'workorder',
                id: work_order_id
            })
            for (var i = 0; i < count; i++) {
                var bom_qty = parseFloat(bom_rev_load.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'quantity',
                    line: i
                }))
                log.debug({
                    title: 'bom_qty',
                    details: bom_qty
                })
                var qty_set = bom_qty * qty;
                log.debug({
                    title: 'qty_set',
                    details: qty_set
                })
                wo_load.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                    value: qty_set
                })

            }
            wo_load.save();
            /* work_order.setText({
                 fieldId: 'location',
                 text: wo_loc
                
             })*/

            return work_order_id;
        }else{
            return false;
        }
        // return 1;
    }

    function transferToAssemblyBuild(get_wo_id, qty, bulk_item, batch_no) {
        try {
            var fromRecord = 'workorder';
            var fromId = get_wo_id;
            var toRecord = 'assemblybuild';

            var trecord = record.transform({ fromType: fromRecord, fromId: fromId, toType: toRecord });
            // trecord.setValue({
            //     fieldId: 'quantity',
            //     value: qty
            // })

            trecord.setValue({
                fieldId: 'custbody_pct_pp_bulk_item_wo',
                value: false
            })
            trecord.setText({
                fieldId: 'custbody_pct_pp_batch_number',
                text: batch_no
            })
            var getLineCount = trecord.getLineCount({
                sublistId: 'component'
            })
            log.debug({
                title: 'getLineCount',
                details: getLineCount
            })
            for (var i = 0; i < getLineCount; i++) {
                var component_name = trecord.getSublistText({ sublistId: "component", fieldId: "item", line: i });
                log.debug({
                    title: 'component_name',
                    details: component_name
                })
                if (component_name == bulk_item) {
                    trecord.setSublistText({
                        sublistId: 'component',
                        fieldId: 'componentnumbers',
                        line: i,
                        text: batch_no
                    })
                }
            }
            var idl = trecord.save({
                enableSourcing: true
            });
            return idl;
        }
        catch (e) {

            log.debug({
                title: 'FAIL',
                details: 'Assembly Build'
            })
            var errorObj = error.create({ name: 'Can not save this record.', message: 'Please enter valid Item' });
            throw errorObj.name + '\n\n' + errorObj.message;
            return false;
        }
    }
    function getBatchnoText(batch_no_id) {
        var inventorynumberSearchObj = search.create({
            type: "inventorynumber",
            filters:
                [
                    ["internalid", "anyof", batch_no_id]
                ],
            columns:
                [
                    search.createColumn({
                        name: "inventorynumber",
                        sort: search.Sort.ASC,
                        label: "Number"
                    })
                ]
        });
        var searchResultCount = inventorynumberSearchObj.runPaged().count;
        var batch_no_text = '';
        log.debug("inventorynumberSearchObj result count", searchResultCount);
        inventorynumberSearchObj.run().each(function (result) {
            batch_no_text = result.getValue({
                name: "inventorynumber",
                sort: search.Sort.ASC,
                label: "Number"
            })
            // .run().each has a limit of 4,000 results
            return true;
        });
        log.debug({
            title: 'f-batch_no_text',
            details: batch_no_text
        })
        return batch_no_text;
    }
    function getRevId(bom_rev) {
        var bomrevisionSearchObj = search.create({
            type: "bomrevision",
            filters:
                [
                    ["name", "is", bom_rev]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.ASC,
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = bomrevisionSearchObj.runPaged().count;
        var bom_id = '';
        log.debug("bomrevisionSearchObj result count", searchResultCount);
        bomrevisionSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            bom_id = result.getValue({
                name: "internalid",
                sort: search.Sort.ASC,
                label: "Internal ID"
            })
            return true;
        });
        return bom_id;
    }
    return {

        beforeSubmit: beforeSubmit
        // afterSubmit: afterSubmit
    }
});