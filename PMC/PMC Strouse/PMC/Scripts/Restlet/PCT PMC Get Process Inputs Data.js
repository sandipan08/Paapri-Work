/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search', 'N/record'], function (search, record) {

    function _get(context) {
        const workCenterId = context.workCenterId;
        return getProcessInputIds(workCenterId)
    }

    function _post(context) {
        try {
            let processInputData = context;
            let processInputRecord = record.create({
                type: 'customrecord_pct_process_inputs',
                isDynamic: false
            });
            processInputRecord.setValue({
                fieldId: 'custrecord_pct_wo_pro_in',
                value: processInputData.workOrderId
            })
            processInputRecord.setValue({
                fieldId: 'custrecord_pct_wc_pro_in',
                value: processInputData.workCenterId
            })
            Object.keys(processInputData.inputFieldsData).map((element, index) => {
                processInputRecord.setValue({
                    fieldId: element,
                    value: processInputData.inputFieldsData[element]
                })
            })
            let processInputRecordId = processInputRecord.save()
            if (processInputRecordId) {
                return { 'isSuccess': true, 'data': processInputRecordId }
            }
        }
        catch (error) {
            log.debug({
                title: 'LOG',
                details: error
            })
            return { 'isSuccess': false }
        }
    }

    const getProcessInputIds = (workCenterId) => {
        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["internalid", "anyof", workCenterId],
                    "AND",
                    ["custentity_pct_process_input_field", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({ name: "custentity_pct_process_input_field", label: "Process Inputs Fields" })
                ]
        });
        var searchResultCount = entitygroupSearchObj.runPaged().count;
        log.debug("entitygroupSearchObj result count", searchResultCount);
        let res = []
        if (searchResultCount > 0) {
            entitygroupSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                res = result.getValue({ name: "custentity_pct_process_input_field" }).split(',');
                return true;
            });
            return { 'isSuccess': true, 'data': res }
        }
        return { 'isSuccess': false }
    }
    return {
        get: _get,
        post: _post
    }
});