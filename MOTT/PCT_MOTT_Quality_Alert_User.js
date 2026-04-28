/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Oct 2019     Rehan Nawaz
 *
 */
/**************************************************************************************

Script Name: RESTlet
Developer: Rehan Nawaz
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



function beforeLoad_rn(type, form)
{
    if (type == 'view')
    {
        var id = nlapiGetRecordId();//get the quote id 
        var rec_type = nlapiGetRecordType();
        nlapiLogExecution('DEBUG', 'Rehan-log', 'id=' + id);
        var rec_load = nlapiLoadRecord(rec_type, id); //quotation form load
        nlapiLogExecution('DEBUG', 'Rehan-log', 'rec_load=' + rec_load);
        form.addButton('custpage_buttonalert', 'Preview QA', 'previewQA()');
        form.setScript('customscript_pct_mott_qa_cs_1'); // client id
        nlapiLogExecution('DEBUG', 'Rehan-log', 'Button Added');
    }
}