/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {

    function beforeSubmit(context) {
        log.debug({
            title: "PCT-TD2",
            details: "In Before Submit"
        })
        let newRecord = context.newRecord;
        if (context.type == context.UserEventType.CREATE) {
            let employee = newRecord.getValue({ fieldId: 'employee' })
            let budgetItem = newRecord.getValue({ fieldId: 'item' })
            let postedTime = newRecord.getValue({ fieldId: 'hours' })
            let payrollItem = newRecord.getValue({ fieldId: 'payrollitem' })
            let location = newRecord.getValue({ fieldId: 'location' })
            // let totalHour = parseInt(getTotalTime(employee))
            let leftTime = parseInt(40 - getTotalTime(employee))
            log.debug("PCT-TD2", "Left Hour : " + leftTime + "Payroll Item : " + payrollItem)

            if (payrollItem == 37 && leftTime < postedTime) {
                newRecord.setValue({
                    fieldId: 'hours',
                    value: leftTime
                })
                var createdTimeEntries = record.create({
                    type: 'timebill',
                    isDynamic: true
                }).setValue({
                    fieldId: 'employee',
                    value: employee
                }).setValue({
                    fieldId: 'hours',
                    value: (postedTime - leftTime)
                }).setValue({
                    fieldId: 'payrollitem',
                    value: 38
                }).setValue({
                    fieldId: 'location',
                    value: location
                }).setValue({
                    fieldId: 'item',
                    value: budgetItem
                }).save()
                log.debug("PCT-SC", "Created Time Entries : " + createdTimeEntries)
            }
            // log.debug("PCT-TD2", "Hour : " + getTotalTime(employee))

        }
    }

    const getTotalTime = (employee) => {
        var timebillSearchObj = search.create({
            type: "timebill",
            filters:
                [
                    ["payitem", "anyof", "37"],
                    "AND",
                    ["employee", "anyof", employee],
                    "AND",
                    ["date", "within", "thisweek"],
                    "AND",
                    [["approvalstatus", "anyof", "3"], "OR", ["approvalstatus", "anyof", "2"]]
                ],
            columns:
                [
                    search.createColumn({
                        name: "durationdecimal",
                        summary: "SUM",
                        label: "Duration (Decimal)"
                    })
                ]
        });
        var searchResultCount = timebillSearchObj.runPaged().count;
        log.debug("timebillSearchObj result count", searchResultCount);
        let totalTime = 0;
        timebillSearchObj.run().each(function (result) {
            totalTime = result.getValue({
                name: "durationdecimal",
                summary: "SUM",
                label: "Duration (Decimal)"
            })
            return true;
        });

        return totalTime;
    }
    return { beforeSubmit }
});
