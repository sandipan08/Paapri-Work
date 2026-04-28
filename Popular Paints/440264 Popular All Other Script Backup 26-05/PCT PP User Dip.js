/**
*              //////////     Popular Paints dip in assembly build    //////////
* 
*@author       Arghadeep Sarkar
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for dip calculation in assembly build, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This USer Event Script is for dip calculation in assembly build
*/
define(['N/search'], function (search) {



    function beforeSubmit(context) {
        var newRec = context.newRecord;
        log.debug({ title: "PCT-PP", details: "In Assembly Build" });
        var internalId = newRec.getValue({
            fieldId: 'id'
        });
        log.debug({ title: "PCT-PP", details: "Assyb Internal Id : " + internalId });
        
        var isBulk = newRec.getValue({
            fieldId: 'custbody_pct_pp_bulk_item_wo'
        });
        log.debug({ title: "PCT-PP", details: "Is Bulk : " + isBulk });

        if(isBulk==true) {

        
        var componentCount = newRec.getLineCount({ sublistId: 'component' });
        log.debug({ title: "PCT-PP", details: "Total Component : " + componentCount });
        var assybQtyTotal = 0;
        var assybQtyArray = new Array();
        for (componentIndex = 0; componentIndex < componentCount; componentIndex++) {

            var itemId = newRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'item',
                line: componentIndex
            });
            assybQtyArray[componentIndex] = newRec.getSublistValue({
                sublistId: 'component',
                fieldId: 'quantity',
                line: componentIndex
            });
            var weightPerLiter = getWeightPerLtr(itemId)
            if (weightPerLiter == " ") { weightPerLiter = 1; }
            log.debug({ title: "PCT-PP", details: "Item Name : " + itemId + ", Assyb Qty : " + assybQtyArray[componentIndex] + ", Weight Per Liter : " + weightPerLiter });
            assybQtyTotal += (weightPerLiter * assybQtyArray[componentIndex]);
        }
        log.debug({ title: "PCT-PP", details: "Total Assyb Qty  : " + assybQtyTotal });
        newRec.setValue({
            fieldId: "custbody_pct_pp_assyb_dip",
            value: assybQtyTotal

        })
        newRec.setValue({
            fieldId: "quantity",
            value: assybQtyTotal/100
        })

        //fetch previous value and set over here
        for (quantityIndex = 0; quantityIndex < componentCount; quantityIndex++) {
            var assybQty = newRec.setSublistValue({
                sublistId: 'component',
                fieldId: 'quantity',
                line: quantityIndex,
                value: assybQtyArray[quantityIndex]
            });
        }


    }
}
    function getWeightPerLtr(itemId) {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalidnumber", "equalto", itemId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "custitem_pct_pp_conversion_in_kg", label: "Conversion in KG" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        log.debug("PCT-PP", "Item Count : " + itemCount);
        var itemSearchResult = itemSearchObj.run().getRange({ start: 0, end: itemCount });
        for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            var weightPerLiter = itemSearchResult[itemIndex].getValue("custitem_pct_pp_conversion_in_kg");
        }
        return weightPerLiter;
    }


    return {

        beforeSubmit: beforeSubmit,

    }
});
