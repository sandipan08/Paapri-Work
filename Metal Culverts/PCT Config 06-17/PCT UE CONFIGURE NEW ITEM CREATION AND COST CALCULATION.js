/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function (search, record) {



  function afterSubmit(context) {
    let recordId = context.newRecord.id
    let recordType = context.newRecord.type;
    if ((context.type == context.UserEventType.CREATE) || (context.type == context.UserEventType.EDIT) || (context.type == context.UserEventType.COPY)) {

      cehckNewItemCreation(recordType, recordId)

      calculateCost(recordType, recordId)
    }
  }

  const calculateCost = (recordType, recordId) => {
    let materialCost = 0;
    let processCost = 0;
    let perUnitCost = 0;


    let configRecordObj = record.load({
      type: recordType,
      id: recordId,
      isDynamic: true
    })
    let freightCharge = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_freight_charge' })
    let orderQty = configRecordObj.getValue({ fieldId: 'custrecord_pct_cpq_order_qty' })
    let freightCost = parseFloat(freightCharge / orderQty)
    log.debug({
      title: 'freightCost',
      details: freightCost
    })
    //CALCULATE MATERIAL COST
    let itemLineCount = configRecordObj.getLineCount({
      sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config'
    })

    for (let itemLine = 0; itemLine < itemLineCount; itemLine++) {
      configRecordObj.selectLine({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        line: itemLine
      })
      let qty = chcekNull(configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_qty'
      }))
      let unitCost = chcekNull(configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_unit_cost'
      }))

      materialCost += (qty * unitCost)


    }
    log.debug({
      title: 'materialCost',
      details: materialCost
    })

    configRecordObj.setValue({
      fieldId: 'custrecord_pct_cpq_mat_total_matril_cost',
      value: materialCost
    })
    //END OF CALCULATE MATERIAL COST

    //CALCULATE PROCESS COST 
    let operationSequence = 10;
    let ProcessLineCount = configRecordObj.getLineCount({
      sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps'
    })
    for (let processLine = 0; processLine < ProcessLineCount; processLine++) {
      configRecordObj.selectLine({
        sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
        line: processLine
      })

      let lineProcessCost = chcekNull(configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
        fieldId: 'custrecord_pct_cpq_process_cost'
      }))

      configRecordObj.setCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps',
        fieldId: 'custrecord_pct_cpq_s_no',
        value: operationSequence
      })
      configRecordObj.commitLine({
        sublistId: 'recmachcustrecord_pct_cpq_linkpctconfprocesteps'
      })
      operationSequence = parseInt(operationSequence) + 10

      processCost += lineProcessCost

    }
    log.debug({
      title: 'processCost',
      details: processCost
    })
    configRecordObj.setValue({
      fieldId: 'custrecord_pct_cpq_pro_total_process',
      value: processCost
    })
    //END CALCULATE PROCESS COST 

    perUnitCost = parseFloat(processCost) + parseFloat(materialCost)

    configRecordObj.setValue({
      fieldId: 'custrecord_pct_cpq_item_unit_cost',
      value: perUnitCost
    })

    let markUp = parseFloat(configRecordObj.getValue({
      fieldId: 'custrecord_pct_cpq_markup',
    }))

    let markupCost = (perUnitCost * markUp) / 100

    log.debug({
      title: 'markUp =' + markUp,
      details: 'markupCost =' + markupCost + ' perUnitCost =' + perUnitCost
    })
    configRecordObj.setValue({
      fieldId: 'custrecord_pct_cpq_total_markup',
      value: markupCost
    })

    configRecordObj.setValue({
      fieldId: 'custrecord_pct_cpq_freight_cost',
      value: freightCost
    })
    configRecordObj.setValue({
      fieldId: 'custrecord_pct_cpq_final_selling_price',
      value: perUnitCost + parseFloat(markupCost) + freightCost
    })
    configRecordObj.save()
  }

  const chcekNull = (val) => {
    if (val == '' || val == null || isNaN(val) || val == undefined) {
      val = 0
    }
    return val
  }
  const cehckNewItemCreation = (recordType, recordId) => {
    let configRecordObj = record.load({
      type: recordType,
      id: recordId,
      isDynamic: true
    })

    let itemLineCount = configRecordObj.getLineCount({
      sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config'
    })

    for (let itemLine = 0; itemLine < itemLineCount; itemLine++) {
      configRecordObj.selectLine({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        line: itemLine
      })
      let oldItemName = configRecordObj.getCurrentSublistText({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_items'
      })

      let oldItemId = configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_items'
      })

      let newItemName = configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_new_item'
      })

      let itemDesc = configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_new_item_desc'
      })

      let unitCost = configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_unit_cost'
      })

      let unitType = configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_unit_type'
      })

      let consumptionunit = configRecordObj.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        fieldId: 'custrecord_pct_cpq_consumption_unit'
      })
      //
      if (oldItemName == 'CUSTOM' || oldItemName == 'CUSTOM LOT NUMBERED') {
        let itemObj = {
          itemId: oldItemId,
          itemDesc: itemDesc,
          unitCost: unitCost,
          newItemName: newItemName,
          unitType: unitType,
          consumptionunit: consumptionunit

        }
        let newCreatedItemId = createNewItem(itemObj)

        configRecordObj.setCurrentSublistValue({
          sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
          fieldId: 'custrecord_pct_cpq_items',
          value: newCreatedItemId
        })

        configRecordObj.commitLine({
          sublistId: 'recmachcustrecord_pct_cpq_link_to_pct_config',
        })
      }

    }

    configRecordObj.save();
  }


  const getItemId = (name) => {
    var itemSearchObj = search.create({
      type: "item",
      filters:
        [
          ["name", "is", name]
        ],
      columns:
        [

        ]
    });
    let itemId = 0;
    var searchResultCount = itemSearchObj.runPaged().count;
    log.debug("itemSearchObj result count", searchResultCount);
    itemSearchObj.run().each(function (result) {
      itemId = result.id
      // .run().each has a limit of 4,000 results
      //return true;
    });
    return itemId
  }

  const createNewItem = (itemObj) => {
    try {
      let name = itemObj.newItemName
      let itemId = getItemId(name)
      if (parseInt(itemId) == 0) {
        let newItemObj = record.copy({
          type: search.lookupFields({ type: 'item', id: itemObj.itemId, columns: 'recordtype' })['recordtype'],
          id: itemObj.itemId,
          isDynamic: true,
        })
        newItemObj.setValue({
          fieldId: 'itemid',
          value: itemObj.newItemName
        })
        newItemObj.setValue({
          fieldId: 'salesdescription',
          value: itemObj.itemDesc
        })
        if (parseInt(itemObj.unitType) > 0) {
          newItemObj.setValue({
            fieldId: 'unitstype',
            value: itemObj.unitType
          })
          if (parseInt(itemObj.consumptionunit) > 0) {
            newItemObj.setValue({
              fieldId: 'consumptionunit',
              value: itemObj.consumptionunit
            })
          }
        }
        newItemObj.setValue({
          fieldId: 'cost',
          value: itemObj.unitCost
        })
        return newItemObj.save();
      }
      return itemId
    }
    catch (e) {

      var myCustomError = {
        name: 'Something Wrong',
        message: e.message
      }
      throw myCustomError;
    }
  }
  return {
    // beforeLoad: beforeLoad,
    // beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  }
});