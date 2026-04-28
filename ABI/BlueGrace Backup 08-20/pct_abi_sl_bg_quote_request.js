/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/https", "N/record", "N/encode", "N/file", "N/ui/serverWidget", "N/render", "N/url"], function (https, record, encode, file, serverWidget, render, url) {
  function onRequest(context) {
    log.debug("COntext", context);

    var parameters = context.request.parameters;
    log.debug("parameters", parameters)

    var quoteId = parameters.qid;
    var quantity = parameters.quantity;
    var calculateWeight = parameters.totalweightoverride;
    var array = JSON.parse(parameters.txtPayLoad);
    log.debug("array", array)


    var item_len = array.length;
    var itemstr = "";
    var itemArray = [];
    for (var i = 0; i < item_len; i++) {
      var itemObj = {};
      var fields = [
        "custitem_abi_bluegrace_freight_class",
        "custitem_abi_bluegrace_length",
        "custitem_abi_bluegrace_width",
        "custitem_abi_bluegrace_height",
        "custitem_abi_bluegrace_dim_type",
        "custitem_abi_bluegrace_type",
        "custitem_abi_bluegrace_fright_weight",
        "custitem_abi_bluegrace_weight_type",
      ];

      if (array[i].weight == 0) array[i].weight = 1;
      var tempWeight = Number(array[i].weight) * Number(array[i].qty);

      var itemWeight = "";
      if (calculateWeight >= 1) {
        itemWeight = calculateWeight;
      } else {
        itemWeight = tempWeight;
      }

      itemObj.class = array[i].class;
      itemObj.weight = itemWeight;
      itemObj.weightUnits = "lbs";
      itemObj.handlingQty = array[i].qty;
      itemObj.handlingUnits = "Pallets";
      itemObj.dimensions = {
        length: array[i].length,
        width: array[i].width,
        height: array[i].height,
        dimUnits: "in",
      };

      itemArray.push(itemObj);
    }

    var bookrequest = parameters.bookrequest;


    if (bookrequest != 1) {
      //Get Quote
      // var file = file.load({ id: 913577 })

      // Ship From
      var shipFromState = parameters.shipfromstate
      var shipFromZip = parameters.shipfromzip
      var shipFromCity = parameters.shipfromcity
      var shipFromCountry = parameters.shipfromcountry
      var liftGate = parameters.liftgate
      var residential = parameters.Residential
      var over_dimension = parameters.overdimension
      var call_ahead = parameters.callahead
      var limited_access = parameters.limitedaccess

      if (shipFromCountry == "United States" || shipFromCountry == "US") {
        shipFromCountry = "USA";
      }

      var accessorials = [];
      var accessorialsMain = [];

      if (liftGate == "T" || liftGate == true) {
        accessorials.push("Liftgate");
      }
      if (residential == "T" || residential == true) {
        accessorials.push("Residential");
      }
      if (call_ahead == "T" || call_ahead == true) {
        accessorials.push("Appointment");
      }
      if (limited_access == "T" || limited_access == true) {
        accessorials.push("LimitedAccess");
      }
      if (over_dimension == "T" || over_dimension == true) {
        accessorialsMain.push("Overdimension");
      }

      var shipToCity = parameters.shiptocity
      var shipToState = parameters.shiptostate
      var shipToZip = parameters.shiptozip
      var shipToCountry = parameters.shiptocountry

      if (shipToCountry == "US") {
        shipToCountry = "USA";
      }

      log.debug("accessorials", accessorials)
      log.debug("accessorialsMain", accessorialsMain)


      var bodyData = {
        mode: "LTL",
        origin: {
          // locationCode: null,
          // name: null,
          city: shipFromCity,
          stateProvince: shipFromState,
          country: shipFromCountry,
          postalCode: shipFromZip,
          accessorials: accessorials,
          // targetDate: null,
        },
        destination: {
          // locationCode: null,
          // name: null,
          city: shipToCity,
          stateProvince: shipToState,
          country: shipToCountry,
          postalCode: shipToZip,
          accessorials: accessorials,
          // targetDate: null,
        },
        accessorials: accessorialsMain,
        items: itemArray,
        // linearFeet: null,
        // references: null,
        // businessUnit: null,
        // accountNumber: null,
      };


      try {
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



        log.debug("FINAL BODY DATA", bodyData)

        // Send the request to third party with the Authorization header
        const response = https.post({
          url: "https://integration.myblueship.com/api/v1/Quote",
          body: JSON.stringify(bodyData),
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
          },
        });

        // Log the response code
        log.debug("resp-code", JSON.parse(response.body));

        var data = JSON.parse(response.body)

        lineArr = data.quotes;
        var quoteNum = data.quoteID;
        log.debug("quoteID***", quoteId)
        var carrierArr = [];
        // var distanceArr = [];
        var serviceArr = [];
        // var freightArr = [];
        // var ServicetotArr = [];
        var totArr = [];
        var contractArr = [];
        var SCACArr = [];
        var service_days = [];
        for (var i = 0; i < lineArr.length; i++) {
          var temp = lineArr[i];
          carrierArr.push(temp.carrierName);
          // distanceArr.push(temp.Distance);
          serviceArr.push(temp.serviceDays);
          // freightArr.push(temp.FreightTotal);
          // ServicetotArr.push(temp.ServicesTotal);
          contractArr.push(temp.quoteDetails);
          SCACArr.push(temp.scac);
          totArr.push(temp.total);
          service_days.push(temp.serviceDays);
        }


        // ****************************************************
        //New Coded added on 2024-01-11

        var carrierArray = []
        for (var k = 0; k < carrierArr.length; k++) {
          var obj = {};
          obj.carrier = carrierArr[k]
          var t_days = parseInt(service_days[k]);
          obj.freight = t_days + ' days'
          obj.contract = contractArr[k]
          obj.total = totArr[k]
          obj.scac = SCACArr[k]

          carrierArray.push(obj)
        }

        // sort by value
        carrierArray.sort((a, b) => a.total - b.total);

        // var postQuoteDetailsURL = url.resolveScript({
        //   scriptId: 'customscript_pct_abi_rl_bg_quote_request',
        //   deploymentId: 'customdeploy_pct_abi_rl_bg_quote_request',
        //   returnExternalUrl: false
        // })

        var dataSource = {
          quoteId: quoteId,
          quoteNumber: quoteNum,
          carrierArray: carrierArray,
          // postQuoteDetailsURL: postQuoteDetailsURL
        }

        log.debug("dataSource",dataSource)

        var templateFile = file.load({
          id: 10672881
        })

        //10264695

        var pageRenderer = render.create();
        pageRenderer.templateContent = templateFile.getContents();

        pageRenderer.addCustomDataSource({
          format: render.DataSource.OBJECT,
          alias: 'ds',
          data: dataSource
        });

        var renderedPage = pageRenderer.renderAsString();
        context.response.write(renderedPage);
      } catch (e) {
        log.debug("ERROR", e.message)
        context.response.write("" + e.message + "");
      }





      // ****************************************************
      //END












      // var form = serverWidget.createForm({
      //   title: 'Blue Grace Quote Request',
      //   hideNavBar: true
      // })

      // var quoteField = form.addField({
      //   id: 'custpage_textareafield',
      //   type: serverWidget.FieldType.TEXT,
      //   label: 'Quote Number'
      // });

      // var inlineHTML = form.addField({
      //   id: 'custpage_textinlinefield',
      //   type: serverWidget.FieldType.INLINEHTML,
      //   label: 'Inline HTML'
      // });

      // // inlineHTML.defaultValue = '<script>document.getElementById("ns_navigation").style.display = "hidden";</script>'
      // quoteField.defaultValue = quoteNum;

      // // Add a sublist to the form
      // var sublist = form.addSublist({
      //   id: 'sublistid',
      //   type: serverWidget.SublistType.LIST,
      //   label: 'Carriers'
      // });

      // // Add fields to the sublist
      // sublist.addField({
      //   id: 'custpage_radio',
      //   type: serverWidget.FieldType.RADIO,
      //   label: 'Select'
      // });

      // sublist.addField({
      //   id: 'custpage_carrier',
      //   type: serverWidget.FieldType.TEXT,
      //   label: 'Carrier'
      // });

      // sublist.addField({
      //   id: 'custpage_freight',
      //   type: serverWidget.FieldType.TEXT,
      //   label: 'Est. Transit'
      // });

      // sublist.addField({
      //   id: 'custpage_total',
      //   type: serverWidget.FieldType.CURRENCY,
      //   label: 'Total'
      // });

      // var contractField = sublist.addField({
      //   id: 'custpage_contract',
      //   type: serverWidget.FieldType.TEXT,
      //   label: 'Contract'
      // });
      // contractField.updateDisplayType({
      //   displayType: serverWidget.FieldDisplayType.HIDDEN
      // });

      // for (var k = 0; k < carrierArr.length; k++) {
      //   sublist.setSublistValue({
      //     id: 'custpage_carrier',
      //     line: k,
      //     value: carrierArr[k]
      //   });

      //   var t_days = parseInt(service_days[k]);
      //   sublist.setSublistValue({
      //     id: 'custpage_freight',
      //     line: k,
      //     value: t_days + ' days'
      //   });

      //   sublist.setSublistValue({
      //     id: 'custpage_total',
      //     line: k,
      //     value: totArr[k]
      //   });

      //   // sublist.setSublistValue({
      //   //   id: 'custpage_contract',
      //   //   line: k,
      //   //   value: contractArr[k]
      //   // });

      //   sublist.setSublistValue({
      //     id: 'custpage_scac',
      //     line: k,
      //     value: SCACArr[k]
      //   });
      // }

      // try {
      //   var scrUseQuote =
      //     "var sublistCount = form.getSublist({id: 'sublistid'});\
      //     console.log(sublistCount);";

      //   var scrClose =
      //     "window.onbeforeunload = null;self.close();\
      // window.opener.document.getElementById('custbody_abi_shp_hnd_disc_formattedValue').focus();\
      // window.opener.document.getElementById('custbody_abi_prem_frght_dsc_formattedValue').focus();";

      //   // Adding buttons to the form

      //   form.addButton({
      //     id: 'custombutton',
      //     label: 'Use Quote',
      //     functionName: scrUseQuote
      //   });

      //   form.addButton({
      //     id: 'custpage_closebutton',
      //     label: 'Close',
      //     functionName: scrClose
      //   });

      //   // Send the response back to the client
      //   context.response.writePage(form);


      // } catch (e) {
      //   log.debug("ERROR", e)
      // }




    }
  }

  return {
    onRequest: onRequest,
  };
});
