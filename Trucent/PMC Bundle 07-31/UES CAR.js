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

function beforeLoad_view(type,form)
{
	if( type== 'view')
	{
		var id = nlapiGetRecordId();//get the quote id 
		nlapiLogExecution('DEBUG','Amal-log','id='+id);
		var PFF = nlapiLoadRecord('customrecord_pct_qms_8d_correction',id);
		form.addButton('custpage_new','Print',"client();");
		nlapiLogExecution('DEBUG', 'Amal-log', 'in function');
		form.setScript('customscript_pct_mott_client_car');// id of client script 
        //break;
	}
}