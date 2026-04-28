/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget'], function (record, serverWidget) {
    function beforeLoad(context) {
        // var form = context.form;
        log.debug("PCT", "In Before Load")
        // //  if (context.type === context.UserEventType.CREATE) {
        // log.debug("form", form)
        // // Add a custom field to the form
        // var newField = form.addField({
        //     id: 'custpage_custom_field',
        //     type: serverWidget.FieldType.TEXT,
        //     label: 'Custom Field'
        // });

        // // Set a default value or make the field read-only (optional)
        // newField.defaultValue = 'Default Value';
        // newField.updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.ENTRY
        // });
        // // }
        var form = context.form;

        // Get the existing sublist by internal ID (e.g., 'item')
        var sublist = form.getSublist({ id: 'routingstep' });

        // Add a custom field to the sublist
        sublist.addField({
            id: 'custcol_customfield',
            type: serverWidget.FieldType.TEXT,
            label: 'Custom Sublist Field'
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});
