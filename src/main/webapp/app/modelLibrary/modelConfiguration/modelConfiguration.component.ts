import { Component, OnInit, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { ModelService } from '../model.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDateMomentAdapter } from 'app/shared';
import { FormsModule } from '@angular/forms';
import { ALERT_MSG_TIME_OUT, ANALYSIS_TYPE_RATE_CORRELATION, MODEL_REVIEW_IN_PROGRESS, MODEL_REJECTED } from 'app/constants';
import { NgbDateStruct, NgbDatepickerConfig, NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import * as $ from 'jquery';
declare var Plotly: any;
@Component({
    selector: 'model-config',
    templateUrl: './modelConfiguration.component.html',
    styleUrls: []
})
export class ModelConfigurationComponent implements OnInit {
    @HostListener('window:scroll', ['$event'])
    onScroll(event) {
        console.log('hide');
    }
    account: Account;
    modelObj = {
        id: null,
        startDate: null,
        endDate: null,
        returnHorizon: null,
        status: null,
        lastModifiedDate: null,
        modelMethodologyConfigDTOList: [],
        lastModifiedBy: null,
        modelName: null,
        minDate: null,
        maxDate: null,
        overlapping: null,
        page: null,
        startDateStr: null,
        endDateStr: null
    };
    minDate = null;
    maxDate = null;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    userCanAccess = false;
    frequencyList = [];
    headersList = [];
    records = [];
    columns = [];
    masterDataMapObj = {};
    masterDataMap = {};
    filtersApplied = false;
    filterIcon = false;
    filterList = [];
    i: any;
    createFilter = { SEARCH_STR: [''] };
    masterDataObj = {};
    classificationMaster = [];
    subClassificationMaster = [];
    scenarioTypeMaster = [];
    severityMaster = [];
    categoryList = [];
    transformationList = [];
    masterDataObjForFilters = {};
    selectedListToDelete = {};
    dataListTemp = [];
    dataListTempNext = [];
    riskFactorList = [];
    columnList = [];
    depRiskFactors = [];
    indepRiskFactors = [];
    indepRiskFactorsForSelect = [];
    riskfactorType: string;
    dataListTempNextForDep = [];
    dataListTempNextForInDep = [];
    modalHeader = null;
    checkedDepList = [];
    checkedInDepList = [];
    selectAllRFDep = false;
    selectAllRFInDep = false;
    type: string;
    isdependent = false;
    minimumData = false;
    navigate = false;
    ismethodology = false;
    metaDataShow = false;
    IndMetaDataShow = false;
    filteredindepRiskFactorsForSelect = [];
    timeseriesData = {};
    downloadType: string;
    columnNameList: any;
    overlappingList = [{ value: 'TRUE', label: 'TRUE' }, { value: 'FALSE', label: 'FALSE' }];
    modelConfigEleList = [{ value: 'TRUE', label: 'TRUE' }, { value: 'FALSE', label: 'FALSE' }];
    @ViewChild('deleteRFModal')
    deleteRFModal: ElementRef;

    @ViewChild('metdlgyConfgMdl')
    metdlgyConfgMdl: ElementRef;

    @ViewChild('addriskfactor')
    addriskfactor: ElementRef;

    @ViewChild('chart') el: ElementRef;

    @ViewChild('timeseriesChart') e: ElementRef;
    @ViewChild('correlationMatrixChart')
    correlationMatrixChart: ElementRef;

    @ViewChild('timeSeriesplotly')
    timeSeriesplotly: ElementRef;
    options = {
        scrollZoom: true,
        modeBarButtonsToRemove: [
            'zoom2d',
            'zoom3d',
            'zoomIn2d',
            'zoomOut2d',
            'pan',
            'pan2d',
            'autoScale2d',
            'hoverClosestCartesian',
            'hoverClosest3d',
            'hoverClosestGeo',
            'hoverClosestGl2d',
            'hoverClosestPie',
            'hoverCompareCartesian',
            'toggleSpikelines',
            'lasso2d',
            'select2d',
            'zoomInGeo',
            'zoomOutGeo',
            'hoverClosestGeo'
        ]
    };
    margin = {
        r: 5,
        t: 5
    };
    startLimit = 0;
    endLimit = 100;
    filter;
    scrollEnable = false;
    isScrolled = false;
    constructor(
        private modelService: ModelService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal,
        private momentAdapter: NgbDateMomentAdapter,
        config: NgbDatepickerConfig,
        calendar: NgbCalendar,
        private datePipe: DatePipe,
        private changeDedectionRef: ChangeDetectorRef
    ) {
        this.modelObj.id = this.activatedRoute.snapshot.params.id;
        config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) > 5;
    }
    ngOnInit() {
        if (this.modelObj.id != null) {
            this.modelService.getModelData(parseInt(this.modelObj.id)).subscribe(
                response => {
                    this.modelObj = response;
                    if (this.modelObj.status < MODEL_REVIEW_IN_PROGRESS || this.modelObj.status == MODEL_REJECTED) {
                        this.modelService.checkAccess(this.modelObj.id).subscribe(res => {
                            this.userCanAccess = res;
                        });
                    }
                    let dateStruct: NgbDateStruct;
                    let date = new Date(this.modelObj.startDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.modelObj.startDate = this.momentAdapter.toModel(dateStruct);

                    date = new Date(this.modelObj.endDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.modelObj.endDate = this.momentAdapter.toModel(dateStruct);
                    this.getMethodologyMasterData(parseInt(this.modelObj.id));

                    let objminDate = new Date(this.modelObj.minDate);
                    this.minDate = { year: objminDate.getFullYear(), month: objminDate.getMonth() + 1, day: objminDate.getDate() };
                    let objmaxDate = new Date(this.modelObj.maxDate);
                    this.maxDate = { year: objmaxDate.getFullYear(), month: objmaxDate.getMonth() + 1, day: objmaxDate.getDate() };
                },
                response_ => {
                    this.showErrorValidations(true, response_.error);
                }
            );
        } else {
            this.modelObj.id = null;
            this.getMethodologyMasterData(this.modelObj.id);
        }
        this.getModelRiskFactorsData();
        this.getMasterListForRiskFactorSelection();
    }
    ngAfterContentChecked(): void {
        this.changeDedectionRef.detectChanges();
    }
    openPopup(type) {
        this.riskfactorType = type;
        //this.resetFilters();
        if (type == 'DEPENDENT') {
            this.isdependent = true;
            this.dataListTempNext = this.dataListTempNextForDep;
        } else if (type == 'INDEPENDENT') {
            this.isdependent = false;
            this.dataListTempNext = this.dataListTempNextForInDep;
        }
        this.modalService.open(this.addriskfactor, { size: 'lg', windowClass: 'custom-modal-class' });
    }

    openDeleteFactorsModal(type) {
        this.modalHeader = 'Delete Risk factors';
        this.modalService.open(this.deleteRFModal, {});
        this.type = type;
    }
    openMetdlgyConfgMdl() {
        this.navigate = false;
        this.ismethodology = true;
        this.modalService.open(this.metdlgyConfgMdl, { size: 'lg', windowClass: 'custom-modal-class' });
    }
    getChartPopup() {
        this.getChart();
        this.modalService.open(this.correlationMatrixChart, { size: 'lg', windowClass: 'custom-modal-class' });
    }
    getMethodologyMasterData(modelId) {
        this.modelService.getMethodologyMasterData(modelId).subscribe(
            response => {
                this.headersList = [];
                this.records = [];
                this.columns = [];

                this.headersList = response['HEADERS'];
                this.columns = response['COLUMNS'];
                this.records = response['RECORDS'];
            },
            responseError => {
                this.showErrorValidations(true, responseError.error);
            }
        );
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.modelObj.id }], { skipLocationChange: true });
    }

    cancel() {
        this.router.navigate(['model'], { skipLocationChange: true });
    }

    validate(modelObj: { id: any; startDate: any; endDate: any; overlapping: any; returnHorizon: any }): any {
        if (!modelObj.startDate) {
            this.showErrorValidations(true, 'Please Select Start Date.');
            return false;
        } else if (!modelObj.endDate) {
            this.showErrorValidations(true, 'Please Select End Date.');
            return false;
        } else if (modelObj.startDate >= modelObj.endDate) {
            this.showErrorValidations(true, 'Start Date should be less than End Date.');
            return false;
        } else if (!modelObj.overlapping || 'null' == modelObj.overlapping) {
            this.showErrorValidations(true, 'Please Select Overlapping.');
            return false;
        } else if (!modelObj.returnHorizon || 'null' == modelObj.returnHorizon) {
            this.showErrorValidations(true, 'Please Select Return Horizon.');
            return false;
        }
        return true;
    }

    saveModelConfigData(path) {
        const modelConfigList = [];
        if (this.validateConfig()) {
            for (let record = 0; record < this.records.length; record++) {
                if (this.records[record]['SELECTED']) {
                    modelConfigList.push({
                        methodologyId: this.records[record].ID,
                        noOfVar: this.records[record].NO_OF_VAR,
                        levelOfSig: this.records[record].LEVEL_OF_SIG,
                        backtestingAnalysis: this.records[record].BACKTESTING_ANALYSIS,
                        stabilityAnalysis: this.records[record].STABILITY_ANALYSIS,
                        bootstrap: this.records[record].BOOTSTRAP,
                        dropVariable: this.records[record].DROP_VARIABLE,
                        fullSuite: this.records[record].FULL_SUITE,
                        intercept: this.records[record].INTERCEPT,
                        maxOrder: this.records[record].MAX_ORDER,
                        maxPC: this.records[record].MAX_PC,
                        maxLag: this.records[record].MAX_LAG,
                        cutOff: this.records[record].CUT_OFF
                    });
                }
            }
            this.modelObj.modelMethodologyConfigDTOList = modelConfigList;
            if (this.modelObj.modelMethodologyConfigDTOList.length < 2) {
                this.showErrorValidations(true, 'Please select atleast 2 methodologies in Methodology Configuration.');
                return false;
            }
            this.modelObj.page = 'modelConfig';
            const startDate = new Date(this.modelObj.startDate);
            const endDate = new Date(this.modelObj.endDate);
            this.modelObj.startDateStr = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
            this.modelObj.endDateStr = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
            this.modelService.saveModelConfigData(this.modelObj).subscribe(
                response => {
                    this.modelObj.lastModifiedDate = response['lastModifiedDate'];
                    this.modalService.dismissAll();
                    if (this.ismethodology) {
                        this.showSuccessValidations(true, 'Data Saved Succesfully.');
                    }
                    if (this.navigate) {
                        this.navigateTo(path);
                    }
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else {
            this.showErrorValidations(true, 'Please fill all the required inputs.');
        }
    }

    validateConfig() {
        const keys = Object.keys(this.records[0]);
        let isValid = true;
        for (let record = 0; record < this.records.length; record++) {
            if (this.records[record]['SELECTED']) {
                for (let k = 0; k < keys.length - 4; k++) {
                    let ele = keys[k];
                    if (this.records[record][ele] == null || this.records[record][ele] === '') {
                        isValid = false;
                    }
                }
            }
        }
        return isValid;
    }
    saveModelRiskFactors() {
        if (this.dataListTempNext && this.dataListTempNext.length > 0) {
            const rfList = this.dataListTempNext.map(element => {
                return {
                    srkId: element[this.columnList.indexOf('SHOCK_RULE_KEY_ID')],
                    frequencyId: element[this.columnList.indexOf('FREQUENCY_ID')],
                    tranformationId: element[this.columnList.indexOf('TRANSFORMATION_ID')],
                    misValTrtId: element[this.columnList.indexOf('MIS_VAL_TREAT_METH_ID')]
                };
            });

            let obj = {
                id: this.modelObj.id,
                rfList: rfList
            };

            if (this.riskfactorType == 'DEPENDENT') {
                this.modelService.saveModelDepRiskFactors(obj).subscribe(
                    response => {
                        this.getModelRiskFactorsData();
                        this.showSuccessValidations(true, 'Selected Riskfactors saved successfully.');
                        this.close();
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                        this.close();
                    }
                );
            } else if (this.riskfactorType == 'INDEPENDENT') {
                this.modelService.saveModelInDepRiskFactors(obj).subscribe(
                    response => {
                        this.getModelRiskFactorsData();
                        this.showSuccessValidations(true, 'Selected Riskfactors saved successfully.');
                        this.close();
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                        this.close();
                    }
                );
            }
        } else {
            this.showErrorValidations(true, 'Please select atleast one Dependent Variable');
        }
    }

    showSuccessValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isFailure = false;
        this.isSuccess = showMessage;
        document.documentElement.scrollTop = 0;
        this.displaySuccessMessage = displayValidationMessage;
        setTimeout(() => {
            this.isSuccess = false;
            this.displaySuccessMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isSuccess = false;
        this.isFailure = showMessage;
        document.documentElement.scrollTop = 0;
        this.displayFailureMessage = displayValidationMessage;
        document.documentElement.scrollTop = 0;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }
    getMasterListForRiskFactorSelection() {
        this.modelService.getMasterListForRiskFactorSelection(parseInt(this.modelObj.id)).subscribe(
            response => {
                this.masterDataObj = response['MASTER_DATA'];

                this.classificationMaster = this.masterDataObj['DIM_CLSFCTN_MST'];
                this.subClassificationMaster = this.masterDataObj['DIM_SUB_CLSFCTN_MST'];
                this.scenarioTypeMaster = this.masterDataObj['DIM_SCNRO_TYP_MST'];
                this.severityMaster = this.masterDataObj['MST_SVRTY'];

                this.categoryList = this.masterDataObj['MST_RF_CATEGORY'];
                this.transformationList = this.masterDataObj['MST_TRANSFORMATION'];
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    moveRiskFactorToRight(obj, index) {
        this.dataListTempNext.push(obj);
        this.dataListTemp.splice(index, 1);
        this.dataLeft = [];
        this.dataRight = [];
    }
    moveRiskFactorToLeft(obj, index) {
        this.dataListTemp.push(obj);
        this.dataListTempNext.splice(index, 1);
        this.dataLeft = [];
        this.dataRight = [];
    }
    dataLeft = [];
    dataRight = [];
    moveRiskFactorsToRight(type) {
        if (type == 'ALL') {
            this.dataListTempNext = this.dataListTempNext.concat(this.dataListTemp);
            this.dataListTemp = [];
        } else {
            this.dataListTempNext = this.dataListTempNext.concat(this.dataLeft);
            const idIndex = this.columnList.indexOf('SHOCK_RULE_KEY_ID');

            let listTemp = this.riskFactorList.map(e => e.id + '');
            listTemp = listTemp.concat(this.dataListTempNext).map(e => e[idIndex] + '');

            this.dataListTemp = this.dataListTemp.filter(e => listTemp.indexOf(e[idIndex] + '') == -1);
        }
        this.dataLeft = [];
        this.dataRight = [];
    }

    moveRiskFactorsToLeft(type) {
        if (type == 'ALL') {
            this.dataListTemp = this.dataListTemp.concat(this.dataListTempNext);
            this.dataListTempNext = [];
        } else {
            this.dataListTemp = this.dataListTemp.concat(this.dataRight);
            const idIndex = this.columnList.indexOf('SHOCK_RULE_KEY_ID');

            let listTemp = this.riskFactorList.map(e => e.id + '');
            listTemp = listTemp.concat(this.dataListTemp).map(e => e[idIndex] + '');

            this.dataListTempNext = this.dataListTempNext.filter(e => listTemp.indexOf(e[idIndex] + '') == -1);
        }
        this.dataLeft = [];
        this.dataRight = [];
    }
    close() {
        this.modalService.dismissAll();
    }

    getValue(id, master) {
        let t = this.masterDataObj[master].filter(e => e.value == id);
        if (t && t.length > 0) {
            return t[0].label;
        } else {
            return null;
        }
    }

    getModelRiskFactorsData() {
        this.modelService.getModelRiskFactorsData(parseInt(this.modelObj.id)).subscribe(
            response => {
                this.columnNameList = response.COLUMNS;
                this.depRiskFactors = response.dependentList;
                this.indepRiskFactors = response.independentList;
                this.frequencyList = response.frequencyList;
                this.transformationList = response.transformationList;
                this.indepRiskFactorsForSelect = response.independentList;
                this.dataListTempNextForDep = response.savedDepRisfactorsData;
                this.dataListTempNextForInDep = response.savedInDepRisfactorsData;
                this.timeseriesData = response.riskFactorTimeSeriesData;
                this.depRiskFactors.forEach(element => {
                    this.addPreferredVariableListToRiskfactor(element);
                });
                this.setMetaData();
                if (this.indepRiskFactors.length >= 1 && this.depRiskFactors.length >= 1) {
                    this.minimumData = true;
                } else {
                    this.minimumData = false;
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    setMetaData() {
        if (this.dataListTempNextForDep) {
            for (let i = 0; i < this.dataListTempNextForDep.length; i++) {
                let metaDataList = {
                    ASSET_CLASS_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('ASSET_CLASS_ID')],
                    RISK_FACTOR_TYPE_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('RISK_FACTOR_TYPE_ID')],
                    COUNTRY_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('COUNTRY_ID')],
                    CURRENCY_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('CURRENCY_ID')],
                    MATURITY_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('MATURITY_ID')],
                    SECTOR_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('SECTOR_ID')],
                    RATING_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('RATING_ID')],
                    CURVE_FAMILY_ID: this.dataListTempNextForDep[i][this.columnNameList.indexOf('CURVE_FAMILY_ID')]
                };
                Object.assign(this.depRiskFactors[i], metaDataList);
            }
        }

        if (this.dataListTempNextForInDep) {
            for (let i = 0; i < this.dataListTempNextForInDep.length; i++) {
                let metaDataList = {
                    ASSET_CLASS_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('ASSET_CLASS_ID')],
                    RISK_FACTOR_TYPE_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('RISK_FACTOR_TYPE_ID')],
                    COUNTRY_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('COUNTRY_ID')],
                    CURRENCY_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('CURRENCY_ID')],
                    MATURITY_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('MATURITY_ID')],
                    SECTOR_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('SECTOR_ID')],
                    RATING_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('RATING_ID')],
                    CURVE_FAMILY_ID: this.dataListTempNextForInDep[i][this.columnNameList.indexOf('CURVE_FAMILY_ID')]
                };
                Object.assign(this.indepRiskFactors[i], metaDataList);
            }
        }
    }

    selectAllChangeDep(event) {
        if (event.target.checked) {
            this.checkedDepList = this.depRiskFactors.map(p => p.id);
            this.selectAllRFDep = true;
        } else {
            this.checkedDepList = [];
            this.selectAllRFDep = false;
        }
    }
    selectRFDep(event, id) {
        if (event.target.checked) {
            this.checkedDepList.push(id);
            if (this.checkedDepList.length == this.depRiskFactors.length) {
                this.selectAllRFDep = true;
            }
        } else {
            this.checkedDepList = this.checkedDepList.filter(element => {
                return element != id;
            });
            this.selectAllRFDep = false;
        }
    }
    selectAllChangeInDep(event) {
        if (event.target.checked) {
            this.checkedInDepList = this.indepRiskFactors.map(p => p.id);
            this.selectAllRFInDep = true;
        } else {
            this.checkedInDepList = [];
            this.selectAllRFInDep = false;
        }
    }
    selectRFInDep(event, id) {
        if (event.target.checked) {
            this.checkedInDepList.push(id);
            if (this.checkedInDepList.length == this.indepRiskFactors.length) {
                this.selectAllRFInDep = true;
            }
        } else {
            this.checkedInDepList = this.checkedInDepList.filter(element => {
                return element != id;
            });
            this.selectAllRFInDep = false;
        }
    }

    addPreferredVariableListToRiskfactor(riskfactor) {
        riskfactor['preferredVariableListForSelect'] = this.indepRiskFactorsForSelect;
        riskfactor['nonPreferredVariableListForSelect'] = this.indepRiskFactorsForSelect;
    }

    changePreferredAndNonPreferred(riskfactor, type) {
        let cyclicVariables = riskfactor.npvShockRuleKeys;
        let filData = this.filterData(cyclicVariables, this.indepRiskFactorsForSelect);
        if (type == 'PREFERRED') {
            let variables = riskfactor.preferredVaribles;
            riskfactor['nonPreferredVariableListForSelect'] = filData.filter(rf => variables.indexOf(rf.shockRuleKeyId) == -1);
        } else {
            let variables = riskfactor.nonPreferredVaribles;
            riskfactor['preferredVariableListForSelect'] = filData.filter(rf => variables.indexOf(rf.shockRuleKeyId) == -1);
        }
    }

    filterData(cyclicVariables, filData) {
        let newFilData = filData;
        cyclicVariables.forEach(element => {
            newFilData = newFilData.filter(rf => rf.shockRuleKeyId != element);
        });
        return newFilData;
    }

    deleteModelRiskFactor(id) {
        this.modelService.deleteModelRiskFactor(id).subscribe(
            response => {
                this.showSuccessValidations(true, 'Selected RiskFactor deleted successfully');
                this.modalService.dismissAll();
                const rfIds = this.selectedListToDelete['rfIds'];
                const srkIds = this.selectedListToDelete['srkIds'];
                if (this.type == 'INDEPENDENT') {
                    this.indepRiskFactors = this.indepRiskFactors.filter(p => rfIds.indexOf(p.id) == -1);
                    this.dataListTempNextForInDep = this.dataListTempNextForInDep.filter(p => srkIds.indexOf(p[0]) == -1);
                } else {
                    this.depRiskFactors = this.depRiskFactors.filter(p => rfIds.indexOf(p.id) == -1);
                    this.dataListTempNextForDep = this.dataListTempNextForDep.filter(p => srkIds.indexOf(p[0]) == -1);
                }
                // this.getModelRiskFactorsData();
                let variableList = [];
                if (this.indepRiskFactors) {
                    this.depRiskFactors.forEach(riskfactor => {
                        riskfactor['preferredVariableListForSelect'].forEach(element => {
                            variableList = this.indepRiskFactors.filter(rf => rf != element.shockRuleKeyId);
                        });
                        riskfactor['preferredVariableListForSelect'] = variableList;
                        riskfactor['nonPreferredVariableListForSelect'].forEach(element => {
                            variableList = this.indepRiskFactors.filter(rf => rf != element.shockRuleKeyId);
                        });
                        riskfactor['nonPreferredVariableListForSelect'] = variableList;
                        const preVariables = riskfactor.preferredVaribles.filter(rf => srkIds.indexOf(rf) == -1);
                        const nonPreVariables = riskfactor.nonPreferredVaribles.filter(rf => srkIds.indexOf(rf) == -1);

                        riskfactor['preferredVaribles'] = preVariables;
                        riskfactor['nonPreferredVaribles'] = nonPreVariables;
                    });
                }

                this.selectAllRFInDep = false;
                this.selectAllRFDep = false;
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    deleteRiskFactors() {
        let rfList = [];
        if (this.type == 'INDEPENDENT') {
            rfList = this.indepRiskFactors.filter(p => this.checkedInDepList.indexOf(p.id) != -1);
            // this.indepRiskFactors = rfList;
            if (this.indepRiskFactors.length == 1) {
                this.modalService.dismissAll();
                this.showErrorValidations(true, 'Model should contain atleast one dependent and one independent risk factor.');
                return false;
            }
            const checkedInDepList = this.checkedInDepList;
            checkedInDepList.forEach(element1 => {
                this.depRiskFactors.forEach((element, index) => {
                    if (element.nonPreferredVaribles) {
                        const npv = element.nonPreferredVaribles.filter(obj => {
                            return obj != element1;
                        });
                        this.depRiskFactors[index].nonPreferredVaribles = npv;
                    }
                    if (element.preferredVaribles) {
                        const pv = element.preferredVaribles.filter(obj => {
                            return obj != element1;
                        });
                        this.depRiskFactors[index].preferredVaribles = pv;
                    }
                });
                this.indepRiskFactors = this.indepRiskFactors.filter(obj => {
                    return obj.shockRuleKeyId != element1;
                });
            });
        } else {
            rfList = this.depRiskFactors.filter(p => this.checkedDepList.indexOf(p.id) != -1);
            // this.depRiskFactors = rfList;
            if (this.depRiskFactors.length == 1) {
                this.modalService.dismissAll();
                this.showErrorValidations(true, 'Model should contain atleast one dependent and one independent risk factor.');
                return false;
            }
        }
        this.selectedListToDelete['srkIds'] = rfList.map(e => e['shockRuleKeyId']);
        this.selectedListToDelete['rfIds'] = rfList.map(e => e['id']);
        this.selectedListToDelete['modelId'] = this.modelObj.id;
        this.selectedListToDelete['type'] = this.type;
        this.deleteModelRiskFactor(this.selectedListToDelete);
    }

    updateModelRiskFactorsData(path) {
        if (!this.validate(this.modelObj)) {
            return false;
        }
        if (this.depRiskFactors.length < 1 || this.indepRiskFactors.length < 1) {
            this.showErrorValidations(true, 'Model should contain atleast one dependent and one independent risk factor.');
            return false;
        }
        const depRiskFactors = Object.assign({}, this.depRiskFactors);
        const indepRiskFactors = Object.assign({}, this.indepRiskFactors);

        const depRiskFactorsArray = Object.keys(depRiskFactors).map(i => depRiskFactors[i]);
        const indepRiskFactorsArray = Object.keys(indepRiskFactors).map(i => indepRiskFactors[i]);

        const finalyArray = depRiskFactorsArray.concat(indepRiskFactorsArray);

        this.modelService.updateModelRiskFactorsData(finalyArray).subscribe(
            response => {
                this.navigate = true;
                this.saveModelConfigData(path);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    getQualityCheck() {
        if (!this.modelObj.startDate) {
            this.showErrorValidations(true, 'Please Select Start Date.');
            return false;
        } else if (!this.modelObj.endDate) {
            this.showErrorValidations(true, 'Please Select End Date.');
            return false;
        } else if (!this.modelObj.returnHorizon || 'null' == this.modelObj.returnHorizon) {
            this.showErrorValidations(true, 'Please Select Return Horizon.');
            return false;
        } else if (!this.modelObj.overlapping || 'null' == this.modelObj.overlapping) {
            this.showErrorValidations(true, 'Please Select Overlapping.');
            return false;
        }
        if (!this.validateTransformation(this.depRiskFactors)) {
            this.showErrorValidations(true, 'Please Select Transformation in Dependent RiskFactors.');
            return false;
        }
        if (!this.validateTransformation(this.indepRiskFactors)) {
            this.showErrorValidations(true, 'Please Select Transformation in Independent RiskFactors.');
            return false;
        }
        let idsArr = [];
        $('.independentrfs').each(function(index, element) {
            const id = $(element).attr('id');
            idsArr.push(id);
        });
        const depRiskFactors = Object.assign({}, this.depRiskFactors);
        const indepRiskFactors = Object.assign({}, this.indepRiskFactors);

        const depRiskFactorsArray = Object.keys(depRiskFactors).map(i => depRiskFactors[i]);
        const indepRiskFactorsArray = Object.keys(indepRiskFactors).map(i => indepRiskFactors[i]);
        idsArr.forEach((element, index) => {
            const ids = element.split('~');
            const srkId = indepRiskFactorsArray.filter(obj => {
                return obj.shockRuleKeyName == ids[1];
            });
            const newId = ids[0];
            let pv = [];
            if (depRiskFactorsArray[newId].preferredVariblesDup) {
                pv = depRiskFactorsArray[newId].preferredVariblesDup;
            }
            pv.push(srkId[0].shockRuleKeyId);
            depRiskFactorsArray[newId].preferredVariblesDup = pv;
        });
        let finalyArray = depRiskFactorsArray.concat(indepRiskFactorsArray);
        const ids = finalyArray.map(element => {
            return {
                shockRuleKeyId: element.shockRuleKeyId,
                transformationId: element.transformationId,
                type: element.type,
                id: element.id
            };
        });
        let obj = {
            riskFactors: JSON.stringify(ids),
            modelId: finalyArray.map(r => r.modelId)[0],
            startDate: this.datePipe.transform(this.modelObj.startDate, 'dd/MM/yyyy'),
            endDate: this.datePipe.transform(this.modelObj.endDate, 'dd/MM/yyyy'),
            returnHorizon: this.modelObj.returnHorizon,
            overlapping: this.modelObj.overlapping
        };

        this.modelService.getQualityCheck(obj).subscribe(
            response => {
                this.setMetaData();
                if (response.dependentList && response.dependentList.length > 0) {
                    response.dependentList.forEach(element => {
                        const item = this.depRiskFactors.filter(e => e.id == element.id)[0];

                        item.dataQuality = element.dataQuality;
                        item.stationaryResults = element.stationaryResults;
                    });
                    if (response.independentList && response.independentList.length > 0) {
                        response.independentList.forEach(element => {
                            const item = this.indepRiskFactors.filter(e => e.id == element.id)[0];
                            item.dataQuality = element.dataQuality;
                            item.stationaryResults = element.stationaryResults;
                        });
                    }
                    if (
                        response.dependentList.length != this.depRiskFactors.length ||
                        response.independentList.length != this.indepRiskFactors.length
                    ) {
                        this.showSuccessValidations(
                            true,
                            'Data quality not calculated for some of the risk factors as library data not available.'
                        );
                    }
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    validateTransformation(records) {
        let isValid = true;
        for (let i = 0; i < records.length; i++) {
            if (records[i].transformationId == null || records[i].transformationId === '') {
                isValid = false;
            }
        }
        return isValid;
    }
    getChart() {
        let riskFactorList = [];
        this.depRiskFactors.forEach(element => {
            riskFactorList.push({ value: element['shockRuleKeyId'], label: element['shockRuleKeyName'] });
        });
        this.indepRiskFactors.forEach(element => {
            riskFactorList.push({ value: element['shockRuleKeyId'], label: element['shockRuleKeyName'] });
        });

        let dto = {
            analysisTypeId: ANALYSIS_TYPE_RATE_CORRELATION,
            analysisType: 'T',
            riskfactorList: riskFactorList,
            startDate: this.modelObj.startDate,
            endDate: this.modelObj.endDate,
            riskFactorSelection: 'T',
            levelOrReturns: 'LEVEL'
        };

        this.modelService.getCorrelationChart(dto).subscribe(
            response => {
                let data = response[0];
                this.renderPlotlyChart(data);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    renderPlotlyChart(dataObj) {
        const element = document.getElementById('chart');
        let timeSeriesData = dataObj['TIME_SERIES_DATA'];
        let shockData = dataObj['SHOCK_DATA'];
        let shocks = Object.keys(shockData);

        let data = [];
        shocks.forEach(shock => {
            data.push(shockData[shock]);
        });

        this.plotHEATMAP(element, dataObj['SHOCK_DATA_MATRIX'], shocks);
    }

    plotHEATMAP(element, dataObj, shockNameList) {
        let maxRow = dataObj.map(function(row) {
            return Math.max.apply(Math, row);
        });
        let minRow = dataObj.map(function(row) {
            return Math.min.apply(Math, row);
        });

        let max = Math.max.apply(null, maxRow);
        let min = Math.min.apply(null, minRow);

        let data = [
            {
                x: shockNameList,
                y: shockNameList,
                z: dataObj,
                xgap: 1,
                ygap: 1,
                colorscale: 'Portland',
                reversescale: false,
                type: 'heatmap',
                zmax: 1,
                zmin: -1,
                hovertemplate: '%{x}<br>%{y}<br>Value: %{z}<extra></extra>'
            }
        ];
        const layout = {
            autosize: false,
            font: { family: 'roboto' },
            width: 1000,
            height: 500,
            margin: {
                l: 100,
                r: 100,
                b: 100,
                t: 100
            },
            title: 'Correlation Plot',
            xaxis: { showgrid: false, zeroline: false, showticklabels: false, ticks: '' },
            yaxis: { showgrid: false, zeroline: false, showticklabels: false, ticks: '', autorange: 'reversed' },
            annotations: []
        };
        for (var i = 0; i < shockNameList.length; i++) {
            for (var j = 0; j < shockNameList.length; j++) {
                var currentValue = dataObj[i][j];
                if (currentValue != 0.0) {
                    var textColor = 'white';
                } else {
                    var textColor = 'black';
                }
                var result = {
                    x: shockNameList[i],
                    y: shockNameList[j],
                    text: this.roundedValue(dataObj[i][j], 2),
                    font: {
                        family: 'Arial',
                        size: 12,
                        color: textColor
                    },
                    showarrow: false
                };
                layout.annotations.push(result);
            }
        }
        Plotly.newPlot(element, data, layout, this.options, { responsive: true });
    }
    roundedValue(value: any, decimals: number) {
        if (!isNaN(value)) {
            return Math.round(value * 100) / 100;
        }
        return '';
    }

    download() {
        const id = document.getElementById('chart');
        $(id)
            .find('a[data-title="Download plot as a png"]')[0]
            .click();
    }

    download1() {
        const element = document.getElementById('chart');
        Plotly.toImage(element, { height: 500, width: 900 }).then(function(url) {
            const link = document.createElement('a');
            link.download = 'Correlation Matrix';
            link.href = url;
            link.click();
        });
    }

    getShockRuleName(shockRuleKeyId) {
        const filt = this.indepRiskFactors.filter(item1 => item1.shockRuleKeyId == shockRuleKeyId)[0];
        if (filt != undefined) {
            return filt.shockRuleKeyName;
        }
    }
    getSparkLineForRiskfactor(rfId, rfName) {
        let obj = {
            riskfactorIdList: [parseInt(rfId)],
            startDate: this.modelObj.startDate,
            endDate: this.modelObj.endDate
        };

        this.modelService.getTimeSeriesData(obj).subscribe(
            response => {
                this.modalService.open(this.timeSeriesplotly, { size: 'lg', windowClass: 'custom-modal-class' });

                setTimeout(() => {
                    let element = document.getElementById('timeseriesChart');
                    this.plotTimeseries(element, response, rfName);
                }, 100);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    plotTimeseries(element, timeSeriesData, rfName) {
        let x = [];
        let text = [];
        let y = [];
        let i = 0;

        Object.keys(timeSeriesData).forEach(key => {
            x.push(key);
            y.push(timeSeriesData[key]);
            text.push(key + ',' + timeSeriesData[key]);
        });

        let data = [
            {
                x: x,
                y: y,
                hoverinfo: 'text',
                line: {
                    color: 'rgba(76, 17, 48, 1)',
                    width: 1
                },
                name: rfName,
                text: text,
                type: 'scatter'
            }
        ];

        var layout = {
            autosize: true,
            font: { family: 'roboto' },
            height: 400,
            hovermode: 'closest',
            margin: {
                l: 50,
                r: 20,
                b: 50,
                t: 50,
                pad: 10
            },
            showlegend: false,
            title: rfName,
            xaxis: {
                rangeslider: true,
                showline: true,
                tickmode: 'auto',
                type: 'date'
            },
            yaxis: {
                showline: true
            }
        };

        Plotly.newPlot(element, data, layout, { responsive: true });
    }

    renderSparkLine(elementId, id) {
        let element = document.getElementById(elementId);
        let data = this.timeseriesData[id];
        this.plotSparkLine(element, data);
    }

    plotSparkLine(element, timeSeriesData) {
        let x = [];
        let text = [];
        let y = [];
        let i = 0;
        Object.keys(timeSeriesData).forEach(key => {
            x.push(i++);
            y.push(timeSeriesData[key]);
            text.push(key + ',' + timeSeriesData[key]);
        });

        let data = [
            {
                x: x,
                y: y,
                hoverinfo: 'skip',
                line: {
                    color: '#5f79a1',
                    width: 1
                },
                text: text,
                type: 'scatter'
            }
        ];

        var layout = {
            font: { family: 'roboto' },
            width: '100',
            xaxis: {
                type: 'linear',
                ticks: '',
                anchor: 'y',
                domain: [0, 1],
                mirror: false,
                showgrid: false,
                showline: false,
                zeroline: false,
                autorange: true,
                showticklabels: false
            },
            yaxis: {
                type: 'linear',
                ticks: '',
                anchor: 'x',
                mirror: false,
                showgrid: false,
                showline: false,
                zeroline: false,
                autorange: true,
                showticklabels: false
            },
            height: 44,
            margin: {
                l: 10,
                r: 10,
                b: 10,
                t: 10
            },
            autosize: false,
            hovermode: 'closest',
            showlegend: false
        };
        Plotly.newPlot(element, data, layout, { responsive: true });
    }
    downloadTimeSeriesData() {
        let obj = {
            startDate: this.datePipe.transform(this.modelObj.startDate, 'dd/MM/yyyy'),
            endDate: this.datePipe.transform(this.modelObj.endDate, 'dd/MM/yyyy'),
            modelId: this.modelObj.id
        };
        if (this.depRiskFactors.length > 0 || this.indepRiskFactors.length > 0) {
            this.downloadType = 'Downloading';
            this.modelService.downloadTimeSeriesData(obj).subscribe(
                response => {
                    this.downloadType = 'Downloaded';
                    let blob = new Blob([response]);
                    let fileName = 'MarketData.zip';
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, fileName);
                    } else {
                        var objectUrl = window.URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = objectUrl;
                        a.download = fileName;
                        a.target = '_blank';
                        a.click();
                        a.remove();
                    }
                },
                response => {
                    this.showErrorValidations(true, 'TimeSeries data not found for selected Risk Factors.');
                }
            );
        } else {
            this.showErrorValidations(true, 'No riskfactors to dowlonad the Market Data');
        }
    }

    validateStationary(stationaryResults) {
        if (stationaryResults && stationaryResults.toLowerCase().indexOf('non') > -1) {
            return true;
        } else {
            return false;
        }
    }

    validatedataQuality(dataQuality) {
        if (dataQuality) {
            const missingVal = dataQuality
                .split('|')[0]
                .split('%')
                .join('');
            if (parseFloat(missingVal) > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    getFrequencyValue(dataFrequencyId) {
        return this.frequencyList.filter(p => p.value == dataFrequencyId)[0].label;
    }

    changeScroll(obj) {
        if (obj.target.offsetHeight + obj.target.scrollTop >= obj.target.scrollHeight && this.scrollEnable) {
            this.isScrolled = true;
            this.loadDataForAppliedFilter();
        }
    }

    loadMetaDataByAppliedFilter(filtersData) {
        this.createFilter = filtersData.createFilter;
        this.loadDataForAppliedFilter();
    }
    clearMetaData() {
        this.dataListTemp = [];
    }
    showFilterComponentMessage(val) {
        this.showErrorValidations(true, val);
    }

    loadDataForAppliedFilter() {
        let listTemp = this.riskFactorList.map(e => e.id + '');
        listTemp = listTemp.concat(this.dataListTempNext).map(e => e[0] + '');
        if (!this.isScrolled) {
            this.startLimit = 0;
        }
        let obj = {
            selectedRiskFactorIds: listTemp || [],
            createFilter: this.createFilter,
            modelId: this.modelObj.id,
            type: this.riskfactorType,
            startLimit: this.startLimit,
            endLimit: this.endLimit
        };

        this.modelService.getRiskFactorsData(obj).subscribe(
            response => {
                this.columnList = response['COLUMNS'];
                const data = response['DATA'];
                if (this.isScrolled) {
                    this.dataListTemp = this.dataListTemp.concat(data);
                } else {
                    this.dataListTemp = data;
                }
                this.isScrolled = false;
                if (data.length == 100) {
                    this.startLimit = this.startLimit + 100;
                    this.scrollEnable = true;
                } else {
                    this.scrollEnable = false;
                }
            },
            res => {
                this.showErrorValidations(true, res.error);
            }
        );
    }
}
