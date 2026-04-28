function checkOutTools(request,response)
{   
    if (request.getMethod() == 'GET')
    {      
        
        var form = nlapiCreateForm('Check Out Tools');

        form.addSubmitButton('Submit');
        form.addResetButton('Reset');
        
        var work_order = form.addField('custpage_workorder','select','Work Order');
        var operation_seq = form.addField('custpage_operation_seq','integer','Operation Sequence');
       
        var workorderSearch = nlapiSearchRecord("workorder",null,
        [
           ["type","anyof","WorkOrd"], 
           "AND", 
           ["mainline","is","T"]
        ], 
        [
           new nlobjSearchColumn("internalid"), 
           new nlobjSearchColumn("tranid")
        ]
        );
      
      if(workorderSearch != null)
        {

          nlapiLogExecution('DEBUG','PCT-log','GET: Work Order length '+workorderSearch.length);

          for(var i=0; i<workorderSearch.length; i++)
          {
              work_order.addSelectOption(workorderSearch[i].getValue('internalid'),workorderSearch[i].getValue('tranid'));
          }
		}

        var sublist = form.addSubList('custpage_tool_list', 'list', 'Tool List');

       // sublist.addField('id','integer','Internal ID');
        sublist.addField('toolfamily','text','Tool Family');
        sublist.addField('name','text','Tool');
        response.writePage(form);

    }
    else
    {

        var selected_wo = request.getParameter('custpage_workorder');
        nlapiLogExecution('DEBUG','PCT-log','Work Order Selected: '+selected_wo);

        var selected_operseq = request.getParameter('custpage_operation_seq');
        nlapiLogExecution('DEBUG','PCT-log','Operation Sequence Selected: '+selected_operseq);

        var line_count = request.getLineItemCount('custpage_tool_list');
        nlapiLogExecution('DEBUG','PCT-log','Line Count: '+line_count); 

        var selected_tool_family = new Array();

        if(line_count>0)
        {
            var new_rec;
            for(var i=1; i<=line_count; i++)
            {
                var val = request.getLineItemValue('custpage_tool_list','custfield_selected',i);
                //nlapiLogExecution('DEBUG','PCT-log','Value: '+val); 
                if(val == 'T')
                {
                    var tool = request.getLineItemValue('custpage_tool_list','name',i);
                    nlapiLogExecution('DEBUG','PCT-log','Tool: '+tool);

                    var tool_family = request.getLineItemValue('custpage_tool_list','toolfamily',i);
                    nlapiLogExecution('DEBUG','PCT-log','Tool Family: '+tool_family);
					
					//var tool_location = request.getLineItemText('custpage_tool_list','location',i);
                   // nlapiLogExecution('DEBUG','PCT-log','tool_location: '+tool_location);

                    new_rec = CreateWO(tool,selected_wo);
                    nlapiLogExecution('DEBUG','PCT-log','Tool_new_rec: '+new_rec);
                }
            }
            if(new_rec != null && new_rec != '')
            {
                response.sendRedirect('EXTERNAL','https://tstdrv1804026.app.netsuite.com/app/common/custom/custrecordentrylist.nl?rectype=539',null,false);    
            }
        }

        var load_wo = nlapiLoadRecord('workorder',selected_wo);

        var wo_assmbly = load_wo.getFieldValue('assemblyitem');

        var customrecord_rec_tool_routingSearch = nlapiSearchRecord("customrecord_rec_tool_routing",null,
            [
               ["custrecord_tool_assm_used","anyof",wo_assmbly], 
               "AND", 
               ["custrecord_pct_mott_tool_routing_select","is","T"],
               "AND", 
               ["custrecord_used_in_step","is",selected_operseq]
            ], 
            [
               new nlobjSearchColumn("altname"), 
               new nlobjSearchColumn("custrecord_tool_item"),
               new nlobjSearchColumn("internalid","CUSTRECORD_TOOL_ITEM",null)
            ]
            );
        if(customrecord_rec_tool_routingSearch != null)
        {
            for(var i = 0; i < customrecord_rec_tool_routingSearch.length; i++)
            {
                selected_tool_family[i] = customrecord_rec_tool_routingSearch[i].getValue('internalid','CUSTRECORD_TOOL_ITEM');
            }
        }

//Form Part

        var form = nlapiCreateForm('Check Out Tools');

        form.addSubmitButton('Submit');
        form.addResetButton('Reset');

        var work_order = form.addField('custpage_workorder','select','Work Order');
        var operation_seq = form.addField('custpage_operation_seq','integer','Operation Sequence');
       
        var workorderSearch = nlapiSearchRecord("workorder",null,
        [
           ["type","anyof","WorkOrd"], 
           "AND", 
           ["mainline","is","T"]
        ], 
        [
           new nlobjSearchColumn("internalid"), 
           new nlobjSearchColumn("tranid")
        ]
        );

        for(var i=0; i<workorderSearch.length; i++)
        {
            work_order.addSelectOption(workorderSearch[i].getValue('internalid'),workorderSearch[i].getValue('tranid'));
        }

        form.setFieldValues({custpage_workorder:selected_wo});
        form.setFieldValues({custpage_operation_seq:selected_operseq});

        var sublist = form.addSubList('custpage_tool_list', 'list', 'Tool List');
        
        sublist.addField('toolfamily','text','Tool Family');
        sublist.addField('name','text','Tool');
		sublist.addField('location','text','Tool Location');
        sublist.addMarkAllButtons();
        sublist.addField('custfield_selected', 'checkbox', 'Selected');

        nlapiLogExecution('DEBUG','PCT-log','Selected Tool Family:'+selected_tool_family);
		
        if(selected_tool_family != null && selected_tool_family != '')
        {
            var searchResults = nlapiSearchRecord("customrecord_pct_tool",null,
                [
                   ["custrecord_pct_tool_status","anyof","1"],
                    "AND", 
                   ["custrecord_pct_tool_item_no","anyof",selected_tool_family]
                ], 
                [
                   new nlobjSearchColumn("itemid","CUSTRECORD_PCT_TOOL_ITEM_NO",null),
                   new nlobjSearchColumn("name").setSort(false),
				   new nlobjSearchColumn("custrecord_pct_mott_tool_location")
]
                
                );
             
            if(searchResults != null)
            {
               for(var i = 0; i<searchResults.length; i++)
                {
                    sublist.setLineItemValue('name',i+1,searchResults[i].getValue('name'));
                    sublist.setLineItemValue('toolfamily',i+1,searchResults[i].getValue('itemid','CUSTRECORD_PCT_TOOL_ITEM_NO'));
					sublist.setLineItemValue('location',i+1,searchResults[i].getText('custrecord_pct_mott_tool_location'));
                }
            }
        }    
        //sublist.setLineItemValues(searchResults);            
        response.writePage(form);
    }
}

