function repair_tool(type)
{
	if(type == 'create')
	{
		
		var tool = nlapiGetFieldValue('custrecord_pct_mott_repair_serializedtoo');
		var tool_name = nlapiGetFieldText('custrecord_pct_mott_repair_serializedtoo');

		var tool_item = nlapiGetFieldValue('custrecord_pct_mott_repair_tool_item');
      
        var account_id = nlapiGetFieldValue('custrecord_pct_mott_repair_adj_acc');

		nlapiLogExecution('DEBUG','PCT-Log','Serialized Tool:'+tool+'  Serialized Tool Name:'+tool_name+'  Tool Item'+tool_item);

		var inventorynumberSearch1 = nlapiSearchRecord("inventorynumber",null,
		[
		   ["inventorynumber","is",tool_name]
		], 
		[
		   new nlobjSearchColumn("inventorynumber").setSort(false), 
		   new nlobjSearchColumn("item")
		   
		]
		);

		if(inventorynumberSearch1 != null)
		{
			var serial_number_id = inventorynumberSearch1[0].getId();
		}

		var inventorydetailSearch = nlapiSearchRecord("inventorydetail",null,
		[
		   ["inventorynumber","anyof",serial_number_id],
		   "AND", 
   		   ["item","anyof",tool_item]
		], 
		[
		   new nlobjSearchColumn("inventorynumber").setSort(false), 
		   new nlobjSearchColumn("binnumber"), 
		   new nlobjSearchColumn("location"), 
		   new nlobjSearchColumn("quantity"), 
		   new nlobjSearchColumn("itemcount"), 
		   new nlobjSearchColumn("expirationdate")
		]
		);

		if(inventorydetailSearch != null)
		{
			var tool_location = inventorydetailSearch[0].getValue('location');
			var tool_bin = inventorydetailSearch[0].getValue('binnumber');
			nlapiLogExecution('DEBUG','PCT-Log','BIN:'+tool_bin+'  Location:'+tool_location);
		}	

		var invntry_adjsmnt = nlapiCreateRecord('inventoryadjustment');
		invntry_adjsmnt.setFieldValue('account',account_id);
		invntry_adjsmnt.setFieldValue('memo','Created for Tool Repair of Tool:'+tool_name);
		invntry_adjsmnt.setFieldValue('subsidiary',3);//mott subsidiary int id 1
		invntry_adjsmnt.setFieldValue('adjlocation',tool_location);
		//invntry_adjsmnt.setFieldValue('custbody_mott_inv_adj_reason',18);

		invntry_adjsmnt.selectNewLineItem('inventory');
		invntry_adjsmnt.setCurrentLineItemValue('inventory','item',tool_item);
		invntry_adjsmnt.setCurrentLineItemValue('inventory','location',tool_location);
		invntry_adjsmnt.setCurrentLineItemValue('inventory','adjustqtyby',-1);


		var invadj_subrecord = invntry_adjsmnt.createCurrentLineItemSubrecord('inventory','inventorydetail');

		invadj_subrecord.selectNewLineItem('inventoryassignment');
		//receiptInventoryNumber
		//invadj_subrecord.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',tool_name);
		invadj_subrecord.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',tool_name);
		//invadj_subrecord.setCurrentLineItemValue('inventoryassignment','binnumber',tool_bin);
		//invadj_subrecord.setCurrentLineItemValue('inventoryassignment','quantity',-1);
		invadj_subrecord.commitLineItem('inventoryassignment');
		
		invadj_subrecord.commit();
		invntry_adjsmnt.commitLineItem('inventory');


		var invadj_id = nlapiSubmitRecord(invntry_adjsmnt);
      	nlapiSetFieldValue('custrecord_pct_mott_repair_linked_invadj',invadj_id);

		nlapiSubmitField('customrecord_pct_tool',tool,'custrecord_pct_tool_status',3);
		//nlapiSubmitField('customrecord_pct_tool',tool,'name',tool_name+'-Old');
		nlapiSubmitField('customrecord_pct_tool',tool,'isinactive','T');
	}
}