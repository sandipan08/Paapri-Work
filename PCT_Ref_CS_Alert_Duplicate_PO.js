/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */

define(['N/log', 'N/search'], function (log, search) {

    function pageInit(context) {
        log.debug("PCT-JAG", "In Page Init Function");
    }
    // function fieldChanged(context) {
    //     if (context.fieldId == 'otherrefnum') {
    //         let currentRecord = context.currentRecord;
    //         let poNo = currentRecord.getValue({
    //             fieldId: 'otherrefnum'
    //         });
    //         if (checkPoNo(poNo)) {
    //             alert("Please enter a unique PO# value")
    //         }
    //     }
    // }

    function saveRecord(context) {
        log.debug("PCT-JAG", "In Save Record Function");
        log.debug("PCT-REf", context)
        let currentRecord = context.currentRecord;
        let poNo = currentRecord.getValue({
            fieldId: 'otherrefnum'
        });
        if (checkPoNo(poNo)) {
            alert("Please enter a unique PO# Number");
            return false;
        }
        else {
            return true;
        }

    }

    const checkPoNo = (poNo) => {
        log.debug(poNo)
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["formulatext: {otherrefnum}", "is", poNo.trim()],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "{otherrefnum}",
                        label: "PO#"
                    })
                ]
        });
        var soCount = salesorderSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", soCount);
        return soCount;
    }
    return {
        pageInit: pageInit,
        // fieldChanged: fieldChanged,
        saveRecord: saveRecord
    }
});
