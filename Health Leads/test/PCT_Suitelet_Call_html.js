/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/plugin'], function (log, record, runtime, file, format, search, plugin)
{
    function onRequest(context)
    {

        var fileObj = file.load({
            id: 5720
        });
        var fileContent = fileObj.getContents();

        // ------------------------------------ Search to Get Service Record Id ---------------------------

        var customrecord_pct_hl_service_call_historySearchObj = search.create({
            type: "customrecord_pct_hl_service_call_history",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var Service_id_ResultCount = customrecord_pct_hl_service_call_historySearchObj.runPaged().count;
        log.debug("PCT HL", "Service Record Result Count : " + Service_id_ResultCount);
        var Service_id_Result = customrecord_pct_hl_service_call_historySearchObj.run().getRange({ start: 0, end: Service_id_ResultCount });

        var service_html = '';
        var table_html = '';
        for (var getid_index = 0; getid_index < Service_id_ResultCount; getid_index++)
        {
            var service_record_id = Service_id_Result[getid_index].id;
            var service_record_load = record.load({
                type: 'customrecord_pct_hl_service_call_history',
                id: service_record_id
            });
            var service_name = service_record_load.getText({ fieldId: 'name' });
            var service_date = service_record_load.getText({ fieldId: 'custrecord_pct_hl_service_date' });
            var service_time = service_record_load.getText({ fieldId: 'custrecord_pct_hl_service_time' });
            var service_length = service_record_load.getText({ fieldId: 'custrecord_pct_hl_service_data_length' });

            log.debug({
                title: "PCT-HL",
                details: "( Service Internal Id :" + service_record_id + "Service Name :" + service_name + "Service Date :" + service_date + "Service Time :" + service_time + "Service Length : " + service_length + ')'
            })
            service_html +=
                '<option value=' + service_record_id + '>' + service_name + '</option>';

            //------------------------------------------------- HL RECORD SEARCH --------------------------------------

            var customrecord_pct_hl_service_call_historySearchObj = search.create({
                type: "customrecord_pct_hl_service_call_history",
                filters:
                    [
                        ["name", "is", "9/4/2021 6:38 AM Service 2"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "created",
                            join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                            label: "Date Created"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_hl_order_date",
                            join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                            label: "Order Date"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_hl_customer_name",
                            join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                            label: "Customer Name"
                        }),
                        search.createColumn({
                            name: "custrecord_pct_hl_customer_email",
                            join: "CUSTRECORD_PCT_HL_SERVICE_ID",
                            label: "Customer Email"
                        })
                    ]
            });
            var HL_id_ResultCount = customrecord_pct_hl_service_call_historySearchObj.runPaged().count;
            log.debug("PCT-HL", "HL ID ResultCount :" + HL_id_ResultCount);
            var HL_id_Result = customrecord_pct_hl_service_call_historySearchObj.run().getRange({ start: 0, end: HL_id_ResultCount });
            for (var HLrecord_index = 0; HLrecord_index < HL_id_ResultCount; HLrecord_index++)
            {
                var HL_internal_id = HL_id_Result[HLrecord_index].getValue({ name: 'internalid', join: 'CUSTRECORD_PCT_HL_SERVICE_ID' });
                var HL_date_created = HL_id_Result[HLrecord_index].getValue({ name: 'created', join: 'CUSTRECORD_PCT_HL_SERVICE_ID' });
                var HL_customer_name = HL_id_Result[HLrecord_index].getValue({ name: 'custrecord_pct_hl_customer_name', join: 'CUSTRECORD_PCT_HL_SERVICE_ID' });
                var HL_customer_email = HL_id_Result[HLrecord_index].getValue({ name: 'custrecord_pct_hl_customer_email', join: 'CUSTRECORD_PCT_HL_SERVICE_ID' });
                var HL_orderdate = HL_id_Result[HLrecord_index].getValue({ name: 'custrecord_pct_hl_order_date', join: 'CUSTRECORD_PCT_HL_SERVICE_ID' });

            }


            table_html +=
                '<tr>' +
                '<td>' + HL_record_id + '</td>' +
                '<td>' + HL_date_created + '</td>' +
                '<td>' + HL_customer_name + '</td>' +
                '<td>' + HL_customer_email + '</td>' +
                '<td>' + HL_orderdate + '</td>' +
                ' </tr > ';

            fileContent = fileContent.replace('#TABLE-CONTENTS#', table_html);
        }
        fileContent = fileContent.replace('#SERVICE-LIST-CONTENTS#', service_html);

        context.response.write(fileContent);
    }



    return {
        onRequest: onRequest
    }
});



