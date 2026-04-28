/**
    *@NApiVersion 2.1
    *@NScriptType ClientScript
    */
define(['N/currentRecord', 'N/search'], function (currentRecord, search) {
    /**
     * @param {ClientScriptContext.pageInit} context
     * @param {ClientScriptContext.onclick_callforSuitelet} context
     */
    function pageInit(context) {

        try {
            log.debug("PCT", "In Client Script")
            // var currentRec = context.currentRecord;
            //Get Parent Sales Order ID from URL parameter
            var inputItemQty = GetParameterFromURL("inputItemQty");
            var mimoId = GetParameterFromURL("mimoId");
            var location = GetParameterFromURL("location");
            let responseObj = getItemDetails();
            log.debug("PCT-SC", "responseObj: " + JSON.stringify(responseObj));
            var currentRecord = context.currentRecord;
            // log.debug("PCT-SC", currentRecord);
            currentRecord.setValue({
                fieldId: 'quantity',
                value: inputItemQty,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custbody_pct_sc_linked_mimo',
                value: mimoId,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'assemblyitem',
                value: responseObj.itemId,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'location',
                value: location,
                ignoreFieldChange: false
            }).setValue({
                fieldId: 'iswip',
                value: true,
                ignoreFieldChange: false
            });
        }
        catch (exInit) {
            log.error("Error in Child Sales Order Page InIt()", exInit.message);
        }
    }

    function onclickCallClient(inputItemQty, mimoId, location) {
        var record = currentRecord.get();
        var recordId = record.id;
        // var recordType = record.type;
        // log.debug("PCT_SC", "recId : " + recordId);
        // log.debug("PCT_SC", "recordType : " + recordType);
        log.debug("PCT_SC", "Input Item Qty: " + inputItemQty + ", MIMO Record Id : " + mimoId);

        var finalUrl = `https://4344933.app.netsuite.com/app/accounting/transactions/workord.nl?inputItemQty=${inputItemQty}&mimoId=${mimoId}&location=${location}&whence=`;
        window.open(finalUrl, "_blank");

    }
    const getItemDetails = () => {
        let itemObj = {};
        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["name", "is", "Slitting Assembly"]
                ],
            columns:
                [
                    search.createColumn({ name: "displayname", label: "Display Name" }),
                    search.createColumn({
                        name: "billofmaterials",
                        join: "assemblyItemBillOfMaterials",
                        label: "Bill of Materials"
                    }),
                    search.createColumn({
                        name: "billofmaterialsid",
                        join: "assemblyItemBillOfMaterials",
                        label: "Bill of Materials ID"
                    })
                ]
        });
        var itemCount = assemblyitemSearchObj.runPaged().count;
        log.debug("PCT-SC", "Item Count : " + itemCount);
        if (itemCount > 0) {
            assemblyitemSearchObj.run().each(function (result) {
                itemObj['itemId'] = result.id;
                itemObj['billofmaterials'] = result.getValue({
                    name: "billofmaterials",
                    join: "assemblyItemBillOfMaterials",
                    label: "Bill of Materials"
                })
                itemObj['billofmaterialsId'] = result.getValue({
                    name: "billofmaterialsid",
                    join: "assemblyItemBillOfMaterials",
                    label: "Bill of Materials ID"
                })
                return true;
            });
            return itemObj;
        }
        else {
            return itemObj;
        }

    }

    function GetParameterFromURL(param) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == param) {
                return decodeURIComponent(pair[1]);
            }
        }
        return (false);
    }

    return {
        onclickCallClient: onclickCallClient,
        pageInit: pageInit,
    };
});