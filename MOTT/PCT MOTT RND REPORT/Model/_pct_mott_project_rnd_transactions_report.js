/**
*              //////////     MOTT RND PROJECT SEARCH RESTlet     //////////
* 
*@author       Bhim Shaw
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2022-03-23 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for return the PCT Project RND Transaction Search (Id : 4553), you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to call the PCT Project RND Transaction Search (Id : 4553) which will return a Object contain all the search object
*/
define(["N/record", "N/search", "N/format", "N/error"], function (record, search, format, error)
{
    var filterArray = [];
    function _get(context)
    {
        log.debug({
            title: "PCT-MOTT",
            details: "Context : [ " + JSON.stringify(context) + " ]"
        });

        var projectName = context.projectName;
        var projectManager = context.projectManager;
        var employeeGroup = context.employeeGroup;
        var projectStatus = context.projectStatus;
        log.debug({
            title: "PCT-MOTT",
            details: "Project Name : " + projectName + ", Project Manager : " + projectManager + ", Employee Group : " + employeeGroup + ", Project Status : " + projectStatus
        });
        // ------------------------------------- Added Criteria to Filter Array -----------------------------------
        filterArray.push(["mainline", "is", "T"]);
        filterArray.push("AND");

        // ---------------- For Project Name ------------------
        if (projectName === "allProjectName")
        {
            filterArray.push(["custbody34", "noneof", "@NONE@"]);
            filterArray.push("AND");
        }
        else
        {
            filterArray.push(["custbody34", "anyof", projectName]);
            filterArray.push("AND");
        }
        // ---------------- For Project Manager ------------------
        if (projectManager === "allProjectManager")
        {
            filterArray.push(["custbody34.projectmanager", "noneof", "@NONE@"]);
            filterArray.push("AND");
        }
        else
        {
            filterArray.push(["custbody34.projectmanager", "anyof", projectManager]);
            filterArray.push("AND");
        }
        // ---------------- For Project Status ------------------
        if (projectStatus === "allStatus")
        {
            filterArray.push(["custbody34.status", "noneof", "@NONE@"])
            filterArray.push("AND");
        }
        else
        {
            // 1 = closed
            // 5 = Awarded
            // 2 = In Progress
            // 4 = Pending
            // 3 = Not Awarded
            filterArray.push(["custbody34.status", "anyof", projectStatus])
            filterArray.push("AND");
        }
        // ---------------- For Employee Group ------------------
        if (employeeGroup === "allEmployeeGroup")
        {
            filterArray.push(["custbody34.custentity_pct_mott_project_emp_grp", "anyof", "@NONE@"]);
            filterArray.push("AND");
        }
        else
        {
            filterArray.push(["custbody34.custentity_pct_mott_project_emp_grp", "anyof", employeeGroup])
            filterArray.push("AND");
        }
        filterArray.push(["formulanumeric: {amount}", "greaterthanorequalto", "0"])
        // ------------------------------------- End Criteria to Filter Array -----------------------------------

        log.debug({
            title: "PCT-MOTT",
            details: "Search Filter Array : " + filterArray
        });

        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    filterArray
                ],
            columns:
                [
                    search.createColumn({
                        name: "custbody34",
                        summary: "GROUP",
                        label: "Mott Project"
                    }),
                    search.createColumn({
                        name: "entitystatus",
                        join: "CUSTBODY34",
                        summary: "GROUP",
                        label: "Status"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "CASE WHEN {type}='Sales Order' THEN TO_NUMBER({amount}) ELSE 0 END",
                        label: "Formula (Currency)"
                    }),
                    search.createColumn({
                        name: "custentity_pct_mott_project_current_cost",
                        join: "CUSTBODY34",
                        summary: "MAX",
                        label: "Project Current Cost"
                    }),
                    search.createColumn({
                        name: "formulapercent",
                        summary: "SUM",
                        formula: "CASE WHEN {type}='Sales Order' AND {amount}>0 THEN ((TO_NUMBER({amount})-TO_NUMBER({custbody34.custentity_pct_mott_project_current_cost}))/TO_NUMBER({amount})) ELSE 0 END",
                        label: "Formula (Percent)"
                    }),
                    search.createColumn({
                        name: "estimatedcost",
                        join: "CUSTBODY34",
                        summary: "GROUP",
                        label: "Estimated Cost"
                    }),
                    search.createColumn({
                        name: "custentity_pct_mott_as_sold_cost",
                        join: "CUSTBODY34",
                        summary: "GROUP",
                        label: "As Sold Cost"
                    })
                ]
        });

        var arrData = [];
        //log.debug("transactionSearchObj result count",searchResultCount);
        transactionSearchObj.run().each(function (result)
        {
            // .run().each has a limit of 4,000 results

            var Mott_project = result.getText({
                name: "custbody34",
                summary: "GROUP",
                label: "Mott Project"
            })

            var status = result.getText({
                name: "entitystatus",
                join: "CUSTBODY34",
                summary: "GROUP",
                label: "Status"
            })

            var Formula_currency = parseFloat(result.getValue({
                name: "formulacurrency",
                summary: "SUM",
                formula: "CASE WHEN {type}='Sales Order' THEN TO_NUMBER({amount}) ELSE 0 END",
                label: "Formula (Currency)"
            }))

            var project_current_cost = parseFloat(result.getValue({
                name: "custentity_pct_mott_project_current_cost",
                join: "CUSTBODY34",
                summary: "MAX",
                label: "Project Current Cost"
            }))

            var percentage = 0;
            var project_current_cost_NaN = isNaN(project_current_cost);
            var Formula_currency_NaN = isNaN(Formula_currency);
            if (project_current_cost_NaN == false && Formula_currency_NaN == false && Formula_currency != 0)
            {
                percentage = ((Formula_currency - project_current_cost) * 100) / Formula_currency;
                percentage = percentage.toFixed(5);
                percentage = percentage + '%';
                // percentage = percentage.toFixed(5); 
            }
            else
            {
                percentage = 0 + '%'
            }
            var estimate_cost = result.getValue({
                name: "estimatedcost",
                join: "CUSTBODY34",
                summary: "GROUP",
                label: "Estimated Cost"
            })
            var asSoldCost = result.getValue({
                name: "custentity_pct_mott_as_sold_cost",
                join: "CUSTBODY34",
                summary: "GROUP",
                label: "As Sold Cost"
            })

            if (isNaN(project_current_cost)) { project_current_cost = 0 }

            //  log.debug("PCT-MOTT", "Project Name : " + Mott_project + ", Status : " + status + ", Sum Of Project Revenue : " + Formula_currency + ", Maximum of Project Cost : " + project_current_cost + ", Current Margin : " + percentage + ", Estimated Cost : " + estimate_cost + ", As Sold Cost : " + asSoldCost)
            // --------------- Create Data Obj ----------------
            var dataObj = {};
            dataObj["mottProject"] = Mott_project;
            dataObj["status"] = status;
            dataObj["formulaCurrency"] = Formula_currency;
            dataObj["projectCurrentCost"] = project_current_cost;
            dataObj["formulaPercent"] = percentage;
            dataObj["estimatedCost"] = estimate_cost;
            dataObj["asSoldCost"] = asSoldCost;

            arrData.push(dataObj);
            // log.debug("arrData", dataObj);
            return true;
        });
        log.debug("arrData", arrData);
        log.debug("arrDataLength", arrData.length);
        return arrData;
    }
    // // ------------------------ Custom Function to Check Null Value & Replace with a Blank Value
    // function nullCheck(variable)
    // {
    //     if (variable === null)
    //     {
    //         variable = "";
    //     }
    //     else
    //     {
    //         variable = variable;
    //     }
    //     return variable;
    // }
    return {
        get: _get
        // post: _post

    }
});