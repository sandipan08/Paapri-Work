/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/file', 'N/record', 'N/email', 'N/task', 'N/search'], function (file, record, email, task, search) {

    function getInputData() {
       

        var paymentFile = file.load({ id: 40752 });

        var fileName = paymentFile.name;

        log.debug({
            title: 'paymentFile Details',
            details: fileName
        })
        var i = 0;



        var lineCount = 0;
        var paymentData = [];

        var NameIsInList = 0;//Need to check from bill if file processed Previously

        if (NameIsInList == 0) {
            paymentFile.lines.iterator().each(function (line) {

                if (lineCount >= 1) {
                    var w = line.value.split(",");
                    log.debug({
                        title: 'w',
                        details: w
                    })
                    if (w[0] != '' && i <= 10000) {// && i == 0
                        i++;
                        paymentData.push({ HSN: w[0], RATE: w[1] });


                    }
                }
                lineCount++;
                return true;
            });
        }

        return paymentData;
        //response.write({output: JSON.stringify(weatherData)});
    }

    function map(context) {
        var dataArr = JSON.parse(context.value);


         var HSN = dataArr.HSN;
         var RATE = getRateId(dataArr.RATE);
         log.debug({
             title: 'HSN =' + HSN,
             details: 'ACT RATE '+ dataArr.RATE + ' RTE =' + RATE
         })
 
         try {
 
 
             var availableArr = new Array();
             availableArr = ['Purchase Transactions', 'Sales Transactions'];
             //availableArr = ['Purchase Transactions'];
             
 
             var regArr = new Array();
             regArr = ['Regular', 'Unregistered'];
             //regArr = ['Unregistered'];
 
             var classArr = new Array();
             classArr = ['Inter-State Supply', 'Intra-State Supply'];
 
             for (var avaiLoop = 0; avaiLoop < 2; avaiLoop++) {
                 for (var regLoop = 0; regLoop < 2; regLoop++) {
                     for (var classLoop = 0; classLoop < 2; classLoop++) {

                        log.debug({
                            title: 'save rec id' + availableArr[avaiLoop] + ' '+regArr[regLoop] + ' '+classArr[classLoop]  ,
                            details: 'HSN = '+ HSN + 'ACT RATE '+ dataArr.RATE + ' RTE =' + RATE 
                        })

                         var CR = record.create({
                             type: 'customrecord_in_gst_tax_rate_rule'
                         })
                         CR.setText({
                             fieldId: 'custrecord_in_gst_rate_rule_available_on',
                             text: availableArr[avaiLoop]
                         })
                         CR.setText({
                             fieldId: 'custrecord_in_gst_rate_rule_vend_regtype',
                             text: regArr[regLoop]
                         });
 
 
                         CR.setText({
                             fieldId: 'custrecord_in_gst_rate_rule_hsn_code',
                             text: HSN
                         })
 
                         CR.setValue({
                             fieldId: 'custrecord_in_gst_rate_rule_rate',
                             value: RATE
                         })
                         CR.setText({
                             fieldId: 'custrecord_in_gst_rate_rule_supply_class',
                             text: classArr[classLoop]
                         });
 
                         //
                         if (classArr[classLoop] == 'Intra-State Supply') {
                             CR.setValue({
                                 fieldId: 'custrecord_in_gst_rate_rule_within_state',
                                 value: true
                             })
                         }

                        //  if (availableArr[avaiLoop] == 'Purchase Transactions' && regArr[regLoop] == 'Unregistered') {
                        //     CR.setValue({
                        //         fieldId: 'custrecord_in_gst_rate_rule_rev_charge',
                        //         value: false
                        //     })
                        // }

                         //
 
 
                         var id = CR.save();
 
                         log.debug({
                             title: 'save rec id' + avaiLoop[avaiLoop] + ' '+regArr[regLoop] + ' '+classArr[classLoop]  ,
                             details: 'HSN = '+ HSN + 'ACT RATE '+ dataArr.RATE + ' RTE =' + RATE + 'Created Id ='+id
                         })
                     }
                 }
             }
 
           
 
         } catch (ex) {
             log.error({
                 title: 'error',
                 details: ex
             });
 
 
         }

      

    }


    function getRateId(RATE) {
        var customrecord_in_gst_rateSearchObj = search.create({
            type: "customrecord_in_gst_rate",
            filters:
                [
                    ["name", "startswith", RATE]
                ],
            columns:
                [

                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var internalid = 0;
        var searchResultCount = customrecord_in_gst_rateSearchObj.runPaged().count;
        log.debug("customrecord_in_gst_rateSearchObj result count", searchResultCount);
        customrecord_in_gst_rateSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            // return true;
            internalid = result.getValue('internalid');
        });
        return internalid;
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
