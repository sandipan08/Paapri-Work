/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record", "N/search", "N/ui/dialog", "N/currentRecord"], function (
  record,
  search,
  dialog,
  currentRecord
) {
  function FieldChangedPacking(context) {
    var CurrentRecord = context.currentRecord;
    if (context.fieldId == "custrecord_pct_pp_bulk_batchno")
    {
       batchno = CurrentRecord.getValue({
        fieldId: "custrecord_pct_pp_bulk_batchno",
      });

      log.debug({
        title: "PCT-PP",
        details: "batchno: " + batchno,
      });
      
      if((batchno != null) && (parseInt(batchno) > 0))
      {
          var inventorynumberSearchObj = search.create({
          type: "inventorynumber",
          filters: [
            ["internalid", "is", batchno],
             "AND",
            ["custitemnumber_pct_ppcl_qc_approved","is","F"]
          ],
          columns: [
            search.createColumn({
              name: "custitemnumber_pct_ppcl_qc_approved",
              label: "QC Approved",
            }),
          ],
        });
        var searchResultCount = inventorynumberSearchObj.runPaged().count;
        log.debug("inventorynumberSearchObj result count", searchResultCount);
        if (searchResultCount>=1)
            {
              CurrentRecord.setValue({
                fieldId: "custrecord_pct_pp_bulk_batchno",
                value: '',
                ignoreFieldChange: true
              });
              //alert("QC Not Checked for this Batch; please select a different one.");
			  alert("QC Not Checked for this Batch");
            }
      }
    }
  }

  return {
   fieldChanged:  FieldChangedPacking
  
  };
});
