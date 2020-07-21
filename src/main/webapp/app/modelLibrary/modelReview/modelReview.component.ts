import { Component, OnInit, ElementRef, ViewChild, Inject, Renderer2 } from '@angular/core';
import { ModelService } from '../model.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDateMomentAdapter } from 'app/shared';
import { JhiAlertService } from 'ng-jhipster';
import {
    ALERT_MSG_TIME_OUT,
    MODEL_LIB_RISK_FACTOR_TYPE_DEPENDENT,
    MODEL_METHODOLOGY_TYPE_CHALLENGER,
    MODEL_METHODOLOGY_TYPE_CHAMPION,
    MODEL_GRAPH_INDEX_VS_NAME_MAP,
    MODEL_GRAPH_TITLE_MAP,
    ASSUMPTION_TESTING_TABLE,
    BACKTESTING_TESTING,
    BACKTESTING_TRAINING,
    IN_SAMPLE_FIT,
    PERFORMANCE_STABILITY_TESTING,
    PERFORMANCE_STABILITY_TRAINING,
    COEFFICIENT_STABILITY,
    ASSUMPTION_TESTING,
    MODEL_CONFIG,
    MODEL_ERR_TEXT,
    MODEL_APPROVED,
    BACKTESTING_TRAINING_TITLE,
    BACKTESTING_TESTING_TITLE,
    IN_SAMPLE_FIT_TITLE,
    PERFORMANCE_STABILITY_TRAINING_TITLE,
    PERFORMANCE_STABILITY_TESTING_TITLE,
    PERFORMANCE_STABILITY,
    COEFFICIENT_STABILITY_TITLE
} from 'app/constants';
import { NgbModal, NgbCalendar, NgbDatepickerConfig, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { DOCUMENT } from '@angular/platform-browser';
declare var Plotly: any;
const percentile = require('percentile');

@Component({
    selector: 'model-review',
    templateUrl: './modelReview.component.html',
    styleUrls: []
})
export class ModelReviewComponent implements OnInit {
    account: Account;
    modelObj = {
        id: null,
        startDate: null,
        endDate: null,
        returnHorizon: null,
        status: null,
        modelMethodologyConfigDTOList: [],
        lastModifiedDate: null,
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
    frequencyList = [];
    methodologyList = [];
    dependentRiskFactorList = [];
    selectedFactor = null;
    riskFactorModelList = [];
    riskFactorModelDataList = [];
    headerList = [];
    records = [];
    columns = [];
    readMore = false;
    actionButton = null;
    userCanAccess = false;
    roleModelsList = [];
    roleModelsListOrg = [];
    commentsList = [];
    commentStatus = false;
    comment: any;
    j: any;
    designerCanAccess = false;
    validate = true;
    isSentForReview = false;
    modelGraphName;
    overlappingList = [{ value: 'TRUE', label: 'TRUE' }, { value: 'FALSE', label: 'FALSE' }];
    modelConfigEleList = [{ value: 'TRUE', label: 'TRUE' }, { value: 'FALSE', label: 'FALSE' }];
    TypeList = [{ value: null, label: 'Select' }, { value: 'CHALLENGER', label: 'CHALLENGER' }, { value: 'CHAMPION', label: 'CHAMPION' }];
    @ViewChild('metdlgyConfgMdl')
    metdlgyConfgMdl: ElementRef;
    @ViewChild('graphModel')
    graphModel: ElementRef;
    @ViewChild('designerworkflowmodal')
    designerworkflowmodal: ElementRef;
    @ViewChild('reBuildModel')
    reBuildModel: ElementRef;
    selectedRiskfactorList = [];
    riskfactorDataMap = {};
    selectRiskfactor = null;

    options = {
        scrollZoom: true,
        modeBarButtonsToRemove: [
            'zoom2d',
            'pan',
            'pan2d',
            'autoScale2d',
            'hoverClosestCartesian',
            'hoverClosest3d',
            'hoverCompareCartesian',
            'toggleSpikelines'
        ]
    };
    isddChanged = false;
    rfList = [];
    reviewHeaderList = null;
    dupModelObj;
    isExit = false;
    riskFactorColorPallete = ['#FF0000', '#0000FF'];
    constructor(
        private modelService: ModelService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal,
        private alertService: JhiAlertService,
        private renderer: Renderer2,
        private momentAdapter: NgbDateMomentAdapter,
        config: NgbDatepickerConfig,
        calendar: NgbCalendar,
        @Inject(DOCUMENT) private document
    ) {
        this.modelObj.id = this.activatedRoute.snapshot.params.id;
        config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) > 5;
    }

    ngOnInit() {
        this.modelObj.id = this.activatedRoute.snapshot.params.id;
        this.getWorkflowUsers(this.modelObj.id);
        if (this.modelObj.id && 'null' != this.modelObj.id) {
            this.modelService.getModelData(parseInt(this.modelObj.id)).subscribe(
                response => {
                    this.modelObj = response;
                    this.getModelMasterData();
                    this.getModelRiskFactorsData();
                    this.getMethodologyMasterData(this.modelObj.id);
                    this.getCommentsList();
                    if (this.modelObj.status == MODEL_CONFIG) {
                        this.buildModel('');
                    }
                    if (this.modelObj.status != MODEL_APPROVED) {
                        this.getActions(this.modelObj.id);
                        this.taskAssigned(this.modelObj.id);
                    }
                    let dateStruct: NgbDateStruct;
                    let date = new Date(this.modelObj.startDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.modelObj.startDate = this.momentAdapter.toModel(dateStruct);

                    date = new Date(this.modelObj.endDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.modelObj.endDate = this.momentAdapter.toModel(dateStruct);

                    const objminDate = new Date(this.modelObj.minDate);
                    this.minDate = { year: objminDate.getFullYear(), month: objminDate.getMonth() + 1, day: objminDate.getDate() };
                    const objmaxDate = new Date(this.modelObj.maxDate);
                    this.maxDate = { year: objmaxDate.getFullYear(), month: objmaxDate.getMonth() + 1, day: objmaxDate.getDate() };
                    /* this.originalModelObj = JSON.parse(JSON.stringify(this.modelObj)); */
                    this.dupModelObj = Object.assign({}, this.modelObj);
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    getModelMasterData() {
        this.modelService.getModelConfigureMasterData().subscribe(
            response => {
                this.frequencyList = response['FREQUENCY_DATA'];
                this.methodologyList = response['MST_METHDLGY'];
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.modelObj.id }], { skipLocationChange: true });
    }

    cancel() {
        this.router.navigate(['model'], { skipLocationChange: true });
    }

    openMetdlgyConfgMdl() {
        this.modalService.open(this.metdlgyConfgMdl, { size: 'lg', windowClass: 'custom-modal-class' });
    }
    getMethodologyMasterData(modelId) {
        this.modelService.getMethodologyMasterData(modelId).subscribe(
            response => {
                this.headerList = [];
                this.records = [];
                this.columns = [];

                this.headerList = response['HEADERS'];
                this.columns = response['COLUMNS'];
                this.records = response['RECORDS'];
            },
            responseError => {
                this.showErrorValidations(true, responseError.error);
            }
        );
    }
    getModelRiskFactorsData() {
        this.modelService.getModelReviewRiskFactors({ MODEL_ID: this.modelObj.id, TYPE: MODEL_LIB_RISK_FACTOR_TYPE_DEPENDENT }).subscribe(
            response => {
                this.dependentRiskFactorList = response;
                this.openTabs();
                /* if (this.dependentRiskFactorList && this.dependentRiskFactorList.length > 0) {
                    this.getRFModelLibraryData(this.dependentRiskFactorList[0]);
                } */
            },
            responseError => {
                this.showErrorValidations(true, responseError.error);
            }
        );
    }

    openTabs() {
        this.modelService.getOpenTabsData({ modelId: this.modelObj.id }).subscribe(
            response => {
                if (response != null) {
                    this.rfList = response;
                    this.selectRiskfactor = this.rfList[0];
                    this.getRFModelLibraryData();
                    this.rfList.splice(0, 1);
                }
            },
            responseError => {
                this.showErrorValidations(true, responseError.error);
            }
        );
    }

    addRiskfactor(element) {
        if (this.validateTabChanges()) {
            this.selectRiskfactor = null;
            this.modalService.open(element, { size: 'lg' });
        }
    }

    conditionCheck(value) {
        let temp = this.selectedRiskfactorList.filter(p => p.value == value + '');
        if (temp && temp.length > 0) {
            return false;
        }
        return true;
    }

    removeRiskfactor(factorValue, index) {
        if (factorValue == this.selectedFactor.value) {
            if (index == 0) {
                index = 1;
            } else {
                index = index - 1;
            }
        }

        this.selectedRiskfactorList = this.selectedRiskfactorList.filter(p => p.value != factorValue);
        if (this.selectedRiskfactorList && this.selectedRiskfactorList.length > 0) {
            this.getDataOnTabClick(this.selectedRiskfactorList[index]);
        } else {
            this.riskFactorModelDataList = [];
            this.riskFactorModelList = [];
            this.riskfactorDataMap = {};
            this.selectRiskfactor = null;
        }
    }

    getDataOnTabClick(factor) {
        if ((!this.selectedFactor || factor.value != this.selectedFactor.value) && this.validateTabChanges()) {
            this.selectedFactor = factor;
            let response = this.riskfactorDataMap[factor.value];

            this.riskFactorModelDataList = response['DATA_LIST'];
            this.riskFactorModelList = response['METHOD_LIST'];
            this.reviewHeaderList = this.riskFactorModelDataList[0];
            this.readMore = false;
        }
    }

    getRFModelLibraryData() {
        if (this.selectRiskfactor) {
            this.modelService.getRFModelLibraryData({ MODEL_ID: this.modelObj.id, RF_ID: this.selectRiskfactor }).subscribe(
                response => {
                    if (response && Object.keys(response).length > 0) {
                        this.riskFactorModelDataList = response['DATA_LIST'];
                        this.riskFactorModelList = response['METHOD_LIST'];
                        this.readMore = false;
                        this.selectedFactor = this.dependentRiskFactorList.filter(p => p.value + '' == this.selectRiskfactor)[0];
                        this.selectedRiskfactorList.push(this.selectedFactor);
                        this.riskfactorDataMap[this.selectedFactor.value] = response;
                        this.reviewHeaderList = this.riskFactorModelDataList[0];
                    }
                    if (this.rfList.length > 0) {
                        this.selectRiskfactor = this.rfList[0];
                        this.getRFModelLibraryData();
                        this.rfList.splice(0, 1);
                    }
                },
                responseError => {
                    this.showErrorValidations(true, responseError.error);
                }
            );
            this.modalService.dismissAll();
        }
    }

    getIndex(list, type) {
        return list.findIndex(x => x['name'] == type);
    }

    getTitleForGraphOrTable(list) {
        let title = list.filter(x => x['name'] == 'TESTS');
        if (title.length == 0) {
            title = list.filter(x => x['name'] == 'CRITERIA');
        }
        return title[0].value;
    }

    containsStr(value: string, subStr: string) {
        if (value) {
            return value.indexOf(subStr) == -1 ? 'N' : 'Y';
        }
        return '';
    }

    notContains(value: string) {
        if (value) {
            return value.indexOf('@@Y') == -1 && value.indexOf('@@N') == -1 ? 'Y' : 'N';
        }
        return 'N';
    }

    splitStr(value: string) {
        if (value) {
            return value.split('@@')[0];
        }
        return value;
    }

    buildModel(path) {
        this.selectedRiskfactorList = [];
        this.modelService.buildModel(this.modelObj.id).subscribe(
            response => {
                // this.getRFModelLibraryData();
                if (this.isExit && path == 'model') {
                    this.navigateTo(path);
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    saveModelConfigData(path) {
        let modelConfigList = [];
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
            this.modelObj.page = 'modelReview';
            const startDate = new Date(this.modelObj.startDate);
            const endDate = new Date(this.modelObj.endDate);
            this.modelObj.startDateStr = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
            this.modelObj.endDateStr = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
            this.modelService.saveModelConfigData(this.modelObj).subscribe(
                response => {
                    this.modelObj.lastModifiedDate = response['lastModifiedDate'];
                    this.modalService.dismissAll();
                    this.buildModel(path);
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

    closeMetdlgyConfgMdl() {
        this.modalService.dismissAll();
    }

    changeddType() {
        this.isddChanged = true;
    }

    validateTabChanges() {
        if (this.isddChanged) {
            this.showErrorValidations(true, 'Please save the current changes.');
            return false;
        } else {
            return true;
        }
    }

    saveModelReviewRFData(path) {
        if (this.selectedRiskfactorList.length == 0) {
            this.showErrorValidations(true, 'Atleast one riskfactor have to open.');
        }
        if (this.selectedFactor && this.riskFactorModelList && this.riskFactorModelList.length > 0) {
            let list = this.riskFactorModelList.filter(p => p['label'] != null && p['label'] != 'null');

            let listChallenger = list.filter(p => p['label'] != null && p['label'] != MODEL_METHODOLOGY_TYPE_CHAMPION);
            if (listChallenger && listChallenger.length > 1) {
                this.showErrorValidations(true, 'Please select one challenger model only.');
                return false;
            }
            let listChampion = list.filter(p => p['label'] != null && p['label'] != MODEL_METHODOLOGY_TYPE_CHALLENGER);
            if (!listChampion || listChampion.length != 1) {
                this.showErrorValidations(true, 'Please select one champion model.');
                return false;
            }
            list = listChampion.concat(listChallenger);
            const openTabs = this.selectedRiskfactorList.map(e => e.value + '');

            this.modelService
                .saveModelReviewRFData({
                    modelId: this.modelObj.id,
                    riskFactorId: this.selectedFactor.value,
                    lastModifiedDate: this.modelObj.lastModifiedDate,
                    methodologyMapping: list,
                    openTabs: openTabs
                })
                .subscribe(
                    response => {
                        this.modelObj.lastModifiedDate = response['lastModifiedDate'];
                        this.isddChanged = false;
                        if (path == '') {
                            this.showSuccessValidations(true, 'Changes saved successfully.');
                            return false;
                        }
                        this.navigateTo(path);
                    },
                    responseError => {
                        this.showErrorValidations(true, responseError.error);
                    }
                );
        }
    }

    /* getValue(id, master) {
        let t = master.filter(e => e.value == id)[0];
        if (t) {
            return t.label;
        } else {
            return null;
        }
    } */
    graphType = null;
    graphTitle = null;
    titleForPS;
    graphData = [];
    graphTypeAssumptionTable = ASSUMPTION_TESTING_TABLE;
    graphOrTable;
    getGraphOrTable(rowIndex, methdologyIndex, graphOrTable, list) {
        this.graphOrTable = graphOrTable;
        this.modelGraphName = this.getTitleForGraphOrTable(list);
        let methodology = this.riskFactorModelList[methdologyIndex]['value'];
        this.graphType = MODEL_GRAPH_INDEX_VS_NAME_MAP[rowIndex];
        this.graphTitle = MODEL_GRAPH_TITLE_MAP[rowIndex];
        if (this.graphTitle == BACKTESTING_TRAINING_TITLE || this.graphTitle == BACKTESTING_TESTING_TITLE) {
            let heading = this.graphTitle.split(' ');
            this.modelGraphName = heading[0];
        }
        if (this.graphTitle == IN_SAMPLE_FIT_TITLE) {
            this.modelGraphName = this.graphTitle;
        }
        if (this.graphTitle == PERFORMANCE_STABILITY_TRAINING_TITLE || this.graphTitle == PERFORMANCE_STABILITY_TESTING_TITLE) {
            this.modelGraphName = PERFORMANCE_STABILITY;
            this.titleForPS = this.graphTitle;
        }
        this.modelService
            .getRFModelLibraryGraphData({
                MODEL_ID: this.modelObj.id, //65,
                RF_ID: this.selectedFactor.value, //3207,
                METHODOLOGY: methodology,
                GRAPH_TYPE: this.graphType
            })
            .subscribe(
                response => {
                    if (response) {
                        if (response['failed'] == 'noData') {
                            const noDataMsg = this.modelGraphName + ' is not applicable for ' + methodology + ' methodology';
                            return this.showErrorValidations(true, noDataMsg);
                        }
                        this.modalService.open(this.graphModel, { size: 'lg', windowClass: 'custom-modal-class' });
                        if (this.graphType == ASSUMPTION_TESTING_TABLE) {
                            this.graphData = response['Data'];
                        } else if (
                            this.graphType == BACKTESTING_TESTING ||
                            this.graphType == BACKTESTING_TRAINING ||
                            this.graphType == IN_SAMPLE_FIT
                        ) {
                            let child = document.createElement('div');
                            child.setAttribute('class', 'col-md-12');
                            let element = document.getElementById('graphParent');
                            element.appendChild(child);

                            let data = response['Data'];
                            setTimeout(() => {
                                this.plotTimeseries(child, data, this.graphTitle, this.selectedFactor.label);
                            }, 10);
                        } else if (
                            this.graphType == PERFORMANCE_STABILITY_TRAINING ||
                            this.graphType == PERFORMANCE_STABILITY_TESTING ||
                            this.graphType == COEFFICIENT_STABILITY
                        ) {
                            let keys = Object.keys(response);

                            let divLength = 12;
                            if (keys.length == 1) {
                                divLength = 12;
                            } else if (keys.length % 2 == 0) {
                                divLength = 6;
                            } else {
                                divLength = 4;
                            }

                            keys.forEach(key => {
                                let child = document.createElement('div');
                                child.setAttribute('class', 'col-md-' + divLength);
                                let element = document.getElementById('graphParent');
                                element.appendChild(child);
                                setTimeout(() => {
                                    this.plotHistogram(child, response[key], key, this.graphTitle);
                                }, 10);
                            });
                        } else if (this.graphType == ASSUMPTION_TESTING) {
                            let hetroData = response['hetroData'];
                            let autoCorrelationData = response['autoCorrelationData'];
                            let partialAutoCorrelationData = response['partialAutoCorrelationData'];
                            let normalityData = response['normalityData'];
                            let normalityQQData = response['normalityQQData'];
                            let sortedNormalityData = response['sortedNormalityData'];

                            let divLength = 12;
                            if (hetroData && hetroData.length > 0 && normalityData && normalityData.length > 0) {
                                divLength = 6;
                            }

                            if (hetroData && hetroData.length > 0) {
                                let child = document.createElement('div');
                                child.setAttribute('class', 'col-md-' + divLength);
                                let element = document.getElementById('graphParent');
                                element.appendChild(child);
                                setTimeout(() => {
                                    this.plotScatter(child, hetroData);
                                }, 10);
                            }

                            if (normalityData && normalityData.length > 0) {
                                let child = document.createElement('div');
                                child.setAttribute('class', 'col-md-' + divLength);
                                let element = document.getElementById('graphParent');
                                element.appendChild(child);
                                setTimeout(() => {
                                    this.plotQQ(child, normalityData, normalityQQData, sortedNormalityData);
                                }, 10);
                            }

                            if (autoCorrelationData && autoCorrelationData.length > 0) {
                                let child = document.createElement('div');
                                child.setAttribute('class', 'col-md-6');
                                let element = document.getElementById('graphParent');
                                element.appendChild(child);
                                setTimeout(() => {
                                    this.plotACF(child, autoCorrelationData, 'ACF', 'Residual ACF Plot');

                                    child = document.createElement('div');
                                    child.setAttribute('class', 'col-md-6');
                                    element.appendChild(child);
                                    setTimeout(() => {
                                        this.plotACF(child, partialAutoCorrelationData, 'PACF', 'Residual PACF Plot');
                                    }, 10);
                                }, 10);
                            }
                        }
                    }
                },
                responseError => {
                    this.showErrorValidations(true, responseError.error);
                }
            );
    }

    plotScatter(element, dataObj) {
        let headers = dataObj[0];

        let dataTemp = {};

        for (let i = 1; i < dataObj.length; i++) {
            let listTemp = dataObj[i];
            for (let j = 1; j < listTemp.length; j++) {
                let header = headers[j];
                let list = dataTemp[header] || [];
                list.push(listTemp[j]);
                dataTemp[header] = list;
            }
        }

        let data = [
            {
                x: dataTemp[headers[0]],
                y: dataTemp[headers[1]],
                mode: 'markers',
                type: 'scatter'
            }
        ];

        const layout = {
            autosize: true,
            title: {
                text: 'Residual Heteroscedasticity',
                font: {
                    family: 'Georgia, serif',
                    size: 22
                }
            },
            font: { family: 'roboto' },
            margin: {
                r: 5
            },
            xaxis: {
                title: {
                    text: 'Residuals'
                }
            },
            yaxis: {
                title: {
                    text: 'Fitted Values'
                }
            }
        };

        Plotly.newPlot(element, data, layout, this.options, { responsive: true });
    }

    plotQQ(element, normalityData, normalityQQData, sortedNormalityData) {
        let data = [
            {
                name: '45° line',
                x: normalityQQData,
                y: normalityQQData,
                mode: 'line',
                type: 'scatter'
            },
            {
                name: 'plot',
                x: normalityQQData,
                y: normalityData,
                mode: 'markers',
                type: 'scatter'
            }
        ];

        const layout = {
            autosize: true,
            title: {
                text: 'QQ Plot of Residuals',
                font: {
                    family: 'Georgia, serif',
                    size: 22
                }
            },
            font: { family: 'Georgia, serif' },
            margin: {
                r: 5
            },
            xaxis: {
                title: {
                    text: 'Theoretical Quantiles'
                }
            },
            yaxis: {
                title: {
                    text: 'Sample Quantiles'
                }
            }
        };

        Plotly.newPlot(element, data, layout, this.options, { responsive: true });
    }

    plotACF(element, dataTemp, type, name) {
        let data = [];
        let count = 0;

        let dataObj = [];
        dataTemp.forEach(ele => {
            if (!isNaN(ele)) {
                count++;
            }
            dataObj.push(ele);
        });
        let significance_level = 1.95996398454005 / Math.sqrt(count);
        let x = [];
        let yLower = [];
        let yUpper = [];
        let i = 0;
        dataObj.forEach(ele => {
            x.push(i++);
            yUpper.push(significance_level);
            yLower.push(-significance_level);
        });

        data.push({
            x: x,
            y: dataObj,
            name: type,
            type: 'bar',
            uid: 'b343b354-af03-11e8-94c5-080027111896'
        });
        data.push({
            x: x,
            y: yUpper,
            name: 'Upper',
            type: 'scatter',
            uid: 'b343b355-af03-11e8-94c5-080027111896',
            line: {
                color: 'rgb(22, 96, 167)',
                dash: 'dash',
                width: 2
            }
        });
        data.push({
            x: x,
            y: yLower,
            name: 'Lower',
            type: 'scatter',
            uid: 'b343b356-af03-11e8-94c5-080027111896',
            line: {
                color: 'rgb(22, 96, 167)',
                dash: 'dash',
                width: 2
            }
        });

        const layout = {
            autosize: true,
            title: {
                text: name,
                font: {
                    family: 'Georgia, serif',
                    size: 22
                }
            },
            font: { family: 'roboto' },
            showlegend: false,
            plot_bgcolor: 'rgb(229,229,229)',
            bargap: 0.9,
            barmode: 'overlay',
            xaxis: { title: 'Lag' },
            yaxis: { title: 'Autocorrelation Coefficient' },
            margin: {
                r: 5
            }
        };

        Plotly.newPlot(element, data, layout, this.options, { responsive: true });
    }

    plotHistogram(element, dataObj, name, graphTitle) {
        let titleTemp;
        if (graphTitle == COEFFICIENT_STABILITY_TITLE) {
            titleTemp = 'Coefficient For' + '<br />' + name;
        } else {
            titleTemp = name;
        }
        let coefficient = dataObj[0];
        dataObj = dataObj.slice(1, dataObj.length);

        let coefficient97_5 = percentile(97.5, dataObj);
        let coefficient2_75 = percentile(2.75, dataObj);

        let data = [
            {
                x: dataObj,
                type: 'histogram',
                histnorm: 'probability',
                marker: {
                    color: '#c4c4c5'
                },
                name: 'Density'
            },
            {
                x: [coefficient2_75, coefficient2_75],
                marker: {
                    color: 'blue',
                    width: 1
                },
                mode: 'lines',
                type: 'scatter',
                name: '2.75Q'
            },
            {
                x: [coefficient, coefficient],
                marker: {
                    color: 'green',
                    width: 1
                },
                mode: 'lines',
                type: 'scatter',
                name: 'Original'
            },
            {
                x: [coefficient97_5, coefficient97_5],
                marker: {
                    color: 'red',
                    width: 1
                },
                mode: 'lines',
                type: 'scatter',
                name: '97.5Q'
            }
        ];

        const layout = {
            autosize: true,
            font: { family: 'roboto' },
            margin: {
                r: 5
            },

            xaxis: { title: titleTemp, zeroline: true },
            yaxis: { title: 'Density', zeroline: false }
        };

        Plotly.newPlot(element, data, layout, this.options, { responsive: true });
        let values = element.calcdata[0].map(p => p['y']);
        let maxVal = Math.max(...values);

        element.data[1]['y'] = [0, maxVal];
        element.data[2]['y'] = [0, maxVal];
        element.data[3]['y'] = [0, maxVal];
        Plotly.redraw(element);
    }

    plotTimeseries(element, graphData, graphTitle, selectedRfName) {
        let data = [];
        let timeSeriesData = [];
        let RFName = selectedRfName;
        if (graphTitle == IN_SAMPLE_FIT_TITLE) {
            graphData[0][1] = 'Actual ' + RFName;
            graphData[0][2] = 'Predicted ' + RFName;
        }
        let headers = graphData[0];

        let dataTemp = {};

        for (let i = 1; i < graphData.length; i++) {
            let listTemp = graphData[i];
            timeSeriesData.push(listTemp[0]);
            for (let j = 1; j < listTemp.length; j++) {
                let header = headers[j];
                let list = dataTemp[header] || [];
                list.push(listTemp[j]);
                dataTemp[header] = list;
            }
        }

        let keys = Object.keys(dataTemp);
        let i = 0;
        keys.forEach(key => {
            data.push({
                x: timeSeriesData,
                y: dataTemp[key],
                name: key,
                marker: {
                    color: this.riskFactorColorPallete[i++]
                }
            });
        });

        const layout = {
            autosize: true,
            font: { family: 'roboto' },
            title: {
                text: graphTitle + '-' + 'Actual vs Predicted',
                font: {
                    family: 'Georgia, serif',
                    size: 22
                }
            },
            margin: {
                r: 10,
                t: 40,
                b: 40
            },
            showlegend: true,
            xaxis: {
                rangeslider: true,
                title: 'Time',
                showline: true,
                tickmode: 'auto',
                type: 'date'
            },
            yaxis: {
                title: 'Actual vs Predicted of  ' + RFName
            }
        };

        Plotly.newPlot(element, data, layout, this.options, { responsive: true });
    }

    openDesignerModel() {
        this.validateModel();
    }
    getCommentsList() {
        this.modelService.getCommentsList(this.modelObj.id).subscribe(response => {
            this.commentsList = response;
            if (this.modelObj.status != MODEL_APPROVED) {
                this.modelService.checkAccess(this.modelObj.id).subscribe(res => {
                    this.designerCanAccess = res;
                });
            }
        });
    }
    getWorkflowUsers(id) {
        this.modelService.getRoleModel(id).subscribe(response => {
            this.roleModelsList = response['dataObjects'];
            this.roleModelsList.forEach(element => {
                for (let i = 0; i < element.ROLES.length; i++) {
                    element.ROLES[i].fullName = element.ROLES[i].firstName + ' ' + element.ROLES[i].lastName;
                }
            });

            this.roleModelsList.forEach(e => {
                this.roleModelsListOrg.push(e.ROLES);
            });
        });
    }
    getActions(id) {
        this.modelService.getAction(id).subscribe(response => {
            if (response) {
                this.actionButton = response[0];
            }
        });
    }
    taskAssigned(id) {
        this.modelService.taskAssigned(this.modelObj.id).subscribe(response => {
            this.userCanAccess = response;
        });
    }

    sendForApprove() {
        if (this.comment == null || this.comment == '') {
            this.showErrorValidations(true, 'Please provide a comment');
            return false;
        }
        const action = {
            modelId: this.modelObj.id,
            comments: this.comment
        };
        this.modelService.sendForApprove(action).subscribe(response => {
            this.modalService.dismissAll();
            this.alertService.success('Successfully Sent to Reviewer/Approver');
            this.getActions(this.modelObj.id);
            this.taskAssigned(this.modelObj.id);
            this.getCommentsList();
        });
    }
    save() {
        this.roleModelsList.forEach(element => {
            if ((element.name == 'reviewer1' && element.selected == null) || (element.name == 'approver1' && element.selected == null)) {
                this.showErrorValidations(true, 'Reviewer1 & Approver1 are mandatory fields');
                // this.validateMessage = 'Please Select Reviewer1';
                this.validate = false;
            }
        });
        if (this.comment == null || this.comment == '') {
            this.showErrorValidations(true, 'Please provide a comment');
            return false;
        }
        if (!this.validate) {
            return false;
        }
        this.modelService.saveRoles(this.roleModelsList).subscribe(response => {
            this.sendForApprove();
            this.modalService.dismissAll();
            this.showSuccessValidations(true, 'Successfully saved and sent to reviewer.');
        });
    }

    validateModel() {
        this.modelService.validateModel({ modelId: this.modelObj.id }).subscribe(response => {
            if (response.isValid == 1) {
                this.modalService.open(this.designerworkflowmodal, { size: 'lg', windowClass: 'custom-modal-class' });
                this.getCommentsList();
            } else {
                this.showErrorValidations(true, 'Please configure all the riskfactors data.');
                // this.modalService.dismissAll();
            }
        });
    }

    reject() {
        if (this.comment == null || this.comment == '') {
            this.showErrorValidations(true, 'Please provide a comment');
            return false;
        }
        const action = {
            modelId: this.modelObj.id,
            comments: this.comment
        };
        this.modelService.reject(action).subscribe(
            response => {
                this.getActions(this.modelObj.id);
                this.taskAssigned(this.modelObj.id);
                this.getCommentsList();
                this.modalService.dismissAll();
                this.alertService.success('Successfully sent to reviewer/approver');
            },
            response => {
                this.alertService.error('Failed to reject');
            }
        );
    }

    validateWorkflowUsers(obj, index) {
        const selected = this.roleModelsList.map(e => e.selected + '');
        let users = this.roleModelsListOrg[index];
        for (let i = 0; i < selected.length; i++) {
            if (i != index) {
                users = users.filter(p => p.username != selected[i]);
            }
        }
        this.roleModelsList[index].ROLES = users;
    }
    nameSplitJoin(name) {
        if (name != null && name != '') {
            const lastChar = name.substring(name.length - 1);
            const name1 = name.toUpperCase().split(lastChar);
            return name1[0] + ' ' + lastChar;
        } else {
            return name;
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
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    roundedToTwoDecimals(val) {
        if (val && !isNaN(val)) {
            return Math.round(val * 100) / 100;
        } else {
            return val;
        }
    }

    downloadExcel(idx) {
        const obj = new Object();
        obj['modelId'] = this.modelObj.id;
        obj['srkId'] = this.selectedFactor.value; //3276;
        const riskFactorModelDataList = this.riskFactorModelDataList[this.riskFactorModelDataList.length - 1];
        const methodologies = riskFactorModelDataList.filter(p => p.name == 'METHODS_DATA')[0].value;
        obj['medCode'] = this.methodologyList.filter(p => p.value == methodologies[idx])[0].code;
        obj['downloadFileName'] = this.selectedFactor.label + '_' + obj['medCode'] + '.xlsx';
        obj['fileName'] = 'A_' + this.selectedFactor.value + '_' + obj['medCode'] + '.xlsx';
        this.modelService.downloadExcelFile(obj).subscribe(
            response => {
                let blob = new Blob([response]);
                let fileName = obj['downloadFileName'];
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
                this.showErrorValidations(true, 'Model result doesnt exist for selected Methodology');
            }
        );
    }

    validateCellText(text) {
        const errText = MODEL_ERR_TEXT.split(',');
        let isErr = false;
        errText.forEach(element => {
            if (text && null != text && '' != text && text.toLowerCase().indexOf(element) > -1) {
                isErr = true;
            }
        });
        return isErr;
    }

    validateFirstCell(list, type) {
        const firstCell = list.filter(x => x['name'] == type);
        if (firstCell.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    openPopUp() {
        this.modalService.open(this.reBuildModel, {});
    }
    updateModel() {
        this.isExit = true;
        if (
            this.dupModelObj.overlapping !== this.modelObj.overlapping ||
            this.dupModelObj.returnHorizon !== this.modelObj.returnHorizon ||
            this.dupModelObj.startDate !== this.modelObj.startDate ||
            this.dupModelObj.endDate !== this.modelObj.endDate
        ) {
            this.openPopUp();
        } else {
            this.saveModelReviewRFData('model');
        }
        /*  if (this.originalModelObj !== JSON.parse(JSON.stringify(this.modelObj))) {
            this.openPopUp();
        } */
    }
}
