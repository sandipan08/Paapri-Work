/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define([
  "N/currentRecord",
  "N/record",
  "N/runtime",
  "N/search",
  "N/email",
  "N/runtime",
], function (currentRecord, record, runtime, search, email, runtime) {
  function fieldChangedAttribute(context){
	   
    var inbuidScheme = context.currentRecord;
    if (context.sublistId === "recmachcustrecord_pct_pp_fs_link" && context.fieldId === "custrecord_pct_pp_fs_product") 
	{
      log.debug({title: "PCT-PP", details: "Disable color & sku"});
     
      var product = inbuidScheme.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_fs_link",
        fieldId: "custrecord_pct_pp_fs_product"
       });
	   log.debug({ title: "PCT-PP", details: "product:" + product });
	   
	   if(product!=null && product!='')
	   {
		  inbuidScheme.setCurrentSublistValue({
			sublistId: "recmachcustrecord_pct_pp_fs_link",
			fieldId: "custrecord_pct_pp_fs_color",
			value: "",
			ignoreFieldChange: false
		  });
		  inbuidScheme.setCurrentSublistValue({
			sublistId: "recmachcustrecord_pct_pp_fs_link",
			fieldId: "custrecord_pct_pp_fs_size",
			value: "",
			ignoreFieldChange: false
		  });
		   alert("REMINDER ALERT: YOU CAN SELECT ANY ONE ATTRIBUTE ONLY"); 
	   }
      
      return true;
    } 
	else if (context.sublistId === "recmachcustrecord_pct_pp_fs_link" && context.fieldId === "custrecord_pct_pp_fs_color") 
	{
      log.debug({ title: "PCT-PP", details: "Disable pdt & sku" });
	  
	  var color = inbuidScheme.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_fs_link",
        fieldId: "custrecord_pct_pp_fs_color"
       });
      if(color!=null && color!='')
	  {
			inbuidScheme.setCurrentSublistValue({
			sublistId: "recmachcustrecord_pct_pp_fs_link",
			fieldId: "custrecord_pct_pp_fs_product",
			value: "",
			ignoreFieldChange: false
		  });
		  inbuidScheme.setCurrentSublistValue({
			sublistId: "recmachcustrecord_pct_pp_fs_link",
			fieldId: "custrecord_pct_pp_fs_size",
			value: "",
			ignoreFieldChange: false
		  });
		  alert("REMINDER ALERT: YOU CAN SELECT ANY ONE ATTRIBUTE ONLY");
	  }

      return true;
    } 
	else if (context.sublistId === "recmachcustrecord_pct_pp_fs_link" && context.fieldId === "custrecord_pct_pp_fs_size") 
	{
		log.debug({ title: "PCT-PP", details: "Disable pdt & clr" });
		
        var sku = inbuidScheme.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_fs_link",
        fieldId: "custrecord_pct_pp_fs_size"
       });
	   
	    if(sku!=null && sku!='')
		{
			inbuidScheme.setCurrentSublistValue({
			  sublistId: "recmachcustrecord_pct_pp_fs_link",
			  fieldId: "custrecord_pct_pp_fs_color",
			  value: "",
			  ignoreFieldChange: false
			});
			inbuidScheme.setCurrentSublistValue({
			  sublistId: "recmachcustrecord_pct_pp_fs_link",
			  fieldId: "custrecord_pct_pp_fs_product",
			  value: "",
			  ignoreFieldChange: false
			});
			alert("REMINDER ALERT: YOU CAN SELECT ANY ONE ATTRIBUTE ONLY");
		}
		  
		return true;
		
    }
    return true;
  }

  return{
    fieldChanged:  fieldChangedAttribute
  };
});
