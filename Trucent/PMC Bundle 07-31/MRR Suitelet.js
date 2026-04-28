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

function print(request, response) 
{
var recId = request.getParameter('id');
nlapiLogExecution('DEBUG','Amal-log','id='+recId);

var mrr_form = nlapiLoadRecord('customrecord_pct_qms_material_review_req',recId);
var mrr_emp = mrr_form.getFieldText('custrecord_pct_qms_mrr_emp_no');
nlapiLogExecution('DEBUG','Amal-log','emp='+mrr_emp);
var mrr_item = mrr_form.getFieldText('custrecord_pct_qms_mrr_item_no');
nlapiLogExecution('DEBUG','Amal-log','item='+mrr_item);
var mrr_PD_Number = mrr_form.getFieldText('custrecord_pct_qms_mrr_pd_no');
nlapiLogExecution('DEBUG','Amal-log','pd number='+mrr_PD_Number);
var mrr_customer = mrr_form.getFieldText('custrecord_pct_qms_mrr_customer');
nlapiLogExecution('DEBUG','Amal-log','customer='+mrr_customer);
var mrr_seq_or_desk = mrr_form.getFieldValue('custrecord_pct_qms_mrr_seq_desc');
nlapiLogExecution('DEBUG','Amal-log','seq#='+mrr_seq_or_desk);
var mrr_vendor = mrr_form.getFieldText('custrecord_pct_qms_mrr_vendor');
nlapiLogExecution('DEBUG','Amal-log','vendor='+mrr_vendor);
//var mrr_value_stream = mrr_form.getFieldText('custrecord_pct_qms_mrr_value_stream');
/*var value_stream_idexof = mrr_value_stream.indexOf("-");
  nlapiLogExecution('DEBUG','Amal-Log','indexof='+value_stream_idexof);
  var mrr_Value_Stream = mrr_value_stream.substring(value_stream_idexof+1,mrr_value_stream.length);
  nlapiLogExecution('DEBUG','Amal-Log','indexof='+mrr_Value_Stream);*/
//nlapiLogExecution('DEBUG','Amal-log','value_stream='+mrr_value_stream);
var mrr_due_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_due_date');
nlapiLogExecution('DEBUG','Amal-log','due_date='+mrr_due_date);
var mrr_qty = mrr_form.getFieldValue('custrecord_pct_qms_mrr_qty_mrr');
nlapiLogExecution('DEBUG','Amal-log','qty_in_mrr='+mrr_qty);
var mrr_case = mrr_form.getFieldValue('custrecord_pct_qms_mrr_case_no');
nlapiLogExecution('DEBUG','Amal-log','mrr_case='+mrr_case);
var mrr_po = mrr_form.getFieldText('custrecord_pct_qms_mrr_po_no');
var mrr_job_qty = mrr_form.getFieldValue('custrecord_pct_qms_mrr_job_qty');
var mrr_no = mrr_form.getFieldValue('name');
var mrr_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_date');
var mrr_rma = mrr_form.getFieldValue('custrecord_pct_qms_mrr_rma_no');
var mrr_batch = mrr_form.getFieldValue('custrecord_pct_qms_mrr_batch_no');
var mrr_notes = mrr_form.getFieldValue('custrecord_pct_qms_mrr_mrr_notes');
var mrr_immediate_remidiation = mrr_form.getFieldValue('custrecord_pct_qms_mrr_immediate_remedit');
var mrr_rework_instructions = mrr_form.getFieldValue('custrecord_pct_qms_mrr_rework_instructio');
var mrr_number_of_parts_quarantine = mrr_form.getFieldValue('custrecord_pct_qms_mrr_nopiq');
var mrr_locations = mrr_form.getFieldText('custrecord_pct_qms_mrr_watl');
var mrr_number_trays = mrr_form.getFieldValue('custrecord_pct_qms_mrr_number_trays');
var mrr_equipments = mrr_form.getFieldValue('custrecord_pct_qms_mrr_wewi');
var mrr_potentially_failed = mrr_form.getFieldValue('custrecord_pct_qms_mrr_wpfitp');
var mrr_procurement = mrr_form.getFieldText('custrecord_pct_qms_mrr_procurement');
var mrr_operations = mrr_form.getFieldText('custrecord_pct_qms_mrr_operations');
var mrr_operation_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_operation_date');
var mrr_procurement_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_procurement_date');
var mrr_closed_by = mrr_form.getFieldText('custrecord_pct_qms_mrr_mrr_closed_by');
var mrr_close_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_date_close');


var mrr_car = mrr_form.getFieldValue('custrecord_pct_qms_mrr_car');
var mrr_quality = mrr_form.getFieldText('custrecord_pct_qms_mrr_quality');
var mrr_process_engg = mrr_form.getFieldText('custrecord_pct_qms_mrr_process_engineer');
var mrr_quality_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_quality_date');
var mrr_process_engg_date = mrr_form.getFieldValue('custrecord_pct_qms_mrr_process_engg_date');
var mrr_wiporinv = mrr_form.getFieldValue('custrecord_pct_qms_mrr_wip_inv');
var mrr_receiving = mrr_form.getFieldValue('custrecord_pct_qms_mrr_receiving');
var mrr_return = mrr_form.getFieldValue('custrecord_pct_qms_mrr_return');
var quality_alert = mrr_form.getFieldValue('custrecord_pct_qms_mrr_quality_alert');
var line_count = mrr_form.getLineItemCount('recmachcustrecord_pct_qms_sb_link');



var specification = new Array();
var Actual_Finding = new Array();
var Sample_Size = new Array();
var Qty_non_con = new Array();
var defect_type = new Array();
var defect_code = new Array();
var disposition_cause_code = new Array();
var reoccurance = new Array();
var scrap_cost = new Array();
var i;
for(i=1;i<=line_count;i++)
{
	specification[i] = mrr_form.getLineItemValue('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_specification',i);
	Actual_Finding[i] = mrr_form.getLineItemValue('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_actual_finding',i);
	Sample_Size[i] = mrr_form.getLineItemValue('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_sample_size',i);
	Qty_non_con[i] = mrr_form.getLineItemValue('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_qty_non_con',i);
	defect_type[i] = mrr_form.getLineItemText('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_defect_type',i);
	defect_code[i] = mrr_form.getLineItemText('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_defect_code',i);
  var defect_code_idexof = defect_code[i].indexOf("-");
 //defect_code[i] = //defect_code[i].substring(defect_code_idexof+1,defect_code[i].length);
	disposition_cause_code[i] = mrr_form.getLineItemText('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_disposition_cc',i);
	reoccurance[i] = mrr_form.getLineItemValue('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_sb_reoccurance',i);
	scrap_cost[i] = mrr_form.getLineItemText('recmachcustrecord_pct_qms_sb_link','custrecord_pct_qms_mrr_scrap',i);
}
var strVar = "";
strVar += "<?xml version=\"1.0\"?>";
strVar +="<pdf>";
strVar +="<head>";
strVar +="<macrolist>";
strVar +="<macro id=\"nlheader\">";
strVar +="<table cellpadding=\"1\" style=\"width:100%;\" align=\"right\">";
strVar +="<tr>";
strVar +="<td colspan=\"5\" style=\"margin-left:-20px; margin-Top:-15px;\"> <img src=\"http://8454393.shop.netsuite.com/core/media/media.nl?id=5622&c=8454393&h=-HXINcLwS-p622YGdZRW0O_dZ86ZOXmPoGa6rgyoDx95rC3_\" width=\"64%\" height=\"100%\"/>";
strVar +="<\/td>";
strVar +="<td align=\"left\" colspan=\"7\" style=\"margin-left:-80px;\"><span style=\"font-size:18pt;\">MATERIAL REVIEW REQUEST</span></td>";
strVar +="<\/tr>";
  		strVar +="<\/table>";
        strVar +="<\/macro>";
		strVar +="<\/macrolist>";
		strVar +="<style type=\"text/css\">* {";
		strVar +="}";
		strVar +="table {";
		strVar +="font-size: 8pt;";
		strVar +="table-layout: fixed;";
		strVar +="}";
        strVar +="th {";
        strVar +="font-weight: bold;";
strVar +="font-size: 8pt;";
strVar +="vertical-align: middle;";
            strVar +="padding: 4px 5px 2px;";
         strVar +="background-color: #e3e3e3;";
         strVar +="color: #333333;";
        strVar +="}";
        strVar +="td {";
        strVar +="padding: 4px 6px;";
        strVar +="}";
		strVar +="td p { align:left }";
		strVar +="</style>";
		strVar +="<\/head>";
		strVar +="<body header=\"nlheader\" header-height=\"5%\" footer=\"nlfooter\" footer-height=\"20pt\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"Letter\">";
   
  strVar +="<table style=\"width:100%;\">";
    strVar +="<tr><td colspan=\"3\" font-size=\"6\">Section A</td>";
    strVar +="<td colspan=\"4\"></td>";
    strVar +="<td colspan=\"3\"></td>";
    strVar +="<td colspan=\"2\"></td>";
    strVar +="<\/tr>";
  strVar +="<\/table>";
  strVar +="<table border=\"2\" style=\"width:100%;\">";
    strVar +="<tr><td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>Employee #</i></td>";
	    strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\">"+find_null(mrr_emp)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>Item</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_item)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>Qty in MRR</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_qty)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>MRR</i></td>";
	  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\">"+find_null(mrr_no)+"</td>";
    strVar +="<\/tr>";
    strVar +="<tr><td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>WIP/Inv</i></td>";
	if(mrr_wiporinv == 'T')
	{
	strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\"><input type=\"checkbox\" border=\"1\" name=\"Java\" checked=\"true\" readonly=\"readonly\"/></td>";
	}
	else
	{
	strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\"><input type=\"checkbox\" border=\"1\" name=\"Java\" checked=\"false\" readonly=\"readonly\"/></td>";
	}
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>Seq# or Desc</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_seq_or_desk)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>WO#</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_PD_Number)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>Date</i></td>";
	  strVar +="<td style=\"border-bottom:1px solid #000000; font-size:7pt;\" colspan=\"1\" >"+find_null(mrr_date)+"</td>";
    strVar +="<\/tr>";
    strVar +="<tr><td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>Return</i></td>";
	if(mrr_return == 'T')
	{
	strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\"><input type=\"checkbox\" border=\"1\" name=\"Jav\" checked=\"true\" readonly=\"readonly\"/></td>";
	}
	else
	{
	strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\"><input type=\"checkbox\" border=\"1\" name=\"Jav\" checked=\"false\" readonly=\"readonly\"/></td>"
	}
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>Customer</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_customer)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>Case#</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_case)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>RMA</i></td>";
	  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\">"+find_null(mrr_rma)+"</td>";
    strVar +="<\/tr>";
    strVar +="<tr><td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>Receiving</i></td>";
	
    if(mrr_receiving == 'T')
	{
	strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\"><input type=\"checkbox\" border=\"1\" name=\"Ja\" checked=\"true\" readonly=\"readonly\"/></td>";
	}
	else
	{
	strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\"><input type=\"checkbox\" border=\"1\" name=\"Ja\" checked=\"false\" readonly=\"readonly\"/></td>";	
	}
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>Vendor</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_vendor)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\"><i>PO#</i></td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\">"+find_null(mrr_po)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\"><i>LOT#</i></td>";
	  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\">"+find_null(mrr_batch)+"</td>";
    strVar +="<\/tr>";
    strVar +="<\/table>";
	
	strVar +="<table style=\"width:100%;\">";
    strVar +="<tr><td colspan=\"3\" font-size=\"6\">Section B</td>";
      strVar +="<td align=\"center\" colspan=\"9\" font-size=\"6\"></td>";//All MRR signature blocks are to include full signature and employee ID/clock number/badge number
    strVar +="<\/tr>";
  strVar +="<\/table>";
  
  strVar +="<table border=\"2\" style=\"width:100%;\">";
  
    strVar +="<tr>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"30\"><i>Specification/Requirement</i>";
      strVar +="<\/td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"30\"><i>Actual Finding</i>";
      strVar +="</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\" height=\"30\"><i>Sample<br/>Size</i>";
      strVar +="</td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\" height=\"30\" font-size=\"7\"><i>Qty Non-<br/>Con</i>";
      strVar +="</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"30\"><i>Defect<br/>Type</i>";
      strVar +="</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\" height=\"30\"><i>Defect<br/>Code</i>";
      strVar +="</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"30\"><i>Disposition<br/>Cause Code</i>";
      strVar +="<\/td>";
    strVar +="<\/tr>";
    var i = 1;
    for(i=1; i<=line_count; i++)
	{
    strVar +="<tr>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"30\">"+find_null(specification[i]);
      strVar +="<\/td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"30\">"+find_null(Actual_Finding[i]);
      strVar +="</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\" height=\"30\">"+find_null(Sample_Size[i]);
      strVar +="</td>";
	  strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\" height=\"30\">"+find_null(Qty_non_con[i]);
      strVar +="</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"30\">"+find_null(defect_type[i]);
      strVar +="</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"1\" height=\"30\">"+find_null(defect_code[i]);
      strVar +="</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"30\">"+find_null(disposition_cause_code[i]);
      strVar +="<\/td>";
    strVar +="<\/tr>";
	}
  
    
  strVar +="<\/table>";
  
  strVar +="<table style=\"width:100%;\" font-size=\"6\" >";
    strVar +="<tr>";
  strVar +="<td colspan=\"12\">";
      strVar +="</td>"
  strVar +="</tr>";
  strVar +="<tr>";
  strVar +="<td colspan=\"12\">";
      strVar +="</td>"
  strVar +="</tr>";
  strVar +="<tr>";
      strVar +="<td colspan=\"12\">Section C";
      strVar +="</td>";
      
    strVar +="</tr>";
    strVar +="</table>";
  
  strVar +="<table border=\"2\" style=\"width:100%;\">";
  // strVar +="<tr>";
  // strVar +="<td style=\"border-bottom:0.5px solid #000000;\" colspan=\"12\">&nbsp;&nbsp;&nbsp;<i>Value Stream</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+find_null(mrr_value_stream)+"</td>";
  //   strVar +="<\/tr>";
    strVar +="<tr>";
      
      strVar +="<td style=\"border-bottom:2px solid #000000;\" colspan=\"12\" height=\"33\"><i>MRR Notes</i><br/>"+find_null(mrr_notes)+"</td>";
    strVar +="<\/tr>";
    strVar +="<tr>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"33\"><i>Quarantine<br/>Actions</i></td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"33\"><i>Number of parts in quarantine?</i><br/>"+find_null(mrr_number_of_parts_quarantine)+"</td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"33\"><i>Where are they located?</i><br/>"+find_null(mrr_locations)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"4\" height=\"33\"></td>";
    strVar +="<\/tr>";
      strVar +="<tr>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"33\"><i>Potential<br/>Cause</i></td>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"3\" height=\"33\"><i>Which tool was involved?</i><br/>"+find_null(mrr_equipments)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"7\" height=\"33\"><i>What potentially failed in the process? Method? Machine? Materials? Measurements?</i><br/>"+find_null(mrr_potentially_failed)+"</td>";
      strVar +="<\/tr>";
    strVar +="<tr>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"33\"><i>Immediate<br/>Remediation</i></td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"10\" height=\"33\">"+find_null(mrr_immediate_remidiation)+"</td>";
      strVar +="<\/tr>";
    strVar +="<tr>";
      strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"33\"><i>Rework<br/>Instructions</i></td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"10\" height=\"33\">"+find_null(mrr_rework_instructions)+"</td>";
      strVar +="</tr>";
  //   strVar +="<tr>";
  //    strVar +="<td style=\"border-bottom:2px solid #000000;\" colspan=\"1\" height=\"23\"><i>Level 1</i>&nbsp;</td>";
  // strVar +="<td style=\"border-bottom:2px solid #000000;\" colspan=\"1\" height=\"23\"></td>";
  // strVar +="<td style=\"border-bottom:2px solid #000000;\" colspan=\"10\" height=\"23\">&nbsp;&nbsp;&nbsp;<i>Supervisor/Lead/PE - Not Used</i></td>";
  //   strVar +="<\/tr>";
    // strVar +="<tr>";
    // strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"7\" height=\"23\"><i>Reviewed By:   Quality/Cl - Not Used</i></td>";
    // strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"5\" height=\"23\"><i>Operations Mgmt - Not Used</i></td>";
    // strVar +="<\/tr>";
    strVar +="<tr>";
    strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i>PROCUREMENT</i></td>";
    strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_procurement)+"</td>";
    strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_procurement_date)+"</td>";
     strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i>Operations</i></td>";
  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_operations)+"</td>";
  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_operation_date)+"</td>";
      strVar +="<\/tr>";
    strVar +="<tr>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i>MRR CLOSED</i></td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_closed_by)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_close_date)+"</td>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i>Quality</i></td>";
  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_quality)+"</td>";
  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_quality_date)+"</td>";
      strVar +="<\/tr>";
    strVar +="<tr>";
      strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i>Process Eng.</i></td>";
  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_process_engg)+"</td>";
  strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"8\" height=\"23\">"+find_null(mrr_process_engg_date)+"</td>";
      strVar +="<\/tr>";
