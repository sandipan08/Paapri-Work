/**
*              //////////     PCT QMS Bulk Qty Total in BOM Revision    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for PCT QMS Bulk Qty Total in BOM Revision, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This USer Event Script is for Bulk Qty Total in BOM Revision    
*/
define([], function ()
{



    function beforeSubmit(context)
    {
        var newRec = context.newRecord;
        log.debug({ title: "PCT-PP", details: "In Bulk Revision" });
        var internalId = newRec.getValue({
            fieldId: 'id'
        });
        log.debug({ title: "PCT-PP", details: "Bom Revision Internal Id : " + internalId });
        var componentCount = newRec.getLineCount({ sublistId: 'component' });
        log.debug({ title: "PCT-PP", details: "Total Component : " + componentCount });
        var bomQtyTotal = 0;
        for (componentIndex = 0; componentIndex < componentCount; componentIndex++)   
        {
            var itemName = newRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'item_display',
                line: componentIndex
            });
            var bomQty = newRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'quantity',
                line: componentIndex
            });
            log.debug({ title: "PCT-PP", details: "Item Name : " + itemName + "Bom Qty : " + bomQty });
            bomQtyTotal += bomQty;
        }
        log.debug({ title: "PCT-PP", details: "Total BOM Qty  : " + bomQtyTotal });
        newRec.setValue({
            fieldId: "custrecord_pct_pp_bulk_total",
            value: bomQtyTotal

        })

    }


    return {

        beforeSubmit: beforeSubmit,

    }
});
