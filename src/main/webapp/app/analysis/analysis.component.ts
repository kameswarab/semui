import { Component, OnInit, ViewChild, ElementRef, NgZone, Inject } from '@angular/core';
import { AnalysisService } from 'app/analysis/analysis.service';
import { NgbModal, NgbPanelChangeEvent, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { getPropagationTree } from '../../assets/getPropagationTree';
import * as $ from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';

import {
    ALERT_MSG_TIME_OUT,
    ANALYSIS_TYPE_SCENARIO,
    ANALYSIS_TYPE_TIME_SERIES,
    ANALYSIS_TABS,
    ANALYSIS_TYPE_COMPARISION,
    ANALYSIS_TYPE_PREDICTION,
    ANALYSIS_TYPE_RATE_CURVE,
    SCENARIO_TYPE_PROJECTION,
    ANALYSIS_TYPE_PROPAGATION,
    ANALYSIS_TYPE_TIMESERIES,
    ANALYSIS_TYPE_HISTOGRAM,
    ANALYSIS_TYPE_ACF,
    ANALYSIS_TYPE_BOX,
    ANALYSIS_TYPE_RATE_CORRELATION
} from 'app/constants';
import 'ag-grid-enterprise';
import { GridOptions } from 'ag-grid/main';

import { ActivatedRoute, Router } from '@angular/router';
import { window } from 'rxjs/operators';
import { NgbDateMomentAdapter } from 'app/shared';
declare var require: any;
declare var Plotly: any;

@Component({
    selector: 'jhi-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['analysis.css'],
    host: {
        '(window:click)': 'onClick()'
    }
})
export class AnalysisComponent implements OnInit {
    @ViewChild('popupModal')
    popupModal: ElementRef;

    @ViewChild('popupChartModal')
    popupChartModal: ElementRef;

    minDate = null;
    maxDate = null;

    //------------for Ag-grid-------------
    gridOptions: GridOptions;
    headerList = [];
    dataList = [];
    columnList = [];
    columnDefs = [];
    rowData = [];
    params: any;
    cacheBlockSize;
    maxBlocksInCache;
    sideBar;
    gridApi;
    defaultColDef;
    activeIds = [];
    selectedAnalysisList = [];
    selectedAnalysis = {
        type: null,
        name: null,
        id: null
    };

    analysisTypeScenario = ANALYSIS_TYPE_SCENARIO;
    analysisTypeTimeSeries = ANALYSIS_TYPE_TIME_SERIES;

    analysisRateCurve = ANALYSIS_TYPE_RATE_CURVE;
    analysisPropagationTree = ANALYSIS_TYPE_PROPAGATION;
    analysisComparision = ANALYSIS_TYPE_COMPARISION;
    analysisPrediction = ANALYSIS_TYPE_PREDICTION;

    analysisHistogram = ANALYSIS_TYPE_HISTOGRAM;
    analysisAcfPlot = ANALYSIS_TYPE_ACF;
    analysisBoxPlot = ANALYSIS_TYPE_BOX;
    analysisCorrelation = ANALYSIS_TYPE_RATE_CORRELATION;
    resultMap = {};

    assetClassList = [];
    assetClassListForScenario = [];
    riskFactorTypeList = [];
    frequencyList = [];
    scenarioTypeList = [];
    propagationColorCode = [];

    analysisTypeConfigList = [];
    riskFactorInfo = {};
    timeSeriesData = [];
    shockData = [];
    isAddAnalysis = false;
    riskFactorInfoDiv = false;

    selectionObj = {
        startDate: null,
        endDate: null,
        selectedScenarios: [],
        curveFamilySelListOnScenario: [],
        scenarioType: null,
        selectedAssetClassList: [],
        selectedRiskFactorTypeList: [],
        riskFactorTypeList: [],
        selectedRiskFactorList: [],
        riskFactorList: [],
        projectionPeriod: 'Shock',
        curveFamily: null,
        scenarioList: [],
        shockPeriods: [],
        showPlottedRiskfactors: false,
        plottedRiskfactors: [],
        showOrHideOutput: 'show',
        frequency: 1,
        levelOrReturns: 'LEVEL',
        overlapOrNonOverlap: 'TRUE',
        returnsType: 'LOG'
    };
    shockPeriodsList = [];
    list = [];

    showPopupPlottedRiskfactors = false;

    modalHeader = null;

    fullscreen = false;
    multipleGraphs = false;

    displayFailureMessage: string;
    isFailure = false;

    masterDataObj = [];
    metadataShow = false;

    maxLimitMessage = 'Max Limit <=40';
    scenarioProjectionType = SCENARIO_TYPE_PROJECTION;

    scenarioNameList = [];
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
            'sendDataToCloud',
            'resetCameraDefault3d',
            'resetCameraLastSave3d',
            'resetViews',
            'resetViewMapbox',
            'resetGeo',
            'zoomInGeo',
            'zoomOutGeo',
            'resetGeo',
            'hoverClosestGeo',
            'resetViews',
            'resetViewMapbox',
            'resetScale2d'
        ]
    };

    margin = {
        l: 40,
        r: 10,
        b: 5,
        t: 5
    };
    plotlyObjMap = {};
    plotlyDataObj = {};
    riskFactorColorPallete = [
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#00FFFF',
        '#FF00FF',
        '#C0C0C0',
        '#808080',
        '#800000',
        '#808000',
        '#008000',
        '#800080',
        '#008080',
        '#000080',
        '#94BBE7',
        '#2F4F73',
        '#8C9C5B',
        '#862B9B',
        '#22C513',
        '#0CB66C',
        '#6704F5',
        '#E17A3F',
        '#FCF13E',
        '#218ED8',
        '#7D8EB5',
        '#B5B8FF',
        '#09B97E',
        '#0EB3DF',
        '#5EAF36',
        '#549AC7',
        '#E85E5C',
        '#E6A0FF',
        '#9774B4',
        '#2E0162',
        '#DDC544',
        '#DD0D48',
        '#847D0B',
        '#DDD723',
        '#0D9DCD',
        '#3E5860',
        '#112D26',
        '#462CE2',
        '#175FEA',
        '#CBD061',
        '#0B8563',
        '#1323B3',
        '#5F3943',
        '#E080C7',
        '#02C766',
        '#84CC89',
        '#75E705',
        '#18C56A',
        '#C877D0',
        '#1BE8EF',
        '#809224',
        '#03A128',
        '#C0FC9F',
        '#62E10E',
        '#1C7333',
        '#933BE1',
        '#130360',
        '#CC50DF',
        '#AFD601',
        '#1A1763',
        '#F15B42',
        '#BCF4C9',
        '#8B5EA6',
        '#8BC98A',
        '#ECD7A3',
        '#57DFB3',
        '#085EFF',
        '#D5D94E',
        '#9D2C90',
        '#C28182',
        '#0571B0',
        '#E6D49B',
        '#306C0E',
        '#66D3E4',
        '#4F67F3',
        '#B891AC',
        '#CBB4C1',
        '#AF5B6C',
        '#7E03F6',
        '#7A952E',
        '#1DB13F',
        '#FD550A',
        '#57B79C',
        '#0FD99D',
        '#63FD1C',
        '#E29C01',
        '#47475D',
        '#65CF8B',
        '#339960',
        '#8F8D62',
        '#B1A574',
        '#F20612',
        '#EA6C95',
        '#2086D9',
        '#0BBCC0',
        '#4F974E',
        '#3FCC9E'
    ];
    overlappingList = [{ label: 'TRUE' }, { label: 'FALSE' }];
    levelOrReturnsList = [{ label: 'LEVEL' }, { label: 'RETURNS' }];
    returnTypeList = [{ label: 'LOG' }, { label: 'ABS' }];
    searchString = null;
    ngOnInit() {
        let id = this.activatedRoute.snapshot.params.id;

        if (id) {
            this.getMasterList(parseInt(id));
        } else {
            this.router.navigate(['analysisList'], { skipLocationChange: true });
        }
    }

    constructor(
        private analysisService: AnalysisService,
        private modalService: NgbModal,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private momentAdapter: NgbDateMomentAdapter,
        private _ngZone: NgZone,
        private spinner: NgxSpinnerService,
        @Inject('Window') window: Window
    ) {
        this.cacheBlockSize = 100;
        this.maxBlocksInCache = 2;
        this.sideBar = 'columns';
        this.gridOptions = <GridOptions>{};
        this.gridOptions.columnDefs = [];
        this.gridOptions.rowData = [];

        window['angularComponentRef'] = { getRiskfactorData: this.getRiskfactorData, zone: _ngZone, component: this };
    }

    getShocksValues(info, type) {
        let data = [];
        if ('SHOCK' == type) {
            let sValues = info['SHOCK_VALUE'];
            let oValues = info['OVRD_SHOCK'];
            let keys = Object.keys(sValues);

            keys.forEach(key => {
                let d = [key];
                if (oValues[key]) {
                    d.push(oValues[key]);
                } else {
                    d.push(sValues[key]);
                }
                data.push(d);
            });
        } else {
            let sValues = info['STD_SHOCK'];
            let keys = Object.keys(sValues);

            keys.forEach(key => {
                let d = [key];
                d.push(sValues[key]);
                data.push(d);
            });
        }
        return data;
    }
    getRiskfactorData(rfId, analysis, component, rfInfoAdditionalData) {
        component.riskFactorInfoDiv = false;
        let scenarioIds = analysis['selectionObj'].selectedScenarios.map(a => a);
        component.analysisService.getScenarioRiskfactorInfo({ SCENARIO_ID: parseInt(scenarioIds[0]), RF_ID: parseInt(rfId) }).subscribe(
            response => {
                component.riskFactorInfoDiv = true;
                component.riskFactorInfo = response;
                component.riskFactorInfo['rfInfoAdditionalData'] = rfInfoAdditionalData;
            },
            response => {
                component.showErrorValidations(true, response.error);
            }
        );
    }

    addAnalysisCheck(analysis) {
        let checkList = this.selectedAnalysisList.filter(p => p.id == analysis.id);
        if (analysis.type == this.analysisTypeScenario || analysis.id == this.analysisCorrelation || (checkList && checkList.length > 0)) {
            return false;
        }
        return true;
    }

    clearSelectionObj(analysis) {
        let keys = Object.keys(this.selectionObj);

        let obj = {};
        keys.forEach(key => {
            obj[key] = this.selectionObj[key];
        });

        analysis.selectionObj = obj;
    }

    copySelectionObj(sourceAnalysis, targetAnalysis) {
        let keys = Object.keys(sourceAnalysis.selectionObj);

        let obj = {};
        keys.forEach(key => {
            if (key == 'selectedRiskFactorList') {
                if (targetAnalysis['riskFactorMultiple'] == 'T') {
                    let dd = sourceAnalysis.selectionObj[key];
                    if (dd && targetAnalysis['riskFactorMax'] && dd.length > targetAnalysis['riskFactorMax']) {
                        obj[key] = dd.slice(0, targetAnalysis['riskFactorMax']);
                    } else {
                        obj[key] = dd;
                    }
                } else {
                    let dd = sourceAnalysis.selectionObj[key];
                    if (dd && dd.length > 0) {
                        obj[key] = [dd[0]];
                    } else {
                        obj[key] = [];
                    }
                }
            } else if (key == 'selectedScenarios') {
                if (targetAnalysis['scenarioMultiple'] == 'T') {
                    let dd = sourceAnalysis.selectionObj[key];
                    if (dd && targetAnalysis['scenarioMax'] && dd.length > targetAnalysis['scenarioMax']) {
                        obj[key] = dd.slice(0, targetAnalysis['scenarioMax']);
                    } else {
                        obj[key] = dd;
                    }
                } else {
                    let dd = sourceAnalysis.selectionObj[key];
                    if (dd && dd.length > 0) {
                        obj[key] = [dd[0]];
                    } else {
                        obj[key] = [];
                    }
                }
            } else if (key == 'showPlottedRiskfactors' || key == 'plottedRiskfactors') {
                obj[key] = this.selectionObj[key];
            } else {
                obj[key] = sourceAnalysis.selectionObj[key];
            }
        });

        targetAnalysis.selectionObj = obj;
    }

    clearFilters(analysis) {
        this.clearSelectionObj(analysis);

        this.columnDefs = [];
        this.rowData = [];
        let element = document.getElementById('plotlyChart_' + analysis.id);
        if (element) {
            element.innerHTML = '';
        }
        analysis.nullData = true;
        this.isAddAnalysis = false;
    }

    getMasterList(selectedAnalysisId) {
        this.analysisService.getMasterList().subscribe(
            response => {
                this.masterDataObj = response;
                this.analysisTypeConfigList = response['MST_ANALYSIS_TYPE_CONFIG'];

                this.analysisTypeConfigList.forEach(analysis => {
                    analysis['showOrHideOutput'] = 'show';
                });

                this.scenarioTypeList = response['DIM_SCNRO_TYP_MST'];
                this.assetClassList = response['AST_CLS_LST'];
                this.riskFactorTypeList = response['RSKFCT_TYP_LST'];
                this.frequencyList = response['DIM_FREQUENCY_MST'];

                let minDate = response['MIN_DATE'];
                let maxDate = response['MAX_DATE'];
                let dateStruct: NgbDateStruct;
                let startDate = new Date(minDate);
                if (startDate) {
                    dateStruct = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };
                    this.selectionObj.startDate = this.momentAdapter.toModel(dateStruct);
                    this.minDate = dateStruct;
                }

                let endDate = new Date(maxDate);
                if (endDate) {
                    dateStruct = { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate() };
                    this.selectionObj.endDate = this.momentAdapter.toModel(dateStruct);
                    this.maxDate = dateStruct;
                }

                this.assetClassListForScenario = this.assetClassList;
                this.selectionObj.riskFactorTypeList = this.getUnique(this.riskFactorTypeList, 'value');
                let list = this.analysisTypeConfigList.filter(p => p.id == selectedAnalysisId);
                if (list && list.length > 0) {
                    this.selectedAnalysis = list[0];
                    this.selectedAnalysis['nullData'] = true;
                    this.clearSelectionObj(this.selectedAnalysis);
                    this.selectedAnalysisList.push(this.selectedAnalysis);
                    this.activeIds = ['analysis_id_' + this.selectedAnalysis.id];
                } else {
                    this.router.navigate(['analysisList'], { skipLocationChange: true });
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    addNewAnalysisPopup(analysis) {
        analysis['nullData'] = true;
        this.copySelectionObj(this.selectedAnalysisList[this.selectedAnalysisList.length - 1], analysis);
        this.selectedAnalysisList.push(analysis);
        let activeId = this.activeIds[0];
        this.activeIds = ['analysis_id_' + analysis.id];
        this.isAddAnalysis = false;

        if (!this.multipleGraphs && this.selectedAnalysisList.length > 1) {
            this.showOrHideMultiple('SHOW', activeId);
        }

        if (this.selectedAnalysisList.length == 2) {
            this.selectedAnalysisList.forEach(analysis => {
                let resp = this.resultMap[analysis.id];
                if (resp && resp.length > 0) {
                    setTimeout(() => {
                        this.processOutput(analysis.id, analysis['viewType'], analysis['graphType'], null, resp, analysis);
                    }, 100);
                }
            });
        }
        let analysisTemp = this.selectedAnalysisList[this.selectedAnalysisList.length - 2];
        if (analysisTemp['nullData'] == false) {
            this.analyze(analysis);
        }
    }

    removeAnalysis(analysisId) {
        if (this.selectedAnalysisList.length == 1) {
            this.router.navigate(['analysisList'], { skipLocationChange: true });
        } else {
            this.selectedAnalysisList = this.selectedAnalysisList.filter(p => p.id != analysisId);

            let activeTab = this.activeIds[0];

            if (activeTab && activeTab.split('_')[2] == analysisId + '') {
                let selectedAnalysis = this.selectedAnalysisList[0];
                this.activeIds = ['analysis_id_' + selectedAnalysis.id];
                this.multipleGraphs = true;
                this.selectedAnalysisList.forEach(analysis => {
                    analysis.showOrHideOutput = 'show';
                });
            }
            if (this.selectedAnalysisList.length == 1) {
                this.selectedAnalysisList.forEach(analysis => {
                    let resp = this.resultMap[analysis.id];
                    if (resp && resp.length > 0) {
                        setTimeout(() => {
                            this.processOutput(analysis.id, analysis['viewType'], analysis['graphType'], null, resp, analysis);
                        }, 100);
                    }
                });
            }
        }
    }

    toggleSetAccordian(props: NgbPanelChangeEvent) {
        let activeId = this.activeIds[0];
        if (props.nextState) {
            let panelId = props.panelId;
            this.activeIds = [panelId];

            if (!this.multipleGraphs && this.selectedAnalysisList.length > 1) {
                this.showOrHideMultiple('SHOW', activeId);
                this.showOrHideMultiple('HIDE', panelId);
            }
        } else {
            this.activeIds = [];
            if (!this.multipleGraphs && this.selectedAnalysisList.length > 1) {
                this.showOrHideMultiple('SHOW', activeId);
            }
        }
    }

    sceanrioTypeChange(scenarioType, analysis) {
        if (analysis.selectionObj.scenarioType != scenarioType) {
            analysis.selectionObj.selectedScenarios = [];
            this.getScenarioList(scenarioType, analysis);
        }
    }

    getScenarioList(scenarioType, analysis) {
        if (analysis) {
            analysis.selectionObj.scenarioType = scenarioType;

            let scenarioIds = analysis.selectionObj.selectedScenarios; /* analysis.selectionObj.selectedScenarios.map(a => a.value); */

            let scenarioObj = {
                scenarioTypeId: analysis.selectionObj.scenarioType,
                scenarioIdList: scenarioIds
            };

            this.analysisService.getScenarioList(scenarioObj).subscribe(
                response => {
                    analysis.selectionObj.scenarioList = response;

                    analysis.selectionObj.selectedAssetClassList = [];
                    analysis.selectionObj.selectedRiskFactorList = [];
                    analysis.selectionObj.riskFactorList = [];
                    analysis.selectionObj.selectedRiskFactors = [];
                    analysis.selectionObj.selectedRiskFactorList = [];
                    analysis.selectionObj.curveFamilySelListOnScenario = [];
                    analysis.selectionObj.curveFamily = null;
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    changeScenarios(analysis) {
        if (
            analysis.id != this.analysisRateCurve &&
            analysis.id != this.analysisPropagationTree &&
            (analysis.id != this.analysisComparision || analysis.selectionObj.scenarioType == this.scenarioProjectionType)
        ) {
            this.getScenarioList(analysis.selectionObj.scenarioType, analysis);
        }
        if (analysis.id == this.analysisPropagationTree) {
            analysis.selectionObj.selectedAssetClassList = [];
            analysis.selectionObj.selectedRiskFactorList = [];
        }
        if (analysis.id == this.analysisRateCurve) {
            if (analysis.selectionObj.selectedScenarios.length > 0) {
                this.curveFamilySelOnScenario(analysis);
            } else {
                analysis.selectionObj.curveFamilySelListOnScenario = [];
                analysis.selectionObj.curveFamily = null;
            }
        }

        if (analysis.selectionObj.selectedScenarios.length > 0) {
            this.getRiskFactorList(analysis);
        }
    }

    curveFamilySelOnScenario(analysis) {
        let scenarioIds = analysis.selectionObj.selectedScenarios; /* analysis.selectionObj.selectedScenarios.map(a => a.value); */
        let obj = {
            analysisTypeId: analysis.id,
            scenarioIdList: scenarioIds
        };

        this.analysisService.getCurveFamilySelOnScenario(obj).subscribe(
            response => {
                analysis.selectionObj.curveFamilySelListOnScenario = response;
                analysis.selectionObj.curveFamily = null;
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getUnique(arr, comp) {
        const unique = arr
            .map(e => e[comp])

            .map((e, i, final) => final.indexOf(e) === i && i)

            .filter(e => arr[e])
            .map(e => arr[e]);

        return unique;
    }

    assestClassChange(analysis) {
        let assetClassList = analysis['selectionObj'].selectedAssetClassList;
        if (assetClassList && assetClassList.length > 0) {
            analysis['selectionObj'].riskFactorTypeList = this.getUnique(
                this.riskFactorTypeList.filter(p => assetClassList.indexOf(p.asset_id) != -1),
                'value'
            );
        } else {
            analysis['selectionObj'].riskFactorTypeList = this.getUnique(this.riskFactorTypeList, 'value');
        }
        analysis['selectionObj'].selectedRiskFactorTypeList = [];
        this.getRiskFactorList(analysis);
    }

    analysis;
    isSearch = false;
    prevSelItems = [];
    searchData(obj) {
        this.searchString = obj;
        this.isSearch = true;
        this.analysis.searchString = obj;
        const selectedRiskFactorList = this.analysis.selectionObj.selectedRiskFactorList;
        const riskFactorList = this.analysis.selectionObj.riskFactorList;
        this.prevSelItems = riskFactorList.filter(p => selectedRiskFactorList.indexOf(p.value) != -1);
        this.getRiskFactorList(this.analysis);
    }

    getRiskFactorList(analysis) {
        this.analysis = analysis;
        if (!this.isSearch) {
            analysis.selectionObj.riskFactorList = [];
            analysis.selectionObj.selectedRiskFactors = [];
            analysis.selectionObj.selectedRiskFactorList = [];
            analysis.selectionObj.searchString = null;
        }

        let scenarioIds = analysis.selectionObj.selectedScenarios; /* analysis.selectionObj.selectedScenarios.map(a => a.value); */
        if (analysis.id == this.analysisPropagationTree && analysis.selectionObj.selectedAssetClassList.length != 0) {
            if (scenarioIds.length == 0) {
                analysis.selectionObj.selectedAssetClassList = [];
                this.showErrorValidations(true, 'Scenarios should be selected.');
                return false;
            }
            let obj = {
                analysisTypeId: analysis.id,
                analysisType: analysis['type'],
                scenarioIdList: scenarioIds,
                assetClassList: analysis.selectionObj.selectedAssetClassList,
                searchString: this.searchString,
                selectedRiskFactorList: this.analysis.selectionObj.selectedRiskFactorList
            };

            this.analysisService.getRiskFactorList(obj).subscribe(
                response => {
                    this.isSearch = false;
                    analysis.selectionObj.riskFactorList = response.concat(this.prevSelItems);
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else if (analysis.riskFactorSelection == 'T') {
            let obj = {
                analysisTypeId: analysis.id,
                analysisType: analysis['type'],
                scenarioIdList: scenarioIds,
                assetClassList: analysis.selectionObj.selectedAssetClassList,
                riskFactorTypeList: analysis.selectionObj.selectedRiskFactorTypeList,
                searchString: this.searchString,
                selectedRiskFactorList: this.analysis.selectionObj.selectedRiskFactorList
            };

            this.analysisService.getRiskFactorList(obj).subscribe(
                response => {
                    this.isSearch = false;
                    analysis.selectionObj.riskFactorList = response.concat(this.prevSelItems);
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else if (
            analysis.id == ANALYSIS_TYPE_RATE_CURVE &&
            analysis.selectionObj.scenarioType == this.scenarioProjectionType &&
            scenarioIds.length > 0
        ) {
            this.analysisService.getProjectionPeriods(scenarioIds[0]).subscribe(
                response => {
                    analysis.selectionObj.shockPeriods = response;

                    this.shockPeriodsList = Object.keys(analysis.selectionObj.shockPeriods);
                    this.shockPeriodsList.forEach(ele => {
                        let data = { label: ele };
                        this.list.push(data);
                    });

                    analysis.selectionObj.selectedPeriod = this.shockPeriodsList[0];
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    getRiskFactorPrediction(riskfactor, analysis) {
        this.modalHeader = riskfactor.label;

        let element = document.getElementById('plotlyPopupChart');
        if (element) {
            element.innerHTML = '';
        }

        let scenarioIds = analysis.selectionObj.selectedScenarios; /* analysis.selectionObj.selectedScenarios.map(a => a.value); */
        let dto = {
            analysisTypeId: ANALYSIS_TYPE_PREDICTION,
            scenarioTypeId: analysis.selectionObj.scenarioType,
            analysisType: analysis['type'],
            assetClassList: analysis.selectionObj.selectedAssetClassList,
            riskFactorTypeList: analysis.selectionObj.selectedRiskFactorTypeList,
            scenarioIdList: scenarioIds,
            riskfactorList: [riskfactor],
            projectionPeriod: 'Shock',
            startDate: null,
            endDate: null,
            riskFactorSelection: 'T'
        };

        this.getAnalysisData(dto, 'G', 'LINE', 'POPUP', analysis);
    }

    showOrHideMultiple(showOrHideMultiple, activeId) {
        let activeAnalysisId = activeId || this.activeIds[0];

        if (activeAnalysisId) {
            let ids = activeAnalysisId.split('_');
            if (ids.length == 3) {
                let analysisId = ids[2];

                let analysis;

                if (showOrHideMultiple == 'SHOW' && this.selectedAnalysisList.length > 1) {
                    this.multipleGraphs = true;
                    this.selectedAnalysisList.forEach(analysisTemp => {
                        if (analysisTemp.id == analysisId) {
                            analysis = analysisTemp;
                        }
                        analysisTemp.showOrHideOutput = 'show';
                    });
                } else if (showOrHideMultiple == 'HIDE' && this.selectedAnalysisList.length > 1) {
                    this.multipleGraphs = false;
                    this.selectedAnalysisList.forEach(analysisTemp => {
                        if (analysisTemp.id == analysisId) {
                            analysis = analysisTemp;
                        } else {
                            analysisTemp.showOrHideOutput = 'hide';
                        }
                    });
                }

                let resp = this.resultMap[analysis.id];
                if (resp && resp.length > 0) {
                    setTimeout(() => {
                        this.processOutput(analysis.id, analysis['viewType'], analysis['graphType'], null, resp, analysis);
                    }, 100);
                }
            }
        }
    }

    expandGraph(analysis) {
        this.fullscreen = !this.fullscreen;

        if (this.selectedAnalysisList.length > 1) {
            this.multipleGraphs = true;
        }

        if (this.fullscreen) {
            this.selectedAnalysisList.forEach(analysisTemp => {
                if (analysis.id != analysisTemp.id) {
                    analysisTemp.showOrHideOutput = 'hide';
                }
            });
        } else {
            this.selectedAnalysisList.forEach(analysisTemp => {
                analysisTemp.showOrHideOutput = 'show';
            });
        }

        let resp = this.resultMap[analysis.id];
        if (resp && resp.length > 0) {
            setTimeout(() => {
                this.processOutput(analysis.id, analysis['viewType'], analysis['graphType'], null, resp, analysis);
            }, 100);
        }
    }

    analyze(analysis) {
        this.fullscreen = false;

        let scenarioIds = analysis.selectionObj.selectedScenarios; /* analysis.selectionObj.selectedScenarios.map(a => a.value); */

        if (analysis['type'] == this.analysisTypeScenario) {
            if (!scenarioIds || scenarioIds.length == 0) {
                analysis.nullData = true;
                this.showErrorValidations(true, 'Scenarios should be selected.');
                return false;
            }
            if (analysis.id == this.analysisPrediction) {
                if (analysis.selectionObj.selectedRiskFactorList.length == 0) {
                    analysis.nullData = true;
                    this.showErrorValidations(true, 'Risk factors should be selected.');
                    return false;
                }
            }
            if (analysis.id == this.analysisRateCurve) {
                if (analysis.selectionObj.curveFamily == null && analysis.selectionObj.curveFamilySelListOnScenario.length > 0) {
                    analysis.nullData = true;
                    this.showErrorValidations(true, 'Curve Family should be selected.');
                    return false;
                }
                if (analysis.selectionObj.curveFamilySelListOnScenario.length == 0) {
                    this.showErrorValidations(true, 'Selected Scenarios do not have any common Risk Factors between them.');
                    return false;
                }
            }
        } else if (analysis.selectionObj.selectedRiskFactorList.length == 0) {
            analysis.nullData = true;
            this.showErrorValidations(true, 'Risk factors should be selected.');
            return false;
        }

        let selectedRiskFactors = analysis.selectionObj.riskFactorList.filter(
            e => analysis.selectionObj.selectedRiskFactorList.indexOf(e.value) != -1
        );

        let dto = {
            analysisTypeId: analysis.id,
            scenarioTypeId: analysis.selectionObj.scenarioType,
            analysisType: analysis['type'],
            assetClassList: analysis.selectionObj.selectedAssetClassList,
            riskFactorTypeList: analysis.selectionObj.selectedRiskFactorTypeList,
            scenarioIdList: scenarioIds,
            riskfactorList: selectedRiskFactors,
            projectionPeriod: analysis.selectionObj.projectionPeriod,
            riskFactorSelection: analysis.riskFactorSelection,
            curveFamily: analysis.selectionObj.curveFamily,
            startDate: analysis.selectionObj.startDate,
            endDate: analysis.selectionObj.endDate,
            frequency: analysis.selectionObj.frequency,
            returnsType: analysis.selectionObj.returnsType,
            levelOrReturns: analysis.selectionObj.levelOrReturns,
            overlapOrNonOverlap: analysis.selectionObj.overlapOrNonOverlap
        };

        this.getAnalysisData(dto, analysis['viewType'], analysis['graphType'], null, analysis);
    }

    getAssetClassName(assetClsId) {
        return this.assetClassList.filter(p => p.value == assetClsId)[0].label;
    }

    getAnalysisData(dto, viewType, chartType, divType, analysis) {
        this.analysisService.getAnalysisData(dto).subscribe(
            response => {
                if (response && response.length > 0) {
                    if (dto.analysisTypeId == ANALYSIS_TYPE_PROPAGATION) {
                        let nodes = response[0].JSON.nodes;
                        this.propagationColorCode = response[0].colorSet;
                        analysis['selectionObj'].plottedRiskfactors = response[0].selectedassetClassList;
                        if (nodes.length == 0) {
                            this.showErrorValidations(true, 'Selected scenario doesnt have Dependent Riskfactors');
                            return false;
                        }
                    }
                    analysis.nullData = false;
                    this.spinner.show();
                    setTimeout(() => {
                        this.resultMap[analysis.id] = response;
                        this.processOutput(dto.analysisTypeId, viewType, chartType, divType, response, analysis);
                    }, 100);
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    processOutput(analysisTypeId, viewType, chartType, divType, response, analysis) {
        this.spinner.hide();
        if (viewType == 'T') {
            let dataList = response[0]['DATA'];
            let projPeriodList = response[0]['PROJECTION_PERIODS'];
            this.scenarioNameList = response[0]['SCENARIO_NAMES'];
            this.gridOptions.context = {
                scenarioNameList: this.scenarioNameList
            };
            let columnDefs = [
                {
                    headerName: 'Risk factor data',
                    children: [
                        {
                            headerName: 'Risk factor Name',
                            field: 'RISKFACTOR_NAME',
                            filter: 'agSetColumnFilter',
                            menuTabs: ['filterMenuTab'],
                            filterParams: {
                                selectAllOnMiniFilter: true,
                                clearButton: true
                            }
                        }
                    ]
                }
            ];

            projPeriodList.forEach(period => {
                let childDefs = [];
                this.scenarioNameList.forEach(sceName => {
                    childDefs.push({
                        headerName: sceName + '_' + period,
                        field: sceName + '_' + period,
                        cellStyle: this.changeCellColor,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    });
                });
                columnDefs.push({ headerName: period, children: childDefs });
            });

            this.columnDefs = columnDefs;
            this.rowData = dataList;
        } else if (viewType == 'G') {
            let data = response[0];

            let element = document.getElementById('plotlyChart_' + analysisTypeId);
            if (element) {
                element.innerHTML = '';
            }

            if (analysisTypeId == ANALYSIS_TYPE_PROPAGATION) {
                this.renderPropagationTreeGraph(data, analysisTypeId);
            } else {
                this.spinner.show();

                this.renderPlotlyChart(data, chartType, divType, analysisTypeId, analysis);
            }
        }
    }

    renderPropagationTreeGraph(dataStr: any, analysisTypeId) {
        let data = dataStr['JSON'];
        if (data && data['nodes'] && data['nodes'].length > 0) {
            let elementId = '#plotlyChart_' + analysisTypeId;
            let analysisTemp = this.selectedAnalysisList.filter(p => p.id == analysisTypeId)[0];
            let analysis = {
                selectionObj: {
                    selectedScenarios: analysisTemp.selectionObj.selectedScenarios
                }
            };
            let element = document.getElementById('plotlyChart_' + analysisTypeId);
            getPropagationTree(data, elementId, element.clientWidth, element.clientHeight, analysis);
        }
    }

    changeCellColor(params) {
        let data = params['data'];
        let columnGroupName = params['column']['originalParent']['colGroupDef']['headerName'];
        let values = [];
        params.context.scenarioNameList.forEach(name => {
            values.push(data[name + '_' + columnGroupName]);
        });

        let value = params.value;
        if (value != null && values.includes(value)) {
            let maxCellValue = Math.max.apply(null, values);
            let minCellValue = Math.min.apply(null, values);
            if (maxCellValue == value) {
                return { color: '#000000', 'background-color': '#aaf0ba' };
            } else if (minCellValue == value) {
                return { color: '#000000', 'background-color': '#fd7070' };
            } else {
                return { color: '#000000', 'background-color': '#ffc785' };
            }
        }
    }

    onRowClicked(param, analysis) {
        let dto = param.data;
        let riskfactor = {
            value: dto['RF_ID'],
            label: dto['RISKFACTOR_NAME']
        };
        this.getRiskFactorPrediction(riskfactor, analysis);
    }

    onGridReady(param) {
        this.params = param;
        this.gridApi = param.api;
        this.gridApi.closeToolPanel();
    }

    plotHistogram(element, dataObj, name, analysis) {
        analysis.selectionObj.plottedRiskfactors = [];
        analysis['selectionObj'].showPlottedRiskfactors = false;

        let data = [
            {
                x: dataObj,
                type: 'histogram',
                marker: {
                    color: this.riskFactorColorPallete[0]
                }
            }
        ];
        analysis.selectionObj.plottedRiskfactors.push({ color: this.riskFactorColorPallete[0], rfName: name, show: true });

        const layout = {
            autosize: true,
            font: { family: 'roboto' },
            margin: this.margin,
            xaxis: { zeroline: true, showline: true },
            yaxis: { title: analysis.selectionObj.levelOrReturns + ' Frequency', zeroline: false, showline: true }
        };

        let obj = Plotly.newPlot(element, data, layout, this.options, { responsive: true });
        return obj;
    }

    plotACF(element, dataObj, name, analysis) {
        analysis.selectionObj.plottedRiskfactors = [];
        analysis['selectionObj'].showPlottedRiskfactors = false;

        let data = [];

        let count = 0;
        dataObj.forEach(ele => {
            if (!isNaN(ele)) {
                count++;
            }
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
            name: 'ACF',
            type: 'bar',
            uid: 'b343b354-af03-11e8-94c5-080027111896',
            marker: {
                color: this.riskFactorColorPallete[0]
            }
        });
        analysis.selectionObj.plottedRiskfactors.push({ color: this.riskFactorColorPallete[0], rfName: name, show: true });

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
            font: { family: 'roboto' },
            margin: this.margin,
            showlegend: false,
            plot_bgcolor: 'rgb(229,229,229)',
            bargap: 0.9,
            barmode: 'overlay',
            xaxis: { showline: true, zeroline: false },
            yaxis: { title: analysis.selectionObj.levelOrReturns + ' CORRELATION COEFFICIENT', showline: true, zeroline: false }
        };

        let obj = Plotly.newPlot(element, data, layout, this.options, { responsive: true });
        return obj;
    }

    plotBox(element, shockData, analysis) {
        let shocks = Object.keys(shockData);
        analysis.selectionObj.plottedRiskfactors = [];
        analysis['selectionObj'].showPlottedRiskfactors = false;
        let data = [];
        let i = 0;
        shocks.forEach(shock => {
            data.push({
                y: shockData[shock],
                type: 'box',
                name: shock,
                boxpoints: true,
                marker: { color: this.riskFactorColorPallete[i] }
            });
            analysis.selectionObj.plottedRiskfactors.push({ color: this.riskFactorColorPallete[i++], rfName: shock, show: true });
        });

        const layout = {
            autosize: true,
            font: { family: 'roboto' },
            margin: this.margin,
            showlegend: false,
            xaxis: { showticklabels: false, zeroline: false, showline: true },
            yaxis: { title: analysis.selectionObj.levelOrReturns, zeroline: false, showline: true }
        };
        let obj = Plotly.newPlot(element, data, layout, this.options, { responsive: true });
        this.plotlyDataObj[analysis.id] = data;
        return obj;
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
                hovertemplate: '%{x}<br>%{y}<br>Value: %{z}<extra></extra>',
                zmax: 1,
                zmin: -1
            }
        ];

        const layout = {
            autosize: true,
            font: { family: 'roboto' },
            margin: {
                l: 5,
                r: 5,
                b: 5,
                t: 5
            },
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

        let obj = Plotly.newPlot(element, data, layout, this.options, { responsive: true });
        return obj;
    }

    roundedValue(value: any, decimals: number) {
        if (!isNaN(value)) {
            return Math.round(value * 100) / 100;
        }
        return '';
    }

    showOrHideSeries(rf, plottedRfs, analysisId) {
        rf.show = !rf.show;
        let rfNames;
        let baseNames = rf.rfName + '_BASE';
        let legendSel = rf.rfName;

        let obj = this.plotlyObjMap[analysisId];
        let data = this.plotlyDataObj[analysisId];
        let layout = obj.__zone_symbol__value.layout;
        let graphId = obj.__zone_symbol__value.id;

        if (analysisId == this.analysisPrediction) {
            for (let i = 0; i < plottedRfs.length; i++) {
                if (plottedRfs[i].rfName == baseNames) {
                    plottedRfs[i].show = !plottedRfs[i].show;
                }
            }
            rfNames = plottedRfs.filter(rf => rf.show).map(rf => rf.rfName);
        } else {
            rfNames = plottedRfs.filter(rf => rf.show).map(rf => rf.rfName);
        }

        let deletedSeriesArray = [];
        for (let i = 0; i < data.length; i++) {
            let trace = data[i];
            if (rfNames.indexOf(trace.name) != -1) {
                deletedSeriesArray.push(trace);
            }
        }

        Plotly.newPlot(graphId, deletedSeriesArray, layout);
    }

    popupPlottedRiskfactors = [];

    plotTimeseries(element, shockData, timeSeriesData, analysisId, analysis) {
        this.spinner.show();
        analysis['selectionObj'].showPlottedRiskfactors = false;
        this.showPopupPlottedRiskfactors = false;
        this.popupPlottedRiskfactors = [];
        let shocks = Object.keys(shockData);
        analysis.selectionObj.plottedRiskfactors = [];
        let data = [];
        let i = 0;
        let mode = 'lines';

        shocks.forEach(shock => {
            if ((analysisId == 'POPUP' || analysisId == ANALYSIS_TYPE_PREDICTION) && shock.indexOf('_BASE') == -1) {
                mode = 'lines+markers';
            } else {
                mode = 'lines';
            }
            data.push({
                x: timeSeriesData,
                y: shockData[shock],
                name: shock,
                type: 'scattergl',
                mode: mode,
                line: { color: this.riskFactorColorPallete[i] }
            });
            if (analysisId == 'POPUP') {
                this.popupPlottedRiskfactors.push({ color: this.riskFactorColorPallete[i++], rfName: shock, show: true });
            } else {
                analysis.selectionObj.plottedRiskfactors.push({ color: this.riskFactorColorPallete[i++], rfName: shock, show: true });
            }
        });

        let rangeslider = true;
        let margin = Object.assign({}, this.margin);
        if (analysisId == ANALYSIS_TYPE_RATE_CURVE || (analysisId == ANALYSIS_TYPE_TIMESERIES && !this.fullscreen)) {
            rangeslider = false;
            if (analysisId == ANALYSIS_TYPE_RATE_CURVE) {
                margin.b = 40;
            } else {
                margin.b = 30;
            }
        }

        let xaxis = {
            rangeslider: rangeslider,
            showline: true,
            tickmode: 'auto',
            showticklabels: true
        };
        let yaxis = {
            showline: true
        };

        if (
            analysisId == ANALYSIS_TYPE_RATE_CURVE ||
            analysisId == ANALYSIS_TYPE_PREDICTION ||
            analysisId == ANALYSIS_TYPE_COMPARISION ||
            analysisId == ANALYSIS_TYPE_TIMESERIES
        ) {
            margin.l = 60;
        }

        if (analysisId != ANALYSIS_TYPE_RATE_CURVE) {
            xaxis['type'] = 'date';
            yaxis['title'] = {
                text: analysis.selectionObj.levelOrReturns
            };
        } else {
            xaxis['title'] = {
                text: 'Maturity'
            };
            yaxis['title'] = {
                text: 'Level'
            };
        }

        const layout = {
            autosize: true,
            font: { family: 'roboto' },
            margin: margin,
            xaxis: xaxis,
            yaxis: yaxis,
            showlegend: false,
            hovermode: 'closest'
        };

        let obj = Plotly.newPlot(element, data, layout, this.options, { responsive: true });
        this.plotlyDataObj[analysisId] = data;
        this.spinner.hide();
        return obj;
    }

    download(id, name) {
        if (id == 'POPUP') {
            $('#plotlyPopupChart')
                .find('a[data-title="Download plot as a png"]')[0]
                .click();
        } else {
            $('#plotlyChart_' + id)
                .find('a[data-title="Download plot as a png"]')[0]
                .click();
        }
    }

    download1(id, name) {
        let plotlyObj = this.plotlyObjMap[id];
        if (plotlyObj) {
            plotlyObj.then(function(gd) {
                Plotly.toImage(gd, { height: 400, width: 600 }).then(function(url) {
                    var link = document.createElement('a');
                    link.download = name;
                    link.href = url;
                    link.click();
                });
            });
        }
    }

    renderPlotlyChart(dataObj, type, divType, analysisTypeId, analysis) {
        let element = null;
        let chartId = analysisTypeId;
        if (divType == 'POPUP') {
            this.modalService.open(this.popupChartModal, { size: 'lg', windowClass: 'custom-modal-class' });
            element = document.getElementById('plotlyPopupChart');
            chartId = divType;
            analysisTypeId = divType;
        } else {
            let id = 'plotlyChart_' + analysisTypeId;
            element = document.getElementById(id);
        }
        setTimeout(() => {
            let timeSeriesData = dataObj['TIME_SERIES_DATA'];
            let shockData = dataObj['SHOCK_DATA'];

            let shocks = Object.keys(shockData);

            let data = [];
            shocks.forEach(shock => {
                data.push(shockData[shock]);
            });

            if ('HISTOGRAM' == type) {
                this.plotlyObjMap[chartId] = this.plotHistogram(element, data[0], shocks[0], analysis);
                this.spinner.hide();
            } else if ('BOX_PLOT' == type) {
                this.plotlyObjMap[chartId] = this.plotBox(element, shockData, analysis);
                this.spinner.hide();
            } else if ('ACF_PLOT' == type) {
                this.plotlyObjMap[chartId] = this.plotACF(element, data[0], shocks[0], analysis);
                this.spinner.hide();
            } else if ('HEAT_MAP' == type) {
                this.plotlyObjMap[chartId] = this.plotHEATMAP(element, dataObj['SHOCK_DATA_MATRIX'], shocks);
                this.spinner.hide();
            } else if ('LINE' == type) {
                this.plotlyObjMap[chartId] = this.plotTimeseries(element, shockData, timeSeriesData, analysisTypeId, analysis);
            }
        }, 100);
    }

    selectedScenarioForOutputData;
    getRiskFactorShockData(scenarioId) {
        this.selectedScenarioForOutputData = scenarioId;
        this.modalService.open(this.popupModal, { size: 'lg', windowClass: 'custom-modal-class' });
        /* this.analysisService.getScenarioData(scenarioId).subscribe(response => {
            this.riskFactorListData = response;
        }); */
    }

    /* getValue(id, master) {
        let t = this.masterDataObj[master].filter(e => e.value == id)[0];
        if (t) {
            return t.label;
        } else {
            return null;
        }
    } */

    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isFailure = showMessage;
        document.documentElement.scrollTop = 0;
        this.displayFailureMessage = displayValidationMessage;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    toggleMenu($event) {
        $event.stopPropagation();
        this.isAddAnalysis = !this.isAddAnalysis;
    }

    onClick() {
        this.isAddAnalysis = false;
    }
}
