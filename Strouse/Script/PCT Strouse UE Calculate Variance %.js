/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget'], function (log, record, search, serverWidget) {

    function beforeLoad(context) {
        log.debug("PCT", "In Before Load Function");
    }

    function beforeSubmit(context) {
        log.debug("PCT", "In Before Submit Function");
    }

    function afterSubmit(context) {
        log.debug("PCT", "In After Submit Function");
        if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
            var newRecord = context.newRecord;
            let workOrderId = newRecord.getValue('createdfrom');
            let responseObj = getEstimatedVarianceAndRunRate(workOrderId);
            log.debug("PCT", responseObj);
            log.debug("PCT", workOrderId);
            log.debug("PCT", (parseInt(responseObj.estimatedVariance) / parseInt(responseObj.estimatedRunRate)));
            record.submitFields({
                type: record.Type.WORK_ORDER,
                id: workOrderId,
                values: {
                    'custbody_pct_sc_total_var_percentage': (parseFloat(responseObj.estimatedVariance) / parseFloat(responseObj.estimatedRunRate)) * 100
                }
            });

        }
    }

    const getEstimatedVarianceAndRunRate = (workOrderId) => {
        let responseObj = {
            'estimatedVariance': 0,
            'estimatedRunRate': 0
        };
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["workorder", "anyof", workOrderId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "(CASE WHEN ({completedquantity} IS NULL) THEN 0 ELSE {completedquantity} END)*{runrate}",
                        label: "Formula (Numeric)"
                    }),
                    search.createColumn({
                        name: "formulanumeric1",
                        summary: "SUM",
                        formula: "CASE WHEN (({actualruntime} IS NULL) OR ({actualruntime} = 0)) THEN 0 ELSE ({actualruntime}-({completedquantity}*{runrate})) END",
                        label: "Formula (Numeric)"
                    })
                ]
        });
        var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
        manufacturingoperationtaskSearchObj.run().each(function (result) {
            let estimatedVariance = parseInt(result.getValue({
                name: "formulanumeric1",
                summary: "SUM",
                formula: "CASE WHEN (({actualruntime} IS NULL) OR ({actualruntime} = 0)) THEN 0 ELSE ({actualruntime}-({completedquantity}*{runrate})) END",
                label: "Formula (Numeric)"
            }))
            let estimatedRunRate = parseInt(result.getValue({
                name: "formulanumeric",
                summary: "SUM",
                formula: "(CASE WHEN ({completedquantity} IS NULL) THEN 0 ELSE {completedquantity} END)*{runrate}",
                label: "Formula (Numeric)"
            }))
            if (estimatedRunRate == 0) {
                estimatedRunRate = 1;
            }
            responseObj['estimatedVariance'] = estimatedVariance;
            responseObj['estimatedRunRate'] = estimatedRunRate;
            return true;
        });
        return responseObj;

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
