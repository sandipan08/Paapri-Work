
/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          15 September 2023        Sandipan Sau
*
*
* @NApiVersion 2.1
* @NModuleScope Public
* @NScriptType UserEventScript
/**********************************************************************************************************************************************

Script Name:        PCT_JAG_UE_Generate Master Work Order.js
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This User Event will create the Generate Master Work Order button & call the client script which will generate the Master Work Order

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

    function beforeLoad(context) {
        log.debug("PCT-JAG", "In User Event");
        var recId = context.newRecord.id;
        log.debug({ title: 'PCT-JAG', details: "Record Id " + recId });
        if (context.type == context.UserEventType.VIEW) {
            context.form.clientScriptModulePath = 'SuiteScripts/PCT_JAG_CS_GenerateMasterWorkOrder.js';
            context.form.addButton({
                id: 'custpage_suiteletbutton_masterWorkOrder_Button',
                label: 'Generate Master Work Order',
                functionName: 'generateMasterWorkOrder'
            });


        }
    }



    return {
        beforeLoad: beforeLoad,

    }
});
