/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         03-08-23
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName   
*@Developer         Sandipan Sau
*@DevelopmentHead   Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This RestLet is for to fetch all the Script Id.


© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:

/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search'], function (search) {

    var filterArray = [];
    function _post(context) {
        let contextObj = JSON.parse(JSON.stringify(context))
        Object.keys(contextObj).map(function (key, index) {
            filterArray.push(["scriptid", "is", key]);
            if (!(index == Object.keys(contextObj).length - 1)) {
                filterArray.push("OR");
            }
        });
        let scriptInternalIdObj = fetchAllScriptId(filterArray, contextObj);
        log.debug("PCT-WMV", "Script Internal Id Obj : " + JSON.stringify(scriptInternalIdObj));
        return scriptInternalIdObj

    }
    // ----------------------------- Search to Get All Script Internal Id  ------------------------------
    const fetchAllScriptId = (filterArray, contextObj) => {
        log.debug("PCT-WMV", "Filter Array : " + filterArray + ", Context : " + JSON.stringify(contextObj));
        var scriptSearchObj = search.create({
            type: "script",
            filters:
                [
                    filterArray
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "scripttype", label: "Script Type" }),
                    search.createColumn({ name: "owner", label: "Owner" }),
                    search.createColumn({ name: "isinactive", label: "Inactive" })
                ]
        });
        var searchResultCount = scriptSearchObj.runPaged().count;
        log.debug("PCT-WMV-fetchAllScriptId Function", "Script Count : " + searchResultCount);
        if (searchResultCount > 0) {
            scriptSearchObj.run().each(function (result) {
                let scriptInternalId = result.id;
                let scriptId = result.getValue({ name: "scriptid" });
                log.debug("PCT-WMV", "Script Internal Id : " + scriptInternalId + ", Script Id : " + scriptId)
                contextObj[scriptId.toLowerCase()].scriptInternalId = scriptInternalId
                return true;
            });
            return { 'isSuccess': true, 'data': contextObj }
        }
        return { 'isSuccess': false, 'errorMessage': 'Unexpected Error' }
    }
    return {
        post: _post
    }
});

