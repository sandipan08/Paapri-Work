
// This UE script will create a Button and after button click Suitelet will get called from client script.
/**
*@NApiVersion  2.1
*@NScriptType  UserEventScript 
*@author       Rajesh Nandi
*@since        2022-03-31 yyyy-MM-dd
*@copyright    Paapri Cloud Technology
*@license      This UE sript will give a button "Print Manufacturing Traveler" on the Item Work Order form. To print Traveler Ticket.

*@description  This script will give a button on the item Work Order form.

*/
define(['N/record', 'N/search', 'N/file', 'N/ui/serverWidget'], function (record, search, file, serverWidget) {

    function beforeLoad(context) {

        log.debug({
            title: 'context',
            details: context.form.title
        })
      
       

        var Rec_id = context.newRecord.id;
        log.debug({ title: 'item_fulfillment', details: Rec_id });
        var objForm = context.form;

       

        if (context.type == context.UserEventType.VIEW) {
           // var form = context.form;
           objForm.clientScriptFileId = getFileId()//15208;
            objForm.addButton({
                id: 'custpage_suiteletbutton_traveler',
                label: 'Print Manufacturing Traveler',
                functionName: 'callClient(' + Rec_id + ')'
            });

        }
        

    }

function getFileId()
{
    var fileSearchObj = search.create({
        type: "file",
        filters:
        [
           ["name","is","pct_cs_traveler_ticket.js"]
        ],
        columns:
        [
           search.createColumn({name: "internalid", label: "Internal ID"}),
           search.createColumn({
              name: "name",
              sort: search.Sort.ASC,
              label: "Name"
           })
        ]
     });
     var id;
     var searchResultCount = fileSearchObj.runPaged().count;
     log.debug("fileSearchObj result count",searchResultCount);
     fileSearchObj.run().each(function(result){
         id = result.getValue('internalid')
        // .run().each has a limit of 4,000 results
        //return true;
     });
     return id;
}

    return {
        beforeLoad: beforeLoad
    }
});