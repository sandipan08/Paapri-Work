function After_Record_submit(type) {
	if (type == 'edit' || type == 'create') {
		var rec_type = nlapiGetRecordType();
		var rec_id = nlapiGetRecordId();
		var Load_workorder_issue = nlapiLoadRecord(rec_type, rec_id);
		var Workorder_id = Load_workorder_issue.getFieldValue('createdfrom');
		var Load_workorder = nlapiLoadRecord('workorder', Workorder_id);
		var line_count = Load_workorder.getLineItemCount('item');
		var Item = new Array();
		var t =1;
		for (i = 1; i <= line_count; i++) {
			IsTool = Load_workorder.getLineItemValue('item', 'custcol_pct_istool_wo', i);
			if (IsTool == 'T') {
				Item[t] = Load_workorder.getLineItemValue('item', 'item', i);
				nlapiLogExecution('DEBUG', 'Moumita-Log', 'item:' + Item[t]);
				t++;
			}
		}
		var component_count = Load_workorder_issue.getLineItemCount('component');
		nlapiLogExecution('DEBUG','Moumita-Log','component_count:'+component_count);
      var location = Load_workorder_issue.getFieldValue('location');
for (j = 1; j <= component_count; j++) {
	var item_issue = Load_workorder_issue.getLineItemValue('component', 'item', j);
	nlapiLogExecution('DEBUG','Moumita-Log','item_issue:'+item_issue);
	for (k = 1; k <= t; k++) {
      if(Item[k] != null)
        {
		nlapiLogExecution('DEBUG','Moumita-Log','item_WO:'+Item[k]);
          }
		if (item_issue == Item[k])
				{
		    nlapiLogExecution('DEBUG','Moumita-Log','item-issue:'+item_issue);
			Load_workorder_issue.selectLineItem('component', j);
               var quantity_issue = Load_workorder_issue.getLineItemValue('component','quantity',j);
                  if(quantity_issue!=0)
                    {
			var subrecord = Load_workorder_issue.viewCurrentLineItemSubrecord('component', 'componentinventorydetail');
			var count_inventoryadjustment = subrecord.getLineItemCount('inventoryassignment');
			nlapiLogExecution('DEBUG','Moumita-Log','count:'+count_inventoryadjustment);
                  for(l=1;l<=count_inventoryadjustment;l++)
                    {
				var serial_no = subrecord.getLineItemText('inventoryassignment', 'issueinventorynumber', l);
				nlapiLogExecution('DEBUG','Moumita-Log','serialno:'+serial_no);
				var searchresults = nlapiSearchRecord('customrecord_pct_tool',null,[['name','is',serial_no],'AND',['custrecord_pct_tool_status','anyof','1'],'AND',['custrecord_pct_tool_item_no','anyof',item_issue]],[new nlobjSearchColumn('name').setSort('false'),new nlobjSearchColumn('custrecord_pct_tool_status'),new nlobjSearchColumn('internalid')])
			if (searchresults != null)
 
			for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
				{
                  if(i == 0)
                    {
				   var serialNumberRec = searchresults[i];
				   var internalid = serialNumberRec.getValue('internalid');
				   nlapiLogExecution('DEBUG','Moumita-Log','id:'+internalid);
                      var tool_transaction =                      nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
                      tool_transaction.setFieldValue('custrecord_pct_trans_typ',1);
                      tool_transaction.setFieldValue('custrecord_pct_trans_tool',internalid);
                      tool_transaction.setFieldValue('custrecord_trans_tool_item',item_issue);
                      tool_transaction.setFieldValue('custrecord_pct_wo_checked_out_to',Workorder_id);
                      tool_transaction.setFieldValue('custrecord_pct_is_processed','T');
                      var transaction_id = nlapiSubmitRecord(tool_transaction);
                      nlapiLogExecution('DEBUG','Moumita-Log','transaction_id:'+transaction_id);
                      
                                        var Load_Tool = nlapiLoadRecord('customrecord_pct_tool',internalid);
	               Load_Tool.setFieldValue('custrecord_pct_tool_status',2);
                      Load_Tool.setFieldValue('custrecord_pct_latest_transaction',transaction_id);
				nlapiSubmitRecord(Load_Tool);
                    }
				}
                    }
		}
	}
}
}
}
}