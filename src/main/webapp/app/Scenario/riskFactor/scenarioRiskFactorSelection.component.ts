import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';

import { Account } from 'app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScenarioService } from 'app/Scenario/scenario.service';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import {
    SCENARIO_CLASSIFICATION_REGULATORY,
    ALERT_MSG_TIME_OUT,
    EXPANSION_CATEGORY_PREDETERMINED,
    METHODOLOGY_USER_DEFINED,
    PAGE_SIZE,
    TRANSFORMATION_LOG,
    DEFAULT_FREQUENCY_VAL,
    DEFAULT_PAGE_SIZE,
    TRANS_ERR_MSG,
    EXPANSION_CATEGORY_MODEL_DRIVEN,
    SCENARIO_REVIEW_INPROGRESS,
    SCENARIO_REJECTED
} from 'app/constants';
import { PagerService } from 'app/pager.service';

declare var Plotly: any;

@Component({
    selector: 'scenario-config',
    templateUrl: './scenarioRiskFactorSelection.component.html',
    styleUrls: []
})
export class ScenarioRiskFactorSelectionComponent implements OnInit {
    account: Account;
    isCollapsed = true;
    scenarioObj = {
        id: null,
        lastModifiedDate: null,
        lastModifiedBy: null,
        scenarioName: null,
        status: null,
        type: null,
        shockTemplate: null,
        startDate: null,
        endDate: null,
        version: null,
        shockTemplateVersion: null,
        isVersionUpdated: null
    };

    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    popupOpened = false;
    onChangeScreen = false;
    columnList = [];
    headerList = [];
    dataList = [];
    dataListTemp = [];
    dataListTempNext = [];
    scenarioList: any;

    currentSet = null;

    riskFactorSetObj = {
        id: null,
        riskFactorSetName: null,
        riskFactorSetType: null,
        scenarioId: this.scenarioObj.id,
        lastModifiedBy: null,
        lastModifiedDate: null,
        riskFactorListJSON: null,
        riskFactors: null,
        riskFactorList: [],
        riskFactorSetId: null,
        scenarioLastModifiedDate: null
    };

    riskFactorSetType = 'SELECTION';
    categoryList = [];
    transformationList = [];
    masterDataObj = {};
    shockPeriods = {};
    masterDataMapObj = {};
    masterDataMap = {};
    masterDataObjForFilters = {};
    createFilter = { SEARCH_STR: [''] };
    filterList = [];
    clone = {
        scenarioId: null,
        riskFactorSetId: null
    };
    riskFactorSetList: any;
    /* riskFactorSetListTemp: any; */
    riskFactorSetListForClone: any;
    transformationerror = false;
    userCanAccess = false;
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;

    @ViewChild('deleteRFModal')
    deleteRFModal: ElementRef;

    @ViewChild('createSetPopup')
    createSetPopup: ElementRef;

    @ViewChild('sparkLineRFModal')
    sparkLineRFModal: ElementRef;

    @ViewChild('updateShockValues')
    updateShockValues: ElementRef;
    activeIds = [];
    classificationMaster = [];
    subClassificationMaster = [];
    subClassificationMasterTemp = [];
    scenarioTypeMaster = [];
    severityMaster = [];

    classification = null;
    subClassification = null;
    scenarioType = null;
    severity = null;

