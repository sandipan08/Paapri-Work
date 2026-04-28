function create_serialized_tool(type)
{
if(type == 'create')
{
//var rec_id = nlapiGetRecordId();
//var rec_type = nlapiGetRecordType();
var location_id='';

//var load_rec = nlapiLoadRecord(rec_type,rec_id);

var tool_name = nlapiGetFieldValue('name');
nlapiLogExecution('DEBUG','PCT-Log',tool_name);

var tool_item = nlapiGetFieldValue('custrecord_pct_tool_item_no');
nlapiLogExecution('DEBUG','PCT-Log',tool_item);

var tool_life = nlapiGetFieldValue('custrecord_tool_life');
nlapiLogExecution('DEBUG','PCT-Log',tool_life);

var tool_loc = nlapiGetFieldValue('custrecord_pct_mott_tool_location');
nlapiLogExecution('DEBUG','PCT-Log',tool_loc);

if(tool_loc != null)
{
location_id = find_Location_by_Bin(tool_loc)
nlapiLogExecution('DEBUG','PCT-Log','Location Id: '+location_id);
}

var quantity = 1;
var rate = 0.00;

if(tool_name != '' && tool_loc != '' && location_id != '' && tool_name != '')
{
var inv_adj_id = create_IA(tool_item,location_id,tool_loc,quantity,rate,tool_name)
nlapiLogExecution('DEBUG','PCT-Log','inv_adj_id: '+inv_adj_id);

//*************************** saved search to get serialized tool internal id***********************************

var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
[
["inventorynumber","is",tool_name],
"AND",
["item.internalid","anyof",tool_item]
],
[
new nlobjSearchColumn("inventorynumber").setSort(false),
new nlobjSearchColumn("internalid")
]
);
if(inventorynumberSearch != null)
{
var inventorynumberSearch_length = inventorynumberSearch.length;
nlapiLogExecution('DEBUG','PCT-log','inventorynumberSearch_length = '+inventorynumberSearch_length);

var serialized_tool_internal_id = inventorynumberSearch[0].getValue("internalid");
nlapiLogExecution('DEBUG','PCT-log','serialized_tool_internal_id = '+serialized_tool_internal_id);
}
nlapiSetFieldValue('custrecord_pct_mott_related_transactions', inv_adj_id);
nlapiSetFieldValue('custrecord_tool_srl_no', serialized_tool_internal_id);
/*var create_tt = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
create_tt.setFieldValue('custrecord_pct_trans_typ',4);
create_tt.setFieldValue('custrecord_trans_tool_item',tool_item);
create_tt.setFieldValue('custrecord_pct_trans_tool',rec_id);
//create_tt.setFieldValue();
create_tt.setFieldValue('custrecord_pct_mott_acquisition_transac',inv_adj_id);
var tt_id = nlapiSubmitRecord(create_tt);*/
//load_rec.setFieldValue('custrecord_pct_created_from',inv_adj_id);
nlapiSetFieldValue('custrecord_pct_created_from',inv_adj_id);
//nlapiSubmitRecord(load_rec);
}
}
}
function create_IA(item,location,bin,qty,rate,serialno)
{
var create_inv_adj = nlapiCreateRecord('inventoryadjustment');

create_inv_adj.setFieldValue('subsidiary',3);
create_inv_adj.setFieldValue('account',54);
create_inv_adj.setFieldValue('memo','Created for New Tool Creation');
//create_inv_adj.setFieldValue('');
create_inv_adj.setFieldValue('adjlocation',location);
create_inv_adj.setFieldValue('custbody_mott_inv_adj_reason',18);

create_inv_adj.selectNewLineItem('inventory');
create_inv_adj.setCurrentLineItemValue('inventory','item',item);
create_inv_adj.setCurrentLineItemValue('inventory','location',location);
create_inv_adj.setCurrentLineItemValue('inventory','unitcost',rate);
create_inv_adj.setCurrentLineItemValue('inventory','adjustqtyby',qty);

var inv_detail = create_inv_adj.createCurrentLineItemSubrecord('inventory','inventorydetail');
inv_detail.selectNewLineItem('inventoryassignment');
inv_detail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',serialno);
inv_detail.setCurrentLineItemValue('inventoryassignment','binnumber',bin);
inv_detail.setCurrentLineItemValue('inventoryassignment','quantity',qty);
inv_detail.commitLineItem('inventoryassignment');
inv_detail.commit();

create_inv_adj.commitLineItem('inventory');

var record_id = nlapiSubmitRecord(create_inv_adj);
return record_id;
}
function find_Location_by_Bin(bin)
{
var loc='';
var binSearch = nlapiSearchRecord("bin",null,
[
["internalid","anyof",bin]
],
[
new nlobjSearchColumn("binnumber").setSort(false),
new nlobjSearchColumn("location")
]
);
if(binSearch != null)
{
loc = binSearch[0].getValue('location');

nlapiLogExecution('DEBUG','PCT-Log','Function-Location: '+loc);
return loc;
}
/*if(loc != null)
{
var locationSearch = nlapiSearchRecord("location",null,
[
["name","is",loc]
],
[
new nlobjSearchColumn("internalid").setSort(false),
new nlobjSearchColumn("name")
]
);
if(locationSearch != null)
{
var loc_id = locationSearch[0].getValue('internalid');
nlapiLogExecution('DEBUG','PCT-Log','Function-Location Id: '+loc_id);
return loc_id;
}
}*/
}

function create_tool_transaction(type)
{
if(type == 'create')
{
var rec_id = nlapiGetRecordId();
var rec_type = nlapiGetRecordType();
var load_rec = nlapiLoadRecord(rec_type,rec_id);

var tool_item = load_rec.getFieldValue('custrecord_pct_tool_item_no');
nlapiLogExecution('DEBUG','PCT-Log',tool_item);

var inv_adj_id = load_rec.getFieldValue('custrecord_pct_created_from');
nlapiLogExecution('DEBUG','PCT-Log',inv_adj_id);

var create_tt = nlapiCreateRecord('customrecord_pct_rec_tool_transaction');
create_tt.setFieldValue('custrecord_pct_trans_typ',4);
create_tt.setFieldValue('custrecord_trans_tool_item',tool_item);
create_tt.setFieldValue('custrecord_pct_trans_tool',rec_id);
//create_tt.setFieldValue();
create_tt.setFieldValue('custrecord_pct_mott_acquisition_transac',inv_adj_id);
var tt_id = nlapiSubmitRecord(create_tt);
nlapiLogExecution('DEBUG','PCT-Log',tt_id);
load_rec.setFieldValue('custrecord_pct_latest_transaction',tt_id);
  
nlapiSubmitRecord(load_rec);
}
}