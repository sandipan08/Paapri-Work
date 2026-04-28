/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function() {

    function pageInit(context) {
        
    }

    // function saveRecord(context) {
        
    // }

    // function validateField(context) {
        
    // }

    function fieldChanged(context) {
        if(context.sublistId == "item" && context.fieldId == "item") {
            log.debug("ENTER")
            var currentRecord = context.currentRecord

            currentRecord.setValue("shipcarrier", 'nonups')
            currentRecord.setValue("shipmethod", 5272)
            // return true
        }
        
    }

    // function postSourcing(context) {
       
    // }

    // function lineInit(context) {
        
    // }

    // function validateDelete(context) {
        
    // }

    // function validateInsert(context) {
        
    // }

    // function validateLine(context) {
        
    // }

    // function sublistChanged(context) {
        
    // }

    return {
        pageInit: pageInit,
        // saveRecord: saveRecord,
        // validateField: validateField,
        fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
