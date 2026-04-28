/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search'], function (search) {

    function _get(context) {
        try {

            log.debug("PCT-Strouse", "In Get Vendor Restlet");
            let vendorArray = [];
            var vendorSearchObj = search.create({
                type: "vendor",
                filters:
                    [
                        // ["isinactive", "is", "F"]
                        ["internalid", "anyof", "3141"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });
            var vendorCount = vendorSearchObj.runPaged().count;
            log.debug("PCT-Strouse", "Vendor Order Count : " + vendorCount);
            var start = 0;
            var end = 1000;
            do {
                var result = vendorSearchObj.run().getRange({
                    start: start,
                    end: end
                });
                for (let vendorIndex = 0; vendorIndex < result.length; vendorIndex++) {
                    let vendorObj = {};
                    vendorObj['internalId'] = result[vendorIndex].id;
                    vendorObj['documentNumber'] = result[vendorIndex].getValue('entityid');
                    vendorArray.push(vendorObj);
                }
                end += 1000;
                start += 1000;
                vendorCount -= 1000;
            }
            while (vendorCount > 0);
            log.debug("PCT-Strouse", "Vendor List : " + JSON.stringify(vendorArray))
            return { 'isSuccess': true, 'data': vendorArray }
        }
        catch (error) {
            return { 'isSuccess': false, 'data': error.message }
        }
    }

    return {
        get: _get,
    }
});
