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
  function fieldChanged(context) {
    if (context.fieldId == "custrecord_pct_pp_bulk_batchno") {
      var CurrentRecord = context.currentRecord;
      var batchno = CurrentRecord.getValue({
        fieldId: "custrecord_pct_pp_bulk_batchno",
      });

      log.debug({
        title: "PCT-PP",
        details: "batchno: " + batchno,
      });

      if ((batchno != null) & (parseInt(batchno) > 0)) {
        var lotnumberedassemblyitemSearchObj = search.create({
          type: "lotnumberedassemblyitem",
          filters: [
            ["custitem_pct_pp_bulk_item", "is", "T"],
            "AND",
            ["type", "anyof", "Assembly"],
            "AND",
            ["islotitem", "is", "T"],
            "AND",
            ["inventorynumber.internalidnumber", "equalto", batchno],
            "AND",
            ["inventorynumber.internalidnumber", "isnotempty", ""],
          ],
          columns: [
            search.createColumn({
              name: "quantityonhand",
              join: "inventoryNumber",
              label: "On Hand",
            }),
          ],
        });

        var searchResultCount =
          lotnumberedassemblyitemSearchObj.runPaged().count;

        log.debug(
          "lotnumberedassemblyitemSearchObj result count",
          searchResultCount
        );

        //searchResultCount = 1;

        var start = 0;

        var end = 1000;

        //srch.run().each(function(result)

        do {
          var result = lotnumberedassemblyitemSearchObj.run().getRange({
            start: start,

            end: end,
          });

          for (var index = 0; index < result.length; index++) {
            var qty = result[index].getValue({
              name: "quantityonhand",
              join: "inventoryNumber",
              label: "On Hand",
            });

            if (qty > 0 && batchno != null) {
              CurrentRecord.setValue({
                fieldId: "custrecord_pct_pp_bulk_quantity",
                value: qty,
              });
            }
          }

          end += 1000;

          start += 1000;

          searchResultCount -= 1000;
        } while (searchResultCount > 0);

        /*var searchResultCount = lotnumberedassemblyitemSearchObj.runPaged().count;
      var start = 0;
      var end = 1000;
      log.debug(
        "lotnumberedassemblyitemSearchObj result count",
        searchResultCount
      );
      do {
        var searchResult = lotnumberedassemblyitemSearchObj
          .run()
          .getRange({ start: start, end: end });

        start += 1000;
        end += 1000;
        searchResultCount -= 1000;
      } while (searchResultCount > 0);

      for (var index = 0; index < searchResultCount; index++) {
        var qty = searchResult[index].getValue({
          name: "quantityonhand",
          join: "inventoryNumber",
          label: "On Hand",
        });
      }

      log.debug({
        title: "quantity",
        details: qty,
      });

      if (qty > 0) {
        CurrentRecord.setValue({
          fieldId: "custrecord_pct_pp_bulk_quantity",
          value: qty,
        });
      }

      return true;
    }*/

        return true;
      }
      else{
        CurrentRecord.setValue({
          fieldId: "custrecord_pct_pp_bulk_quantity",
          value: 0,
        });
      
      }
    }
  }

  return {
    fieldChanged: fieldChanged,
  };
});
