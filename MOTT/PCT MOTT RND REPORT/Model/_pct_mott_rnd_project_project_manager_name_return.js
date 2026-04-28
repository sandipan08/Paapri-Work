/**
 *@NApiVersion 2.1
*@NScriptType Restlet
*/
define(["N/record", "N/search", "N/format", "N/error", 'N/runtime',], function (record, search, format, error, runtime)
{

   function _get(context)
   {
      var userObj = runtime.getCurrentUser();
      log.debug({ title: "PCT-MOTT", details: 'Internal ID of current user:  : ' + userObj.id });

      var employeeLookUp = search.lookupFields({
         type: "employee",
         id: userObj.id,
         columns: ['isjobmanager', 'firstname']
      });
      var projectManangerName = employeeLookUp.firstname;
      var projectMananger = employeeLookUp.isjobmanager;
      log.debug({ title: "PCT-MOTT", details: 'Look Up field Object  : ' + JSON.stringify(employeeLookUp) + ", Project Manager : " + projectMananger + ", Project Manager Name : " + projectManangerName });

      var employeeSearchObj = search.create({
         type: "employee",
         filters:
            [
               ["isjobmanager", "is", "T"],
               "AND",
               ["isinactive", "is", "F"]
            ],
         columns:
            [
               search.createColumn({
                  name: "entityid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({ name: "internalid", label: "Internal ID" })
            ]
      });
      var searchResultCount = employeeSearchObj.runPaged().count;
      log.debug("employeeSearchObj result count", searchResultCount);
      var projectManagerArray = [];
      if (searchResultCount > 0)
      {
         employeeSearchObj.run().each(function (result)
         {
            // .run().each has a limit of 4,000 results
            var projectManagerObj = {};
            var internal_id = result.getValue({
               name: "internalid", label: "Internal ID"
            })
            var project_manager = result.getValue({
               name: "entityid",
               sort: search.Sort.ASC,
               label: "Name"
            })
            projectManagerObj["projectManagerID"] = internal_id;
            projectManagerObj["projectManagerName"] = project_manager;
            projectManagerArray.push(projectManagerObj);
            return true;
         });

      }

      return [projectManagerArray, userObj.id, projectMananger, projectManangerName];

   }
   return {
      get: _get,

   }
});