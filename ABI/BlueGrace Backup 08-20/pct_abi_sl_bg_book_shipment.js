/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(["N/https", "N/record", "N/encode", "N/file", "N/ui/serverWidget", "N/render", "N/url", 'N/search'], function (https, record, encode, file, serverWidget, render, url, search) {
    function onRequest(context) {
      log.debug("Context", context);
  
      var parameters = context.request.parameters;
      log.debug("parameters", parameters)

    //PARAMETERS
    //   {
    //     shipfromzip: "46544-3019",
    //     shipName: "ABI Attachments, Inc",
    //     shipAddr1: "520 S Byrkit St",
    //     itemarr: "{"itemid":5152,"qty":10,"weight":72,"length":48,"width":48,"height":12}",
    //     qid: "4390232",
    //     shiptocountry: "US",
    //     shipfromcity: "Mishawaka",
    //     deploy: "1",
    //     shipfrom: "ABI Attachments, Inc574-674-5033520 S Byrkit StMishawaka IN 46544-3019United States",
    //     shiptostate: "KY",
    //     compid: "4310077_SB1",
    //     shiptozip: "40511",
    //     Ser_Num: "",
    //     shipto: "Eaton Farms Management859-233-76774454 Mt. Horeb PikeFALSELexington KY 40511United States",
    //     shiptoname: "Eaton Farms Management",
    //     shiptoaddr1: "4454 Mt. Horeb Pike",
    //     shipfromcountry: "US",
    //     Ord_Num: "SO380173",
    //     script:1094,
    //     l_com: "",
    //     shipfromstate: "IN",
    //     instruction: "",
    //     C_Note: "",
    //     shiptocity: "Lexington",
    //     dc: "859-233-7677 71@abiattachments.com"
    //  }

  
      var quoteId = parameters.qid;
      var instruction = parameters.instruction;
      var l_com = parameters.l_com;

      var references = [];
      var companyNotes =parameters.C_Note;
      var serialNumber = parameters.Ser_Num;
      var salesOrderNumber = parameters.Ord_Num;
      if(companyNotes) {references.push({name: "Company Notes", value: companyNotes})}
      if(serialNumber) {references.push({name: "Serial Number", value: serialNumber})}
      if(salesOrderNumber) {references.push({name: "Order Number", value: salesOrderNumber})}
      if(references.length == 0) {references = null}
     

      // PICK UP POINT
      var shipFromName = parameters.shipName;
      var shipFromAddr1 = parameters.shipAddr1;
      var shipFromState = parameters.shipfromstate;
      var shipFromZip  = parameters.shipfromzip;
      var shipFromCity  = parameters.shipfromcity;;
      var shipFromCountry   = parameters.shipfromcountry;
      if (shipFromCountry == "United States" || shipFromCountry == "US") {
        shipFromCountry = "USA";
      }

      var dc = parameters.dc;

      // DESTINATION POINT
      var shipToName = parameters.shiptoname;
      var shipToAddr1= parameters.shiptoaddr1;
      var shipToCity = parameters.shiptocity;
      var shipToState = parameters.shiptostate;
      var shipToZip = parameters.shiptozip;
      var shipToCountry = parameters.shiptocountry;
      if (shipToCountry == "United States" || shipToCountry == "US") {
        shipToCountry = "USA";
      }
      


// Item Weight & Class
var quote = record.load({
  type: record.Type.SALES_ORDER,
  id: quoteId,
  isDynamic: false // Set it to true if you need to edit the record
});

var lineCount = quote.getLineCount({
  sublistId: 'item'
});

var totWeight = 0;
var totQty = 0;

for (var k = 0; k < lineCount; k++) {
  var qty = quote.getSublistValue({
      sublistId: 'item',
      fieldId: 'quantity',
      line: k
  });
  var weight = quote.getSublistValue({
      sublistId: 'item',
      fieldId: 'weightinlb',
      line: k
  });

  totWeight += Number(qty) * Number(weight);
  totQty += Number(qty);
}


 // Check ASSESORIALS
var assesStr = '';
var checkLiftGate = quote.getValue({fieldId: 'custbodyfreight_liftgate'});
var checkResidential = quote.getValue({fieldId: 'custbody_freight_residential'});
var checkCallAhead = quote.getValue({fieldId: 'custbody_freight_call_ahead'});
var checkLimAccess = quote.getValue({fieldId: 'custbody_limited_access'});

var accessorials = []
if (checkLiftGate == "T" || checkLiftGate == true) {accessorials.push("Liftgate");}
if (checkResidential == "T" || checkResidential == true) {accessorials.push("Residential");}
if (checkCallAhead == "T" || checkCallAhead == true) {accessorials.push("Appointment");}
if (checkLimAccess == "T" || checkLimAccess == true) {accessorials.push("LimitedAccess");}
if (accessorials.length == 0) {accessorials = null}


// Replace Contract Id & SCAC
var carrierQuoteNumber = quote.getValue({
  fieldId: 'custbody_abi_quote_conf_no'
});
var contractId = quote.getValue({
  fieldId: 'custbody_abi_blue_grace_contract_id'
});
var SCACId = quote.getValue({
  fieldId: 'custbody_abi_blue_grace_scac'
});


// Item Array
var array = JSON.parse(parameters.itemarr)
// var array = JSON.parse("[" + items + "]");
log.debug("array", array)

var item_len = parseFloat(array.length);
var itemstr = '';

var itemArr = [];

var id = array.itemid;
log.debug("id", id)

var qty = array.qty;
log.debug("qty", qty)

// for (var i = 0; i < 1; i++) {
    var itemFields = search.lookupFields({
      type: search.Type.ITEM,
      id: parseInt(array.itemid),
      columns: ['displayname', 'custitem_abi_bluegrace_nmfc', 'custitem_abi_bluegrace_freight_class', 'custitem_abi_bluegrace_length', 'custitem_abi_bluegrace_width', 'custitem_abi_bluegrace_height', 'custitem_abi_bluegrace_dim_type', 'custitem_abi_bluegrace_type', 'custitem_abi_bluegrace_fright_weight', 'custitem_abi_bluegrace_weight_type']
    });

    var classX = 150;

    if (parseFloat(array.weight) == 0)
        array.weight = 1;
    var tempWeight = Number(parseFloat(array.weight)) * Number(parseFloat(array.qty));

    log.debug("itemFields", itemFields)


    var itemObj = {};

    itemObj.description = itemFields.displayname;
    itemObj.orderReferenceNumber = salesOrderNumber;
    itemObj.poLineRef = null;
    itemObj.customerPartNumber = null;
    itemObj.upc = null;
    itemObj.classificationType = null;
    itemObj.class = classX;
    itemObj.nmfcCode = itemFields.custitem_abi_bluegrace_nmfc;
    // itemObj.commodityCodes = ["string"];
    itemObj.weight = tempWeight;
    itemObj.weightUnits = "lbs";
    itemObj.handlingQty = parseFloat(array.qty);
    itemObj.handlingUnits = "Pallets";
    itemObj.pieceQty = null;
    itemObj.pieceUnits = null;
    itemObj.valueOfGoods = null;
    itemObj.glCode = null;
    itemObj.isStackable = null;
    itemObj.fluidVolume = null;
    itemObj.fluidVolumeUnits = null;
    itemObj.dimensions = {
        length: parseFloat(array.length),
        width: parseFloat(array.width),
        height: parseFloat(array.height),
        dimUnits: "in"
    };
    itemObj.pickupLocationCode = null;
    itemObj.dropLocationCode = null;
    itemObj.pickupSequenceID = null;
    itemObj.dropSequenceID = null;
    

    itemArr.push(itemObj)
// }



var bodyData = {
  bol: null,
  action: "Book",
  businessUnit: null,
  accountNumber: null,
  mode: "LTL",
  addresses: [
    {
      sequence: 1,
      name: shipFromName,
      address1: shipFromAddr1,
      address2: null,
      city: shipFromCity,
      stateProvince: shipFromState,
      country: shipFromCountry,
      postalCode: shipFromZip,
      locationCode: null,
      earliestDate: null,
      latestDate: null,
      earliestAppointmentDateTime: null,
      latestAppointmentDateTime: null,
      appointmentNumber: null,
      accessorials: accessorials,
      addressComment: null,
      contact: {
        name: null,
        email: null,
        phone: null,
        fax: null
      }
    },
    {
      sequence: 2,
      name: shipToName,
      address1: shipToAddr1,
      address2: null,
      city: shipToCity,
      stateProvince: shipToState,
      country: shipToCountry,
      postalCode: shipToZip,
      locationCode: null,
      earliestDate: null,
      latestDate: null,
      earliestAppointmentDateTime: null,
      latestAppointmentDateTime: null,
      appointmentNumber: null,
      accessorials: accessorials,
      addressComment:  null,
      contact: {
        name: null,
        email: null,
        phone: null,
        fax: null
      }
    }
  ],
  accessorials: null,
  items: itemArr,
  rateSelection: {
    method: "Carrier",
    criteria: {
      scac: SCACId,
      days: null,
      threshold: null
    },
    serviceLevel: null
  },
  references: references,
  specialInstructions: instruction,
  notes: null,
  linearFeet: null
}

try {
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


log.debug("FINAL BODY", bodyData)

// Send the request to third party with the Authorization header
const response = https.post({
  url: "https://integration.myblueship.com/api/v1/Shipment",
  body: JSON.stringify(bodyData),
  headers: {
    "Authorization": authHeader,
    "Content-Type": "application/json",
  },
});

log.debug("response", response)

// Log the response code
var data = JSON.parse(response.body)
log.debug("resp-code", data);


context.response.write(data.bol);
}catch(e) {
  log.debug("ERROR", e.message)
  context.response.write(""+e.message+"");
}

  
  
  

  
  
  
        // var dataSource = {
        //   quoteId: quoteId,
        //   quoteNumber: quoteNum,
        //   carrierArray: carrierArray,
        //   postQuoteDetailsURL: postQuoteDetailsURL
        // }
  
        // var templateFile = file.load({
        //   id: 10264695
        // })
  
        // var pageRenderer = render.create();
        // pageRenderer.templateContent = templateFile.getContents();
  
        // pageRenderer.addCustomDataSource({
        //   format: render.DataSource.OBJECT,
        //   alias: 'ds',
        //   data: dataSource
        // });
  
        // var renderedPage = pageRenderer.renderAsString();
        // context.response.write(renderedPage);
  
  
  
  
    }
  
    return {
      onRequest: onRequest,
    };
  });
  