/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record", "N/search", "N/ui/dialog", "N/currentRecord", "N/runtime"], function (
    record,
    search,
    dialog,
    currentRecord, runtime
)
{
    function saveRecord(context)
    {
        log.debug({ title: "PCT-Moju", details: "In Save Record Function" });
        var CurrentRecord = context.currentRecord;
        var currentUser = runtime.getCurrentUser();
        log.debug({ title: "PCT-Moju", details: "Current User Id : " + currentUser.id });

        var poTotal = CurrentRecord.getValue({ fieldId: "total" });
        var createdBy = CurrentRecord.getValue({ fieldId: "custbody_pct_moju_created_by_field" });
        log.debug({ title: "PCT-Moju", details: "PO Total: " + poTotal + ", Created By : " + createdBy });


        var expenseLimit = getExpenseLimit(createdBy);

        if (expenseLimit == "")
        {

            log.debug({ title: "PCT-Moju", details: "Expense Limit is Blank for this User. Please Create Purchase Order from any Other User !!" });
            alert("Expense Limit is Blank for this User. Please Create Purchase Order from any Other User !!");
            return false;
        }
        else if (expenseLimit > poTotal)
        {

            log.debug({ title: "PCT-Moju", details: "Purchase Order Saved" });
            return true;
        }
        else
        {
            // ------------------------- Get Next Approver ---------------------

            var nextApprover = CurrentRecord.getValue({ fieldId: "nextapprover" });
            log.debug({ title: "PCT-Moju", details: "Next Approver Is: " + nextApprover });
            if (nextApprover)
            {
                if (currentUser.id == nextApprover)
                {

                    if (nextApproverFunction(nextApprover, poTotal))
                    {
                        var nextApproverCheckBox = CurrentRecord.getValue({ fieldId: "custbody_pct_moju_entry_level_review" });
                        log.debug({ title: "PCT-Moju", details: "Check Box Status : " + nextApproverCheckBox });
                        if (!nextApproverCheckBox)
                        {
                            alert("Please Check the " + "APPROVED BY NEXT APPROVER" + " CheckBox Before Save the Record !!");
                            return false;
                        }
                        else
                        {
                            if (nextApproverFunction(nextApprover, poTotal))
                            {
                                return true;
                            }
                        }
                    }

                }
                else
                {
                    if (nextApproverFunction(nextApprover, poTotal))
                    {
                        return true;
                    }
                }
            }
            else
            {
                alert("Your Expense Limit is " + expenseLimit + ". Please select a Next Approver !!");
                return false;
            }
        }
    }


    // ------------------------------------------------------------------------------------------------ ALL CUSTOM FUNCTIONS -------------------------------------------------------------------------

    // ---------------------------- Get Expense Limit Function Start -----------------------------

    function getExpenseLimit(createdBy)
    {
        //id- 985 searching expense limit of po creator
        var employeeSearchObj = search.create({
            type: "employee",
            filters:
                [
                    ["internalidnumber", "equalto", createdBy]
                ],
            columns:
                [
                    search.createColumn({ name: "expenselimit", label: "Expense Limit" })
                ]
        });
        var expenseLimitResultCount = employeeSearchObj.runPaged().count;
        // log.debug("PCT-Moju", "EmployeeSearchObj result count : "+searchResultCount);
        var expenseLimitResult = employeeSearchObj.run().getRange({ start: 0, end: expenseLimitResultCount });
        if (expenseLimitResultCount > 0)
        {

            var expenseLimit = expenseLimitResult[0].getValue("expenselimit");
            log.debug({
                title: "PCT-Moju",
                details: "Expense Limit : " + expenseLimit
            });

        }
        return expenseLimit;
    }

    // ---------------------------- Get Expense Limit Function End -----------------------------

    // ---------------------------- Get Next Approval Expense Limit Function Start -----------------------------

    function nextApproverFunction(nextApprover, poTotal)
    {
        log.debug({
            title: "PCT-MOJU In Function ",
            details: "Next Approver : " + nextApprover + " Purchase Total : " + poTotal
        })
        // id- 985 ----------------------- searching expense limit of next Approver -------------------
        var employeeSearchObj = search.create({
            type: "employee",
            filters:
                [
                    ["internalidnumber", "equalto", nextApprover]
                ],
            columns:
                [
                    //search.createColumn({ name: "expenselimit", label: "Expense Limit" }),
                    search.createColumn({ name: "approvallimit", label: "Expense Approval Limit" })
                ]
        });
        var expenseLimitResultCount = employeeSearchObj.runPaged().count;
        // log.debug("PCT-Moju", "EmployeeSearchObj result count : "+searchResultCount);
        var expenseLimitResult = employeeSearchObj.run().getRange({ start: 0, end: expenseLimitResultCount });
        if (expenseLimitResultCount > 0)
        {
            var nextApproverApprovalLimit = expenseLimitResult[0].getValue("approvallimit");
            log.debug({
                title: "PCT-Moju",
                details: "Next Approver Approval Limit : " + nextApproverApprovalLimit,
            });

            if (nextApproverApprovalLimit)
            {
                if (nextApproverApprovalLimit > poTotal)
                {
                    log.debug({
                        title: "PCT-Moju",
                        details: "Purchase Order Saved"
                    });
                    return true;
                }
                else
                {
                    log.debug({
                        title: "PCT-Moju",
                        details: "Next Approver's Approval Limit is " + nextApproverApprovalLimit + ". Please select any other Approver !!"
                    });
                    alert("Next Approver's Approval Limit is " + nextApproverApprovalLimit + ". Please select any other Approver !!");
                    return false;
                }

            }
            else
            {
                log.debug({
                    title: "PCT-Moju",
                    details: "Expense Limit is Blank for this Approver. Please select a Next Approver !!"
                });

                alert("Expense Limit is Blank for this Approver. Please select a Next Approver !!");
                return false;
            }
        }

    }
    // ---------------------------- Get Next Approval Expense Limit Function End -----------------------------

    return {
        saveRecord: saveRecord,


    };
});