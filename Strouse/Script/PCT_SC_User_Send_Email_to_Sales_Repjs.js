/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/email', 'N/file', 'N/record', 'N/search', 'N/runtime'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 * @param{search} search
 */
    (email, file, record, search, runtime) => {

        function beforeLoad(context) {

        }

        function beforeSubmit(context) {

        }

        function afterSubmit(context) {
            log.debug("PCT", "In After Submit Script");
            let estimateRecord = context.newRecord;
            log.debug("PCT", JSON.stringify(estimateRecord));
            log.debug("PCT", estimateRecord.getValue('id'));

            let loadEstimate = record.load({
                type: 'customrecord_pct_sc_estimaterequestform',
                id: estimateRecord.getValue('id'),
                // isDynamic: true,
            });
            let documentNumber = loadEstimate.getValue('name')
            log.debug({
                title: "PCT",
                details: documentNumber
            })
            if (estimateRecord.getValue({
                fieldId: 'custrecord_pct_sc_erf_complete'
            }) && estimateRecord.getValue({
                fieldId: 'custrecord_pct_sc_pde_proj_consideration'
            })) {

                let pdEngineer = estimateRecord.getValue({
                    fieldId: 'custrecord_pct_sc_customer_pd_engineer'
                })
                let pdEngineerEmail = search.lookupFields({
                    type: search.Type.EMPLOYEE,
                    id: pdEngineer,
                    columns: ['email']
                }).email;
                let customerLookup = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: estimateRecord.getValue({ fieldId: 'custrecord_pct_sc_customer_estform' }),
                    columns: ['salesrep']
                });
                log.debug("PCT", JSON.stringify(customerLookup))
                let salesRepEmail = search.lookupFields({
                    type: search.Type.EMPLOYEE,
                    id: customerLookup.salesrep[0].value,
                    columns: ['email']
                }).email;

                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: [pdEngineerEmail, salesRepEmail],
                    subject: `SCE PDE Review`,
                    body: `The SCEs for ${documentNumber} are ready for PDE review.`,

                })
                log.debug("PCT", "Email Send");

            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }
    });
