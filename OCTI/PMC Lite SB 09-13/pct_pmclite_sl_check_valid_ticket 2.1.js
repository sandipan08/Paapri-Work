/**
 *              //////////     PMC Lite 2.1 | CHECK VALID TICKET     //////////
 * 
*@author       Rajesh Nandi
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2024-08-26 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PMC Lite, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
                
 *@description  This Suitelet is used to validate User Scan Ticket.
 */
define(['N/record', 'N/search'], function (record, search) {
    var _response;
    var _request;
    var result;
    function onRequest(context) {
        _request = context.request;
        _response = context.response;

        if (_request.method == 'GET') {

            // Getting Params [GET REQUEST]
            var ticket = _request.parameters.ticket;
            log.debug({
                title: 'ticket =' + ticket,
                details: 'ticket =' + ticket
            })
            let workOrderNumber = ticket.split('/')[0]
            let operationSeq = ticket.split('/')[1]
            let MFGTaskId = getMFGTaskId(workOrderNumber, operationSeq)
            // let itemSearchResponse = itemSearch(itemInternalID, locid);
            if (MFGTaskId.isSuccess) {
                result = { 'isSuccess': true, 'data': MFGTaskId.data }
            } else {
                result = { 'isSuccess': false, 'errorMessage': 'No Data Found' }
            }
            _response.write(JSON.stringify(result))

        }
    }
    const getMFGTaskId = (workOrderNumber, operationSeq) => {
        let ticketNumber = '';
        let internalid = '';
        let condition = "formulanumeric: CASE WHEN {workorder.number}= '" + workOrderNumber + "' THEN 1 ELSE 0 END"
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    [condition, "equalto", "1"],
                    "AND",
                    ["sequence", "equalto", operationSeq]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug("manufacturingoperationtaskSearchObj result count", searchResultCount);
        if (searchResultCount > 0) {

            manufacturingoperationtaskSearchObj.run().each(function (result) {
                internalid = result.id
                return true;
            });
            ticketNumber = operationSeq + '/' + internalid//10/11633
            return { 'isSuccess': true, 'data': ticketNumber }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }



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
                    search.createColumn({ name: "islotitem", label: "Is Lot Numbered Item" })
                ]
        });
        var itemCount = itemSearchObj.runPaged().count;
        log.debug("Item Count : " + itemCount);
        if (itemCount > 0) {
            let itemObj = {};
            itemSearchObj.run().each(function (result) {
                itemObj['lotNumber'] = false
                let lotNumber = result.getValue({
                    name: "islotitem",
                });
                let serialNumber = result.getValue({
                    name: "isserialitem",
                });
                if (lotNumber == true || serialNumber == true) {
                    itemObj['lotNumber'] = true
                }
                // itemObj['lotNumber'] = result.getValue({
                //     name: "islotitem",
                // });
                // itemObj['serialNumber'] = result.getValue({
                //     name: "isserialitem",
                // });
                itemObj['binNumber'] = result.getValue({
                    name: "usebins",
                });
                itemObj['internalId'] = result.id;
                return true;
            });
            return { 'isSuccess': true, 'data': itemObj }

        }
        return { 'isSuccess': false, 'errorMessage': 'No Data Found' }
    }
    // ----------------------------- Item Search Function End ----------------------------------
    return {
        onRequest: onRequest
    }
});
