
function item_serial_no_before_load(type,form)
{  
    if(type == 'create' || type == 'edit')
	{

        LineNum=nlapiGetLineItemCount('item');
		nlapiLogExecution('DEBUG','Atul-Log','LineNum = '+LineNum);
		var item_id = new Array;
		for(var i=1;i<=LineNum;i++)
		{
			
			item_id[i]=nlapiGetLineItemValue('item','item',i);
			nlapiLogExecution('DEBUG', 'Rakhi-Log', 'item_id:' + item_id);
			var item_id_arr=  item_id[i];
	    
			if(item_id_arr != null)
			{
				var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
				[
				   ["item","anyof",item_id_arr]
				], 
				[
				   new nlobjSearchColumn("internalid").setSort(true), 
				   new nlobjSearchColumn("inventorynumber")
				]
				);
				if(inventorynumberSearch!= null)
				{
					var inv_int_id= inventorynumberSearch[0].getValue("internalid");
					nlapiLogExecution('DEBUG', 'Rakhi-Log', 'inv_int_id:' + inv_int_id);
					var serial_no= inventorynumberSearch[0].getValue("inventorynumber");
					nlapiLogExecution('DEBUG', 'Rakhi-Log', 'serial_no:' + serial_no);
		           /* var serial_no_text = inventorynumberSearch[0].getText("inventorynumber");
					nlapiLogExecution('DEBUG', 'Rakhi-Log', 'serial_no_text:' + serial_no_text);	*/						
				}				
			}						
			nlapiSetLineItemValue('item','custcol_pct_mott_tool_last_serial_no',i,serial_no);
		}				
	}										
}