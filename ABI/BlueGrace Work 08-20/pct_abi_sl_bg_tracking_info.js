/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
 define(["N/https", "N/record", "N/encode"], function (https, record, encode) {

    function onRequest(context) {
        var request = context.request;
        var respone = context.respone;


        log.debug('Saatish-LOG', 'In Backend Suitelet');
        var rec_id = context.request.parameters.rec_id;
        log.debug('LOG', 'rec_id =' + rec_id);
        var req_id = context.request.parameters.req_id;
        log.debug('LOG', 'req_id =' + req_id);
        // var fileObj = file.load({ id: 1174740 });

        var currentRecord = record.load({type: "salesorder", id: rec_id, isDynamic: true})

        var bookingRequestNumber = currentRecord.getValue("custbody_bg_booking_request_number")
        log.debug("bookingRequestNumber", bookingRequestNumber)



        try {

            //CREDENTIALS
        var credentialRecord = record.load({
            type: "customrecord_blue_grace_config_rec",
            id: 1,
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
            url: "https://integration.myblueship.com/api/v1/Shipment/search?refValue="+bookingRequestNumber+"&refName=BOL",
            headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
            },
        });
        
        var statusCode = response.code;

        var result="";

        if(statusCode == 200) {
            log.debug("ENETR***")
            // Log the response code
            var data = JSON.parse(response.body)
            data = data[0]
            log.debug("resp-code", data); 
            
            result = data.shipmentStatus;
        }else {

            result = 'Not Found in Database!!';
            log.debug("NOT FOUND!")
        }

        log.debug("result", result)
    
        context.response.write(result)

        }catch (e) {
            log.debug("ERROR", e.message)
            context.response.write(""+e.message+"");
        }
        
    }

    return {
        onRequest: onRequest
    }
});
