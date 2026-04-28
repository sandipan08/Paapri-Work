/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/search'], function (log, record, search) {

    function getInputData() {
        return search.create({
            type: "customrecord_2663_entity_bank_details",
            filters:
                [
                    ["created", "on", "8/26/2025 11:59 pm"]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "custrecord_2663_entity_bank_type", label: "Type" }),
                    search.createColumn({ name: "custrecord_2663_entity_file_format", label: "Payment File Format" }),
                    search.createColumn({ name: "custrecord_9572_subsidiary", label: "Subsidiary" }),
                    search.createColumn({ name: "custrecord_2663_entity_payment_desc", label: "Bank Account Payment Description" })
                ]
        });


        // var searchResultCount = plannedstandardcostSearchObj.runPaged().count;
        // log.debug("plannedstandardcostSearchObj result count", searchResultCount);
        // plannedstandardcostSearchObj.run().each(function (result) {
        //     // .run().each has a limit of 4,000 results
        //     return true;
        // });


    }

    function map(context) {
        log.debug({ title: "PCT-Kelco", details: "In Map Function & Map Context : " + JSON.stringify(context) })
        var searchData = JSON.parse(context.value);
        log.debug("PCT-DELETED_ID", record.delete({
            type: 'customrecord_2663_entity_bank_details',
            id: searchData.id
        }))
    }



    return {
        getInputData: getInputData,
        map: map,

    }
});
