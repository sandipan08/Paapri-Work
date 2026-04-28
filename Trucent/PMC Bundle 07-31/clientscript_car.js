/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Oct 2019     Moumita Banik
 *
 */
/**************************************************************************************

Script Name: RESTlet
Developer: Moumita Banik
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

function client(request, response)
{
	nlapiLogExecution('DEBUG', 'Amal-log', 'in function');

	var createURL = nlapiResolveURL('SUITELET','customscript_pct_mott_8d_car','customdeploy_pct_mott_8d_car',false);//for createing url & calling the SUITELET 
	//(customscript17)=Suitelet script file's id & (customdeploy1)= Suitelet deployment file's id

	createURL += '&id=' + nlapiGetRecordId();  //pass the internal id of the current record
 nlapiLogExecution('DEBUG','Rakhi1-log','createURL='+createURL);
	newWindow = window.open(createURL);

}