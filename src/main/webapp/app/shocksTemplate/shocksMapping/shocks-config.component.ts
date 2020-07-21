import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as GC from '@grapecity/spread-sheets';
import * as GCExcel from '@grapecity/spread-excelio';
import { ShocksTemplateService } from 'app/shocksTemplate/shocksTemplate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
    ALERT_MSG_TIME_OUT,
    SCENARIO_CLASSIFICATION_REGULATORY,
    SCENARIO_CLASSIFICATION_INTERNAL,
    SCENARIO_CLASSIFICATION_ADHOC
} from 'app/constants';
import { saveAs } from 'file-saver';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'jhi-shocks-mapping',
    templateUrl: './shocks-config.component.html',
    styleUrls: ['../shocksTemplate.css']
})
export class ShocksConfigComponent implements OnInit {
    myData = new BehaviorSubject({});
    spread: any;
    sheet: any;
    styles: any;
    isSaved = false;
    message = 'Successfully saved!';
    allRegulationList = [];
    subClassificationList = [];
    scenarioList = [];
    classificationList = [];
    disableButtons = false;
    isSuccess: boolean;
    displaySuccessMessage = '';
    isFailure: boolean;
    displayFailureMessage = '';
    columnList = [];
    rowList = [];
    frequencyList = [];
    severityList = [];
    unitList = [];
    unitListData = [];
    possibleStatuses = [1];
    templateType = null;
    validationResult: any;
    shockTemplateObj = {
        id: null,
        name: null,
        scenarioType: null,
        classification: null,
        subClassification: null,
        shockTemplateMappingDTOs: [],
        periodType: null,
        severity: null,
        projectionPeriod: null,
        year: null,
        startLimit: 0,
        endLimit: 100
    };
    option = {
        allowSelectLockedCells: true,
        allowSelectUnlockedCells: true,
        allowFilter: true,
        allowSort: false,
        allowResizeRows: true,
        allowResizeColumns: true,
        allowEditObjects: true,
        allowDragInsertRows: false,
        allowDragInsertColumns: false,
        allowInsertRows: false,
        allowInsertColumns: false,
        allowDeleteRows: false,
        allowDeleteColumns: false,
        allowClearContents: false
    };
    isClicked = false;
    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    fileExtension = '.xlsx';
    scenarioRegualtory = SCENARIO_CLASSIFICATION_REGULATORY;
    scenarioInternal = SCENARIO_CLASSIFICATION_INTERNAL;
    scenarioAdhoc = SCENARIO_CLASSIFICATION_ADHOC;
    createFilter = { SEARCH_STR: [''] };
    masterDataObjForFilters = {};
    isScrolled = false;
    scrollCount = 0;
    dataList = [];
    headerList = [];
    headerIDList = [];
    constructor(
        private shocksTemplateService: ShocksTemplateService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.shockTemplateObj.id = this.route.snapshot.params.id;

        this.getSeverityPeriodType();
    }
    getSeverityPeriodType() {
        this.shocksTemplateService.getSeverityPeriodType().subscribe(response => {
            this.frequencyList = response['FREQUENCY_DATA'];
            this.severityList = response['SEVERITY_DATA'];
            this.scenarioList = response['SCENARIO_TYPE_DATA'];
            this.classificationList = response['CLASSIFICATION_DATA'];
            this.subClassificationList = response['SUB_CLASSIFICATION_DATA'];
            this.unitList = response['UNIT_DATA'];
            /* for (let i = 0; i < this.unitList.length; i++) {
                const tempComboData = { text: null, value: null };
                tempComboData.text = this.unitList[i].label;
                tempComboData.value = this.unitList[i].value;
                this.unitListData.push(tempComboData);
            } */
            if (this.shockTemplateObj.id) {
                this.templateType = 'existing';
                this.showShockTemplateDataforView();
            }
        });
    }
    showShockTemplateDataforView() {
        this.isClicked = true;
        this.shocksTemplateService.getShockTemplateObject(this.shockTemplateObj.id).subscribe(response => {
            this.shockTemplateObj = response;
            this.shockTemplateObj.startLimit = 0;
            this.shockTemplateObj.endLimit = 100;
            this.allRegulationList = this.subClassificationList;
            if (this.shockTemplateObj.startLimit == 0) {
                document.getElementById('viewFileData').innerHTML = '';
                this.spread = new GC.Spread.Sheets.Workbook(document.getElementById('viewFileData'));
            }
            this.sheet = this.spread.getSheet(0);
            this.styles = this.sheet.getDefaultStyle();
            this.isScrolled = false;
            this.dataList = [];
            this.showShockTemplateDataInView();
        });
    }

