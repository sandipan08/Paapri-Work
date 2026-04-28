/****************************+**********************************************************
Script Name: Workflow Action Script 
Developer: Kunal Das
Development Head: Mr. Satish Jha
Company Name: Paapri Business Technologies (India) Pvt Ltd
Purpose: Get Bar Code Serial number and create inventory transfer.

© Copyright All Right

****************************************************************************************/
function CreateTool(ToolNumber, SerialID, ItemId, transactionID,BinNumber,nominalId,idUpperLimit,idLowerLimit,nominalOd,odUpperLimit,odLowerLimit)
{

	var rec,tool_id;
	
	var customrecord_pct_toolSearch = nlapiSearchRecord("customrecord_pct_tool",null,
	[
	   ["name","is",ToolNumber]
	], 
	[
	   new nlobjSearchColumn("name").setSort(false), 
	   new nlobjSearchColumn("scriptid"), 
	   new nlobjSearchColumn("custrecord_pct_tool_item_no"), 
	   new nlobjSearchColumn("custrecord_tool_srl_no"), 
	   new nlobjSearchColumn("custrecord_tool_life"), 
	   new nlobjSearchColumn("custrecord_pct_created_from"), 
	   new nlobjSearchColumn("custrecord_pct_tool_status"), 
	   new nlobjSearchColumn("custrecord_pct_latest_transaction"), 
	   new nlobjSearchColumn("custrecord_pct_tool_nominal_od"), 
	   new nlobjSearchColumn("custrecord_pct_tool_id_upper_limit"), 
	   new nlobjSearchColumn("custrecord_pct_tool_id_lower_limit"), 
	   new nlobjSearchColumn("custrecord_pct_mott_tool_description"), 
	   new nlobjSearchColumn("custrecord_pct_mott_tool_location"), 
	   new nlobjSearchColumn("custrecord_pct_tool_nominal_id"), 
	   new nlobjSearchColumn("custrecord_pct_tool_od_upper_limit"), 
	   new nlobjSearchColumn("custrecord_pct_tool_od_lower_limit")
	]
	);

	if(customrecord_pct_toolSearch != null)
	{
		tool_id = customrecord_pct_toolSearch[0].getId();
      nlapiLogExecution('DEBUG','PCT-Log',tool_id);
	}

	if(tool_id != null)
	{
		rec = nlapiLoadRecord('customrecord_pct_tool',tool_id);
		rec.setFieldValue('isinactive','F');
  		rec.setFieldValue('custrecord_pct_tool_status',1);
	}
	else
	{
		rec = nlapiCreateRecord('customrecord_pct_tool');	
	}

	rec.setFieldValue('name', ToolNumber);	
	rec.setFieldValue('custrecord_pct_tool_item_no', ItemId); 
	rec.setFieldValue('custrecord_tool_srl_no', SerialID); 
	rec.setFieldValue('custrecord_pct_created_from',transactionID);
  	rec.setFieldValue('custrecord_pct_mott_tool_location',BinNumber);

  
  //Setting ID/OD Measurements
  if(nominalId != null || nominalId != '')
    {
      	rec.setFieldValue('custrecord_pct_tool_nominal_id',nominalId);
    }
  
  if(idUpperLimit != null || idUpperLimit != '')
    {
      	rec.setFieldValue('custrecord_pct_tool_id_upper_limit',idUpperLimit);
    }
  
  if(idLowerLimit != null || idLowerLimit != '')
    {
      	rec.setFieldValue('custrecord_pct_tool_id_lower_limit',idLowerLimit);
    }
  
  if(nominalOd != null || nominalOd != '')
    {
      	rec.setFieldValue('custrecord_pct_tool_nominal_od',nominalOd);
    }
  
  if(odUpperLimit != null || odUpperLimit != '')
    {
	    rec.setFieldValue('custrecord_pct_tool_od_upper_limit',odUpperLimit);
    }
  if(odLowerLimit != null || odLowerLimit != '')
    {
  		rec.setFieldValue('custrecord_pct_tool_od_lower_limit',odLowerLimit);
    }
	
	var id=nlapiSubmitRecord(rec,true);
	
	//create a tool transaction record
	var tt_rec = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
	tt_rec.setFieldValue( 'custrecord_pct_trans_typ', 4);	//acquisition
	tt_rec.setFieldValue( 'custrecord_trans_tool_item', ItemId); 
	tt_rec.setFieldValue( 'custrecord_pct_trans_tool', id); 
	var submit_tt = nlapiSubmitRecord(tt_rec,true);
	nlapiLogExecution('DEBUG', 'PCT-Log', 'submit_tt: '+submit_tt);
	
	var load_tool_record = nlapiLoadRecord('customrecord_pct_tool', id);
	var set_latest_transaction = load_tool_record.setFieldValue('custrecord_pct_latest_transaction',submit_tt);
	//nlapiLogExecution('DEBUG', 'PCT-Log', 'set_latest_transaction: '+submit_tt);
	nlapiSubmitRecord(load_tool_record);
	
	return id ;
	
	
}

