function set_tool_life(id, type, form)
{
    var rec_type = nlapiGetRecordType();
    var rec_id = nlapiGetRecordId();
    /*var created_from = nlapiLookupField(rec_type,rec_id,'custrecord_pct_created_from');
   	if(created_from != '')
    {
   	nlapiLogExecution('DEBUG','PCT-Log','WOC:'+created_from);
   	var WO = nlapiLookupField('workordercompletion',created_from,'createdfrom');
   	nlapiLogExecution('DEBUG','PCT-Log','WO:'+WO);
   	var quan = nlapiLookupField('workorder',WO,'quantity');
   	nlapiLogExecution('DEBUG','PCT-Log','quan:'+quan);
   	var tool_life = nlapiLookupField(rec_type,rec_id,'custrecord_tool_life');
   	nlapiLogExecution('DEBUG','PCT-Log','tool_life:'+tool_life);
   	tool_life = tool_life - quan ;
   	nlapiSubmitField(rec_type,rec_id,'custrecord_tool_life',tool_life);
    }*/
    var status = nlapiLookupField(rec_type,rec_id,'custrecord_pct_tool_status');
    nlapiLogExecution('DEBUG','PCT-Log','status:'+status);
    var tool_item = nlapiLookupField(rec_type,rec_id,'custrecord_pct_tool_item_no');
    nlapiLogExecution('DEBUG','PCT-Log','item;'+tool_item);
    nlapiSubmitField(rec_type,rec_id,'custrecord_pct_tool_status',1);
    var transaction = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
    transaction.setFieldValue('custrecord_trans_tool_item',tool_item);
    transaction.setFieldValue('custrecord_pct_trans_typ',2);
    transaction.setFieldValue('custrecord_pct_trans_tool',rec_id);
    transaction.setFieldValue('custrecord_pct_is_processed','T');
    var tran_id = nlapiSubmitRecord(transaction);
    nlapiLogExecution('DEBUG','PCT-Log','id;'+tran_id);
    nlapiSubmitField(rec_type,rec_id,'custrecord_pct_latest_transaction',tran_id);
}