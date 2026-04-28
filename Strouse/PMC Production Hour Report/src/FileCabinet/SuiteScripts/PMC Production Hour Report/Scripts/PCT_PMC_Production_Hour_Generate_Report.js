/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/email', 'N/file', 'N/record', 'N/search', 'N/runtime'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 * @param{search} search
 */
    (email, file, record, search, runtime) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (context) => {
            let createdFileId = 0;
            log.debug("PCT-Strouse", "In Generate Report Restlet");
            log.debug("PCT-SC", context.params);
            context.params = JSON.parse(context.params)
            try {
                var customrecord_pct_pmc_tran_k_fabSearchObj = search.create({
                    type: "customrecord_pct_pmc_tran_k_fab",
                    filters:
                        [
                            ["custrecord_pct_kfab_op_status", "noneof", "7", "6"],
                            "AND",
                            ["custrecord_pct_kfab_op_name", "isnot", "Shop Work"],
                            // "AND",
                            // ["custrecord_pct_kfab_emp", "anyof", "660"],
                            "AND",
                            ["custrecord_pct_kfab_wo.mainline", "is", "T"],
                            "AND",
                            ["custrecord_pct_kfab_wo.item", "anyof", "@ALL@"],
                            "AND",
                            ["custrecord_pct_pmc_tran_wo_assembly", "anyof", "@ALL@"],
                            "AND",
                            ["custrecord_pct_kfab_emp.department", "anyof", "@ALL@"],
                            "AND",
                            ["custrecord_pct_kfab_emp.department", "anyof", context.params.shift],
                            "AND",
                            [[["custrecord_pct_kfab_res_start_date", "onorafter", context.params.startDateTime], "AND", ["custrecord_pct_kfab_res_end_date", "onorbefore", context.params.endDateTime]], "OR", [["custrecord_pct_kfab_res_start_date", "onorafter", context.params.startDateTime], "AND", ["custrecord_pct_kfab_res_start_date", "onorbefore", context.params.startDateTime], "AND", ["custrecord_pct_kfab_res_end_date", "isempty", ""]]]

                            // [["custrecord_pct_kfab_res_end_date", "onorbefore", context.params.endDateTime], "OR", ["custrecord_pct_kfab_res_end_date", "isempty", ""]],

                            // "AND",
                            // ["custrecord_pct_kfab_res_start_date", "onorafter", context.params.startDateTime]


                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_pct_kfab_emp",
                                summary: "GROUP",
                                label: "Employee"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_kfab_op_status",
                                summary: "GROUP",
                                label: "Status"
                            }),
                            search.createColumn({
                                name: "transactionname",
                                join: "CUSTRECORD_PCT_KFAB_WO",
                                summary: "GROUP",
                                label: "Work Order"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_kfab_prod_qty",
                                summary: "GROUP",
                                label: "Produced QTY"
                            }),
                            search.createColumn({
                                name: "formulanumeric",
                                summary: "SUM",
                                formula: "CASE WHEN {custrecord_pct_kfab_res_end_date} IS NOT NULL THEN ROUND(((trunc(24*60*60*(ABS(TO_DATE(TO_CHAR({custrecord_pct_kfab_res_end_date},'MM/dd/yyyy HH24:MI:SS'),'MM/dd/yyyy HH24:MI:SS')-TO_DATE(TO_CHAR({custrecord_pct_kfab_res_start_date},'MM/dd/yyyy HH24:MI:SS'),'MM/dd/yyyy HH24:MI:SS')))))/60)/60,2) ELSE 0 END",
                                label: "Formula (Numeric)"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_kfab_res_start_date",
                                summary: "GROUP",
                                label: "Start Date / Time"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_kfab_res_end_date",
                                summary: "GROUP",
                                label: "End Date / Time"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_kfab_p_seq",
                                summary: "GROUP",
                                label: "Sequence"
                            }),
                            search.createColumn({
                                name: "name",
                                summary: "GROUP",
                                label: "Operation Name"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_pmc_down_notes",
                                join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                                summary: "GROUP",
                                label: "Send Alert Notes"
                            }),
                            search.createColumn({
                                name: "note",
                                join: "userNotes",
                                summary: "GROUP",
                                label: "Memo"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_pmc_tran_wo_assembly",
                                summary: "GROUP",
                                label: "Assembly"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_pmc_tran_assembly_des",
                                summary: "GROUP",
                                label: "Assembly Desc."
                            }),
                            search.createColumn({
                                name: "custrecord_pct_pmc_tran_customer",
                                summary: "GROUP",
                                label: "Customer"
                            }),
                            search.createColumn({
                                name: "department",
                                join: "CUSTRECORD_PCT_KFAB_EMP",
                                summary: "GROUP",
                                label: "Department"
                            }),
                            search.createColumn({
                                name: "internalid",
                                summary: "GROUP",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_pmc_down_end_time",
                                join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                                summary: "GROUP",
                                label: "End Time"
                            }),
                            search.createColumn({
                                name: "custrecord_pct_pmc_down_start_time",
                                join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK",
                                summary: "GROUP",
                                label: "Start Time"
                            }),
                            search.createColumn({
                                name: "runrate",
                                join: "CUSTRECORD_PCT_KFAB_MAN_OP_TASK",
                                summary: "GROUP",
                                label: "Run Rate (Min/Unit)"
                            })
                        ]
                });
                var searchResultCount = customrecord_pct_pmc_tran_k_fabSearchObj.runPaged().count;
                log.debug("customrecord_pct_pmc_tran_k_fabSearchObj result count", searchResultCount);
                // log.debug("PCT", JSON.stringify(customrecord_pct_pmc_tran_k_fabSearchObj))
                let employeeObj = {};

                if (searchResultCount > 0) {
                    customrecord_pct_pmc_tran_k_fabSearchObj.run().each(function (result) {
                        log.debug("PCT-result", JSON.stringify(result))
                        let reportObj = {};
                        let pmcTransactionId = result.getValue({ name: "internalid", summary: "GROUP", label: "Internal ID" });
                        let employee = result.getValue({ name: "custrecord_pct_kfab_emp", summary: "GROUP", label: "Employee" })
                        let sendAlertNotes = (result.getValue({ name: "custrecord_pct_pmc_down_notes", join: "CUSTRECORD_PCT_PMC_DOWNTIME_LINK", summary: "GROUP", label: "Send Alert Notes" })).replace(/(\r\n|\n|\r)/gm, " ")
                        reportObj['sendAlertNotes'] = [];
                        reportObj['pmcTransactionId'] = pmcTransactionId;
                        reportObj['sendAlertNotes'].push(sendAlertNotes);
                        reportObj['sequence'] = result.getValue({ name: "custrecord_pct_kfab_p_seq", summary: "GROUP", label: "Sequence" });
                        reportObj['productQty'] = result.getValue({ name: "custrecord_pct_kfab_prod_qty", summary: "GROUP", label: "Produced QTY" });
                        reportObj['employee'] = result.getText({
                            name: "custrecord_pct_kfab_emp",
                            summary: "GROUP",
                            label: "Employee"
                        })
                        reportObj['status'] = result.getText({
                            name: "custrecord_pct_kfab_op_status",
                            summary: "GROUP",
                            label: "Status"
                        })
                        reportObj['workOrder'] = result.getValue({
                            name: "transactionname",
                            join: "CUSTRECORD_PCT_KFAB_WO",
                            summary: "GROUP",
                            label: "Work Order"
                        })
                        reportObj['productQty'] = result.getValue({
                            name: "custrecord_pct_kfab_prod_qty",
                            summary: "GROUP",
                            label: "Produced QTY"
                        })
                        reportObj['sumOfTotalHour'] = parseFloat(result.getValue({
                            name: "formulanumeric",
                            summary: "SUM",
                            formula: "CASE WHEN {custrecord_pct_kfab_res_end_date} IS NOT NULL THEN ROUND(((trunc(24*60*60*(ABS(TO_DATE(TO_CHAR({custrecord_pct_kfab_res_end_date},'MM/dd/yyyy HH24:MI:SS'),'MM/dd/yyyy HH24:MI:SS')-TO_DATE(TO_CHAR({custrecord_pct_kfab_res_start_date},'MM/dd/yyyy HH24:MI:SS'),'MM/dd/yyyy HH24:MI:SS')))))/60)/60,2) ELSE 0 END",
                            label: "Formula (Numeric)"
                        }))
                        let runRate = result.getValue({
                            name: "runrate",
                            join: "CUSTRECORD_PCT_KFAB_MAN_OP_TASK",
                            summary: "GROUP",
                            label: "Run Rate (Min/Unit)"
                        });
                        if (result.getValue({
                            name: "name",
                            summary: "GROUP",
                            label: "Operation Name"
                        }) == 'Production') {
                            if ((runRate == '' || runRate == 0)) {
                                reportObj['estimatedQty'] = '';
                            }
                            else {
                                reportObj['estimatedQty'] = ((reportObj['sumOfTotalHour'] / runRate).toFixed(3)) * 60;
                            }
                        }
                        else {
                            reportObj['estimatedQty'] = '';
                        }

                        reportObj['startDateTime'] = result.getValue({
                            name: "custrecord_pct_kfab_res_start_date",
                            summary: "GROUP",
                            label: "Start Date / Time"
                        })
                        reportObj['endDateTime'] = result.getValue({
                            name: "custrecord_pct_kfab_res_end_date",
                            summary: "GROUP",
                            label: "End Date / Time"
                        })
                        reportObj['operationName'] = result.getValue({
                            name: "name",
                            summary: "GROUP",
                            label: "Operation Name"
                        })
                        reportObj['memo'] = result.getValue({
                            name: "note",
                            join: "userNotes",
                            summary: "GROUP",
                            label: "Memo"
                        })
                        reportObj['assembly'] = result.getText({
                            name: "custrecord_pct_pmc_tran_wo_assembly",
                            summary: "GROUP",
                            label: "Assembly"
                        })
                        reportObj['assemblyDesc'] = result.getValue({
                            name: "custrecord_pct_pmc_tran_assembly_des",
                            summary: "GROUP",
                            label: "Assembly Desc."
                        }).replace(/(\r\n|\n|\r)/gm, " ")

                        reportObj['customer'] = result.getText({
                            name: "custrecord_pct_pmc_tran_customer",
                            summary: "GROUP",
                            label: "Customer"
                        })
                        reportObj['department'] = result.getText({
                            name: "department",
                            join: "CUSTRECORD_PCT_KFAB_EMP",
                            summary: "GROUP",
                            label: "Department"
                        })


                        if (!(employee in employeeObj)) {
                            employeeObj[employee] = { "hour": 0, "response": {} }
                            employeeObj[employee]['response'][pmcTransactionId] = reportObj;
                            employeeObj[employee].hour += reportObj['sumOfTotalHour']
                        }
                        else {
                            if (!(pmcTransactionId in employeeObj[employee]['response'])) {
                                employeeObj[employee]['response'][pmcTransactionId] = reportObj;
                                employeeObj[employee].hour += reportObj['sumOfTotalHour']

                            }
                            else {
                                employeeObj[employee]['response'][pmcTransactionId].sendAlertNotes.push(sendAlertNotes)
                            }

                        }

                        return true;
                    });

                    log.debug("PCT-EmployeeObj", employeeObj)
                    let fileObj = file.create({
                        name: `PMC Production Hour Report ${new Date().toLocaleString()}`,
                        fileType: file.Type.CSV,
                        contents: 'Employee, Status, Work Order,PMC Transaction, Estimated Quantity, Product Quantity, Sum of Total Hour, Start Date/Time, End Date/Time, Sequence, Operation Name, Send Alert Notes, Memo, Assembly, Assembly Desc, Customer, Department\n',
                        // description: string,
                        folder: 361029,
                    })

                    Object.keys(employeeObj).map((key) => {
                        Object.keys(employeeObj[key]["response"]).map((element) => {
                            log.debug("PCT", employeeObj[key]["response"][element].sendAlertNotes);
                            fileObj.appendLine({
                                value: `${employeeObj[key]["response"][element].employee},${employeeObj[key]["response"][element].status},${employeeObj[key]["response"][element].workOrder},${employeeObj[key]["response"][element].pmcTransactionId},${employeeObj[key]["response"][element].estimatedQty},${employeeObj[key]["response"][element].productQty}, ${employeeObj[key]["response"][element].sumOfTotalHour}, ${employeeObj[key]["response"][element].startDateTime}, ${employeeObj[key]["response"][element].endDateTime},${employeeObj[key]["response"][element].sequence}, ${employeeObj[key]["response"][element].operationName},"${employeeObj[key]["response"][element].sendAlertNotes.toString()}", ${employeeObj[key]["response"][element].memo}, ${employeeObj[key]["response"][element].assembly}, ${employeeObj[key]["response"][element].assemblyDesc.replace(/,/g, " ")}, ${employeeObj[key]["response"][element].customer.replace(/,/g, " ")}, ${employeeObj[key]["response"][element].department}`
                            });
                        })
                        fileObj.appendLine({
                            value: `${'Total Hour'},${''},${''},${''},${''},${''}, ${employeeObj[key].hour}, ${''},${''},${''}, ${''},${''}, ${''}, ${''}, ${''}, ${''}, ${''}`
                        });
                    })
                    createdFileId = fileObj.save();
                    log.debug({
                        title: 'PCT-SC',
                        details: 'Created File Id :' + createdFileId
                    });
                    email.send({
                        author: runtime.getCurrentUser().id,
                        recipients: [context.params.email],
                        subject: `PMC Production Hour Report ${new Date().toLocaleString()}`,
                        body: `<div><b>Report based on filter :</b></div>
                    <div><b>Shift:</b> ${context.params.shift}</div>
                    <div><b>Start Date Time:</b> ${context.params.startDateTime}</div>
                    <div><b>End Date Time:</b> ${context.params.endDateTime}</div>`,
                        attachments: [file.load({ id: createdFileId })],
                    })
                    log.debug("PCT-SC", "Email Sent");
                    return { 'isSuccess': true, 'data': createdFileId }
                }
                else { return { 'isSuccess': false, 'data': 'No Data Found' } }
            }
            catch (error) {
                log.debug("PCT-SC-Catch", error.message)
                return { 'isSuccess': false, 'data': error.message }
            }
        }
        return { get }

    });
