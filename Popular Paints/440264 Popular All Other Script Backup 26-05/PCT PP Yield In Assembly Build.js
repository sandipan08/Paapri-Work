/**
*              //////////     Popular Paints Yield in assembly build    //////////
* 
*@author       Arghadeep Sarkar & Suman Das
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
define(['N/search'], function (search)
{



    function beforeSubmit(context) 
    {
        try
        {
            var newRec = context.newRecord;
            log.debug({ title: "PCT-PP", details: "In Assembly Build" });
            var internalId = newRec.getValue({
                fieldId: 'id'
            });
            log.debug({ title: "PCT-PP", details: "Assyb Internal Id : " + internalId });

            // ---------------------------- Get Standard Weight Per Liter from BOM Revision -------------------------------
            var bomRevisionId = newRec.getValue({ fieldId: 'billofmaterialsrevision' });
            var fieldLookUp = search.lookupFields({
                type: "bomrevision",
                id: bomRevisionId,
                columns: 'custrecord_pct_pp_standard_wt_per_liter'
            });

            var weightPerLiter = fieldLookUp.custrecord_pct_pp_standard_wt_per_liter
            log.debug({ title: "PCT-PP", details: "Standard Weight Per Liter : " + weightPerLiter });
            newRec.setValue({
                fieldId: "custbody_pct_pp_assyb_atd_wt_per_liter",
                value: weightPerLiter,
            })
            var test = newRec.getValue({
                fieldId: 'custbody_pct_pp_assyb_atd_wt_per_liter'
            });
            log.debug({ title: "PCT-PP", details: "---------------- Value  : " + test });


            var bulk =  newRec.getValue({
                fieldId: 'custbody_pct_pp_bulk_item_wo'
            });

            //
            // -------------------------------------

            var componentCount = newRec.getLineCount({ sublistId: 'component' });
            log.debug({ title: "PCT-PP", details: "Total Component : " + componentCount });
            var assybQtyTotal = 0;
            for (componentIndex = 0; componentIndex < componentCount; componentIndex++)   
            {
                var itemName = newRec.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'compitemname',
                    line: componentIndex
                });

                var item = newRec.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'item',
                    line: componentIndex
                });
                var assQty = newRec.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'quantity',
                    line: componentIndex
                });

                var units =  newRec.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'units',
                    line: componentIndex
                });

                if(bulk == true && units == 3)
                {
                    var wtPerKg = getWtPerKg(item);
                    if(wtPerKg == '' || wtPerKg == null)
                    {
                        wtPerKg = 0;
                    }
                    assybQtyTotal += (assQty * wtPerKg);
                }else{
                    assybQtyTotal += assQty;
                }

                log.debug({ title: "PCT-PP", details: "Item Name : " + itemName + "Assyb Qty : " + assQty });
               
            }
            log.debug({ title: "PCT-PP", details: "Total Assyb Qty  : " + assybQtyTotal });
            newRec.setValue({
                fieldId: "custbody_pct_pp_assyb_component_total",
                value: assybQtyTotal

            })
            var weightLitre = newRec.getValue({
                fieldId: 'custbody_pct_pp_assyb_actual_wt_per_l'
            })
            if (!weightLitre)
            {
                weightLitre = 1;
                log.debug({
                    title: "PCT-PP", details: "Weight/Litre set to 1  : " + weightLitre
                })
            }
            var Yield = assybQtyTotal / weightLitre;
            newRec.setValue({
                fieldId: 'custbody_pct_pp_assyb_dip',
                value: Yield
            })


            var isYield = newRec.getValue({
                fieldId: 'custbody_pct_pp_assyb_qty_update'
            });
            log.debug({ title: "PCT-PP", details: "Is Yield : " + isYield });

            if (isYield == true)
            {


                //var componentCount = newRec.getLineCount({ sublistId: 'component' });
                //log.debug({ title: "PCT-PP", details: "Total Component : " + componentCount });
                //var assybQtyTotal = 0;
                var assybQtyArray = new Array();
                for (componentIndex = 0; componentIndex < componentCount; componentIndex++)
                {

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
                    // assybQtyTotal += (weightPerLiter * assybQtyArray[componentIndex]);
                }
                //log.debug({ title: "PCT-PP", details: "Total Assyb Qty  : " + assybQtyTotal });
                var qty = newRec.getValue({
                    fieldId: "custbody_pct_pp_assyb_dip"
                    // value: assybQtyTotal
                })
                newRec.setValue({
                    fieldId: "quantity",
                    value: (qty * 1.1)
                })

                //fetch previous value and set over here
                for (quantityIndex = 0; quantityIndex < componentCount; quantityIndex++)
                {
                    var assybQty = newRec.setSublistValue({
                        sublistId: 'component',
                        fieldId: 'quantity',
                        line: quantityIndex,
                        value: assybQtyArray[quantityIndex]
                    });
                }


            }
        }
        catch (ex)
        {
            log.error({ title: 'PCT-PP-Error', details: "In Catch : " + ex });


        }
    }


    function getWtPerKg(itemId)
    {
        var itemSearchObj = search.create({
            type: "item",
            filters:
            [
               ["internalid","anyof",itemId]
            ],
            columns:
            [
               search.createColumn({name: "custitem_pct_pp_item_weight_in_kg", label: "Weight in KG"})
            ]
         });
         var wt;
         var searchResultCount = itemSearchObj.runPaged().count;
         log.debug("itemSearchObj result count",searchResultCount);
         itemSearchObj.run().each(function(result){
             wt = result.getValue('custitem_pct_pp_item_weight_in_kg')
            // .run().each has a limit of 4,000 results
            return true;
         });
         return wt;
         
         
    }
    function getWeightPerLtr(itemId)
    {
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
        for (var itemIndex = 0; itemIndex < itemCount; itemIndex++)
        {
            var weightPerLiter = itemSearchResult[itemIndex].getValue("custitem_pct_pp_conversion_in_kg");
        }
        return weightPerLiter;
    }



    return {
 
        beforeSubmit: beforeSubmit

    }
});
