/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/record', 'N/runtime', 'N/search', 'N/email', 'N/runtime'],
    function (currentRecord, record, runtime, search, email, runtime)
    {
        function beforeLoad(context)
        {
        }
        function beforeSubmit(context)
        {
            //test 26003
            // if (context.type === context.UserEventType.CREATE)
            // {
            var newRec = context.newRecord;
            var recType = newRec.type;
            log.debug({ title: "PCT-POC", details: "Record Type : " + recType })
            if (recType == "salesorder") // ------------------------------------------------------- For Sales Order
            {
                log.debug({ title: "PCT-POC", details: "In Sales Order" });
                var order_no = newRec.getValue({
                    fieldId: 'tranid'
                });
                log.debug({ title: "PCT-POC", details: "Order No : " + order_no });
                var item_count = newRec.getLineCount({ sublistId: 'item' });
                log.debug({ title: "PCT-POC", details: "Total Item : " + item_count });
                for (item_index = 0; item_index < item_count; item_index++)   
                {
                    var unit_price = newRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: item_index
                    });
                    var rate = toFixedTrunc(unit_price, 2);
                    log.debug({ title: "PCT-POC", details: "Unit Price Old : " + unit_price + ", Unit Price Now : " + rate });
                    if (unit_price != rate) // -------------------------------------- Doing this for checking that unit price contains only two digits after point
                    {
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            line: item_index,
                            value: -1
                        });
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: item_index,
                            value: rate
                        });
                    }
                }
            }
            else if (recType == "invoice") // ------------------------------------------------------- For Invoice
            {
                //test 885214
                log.debug({ title: "PCT-POC", details: "In Invoice" });
                var invoice_no = newRec.getValue({
                    fieldId: 'tranid'
                });
                log.debug({ title: "PCT-POC", details: "Invoice No : " + invoice_no });
                var item_count = newRec.getLineCount({ sublistId: 'item' });
                log.debug({ title: "PCT-POC", details: "Total Item : " + item_count });
                for (item_index = 0; item_index < item_count; item_index++)
                {
                    var item_rate = newRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: item_index
                    });
                    var rate = toFixedTrunc(item_rate, 2);
                    log.debug({ title: "PCT-POC", details: "Unit Price Old : " + item_rate + ", Unit Price Now : " + rate });
                    if (item_rate != rate) // -------------------------------------- Doing this for checking that unit price contains only two digits after point
                    {
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            line: item_index,
                            value: -1
                        });
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: item_index,
                            value: rate
                        });
                    }
                }
            }
            else if (recType == "estimate") // ------------------------------------------------------- For Quote
            {
                //test 27538
                log.debug({ title: "PCT-POC", details: "In Quote" });
                var invoice_no = newRec.getValue({
                    fieldId: 'tranid'
                });
                log.debug({ title: "PCT-POC", details: "Quote No : " + invoice_no });
                var item_count = newRec.getLineCount({ sublistId: 'item' });
                log.debug({ title: "PCT-POC", details: "Total Item : " + item_count });
                for (item_index = 0; item_index < item_count; item_index++)
                {
                    var item_rate = newRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: item_index
                    });
                    var rate = toFixedTrunc(item_rate, 2);
                    log.debug({ title: "PCT-POC", details: "Unit Price Old : " + item_rate + ", Unit Price Now : " + rate });
                    if (item_rate != rate) // -------------------------------------- Doing this for checking that unit price contains only two digits after point
                    {
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            line: item_index,
                            value: -1
                        });
                        newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: item_index,
                            value: rate
                        });
                    }
                }
            }
            // }
        }
        function toFixedTrunc(x, n) // ----------------------------->  Function to get only two digit after point where x=number & n =how much digit u eant after point 
        {
            const v = (typeof x === 'string' ? x : x.toString()).split('.');
            if (n <= 0) return v[0];
            let f = v[1] || '';
            if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
            while (f.length < n) f += '0';
            return `${v[0]}.${f}`
        }
        function afterSubmit(context)
        {
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        }
    });
