function after_tool_dimension(type) 
{
  if (type == 'create') 
  {
    var new_tool_life = 0;
    var rec_type = nlapiGetRecordType();
    var rec_id = nlapiGetRecordId();
    var tool = nlapiLookupField(rec_type, rec_id, 'custrecord_pct_mott_tool');
    nlapiLogExecution('DEBUG', 'TOOL-LOG', 'tool:' + tool);
	var tool_loc = nlapiLookupField(rec_type, rec_id, 'custrecord_pct_mott_dmsn_tool_location');
    nlapiLogExecution('DEBUG', 'rakhi-LOG', 'tool_loc:' + tool_loc);
	
    var od_measurement = nlapiLookupField(rec_type, rec_id, 'custrecord_pct_mott_od_measurement');
    // nlapiLogExecution('DEBUG', 'TOOL-LOG', 'OD:' + od_measurement);
    var id_measurement = nlapiLookupField(rec_type,rec_id,'custrecord_pct_mott_id_measurement');
    //nlapiLogExecution('DEBUG','TOOL-LOG','ID:'+id_measurement);
    
    //Check in transaction creation
    check_in(tool);

// Tool Location set

   var rec_tool = nlapiLoadRecord('customrecord_pct_tool',tool);
		nlapiLogExecution('DEBUG','Rakhi-Log','rec_tool='+rec_tool);
    
    if(tool_loc != null && tool_loc != '')
	{		
		rec_tool.setFieldValue('custrecord_pct_mott_tool_location',tool_loc);
    }
		//nlapiLogExecution('DEBUG','Atul-Log','seq_op:'+seq_op);
        nlapiSubmitRecord(rec_tool);



    if (tool != '' && tool != null) 
    {
        var od_uper_limit = nlapiLookupField('customrecord_pct_tool', tool,'custrecord_pct_tool_od_upper_limit');
        nlapiLogExecution('DEBUG','TOOL-LOG','OD Upper Limit:' + od_uper_limit);
        var od_lower_limit = nlapiLookupField('customrecord_pct_tool',tool,'custrecord_pct_tool_od_lower_limit');
        nlapiLogExecution('DEBUG','TOOL-LOG','OD Lower limit:'+od_lower_limit);
        var id_uper_limit = nlapiLookupField('customrecord_pct_tool', tool,'custrecord_pct_tool_id_upper_limit');
        nlapiLogExecution('DEBUG','TOOL-LOG','ID Upper Limit:' + od_uper_limit);
        var id_lower_limit = nlapiLookupField('customrecord_pct_tool',tool,'custrecord_pct_tool_id_lower_limit');
        nlapiLogExecution('DEBUG','TOOL-LOG','ID Lower_limit:'+od_lower_limit);
        var tool_life = nlapiLookupField('customrecord_pct_tool', tool, 'custrecord_tool_life');
        nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Tool Life:' + tool_life);

        if(od_uper_limit != '' && od_lower_limit != '' && id_uper_limit != '' && id_lower_limit != '')
        {
            if(od_measurement != '' && id_measurement != '' && tool_life != null)
            {
                var od_tool_life = calculate_toollife_od(od_measurement,od_uper_limit,od_lower_limit,tool_life);
                nlapiLogExecution('DEBUG', 'TOOL-LOG', 'OD Tool Life:' + od_tool_life);
                var id_tool_life = calculate_toollife_id(id_measurement,id_uper_limit,id_lower_limit,tool_life);
                nlapiLogExecution('DEBUG', 'TOOL-LOG', 'ID Tool Life:' + id_tool_life);

                if(od_tool_life < id_tool_life)
                {
                    if(od_tool_life >= 0)
                    {
                       nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life', od_tool_life);
                    }
                    else
                    {
                       nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life',0);
                    }
                }
                else
                {
                    if(id_tool_life >= 0)
                    {
                        nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life', id_tool_life);
                    }
                    else
                    {
                        nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life',0);
                    }
                }
            }
        }

        else if(od_uper_limit != '' && od_lower_limit != '')
        {
            if(od_measurement != '' && tool_life != '')
            {
                new_tool_life = calculate_toollife_od(od_measurement,od_uper_limit,od_lower_limit,tool_life);
                nlapiLogExecution('DEBUG', 'TOOL-LOG', 'New Tool Life:' + new_tool_life);

                if(new_tool_life >= 0)
                {
                    nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life', new_tool_life);
                }
                else
                {
                    nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life',0);
                }
            }
        }

        else if(id_uper_limit != '' && id_lower_limit != '')
        {
            if(id_measurement != '')
            {
                new_tool_life = calculate_toollife_id(id_measurement,id_uper_limit,id_lower_limit,tool_life);
                nlapiLogExecution('DEBUG', 'TOOL-LOG', 'New Tool Life:' + new_tool_life);

                if(new_tool_life >= 0)
                {
                    nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life', new_tool_life);
                }
                else
                {
                    nlapiSubmitField('customrecord_pct_tool', tool, 'custrecord_tool_life',0);
                }
            }
        }
    }  
  } 
}
  


