/**
 *              //////////     PCT Inventory Number Update MapReduce Script     //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  MapReduceScript
 *@NModuleScope SameAccount
 *@since        2023-03-17 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT Inventory Number Update to Update the Inventory Number , you can redistribute
                it and/or modify it under the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This MapReduceScript is used to PCT Inventory Number Update to Update the Inventory Number
 */

define(['N/log', 'N/record', 'N/runtime'], function (log, record, runtime) {

    function getInputData(context) {
        log.debug({ title: "PCT", details: "In Get Input Function" });
        let getParameter = runtime.getCurrentScript().getParameter({ name: 'custscript_pct_inv_update_dataobj' });
        return [{ 'data': getParameter }];
    }

    function map(context) {
        try {

            log.debug({ title: "PCT", details: "In Map Function & Map Context : " + context.value })
            let searchData = JSON.parse(context.value);
            log.debug({ title: "PCT", details: searchData.data });
            let finalData = JSON.parse(searchData.data)
            finalData.map((element) => {
                log.debug({ title: "PCT", details: element });
                log.debug({ title: "PCT", details: element.id });
                let invLoad = record.load({
                    type: record.Type.INVENTORY_NUMBER,
                    id: element.id,
                })
                // for (let objIndex = 0; objIndex < Object.keys(element).length; objIndex++) {
                //     log.debug({ title: "PCT", details: "Value: " + element[Object.keys(element)[objIndex]] + " ,Key :" + Object.keys(element)[objIndex] });
                //     invLoad.setValue({
                //         fieldId: `${Object.keys(element)[objIndex].trim()}`,
                //         value: element[Object.keys(element)[objIndex]]
                //     }).save()
                //     log.debug({
                //         title: "PCT", details: invLoad.getValue({
                //             fieldId: 'memo',
                //         })
                //     });
                // }


                Object.keys(element).map((value) => {
                    log.debug({ title: "PCT", details: element[value] + " " + value });
                    invLoad.setValue({
                        fieldId: value.trim(),
                        value: element[value]
                    }).save()
                })
                let invId = invLoad.save()
                log.debug({ title: "PCT", details: "Value Changes for Inventory Number : " + invId });

            })


            // JSON.parse(searchData.data).map((element) => {
            //     log.debug({ title: "PCT", details: element.memo });
            //     let invId = record.load({
            //         type: record.Type.INVENTORY_NUMBER,
            //         id: element.id,
            //     }).setValue({
            //         fieldId: 'memo',
            //         value: element.memo
            //     }).save();

            //     log.debug({ title: "PCT", details: "Value Changes for Inventory Number : " + invId });
            // })



        }
        catch (ex) {
            log.error({ title: 'PCT', details: "In Catch : " + ex });
        }
    }

    // function reduce(context) {
    //     log.debug({ title: "PCT", details: "In Reduce Function" });
    // }

    // function summarize(summary) {
    //     log.debug({
    //         title: "PCT",
    //         details: "In Summarize Function"
    //     })
    // }

    return {
        getInputData: getInputData,
        map: map,
        // reduce: reduce,
        // summarize: summarize
    }
});
