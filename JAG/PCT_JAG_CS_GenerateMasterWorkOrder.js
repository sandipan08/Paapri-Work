
/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          15 September 2023        Sandipan Sau
*
*
* @NApiVersion 2.1
* @NModuleScope Public
 *@NScriptType ClientScript
/**********************************************************************************************************************************************

Script Name:        PCT_JAG_CS_GenerateMasterWorkOrder.js
Developer:          Sandipan Sau    

Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Client Script PCT_JAG_CS_GenerateMasterWorkOrder.jst Script will generate the Master Work Order

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:




/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary



***********************************************************************************************************************************************/
define(['N/log'], function (log) {

    function pageInit(context) {

    }

    function generateMasterWorkOrder() {
        console.log("In Generate Master work Order Function")
        log.debug("In Generate Master work Order Function")
    }



    return {
        pageInit: pageInit,
        generateMasterWorkOrder: generateMasterWorkOrder

    }
});
