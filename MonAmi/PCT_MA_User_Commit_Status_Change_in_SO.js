/**
*              //////////     MON AMI "Commit Status" change in SO's Item Level    //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  UserEventScript
*@NModuleScope SameAccount
*@since        2022-08-08 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for MON AMI "Commit Status" change in SO's Item Level, you can redistribute
              it and/or modify it under the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This UserEventScript is used to for MON AMI "Commit Status" change in SO's Item Level

*/

define([],
    function () {
        function beforeSubmit(context) {
            // if (context.type === context.UserEventType.CREATE) {
            log.debug({
                title: `PCT-MonAmi`,
                details: `In Before Submit`
            });
            let commitStatus = context.newRecord.getValue({
                fieldId: 'custbody_pct_monami_commit_field'
            });
            log.debug({
                title: `PCT-MonAmi`,
                details: `Sales Order Status : ${commitStatus}`
            });
            if (commitStatus.length) {
                let itemCount = context.newRecord.getLineCount({ sublistId: 'item' });
                for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                    // let itemName = context.newRecord.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'item_display',
                    //     line: itemIndex
                    // });
                    // let itemCommitStatus = context.newRecord.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'commitinventory',
                    //     line: itemIndex
                    // });
                    // log.debug({
                    //     title: `PCT-MonAmi`,
                    //     details: `Item Name : ${itemName} , Item Status : ${itemCommitStatus}`
                    // });
                    if (commitStatus == 1) {
                        context.newRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'commitinventory',
                            line: itemIndex,
                            value: commitStatus
                        });
                    }
                    else if (commitStatus == 2) {
                        context.newRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'commitinventory',
                            line: itemIndex,
                            value: commitStatus
                        });
                    }
                    else {
                        context.newRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'commitinventory',
                            line: itemIndex,
                            value: commitStatus
                        });
                    }
                }
                log.debug({
                    title: `PCT-MonAmi`,
                    details: `Value Set in Line Level`
                });
                context.newRecord.setValue({ fieldId: 'custbody_pct_monami_commit_field', value: '' });
            }
            // }

        }

        return {
            beforeSubmit: beforeSubmit,

        };
    });