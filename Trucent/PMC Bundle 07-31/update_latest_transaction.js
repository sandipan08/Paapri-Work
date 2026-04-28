function update_latest_tran(type)
{
    if(type == 'create')
    {
        var rec_type = nlapiGetRecordType();
        var rec_id = nlapiGetRecordId();
        var tran_type = nlapiLookupField(rec_type,rec_id,'custrecord_pct_trans_typ');
        nlapiLogExecution('DEBUG','PCT-Log','tran-type:'+tran_type);
        var tool = nlapiLookupField(rec_type,rec_id,'custrecord_pct_trans_tool');
        if(tran_type == '6' && tool!= '')
        {
            nlapiSubmitField('customrecord_pct_tool',tool,'custrecord_pct_latest_transaction',rec_id);
        }
    }
}