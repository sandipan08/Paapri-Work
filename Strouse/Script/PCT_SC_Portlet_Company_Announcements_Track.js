/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */

define(['N/search', 'N/runtime', 'N/record'], function (search, runtime, record) {
    function render(params) {
        log.debug({ title: 'PCT-Strouse', details: "In Portlet" });
        let announcementTitle = '';
        let flag = 0;
        let recordId = 0;
        var currentUser = runtime.getCurrentUser();
        var userId = currentUser.id;
        var customrecord_pct_sc_company_announcementSearchObj = search.create({
            type: "customrecord_pct_sc_company_announcement",
            filters:
                [
                    ["custrecord_pct_sc_ca_staus", "anyof", "1"],
                    "AND",
                    ["custrecord_pct_sc_ca_users", "anyof", userId],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "custrecord_pct_sc_ca_users", label: "User" }),
                    search.createColumn({ name: "custrecord_pct_sc_ca_desc", label: "Description" }),
                    search.createColumn({ name: "custrecord_pct_sc_ca_acknowledged_by", label: "Acknowledged By" }),
                    search.createColumn({ name: "custrecord_pct_sc_ca_staus", label: "Status" })
                ]
        });
        var searchResultCount = customrecord_pct_sc_company_announcementSearchObj.runPaged().count;
        log.debug("Result count", searchResultCount);
        params.portlet.title = 'Company Announcement';
        if (searchResultCount > 0) {
            customrecord_pct_sc_company_announcementSearchObj.run().each(function (result) {
                announcementTitle = result.getValue({ name: "name", label: "Name" })
                announcementDescription = result.getValue({ name: "custrecord_pct_sc_ca_desc", label: "Description" })
                recordId = result.id;
                return true;
            });
            var content = `
        <script>
            // Check sessionStorage for a flag
            if (!sessionStorage.getItem("loginAlertShown")) {
            if (window.confirm("Hey there! You have a new announcement: ${announcementTitle}."))
       // if (window.confirm('Really go to another page?'))
{
${flag++}
}
else
{
console.log("No")
}
            sessionStorage.setItem("loginAlertShown", "true");
            }
        </script>
        <div>${announcementDescription}</div>
         <div style="text-align: center;">
  <img src="https://4344933-sb1.app.netsuite.com/core/media/media.nl?id=733784&c=4344933_SB1&h=ivgzfI-TTPiAWHeC8NrORHSe1SEkMLvZ68M92MgM6LvLoLaF" alt="My Image" ">
</div>
    `;
            params.portlet.html = content;
        }
        if (flag) {
            record.submitFields({
                type: 'customrecord_pct_sc_company_announcement',
                id: recordId,
                values: {
                    'custrecord_pct_sc_ca_acknowledged_by': userId,
                },
                options: {
                    enableSourcing: true,
                    ignoreMandatoryFields: false
                }
            });
        }
    }

    return {
        render: render
    };
}); 
