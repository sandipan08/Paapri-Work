// Connect ProXR Sandbox account
/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */

define(['N/https', 'N/log'], function (https, log) {

    function execute(context) {
        var shopifyDomain = 'proxr-sandbox.myshopify.com';
        var accessToken = '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';  // Replace with your actual token
        var apiVersion = '2024-04';

        // var endpoint = 'https://' + shopifyDomain + '/admin/api/' + apiVersion + '/orders/6000965648573.json';
         var endpoint = `https://${shopifyDomain}/admin/api/${apiVersion}/orders.json?status=any&limit=5`; //to get all th orders


        var headers = {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
        };

        try {
            var response = https.get({
                url: endpoint,
                headers: headers
            });

            var responseBody = JSON.parse(response.body);
            log.debug('Shopify Orders', JSON.stringify(responseBody.orders));

            // Further processing logic here...

        } catch (e) {
            log.error('Error calling Shopify', e.message);
        }
    }

    return {
        execute: execute
    };
});
