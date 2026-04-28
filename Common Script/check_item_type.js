var item_type = receive.type;
var type_str = item_type.toString();
if (type_str[0] == "I")
{
    var item_record = record.load({ type: "inventoryitem", id: item_id });
}
else if (type_str[0] == "A")
{
    var item_record = record.load({ type: "assemblyitem", id: item_id });
}
else if (type_str[0] == "N")
{
    var item_record = record.load({ type: "noninventoryitem", id: item_id });
}
else if (type_str[0] == "O")
{
    var item_record = record.load({ type: "otherchargeitem", id: item_id });
}
else if (type_str[0] == "D")
{
    var item_record = record.load({ type: "discountitem", id: item_id });
}


//--------------------------------------------------------------------------------------------------------

var itype = load_IR.getLineItemValue('item', 'itemtype', line_id);
nlapiLogExecution('DEBUG', 'PCT-Log', 'itype=' + itype);

var get_type = get_item_type(itype);

function get_item_type(itype)
{
    var recordtype = '';
    switch (itype)
    {   // Compare item type to its record type counterpart
        case 'InvtPart':
            recordtype = 'inventoryitem';
            break;
        case 'NonInvtPart':
            recordtype = 'noninventoryitem';
            break;
        case 'Service':
            recordtype = 'serviceitem';
            break;
        case 'Assembly':
            recordtype = 'assemblyitem';
            break;

        case 'GiftCert':
            recordtype = 'giftcertificateitem';
            break;
        default:
    }
    return recordtype;
}
