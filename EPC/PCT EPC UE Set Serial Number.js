/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log'], function (record, search, log) {



    // function beforeSubmit(context) {
    //     var rec = context.newRecord;
    //     var prodDate = rec.getValue('enddate');
    //     log.debug(prodDate)
    //     if (context.type == context.UserEventType.CREATE) {
    //         if (rec.getValue('custbody_pct_epc_serial_number') == "" && rec.getValue('orderstatus') == 'B' && prodDate != '') {
    //             log.debug("PCT HERE", prodDate)
    //             log.debug("PCT HERE", generateSerialCode(prodDate))

    //             rec.setValue({
    //                 fieldId: 'custbody_pct_epc_serial_number',
    //                 value: generateSerialCode(prodDate)
    //             });
    //         }
    //     }
    // }

    function afterSubmit(context) {
        var newRecord = context.newRecord;
        var recId = newRecord.id;
        var rec = record.load({
            type: record.Type.WORK_ORDER,
            id: recId,
            isDynamic: true
        });
        var prodDate = rec.getValue('enddate');
        log.debug(prodDate)
        if (context.type == context.UserEventType.CREATE) {
            if (rec.getValue('custbody_pct_epc_serial_number') == "" && rec.getValue('orderstatus') == 'B' && prodDate != '') {
                log.debug("PCT HERE", prodDate)
                log.debug("PCT HERE", generateSerialCode(prodDate))

                rec.setValue({
                    fieldId: 'custbody_pct_epc_serial_number',
                    value: generateSerialCode(prodDate)
                });
            }
        }
        rec.save()
    }

    function formatMMDDYY(dateObj) {
        var d = new Date(dateObj);
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        var yy = String(d.getFullYear()).slice(-2);
        return mm + dd + yy;
    }

    function generateSerialCode(prodDate) {
        let serialNumber = '';
        let count = 0;
        var workorderSearchObj = search.create({
            type: "workorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }, { "name": "includeperiodendtransactions", "value": "F" }],
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["enddate", "on", convertToDate(formatMMDDYY(prodDate))]
                ],
            columns:
                [
                    search.createColumn({ name: "enddate", label: "End Date" }),
                    search.createColumn({ name: "datecreated", label: "Date Created" })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);

        return formatMMDDYY(prodDate) + '-' + (searchResultCount + 1);
        /*
        workorderSearchObj.id="customsearch1750243773128";
        workorderSearchObj.title="Transaction Search (copy)";
        var newSearchId = workorderSearchObj.save();
        */
    }


    function convertToDate(value) {
        let str = value.toString().padStart(4, '0'); // Ensures '6425' → '6425'

        let month = str.slice(0, 2).padStart(2, '0'); // 06
        let day = str.slice(2, 4).padStart(2, '0');   // 04
        let year = '20' + str.slice(4);              // '20' + '' → 2025 (we'll handle this below)

        // Since input is only 4 digits, we assume:
        // MM = str[0], D = str[1], YY = str[2,3]
        if (str.length === 4) {
            month = str.charAt(0).padStart(2, '0');      // '6' → '06'
            day = str.charAt(1).padStart(2, '0');        // '4' → '04'
            year = '20' + str.slice(2);                  // '25' → '2025'
        }

        return `${month}/${day}/${year}`;
    }

    return {

        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit

    }
});
