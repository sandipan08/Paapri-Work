function before_submit_tool_transaction(type) {
 if(type =='edit' || type =='create'){
    var rec_type = nlapiGetRecordType();
    var rec_id = nlapiGetRecordId();
        var tran_type = nlapiLookupField(rec_type,rec_id,'custrecord_pct_trans_typ');
        var tool_name = nlapiLookupField(rec_type,rec_id,'custrecord_pct_trans_tool');
        nlapiLogExecution('DEBUG', 'Moumita-Log', 'tool:' + tool_name);
        var tool_item = nlapiLookupField(rec_type,rec_id,'custrecord_trans_tool_item');
        nlapiLogExecution('DEBUG', 'Moumita-Log', 'item:' + tool_item);
        //var load_tool = nlapiLoadRecord('customrecord_pct_tool', tool_name);
        var wo_tool = nlapiLookupField('customrecord_pct_tool',tool_name,'custrecord_pct_work_order_tool');
      if(tran_type == '2' && wo_tool != null)
        {
        var workordercompletionSearch = nlapiSearchRecord("workordercompletion", null, [
            ['type', 'anyof', 'WOCompl'], 'AND', ['createdfrom', 'anyof', wo_tool]
        ], [new nlobjSearchColumn('internalid')]);
        for (var k = 0; workordercompletionSearch != null && k < workordercompletionSearch.length; k++) {
            var work_completion_rec = workordercompletionSearch[k];
            var InternalId = work_completion_rec.getValue('internalid');
            nlapiLogExecution('DEBUG', 'Moumita-Log', 'id:' + InternalId);
          //var load_tool = nlapiLoadRecord('customrecord_pct_tool', tool_name);
        nlapiSubmitField('customrecord_pct_tool',tool_name,'custrecord_pct_created_from', InternalId);
          nlapiSubmitField('customrecord_pct_tool',tool_name,'custrecord_pct_latest_transaction',rec_id);
        //var id = nlapiSubmitRecord(load_tool);
        //nlapiLogExecution('DEBUG', 'Moumita-Log', 'id:' + id);
        }
        }
 }
}