    filtersApplied = false;
    filterIcon = false;
    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };
    modalHeader = null;

    pagerSetObjectList = {};

    assetMetrics: any = [];
    countryMetrics: any = [];
    currencyMetrics: any = [];

    filterOrderMap = {};

    dataLeft = [];
    dataRight = [];

    timeseriesData = {};
    noRiskfactorsMsg = null;

    riskFactorSetIdFromShocks;
    redHighLightList = [{ label: 'red', value: 1 }];
    downloadType: string;
    startLimit = 0;
    endLimit = 100;
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
    unitsList;
    catList;
    transList;
    constructor(
        private activatedRoute: ActivatedRoute,
        private scenarioService: ScenarioService,
        private router: Router,
        private modalService: NgbModal,
        private pagerService: PagerService,
        public renderer: Renderer
    ) {}

    ngOnInit() {
        this.scenarioObj.id = this.activatedRoute.snapshot.params.id;
        this.riskFactorSetIdFromShocks = this.activatedRoute.snapshot.params.riskFactorSetId;
        if (this.scenarioObj.id && 'null' !== this.scenarioObj.id) {
            this.scenarioService.getScenarioData(Number(this.scenarioObj.id)).subscribe(
                response => {
                    this.scenarioObj = response;
                    if (this.scenarioObj.status < SCENARIO_REVIEW_INPROGRESS || this.scenarioObj.status == SCENARIO_REJECTED) {
                        this.scenarioService.checkAccess(this.scenarioObj.id).subscribe(res => {
                            this.userCanAccess = res;
                        });
                    }
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
            this.getRiskFactorSetList(Number(this.scenarioObj.id), this.riskFactorSetIdFromShocks);

            this.getMasterListForRiskFactorSelection();
        } else {
            this.router.navigate(['scenario', {}], { skipLocationChange: true });
        }
    }

    openPopup(popupDiv, type) {
        this.cancel();
        this.dataListTempNext = [];
        this.riskFactorSetType = type;
        this.popupOpened = true;
        //this.loadFiltersConfiguration();
        this.modalService.open(popupDiv, { size: 'lg', windowClass: 'custom-modal-class' });
    }

    toggleSetAccordian(props: NgbPanelChangeEvent) {
        let panelId = props.panelId;
        let setId = panelId.split('_')[2];

        if (props.nextState) {
            this.activeIds.push(panelId);

            let set = this.riskFactorSetList.filter(p => parseInt(setId) == p.id)[0];

            this.pagerSetObjectList[set.id]['isEditSetName'] = false;
            this.setPage(set, this.pagerSetObjectList[set.id].pager.currentPage);
        } else {
            this.activeIds = this.activeIds.filter(id => id != panelId);
        }
    }

    setPage(set, page) {
        const riskFactorList = this.filterGridData(set.id);
        let pagerSetObject = this.pagerSetObjectList[set.id];

        let totalSize = riskFactorList.length;

        let totalPages = Math.ceil(totalSize / PAGE_SIZE);

        if (page > totalPages) {
            page = totalPages;
        }

        pagerSetObject['pager'] = this.pagerService.getPager(totalSize, page, PAGE_SIZE);

        if (page < 1 || page > pagerSetObject['pager'].totalPages) {
            pagerSetObject['riskFactorListSub'] = [];
            return;
        }

        pagerSetObject['riskFactorListSub'] = riskFactorList.slice(
            pagerSetObject['pager'].startIndex,
            pagerSetObject['pager'].endIndex + 1
        );

        this.pagerSetObjectList[set.id] = pagerSetObject;
    }

    filterGridData(id) {
        const idx = this.riskFactorSetList
            .map(function(e) {
                return e.id;
            })
            .indexOf(id);
        let riskFactorList = this.riskFactorSetList[idx].riskFactorList;
        const filterObj = this.pagerSetObjectList[id].filterObj;
        const filterKeys = Object.keys(filterObj);

        filterKeys.forEach(element => {
            const filterValues = filterObj[element];
            if (filterValues != null) {
                if (element == 'rfName') {
                    riskFactorList = riskFactorList.filter(element2 => {
                        if (
                            element2['name'] != '' &&
                            element2['name'] != null &&
                            element2['name'].toLowerCase().indexOf(filterValues.toLowerCase()) > -1
                        ) {
                            return element2;
                        }
                    });
                } else if (element == 'qltyScore' && filterValues.length > 0) {
                    riskFactorList = riskFactorList.filter(element2 => {
                        if (this.validatedataQuality(element2.qltyScore)) {
                            return element2;
                        }
                    });
                } else if (element == 'stnryTst' && filterValues.length > 0) {
                    riskFactorList = riskFactorList.filter(element2 => {
                        if (this.validateStationary(element2.stnryTst)) {
                            return element2;
                        }
                    });
                } else {
                    if (filterValues.length > 0) {
                        riskFactorList = riskFactorList.filter(function(el) {
                            return filterValues.some(function(f) {
                                return el[element] == f;
                            });
                        });
                    }
                }
            }
        });
        return riskFactorList;
    }

    editSetName(set) {
        this.pagerSetObjectList[set.id]['isEditSetName'] = true;
        this.pagerSetObjectList[set.id]['riskFactorSetNameForEdit'] = set.riskFactorSetName;
    }

    saveRiskFactorSetName(set) {
        this.onChangeScreen = true;
        let riskFactorSetObj = {
            scenarioLastModifiedDate: this.scenarioObj.lastModifiedDate,
            scenarioId: this.scenarioObj.id,
            id: set.id,
            riskFactorSetName: this.pagerSetObjectList[set.id]['riskFactorSetNameForEdit']
        };

        this.scenarioService.saveRiskFactorSetName(riskFactorSetObj).subscribe(
            (response: any) => {
                this.showSuccessValidations(true, 'Set name updated successfully.');
                set.riskFactorSetName = this.pagerSetObjectList[set.id]['riskFactorSetNameForEdit'];
                this.pagerSetObjectList[set.id]['isEditSetName'] = false;
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    openRiskFactorSet(set) {
        this.scenarioService
            .getRiskFactorList({
                scenarioId: parseInt(this.scenarioObj.id),
                setId: set.id,
                sparklineData: 1,
                excludeSetForSparklineData: 0
            })
            .subscribe(
                (response: any) => {
                    set.riskFactorList = response['RISK_FACTORS'];
                    this.timeseriesData = { ...this.timeseriesData, ...response['RISK_FACTORS_TIMESERIES_DATA'] };
                    this.setPage(set, 1);
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
    }

    getRiskfactorList(setId) {
        this.scenarioService
            .getRiskFactorList({ scenarioId: parseInt(this.scenarioObj.id), setId: setId, sparklineData: 1, excludeSetForSparklineData: 1 })
            .subscribe(
                (response: any) => {
                    let riskFactorList = response['RISK_FACTORS'];
                    this.timeseriesData = { ...this.timeseriesData, ...response['RISK_FACTORS_TIMESERIES_DATA'] };

                    this.riskFactorSetList.forEach(set => {
                        if (set.id != setId) {
                            set.riskFactorList = riskFactorList.filter(factor => factor.setId == set.id);
                            this.setPage(set, this.pagerSetObjectList[set.id].pager.currentPage);
                        }
                    });
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
    }

    getMasterListForRiskFactorSelection() {
        this.scenarioService.getMasterListForRiskFactorSelection(parseInt(this.scenarioObj.id)).subscribe(
            response => {
                this.masterDataObj = response['MASTER_DATA'];
                //this.masterDataMap = response['MASTER_DATA_MAPPING'];
                let periods = response['SHOCK_PERIODS'];

                this.classificationMaster = this.masterDataObj['DIM_CLSFCTN_MST'];
                this.subClassificationMaster = this.masterDataObj['DIM_SUB_CLSFCTN_MST'];
                this.subClassificationMasterTemp = this.masterDataObj['DIM_SUB_CLSFCTN_MST'];
                this.scenarioTypeMaster = this.masterDataObj['DIM_SCNRO_TYP_MST'];
                this.severityMaster = this.masterDataObj['MST_SVRTY'];

                Object.keys(periods).forEach(key => {
                    this.shockPeriods[key] = '';
                });

                this.categoryList = this.masterDataObj['MST_RF_CATEGORY'];
                this.transformationList = this.masterDataObj['MST_TRANSFORMATION'];
                /* this.masterDataMapObj = Object.assign({}, this.masterDataMap);
                this.filterList = [];
                Object.keys(this.masterDataMapObj).forEach(item => {
                    this.createFilter[item] = null;
                    if (item != 'ASSET_CLASS_ID' && item != 'SHOCK_RULE_KEY_ID' && item != 'RISK_FACTOR_TYPE_ID' && item != 'CURRENCY_ID') {
                        this.filterList.push({ value: item, label: this.masterDataMapObj[item] });
                    }
                }); */
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getSparkLineForRiskfactor(rfId, rfName) {
        let obj = {
            riskfactorIdList: [parseInt(rfId)],
            startDate: this.scenarioObj.startDate,
            endDate: this.scenarioObj.endDate
        };

        this.scenarioService.getRiskFactorTimeseriesData(obj).subscribe(
            response => {
                this.modalService.open(this.sparkLineRFModal, { size: 'lg', windowClass: 'custom-modal-class' });

                setTimeout(() => {
                    let element = document.getElementById('sparkLineChartId');
                    this.plotTimeseries(element, response, rfName);
                }, 100);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
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
            font: { family: 'roboto,sans-serif' },
            width: 100,
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
            height: 400,
            font: { family: 'roboto,sans-serif' },
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

    /* resetFilters_Old() {
        this.filtersApplied = false;
        this.filterIcon = false;
        this.createFilter = { SEARCH_STR: [''] };
        this.filterOrderMap = {};
        this.masterDataMapObj = Object.assign({}, this.masterDataMap);

        delete this.masterDataMapObj['ASSET_CLASS_ID'];
        delete this.masterDataMapObj['SHOCK_RULE_KEY_ID'];
        delete this.masterDataMapObj['RISK_FACTOR_TYPE_ID'];
        delete this.masterDataMapObj['CURRENCY_ID'];

        this.masterDataObjForFilters = Object.assign({}, this.masterDataObj);

        this.dataListTemp = [];
    } */

    getRiskFactorSetList(id, riskFactorSetIdFromShocks) {
        this.scenarioService.getRiskFactorSetList(id).subscribe(
            response => {
                this.riskFactorSetList = response;
                /**this.riskFactorSetListTemp = response;*/

                this.riskFactorSetList.forEach(set => {
                    this.pagerSetObjectList[set.id] = {
                        pager: {
                            pages: null,
                            totalItems: null,
                            currentPage: 1,
                            totalPages: null,
                            startIndex: null,
                            endIndex: null
                        },
                        metadataShow: false,
                        isEditSetName: false,
                        riskFactorSetNameForEdit: null,
                        checkedRFList: [],
                        selectAllRF: false,
                        filterObj: {},
                        criFilter: false
                    };
                });

                if (riskFactorSetIdFromShocks) {
                    let set = this.riskFactorSetList.filter(item => item.id == riskFactorSetIdFromShocks)[0];

                    if (this.activeIds && this.activeIds.length > 0) {
                        this.activeIds.push('set_id_' + riskFactorSetIdFromShocks);
                    } else {
                        this.activeIds = ['set_id_' + riskFactorSetIdFromShocks];
                    }

                    this.openRiskFactorSet(set);
                    if (this.riskFactorSetList.length > 1) {
                        this.getRiskfactorList(set.id);
                    }
                } else {
                    if (this.riskFactorSetList && this.riskFactorSetList.length > 0) {
                        this.activeIds = ['set_id_' + this.riskFactorSetList[0].id];
                        this.openRiskFactorSet(this.riskFactorSetList[0]);
                        if (this.riskFactorSetList.length > 1) {
                            this.getRiskfactorList(this.riskFactorSetList[0].id);
                        }
                    }
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getRiskFactorMetrics() {
        if (this.isCollapsed && this.riskFactorSetList && this.riskFactorSetList.length > 0) {
            this.isCollapsed = !this.isCollapsed;
            if (this.riskFactorSetList && this.riskFactorSetList.length > 0) {
                this.scenarioService.getRiskFactorMetrics(parseInt(this.scenarioObj.id)).subscribe(
                    response => {
                        this.assetMetrics = response['ASSET_CLASS'];
                        this.countryMetrics = response['COUNTRY'];
                        this.currencyMetrics = response['CURRENCY'];
                        let element = document.getElementById('metricsDiv');
                        element.innerHTML = '';

                        this.plotDonutChart(element, response);
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                    }
                );
            }
        } else if (!this.isCollapsed) {
            this.isCollapsed = !this.isCollapsed;
        }
    }

    plotDonutChart(element, dataTemp) {
        let data = [];
        let annotations = [];
        let keys = Object.keys(dataTemp);
        let i = 0;

        let nameMap = {
            ASSET_CLASS: 'Asset Class',
            CURRENCY: 'Currency',
            COUNTRY: 'Country'
        };
        let txtPositionList = [0.1, 0.53, 0.92];
        keys.forEach(key => {
            let dataObj = dataTemp[key];
            let values = [];
            let labels = [];

            dataObj.forEach(ele => {
                values.push(ele.value);
                labels.push(ele.label);
            });

            data.push({
                values: values,
                labels: labels,
                name: nameMap[key],
                hoverinfo: 'label+percent',
                textinfo: 'none',
                hole: 0.4,
                domain: { column: i },
                type: 'pie'
            });
            let annotation = {
                font: {
                    size: 10
                },
                showarrow: false,
                text: nameMap[key],
                x: txtPositionList[i++],
                y: 0.5
            };
            annotations.push(annotation);
        });

        var layout = {
            title: 'Metrics',
            font: { family: 'roboto,sans-serif' },
            annotations: annotations,
            height: 200,
            width: 400,
            showlegend: false,
            grid: { rows: 1, columns: 3 },
            margin: {
                l: 5,
                r: 5,
                b: 5,
                t: 50
            }
        };

        Plotly.newPlot(element, data, layout);
    }

    getRiskFactorSetListOnChange(id) {
        this.scenarioService.getRiskFactorSetListForClone(id).subscribe(
            response => {
                this.riskFactorSetListForClone = response;
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getRiskFactorsOnRiskFactorSetId() {
        if (this.clone.riskFactorSetId) {
            this.scenarioService
                .getRiskFactorSetDataForClone({ setId: parseInt(this.clone.riskFactorSetId), scenarioId: parseInt(this.scenarioObj.id) })
                .subscribe(
                    (response: any) => {
                        let set = response;

                        let riskFactorList = JSON.parse(set.riskFactorListJSON);

                        if (riskFactorList && riskFactorList.length > 0) {
                            if (!this.riskFactorSetObj.riskFactorSetName || this.riskFactorSetObj.riskFactorSetName == '') {
                                this.riskFactorSetObj.riskFactorSetName = set.riskFactorSetName;
                            }
                            this.riskFactorSetObj.riskFactorList = riskFactorList;
                            this.saveRiskFactorSet('NEW_SET');
                        } else {
                            this.showErrorValidations(true, 'Selected Set does not have risk factors.');
                        }
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                    }
                );
        } else {
            this.showErrorValidations(true, 'Please select RiskFactorSet to Clone.');
        }
    }

    addMoreRiskFactorsToSet(set) {
        this.riskFactorSetObj = Object.assign({}, set);

        this.dataListTempNext = [];
        //this.resetFilters();
        this.modalService.open(this.createSetPopup, { size: 'lg', windowClass: 'custom-modal-class' });
        this.currentSet = set;
    }

    getScenarioList(filter) {
        this.subClassificationMasterTemp = this.subClassificationMaster.filter(p => p.classification + '' == this.classification);
        this.scenarioService
            .getScenarioList({
                scenarioId: parseInt(this.scenarioObj.id),
                classification: this.classification,
                subClassification: this.subClassification,
                scenarioType: this.scenarioType,
                severity: this.severity
            })
            .subscribe(
                response => {
                    this.scenarioList = response;
                    this.clone.riskFactorSetId = null;
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
    }

    /* getMaxOrderVal() {
        let order = 0;
        Object.keys(this.filterOrderMap).forEach(key => {
            let orderTemp = this.filterOrderMap[key];
            if (orderTemp && order < orderTemp) {
                order = orderTemp;
            }
        });
        return order + 1;
    } */
    filter;
    scrollEnable = false;
    isScrolled = false;

    close() {
        this.modalService.dismissAll();
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

    moveRiskFactorsToRight(type) {
        if (type == 'ALL') {
            this.dataListTempNext = this.dataListTempNext.concat(this.dataListTemp);
            this.dataListTemp = [];
        } else {
            this.dataListTempNext = this.dataListTempNext.concat(this.dataLeft);
            const idIndex = this.columnList.indexOf('SHOCK_RULE_KEY_ID');

            let listTemp = this.riskFactorSetObj.riskFactorList.map(e => e.id + '');
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

            let listTemp = this.riskFactorSetObj.riskFactorList.map(e => e.id + '');
            listTemp = listTemp.concat(this.dataListTemp).map(e => e[idIndex] + '');

            this.dataListTempNext = this.dataListTempNext.filter(e => listTemp.indexOf(e[idIndex] + '') == -1);
        }
        this.dataLeft = [];
        this.dataRight = [];
    }

    addRiskFactorsToSet() {
        if (this.dataListTempNext && this.dataListTempNext.length > 0) {
            if (this.scenarioObj.shockTemplate + '' != '0') {
                let rfList = this.dataListTempNext.map(obj => obj[this.columnList.indexOf('SHOCK_RULE_KEY_ID')]);

                let obj = {
                    id: this.scenarioObj.id,
                    rfList: rfList
                };

                this.scenarioService.getTemplateShockValues(obj).subscribe(
                    response => {
                        this.mapDataToList(response['shocks'], response['units']);
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                    }
                );
            } else {
                this.mapDataToList({}, {});
            }
        } else {
            this.showErrorValidations(true, 'Select Risk Factors to Include.');
        }
    }
    modelsList = [];
    mapDataToList(shockValObj, unitValObj) {
        const rfIdsList = this.dataListTempNext.map(e => e[0]);
        this.scenarioService.getApprovedModelsByList(rfIdsList).subscribe(
            (response: any) => {
                this.modelsList = response;
                this.dataListTempNext.forEach(obj => {
                    let id = obj[this.columnList.indexOf('SHOCK_RULE_KEY_ID')];
                    const appsrkid = this.modelsList.filter(factor => factor.srkid == id);
                    let list = this.riskFactorSetObj.riskFactorList.filter(factor => factor.id == id);
                    if (!list || list.length == 0) {
                        let templateShockValObj = shockValObj[id];
                        let shockTemplateVal = null;
                        let keys = templateShockValObj ? Object.keys(templateShockValObj) : [];
                        if (keys.length > 0) {
                            shockTemplateVal = templateShockValObj[keys[0]];
                        }
                        let medId;
                        if (
                            appsrkid.length > 0 &&
                            shockTemplateVal == null &&
                            obj[this.columnList.indexOf('CATEGORY_ID')] == EXPANSION_CATEGORY_MODEL_DRIVEN
                        ) {
                            medId = appsrkid[0].value;
                        } else {
                            medId = obj[this.columnList.indexOf('METHODOLOGY_ID')];
                        }
                        this.riskFactorSetObj.riskFactorList.push({
                            id: id,
                            name: obj[this.columnList.indexOf('SHOCK_RULE_KEY_NAME')],
                            expCat:
                                shockTemplateVal == null ? obj[this.columnList.indexOf('CATEGORY_ID')] : EXPANSION_CATEGORY_PREDETERMINED,
                            transType: obj[this.columnList.indexOf('TRANSFORMATION_ID')],
                            shockValues: shockValObj[id] || this.shockPeriods,
                            overrideShockValues: this.shockPeriods,
                            stdShockValues: this.shockPeriods,
                            usrCmnts: this.shockPeriods,
                            qltyScore: null,
                            mthdlgyType: shockTemplateVal == null ? medId : METHODOLOGY_USER_DEFINED,
                            units: unitValObj[id] == null ? null : unitValObj[id].Unit,
                            astClsId: obj[this.columnList.indexOf('ASSET_CLASS_ID')],
                            subRskFctrId: obj[this.columnList.indexOf('RISK_FACTOR_TYPE_ID')],
                            cntryId: obj[this.columnList.indexOf('COUNTRY_ID')],
                            crncyId: obj[this.columnList.indexOf('CURRENCY_ID')],
                            frqncyId: obj[this.columnList.indexOf('FREQUENCY_ID')],
                            mtrtyId: obj[this.columnList.indexOf('MATURITY_ID')],
                            sctrId: obj[this.columnList.indexOf('SECTOR_ID')],
                            rtngId: obj[this.columnList.indexOf('RATING_ID')],
                            crvfmlyId: obj[this.columnList.indexOf('CURVE_FAMILY_ID')],
                            preDtrmnd: {},
                            bsnsRule: {},
                            mdlDrvn: {}
                        });
                    }
                });
                this.saveRiskFactorSet('NEW_SET');
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    openDeleteDataModal(set) {
        this.modalHeader = 'Delete Risk factor set';
        this.modalService.open(this.deleteDataModal, {});
        this.currentSet = set;
    }

    openDeleteFactorsModal(set) {
        let rfList = set.riskFactorList.filter(p => this.pagerSetObjectList[set.id]['checkedRFList'].indexOf(p.id) != -1);
        if (set.riskFactorList.length == rfList.length) {
            this.openDeleteDataModal(set);
        } else {
            this.modalHeader = 'Delete Risk factors';
            this.modalService.open(this.deleteRFModal, {});
            this.currentSet = set;
        }
    }

    cancel() {
        this.isFailure = false;
        this.popupOpened = false;
        this.isSuccess = false;
        this.classification = null;
        this.subClassification = null;
        this.scenarioType = null;
        this.severity = null;
        this.columnList = [];
        this.headerList = [];
        this.dataList = [];
        this.dataListTemp = [];
        this.dataListTempNext = [];

        this.clone = {
            scenarioId: null,
            riskFactorSetId: null
        };

        this.riskFactorSetObj = {
            id: null,
            riskFactorSetName: null,
            riskFactorSetType: null,
            scenarioId: this.scenarioObj.id,
            lastModifiedBy: null,
            lastModifiedDate: null,
            riskFactorListJSON: null,
            riskFactors: null,
            riskFactorList: [],
            riskFactorSetId: null,
            scenarioLastModifiedDate: null
        };

        this.modalService.dismissAll();
        this.riskFactorSetType = 'SELECTION';
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.scenarioObj.id }], { skipLocationChange: true });
    }

    saveRiskFactorSets(path) {
        let list = [];
        this.onChangeScreen = false;
        this.riskFactorSetList.forEach(set => {
            list.push({
                scenarioLastModifiedDate: this.scenarioObj.lastModifiedDate,
                riskFactorListJSON: JSON.stringify(set.riskFactorList),
                scenarioId: this.scenarioObj.id,
                id: set.id,
                riskFactors: set.riskFactorList.map(ele => ele.id) + '',
                riskFactorSetName: set.riskFactorSetName,
                riskFactorSetType: set.riskFactorSetType
            });
        });

        if (list.length == 0) {
            this.showErrorValidations(true, 'Scenario should contain atleast one riskfactor set');
            return false;
        }
        this.scenarioService.saveRiskFactorSets(list).subscribe(
            response => {
                this.showSuccessValidations(true, 'Saved successfully');
                this.navigateTo(path);
            },
            response => {
                this.transformationerror = true;
                const idx = response.error.indexOf(TRANS_ERR_MSG);
                if (idx > -1) {
                    const error = response.error.replace(TRANS_ERR_MSG, '\n');
                    var formattedString = TRANS_ERR_MSG + error.split(',').join(' , ');
                    this.showErrorValidations(true, formattedString);
                } else {
                    this.showErrorValidations(true, response.error);
                }
            }
        );
        // }
    }

    saveRiskFactorSet(type) {
        if (!this.riskFactorSetObj.riskFactorList || this.riskFactorSetObj.riskFactorList.length == 0) {
            this.showErrorValidations(true, 'Add risk factors first.');
            return false;
        } else if (!this.riskFactorSetObj.riskFactorSetName || this.riskFactorSetObj.riskFactorSetName == '') {
            this.showErrorValidations(true, 'Enter Risk factor set name.');
            return false;
        }

        this.riskFactorSetObj.riskFactorList.forEach(e => {
            if (!e.expCat) {
                e.expCat = EXPANSION_CATEGORY_PREDETERMINED;
            }
            if (!e.transType) {
                e.transType = TRANSFORMATION_LOG;
            }
        });
        this.riskFactorSetObj.scenarioLastModifiedDate = this.scenarioObj.lastModifiedDate;
        this.riskFactorSetObj.riskFactorListJSON = JSON.stringify(this.riskFactorSetObj.riskFactorList);
        this.riskFactorSetObj.scenarioId = this.scenarioObj.id;
        if (this.riskFactorSetType == 'CLONE') {
            this.riskFactorSetObj.riskFactorSetId = this.clone.riskFactorSetId;
        }
        this.riskFactorSetObj.riskFactorSetType = this.riskFactorSetType;

        this.riskFactorSetObj.riskFactors = this.riskFactorSetObj.riskFactorList.map(ele => ele.id) + '';

        this.scenarioService.saveRiskFactorSet(this.riskFactorSetObj).subscribe(
            response => {
                this.riskFactorSetObj.id = response['id'];
                this.scenarioObj.lastModifiedDate = response['scenarioLastModifiedDate'];
                this.scenarioObj.status = response['status'];
                this.showSuccessValidations(true, 'Risk factor set saved successfully.');

                /* this.getRiskFactorSetList(this.scenarioObj.id, response['id']); */
                let tempList = this.riskFactorSetList.filter(set => set.id == this.riskFactorSetObj.id);
                if (!tempList || tempList.length == 0) {
                    let set = {
                        scenarioId: this.riskFactorSetObj.scenarioId,
                        riskFactorSetType: this.riskFactorSetObj.riskFactorSetType,
                        id: this.riskFactorSetObj.id,
                        riskFactors: this.riskFactorSetObj.riskFactors,
                        riskFactorSetName: this.riskFactorSetObj.riskFactorSetName
                    };
                    this.riskFactorSetList.push(set);
                    this.pagerSetObjectList[set.id] = {
                        pager: {
                            pages: null,
                            totalItems: null,
                            currentPage: 1,
                            totalPages: null,
                            startIndex: null,
                            endIndex: null
                        },
                        metadataShow: false,
                        isEditSetName: false,
                        riskFactorSetNameForEdit: null,
                        checkedRFList: [],
                        selectAllRF: false,
                        filterObj: {},
                        criFilter: false
                    };
                    this.activeIds.push('set_id_' + set.id);
                    this.openRiskFactorSet(set);
                } else {
                    this.openRiskFactorSet(tempList[0]);
                }
                this.cancel();
            },
            response => {
                this.transformationerror = true;
                const idx = response.error.indexOf(TRANS_ERR_MSG);
                if (idx > -1) {
                    const error = response.error.replace(TRANS_ERR_MSG, '\n');
                    var formattedString = TRANS_ERR_MSG + error.split(',').join(' , ');
                    this.showErrorValidations(true, formattedString);
                } else {
                    this.showErrorValidations(true, response.error);
                }
            }
        );
    }

    selectAllChange(event, set) {
        if (event.target.checked) {
            const riskFactorList = this.pagerSetObjectList[set.id]['riskFactorListSub'].slice(0, DEFAULT_PAGE_SIZE);
            this.pagerSetObjectList[set.id]['checkedRFList'] = riskFactorList.map(p => p.id);
            this.pagerSetObjectList[set.id]['selectAllRF'] = true;
        } else {
            this.pagerSetObjectList[set.id]['checkedRFList'] = [];
            this.pagerSetObjectList[set.id]['selectAllRF'] = false;
        }
    }

    selectRF(event, id, set) {
        if (event.target.checked) {
            this.pagerSetObjectList[set.id]['checkedRFList'].push(id);
            if (this.pagerSetObjectList[set.id]['checkedRFList'].length == set.riskFactorList.length) {
                this.pagerSetObjectList[set.id]['selectAllRF'] = true;
            }
        } else {
            this.pagerSetObjectList[set.id]['checkedRFList'] = this.pagerSetObjectList[set.id]['checkedRFList'].filter(element => {
                return element != id;
            });
            this.pagerSetObjectList[set.id]['selectAllRF'] = false;
        }
    }

    deleteRiskFactors() {
        if (this.currentSet) {
            let rfList = this.currentSet.riskFactorList.filter(
                p => this.pagerSetObjectList[this.currentSet.id]['checkedRFList'].indexOf(p.id) == -1
            );
            if (!rfList || rfList.length == 0) {
                return false;
            }

            let riskFactorSetObj = {};

            riskFactorSetObj['scenarioLastModifiedDate'] = this.scenarioObj.lastModifiedDate;
            riskFactorSetObj['riskFactorListJSON'] = JSON.stringify(rfList);
            riskFactorSetObj['scenarioId'] = this.scenarioObj.id;
            riskFactorSetObj['riskFactors'] = rfList.map(ele => ele.id) + '';
            riskFactorSetObj['riskFactorSetName'] = this.currentSet.riskFactorSetName;
            riskFactorSetObj['id'] = this.currentSet.id;
            riskFactorSetObj['riskFactorSetType'] = this.currentSet.riskFactorSetType;

            this.scenarioService.saveRiskFactorSet(riskFactorSetObj).subscribe(
                response => {
                    this.pagerSetObjectList[this.currentSet.id]['selectAllRF'] = false;
                    this.pagerSetObjectList[this.currentSet.id]['checkedRFList'] = [];
                    this.currentSet.riskFactorList = rfList;
                    this.scenarioObj.lastModifiedDate = response['scenarioLastModifiedDate'];
                    this.setPage(this.currentSet, this.pagerSetObjectList[this.currentSet.id].pager.currentPage);
                    this.cancel();
                    this.showSuccessValidations(true, 'Risk factors deleted successfully.');
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    deleteRiskFactorSet() {
        if (this.currentSet != null) {
            this.scenarioService
                .deleteRiskFactorSet({
                    id: this.currentSet.id,
                    scenarioId: this.scenarioObj.id,
                    scenarioLastModifiedDate: this.scenarioObj.lastModifiedDate
                })
                .subscribe(
                    response => {
                        this.showSuccessValidations(true, 'Risk factor set deleted successfully.');
                        /**this.getRiskFactorSetList(this.scenarioObj.id, null); */
                        this.riskFactorSetList = this.riskFactorSetList.filter(set => set.id != this.currentSet.id);
                        delete this.pagerSetObjectList[this.currentSet.id];

                        this.activeIds = this.activeIds.filter(id => id != 'set_id_' + this.currentSet.id);

                        this.cancel();
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                    }
                );
        }
    }

    getValue(id, master) {
        let t = this.masterDataObj[master].filter(e => e.value == id);
        if (t && t.length > 0) {
            return t[0].label;
        } else {
            return null;
        }
    }

    calculateQualityCheck(set) {
        let obj = {
            riskFactorList: set.riskFactorList,
            scenarioId: this.scenarioObj.id
        };

        this.scenarioService.calculateQualityCheck(obj).subscribe(
            (response: any) => {
                if (response && response.length > 0) {
                    response.forEach(element => {
                        let item = set.riskFactorList.filter(e => e.id == element.id)[0];

                        item.qltyScore = element.missing + '|' + element.outliers + '|' + element.staticData;
                        item.stnryTst = element.adf + '|' + element.kpss + '|' + element.pp + '|' + element.comment;
                    });
                    if (response.length != set.riskFactorList.length) {
                        this.showErrorValidations(
                            true,
                            'Data quality not calculated for some of the factors as library data not available.'
                        );
                    }
                    this.setPage(set, this.pagerSetObjectList[set.id].pager.currentPage);
                    /* this.riskFactorSetObj = set;
                    this.saveRiskFactorSet(); */
                }
            },
            response => {
                this.transformationerror = true;
                const idx = response.error.indexOf(TRANS_ERR_MSG);
                if (idx > -1) {
                    const error = response.error.replace(TRANS_ERR_MSG, '\n');
                    var formattedString = TRANS_ERR_MSG + error.split(',').join(' , ');
                    this.showErrorValidations(true, formattedString);
                } else {
                    this.showErrorValidations(true, response.error);
                }
            }
        );
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
            this.transformationerror = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    updateShockTemplate(path) {
        this.modalService.dismissAll();
        this.scenarioObj.isVersionUpdated = 'Y';
        this.scenarioService.updateShockTemplateObj(this.scenarioObj).subscribe(
            response => {
                // this.navigateTo(path);
                this.getRiskFactorSetList(Number(this.scenarioObj.id), this.riskFactorSetIdFromShocks);
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

    getRiskFactorSetCloneName() {
        let cloneSetRfId = this.clone.riskFactorSetId;
        Object.keys(this.riskFactorSetListForClone).forEach(key => {
            let cloneObj = this.riskFactorSetListForClone[key];
            if (cloneObj['value'] === cloneSetRfId) {
                this.riskFactorSetObj.riskFactorSetName = cloneObj['label'];
            }
        });
    }

    filterData(set) {
        this.pagerSetObjectList[set.id]['checkedRFList'] = [];
        this.pagerSetObjectList[set.id]['selectAllRF'] = false;
        this.setPage(set, 1);
    }

    downloadTimeSeriesData() {
        let obj = {
            id: this.scenarioObj.id,
            startDate: this.scenarioObj.startDate,
            endDate: this.scenarioObj.endDate
        };

        if (this.riskFactorSetList.length > 0) {
            this.downloadType = 'Downloading';

            this.scenarioService.downloadTimeSeriesData(obj).subscribe(
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
            this.popupOpened = false;
            this.showErrorValidations(true, 'No riskfactors to dowlonad the Market Data');
        }
    }

    expCatChange(riskFactor) {
        this.onChangeScreen = true;
        const appList = this.modelsList.filter(factor => factor.srkid == riskFactor.id);
        if (!(appList.length > 0 && riskFactor.expCat == EXPANSION_CATEGORY_MODEL_DRIVEN)) {
            riskFactor.mthdlgyType = null;
        } else if (riskFactor.expCat == EXPANSION_CATEGORY_MODEL_DRIVEN && appList.length > 0) {
            riskFactor.mthdlgyType = appList[0].value;
        }
        const shockHeaders = Object.keys(riskFactor.shockValues);
        shockHeaders.forEach(element => {
            riskFactor.shockValues[element] = null;
        });
    }

    vChange() {
        this.onChangeScreen = true;
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

    changeScroll(obj) {
        if (obj.target.offsetHeight + obj.target.scrollTop >= obj.target.scrollHeight && this.scrollEnable) {
            this.isScrolled = true;
            this.loadDataForAppliedFilter();
        }
    }

    // code for filter separation

    loadDataForAppliedFilter() {
        this.noRiskfactorsMsg = null;

        let listTemp = this.riskFactorSetObj.riskFactorList.map(e => e.id + '');
        listTemp = listTemp.concat(this.dataListTempNext).map(e => e[0] + '');
        if (!this.isScrolled) {
            this.startLimit = 0;
        }
        let obj = {
            selectedRiskFactorIds: listTemp || [],
            createFilter: this.createFilter,
            scenarioId: this.scenarioObj.id,
            startLimit: this.startLimit,
            endLimit: this.endLimit
        };

        this.scenarioService.getRiskFactorsData(obj).subscribe(
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

                if ((!this.dataListTemp || this.dataListTemp.length == 0) && this.startLimit == 0) {
                    this.noRiskfactorsMsg = 'Either filters not applied or data not available for the filters.';
                }
            },
            res => {
                this.showErrorValidations(true, res.error);
            }
        );
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
    filterMasterData(masterList, colName, setId) {
        const gridData = this.riskFactorSetList[setId].riskFactorList.map(element => {
            return parseInt(element[colName]);
        });
        const gridUniqData = Array.from(new Set(gridData));
        const filterList = masterList.filter(e => gridUniqData.indexOf(e.value) != -1);
        return filterList;
    }
}
