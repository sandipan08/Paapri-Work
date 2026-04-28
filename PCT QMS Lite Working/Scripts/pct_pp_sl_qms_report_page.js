/**
 *              //////////     Popular Paint Quality Checking Report     //////////
 * 
 *@author       Rajesh Nandi
 *@NApiVersion  2.0
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2020-11-26 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.0 code in this page is for Popular Paint Quality Checking Report, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to Show Open Search Report.
 */

define(['N/file', 'N/render', 'N/log', 'N/url', 'N/search'],
    function (file, render, log, url, search) {

        function onRequest(context) {
            // Pre data source
            var request = context.request;
            var response = context.response;
            var templateFile = file.load({ id: '../HTML Files/PCT PP HOME PAGE.html' });

            var dataArr = getData();
            
            var dataSource = {
                //css: mainCss.url,
                //jQuery: jQueryJs.url,
                dataArr: dataArr,
            }

            var pageRenderer = render.create();
            pageRenderer.templateContent = templateFile.getContents();

            pageRenderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'ds',
                data: dataSource
            });

            var renderedPage = pageRenderer.renderAsString();
            response.write(renderedPage);
        }

        function getData() {
            var transactionSearchObj = search.create({
                type: "customrecord_pct_pp_qms_record",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_pp_date", label: "Date" }),
                        search.createColumn({ name: "custrecord_pct_pp_material_name_pdct_nme", label: "Material Name(Product Name)" }),
                        search.createColumn({ name: "custrecord_pct_pp_batch_no", label: "Batch No" }),
                        search.createColumn({ name: "custrecord_pct_pp_party_name", label: "Party Name" }),
                        search.createColumn({ name: "custrecord_pct_pp_vehicles_no", label: "Vehicles No" }),
                        search.createColumn({ name: "custrecord_pct_pp_sp_gravity", label: "SP. Gravity" }),
                        search.createColumn({ name: "custrecord_pct_pp_viscosity", label: "Viscosity" }),
                        search.createColumn({ name: "custrecord_pct_pp_temperature", label: "Temperature @ (30 degree C)" }),
                        search.createColumn({ name: "custrecord_pct_pp_ph_value", label: "PH Value" }),
                        search.createColumn({ name: "custrecord_pct_pp_solid", label: "Solid %" }),
                        search.createColumn({ name: "custrecord_pct_pp_colour", label: "Colour" }),
                        search.createColumn({ name: "custrecord_pct_pp_report", label: "Report" }),
                        search.createColumn({ name: "custrecord_pct_pp_brightness", label: "Brightness " }),
                        search.createColumn({ name: "custrecord_pct_pp_oil_absorption", label: "Oil Absorption" }),
                        search.createColumn({ name: "custrecord_pct_pp_water_absorption", label: "Water Absorption" }),
                        search.createColumn({ name: "custrecord_pct_pp_hcl_reaction", label: "HCL Reaction" }),
                        search.createColumn({ name: "custrecord_pct_pp_mesh_analysis", label: "Mesh Analysis (300/500#)" }),
                        search.createColumn({ name: "custrecord_pct_pp_viscosity_solution", label: "Viscosity (40/50% Solution)" }),
                        search.createColumn({ name: "custrecord_pct_colour_on_gardner_scale", label: "Colour On Gardner Scale" }),
                        search.createColumn({ name: "custrecord_pct_pp_acid_value", label: "Acid Value" }),
                        search.createColumn({ name: "custrecord_pct_pp_clearity", label: "Clearity" }),
                        search.createColumn({ name: "custrecord_pct_pp_drying_time_surface", label: "Drying Time Surface" }),
                        search.createColumn({ name: "custrecord_pct_pp_drying_time_tack_free", label: "Drying Time Tack Free" }),
                        search.createColumn({ name: "custrecord_pct_pp_drying_time_hard", label: "Drying Time Hard" }),
                        search.createColumn({ name: "custrecord_pct_pp_tolerancy", label: "Tolerancy" }),
                        search.createColumn({ name: "custrecord_pct_pp_gloss_on_meter", label: "Gloss On Meter (60 degree Gloss)" }),
                        search.createColumn({ name: "custrecord_pct_pp_colour_mtchng_take_eco", label: "Colour On Matching Take Eco-1" }),
                        search.createColumn({ name: "custrecord_pct_pp_colour_on_mtchng_paste", label: "Colour On Matching Paste" }),
                        search.createColumn({ name: "custrecord_pct_pp_whiteness", label: "Whiteness" }),
                        search.createColumn({ name: "custrecord_pct_pp_bill_no", label: "Bill No" }),
                        search.createColumn({ name: "custrecord_pct_pp_record_form", label: "Record Form" }),
                        search.createColumn({ name: "custrecord_pct_pp_document_number", label: "Document Number" }),
                        search.createColumn({ name: "custrecord_pct_pp_qc_approved", label: "QC Approved" }),
                        search.createColumn({name: "name", label: "ID"}),
                        search.createColumn({name: "created", label: "Date Created"})
                    ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count", searchResultCount);



            var dataArr = new Array();

            var start = 0;
            var end = 1000;

            //srch.run().each(function(result)
            do {
                var result = transactionSearchObj.run().getRange({
                    start: start,
                    end: end
                });
                //log.debug("result.length", result.length);


                for (var i = 0; i < result.length; i++) {
                    var dataObj = new Object();
                    log.debug("result.length", i);

                    dataObj.name = result[i].getValue('name');
                    dataObj.created = result[i].getValue('created');
                    dataObj.custrecord_pct_pp_material_name_pdct_nme = result[i].getValue('custrecord_pct_pp_material_name_pdct_nme');
                    dataObj.custrecord_pct_pp_batch_no = result[i].getValue('custrecord_pct_pp_batch_no');
                    dataObj.custrecord_pct_pp_date = result[i].getValue('custrecord_pct_pp_date');
                    dataObj.custrecord_pct_pp_party_name = result[i].getValue('custrecord_pct_pp_party_name');
                    dataObj.custrecord_pct_pp_vehicles_no = result[i].getValue('custrecord_pct_pp_vehicles_no');
                    dataObj.custrecord_pct_pp_sp_gravity = result[i].getValue('custrecord_pct_pp_sp_gravity');
                    dataObj.custrecord_pct_pp_viscosity = result[i].getValue('custrecord_pct_pp_viscosity');
                    dataObj.custrecord_pct_pp_temperature = result[i].getValue('custrecord_pct_pp_temperature');
                    dataObj.custrecord_pct_pp_ph_value = result[i].getValue('custrecord_pct_pp_ph_value');
                    dataObj.custrecord_pct_pp_solid = result[i].getValue('custrecord_pct_pp_solid');
                    dataObj.custrecord_pct_pp_colour = result[i].getValue('custrecord_pct_pp_colour');
                    dataObj.custrecord_pct_pp_report = result[i].getValue('custrecord_pct_pp_report');
                    dataObj.custrecord_pct_pp_brightness = result[i].getValue('custrecord_pct_pp_brightness');
                    dataObj.custrecord_pct_pp_oil_absorption = result[i].getValue('custrecord_pct_pp_oil_absorption');
                    dataObj.custrecord_pct_pp_water_absorption = result[i].getValue('custrecord_pct_pp_water_absorption');
                    dataObj.custrecord_pct_pp_hcl_reaction = result[i].getValue('custrecord_pct_pp_hcl_reaction');
                    dataObj.custrecord_pct_pp_mesh_analysis = result[i].getValue('custrecord_pct_pp_mesh_analysis');
                    dataObj.custrecord_pct_pp_viscosity_solution = result[i].getValue('custrecord_pct_pp_viscosity_solution');
                    dataObj.custrecord_pct_colour_on_gardner_scale = result[i].getValue('custrecord_pct_colour_on_gardner_scale');
                    dataObj.custrecord_pct_pp_acid_value = result[i].getValue('custrecord_pct_pp_acid_value');
                    dataObj.custrecord_pct_pp_clearity = result[i].getValue('custrecord_pct_pp_clearity');
                    dataObj.custrecord_pct_pp_drying_time_surface = result[i].getValue('custrecord_pct_pp_drying_time_surface');
                    dataObj.custrecord_pct_pp_drying_time_tack_free = result[i].getValue('custrecord_pct_pp_drying_time_tack_free');
                    dataObj.custrecord_pct_pp_drying_time_hard = result[i].getValue('custrecord_pct_pp_drying_time_hard');
                    dataObj.custrecord_pct_pp_tolerancy = result[i].getValue('custrecord_pct_pp_tolerancy');
                    dataObj.custrecord_pct_pp_gloss_on_meter = result[i].getValue('custrecord_pct_pp_gloss_on_meter');
                    dataObj.custrecord_pct_pp_colour_mtchng_take_eco = result[i].getValue('custrecord_pct_pp_colour_mtchng_take_eco');
                    dataObj.custrecord_pct_pp_colour_on_mtchng_paste = result[i].getValue('custrecord_pct_pp_colour_on_mtchng_paste');
                    dataObj.custrecord_pct_pp_whiteness = result[i].getValue('custrecord_pct_pp_whiteness');
                    dataObj.custrecord_pct_pp_bill_no = result[i].getValue('custrecord_pct_pp_bill_no');
                    dataObj.custrecord_pct_pp_record_form = result[i].getValue('custrecord_pct_pp_record_form');
                    dataObj.custrecord_pct_pp_document_number = result[i].getValue('custrecord_pct_pp_document_number');
                    dataObj.custrecord_pct_pp_qc_approved = result[i].getValue('custrecord_pct_pp_qc_approved');


                    dataArr.push(dataObj)
                }
                end += 1000;
                start += 1000;
                searchResultCount -= 1000;
            } while (searchResultCount > 0);

            return dataArr;
        }
        return {
            onRequest: onRequest
        }
    });



