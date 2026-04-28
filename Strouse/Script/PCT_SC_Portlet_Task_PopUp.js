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
        var taskSearchObj = search.create({
            type: "task",
            filters:
                [
                    ["status", "anyof", "PROGRESS"],
                    "AND",
                    ["assigned", "anyof", userId]
                ],
            columns:
                [
                    search.createColumn({ name: "order", label: "Insert" }),
                    search.createColumn({ name: "title", label: "Task Title" }),
                    search.createColumn({ name: "priority", label: "Priority" }),
                    search.createColumn({ name: "status", label: "Status" }),
                    search.createColumn({ name: "startdate", label: "Start Date" }),
                    search.createColumn({ name: "duedate", label: "Due Date" }),
                    search.createColumn({ name: "accesslevel", label: "Private" }),
                    search.createColumn({ name: "assigned", label: "Assigned To" }),
                    search.createColumn({ name: "company", label: "Company" }),
                    search.createColumn({ name: "message", label: "Comment" })
                ]
        });
        var searchResultCount = taskSearchObj.runPaged().count;
        log.debug("taskSearchObj result count", searchResultCount);
        params.portlet.title = 'Task Reminder';
        if (searchResultCount > 0) {
            taskSearchObj.run().each(function (result) {
                taskTitle = result.getValue({ name: "title", label: "Task Title" })
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
