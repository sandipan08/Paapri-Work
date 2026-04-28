function setInputQty(type, name) {
	
	if(type == 'remachcustomrecord_pct_eqs_sieve_in_lotnos' && name == 'custrecord_pct_eqs_input_lotno')
	{
		var lot_no = nlapiGetCurrentLineItemValue('remachcustomrecord_pct_eqs_sieve_in_lotnos','custrecord_pct_eqs_input_lotno');
		nlapiLogExecution('DEBUG', 'PCT-log', 'lot_no=' + lot_no);
		
		var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
        nlapiLogExecution('DEBUG', 'PCT-log', 'input_item=' + input_item);
		
		if (lot_no != null && lot_no != '') {
            var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
            nlapiLogExecution('DEBUG', 'PCT-log', 'input_item=' + input_item);

            var inventorynumberSearch = nlapiSearchRecord("inventorynumber", null,
                [
                    ["item", "anyof", input_item],
                    "AND",
                    ["inventorynumber", "is", lot_no]
                ],
                [
                    new nlobjSearchColumn("inventorynumber").setSort(false),
                    new nlobjSearchColumn("quantityonhand")
                ]
            );

            nlapiLogExecution('DEBUG', 'PCT-log', 'inventorynumberSearch=' + inventorynumberSearch);
            for (var i in inventorynumberSearch) {
                var results = inventorynumberSearch[i];
                nlapiLogExecution('DEBUG', 'Aman-Log', 'results=' + results);
                var columns = results.getAllColumns();
                nlapiLogExecution('DEBUG', 'Aman-Log', 'columns=' + columns);
                var onhand_qty = results.getValue(columns[1]);
                nlapiLogExecution('DEBUG', 'Aman-Log', 'onhand_qty=' + onhand_qty);
            }

            nlapiSetCurrentLineItemValue('remachcustomrecord_pct_eqs_sieve_in_lotnos','custrecord_pct_eqs_input_qty',onhand_qty);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'Value Set');
			nlapiCancelLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc');
		}
		
	}
   /* if (name === 'custrecord_pct_api_lot_number') {
        var lot_no = nlapiGetFieldText('custrecord_pct_api_lot_number');
        nlapiLogExecution('DEBUG', 'PCT-log', 'lot_no=' + lot_no);

        if (lot_no != null && lot_no != '') {
            var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
            nlapiLogExecution('DEBUG', 'PCT-log', 'input_item=' + input_item);



            var inventorynumberSearch = nlapiSearchRecord("inventorynumber", null,
                [
                    ["item", "anyof", input_item],
                    "AND",
                    ["inventorynumber", "is", lot_no]
                ],
                [
                    new nlobjSearchColumn("inventorynumber").setSort(false),
                    new nlobjSearchColumn("quantityonhand")
                ]
            );

            nlapiLogExecution('DEBUG', 'PCT-log', 'inventorynumberSearch=' + inventorynumberSearch);
            for (var i in inventorynumberSearch) {
                var results = inventorynumberSearch[i];
                nlapiLogExecution('DEBUG', 'Aman-Log', 'results=' + results);
                var columns = results.getAllColumns();
                nlapiLogExecution('DEBUG', 'Aman-Log', 'columns=' + columns);
                var onhand_qty = results.getValue(columns[1]);
                nlapiLogExecution('DEBUG', 'Aman-Log', 'onhand_qty=' + onhand_qty);
            }

            nlapiSetFieldValue('custrecord_pct_api_input_quantity', onhand_qty);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'Value Set');
			
			
        }

    }*/
	
	/*if( name == 'custrecord_pct_eqs_assm_projected_val' )
	{
		nlapiCancelLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc');
	}*/


   /*if (name == 'custrecord_pct_input_item_alloy') {
        var input_alloy = nlapiGetFieldValue('custrecord_pct_input_item_alloy');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_alloy=' + input_alloy);
		 nlapiSelectLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc');
        nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_eqs_alloy_output', input_alloy);
		 nlapiLogExecution('DEBUG', 'Aman-Log', 'Line 1 Alloy Set');
        nlapiSetFieldValue('custrecord_pct_api_input_quantity',0);
		document.forms['main_form'].elements['custrecord_pct_eqs_sieve_input'].focus();
		 nlapiLogExecution('DEBUG', 'Aman-Log', 'Input Qty Set');
	}

       var input_units_type = nlapiGetFieldValue('custrecord_pct_input_units_type');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_units_type=' + input_units_type);
        var input_units = nlapiGetFieldValue('custrecord_pct_api_unit');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_units=' + input_units);
        nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_output_units_type',input_units_type);
        nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_output_unit',input_units);
        

        //nlapiCommitLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc');
       
        /*setTimeout(function(){
        document.getElementById("custrecord_pct_api_lot_number_display").focus();
        }, 5000);
        nlapiLogExecution('DEBUG', 'Aman-Log', 'Focus Set');
    }*/

    /*if (name == 'custrecord_pct_api_input_quantity') {
        var input_qty = nlapiGetFieldValue('custrecord_pct_api_input_quantity');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_qty=' + input_qty);

        var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_item=' + input_item);

        var average_cost = nlapiLookupField('item', input_item, 'averagecost');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'average_cost=' + average_cost);

        if (input_qty != null && input_qty != '' && average_cost != '' && average_cost != null) {
            var projected_val = parseFloat(input_qty * average_cost);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'average_cost=' + average_cost);

            nlapiSetFieldValue('custrecord_pct_eqs_assm_projected_val', projected_val.toFixed(2));

        }
    }*/



     /*if (name == 'custrecord_pct_eqs_sieve_input') 
	{
		//document.getElementById('custrecord_pct_api_lot_number').focus();
		
        var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_item=' + input_item);

        var transactionSearch = nlapiSearchRecord("transaction", null,
            [
                ["type", "anyof", "WOCompl", "Build"],
                "AND",
                ["item", "anyof",input_item]
            ],
            [
                new nlobjSearchColumn("trandate").setSort(true),
                new nlobjSearchColumn("item"),
                new nlobjSearchColumn("type"),
                new nlobjSearchColumn("inventorynumber", "inventoryDetail", null),
                new nlobjSearchColumn("projectedamount"),
                new nlobjSearchColumn("amount")
            ]
        );

        for (var l in transactionSearch) {
			if(l==1)
			{
            var results = transactionSearch[l];
            nlapiLogExecution('DEBUG', 'Aman-Log', 'results=' + results);
            var columns = results.getAllColumns();
            nlapiLogExecution('DEBUG', 'Aman-Log', 'columns=' + columns);
            var projected_value = results.getValue(columns[5]);
            nlapiLogExecution('DEBUG', 'Aman-Log', 'projected_value=' + projected_value);
			}
        }

		if(projected_value!=null && projected_value!='')
		{
		    nlapiSetFieldValue('custrecord_pct_eqs_assm_projected_val', projected_value);
		}
		else
		{
			 nlapiSetFieldValue('custrecord_pct_eqs_assm_projected_val', 0);
		}
       
        nlapiLogExecution('DEBUG', 'Aman-Log', 'Projected Value Set');
		
	
		document.getElementById('custrecord_pct_api_lot_number').focus();
	
    }*/


    /*if(type == 'recmachcustrecord_pct_api_linked_pct_sort_recyc' && name == 'custrecord_pct_api_item')
	{
		 var output_item = nlapiGetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_api_item');
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
		
		nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_output_units_type',unitstype);
		nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_output_unit',units);	
	}*/
}

