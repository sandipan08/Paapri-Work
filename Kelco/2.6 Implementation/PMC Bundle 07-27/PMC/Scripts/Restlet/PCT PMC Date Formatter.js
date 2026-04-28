/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.         06-07-22
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
*@ScriptName        PCT PMC Date Formatter
*@Developer         Sandipan Sau
*@DevelopmentHead   Ratwika Mondal
*@CompanyName       Paapri Business Technologies (India) Pvt Ltd
*@Purpose 			This RestLet is for to fetch all the Script Id.


© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_get                                                           Main Function                                                          Sandipan Sau

/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/


define(['N/format'], function (format) {

    function _get(context) {
        log.debug("PCT-PMC", "In Date Formatter Restlet");
        return JSON.stringify(format.format({
            value: new Date(),
            type: format.Type.DATETIME
        }))

    }
    return {
        get: _get,
    }
});

