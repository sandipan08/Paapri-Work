/**
*              //////////     MOTT TimeSheet Restlet for Time Tracking    //////////
* 
*@author       Sandipan Sau & Subhankar NAth
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2022-03-07 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for Mott TimeSheet Time Tracking , you can redistribute
            it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
            published by the Paapri's TEAM INNOVATION.

*@description  This Restlet is used to return Project Name, Project Id, Date, Duration, Posted Status 
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email', 'N/runtime'], function (log, record, runtime, file, format, search, email, runtime)
{

    function _get(context)
    {
        try
        {
            log.debug("PCT-Mott", "In RESTLet....");
            var emdId = context.empId;
            var startDate = context.startDate;
            var endDate = context.endDate;
            log.debug("PCT-Mott", "Context Data Details [ Employee Id : " + emdId + ", Start Date : " + startDate + ", End Date :" + endDate + "]");
            var mainData = getTimeTracking(emdId, startDate, endDate)
            log.debug({
                title: "PCT-Mott",
                details: "Data Obj Record Array : " + JSON.stringify(mainData)
            })
            // return mainData;
            return mainData
        }
        catch (e)
        {
            log.debug({
                title: 'PCT-LOG',
                details: e.message
            })
        }
    }

    function getTimeTracking(emdId, startDate, endDate)
    {
        var employeeSearchObj = search.create({
            type: "employee",
            filters:
                [
                    ["internalid", "anyof", emdId],
                    "AND",
                    ["time.date", "within", startDate, endDate]
                    // ["time.date", "within", "02/28/2022", "03/31/2022"]

                ],
            columns:
                [
                    search.createColumn({
                        name: "customer",
                        join: "time",
                        summary: "GROUP",
                        label: "Customer"
                    }),
                    search.createColumn({
                        name: "date",
                        join: "time",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Date"
                    }),
                    search.createColumn({
                        name: "posted",
                        join: "time",
                        summary: "GROUP",
                        label: "Posted"
                    }),
                    search.createColumn({
                        name: "durationdecimal",
                        join: "time",
                        summary: "SUM",
                        label: "Duration (Decimal)"
                    })
                ]
        });
        var timeCount = employeeSearchObj.runPaged().count;
        log.debug("PCT-Mott", "Time Tracking Record Count : " + timeCount);
        var dataObj = {};
        employeeSearchObj.run().each(function (result)
        {
            // .run().each has a limit of 4,000 results
            var projectId = result.getValue({
                name: "customer",
                join: "time",
                summary: "GROUP",
                label: "Customer"
            })
            var isPosted = result.getValue({
                name: "posted",
                join: "time",
                summary: "GROUP",
                label: "Posted"
            })
            var date = result.getValue({
                name: "date",
                join: "time",
                summary: "GROUP",
                sort: search.Sort.ASC,
                label: "Date"
            })

            if (!(projectId in dataObj))
            {
                dataObj[projectId] = {};
                dataObj[projectId]['projectId'] = projectId;
                dataObj[projectId]['projectName'] = result.getText({
                    name: "customer",
                    join: "time",
                    summary: "GROUP",
                    label: "Customer"
                })
                dataObj[projectId]['projectData'] = {}
                if (!(date in dataObj[projectId]['projectData']))
                {
                    dataObj[projectId]['projectData'][date] = {}
                    dataObj[projectId]['projectData'][date][isPosted] = result.getValue({
                        name: "durationdecimal",
                        join: "time",
                        summary: "SUM",
                        sort: search.Sort.ASC
                    })
                }
                else
                {
                    dataObj[projectId]['projectData'][date][isPosted] = result.getValue({
                        name: "durationdecimal",
                        join: "time",
                        summary: "SUM",
                        sort: search.Sort.ASC
                    })
                }
            }
            else
            {
                if (!(date in dataObj[projectId]['projectData']))
                {
                    dataObj[projectId]['projectData'][date] = {}

                    dataObj[projectId]['projectData'][date][isPosted] = result.getValue({
                        name: "durationdecimal",
                        join: "time",
                        summary: "SUM",
                        sort: search.Sort.ASC
                    })
                }
                else
                {
                    dataObj[projectId]['projectData'][date][isPosted] = result.getValue({
                        name: "durationdecimal",
                        join: "time",
                        summary: "SUM",
                        sort: search.Sort.ASC
                    })

                }
            }
            return true;
        });
        return dataObj;

    }
    return {
        get: _get,

    }
});