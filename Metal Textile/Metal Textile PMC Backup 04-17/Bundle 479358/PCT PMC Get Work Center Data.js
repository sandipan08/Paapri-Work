/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    let singleWorkCenterObject = {
        'name': '',
        'internalId': '',
        'runningWorkOrderCount': 0,
        'downtimeWorkOrderCount': 0,
        'availableWOrkOrderCount': 0,
        'image': ''
    }

    let mainWOrkCenterObject = {}
    let workCentersUsed = new Set();

    function _get(context) {
        getWorkCentersWithRunnningAndDowntimeWorkOrders();
        getWorkCentersWithNoWorkOrders();
        return mainWOrkCenterObject
    }

    const getWorkCentersWithRunnningAndDowntimeWorkOrders = () => {
        var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
            type: "customrecord_pct_pmc_tran_k_fab",
            filters:
                [
                    ["custrecord_pct_kfab_op_status", "anyof", "2", "3"],
                    "AND",
                    ["custrecord_pct_kfab_wo_center", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_pct_kfab_wo_center",
                        summary: "GROUP",
                        label: "Work Center"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_kfab_op_status",
                        summary: "GROUP",
                        label: "Operation Status"
                    }),
                    search.createColumn({
                        name: "internalid",
                        summary: "COUNT",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_work_center_image",
                        summary: "GROUP",
                        label: "Work Center Image"
                     }),

                ]
        });
        var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
        log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
        customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            let operationStatus = result.getValue({
                name: "custrecord_pct_kfab_op_status",
                summary: "GROUP",
                label: "Operation Status"
            });

            let statusCount = result.getValue({
                name: "internalid",
                summary: "COUNT",
                label: "Internal ID"
            })
            let workCenterId = result.getValue({
                name: "custrecord_pct_kfab_wo_center",
                summary: "GROUP"
            })
            let workCenterName = result.getText({
                name: "custrecord_pct_kfab_wo_center",
                summary: "GROUP"
            })
            let workCenterImage = result.getValue({
                name: "custrecord_pct_work_center_image",
                summary: "GROUP",
                label: "Work Center Image"
            })

            if (!(workCenterId in mainWOrkCenterObject)) {
                let res = JSON.parse(JSON.stringify(singleWorkCenterObject));
                log.debug(`PCT-PMC`, `Image : ${workCenterImage}` )
                res.name = workCenterName;
                res.image = workCenterImage;
                res.internalId = workCenterId;
                if (operationStatus === '2') {
                    res.downtimeWorkOrderCount = statusCount
                }
                else {
                    res.runningWorkOrderCount = statusCount
                }
                mainWOrkCenterObject[workCenterId] = res
            }
            else {
                if (operationStatus === '2') {
                    mainWOrkCenterObject[workCenterId].downtimeWorkOrderCount = statusCount
                }
                else {
                    mainWOrkCenterObject[workCenterId].runningWorkOrderCount = statusCount
                }
            }
            workCentersUsed.add(workCenterId)
            return true;
        });
    }

    const getWorkCentersWithNoWorkOrders = () => {
        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
                [
                    ["ismanufacturingworkcenter", "is", "T"],
                    "AND",
                    ["internalid", "noneof", Array.from(workCentersUsed)]
                ],
            columns:
                [
                    search.createColumn({
                        name: "groupname",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "custentity_pct_workcenter_image", label: "Work Center Image" })
                ]
        });
        var searchResultCount = entitygroupSearchObj.runPaged().count;
        log.debug("entitygroupSearchObj result count", searchResultCount);
        entitygroupSearchObj.run().each(function (result) {
            let res = JSON.parse(JSON.stringify(singleWorkCenterObject))
            res.name = result.getValue({ name: "groupname" });
            res.image = result.getValue({ name: "custentity_pct_workcenter_image" })
            log.debug(`PCT-PMC`, `Image : +result.getValue({ name: "custentity_pct_workcenter_image" })`)
            let workCenter = result.id
            res.internalId = workCenter
            mainWOrkCenterObject[workCenter] = res
            return true;
        });
    }

    return {
        get: _get
    }
});