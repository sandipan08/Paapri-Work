/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/log', 'N/runtime', 'N/file', 'N/search', 'N/file', 'N/render', 'N/record', 'N/task', 'N/redirect'], function (log, runtime, file, search, file, render, record, task, redirect) {
    const usageLinit = 300;
    function onRequest(context) {

        const response = context.response;
        const request = context.request;
        if (request.method === 'GET') {
            let recordId = request.parameters.customRecordId;



            let fileData = '';

            if (parseInt(recordId) > 0) {
                let recordObj = record.load({
                    type: 'customrecord_pct_wov_data_store',
                    id: recordId,
                    isDynamic: true
                })
                let fileId = recordObj.getValue({
                    fieldId: 'custrecord_pct_wov_data_store_json_data'
                })
                if (fileId > 0) {
                    fileData = JSON.parse(file.load({
                        id: fileId
                    }).getContents())
                }
            }
            renderedHTMLPage(fileData, context, recordId)



            log.debug("PCT", "Script Usage Check in SuiteLet : " + runtime.getCurrentScript().getRemainingUsage())
        } else {
            let reportObj = {}
            let vorkOrderValueArray = []
            let workOrderArry = []
            let filterType = request.parameters.filterType;
            log.audit({
                title: 'POST filterType',
                details: filterType
            })
            if (filterType == 1) {
                let workOrderInternalId = request.parameters.workOrder
                workOrderArry.push(workOrderInternalId)
            } else if (filterType == 2) {
                let item = request.parameters.itemValue;
                let toDate = request.parameters.toDate;
                let fromDate = request.parameters.fromDate;
                log.debug("PCT", "Item : " + item + ", From Date : " + fromDate + ", To Date : " + toDate)
                workOrderArry = getWorkOrderFromItem(item, toDate, fromDate)
            }
            else if (filterType == 3) {
                let toDate = request.parameters.toDate;
                let fromDate = request.parameters.fromDate;
                log.debug("PCT",  ", From Date : " + fromDate + ", To Date : " + toDate)
                
                workOrderArry = getWorkOrderByDate(toDate, fromDate)
            }
            log.debug('PCT WO ARRAY ', workOrderArry)
            // let costCategoryObj = {}
            // costCategoryObj = getCostingCategory();

            // //Copy Code From MR 

            // workOrderArry.forEach(workOrderId => {


            //     let workOrderEstimatedItemDataObj = {};
            //     let workOrderItemDataObj = {};
            //     let varianceReportOperationObj = {}




            //     //let costCategoryObj = JSON.parse(ValueObj)['costCategoryObj']


            //     // let customReocrdId = JSON.parse(ValueObj)['customReocrdId']

            //     let workOrderObj = record.load({
            //         type: record.Type.WORK_ORDER,
            //         id: workOrderId,
            //         isDynamic: true
            //     })

            //     // ------------------------------ Operation Function Start ---------------------------
            //     let EstimateDataFromMFGOperationTask = {};
            //     let ActualDataFromWOCompletion = {}
            //     let completionRecordIdArray = getCompletionRecordId(workOrderId)
            //     if (getRemainingUsageUnit() >= usageLinit) {
            //         EstimateDataFromMFGOperationTask = getEstimateDataFromMFGOperationTask(workOrderId, costCategoryObj);
            //     }
            //     if (getRemainingUsageUnit() >= usageLinit) {
            //         ActualDataFromWOCompletion = getActualDataFromWOCompletion(completionRecordIdArray, workOrderArry, context)
            //     }
            //     if (getRemainingUsageUnit() >= usageLinit) {
            //         // checkRemainingUsage(workOrderArry,reportObj, context)
            //         varianceReportOperationObj = getOperationData(workOrderId, EstimateDataFromMFGOperationTask, ActualDataFromWOCompletion)
            //     }
            //     //checkRemainingUsage(workOrderArry, reportObj, context)
            //     // ------------------------------ Operation Function End ---------------------------

            //     // ------------------------------ Material Operation Start ---------------------------
            //     if (getRemainingUsageUnit() >= usageLinit) {
            //         workOrderEstimatedItemDataObj = getEstimatedItemDetails(workOrderId);
            //         //checkRemainingUsage(workOrderArry, reportObj, context)
            //         workOrderItemDataObj = getActualItemDetails(workOrderEstimatedItemDataObj, workOrderId);
            //     }

            //     // ------------------------------ Material Operation End ---------------------------

            //     var WorkOrderWiseVarianceReprtObj = {};
            //     //  WorkOrderWiseVarianceReprtObj[workOrderId] = {}

            //     let dataObj = {}
            //     dataObj.workOrderId = workOrderId
            //     dataObj.varianceReportOperationObj = varianceReportOperationObj;
            //     dataObj.workOrderItemDataObj = workOrderItemDataObj;
            //     dataObj.workOrderNumber = workOrderObj.getValue('tranid')
            //     dataObj.assemblyItem = workOrderObj.getText('assemblyitem')

            //     //  WorkOrderWiseVarianceReprtObj[workOrderId] = {}
            //     WorkOrderWiseVarianceReprtObj = dataObj;

            //     vorkOrderValueArray.push(WorkOrderWiseVarianceReprtObj)

            // });


            // let WorkOrderWiseVarianceOperationData = []
            // let WorkOrderWiseVarianceItemData = [];
            // let WorkOrderWiseVarianceData = [];


            // vorkOrderValueArray.forEach((element, index) => {
            //     let totalPlannedCost = 0;
            //     let totalActualCost = 0;
            //     let workOrderNumber = ''
            //     log.debug({
            //         title: 'element',
            //         details: typeof element
            //     })
            //     let varianceOperationObj = element.varianceReportOperationObj[element.workOrderId]//[element.workOrderId]
            //     let varianceItemObj = element.workOrderItemDataObj[element.workOrderId]
            //     log.debug({
            //         title: 'varianceReportOperationObj workOrderId',
            //         details: varianceOperationObj
            //     })

            //     if (varianceOperationObj != null) {
            //         Object.keys(varianceOperationObj).forEach(key => {
            //             WorkOrderWiseVarianceOperationData.push(varianceOperationObj[key])
            //             totalActualCost = parseFloat(totalActualCost) + CheckNull(varianceOperationObj[key].actCost)
            //             totalPlannedCost = parseFloat(totalPlannedCost) + CheckNull(varianceOperationObj[key].estCost)
            //         });
            //     }
            //     if (varianceItemObj != null) {
            //         Object.keys(varianceItemObj).forEach(key => {

            //             WorkOrderWiseVarianceItemData.push(varianceItemObj[key])
            //             totalActualCost = parseFloat(totalActualCost) + CheckNull(varianceItemObj[key].actualItemCost)
            //             totalPlannedCost = parseFloat(totalPlannedCost) + CheckNull(varianceItemObj[key].estimatedItemAmount)
            //         });
            //     }

            //     // dataObj.workOrderNumber = result.getValue('tranid')
            //     //dataObj.assemblyItem = result.getText('assemblyitem')

            //     var summaryObj = {};
            //     summaryObj.workOrderNumber = element.workOrderNumber
            //     summaryObj.assemblyItem = element.assemblyItem
            //     summaryObj.totalActualCost = totalActualCost
            //     summaryObj.totalPlannedCost = totalPlannedCost
            //     summaryObj.totalVariance = totalPlannedCost - totalActualCost
            //     summaryObj.color = (summaryObj.totalVariance) >= 0 ? 'green' : 'red';
            //     WorkOrderWiseVarianceData.push(summaryObj)
            //     // if (!(workOrderId.workOrderId in WorkOrderWiseVarianceOperationData)) {
            //     //     WorkOrderWiseVarianceOperationData[workOrderId.workOrderId] = {}
            //     // }
            // });
            // reportObj.WorkOrderWiseVarianceOperationData = WorkOrderWiseVarianceOperationData
            // reportObj.WorkOrderWiseVarianceItemData = WorkOrderWiseVarianceItemData
            // reportObj.WorkOrderWiseVarianceData = WorkOrderWiseVarianceData


            // // var fileObject = file.create({
            // //     name: 'Work Order Report',
            // //     fileType: file.Type.JSON,
            // //     contents: JSON.stringify(reportObj),
            // //     // description: string,
            // //     folder: 8114,
            // //     //encoding: file.Encoding.UTF8,
            // //     // isInactive: boolean,
            // //     isOnline: true
            // // })
            // // var fileId = fileObject.save();

            // renderedHTMLPage(reportObj, context, null)
            //            if (getRemainingUsageUnit() >= usageLinit) {
            //                renderedHTMLPage(reportObj, context, null)
            //            } else {
            checkRemainingUsage(workOrderArry, reportObj, context)
            //  }


        }
    }
    const getRemainingUsageUnit = () => {
        return remainingUsage = runtime.getCurrentScript().getRemainingUsage();
    }

    const checkRemainingUsage = (workOrders, reportObj, context) => {
        let remainingUsage = runtime.getCurrentScript().getRemainingUsage();
        //if (remainingUsage <= usageLinit) {
        log.audit({
            title: 'remainingUsage',
            details: remainingUsage
        })
        let customRecordId = callSchedule(workOrders)
        redirect.toSuitelet({
            scriptId: 'customscript_pct_wo_variance_suitelet',
            deploymentId: 'customdeploy_pct_wo_variance_suitelet',
            isExternal: false,
            parameters: {
                'fileData': null,
                'customRecordId': customRecordId,
                'custparam_success': 1,

            }

        });
        log.audit({
            title: 'redirect Suitelet',
            details: 'customRecordId =' + customRecordId
        })

        // renderedHTMLPage(reportObj, context,customRecordId)
        return false;
        // }
    }

    // --------------------- Call Schedule to get Table Data Start ------------------------
    const callSchedule = (workOrders) => {
        let customRecordId = 0
        if (workOrders.length) {
            customRecordId = createCustomRecord(1)
        }
        else {
            customRecordId = createCustomRecord(3)
        }
        log.debug("PCT", "In Schedule Call Function : " + workOrders)
        let scriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
        scriptTask.scriptId = 'customscript_pct_mr_work_order_variance';
        //scriptTask.deploymentId = 'customdeploy_pct_wov_get_table_data';
        scriptTask.params = {
            custscript_pct_wov_work_order_list: workOrders,
            custscript_pct_wo_variance_report_id: customRecordId
        };
        var myTaskId = scriptTask.submit();

        return customRecordId;
    }
    // --------------------- Call Schedule to get Table Data End ------------------------

    const createCustomRecord = (status) => {
        return workOrderVarianceDataStoreRecordId = record.create({
            type: 'customrecord_pct_wov_data_store',
            isDynamic: true
        }).setValue({
            fieldId: 'custrecord_pct_wov_data_store_status',
            value: status,
            ignoreFieldChange: true
        }).save();
        // log.debug("PCT", "Created Work Order Variance Record Id : " + workOrderVarianceDataStoreRecordId)
    }


    const renderedHTMLPage = (reportObj, context, customRecordId) => {
        //render to report Page 
        let htmlContent = file.load({
            id: `../View/PCT Work Order Variance.html`
        }).getContents();

        let fileData = reportObj/*JSON.parse(file.load({
            id: fileId
        }).getContents())*/
        var dataSource = {
            fileData: fileData,
            customRecordId: customRecordId
        }

        let pathObj = [
            {
                'fileType': 'controller',
                'localPath': '../Controller/PCT WOV Report Controller.js'
            },
            {
                'fileType': 'logo',
                'localPath': '../Assets/paapri_logo.png'
            },
        ];
        let utilityUrlObj = getUtilityPathUrl(pathObj);

        log.debug("PCT_WMV", utilityUrlObj.controller)
        // const scriptIdFetchRestletObj = getScriptId('customscript_pct_wmv_get_all_script_id');
        // scriptIdFetchRestletObj.isSuccess ? scriptIdFetchRestletObj.data ? htmlContent = htmlContent.replace('#FETCH-SCRIPTID-RESTLET#', scriptIdFetchRestletObj.data.scriptInternalId) : null : null
        var pageRenderer = render.create();
        pageRenderer.templateContent = htmlContent;

        pageRenderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: 'ds',
            data: dataSource
        });

        var renderedPage = pageRenderer.renderAsString();
        renderedPage = renderedPage.replace('#FETCH-CONTROLLER#', utilityUrlObj.controller);
        renderedPage = renderedPage.replace('#FETCH-LOGO#', utilityUrlObj.logo);
        // const response = context.response;
        // const request = context.request;
        context.response.write(renderedPage);
    }

    const getWorkOrderByDate = (toDate, fromDate) => {
        let filterArray = [];
        filterArray.push(["type", "anyof", "WOClose"])// //WorkOrd
        // filterArray.push("AND")
        // filterArray.push(["item", "anyof", item])
        filterArray.push("AND")
        filterArray.push(["mainline", "is", "T"])
        filterArray.push("AND")
        // filterArray.push(["iswip", "is", "T"])
        // filterArray.push("AND")
        filterArray.push(["trandate", "onorafter", changeDateFormat(fromDate)])
        filterArray.push("AND")
        if(toDate == '' || toDate == null){
            filterArray.push(["trandate", "onorbefore", changeDateFormat(new Date())])
        }else{
            filterArray.push(["trandate", "onorbefore", changeDateFormat(toDate)])
        }
        log.debug({
            title: 'filterArray',
            details: JSON.stringify(filterArray)
        })

        let itemArray = [];
        var workorderSearchObj = search.create({
            type: "workorderclose",//"workorder",
            filters:
                [
                    filterArray
                    // ["status", "anyof", "WorkOrd:G", "WorkOrd:H", "WorkOrd:D"]
                ],
            columns:
                [
                    search.createColumn({name: "createdfrom", label: "Created From"})//({ name: "internalid",  sort: search.Sort.ASC, label: "Internal ID" })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            itemArray.push(result.getValue({name: "createdfrom", label: "Created From"}))

            return true;

        });

        log.debug("PCT", "Item Array  : " + itemArray);

        return itemArray;
    }
    // --------------------- Function for get work Order from Item Start  ------------------------
    const getWorkOrderFromItem = (item, toDate, fromDate) => {
        log.debug(typeof changeDateFormat(fromDate))
        log.debug(changeDateFormat(toDate))
        let filterArray = [];

        if (changeDateFormat(fromDate) == 'NaN/NaN/NaN' && changeDateFormat(toDate) == 'NaN/NaN/NaN') {
            filterArray.push(["type", "anyof", "WorkOrd"])
            filterArray.push("AND")
            filterArray.push(["item", "anyof", item])
            filterArray.push("AND")
            filterArray.push(["mainline", "is", "T"])
            filterArray.push("AND")
            filterArray.push(["iswip", "is", "T"])
        }
        else if (changeDateFormat(fromDate) != 'NaN/NaN/NaN' && changeDateFormat(toDate) == 'NaN/NaN/NaN') {
            filterArray.push(["type", "anyof", "WorkOrd"])
            filterArray.push("AND")
            filterArray.push(["item", "anyof", item])
            filterArray.push("AND")
            filterArray.push(["mainline", "is", "T"])
            filterArray.push("AND")
            filterArray.push(["iswip", "is", "T"])
            filterArray.push("AND")
            filterArray.push(["trandate", "within", changeDateFormat(fromDate), changeDateFormat(new Date())])

        }
        else {
            filterArray.push(["type", "anyof", "WorkOrd"])
            filterArray.push("AND")
            filterArray.push(["item", "anyof", item])
            filterArray.push("AND")
            filterArray.push(["mainline", "is", "T"])
            filterArray.push("AND")
            filterArray.push(["iswip", "is", "T"])
            filterArray.push("AND")
            filterArray.push(["trandate", "within", changeDateFormat(fromDate), changeDateFormat(toDate)])
        }
        let itemArray = [];
        var workorderSearchObj = search.create({
            type: "workorder",
            filters:
                [
                    filterArray
                    // ["status", "anyof", "WorkOrd:G", "WorkOrd:H", "WorkOrd:D"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        log.debug("workorderSearchObj result count", searchResultCount);
        workorderSearchObj.run().each(function (result) {
            itemArray.push(result.getValue({ name: "internalid", label: "Internal ID" }))

            return true;

        });

        log.debug("PCT", "Item Array  : " + itemArray);

        return itemArray;

    }

    // --------------------- Function for get work Order from Item End ------------------------
    function changeDateFormat(dateFormat) {

        let date = new Date(dateFormat);
        let dd = date.getDate()
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        let nowDate = mm + "/" + dd + "/" + yyyy;
        return nowDate;
    }

    const getUtilityPathUrl = dataObj => {
        let urlObj = {};
        dataObj.map((value) => {
            urlObj[value.fileType] = file.load({
                id: value.localPath
            }).url;
        })
        return urlObj
    }



    //COPY CODE FROM MR
    // --------------------- Function for get estimated Item Quantity Start ( Account : 1.0, Search Id : 1590 ) ------------------------
    // const getEstimatedItemDetails = (workOrderArray) => {
    //     let getEstimatedItemDetailsFilterArray = [];
    //     let workOrderDetailObj = {};
    //     getEstimatedItemDetailsFilterArray.push(["type", "anyof", "WorkOrd"]);
    //     getEstimatedItemDetailsFilterArray.push("AND");
    //     getEstimatedItemDetailsFilterArray.push(["mainline", "is", "F"]);
    //     getEstimatedItemDetailsFilterArray.push("AND");
    //     getEstimatedItemDetailsFilterArray.push(["formulanumeric: CASE WHEN ({location} = {item.inventorylocation}) THEN 1 ELSE 0 END", "equalto", "1"])
    //     getEstimatedItemDetailsFilterArray.push("AND");
    //     getEstimatedItemDetailsFilterArray.push(["quantity", "greaterthan", "0"]);
    //     getEstimatedItemDetailsFilterArray.push("AND");
    //     getEstimatedItemDetailsFilterArray.push(["internalid", "anyof", workOrderArray]);


    //     var workorderSearchObj = search.create({
    //         type: "workorder",
    //         filters:
    //             [
    //                 getEstimatedItemDetailsFilterArray
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({
    //                     name: "item",
    //                     summary: "GROUP",
    //                     label: "Item"
    //                 }),
    //                 search.createColumn({
    //                     name: "quantity",
    //                     summary: "SUM",
    //                     label: "Quantity"
    //                 }),
    //                 search.createColumn({
    //                     name: "locationaveragecost",
    //                     join: "item",
    //                     summary: "MAX",
    //                     label: "Location Average Cost"
    //                 }),
    //                 search.createColumn({
    //                     name: "locationcost",
    //                     join: "item",
    //                     summary: "MAX",
    //                     label: "Location Standard Cost"
    //                 }),
    //                 search.createColumn({
    //                     name: "costingmethod",
    //                     join: "item",
    //                     summary: "GROUP",
    //                     label: "Costing Method"
    //                 }),
    //                 search.createColumn({
    //                     name: "tranid",
    //                     summary: "GROUP",
    //                     label: "Document Number"
    //                 }),
    //                 search.createColumn({
    //                     name: "unit",
    //                     summary: "GROUP",
    //                     label: "Units"
    //                 }),
    //                 search.createColumn({
    //                     name: "internalid",
    //                     summary: "GROUP",
    //                     label: "Internal ID"
    //                 }),
    //             ]
    //     });
    //     var workOrderItemSearchCount = workorderSearchObj.runPaged().count;
    //     log.debug("PCT", "Work Order Search Item Count : ", workOrderItemSearchCount);
    //     let start = 0;
    //     let end = 1000;
    //     do {
    //         if (getRemainingUsageUnit() >= usageLinit) {
    //             var result = workorderSearchObj.run().getRange({ start: start, end: end });
    //             for (let woIndex = 0; woIndex < result.length; woIndex++) {
    //                 let itemObj = {};
    //                 let workOrderId = result[woIndex].getValue({
    //                     name: "internalid",
    //                     summary: "GROUP",
    //                     label: "Internal ID"
    //                 });
    //                 let itemEstimatedQuantity = result[woIndex].getValue({ name: "quantity", summary: "SUM" });

    //                 let costingMethod = result[woIndex].getValue({
    //                     name: "costingmethod",
    //                     join: "item",
    //                     summary: "GROUP",
    //                     label: "Costing Method"
    //                 });
    //                 if (costingMethod == 'AVG') {
    //                     itemObj.estimatedItemAmount = itemEstimatedQuantity * CheckNull(parseFloat(result[woIndex].getValue({
    //                         name: "locationaveragecost",
    //                         join: "item",
    //                         summary: "MAX",
    //                         label: "Location Average Cost"
    //                     })))
    //                 } else {
    //                     itemObj.estimatedItemAmount = itemEstimatedQuantity * CheckNull(parseFloat(result[woIndex].getValue({
    //                         name: "locationcost",
    //                         join: "item",
    //                         summary: "MAX",
    //                         label: "Location Standard Cost"
    //                     })))
    //                 }

    //                 if (itemObj.estimatedItemAmount == null || itemObj.estimatedItemAmount == "") {
    //                     itemObj.estimatedItemAmount = 0;
    //                 }

    //                 // log.debug("PCT", "Item Rate : AVG" + result[woIndex].getText({
    //                 //     name: "locationaveragecost",
    //                 //     join: "item",
    //                 //     summary: "MAX",
    //                 //     label: "Location Average Cost"
    //                 // }) + 'Standard =' + result[woIndex].getValue({
    //                 //     name: "locationaveragecost",
    //                 //     join: "item",
    //                 //     summary: "MAX",
    //                 //     label: "Location Average Cost"
    //                 // }))
    //                 let itemId = result[woIndex].getValue({ name: "item", summary: "GROUP" });
    //                 itemObj.workOrderNumber = result[woIndex].getValue({ name: "tranid", summary: "GROUP" });
    //                 itemObj.item = itemId;
    //                 itemObj.estimatedQuantity = itemEstimatedQuantity
    //                 itemObj.averageCost = result[woIndex].getValue({
    //                     name: "locationaveragecost",
    //                     join: "item",
    //                     summary: "AVG",
    //                     label: "Location Average Cost"
    //                 });
    //                 itemObj.itemName = result[woIndex].getText({ name: "item", summary: "GROUP" });
    //                 itemObj.standardCost = result[woIndex].getValue({
    //                     name: "locationcost",
    //                     join: "item",
    //                     summary: "AVG",
    //                     label: "Location Average Cost"
    //                 });
    //                 itemObj.costingMethod = result[woIndex].getValue({
    //                     name: "costingmethod",
    //                     join: "item",
    //                     summary: "GROUP",
    //                     label: "Costing Method"
    //                 });
    //                 itemObj.unit = result[woIndex].getText({
    //                     name: "unit",
    //                     summary: "GROUP",
    //                     label: "Units"
    //                 });
    //                 itemObj.actualQuantity = 0;
    //                 itemObj.differentiateQuantity = 0;
    //                 itemObj.actualItemCost = 0;
    //                 itemObj.differentiateItemCost = 0;
    //                 itemObj.color = 'green';
    //                 if (!(workOrderId in workOrderDetailObj)) {
    //                     workOrderDetailObj[workOrderId] = {}
    //                     workOrderDetailObj[workOrderId][itemId] = itemObj
    //                 }
    //                 else {
    //                     workOrderDetailObj[workOrderId][itemId] = itemObj
    //                 }
    //             }
    //             start += 1000;
    //             end += 1000;
    //             workOrderItemSearchCount -= 1000;
    //         }
    //     }
    //     while (workOrderItemSearchCount > 0);
    //     log.debug("PCT", "Estimated Item Object : " + JSON.stringify(workOrderDetailObj))
    //     return workOrderDetailObj;
    // }

    // // --------------------- Function for get estimated Item Quantity End ( Account : 1.0, Search Id : 1590 ) ------------------------

    // // --------------------- Function for get actual Item Quantity Start ( Account : 1.0, Search Id : 1591 ) ------------------------
    // const getActualItemDetails = (workOrderEstimatedItemDataObj, workOrderArray) => {
    //     let getActualItemDetailsFilterArray = [];
    //     if (getRemainingUsageUnit() >= usageLinit) {
    //         var transactionSearchObj = search.create({
    //             type: "transaction",
    //             filters:
    //                 [
    //                     ["type", "anyof", "WOIssue"],
    //                     "AND",
    //                     ["formulanumeric: CASE WHEN ({location}={item.inventorylocation}) THEN 1 ELSE 0 END", "equalto", "1"],
    //                     "AND",
    //                     ["formulanumeric: CASE WHEN {quantity} > 0 THEN 1 ELSE 0 END", "equalto", "1"],
    //                     "AND",
    //                     ["createdfrom", "anyof", workOrderArray]
    //                 ],
    //             columns:
    //                 [
    //                     search.createColumn({
    //                         name: "item",
    //                         summary: "GROUP",
    //                         label: "Item"
    //                     }),
    //                     search.createColumn({
    //                         name: "quantity",
    //                         summary: "SUM",
    //                         label: "Quantity"
    //                     }),
    //                     search.createColumn({
    //                         name: "createdfrom",
    //                         summary: "GROUP",
    //                         label: "Created From"
    //                     }),
    //                     search.createColumn({
    //                         name: "rate",
    //                         summary: "AVG",
    //                         label: "Item Rate"
    //                     })
    //                 ]
    //         });
    //         var workOrderIssueItemCount = transactionSearchObj.runPaged().count;
    //         log.debug("PCT", "Work Order Issue Search Item Count : " + workOrderIssueItemCount);
    //         let start = 0;
    //         let end = 1000;
    //         do {
    //             var result = transactionSearchObj.run().getRange({ start: start, end: end });
    //             for (let issueIndex = 0; issueIndex < result.length; issueIndex++) {
    //                 let itemObj = {};
    //                 let workOrderId = result[issueIndex].getValue({
    //                     name: "createdfrom",
    //                     summary: "GROUP",
    //                     label: "Created From"
    //                 });
    //                 let itemId = result[issueIndex].getValue({
    //                     name: "item",
    //                     summary: "GROUP",
    //                     label: "Item"
    //                 });
    //                 let itemActualQuantity = result[issueIndex].getValue({
    //                     name: "quantity",
    //                     summary: "SUM",
    //                     label: "Quantity"
    //                 });
    //                 itemObj.itemId = itemId;
    //                 itemObj.actualQuantity = itemActualQuantity;
    //                 itemObj.actualItemRate = itemActualQuantity * result[issueIndex].getValue({
    //                     name: "rate",
    //                     summary: "AVG",
    //                     label: "Item Rate"
    //                 })
    //                 if (itemObj.actualItemRate == null || itemObj.actualItemRate == "") {
    //                     itemObj.actualItemRate = 0;
    //                 }
    //                 itemObj.workOrderId = workOrderId;
    //                 getActualItemDetailsFilterArray.push(itemObj)
    //             }
    //             start += 1000;
    //             end += 1000;
    //             workOrderIssueItemCount -= 1000;
    //         }
    //         while (workOrderIssueItemCount > 0);
    //     }

    //     getActualItemDetailsFilterArray.forEach(element => {
    //         let obj = workOrderEstimatedItemDataObj[element.workOrderId];
    //         log.debug("PCT", "estimatedItemAmount : " + obj[element.itemId]['estimatedItemAmount']);
    //         log.debug("PCT", "actualItemRate : " + element.actualItemRate)
    //         if (obj && element.itemId in obj) {

    //             obj[element.itemId]['actualQuantity'] = element.actualQuantity;
    //             obj[element.itemId]['actualItemCost'] = parseFloat(element.actualItemRate);
    //             obj[element.itemId]['differentiateQuantity'] = (parseFloat(obj[element.itemId]['estimatedQuantity']) - parseFloat(element.actualQuantity));
    //             obj[element.itemId]['differentiateItemCost'] = (parseFloat(obj[element.itemId]['estimatedItemAmount']) - parseFloat(element.actualItemRate));

    //             obj[element.itemId].color = (parseFloat(obj[element.itemId]['estimatedItemAmount']) - parseFloat(element.actualItemRate)) >= 0 ? 'green' : 'red';
    //         }
    //     })
    //     log.debug("PCT", "Work Order Actual Item Details Object : " + JSON.stringify(workOrderEstimatedItemDataObj));
    //     return workOrderEstimatedItemDataObj;
    // }
    // // --------------------- Function for get actual Item Quantity End ( Account : 1.0, Search Id : 1591 ) ------------------------


    // const getOperationData = (workOrderId, EstimateDataFromMFGOperationTask, ActualDataFromWOCompletion) => {
    //     let varianceReportObj = {}

    //     let estimatedDataObj = EstimateDataFromMFGOperationTask[workOrderId]
    //     if (estimatedDataObj != null) {

    //         Object.keys(estimatedDataObj).forEach(function (key) {
    //             var varianceObj = {}
    //             var estTotalSetupCost = 0;
    //             var estTotalRunCost = 0;
    //             if (!(workOrderId in varianceReportObj)) {
    //                 varianceReportObj[workOrderId] = {}
    //             }

    //             log.debug({
    //                 title: ' estimatedDataObj[key]',
    //                 details: JSON.stringify(estimatedDataObj[key])
    //             })

    //             varianceObj.operationName = estimatedDataObj[key].operationName;
    //             varianceObj.assemblyName = estimatedDataObj[key].assemblyName;
    //             varianceObj.operationSequence = estimatedDataObj[key].operationSequence;
    //             varianceObj.estRunTime = estimatedDataObj[key].estRunTime;
    //             varianceObj.estSetupTime = estimatedDataObj[key].estSetupTime;
    //             varianceObj.completedquantity = estimatedDataObj[key].completedquantity
    //             varianceObj.machineresources = estimatedDataObj[key].machineResources;
    //             varianceObj.laborResources = estimatedDataObj[key].laborResources;
    //             varianceObj.totalMachineSetupRate = estimatedDataObj[key].machineSetUpRate;
    //             varianceObj.totalLaborSetupRate = estimatedDataObj[key].laborSetUpRate;
    //             varianceObj.totalMachineRunRate = estimatedDataObj[key].machineRunRate;
    //             varianceObj.totalLaborRunRate = estimatedDataObj[key].laborRunRate;

    //             varianceObj.actRunTime = 0;
    //             varianceObj.actSetupTime = 0;

    //             varianceObj.actRunCost = 0;
    //             varianceObj.actSetupCost = 0;
    //             varianceObj.estRunCost = 0;
    //             varianceObj.estSetupCost = 0;



    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName] = estimatedDataObj[key]
    //             var operationWiseActualDataArray = [];
    //             if (ActualDataFromWOCompletion[workOrderId]) {
    //                 if (ActualDataFromWOCompletion[workOrderId][key]) {
    //                     operationWiseActualDataArray = ActualDataFromWOCompletion[workOrderId][key]
    //                 }
    //             }

    //             var laborResources = 1
    //             var machineResources = 1;

    //             var totalSetupCost = 0;
    //             var totalRunCost = 0;

    //             var totalMachineTime = 0
    //             var totalRunTime = 0
    //             var totalSetupTime = 0
    //             operationWiseActualDataArray.forEach(element => {
    //                 var labourRunTime = 0
    //                 var labourSetupTime = 0;
    //                 var MachineRunTime = 0
    //                 var MachineSetupTime = 0;

    //                 totalRunTime = parseFloat(totalRunTime) + CheckNull(parseFloat(element.laborruntime)) + CheckNull(parseFloat(element.machineruntime))
    //                 totalSetupTime = parseFloat(totalSetupTime) + CheckNull(parseFloat(element.laborsetuptime)) + CheckNull(parseFloat(element.machinesetuptime))

    //                 labourRunTime = parseFloat(labourRunTime) + CheckNull(parseFloat(element.laborruntime))
    //                 labourSetupTime = parseFloat(labourSetupTime) + CheckNull(parseFloat(element.laborsetuptime))
    //                 MachineRunTime = parseFloat(MachineRunTime) + CheckNull(parseFloat(element.machineruntime))
    //                 MachineSetupTime = parseFloat(MachineSetupTime) + CheckNull(parseFloat(element.machinesetuptime))
    //                 laborResources = element.laborresources
    //                 machineResources = element.machineresources

    //                 totalSetupCost = parseFloat(totalSetupCost) + parseFloat((varianceObj.totalMachineSetupRate / 60) * MachineSetupTime * machineResources) + parseFloat((varianceObj.totalLaborSetupRate / 60) * labourSetupTime * laborResources)
    //                 totalRunCost = parseFloat(totalRunCost) + parseFloat((varianceObj.totalMachineRunRate / 60) * MachineRunTime * machineResources) + parseFloat((varianceObj.totalLaborRunRate / 60) * labourRunTime * laborResources)
    //                 log.debug({
    //                     title: 'varianceObj.totalLaborRunRate=' + varianceObj.totalLaborRunRate + 'labourRunTime ' + labourRunTime + ' laborResources =' + laborResources,
    //                     details: 'varianceObj.totalMachineRunRate =' + varianceObj.totalMachineRunRate + ' MachineRunTime =' + MachineRunTime + ' machineResources =' + machineResources
    //                 })

    //             });

    //             estTotalSetupCost = parseFloat(estTotalSetupCost) + parseFloat((varianceObj.totalMachineSetupRate / 60) * varianceObj.estSetupTime * varianceObj.machineresources) + parseFloat((varianceObj.totalLaborSetupRate / 60) * varianceObj.estSetupTime * varianceObj.laborResources)
    //             estTotalRunCost = parseFloat(estTotalRunCost) + parseFloat((varianceObj.totalMachineRunRate / 60) * varianceObj.estRunTime * varianceObj.machineresources) + parseFloat((varianceObj.totalLaborRunRate / 60) * varianceObj.estRunTime * varianceObj.laborResources)
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actRunTime = totalRunTime;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actSetupTime = totalSetupTime;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actRunCost = totalRunCost;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actSetupCost = totalSetupCost;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].actCost = totalRunCost + totalSetupCost;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].estRunCost = estTotalRunCost;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].estSetupCost = estTotalSetupCost;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].estCost = estTotalRunCost + estTotalSetupCost;
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].difference = (estTotalRunCost + estTotalSetupCost) - (totalRunCost + totalSetupCost);
    //             varianceReportObj[workOrderId][estimatedDataObj[key].operationName].color = ((estTotalRunCost + estTotalSetupCost) - (totalRunCost + totalSetupCost)) >= 0 ? 'green' : 'red';

    //         });
    //     }

    //     return varianceReportObj;
    // }
    // const getActualDataFromWOCompletion = (completionRecordIdArray, workOrderArry, context) => {

    //     let actOperationNameObj = {};

    //     completionRecordIdArray.forEach(element => {
    //         if (getRemainingUsageUnit() >= usageLinit) {
    //             var recordData = record.load({
    //                 type: record.Type.WORK_ORDER_COMPLETION,
    //                 id: element,
    //                 isDynamic: true
    //             })
    //             var workOrderId = recordData.getValue('createdfrom')
    //             var operationLineCount = recordData.getLineCount({
    //                 sublistId: 'operation'
    //             })
    //             for (var opLineIndex = 0; opLineIndex < operationLineCount; opLineIndex++) {
    //                 recordData.selectLine({
    //                     sublistId: 'operation',
    //                     line: opLineIndex
    //                 })

    //                 var actOperationObj = {}
    //                 actOperationObj.OperanceSecquence = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'operationsequence'
    //                 })
    //                 actOperationObj.operationName = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'operationname'
    //                 })
    //                 actOperationObj.laborruntime = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'laborruntime'
    //                 })
    //                 actOperationObj.laborsetuptime = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'laborsetuptime'
    //                 })
    //                 actOperationObj.machineruntime = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'machineruntime'
    //                 })
    //                 actOperationObj.machinesetuptime = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'machinesetuptime'
    //                 })
    //                 actOperationObj.machineresources = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'machineresources'
    //                 })
    //                 actOperationObj.laborresources = recordData.getCurrentSublistValue({
    //                     sublistId: 'operation',
    //                     fieldId: 'laborresources'
    //                 })

    //                 if (!(workOrderId in actOperationNameObj)) {
    //                     actOperationNameObj[workOrderId] = {}
    //                     if (actOperationNameObj[workOrderId][actOperationObj.operationName] == null) {
    //                         actOperationNameObj[workOrderId][actOperationObj.operationName] = []
    //                     }
    //                     actOperationNameObj[workOrderId][actOperationObj.operationName].push(actOperationObj)
    //                     log.audit("PCT-If", actOperationNameObj);
    //                 }
    //                 else {
    //                     if (actOperationNameObj[workOrderId][actOperationObj.operationName] == null) {
    //                         actOperationNameObj[workOrderId][actOperationObj.operationName] = []
    //                     }
    //                     actOperationNameObj[workOrderId][actOperationObj.operationName].push(actOperationObj)
    //                     log.audit("PCT-Else", actOperationNameObj);
    //                 }
    //             }
    //         }
    //         // checkRemainingUsage(workOrderArry, null, context)
    //     });
    //     log.audit({
    //         title: 'actOperationNameObj',
    //         details: JSON.stringify(actOperationNameObj)
    //     })

    //     return actOperationNameObj;
    // }


    // // --------------------- Function for get Costing Type Start ( Account : 1.0, Search Id : 1604 ) ------------------------
    // const getEstimateDataFromMFGOperationTask = (workOrderArray, costCategoryObj) => {
    //     let operationNameObj = {};
    //     if (getRemainingUsageUnit() >= usageLinit) {
    //         var manufacturingoperationtaskSearchObj = search.create({
    //             type: "manufacturingoperationtask",
    //             filters:
    //                 [
    //                     ["workorder.internalid", "anyof", workOrderArray]
    //                 ],
    //             columns:
    //                 [
    //                     search.createColumn({ name: "name", label: "Operation Name" }),
    //                     search.createColumn({ name: "sequence", label: "Operation Sequence" }),
    //                     search.createColumn({ name: "manufacturingworkcenter", label: "Manufacturing Work Center" }),
    //                     search.createColumn({ name: "startdate", label: "Start Date" }),
    //                     search.createColumn({ name: "enddate", label: "End Date" }),
    //                     search.createColumn({ name: "estimatedwork", label: "Estimated Work" }),
    //                     search.createColumn({ name: "status", label: "Status" }),
    //                     search.createColumn({ name: "manufacturingcosttemplate", label: "Manufacturing Cost Template" }),
    //                     search.createColumn({ name: "actualruntime", label: "Actual Run Time" }),
    //                     search.createColumn({ name: "actualsetuptime", label: "Actual Setup Time" }),
    //                     search.createColumn({ name: "runtime", label: "Run Time" }),
    //                     search.createColumn({ name: "setuptime", label: "Setup Time (Min)" }),
    //                     search.createColumn({ name: "machineresources", label: "Machine Resources" }),
    //                     search.createColumn({ name: "laborresources", label: "Labor Resources" }),
    //                     search.createColumn({ name: "internalid", join: "workorder", label: "Work Order" }),
    //                     search.createColumn({ name: "completedquantity", label: "Completed Quantity" }),
    //                     search.createColumn({
    //                         name: "tranid",
    //                         join: "workOrder",
    //                         label: "Document Number"
    //                     }),
    //                     search.createColumn({
    //                         name: "item",
    //                         join: "workOrder",
    //                         label: "Item"
    //                     })
    //                 ]
    //         });

    //         var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
    //         log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
    //         manufacturingoperationtaskSearchObj.run().each(function (result) {
    //             let operationObj = {};

    //             let MFGOperationTaskId = result.id
    //             let costObj = { 'totalMachineSetupRate': 0, 'totalLaborSetupRate': 0, 'totalLaborRunRate': 0, 'totalMachineRunRate': 0 };
    //             if (MFGOperationTaskId > 0) {
    //                 costObj = getCostDataFromMFGOperationTask(MFGOperationTaskId, costCategoryObj)

    //             }

    //             let workOrderId = result.getValue({ name: "internalid", join: "workorder", label: "Work Order" })
    //             operationObj.WorkOrderNumber = result.getValue({
    //                 name: "tranid",
    //                 join: "workOrder",
    //                 label: "Document Number"
    //             })
    //             operationObj.operationName = result.getValue({ name: "name", label: "Operation Name" })
    //             operationObj.assemblyName = result.getText({ name: "item", join: "workOrder", label: "Item" })
    //             operationObj.operationSequence = result.getValue({ name: "sequence", label: "Operation Sequence" })
    //             // operationObj.actRunTime = result.getValue({ name: "actualruntime", label: "Actual Run Time" })
    //             // operationObj.actSetupTime = result.getValue({ name: "actualsetuptime", label: "Actual Setup Time" })
    //             operationObj.estRunTime = result.getValue({ name: "runtime", label: "Run Time" })
    //             operationObj.estSetupTime = result.getValue({ name: "setuptime", label: "Setup Time (Min)" })
    //             operationObj.machineResources = result.getValue({ name: "machineresources", label: "Machine Resources" })
    //             operationObj.laborResources = result.getValue({ name: "laborresources", label: "Labor Resources" })
    //             operationObj.completedquantity = result.getValue({ name: "completedquantity", label: "completedquantity" })
    //             operationObj.machineSetUpRate = CheckNull(costObj.totalMachineSetupRate)
    //             operationObj.laborSetUpRate = CheckNull(costObj.totalLaborSetupRate)
    //             operationObj.machineRunRate = CheckNull(costObj.totalMachineRunRate)
    //             operationObj.laborRunRate = CheckNull(costObj.totalLaborRunRate)

    //             // .run().each has a limit of 4,000 results
    //             log.debug("PCT", "operationVarianceObj Object : " + JSON.stringify(operationObj));

    //             if (!(workOrderId in operationNameObj)) {
    //                 operationNameObj[workOrderId] = {}
    //                 operationNameObj[workOrderId][operationObj.operationName] = operationObj
    //             }
    //             else {
    //                 operationNameObj[workOrderId][operationObj.operationName] = operationObj
    //             }

    //             return true;
    //         });
    //     }

    //     log.debug("PCT", "Costing Category Object : " + JSON.stringify(operationNameObj));
    //     return operationNameObj;
    // }
    // // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------



    // // --------------------- Function for get Costing Type Start ( Account : 1.0, Search Id : 1593 ) ------------------------
    // const getCostingCategory = () => {
    //     let costCategoryObj = {};
    //     if (getRemainingUsageUnit() >= usageLinit) {
    //         var costcategorySearchObj = search.create({
    //             type: "costcategory",
    //             filters:
    //                 [
    //                 ],
    //             columns:
    //                 [
    //                     search.createColumn({
    //                         name: "name",
    //                         sort: search.Sort.ASC,
    //                         label: "Name"
    //                     }),
    //                     search.createColumn({ name: "itemcosttype", label: "Cost Type" })
    //                 ]
    //         });
    //         var costingCategoryCount = costcategorySearchObj.runPaged().count;
    //         log.debug("PCT", "Costing Category Count : " + costingCategoryCount);

    //         costcategorySearchObj.run().each(function (result) {
    //             let categoryObj = {};
    //             categoryObj.id = result.id;
    //             categoryObj.name = result.getValue({
    //                 name: "name",
    //                 sort: search.Sort.ASC,
    //                 label: "Name"
    //             });
    //             categoryObj.costType = result.getValue({ name: "itemcosttype", label: "Cost Type" });
    //             if (!(categoryObj.name in costCategoryObj)) {
    //                 costCategoryObj[categoryObj.name] = {}
    //                 costCategoryObj[categoryObj.name] = categoryObj
    //             }
    //             else {
    //                 costCategoryObj[categoryObj.name] = categoryObj
    //             }
    //             return true;
    //         });
    //     }
    //     log.debug("PCT", "Costing Category Object : " + JSON.stringify(costCategoryObj));
    //     return costCategoryObj;
    // }
    // // --------------------- Function for get Costing Type End ( Account : 1.0, Search Id : 1593 ) ------------------------

    // const getCompletionRecordId = (workOrderId) => {
    //     let completionRecordIdArray = [];
    //     if (getRemainingUsageUnit() >= usageLinit) {
    //         let workordercompletionSearchObj = search.create({
    //             type: "workordercompletion",
    //             filters:
    //                 [
    //                     ["type", "anyof", "WOCompl"],
    //                     "AND",
    //                     ["createdfrom", "anyof", workOrderId],
    //                     "AND",
    //                     ["mainline", "is", "T"]
    //                 ],
    //             columns:
    //                 [

    //                     search.createColumn({ name: "tranid", label: "Document Number" }),
    //                 ]
    //         });
    //         let searchResultCount = workordercompletionSearchObj.runPaged().count;
    //         log.debug("workordercompletionSearchObj result count", searchResultCount);
    //         workordercompletionSearchObj.run().each(function (result) {
    //             completionRecordIdArray.push(result.id)
    //             return true;
    //         });
    //     }

    //     return completionRecordIdArray;
    // }

    // const getCostDataFromMFGOperationTask = (MFGOperationTaskId, costCategoryObj) => {
    //     let totalLaborSetupRate = 0;
    //     let totalMachineSetupRate = 0;
    //     let totalLaborRunRate = 0;
    //     let totalMachineRunRate = 0;
    //     if (getRemainingUsageUnit() >= usageLinit) {
    //         var recordData = record.load({
    //             type: record.Type.MANUFACTURING_OPERATION_TASK,
    //             id: MFGOperationTaskId,
    //             isDynamic: true
    //         })
    //         var costdetailLineCount = recordData.getLineCount({
    //             sublistId: 'costdetail'
    //         })


    //         for (var opLineIndex = 0; opLineIndex < costdetailLineCount; opLineIndex++) {
    //             recordData.selectLine({
    //                 sublistId: 'costdetail',
    //                 line: opLineIndex
    //             })
    //             var costCategory = recordData.getCurrentSublistText({
    //                 sublistId: 'costdetail',
    //                 fieldId: 'costcategory'
    //             })
    //             var runrate = recordData.getCurrentSublistValue({
    //                 sublistId: 'costdetail',
    //                 fieldId: 'runrate'
    //             })
    //             var fixedrate = recordData.getCurrentSublistValue({
    //                 sublistId: 'costdetail',
    //                 fieldId: 'fixedrate'
    //             })
    //             var labor = recordData.getCurrentSublistValue({
    //                 sublistId: 'costdetail',
    //                 fieldId: 'labor'
    //             })

    //             var overhead = recordData.getCurrentSublistValue({
    //                 sublistId: 'costdetail',
    //                 fieldId: 'overhead'
    //             })
    //             var setup = recordData.getCurrentSublistValue({
    //                 sublistId: 'costdetail',
    //                 fieldId: 'setup'
    //             })
    //             let costCategoryType = ''
    //             if (costCategoryObj[costCategory]) {
    //                 costCategoryType = costCategoryObj[costCategory].costType;
    //             }

    //             log.debug({
    //                 title: 'costCategoryType',
    //                 details: costCategoryType
    //             })
    //             // if(setup == true)
    //             if (parseFloat(fixedrate) > 0 && !isNaN(fixedrate)) {
    //                 if (costCategoryType.includes('LABORSETUP')) {
    //                     totalLaborSetupRate = parseFloat(totalLaborSetupRate) + parseFloat(fixedrate)
    //                 }
    //                 if (costCategoryType.includes('MACHINESETUP')) {
    //                     totalMachineSetupRate = parseFloat(totalMachineSetupRate) + parseFloat(fixedrate)
    //                 }
    //             }
    //             //if(labor == true)
    //             if (parseFloat(runrate) > 0 && !isNaN(runrate)) {
    //                 if (costCategoryType.includes('LABORRUN')) {
    //                     totalLaborRunRate = parseFloat(totalLaborRunRate) + parseFloat(runrate)
    //                 }
    //                 if (costCategoryType.includes('MACHINERUN')) {
    //                     totalMachineRunRate = parseFloat(totalMachineRunRate) + parseFloat(runrate)
    //                 }

    //             }

    //         }
    //         log.debug({
    //             title: 'Rate Obj',
    //             details: { 'totalLaborSetupRate': totalLaborSetupRate, 'totalMachineSetupRate': totalMachineSetupRate, 'totalLaborRunRate': totalLaborRunRate, 'totalMachineRunRate': totalMachineRunRate }
    //         })
    //     }
    //     // checkRemainingUsage(workOrderId)
    //     return { 'totalLaborSetupRate': totalLaborSetupRate, 'totalMachineSetupRate': totalMachineSetupRate, 'totalLaborRunRate': totalLaborRunRate, 'totalMachineRunRate': totalMachineRunRate }
    // }

    const CheckNull = (val) => {
        if (val == '' || val == undefined || isNaN(val)) {
            val = 0
        }
        return val;
    }





    return {
        onRequest: onRequest
    }
});