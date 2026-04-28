/**
 * Module Description
 *
 * Version    Date                  Author           Remarks
 * 1.00       01 October 2020       Anirban Gupta
 *
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
/**************************************************************************************

Script Name:        PCT_MOTT_TIMESHEET_Homepage_Suitelet
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose:            Homepage renderer for MOTT TimeSheet.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update*************************************************************
/**********************************************************************************************************************************************

 Function Name:             Purpose:                                                                               Developer:
 onRequest                  Renders the html page                                                                  Anirban Gupta
 findParentFolder           Perform the saved search of parent folder search and export the resultant data         Anirban Gupta
 findSubFolder              Perform the saved search of sub folder search and export the resultant data            Anirban Gupta
 findFile                   Perform the saved search of file search and export the resultant data                  Anirban Gupta
 findScript                 Perform the saved search of script search and export the resultant data                Anirban Gupta

/***********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

****************************************************************************************/

define(['N/file', 'N/record', 'N/search', 'N/https', 'N/log'],
  function (file, record, search, https, log) {

    function onRequest(context) 
    {
      var response = context.response;
      var parentFolder, viewFolder, imageFolder, controllerFolder;
      var html_file, logo, favicon, apple_icon, controller;
      var script_searcherScript_internalid;
      
      if(context.request.method === 'GET')
      {
        log.audit({
          title: 'Request Received.'
        });

        /* ------------------------- FINDING ALL FOLDERS ------------------------- */
        /* ---------------------------- Parent Folder ---------------------------- */

        const parentFolderResult = findParentFolder();
        const parentFolderSearchResult = parentFolderResult[0];
        const parentFolderSearchResultCount = parentFolderResult[1];

        if(parentFolderSearchResultCount !=0)
        {
          parentFolder = parentFolderSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'Parent Folder',
            details: 'Parent Folder [PCT MOTT Timesheet PMC] Not Found'
          });
        }

        /* ---------------------------- View Folder ---------------------------- */

        const viewFolderResult = findSubFolder(parentFolder, "View");
        const viewFolderSearchResult = viewFolderResult[0];
        const viewFolderSearchResultCount = viewFolderResult[1];

        if(viewFolderSearchResultCount !=0)
        {
          viewFolder = viewFolderSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'Sub Folder',
            details: 'View Folder [View] Not Found'
          });
        }

        /* ---------------------------- Image Folder ---------------------------- */

        const imageFolderResult = findSubFolder(parentFolder, "Images");
        const imageFolderSearchResult = imageFolderResult[0];
        const imageFolderSearchResultCount = imageFolderResult[1];

        if(imageFolderSearchResultCount !=0)
        {
          imageFolder = imageFolderSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'Sub Folder',
            details: 'Image Folder [Images] Not Found'
          });
        }

        /* ---------------------------- Controler Folder ---------------------------- */

        const controllerFolderResult = findSubFolder(parentFolder, "Controller");
        const controllerFolderSearchResult = controllerFolderResult[0];
        const controllerFolderSearchResultCount = controllerFolderResult[1];

        if(controllerFolderSearchResultCount !=0)
        {
          controllerFolder = controllerFolderSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'Sub Folder',
            details: 'Controller Folder [Controller] Not Found'
          });
        }

        /* ------------------------- FINDING ALL FILES ------------------------- */
        /* ---------------------------- HTML File ---------------------------- */

        const htmlFileResult = findFile(viewFolder, "PCT_MOTT_TIMESHEET_Index.html");
        const htmlFileSearchResult = htmlFileResult[0];
        const htmlFileSearchResultCount = htmlFileResult[1];

        if(htmlFileSearchResultCount !=0)
        {
          html_file = htmlFileSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'HTML File',
            details: 'HTML File [PCT_MOTT_TIMESHEET_Index.html] Not Found'
          });
        }

        /* ---------------------------- LOGO File ---------------------------- */

        const logoFileResult = findFile(imageFolder, "logo.png");
        const logoFileSearchResult = logoFileResult[0];
        const logoFileSearchResultCount = logoFileResult[1];

        if(logoFileSearchResultCount !=0)
        {
          logo = logoFileSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'LOGO Image File',
            details: 'LOGO Image File [logo.png] Not Found'
          });
        }

        /* ---------------------------- FAVICON File ---------------------------- */

        const faviconFileResult = findFile(imageFolder, "favicon.png");
        const faviconFileSearchResult = faviconFileResult[0];
        const faviconFileSearchResultCount = faviconFileResult[1];

        if(faviconFileSearchResultCount !=0)
        {
          favicon = faviconFileSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'FAVICON Image File',
            details: 'FAVICON Image File [favicon.png] Not Found'
          });
        }

        /* ---------------------------- APPLEICON File ---------------------------- */

        const appleIconFileResult = findFile(imageFolder, "apple-icon.png");
        const appleIconFileSearchResult = appleIconFileResult[0];
        const appleIconFileSearchResultCount = appleIconFileResult[1];

        if(appleIconFileSearchResultCount !=0)
        {
          apple_icon = appleIconFileSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'APPLEICON Image File',
            details: 'APPLEICON Image File [apple-icon.png] Not Found'
          });
        }

        /* ---------------------------- CONTROLLER File ---------------------------- */

        const controllerFileResult = findFile(controllerFolder, "PCT_MOTT_TIMESHEET_Controller.js");
        const controllerFileSearchResult = controllerFileResult[0];
        const controllerFileSearchResultCount = controllerFileResult[1];

        if(controllerFileSearchResultCount !=0)
        {
          controller = controllerFileSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'CONTROLLER File',
            details: 'CONTROLLER File [PCT_MOTT_TIMESHEET_Controller.js] Not Found'
          });
        }

        /* ------------------------- FINDING INTERNAL ID OF SCRIPT WHICH RETURNS INTERNAL ID OF SEARCHED SCRIPTS [FOR FULLY DYNAMIC CONSOLE] ------------------------- */

        const scriptResult = findScript();
        const scriptSearchResult = scriptResult[0];
        const scriptSearchResultCount = scriptResult[1];

        if(scriptSearchResultCount !=0)
        {
          script_searcherScript_internalid = scriptSearchResult[0].getValue("internalid");
        }
        else
        {
          log.audit({
            title: 'Script Searcher RESTLet',
            details: 'Script Searcher RESTLet [customscript_pct_mott_time_scriptintid] Not Found'
          });
        }

        /* ----------- LOADING ALL FILES TO REPLACE IN HTML ----------- */
        /* ------------------------ Images ------------------------ */

        logo_file = file.load({ id: logo });
        favicon_file = file.load({ id: favicon });
        apple_icon_file = file.load({ id: apple_icon });

        /* ------------------------ Controller ------------------------ */

        controller_file = file.load({ id: controller });

        /* ---------------------- LOADING HTML FILE ---------------------- */

        file = file.load({ id: html_file });
        /*log.audit({
          title: 'file details',
          details: file
        });*/
        var html = file.getContents();

        /* ------------------------ Replacing Images in HTML ------------------------ */

        html=html.replace("#LOGO#", logo_file.url);
        html=html.replace("#FAVICON#", favicon_file.url);
        html=html.replace("#APPLE-ICON#", apple_icon_file.url);

        /* ------------------------ Replacing Controller in HTML ------------------------ */

        html=html.replace("#CONTROLLER#", controller_file.url);

        /* ------------------------ Adding ScriptSearcher Script's Internal ID in HTML ------------------------ */

        html=html.replace("#SCRIPT-SEARCHER-SCRIPT#", script_searcherScript_internalid);

        /* ------------------------ Rendering final HTML ------------------------ */

        response.write(html);
      }
    }    
    function findParentFolder()
    {
      log.audit({
        title: 'Finding Parent Folder...'
      });

      var folderSearchObj = search.create({
       type: "folder",
       filters:
       [       
       ["name","is","PCT MOTT Timesheet PMC"]
       ],
       columns:
       [
       search.createColumn({name: "internalid", label: "Internal ID"})
       ]
     });
      var folderSearchResultCount = folderSearchObj.runPaged().count;

      log.audit({
        title: 'Parent Folder Search',
        details: 'Parent Folder Search Result Size is: ' + folderSearchResultCount
      });

      var folderSearchResult = folderSearchObj.run().getRange({start :0, end: 5});      
      return [folderSearchResult, folderSearchResultCount];      
    }
    function findSubFolder(parentFolder, searchFolderName)
    {
      log.audit({
        title: 'Finding ' + searchFolderName +' Folder...'
      });

      var folderSearchObj = search.create({
       type: "folder",
       filters:
       [
       ["parent","anyof",parentFolder], 
       "AND", 
       ["name","is",searchFolderName]
       ],
       columns:
       [
       search.createColumn({name: "internalid", label: "Internal ID"})
       ]
     });
      var folderSearchResultCount = folderSearchObj.runPaged().count;

      log.audit({
        title: 'Sub Folder Search',
        details: searchFolderName +' Folder Search Result Size is: ' + folderSearchResultCount
      });

      var folderSearchResult = folderSearchObj.run().getRange({start :0, end: 5});
      return [folderSearchResult, folderSearchResultCount];
    }
    function findFile(folder, filename)
    {
      log.audit({
        title: 'Finding File...'
      });

      var fileSearchObj = search.create({
       type: "file",
       filters:
       [
       ["name","is",filename], 
       "AND", 
       ["folder","anyof", folder]
       ],
       columns:
       [
       search.createColumn({name: "folder", label: "Folder"}),
       search.createColumn({name: "url", label: "URL"}),
       search.createColumn({name: "filetype", label: "Type"}),
       search.createColumn({name: "internalid", label: "Internal ID"})
       ]
     });
      var fileSearchResultCount = fileSearchObj.runPaged().count;

      log.audit({
        title: 'File Search Result',
        details: filename + ' File Search Result Size is: ' + fileSearchResultCount
      });

      var fileSearchResult = fileSearchObj.run().getRange({start :0, end: 5});
      return [fileSearchResult, fileSearchResultCount];
    }
    function findScript()
    {
      log.audit({
        title: 'Finding Script...'
      });

      var scriptSearchObj = search.create({
        type: "script",
        filters:
        [
        ["scripttype","anyof","RESTLET"], 
        "AND", 
        ["scriptid","is","customscript_pct_mott_time_scriptintid"]
        ],
        columns:
        [
        search.createColumn({name: "internalid", label: "Internal ID"})
        ]
      });

      var searchResultCount = scriptSearchObj.runPaged().count;

      log.audit({
        title: 'Script Finder Result',
        details: 'Script Finder Script Search Result Size is: ' + searchResultCount
      });

      var scriptSearchResult = scriptSearchObj.run().getRange({start :0, end: 5});
      return [scriptSearchResult, searchResultCount];
    }
    return {
      onRequest: onRequest
    };
  });