//     strVar +="<tr>";
      
// strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"12\" height=\"15\" align=\"center\" font-size=\"6\">PINK COPY TO REMAIN WITH NONCONFORMING MATERIALPENDING COMPLETION OF THE MRB. AFTER DISPOSITION SIGNED COPY TO REMAIN WITH PRODUCT</td>";
//       strVar +="<\/tr>";
  //   strVar +="<tr>";
  //     strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i>Date Closed</i></td>";
  // strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\">"+find_null(mrr_close_date)+"</td>";
  //     strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i></i></td>";
  // strVar +="<td style=\"border-right:1px solid #000000; border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"></td>";
  //     strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"><i></i></td>";
	//   if(quality_alert == 'T')
	//   {
  // strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"2\" height=\"23\"></td>";
	//   }
	//   else
	//   {
  // strVar +="<td style=\"border-bottom:1px solid #000000;\" colspan=\"1\" height=\"23\"></td>";  
	//   }
  //   strVar +="<\/tr>";
    
    strVar +="<\/table>";
  
	
	
  strVar +="<\/body>";
		strVar +="<\/pdf>";
		
		strVar = space(strVar);
        strVar = htmlizeAmps(strVar);
        strVar = trim(strVar);
        strVar=strVar.replace('&lt;','<');
        strVar=strVar.replace('&gt;','>');
  		//nlapiLogExecution('DEBUG','Amal-log','5.strVar='+strVar);
  		var file = nlapiXMLToPDF(strVar);
        response.setContentType('PDF', mrr_no+'.pdf', 'inline');
        response.write(file.getValue());
		
		
		function space(s) {
    var result = s.replace(/&nbsp;/g, " ");
    return result;
}

function htmlizeAmps(s) {
    var result = s.replace(/\x26/g, "&amp;");
    return result;
}

function trim(str) {
    return (str.replace(/^(\s|)+/g, "").replace(/(\s|)+$/g, ""));
}
function find_null(value) {
    if (value == null) {value = ''}
    return value;
}

}