    getList() {
        if (this.isScrolled) {
            this.shockTemplateObj.startLimit = this.shockTemplateObj.startLimit + 100;
        }
        let flag = false;
        if (this.shockTemplateObj.classification == null) {
            this.showErrorValidations(true, ' Please select Classification.');
            flag = true;
        } else if (!this.shockTemplateObj.subClassification || this.shockTemplateObj.subClassification == null) {
            this.showErrorValidations(true, ' Please select Subclassification.');
            flag = true;
        } else if (this.shockTemplateObj.severity == null) {
            this.showErrorValidations(true, ' Please select Severity.');
            flag = true;
        } else if (this.shockTemplateObj.scenarioType == null) {
            this.showErrorValidations(true, ' Please select ScenarioType.');
            flag = true;
        } else if ((this.shockTemplateObj.name || '').trim().length === 0 || this.shockTemplateObj.name == null) {
            this.showErrorValidations(true, ' Please Provide Template Name.');
            flag = true;
        }
        if (flag) {
            return false;
        }
        if (this.shockTemplateObj.scenarioType == 2) {
            if (this.shockTemplateObj.year == null) {
                this.showErrorValidations(true, ' Please select Year.');
                flag = true;
            } else if (this.shockTemplateObj.periodType == null) {
                this.showErrorValidations(true, ' Please Provide Period Type.');
                flag = true;
            } else if (this.shockTemplateObj.projectionPeriod == null) {
                this.showErrorValidations(true, ' Please select Projection Period.');
                flag = true;
            } else if (
                (this.shockTemplateObj.scenarioType == 2 && this.shockTemplateObj.projectionPeriod > '21') ||
                (this.shockTemplateObj.scenarioType == 2 && this.shockTemplateObj.projectionPeriod < '2')
            ) {
                this.showErrorValidations(true, 'Please Provide A Value For Projection Period 2 to 20.');
                return false;
            }

            if (flag) {
                return false;
            }
        }
        this.isClicked = true;
        let obj = {
            createFilter: JSON.stringify(this.createFilter),
            dto: JSON.stringify(this.shockTemplateObj)
        };
        this.shocksTemplateService.getTemplateProjectionData(obj).subscribe(
            response => {
                if (this.shockTemplateObj.startLimit == 0) {
                    document.getElementById('viewFileData').innerHTML = '';
                    this.spread = new GC.Spread.Sheets.Workbook(document.getElementById('viewFileData'));
                }
                this.sheet = this.spread.getSheet(0);
                this.styles = this.sheet.getDefaultStyle();
                const dataList = response.slice(1, response.length - 1);
                this.headerIDList = response.slice(response.length - 1);
                this.headerList = response[0];
                if (this.dataList.length == 0) {
                    this.dataList = dataList;
                } else {
                    this.dataList = this.dataList.concat(dataList);
                }
                this.showShockTemplateData();
            },
            response => {
                this.showErrorValidations(true, 'Internal server error. Please contact IT support.');
            }
        );
    }
    showShockTemplateData() {
        let headerList = this.headerList;
        this.scrollCount = Math.floor(this.dataList.length / 100);
        this.sheet.suspendPaint();
        this.sheet.setColumnCount(headerList.length);
        this.sheet.setRowCount(this.dataList.length);
        this.sheet.setArray(this.shockTemplateObj.startLimit, 0, this.dataList.slice(this.shockTemplateObj.startLimit));
        this.sheet.options.isProtected = true;
        this.sheet.options.protectionOptions = this.option;

        for (let column = 0; column < headerList.length; column++) {
            this.sheet.setValue(0, column, headerList[column], GC.Spread.Sheets.SheetArea.colHeader);
            this.sheet.setColumnWidth(column, 200);
        }
        let current = this;
        this.sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
            if (args.newTopRow == current.dataList.length - 1) {
                if (current.dataList.length / (current.scrollCount * 100) == 1) {
                    current.scrollCount = current.scrollCount + 1;
                    current.isScrolled = true;
                    if (current.shockTemplateObj.id) {
                        current.showShockTemplateDataInView();
                    } else {
                        current.getList();
                    }
                }
                return false;
            }
            return false;
        });
        this.sheet.setColumnWidth(1, 300);
        this.sheet
            .getRange(0, 1, this.sheet.getRowCount(), 1)
            .backColor('lightgray')
            .setBorder(new GC.Spread.Sheets.LineBorder('gray', GC.Spread.Sheets.LineStyle.thin), { all: true });

        this.sheet.getRange(0, 2, this.sheet.getRowCount(), headerList.length - 1).locked(false);
        var filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(-1, -1, 1, this.dataList.length));
        this.sheet.rowFilter(filter);
        this.sheet.setColumnVisible(0, false, GC.Spread.Sheets.SheetArea.viewport);
        // this.sheet.setRowVisible(0, true, GC.Spread.Sheets.SheetArea.viewport);
        // this.sheet.setRowVisible(this.dataList.length - 1, false, GC.Spread.Sheets.SheetArea.viewport);
        this.sheet.resumePaint();
    }

    getValue(id, ListData) {
        var valueById;
        if (id != null) {
            for (let i = 0; i < ListData.length; i++) {
                if (ListData[i].value == id) {
                    valueById = ListData[i].text;
                    break;
                }
            }
        }
        return valueById;
    }

    showShockTemplateDataInView() {
        if (this.isScrolled) {
            this.shockTemplateObj.startLimit = this.shockTemplateObj.startLimit + 100;
        }
        var object = this;
        this.shocksTemplateService.getTemplateProjectionDataInView(this.shockTemplateObj).subscribe(
            response => {
                const dataList = response.slice(1, response.length - 1);
                this.headerIDList = response.slice(response.length - 1);
                this.headerList = response[0];
                if (this.dataList.length == 0) {
                    this.dataList = dataList;
                } else {
                    this.dataList = this.dataList.concat(dataList);
                }
                this.showShockTemplateData();
            },
            response => {
                this.showErrorValidations(true, 'Internal server error. Please contact IT support.');
            }
        );
    }
    saveshockTemplateData() {
        let flag = false;
        if (this.shockTemplateObj.scenarioType == null) {
            this.showErrorValidations(true, ' Please select ScenarioType.');
            flag = true;
        } else if (
            this.shockTemplateObj.classification != this.scenarioAdhoc &&
            (!this.shockTemplateObj.subClassification || this.shockTemplateObj.subClassification == null)
        ) {
            this.showErrorValidations(true, ' Please select Regulatory Name.');
            flag = true;
        } else if ((this.shockTemplateObj.name || '').trim().length === 0 || this.shockTemplateObj.name == null) {
            this.showErrorValidations(true, ' Please Provide Template Name.');
            flag = true;
        } else if ((this.shockTemplateObj.name || '').trim().length === 0 || this.shockTemplateObj.name == null) {
            this.showErrorValidations(true, ' Please Provide Template Name.');
            flag = true;
        }
        if (flag) {
            return false;
        }
        if (this.shockTemplateObj.scenarioType == 2) {
            if (this.shockTemplateObj.scenarioType == null) {
                this.showErrorValidations(true, ' Please select ScenarioType1.');
                flag = true;
            } else if (
                this.shockTemplateObj.classification != this.scenarioAdhoc &&
                (!this.shockTemplateObj.subClassification || this.shockTemplateObj.subClassification == null)
            ) {
                this.showErrorValidations(true, ' Please select Regulatory Name1.');
                flag = true;
            } else if ((this.shockTemplateObj.name || '').trim().length === 0 || this.shockTemplateObj.name == null) {
                this.showErrorValidations(true, ' Please Provide Template Name1.');
                flag = true;
            } else if (this.shockTemplateObj.year == null) {
                this.showErrorValidations(true, ' Please select Year.');
                flag = true;
            } else if (this.shockTemplateObj.severity == null) {
                this.showErrorValidations(true, ' Please select Severity.');
                flag = true;
            } else if (this.shockTemplateObj.projectionPeriod == null) {
                this.showErrorValidations(true, ' Please select Projection Period.');
                flag = true;
            } else if (this.shockTemplateObj.periodType == null) {
                this.showErrorValidations(true, ' Please Provide Period Type.');
                flag = true;
            } else if (
                (this.shockTemplateObj.scenarioType == 2 && this.shockTemplateObj.projectionPeriod > '21') ||
                (this.shockTemplateObj.scenarioType == 2 && this.shockTemplateObj.projectionPeriod < '2')
            ) {
                this.showErrorValidations(true, 'Please Provide A Value For Projection Period 2 to 20.');
                return false;
            }

            if (flag) {
                return false;
            }
        }

        this.shockTemplateObj.name = (this.shockTemplateObj.name || '').trim();

        if (this.validationResult && Object.keys(this.validationResult).length > 0) {
            this.removeValidations();
        }
        let activeSheet = this.spread.getActiveSheet();
        let sheetData = activeSheet.getArray(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount());
        sheetData = sheetData.concat(this.headerIDList);
        let data = {
            shockTemplateObj: this.shockTemplateObj,
            sheetData: sheetData,
            template: this.templateType
        };

        this.shocksTemplateService.saveShockTemplateData(data).subscribe(
            response => {
                this.shockTemplateObj.id = response['ShockId'];
                this.validationResult = response['InvalidData'];
                if (this.validationResult && Object.keys(this.validationResult).length > 0) {
                    this.showValidations();
                    this.showErrorValidations(true, 'provided data have validation issues. please reslove and save.');
                } else {
                    this.showSuccessValidations(true, 'Shock Template data inserted successfully ');
                    this.templateType = 'existing';
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    getUnitId(label) {
        for (let i = 0; i < this.unitListData.length; i++) {
            if (this.unitListData[i].text == label) {
                return this.unitListData[i].value;
            }
        }
    }
    backToShockTemplate() {
        console.log('back to shock template page');
        this.router.navigate(['dataUtility/shocksTemplate'], { skipLocationChange: true });
    }

    cancel() {
        this.modalService.dismissAll();
        this.router.navigate(['dataUtility/shocksTemplate'], { skipLocationChange: true });
    }
    change(type) {
        let clsfnId = null;
        clsfnId = this.shockTemplateObj.classification;

        if (type === 'CLASSIFICATION') {
            this.shockTemplateObj.subClassification = null;
            clsfnId = this.shockTemplateObj.classification;
            this.allRegulationList = [];
            if (clsfnId != null) {
                this.allRegulationList = this.subClassificationList.filter(clfn => clfn.classification === clsfnId);
            }
        } else if (type === 'subclassification') {
            if (clsfnId == '1') {
                this.myData.next({ id: clsfnId, value: this.shockTemplateObj.subClassification, masterData: this.masterDataObjForFilters });
            } else {
                this.myData.next({ id: clsfnId, value: null, masterData: this.masterDataObjForFilters });
            }
        }
        this.isClicked = false;
    }
    yearValueChange(data) {
        this.shockTemplateObj.year = data;
        if (this.shockTemplateObj.id == null) {
            this.isClicked = false;
        }
    }

    showSuccessValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isFailure = false;
        this.isSuccess = showMessage;
        this.displaySuccessMessage = displayValidationMessage;
        document.documentElement.scrollTop = 0;
        setTimeout(() => {
            this.isSuccess = false;
            this.displaySuccessMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isSuccess = false;
        this.isFailure = showMessage;
        this.displayFailureMessage = displayValidationMessage;
        document.documentElement.scrollTop = 0;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    download() {
        const excelIO = new GCExcel.IO();
        let date = new Date();
        const dateformat =
            date.getDate() +
            '_' +
            date.getMonth() +
            '_' +
            date.getFullYear() +
            '_' +
            date.getHours() +
            '_' +
            date.getMinutes() +
            '_' +
            date.getSeconds();
        const filename = this.shockTemplateObj.name + '_' + dateformat + '.xlsx';
        this.sheet.setRowVisible(0, true, GC.Spread.Sheets.SheetArea.viewport);
        const jsonData = this.spread.toJSON({ columnHeadersAsFrozenRows: true });
        excelIO.save(
            jsonData,
            function(blob) {
                saveAs(blob, filename);
            },
            function(e) {
                if (e.errorCode === 1) {
                    console.log(e.errorMessage);
                }
            }
        );
        this.sheet.setRowVisible(0, false, GC.Spread.Sheets.SheetArea.viewport);
    }
    showValidations() {
        const style = new GC.Spread.Sheets.Style();
        style.backColor = 'red';
        this.sheet.suspendPaint();
        Object.keys(this.validationResult).forEach(key => {
            this.validationResult[key].forEach(obj => {
                this.sheet.setStyle(obj.rowId, obj.colId, style);
            });
        });
        this.sheet.resumePaint();
    }

    removeValidations() {
        var style = new GC.Spread.Sheets.Style();
        style.backColor = 'white';
        style.borderLeft = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        style.borderTop = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        style.borderRight = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        style.borderBottom = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);

        this.sheet.suspendPaint();
        Object.keys(this.validationResult).forEach(key => {
            this.validationResult[key].forEach(obj => {
                this.sheet.setStyle(obj.rowId, obj.colId, style, GC.Spread.Sheets.SheetArea.viewport);
            });
        });
        this.sheet.resumePaint();
    }

    loadMetaDataByAppliedFilter(filtersData) {
        this.createFilter = filtersData.createFilter;
        this.shockTemplateObj.startLimit = 0;
        this.isScrolled = false;
        this.dataList = [];
        this.getList();
    }
    clearMetaData() {
        this.isClicked = false;
    }
    showFilterComponentMessage(val) {
        this.showErrorValidations(true, val);
    }
}
