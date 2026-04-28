/**
*              //////////     PCT PP Purchase Order Price Rectification    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2022-06-17 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for to Restrict Sales Order to Approve, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This User Event Script is for Restrict Sales Order to Approve, depends upon Customer's 60 DAYS Outstandings Checkbox
*/
define(['N/search', 'N/record', 'N/ui/serverWidget'], function (search, record, serverWidget)
{

    function beforeLoad(context)
    {
        log.debug({ title: "PCT-PP", details: "In Sales Order" });
        var newRec = context.newRecord;
        var soForm = context.form;
        log.debug("PCT-PP", "Form : " + soForm)
        var soId = newRec.getValue({ fieldId: 'id' });
        log.debug({ title: "PCT-PP", details: "Sales Invoice Id : " + soId });
        var customerId = newRec.getValue({ fieldId: 'entity' });
        var customerData = search.lookupFields({ type: "customer", id: customerId, columns: ["custentity_pct_pp_60_days_outstandings"] });
        var daysOutstanding = customerData.custentity_pct_pp_60_days_outstandings;
        log.debug({ title: "PCT-PP", details: "60 Days Outstanding : " + daysOutstanding });
        if (!daysOutstanding)
        {
            soForm.removeButton('approve');
        }

    }




    return {
        beforeLoad: beforeLoad,
    }
});
