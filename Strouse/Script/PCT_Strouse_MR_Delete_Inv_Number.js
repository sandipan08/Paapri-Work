/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/format'], function (record, search, format) {
    let lotNumberArray = [];
    function getInputData() {


        var invoiceRecord = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: 1621,
            toType: record.Type.INVOICE,
            isDynamic: true
        });

        // You can modify the invoice if needed
        invoiceRecord.setValue({
            fieldId: 'memo',
            value: 'Invoice created from Sales Order via script'
        });

        // Save the invoice
        var invoiceId = invoiceRecord.save();
        log.debug('Invoice Created', 'Invoice ID: ' + invoiceId);

        return {
            'type': invoiceRecord}
        }

        //     return search.create({
        //         type: "inventorynumber",
        //         filters:
        //             [
        //                 ["item", "anyof", "262"],
        //                 "AND",
        //                 ["internalid", "anyof", "15473", "19678", "14397", "10600", "11175", "15438", "9069", "11664", "11801", "14063", "14290", "10609", "11187", "15399", "14400", "11818", "12512", "15487", "15488", "14706", "15245", "11800", "15440", "12108", "15267", "13756", "14098", "15336", "13647", "9885", "9886", "10298", "10299", "12520", "12655", "11943", "10300", "11570", "15480", "15481", "12629", "12630", "12631", "12632", "13079", "13989", "15490", "15492", "15493", "15578", "19615", "21034", "11088", "11866", "11635", "11852", "11849", "14707", "11595", "12974", "12979", "15050", "15051", "15822", "19426", "19298", "15145", "15419", "10985", "11549", "13072", "13029", "14228", "15656", "15655", "16635", "17430", "17279", "17364", "17365", "17431", "17953", "21043", "21175", "11846", "15457", "15469", "15468", "15465", "16748", "16749", "15816", "15817", "15818", "16086", "16087", "16143", "17616", "17617", "17618", "17623", "17624", "15979", "15980", "13028", "17554", "17552", "17555", "17553", "16809", "17557", "17559", "17560", "16810", "17463", "17464", "17465", "17621", "17622", "21207", "12451", "12452", "11110", "9070", "11753", "15442", "15443", "12736", "14675", "12904", "9486"
        //                 ]


        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "inventorynumber", label: "Number" }),
        //                 search.createColumn({ name: "item", label: "Item" }),
        //                 search.createColumn({ name: "memo", label: "Memo" }),
        //                 search.createColumn({ name: "expirationdate", label: "Expiration Date" }),
        //                 search.createColumn({ name: "location", label: "Location" }),
        //                 search.createColumn({ name: "quantityonhand", label: "On Hand" }),
        //                 search.createColumn({ name: "quantityavailable", label: "Available" }),
        //                 search.createColumn({ name: "quantityonorder", label: "On Order" }),
        //                 search.createColumn({ name: "isonhand", label: "Is On Hand" }),
        //                 search.createColumn({ name: "quantityintransit", label: "In Transit" }),
        //                 search.createColumn({ name: "datecreated", label: "Date Created" })
        //             ]
        //     });
        // }

        function map(context) {

            log.debug("PCT-Context", context.value.type)
            lotNumberArray.push(context.value)
            log.debug("PCT", lotNumberArray.length)
            // // var invLoad = record.load({
            // //     type: "inventorynumber",
            // //     id: context.value.id, // replace with your record ID
            // //     isDynamic: true
            // // });

            // // invLoad.setValue({
            // //     fieldId: 'memo',
            // //     value: "Need to Delete"
            // // });

            // // var recordId = invLoad.save();
            // // log.debug('Record saved with ID', recordId);
            // record.delete({
            //     type: "inventorynumber",
            //     id: context.value.id, // replace with your record ID
            // });
        }

        function reduce(context) {

        }

        function summarize(summary) {

        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        }
    });