function CreateToolsIRorIA()
{
  	
	var id = nlapiGetRecordId(); // get internal id of IR or IA
  nlapiLogExecution('DEBUG','PCT-Log','id: '+id);
	var record_type = nlapiGetRecordType(id);
	var record = nlapiLoadRecord(record_type, id);
 
	for ( var j = 1; j <= record.getLineItemCount('item'); j++)
	{
		var item = record.getLineItemValue('item', 'item', j);
		try
		{
			var itemrec = nlapiLoadRecord('serializedassemblyitem', item);
		}
		catch(err)
		{
			//not a serialized assembly
			continue;
		}
		if(itemrec!=null && itemrec!="")
		{
			if(itemrec.getFieldValue('custitem_is_tool')!='T')
				continue;
		}
		else continue;
      	
      var nominal_id = itemrec.getFieldValue('custitem_pct_mott_asmbl_nominal_id');
      	var id_lower_limit = itemrec.getFieldValue('custitem_pct_mott_id_lower_limit');
      	var id_upper_limit = itemrec.getFieldValue('custitem_pct_mott_asmbl_id_upr_limit');
      	var nominal_od = itemrec.getFieldValue('custitem_pct_mott_asmbl_nominal_od');
      	var od_lower_limit = itemrec.getFieldValue('custitem_pct_mott_od_lower_limit');
      	var od_upper_limit = itemrec.getFieldValue('custitem_pct_mott_asmbl_od_upr_limit');
      
      	nlapiLogExecution('DEBUG','PCT-Log','Nominal ID: '+nominal_id+'ID Upper Limit: '+id_upper_limit+'ID Lower Limit: '+id_lower_limit+'Nominal OD: '+nominal_od+'OD Lower Limit: '+nominal_od+'OD Lower Limit: '+od_lower_limit);
      
		var location = record.getLineItemValue('item', 'location', j);
		var subrecord = record.viewLineItemSubrecord('item', 'inventorydetail', j);
 
		for ( var k = 1; k <= subrecord.getLineItemCount('inventoryassignment'); k++) {
			subrecord.selectLineItem('inventoryassignment', k);
			var strSerial = subrecord.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
          	var binnumber = subrecord.getCurrentLineItemValue('inventoryassignment','binnumber');
          	nlapiLogExecution('DEBUG','PCT-Log','Bin Number: '+binnumber);
			//search for the exact serial number record Id
			var filters = new Array();
			filters[0] = new nlobjSearchFilter( 'item', null, 'is', item);
			filters[1] = new nlobjSearchFilter('location', null, 'is', location);
	        filters[2] = new nlobjSearchFilter( 'inventorynumber', null, 'is', strSerial);

			//build the search using search params for return columns
			var arrSearchColumns = new Array();
			arrSearchColumns[0] = new nlobjSearchColumn('internalid'); 
			arrSearchColumns[1] = new nlobjSearchColumn('inventorynumber'); 

			var searchresults = nlapiSearchRecord( 'inventorynumber', null, filters, arrSearchColumns );
			if (searchresults != null)

			for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
				{
				   var serialNumberRec = searchresults[i];
	               var internalId = serialNumberRec.getValue('internalid');
				   ret=CreateTool(strSerial,internalId,item,id,binnumber,nominal_id,id_upper_limit,id_lower_limit,nominal_od,od_upper_limit,od_lower_limit)
				}
		}
	}

}

function CheckOutTool()
{
	var l_workorder=nlapiGetFieldValue('custrecord_pct_wo_checked_out_to');
	nlapiLogExecution('DEBUG', 'PCT-Log', 'l_workorder = '+l_workorder);
	//var l_Tool_routing=nlapiGetFieldText('custrecord_pct_trans_tool_rtg');//split and get the number
	if(l_workorder == null || l_workorder == '')
	{
		throw ('Please select a work order for check out operation.');
	}
	
	var l_Tool=nlapiGetFieldValue('custrecord_pct_trans_tool');//Tool Number
	//var ArrRouting=l_Tool_routing.split('-')
	var l_IsProcessed=nlapiGetFieldValue('custrecord_pct_is_processed');
	if(l_IsProcessed=='T')return;
	var id = nlapiGetRecordId(); // get internal id of inventory transfer record
	var record_type = nlapiGetRecordType(id);
	var rec = nlapiLoadRecord(record_type, id);
	var isCheckedOut=false
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'workorder', null, 'anyOf', l_workorder); //workorder
	//filters[1] = new nlobjSearchFilter( 'sequence', null, 'equalTo', ArrRouting[1]	); //workorder //temp hardcodeded to 10
	var column = new Array();
	column[0] = new nlobjSearchColumn('internalid'); // Search Result Field Internal ID
	//column[1] = new nlobjSearchColumn("item"); // Subsidiary of the item
	// Create the saved search
	var search = nlapiSearchRecord('manufacturingoperationtask',null,filters,column); // Search item id
	if(search!=null)
	{
		var intID=search[0].getValue('internalid');
		rec.setFieldValue( 'custrecord_pct_check_ed_op', intID); 
		 isCheckedOut=true;
	}
	//No tasks  - non-wip work order. Assign to the work order itself
    
	isCheckedOut=true;
	rec.setFieldValue( 'custrecord_pct_is_processed', 'T');
	nlapiSubmitRecord(rec,true);
	//make tool checked out
    if(isCheckedOut)
	{
		var toolrec = nlapiLoadRecord('customrecord_pct_tool', l_Tool);
		toolrec.setFieldValue( 'custrecord_pct_tool_status', 2);
		toolrec.setFieldValue('custrecord_pct_latest_transaction',id)
		nlapiSubmitRecord(toolrec,true);
	}
	

	return;
}