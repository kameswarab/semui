import { Component, OnInit, ViewChild, ElementRef, Input, Renderer, Inject, NgZone } from '@angular/core';

import { Account } from 'app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScenarioService } from 'app/Scenario/scenario.service';
import { NgbModal, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as Highcharts from 'highcharts';
import * as $ from 'jquery';
import {
    EXPANSION_CATEGORY_PREDETERMINED,
    ALERT_MSG_TIME_OUT,
    SCENARIO_TYPE_PROJECTION,
    PAGE_SIZE,
    ANALYSIS_TYPE_COMPARISION,
    ANALYSIS_TYPE_PROPAGATION,
    ANALYSIS_TYPE_PREDICTION,
    ANALYSIS_TYPE_SCENARIO,
    EXPANSION_CATEGORY_MODEL_DRIVEN,
    EXPANSION_CATEGORY_BUSINESS_RULE,
    METHODOLOGY_INTERPOLATION,
    SCENARIO_REVIEW_INPROGRESS,
    SCENARIO_APPROVED,
    SCENARIO_REJECTED
} from 'app/constants';
import { JhiAlertService } from 'ng-jhipster';
import { MapChart } from 'angular-highcharts';
import worldMap from './worldMap';
import { PagerService } from 'app/pager.service';
//import * as html2canvas from 'html2canvas';
// import * as jspdf from 'jspdf';
import { AnalysisService } from 'app/analysis';
import 'ag-grid-enterprise';
import { GridOptions } from 'ag-grid';
import { getPropagationTree } from '../../../assets/getPropagationTree';
declare var canvg: any;
declare var html2canvas: any;
declare var Plotly: any;

@Component({
    selector: 'scenario-output',
    templateUrl: './scenarioOutput.component.html',
    styleUrls: ['../scenario.css']
})
export class ScenarioOutputComponent implements OnInit {
    @Input() selectedScenarioFromAnalysis;
    @ViewChild('workflowmodal')
    workflowmodal: ElementRef;

    ANALYSIS_TYPE_COMPARISION = ANALYSIS_TYPE_COMPARISION;
    ANALYSIS_TYPE_PROPAGATION = ANALYSIS_TYPE_PROPAGATION;
    analysisPrediction = ANALYSIS_TYPE_PREDICTION;

    analysisListFlag = true;

    mapChart: MapChart;
    actionsList: any;
    actionButton = null;
    account: Account;
    userCanAccess = false;
    currentRoleName: any;
    userCanAccessRole = {};
    comment: any;
    isAuthorized = false;
    validate = true;
    scenarioProjectionType = SCENARIO_TYPE_PROJECTION;
    isSentForReview = false;
    commentsList = [];
    roleModelsListOrg = [];
    roleModelsList = [];
    activeIds = [];
    @ViewChild('commentsModal')
    commentsModal: ElementRef;

    scenarioObj = {
        id: null,
        lastModifiedDate: null,
        lastModifiedBy: null,
        scenarioName: null,
        status: null,
        type: null,
        version: null,
        shockTemplate: null,
        shockTemplateVersion: null,
        isVersionUpdated: null
    };

    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    riskFactorSetList: any = [];
    riskFactorSetListTemp: any = [];

    riskFactorList = [];
    riskFactorListSub = [];
    riskFactorListMain = [];
    assetClassList = [];
    assetClassListForAnalysis = [];
    countryList = [];

    unitList = [];
    methodologyList = [];
    masterDataObj = {};
    masterDataObjForFilters = {};
    riskFactorForOverride = null;
    riskFactorForOverrideObj = null;
    map = [];
    highcharts = Highcharts;
    chartOptions = {
        chart: { type: 'pie' },
        title: {},
        xAxis: {},
        tooltip: {},
        series: [{ name: '', data: [] }],
        plotOptions: {},
        credits: {
            enabled: false
        }
    };
    chartOptionsABSSigma = {};
    chartOptionsRSQBucket = {};

    chartOptionsAvgABSStdShock = {
        chart: { type: 'column' },
        title: {},
        xAxis: {},
        tooltip: {},
        series: [{ name: '', data: [] }, { name: '', data: [] }],
        plotOptions: {},
        credits: {
            enabled: false
        }
    };
    selectedPeriod = null;
    shockPeriods = [];

    @ViewChild('overrideShockModal')
    overrideShockModal: ElementRef;
    @ViewChild('updateShockValues')
    updateShockValues: ElementRef;
    exs = [];
    filterList = [];
    filterAdvanceList = [];
    createFilter = {};
    filtersApplied = false;
    filterIcon = false;
    resultMap = {};

    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };
    designerCanAccess = false;
    fixedShockValue;
    overrideMarketShock: any;
    overrideMarketShockComments = '';

    expCatOldVal = 1;
    criFilter = false;
    filterObj = {
        rfName: null,
        astClsId: null,
        subRskFctrId: null,
        cntryId: null,
        frqncyId: null,
        mtrtyId: null,
        sctrId: null,
        rtngId: null,
        crvfmlyId: null,
        mthdlgyType: null,
        units: null,
        crncyId: null
    };
    astClsList;
    subRskFctrList;
    cntryList;
    crncyList;
    frequencyList;
    maturityList;
    sctrList;
    rtngList;
    cuvFlyList;
    medlgyList;
    unitsList;
    plotlyObjMap = {};
    popupPlottedRiskfactors = [];
    showPopupPlottedRiskfactors = false;

    riskFactorColorPallete = ['#375889', '#aaf0ba', '#fd7070', '#ffc785'];

    plotlyDataObj = {};
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
            'toImage',
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

    filterOrderMap = {};
    metadataShow = false;

    analysisList = [
        {
            id: ANALYSIS_TYPE_COMPARISION,
            name: 'Scenario Comparision',
            riskFactorList: [],
            scenarioList: [],
            selectedRiskFactorList: [],
            selectedScenarios: [],
            nullData: true,
            showPlottedRiskfactors: false,
            plottedRiskfactors: [],
            propagationColorCode: [],
            viewType: 'T',
            riskFactorSelection: 'F',
            selectedAssetClassList: []
        },
        {
            id: ANALYSIS_TYPE_PROPAGATION,
            name: 'Scenario Propagation',
            riskFactorList: [],
            scenarioList: [],
            selectedRiskFactorList: [],
            selectedScenarios: [],
            nullData: true,
            showPlottedRiskfactors: false,
            plottedRiskfactors: [],
            propagationColorCode: [],
            viewType: 'G',
            riskFactorSelection: 'T',
            selectedAssetClassList: []
        }
    ];

    analysis = {
        id: null,
        name: null,
        riskFactorList: [],
        scenarioList: [],
        selectedRiskFactorList: [],
        selectedScenarios: [],
        nullData: true,
        showPlottedRiskfactors: false,
        plottedRiskfactors: [],
        propagationColorCode: [],
        riskFactorSelection: null,
        viewType: null,
        selectedAssetClassList: []
    };

    @ViewChild('popupChartModal')
    popupChartModal: ElementRef;
    scenarioNameList = [];
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
    modalHeader = null;

    riskFactorInfo = {};
    riskFactorInfoDiv = false;
    EXPANSION_CATEGORY_MODEL_DRIVEN;
    EXPANSION_CATEGORY_BUSINESS_RULE;
    METHODOLOGY_INTERPOLATION;
    currentPage = null;
    rowWiseControls = [];

    assetList;
    subrskList;
    cntyList;
    crcyList;
    fqncyList;
    strList;
    ratngList;
    mtrtyList;
    crvfmlyList;
    mthdlgyList;
    untsList;
    isCalculated = false;
    constructor(
        private activatedRoute: ActivatedRoute,
        private scenarioService: ScenarioService,
        private router: Router,
        private modalService: NgbModal,
        private alertService: JhiAlertService,
        private pagerService: PagerService,
        private analysisService: AnalysisService,
        public renderer: Renderer,
        private _ngZone: NgZone,
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

    ngOnInit() {
        this.EXPANSION_CATEGORY_MODEL_DRIVEN = EXPANSION_CATEGORY_MODEL_DRIVEN;
        this.EXPANSION_CATEGORY_BUSINESS_RULE = EXPANSION_CATEGORY_BUSINESS_RULE;
        this.METHODOLOGY_INTERPOLATION = METHODOLOGY_INTERPOLATION;
        this.mapChart = new MapChart();
        this.chartOptionsABSSigma = Object.assign({}, this.chartOptions);
        this.chartOptionsRSQBucket = Object.assign({}, this.chartOptions);

        this.scenarioObj.id = this.activatedRoute.snapshot.params.id;

        if (this.selectedScenarioFromAnalysis) {
            this.scenarioObj.id = this.selectedScenarioFromAnalysis;
        } else {
            this.scenarioObj.id = this.activatedRoute.snapshot.params.id;
        }

        if (this.scenarioObj.id && 'null' !== this.scenarioObj.id) {
            this.getWorkflowUsers(this.scenarioObj.id);
            this.scenarioService.getScenarioData(Number(this.scenarioObj.id)).subscribe(
                response => {
                    this.scenarioObj = response;
                    if (this.scenarioObj.status != SCENARIO_APPROVED) {
                        this.getActions(this.scenarioObj.id);
                        this.taskAssigned(this.scenarioObj.id);
                    }
                    if (this.scenarioObj.status == SCENARIO_REVIEW_INPROGRESS || this.scenarioObj.status == SCENARIO_REJECTED) {
                        this.userCanAccessData(this.scenarioObj.id);
                    }
                    this.getCommentsList();
                    if (
                        this.scenarioObj.isVersionUpdated == 'Y' ||
                        this.scenarioObj.isVersionUpdated == 'N' ||
                        (this.scenarioObj.isVersionUpdated == null && this.scenarioObj.shockTemplate != 0)
                    ) {
                        if (this.scenarioObj.shockTemplateVersion != this.scenarioObj.version) {
                            this.modalService.open(this.updateShockValues, {});
                        }
                    }
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
            this.getMasterListForOutput();
            this.filterList = [
                { value: 'setId', label: 'Risk factor sets', table: 'SET_MST' },
                { value: 'astClsId', label: 'Units', table: 'DIM_AST_CLS_MST' },
                { value: 'subRskFctrId', label: 'Frequency', table: 'DIM_RSKFCT_TYP_MST' },
                { value: 'cntryId', label: 'Country', table: 'DIM_CNTRY_MST' },
                { value: 'crncyId', label: 'Currency', table: 'DIM_CURNCY_MST' },
                { value: 'units', label: 'Units', table: 'DIM_UNIT_MST' },
                { value: 'frqncyId', label: 'Frequency', table: 'DIM_FREQUENCY_MST' },
                { value: 'mtrtyId', label: 'Maturity', table: 'DIM_MTURTY_MST' },
                { value: 'sctrId', label: 'Sector', table: 'DIM_SETR_MST' },
                { value: 'rtngId', label: 'Rating', table: 'DIM_RTNG_MST' },
                { value: 'crvfmlyId', label: 'Curve Family', table: 'MST_CURVE_FAMILY' }
            ];
            this.filterAdvanceList = [
                { value: 'units', label: 'Units', table: 'DIM_UNIT_MST' },
                { value: 'frqncyId', label: 'Frequency', table: 'DIM_FREQUENCY_MST' },
                { value: 'mtrtyId', label: 'Maturity', table: 'DIM_MTURTY_MST' },
                { value: 'sctrId', label: 'Sector', table: 'DIM_SETR_MST' },
                { value: 'cntryId', label: 'Country', table: 'DIM_CNTRY_MST' },
                { value: 'rtngId', label: 'Rating', table: 'DIM_RTNG_MST' },
                { value: 'crvfmlyId', label: 'Curve Family', table: 'MST_CURVE_FAMILY' }
            ];
        } else {
            this.router.navigate(['scenario', {}], { skipLocationChange: true });
        }
    }

    taskAssigned(id) {
        this.scenarioService.taskAssigned(this.scenarioObj.id).subscribe(response => {
            this.userCanAccess = response;
        });
    }

    getMasterListForOutput() {
        this.scenarioService.getMasterListForOutput(parseInt(this.scenarioObj.id)).subscribe(
            response => {
                this.masterDataObj = response;

                this.assetClassList = this.masterDataObj['DIM_AST_CLS_MST'];
                this.assetClassListForAnalysis = this.assetClassList;
                this.countryList = this.masterDataObj['DIM_CNTRY_MST'];

                this.shockPeriods = response['SHOCK_PERIODS'];

                let keys = Object.keys(this.shockPeriods);

                this.selectedPeriod = keys[0];

                this.unitList = this.masterDataObj['DIM_UNIT_MST'];
                this.methodologyList = this.masterDataObj['MST_METHDLGY'];
                if (this.scenarioObj.id) {
                    this.getRiskFactorSetList(parseInt(this.scenarioObj.id));
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    setPage(page) {
        this.filterGridData();
        let totalSize = this.riskFactorListSub.length;
        this.pager = this.pagerService.getPager(totalSize, page, PAGE_SIZE);

        if (page < 1 || page > this.pager.totalPages) {
            this.riskFactorListSub = [];
            return;
        }

        this.riskFactorListSub = this.riskFactorListSub.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    generateCharts() {
        var colorPalleteABS = ['#55d471', '#aaf0ba', '#ffc785', '#fd7070'];
        var colorPallete = ['#fd7070', '#ffc785', '#aaf0ba', '#55d471'];
        const mapABSSigmaData = {};
        mapABSSigmaData['0-1σ'] = 0;
        mapABSSigmaData['1-2σ'] = 0;
        mapABSSigmaData['2-3σ'] = 0;
        mapABSSigmaData['3σ+'] = 0;

        const mapRSQBucketData = {};
        mapRSQBucketData['0-30%'] = 0;
        mapRSQBucketData['30-50%'] = 0;
        mapRSQBucketData['50-75%'] = 0;
        mapRSQBucketData['>75%'] = 0;

        let mapAvgABSStdShockData = {};

        let mapAvgABSStdShockMapData = {};

        this.riskFactorList.forEach(ele => {
            if (ele['stdShockValues'][this.selectedPeriod]) {
                let t = ele['stdShockValues'][this.selectedPeriod];
                switch (true) {
                    case 0 <= t && t <= 1:
                        mapABSSigmaData['0-1σ'] = mapABSSigmaData['0-1σ'] + 1;
                        break;
                    case 1 <= t && t <= 2:
                        mapABSSigmaData['1-2σ'] = mapABSSigmaData['1-2σ'] + 1;
                        break;
                    case 2 <= t && t <= 3:
                        mapABSSigmaData['2-3σ'] = mapABSSigmaData['2-3σ'] + 1;
                        break;
                    case 3 < t:
                        mapABSSigmaData['3σ+'] = mapABSSigmaData['3σ+'] + 1;
                        break;
                    default:
                        break;
                }
            }
            if (ele.rsq) {
                const t = Number(ele.rsq);
                switch (true) {
                    case 0 <= t && t <= 30:
                        mapRSQBucketData['0-30%'] = mapRSQBucketData['0-30%'] + 1;
                        break;
                    case 30 <= t && t <= 50:
                        mapRSQBucketData['30-50%'] = mapRSQBucketData['30-50%'] + 1;
                        break;
                    case 50 <= t && t <= 75:
                        mapRSQBucketData['50-75%'] = mapRSQBucketData['50-75%'] + 1;
                        break;
                    case 75 < t:
                        mapRSQBucketData['>75%'] = mapRSQBucketData['>75%'] + 1;
                        break;
                    default:
                        break;
                }
            }
            let tempMap = mapAvgABSStdShockData[ele.astClsId] || { input: [], output: [] };
            let tempList = mapAvgABSStdShockMapData[ele.cntryId] || [];
            if (ele['stdShockValues'][this.selectedPeriod]) {
                if (ele.expCat === EXPANSION_CATEGORY_PREDETERMINED) {
                    tempMap['input'].push(Number(ele['stdShockValues'][this.selectedPeriod]));
                } else {
                    tempMap['output'].push(Number(ele['stdShockValues'][this.selectedPeriod]));
                }
                tempList.push(Number(ele['stdShockValues'][this.selectedPeriod]));
            }

            mapAvgABSStdShockData[ele.astClsId] = tempMap;
            mapAvgABSStdShockMapData[ele.cntryId] = tempList;
        });

        let chartOptionsABSSigmaData = [];
        let chartOptionsRSQBucketData = [];
        let chartOptionsAvgABSStdShockData = [];

        Object.keys(mapABSSigmaData).forEach((element, index) => {
            chartOptionsABSSigmaData.push({ name: element, y: mapABSSigmaData[element], color: colorPalleteABS[index] });
        });

        Object.keys(mapRSQBucketData).forEach((element, index) => {
            chartOptionsRSQBucketData.push({ name: element, y: mapRSQBucketData[element], color: colorPallete[index] });
        });

        let categories = [];
        let inputData = [];
        let outputData = [];
        Object.keys(mapAvgABSStdShockData).forEach((element: any) => {
            let asstCls = this.assetClassList.filter(e => e.value == element);
            if (asstCls && asstCls.length > 0) {
                categories.push(asstCls[0].label);
                const inputArr = mapAvgABSStdShockData[element]['input'];
                const outputArr = mapAvgABSStdShockData[element]['output'];
                let val = 0;
                if (inputArr && inputArr.length > 0) {
                    val = inputArr.reduce((p, c) => p + c, 0) / inputArr.length;
                }
                inputData.push(val);
                val = 0;
                if (outputArr && outputArr.length > 0) {
                    val = outputArr.reduce((p, c) => p + c, 0) / outputArr.length;
                }
                outputData.push(val);
            }
        });
        chartOptionsAvgABSStdShockData.push({ name: 'Input', data: inputData, color: colorPallete[0] });
        chartOptionsAvgABSStdShockData.push({ name: 'Output', data: outputData, color: colorPallete[1] });

        const plotOptionsABSSigmaData = {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                innerSize: '60%',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        };
        const optionsXAxisAvgABSStdShock = {
            categories: categories
        };

        /**ABS.Std Shock calc */
        let mapChartData = [];
        Object.keys(mapAvgABSStdShockMapData).forEach((element: any) => {
            let tmp = this.countryList.filter(e => e.value + '' == element);
            if (tmp && tmp.length > 0) {
                let code3 = tmp[0].abvn;

                let array = mapAvgABSStdShockMapData[element];

                let val = 0;
                if (array && array.length > 0) {
                    val = array.reduce((p, c) => p + c, 0) / array.length;
                }
                mapChartData.push({ code3: code3, z: val, color: this.getColorForMap(val) });
            }
        });

        this.chartOptionsABSSigma = this.getchartOptions(
            this.chartOptions,
            'pie',
            'Abs Sigma',
            '{point.percentage:.1f}%</b>',
            [{ data: chartOptionsABSSigmaData }],
            plotOptionsABSSigmaData,
            {}
        );
        this.chartOptionsRSQBucket = this.getchartOptions(
            this.chartOptions,
            'pie',
            'R-SQ Bucket',
            '{point.percentage:.0f}%</b>',
            [{ data: chartOptionsRSQBucketData }],
            plotOptionsABSSigmaData,
            {}
        );
        this.chartOptionsAvgABSStdShock = this.getchartOptions(
            this.chartOptions,
            'column',
            'Avg Abs Std Shock',
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            chartOptionsAvgABSStdShockData,
            {},
            optionsXAxisAvgABSStdShock
        );

        let worldMapData: any = worldMap;
        let joinByCode = 'iso-a2';
        if (mapChartData && mapChartData.length > 0 && mapChartData[0].code3 && mapChartData[0].code3.length == 3) {
            joinByCode = 'iso-a3';
        }

        this.mapChart = new MapChart({
            chart: {
                map: worldMapData
            },
            title: {
                text: 'Abs Std Shock'
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            mapNavigation: {
                enabled: false,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            series: [
                <Highcharts.SeriesColumnOptions>{
                    name: 'Countries',
                    color: '#E0E0E0',
                    enableMouseTracking: true
                },
                {
                    type: 'mapbubble',
                    name: '',
                    joinBy: [joinByCode, 'code3'],
                    data: mapChartData,
                    minSize: 10,
                    maxSize: 10,
                    color: Highcharts.getOptions().colors[0],
                    tooltip: {
                        pointFormat: '{point.name}: {point.z}'
                    }
                }
            ]
        });
    }

    getColorForMap(val) {
        if (val <= 1) {
            return '#55d471';
        } else if (val <= 2) {
            return '#aaf0ba';
        } else if (val <= 3) {
            return '#ffc785';
        } else {
            return '#fd7070';
        }
    }

    getchartOptions(options, type, name, tooltipStr, data, plotOptions, optionsXAxis) {
        options = {
            chart: {
                type: type
            },
            title: {
                text: name
            },
            xAxis: optionsXAxis,
            tooltip: {
                pointFormat: tooltipStr
            },
            plotOptions: plotOptions,
            series: data
        };
        return options;
    }

    getProjectedShock(riskfactor, type) {
        if (type == 'SHOCK') {
            return riskfactor['shockValues'][this.selectedPeriod];
        } else if (type == 'STD_SHOCK' && riskfactor['stdShockValues'] != null) {
            return riskfactor['stdShockValues'][this.selectedPeriod];
        } else if (type == 'OVERRIDE_SHOCK') {
            const overrideShockValues = riskfactor['overrideShockValues'][this.selectedPeriod] + '';
            if (overrideShockValues && overrideShockValues != null && overrideShockValues != '') {
                return overrideShockValues + '';
            }
        } else if (type == 'COMMENTS') {
            return riskfactor['usrCmnts'] ? riskfactor['usrCmnts'][this.selectedPeriod] : null;
        }
        return null;
    }

    getRiskFactorSetList(id) {
        this.riskFactorSetListTemp = [];

        this.scenarioService.getRiskFactorSetList(id).subscribe(
            response => {
                this.riskFactorSetList = response;
                let riskFactorSetListTemp1 = [];
                this.riskFactorSetList.forEach(function(element) {
                    riskFactorSetListTemp1.push({ value: element.id, label: element.riskFactorSetName });
                });
                this.riskFactorSetListTemp = riskFactorSetListTemp1;

                this.getRiskFacotorList();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getRiskFacotorList() {
        this.riskFactorList = [];
        this.riskFactorListMain = [];

        this.scenarioService.getRiskFactorList({ scenarioId: parseInt(this.scenarioObj.id), setId: null }).subscribe(
            (response: any) => {
                this.riskFactorListMain = response['RISK_FACTORS'];

                this.updateMasterData();

                this.changeFilters(null);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    updateMasterData() {
        this.masterDataObj['SET_MST'] = this.riskFactorSetListTemp;
        this.filterList.forEach(filter => {
            let key = filter.value;
            let tempList = this.riskFactorListMain.map(rf => rf[key]);
            this.masterDataObj[filter.table] = this.masterDataObj[filter.table].filter(item => tempList.indexOf(item['value']) != -1);
        });

        this.masterDataObjForFilters = Object.assign({}, this.masterDataObj);
    }

    getMaxOrderVal() {
        let order = 0;
        Object.keys(this.filterOrderMap).forEach(key => {
            let orderTemp = this.filterOrderMap[key];
            if (orderTemp && order < orderTemp) {
                order = orderTemp;
            }
        });
        return order + 1;
    }

    filterCheckboxChange(event, filter, value) {
        let list = this.createFilter[filter] || [];
        if (event.target.checked) {
            let order = this.filterOrderMap[filter];
            if (!order) {
                this.filterOrderMap[filter] = this.getMaxOrderVal();
            }
            list.push(value);
        } else {
            list = list.filter(p => p != value);
        }
        this.createFilter[filter] = list;
        this.changeFilters(filter);
    }

    resetFilters() {
        this.filterOrderMap = {};
        this.filtersApplied = false;
        this.filterIcon = false;
        this.createFilter = {};

        this.masterDataObjForFilters = Object.assign({}, this.masterDataObj);
        this.masterDataObjForFilters['SET_MST'] = this.riskFactorSetListTemp;
        this.changeFilters(null);
    }

    changeFilters(filter) {
        this.filtersApplied = false;
        this.filterIcon = false;
        let selectedFilterMaster = [];
        if (filter) {
            let obj = this.filterList.filter(p => p.value == filter)[0]['table'];
            selectedFilterMaster = this.masterDataObjForFilters[obj];
        }

        Object.keys(this.createFilter).forEach(key => {
            if (this.createFilter[key] && this.createFilter[key].length > 0) {
                this.filtersApplied = true;
                if (key != 'rfSet' && key != 'astClsId' && key != 'subRskFctrId' && key != 'crncyId') {
                    this.filterIcon = true;
                }
            }
        });

        this.riskFactorList = [];

        let filterOrder = null;
        if (this.filterOrderMap != null) {
            filterOrder = this.filterOrderMap[filter];
        }

        let rfList = this.riskFactorListMain;
        Object.keys(this.createFilter).forEach(key => {
            let list = this.createFilter[key];
            let keyOrder = this.filterOrderMap[key];
            if (list && list.length > 0 && keyOrder && filterOrder >= keyOrder) {
                rfList = rfList.filter(rf => list.indexOf(rf[key]) != -1);
            }
        });

        this.filterList.forEach(filterObj => {
            let factorTypeIds = [];
            let key = filterObj.value;
            rfList.forEach(rf => {
                let val = rf[key];
                if (val) {
                    factorTypeIds.push(val);
                }
            });
            let keyOrder = this.filterOrderMap[key];
            if (key != filter && (!keyOrder || filterOrder < keyOrder)) {
                let lTemp = this.masterDataObj[filterObj.table].filter(item => factorTypeIds.indexOf(item['value']) != -1);
                this.masterDataObjForFilters[filterObj.table] = lTemp;
            } else if (key == filter) {
                this.masterDataObjForFilters[filterObj.table] = selectedFilterMaster;
            } else {
                this.masterDataObjForFilters[filterObj.table] = this.masterDataObj[filterObj.table];
            }

            if (factorTypeIds.length > 0) {
                let lTemp = this.masterDataObjForFilters[filterObj.table].map(e => e['value']);
                let fList = this.createFilter[key];
                if (fList && fList.length > 0) {
                    this.createFilter[filterObj.value] = fList.filter(item => lTemp.indexOf(item) != -1);
                } else {
                    this.createFilter[filterObj.value] = null;
                }
            } else {
                this.createFilter[filterObj.value] = null;
            }
        });

        let filterKeys = Object.keys(this.createFilter);
        filterKeys.forEach(key => {
            let selectedList = this.createFilter[key];
            if (selectedList && selectedList.length > 0) {
                let keyOrder = this.filterOrderMap[key];
                if (key != filter && (!keyOrder || filterOrder < keyOrder)) {
                    rfList = rfList.filter(rf => selectedList.indexOf(rf[key]) != -1);
                }
            }
        });

        this.riskFactorList = rfList;
        if (this.currentPage && null != this.currentPage && this.currentPage > 1) {
            this.setPage(this.currentPage);
        } else {
            this.setPage(1);
        }
        this.generateCharts();
    }

    /*  sendForReview() {
        const action = {
            scenarioId: this.scenarioObj.id,
            comments: this.comment
        };

        this.scenarioService.sendForReview(action).subscribe(
            response => {
                this.getActions(this.scenarioObj.id);
                this.taskAssigned(this.scenarioObj.id);
                this.userCanAccessData(this.scenarioObj.id);
                this.alertService.success('Successfully sent to reviewer/approver');
            },
            response => {
                this.alertService.error('Failed to Approve');
            }
        );
    } */

    sendForApprove() {
        if (this.comment == null || this.comment == '') {
            this.showErrorValidations(true, 'Please provide a comment');
            return false;
        }
        const action = {
            scenarioId: this.scenarioObj.id,
            comments: this.comment
        };
        this.scenarioService.sendForApprove(action).subscribe(response => {
            this.modalService.dismissAll();
            this.alertService.success('Successfully Sent to Reviewer/Approver');
            this.getActions(this.scenarioObj.id);
            this.taskAssigned(this.scenarioObj.id);
            this.userCanAccessData(this.scenarioObj.id);
            this.getCommentsList();
        });
    }

    save() {
        this.roleModelsList.forEach(element => {
            if ((element.name == 'reviewer1' && element.selected == null) || (element.name == 'approver1' && element.selected == null)) {
                this.showErrorValidations(true, 'Reviewer1 & Approver1 are mandatory fields');
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
        this.scenarioService.saveRoles(this.roleModelsList).subscribe(response => {
            this.sendForApprove();
            this.modalService.dismissAll();
            this.showSuccessValidations(true, 'Successfully saved and sent to reviewer.');
        });
    }

    reject() {
        const action = {
            scenarioId: this.scenarioObj.id,
            comments: this.comment
        };
        this.scenarioService.reject(action).subscribe(
            response => {
                this.getActions(this.scenarioObj.id);
                this.taskAssigned(this.scenarioObj.id);
                this.getCommentsList();
                this.userCanAccessData(this.scenarioObj.id);
                this.modalService.dismissAll();
                this.alertService.success('Successfully sent to reviewer/approver');
            },
            response => {
                this.alertService.error('Failed to reject');
            }
        );
    }

    openOverrideShockModalModal(riskFactor) {
        this.overrideMarketShockComments = '';
        this.isFailure = false;
        if (riskFactor.overrideShockValues[this.selectedPeriod] == null || riskFactor.overrideShockValues[this.selectedPeriod] == '') {
            let oldshockval = riskFactor['shockValues'][this.selectedPeriod];
            let overrideShockValue = riskFactor['overrideShockValues'][this.selectedPeriod];
            if (overrideShockValue !== '') {
                this.overrideMarketShock = overrideShockValue;
                this.overrideMarketShockComments = riskFactor['usrCmnts'][this.selectedPeriod];
            } else {
                this.overrideMarketShock = oldshockval;
            }
        } else {
            this.overrideMarketShock = riskFactor['overrideShockValues'][this.selectedPeriod];
            this.overrideMarketShockComments = riskFactor['usrCmnts'][this.selectedPeriod];
        }
        this.modalService.open(this.overrideShockModal, {});
        this.riskFactorForOverride = riskFactor;
        this.riskFactorForOverrideObj = Object.assign({}, riskFactor);
    }

    overrideRiskFactorShock() {
        this.currentPage = this.pager.currentPage;
        if (this.overrideMarketShock == null) {
            this.showErrorValidations(true, 'Please provide a shock value');
            return false;
        } else if (this.overrideMarketShockComments == null || this.overrideMarketShockComments == '') {
            this.showErrorValidations(true, 'Please provide a comment');
            return false;
        }

        if (this.overrideMarketShock !== '' && this.overrideMarketShockComments && this.overrideMarketShockComments.length > 0) {
            this.fixedShockValue = this.overrideMarketShock;
            let numRound = this.roundToTwo(parseFloat(this.fixedShockValue));

            let oldValue = this.riskFactorForOverride['overrideShockValues'][this.selectedPeriod];
            if (!oldValue) {
                oldValue = this.riskFactorForOverride['shockValues'][this.selectedPeriod];
            }

            this.riskFactorForOverride['overrideShockValues'][this.selectedPeriod] = numRound;

            this.riskFactorForOverride.usrCmnts = this.riskFactorForOverride.usrCmnts || {};

            this.riskFactorForOverride.usrCmnts[this.selectedPeriod] = this.overrideMarketShockComments;

            let overrideDto = {
                oldValue: oldValue,
                newValue: numRound,
                riskfactor: this.riskFactorForOverride.name,
                comment: this.riskFactorForOverride.usrCmnts[this.selectedPeriod],
                period: this.selectedPeriod
            };

            this.saveRiskFactorSet(this.riskFactorForOverride.setId, overrideDto);

            this.cancel();
        }
    }

    roundToTwo(num) {
        return Math.round((num + 0.00001) * 100) / 100;
    }

    saveRiskFactorSet(setId, overrideDto) {
        let riskFactorSetObj = this.riskFactorSetList.filter(ele => ele.id == setId)[0];
        let list = this.riskFactorList.filter(p => p.setId == setId);

        list.forEach(function(v) {
            delete v.setId;
        });

        riskFactorSetObj.scenarioLastModifiedDate = this.scenarioObj.lastModifiedDate;
        riskFactorSetObj.riskFactorListJSON = JSON.stringify(list);
        riskFactorSetObj.overrideDto = overrideDto;

        this.scenarioService.overrideRiskFactor(riskFactorSetObj).subscribe(
            response => {
                this.scenarioObj.lastModifiedDate = response['scenarioLastModifiedDate'];
                this.scenarioObj.status = response['status'];
                this.getRiskFactorSetList(Number(this.scenarioObj.id));
                this.showSuccessValidations(true, 'Values overrided successfully.');
                this.activityLog = [];
            },
            response => {
                this.getRiskFactorSetList(Number(this.scenarioObj.id));
                this.showErrorValidations(true, response.error);
            }
        );
    }

    exportToPDF(type) {
        const imgWidth = 68;
        const imgHeight = 100;
        const margin = 5;

        let scenarioName = this.scenarioObj.scenarioName;
        let selectedPeriod = this.selectedPeriod;

        let chartImageMap = {};
        let data1 = document.getElementById('graphset_div');
        let i = 0;

        let $container = $('#graphset_div');
        let svgElements = $container.find('svg');
        try {
            svgElements.each(function() {
                let canvas, xml;
                canvas = document.createElement('canvas');
                canvas.className = 'screenShotTempCanvas';
                xml = new XMLSerializer().serializeToString(this);
                let xmlTemp = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
                canvg(canvas, xmlTemp);
                $(canvas).insertAfter(this);
                $(this).hide();
            });
        } catch (e) {
            console.log(e);
            svgElements.each(function() {
                $(this).show();
            });
            let canvasElements = $container.find('.screenShotTempCanvas');
            canvasElements.each(function() {
                $(this).remove();
            });
        }

        html2canvas(data1).then(canvas => {
            chartImageMap['graphData'] = canvas.toDataURL('image/png');
            i++;
        });

        let scenarioService = this.scenarioService;
        let riskFactorList = this.riskFactorList;

        let interval = setInterval(function() {
            if (i === 1) {
                clearInterval(interval);
                riskFactorList.forEach(function(v) {
                    delete v.setId;
                });

                let obj = {
                    imageData: chartImageMap,
                    projectionPeriod: selectedPeriod,
                    scenarioName: scenarioName,
                    riskFactorList: JSON.stringify(riskFactorList),
                    type: type
                };
                scenarioService.exportOutput(obj).subscribe(
                    response => {
                        let blob = new Blob([response]);
                        let fileName = scenarioName + '.pdf';
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
                        svgElements.each(function() {
                            $(this).show();
                        });
                        let canvasElements = $container.find('.screenShotTempCanvas');
                        canvasElements.each(function() {
                            $(this).remove();
                        });
                    },
                    response => {
                        svgElements.each(function() {
                            $(this).show();
                        });
                        let canvasElements = $container.find('.screenShotTempCanvas');
                        canvasElements.each(function() {
                            $(this).remove();
                        });
                    }
                );
            }
        }, 200);
    }

    exportTo(type) {
        if (type === 'PDF') {
            this.exportToPDF(type);
        } else {
            let scenarioName = this.scenarioObj.scenarioName;
            let selectedPeriod = this.selectedPeriod;
            let chartImageMap = {};

            let data1 = document.getElementById('graphset_div');
            let i = 0;

            let $container = $('#graphset_div');
            let svgElements = $container.find('svg');

            try {
                svgElements.each(function() {
                    let canvas, xml;
                    canvas = document.createElement('canvas');
                    canvas.className = 'screenShotTempCanvas';
                    xml = new XMLSerializer().serializeToString(this);
                    let xmlTemp = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
                    canvg(canvas, xmlTemp);
                    $(canvas).insertAfter(this);
                    $(this).hide();
                });
            } catch (e) {
                console.log(e);
                svgElements.each(function() {
                    $(this).show();
                });
                let canvasElements = $container.find('.screenShotTempCanvas');
                canvasElements.each(function() {
                    $(this).remove();
                });
            }

            html2canvas(data1).then(canvas => {
                chartImageMap['graphData'] = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
                i++;
            });

            let scenarioService = this.scenarioService;
            let riskFactorList = this.riskFactorList;
            let interval = setInterval(function() {
                if (i === 1) {
                    clearInterval(interval);
                    riskFactorList.forEach(function(v) {
                        delete v.setId;
                    });

                    let obj = {
                        imageData: chartImageMap,
                        projectionPeriod: selectedPeriod,
                        scenarioName: scenarioName,
                        riskFactorList: JSON.stringify(riskFactorList),
                        type: type
                    };
                    scenarioService.exportOutput(obj).subscribe(
                        response => {
                            let blob = new Blob([response]);
                            let fileName = scenarioName + '.pdf';
                            if (type == 'EXCEL') {
                                fileName = scenarioName + '.xlsx';
                            }
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
                            svgElements.each(function() {
                                $(this).show();
                            });
                            let canvasElements = $container.find('.screenShotTempCanvas');
                            canvasElements.each(function() {
                                $(this).remove();
                            });
                        },
                        response => {
                            svgElements.each(function() {
                                $(this).show();
                            });
                            let canvasElements = $container.find('.screenShotTempCanvas');
                            canvasElements.each(function() {
                                $(this).remove();
                            });
                        }
                    );
                }
            }, 200);
        }
    }

    getValue(id, master) {
        let medId = id;
        if (master == 'MST_METHDLGY') {
            if (null != id && id.indexOf('_') > -1) {
                medId = id.split('_')[2];
            }
        }
        let t = this.masterDataObj[master].filter(e => e.value == medId)[0];
        if (t) {
            return t.label;
        } else {
            return null;
        }
    }

    cancel() {
        this.modalService.dismissAll();
        this.metadataShow = false;
        this.riskFactorForOverride = null;
        this.riskFactorForOverrideObj = null;
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.scenarioObj.id }], { skipLocationChange: true });
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

    getWorkflowUsers(id) {
        this.scenarioService.getRoleModel(id).subscribe(response => {
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
        this.scenarioService.getAction(id).subscribe(response => {
            this.actionButton = response[0];
        });
    }

    /* action(object) {
        this.scenarioService.action(object).subscribe(response => {
            this.alertService.success('Status updated successfully.');
            this.getActions(this.scenarioObj.id);
        });
    } */

    openModel() {
        this.modalService.open(this.workflowmodal, {
            size: 'lg'
        });
        this.getCommentsList();
    }

    getCommentsList() {
        this.scenarioService.getCommentsList(this.scenarioObj.id).subscribe(response => {
            this.commentsList = response;
            if (this.scenarioObj.status != SCENARIO_APPROVED) {
                this.scenarioService.checkAccess(this.scenarioObj.id).subscribe(res => {
                    this.designerCanAccess = res;
                });
            }
        });
    }

    userCanAccessData(id) {
        this.scenarioService.userCanAccess(id).subscribe(response => {
            this.isAuthorized = response;
        });
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

    updateShockTemplate(path) {
        this.modalService.dismissAll();
        this.scenarioObj.isVersionUpdated = 'Y';
        this.scenarioService.updateShockTemplateObj(this.scenarioObj).subscribe(
            response => {
                this.navigateTo(path);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    closeShockTemplate(isUpdate) {
        this.modalService.dismissAll();
        this.scenarioObj.isVersionUpdated = isUpdate;
        this.scenarioService.updateShockTemplateObj(this.scenarioObj).subscribe(
            response => {},
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    filterData() {
        this.setPage(1);
    }

    filterGridData() {
        let riskFactorListSub = this.riskFactorList;
        let filterObj = this.filterObj;
        let filterKeys = Object.keys(filterObj);

        filterKeys.forEach(element => {
            let filterValues = filterObj[element];
            if (filterValues != null) {
                if (element == 'rfName') {
                    riskFactorListSub = riskFactorListSub.filter(element2 => {
                        if (
                            element2['name'] != '' &&
                            element2['name'] != null &&
                            element2['name'].toLowerCase().indexOf(filterValues.toLowerCase()) > -1
                        ) {
                            return element2;
                        }
                    });
                } else {
                    if (filterValues.length > 0) {
                        riskFactorListSub = riskFactorListSub.filter(function(el) {
                            return filterValues.some(function(f) {
                                return el[element] == f;
                            });
                        });
                    }
                }
            }
        });
        this.riskFactorListSub = riskFactorListSub;
    }

    toggleInfoAndAnalysis(event: NgbTabChangeEvent) {
        this.activeIds = [event.nextId];
        if (event.nextId == 'analysis_tab') {
            if (!this.analysisListFlag && this.analysis.id) {
                let resp = this.resultMap[this.analysis.id];
                if (resp && resp.length > 0) {
                    setTimeout(() => {
                        this.processOutput(
                            this.analysis.id,
                            this.analysis['viewType'],
                            this.analysis['graphType'],
                            null,
                            resp,
                            this.analysis
                        );
                    }, 100);
                }
            }
        }
    }

    download(id, name) {
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

    getAnalysis(analysisType) {
        this.analysis = Object.assign({}, this.analysisList.filter(p => p.id == analysisType)[0]);
        this.analysisListFlag = true;
        if (analysisType == ANALYSIS_TYPE_COMPARISION) {
            let scenarioObj = {
                scenarioTypeId: this.scenarioObj.type,
                scenarioIdList: [this.scenarioObj.id]
            };

            this.analysisService.getScenarioList(scenarioObj).subscribe(
                response => {
                    let scenarioList = response;
                    scenarioList = scenarioList.filter(p => p.value != this.scenarioObj.id);
                    this.analysis.scenarioList = scenarioList;
                    this.analysisListFlag = false;
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else if (analysisType == ANALYSIS_TYPE_PROPAGATION) {
            let scenarioIds = [this.scenarioObj.id];
            let obj = {
                analysisTypeId: ANALYSIS_TYPE_PROPAGATION,
                analysisType: 'S',
                scenarioIdList: scenarioIds,
                assetClassList: []
            };

            this.analysisService.getRiskFactorList(obj).subscribe(
                response => {
                    this.analysis.riskFactorList = response;
                    this.analysisListFlag = false;
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    analyze() {
        let scenarioIds = Object.assign([], this.analysis.selectedScenarios);
        scenarioIds.push(this.scenarioObj.id);

        let selectedRiskFactors = this.analysis.riskFactorList.filter(e => this.analysis.selectedRiskFactorList.indexOf(e.value) != -1);

        let dto = {
            analysisTypeId: this.analysis.id,
            scenarioTypeId: this.scenarioObj.type,
            analysisType: 'S',
            assetClassList: this.analysis.selectedAssetClassList,
            riskFactorTypeList: [],
            scenarioIdList: scenarioIds,
            riskfactorList: selectedRiskFactors,
            projectionPeriod: 'Shock',
            riskFactorSelection: this.analysis.riskFactorSelection,
            curveFamily: null
        };

        this.getAnalysisData(dto, this.analysis['viewType'], null, null, this.analysis);
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
                        this.analysis.propagationColorCode = response[0].colorSet;
                        analysis.plottedRiskfactors = response[0].selectedassetClassList;
                        if (nodes.length == 0) {
                            this.showErrorValidations(true, 'Selected scenario doesnt have Dependent Riskfactors');
                            return false;
                        }
                    }
                    analysis.nullData = false;
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
                            menuTabs: ['filterMenuTab']
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
                        menuTabs: ['filterMenuTab']
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
                this.renderPlotlyChart(data, divType, analysisTypeId, analysis);
            }
        }
    }

    renderPropagationTreeGraph(dataStr: any, analysisTypeId) {
        let data = dataStr['JSON'];
        if (data && data['nodes'] && data['nodes'].length > 0) {
            let elementId = '#plotlyChart_' + analysisTypeId;
            let analysisTemp = this.analysisList.filter(p => p.id == analysisTypeId)[0];
            let analysis = {
                selectedScenarios: analysisTemp.selectedScenarios
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

    getRiskFactorPrediction(riskfactor, analysis) {
        this.modalHeader = riskfactor.label;

        let element = document.getElementById('plotlyPopupChart');
        if (element) {
            element.innerHTML = '';
        }

        let scenarioIds = Object.assign([], analysis.selectedScenarios);
        scenarioIds.push(this.scenarioObj.id);

        let dto = {
            analysisTypeId: ANALYSIS_TYPE_PREDICTION,
            scenarioTypeId: this.scenarioObj.type,
            analysisType: 'S',
            assetClassList: [],
            riskFactorTypeList: [],
            scenarioIdList: scenarioIds,
            riskfactorList: [riskfactor],
            projectionPeriod: 'Shock',
            startDate: null,
            endDate: null,
            riskFactorSelection: 'T'
        };

        this.getAnalysisData(dto, 'G', 'LINE', 'POPUP', analysis);
    }

    renderPlotlyChart(dataObj, divType, analysisTypeId, analysis) {
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

            this.plotlyObjMap[chartId] = this.plotTimeseries(element, shockData, timeSeriesData, analysisTypeId, analysis);
        }, 100);
    }

    plotTimeseries(element, shockData, timeSeriesData, analysisId, analysis) {
        analysis.showPlottedRiskfactors = false;
        this.showPopupPlottedRiskfactors = false;
        this.popupPlottedRiskfactors = [];
        let shocks = Object.keys(shockData);
        analysis.plottedRiskfactors = [];
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
                type: 'scatter',
                mode: mode,
                line: { color: this.riskFactorColorPallete[i] }
            });
            if (analysisId == 'POPUP') {
                this.popupPlottedRiskfactors.push({ color: this.riskFactorColorPallete[i++], rfName: shock, show: true });
            } else {
                analysis.plottedRiskfactors.push({ color: this.riskFactorColorPallete[i++], rfName: shock, show: true });
            }
        });

        let xaxis = {
            rangeslider: true,
            showline: true,
            tickmode: 'auto'
        };
        let yaxis = {
            showline: true
        };
        let xaxisTitle = {
            text: 'Maturity'
        };
        let yaxisTitle = {
            text: 'Shock'
        };

        xaxis['title'] = xaxisTitle;
        yaxis['title'] = yaxisTitle;

        let layout = {
            autosize: true,
            font: { family: 'roboto' },
            margin: {
                l: 40,
                r: 5,
                b: 5,
                t: 5
            },
            xaxis: xaxis,
            yaxis: yaxis,
            showlegend: false
        };

        let obj = Plotly.newPlot(element, data, layout, this.options, { responsive: true });

        this.plotlyDataObj[analysisId] = data;

        return obj;
    }

    onGridReady(param) {
        this.params = param;
        this.gridApi = param.api;
        this.gridApi.closeToolPanel();
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
        let scenarioIds = [component.scenarioObj.id];
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

    activityLog = [];

    getUserComments() {
        if (this.activityLog.length == 0) {
            this.scenarioService.getActivityLog(this.scenarioObj.id).subscribe(
                (response: any) => {
                    this.activityLog = response;
                    this.modalService.open(this.commentsModal, { windowClass: 'commentpopclass' });
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else {
            this.modalService.open(this.commentsModal, { windowClass: 'commentpopclass' });
        }
    }

    getRiskFactorList() {
        this.analysis.riskFactorList = [];
        this.analysis.selectedRiskFactorList = [];

        let scenarioIds = [this.scenarioObj.id];
        let obj = {
            analysisTypeId: this.analysis.id,
            analysisType: 'S',
            scenarioIdList: scenarioIds,
            assetClassList: this.analysis.selectedAssetClassList
        };

        this.analysisService.getRiskFactorList(obj).subscribe(
            response => {
                this.analysis.riskFactorList = response;
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    downloadExcel(riskFactor) {
        const obj = new Object();
        obj['scenarioId'] = this.scenarioObj.id;
        obj['rfId'] = riskFactor.id;
        obj['rfName'] = riskFactor.name;
        let fileName = 'Maturities_Interpolation.xlsx';
        obj['downloadFileName'] = 'Maturities_Interpolation.xlsx';
        obj['fileName'] = fileName;
        let executionType = 'interpolation';
        if (riskFactor.expCat == EXPANSION_CATEGORY_MODEL_DRIVEN) {
            fileName = 'A_' + obj['rfId'] + '.xlsx';
            executionType = 'modeldriven';
            obj['downloadFileName'] = obj['rfName'] + '.xlsx';
            obj['fileName'] = fileName;
            obj['riskfactor'] = 'A_' + obj['rfId'];
            obj['flag'] = this.isCalculated;
        }
        obj['executionType'] = executionType;
        this.scenarioService.downloadExcelFile(obj).subscribe(
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
            response => {}
        );
    }
    getSelectedVariables(dependentFactors) {
        if (dependentFactors != null && dependentFactors != '') {
            let dependentFactorsList = [];
            let selectVariablesList = null;
            dependentFactorsList = dependentFactors.split(',');
            dependentFactorsList.forEach(element => {
                if (element != null && element != '') {
                    if (selectVariablesList == null) {
                        selectVariablesList = this.getValue(parseInt(element), 'MST_SHOCK_RULE_KEY');
                    } else {
                        selectVariablesList = selectVariablesList + ', ' + this.getValue(parseInt(element), 'MST_SHOCK_RULE_KEY');
                    }
                }
            });
            return selectVariablesList;
        }
    }
    isClickedSelectedVariables(riskFactor) {
        let rowWiseControl = new Object();
        rowWiseControl['isClicked'] = false;
        this.rowWiseControls[riskFactor.id] = rowWiseControl;
    }
    filterMasterData(masterList, colName) {
        const gridData = this.riskFactorList.map(element => {
            return parseInt(element[colName]);
        });
        const gridUniqData = Array.from(new Set(gridData));
        const filterList = masterList.filter(e => gridUniqData.indexOf(e.value) != -1);
        return filterList;
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
}
