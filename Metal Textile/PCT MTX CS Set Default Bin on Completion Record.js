/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/query'], function (log, query) {
    // let newLotNumber = '';

    function pageInit(context) {

        log.debug('PCT_MTC', 'In Page Init');

        const currentRecord = context.currentRecord;
        if (window.parent.nlapiGetRecordType() == 'workordercompletion') {
            var locationId = currentRecord.getValue({ fieldId: 'location' });

            // Set the new lot number in the Serial/Lot Number field
            switch (parseInt(locationId)) {
                case 2:
                    binNumber = 'MTCMWC';
                    break;
                case 3:
                    binNumber = 'AFPEWC';
                    break;
                case 4:
                    binNumber = 'AFPMWC';
                    break;
                case 1:
                    binNumber = 'MTCEWC';
                    break;
                default:
                    binNumber = ''; // default/fallback value
            }
            log.debug("PCT-locationId", locationId)
            log.debug("PCT-binNumber", binNumber)
            var sql = `
            SELECT id,
            FROM bin
            WHERE binnumber = '${binNumber}'
            AND location = ${locationId}
        `;

            var resultSet = query.runSuiteQL({ query: sql });
            var results = resultSet.asMappedResults();
            // log.debug('Customer Results', results[0].id);

            currentRecord.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'binnumber',
                value: results[0].id
            });
        }
    }

    function lineInit(context) {
        try {
            let binNumber = '';
            log.debug('lineInit Triggered', '....');
            if (window.parent.nlapiGetRecordType() == 'workordercompletion') {
                const currentRecord = context.currentRecord;
                var locationId = currentRecord.getValue({ fieldId: 'location' });

                switch (parseInt(locationId)) {
                    case 2:
                        binNumber = 'MTCMWC';
                        break;
                    case 3:
                        binNumber = 'AFPEWC';
                        break;
                    case 4:
                        binNumber = 'AFPMWC';
                        break;
                    case 1:
                        binNumber = 'MTCEWC';
                        break;
                    default:
                        binNumber = ''; // default/fallback value
                }
                log.debug("PCT-locationId", locationId)
                log.debug("PCT-binNumber", binNumber)
                var sql = `
            SELECT id,
            FROM bin
          WHERE binnumber = '${binNumber}'
            AND location = ${locationId}
        `;

                var resultSet = query.runSuiteQL({ query: sql });
                var results = resultSet.asMappedResults();
                // log.debug('Customer Results', results[0].id);

                currentRecord.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'binnumber',
                    value: results[0].id
                });

            }
        } catch (e) {
            log.error('Error in lineInit', e);
        }
    }

    return {
        lineInit: lineInit,

        pageInit: pageInit
    };
});
