/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

define(['N/log', 'N/file', 'N/record'], function (log, file, record) {

    function _get(context) {
        log.debug(JSON.stringify(context.recordId));
        let wovLoad = record.load({
            type: 'customrecord_pct_wov_data_store',
            id: context.recordId,
        })
        if (wovLoad.getValue('custrecord_pct_wov_data_store_status') == 2) {
            return { 'isSuccess': true, 'data': wovLoad.getValue('custrecord_pxt_wov_data_store_link') }
        }
        else {
            return { 'isSuccess': false, 'data': 'No Data Found' }
        }
    }



    return {
        get: _get,

    }
});
