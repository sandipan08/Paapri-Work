/***
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 July 2020    Sulata Dey
 * 
 ***/
/**************************************************************************************

Script Name: Delete Inventory Adjustment in edit mode in PCT Recycle 
Developer: Sulata Dey
Development Head: Ms. Ratwika Mondal 
Company Name: Paapri Cloud Technologies
Purpose: Delete Inventory Adjustment in edit mode in PCT Recycle.
© Copyright All Right

***********************************************************************************************************************************************/
function beforerecordload(type)
{
	if(type == 'create')
	{
		var customrecord_pct_api_recycleSearch = nlapiSearchRecord("customrecord_pct_api_recycle",null,
[
], 
[
   new nlobjSearchColumn("internalid"), 
   new nlobjSearchColumn("name").setSort(true)
]
);
var c=0;
for (var c in customrecord_pct_api_recycleSearch) {
			if(c==0)
			{
				var results = customrecord_pct_api_recycleSearch[c];
				var columns = results.getAllColumns();

				var last_id = results.getValue(columns[1]);
				nlapiLogExecution('DEBUG', 'Aman-Log', 'last_id=' + last_id);
				c++;
			}
           
        }
		
	var previous_sieve_number = parseInt(last_id.substring(1));
	nlapiLogExecution('DEBUG','PCT-Log','previous_sieve_number = '+previous_sieve_number);
	
	var new_sieve_number = previous_sieve_number + 1;
	var sieve_no_string = "S" + new_sieve_number;
	nlapiLogExecution('DEBUG','PCT-Log','sieve_no_string = '+sieve_no_string);
	nlapiSetFieldValue('name',sieve_no_string);
	nlapiSetFieldValue('autoname','F');
	
	nlapiLogExecution('DEBUG','PCT-Log','New Sieve No Set');
	
	
		var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'input_item=' + input_item);
		
		if(input_item!=null)
		{
		
		var average_cost = nlapiLookupField('item',input_item,'averagecost');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'average_cost=' + average_cost);
		
		var input_item_alloy = nlapiLookupField('item',input_item,'custitem_alloys');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'input_item_alloy=' + input_item_alloy);
		
		var adj_account = nlapiLookupField('item',input_item,'custitem_pct_eqs_sieve_adj_acc');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'adj_account=' + adj_account);
		
		var units_type = nlapiLookupField('item',input_item,'unitstype');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'units_type=' + units_type);
		
		var units = nlapiLookupField('item',input_item,'stockunit');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'units=' + units);
		
		if(adj_account!=null && adj_account!='')
		{
			nlapiSetFieldValue('custrecord_pct_eqs_sieve_adjust_account',adj_account);
		}
		else
		{
			nlapiSetFieldValue('custrecord_pct_eqs_sieve_adjust_account',543);
		}
		
		if(units_type!=null && units_type!='')
		{
			nlapiSetFieldValue('custrecord_pct_input_units_type',units_type);
		}
		
		if(units!=null && units!='')
		{
			nlapiSetFieldValue('custrecord_pct_api_unit',units);
		}
		
				
		var input_item_qty = parseFloat(nlapiGetFieldValue('custrecord_pct_api_input_quantity'));
		nlapiLogExecution('DEBUG','PCT-Log','input_item_qty = '+input_item_qty);
		
		var projected_value = parseFloat(input_item_qty * average_cost);
		nlapiLogExecution('DEBUG', 'Aman-Log', 'projected_value=' + projected_value);
				
		nlapiSetFieldText('custrecord_pct_api_previous_recycle_ord',last_id);
		
		nlapiSetFieldValue('custrecord_pct_eqs_assm_projected_val',projected_value.toFixed(2));
		nlapiSetFieldValue('custrecord_pct_input_item_alloy',input_item_alloy);
		nlapiSetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_eqs_alloy_output',1,input_item_alloy);	
		nlapiSelectLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc',1);
		}
	}
}
	
function delete_adj(type)
{
	if(type == 'delete')
	{	
		var rec_id = nlapiGetRecordId();
		nlapiLogExecution('DEBUG','PCT-Log','rec_id = '+rec_id);
		
		var inv_adjustment = nlapiGetFieldValue('custrecord_pct_api_inventory_adjustment')
		nlapiLogExecution('DEBUG','PCT-Log','inv_adjustment internal id = '+inv_adjustment);
		
		if(inv_adjustment != null)
		{
		nlapiDeleteRecord('inventoryadjustment', inv_adjustment);
		nlapiLogExecution('DEBUG','PCT-Log','record deleted');
		}
	}
}

function setInvAdjNo(type)
{
	if(type == 'create'||type == 'edit')
	{	
		var rec_id = nlapiGetRecordId();
		nlapiLogExecution('DEBUG','PCT-Log','rec_id = '+rec_id);
		
		var rec_type = nlapiGetRecordType();
		nlapiLogExecution('DEBUG','PCT-Log','rec_type = '+rec_type);
		
		var load_rec = nlapiLoadRecord(rec_type,rec_id);
		nlapiLogExecution('DEBUG','PCT-Log','load_rec = '+load_rec);
		
		var inv_adjustment = load_rec.getFieldValue('custrecord_pct_api_inventory_adjustment')
		nlapiLogExecution('DEBUG','PCT-Log','inv_adjustment internal id = '+inv_adjustment);
		
		var output_item_count = load_rec.getLineItemCount('recmachcustrecord_pct_api_linked_pct_sort_recyc');
		nlapiLogExecution('DEBUG','PCT-Log','output_item_count = '+output_item_count);
		
		for(i=1;i<=output_item_count;i++)
		{
			load_rec.setLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_eqs_inv_adj_no',i,inv_adjustment);
			nlapiLogExecution('DEBUG','PCT-Log','Inv Adj Set for Line No = '+i);
					
		}
		
		var submit_id = nlapiSubmitRecord(load_rec);
		nlapiLogExecution('DEBUG','PCT-Log','submit_id = '+submit_id);
		
	}
}

	
