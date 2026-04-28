/**
* Module Description
*
* Version    Date            		Author           Remarks
* 1.00       04 February 2021    	Anirban Gupta
*
*
* @NApiVersion 2.1
* @NScriptType Restlet
* @NModuleScope SameAccount
*/

/**********************************************************************************************************************************************

Script Name:        PCT_PMC_WOIssueComponents
Developer:          Anirban Gupta
Development Head:   Ms.Ratwika Mondal 
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			WO Issue Components Script for PCT PMC.


© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/********************************************************Included Function & Update************************************************************
/**********************************************************************************************************************************************

Function Name:             	Purpose:                                                                               				  Developer:
woIssueComponents			Main function which retrieves data from URL and creates WO Issue Components record accordingly.		  Anirban Gupta

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary

***********************************************************************************************************************************************/

define(['N/record', 'N/search'],
    function (record, search) {
        function createNCMRReocrd(context) {
            try {
                log.audit({
                    title: 'Request Received.'
                });
                log.debug({
                    title: 'PCT-PMC',
                    details: `Context = ${JSON.stringify(context)}`
                })
                let ncmrrecord = record.create({
                    type: 'customrecord_pct_qms_material_review_req',
                    isDynamic: true
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_emp_no',
                    value: context.employeeId
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_wip_inv',
                    value: true
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_pd_no',
                    value: context.workOrder
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_qty_mrr',
                    value: context.quantity
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_item_no',
                    value: context.component
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_seq_desc',
                    value: context.operationSequence
                }).setValue({
                    fieldId: 'custrecord_pct_qms_mrr_mrr_notes',
                    value: `${context.notes}-${context.assetNumbers}`
                }).save()
                log.debug('Custom Record Created', 'ID: ' + ncmrrecord);

                let ncmrRecordDocumentNumber = search.lookupFields({
                    type: 'customrecord_pct_qms_material_review_req',
                    id: ncmrrecord,
                    columns: 'name'
                }).name
                return { 'isSuccess': true, 'data': { 'id': ncmrrecord, 'name': ncmrRecordDocumentNumber } }
            }
            catch (error) {
                log.debug({
                    title: 'PCT-PMC',
                    details: error
                })
                return { 'isSuccess': false, 'errorMessage': error.message }
            }

        }

        return {
            post: createNCMRReocrd
        };
    });