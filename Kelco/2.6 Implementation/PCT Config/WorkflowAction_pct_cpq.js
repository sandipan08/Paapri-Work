function cpq(id,type,form)
{
		var rec_id = nlapiGetRecordId();
		var total_sp = 0;
		var load_pct_config = nlapiLoadRecord('customrecord_pct_configure',rec_id);
		var name = load_pct_config.getFieldValue('name');
		var linked_quote_no = load_pct_config.getFieldValue('custrecord_pct_linked_quote_no');
		var customer = load_pct_config.getFieldValue('custrecord_pct_customer');
		var qty = load_pct_config.getFieldValue('custrecord_pct_order_qty');
		var final_price= load_pct_config.getFieldValue('custrecord_pct_cpq_final_selling_price');
		nlapiLogExecution('DEBUG','PCT-Log','final_price:'+final_price);
		var Order_qty=nlapiGetFieldValue('custrecord_pct_order_qty');
		var Location=nlapiGetFieldValue('custrecord_pct_cpq_location');
		var Subsidiary=nlapiGetFieldValue('custrecord_pct_cpq_subsidiary');
  		var purchase_price= load_pct_config.getFieldValue('custrecord_pct_cpq_mat_total_matril_cost');
		nlapiLogExecution('DEBUG','PCT-Log','purchase_price:'+purchase_price);
		
		var Process_step= new Array();
		var Process_time_in_min= new Array();
		var total_run_rate= new Array();
		var Manufacturing_cost= new Array();
		var Manufac_work_center= new Array();
		var Line_seq= new Array();
		
		var line_count1 = load_pct_config.getLineItemCount('recmachcustrecord_pct_cpq_linkpctconfprocesteps');
       nlapiLogExecution('DEBUG','PCT-Log','line_count1:'+line_count1);
			for(var i = 1; i <= line_count1; i++)
			{
				Process_step[i-1] = load_pct_config.getLineItemText('recmachcustrecord_pct_cpq_linkpctconfprocesteps','custrecord_pct_cpq_processes',i);
				nlapiLogExecution('DEBUG','PCT-Log','Process_step[i-1]:'+Process_step[i-1]);
				Manufacturing_cost[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_cpq_linkpctconfprocesteps','custrecord_pct_cpq_prost_cost_temp',i);
				nlapiLogExecution('DEBUG','PCT-Log','Manufacturing_cost[i-1]:'+Manufacturing_cost[i-1]);
				Manufac_work_center[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_cpq_linkpctconfprocesteps','custrecord_pct_cpq_prost_work_center',i);
				nlapiLogExecution('DEBUG','PCT-Log','Manufac_work_center[i-1]:'+Manufac_work_center[i-1]);
				Line_seq[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_cpq_linkpctconfprocesteps','custrecord_pct_cpq_s_no',i);
				nlapiLogExecution('DEBUG','PCT-Log','Line_seq[i-1]:'+Line_seq[i-1]);
              
              Process_time_in_min[i-1] = parseFloat(load_pct_config.getLineItemValue('recmachcustrecord_pct_cpq_linkpctconfprocesteps','custrecord_pct_cpq_total_time_in_min',i));
				nlapiLogExecution('DEBUG','Rakhi-Log','Process_time_in_min[i-1]:'+Process_time_in_min[i-1]);
              
              
				//Process_time_in_min[i-1] = parseFloat(load_pct_config.getLineItemValue('recmachcustrecord_pct_cpq_linkpctconfprocesteps','	custrecord_pct_cpq_total_time_in_min',i));
				//nlapiLogExecution('DEBUG','PCT-Log','Process_time_in_min[i-1]:'+Process_time_in_min[i-1]);
				total_run_rate[i-1] = parseFloat(Process_time_in_min[i-1]);
				nlapiLogExecution('DEBUG','PCT-Log','total_run_rate[i-1]:'+total_run_rate[i-1]);
				
			}
			
		
		if(linked_quote_no == null)
		{
			var line_item = new Array();
			var line_qty = new Array();
			var line_process = new Array();
			var line_unit_cost = new Array();
          	var line_unit_sale_price = new Array();
			var line_sellingprice = new Array();

			var line_count = load_pct_config.getLineItemCount('recmachcustrecord_pct_link_to_pct_config');
          	nlapiLogExecution('DEBUG','PCT-Log','line_count(item):'+line_count);

			for(var i = 1; i <= line_count; i++)
			{
				line_item[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_link_to_pct_config','custrecord_pct_items',i);
				line_qty[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_link_to_pct_config','custrecord_pct_qty',i);
				line_process[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_link_to_pct_config','custrecord_pct_process',i);
				line_unit_cost[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_link_to_pct_config','custrecord_pct_unit_cost',i);
                line_unit_sale_price[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_link_to_pct_config','custrecord_pct_unit_cost',i);
				line_sellingprice[i-1] = load_pct_config.getLineItemValue('recmachcustrecord_pct_link_to_pct_config','custrecord_pct_cpq_amount',i);
				total_sp += parseFloat(line_unit_sale_price[i-1]);

				nlapiLogExecution('DEBUG','PCT-log','For Line Number='+i+' Item:'+line_item[i-1]+', Quantity:'+line_qty[i-1]+', Process:'+line_process[i-1]+', Unit Price:'+line_unit_cost[i-1]+', Unit Sale Price:'+line_unit_sale_price[i-1]+', Sales Price:'+line_sellingprice[i-1]);
			}
			nlapiLogExecution('DEBUG','PCT-Log','Total Selling Price:'+total_sp);
			var pct_config_id = nlapiSubmitRecord(load_pct_config);

			var bom_name = name+'-BOM';
			var bom = nlapiCreateRecord('bom');
			bom.setFieldValue('name',bom_name);
			bom.setFieldValue('availableforalllocations','T');
			bom.setFieldValue('availableforallassemblies','T');
			bom.setFieldValue('subsidiary',Subsidiary);
			var bom_id = nlapiSubmitRecord(bom);
			nlapiLogExecution('DEBUG','PCT-Log','bom_id='+bom_id);
			nlapiSubmitField('customrecord_pct_configure',pct_config_id,'custrecord_pct_cpq_linked_bom',bom_id);

			var rev_name = name+'-Rev';
			var revision = nlapiCreateRecord('bomrevision');
			revision.setFieldValue('name',rev_name);
			revision.setFieldValue('billofmaterials',bom_id);
			for(var i = 1; i <= line_count; i++)
			{
				revision.setLineItemValue('component','item',i,line_item[i-1]);
				revision.setLineItemValue('component','bomquantity',i,line_qty[i-1]);
				revision.setLineItemValue('component','itemsource',i,'STOCK');
			}
			var rev_id = nlapiSubmitRecord(revision);
			nlapiLogExecution('DEBUG','PCT-Log','Revision_id='+rev_id);
			nlapiSubmitField('customrecord_pct_configure',pct_config_id,'custrecord_pct_cpq_linked_revision',rev_id);
			
			var Routing_name = name+'-Routing';
			var Routing= nlapiCreateRecord('manufacturingrouting');
				Routing.setFieldValue('subsidiary',Subsidiary);
				Routing.setFieldValue('billofmaterials',bom_id);
			    Routing.setFieldValue('location',Location);
				
				Routing.setFieldValue('name',Routing_name);
				Routing.setFieldValue('isdefault','T');
				for (k=1; k<=line_count1;k++)
				{
				Routing.setLineItemValue('routingstep','operationsequence',k,Line_seq[k-1]);
				Routing.setLineItemValue('routingstep','operationname',k,Process_step[k-1]);
				Routing.setLineItemValue('routingstep','manufacturingworkcenter',k,Manufac_work_center[k-1]);
				Routing.setLineItemValue('routingstep','manufacturingcosttemplate',k,Manufacturing_cost[k-1]);
				Routing.setLineItemValue('routingstep','setuptime',k,'0');
				Routing.setLineItemValue('routingstep','runrate',k,total_run_rate[k-1]);
				}
			var Routing_id = nlapiSubmitRecord(Routing);
			nlapiLogExecution('DEBUG', 'Atul-Log', 'Routing_id:' + Routing_id);
			var Routing_rec = nlapiLoadRecord('manufacturingrouting',Routing_id);
			var Routing_location= Routing_rec.getFieldValue('location');
			var Routing_load = nlapiSubmitRecord(Routing_rec);

			var assembly = nlapiCreateRecord('lotnumberedassemblyitem');
			//assembly.setFieldValue('customform','-220');
			assembly.setFieldValue('itemid',name);
			assembly.setFieldValue('subsidiary',Subsidiary);
			assembly.setFieldValue('taxschedule','1');
			assembly.setFieldValue('isspecialworkorderitem','T');
			//assembly.setFieldValue('costcategory','3');
			//assembly.setFieldValue('atpmethod','CUMULATIVE_ATP_WITH_LOOK_AHEAD');
			assembly.setLineItemValue('billofmaterials','billofmaterials',1,bom_id);
			assembly.setLineItemValue('billofmaterials','masterdefault',1,'T');
			assembly.setLineItemValue('price1','price_1_',1,final_price);
			assembly.setFieldValue('custitem16','1');
			
            /*
            for(var k=1; k<=location_count; k++)
			{
				assembly.locations.setLineItemValue('locations','iswip',k,'T');
				
			}*/
			
			var assembly_id = nlapiSubmitRecord(assembly);
			nlapiLogExecution('DEBUG','PCT-Log','Assembly_id='+assembly_id);
			nlapiSubmitField('customrecord_pct_configure',pct_config_id,'custrecord_pct_cpq_linked_itemno',assembly_id);
			
			var record = nlapiLoadRecord('lotnumberedassemblyitem', assembly_id);
			var location_count=record.getLineItemCount('locations');
			nlapiLogExecution('DEBUG', 'Atul-Log', 'location_count: ' + location_count);
			
			for(var k=1; k<=location_count; k++)
			{
				record.setLineItemValue('locations','iswip',k,'T');
                nlapiCommitLineItem('locations');
			}
			
			nlapiSubmitRecord(record);

			var quote = nlapiCreateRecord('estimate');
			quote.setFieldValue('entity',customer);
			quote.setFieldValue('location',Routing_location);
			quote.setFieldValue('subsidiary',Subsidiary);
			quote.setLineItemValue('item','item',1,assembly_id);
			quote.setLineItemValue('item','rate',1,final_price);
			quote.setLineItemValue('item','quantity',1,qty);
		//	quote.setLineItemValue('item','amount',1,total_sp);
			quote.setFieldValue('shipcarrier','nonups');
			//quote.setFieldValue('shipmethod','2');
			quote.setFieldValue('shippingcost','0.00');
			quote.setFieldValue('custbody_pct_config_number',rec_id);
			var quote_id = nlapiSubmitRecord(quote);
			nlapiLogExecution('DEBUG','PCT-Log','Quote ID='+quote_id);
			nlapiSubmitField('estimate',quote_id,'custbody_pct_quote_created_from',pct_config_id);
			nlapiSubmitField('customrecord_pct_configure',pct_config_id,'custrecord_pct_linked_quote_no',quote_id);

		}
}