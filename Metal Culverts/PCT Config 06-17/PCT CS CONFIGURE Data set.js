/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@author       Rajesh Nandi
 *@since        2024-05-01 yyyy-MM-dd
 *@copyright    Paapri Cloud Technology
 *@license      This ClientScript script is for set new Item name based on item name 

*@description  This ClientScript is designed to update the item name based on certain conditions. If the item name is not custom or custom lot numbered, it will duplicate the item name into the new item name field. Otherwise, it will leave the field value blank. 
Process Cost calculate
 */
define(["N/record", "N/search", "N/ui/dialog", "N/currentRecord"], function (record, search, dialog, currentRecord
) {


    function fieldChanged(context) {
        var CurrentRecord = context.currentRecord;
        var sublistId = context.sublistId;
        var sublistFieldName = context.fieldId;
        if (sublistId === 'recmachcustrecord_pct_cpq_linkpctconfprocesteps' && (sublistFieldName === 'custrecord_pct_cpq_setup_time') || (sublistFieldName === 'custrecord_pct_cpq_run_time') || (sublistFieldName === 'custrecord_pct_cpq_setup_cost') || (sublistFieldName === 'custrecord_pct_cpq_run_cost')) {
            //
            // let setUpTime = chcekNull(CurrentRecord.getCurrentSublistValue({
            //     sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
            //     fieldId: 'custrecord_pct_cpq_setup_time'
            // }))
            let runUpTime = chcekNull(CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_run_time'
            }))

            // let setUpCost = chcekNull(CurrentRecord.getCurrentSublistValue({
            //     sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
            //     fieldId: 'custrecord_pct_cpq_setup_cost'
            // }))
            let runCost = chcekNull(CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_run_cost'
            }))

            // let totalProcessCost = (setUpTime * setUpCost) + (runUpTime * runCost)
            CurrentRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_process_cost',
                value: (runUpTime * runCost)
            })
        }
        return true
    }

    const chcekNull = (val) => {
        if (val == '' || val == null || isNaN(val) || val == undefined) {
            val = 0
        }
        return val
    }

    const getLocationAverageCost = (itemId, Location) => {
        let averageCost = 0;
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemId],
                    "AND",
                    ["inventorylocation", "anyof", Location]
                ],
            columns:
                [
                    search.createColumn({ name: "locationaveragecost", label: "Location Average Cost" }),
                    search.createColumn({ name: "inventorylocation", label: "Inventory Location" })
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count", searchResultCount);
        itemSearchObj.run().each(function (result) {
            averageCost = chcekNull(result.getValue("locationaveragecost"));
            return true;
        });
        return averageCost;
    }

    function postSourcing(context) {
        var CurrentRecord = context.currentRecord;
        var location = CurrentRecord.getValue('custrecord_pct_cpq_location')
        var sublistId = context.sublistId;
        var sublistFieldName = context.fieldId;
        if (sublistId === 'recmachcustrecord_pct_cpq_link_to_pct_config' && sublistFieldName === 'custrecord_pct_cpq_items') {
            let itemName = CurrentRecord.getCurrentSublistText({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_items'
            })
            if (itemName == 'CUSTOM' || itemName == 'CUSTOM LOT NUMBERED') {
                CurrentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_new_item',
                    value: ''
                })
            } else {
                CurrentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_new_item',
                    value: itemName
                })
            }
            if (location == '') {
                alert("Please Enter the Location first")
            
            }
            else {
                let itemId = CurrentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_items'
                })
                log.debug("PCT", "Item ID :" + itemId + ", Location : " + location)
                // log.debug("PCT", getLocationAverageCost(itemId, location))
                CurrentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                    fieldId: 'custrecord_pct_cpq_unit_cost',
                    value: getLocationAverageCost(itemId, location)
                })
                // CurrentRecord.setCurrentSublistValue({
                //     sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                //     fieldId: 'custrecord_pct_cpq_consumption_unit',
                //     value: ''
                // })
                // if (parseInt(itemId) > 0) {
                //     let consumptionunitObj = search.lookupFields({
                //         type: search.lookupFields({ type: 'item', id: itemId, columns: 'recordtype' })['recordtype'],
                //         id: itemId,
                //         columns: ['consumptionunit']
                //     })
                //     if (consumptionunitObj['consumptionunit'].length > 0) {
                //         let consumptionunitId = consumptionunitObj['consumptionunit'][0].value
                //         log.debug({
                //             title: 'consumptionunit',
                //             details: consumptionunitId
                //         })
                //         if (consumptionunitId > 0) {
                //             CurrentRecord.setCurrentSublistValue({
                //                 sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                //                 fieldId: 'custrecord_pct_cpq_consumption_unit',
                //                 value: consumptionunitId
                //             })
                //         }
                //     }else{
                //         CurrentRecord.setCurrentSublistValue({
                //             sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                //             fieldId: 'custrecord_pct_cpq_consumption_unit',
                //             value: ''
                //         })  
                //     }
                //     //
                // }


          
            }
        }

    }



    return {
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,

    }
});
