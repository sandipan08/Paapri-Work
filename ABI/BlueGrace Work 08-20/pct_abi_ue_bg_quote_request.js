/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeLoad(context) {
        log.debug("beforeLoad", context)
    }

    function beforeSubmit(context) {
        log.debug("beforeSubmit", context)

        var currentRecord = context.newRecord;
        log.debug("currentRecord beforeSubmit", currentRecord)

        var scac = currentRecord.getValue("custbody_abi_blue_grace_scac")
        log.debug("scac beforeSubmit", scac);

        if (scac == "" || scac == undefined || scac != null) {
            var shippingCost = currentRecord.getValue("altshippingcost");
            log.debug("shippingCost", shippingCost)

            currentRecord.setValue("shippingcost", shippingCost)
        }

    }

    function afterSubmit(context) {
        log.debug("afterSubmit", context)

        var id = context.newRecord.id;
        var type = context.newRecord.type;

        // log.debug("id", id)
        // log.debug("type", type)

        var currentRecord = record.load({type: type, id: id, isDynamic: true})
        // log.debug("currentRecord", currentRecord)
        var scac = currentRecord.getValue("custbody_abi_blue_grace_scac")
        log.debug("scac", scac);

        if (scac != "" && scac != undefined && scac != null) {
            log.debug("scac inner", scac)
            currentRecord.setValue("shipcarrier", 'nonups')

            // NEW CODE ADDED ON 2024-04-14
            if (scac == "CNWY") {
                log.debug("5414")
                currentRecord.setValue("shipmethod", 5414)
            } else if (scac == "UPGF") {
                log.debug("13181")
                currentRecord.setValue("shipmethod", 13181)
            } else if (scac == "SEFL") {
                log.debug("13179")
                currentRecord.setValue("shipmethod", 13179)
            } else if (scac == "SAIA") {
                log.debug("5413")
                currentRecord.setValue("shipmethod", 5413)
            } else if (scac == "FXFE") {
                log.debug("12762")
                currentRecord.setValue("shipmethod", 12762)
            } else if (scac == "FXNL") {
                log.debug("12763")
                currentRecord.setValue("shipmethod", 12763)
            } else if (scac == "AACT") {
                log.debug("13158")
                currentRecord.setValue("shipmethod", 13158)
            }
            //END   

            var shipmethod = currentRecord.getValue("shipmethod")
            log.debug("shipmethod", shipmethod)

            var updatedRecordId = currentRecord.save({ignoreMandatoryFields: true})
            log.debug("updatedRecordId", updatedRecordId)

        }else {
            log.debug("ENTER Else")
            var shippingCost = currentRecord.getValue("altshippingcost")
            log.debug("ALT shippingCost", shippingCost)

            currentRecord.setValue("shippingcost", shippingCost)
            currentRecord.setText("shippingcost", shippingCost)

            currentRecord.save({ignoreMandatoryFields: true})
        }

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
