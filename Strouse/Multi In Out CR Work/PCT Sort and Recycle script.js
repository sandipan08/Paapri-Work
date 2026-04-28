/***
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 July 2020    Sulata Dey
 * 
 ***/
/**************************************************************************************

Script Name: Item and Inventory Adjustment creation and set in PCT Recycle 
Developer: Sulata Dey
Development Head: Ms. Ratwika Mondal 
Company Name: Paapri Cloud Technologies
Purpose: Based on the Input item attributes and Output properties Output item will be created if not present, and one inventory adjustment will be created.
© Copyright All Right

***********************************************************************************************************************************************/
/*
//for pbti account
var deafult_custom_form = 437;
var default_subsidiary = 3;
var deafult_tax_schdule = 6;
var default_costing_method = 'FIFO';
var default_cost_category = 3;
var default_cogs_acc = 121;
var default_asset_acc = 120;
var default_income_acc = 55;
var default_adjustment_acc_id = 54;
//var default_adjustment_location_id = 20;


//for Equisphere account
var deafult_custom_form = 87;
var default_subsidiary = 1;
var deafult_tax_schdule = 1;
var default_costing_method = 'Average';
var default_cost_category = 4;
var default_cogs_acc = 216;
var default_asset_acc = 215;
var default_income_acc = 54;
var default_adjustment_acc_id = 53;
//var default_adjustment_location_id = 20
*/

//for Equisphere SB
var deafult_custom_form = 86;
var default_subsidiary = 1;
var deafult_tax_schdule = 1;
var default_costing_method = 'Average';
var default_cost_category = 4;
var default_cogs_acc = 216;
var default_asset_acc = 215;
var default_income_acc = 54;
var default_adjustment_acc_id = 543;
//var default_adjustment_location_id = 20;
//
function recycle_process(id, type, form)
{ 	
	var rec_id = nlapiGetRecordId();
	var rec_type = nlapiGetRecordType();
	var transfer_location = null;
	
	
	var adjustment_acc_id = nlapiGetFieldValue('custrecord_pct_eqs_sieve_adjust_account');
	var lot_no = nlapiGetFieldValue('custrecord_pct_api_lot_number');
		
	nlapiLogExecution('DEBUG','PCT-Log','rec_id = '+rec_id);
	nlapiLogExecution('DEBUG','PCT-Log','rec_type = '+rec_type);
	nlapiLogExecution('DEBUG','PCT-Log','adjustment_acc_id = '+adjustment_acc_id);
	nlapiLogExecution('DEBUG','PCT-Log','lot_no = '+lot_no);
	
	if(adjustment_acc_id!=null && adjustment_acc_id!='')
	{
		default_adjustment_acc_id = adjustment_acc_id;
	}
	
	
	var previous_recycle_order = nlapiGetFieldValue('custrecord_pct_api_previous_recycle_ord');

	var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
	var input_lot_no_value = nlapiGetFieldValue('custrecord_pct_api_lot_number');
	var input_lot_no = nlapiGetFieldText('custrecord_pct_api_lot_number');
	var input_item_qty = nlapiGetFieldValue('custrecord_pct_api_input_quantity');
	var input_location = nlapiGetFieldValue('custrecord_pct_api_location');
	var input_subsidiary = nlapiGetFieldValue('custrecord_pct_api_subsidiary');
	var input_item_unit = nlapiGetFieldValue('custrecord_pct_api_unit');
	var per_operation_cost = nlapiGetFieldValue('custrecord_pct_api_per_operation_cost');
	var sales_price = nlapiGetFieldValue('custrecord_pct_api_sales_price');
	var projected_value = parseFloat(nlapiGetFieldValue('custrecord_pct_eqs_assm_projected_val'));
	var sieve_number = nlapiGetFieldValue('name');
	nlapiLogExecution('DEBUG','PCT-Log','sieve_number = '+sieve_number);
	
	nlapiLogExecution('DEBUG','PCT-Log','previous_recycle_order = '+previous_recycle_order);
	nlapiLogExecution('DEBUG','PCT-Log','input_item = '+input_item);
	nlapiLogExecution('DEBUG','PCT-Log','input_lot_no internal id = '+input_lot_no_value);
	nlapiLogExecution('DEBUG','PCT-Log','input_lot_no = '+input_lot_no);
	nlapiLogExecution('DEBUG','PCT-Log','input_item_qty = '+input_item_qty);
	nlapiLogExecution('DEBUG','PCT-Log','input_location = '+input_location);
	nlapiLogExecution('DEBUG','PCT-Log','input_subsidiary = '+input_subsidiary);
	nlapiLogExecution('DEBUG','PCT-Log','input_item_unit = '+input_item_unit);
	nlapiLogExecution('DEBUG','PCT-Log','per_operation_cost = '+per_operation_cost);
	nlapiLogExecution('DEBUG','PCT-Log','sales_price = '+sales_price);
	nlapiLogExecution('DEBUG','PCT-Log','projected_value = '+projected_value);
	
	if(input_location != null)
	{
		transfer_location = input_location;
	}

//***** get lot number's location******	
	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
		[
		   ["internalid","anyof",input_lot_no_value]
		], 
		[
		   new nlobjSearchColumn("inventorynumber").setSort(false), 
		   new nlobjSearchColumn("location"), 
		   new nlobjSearchColumn("quantityavailable")
		]
		);
		
		if(inventorynumberSearch != null)
		{
			var inventorynumberSearch_location = inventorynumberSearch[0].getValue('location');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'inventorynumberSearch_location = ' +inventorynumberSearch_location);
			
			var location_record = nlapiLoadRecord('location', inventorynumberSearch_location);
			var location_subsidiary = location_record.getFieldValue('subsidiary');
			var location_subsidiary_text = location_record.getFieldText('subsidiary');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'subsidiary of location = ' +location_subsidiary);
			nlapiSubmitRecord(location_record);
			
			
			var inventorynumberSearch_qty_available = inventorynumberSearch[0].getValue('quantityavailable');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'inventorynumberSearch_qty_available = ' +inventorynumberSearch_qty_available);
		}
	
	
	if(location_subsidiary != input_subsidiary)		//set error if the subsidiary and lot don't match
	{
		throw nlapiCreateError(" Please select correct subsidiary. This Lot number belongs to: " + location_subsidiary_text, " Please select correct subsidiary. This Lot number belongs to: " + location_subsidiary_text, true);
	}
	
	var remaining_qty = inventorynumberSearch_qty_available - input_item_qty;
	nlapiLogExecution('DEBUG','PCT-Log','remaining_qty = '+remaining_qty);
	
		if(remaining_qty < 0)
		{
			throw nlapiCreateError(" Please choose a different Lot Number with sufficient quantity available. Available quantity for this Lot Number is: " +  inventorynumberSearch_qty_available, " Please choose a different Lot Number with sufficient quantity available. Available quantity for this Lot Number is: " +  inventorynumberSearch_qty_available, true);
		}
		
