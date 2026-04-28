/**
*              //////////     MON AMI Item On Hand Qty Update      //////////
* 
*@author       Sandipan Sau
*@NApiVersion  2.1
*@NScriptType  MapReduceScript
*@NModuleScope SameAccount
*@since        2021-10-27 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.1 code in this page is for MON AMI Item On Hand Qty Update , you can redistribute
              it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
              published by the Paapri's TEAM INNOVATION.

*@description  This WorkflowActionScript is used to MON AMI Item On Hand Qty Update
*/
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search', 'N/email'], function (log, record, runtime, file, format, search, email)
{
    var adjustmentId = 0;
    var adjustmentAccount = 58;

    function getInputData()
    {
        log.debug({ title: "PCT-MonAmi", details: "In Get Input Function" });
        return search.create({
            type: "customrecord_pct_inventpry_warehouse",
            filters:
                [

                    ["custrecord_pct_iw_item_processed", "is", "F"],


                ],
            columns:
                [

                    search.createColumn({ name: "custrecord_pct_iw_vendor_sku", label: "Vendor Sku" }),
                ]
        });

    }

    function map(context)
    {
        try
        {
            log.debug({ title: "PCT-MonAmi", details: "In Map Function & Map Context : " + JSON.stringify(context) })
            var searchData = JSON.parse(context.value);

            var inventoryWarehouseLoad = record.load({
                type: 'customrecord_pct_inventpry_warehouse',
                id: searchData.id
            });

            var vendorSku = inventoryWarehouseLoad.getValue({ fieldId: 'custrecord_pct_iw_vendor_sku' });
            var qtyOnHand = inventoryWarehouseLoad.getValue({ fieldId: 'custrecord_pct_iw_qty_on_hand' });
            var description = inventoryWarehouseLoad.getValue({ fieldId: 'custrecord_pct_iw_description' });
            log.debug({ title: "PCT-MonAmi", details: "Vendor Sku : " + vendorSku + ", Qty to Update : " + qtyOnHand + ", Description : " + description });
            inventoryWarehouseLoad.setValue({ fieldId: 'custrecord_pct_iw_item_processed', value: true });
            var itemArray = onHandQtySearch(vendorSku, inventoryWarehouseLoad);
            var itemInternalId = itemArray[0];
            var iteOnHandQty = itemArray[1];

            if (itemInternalId && iteOnHandQty)
            {
                //  Case 1      iteOnHandQty = 5 , qtyOnHand = 20 
                if (iteOnHandQty < qtyOnHand)
                {
                    var qtyToAdd = qtyOnHand - iteOnHandQty;
                    // log.debug("PCT-MonAmi", "In Case 1");
                    createAdjustment(itemInternalId, qtyToAdd, inventoryWarehouseLoad);
                }
                //  Case 2      iteOnHandQty = - 5 , qtyOnHand = 20
                else if (iteOnHandQty < 0)
                {
                    var qtyToAdd = qtyOnHand - iteOnHandQty;
                    // log.debug("PCT-MonAmi", "In Case 2");
                    createAdjustment(itemInternalId, qtyToAdd, inventoryWarehouseLoad);
                }
                //  Case 3   iteOnHandQty = 25 , qtyOnHand = 20
                else if (iteOnHandQty > qtyOnHand)
                {
                    var qtyToAdd = qtyOnHand - iteOnHandQty;
                    // log.debug("PCT-MonAmi", "In Case 3");
                    createAdjustment(itemInternalId, qtyToAdd, inventoryWarehouseLoad);
                }
            }

            inventoryWarehouseLoad.save();





        }
        catch (e)
        {
            log.debug({ title: "PCT-MonAmi Catch", details: e.message });
            // inventoryWarehouseLoad.setValue({ fieldId: 'custrecord_pct_iw_item_processed', value: true });
            // inventoryWarehouseLoad.setValue({ fieldId: 'custrecord_pct_iw_error', value: e.message });
            // inventoryWarehouseLoad.save();
            // email.send({
            //     author: -5,
            //     recipients: ["sandipan.paapri@gmail.com"],
            //     cc: ["sandipan.paapri@gmail.com"],
            //     subject: 'MonAmi Inventory Record Update Error',
            //     body: e.message
            // });
        }

    }

    function reduce(context)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Reduce Function" });
    }

    function summarize(summary)
    {
        log.debug({ title: "PCT-MonAmi", details: "In Summarize Function" });
    }


    function onHandQtySearch(vendorSku, inventoryWarehouseLoad)
    {
        var itemInternalId = 0;
        var onHandQty = 0;
        var inventoryitemSearchObj = search.create({
            type: "inventoryitem",
            filters:
                [
                    ["inventorylocation", "anyof", "1"],
                    "AND",
                    ["name", "is", vendorSku]
                ],
            columns:
                [
                    search.createColumn({ name: "locationquantityonhand", label: "Location On Hand" })
                ]
        });

        var itemOnHandCount = inventoryitemSearchObj.runPaged().count;
        // log.debug("PCT-MonAmi", "Item On Hand Qty Count : " + itemOnHandCount);
        if (itemOnHandCount)
        {
            var itemOnHandCountResult = inventoryitemSearchObj.run().getRange({ start: 0, end: itemOnHandCount });

            for (var getid_index = 0; getid_index < itemOnHandCountResult.length; getid_index++)
            {
                onHandQty = itemOnHandCountResult[getid_index].getValue("locationquantityonhand");
                itemInternalId = itemOnHandCountResult[getid_index].id;

            }
            if (onHandQty == "") { onHandQty = 0 }
            log.debug("PCT-MonAmi", "Item " + vendorSku + ", Item Internal Id : " + itemInternalId + ", On Hand Qty Is : " + onHandQty);
            return [itemInternalId, onHandQty];
        }
        else
        {
            inventoryWarehouseLoad.setValue({ fieldId: 'custrecord_pct_iw_error', value: "Item " + vendorSku + " is not Present in Netsuite" });
        }
        inventoryWarehouseLoad.save();

    }

    function createAdjustment(itemInternalId, qtyOnHand, inventoryWarehouseLoad)
    {
        log.debug({ title: "PCT-MonAmi Create Adjustment Function", details: "Qty To Update : " + qtyOnHand });
        if (adjustmentId)
        {
            log.debug({ title: "PCT-MonAmi", details: "Add Item in Present Inventory Adjustment......." });
            //------------------------- Add Item Inventory Adjustment -------------------------------------------------

            var oInventoryAdj = record.load({
                type: 'inventoryadjustment',
                id: adjustmentId,
                isDynamic: true

            });

            oInventoryAdj.setValue({ fieldId: 'account', value: adjustmentAccount });
            oInventoryAdj.selectNewLine({ sublistId: 'inventory' });
            oInventoryAdj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'location', value: '1', });
            oInventoryAdj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: itemInternalId });
            oInventoryAdj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: qtyOnHand });
            oInventoryAdj.commitLine({ sublistId: 'inventory' });

            adjustmentId = oInventoryAdj.save();
            log.debug({ title: "PCT-MonAmi", details: "Add Item in Inventory Adjustment Id : " + adjustmentId });
            if (adjustmentId)
            {
                inventoryWarehouseLoad.setValue({ fieldId: 'custrecord_pct_iw_error', value: " " });

                inventoryWarehouseLoad.save();

            }

        }
        else
        {

            log.debug({ title: "PCT-MonAmi", details: "Creating Inventory Adjustment......." });
            //------------------------- Creating Inventory Adjustment -------------------------------------------------

            var oInventoryAdj = record.create({ type: record.Type.INVENTORY_ADJUSTMENT, isDynamic: true });
            var current_date = new Date();
            var dd = current_date.getDate();
            var mm = current_date.getMonth() + 1;
            var yyyy = current_date.getFullYear();
            var date = mm + "/" + dd + "/" + yyyy;

            oInventoryAdj.setValue({ fieldId: 'trandate', value: new Date(date) });
            oInventoryAdj.setValue({ fieldId: 'account', value: adjustmentAccount });
            oInventoryAdj.selectNewLine({ sublistId: 'inventory' });
            oInventoryAdj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'location', value: '1', });
            oInventoryAdj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: itemInternalId });
            oInventoryAdj.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: qtyOnHand });
            oInventoryAdj.commitLine({ sublistId: 'inventory' });

            adjustmentId = oInventoryAdj.save();
            log.debug({ title: "PCT-MonAmi", details: "Newly Created Inventory Adjustment Id : " + adjustmentId });

            if (adjustmentId)
            {
                inventoryWarehouseLoad.setValue({ fieldId: 'custrecord_pct_iw_error', value: " " });

                inventoryWarehouseLoad.save();

            }

        }
    }



    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
