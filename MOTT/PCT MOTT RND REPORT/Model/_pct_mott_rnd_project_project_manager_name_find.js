/**
 *@NApiVersion 2.1
*@NScriptType Restlet
*/
define(["N/record", "N/search", "N/format", "N/error", 'N/runtime',], function (record, search, format, error, runtime)
{
    var project_manager_name = ""
    function _get(context)
    {
        log.debug({
            title: "PCT-MOTT",
            details: "Context : [ " + JSON.stringify(context) + " ]"
        });

        var projectManagerId = 171 //context.projectManagerId;

        var employeeSearchObj = search.create({
            type: "employee",
            filters:
                [
                    ["internalidnumber", "equalto", projectManagerId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "entityid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var searchResultCount = employeeSearchObj.runPaged().count;
        log.debug("employeeSearchObj result count", searchResultCount);
        employeeSearchObj.run().each(function (result)
        {
            // .run().each has a limit of 4,000 results

            project_manager_name = result.getValue({
                name: "entityid",
                sort: search.Sort.ASC,
                label: "Name"
            })

        });
        log.debug("Project Manager Name : " + project_manager_name)
        return project_manager_name;
    }
    return {
        get: _get,

    }
});