//**********************	Previous record's cost ***********************************
/*if(previous_recycle_order != '')
	{	
		var customrecord_pct_api_recycleSearch = nlapiSearchRecord("customrecord_pct_api_recycle",null,
		[
		   ["internalid","anyof",previous_recycle_order]
		], 
		[
		  new nlobjSearchColumn("custrecord_pct_api_per_operation_cost"), 
		  new nlobjSearchColumn("custrecord_pct_api_accumulative_cost")
		]
		);	
		
		if(customrecord_pct_api_recycleSearch != null)
		{
			var previous_recycle_order_accumulative_cost = customrecord_pct_api_recycleSearch[0].getValue('custrecord_pct_api_accumulative_cost');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'previous_recycle_order_accumulative_cost = ' +previous_recycle_order_accumulative_cost);

			var previous_recycle_order_cost = customrecord_pct_api_recycleSearch[0].getValue('custrecord_pct_api_per_operation_cost');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'previous_recycle_order_per_operation_cost = ' +previous_recycle_order_cost);		
		}
		
		if(per_operation_cost == null || per_operation_cost == '')
		{
			per_operation_cost = 0.00;
		}
		
			
		var total_cost_for_current_operation = parseFloat(previous_recycle_order_accumulative_cost) + parseFloat(per_operation_cost);
		
	}
else	
	
	{	
		if(per_operation_cost == null || per_operation_cost == '')
		{
			per_operation_cost = 0.00;
		}
		
		var total_cost_for_current_operation = parseFloat(per_operation_cost);
	}
	
	nlapiLogExecution('DEBUG','PCT-Log','total_cost_for_current_operation = '+total_cost_for_current_operation);
	nlapiSetFieldValue('custrecord_pct_api_accumulative_cost', total_cost_for_current_operation); //set the current operation cost + previous accumulative cost
		
//**********************	Previous record's sales price ***********************************	
if(previous_recycle_order != '')
{	
		var customrecord_pct_api_recycleSearch = nlapiSearchRecord("customrecord_pct_api_recycle",null,
		[
		   ["internalid","anyof",previous_recycle_order]
		], 
		[
		  new nlobjSearchColumn("custrecord_pct_api_sales_price"), 
		  new nlobjSearchColumn("custrecord_pct_api_accumulative_sales_pr")
		]
		);	
		
		if(customrecord_pct_api_recycleSearch != null)
		{
			var previous_recycle_order_accumulative_sales_price = customrecord_pct_api_recycleSearch[0].getValue('custrecord_pct_api_accumulative_sales_pr');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'previous_recycle_order_accumulative_sales_price = ' +previous_recycle_order_accumulative_sales_price);

			var previous_recycle_order_sales_price = customrecord_pct_api_recycleSearch[0].getValue('custrecord_pct_api_sales_price');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'previous_recycle_order_sales_price = ' +previous_recycle_order_sales_price);		
		}
		
		if(sales_price == null || sales_price == '')
		{
			sales_price = 0.00;
		}
		
			
		var total_sales_price_for_current_operation = parseFloat(previous_recycle_order_accumulative_sales_price) + parseFloat(sales_price);
		
	}
else	
	
	{	
		if(sales_price == null || sales_price == '')
		{
			sales_price = 0.00;
		}
		
		var total_sales_price_for_current_operation = parseFloat(sales_price);
	}
	
	nlapiLogExecution('DEBUG','PCT-Log','total_sales_price_for_current_operation = '+total_sales_price_for_current_operation);
	nlapiSetFieldValue('custrecord_pct_api_accumulative_sales_pr', total_sales_price_for_current_operation); //set the current operation sales price + previous accumulative sales price
		
	*/	
