/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */

define(['N/search', 'N/runtime'], function (search, runtime) {
    function render(params) {
        log.debug({ title: 'PCT-Strouse', details: "In Portlet" });
        var portlet = params.portlet;
        portlet.title = 'Rejected Bills';
        var userId = runtime.getCurrentUser().id;
        var vendorbillSearchObj = search.create({
            type: "vendorbill",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["status", "anyof", "VendBill:E"],
                    "AND",
                    ["createdby", "anyof", userId],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "createdby", label: "Created By" }),
                    search.createColumn({ name: "custbody_pct_mci_mfg_enteredby", label: "Entered By" }),
                    search.createColumn({ name: "custbody_pct_mci_reject_reason", label: "Reject Reason" }),
                    search.createColumn({ name: "tranid", label: "Document Number" })

                ]
        });
        var searchResultCount = vendorbillSearchObj.runPaged().count;
        log.debug("vendorbillSearchObj result count", searchResultCount);
    
        if (searchResultCount > 0) {
            vendorbillSearchObj.run().each(function (result) {
                let rejectReason = result.getText({ name: "custbody_pct_mci_reject_reason", label: "Reject Reason" })
                let billNumber = result.getValue({ name: "tranid", label: "Document Number" })
                portlet.addLine({
                    text: `${billNumber}-${rejectReason}`,
                    url: `https://983044-sb1.app.netsuite.com/app/accounting/transactions/vendbill.nl?id=${result.id}&whence=`
                });
                return true;
            });

        }
    }

    return {
        render: render
    };
}); 
