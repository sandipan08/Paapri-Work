/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/search'], function (search) {

   function onRequest(context) {
      log.debug("PCT", "IN Category Filter "+ context.request.parameters.categoryId)
      var dataArr = new Array();
      var customrecord_pct_pmc_dwn_reasonSearchObj = search.create({
         type: "customrecord_pct_pmc_dwn_reason",
         filters:
            [
               ["custrecord_pct_pmc_dwn_category.name", "is", context.request.parameters.categoryId]
           
        
            ],
         columns:
            [
               search.createColumn({
                  name: "name",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({ name: "internalid", label: "Internal ID" })
            ]
      });
      customrecord_pct_pmc_dwn_reasonSearchObj.run().each(function (result) {
         var dataObj = new Object();
         dataObj.name = result.getValue({
            name: "name",
            sort: search.Sort.ASC,
            label: "Name"
         })
         dataObj.internalid = result.getValue({ name: "internalid", label: "Internal ID" });
         dataArr.push(dataObj);
         // .run().each has a limit of 4,000 results
         return true;
      });
      log.debug("PCT", dataArr)
      // var Obj = new Object();
      // Obj.name = "arup sarkar";
      // Obj.par = context.request.parameters.myName;
      context.response.write(JSON.stringify(dataArr));
   }

   return {
      onRequest: onRequest
   }
});
