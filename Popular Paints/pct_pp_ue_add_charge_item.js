/**

 *@NApiVersion 2.x

 *@NScriptType UserEventScript

 */

define([
  "N/record",
  "N/currentRecord",
  "N/search",
  "N/format",
  "N/error",
], function (record, currentRecord, search, format, error) {
  function afterSubmit(context) {
    var SO = context.newRecord;
    var int_id = SO.id;
    log.debug({
      title: "int_id",
      details: int_id,
    });

    var salesorderSearchObj = search.create({
      type: "salesorder",
      filters: [
        ["type", "anyof", "SalesOrd"],
        "AND",
        ["internalid", "anyof", int_id],
        "AND",
        ["mainline", "is", "T"],
      ],
      columns: [
        search.createColumn({ name: "netamount", label: "Amount (Net)" }),
      ],
    });
    var searchResultCount = salesorderSearchObj.runPaged().count;
    log.debug("salesorderSearchObj result count", searchResultCount);
    var salesorderSearchObj = salesorderSearchObj.run().getRange({
      start: 0,
      end: searchResultCount,
    });
    for (var index = 0; index < searchResultCount; index++) {
      var netAmount = salesorderSearchObj[index].getValue({
        name: "netamount",
        label: "Amount (Net)",
      });
      log.debug({
        title: "PCT-PP",
        details: "Amount " + netAmount,
      });
    }
    string = netAmount.toString();
    array = string.split(".");
    firstNumber = +array[1];

    log.debug({
      title: "PCT-PP",
      details: "Decimal " + firstNumber,
    });

    if (firstNumber != 00) {
      var soLoad = record.load({
        type: "salesorder",
        id: int_id,
        isDynamic: true,
      });

      log.debug({ title: "PCT-PP", details: "loaded" + soLoad });

      if (firstNumber > 50) {
        soLoad.selectNewLine({ sublistId: "item" });
        soLoad.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
          value: 12597,
        });
        soLoad.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: 1,
        });
        soLoad.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "rate",
          value: (100 - firstNumber) / 100,
        });
        soLoad.commitLine({ sublistId: "item" });
        log.debug({ title: "PCT-PP", details: "Value up" });
      } else if (firstNumber <= 50) {
        soLoad.selectNewLine({ sublistId: "item" });
        soLoad.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
          value: 12597,
        });
        soLoad.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: 1,
        });
        soLoad.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "rate",
          value: -firstNumber / 100,
        });
        soLoad.commitLine({ sublistId: "item" });
        log.debug({ title: "PCT-PP", details: "Value down" });
      }

      soLoad.save();
    }
  }

  return {
    afterSubmit: afterSubmit,
  };
});
