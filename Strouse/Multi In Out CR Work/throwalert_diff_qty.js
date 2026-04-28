function throwalert() {

    var output_item_count = nlapiGetLineItemCount('recmachcustrecord_pct_api_linked_pct_sort_recyc');
    nlapiLogExecution('DEBUG', 'Aman-Log', 'output_item_count=' + output_item_count);

    var total_qty = parseFloat(0);

    for (var i = 1; i <= output_item_count; i++) {
        var output_item_qty = parseFloat(nlapiGetLineItemValue('recmachcustrecord_pct_api_linked_pct_sort_recyc', 'custrecord_pct_api_quantity_child', i));
        nlapiLogExecution('DEBUG', 'Aman-Log', 'output_item_qty=' + output_item_qty);

        total_qty = total_qty + output_item_qty;
    }
    nlapiLogExecution('DEBUG', 'Aman-Log', 'total_qty=' + total_qty);

    var total_qty_to_fixed = total_qty.toFixed(2);
    var input_qty = parseFloat(nlapiGetFieldValue('custrecord_pct_api_input_quantity')).toFixed(2);
    nlapiLogExecution('DEBUG', 'Aman-Log', 'total_qty_to_fixed=' + total_qty_to_fixed);
    nlapiLogExecution('DEBUG', 'Aman-Log', 'input_qty=' + input_qty);

    if (input_qty == total_qty_to_fixed) {
        nlapiLogExecution('DEBUG', 'Aman-Log', 'Same Quantities');
		return true;
    }
	else 
	{
        alert("The output mass of " + total_qty_to_fixed + " kg does not match the input mass of " + input_qty + " kg");
		return false;
    }


}