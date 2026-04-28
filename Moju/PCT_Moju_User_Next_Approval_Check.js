/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime"], function (runtime)
{

    function beforeSubmit(context)
    {
        var newRec = context.newRecord;
        var recType = newRec.type;
        log.debug({ title: "PCT-MOJU", details: "Record Type : " + recType })
        var nextApprover = newRec.getValue({
            fieldId: 'nextapprover'
        });
        log.debug("PCT-MOJU", "Next Approver Id : " + nextApprover);

        var currentUser = runtime.getCurrentUser();
        log.debug({ title: "PCT-Moju", details: "Current User Id : " + currentUser.id });
        if (currentUser.id == nextApprover)
        {
            alert("______________________");
            //newRec.setValue({ fieldId: 'custbody_pct_moju_entry_level_review', value: true });
        }

    }



    return {

        beforeSubmit: beforeSubmit,

    }
});
