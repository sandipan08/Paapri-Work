/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          31 July 2023           	Sandipan Sau
*
*
* @NApiVersion 2.1
* @NModuleScope Public
* @NScriptType Restlet
/**********************************************************************************************************************************************

Script Name:        PCT WorkOrder Variance Restlet for get Work Order from Item
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet is used to get  Work Order from Item

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary



***********************************************************************************************************************************************/
define(['N/log', 'N/search'], function (log, search) {

    function _get(context) {

        log.debug("PCT", "In Work Order Variance restlet");

        return { 'isSuccess': true, 'data': getWorkOrderFromItem(parseInt(context.selectItem)) }

    }
    // --------------------- Function for get work Order from Item Start  ------------------------
    const getWorkOrderFromItem = (item) => {
        let itemArray = [];
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["item", "anyof", item],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            itemArray.push(result.getValue({ name: "internalid", label: "Internal ID" }))
            return true;
        });

        log.debug("PCT", "Item Array  : " + itemArray);

        return itemArray;

    }

    // --------------------- Function for get work Order from Item End ------------------------






    return {
        get: _get,
    }
});
