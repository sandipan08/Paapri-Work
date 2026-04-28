/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function ()
{

    function pageInit(context)
    {
        log.debug({ title: "PCT-Moju", details: "In Page Init Function" });
        var CurrentRecord = context.currentRecord;
    }

    function saveRecord(context)
    {

    }

    function validateField(context)
    {

    }

    function fieldChanged(context)
    {
        log.debug({ title: "PCT-Moju", details: "In Field Changed Function" });
        var CurrentRecord = context.currentRecord;

    }

    function postSourcing(context)
    {

    }

    function lineInit(context)
    {

    }

    function validateDelete(context)
    {

    }

    function validateInsert(context)
    {

    }

    function validateLine(context)
    {

    }

    function sublistChanged(context)
    {

    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        validateField: validateField,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        lineInit: lineInit,
        validateDelete: validateDelete,
        validateInsert: validateInsert,
        validateLine: validateLine,
        sublistChanged: sublistChanged
    }
});
