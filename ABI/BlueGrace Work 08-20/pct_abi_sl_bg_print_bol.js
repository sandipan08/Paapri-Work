/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/record','N/encode', 'N/https', 'N/redirect', 'N/error'], function(record, encode, https, redirect, error) {

    function onRequest(context) {
        log.debug("Context", context)

        try {
            var parameters = context.request.parameters;
            log.debug("parameters", parameters)
    
            var recType = parameters.recType
            var recId = parameters.recId
    
            var IFRecord = record.load({id: recId, type: recType});
            var soRecordId = IFRecord.getValue("createdfrom")
            var salesOrderRecord = record.load({id: soRecordId, type: "salesorder"});
            var bol = salesOrderRecord.getValue("custbody_bg_booking_request_number")
            log.debug("bol", bol)

            if(!bol) {
                context.response.write("BOL number not found!");
            }else {
                //CREDENTIALS
                var credentialRecord = record.load({
                    type: "customrecord_blue_grace_config_rec",
                    id: 2,
                    isDynamic: true,
                });
                
                var username = credentialRecord.getValue("name");
                var password = credentialRecord.getValue(
                    "custrecord_blue_grace_config_password"
                );
                
                log.debug("Username and Password", username + "   " + password)
                
                // Build the authorization header using encode
                var authHeader = 'Basic ' + encode.convert({
                    string: username + ':' + password,
                    inputEncoding: encode.Encoding.UTF_8,
                    outputEncoding: encode.Encoding.BASE_64
                });
                
                log.debug("Header", authHeader)

                            
                // Send the request to third party with the Authorization header
                const response = https.get({
                    url: "https://integration.myblueship.com/api/v1/shipment/"+bol+"/document",
                    headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json",
                    },
                });
                
                log.debug("response", response)
                
                // Log the response code
                var data = JSON.parse(response.body)
                log.debug("resp-code", data);

                var bolPDFlink = data[1].latestDocumentLink;

                redirect.redirect({url: bolPDFlink});
            }
            
                        
        }catch(e) {
            log.debug("ERROR", e.message)
            context.response.write(""+e.message+"");
        }
    }

    return {
        onRequest: onRequest
    }
});