function calculate_toollife_id(fn_id_measurement,fn_id_upper_limit,fn_id_lower_limit,fn_tool_life)
{

    var dimension_reduced = parseFloat(fn_id_measurement) - parseFloat(fn_id_lower_limit);
    nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Dimension Reduced:' + dimension_reduced);
    
    var diff_limit = parseFloat(fn_id_upper_limit) - parseFloat(fn_id_lower_limit);
    nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Limit Difference:' + diff_limit);

    if(diff_limit != 0)
    {
      var amount_decreased = fn_tool_life * (parseFloat(dimension_reduced) / parseFloat(diff_limit));
      nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Decreased Amount:' + amount_decreased);

      var reduced_tool_life = parseInt(fn_tool_life - amount_decreased);
      nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Reduced Tool Life:' + reduced_tool_life);
      
      return reduced_tool_life;
    }

}

function calculate_toollife_od(fn_od_measurement,fn_od_upper_limit,fn_od_lower_limit,fn_tool_life)
{

    var dimension_reduced = parseFloat(fn_od_upper_limit) - parseFloat(fn_od_measurement);
    nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Dimension Reduced:' + dimension_reduced);
    
    var diff_limit = parseFloat(fn_od_upper_limit) - parseFloat(fn_od_lower_limit);
    nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Limit Difference:' + diff_limit);

    if(diff_limit != 0)
    {
      var amount_decreased = fn_tool_life * (parseFloat(dimension_reduced) / parseFloat(diff_limit));
      nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Decreased Amount:' + amount_decreased);

      var reduced_tool_life = parseInt(fn_tool_life - amount_decreased);
      nlapiLogExecution('DEBUG', 'TOOL-LOG', 'Reduced Tool Life:' + reduced_tool_life);
      
      return reduced_tool_life;
    }

}

function check_in(f_tool)
{
	var load_tool = nlapiLoadRecord('customrecord_pct_tool',f_tool);
    var status = load_tool.getFieldValue('custrecord_pct_tool_status');
    nlapiLogExecution('DEBUG','PCT-Log','status:'+status);
    var tool_item = load_tool.getFieldValue('custrecord_pct_tool_item_no');
    nlapiLogExecution('DEBUG','PCT-Log','item;'+tool_item);
    load_tool.setFieldValue('custrecord_pct_tool_status',1);
    var transaction = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
    transaction.setFieldValue('custrecord_trans_tool_item',tool_item);
    transaction.setFieldValue('custrecord_pct_trans_typ',2);
    transaction.setFieldValue('custrecord_pct_trans_tool',f_tool);
    transaction.setFieldValue('custrecord_pct_is_processed','T');
    var tran_id = nlapiSubmitRecord(transaction);
    nlapiLogExecution('DEBUG','PCT-Log','id;'+tran_id);
    load_tool.setFieldValue('custrecord_pct_latest_transaction',tran_id);
  	nlapiSubmitRecord(load_tool);
}

