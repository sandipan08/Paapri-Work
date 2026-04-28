/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */

define(['N/search', 'N/runtime'], function (search, runtime) {
    function render(params) {
        log.debug({ title: 'PCT-Strouse', details: "In Portlet" });
        let taskTitle = '';
        var currentUser = runtime.getCurrentUser();
        var userId = currentUser.id;
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
                    search.createColumn({ name: "custbody_pct_mci_reject_reason", label: "Reject Reason" })
                ]
        });
        var searchResultCount = vendorbillSearchObj.runPaged().count;
        log.debug("vendorbillSearchObj result count", searchResultCount);
        params.portlet.title = 'Task Reminder';
        if (searchResultCount > 0) {
            vendorbillSearchObj.run().each(function (result) {
                rejectReason = result.getValue({ name: "custbody_pct_mci_reject_reason", label: "Reject Reason" })
                return true;
            });
            var content = `
        <script>
            // Check sessionStorage for a flag
            if (!sessionStorage.getItem("loginAlertShown")) {
            alert("Hey there! You have a pending task: ${taskTitle}. Please take a moment to complete it.");
            sessionStorage.setItem("loginAlertShown", "true");
            }
        </script>
        <div>Don’t forget to complete your pending task !!</div>
    `;
            params.portlet.html = content;
        }
    }

    return {
        render: render
    };
}); 
