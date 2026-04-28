/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/search', 'N/record', 'N/runtime'], function (log, search, record, runtime) {
    var getSalesComments = '';

    function beforeLoad(context) {
        if (context.type == context.UserEventType.COPY) {
            log.debug("PCT-SC", "In Before Load Function")
            // log.debug("PCT-SC", context)
            if (context.newRecord.type == 'customrecord_pct_configure') {
                context.newRecord.setValue({
                    fieldId: 'custrecord_sce_pct_sc_int_sales_cmnt',
                    value: '',
                })
            }
            else if (context.newRecord.type == 'customrecord_pct_sc_estimaterequestform') {
                context.newRecord.setValue({
                    fieldId: 'custrecord_est_pct_sc_int_sales_cmnt',
                    value: '',
                })
            }
            else {
                context.newRecord.setValue({
                    fieldId: 'custbody_pct_sc_int_sales_cmnt',
                    value: '',
                })
            }
        }
        else {

            // log.debug("PCT-SC-currentUser", currentUser)
            if (context.newRecord.type == 'customrecord_pct_configure') {
                getSalesComments = context.newRecord.getValue({
                    fieldId: 'custrecord_sce_pct_sc_int_sales_cmnt'
                })
            }
            else if (context.newRecord.type == 'customrecord_pct_sc_estimaterequestform') {
                getSalesComments = context.newRecord.getValue({
                    fieldId: 'custrecord_est_pct_sc_int_sales_cmnt'
                })
            }
            else {
                getSalesComments = context.newRecord.getValue({
                    fieldId: 'custbody_pct_sc_int_sales_cmnt'
                })
            }

            // log.debug("PCT-SC-BeforeLoad", getSalesComments)
        }
    }


    function afterSubmit(context) {
        log.debug("PCT-SC", "In After Submit Function")
        // log.debug("PCT-SC", context)

        try {
            // if (context.type == context.UserEventType.EDIT) {
            log.debug("PCT-SC", "In After Submit Function")
            let newRecord = context.newRecord;
            // ------------------ Operation on Opportunity Record Start -------------------------
            if (newRecord.type == 'opportunity') {
                let salesComments = newRecord.getValue({
                    fieldId: 'custbody_pct_sc_int_sales_cmnt'
                })

                if (getSalesComments != salesComments) {

                    record.submitFields({
                        type: 'opportunity',
                        id: newRecord.id,
                        values: {
                            'custbody_pct_sc_int_sales_cmnt_modifie': runtime.getCurrentUser().id
                        }
                    });
                    // Change Value in Estimate
                    updateSalesCommentInEstimate(newRecord, salesComments, runtime.getCurrentUser().id);
                }
            }
            // ------------------ Operation on Opportunity Record End -------------------------

            // ----------------- Operation on Estimate Custom Record Start -------------------------
            if (newRecord.type == 'customrecord_pct_sc_estimaterequestform') {
                let salesComments = newRecord.getValue({
                    fieldId: 'custrecord_est_pct_sc_int_sales_cmnt'
                })
                if (getSalesComments != salesComments) {
                    record.submitFields({
                        type: 'customrecord_pct_sc_estimaterequestform',
                        id: newRecord.id,
                        values: {
                            'custrecord_est_pct_sc_int_sales_cmnt_mod': runtime.getCurrentUser().id
                        }
                    });
                    // Change Value in Opportunity
                    let opportunityComments = search.lookupFields({
                        type: search.Type.OPPORTUNITY,
                        id: newRecord.getValue("custrecord_pct_sci_opp_list"),
                        columns: 'custbody_pct_sc_int_sales_cmnt'
                    }).custbody_pct_sc_int_sales_cmnt;
                    if (opportunityComments != salesComments) {
                        record.submitFields({
                            type: search.Type.OPPORTUNITY,
                            id: newRecord.getValue("custrecord_pct_sci_opp_list"),
                            values: {
                                'custbody_pct_sc_int_sales_cmnt': salesComments,
                                'custbody_pct_sc_int_sales_cmnt_modifie': runtime.getCurrentUser().id
                            }
                        });
                        // log.debug("PCT-SC", "Field Update in Opportunity")
                    }
                    // Change Value in Strouse Cost Estimation
                    updateSalesCommentInSCE(newRecord, salesComments, runtime.getCurrentUser().id)
                }
            }
            // ------------------ Operation on Estimate Custom Record End -------------------------

            // ----------------- Operation on SCE Custom Record Start -------------------------

            if (newRecord.type == 'customrecord_pct_configure') {
                let salesComments = newRecord.getValue({ fieldId: 'custrecord_sce_pct_sc_int_sales_cmnt' })

                // log.debug("PCT-SC-Before Submit", salesComments)
                if (getSalesComments != salesComments) {
                    // Change Value in Quote & further
                    updateSalesCommentInEstimateOpportunity(newRecord.id, salesComments, runtime.getCurrentUser().id)
                    if (newRecord.getValue('custrecord_pct_linked_quote_no')) {
                        updateSalesCommentInQuote(newRecord.id, salesComments, runtime.getCurrentUser().id)
                    }
                    record.submitFields({
                        type: 'customrecord_pct_configure',
                        id: newRecord.id,
                        values: {
                            'custrecord_sce_pct_sc_int_sales_cmnt_mod': runtime.getCurrentUser().id
                        }
                    });
                    // Change Value in Al others SCE related to that SCE
                    updateCommentsInSCEs(newRecord.id, salesComments, runtime.getCurrentUser().id)
                }
            }

            // ------------------ Operation on SCE Custom Record End -------------------------

            // ----------------- Operation on Quote Record Start -------------------------

            if (newRecord.type == 'estimate') {
                let salesComments = newRecord.getValue({ fieldId: 'custbody_pct_sc_int_sales_cmnt' })
                let sceId = newRecord.getValue({ fieldId: 'custbody_pct_config_number' })
                if (getSalesComments != salesComments && sceId) {
                    updateSalesCommentInSalesOrder(newRecord.id, salesComments, runtime.getCurrentUser().id)
                    // record.submitFields({
                    //     type: 'customrecord_pct_configure',
                    //     id: sceId,
                    //     values: {
                    //         'custrecord_sce_pct_sc_int_sales_cmnt': salesComments,
                    //         'custrecord_sce_pct_sc_int_sales_cmnt_mod': runtime.getCurrentUser().id
                    //     }
                    // });
                    // updateSalesCommentInQuote(sceId, salesComments)
                    updateCommentsInSCEs(sceId, salesComments, runtime.getCurrentUser().id)
                    updateSalesCommentInEstimateOpportunity(sceId, salesComments, runtime.getCurrentUser().id)
                    record.submitFields({
                        type: 'estimate',
                        id: newRecord.id,
                        values: {
                            'custbody_pct_sc_int_sales_cmnt_modifie': runtime.getCurrentUser().id
                        }
                    });
                }
            }
            // ------------------ Operation on Quote Record End -------------------------

            // ----------------- Operation on Sales Order Record Start -------------------------

            if (newRecord.type == 'salesorder') {
                let salesComments = newRecord.getValue({ fieldId: 'custbody_pct_sc_int_sales_cmnt' })
                let quoteId = newRecord.getValue({ fieldId: 'createdfrom' })
                if (getSalesComments != salesComments && quoteId) {
                    let sceId = search.lookupFields({
                        type: 'estimate',
                        id: quoteId,
                        columns: 'custbody_pct_config_number'
                    }).custbody_pct_config_number[0].value;
                    // log.debug("PCT-SC-sceId", sceId)
                    record.submitFields({
                        type: search.Type.ESTIMATE,
                        id: quoteId,
                        values: {
                            'custbody_pct_sc_int_sales_cmnt': salesComments,
                            'custbody_pct_sc_int_sales_cmnt_modifie': runtime.getCurrentUser().id
                        }
                    });
                    updateCommentsInSCEs(sceId, salesComments, runtime.getCurrentUser().id)

                    updateSalesCommentInEstimateOpportunity(sceId, salesComments, runtime.getCurrentUser().id)
                    record.submitFields({
                        type: 'salesorder',
                        id: newRecord.id,
                        values: {
                            'custbody_pct_sc_int_sales_cmnt_modifie': runtime.getCurrentUser().id
                        }
                    });
                }
            }
            // ------------------ Operation on Sales Order Record End -------------------------
            // }
        }

        catch (ex) {
            log.debug("PCT-SC", ex.message)
        }
    }
    // ---------------------------- Function to Update Sales Internal Comments Value in Estimate Start -----------------------------------

    const updateSalesCommentInEstimate = (newRecord, salesComments, currentUser) => {
        for (let estimateIndex = 0; estimateIndex < newRecord.getLineCount("recmachcustrecord_pct_sci_opp_list"); estimateIndex++) {
            let loadEstimate = record.load({
                type: 'customrecord_pct_sc_estimaterequestform',
                id: newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_sci_opp_list',
                    fieldId: 'id',
                    line: estimateIndex
                }),
                // isDynamic: false,
            })
            log.debug("PCT-SC-currentUser", currentUser)
            record.submitFields({
                type: 'customrecord_pct_sc_estimaterequestform',
                id: newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_pct_sci_opp_list',
                    fieldId: 'id',
                    line: estimateIndex
                }),
                values: {
                    'custrecord_est_pct_sc_int_sales_cmnt': salesComments,
                    'custrecord_est_pct_sc_int_sales_cmnt_mod': currentUser
                }
            });
            // log.debug("PCT-SC", "Field Update in Estimate")
            updateSalesCommentInSCE(loadEstimate, salesComments, currentUser);
        }

    }

    // ---------------------------- Function to Update Sales Internal Comments Value in Estimate End -----------------------------------

    // ---------------------------- Function to Update Sales Internal Comments Value in SCE Start -----------------------------------

    const updateSalesCommentInSCE = (loadEstimate, salesComments, currentUser) => {
        for (let sceIndex = 0; sceIndex < loadEstimate.getLineCount("recmachcustrecord_pct_sc_est_req_link"); sceIndex++) {
            let sceId = loadEstimate.getSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_est_req_link',
                fieldId: 'id',
                line: sceIndex
            })
            record.submitFields({
                type: 'customrecord_pct_configure',
                id: sceId,
                values: {
                    'custrecord_sce_pct_sc_int_sales_cmnt': salesComments,
                    'custrecord_sce_pct_sc_int_sales_cmnt_mod': currentUser
                }
            });
            // log.debug("PCT-SC", "Field Update in SCE");
            updateSalesCommentInQuote(sceId, salesComments, currentUser)

        }
    }
    // ---------------------------- Function to Update Sales Internal Comments Value in SCE End -----------------------------------

    // ---------------------------- Function to Update Sales Internal Comments Value in Quote Start -----------------------------------

    const updateSalesCommentInQuote = (sceId, salesComments, currentUser) => {
        let quoteId = search.lookupFields({
            type: 'customrecord_pct_configure',
            id: sceId,
            columns: 'custrecord_pct_linked_quote_no'
        }).custrecord_pct_linked_quote_no[0].value;
        record.submitFields({
            type: search.Type.ESTIMATE,
            id: quoteId,
            values: {
                'custbody_pct_sc_int_sales_cmnt': salesComments,
                'custbody_pct_sc_int_sales_cmnt_modifie': currentUser
            }
        });
        // log.debug("PCT-SC", "Field Update in Quote")
        updateSalesCommentInSalesOrder(quoteId, salesComments, currentUser)
    }
    // ---------------------------- Function to Update Sales Internal Comments Value in Quote End -----------------------------------

    // ---------------------------- Function to Update Sales Internal Comments Value in Sales Order Start -----------------------------------
    const updateSalesCommentInSalesOrder = (quoteId, salesComments, currentUser) => {
        let loadQuote = record.load({
            type: search.Type.ESTIMATE,
            id: quoteId,
        })
        for (let soIndex = 0; soIndex < loadQuote.getLineCount("links"); soIndex++) {
            if (loadQuote.getSublistValue({ sublistId: 'links', fieldId: 'type', line: soIndex }) == 'Sales Order') {
                record.submitFields({
                    type: search.Type.SALES_ORDER,
                    id: loadQuote.getSublistValue({ sublistId: 'links', fieldId: 'id', line: soIndex }),
                    values: {
                        'custbody_pct_sc_int_sales_cmnt': salesComments,
                        'custbody_pct_sc_int_sales_cmnt_modifie': currentUser
                    }
                });
            }
            // log.debug("PCT-SC", "Field Update in Sales Order")
        }
    }
    // ---------------------------- Function to Update Sales Internal Comments Value in Sales Order End -----------------------------------

    const updateSalesCommentInEstimateOpportunity = (sceId, salesComments, currentUser) => {
        let estimateObj = search.lookupFields({
            type: 'customrecord_pct_configure',
            id: sceId,
            columns: ['custrecord_pct_sc_est_req_link', 'custrecord_pct_sc_sce_opp_no']
        })
        log.debug("PCT-SC-estimateObj", estimateObj)
        // Change Value in Quote -> Sales Order Record
        // updateSalesCommentInQuote(sceId, salesComments)
        // Change Value in Estimate Custom Record
        record.submitFields({
            type: 'customrecord_pct_sc_estimaterequestform',
            id: estimateObj.custrecord_pct_sc_est_req_link[0].value,
            values: {
                'custrecord_est_pct_sc_int_sales_cmnt': salesComments,
                'custrecord_est_pct_sc_int_sales_cmnt_mod': currentUser
            }
        });
        // Change Value in Opportunity Record
        record.submitFields({
            type: search.Type.OPPORTUNITY,
            id: estimateObj.custrecord_pct_sc_sce_opp_no[0].value,
            values: {
                'custbody_pct_sc_int_sales_cmnt': salesComments,
                'custbody_pct_sc_int_sales_cmnt_modifie': currentUser
            }
        });
    }
    // ---------------------------- Function to Update Sales Internal Comments Value in Sales Order End -----------------------------------
    const updateCommentsInSCEs = (sceId, salesComments, currentUser) => {
        let estimateId = search.lookupFields({
            type: 'customrecord_pct_configure',
            id: sceId,
            columns: 'custrecord_pct_sc_est_req_link'
        }).custrecord_pct_sc_est_req_link[0].value;

        let loadEstimate = record.load({
            type: 'customrecord_pct_sc_estimaterequestform',
            id: estimateId,
        })
        for (let sceIndex = 0; sceIndex < loadEstimate.getLineCount("recmachcustrecord_pct_sc_est_req_link"); sceIndex++) {
            let sceId = loadEstimate.getSublistValue({
                sublistId: 'recmachcustrecord_pct_sc_est_req_link',
                fieldId: 'id',
                line: sceIndex
            })
            record.submitFields({
                type: 'customrecord_pct_configure',
                id: sceId,
                values: {
                    'custrecord_sce_pct_sc_int_sales_cmnt': salesComments,
                    'custrecord_sce_pct_sc_int_sales_cmnt_mod': currentUser
                }
            });
        }
    }


    return {
        beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
