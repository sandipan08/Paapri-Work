
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

Script Name:        PCT WorkOrder Variance Restlet for get Operation Name from Cost Template
Developer:          Sandipan Sau    
Development Head:   Rajesh Nandi
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This Restlet is used to get Operation Name from Cost Template

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

        // log.debug(JSON.stringify(context.selectWorkOrder));

        // ----------------------- Declare Global Variable Start ------------------
        let operationNameObject = {};

        // workOrderArray.push(parseInt(context.selectWorkOrder));
        operationNameObject = getOperationName('14739')

        return { 'isSuccess': true, 'data': operationNameObject }

    }
    // --------------------- Function for get Operation Name Start ( Account : 1.0, Search Id : 1600 ) ------------------------
    const getOperationName = (workOrderArray) => {
        let operationNameObj = {};
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["status", "anyof", "PROGRESS", "NOTSTART"],
                    "AND",
                    ["workorder", "anyof", workOrderArray]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Operation Name" }),
                    search.createColumn({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" }),
                    search.createColumn({ name: "workorder", label: "Work Order" }),
                    search.createColumn({
                        name: "internalid",
                        join: "workOrder",
                        label: "Internal ID"
                    })
                ]
        });
        var operationCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("Operation count : ", operationCount);

        manufacturingoperationtaskSearchObj.run().each(function (result) {
            let operationObj = {}
            let workOrderId = result.getValue({
                name: "internalid",
                join: "workOrder",
                label: "Internal ID"
            });
            let costTemplateName = result.getText({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" });
            operationObj.operationId = result.id;
            operationObj.operationName = result.getValue({ name: "name", label: "Operation Name" });
            operationObj.costTemplateId = result.getValue({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" });
            operationObj.costTemplateName = costTemplateName
            if (!(workOrderId in operationNameObj)) {
                operationNameObj[workOrderId] = {}
                operationNameObj[workOrderId][costTemplateName] = operationObj
            }
            else {
                operationNameObj[workOrderId][costTemplateName] = operationObj
            }

            return true;

        });
        log.debug("PCT", "Operation Object : " + JSON.stringify(operationNameObj))

        return operationNameObj;



        // --------------------- Function for get get Operation Name End ( Account : 1.0, Search Id : 1600 ) ------------------------



    }


    return {
        get: _get,
    }
});
