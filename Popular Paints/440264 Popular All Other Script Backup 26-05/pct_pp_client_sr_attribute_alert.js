/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([
  "N/currentRecord",
  "N/record",
  "N/runtime",
  "N/search",
  "N/email",
  "N/runtime",
], function (currentRecord, record, runtime, search, email, runtime) {
  function fieldChangedAttribute(context) {
    var specialRebate = context.currentRecord;
    if (
      context.sublistId === "recmachcustrecord_pct_pp_sr_link" &&
      context.fieldId === "custrecord_pct_pp_sr_product"
    ) {
      log.debug({ title: "PCT-PP", details: "Disable color & sku" });

      var product = specialRebate.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_sr_link",
        fieldId: "custrecord_pct_pp_sr_product",
      });
      log.debug({ title: "PCT-PP", details: "product:" + product });

      if (product != null && product != "") {
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_color",
          value: "",
          ignoreFieldChange: false,
        });
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_sku",
          value: "",
          ignoreFieldChange: false,
        });
        alert("REMINDER ALERT: YOU CAN SELECT ANY ONE ATTRIBUTE ONLY");
      }

      return true;
    } else if (
      context.sublistId === "recmachcustrecord_pct_pp_sr_link" &&
      context.fieldId === "custrecord_pct_pp_sr_color"
    ) {
      log.debug({ title: "PCT-PP", details: "Disable pdt & sku" });

      var color = specialRebate.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_sr_link",
        fieldId: "custrecord_pct_pp_sr_color",
      });
      if (color != null && color != "") {
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_product",
          value: "",
          ignoreFieldChange: false,
        });
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_sku",
          value: "",
          ignoreFieldChange: false,
        });
        alert("REMINDER ALERT: YOU CAN SELECT ANY ONE ATTRIBUTE ONLY");
      }

      return true;
    } else if (
      context.sublistId === "recmachcustrecord_pct_pp_sr_link" &&
      context.fieldId === "custrecord_pct_pp_sr_sku"
    ) {
      log.debug({ title: "PCT-PP", details: "Disable pdt & clr" });

      var sku = specialRebate.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_sr_link",
        fieldId: "custrecord_pct_pp_sr_sku",
      });

      if (sku != null && sku != "") {
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_color",
          value: "",
          ignoreFieldChange: false,
        });
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_product",
          value: "",
          ignoreFieldChange: false,
        });
        alert("REMINDER ALERT: YOU CAN SELECT ANY ONE ATTRIBUTE ONLY");
      }

      return true;
    } else if (
      context.sublistId === "recmachcustrecord_pct_pp_sr_link" &&
      context.fieldId === "custrecord_pct_pp_sr_discount_price"
    ) {
      log.debug({ title: "PCT-PP", details: "Disable val" });

      var price = specialRebate.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_sr_link",
        fieldId: "custrecord_pct_pp_sr_discount_price",
      });

      if (price) {
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_discount_percentage",
          value: "",
          ignoreFieldChange: false,
        });
        alert("REMINDER ALERT: YOU CAN SELECT EITHER PRICE OR PERCENTAGE");
      }

      return true;
    } else if (
      context.sublistId === "recmachcustrecord_pct_pp_sr_link" &&
      context.fieldId === "custrecord_pct_pp_sr_discount_percentage"
    ) {
      log.debug({ title: "PCT-PP", details: "Disable val" });

      var pcent = specialRebate.getCurrentSublistValue({
        sublistId: "recmachcustrecord_pct_pp_sr_link",
        fieldId: "custrecord_pct_pp_sr_discount_percentage",
      });

      if (pcent) {
        log.debug({
          title: "pct-pp",
          details: "in if++++++++++++++++",
        });
        specialRebate.setCurrentSublistValue({
          sublistId: "recmachcustrecord_pct_pp_sr_link",
          fieldId: "custrecord_pct_pp_sr_discount_price",
          value: "",
          ignoreFieldChange: false,
        });
        alert("REMINDER ALERT: YOU CAN SELECT EITHER PRICE OR PERCENTAGE");
      }

      // 	return true;

      // }
      return true;
    }
  }

  return {
    //pageInit: pageInit,
    fieldChanged: fieldChangedAttribute,
  };
});
