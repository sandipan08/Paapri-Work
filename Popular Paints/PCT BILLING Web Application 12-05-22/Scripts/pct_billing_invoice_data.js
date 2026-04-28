/**
 *              //////////     PCT BILLING | INVOICE DATA SCHEDULED SCRIPT     //////////
 *
 *@Author       Arghadeep Sarkar & Suman Das
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@NModuleScope SameAccount
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The ScheduledScript 2.1 code in this page is for PCT BILLING, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
 *@description  This scheduled script is used to fetch the invoice data from netsuite as json.
 */
 define(['N/search', 'N/record', 'N/file'], function (search, record, file) {

    function execute(context) {
        var invArr = new Array()
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "altname",
                        join: "customerMain",
                        label: "Name"
                     })
                ]
        });
        var searchResultCount = invoiceSearchObj.runPaged().count;
        log.debug("invoiceSearchObj result count", searchResultCount);

        var start = 0;
        var end = 1000;

        //srch.run().each(function(result)
        do {
            var result = invoiceSearchObj.run().getRange({ start: start, end: end });
            //log.debug("result.length", result.length);
            for (var i = 0; i < result.length; i++) {



                var invObj = new Object();
                invObj['document_number'] = result[i].getValue({ name: "tranid" });
                invObj['internal_id'] = result[i].getValue({ name: "internalid" });
                invObj['entity']=result[i].getValue({name: "altname",join: "customerMain"});


                invArr.push(invObj);
                // .run().each has a limit of 4,000 results
                //return true;
                //  });

            }

            //return true;
            end += 1000;
            start += 1000;
            searchResultCount -= 1000;
        } while (searchResultCount > 0)

        log.debug({
            title: 'invArr',
            details: JSON.stringify(invArr)
        })

        var fileObj = file.create({
            name: 'invData.json',
            fileType: file.Type.JSON,
            contents: JSON.stringify(invArr),
            // description: string,
            //folder: 8509
        });










        var mainFolderId = 0;
        var mainFolderSearch = search.create({
            type: "folder",
            filters:
                [
                    ["name", "is", "PCT BILLING"]
                ]
        });
        var mainFolderSearchCount = mainFolderSearch.runPaged().count;
        log.debug("PCT-BILLING", 'Main Folder Count:' + mainFolderSearchCount);
        var mainFolderSearchResult = mainFolderSearch.run().getRange({
            start: 0,
            end: mainFolderSearchCount
        });
        if (mainFolderSearchCount > 0) {
            for (var mainFolderIndex = 0; mainFolderIndex < mainFolderSearchCount; mainFolderIndex++) {
                mainFolderId = mainFolderSearchResult[mainFolderIndex].id;
                log.debug({
                    title: 'PCT-BILLING',
                    details: 'Main Folder Id:' + mainFolderId
                });
            }
        }
        if (mainFolderId > 0) {
            var dataFolderId = 0;
            var dataFolderSearch = search.create({
                type: "folder",
                filters:
                    [
                        ["name", "is", "PCT BILLING JSON INVOICE DATA"],
                        "AND",
                        ["parent", "anyof", mainFolderId]
                    ]
            });
            var dataFolderSearchCount = dataFolderSearch.runPaged().count;
            log.debug("PCT-FS", 'Data Folder Count:' + dataFolderSearchCount);
            var dataFolderSearchResult = dataFolderSearch.run().getRange({
                start: 0,
                end: dataFolderSearchCount
            });
            if (dataFolderSearchCount > 0) {
                for (var dataFolderIndex = 0; dataFolderIndex < dataFolderSearchCount; dataFolderIndex++) {
                    dataFolderId = dataFolderSearchResult[dataFolderIndex].id;
                    log.debug({
                        title: 'PCT-FS',
                        details: 'Data Folder Id:' + dataFolderId
                    });
                }
            }
            if (dataFolderId > 0) {
                fileObj.folder = dataFolderId;
                var fileId = fileObj.save();
                log.debug({
                    title: 'fileId',
                    details: fileId
                })
            }
        }



    }

    return {
        execute: execute
    }
});
