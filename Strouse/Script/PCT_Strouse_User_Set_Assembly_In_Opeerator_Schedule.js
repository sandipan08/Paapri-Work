/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search"], function (record, search,
) {

    function beforeLoad(context) {
        log.debug({
            title: "PCT-SC",
            details: "In Before Load"
        })
    }

    function beforeSubmit(context) {
        log.debug({
            title: "PCT-SC",
            details: "In Before Submit"
        })
        let newRecord = context.newRecord;
        let operationTask = newRecord.getValue({
            fieldId: 'custrecord_pct_sc_optask'
        });
        let workOrderResponse = getWorkOrderDetails(operationTask)
        log.debug({
            title: "PCT",
            details: JSON.stringify(workOrderResponse)
        })
        if (workOrderResponse.isSuccess) {
            newRecord.setValue({
                fieldId: 'custrecord_pct_sc_opjobdetails_assembly',
                value: workOrderResponse.data.item,
                // ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_sc_opjobdetails_wo_list',
                value: workOrderResponse.data.workOrder,
                // ignoreFieldChange: true
            })
        }
    }

    function afterSubmit(context) {

    }

    const getWorkOrderDetails = (operationTask) => {
        let workOrderObj = {}
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["internalid", "anyof", operationTask]
                ],
            columns:
                [
                    search.createColumn({ name: "workorder", label: "Work Order" }),
                    search.createColumn({
                        name: "item",
                        join: "workOrder",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "workOrder",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            manufacturingoperationtaskSearchObj.run().each(function (result) {
                workOrderObj['workOrder'] = result.getValue({
                    name: "internalid",
                    join: "workOrder",
                    label: "Internal ID"
                })
                workOrderObj['item'] = result.getValue({
                    name: "item",
                    join: "workOrder",
                    label: "Item"
                })
                return true;
            });
            return { 'isSuccess': true, 'data': workOrderObj }
        }
        return { 'isSuccess': false, 'data': workOrderObj }

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
