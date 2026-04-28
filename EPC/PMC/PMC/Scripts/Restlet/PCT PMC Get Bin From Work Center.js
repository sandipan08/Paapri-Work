/**
 * Module Description
 *
 
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */


define(['N/search'], function (search) {

    function _get(context) {
        log.debug("PCT-PMC", "In PCT PMC Get Bin Restlet");

        return getBin(context.workCenterId)
    }

    const getBin = (workCenterId) => {
        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
                [
                    ["internalid", "anyof", workCenterId]
                ],
            columns:
                [
                    search.createColumn({ name: "custentity_mfgmob_wcassemblybin", label: "Assembly Bin (Storage Bin)" }),
                    search.createColumn({ name: "custentity_mfgmob_wcstagingbin", label: "Staging Bin (WIP Bin)" })
                ]
        });
        var searchResultCount = entitygroupSearchObj.runPaged().count;
        log.debug("entitygroupSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {
            let workCenterObj = {
                'assemblybin': '',
                'stagingbin': ''
            };
            entitygroupSearchObj.run().each(function (result) {

                workCenterObj['assemblybin'] = result.getValue({ name: "custentity_mfgmob_wcassemblybin", label: "Assembly Bin (Storage Bin)" })
                workCenterObj['stagingbin'] = result.getValue({ name: "custentity_mfgmob_wcstagingbin", label: "Staging Bin (WIP Bin)" })
                return true;
            });
            return { 'isSuccess': true, 'data': workCenterObj }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }

        /*
        entitygroupSearchObj.id="customsearch1751461514828";
        entitygroupSearchObj.title="Custom Group Search (copy)";
        var newSearchId = entitygroupSearchObj.save();
        */
    }
    // ----------------------------- Item Search Function Start ------------------------------
    function itemSearch(itemInternalID, location) {
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", itemInternalID],
                    "AND",
                    ["inventorylocation", "anyof", location]
                ],
            columns:
                [
                    search.createColumn({ name: "usebins", label: "Use Bins" }),
                    search.createColumn({ name: "isserialitem", label: "Is Serialized Item" }),
                    search.createColumn({ name: "islotitem", label: "Is Lot Numbered Item" }),
                    search.createColumn({
                        name: "custitem_pct_epc_asset_required",

                        label: "Asset # Required"
                    }),
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        log.debug("Item Count : " + itemCount);
        if (itemCount > 0) {
            let itemObj = {};
            itemSearchObj.run().each(function (result) {
                itemObj['lotNumber'] = result.getValue({
                    name: "islotitem",
                });


                let isSerial = result.getValue({
                    name: "isserialitem",
                })
                if (isSerial == true) {
                    itemObj['lotNumber'] = true;
                }
                itemObj['binNumber'] = result.getValue({
                    name: "usebins",
                });
                itemObj['serialNumber'] = result.getValue({
                    name: "isserialitem",
                });
                itemObj['assetRequired'] = result.getValue({
                    name: "custitem_pct_epc_asset_required",

                    label: "Asset # Required"
                })
                itemObj['internalId'] = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': itemObj }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
    }
    // ----------------------------- Item Search Function End ----------------------------------
    return {
        get: _get,
    }
});

