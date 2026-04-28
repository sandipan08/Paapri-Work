/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/record','N/search'], function(record,search) {


    function pageinit(context)
    {
        log.debug({
            title: 'PCT-LOG',
            details: 'Context = '+JSON.stringify(context)
        })
    }
      
    function validateLine(context) {
        var currentRecord = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        log.debug({
            title: 'PCT-LOG',
            details: 'Context = '+JSON.stringify(context)
        })


        if(sublistId === 'recmachcustrecord_pct_pct_recycle_link')
        {
            var item = currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                fieldId: 'custrecord_pct_inputs_item'
            })
            log.debug({
                title: 'PCT-LOG',
                details: 'Item = '+item
            })

            var lotNo = currentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                fieldId: 'custrecord_pct_inputs_lot_number'
            })

            log.debug({
                title: 'PCT-LOG',
                details: 'Lot No = '+lotNo
            })

            var onHandQty = getLotQuantity(item,lotNo);
            log.debug({
                title: 'PCT-LOG',
                details: 'ON Hand Quantity = '+onHandQty['onHand']
            })

            if(onHandQty['onHand'] == 0)
            {
                alert('Please Select a Different Lot')
                return false;
            }
            else
            {

                var itemQty = currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_pct_recycle_link',
                    fieldId: 'custrecord_pct_inputs_quantity'
                })
    
                log.debug({
                    title: 'PCT-LOG',
                    details: 'Item Qty = '+itemQty
                })

                if(itemQty > onHandQty['onHand'])
                {
                    alert('You have only '+onHandQty['onHand']+' qty available.')
                    return false;
                }
                else
                {
                    return true;
                }

                
            }
        }
        return true;
    }

    function getLotQuantity(item,lot)
    {
        var inventorynumberSearchObj = search.create({
            type: "inventorynumber",
            filters:
            [
               ["item","anyof",item], 
               "AND", 
               ["internalidnumber","equalto",lot]
            ],
            columns:
            [
               search.createColumn({name: "location", label: "Location"}),
               search.createColumn({name: "quantityonhand", label: "On Hand"}),
               search.createColumn({name: "quantityavailable", label: "Available"})
            ]
         });

         var res = {};
         var searchResultCount = inventorynumberSearchObj.runPaged().count;
         log.debug("inventorynumberSearchObj result count",searchResultCount);
         inventorynumberSearchObj.run().each(function(result){
            // .run().each has a limit of 4,000 results
            res['onHand'] = result.getValue({name: "quantityavailable"});
            return true;
         });
         return res;
    }

    return {
        pageInit:pageinit,
        validateLine: validateLine,
    }
});