//******************** working on output item's attributes ***********************************************
	
	var output_item_count = nlapiGetLineItemCount('recmachcustrecord_pct_api_linked_pct_sort_recyc');
	nlapiLogExecution('DEBUG','PCT-Log','output_item_count = '+output_item_count);
	
	//var output_material_type = new Array();
	//var output_color = new Array();
	//var output_form = new Array();
	//var output_filler = new Array();
	//var output_grade = new Array();
	var output_item_combined = new Array();
	var output_item_qty_combined = new Array();
	var output_item_name = new Array();
	//var string_output_color = new Array();
	//var split_output_color_arr = new Array ();
	//var color_abv_arr = new Array();
	//var color_full_name_arr = new Array();
	var output_item_units_type = new Array();
	var output_item_unit = new Array();
	var output_item_unit_combined = new Array();
	var output_item_list = new Array();
	var output_item_list_text = new Array();
	var output_item_unitcost = new Array();
	var output_item_valued = new Array();
	var output_item_qty = new Array();
	
	
	
	if(output_item_count > 0)
	{	
		for (var i=1; i<=output_item_count; i++)
		{	
		   
			/*output_material_type[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_material_type',i);
			//output_color[i] = nlapiGetLineItemValues('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_color',i);
			output_color[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_color',i);*/

			//output_form[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_form',i);
			/*output_filler[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_filler',i);
			output_grade[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_grade',i);*/
			output_item_name[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item_name',i);
			output_item_units_type[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_output_units_type',i);
			output_item_unit[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_output_unit',i);
			output_item_list[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item',i);
			output_item_list_text[i] = nlapiGetLineItemText('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item',i);
			output_item_qty[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_eqs_valued',i);
			//output_item_unitcost[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_eqs_unitcost',i);
			output_item_valued[i] = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_eqs_valued',i);
			
			
			// next 5 lines are for color, because color is a multiselect field	
			/*var split_output_color = output_color[i].split('');
			split_output_color_arr = split_output_color_arr.concat(split_output_color);
			nlapiLogExecution('DEBUG','PCT-Log','split_output_color = '+split_output_color);
			
			split_output_color_length = split_output_color_arr.length;
			nlapiLogExecution('DEBUG','PCT-Log','split_output_color_length = '+split_output_color_length);
			
			nlapiLogExecution('DEBUG','PCT-Log','output_material_type[i] = '+output_material_type[i]);
			nlapiLogExecution('DEBUG','PCT-Log','output_color[i] = '+split_output_color);*/
			//nlapiLogExecution('DEBUG','PCT-Log','output_form[i] = '+output_form[i]);
			/*nlapiLogExecution('DEBUG','PCT-Log','output_filler[i] = '+output_filler[i]);
			nlapiLogExecution('DEBUG','PCT-Log','output_grade[i] = '+output_grade[i]);*/
			nlapiLogExecution('DEBUG','PCT-Log','output_item_name[i] = '+output_item_name[i]);
			nlapiLogExecution('DEBUG','PCT-Log','output_item_units_type[i] = '+output_item_units_type[i]);
			nlapiLogExecution('DEBUG','PCT-Log','output_item_unit[i] = '+output_item_unit[i]);
			nlapiLogExecution('DEBUG','PCT-Log','output_item_list_text[i] = '+output_item_list_text[i]);
			
		
			

	//******* get_abbreviation function call to get all the property's abbreviation *********

			/*var mt_abv = get_abbreviation(output_material_type[i]);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Material type abbreviation = '+mt_abv);
			
			for (var ca = 0; ca < split_output_color_length; ca++)
			{
			var color_abv = get_abbreviation(split_output_color_arr[ca]);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Color abbreviation = '+color_abv);
			
			color_abv_arr.push(color_abv);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Color abbreviation array = '+color_abv_arr);
			
			var color_abv_arr_string = color_abv_arr.join('');
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Color abbreviation array after removing comma = '+color_abv_arr_string);
			
			}*/
			
			//var form_abv = get_abbreviation(output_form[i]);
			//nlapiLogExecution('DEBUG', 'PCT-Log', 'Form abbreviation = '+form_abv);
				
			/*var filler_abv = get_abbreviation(output_filler[i]);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Filler abbreviation = '+filler_abv);
				
			var grade_abv = get_abbreviation(output_grade[i]);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Grade abbreviation = '+grade_abv);*/
			

	//******* get_full_name function call to get all the property's abbreviation and full name *********

		  /* var mt_full_name = get_full_name(output_material_type[i]);
		   nlapiLogExecution('DEBUG', 'PCT-Log', 'Material type full name = '+mt_full_name);
		   
		   for (var cfm = 0; cfm < split_output_color_length; cfm++)
			{
			   var color_full_name = get_full_name(split_output_color_arr[cfm]);
			   nlapiLogExecution('DEBUG', 'PCT-Log', 'Color full name = '+color_full_name);
			   
			   color_full_name_arr.push(color_full_name);
			   nlapiLogExecution('DEBUG', 'PCT-Log', 'color_full_name_arr = '+color_full_name_arr);
			   
			   var color_full_name_arr_string = color_full_name_arr.join(' ');
			   nlapiLogExecution('DEBUG', 'PCT-Log', 'color_full_name_arr_string = '+color_full_name_arr_string);
			   
			}*/
			//var form_full_name = get_full_name(output_form[i]);
			//nlapiLogExecution('DEBUG', 'PCT-Log', 'Form full name = '+form_full_name);
			
			/*var filler_full_name = get_full_name(output_filler[i]);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Filler full name = '+filler_full_name);
			
			var grade_full_name = get_full_name(output_grade[i]);
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Grade full name = '+grade_full_name);*/
		
		
	//****new output item's name given****
	
	
	if(output_item_name[i] == null || output_item_name[i] == '')
	{
		if(output_item_list[i] == null || output_item_list[i] == '')
		{	//var new_item = mt_abv + form_abv + filler_abv + color_abv + grade_abv;		
			//var new_item = mt_abv + form_abv + filler_abv + color_abv_arr_string + grade_abv;
		}
		else
		{
			var new_item = output_item_list_text[i];
		}
	}
	else
	{
		var new_item = output_item_name[i];
	}
	
	nlapiLogExecution('DEBUG', 'PCT-Log', 'new_item = ' +new_item);
		
	//****new output item's display name, description given****	
		
		//var new_item_desc = mt_full_name + ' ' + color_full_name_arr_string + ' ' + form_full_name + ' ' + filler_full_name + ' ' + grade_full_name;
		//nlapiLogExecution('DEBUG', 'PCT-Log', 'new_item_desc = ' +new_item_desc);
		
	//****new output item's attributes defining****	
		var new_item_uom_type = output_item_units_type[i];
		var new_item_uom = output_item_unit[i];
		/*var new_item_material_type = output_material_type[i];
		var new_item_color = output_color[i];
		var new_item_filler = output_filler[i];
		var new_item_grade = output_grade[i];*/
		//var new_item_form = output_form[i];
		
		var return_item = item_availability(new_item)
		  if(return_item == null)
				{
						var new_item_id = item_creation(location_subsidiary, new_item, new_item_uom_type, new_item_uom, new_item_desc,input_item);
						
						if(new_item_id != null)
						{	
							nlapiSetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item',i,new_item_id);
							
						}
				}
			else
				{
						nlapiSelectLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc', i);
						nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item',return_item);
						nlapiCommitLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc');
						
				}
		/*split_output_color_arr.length = 0;
		color_abv_arr.length = 0;
		color_full_name_arr.length = 0;*/
		
	   }

		var total_qty_output_item = parseFloat(0);
		for (var i=1; i<=output_item_count; i++)
		{
			
			
			
			var output_item = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item',i);
			output_item_combined.push(output_item);
			
			var output_item_qty = parseFloat(nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_quantity_child',i));
			output_item_qty_combined.push(output_item_qty);
			
			if(output_item_valued[i] == 'T')
			{
				total_qty_output_item = total_qty_output_item + output_item_qty;
			}
			
			var output_item_unit = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_output_unit',i);
			output_item_unit_combined.push(output_item_unit);
			
		}
		
		nlapiLogExecution('DEBUG','PCT-Log','output_item_combined = '+output_item_combined);
		nlapiLogExecution('DEBUG','PCT-Log','output_item_qty_combined = '+output_item_qty_combined);
		nlapiLogExecution('DEBUG','PCT-Log','output_item_unit_combined = '+output_item_unit_combined);
		nlapiLogExecution('DEBUG','PCT-Log','total_qty_output_item = '+total_qty_output_item);
		
		var single_qty_unit_cost = parseFloat(projected_value/total_qty_output_item);
		nlapiLogExecution('DEBUG','PCT-Log','single_qty_unit_cost = '+single_qty_unit_cost);
		
		
//*****inventory adjustment creation**********		
	  
		var adjustment = inventory_adjustment(input_item, inventorynumberSearch_location, location_subsidiary, input_lot_no_value, input_lot_no, input_item_qty, input_item_unit, output_item_count, output_item_combined, output_item_qty_combined, output_item_unit_combined, transfer_location,output_item_unitcost, per_operation_cost,single_qty_unit_cost,output_item_valued,sieve_number);
		nlapiLogExecution('DEBUG','PCT-Log','Adjustment Created ID = '+adjustment);
		
		nlapiSetFieldValue('custrecord_pct_api_inventory_adjustment', adjustment); //set the inventory adjusment in the "Inventory Adjustment" field in PCT Recycle
		
	}
	else
	{
		throw nlapiCreateError(" You must select atleast one output combination to continue. ", " You must select atleast one output combination to continue. ", true);
	}
	
	var output_itm_ct = nlapiGetLineItemCount('recmachcustrecord_pct_api_linked_pct_sort_recyc');
	nlapiLogExecution('DEBUG','PCT-Log','output_itm_ct = '+output_itm_ct);
	
	
	for(var z=1; z<=output_itm_ct; z++)
	{
		var output_item = nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_api_item',z);
        nlapiLogExecution('DEBUG', 'Aman-Log', 'output_item=' + output_item);

        var itemSearch = nlapiSearchRecord("item", null,
            [
                ["internalid", "anyof", output_item]
            ],
            [
                new nlobjSearchColumn("itemid").setSort(false),
                new nlobjSearchColumn("type"),
                new nlobjSearchColumn("unitstype"),
                new nlobjSearchColumn("stockunit")
            ]
        );

        for (var i in itemSearch) {
            var results = itemSearch[i];
            var columns = results.getAllColumns();

            var unitstype = results.getValue(columns[2]);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'unitstype=' + unitstype);

            var units = unitstype = results.getValue(columns[3]);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'units=' + units);

        }
		
		var sieve_out_lot = sieve_number + "-"+ z;
		var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
[
   ["item","anyof",output_item], 
   "AND", 
   ["inventorynumber","is",sieve_out_lot]
], 
[
   new nlobjSearchColumn("internalid"), 
   new nlobjSearchColumn("inventorynumber").setSort(false)
]
);

	for (var d in inventorynumberSearch) {
            var results = inventorynumberSearch[d];
            var columns = results.getAllColumns();

            var lot_no_int_id = results.getValue(columns[0]);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'lot_no_int_id=' + lot_no_int_id);

        }


		nlapiLogExecution('DEBUG', 'Aman-Log', 'sieve_out_lot=' + sieve_out_lot);
		nlapiSetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_output_units_type',z,unitstype);
		nlapiSetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_api_output_unit',z,units);
		nlapiSetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_eqs_sieving_out_lotno',z,lot_no_int_id);
	}
	
}
// ---------------------------- END OF MAIN FUNCTION ----------------------------------------------------------------



//****get all the property's abbereviation****

/*function get_abbreviation(item_property)
{ 
   nlapiLogExecution('DEBUG', 'PCT-Log', 'item_property is = ' +item_property);
   
   if(item_property != '' && item_property != null) 
	   {
			var customrecord_pct_api_recycle_typeSearch  = nlapiSearchRecord("customrecord_pct_api_recycle_type",null,
			[
			   ["internalid","anyof",item_property]
			], 
			[  
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_pct_api_type_abbreviation"),
			]
			);
				
			var customrecord_pct_api_recycle_typeSearch_length = customrecord_pct_api_recycle_typeSearch.length;
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Get abbreviation search length = '+customrecord_pct_api_recycle_typeSearch_length);	
			
			for (var abv = 0; abv < customrecord_pct_api_recycle_typeSearch_length; abv++)	
			{				
				var item_property_abv = customrecord_pct_api_recycle_typeSearch[abv].getValue('custrecord_pct_api_type_abbreviation');
				nlapiLogExecution('DEBUG', 'PCT-Log', 'Item property abbreaviation inside function = ' +item_property_abv);		
			}	
				if(item_property_abv != null)
					{
					 return item_property_abv;
					}
				else
				{
					return null;
				}
			
	   }
   else
		{
			return '';
		}
}*/

//****get all the property's full name****

/*function get_full_name(item_property_id)
{ 
    nlapiLogExecution('DEBUG', 'PCT-Log', 'item_property_id is = '+item_property_id);
	
	if(item_property_id != '' && item_property_id != null)
		{
			var customrecord_pct_api_recycle_typeSearch  = nlapiSearchRecord("customrecord_pct_api_recycle_type",null,
			[
			   ["internalid","anyof",item_property_id]
			], 
			[  
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_pct_api_type_abbreviation"),
			]
			);
				
			var customrecord_pct_api_recycle_typeSearch_length = customrecord_pct_api_recycle_typeSearch.length;
			nlapiLogExecution('DEBUG', 'PCT-Log', 'Get full name search length = '+customrecord_pct_api_recycle_typeSearch_length);	
			
			for (var fm = 0; fm < customrecord_pct_api_recycle_typeSearch_length; fm++)	
			{
				var item_property_full_name = customrecord_pct_api_recycle_typeSearch[fm].getValue('name');
				nlapiLogExecution('DEBUG', 'PCT-Log', 'Item property full name inside function = ' +item_property_full_name);
			}	
				
				if(item_property_full_name != null)
					{
					  return item_property_full_name;
					}
				else
				{
					return null;
				}
		    
		}	
	else
		{
			return '';
		}
}
*/
//****Item availability function and saved search****

 function item_availability(item_name)
{
	nlapiLogExecution('DEBUG','PCT-Log','Check New Item Name = '+item_name);
	var item_filters = new Array();
	
	item_filters[0] = new nlobjSearchFilter( 'name',null,'is',item_name);
								
	var item_column = new Array();
	item_column[0] = new nlobjSearchColumn('internalid');
					
	// Create the saved search
	var item_search = nlapiSearchRecord('item',null,item_filters,item_column);
	if (item_search == null)
	{
		item_search_length = 0;
		nlapiLogExecution('DEBUG','PCT-Log','Item Search Length='+item_search_length);
	}
	else
	{
		item_search_length = parseInt(item_search.length);
		nlapiLogExecution('DEBUG','PCT-Log','Item Search Length = '+item_search_length);
	}

	if(parseInt(item_search_length) > 0)
	{
		search_item_id = item_search[0].getValue('internalid');
		return search_item_id;
	}
	else
	{
		return null;
	}
}


//****item creation function****

function item_creation(new_item_subsidiary, new_item_name, new_item_units_type, new_item_unit, new_item_description, new_item_mt, new_item_clr, new_item_frm, new_item_fllr, new_item_grd, input_item_id)
{
	var input_item_rec = nlapiLoadRecord('lotnumberedinventoryitem',input_item_id);
	//var input_material_type = input_item_rec.getFieldValue('custitem_pct_api_material_type');
	//var input_form = input_item_rec.getFieldValue('custitem_pct_api_form');
	/*var input_grade = input_item_rec.getFieldValue('custitem_pct_api_grades');
	var input_filler = input_item_rec.getFieldValue('custitem_pct_api_filler');
	var input_color = input_item_rec.getFieldValue('custitem_pct_api_colour');*/
	var input_item_subsidiary = input_item_rec.getFieldValue('subsidiary');
	var input_tax_schedule = input_item_rec.getFieldValue('taxschedule');
	var input_cogs_account = input_item_rec.getFieldValue('cogsaccount');
	var input_asset_account = input_item_rec.getFieldValue('assetaccount');
	var input_income_account = input_item_rec.getFieldValue('incomeaccount');
	var input_cost_catagory = input_item_rec.getFieldValue('costcategory');
	var input_costing_method = input_item_rec.getFieldValue('costingmethod');
	
	nlapiLogExecution('DEBUG','PCT-Log','Subsidiary of input item = '+input_item_subsidiary);
	nlapiLogExecution('DEBUG','PCT-Log','Tax Schedule of input item = '+input_tax_schedule);
	nlapiLogExecution('DEBUG','PCT-Log','COGS Account of input item = '+input_cogs_account);
	nlapiLogExecution('DEBUG','PCT-Log','Asset Account of input item = '+input_asset_account);
	nlapiLogExecution('DEBUG','PCT-Log','Income Account of input item = '+input_income_account);
	nlapiLogExecution('DEBUG','PCT-Log','Cost Catagory of input item = '+input_cost_catagory);
	nlapiLogExecution('DEBUG','PCT-Log','Costing Method of input item = '+input_costing_method);

	nlapiLogExecution('DEBUG','PCT-Log','New Item Name = '+new_item_name);
	nlapiLogExecution('DEBUG','PCT-Log','New Item Units Type = '+new_item_units_type);
	nlapiLogExecution('DEBUG','PCT-Log','New Item Unit = '+new_item_unit);
	nlapiLogExecution('DEBUG','PCT-Log','New Item Description = '+new_item_description);
	/*nlapiLogExecution('DEBUG','PCT-Log','New Item Material Type = '+new_item_mt);
	nlapiLogExecution('DEBUG','PCT-Log','New Item Color = '+new_item_clr);*/
	//nlapiLogExecution('DEBUG','PCT-Log','New Item Form = '+new_item_frm);
	/*nlapiLogExecution('DEBUG','PCT-Log','New Item Filler = '+new_item_fllr);
	nlapiLogExecution('DEBUG','PCT-Log','New Item Grade = '+new_item_grd);*/
	nlapiLogExecution('DEBUG','PCT-Log','New Item Subsidiary = '+new_item_subsidiary);

	var item_create = nlapiCreateRecord('lotnumberedinventoryitem');
	
	item_create.setFieldValue('customform', deafult_custom_form); //set default custom form to the new item
	item_create.setFieldValue('itemid', new_item_name);
	item_create.setFieldValue('unitstype', new_item_units_type);
	item_create.setFieldValue('stockunit', new_item_unit);
	item_create.setFieldValue('purchaseunit', new_item_unit);
	item_create.setFieldValue('saleunit', new_item_unit);
	item_create.setFieldValue('displayname', new_item_description);
	item_create.setFieldValue('purchasedescription', new_item_description);
	item_create.setFieldValue('salesdescription', new_item_description);
	item_create.setFieldValue('custitem_pct_api_form', new_item_frm);
	/*item_create.setFieldValue('custitem_pct_api_material_type', new_item_mt);
	item_create.setFieldValue('custitem_pct_api_grades', new_item_grd);
	item_create.setFieldValue('custitem_pct_api_filler', new_item_fllr);
	item_create.setFieldValue('custitem_pct_api_colour', new_item_clr);*/
	
	if(input_item_subsidiary == null || input_item_subsidiary == "")
	{
		item_create.setFieldValue('subsidiary', new_item_subsidiary);
		
	}
	else
	{
		item_create.setFieldValue('subsidiary', input_item_subsidiary);
		
	}
	
	if(input_tax_schedule == null || input_tax_schedule == "")
	{
		item_create.setFieldValue('taxschedule', deafult_tax_schdule);
	}
	else
	{
		item_create.setFieldValue('taxschedule', input_tax_schedule);
	}
	
	if(input_cogs_account == null || input_cogs_account == "")
	{
		item_create.setFieldValue('cogsaccount', default_cogs_acc);
	}
	else
	{
		item_create.setFieldValue('cogsaccount', input_cogs_account);
	}
	
	if(input_asset_account == null || input_asset_account == "")
	{
		item_create.setFieldValue('assetaccount', default_asset_acc);
	}
	else
	{
		item_create.setFieldValue('assetaccount', input_asset_account);
	}
	
	if(input_income_account == null || input_income_account == "")
	{
		item_create.setFieldValue('incomeaccount', default_income_acc);
	}
	else
	{
		item_create.setFieldValue('incomeaccount', input_income_account);
	}
	
	if(input_cost_catagory == null || input_cost_catagory == "")
	{
		item_create.setFieldValue('costcategory', default_cost_category);
	}
	else
	{
		item_create.setFieldValue('costcategory', input_cost_catagory);
	}
	
	if(input_costing_method == null || input_costing_method == "")
	{
		item_create.setFieldValue('costingmethod', default_costing_method);
	}
	else
	{
		item_create.setFieldValue('costingmethod', input_costing_method);
	}
	

	var new_created_item = nlapiSubmitRecord(item_create);
	nlapiLogExecution('DEBUG','PCT-Log','New Created Item = '+new_created_item);
	
	if(new_created_item != null)
	{
		return new_created_item;
	}
	else
	{
		return null;
	}
}

//***** inventory adjustment record creation function *****

function inventory_adjustment(adj_input_item, adj_input_item_lot_location, adj_input_item_lot_subsidiary, adj_input_item_lot_no_value, adj_input_item_lot_no, adj_input_item_qty, adj_input_item_unit, adj_output_item_count, adj_output_item, adj_output_item_qty, adj_output_item_unit, adj_output_item_location,adj_output_item_unitcost,per_op_cost,single_qty_unit_cost,output_item_valued,sieve_number)
{	
	
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment input item = '+adj_input_item);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment input item quantity = '+adj_input_item_qty);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment input item unit = ' +adj_input_item_unit);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment input item lot location = '+adj_input_item_lot_location);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment output item lot subsidiary = ' +adj_input_item_lot_subsidiary);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment output item count = '+adj_output_item_count);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment output item = ' +adj_output_item);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment output item quantity = ' +adj_output_item_qty);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment output item unit = ' +adj_output_item_unit);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment output item lot location = ' +adj_output_item_location);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment per OP Cost = ' +per_op_cost);
	nlapiLogExecution('DEBUG','PCT-Log','Adjustment Output Item UnitCost = ' +adj_output_item_unitcost);
	
	
	
	var inv_adjustment_record = nlapiCreateRecord('inventoryadjustment');
	inv_adjustment_record.setFieldValue('subsidiary', adj_input_item_lot_subsidiary);
	inv_adjustment_record.setFieldValue('department', 6);
	inv_adjustment_record.setFieldValue('adjlocation', adj_input_item_lot_location);
	inv_adjustment_record.setFieldValue('account', default_adjustment_acc_id);
	inv_adjustment_record.selectNewLineItem('inventory');
	inv_adjustment_record.setCurrentLineItemValue('inventory','item',adj_input_item);
	inv_adjustment_record.setCurrentLineItemValue('inventory','location', adj_input_item_lot_location);
	inv_adjustment_record.setCurrentLineItemValue('inventory','adjustqtyby',-adj_input_item_qty);
	inv_adjustment_record.setCurrentLineItemValue('inventory','units', adj_input_item_unit);
	
	
	var inv_adjustment_subrecord = inv_adjustment_record.createCurrentLineItemSubrecord('inventory','inventorydetail');
	inv_adjustment_subrecord.selectNewLineItem('inventoryassignment');
	inv_adjustment_subrecord.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', adj_input_item_lot_no_value);
	inv_adjustment_subrecord.setCurrentLineItemValue('inventoryassignment', 'quantity', -adj_input_item_qty);
	inv_adjustment_subrecord.commitLineItem('inventoryassignment');
	inv_adjustment_subrecord.commit();
	
	inv_adjustment_record.commitLineItem('inventory');
	var j=1;
 //next lines	
	for(var m=0; m<adj_output_item_count; m++)
	{
		
		nlapiLogExecution('DEBUG','PCT-Log','Adjustment Inventory Second and onwards Items = '+adj_output_item[m]);
		inv_adjustment_record.selectNewLineItem('inventory');
		inv_adjustment_record.setCurrentLineItemValue('inventory','item', adj_output_item[m]);
		inv_adjustment_record.setCurrentLineItemValue('inventory','location', adj_output_item_location);
		inv_adjustment_record.setCurrentLineItemValue('inventory','adjustqtyby', adj_output_item_qty[m]);	
		inv_adjustment_record.setCurrentLineItemValue('inventory','units', adj_output_item_unit[m]);
		nlapiLogExecution('DEBUG','PCT-Log','Line UnitCost2 = ' +adj_output_item_unitcost[m+1]);
		var lot_no = sieve_number + "-" + j;
		nlapiLogExecution('DEBUG','PCT-Log','Adjustment Lot No = ' +lot_no);
		//var line_unit_cost = find_null(parseFloat(per_op_cost)) + find_null(parseFloat(adj_output_item_unitcost[m+1]));
		//nlapiLogExecution('DEBUG','PCT-Log','Line Cost = ' +line_unit_cost);
		if(output_item_valued[m+1] == 'T')
		{
			inv_adjustment_record.setCurrentLineItemValue('inventory','unitcost', single_qty_unit_cost);
		}
		else{
			inv_adjustment_record.setCurrentLineItemValue('inventory','unitcost', 0);
		}
		//inv_adjustment_record.setCurrentLineItemValue('inventory','unitcost', line_unit_cost);
		
		inv_adjustment_subrecord = inv_adjustment_record.createCurrentLineItemSubrecord('inventory','inventorydetail');
		inv_adjustment_subrecord.selectNewLineItem('inventoryassignment');
		inv_adjustment_subrecord.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',lot_no);		
		inv_adjustment_subrecord.setCurrentLineItemValue('inventoryassignment', 'quantity', adj_output_item_qty[m]);
		//inv_adjustment_subrecord.setCurrentLineItemValue('inventoryassignment', 'quantity', adj_output_item_qty[m]);
		inv_adjustment_subrecord.commitLineItem('inventoryassignment');
		inv_adjustment_subrecord.commit();
		
		inv_adjustment_record.commitLineItem('inventory');
		j++;
	}

	
	var inv_adjustment_record_submit = nlapiSubmitRecord(inv_adjustment_record);
	
	if(inv_adjustment_record_submit != null)
	{	
		return inv_adjustment_record_submit;
	}
	else 
	{
		return null;
	}	
}

function find_null(value) {
    if (value == null || value =='')
	{
    return 0;
	}
	else{
		return value;
	}
}
