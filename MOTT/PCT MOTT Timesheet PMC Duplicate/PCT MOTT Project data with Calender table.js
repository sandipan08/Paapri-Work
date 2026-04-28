/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        var empInternalId = context.empId;
        var projects = getProjects(empInternalId);

        const searchResult = projects[0];
        const searchResultCount = projects[1];

        var tbody = '';
        var dataToBeReturned = {};
        if (searchResultCount > 0) {
            for (var i = 0; i < searchResultCount; i++) {
                tbody += '<tr>' +
                    `<td>${searchResult[i].getValue('companyname')}</td>` +
                    `<td>${searchResult[i].getValue('internalid')}</td>` +
                    `<td><input type="text" class="form-control"></td>` +
                    `<td><input type="text" class="form-control"></td>` +
                    `<td><input type="text" class="form-control"></td>` +
                    `<td><input type="text" class="form-control"></td>` +
                    `<td><input type="text" class="form-control"></td>` +
                    `</tr>`;
            }
            dataToBeReturned['message'] = 'success';
            dataToBeReturned['data'] = tbody;

        }
        else
        {
            dataToBeReturned['message'] = 'No data found';
        }
        return dataToBeReturned
    }

    function getProjects(empInternalId) {
        var projectSearchObj = search.create({
            type: "job",
            filters:
                [
                    ["jobresource", "anyof", empInternalId],
                    "AND",
                    ["status", "noneof", "1"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "entityid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    //search.createColumn({name: "altname", label: "Name"}),
                    search.createColumn({ name: "jobtype", label: "Project Type" }),
                    search.createColumn({ name: "customer", label: "Customer" }),
                    search.createColumn({ name: "subsidiary", label: "Subsidiary" }),
                    search.createColumn({ name: "contact", label: "Primary Contact" }),
                    search.createColumn({ name: "entitystatus", label: "Status" }),
                    search.createColumn({ name: "startdate", label: "Start Date" }),
                    search.createColumn({ name: "projectedenddate", label: "Projected End Date" }),
                    search.createColumn({ name: "enddate", label: "Actual End Date" }),
                    //search.createColumn({name: "custentity_planner", label: "Admin"}),
                    search.createColumn({ name: "allowtasktimeforrsrcalloc", label: "Allow Allocated Resources to Enter Time to All Tasks" }),
                    search.createColumn({ name: "companyname", label: "Project Name" }),
                    search.createColumn({ name: "projectmanager", label: "Project Manager" })
                ]
        });
        var searchResultCount = projectSearchObj.runPaged().count;

        log.audit({
            title: 'Search Result Size',
            details: 'Search Result Size is: ' + searchResultCount
        });

        var projectSearchResult = projectSearchObj.run().getRange({ start: 0, end: 200 });
        return [projectSearchResult, searchResultCount];
    }

    return {
        get: _get
    }
});
