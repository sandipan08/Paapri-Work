

 /**
 * Module Description
 *
 * Version       Date            		Author           Remarks
 * 2.00          15 November 2021    	    Rajesh Nandi
 *
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

/**********************************************************************************************************************************************

Script Name:        pct_pp_cs_bulk_item_set
Developer:          Rajesh Nandi    
Development Head:   Mr.Subrata Ghosal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will set assembly item from bulk item list.

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:


/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/record', 'N/search', 'N/ui/dialog', 'N/currentRecord'], function (record, search, dialog, currentRecord) {

   

    function validateField(context) {
        //var currentRecord = context.currentRecord;
        var CRRecord = context.currentRecord;
        if (context.fieldId == 'custbody_pct_pp_bulk_item_wo') {
            var bulk = CRRecord.getValue({
                fieldId: 'custbody_pct_pp_bulk_item_wo'
            });
            log.debug({
                title: 'bulk',
                details: bulk
            })
            var record = currentRecord.get();
            var field = record.getField({ fieldId: 'custbody_pct_pp_bulk_item_list' });
            if (bulk == true) {

                field.isDisabled = false;
            } else {
                field.isDisabled = true;

                var bulk = CRRecord.setText({
                    fieldId: 'assemblyitem',
                    text : ''
                });

                CRRecord.setText({
                    fieldId: 'custbody_pct_pp_bulk_item_list',
                    text : ''
                });
            }
        }
        return true;
    }

    function fieldChanged(context) {
        var CRRecord = context.currentRecord;
        if (context.fieldId == 'custbody_pct_pp_bulk_item_list') {
            var bulkItem = CRRecord.getValue({
                fieldId: 'custbody_pct_pp_bulk_item_list'
            });
            log.debug({
                title: 'bulkItem',
                details: bulkItem
            })
            CRRecord.setValue({
                fieldId: 'assemblyitem',
                value: bulkItem
            });

            return true;

        }

    }

  

    return {
        
        validateField: validateField,
        fieldChanged: fieldChanged
        
    }
});
