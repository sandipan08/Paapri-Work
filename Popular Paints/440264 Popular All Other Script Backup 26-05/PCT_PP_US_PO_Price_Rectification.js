/**
*              //////////     PCT PP Purchase Order Price Rectification    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2021-08-12 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for PCT PP Purchase Order Price Rectification, you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This User Event Script is for PCT PP Purchase Order Price Rectification (If Price is 12.65/- then Total will be 13/-, if Price is 12.45 then Total will be 12/- )
*/
define(['N/search', 'N/record'], function (search, record)
{
    var discountItem = 12597;
    var flag = 0;
    function afterSubmit(context)
    {
        log.debug({ title: "PCT-PP", details: "In Purchase Order" });
        var newRec = context.newRecord;
        var poId = newRec.getValue({ fieldId: 'id' });
        log.debug({ title: "PCT-PP", details: "Purchase Invoice Id : " + poId });
        var poTotal = newRec.getValue({ fieldId: 'total' });
        var poRound = Math.round(poTotal);
        var priceDiff = parseFloat(poRound - poTotal);
        log.debug({ title: "PCT-PP", details: "Purchase Order Total  : " + poTotal + ", Price Diff : " + priceDiff });

        var poLoad = record.load({
            type: "vendorbill",
            id: poId,
            isDynamic: true
        });
        if (priceDiff)
        {
            var itemCount = poLoad.getLineCount({ sublistId: 'item' });
            log.debug({ title: "PCT-PP", details: "Total Item : " + itemCount });
            for (var itemIndex = 0; itemIndex < itemCount; itemIndex++)
            {
                poLoad.selectLine({ sublistId: "item", line: itemIndex });
                var itemId = poLoad.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                });
                // If Discount Item is already present then Price Adjust doing over there
                if (itemId == discountItem)
                {
                    poLoad.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: priceDiff
                    });
                    poLoad.commitLine({ sublistId: 'item' });
                    flag++;
                    break;
                }
            }
            // If Discount Item is not present add a Discount Item
            if (!flag)
            {

                poLoad.selectNewLine({ sublistId: 'item' });
                poLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: discountItem });
                poLoad.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: priceDiff });
                poLoad.commitLine({ sublistId: 'item' });
            }
            poLoad.save();
        }
    }


    return {

    
        afterSubmit: afterSubmit

    }
});