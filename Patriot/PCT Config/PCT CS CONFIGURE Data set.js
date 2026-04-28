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

    function pageInit(context) {

    }

    function saveRecord(context) {

    }

    function validateField(context) {

    }

    function fieldChanged(context) {
        var CurrentRecord = context.currentRecord;
        var sublistId = context.sublistId;
        var sublistFieldName = context.fieldId;
        if (sublistId === 'recmachcustrecord_pct_cpq_linkpctconfprocesteps' && (sublistFieldName === 'custrecord_pct_cpq_setup_time') || (sublistFieldName === 'custrecord_pct_cpq_run_time') || (sublistFieldName === 'custrecord_pct_cpq_setup_cost') || (sublistFieldName === 'custrecord_pct_cpq_run_cost')) {
            //
            let setUpTime = chcekNull(CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_setup_time'
            }))
            let runUpTime = chcekNull(CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_run_time'
            }))

            let setUpCost = chcekNull(CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_setup_cost'
            }))
            let runCost = chcekNull(CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_run_cost'
            }))

            let totalProcessCost = (setUpTime * setUpCost) + (runUpTime * runCost)
            CurrentRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
                fieldId: 'custrecord_pct_cpq_process_cost',
                value: totalProcessCost
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

    function postSourcing(context) {
        var CurrentRecord = context.currentRecord;
        var sublistId = context.sublistId;
        var sublistFieldName = context.fieldId;
        if (sublistId === 'recmachcustrecord_pct_cpq_link_to_pct_config' && sublistFieldName === 'custrecord_pct_cpq_items') {
            let itemId = CurrentRecord.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_items'
            })
            CurrentRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                fieldId: 'custrecord_pct_cpq_consumption_unit',
                value: ''
            })
            if (parseInt(itemId) > 0) {
                let consumptionunitObj = search.lookupFields({
                    type: search.lookupFields({ type: 'item', id: itemId, columns: 'recordtype' })['recordtype'],
                    id: itemId,
                    columns: ['consumptionunit']
                })
                if (consumptionunitObj['consumptionunit'].length > 0) {
                    let consumptionunitId = consumptionunitObj['consumptionunit'][0].value
                    log.debug({
                        title: 'consumptionunit',
                        details: consumptionunitId
                    })
                    if (consumptionunitId > 0) {
                        CurrentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                            fieldId: 'custrecord_pct_cpq_consumption_unit',
                            value: consumptionunitId
                        })
                    }
                }else{
                    CurrentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
                        fieldId: 'custrecord_pct_cpq_consumption_unit',
                        value: ''
                    })  
                }
                //
            }

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
        }
        return true
    }

    function lineInit(context) {

    }

    function validateDelete(context) {

    }

    function validateInsert(context) {
        // var CurrentRecord = context.currentRecord;
        // var sublistId = context.sublistId;
        // var sublistFieldName = context.fieldId;
        // alert('hi')
        // if (sublistId === 'recmachcustrecord_pct_cpq_link_to_pct_config') {

        //     let oldItemName = CurrentRecord.getCurrentSublistValue({
        //         sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        //         fieldId: 'custrecord_pct_cpq_items'
        //     })
        //     let newItemName = CurrentRecord.getCurrentSublistValue({
        //         sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        //         fieldId: 'custrecord_pct_cpq_new_item'
        //     })

        //     if (oldItemName == 'CUSTOM' || oldItemName == 'CUSTOM LOT NUMBERED') {
        //         if (newItemName == null || newItemName == '') {
        //             alert('Please Enter New Item Name');
        //             return false
        //         }

        //     }
        //     // else {
        //     //     return true;
        //     // }
        // } 
        // alert('hi2')
        //     return true
    }

    function validateLine(context) {


    }

    function sublistChanged(context) {

    }

    return {
        // pageInit: pageInit,
        // saveRecord: saveRecord,
        // validateField: validateField,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
