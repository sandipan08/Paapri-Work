/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Oct 2019     Rakhi Rajak
 *
 */
/**************************************************************************************

Script Name: RESTlet
Developer: Rakhi Rajak
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
  var currentDate = sysDate(); // returns the date
    var currentTime = formatAMPM(new Date); // returns the time stamp in HH:MM:SS
    var currentDateAndTime = currentDate;
    nlapiLogExecution('DEBUG', 'User Event Script', currentDateAndTime);
  
  
  
var recId = request.getParameter('id');
nlapiLogExecution('DEBUG','Rakhi-log','recId='+recId);

var rec_load = nlapiLoadRecord('customrecord_pct_qms_8d_correction',recId);
 nlapiLogExecution('DEBUG','Rakhi-log','rec_load='+rec_load); 
var Type = rec_load.getFieldText('custrecord_pct_qms_8d_type');
var MRR_No = rec_load.getFieldText('custrecord_pct_qms_8d_mrr_no');
var RMA_No = rec_load.getFieldText('custrecord_pct_qms_8d_rma_no');
var Originator = rec_load.getFieldText('custrecord_pct_qms_8d_originator');
var Date_issued = rec_load.getFieldValue('custrecord_pct_qms_8d_date_issued');
var Item_No = rec_load.getFieldText('custrecord_pct_qms_8d_item_no');
var Customer = rec_load.getFieldText('custrecord_pct_qms_8d_customer');
var Dept_lead = rec_load.getFieldText('custrecord_pct_qms_8d_dept_lead');
var Value_stream = rec_load.getFieldValue('custrecord_pct_qms_8d_value_stream');
var Batch_No = rec_load.getFieldValue('custrecord_pct_qms_8d_batch_no');
var Qty = rec_load.getFieldValue('custrecord_pct_qms_8d_qty');
var Q_Alert = rec_load.getFieldText('custrecord_pct_qms_8d_quality_alert');
var Customer_NCR = rec_load.getFieldValue('custrecord_pct_qms_8d_customer_ncr');
var Response_due = rec_load.getFieldValue('custrecord_pct_qms_8d_res_due_by');
var Approved_by = rec_load.getFieldValue('custrecord_pct_qms_8d_approved_by');
var Approved_date = rec_load.getFieldValue('custrecord_pct_qms_8d_approved_date');
var Status = rec_load.getFieldValue('custrecord_pct_qms_8d_status');
var Link = rec_load.getFieldValue('custrecord_pct_qms_link_8d');
var Problem_owner = rec_load.getFieldText('custrecord_pct_qms_8d_problem_owner');

var Effected_problem = rec_load.getFieldValue('custrecord_pct_qms_8d_who_effected');
var Happening = rec_load.getFieldValue('custrecord_pct_qms_8d_what_happening');
var Problem = rec_load.getFieldValue('custrecord_pct_qms_8d_why_problem');
var Problem_occure = rec_load.getFieldValue('custrecord_pct_qms_8d_where_problm_occur');
var First_noticed = rec_load.getFieldValue('custrecord_pct_qms_8d_when_first_noticed');
var how_much = rec_load.getFieldValue('custrecord_pct_qms_8d_how_much_many');
var often_occur = rec_load.getFieldValue('custrecord_pct_qms_8d_how_often_occur');
var Problem_statement = rec_load.getFieldValue('custrecord_pct_qms_8d_problem_statement');

var Qty_wip= rec_load.getFieldValue('custrecord_pct_qms_8d_qty_wip');
var Qty_intransit = rec_load.getFieldValue('custrecord_pct_qms_8d_qty_in_transit');
var Qty_instock = rec_load.getFieldValue('custrecord_pct_qms_8d_qty_in_stock');
var Qty_osv = rec_load.getFieldValue('custrecord_pct_qms_8d_osv');
var Distributor_notification = rec_load.getFieldValue('custrecord_pct_qms_8d_distributor');
var Similar_parts = rec_load.getFieldValue('custrecord_pct_qms_8d_similar_part');
var Completed_by = rec_load.getFieldText('custrecord_pct_qms_8d_completed_by');
var Date_cont = rec_load.getFieldValue('custrecord_pct_qms_8d_date_cont');
var wi_prcd = rec_load.getFieldValue('custrecord_pct_qms_8d_wiprcd');
var Fmeas = rec_load.getFieldValue('custrecord_pct_qms_8d_fmeas');
var Supplier_docs = rec_load.getFieldValue('custrecord_pct_qms_8d_supplier_docs');
var Verified_by = rec_load.getFieldText('custrecord_pct_qms_8d_verified_by');
var Drawings = rec_load.getFieldValue('custrecord_pct_qms_8d_drawing');
var Ctrl_plan = rec_load.getFieldValue('custrecord_pct_qms_8d_ctrl_plan');
var software = rec_load.getFieldValue('custrecord_pct_qms_8d_software');
var PDS = rec_load.getFieldValue('custrecord_pct_qms_8d_pds');
var Gageing = rec_load.getFieldValue('custrecord_pct_qms_8d_gageing');
var Verified_date = rec_load.getFieldValue('custrecord_pct_qms_8d_verified_date');
var Less_lrnd = rec_load.getFieldValue('custrecord_pct_qms_8d_lesson_lrnd');
var line_count = rec_load.getLineItemCount('recmachcustrecord_pct_qms_link_team');
var line_count1 = rec_load.getLineItemCount('recmachcustrecord_pct_qms_parent_containment');
var line_count2 = rec_load.getLineItemCount('recmachcustrecord_pct_qms_root_identification');
var line_count3 = rec_load.getLineItemCount('recmachcustrecord_pct_qms_link_implementation');
var line_count4 = rec_load.getLineItemCount('recmachcustrecord_pct_qms_link_prevent_issue');
var line_count5 = rec_load.getLineItemCount('recmachcustrecord_pct_qms_lt_correct');
var car_no= rec_load.getFieldValue('name');
 var case_no=rec_load.getFieldValue('custrecord_pct_qms_8d_case_no');





var myvar = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
'<pdf>'+
'<head>'+
'    <macrolist>'+
'        <macro id="nlheader">'+
'            <table style="width: 100%; font-size: 10pt;">'+
'             <tr>'+
'            	<td  colspan="3" align="left" style="padding: 7px; margin-top: -50px;"><img src="http://8454393.shop.netsuite.com/core/media/media.nl?id=5622&c=8454393&h=-HXINcLwS-p622YGdZRW0O_dZ86ZOXmPoGa6rgyoDx95rC3_" width="150px" height="35px" /> </td>'+
'               <td  colspan="5" align="center" style="padding: 10px 0px 0px 0px; "><span style="font-size: 17pt;">Corrective Action Request</span></td>'+
'               <td colspan="4" align="left" style="padding: 10px 0px 0px 0px;"><span style="font-size: 13pt;">'+find_null(car_no)+'</span></td>'+
'	          </tr>'+
'	</table>'+
'        </macro>'+
'        <macro id="nlfooter">'+
'            <table style="width: 100%; font-size: 8pt;"><tr>'+
'              <td align="left"><i>'+currentDateAndTime+'</i></td>'+
'              <td align="right"></td>'+
'	<td align="right" style="padding: 0;"><pagenumber/> of <totalpages/></td>'+
'	</tr></table>'+
'        </macro>'+
'    </macrolist>'+
'    <style type="text/css">* {'+
'		}'+
'		table {'+
'			font-size: 8pt;'+
'			table-layout: fixed;'+
'			'+
'		}'+
'        th {'+
'            font-weight: bold;'+
'            font-size: 8pt;'+
'            vertical-align: middle;'+
'            padding: 5px 6px 3px;'+
'            background-color: #e3e3e3;'+
'            color: #333333;'+
'        }'+
'        td {'+
'            padding: 4px 6px;'+
'        }'+
'		td p { align:left }'+
'</style>'+
'</head>'+
'<body header="nlheader" header-height="4%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">'+
'    <table  style="width: 100%; border-top:2px; border-right:2px; border-left:2px; margin-top: 10px;">'+
'      <tr width="100%">'+
'        <td colspan="1" width="9%" style=" border-bottom:1px;">Type:</td>'+
'        <td colspan="1" width="10%" style="border-right:1px; align:left; border-bottom:1px;">'+find_null(Type)+'</td>'+
'        <td colspan="1" width="12%" style=" border-bottom:1px; " ><i>Date Issued:</i></td>'+
'        <td colspan="2"  width="12%"  style="border-right:1px; align:left; border-bottom:1px;">'+find_null(Date_issued) +'</td>'+
'        <td colspan="1"  width="12%" style=" border-bottom:1px;" ><i>MMR No.:</i></td>'+
'        <td colspan="1" width="12%" style="border-right:1px; align:left; border-bottom:1px;">'+find_null(MRR_No)+'</td>'+
'        '+
'        <td colspan="2"  width="12%"  style=" border-bottom:1px;"><i>Item No.:</i></td>'+
'        <td colspan="3"  width="17%" style="border-bottom:1px; align:left;" >'+find_null(Item_No)+'</td>'+
'      </tr>'+
'      <tr width="100%">'+
'        <td colspan="1"  style=" border-bottom:1px;"><i>Customer:</i></td>'+
'        <td colspan="4"   style="border-right:1px; align:left; border-bottom:1px;">'+find_null(Customer)+'</td>'+
'        <td colspan="1"  style=" border-bottom:1px;;"><i>RMA No.:</i></td>'+
'        <td colspan="1"  style="border-right:1px; align:left; border-bottom:1px;">'+find_null(RMA_No)+'</td>'+
'        <td colspan="1"   style=" border-bottom:1px;"><i>Qty.:</i></td>'+
'        <td colspan="1"   style="border-right:1px; align:left; border-bottom:1px;">'+find_null(Qty)+'</td>'+
'        <td colspan="2"   style="border-bottom:1px;"><i>Batch No.:</i></td>'+
'        <td colspan="1"   style=" border-bottom:1px;align:left;">'+find_null(Batch_No)+'</td>'+
'      </tr>'+
'      <tr >'+
'        <td colspan="1" width="56%" style=" border-bottom:1px;"><i>Originator:</i></td>'+
'        <td colspan="4" style="border-bottom:1px; align:left; border-right:1px;">'+find_null(Originator)+'</td>'+
'        <td colspan="1"  style=" border-bottom:1px;;"><i>Dept.Lead:</i></td>'+
'        <td colspan="3" style="border-bottom:1px; align:left; border-right:1px;">'+find_null(Dept_lead)+'</td>'+
'        <td colspan="2"  width="20%" style="border-bottom:1px;"><i>Case No.:</i></td>'+
'        <td colspan="1" style="border-bottom:1px; align:left; ">'+find_null(case_no)+'</td>'+
'      </tr>'+
'      <tr style=" border-bottom: 1px;">'+
'        <td colspan="2"><i>Response Due By:</i></td>'+
'         <td colspan="3" style="border-right:1px; align:left;">'+find_null(Response_due)+'</td>'+
'        <td colspan="1" ><i>Q Alert:</i></td>'+
'         <td colspan="6" style=" align:left;">'+find_null(Q_Alert)+'</td>'+
'      </tr>'+
'            <tr width="100%">'+
'              <td  colspan="4" style=" font-weight: bold; padding: 8px; font-size:12pt;">D1 Define the Team</td>'+
'              <td  colspan="2"  align="right" style="font-size:8pt; padding: 8px;">Problem Owner: </td>'+
'              <td  colspan="6" align="left" style="font-size:8pt; padding: 8px;">'+find_null(Problem_owner )+' </td>'+
'            </tr>'+
'            <tr   width="100%">'+
'              <td colspan="2" style="font-size:8pt; padding:7px;background-color: #ABCDDF;" >Name</td>'+
'              <td colspan="3" style="font-size:8pt; padding:7px;background-color: #ABCDDF;">Team Role</td>'+
'              <td colspan="2" style="font-size:8pt; padding:7px; background-color: #ABCDDF;">Date </td>'+
'              <td colspan="5" > &nbsp;</td>'+
'            </tr>';
for(var j=1;j<=line_count;j++)
{
	if(j%2 == 0)
	{
myvar +='<tr   width="100%">'+
'              <td colspan="2" style="font-size:8pt; padding:7px; background-color: #f2f2f2" >'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_link_team','custrecord_pct_qms_8d_d1_name',j))+'</td>'+
'              <td colspan="3" style="font-size:8pt; padding:7px; background-color: #f2f2f2">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_team','custrecord_pct_qms_8d_d1_team_role',j))+' </td>'+
'              <td colspan="2" style="font-size:8pt; padding:7px; background-color: #f2f2f2">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_team','custrecord_pct_qms_8d_d1_date_assigned',j))+'</td>'+
'              <td colspan="5">&nbsp;</td>'+
'            </tr>';
	}
	else{
		myvar +='<tr   width="100%">'+
'              <td colspan="2" style="font-size:8pt; padding:7px; " >'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_link_team','custrecord_pct_qms_8d_d1_name',j))+'</td>'+
'              <td colspan="3" style="font-size:8pt; padding:7px; ">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_team','custrecord_pct_qms_8d_d1_team_role',j))+' </td>'+
'              <td colspan="2" style="font-size:8pt; padding:7px; ">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_team','custrecord_pct_qms_8d_d1_date_assigned',j))+'</td>'+
'              <td colspan="5">&nbsp;</td>'+
'            </tr>';
	}
}
myvar +='<tr width="100%">'+
'        <td colspan="3"  style=" border-top: 2px;border-bottom:1px; border-top: 2px; font-weight: bold;font-size:11pt;">D2 Describe the Problem</td>'+
'        <td colspan="9"  style=" border-bottom:1px; border-top: 2px "><i>Who is effected?What is the problem?How  When was the problem discovered?  When does the problem occur? Where is the problem occuring? How many parts,People,machines,documents,etc.Have This?</i></td>'+
'      </tr>'+
'      <tr width="100%" >'+
'        <td colspan="12"  >'+find_null(Problem_statement)+'</td>'+
'      </tr>'+
'  </table>'+
'  <table>'+
'  </table>'+
'  <table width="100%" >'+
'    <tr width="100%">'+
'      <td colspan="12" style="font-size:12pt; font-weight:bold; border-top:2px; border-left:2px; border-right:2px; ">D3 Develop Containment And Correction</td>'+
'    </tr>'+
'    <tr style="background-color: #ABCDDF;">'+
'      <td colspan="4" style="font-weight:bold;border-left:2px;"><i>Containment Action</i></td>'+
'      <td colspan="2" align="left" style="font-weight:bold; "><i>Responsible</i></td>'+
'      <td colspan="2"  align="right" style="font-weight:bold;"><i>Due Date</i></td>'+
'      <td colspan="2"  align="right" style="font-weight:bold;"><i>Comp. Date</i></td>'+
'      <td colspan="2" align="left" style="font-weight:bold; border-right:2px;" ><i>Comments</i></td>'+
'    </tr>';
for(var i=1;i<=line_count1;i++)
{
	if(i%2 == 0)
	{
myvar +='<tr style="background-color: #f2f2f2;">'+
'      <td colspan="4" style="border-left:2px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_contain_action',i))+'</td>'+
'      <td colspan="2"  align="left">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_responsible',i))+'</td>'+
'      <td colspan="2" align="right" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_due_date',i))+'</td>'+
'      <td colspan="2" align="right" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_complete_date',i))+'</td>'+
'      <td colspan="2"  align="left" style="border-right:2px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_comments_cont',i))+'</td>'+
'    </tr>';
	}
	else{
		myvar +='<tr >'+
'  <td colspan="4" style="border-left:2px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_contain_action',i))+'</td>'+
'      <td colspan="2"  align="left">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_responsible',i))+'</td>'+
'      <td colspan="2" align="right" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_due_date',i))+'</td>'+
'      <td colspan="2" align="right" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_complete_date',i))+'</td>'+
'      <td colspan="2"  align="left" style="border-right:2px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_parent_containment','custrecord_pct_qms_8d_d3_comments_cont',i))+'</td>'+
'    </tr>';
	}
		
}
myvar += '<tr>'+
'      <td colspan="3" style="border-top:1px solid black;border-left:2px solid black; border-bottom:2px solid black; "><i>Qty WIP: '+find_null(Qty_wip)+'</i></td>'+
'      <td colspan="3" style="border-top:1px solid black; border-right:1px solid black; border-bottom:2px solid black;"><i>Qty in Transit: '+ find_null(Qty_intransit)+'</i></td>'+
'      <td colspan="6" style="border-top:1px solid black;  border-right:2px solid black; border-top:1px solid black; border-bottom:2px solid black;"><i>Distributor Notification: '+find_null(Distributor_notification)+'</i></td>'+
'    </tr>'+
'    <tr>'+
'      <td colspan="3"  style="border-bottom:1px solid black;"><i>Qty Stock:  '+find_null(Qty_instock)+'</i></td>'+
'      <td colspan="3"   style="border-bottom:1px solid black; border-right:1px solid black;"><i>Qty at OSV: '+find_null(Qty_osv)+'</i></td>'+
'      <td colspan="6"   style="border-bottom:1px solid black;"><i>Similar Parts: '+ find_null(Similar_parts) +'</i></td>'+
'    </tr>'+
'     <tr>'+
'      <td colspan="5" ><i>Containment By: '+find_null(Completed_by)+'</i></td>'+
'      <td colspan="7"><i>Date Completed: '+find_null(Date_cont)+'</i></td>'+
'      '+
'    </tr>'+
'    '+
'  </table>'+
'  <table width="100%" border="2px">'+
'    <tr>'+
'    <td colspan="12" align="left" font-size="12pt"><b>D4 Identify & Validate Root Causes</b></td></tr>'+
'    <tr style="background-color: #ABCDDF;">'+
'      <td colspan="4" style="font-weight:bold;"><i>Event Root Cause</i></td>'+
'      <td colspan="3"   align="center" style="font-weight:bold;"><i>Detect Root Cause</i></td>'+
'      <td colspan="3"  align="right" style="font-weight:bold;"><i>Validated By</i></td>'+
'      <td colspan="2"  align="right" style="font-weight:bold;"><i>Date</i></td>'+
'    </tr>';
for(var i=1;i<=line_count2;i++)
{
	if(i%2 == 0)
	{
myvar +='    <tr style="background-color: #f2f2f2;">'+
'      <td colspan="4">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_event_root',i))+'</td>'+
'      <td colspan="3"  align="center">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_detect_root',i))+'</td>'+
'      <td colspan="3" align="right" >'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_root_cause_by',i))+'</td>'+
'      <td colspan="2" align="right" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_date',i))+'</td>'+
'    </tr>';
	}
	else{
		myvar +='    <tr>'+
'      <td colspan="4">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_event_root',i))+'</td>'+
'      <td colspan="3"  align="center">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_detect_root',i))+'</td>'+
'      <td colspan="3" align="right" >'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_root_cause_by',i))+'</td>'+
'      <td colspan="2" align="right" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_root_identification','custrecord_pct_qms_8d_d4_date',i))+'</td>'+
'    </tr>';
	}
}
myvar +='  </table>'+
'  '+
' <table width="100%" border="1" >'+
'    <tr width="100%">'+
'      <td colspan="12" style="font-size:12pt; font-weight:bold;">D5 Define & verify Corrective Actions </td>'+
'    </tr>'+
'    <tr style="background-color: #ABCDDF;">'+
'      <td colspan="4" style="font-weight:bold;"><i>Corrective Actions</i></td>'+
'      <td colspan="2" style="font-weight:bold;"><i>Responsible</i></td>'+
'      <td colspan="2" style="font-weight:bold;"><i>Plan Date</i></td>'+
'      <td colspan="2"  style="font-weight:bold;"><i>Comp. Date</i></td>'+
'      <td colspan="2" style="font-weight:bold;" ><i>Comments</i></td>'+
'    </tr>';
for(var i=1;i<=line_count5;i++)
{ 
if(i%2 == 0)
	{
myvar +=' <tr style="background-color: #f2f2f2;">'+
'      <td colspan="4">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_corrective',i))+'</td>'+
'      <td colspan="2">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5__responsible',i))+'</td>'+
'      <td colspan="2">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_plan_date',i))+'</td>'+
'      <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_complete',i))+'</td>'+
'      <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_comments',i))+'</td>'+
'    </tr>';
	}
	else{
		myvar +=' <tr>'+
'      <td colspan="4">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_corrective',i))+'</td>'+
'      <td colspan="2">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_responsible',i))+'</td>'+
'      <td colspan="2">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_plan_date',i))+'</td>'+
'      <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_complete',i))+'</td>'+
'      <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_lt_correct','custrecord_pct_qms_8d_d5_comments',i))+'</td>'+
'    </tr>';
	}
		
}
myvar +='</table>'+
'   <table border="2px" width="100%" >'+
'            <tr width="100%">'+
'              <td  colspan="12"  style=" font-weight: bold; padding: 8px; font-size:12pt;">D6 Implement Corrective Actions & Ensure Effectiveness</td>'+
'              '+
'            </tr>'+
'            <tr  width="100%" style="background-color: #ABCDDF;" margin-top="5px">'+
'              <td colspan="2" style="font-size:8pt; padding:7px;" ><b><i>Implement Plan</i></b></td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;"><b><i>Responsible</i></b></td>'+
'              <td colspan="2" align="right" style="font-size:8pt; padding:7px;"><b><i>Due Date</i></b></td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;"><b><i>Closed Date</i></b></td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;"><b><i>Status</i></b></td>'+
'              <td colspan="2"  align="left" style="font-size:8pt; padding:7px;"><b><i>Comments</i></b></td>'+
'              '+
'             '+
'            </tr>';
for(var i=1;i<=line_count3;i++)
{ 
if(i%2 == 0)
	{

myvar +=' <tr width="100%" margin-top="5px" style="background-color: #f2f2f2;">'+
'              <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_implementation',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_responsible_impl',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_due_date_impl',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_closed_date',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_status_impl',i))+'</td>'+
'              <td colspan="2"  align="left" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_comments_impl',i))+'</td>'+
'            </tr>';
	}
	else{
		myvar +=' <tr>'+
'              <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_implementation',i))+'</td>'+
'              <td colspan="2" align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_responsible_impl',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_due_date_impl',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_closed_date',i))+'</td>'+
'              <td colspan="2"  align="right" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_status_impl',i))+'</td>'+
'              <td colspan="2"  align="left" style="font-size:8pt; padding:7px;">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_implementation','custrecord_pct_qms_8d_d6_comments_impl',i))+'</td>'+
'            </tr>';
	}
		
}
myvar +='<tr width="100%">'+
'     	<td align="left" colspan="12" style="border-top:1px solid black;" ><b>Changes Required to:</b></td>'+
'     </tr>'+
'     <tr  width="100%" margin-top="5px">'+
'       <td colspan="2" align="right">WI/Prcd:</td>'+
'       <td colspan="2" border="1px">'+find_null(wi_prcd)+'</td>'+
'       <td colspan="2" align="right">Drawings:</td>'+
'       <td colspan="2" border="1px">'+find_null(Drawings)+'</td>'+
'       <td colspan="2" align="right">PDS:</td>'+
'       <td colspan="2" border="1px" margin-right="3px">'+find_null(PDS)+'</td>'+
'     </tr>'+
'     <tr  width="100%" margin-top="5px">'+
'       <td colspan="2" align="right">FMEAs:</td>'+
'       <td colspan="2" border="1px">'+find_null(Fmeas)+'</td>'+
'       <td colspan="2" align="right"> Supplier Docs:</td>'+
'       <td colspan="2" border="1px">'+find_null(Supplier_docs)+'</td>'+
'       <td colspan="2" align="right">Gageing:</td>'+
'       <td colspan="2" border="1px" margin-right="3px">'+find_null(Gageing)+'</td>'+
'     </tr>'+
'     <tr  width="100%" style="border-bottom:1px solid black;" margin-top="5px" >'+
'       <td colspan="2"  align="right">Control Plan:</td>'+
'       <td colspan="2" border="1" margin-bottom="5px">'+find_null(Ctrl_plan)+'</td>'+
'       <td colspan="2" align="right">Software:</td>'+
'       <td colspan="2" border="1px" margin-bottom="5px">'+find_null(software)+'</td>'+
'       '+
'     </tr>'+
'     <tr margin-bottom="10px" width="100%" margin-top="5px">'+
'       <td colspan="2"  align="right">Verified By:</td>'+
'       <td colspan="2" border="1px" >'+find_null(Verified_by)+'</td>'+
'       <td colspan="2"  align="right">Verified Date:</td>'+
'       <td colspan="2" border="1px" style="border-top: 1px solid black;">'+find_null(Verified_date)+'</td>'+
'     </tr>'+
''+
'    </table>'+
'   <table width="100%" border="1">'+
'    <tr width="100%">'+
'      <td colspan="12" style="font-size:12pt; font-weight:bold;">D7 Prevent Issue from Occuring</td>'+
'    </tr>'+
'    <tr style="background-color: #ABCDDF;">'+
'      <td colspan="4" style="font-weight:bold;"><i>Prevent Action</i></td>'+
'      <td colspan="2" style="font-weight:bold;"><i>Responsible</i></td>'+
'      <td colspan="2" style="font-weight:bold;"><i>Due Date</i></td>'+
'      <td colspan="2"  style="font-weight:bold;"><i>Comp.Date</i></td>'+
'      <td colspan="2" style="font-weight:bold;" ><i>Status</i></td>'+
'    </tr>';
for(var i=1;i<=line_count4;i++)
{ 
myvar +=' <tr style="background-color: #f2f2f2;">'+
'      <td colspan="4">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_prevent_issue','custrecord_pct_qms_8d_d7_prevent_action',i))+'</td>'+
'      <td colspan="2">'+find_null(rec_load.getLineItemText('recmachcustrecord_pct_qms_link_prevent_issue','custrecord_pct_qms_8d_d7_respnsbl_prvnt',i))+'</td>'+
'      <td colspan="2">'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_prevent_issue','custrecord_pct_qms_8d_d7_due_date_prvnt',i))+'</td>'+
'      <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_prevent_issue','custrecord_pct_qms_8d_d7_cmplt_date',i))+'</td>'+
'      <td colspan="2" >'+find_null(rec_load.getLineItemValue('recmachcustrecord_pct_qms_link_prevent_issue','custrecord_pct_qms_8d_d7_status',i))+'</td>'+
'    </tr>';
}
myvar +='<tr>'+
'       <td align="left" colspan="12" font-size="12pt" style="border-top: 2px sloid black; font-weight: bold;">D8 Lessons Learned</td>'+
'     </tr>'+
'     <tr>'+
'       <td colspan="12">'+find_null(Less_lrnd)+'</td>'+
'     </tr>'+
'  </table>'+
'  <table width="100%">'+
'      <tr width="100%">'+
'        <td colspan="2">Approved By:</td>'+
'        <td colspan="2" align="left">'+find_null(Approved_by)+'</td>'+
'        <td colspan="2">Approved Date:</td>'+
'        <td colspan="6" align="left">'+find_null(Approved_date)+'</td>'+
'      </tr>'+
'  </table>'+
''+
''+
''+
'</body>'+
'</pdf>';
	



myvar = space(myvar);
myvar = htmlizeAmps(myvar);
        myvar = trim(myvar);
        myvar=myvar.replace('&lt;','<');
        myvar=myvar.replace('&gt;','>');
  		//nlapiLogExecution('DEBUG','Amal-log','5.myVar='+myVar);
  		var file = nlapiXMLToPDF(myvar);
        response.setContentType('PDF', 'ZVSFDVA.pdf', 'inline');
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
  
  function sysDate() {
	  var Day = myFunction();
    nlapiLogExecution('DEBUG', 'User Event Script', "Day="+Day);
    var date = new Date();
    date.setHours(date.getHours() + 16);
    var tdate = date.getDate();
    var mm = date.getMonth() + 1; // jan = 0
    var month;
    if (mm == 1)
        month = 'January';
    else if (mm == 2)
        month = 'February';
    else if (mm == 3)
        month = 'March';
    else if (mm == 4)
        month = 'April';
    else if (mm == 5)
        month = 'May';
    else if (mm == 6)
        month = 'June';
    else if (mm == 7)
        month = 'July';
    else if (mm == 8)
        month = 'August';
    else if (mm == 9)
        month = 'September';
    else if (mm == 10)
        month = 'October';
    else if (mm == 11)
        month = 'November ';
    else if (mm == 12)
        month = 'December';

    var year = date.getFullYear();
    return currentDate = Day +','+month+ ' ' + tdate + ',' + year;
}

 function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
  function myFunction() {
  var d = new Date();
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  var n = weekday[d.getDay()];
  return n;  
  }

}


	