function CreateWO(selected_tool_name,workorder_selected)
{
    var tool_family_id,tool_id;

    var searchResults = nlapiSearchRecord("customrecord_pct_tool",null,
        [
           
           ["name","is",selected_tool_name]
        ], 
        [
            new nlobjSearchColumn("internalid"), 
            new nlobjSearchColumn("internalid","CUSTRECORD_PCT_TOOL_ITEM_NO",null)
        ]
        );

    tool_family_id = searchResults[0].getValue('internalid','CUSTRECORD_PCT_TOOL_ITEM_NO');
    tool_id = searchResults[0].getValue('internalid');

    nlapiLogExecution('DEBUG','PCT-log',' '+tool_family_id+' '+tool_id);


    var tool_transaction = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
    tool_transaction.setFieldValue('custrecord_pct_trans_typ',1);
    tool_transaction.setFieldValue('custrecord_trans_tool_item',tool_family_id);
    tool_transaction.setFieldValue('custrecord_pct_trans_tool',tool_id);
    tool_transaction.setFieldValue('custrecord_pct_wo_checked_out_to',workorder_selected);
    tool_transaction.setFieldValue('custrecord_pct_is_processed','T');

    var rec_id = nlapiSubmitRecord(tool_transaction);
    if(rec_id != null)
    {
        nlapiSubmitField('customrecord_pct_tool',tool_id,'custrecord_pct_tool_status',2);
    }
    return rec_id;
}