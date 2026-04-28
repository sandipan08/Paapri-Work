/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/record', 'N/render', 'N/log', 'N/url', 'N/search'],
    function (file, record, render, log, url, search) {

        function onRequest(context) {
            if (context.request.method === 'GET') {
                {
                    var lotNumberId = context.request.parameters.recordId;
                    log.debug({ title: 'PCT-Strouse', details: "Record Id " + lotNumberId });
                    // let lotNumberId = 1937;
                    log.debug("PCT-Strouse", getLotData(lotNumberId))
                    var dataSource = {
                        tagdetails: getLotData(lotNumberId)
                    };

                    var templateFile = file.load({
                        id: 11479
                    });


                    // Rendering Login Page
                    var pageRenderer = render.create();
                    pageRenderer.templateContent = templateFile.getContents();
                    // Adding Data Source to the page renderer
                    pageRenderer.addCustomDataSource({
                        format: render.DataSource.OBJECT,
                        alias: 'ds',
                        data: dataSource
                    });

                    log.debug({
                        title: 'dataSource',
                        details: JSON.stringify(dataSource)
                    })
                    // Replacing in rendered Login Page
                    var renderedPage = pageRenderer.renderAsString();
                    //response.write(renderedPage);
                    log.audit({
                        title: 'renderedPage',
                        details: renderedPage
                    })
                    //renderedPage = renderedPage.split('&').join('&amp;')
                    var response = context.response;
                    //response.write(renderedPage);
                    context.response.renderPdf(remAmp(renderedPage));
                }
            }
        }


        function getLotData(lotNumberId) {
            let dataArray = new Array();

            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["inventorynumber.internalid", "anyof", lotNumberId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "custitem_pct_sc_item_width", label: "Item Width" }),
                        search.createColumn({
                            name: "inventorynumber",
                            join: "inventoryNumber",
                            label: "Number"
                        }),
                        search.createColumn({
                            name: "expirationdate",
                            join: "inventoryNumber",
                            label: "Expiration Date"
                        }),
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({
                            name: "internalid",
                            join: "inventoryNumber",
                            label: "Internal ID"
                        }),
                        search.createColumn({ name: "custitem_atlas_item_image", label: "Item Image" }),
                        search.createColumn({
                            name: "quantityonhand",
                            join: "inventoryNumber",
                            label: "On Hand"
                        })
                    ]
            });
            var searchResultCount = itemSearchObj.runPaged().count;
            //  log.debug("itemSearchObj result count",searchResultCount);
            itemSearchObj.run().each(function (result) {
                let dataObj = {}
                dataObj["itemName"] = result.getValue("itemid");
                let image = 'https://4344933.app.netsuite.com/core/media/media.nl?id=10550&c=4344933&h=zAe-VBj3N9-w6YHYLfv3VngnFYBwB1DB0_61CNr9f947vfbw'
                if (result.getValue("itemid").startsWith("C-") == true) {
                    image = 'https://4344933.app.netsuite.com/core/media/media.nl?id=10549&c=4344933&h=jJM3_JFcZTuNf3VcxHV8otZGwR8lGfN2tTMlqNYRIqp3bw-1'
                }
                dataObj["itemInternalId"] = result.getValue("internalid");
                if (result.getValue("custitem_pct_sc_item_width") != ' ') {
                    dataObj["width"] = result.getValue("custitem_pct_sc_item_width");
                }
                else {
                    dataObj["width"] = "- None -";
                }
                // dataObj["quantityOnHand"] = result.getValue({
                //     name: "quantityonhand",
                //     join: "inventoryNumber"
                // }),
                //     dataObj["inventoryNumber"] = result.getValue({
                //         name: "inventorynumber",
                //         join: "inventoryNumber"
                //     }),
                //     dataObj["inventoryNumberId"] = result.getValue({
                //         name: "internalid",
                //         join: "inventoryNumber"
                //     }),
                //     dataObj["expirationDate"] = result.getValue({
                //         name: "expirationdate",
                //         join: "inventoryNumber"
                //     }),
                //     dataObj["itemImage"] = image,
                //     dataObj["vendorName"] = getItemReceiptData(lotNumberId).vendorName,
                //     dataObj["documentNo"] = getItemReceiptData(lotNumberId).documentNo,
                //     dataObj["createdFrom"] = getItemReceiptData(lotNumberId).createdFrom,
                //     dataObj["dateCreated"] = getItemReceiptData(lotNumberId).dateCreated.split(" ")[0],

                dataObj["quantityOnHand"] = result.getValue({
                    name: "quantityonhand",
                    join: "inventoryNumber"
                })
                dataObj["inventoryNumber"] = result.getValue({
                    name: "inventorynumber",
                    join: "inventoryNumber"
                })
                dataObj["inventoryNumberId"] = result.getValue({
                    name: "internalid",
                    join: "inventoryNumber"
                })
                dataObj["expirationDate"] = result.getValue({
                    name: "expirationdate",
                    join: "inventoryNumber"
                })
                dataObj["itemImage"] = image
                let itemReceiptData = getItemReceiptData(lotNumberId);

                dataObj["vendorName"] = itemReceiptData.vendorName
                dataObj["documentNo"] = itemReceiptData.documentNo
                dataObj["createdFrom"] = itemReceiptData.createdFrom
                dataObj["dateCreated"] = itemReceiptData.dateCreated ? itemReceiptData.dateCreated.split(" ")[0] : '';
                dataArray.push(dataObj)
                return true;
            });
            return dataArray;


        }


        function getItemReceiptData(lotNumberId) {
            var itemreceiptSearchObj = search.create({
                type: "itemreceipt",
                filters:
                    [
                        ["type", "anyof", "ItemRcpt"],
                        "AND",
                        ["inventorydetail.inventorynumber", "anyof", lotNumberId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({
                            name: "entityid",
                            join: "vendor",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "tranid",
                            join: "createdFrom",
                            label: "Document Number"
                        }),
                        search.createColumn({ name: "createdfrom", label: "Created From" }),
                        search.createColumn({ name: "datecreated", label: "Date Created" })
                    ]
            });
            var searchResultCount = itemreceiptSearchObj.runPaged().count;
            let irObj = {};
            //  log.debug("itemreceiptSearchObj result count",searchResultCount);
            itemreceiptSearchObj.run().each(function (result) {
                irObj.vendorName = result.getValue({
                    name: "entityid",
                    join: "vendor",
                })
                irObj.documentNo = result.getValue({
                    name: "tranid",
                    join: "createdFrom",
                })
                irObj.createdFrom = result.getValue("createdfrom")
                irObj.dateCreated = result.getValue("dateCreated")

                return true;
            });
            return irObj;



        }

        function remAmp(data) {
            return data.split('&').join('&amp;');
        }


        return {
            onRequest: onRequest
        }
    });