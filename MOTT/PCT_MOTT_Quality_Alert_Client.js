/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Oct 2019     Amalendu Dolui
 *
 */
/**************************************************************************************

Script Name: RESTlet
Developer: Amalendu Dolui
Development Head: Ms.Ratwika Mondal 
Company Name: Paapri Cloud Technologies
Purpose: 


© Copyright All Right

***********************************************************************************************************************************************/
/********************************************************Included Function & Update*************************************************************
/**********************************************************************************************************************************************
 Function Name:             Purpose:                                                                               Developer:

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary
****************************************************************************************/

function previewQA(request, response)
{
    nlapiLogExecution('DEBUG', 'Rehan-log', 'in client function');

    var createURL = nlapiResolveURL('SUITELET', 'customscript_pct_mott_qa_ss_1', 'customdeploy_pct_mott_qa_suitelet', false);//for createing url & calling the SUITELET 
    //(customscript17)=Suitelet script file's id & (customdeploy1)= Suitelet deployment file's id

    createURL += '&id=' + nlapiGetRecordId();  //pass the internal id of the current record

    newWindow = window.open(createURL);

}
