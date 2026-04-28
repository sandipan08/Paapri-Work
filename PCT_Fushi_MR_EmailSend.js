/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.1          4 August 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */

/**********************************************************************************************************************************************

Script Name:        PCT_Fushi_MR_EmailSend
Developer:          Sandipan Sau
Development Head:   Ms.Puja Ghosh
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will send Email on Item Status in sales order 

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                Developer:

getInputData()							Get Sales Order Id of Pending Fulfillment & Partially Fulfilment	                                Sandipan Sau

map()                                   Load the Sales Order & send mail to Customer on Item Status                                         Sandipan Sau
                                      

/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/

define(['N/currentRecord', 'N/record', 'N/runtime', 'N/search', 'N/email', 'N/runtime'],
    function (currentRecord, record, runtime, search, email, runtime)
    {
        function getInputData()
        {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["status", "anyof", "SalesOrd:D", "SalesOrd:B"],
                        "AND",
                        ["internalidnumber", "equalto", "11052"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("Search result count", searchResultCount);
            var searchResult = salesorderSearchObj.run().getRange({ start: 0, end: searchResultCount });
            var SO_id_array = new Array();
            for (var getid_index = 0; getid_index < searchResultCount; getid_index++)
            {
                var record_id = searchResult[getid_index].id;
                SO_id_array.push(record_id);
            }
            log.debug({
                title: "PCT Fushi",
                details: "Id Array Length : " + SO_id_array.length
            })
            return SO_id_array;
        }

        function map(context)
        {
            log.debug({ title: "PCT-Fushi-MAP", details: "In Map Function" })
            try
            {
                var id = context.value;
                log.debug({ title: "PCT-Fushi-MAP", details: "Opration Start For Sales Order Id :" + id })
                var SalesOrder_Load = record.load({
                    type: "salesorder",
                    id: id
                });
                var so_number = SalesOrder_Load.getValue({ fieldId: "tranid" });
                var customer_id = SalesOrder_Load.getValue({ fieldId: "entity" });
                var customer_Load = record.load({
                    type: "customer",
                    id: customer_id
                });
                var customer_name = customer_Load.getValue({ fieldId: "altname" });
                var customer_mail = customer_Load.getValue({ fieldId: "email" });
                log.debug({ title: "PCT-Fushi", details: "Sales Order Number: " + so_number + ", Cutomer Id : " + customer_id + ", Customer Mail : " + customer_mail + ", Customer NAme : " + customer_name });
                //---------------------------- Item Portion _----------------------------------------------------
                var item_count = SalesOrder_Load.getLineCount({ sublistId: 'item' });   // This will count the total item present in SO
                log.debug({ title: "PCT-Fushi", details: "Total Item : " + item_count });

                let mail_body = "Dear " + customer_name + "<br><br>" + "We are pleased to let you know that the workshop has freshly bottled the below line and it is now available to order." + "<br><br>";
                mail_body += " -------------------------- Sales Order ".bold() + so_number.bold() + " Item Available Status -------------------------- ".bold();
                mail_body = mail_body + "<br>";
                for (var item_index = 0; item_index < item_count; item_index++)
                {
                    var item_id = SalesOrder_Load.getSublistValue({    // This will Load each item in SO
                        sublistId: 'item',
                        fieldId: 'item',
                        line: item_index
                    });
                    var item_name = SalesOrder_Load.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item_display',
                        line: item_index
                    });
                    var item_committed = SalesOrder_Load.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantitycommitted',
                        line: item_index
                    });
                    var item_backOrder = SalesOrder_Load.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantitybackordered',
                        line: item_index
                    });
                    log.debug({ title: "PCT-Fushi", details: "Item Id: " + item_id + ", Item Name : " + item_name + ", Item Commited : " + item_committed + " , Item Backorder Qty : " + item_backOrder });
                    if (item_committed != 0)
                    {
                        mail_body = mail_body + "<br>" + (item_index + 1) + ". Item " + item_name + " Present in Sales Order.".fontcolor("#228B22");
                    }
                    else if (item_backOrder != 0)
                    {
                        mail_body = mail_body + "<br>" + (item_index + 1) + ". Item " + item_name + " Not Present in Sales Order.".fontcolor("#FF0000");
                    }
                }
                mail_body += "<br><br>" + "We are notifying you as a priority as you had recently ordered this item and we had unfortunately been unable to deliver to you at the time," + "<br><br>" +
                    "If you would like to order this item, please send your order to wholesale@fushi.co.uk" + "<br><br>" +
                    "Have a great day!"
                log.debug({
                    title: "PCT-Fushi",
                    details: "Mail Body : " + mail_body
                })
                var userObj = runtime.getCurrentUser();
                log.debug({ title: 'PCT-Fushi', details: 'Internal ID of current user: ' + userObj.id });
                var senderId = 7;
                // var senderId = userObj.id;
                var recipientEmail = 'sandipan.paapri@gmail.com';
                var recipientEmail1 = 'siratoon.paapri@gmail.com';
                email.send({
                    author: senderId,
                    recipients: [recipientEmail, recipientEmail1],
                    subject: 'Fushi Item Available Status for Sales Order ' + so_number,
                    body: mail_body
                });
                log.debug({ title: 'PCT-Fushi', details: 'Mail Sent' });

            }
            catch (ex) { log.error({ title: 'map: error', details: ex }); }

        }

        return {
            getInputData: getInputData,
            map: map
        }
    });
