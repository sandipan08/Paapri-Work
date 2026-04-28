/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         01-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Get DownTime Category & Reason List 
*@Developer         Sandipan Sau
*@DevelopmentHead   Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This RestLet is for to fetch all the Script Id.


© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_post                                                           Main Function                                                          Sandipan Sau
fetchAllDownTimeCategory                                      Fetches All DownTime Category                                           Sandipan Sau 
/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/search'], function (search) {

    function _get(context) {
        log.debug("PCT-PMC", "In PCT PMC Get DownTime Category List");
        if (fetchAllDownTimeCategory().isSuccess && fetchAllDownTimeReason().isSuccess) {
            return { 'isSuccess': true, 'category': { 'fieldId': 'categoryType', 'fieldName': 'Downtime Category', 'options': fetchAllDownTimeCategory().data }, 'reason': { 'fieldId': 'reasonType', 'fieldName': 'Downtime Reason', 'options': fetchAllDownTimeReason().data } }
        }
        return { 'isSuccess': false, 'errorMessage': 'DownTime Category & Reason List Not Found' }
    }
    // ----------------------------- Search to Get All DownTime Category Start ------------------------------
    const fetchAllDownTimeCategory = () => {
        let downTimeCategoryArray = new Array();
        var customrecord_pct_pmc_dwn_catSearchObj = search.create({
            type: "customrecord_pct_pmc_dwn_cat",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var dopwnTimeCategoryCount = customrecord_pct_pmc_dwn_catSearchObj.runPaged().count;
        log.debug("PCT-PMC", "DownTime Category : " + dopwnTimeCategoryCount);
        if (dopwnTimeCategoryCount > 0) {
            customrecord_pct_pmc_dwn_catSearchObj.run().each(function (result) {
                let downTimeCategoryObj = {};
                downTimeCategoryObj['internalId'] = result.id;
                downTimeCategoryObj['name'] = result.getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                })
                downTimeCategoryArray.push(downTimeCategoryObj);
                return true;
            });
            return { 'isSuccess': true, 'data': downTimeCategoryArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'DownTime Category Not Found' }
    }
    // ----------------------------- Search to Get All DownTime Category End ------------------------------

    // ----------------------------- Search to Get All DownTime List Start --------------------------------
    const fetchAllDownTimeReason = () => {
        let downTimeReasonArray = new Array();
        var customrecord_pct_pmc_dwn_reasonSearchObj = search.create({
            type: "customrecord_pct_pmc_dwn_reason",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var downTimeReasonCount = customrecord_pct_pmc_dwn_reasonSearchObj.runPaged().count;
        log.debug("PCT-PMC", "DownTime Reason : " + downTimeReasonCount);
        if (downTimeReasonCount > 0) {
            customrecord_pct_pmc_dwn_reasonSearchObj.run().each(function (result) {
                let downTimeReasonObj = {};
                downTimeReasonObj['internalId'] = result.id;
                downTimeReasonObj['name'] = result.getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                })
                downTimeReasonArray.push(downTimeReasonObj);
                return true;
            });
            return { 'isSuccess': true, 'data': downTimeReasonArray }
        }
        return { 'isSuccess': false, 'errorMessage': 'DownTime Category Not Found' }
    }
    // ----------------------------- Search to Get All DownTime List End ----------------------------------
    return {
        get: _get,
    }
});

