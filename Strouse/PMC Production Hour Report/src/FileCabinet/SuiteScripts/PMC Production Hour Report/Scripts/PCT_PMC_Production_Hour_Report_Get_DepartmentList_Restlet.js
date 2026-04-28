/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        try {

            log.debug("PCT-Strouse", "In Get Department Restlet");
            let departmentArray = [];


            var departmentSearchObj = search.create({
                type: "department",
                filters:
                    [
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "name", label: "Name" })
                    ]
            });
            var searchResultCount = departmentSearchObj.runPaged().count;
            log.debug("departmentSearchObj result count", searchResultCount);
            departmentSearchObj.run().each(function (result) {
                let departmentObj = {};
                departmentObj['internalId'] = result.id;
                departmentObj['department'] = result.getValue({ name: "name", label: "Name" })
                departmentArray.push(departmentObj)
                return true;
            });


            log.debug("PCT-Strouse", "Department List : " + JSON.stringify(departmentArray))
            return { 'isSuccess': true, 'data': departmentArray }
        }
        catch (error) {
            return { 'isSuccess': false, 'data': error.message }
        }
    }

    return {
        get: _get,
    }
});
