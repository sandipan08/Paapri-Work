/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

define(['N/search'], function (search) {

    function _get(context) {
        try {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${JSON.stringify(context)}`
            })
  
            if (context.type == 'workStations') {
                // let getWorkStations = getWorkStations(context.location)
                return { 'isSuccess': true, 'data': getWorkStations(context.location) }
            }
            else if (context.type == 'workCenters') {
                // let getWorkStations = getWorkCenters(context.location)
                return { 'isSuccess': true, 'data': getWorkCenters(context.workStation) }
            }

        } catch (error) {
            log.debug({
                title: 'PCT-PMC',
                details: `Context = ${error.message}`
            })
            return { 'isSuccess': false, 'errorMessage': error.message }
        }

    }

    const getWorkStations = (dataObj) => {

        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
                [
                    ["ismanufacturingworkcenter", "is", "T"],
                    "AND",
                    ["custentity_pct_mtc_pmc_locations", "anyof", dataObj.location],
                ],
            columns:
                [

                    search.createColumn({
                        name: "custentity_pct_mtc_workstations_list",
                        sort: search.Sort.ASC,
                        summary: "GROUP",
                        label: "Work Station"
                    })
                ]
        });
        var searchResultCount = entitygroupSearchObj.runPaged().count;
        log.debug("entitygroupSearchObj result count", searchResultCount);
        let workStationsArray = [];
        if (searchResultCount) {
            entitygroupSearchObj.run().each(function (result) {

                let res = {};

                res['name'] = result.getText({
                    name: "custentity_pct_mtc_workstations_list",
                    sort: search.Sort.ASC,
                    summary: "GROUP",
                    label: "Work Station"
                })
                res['internalId'] = result.getValue({
                    name: "custentity_pct_mtc_workstations_list",
                    sort: search.Sort.ASC,
                    summary: "GROUP",
                    label: "Work Station"
                })

                workStationsArray.push(res);
                return true;
            });
            return { 'isSuccess': true, 'data': workStationsArray }
        }
        else {
            return { 'isSuccess': false, 'errorMessage': 'Work Stations Not Found' }
        }

    }
    const getWorkCenters = (dataObj) => {
        let workCentersArray = [];
        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
                [
                    ["custentity_pct_mtc_workstations_list", "anyof", "3"],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "groupname", label: "Name" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = entitygroupSearchObj.runPaged().count;
        log.debug("entitygroupSearchObj result count", searchResultCount);
        if (searchResultCount) {
            entitygroupSearchObj.run().each(function (result) {
                let res = {};
                res['internalId'] = result.getValue({ name: "internalid", label: "Internal ID" })
                res['name'] = result.getValue({ name: "groupname", label: "Name" })
                workCentersArray.push(res)
                return true;

            });
            return { 'isSuccess': true, 'data': workCentersArray }
        }
        else {
            return { 'isSuccess': false, 'errorMessage': 'Work Centers Not Found' }
        }


    }

    return {
        get: _get,
      
    }
});