function set_outputItems_values(type) {
  
 
  
    if (type == 'recmachcustrecord_pct_api_linked_pct_sort_recyc') {
        var input_alloy = nlapiGetFieldValue('custrecord_pct_input_item_alloy');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_alloy=' + input_alloy);
		
		var output_item = nlapiGetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'output_item 1=' + output_item);
        var output_alloy = nlapiGetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_eqs_alloy_output');
		
		if(output_alloy==null || output_alloy=='')
          {
            nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_eqs_alloy_output', input_alloy);
            nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_item',output_item);
          }
      
       nlapiLogExecution('DEBUG', 'Aman-Log', 'output_item 2=' + output_item);

        /*var input_units_type = nlapiGetFieldValue('custrecord_pct_input_units_type');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_units_type=' + input_units_type);
        var input_units = nlapiGetFieldValue('custrecord_pct_api_unit');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'input_units=' + input_units);
        nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_output_units_type',input_units_type);
        nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_output_unit',input_units);
       */
        

    }
}

/*function set_unit_unitstype(type) {
    if (type == 'recmachcustrecord_pct_api_linked_pct_sort_recyc') {
        var output_item = nlapiGetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_api_item');
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
		
		nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_output_units_type',unitstype);
		nlapiSetCurrentLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc','custrecord_pct_api_output_unit',units);
		//nlapiCommitLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc');

    }
}*/

function setAlloyPageInit()
{
	var input_alloy_pageinit = nlapiGetFieldValue('custrecord_pct_input_item_alloy');
	nlapiLogExecution('DEBUG', 'Aman-Log', 'input_alloy_pageinit=' + input_alloy_pageinit);
	
	if(input_alloy_pageinit!=null && input_alloy_pageinit!='')
	{
	 nlapiSetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_eqs_alloy_output',1, input_alloy_pageinit);
	nlapiSelectLineItem('recmachcustrecord_pct_api_linked_pct_sort_recyc',1);
	}
	 
	}
	
	
function update_assembly_val(type)
{
	if(type == 'remachcustomrecord_pct_eqs_sieve_in_lotnos');
	{
		var input_item = nlapiGetFieldValue('custrecord_pct_eqs_sieve_input');
        nlapiLogExecution('DEBUG', 'PCT-log', 'input_item=' + input_item);
		
        var average_cost = nlapiLookupField('item', input_item, 'averagecost');
        nlapiLogExecution('DEBUG', 'Aman-Log', 'average_cost=' + average_cost);
		
		var total_assm_val = 0;
		
		var item_line_count = nlapiGetLineItemCount('remachcustomrecord_pct_eqs_sieve_in_lotnos');
		nlapiLogExecution('DEBUG', 'Aman-Log', 'item_line_count=' + item_line_count);
		
		for(var k = 1; k <= item_line_count; k++)
		{
				
			var input_qty = nlapiGetLineItemValue('remachcustomrecord_pct_eqs_sieve_in_lotnos','custrecord_pct_eqs_input_qty',k);
			nlapiLogExecution('DEBUG', 'Aman-Log', 'input_qty=' + input_qty);
			
			var assm_val_for_input = input_qty * average_cost;
			nlapiLogExecution('DEBUG', 'Aman-Log', 'assm_val_for_input=' + assm_val_for_input);
			
			total_assm_val = total_assm_val + assm_val_for_input;
		}
		
		nlapiLogExecution('DEBUG', 'Aman-Log', 'total_assm_val=' + total_assm_val);
		nlapiSetFieldValue('custrecord_pct_eqs_assm_projected_val',total_assm_val);
	}
}