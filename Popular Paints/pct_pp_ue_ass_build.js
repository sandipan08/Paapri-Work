/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search'], function (record, search) {




    function afterSubmit(context) {
        if (context.type != context.UserEventType.DELETE)
        {
        var id = context.newRecord.id;
        var currentRecord = record.load({
            type: 'assemblybuild',
            id: id,
            isDynamic: true,
        })
        var projectedVal = currentRecord.getValue({
            fieldId: 'total',
        });

        log.debug({
            title: 'projectedVal',
            details: projectedVal
        })

        var itemRev = currentRecord.getValue({
            fieldId: 'billofmaterialsrevision',
        });

        var overheadCostArr = overHeadCost(itemRev);
        var overheadCostObj = overheadCostArr[0];
        var overheadCostCount = overheadCostArr[1];








        var line = currentRecord.getLineCount({
            sublistId: 'component'
        });

        log.debug({
            title: 'overheadCostCount = ' + overheadCostCount,
            details: 'overheadCostObj = ' + overheadCostObj + ' total = ' + total + ' line ' + line + 'overheadCostObj.length =' + overheadCostObj.length
        })



        var overheadCostCount = 0;

        for (var index = 0; index < overheadCostObj.length; index++) {


            for (var compIndex = 0; compIndex < line; compIndex++) {
                var compItem = currentRecord.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'item',
                    line: compIndex
                });



                if (overheadCostObj[index].itemId == compItem) {
                    var compItemQty = currentRecord.getSublistValue({
                        sublistId: 'component',
                        fieldId: 'quantity',
                        line: compIndex
                    });
                    overheadCostCount = parseFloat(overheadCostCount) + parseFloat(compItemQty)

                    log.debug({
                        title: 'compItemQty compItemQty compItemQtycompItemQty',
                        details: 'compItemQty =' + compItemQty
                    })
                }

            }

        }



        var total = projectedVal - overheadCostCount;


        log.debug({
            title: 'total',
            details: total
        })
        //////////////////////////////////////////////////////////////////////////////
        for (var index = 0; index < overheadCostObj.length; index++) {


            for (var compIndex = 0; compIndex < line; compIndex++) {
                var compItem = currentRecord.getSublistValue({
                    sublistId: 'component',
                    fieldId: 'item',
                    line: compIndex
                });



                if (overheadCostObj[index].itemId == compItem) {
                    currentRecord.selectLine({
                        sublistId: 'component',
                        line: compIndex
                    })
                    log.debug({
                        title: 'overheadCostObj[index].per',
                        details: overheadCostObj[index].per
                    })
                    var qty = (total * overheadCostObj[index].per) / 100;


                    log.debug({
                        title: 'qty',
                        details: 'compIndex =' + compIndex + 'qty =' + qty + 'total =' + total + ' overheadCostObj[index].per =' + overheadCostObj[index].per
                    })
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'component',
                        fieldId: 'quantity',
                        value: qty
                    });

                   

                    
                }


            }
        }
        currentRecord.save();
    }
    }


    function overHeadCost(itemRev) {
        //https://7255402.app.netsuite.com/app/common/search/search.nl?cu=T&e=T&id=784
        //Bill of Materials Revision Search
        var assemblyitemSearchObj = search.create({
            type: "bomrevision",
            filters:
            [
               ["internalid","anyof",itemRev], 
               "AND", 
               ["component.custrecord_pct_pp_percentage","greaterthan","0"]
            ],
            columns:
            [
               search.createColumn({
                  name: "item",
                  join: "component",
                  label: "Item"
               }),
               search.createColumn({
                  name: "custrecord_pct_pp_percentage",
                  join: "component",
                  label: "Percentage"
               })
            ]
         });
        var dataArr = new Array();
        var searchResultCount = assemblyitemSearchObj.runPaged().count;
        log.debug("assemblyitemSearchObj result count", searchResultCount);
        assemblyitemSearchObj.run().each(function (result) {
            var dataObj = new Object();
            var per = result.getValue({
                name: "custrecord_pct_pp_percentage",
                join: "component",
                label: "Percentage"
             })

            var itemId = result.getValue({
                name: "item",
                join: "component",
                label: "Item"
             })

            dataObj.itemId = itemId;
            dataObj.per = parseFloat(per);

            dataArr.push(dataObj)
            // .run().each has a limit of 4,000 results
            return true;
        });

        log.debug({
            title: 'dataArr',
            details: JSON.stringify(dataArr)
        })
        return [dataArr, searchResultCount];
    }
    return {

        afterSubmit: afterSubmit
    }
});
