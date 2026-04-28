/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/email', 'N/record', 'N/log', 'N/file', 'N/search'], function (email, record, log, file, search)
{

    function execute(context)
    {
        log.debug({
            title: "PCT-PP",
            details: "In Schedule Function"
        })
        var customrecord_pct_pp_event_typeSearchObj = search.create({
            type: "customrecord_pct_pp_pm_assets",
            filters:
                [
                    ["custrecord_pct_pp_event_completed", "is", "F"],
                    "AND",
                    ["custrecord_pct_pp_next_event_date", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "custrecord_pct_pp_event_date", label: "Date" }),
                    search.createColumn({ name: "custrecord_pct_pp_next_event_date", label: "Next Event Date" })
                ]
        });
        var searchResultCount = customrecord_pct_pp_event_typeSearchObj.runPaged().count;
        log.debug("customrecord_pct_pp_event_typeSearchObj result count", searchResultCount);
        customrecord_pct_pp_event_typeSearchObj.run().each(function (result)
        {
            var eventName = result.getValue({
                name: "name",
            });
            log.debug({
                title: "PCT-Log",
                details: "Even Name:" + eventName
            });
            var nextEventDate = result.getValue({
                name: "custrecord_pct_pp_next_event_date",
            });
            log.debug({
                title: "PCT-Log",
                details: "Next Date:" + nextEventDate
            });
            // --------------------------------------- For Next Date -------------------------------------------------------
            var nextEventDate_array = nextEventDate.split('/')
            var Formated_Next_Event_Date = nextEventDate_array[1].toString() + '/' + nextEventDate_array[0].toString() + '/' + nextEventDate_array[2].toString()   // mm/dd/yy
            // log.debug({
            //     title: "PCT-Log",
            //     details: "Formated Next EventDate :" + Formated_Next_Event_Date
            // });

            var formatedNextEventDate = new Date(Formated_Next_Event_Date)
            // --------------------------------------- For Past Date -------------------------------------------------------
            var pastDate = new Date(formatedNextEventDate.setDate(formatedNextEventDate.getDate() - 7));
            // log.debug({
            //     title: "PCT-Log",
            //     details: "Past EventDate:" + pastDate
            // });
            var PastEvent_Date = pastDate.getDate();
            var PastEvent_Month = pastDate.getMonth() + 1;
            var PastEvent_Year = pastDate.getFullYear();
            var Past_Date = PastEvent_Date + "/" + PastEvent_Month + "/" + PastEvent_Year;
            log.debug({
                title: "PCT-PP",
                details: "Past Date :" + Past_Date
            });
            // --------------------------------------- For Current Date -------------------------------------------------------
            var current_date = new Date();
            var Current_Date = current_date.getDate();
            var Current_Month = current_date.getMonth() + 1;
            var Current_Year = current_date.getFullYear();
            var current_date = Current_Date + "/" + Current_Month + "/" + Current_Year;
            log.debug({
                title: "PCT-PP",
                details: "Current Date :" + current_date
            });

            var nextDateArray = nextEventDate.split("/");
            var pastDateArray = Past_Date.split("/");
            var currenttDateArray = current_date.split("/");

            var past = new Date(pastDateArray[2], parseInt(pastDateArray[1]) - 1, pastDateArray[0]);
            var next = new Date(nextDateArray[2], parseInt(nextDateArray[1]) - 1, nextDateArray[0]);  // -1 because months are from 0 to 11
            var present = new Date(currenttDateArray[2], parseInt(currenttDateArray[1]) - 1, currenttDateArray[0]);

            if (present > past && present < next)
            {

                var senderId = 11;
                var recipientEmail = 'subha.paapri@gmail.com';
                email.send({
                    author: senderId,
                    recipients: recipientEmail,
                    //cc:cc_email,
                    //bcc:bcc_email,
                    subject: 'Compeleting ' + eventName + ' Reminder',
                    body: 'Hi User,\n' +
                        'This is to inform you that the' + eventName + ' next event date:' + nextEventDate + ' is coming soon,Please complete the event.\n' +
                        ' Regards,\n' +
                        ' Netsuite\n',
                });
                log.debug({
                    title: "PCT-Log",
                    details: "Mail Send"
                });
            }
            return true;
        });
    }

    return {
        execute: execute
    }
});
