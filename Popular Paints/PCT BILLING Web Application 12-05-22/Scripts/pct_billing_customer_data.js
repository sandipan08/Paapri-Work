/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/file'], function (search, record, file)
{

    function execute(context)
    {

        var customerArr = new Array();
        var customerSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["status", "anyof",  "SalesOrd:G"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "entity",
                        summary: "GROUP",
                        label: "Name"
                    })
                ]
        });
        var searchResultCount = customerSearchObj.runPaged().count;
        log.debug("customerSearchObj result count", searchResultCount);

        var start = 0;
        var end = 1000;

        do
        {
            var result = customerSearchObj.run().getRange({ start: start, end: end });
            for (var i = 0; i < result.length; i++)
            {
                var customerObj = new Object();

                var internalId = result[i].getValue({
                    name: "entity",
                    summary: "GROUP",
                    label: "Name"
                })

                customerObj.internal_id = internalId;
                customerObj.name = result[i].getText({
                    name: "entity",
                    summary: "GROUP",
                    label: "Name"
                });
                customerArr.push(customerObj);
            }
            end += 1000;
            start += 1000;
            searchResultCount -= 1000;
        } while (searchResultCount > 0)

        log.debug({
            title: 'customerArr',
            details: JSON.stringify(customerArr)
        })

        var fileObj = file.create({
            name: 'customerData.json',
            fileType: file.Type.JSON,
            contents: JSON.stringify(customerArr),

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
        if (mainFolderSearchCount > 0)
        {
            for (var mainFolderIndex = 0; mainFolderIndex < mainFolderSearchCount; mainFolderIndex++)
            {
                mainFolderId = mainFolderSearchResult[mainFolderIndex].id;

            }
        }
        if (mainFolderId > 0)
        {
            var dataFolderId = 0;
            var dataFolderSearch = search.create({
                type: "folder",
                filters:
                    [
                        ["name", "is", "PCT BILLING JSON CUSTOMER DATA"],
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
            if (dataFolderSearchCount > 0)
            {
                for (var dataFolderIndex = 0; dataFolderIndex < dataFolderSearchCount; dataFolderIndex++)
                {
                    dataFolderId = dataFolderSearchResult[dataFolderIndex].id;

                }
            }
            if (dataFolderId > 0)
            {
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
