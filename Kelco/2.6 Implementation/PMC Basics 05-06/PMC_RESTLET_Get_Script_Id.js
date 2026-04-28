/**************************************************************************************

Script Name: PMC Get Script Id
Developer: Amalendu Dolui
Development Head: Ms. Ratwika Mondal
Company Name: PBTI
Purpose: To Get The Restlet id

© Copyright All Right

****************************************************************************************/

function PMC_Get_Script_Id(datain)
{

var Script_Name = datain.scname;
nlapiLogExecution('DEBUG','PCT-log','Script_Name= '+Script_Name);


var search = nlapiSearchRecord("restlet",null,
[
["scripttype","anyof","RESTLET","SCRIPTLET"],
"AND",
["name","is",Script_Name]
],
[
new nlobjSearchColumn("name").setSort(false),
new nlobjSearchColumn("scriptid"),
new nlobjSearchColumn("scripttype"),
new nlobjSearchColumn("owner"),
new nlobjSearchColumn("isinactive")
]
);

if (search == null)
{
search_length = 0;
nlapiLogExecution('DEBUG','PCT-Log','Search Length='+search_length);
}
else
{
search_length = parseInt(search.length);
nlapiLogExecution('DEBUG','PCT-Log','Search Length = '+search_length);
}


// var script_data = new Array();
var script_id = search[0].getId();
return script_id;
}