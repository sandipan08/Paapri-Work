/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/log'], function(log) {

    function pageInit(context) {
        log.debug({
            title: 'PCT_LOG',
            details:JSON.stringify(context)
        }); 
        
    }


    function fieldChanged(context) {
        var current_record = context.currentRecord;

        //var fieldId =context.fieldId;
        if(context.fieldId =="custrecord_pct_pp_event_duration"){
            var event_duration = current_record.getValue({
                fieldId: 'custrecord_pct_pp_event_duration'
            });
            log.debug({
                title: "PCT-Log",
                details: "event_duration" + event_duration
            });
            var date = current_record.getValue({
                fieldId: 'custrecord_pct_pp_event_date'
            });
            log.debug({
                title: "PCT-Log",
                details: "date" + date
            });
          
            if(event_duration != ''){
            if(event_duration== '1')
            {
               var next_date= (date.getMonth()+1)+'/'+date.getDate()+'/'+(date.getFullYear()+1)
            }
            else if(event_duration== '2')
            {
                var next_date= (date.getMonth()+4)+'/'+date.getDate()+'/'+date.getFullYear()
            }
            else if(event_duration== '3')
            {
                var next_date= (date.getMonth()+2)+'/'+date.getDate()+'/'+date.getFullYear()
            }
            // else if(event_duration != '1' && event_duration != '2' && event_duration != '3') 
            // {
            //     var next_date= (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()
            // }
            current_record.setValue({
                fieldId:'custrecord_pct_pp_next_event_date',
                value: new Date(next_date) 
            })
        }
        else{
            current_record.setValue({
                fieldId:'custrecord_pct_pp_next_event_date',
                value: '' 
            })
        }
        var next_event_date = current_record.getValue({
            fieldId: 'custrecord_pct_pp_next_event_date'
        });
        log.debug({
            title: "PCT-Log",
            details: "next_event_date" + next_event_date
        });
        // if(next_event_date !="" && next_event_date != null){
        //     var set_date=(next_event_date.getMonth()+1)+'/'+(next_event_date.getDate()-7)+'/'+next_event_date.getFullYear()
        //     current_record.setValue({
        //         fieldId:'custrecord_pct_pp_event_rem_date_field',
        //         value: new Date(set_date) 
        //     })
        //}

    }
    }

    return {
        pageInit:pageInit,
        fieldChanged: fieldChanged,
     
    }
});
