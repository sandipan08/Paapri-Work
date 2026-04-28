function After_Work_Order_Completion(type) {
    if (type == 'create' || type == 'edit') {
        var rec_type = nlapiGetRecordType();
        var rec_id = nlapiGetRecordId();
        var WO_Id = nlapiLookupField(rec_type, rec_id, 'createdfrom');
      var built_wo = nlapiLookupField('workorder',WO_Id,'built');
      nlapiLogExecution('DEBUG','Moumita-Log','wo_built:'+built_wo);
        var WO_Load = nlapiLoadRecord('workorder', WO_Id);
        var quantity_wo = WO_Load.getFieldValue('quantity');
      nlapiLogExecution('DEBUG','Moumita-Log','wo_quan:'+quantity_wo);
        if (quantity_wo==built_wo) {
            var line_count = WO_Load.getLineItemCount('item')
            nlapiLogExecution('DEBUG', 'Moumita-Log', 'line_count:' + line_count);
            for (i = 1; i <= line_count; i++) {
                var is_tool = WO_Load.getLineItemValue('item', 'custcol_pct_istool_wo', i);
                if (is_tool == 'T') {
                    var item_wo = WO_Load.getLineItemValue('item', 'item', i);
                    nlapiLogExecution('DEBUG', 'Moumita-Log', 'item:' + item_wo);
                    WO_Load.selectLineItem('item', i);
                    var subrecord = WO_Load.viewCurrentLineItemSubrecord('item', 'inventorydetail');
                    var tool_count = subrecord.getLineItemCount('inventoryassignment');
                    nlapiLogExecution('DEBUG', 'Moumita-Log', 'count:' + tool_count);
                    for (j = 1; j <= tool_count; j++) {
                        var tool_name = subrecord.getLineItemText('inventoryassignment', 'issueinventorynumber', j);
                        nlapiLogExecution('DEBUG', 'Moumita-Log', 'name:' + tool_name);
                        var searchresults = nlapiSearchRecord('customrecord_pct_tool', null, [
                            ['name', 'is', tool_name], 'AND', ['custrecord_pct_tool_status', 'anyof', '2'], 'AND', ['custrecord_pct_tool_item_no', 'anyof', item_wo]
                        ], [new nlobjSearchColumn('name').setSort('false'), new nlobjSearchColumn('custrecord_pct_tool_status'), new nlobjSearchColumn('internalid')])
                        for (var k = 0; searchresults != null && k < searchresults.length; k++) {
                            var serial_number_rec = searchresults[k];
                            var InternalId = serial_number_rec.getValue('internalid');
                            nlapiLogExecution('DEBUG', 'Moumita-Log', 'id:' + InternalId);
                            var Load_Tool = nlapiLoadRecord('customrecord_pct_tool', InternalId);
                          var tool_tran = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
                          tool_tran.setFieldValue('custrecord_pct_trans_typ',2);
                          tool_tran.setFieldValue('custrecord_trans_tool_item',item_wo);
                          tool_tran.setFieldValue('custrecord_pct_trans_tool',InternalId);
                          tool_tran.setFieldValue('custrecord_pct_wo_checked_out_to',WO_Id);
                          tool_tran.setFieldValue('custrecord_pct_is_processed','T');
                          var tran_id = nlapiSubmitRecord(tool_tran);
                          nlapiLogExecution('DEBUG','Moumita-Log','tran_id:'+tran_id);
                          var tool_life = Load_Tool.getFieldValue('custrecord_tool_life');
                          var deducted_tool_life = tool_life - quantity_wo;
                          Load_Tool.setFieldValue('custrecord_tool_life',deducted_tool_life);
                            Load_Tool.setFieldValue('custrecord_pct_tool_status', 1);
                          Load_Tool.setFieldValue('custrecord_pct_created_from',rec_id);
                          Load_Tool.setFieldValue('custrecord_pct_latest_transaction',tran_id);
                            nlapiSubmitRecord(Load_Tool);
                        }
                    }
                  nlapiSubmitField('workorder',WO_Id,'orderstatus','G');
                }
            }
        }
    }
}