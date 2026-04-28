/**
 * Module Description
 *
 * Version       Date            		Author            Remarks
 * 2.01        02 September 2022        Subhankar Nath
 *
 *
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************
Script Name:        PCT PMC Drawing Specification Data Get 
Developer:          Sandipan Sau 
Development Head:   Ratwika Mondal
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			This restlet will get Data from PMC Drawing Specification.
© Copyright All Rights Reserved
***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************
Function Name:             			                              Purpose:                                                              Developer:
_get                                                        Main Function                                                             Subhankar Nath

/**********************************************************************************************************************************************
Update Log
Date                   Developer Name              Requester                     Change Summary
***********************************************************************************************************************************************/

define(['N/search', 'N/record'], function (search, record) {
    let drawingSpecificationObjectKeys = {
        'version': {
            'data': '',
            'title': 'Version',
            'class': 'version'
        },
        'drawingHash': {
            'data': '',
            'title': 'Drawing#',
            'class': 'drawingHash'
        },
        'ctf': {
            'data': '',
            'title': 'CTF',
            'class': 'ctf'
        },
        'nominal': {
            'data': '',
            'title': 'Nominal',
            'class': 'nominal'
        },
        'positiveTolerance': {
            'data': '',
            'title': '+Tol',
            'class': 'positiveTol'
        },
        'negativeTolerance': {
            'data': '',
            'title': '-Tol',
            'class': 'negativeTol'
        }
    }
    let measurementObjectKeys = {
        'high': {
            'data': '',
            'title': 'High',
            'class': 'high'
        },
        'low': {
            'data': '',
            'title': 'Low',
            'class': 'low'
        },
        'upper': {
            'data': '',
            'title': 'Upper',
            'class': 'upper'
        },
        'lower': {
            'data': '',
            'title': 'Lower',
            'class': 'lower'
        },
        'mean': {
            'data': '',
            'title': 'Mean',
            'class': 'mean'
        }
    }
    let inspectionRecordId, sampleSize;
    function _get(context) {
        log.debug(`PCT-PMC`, `In PMC Drawing Specification Data Get RestLet`);
        let parameters = JSON.parse(context.params);
        log.debug({
            title: 'LOG',
            details: `Paramas = ${JSON.stringify(parameters)}`
        })
        let workOrderId = parameters.workOrderId;
        let workCenter = parameters.workCenter;
        let operationSequence = parameters.operationSequence;
        let item = parameters.item;
        let iqcData = getIqcRevision(workOrderId, workCenter, operationSequence);
        log.debug({
            title: `LOG`,
            details: `IQC Data = ${JSON.stringify(iqcData)}`
        })
        if (iqcData.isSuccess) {
            inspectionRecordId = iqcData.data.internalId;
            sampleSize = iqcData.data.sampleSize;
            log.debug(`PCT-PMC`, `Id ${inspectionRecordId}, Sample Size ${sampleSize}`)
            let iqcInspectionData = getIqcInspectionRecordData(iqcData.data.internalId);
            log.debug({
                title: `LOG`,
                details: `IQC Details = ${JSON.stringify(iqcInspectionData)}`
            })
            if (iqcInspectionData.isSuccess) {
                return iqcInspectionData;
            }
            else {
                let drawingSpecificationData = getDrawingInspectionData(item, iqcData.data.revision);
                log.debug({
                    title: 'LOG',
                    details: `Drawing Specification Data = ${JSON.stringify(drawingSpecificationData)}`
                })
                return drawingSpecificationData
            }
        }
        else {
            return iqcData
        }
    }
    //------------------------------------------------------- Search to Get Drawing Specification Revision --------------------------------------
    // Account - Paapri Manufacturing LLC 
    // Search Id - 734
    const getIqcRevision = (workOrderId, workCenter, operationSequence) => {
        var manufacturingoperationtaskSearchObj = search.create({
            type: "manufacturingoperationtask",
            filters:
                [
                    ["workorder", "anyof", workOrderId],
                    "AND",
                    ["manufacturingworkcenter", "anyof", workCenter],
                    "AND",
                    ["sequence", "equalto", operationSequence],
                    "AND",
                    ["custrecord_pct_pmc_iqc_tran_num.internalidnumber", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_pct_pmc_iqc_revision",
                        join: "CUSTRECORD_PCT_PMC_IQC_TRAN_NUM",
                        label: "Revision"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_PMC_IQC_TRAN_NUM",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_pmc_iqc_sample_size",
                        join: "CUSTRECORD_PCT_PMC_IQC_TRAN_NUM",
                        label: "Sample Size"
                    })
                ]
        });
        var manufacturingOpereationCount = manufacturingoperationtaskSearchObj.runPaged().count;
        log.debug(`PCT-PMC`, `Manufacturing Operation Task Search Count ${manufacturingOpereationCount}`);
        if (manufacturingOpereationCount > 0) {
            let iqcDataObj = {}
            manufacturingoperationtaskSearchObj.run().each(function (result) {
                iqcDataObj["internalId"] = result.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_PCT_PMC_IQC_TRAN_NUM",
                });
                iqcDataObj["revision"] = result.getValue({
                    name: "custrecord_pct_pmc_iqc_revision",
                    join: "CUSTRECORD_PCT_PMC_IQC_TRAN_NUM"
                });
                iqcDataObj["sampleSize"] = result.getValue({
                    name: "custrecord_pct_pmc_iqc_sample_size",
                    join: "CUSTRECORD_PCT_PMC_IQC_TRAN_NUM"
                });
                return true;
            });
            return { 'isSuccess': true, 'data': iqcDataObj }
        }
        return { 'isSuccess': false, 'errorMessage': 'IQC Data Not Found' }
    }
    //------------------------------------------------------- Search to Get IQC Record Data --------------------------------------
    // Account - Paapri Manufacturing LLC 
    // Search Id - 735
    const getIqcInspectionRecordData = (iqcId) => {
        var customrecord_pct_pmc_iqc_recordSearchObj = search.create({
            type: "customrecord_pct_pmc_iqc_record",
            filters:
                [
                    ["internalid", "anyof", iqcId],
                    "AND",
                    ["custrecord_pct_ins_record_link.internalidnumber", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_po_tol",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "+Tol"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_neg_tol",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "-Tol"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_high",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "High"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_iqc_record",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "IQC Record"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_record_link",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Link to IQC"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_low",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Low"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_lower",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Lower"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_mean",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Mean"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_sl",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "SL No"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_upper",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Upper"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_ver",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Version"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_col",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Column Number"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_row",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Row Number"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_ins_rec_test_res",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Test Record"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_PCT_INS_RECORD_LINK",
                        label: "Internal ID"
                    }),
                    search.createColumn({ name: "custrecord_pct_pmc_iqc_submitted", label: "submitted" }),
                    search.createColumn({ name: "custrecord_pct_pmc_iqc_sample_size", label: "Total Sample Size" })
                ]
        });
        var iqcRecordCount = customrecord_pct_pmc_iqc_recordSearchObj.runPaged().count;
        log.debug(`PCT-PMC`, `IQC Record Count ${iqcRecordCount}`);
        if (iqcRecordCount > 0) {
            let measurementArray = [];
            let drawingSpecificationArray = [];
            let drawingSpecificationChildArray = [];
            let inspectionArray = [];
            let iqcInspectionObj = {};

            customrecord_pct_pmc_iqc_recordSearchObj.run().each(function (result) {
                // ------------------------ Object for Measurement Record  --------------------
                let resMeasurement = JSON.parse(JSON.stringify(measurementObjectKeys));
                resMeasurement.high.data = result.getValue({ name: "custrecord_pct_ins_rec_high", join: "CUSTRECORD_PCT_INS_RECORD_LINK" });
                resMeasurement.low.data = result.getValue({ name: "custrecord_pct_ins_rec_low", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                resMeasurement.upper.data = result.getValue({ name: "custrecord_pct_ins_rec_upper", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                resMeasurement.lower.data = result.getValue({ name: "custrecord_pct_ins_rec_lower", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                resMeasurement.mean.data = result.getValue({ name: "custrecord_pct_ins_rec_mean", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                measurementArray.push(resMeasurement)

                // ------------------------ Object for Drawing Specification --------------------
                let resDrawingSpecification = JSON.parse(JSON.stringify(drawingSpecificationObjectKeys))
                let revArray = result.getValue({ name: "custrecord_pct_ins_rec_ver", join: "CUSTRECORD_PCT_INS_RECORD_LINK" }).split(';');
                resDrawingSpecification.version.data = revArray[0];
                resDrawingSpecification.drawingHash.data = revArray[1];
                resDrawingSpecification.ctf.data = revArray[2];
                resDrawingSpecification.nominal.data = revArray[3];
                resDrawingSpecification.positiveTolerance.data = revArray[4];
                resDrawingSpecification.negativeTolerance.data = revArray[5];
                drawingSpecificationArray.push(resDrawingSpecification)

                // ------------------------ Object for Drawing Specification Child Record Id --------------------
                let drawingSpecificationChildObj = {
                    'internalId': result.getValue({ name: "internalid", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                }
                drawingSpecificationChildArray.push(drawingSpecificationChildObj)

                // ------------------------ Object for Inspection Record --------------------
                let resInspectionArray = result.getValue({ name: "custrecord_pct_ins_rec_test_res", join: "CUSTRECORD_PCT_INS_RECORD_LINK" }).split(';');
                // let resInspectionArrayObj = Object.assign({}, resInspectionArray)

                inspectionArray.push(resInspectionArray)

                // ------------------------ Object for Additional Data -------------------------

                iqcInspectionObj['positiveTool'] = result.getValue({ name: "custrecord_pct_ins_rec_po_tol", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['negativeTool'] = result.getValue({ name: "custrecord_pct_ins_rec_neg_tol", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['iqcRecord'] = result.getValue({ name: "custrecord_pct_ins_rec_iqc_record", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['internalId'] = result.getValue({ name: "internalid", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['linkToIqc'] = result.getValue({ name: "custrecord_pct_ins_record_link", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['slNo'] = result.getValue({ name: "custrecord_pct_ins_rec_sl", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['version'] = result.getValue({ name: "custrecord_pct_ins_rec_ver", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['columnNumber'] = result.getValue({ name: "custrecord_pct_ins_rec_col", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['rowNumber'] = result.getValue({ name: "custrecord_pct_ins_rec_row", join: "CUSTRECORD_PCT_INS_RECORD_LINK" })
                iqcInspectionObj['submitted'] = result.getValue('custrecord_pct_pmc_iqc_submitted')
                iqcInspectionObj['sampleSize'] = result.getValue('custrecord_pct_pmc_iqc_sample_size')
                iqcInspectionObj['inspectionRecordId'] = inspectionRecordId;

                return true;
            });
            return { 'isSuccess': true, 'drawingSpecificationData': drawingSpecificationArray, 'drawingSpecificationChildId': drawingSpecificationChildArray, 'measurementData': measurementArray, 'inspectionData': inspectionArray, 'additionalData': iqcInspectionObj, 'isSavedData': true }
        }
        return { 'isSuccess': false, 'errorMessage': 'No IQC Inspection Data Found' }
    }
    //------------------------------------------------------- Search to Get Drawing Specification Data --------------------------------------
    // Account - Paapri Manufacturing LLC 
    // Search Id - 736
    const getDrawingInspectionData = (item, revision) => {
        var assemblyitemSearchObj = search.create({
            type: "assemblyitem",
            filters:
                [
                    ["type", "anyof", "Assembly"],
                    "AND",
                    ["internalid", "anyof", item],
                    "AND",
                    ["custrecord_pct_drawing_spec_link_parent.custrecord_pct_drawing_specification_ver", "is", revision]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_pct_drawing_specification_dra",
                        join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT",
                        label: "Drawing#"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_drawing_specification_mto",
                        join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT",
                        label: "- Tol"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_drawing_specification_pto",
                        join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT",
                        label: "+ Tol"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_drawing_specification_nom",
                        join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT",
                        label: "Nominal"
                    }),
                    search.createColumn({
                        name: "custrecord_pct_drawing_specification_ver",
                        join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT",
                        label: "Version"
                    }),
                ]
        });
        var drawingInspectionCount = assemblyitemSearchObj.runPaged().count;
        log.debug(`PCT-PMC`, `Drawing Inspection Record Count ${drawingInspectionCount}`);
        if (drawingInspectionCount > 0) {
            let drawingInspectionArray = [];
            let additionalObj = {};
            assemblyitemSearchObj.run().each(function (result) {
                // ------------------------ Object for Drawing Specification --------------------
                let res = JSON.parse(JSON.stringify(drawingSpecificationObjectKeys))
                res.version.data = result.getValue({ name: "custrecord_pct_drawing_specification_ver", join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT" });
                res.drawingHash.data = result.getValue({ name: "custrecord_pct_drawing_specification_dra", join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT" });
                res.negativeTolerance.data = result.getValue({ name: "custrecord_pct_drawing_specification_mto", join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT" });
                res.nominal.data = result.getValue({ name: "custrecord_pct_drawing_specification_nom", join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT" });
                res.positiveTolerance.data = result.getValue({ name: "custrecord_pct_drawing_specification_pto", join: "CUSTRECORD_PCT_DRAWING_SPEC_LINK_PARENT" });
                res.ctf.data = '';
                drawingInspectionArray.push(res)

                // additionalArray.push(additionalObj['sampleSize'] = result.getValue('custrecord_pct_pmc_iqc_sample_size'))
                return true;
            });
            additionalObj['sampleSize'] = sampleSize;
            additionalObj['inspectionRecordId'] = inspectionRecordId;
            return { 'isSuccess': true, 'drawingSpecificationData': drawingInspectionArray, 'measurementData': measurementObjectKeys, 'additionalData': additionalObj, 'isSavedData': false }
        }
        return { 'isSuccess': false, 'errorMessage': 'No Drawing Inspection Data Found' }

    }
    return {
        get: _get
    }
});