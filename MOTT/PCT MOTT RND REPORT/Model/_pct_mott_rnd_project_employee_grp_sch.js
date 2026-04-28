/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/record", "N/search", "N/format", "N/error"], function (record, search, format, error)
{

   function _get(context)
   {
      var entitygroupSearchObj = search.create({
         type: "entitygroup",
         filters:
            [
               ["isinactive", "is", "F"],
               "AND",
               ["custentity_pct_mott_emp_gr_rnd", "is", "T"],
               "AND",
               ["isinactive", "is", "F"]
            ],
         columns:
            [
               search.createColumn({
                  name: "groupname",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({ name: "internalid", label: "Internal ID" })
            ]
      });
      var searchResultCount = entitygroupSearchObj.runPaged().count;
      log.debug("entitygroupSearchObj result count", searchResultCount);
      var employeeGroupArray = [];
      if (searchResultCount > 0)
      {
         entitygroupSearchObj.run().each(function (result)
         {
            // .run().each has a limit of 4,000 results
            var employeeGroupObj = {};
            var internal_id = result.getValue({
               name: "internalid", label: "Internal ID"
            })
            var employee_group = result.getValue({
               name: "groupname",
               sort: search.Sort.ASC,
               label: "Name"
            })
            employeeGroupObj["empGroupId"] = internal_id;
            employeeGroupObj["employeeGroup"] = employee_group;
            employeeGroupArray.push(employeeGroupObj);
            return true;
         });
         log.debug("employeeGroupArray", employeeGroupArray);

         return employeeGroupArray;
      }
   }
   return {
      get: _get,
      //post: _post

   }
});