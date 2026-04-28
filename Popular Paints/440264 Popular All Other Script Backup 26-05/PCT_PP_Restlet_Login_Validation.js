/**
*              //////////     //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  Restlet
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license     The SuiteScript 2.1 code in this page is for     , you can redistribute
             it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
             published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to create Sales Order from Custom Record.
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{



    function _post(context)
    {
        try
        {
            log.debug({
                title: "PCT-MonAmi",
                details: "Context Length : " + context.length + ", Context : [ " + JSON.stringify(context) + " ]"
            });

            var userEmail = context.email;
            var userPassword = context.password;
            log.debug("PCT-QMS", "Email : " + userEmail + ", Password : " + userPassword);

            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["email", "is", userEmail],
                        "AND",
                        ["custentity_pct_pp_access_qms", "is", "T"],
                        "AND",
                        ["custentity_pct_pp_qms_password", "is", userPassword]
                    ],
                columns:
                    [

                    ]


            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            log.debug("PCT-QMS", "Employee Search : " + searchResultCount);
            if (searchResultCount)
            {
                return "Success";
            }
            else
            {
                return "Failed";

            }
        }
        catch (ex)
        {

            log.error({ title: 'Restlet: error', details: ex });

        }
    }


    return {
        post: _post,
    }
});
