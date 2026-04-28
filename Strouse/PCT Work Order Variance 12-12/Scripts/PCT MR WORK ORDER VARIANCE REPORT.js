/**
 *@NApiVersion 2.1
*@NScriptType MapReduceScript
*/
define(['N/record', 'N/log', 'N/search', 'N/runtime', 'N/file', 'N/format/i18n'],
    function (record, log, search, runtime, file, formati) {

        function getInputData() {
            let inputDataArray = [];
            let workOrderArray = [];

            let workOrderString = runtime.getCurrentScript().getParameter({ name: 'custscript_pct_wov_work_order_list' }) // '["61483","61535","61476","61360","61347"]'//
            let customReocrdId = runtime.getCurrentScript().getParameter({ name: 'custscript_pct_wo_variance_report_id' })
            log.debug({
                title: 'customReocrdId',
                details: customReocrdId
            })
            workOrderArray = JSON.parse(workOrderString)
            log.debug({
                title: 'workOrderArray',
                details: workOrderArray
            })
            workOrderArray.forEach(element => {
                inputDataArray.push({ workOrderId: element, customReocrdId: customReocrdId })
            });
            return inputDataArray
        }

        function map(context) {

            let dataArr = JSON.parse(context.value);
            context.write(context);
        }

        function reduce(context) {
            var WorkOrderWiseVarianceReprtObj = {};
            try {
                let costCategoryObj = {}
                let workOrderEstimatedItemDataObj = {};
                let workOrderItemDataObj = {};

                let varianceReportOperationObj = {}
                let ValueObj = context.values
                costCategoryObj = getCostingCategory();
                let workOrderId = JSON.parse(ValueObj)['workOrderId']
                let customReocrdId = JSON.parse(ValueObj)['customReocrdId']
                let workOrderObj = record.load({
                    type: record.Type.WORK_ORDER,
                    id: workOrderId,
                    isDynamic: true
                })

                let sceId = workOrderObj.getValue('custbody_pct_config_number')
                let sceDocumentNumber = workOrderObj.getText('custbody_pct_config_number')
                let sceQty = search.lookupFields({
                    type: 'customrecord_pct_configure',
                    id: sceId,
                    columns: 'custrecord_pct_order_qty'
                }).custrecord_pct_order_qty;

                // ------------------------------ Operation Function Start ---------------------------
                let completionRecordIdArray = getCompletionRecordId(workOrderId)
                let EstimateDataFromMFGOperationTask = getEstimateDataFromMFGOperationTask(workOrderId, costCategoryObj, sceId, sceDocumentNumber);
                let ActualDataFromWOCompletion = getActualDataFromWOCompletion(completionRecordIdArray)
                varianceReportOperationObj = getOperationData(workOrderId, EstimateDataFromMFGOperationTask, ActualDataFromWOCompletion, sceId, sceDocumentNumber, workOrderObj.getValue('tranid'))
                // ------------------------------ Operation Function End ---------------------------

                // ------------------------------ Material Operation Start ---------------------------
                workOrderEstimatedItemDataObj = getEstimatedItemDetails(workOrderId, sceId, sceDocumentNumber, sceQty, workOrderObj.getValue('tranid'), workOrderObj.getValue('quantity'));
                workOrderItemDataObj = getActualItemDetails(workOrderEstimatedItemDataObj, workOrderId);
                // log.debug({
                //     title: 'workOrderEstimatedItemDataObj',
                //     details: JSON.stringify(workOrderEstimatedItemDataObj)
                // })
                // ------------------------------ Material Operation End ---------------------------
                let dataObj = {}
                dataObj.workOrderId = parseInt(workOrderId)
                dataObj.customReocrdId = customReocrdId
                dataObj.varianceReportOperationObj = varianceReportOperationObj;
                dataObj.workOrderItemDataObj = workOrderItemDataObj;
                dataObj.workOrderQty = workOrderObj.getValue('quantity')
                dataObj.sceQty = sceQty
                dataObj.sceDocumentNumber = sceDocumentNumber
                dataObj.workOrderNumber = workOrderObj.getValue('tranid')
                dataObj.customerName = workOrderObj.getText('entity')
                dataObj.assemblyItem = workOrderObj.getText('assemblyitem')
                dataObj.assemblyItemId = workOrderObj.getValue('assemblyitem')

                WorkOrderWiseVarianceReprtObj = dataObj;
                context.write({
                    key: context.key,
                    value: WorkOrderWiseVarianceReprtObj
                });

            } catch (error) {
                log.debug("PCT_Catch", error.message)
                // context.write(WorkOrderWiseVarianceReprtObj);
            }

            //context.write(WorkOrderWiseVarianceReprtObj);

        }

        function summarize(context) {
            let customReocrdId = 0;
            log.debug({
                title: 'context-summarize',
                details: context
            })
            log.debug({
                title: 'context-context.output',
                details: context.output
            })
            let values = []
            context.output.iterator().each(function (key, value) {
                values.push(value);
                return true;
            });
            log.debug({
                title: 'context-values',
                details: values
            })
            let WorkOrderWiseVarianceOperationData = []
            let WorkOrderWiseVarianceItemData = [];
            let WorkOrderWiseVarianceData = [];
            let reportObj = {}
            values.forEach((element, index) => {
                let totalPlannedCost = 0;
                let totalActualCost = 0;
                let summaryReportObj = {}

                let varianceOperationObj = JSON.parse(element).varianceReportOperationObj[JSON.parse(element).workOrderId]//[element.workOrderId]
                let varianceItemObj = JSON.parse(element).workOrderItemDataObj[JSON.parse(element).workOrderId]
                customReocrdId = JSON.parse(element).customReocrdId
                log.debug({
                    title: 'varianceReportOperationObj',
                    details: varianceOperationObj
                })
                if (varianceOperationObj != null) {
                    Object.keys(varianceOperationObj).forEach(key => {
                        WorkOrderWiseVarianceOperationData.push(varianceOperationObj[key])
                        totalActualCost += parseFloat(CheckNull(varianceOperationObj[key].actCost))
                        totalPlannedCost += parseFloat(CheckNull(varianceOperationObj[key].differenceCost))  //estimatedTotalProcessCost
                    });

                }
                log.debug({
                    title: 'varianceItemObj',
                    details: varianceItemObj
                })

                if (varianceItemObj != null) {
                    Object.keys(varianceItemObj).forEach(key => {

                        WorkOrderWiseVarianceItemData.push(varianceItemObj[key])
                        totalActualCost += parseFloat(CheckNull(varianceItemObj[key].actualItemCost))
                        totalPlannedCost += parseFloat(CheckNull(varianceItemObj[key].sceEstimatedMaterialCost))
                    });
                }

                var summaryObj = {};
                summaryObj['workOrderId'] = JSON.parse(element).workOrderId
                summaryObj['sceDocumentNumber'] = JSON.parse(element).sceDocumentNumber
                summaryObj['sceQty'] = JSON.parse(element).sceQty
                summaryObj['workOrderQty'] = JSON.parse(element).workOrderQty
                summaryObj['workOrderNumber'] = JSON.parse(element).workOrderNumber
                summaryObj['customerName'] = JSON.parse(element).customerName
                summaryObj['assemblyItem'] = JSON.parse(element).assemblyItem
                summaryObj['totalActualCost'] = convertCurrency(parseFloat(totalActualCost).toFixed(3))
                summaryObj['totalPlannedCost'] = convertCurrency(parseFloat(totalPlannedCost).toFixed(3))
                summaryObj['totalVariance'] = convertCurrency((totalPlannedCost - totalActualCost))
                summaryObj['totalVarianceAmount'] = ((totalPlannedCost - totalActualCost))
                summaryObj['color'] = (summaryObj['totalVarianceAmount']) >= 0 ? 'green' : 'red';
                log.debug({
                    title: 'summaryObj',
                    details: JSON.stringify(summaryObj)
                })
                WorkOrderWiseVarianceData.push(summaryObj)
                // let workOrderId = JSON.parse(element).workOrderId;
                // summaryObj[JSON.parse(element).workOrderId]['workOrderId'] = JSON.parse(element).workOrderId
                // summaryObj[JSON.parse(element).workOrderId]['workOrderNumber'] = JSON.parse(element).workOrderNumber
                // summaryObj[JSON.parse(element).workOrderId]['assemblyItem'] = JSON.parse(element).assemblyItem
                // summaryObj[JSON.parse(element).workOrderId]['totalActualCost'] = convertCurrency(parseFloat(totalActualCost).toFixed(3))
                // summaryObj[JSON.parse(element).workOrderId]['totalPlannedCost'] = convertCurrency(parseFloat(totalPlannedCost).toFixed(3))
                // summaryObj[JSON.parse(element).workOrderId]['totalVariance'] = convertCurrency((totalPlannedCost - totalActualCost))
                // summaryObj[JSON.parse(element).workOrderId]['totalVarianceAmount'] = ((totalPlannedCost - totalActualCost))
                // summaryObj[JSON.parse(element).workOrderId]['color'] = (summaryObj[JSON.parse(element).workOrderId]['totalVarianceAmount']) >= 0 ? 'green' : 'red';
                // if (!(JSON.parse(element).workOrderId in summaryReportObj)) {
                //     summaryReportObj[JSON.parse(element).workOrderId] = []
                //     summaryReportObj[JSON.parse(element).workOrderId].push(summaryObj)
                // }
                // else {
                //     summaryReportObj[JSON.parse(element).workOrderId].push(summaryObj)
                // }
                // WorkOrderWiseVarianceData.push(summaryReportObj)

            });
            log.debug("PCT_OPERATION", WorkOrderWiseVarianceOperationData)
            log.debug("PCT_MATERIAL", WorkOrderWiseVarianceItemData)
            log.debug("PCT_Summary", WorkOrderWiseVarianceData)

            WorkOrderWiseVarianceOperationData.sort((a, b) => {
                return a.workOrderId - b.workOrderId;
            });
            WorkOrderWiseVarianceItemData.sort((a, b) => {
                return a.workOrderId - b.workOrderId;
            });
            WorkOrderWiseVarianceData.sort((a, b) => {
                return a.workOrderId - b.workOrderId;
            });
            reportObj.WorkOrderWiseVarianceOperationData = WorkOrderWiseVarianceOperationData
            reportObj.WorkOrderWiseVarianceItemData = WorkOrderWiseVarianceItemData
            reportObj.WorkOrderWiseVarianceData = WorkOrderWiseVarianceData
            var fileObject = file.create({
                name: 'Work Order Report' + customReocrdId,
                fileType: file.Type.JSON,
                contents: JSON.stringify(reportObj),
                // description: string,
                folder: 43269,
                //encoding: file.Encoding.UTF8,
                // isInactive: boolean,
                isOnline: true
            })
            var fileId = fileObject.save();
            let customRecordId = updateCustomRecord(customReocrdId, fileId)
        }


        const convertCurrency = (amount) => {
            // log.debug("PCT before", "Amount : " + amount + ", type : " + typeof amount)
            if (Number.isNaN(parseFloat(amount))) {
                amount = 0
            }
            // log.debug("PCT After", "Amount : " + amount + ", type : " + typeof amount)
            var myFormat = formati.getCurrencyFormatter({ currency: "USD" });
            return newCur = myFormat.format({
                number: parseFloat(amount)//Number.isNaN(parseFloat(amount)) ? amount : 0
            });
        }
        const updateCustomRecord = (customReocrdId, fileId) => {
            return workOrderVarianceDataStoreRecordId = record.load({
                type: 'customrecord_pct_wov_data_store',
                id: customReocrdId,
                isDynamic: true
            }).setValue({
                fieldId: 'custrecord_pct_wov_data_store_status',
                value: 2,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_wov_data_store_json_data',
                value: fileId,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pxt_wov_data_store_link',
                value: `https://4344933-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1210&deploy=1&compid=4344933_SB1&fileData=&customRecordId=${customReocrdId}&custparam_success=1&whence=`,
                ignoreFieldChange: true
            }).save();
            // log.debug("PCT", "Created Work Order Variance Record Id : " + workOrderVarianceDataStoreRecordId)
        }
        // --------------------- Function for get estimated Item Quantity Start ( Account : 1.0, Search Id : 1590 ) ------------------------
        const getEstimatedItemDetails = (workOrderArray, sceId, sceDocumentNumber, sceQty, workOrderNumber, workOrderQty) => {
            let getEstimatedItemDetailsFilterArray = [];
            let workOrderDetailObj = {};

            getEstimatedItemDetailsFilterArray.push(["type", "anyof", "WorkOrd"]);
            getEstimatedItemDetailsFilterArray.push("AND");
            getEstimatedItemDetailsFilterArray.push(["mainline", "is", "F"]);
            getEstimatedItemDetailsFilterArray.push("AND");
            getEstimatedItemDetailsFilterArray.push(["formulanumeric: CASE WHEN ({location} = {item.inventorylocation}) THEN 1 ELSE 0 END", "equalto", "1"])
            getEstimatedItemDetailsFilterArray.push("AND");
            getEstimatedItemDetailsFilterArray.push(["quantity", "greaterthan", "0"]);
            getEstimatedItemDetailsFilterArray.push("AND");
            getEstimatedItemDetailsFilterArray.push(["internalid", "anyof", workOrderArray]);

            var workorderSearchObj = search.create({
                type: "workorder",
                filters:
                    [
                        getEstimatedItemDetailsFilterArray
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "item",
                            summary: "GROUP",
                            sort: search.Sort.DESC,
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "quantity",
                            summary: "SUM",
                            label: "Quantity"
                        }),
                        search.createColumn({
                            name: "locationaveragecost",
                            join: "item",
                            summary: "MAX",
                            label: "Location Average Cost"
                        }),
                        search.createColumn({
                            name: "locationcost",
                            join: "item",
                            summary: "MAX",
                            label: "Location Standard Cost"
                        }),
                        search.createColumn({
                            name: "costingmethod",
                            join: "item",
                            summary: "GROUP",
                            label: "Costing Method"
                        }),
                        search.createColumn({
                            name: "tranid",
                            summary: "GROUP",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "unit",
                            summary: "GROUP",
                            label: "Units"
                        }),
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custcol_pct_sc_sce_list",
                            summary: "GROUP",
                            label: "SCE #"
                        }),
                        search.createColumn({
                            name: "custcol_pct_sc_sce_list",
                            summary: "GROUP",
                            label: "SCE #"
                        }),
                    ]
            });
            var workOrderItemSearchCount = workorderSearchObj.runPaged().count;
            // log.debug("PCT", "Work Order Search Item Count : ", workOrderItemSearchCount);
            let start = 0;
            let end = 1000;
            do {
                var result = workorderSearchObj.run().getRange({ start: start, end: end });
                for (let woIndex = 0; woIndex < result.length; woIndex++) {
                    let itemObj = {};
                    let workOrderId = result[woIndex].getValue({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    });
                    let itemEstimatedQuantity = result[woIndex].getValue({ name: "quantity", summary: "SUM" });
                    let builtQuantity = getWorkOrderBuiltQuantity(workOrderId).builtQuantity;
                    let workOrderQuantity = getWorkOrderBuiltQuantity(workOrderId).quantity;
                    itemObj.estimatedQuantity = ((itemEstimatedQuantity / workOrderQuantity) * builtQuantity).toFixed(3);

                    let costingMethod = result[woIndex].getValue({
                        name: "costingmethod",
                        join: "item",
                        summary: "GROUP",
                        label: "Costing Method"
                    });
                    if (costingMethod == 'AVG') {
                        itemObj.estimatedItemAmount = CheckNull(itemEstimatedQuantity * CheckNull(parseFloat(result[woIndex].getValue({
                            name: "locationaveragecost",
                            join: "item",
                            summary: "MAX",
                            label: "Location Average Cost"
                        }))))
                    } else {
                        itemObj.estimatedItemAmount = CheckNull(itemEstimatedQuantity * CheckNull(parseFloat(result[woIndex].getValue({
                            name: "locationcost",
                            join: "item",
                            summary: "MAX",
                            label: "Location Standard Cost"
                        }))))
                    }

                    if (itemObj.estimatedItemAmount == null || itemObj.estimatedItemAmount == "") {
                        itemObj.estimatedItemAmount = 0;
                    }

                    itemObj.estimatedItemAmountCurrency = convertCurrency(itemObj.estimatedItemAmount)
                    let itemId = result[woIndex].getValue({ name: "item", summary: "GROUP", sort: search.Sort.DESC, });
                    itemObj.workOrderId = workOrderId;
                    itemObj.workOrderNumber = result[woIndex].getValue({ name: "tranid", summary: "GROUP" });
                    itemObj.secNumber = result[woIndex].getValue({
                        name: "custcol_pct_sc_sce_list",
                        summary: "GROUP",
                        label: "SCE #"
                    });

                    itemObj.workOrderQty = workOrderQty;
                    itemObj.item = itemId;

                    itemObj.averageCost = CheckNull(result[woIndex].getValue({
                        name: "locationaveragecost",
                        join: "item",
                        summary: "AVG",
                        label: "Location Average Cost"
                    }));
                    itemObj.itemName = result[woIndex].getText({ name: "item", summary: "GROUP" })//.split('(').join('BracketStart').split(')').join('BracketEnd').split('.').join('PCTDOT').split('-').join('PCThIFEN');
                    itemObj.standardCost = CheckNull(result[woIndex].getValue({
                        name: "locationcost",
                        join: "item",
                        summary: "AVG",
                        label: "Location Average Cost"
                    }));
                    itemObj.costingMethod = result[woIndex].getValue({
                        name: "costingmethod",
                        join: "item",
                        summary: "GROUP",
                        label: "Costing Method"
                    });
                    itemObj.unit = result[woIndex].getText({
                        name: "unit",
                        summary: "GROUP",
                        label: "Units"
                    });
                    itemObj.actualQuantity = 0;
                    itemObj.differentiateQuantity = 0;
                    itemObj.actualItemCost = 0;
                    itemObj.actualItemCostCurrency = 0;
                    itemObj.differentiateItemCost = 0;
                    // itemObj.differentiateItemCostCurrency = convertCurrency(itemObj.estimatedItemAmount);
                    itemObj.color = 'green';
                    itemObj.sceDocumentNumber = sceDocumentNumber;
                    let sceDetailsResponse = getSceItemDetails(itemId, sceId);

                    itemObj.sceQuantity = sceQty;
                    itemObj.sceEstimatedQuantity = (Object.keys(sceDetailsResponse).length) ? sceDetailsResponse.sceEstimatedQuantity : 0
                    itemObj.sceEstimatedMaterialCost = (Object.keys(sceDetailsResponse).length) ? (CheckNull(sceDetailsResponse.sceEstimatedMaterialCost)).toFixed(3) : 0
                    itemObj.differentiateItemCostCurrency = convertCurrency((Object.keys(sceDetailsResponse).length) ? sceDetailsResponse.sceEstimatedMaterialCost : 0);

                    if (!(workOrderId in workOrderDetailObj)) {
                        workOrderDetailObj[workOrderId] = {}
                        workOrderDetailObj[workOrderId][itemId] = itemObj
                    }
                    else {
                        workOrderDetailObj[workOrderId][itemId] = itemObj
                    }
                }
                start += 1000;
                end += 1000;
                workOrderItemSearchCount -= 1000;
            }

            while (workOrderItemSearchCount > 0);

            let sceItemArray = getSceItem(sceId);

            for (let index = 0; index < sceItemArray.length; index++) {
                if (!getAbsentItemInWorkOrder(sceItemArray[index], workOrderArray)) {

                    let sceDetailsResponse = getSceItemDetails(sceItemArray[index], sceId);
                    log.debug("PCT_sceDetailsResponse", JSON.stringify(sceDetailsResponse))
                    workOrderDetailObj[workOrderArray][sceItemArray[index]] = {
                        "estimatedItemAmount": 0,
                        "estimatedItemAmountCurrency": 0,
                        "workOrderId": workOrderArray,//workOrderId,
                        "workOrderNumber": workOrderNumber,//result[woIndex].getValue({ name: "tranid", summary: "GROUP" }),
                        "workOrderQty": workOrderQty,
                        "item": sceItemArray[index],
                        "estimatedQuantity": 0,
                        "sceDocumentNumber": sceDocumentNumber,
                        'sceQuantity': sceQty,
                        "sceEstimatedQuantity": (Object.keys(sceDetailsResponse).length) ? sceDetailsResponse.sceEstimatedQuantity : 0,
                        "sceEstimatedMaterialCost": (Object.keys(sceDetailsResponse).length) ? (CheckNull(sceDetailsResponse.sceEstimatedMaterialCost)).toFixed(3) : 0,
                        "averageCost": 0,
                        "itemName": (Object.keys(sceDetailsResponse).length) ? sceDetailsResponse.item : '',
                        "standardCost": 0,
                        "costingMethod": '',
                        "unit": (Object.keys(sceDetailsResponse).length) ? sceDetailsResponse.unit : '',
                        "actualQuantity": 0,
                        "differentiateQuantity": 0,
                        "actualItemCost": 0,
                        "actualItemCostCurrency": convertCurrency(0),
                        "differentiateItemCost": 0,
                        "differentiateItemCostCurrency": convertCurrency((Object.keys(sceDetailsResponse).length) ? (sceDetailsResponse.sceEstimatedMaterialCost).toFixed(3) : 0),
                        "color": 'green'
                    }
                }

            }

            return workOrderDetailObj;
        }

        // --------------------- Function for get estimated Item Quantity End ( Account : 1.0, Search Id : 1590 ) ------------------------

        // --------------------- Function for get actual Item Quantity Start ( Account : 1.0, Search Id : 1591 ) ------------------------
        const getActualItemDetails = (workOrderEstimatedItemDataObj, workOrderArray) => {
            let getActualItemDetailsFilterArray = [];
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type", "anyof", "WOIssue"],
                        "AND",
                        ["formulanumeric: CASE WHEN ({location}={item.inventorylocation}) THEN 1 ELSE 0 END", "equalto", "1"],
                        "AND",
                        ["formulanumeric: CASE WHEN {quantity} > 0 THEN 1 ELSE 0 END", "equalto", "1"],
                        "AND",
                        ["createdfrom", "anyof", workOrderArray]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "item",
                            summary: "GROUP",
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "quantity",
                            summary: "SUM",
                            label: "Quantity"
                        }),
                        search.createColumn({
                            name: "createdfrom",
                            summary: "GROUP",
                            label: "Created From"
                        }),
                        search.createColumn({
                            name: "rate",
                            summary: "AVG",
                            label: "Item Rate"
                        })
                    ]
            });
            var workOrderIssueItemCount = transactionSearchObj.runPaged().count;
            // log.debug("PCT", "Work Order Issue Search Item Count : " + workOrderIssueItemCount);
            let start = 0;
            let end = 1000;
            do {
                var result = transactionSearchObj.run().getRange({ start: start, end: end });
                for (let issueIndex = 0; issueIndex < result.length; issueIndex++) {
                    let itemObj = {};
                    let workOrderId = result[issueIndex].getValue({
                        name: "createdfrom",
                        summary: "GROUP",
                        label: "Created From"
                    });
                    let itemId = result[issueIndex].getValue({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    });
                    let itemActualQuantity = result[issueIndex].getValue({
                        name: "quantity",
                        summary: "SUM",
                        label: "Quantity"
                    });
                    itemObj.itemId = itemId;
                    itemObj.actualQuantity = itemActualQuantity;
                    itemObj.actualItemRate = itemActualQuantity * result[issueIndex].getValue({
                        name: "rate",
                        summary: "AVG",
                        label: "Item Rate"
                    })
                    if (itemObj.actualItemRate == null || itemObj.actualItemRate == "") {
                        itemObj.actualItemRate = 0;
                    }
                    itemObj.workOrderId = workOrderId;
                    getActualItemDetailsFilterArray.push(itemObj)
                }
                start += 1000;
                end += 1000;
                workOrderIssueItemCount -= 1000;
            }
            while (workOrderIssueItemCount > 0);
            // log.debug({
            //     title: 'getActualItemDetailsFilterArray',
            //     details: JSON.stringify(getActualItemDetailsFilterArray)
            // })
            // if (workOrderIssueItemCount > 0) {
            getActualItemDetailsFilterArray.forEach(element => {
                let obj = workOrderEstimatedItemDataObj[element.workOrderId];
                if (obj && element.itemId in obj) {
                    obj[element.itemId]['actualQuantity'] = element.actualQuantity;
                    obj[element.itemId]['actualItemCost'] = parseFloat(element.actualItemRate);
                    obj[element.itemId]['actualItemCostCurrency'] = convertCurrency(parseFloat(element.actualItemRate));
                    obj[element.itemId]['differentiateQuantity'] = (parseFloat(obj[element.itemId]['sceEstimatedQuantity']) - parseFloat(element.actualQuantity)).toFixed(3);
                    obj[element.itemId]['differentiateItemCost'] = (parseFloat(obj[element.itemId]['sceEstimatedMaterialCost']) - parseFloat(element.actualItemRate));

                    obj[element.itemId]['differentiateItemCostCurrency'] = parseFloat(obj[element.itemId]['sceEstimatedMaterialCost']) - parseFloat(element.actualItemRate);
                    obj[element.itemId]['differentiateItemCostCurrency'] = convertCurrency(obj[element.itemId].differentiateItemCostCurrency)

                    obj[element.itemId].color = (parseFloat(obj[element.itemId]['sceEstimatedMaterialCost']) - parseFloat(element.actualItemRate)) >= 0 ? 'green' : 'red';
                }
            })
            // }
            // log.debug("PCT", "Work Order Actual Item Details Object After : " + JSON.stringify(workOrderEstimatedItemDataObj));
            return workOrderEstimatedItemDataObj;
        }
        // --------------------- Function for get actual Item Quantity End ( Account : 1.0, Search Id : 1591 ) ------------------------


        const getOperationData = (workOrderId, EstimateDataFromMFGOperationTask, ActualDataFromWOCompletion, sceId, sceDocumentNumber, workOrderNumber) => {
            let varianceReportObj = {}
            let estimatedDataObj = EstimateDataFromMFGOperationTask[workOrderId]
            if (estimatedDataObj != null) {
                let sceProcessArray = getSceProcess(sceId);
                Object.keys(estimatedDataObj).forEach(function (key) {
                    var varianceObj = {}
                    var estTotalSetupCost = 0;
                    var estTotalRunCost = 0;
                    if (!(workOrderId in varianceReportObj)) {
                        varianceReportObj[workOrderId] = {}
                    }
                    varianceObj.operationName = estimatedDataObj[key].operationName;
                    varianceObj.assemblyName = estimatedDataObj[key].assemblyName;
                    varianceObj.operationSequence = estimatedDataObj[key].operationSequence;
                    varianceObj.estRunTime = estimatedDataObj[key].estRunTime;
                    varianceObj.estSetupTime = estimatedDataObj[key].estSetupTime;
                    varianceObj.completedquantity = estimatedDataObj[key].completedquantity
                    varianceObj.machineresources = estimatedDataObj[key].machineResources;
                    varianceObj.laborResources = estimatedDataObj[key].laborResources;
                    varianceObj.totalMachineSetupRate = estimatedDataObj[key].machineSetUpRate;
                    varianceObj.totalLaborSetupRate = estimatedDataObj[key].laborSetUpRate;
                    varianceObj.totalMachineRunRate = estimatedDataObj[key].machineRunRate;
                    varianceObj.totalLaborRunRate = estimatedDataObj[key].laborRunRate;
                    // varianceObj.estimatedTotalProcessCost = estimatedDataObj[key].estimatedTotalProcessCost;
                    varianceObj.actRunTime = 0;
                    varianceObj.actSetupTime = 0;
                    varianceObj.actRunCost = 0;
                    varianceObj.actSetupCost = 0;
                    varianceObj.estRunCost = 0;
                    varianceObj.estSetupCost = 0;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence] = estimatedDataObj[key]
                    var operationWiseActualDataArray = [];
                    // log.debug("PCT-getOperationData ActualDataFromWOCompletion", ActualDataFromWOCompletion[workOrderId])
                    if (ActualDataFromWOCompletion[workOrderId]) {
                        if (ActualDataFromWOCompletion[workOrderId][key]) {
                            operationWiseActualDataArray = ActualDataFromWOCompletion[workOrderId][key]
                        }
                    }
                    var laborResources = 1
                    var machineResources = 1;
                    var totalSetupCost = 0;
                    var totalRunCost = 0;
                    var totalMachineTime = 0
                    var totalRunTime = 0
                    var totalSetupTime = 0
                    operationWiseActualDataArray.forEach(element => {
                        var labourRunTime = 0
                        var labourSetupTime = 0;
                        var MachineRunTime = 0
                        var MachineSetupTime = 0;
                        totalRunTime = parseFloat(totalRunTime) + CheckNull(parseFloat(element.laborruntime)) + CheckNull(parseFloat(element.machineruntime))
                        totalSetupTime = parseFloat(totalSetupTime) + CheckNull(parseFloat(element.laborsetuptime)) + CheckNull(parseFloat(element.machinesetuptime))
                        labourRunTime = parseFloat(labourRunTime) + CheckNull(parseFloat(element.laborruntime))
                        labourSetupTime = parseFloat(labourSetupTime) + CheckNull(parseFloat(element.laborsetuptime))
                        MachineRunTime = parseFloat(MachineRunTime) + CheckNull(parseFloat(element.machineruntime))
                        MachineSetupTime = parseFloat(MachineSetupTime) + CheckNull(parseFloat(element.machinesetuptime))
                        laborResources = element.laborresources
                        machineResources = element.machineresources
                        totalSetupCost = parseFloat(totalSetupCost) + parseFloat((varianceObj.totalMachineSetupRate / 60) * MachineSetupTime * machineResources) + parseFloat((varianceObj.totalLaborSetupRate / 60) * labourSetupTime * laborResources)
                        totalRunCost = parseFloat(totalRunCost) + parseFloat((varianceObj.totalMachineRunRate / 60) * MachineRunTime * machineResources) + parseFloat((varianceObj.totalLaborRunRate / 60) * labourRunTime * laborResources)
                        // log.debug({
                        //     title: 'varianceObj.totalLaborRunRate=' + varianceObj.totalLaborRunRate + 'labourRunTime ' + labourRunTime + ' laborResources =' + laborResources,
                        //     details: 'varianceObj.totalMachineRunRate =' + varianceObj.totalMachineRunRate + ' MachineRunTime =' + MachineRunTime + ' machineResources =' + machineResources
                        // })

                    });
                    estTotalSetupCost = parseFloat(estTotalSetupCost) + parseFloat((varianceObj.totalMachineSetupRate / 60) * varianceObj.estSetupTime * varianceObj.machineresources) + parseFloat((varianceObj.totalLaborSetupRate / 60) * varianceObj.estSetupTime * varianceObj.laborResources)
                    estTotalRunCost = parseFloat(estTotalRunCost) + parseFloat((varianceObj.totalMachineRunRate / 60) * varianceObj.estRunTime * varianceObj.machineresources) + parseFloat((varianceObj.totalLaborRunRate / 60) * varianceObj.estRunTime * varianceObj.laborResources)
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].actRunTime = totalRunTime;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].actSetupTime = totalSetupTime;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].actRunCost = totalRunCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].actSetupCost = totalSetupCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].actCost = (totalRunCost + totalSetupCost);
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].actCostCurrency = convertCurrency(totalRunCost + totalSetupCost);
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].estRunCost = estTotalRunCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].estSetupCost = estTotalSetupCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].differenceCost = estimatedDataObj[key].estimatedTotalProcessCost;
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].estCostCurrency = convertCurrency(estTotalRunCost + estTotalSetupCost);
                    // log.debug("PCT-Sandipan", "Estimated Price : " + estimatedDataObj[key].estimatedTotalProcessCost + ", Actual Cost : " + totalRunCost + totalSetupCost)
                    // log.debug("PCT-Sandipan", " Price Diff: " + estimatedDataObj[key].estimatedTotalProcessCost - (totalRunCost + totalSetupCost))
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].differenceCurrency = convertCurrency(estimatedDataObj[key].estimatedTotalProcessCost - (totalRunCost + totalSetupCost));
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].color = ((estTotalRunCost + estTotalSetupCost) - (totalRunCost + totalSetupCost)) >= 0 ? 'green' : 'red';
                    varianceReportObj[workOrderId][estimatedDataObj[key].operationSequence].estimatedTotalProcessCost = convertCurrency(estimatedDataObj[key].estimatedTotalProcessCost);

                });

                sceProcessArray.map((element) => {
                    if (!getAbsentProcessInWorkOrder(element.sceProcessName, element.operationSequence, workOrderId)) {
                        let sceProcessResponse = getSceProcessDetails(element.operationSequence, element.workCenter, sceId, workOrderId)

                        varianceReportObj[workOrderId][element.operationSequence] = {
                            "workOrderId": workOrderId,
                            "WorkOrderNumber": workOrderNumber,
                            "operationName": element.sceProcessId,
                            "operation": element.sceProcessName,
                            "assemblyName": "",
                            "operationSequence": element.operationSequence,
                            "sceDocumentNumber": sceDocumentNumber,
                            "estimatedTotalProcessCost": convertCurrency(sceProcessResponse.estimatedTotalProcessCost),
                            "estimatedTotalSetupTime": sceProcessResponse.estimatedTotalSetupTime,
                            "estimatedTotalRunTime": sceProcessResponse.estimatedTotalRunTime,
                            "estRunTime": 0,
                            "estSetupTime": 0,
                            "machineResources": "1",
                            "laborResources": "1",
                            "completedquantity": 0,
                            "machineSetUpRate": 0,
                            "laborSetUpRate": 90,
                            "machineRunRate": 0,
                            "laborRunRate": 90,
                            "actRunTime": 0,
                            "actSetupTime": 0,
                            "actRunCost": 0,
                            "actSetupCost": 0,
                            "actCost": 0,
                            "actCostCurrency": convertCurrency(0),
                            "estRunCost": 0,
                            "estSetupCost": 0,
                            "estCost": 0,
                            "differenceCost": sceProcessResponse.estimatedTotalProcessCost,
                            "estCostCurrency": convertCurrency(0),
                            "differenceCurrency": convertCurrency(sceProcessResponse.estimatedTotalProcessCost),
                            "color": "green"

                        }
                    }

                })
            }
            log.debug("PCT-varianceReportObj", varianceReportObj)
            return varianceReportObj;
        }
        const getActualDataFromWOCompletion = (completionRecordIdArray) => {


            let actOperationNameObj = {};

            completionRecordIdArray.forEach(element => {

                var recordData = record.load({
                    type: record.Type.WORK_ORDER_COMPLETION,
                    id: element,
                    isDynamic: true
                })
                var workOrderId = recordData.getValue('createdfrom')
                var operationLineCount = recordData.getLineCount({
                    sublistId: 'operation'
                })
                for (var opLineIndex = 0; opLineIndex < operationLineCount; opLineIndex++) {
                    recordData.selectLine({
                        sublistId: 'operation',
                        line: opLineIndex
                    })

                    var actOperationObj = {}
                    actOperationObj.OperanceSecquence = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'operationsequence'
                    })
                    actOperationObj.operationName = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'taskid'//'operationname'
                    })
                    actOperationObj.operation = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'taskid'//'operationname'
                    })
                    actOperationObj.laborruntime = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborruntime'
                    })
                    actOperationObj.laborsetuptime = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborsetuptime'
                    })
                    actOperationObj.machineruntime = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineruntime'
                    })
                    actOperationObj.machinesetuptime = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machinesetuptime'
                    })
                    actOperationObj.machineresources = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'machineresources'
                    })
                    actOperationObj.laborresources = recordData.getCurrentSublistValue({
                        sublistId: 'operation',
                        fieldId: 'laborresources'
                    })
                    if (!(workOrderId in actOperationNameObj)) {
                        actOperationNameObj[workOrderId] = {}
                        if (actOperationNameObj[workOrderId][actOperationObj.operationName] == null) {
                            actOperationNameObj[workOrderId][actOperationObj.operationName] = []
                        }
                        actOperationNameObj[workOrderId][actOperationObj.operationName].push(actOperationObj)
                        //  log.audit("PCT-If", actOperationNameObj);
                    }
                    else {
                        if (actOperationNameObj[workOrderId][actOperationObj.operationName] == null) {
                            actOperationNameObj[workOrderId][actOperationObj.operationName] = []
                        }
                        actOperationNameObj[workOrderId][actOperationObj.operationName].push(actOperationObj)
                        // log.audit("PCT-Else", actOperationNameObj);
                    }
                }
            });
            // log.audit({
            //     title: 'actOperationNameObj',
            //     details: JSON.stringify(actOperationNameObj)
            // })
            return actOperationNameObj;
        }


        // --------------------- Function for get Costing Type Start ( Account : 1.0, Search Id : 1604 ) ------------------------
        const getEstimateDataFromMFGOperationTask = (workOrderArray, costCategoryObj, sceId, sceDocumentNumber) => {
            var manufacturingoperationtaskSearchObj = search.create({
                type: "manufacturingoperationtask",
                filters:
                    [
                        ["workorder.internalid", "anyof", workOrderArray]
                    ],
                columns:
                    [
                        search.createColumn({ name: "name", label: "Operation Name" }),
                        search.createColumn({ name: "sequence", label: "Operation Sequence" }),
                        search.createColumn({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" }),
                        search.createColumn({ name: "startdate", label: "Start Date" }),
                        search.createColumn({ name: "enddate", label: "End Date" }),
                        search.createColumn({ name: "estimatedwork", label: "Estimated Work" }),
                        search.createColumn({ name: "status", label: "Status" }),
                        search.createColumn({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" }),
                        search.createColumn({ name: "actualruntime", label: "Actual Run Time" }),
                        search.createColumn({ name: "actualsetuptime", label: "Actual Setup Time" }),
                        search.createColumn({ name: "runtime", label: "Run Time" }),
                        search.createColumn({ name: "setuptime", label: "Setup Time (Min)" }),
                        search.createColumn({ name: "machineresources", label: "Machine Resources" }),
                        search.createColumn({ name: "laborresources", label: "Labor Resources" }),
                        search.createColumn({ name: "internalid", join: "workorder", label: "Work Order" }),
                        search.createColumn({ name: "completedquantity", label: "Completed Quantity" }),
                        search.createColumn({ name: "runrate", label: "Run Rate (Min/Unit)" }),
                        search.createColumn({
                            name: "tranid",
                            join: "workOrder",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "item",
                            join: "workOrder",
                            label: "Item"
                        })
                    ]
            });
            let operationNameObj = {};
            var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
            // log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
            manufacturingoperationtaskSearchObj.run().each(function (result) {
                let operationObj = {};
                let sceProcessResponse = getSceProcessDetails(result.getValue({ name: "sequence", label: "Operation Sequence" }), result.getValue({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" }), sceId, result.getValue({ name: "internalid", join: "workorder", label: "Work Order" }))
                let MFGOperationTaskId = result.id
                let costObj = { 'totalMachineSetupRate': 0, 'totalLaborSetupRate': 0, 'totalLaborRunRate': 0, 'totalMachineRunRate': 0 };
                if (MFGOperationTaskId > 0) {
                    costObj = getCostDataFromMFGOperationTask(MFGOperationTaskId, costCategoryObj)
                }
                let workOrderId = result.getValue({ name: "internalid", join: "workorder", label: "Work Order" })
                operationObj.workOrderId = workOrderId
                operationObj.WorkOrderNumber = result.getValue({
                    name: "tranid",
                    join: "workOrder",
                    label: "Document Number"
                })
                operationObj.operationName = result.id
                operationObj.operation = result.getValue({ name: "name", label: "Operation Name" })
                operationObj.assemblyName = result.getText({ name: "item", join: "workOrder", label: "Item" })
                operationObj.operationSequence = result.getValue({ name: "sequence", label: "Operation Sequence" })
                // log.debug("PCT-COST ", sceProcessResponse)
                operationObj.sceDocumentNumber = sceDocumentNumber;
                operationObj.estimatedTotalProcessCost = sceProcessResponse.estimatedTotalProcessCost
                operationObj.estimatedTotalSetupTime = sceProcessResponse.estimatedTotalSetupTime
                operationObj.estimatedTotalRunTime = sceProcessResponse.estimatedTotalRunTime
                operationObj.estRunTime = (parseFloat(result.getValue({ name: "runrate", label: "Run Rate (Min/Unit)" })) * result.getValue({ name: "completedquantity", label: "completedquantity" })).toFixed(3)
                operationObj.estSetupTime = result.getValue({ name: "setuptime", label: "Setup Time (Min)" })
                operationObj.machineResources = result.getValue({ name: "machineresources", label: "Machine Resources" })
                operationObj.laborResources = result.getValue({ name: "laborresources", label: "Labor Resources" })
                operationObj.completedquantity = result.getValue({ name: "completedquantity", label: "completedquantity" })
                operationObj.machineSetUpRate = CheckNull(costObj.totalMachineSetupRate)
                operationObj.laborSetUpRate = CheckNull(costObj.totalLaborSetupRate)
                operationObj.machineRunRate = CheckNull(costObj.totalMachineRunRate)
                operationObj.laborRunRate = CheckNull(costObj.totalLaborRunRate)



                if (!(workOrderId in operationNameObj)) {
                    operationNameObj[workOrderId] = {}
                    operationNameObj[workOrderId][operationObj.operationName] = operationObj
                }
                else {
                    operationNameObj[workOrderId][operationObj.operationName] = operationObj
                }

                return true;
            });

            // log.debug("PCT", "Costing Category Object : " + JSON.stringify(operationNameObj));
            return operationNameObj;
        }
        // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------



        // --------------------- Function for get Costing Type Start ( Account : 1.0, Search Id : 1593 ) ------------------------
        const getCostingCategory = () => {
            let costCategoryObj = {};
            var costcategorySearchObj = search.create({
                type: "costcategory",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "itemcosttype", label: "Cost Type" })
                    ]
            });
            var costingCategoryCount = costcategorySearchObj.runPaged().count;
            //  log.debug("PCT", "Costing Category Count : " + costingCategoryCount);

            costcategorySearchObj.run().each(function (result) {
                let categoryObj = {};
                categoryObj.id = result.id;
                categoryObj.name = result.getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                });
                categoryObj.costType = result.getValue({ name: "itemcosttype", label: "Cost Type" });
                if (!(categoryObj.name in costCategoryObj)) {
                    costCategoryObj[categoryObj.name] = {}
                    costCategoryObj[categoryObj.name] = categoryObj
                }
                else {
                    costCategoryObj[categoryObj.name] = categoryObj
                }
                return true;
            });

            //  log.debug("PCT", "Costing Category Object : " + JSON.stringify(costCategoryObj));
            return costCategoryObj;
        }
        // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------

        const getCompletionRecordId = (workOrderId) => {
            let completionRecordIdArray = [];
            let workordercompletionSearchObj = search.create({
                type: "workordercompletion",
                filters:
                    [
                        ["type", "anyof", "WOCompl"],
                        "AND",
                        ["createdfrom", "anyof", workOrderId],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [

                        search.createColumn({ name: "tranid", label: "Document Number" }),
                    ]
            });
            // let searchResultCount = workordercompletionSearchObj.runPaged().count;
            // log.debug("workordercompletionSearchObj result count", searchResultCount);
            workordercompletionSearchObj.run().each(function (result) {
                completionRecordIdArray.push(result.id)
                return true;
            });

            return completionRecordIdArray;
        }

        const getCostDataFromMFGOperationTask = (MFGOperationTaskId, costCategoryObj) => {
            var recordData = record.load({
                type: record.Type.MANUFACTURING_OPERATION_TASK,
                id: MFGOperationTaskId,
                isDynamic: true
            })
            var costdetailLineCount = recordData.getLineCount({
                sublistId: 'costdetail'
            })

            let totalLaborSetupRate = 0;
            let totalMachineSetupRate = 0;
            let totalLaborRunRate = 0;
            let totalMachineRunRate = 0;
            for (var opLineIndex = 0; opLineIndex < costdetailLineCount; opLineIndex++) {
                recordData.selectLine({
                    sublistId: 'costdetail',
                    line: opLineIndex
                })
                var costCategory = recordData.getCurrentSublistText({
                    sublistId: 'costdetail',
                    fieldId: 'costcategory'
                })
                var runrate = recordData.getCurrentSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'runrate'
                })
                var fixedrate = recordData.getCurrentSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'fixedrate'
                })
                var labor = recordData.getCurrentSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'labor'
                })

                var overhead = recordData.getCurrentSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'overhead'
                })
                var setup = recordData.getCurrentSublistValue({
                    sublistId: 'costdetail',
                    fieldId: 'setup'
                })
                let costCategoryType = ''
                if (costCategoryObj[costCategory]) {
                    costCategoryType = costCategoryObj[costCategory].costType;
                }


                if (parseFloat(fixedrate) > 0 && !isNaN(fixedrate)) {
                    if (costCategoryType.includes('LABORSETUP')) {
                        totalLaborSetupRate = parseFloat(totalLaborSetupRate) + parseFloat(fixedrate)
                    }
                    if (costCategoryType.includes('MACHINESETUP')) {
                        totalMachineSetupRate = parseFloat(totalMachineSetupRate) + parseFloat(fixedrate)
                    }
                }
                //if(labor == true)
                if (parseFloat(runrate) > 0 && !isNaN(runrate)) {
                    if (costCategoryType.includes('LABORRUN')) {
                        totalLaborRunRate = parseFloat(totalLaborRunRate) + parseFloat(runrate)
                    }
                    if (costCategoryType.includes('MACHINERUN')) {
                        totalMachineRunRate = parseFloat(totalMachineRunRate) + parseFloat(runrate)
                    }

                }

            }

            return { 'totalLaborSetupRate': totalLaborSetupRate, 'totalMachineSetupRate': totalMachineSetupRate, 'totalLaborRunRate': totalLaborRunRate, 'totalMachineRunRate': totalMachineRunRate }
        }
        // ---------------------------- Get Strouse Cost Estimation Details Start -------------------------------
        const getSceItemDetails = (item, sceId) => {
            var customrecord_pct_itemsSearchObj = search.create({
                type: "customrecord_pct_items",
                filters:
                    [
                        ["custrecord_pct_items", "anyof", item],
                        "AND",
                        ["custrecord_pct_link_to_pct_config.internalid", "anyof", sceId],

                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_pct_order_qty",
                            join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
                            summary: "GROUP",
                            label: "Order Qty"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
                            summary: "GROUP",
                            label: "ID"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_cpqitem_total_qty_perunit",
                            summary: "SUM",
                            label: "Total Quantity per Unit"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_config_items_total_cost",
                            summary: "SUM",
                            label: "Total Cost"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
                            summary: "GROUP",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_items",
                            summary: "GROUP",
                            label: "Item"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_config_item_unit_type",
                            summary: "GROUP",
                            label: "Units Type"
                        })
                    ]
            });
            var searchResultCount = customrecord_pct_itemsSearchObj.runPaged().count;
            // log.debug("customrecord_pct_itemsSearchObj result count", searchResultCount);
            let sceObject = {}
            if (searchResultCount > 0) {
                customrecord_pct_itemsSearchObj.run().each(function (result) {

                    sceObject['sceEstimatedQuantity'] = (result.getValue({
                        name: "custrecord_pct_order_qty",
                        join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
                        summary: "GROUP",
                        label: "Order Qty"
                    }) * result.getValue({ name: "custrecord_pct_cpqitem_total_qty_perunit", summary: "SUM", label: "Total Quantity per Unit" })).toFixed(3)
                    sceObject['sceEstimatedMaterialCost'] = parseFloat(CheckNull(result.getValue({ name: "custrecord_pct_config_items_total_cost", summary: "SUM", label: "Total Cost" })))
                    sceObject['sceNumber'] = result.getValue({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
                        summary: "GROUP",
                        label: "Internal ID"
                    })
                    sceObject['internalId'] = result.getValue({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
                        label: "Internal ID"
                    });
                    sceObject['item'] = result.getText({ name: "custrecord_pct_items", summary: "GROUP", label: "Item" })
                    sceObject['unit'] = result.getText({
                        name: "custrecord_pct_config_item_unit_type",
                        summary: "GROUP",
                        label: "Units Type"
                    });
                    return true;
                });
            }
            // log.debug("PCT-SCE", sceObject)
            return sceObject;

        }
        // const getLatestSceId = (assemblyName) => {
        //     let sceObj = {
        //         'sceId': 0,
        //         'sceNumber': 'N/A',
        //         'sceQty': 0
        //     }
        //     var customrecord_pct_configureSearchObj = search.create({
        //         type: "customrecord_pct_configure",
        //         filters:
        //             [
        //                 // ["custrecord_pct_cpq_linked_itemno", "anyof", assemblyName]
        //                 ["custrecord_pct_sc_assname", "is", assemblyName]
        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "internalid", label: "Internal ID" }),
        //                 search.createColumn({ name: "name", label: "ID" }),
        //                 search.createColumn({ name: "custrecord_pct_order_qty", label: "ORDER QTY" }),
        //             ]
        //     });
        //     var searchResultCount = customrecord_pct_configureSearchObj.runPaged().count;
        //     // log.debug("customrecord_pct_configureSearchObj result count", searchResultCount);

        //     customrecord_pct_configureSearchObj.run().each(function (result) {
        //         sceObj['sceId'] = result.getValue({ name: "internalid", label: "Internal ID" })
        //         sceObj['sceNumber'] = result.getValue({ name: "name", label: "ID" })
        //         sceObj['sceQty'] = result.getValue({ name: "custrecord_pct_order_qty", label: "ORDER QTY" })
        //         // log.debug("PCT-sceNumber", sceNumber)
        //         return true;
        //     });
        //     // log.debug("PCT-sceId", sceId)
        //     return sceObj;
        // }
        const getAssembly = (workOrderId) => {
            let assemblyName;
            var workorderSearchObj = search.create({
                type: "workorder",
                settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                filters:
                    [
                        ["type", "anyof", "WorkOrd"],
                        "AND",
                        ["internalid", "anyof", workOrderId],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({
                            name: "itemid",
                            join: "item",
                            label: "Name"
                        })
                    ]
            });
            var searchResultCount = workorderSearchObj.runPaged().count;
            // log.debug("workorderSearchObj result count", searchResultCount);
            workorderSearchObj.run().each(function (result) {
                assemblyName = result.getValue({
                    name: "itemid",
                    join: "item",
                    label: "Name"
                })
                return true;
            });
            // log.debug("PCT-assemblyName", assemblyName)
            return assemblyName;

        }
        // ---------------------------- Get Strouse Cost Estimation Details End -------------------------------
        // const getSceItem = (sceId) => {
        //     let itemArray = [];
        //     var customrecord_pct_configureSearchObj = search.create({
        //         type: "customrecord_pct_configure",
        //         filters:
        //             [
        //                 ["internalid", "anyof", sceId],

        //             ],
        //         columns:
        //             [
        //                 search.createColumn({ name: "internalid", label: "Internal ID" }),
        //                 search.createColumn({
        //                     name: "custrecord_pct_items",
        //                     join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
        //                     label: "Item"
        //                 })
        //             ]
        //     });
        //     var searchResultCount = customrecord_pct_configureSearchObj.runPaged().count;
        //     // log.debug("customrecord_pct_configureSearchObj result count", searchResultCount);
        //     customrecord_pct_configureSearchObj.run().each(function (result) {
        //         itemArray.push(result.getValue({
        //             name: "custrecord_pct_items",
        //             join: "CUSTRECORD_PCT_LINK_TO_PCT_CONFIG",
        //             label: "Item"
        //         }))
        //         return true;
        //     });
        //     // log.debug("PCT-SCE-Item-Array", itemArray)
        //     return itemArray;
        // }
        const getSceItem = (sceId) => {

            let itemArray = [];
            var customrecord_pct_itemsSearchObj = search.create({
                type: "customrecord_pct_items",
                filters:
                    [
                        ["custrecord_pct_link_to_pct_config", "anyof", sceId],
                        "AND",
                        ["custrecord_pct_items.type", "anyof", "Assembly", "InvtPart"],
                        "AND",
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_items", label: "Item" }),
                        search.createColumn({
                            name: "type",
                            join: "CUSTRECORD_PCT_ITEMS",
                            label: "Type"
                        })
                    ]
            });
            var searchResultCount = customrecord_pct_itemsSearchObj.runPaged().count;
            // log.debug("customrecord_pct_itemsSearchObj result count", searchResultCount);
            customrecord_pct_itemsSearchObj.run().each(function (result) {
                itemArray.push(result.getValue({ name: "custrecord_pct_items", label: "Item" }))
                return true;
            });
            // log.debug("PCT-Item Array ", itemArray)
            return itemArray;

        }
        const getAbsentItemInWorkOrder = (item, workOrderId) => {
            var workorderSearchObj = search.create({
                type: "workorder",
                settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                filters:
                    [
                        ["type", "anyof", "WorkOrd"],
                        "AND",
                        ["item", "anyof", item],
                        "AND",
                        ["internalid", "anyof", workOrderId]
                    ],
                columns: []
            });
            var searchResultCount = workorderSearchObj.runPaged().count;
            // log.debug("workorderSearchObj result count", searchResultCount);
            return searchResultCount;
        }
        const getSceProcessDetails = (operationSequence, workCenter, sceId, workOrderId) => {
            log.debug("PCT-getSceProcessDetails", operationSequence + ",workCenter : " + workCenter + ",sceId : " + sceId + ",workOrderId : " + workOrderId)
            var customrecord_pct_processesSearchObj = search.create({
                type: "customrecord_pct_processes",
                filters:
                    [
                        ["custrecord_pct_cpq_linkpctconfprocesteps", "anyof", sceId],
                        "AND",
                        ["custrecord_pct_cpq_s_no", "equalto", operationSequence],
                        "AND",
                        ["custrecord_pct_cpq_prost_work_center", "anyof", workCenter]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_cpq_total_time_in_min", label: "Time per Unit(in Min)" }),
                        search.createColumn({
                            name: "custrecord_pct_order_qty",
                            join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                            label: "Order Qty"
                        }),
                        search.createColumn({ name: "custrecord_pct_config_process_total_cost", label: "Total Process Cost" }),
                        search.createColumn({ name: "custrecord_pct_sc_setup_time_inmin", label: "Setup Time (In Min)" })
                    ]
            });
            var searchResultCount = customrecord_pct_processesSearchObj.runPaged().count;
            log.debug("customrecord_pct_processesSearchObj result count", searchResultCount);
            let sceProcessObject = {
                'estimatedTotalRunTime': 0,
                'estimatedTotalSetupTime': 0,
                'estimatedTotalProcessCost': 0
            }
            if (searchResultCount > 0) {
                customrecord_pct_processesSearchObj.run().each(function (result) {
                    sceProcessObject['estimatedTotalRunTime'] = (result.getValue({
                        name: "custrecord_pct_order_qty",
                        join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                        label: "Order Qty"
                    }) * result.getValue({ name: "custrecord_pct_cpq_total_time_in_min", label: "Time per Unit(in Min)" })).toFixed(3);
                    sceProcessObject['estimatedTotalSetupTime'] = parseFloat(result.getValue({ name: "custrecord_pct_sc_setup_time_inmin", label: "Setup Time (In Min)" })).toFixed(3);
                    sceProcessObject['estimatedTotalProcessCost'] = parseFloat(result.getValue({ name: "custrecord_pct_config_process_total_cost", label: "Total Process Cost" })).toFixed(3)
                    return true;
                });
            }

            // log.debug("PCT-sceProcessObject", JSON.stringify(sceProcessObject))
            return sceProcessObject;
        }

        const getSceProcess = (sceId) => {
            let processArray = [];
            var customrecord_pct_configureSearchObj = search.create({
                type: "customrecord_pct_configure",
                filters:
                    [
                        ["internalid", "anyof", sceId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_pct_cpq_processes",
                            join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                            label: "Processes"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_cpq_s_no",
                            join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                            label: "S.NO"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_cpq_prost_work_center",
                            join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                            label: "Manufacturing WorkCenter"
                        })
                    ]
            });
            var searchResultCount = customrecord_pct_configureSearchObj.runPaged().count;
            //  log.debug("customrecord_pct_configureSearchObj result count",searchResultCount);
            customrecord_pct_configureSearchObj.run().each(function (result) {
                let processObj = {};
                processObj['sceProcessName'] = result.getText({
                    name: "custrecord_pct_cpq_processes",
                    join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                    label: "Processes"
                })
                processObj['sceProcessId'] = result.getValue({
                    name: "custrecord_pct_cpq_processes",
                    join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                    label: "Processes"
                })
                processObj['operationSequence'] = result.getValue({
                    name: "custrecord_pct_cpq_s_no",
                    join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                    label: "S.NO"
                })
                processObj['workCenter'] = result.getValue({
                    name: "custrecord_pct_cpq_prost_work_center",
                    join: "CUSTRECORD_PCT_CPQ_LINKPCTCONFPROCESTEPS",
                    label: "Manufacturing WorkCenter"
                })
                processArray.push(processObj)
                return true;
            });
            // log.debug("PCT-SCE-Process-Array", processArray)
            return processArray;
        }

        const getAbsentProcessInWorkOrder = (operationName, operationSequence, workOrderId) => {
            var workorderSearchObj = search.create({
                type: "workorder",
                settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                filters:
                    [
                        ["type", "anyof", "WorkOrd"],
                        "AND",
                        ["internalid", "anyof", workOrderId],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["manufacturingoperationtask.name", "is", operationName],
                        "AND",
                        ["manufacturingoperationtask.sequence", "equalto", operationSequence]
                    ],
                columns:
                    [
                        search.createColumn({ name: "item", label: "Item" })
                    ]
            });
            var searchResultCount = workorderSearchObj.runPaged().count;
            //  log.debug("workorderSearchObj result count",searchResultCount);
            return searchResultCount;
        }




        getWorkOrderBuiltQuantity = (workOrderId) => {
            var workorderSearchObj = search.create({
                type: "workorder",
                settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                filters:
                    [
                        ["type", "anyof", "WorkOrd"],
                        "AND",
                        ["internalid", "anyof", workOrderId],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "built", label: "Built" }),
                        search.createColumn({ name: "quantity", label: "Quantity" })
                    ]
            });
            var searchResultCount = workorderSearchObj.runPaged().count;
            // log.debug("workorderSearchObj result count", searchResultCount);
            let workOrderObj = {
                'builtQuantity': 0,
                'quantity': 0
            };
            workorderSearchObj.run().each(function (result) {
                workOrderObj['builtQuantity'] = result.getValue({ name: "built", label: "Built" });
                workOrderObj['quantity'] = result.getValue({ name: "quantity", label: "Quantity" });
                return true;
            });
            return workOrderObj;

        }

        const CheckNull = (val) => {
            if (val == '' || val == undefined || isNaN(val)) {
                val = 0
            }
            return val;
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        }
    });
