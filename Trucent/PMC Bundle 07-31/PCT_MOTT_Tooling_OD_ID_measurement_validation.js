function od_id_measurement_validation()
{

	var tool = nlapiGetFieldValue('custrecord_pct_mott_tool');
    nlapiLogExecution('DEBUG', 'TOOL-LOG', 'tool:' + tool);

    var id_measurement = nlapiGetFieldValue('custrecord_pct_mott_id_measurement');
	nlapiLogExecution('DEBUG', 'TOOL-LOG', 'ID Measurement:' + id_measurement);
	var od_measurement = nlapiGetFieldValue('custrecord_pct_mott_od_measurement');
	nlapiLogExecution('DEBUG', 'TOOL-LOG', 'OD Measurement:' + od_measurement);
	
	var od_uper_limit = nlapiLookupField('customrecord_pct_tool', tool,'custrecord_pct_tool_od_upper_limit');
    nlapiLogExecution('DEBUG','TOOL-LOG','OD Upper Limit:' + od_uper_limit);
    var od_lower_limit = nlapiLookupField('customrecord_pct_tool',tool,'custrecord_pct_tool_od_lower_limit');
    nlapiLogExecution('DEBUG','TOOL-LOG','OD Lower limit:'+od_lower_limit);
    var id_uper_limit = nlapiLookupField('customrecord_pct_tool', tool,'custrecord_pct_tool_id_upper_limit');
    nlapiLogExecution('DEBUG','TOOL-LOG','ID Upper Limit:' + id_uper_limit);
    var id_lower_limit = nlapiLookupField('customrecord_pct_tool',tool,'custrecord_pct_tool_id_lower_limit');
    nlapiLogExecution('DEBUG','TOOL-LOG','ID Lower_limit:'+id_lower_limit);


	if((id_measurement != '') && (od_measurement != ''))
	{
		if((od_uper_limit != '') && (od_lower_limit != '') && (id_uper_limit != '') && (id_lower_limit != ''))
		{	
			nlapiLogExecution('DEBUG','TOOL-LOG','In IF:');
			if((parseFloat(od_measurement) > parseFloat(od_uper_limit)) || (parseFloat(od_measurement) < parseFloat(od_lower_limit)) || (parseFloat(id_measurement) > parseFloat(id_uper_limit)) || (parseFloat(id_measurement) < parseFloat(id_lower_limit))) // ID/OD Popup when ID/OD mesurement is out of range
			{
				nlapiLogExecution('DEBUG','PCT-Log','In OD/ID log');
				alert("OD/ID Measurement is out of range!");
				return true;
			}
			else
			{
				return true;
			}
		}
		else
		{
			alert("Please Enter OD Upper/Lower Limits and ID Upper/Lower Limits");
			return false;	
		}	
	}
	else if((id_measurement == '') && (od_measurement != ''))
	{
		if((od_uper_limit != '') && (od_lower_limit != '') && (id_uper_limit == '') && (id_lower_limit == ''))
		{
			if((parseFloat(od_measurement) > parseFloat(od_uper_limit)) || (parseFloat(od_measurement) < parseFloat(od_lower_limit)))// OD Popup when OD mesurement is out of range
			{
				nlapiLogExecution('DEBUG','PCT-Log','In OD log');
				alert("OD Measurement should be between "+od_lower_limit+" and "+od_uper_limit);
				return true;
			}
		 	else
		 	{
				return true;
			}
		}
		else if((od_uper_limit != '') && (od_lower_limit != '') && (id_uper_limit != '') && (id_lower_limit != ''))
		{
			alert("Please Enter ID Measurement!");
			return false;
		}
		else if(od_uper_limit == '' && od_lower_limit == '')
		{
			alert("Please Enter OD Upper/Lower Limits");
			return false;	
		}
		else 
		{
			alert("Please Enter OD/ID Upper/Lower Limits");
			return false;	
		}	
	}
	else if(id_measurement != '' && od_measurement == '')
	{
		if(id_uper_limit != '' && id_lower_limit != '' && od_uper_limit == '' && od_lower_limit == '')
		{
			if((parseFloat(id_measurement) > parseFloat(id_uper_limit)) || (parseFloat(id_measurement) < parseFloat(id_lower_limit)))// ID Popup when ID mesurement is out of range
			{
				nlapiLogExecution('DEBUG','PCT-Log','In log');
				alert("ID Measurement should be between "+id_lower_limit+" and "+id_uper_limit);
				return true;
			}
		 	else
		 	{
				return true;
			}
		}
		else if(id_uper_limit != '' && id_lower_limit != '' && od_uper_limit != '' && od_lower_limit != '')
		{
			alert("Please Enter OD Measurement!");
			return false;
		}
		else if(id_uper_limit == '' && id_lower_limit == '')
		{
			alert("Please Enter ID Upper/Lower Limits");
			return false;	
		}	
		else
		{
			alert("Please Enter ID/OD Upper/Lower Limits");
			return false;	
		}
	}
	else
	{
		alert("Please Enter OD/ID Measurements!");
		return false;
	}
}