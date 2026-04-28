/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/search'], function (log, record, runtime, search) {

    function beforeLoad(context) {
        log.debug("IN BEFORE LOAD")
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.COPY) {
            var form = context.form;
            var record = context.newRecord;
            // Get the custom record ID stored on the main record
            var customRecordId = record.getValue({ fieldId: 'custrecord_pct_sc_system_info_id' });
            log.debug("PCT-SC", "System Record Log Id : " + customRecordId)
            if (customRecordId) {
                // Build the link to the custom record
                var url = '/app/common/custom/custrecordentry.nl?rectype=1807&id=' + customRecordId;
                // var html = '<a href="' + url + '" target="_blank">System Logs</a>';


                var html = `<!DOCTYPE html>
<html>
<head>
</head>
<style>
.border-link {
  display: inline-block;
  padding: 10px 20px;
  color: #f44336;
  border: 2px solid #f44336;
  text-decoration: none;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s ease;
   margin-top:20px;
}

.border-link:hover {
  background-color: #f44336;
  color: white;
}
</style>
<body>
<a href="${url}" target="_blank" class="border-link">System Logs</a>
</body>
</html>
`;

                // Set the default value of the inline HTML field
                var inlineField = form.getField({
                    id: 'custrecord_pct_sc_rtng_system_info'
                });

                if (inlineField) {
                    inlineField.defaultValue = html;
                }
            }
        }
    }
    function beforeSubmit(context) {
        log.debug("IN BEFORE SUBMIT")
        if (context.type === context.UserEventType.DELETE) {
            log.debug("PCT-SC", "Routing record is deleting.....")
            var customRecordId = context.newRecord.getValue({ fieldId: 'custrecord_pct_sc_system_info_id' });
            if (customRecordId) {
                deleteParentRecord(customRecordId)
            }
        }
    }
    function afterSubmit(context) {
        let user = 310;//runtime.getCurrentUser().id;
        let typeCreate = 2, typeSet = 1, recordField = 25;
        var newRecord = context.newRecord;
        var oldRecord = context.oldRecord;
        let fieldsIdObj = {
            "1": "subsidiary",
            "2": "billofmaterials",
            "3": "location",
            "4": "Item Display",
            "5": "name",
            "6": "memo",
            "7": "custrecord_pct_sc_system_info_id",
            "8": "isdefault",
            "9": "isinactive",
            "10": "autocalculatelag",
            "24": "Custom Form"
        }
        let sublistFieldsIdObj = {
            "11": "operationsequence",
            "12": "operationname",
            "13": "manufacturingworkcenter",
            "14": "machineresources",
            "15": "laborresources",
            "16": "manufacturingcosttemplate",
            "17": "setuptime",
            "18": "runrate",
            "19": "connectiontype",
            "20": "lagtype",
            "21": "lagamount",
            "22": "lagunits",
        }
        let routingComponentFieldsObj = {
            '26': 'operationsequencenumber'
        }
        // let fields = ['customform', 'subsidiary', 'billofmaterials', 'location', 'name', 'memo', 'isdefault', 'isinactive', 'autocalculatelag', 'custrecord_pct_sc_system_info_id']
        // let sublistFields = ['laborresources', 'machineresources', 'manufacturingcosttemplate', 'manufacturingworkcenter', 'operationname', 'runrate', 'setuptime', 'connectiontype', 'lagtype', 'lagamount', 'lagunits']

        // Get the custom record ID stored on the main record
        var customRecordId = newRecord.getValue({ fieldId: 'custrecord_pct_sc_system_info_id' });
        if (customRecordId) {

            // Only check if it's an edit operation
            if (context.type === context.UserEventType.EDIT && oldRecord) {
                // Checking Field Values for Body Level
                Object.keys(fieldsIdObj).map((fieldId) => {
                    try {
                        if (fieldId == 3) {
                            var newValue = parseInt(newRecord.getValue({ fieldId: fieldsIdObj[fieldId] }));
                            var oldValue = parseInt(oldRecord.getValue({ fieldId: fieldsIdObj[fieldId] }));
                        }
                        else {
                            var newValue = newRecord.getValue({ fieldId: fieldsIdObj[fieldId] });
                            var oldValue = oldRecord.getValue({ fieldId: fieldsIdObj[fieldId] });
                        }
                        if (newValue !== oldValue) {
                            log.debug({
                                title: 'Field Changed: ' + fieldId,
                                details: 'Old Value: ' + oldValue + ', New Value: ' + newValue
                            });
                            var systemLogRecord = record.load({
                                type: 'customrecord_pct_sc_rtng_system_log_reco',
                                id: customRecordId,
                                isDynamic: true
                            })
                            systemLogRecord.selectNewLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
                            systemLogRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                fieldId: 'custrecord_pct_sc_rtng_slog_setby',
                                value: user
                            });
                            systemLogRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                fieldId: 'custrecord_pct_sc_rtng_slog_edit_type',
                                value: typeSet
                            });
                            systemLogRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                fieldId: 'custrecord_pct_sc_rtng_slog_change_date',
                                value: new Date()
                            });
                            systemLogRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                fieldId: 'custrecord_pct_sc_rtng_slog_field',
                                value: fieldId
                            });
                            systemLogRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                fieldId: 'custrecord_pct_sc_rtng_slog_old_value',
                                value: oldValue
                            });
                            systemLogRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                fieldId: 'custrecord_pct_sc_rtng_slog_new_value',
                                value: newValue
                            });
                            systemLogRecord.commitLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
                            log.debug("PCT", "Updated Custom Record Id " + systemLogRecord.save())
                        }
                    } catch (e) {
                        log.error("Error checking field: " + fieldId, e.message);
                    }

                });


                // Checking Field Values for Routing Steps Line Level

                for (var routingIndex = 0; routingIndex < newRecord.getLineCount({ sublistId: 'routingstep' }); routingIndex++) {
                    Object.keys(sublistFieldsIdObj).map((sublistFieldId) => {
                        try {
                            var newValue = newRecord.getSublistValue({
                                sublistId: 'routingstep',
                                fieldId: sublistFieldsIdObj[sublistFieldId],
                                line: routingIndex
                            });
                            var oldValue = oldRecord.getSublistValue({
                                sublistId: 'routingstep',
                                fieldId: sublistFieldsIdObj[sublistFieldId],
                                line: routingIndex
                            });

                            if (newValue !== oldValue) {
                                log.debug({
                                    title: 'Sublist Field Changed: ' + sublistFieldsIdObj[sublistFieldId],
                                    details: 'Old Sublist Value: ' + oldValue + ', New Sublist Value: ' + newValue
                                });
                                var systemLogRecord = record.load({
                                    type: 'customrecord_pct_sc_rtng_system_log_reco',
                                    id: customRecordId,
                                    isDynamic: true
                                })
                                systemLogRecord.selectNewLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_setby',
                                    value:user
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_edit_type',
                                    value: typeSet
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_change_date',
                                    value: new Date()
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_field',
                                    value: sublistFieldId
                                });
                                if (sublistFieldId == 13 || sublistFieldId == 16) {
                                    systemLogRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                        fieldId: 'custrecord_pct_sc_rtng_slog_old_value',
                                        value: oldRecord.getSublistText({
                                            sublistId: 'routingstep',
                                            fieldId: sublistFieldsIdObj[sublistFieldId],
                                            line: routingIndex
                                        })
                                    });
                                    systemLogRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                        fieldId: 'custrecord_pct_sc_rtng_slog_new_value',
                                        value: newRecord.getSublistText({
                                            sublistId: 'routingstep',
                                            fieldId: sublistFieldsIdObj[sublistFieldId],
                                            line: routingIndex
                                        })
                                    });
                                }
                                else {
                                    systemLogRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                        fieldId: 'custrecord_pct_sc_rtng_slog_old_value',
                                        value: oldValue
                                    });
                                    systemLogRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                        fieldId: 'custrecord_pct_sc_rtng_slog_new_value',
                                        value: newValue
                                    });
                                }
                                systemLogRecord.commitLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
                                log.debug("PCT", "Updated Custom Record Id " + systemLogRecord.save())
                            }
                        } catch (e) {
                            log.error("Error checking field: " + sublistFieldsIdObj[sublistFieldId], e.message);
                        }
                    });
                }

                // Checking Field Values for Component per Opeartion Line Level
                log.debug("ROUTING", newRecord.getLineCount({ sublistId: 'routingcomponent' }))
                for (var componentIndex = 0; componentIndex < newRecord.getLineCount({ sublistId: 'routingcomponent' }); componentIndex++) {
                    Object.keys(routingComponentFieldsObj).map((routingSublistFieldId) => {
                        try {
                            var newValue = newRecord.getSublistValue({
                                sublistId: 'routingcomponent',
                                fieldId: routingComponentFieldsObj[routingSublistFieldId],
                                line: componentIndex
                            });
                            var oldValue = oldRecord.getSublistValue({
                                sublistId: 'routingcomponent',
                                fieldId: routingComponentFieldsObj[routingSublistFieldId],
                                line: componentIndex
                            });
                            log.debug({
                                title: 'Sublist Field Changed: ' + routingComponentFieldsObj[routingSublistFieldId],
                                details: 'Old Sublist Value: ' + oldValue + ', New Sublist Value: ' + newValue
                            });
                            if (newValue !== oldValue) {
                                log.debug({
                                    title: 'Sublist Field Changed: ' + routingComponentFieldsObj[routingSublistFieldId],
                                    details: 'Old Sublist Value: ' + oldValue + ', New Sublist Value: ' + newValue
                                });
                                var systemLogRecord = record.load({
                                    type: 'customrecord_pct_sc_rtng_system_log_reco',
                                    id: customRecordId,
                                    isDynamic: true
                                })
                                systemLogRecord.selectNewLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_setby',
                                    value: user
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_edit_type',
                                    value: typeSet
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_change_date',
                                    value: new Date()
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_field',
                                    value: routingSublistFieldId
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_old_value',
                                    value: oldValue
                                });
                                systemLogRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                                    fieldId: 'custrecord_pct_sc_rtng_slog_new_value',
                                    value: newValue
                                });
                                systemLogRecord.commitLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
                                log.debug("PCT", "Updated Custom Record Id " + systemLogRecord.save())

                            }
                        } catch (e) {
                            log.error("Error checking field: " + routingComponentFieldsObj[routingSublistFieldId], e.message);
                        }
                    });
                }

            }
        }
        else {
            log.debug("PCT-SC", "System Log Record Creating.... :" + context.newRecord.id)
            var systemLogRecord = record.create({
                type: 'customrecord_pct_sc_rtng_system_log_reco',
                isDynamic: true
            }).setValue({
                fieldId: 'custrecord_pct_sc_rtng_slog_list',
                value: context.newRecord.id
            })
            systemLogRecord.selectNewLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' });
            systemLogRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                fieldId: 'custrecord_pct_sc_rtng_slog_setby',
                value: user
            });
            systemLogRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                fieldId: 'custrecord_pct_sc_rtng_slog_edit_type',
                value: typeCreate
            });
            systemLogRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                fieldId: 'custrecord_pct_sc_rtng_slog_change_date',
                value: new Date()
            });
            systemLogRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                fieldId: 'custrecord_pct_sc_rtng_slog_field',
                value: recordField
            });
            systemLogRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child',
                fieldId: 'custrecord_pct_sc_rtng_slog_new_value',
                value: context.newRecord.id
            });
            systemLogRecord.commitLine({ sublistId: 'recmachcustrecord_pct_sc_rtng_slog_child' })
            let systemLogRecordId = systemLogRecord.save();
            log.debug("PCT", "Newly Create Custom Record Id " + systemLogRecordId)
            record.submitFields({
                type: 'manufacturingrouting',
                id: context.newRecord.id,
                values: {
                    'custrecord_pct_sc_system_info_id': systemLogRecordId,
                    'memo': ""
                }
            });
        }
    }


    function deleteChildRecords(parentId) {
        log.debug("PCT-SC", "In Delete Child Record Function")
        var childSearch = search.create({
            type: 'customrecord_pct_sc_rtng_log_child_reco',
            filters: [
                ['custrecord_pct_sc_rtng_slog_child', 'is', parentId] // adjust to actual field ID
            ],
            columns: ['internalid']
        });
        if (childSearch.runPaged().count) {
            childSearch.run().each(function (result) {
                var childId = result.getValue('internalid');
                record.delete({
                    type: 'customrecord_pct_sc_rtng_log_child_reco',
                    id: childId
                });
                return true;
            });
        }
    }

    function deleteParentRecord(parentId) {
        log.debug("PCT-SC", "In Delete Parent Record Function")
        deleteChildRecords(parentId); // clean up child records
        record.delete({
            type: 'customrecord_pct_sc_rtng_system_log_reco',
            id: parentId
        });
    }
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
