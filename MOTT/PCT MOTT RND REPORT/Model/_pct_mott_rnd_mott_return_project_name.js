/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/record", "N/search", "N/format", "N/error"], function (record, search, format, error)
{

   function _get(context)
   {
      var jobSearchObj = search.create({
         type: "job",
         filters:
            [
               ["isinactive", "is", "F"]
            ],
         columns:
            [
               search.createColumn({
                  name: "altname",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({ name: "internalid", label: "Internal ID" }),
               search.createColumn({
                  name: "formulatext",
                  formula: "CONCAT({entityid}, {altname})",
                  label: "Formula (Text)"
               })
            ]
      });
      var searchResultCount = jobSearchObj.runPaged().count;
      log.debug("jobSearchObj result count", searchResultCount);
      var projectNameArray = [];
      if (searchResultCount > 0)
      {
         jobSearchObj.run().each(function (result)
         {
            var projectNameObj = {};
            var internal_id = result.getValue({
               name: "internalid", label: "Internal ID"
            })
            var mott_project_name = result.getValue({
               name: "formulatext",
               formula: "CONCAT({entityid}, {altname})",
               label: "Formula (Text)"
            })
            projectNameObj["projectId"] = internal_id;
            projectNameObj["projectName"] = mott_project_name;
            projectNameArray.push(projectNameObj);
            return true;
         });
         log.debug("projectNameArray", projectNameArray);
         return projectNameArray;
      }
   }
   return {
      get: _get,
   }
});

