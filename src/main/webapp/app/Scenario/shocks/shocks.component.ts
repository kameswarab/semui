import { OnInit, Component, ViewChild, ElementRef, Input, ViewContainerRef, TemplateRef, Renderer, ChangeDetectorRef } from '@angular/core';
import { ScenarioService } from '../scenario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbPanelChangeEvent, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery';
import * as _ from 'underscore';
import { ItemsList } from '@ng-select/ng-select/ng-select/items-list';
import {
    ALERT_MSG_TIME_OUT,
    SCENARIO_OUTPUT,
    SCENARIO_SHOCKS,
    PREDETERMINED_LABEL,
    BUSINESSRULE_LABEL,
    INTERPOLATION_LABEL,
    PROXY_LABEL,
    USERDEFINED_LABEL,
    QUANTILE_LABEL,
    TRANSFORMATION_LOG,
    TRANSFORMATION_ABS,
    UNIT_PERCENTILE,
    UNIT_BPS,
    PROJECTION_ID,
    MODELDRIVEN_LABEL,
    METHODOLOGY_INTERPOLATION,
    METHODOLOGY_PROXY,
    EXP_CATID_MODELDRIVEN,
    EXPANSION_CATEGORY_MODEL_DRIVEN,
    DEFAULT_PAGE_SIZE,
    EXPANSION_CATEGORY_PREDETERMINED,
    EXPANSION_CATEGORY_BUSINESS_RULE,
    DEFAULT_FREQUENCY_VAL,
    PAGE_SIZE,
    DEFAULT_IP_LINEAR_ID,
    SCENARIO_REVIEW_INPROGRESS,
    SCENARIO_REJECTED,
    SHOCK_VALUE_DECIMAL
} from 'app/constants';
import { PagerService } from 'app/pager.service';
import { Runner } from 'protractor';

@Component({
    selector: 'shock-page',
    templateUrl: './shocks.component.html',
    styleUrls: ['shocks.css', '../scenario.css', '../jquery.steps.css']
})
export class ShockComponent implements OnInit {
    scenarioObj = {
        id: null,
        lastModifiedDate: null,
        scenarioName: null,
        status: null,
        lastModifiedBy: null,
        type: null,
        calcSetSpecific: 'FALSE',
        methodologyConfigDTOs: [],
        version: null,
        shockTemplate: null,
        shockTemplateVersion: null,
        isVersionUpdated: null
    };
    calcSetSpecific = 'FALSE';
    totalRFSets;
    dataSets;
    firsttable = true;
    secondtable = false;
    thirdtable = false;
    orgDataSets;
    tempDataSets;
    rfCategories;
    methodologiesList;
    frequencyList;
    unitList;
    interPolationList;
    rfConfigList;
    maturityList;
    expCatType = 0;
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    showMetaData = false;
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    @ViewChild('arithmaticFormulaDataModal')
    arithmaticFormulaDataModal: ElementRef;
    @ViewChild('deleteRFModal')
    deleteRFModal: ElementRef;
    @ViewChild('updateShockValues')
    updateShockValues: ElementRef;
    @ViewChild('resetShockValues')
    resetShockValues: ElementRef;
    setId;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    errMsg;
    onChangeScreen = false;
    isValid = true;
    isQuantile = true;
    masterDataObj;
    masterDataMap;
    arithmaticFormula;
    istogglEnable;
    x = 0;
    listOfRowsOpened = [];
    colspan = 7;
    riskFactorLibDTO = {
        arithmaticFormula: null
    };
    userCanAccess = false;
    errMsgList = [{ label: '#Err', value: 1 }, { label: 'Blank', value: 2 }];
    resetErrMsg;
    operatorsMap = {
        ADD: '+',
        SUB: '-',
        MULT: '*',
        DIVIDE: '/',
        OPENL: '(',
        OPENR: ')',
        ZERO: '0',
        DOUBLEEQUAL: '==',
        YOY: 'YOY',
        YOYPER: 'YOY %',
        POP: 'POP',
        POPPER: 'POP %',
        SIMPLEEQUAL: '=',
        LESSTHAN: '<',
        GREATERTHAN: '>',
        NOTEQUAL: '!=',
        ONE: '1',
        TWO: '2',
        THREE: '3',
        FOUR: '4',
        FIVE: '5',
        SIX: '6',
        SEVEN: '7',
        EIGHT: '8',
        NINE: '9',
        MIN: 'MIN',
        MAX: 'MAX',
        COMMA: ','
    };
    ids;
    selectedRiskFactors;
    shocksToProxy = 'shocksScreen';
    SCENARIO_SHOCKS = SCENARIO_SHOCKS;
    SCENARIO_OUTPUT = SCENARIO_OUTPUT;
    shockHeaders = [];
    medId;
    criFilter = false;
    masterSelected;
    setWiseControls = [];
    pager: any = {};
    astClsList;
    subRskFctrList;
    cntryList;
    crncyList;
    sctrList;
    rtngList;
    errorMess = false;
    PROJECTION_ID;
    modalHeader;
    METHODOLOGY_INTERPOLATION;
    METHODOLOGY_PROXY;
    EXP_CATID_MODELDRIVEN;

    riskFactorSetObj = {
        id: null,
        riskFactorSetName: null,
        riskFactorSetType: null,
        scenarioId: this.scenarioObj.id,
        lastModifiedBy: null,
        lastModifiedDate: null,
        riskFactorListJSON: null,
        riskFactorListJsonNode: null,
        riskFactors: null,
        riskFactorSetId: null,
        scenarioLastModifiedDate: null,
        assetClassId: null,
        riskFactorCount: null,
        status: null
    };
    expCatOldVal = 1;
    ismethodology = false;
    activeIds = [];
    predeterminedList = [];
    isCalculated = false;
    oldVal;
    changeType;
    rowWiseControls = [];
    rfId;
    changedVal;
    modelConfigEleList = [{ value: 'TRUE', label: 'TRUE' }, { value: 'FALSE', label: 'FALSE' }];

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
    isRCalculated = false;
    constructor(
        private http: HttpClient,
        private scenarioService: ScenarioService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private pagerService: PagerService,
        public renderer: Renderer,
        modalConfig: NgbModalConfig,
        private changeDedectionRef: ChangeDetectorRef
    ) {
        modalConfig.backdrop = 'static';
        modalConfig.keyboard = false;
    }

    ngOnInit() {
        this.scenarioObj.id = this.activatedRoute.snapshot.params.id;
        this.PROJECTION_ID = PROJECTION_ID;
        this.METHODOLOGY_INTERPOLATION = METHODOLOGY_INTERPOLATION;
        this.METHODOLOGY_PROXY = METHODOLOGY_PROXY;
        this.EXP_CATID_MODELDRIVEN = EXP_CATID_MODELDRIVEN;
        this.activeIds.push('static-0');
        if (this.scenarioObj.id && 'null' != this.scenarioObj.id) {
            this.scenarioService.getScenarioData(parseInt(this.scenarioObj.id)).subscribe(
                response => {
                    this.scenarioObj = response;

                    this.calcSetSpecific = this.scenarioObj.calcSetSpecific || 'FALSE';

                    if (this.scenarioObj.status < SCENARIO_REVIEW_INPROGRESS || this.scenarioObj.status == SCENARIO_REJECTED) {
                        this.scenarioService.checkAccess(this.scenarioObj.id).subscribe(res => {
                            this.userCanAccess = res;
                        });
                    }
                    this.scenarioService.getDataSets(Number(this.scenarioObj.id)).subscribe((res: any) => {
                        this.loadMetaData();
                        this.orgDataSets = JSON.parse(res.dataSets);
                        this.rfCategories = res.rfCategories;
                        this.loadErrorMessages();
                        this.dataSets = this.orgDataSets;
                        this.tempDataSets = JSON.parse(res.dataSets);
                        const methodologiesList = res.methodologiesList;
                        this.methodologiesList = methodologiesList.map(element => {
                            return {
                                label: element.label,
                                value: element.value,
                                code: element.code,
                                cat_id: element.cat_id,
                                type: 'METHODOLOGIES',
                                srkid: null
                            };
                        });
                        res.modelNames.forEach(element => {
                            this.methodologiesList.push(element);
                        });
                        // this.methodologiesList.push({label: 'abc', value: 2, code: 33, cat_id: null, type: 'MODELMETHODOLOGIES', srkid : 393});
                        this.frequencyList = res.frequencyList;
                        this.unitList = res.unitList;
                        this.interPolationList = res.interPolationList;
                        this.rfConfigList = res.rfConfigList;
                        this.maturityList = res.maturityList;
                        this.astClsList = res.astClsList;
                        this.subRskFctrList = res.subRskFctrList;
                        this.cntryList = res.cntryList;
                        this.crncyList = res.crncyList;
                        this.sctrList = res.sctrList;
                        this.rtngList = res.rtngList;
                        this.initShockView();
                        this.resetPaginationtoAllSets();
                        if (
                            this.scenarioObj.isVersionUpdated == 'Y' ||
                            this.scenarioObj.isVersionUpdated == 'N' ||
                            (this.scenarioObj.isVersionUpdated == null && this.scenarioObj.shockTemplate != 0)
                        ) {
                            if (this.scenarioObj.shockTemplateVersion != this.scenarioObj.version) {
                                this.modalService.open(this.updateShockValues, {});
                            }
                        }
                    });
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else {
            this.scenarioObj.id = null;
        }
    }
    ngAfterContentChecked(): void {
        this.changeDedectionRef.detectChanges();
    }
    initShockView() {
        if (this.dataSets[0] != null) {
            this.dataSets[0].expand = true;
        }
        this.rfCategories[0].applyPrimaryClass = true;
        this.totalRFSets = this.dataSets.length;
        try {
            if (this.dataSets[0].riskFactorListJsonNode[0].shockValues) {
                this.shockHeaders = Object.keys(this.dataSets[0].riskFactorListJsonNode[0].shockValues);
            }
        } catch (e) {}
        // this.calCatExpTypes();
        this.refreshData(this.rfCategories[0].value);
        this.changeUnits();
    }

    changeUnits() {
        this.orgDataSets.forEach((element, index) => {
            element.riskFactorListJsonNode.forEach((element1, index1) => {
                if (element1.units == null) {
                    if (TRANSFORMATION_LOG == element1.transType) {
                        const unitobj = this.unitList.filter(item => item.label == UNIT_PERCENTILE)[0];
                        this.orgDataSets[index].riskFactorListJsonNode[index1].shockUnits = unitobj.value;
                    } else if (TRANSFORMATION_ABS == element1.transType) {
                        const unitobj = this.unitList.filter(item => item.label == UNIT_BPS)[0];
                        this.orgDataSets[index].riskFactorListJsonNode[index1].shockUnits = unitobj.value;
                    } else {
                        const unitobj = this.unitList.filter(item => item.label == UNIT_PERCENTILE)[0];
                        this.orgDataSets[index].riskFactorListJsonNode[index1].shockUnits = unitobj.value;
                    }
                } else {
                    const unitobj = this.unitList.filter(item => item.value == element1.units)[0];
                    this.orgDataSets[index].riskFactorListJsonNode[index1].shockUnits = unitobj.value;
                }
                /*   const rowWiseControl = new Object();
                rowWiseControl['isClicked'] = false;
                rowWiseControl['nonPreferredVariblesList'] = [];
                rowWiseControl['preferredVariblesList'] = [];
                this.rowWiseControls[element1.id] = rowWiseControl; */
                this.getPredeterminedList(index, element1);
            });
        });
    }

    loadErrorMessages() {
        const expCatType = this.rfCategories[this.expCatType].value;
        this.orgDataSets.forEach((element, index) => {
            let errMsgs = [];
            const riskFactorListJsonNode = element.riskFactorListJsonNode.filter(item => item.expCat == expCatType);
            riskFactorListJsonNode.forEach(element1 => {
                if (element1.errMsg != '' && element1.errMsg != null) {
                    const errObj = { name: '', id: '', errMsg: '' };
                    errObj.name = element1.name;
                    errObj.id = element1.id;
                    errObj.errMsg = element1.errMsg;
                    errMsgs.push(errObj);
                }
            });
            const prsBarCnt = this.filledCntPercentage(index);
            let showPrgBar = true;
            if (index == 0) {
                showPrgBar = false;
            }
            this.setWiseControls.push({
                setId: element.id,
                errMsgs: errMsgs,
                selectAllRF: false,
                checkedRFList: [],
                pager: {},
                criFilter: false,
                filterObj: {},
                showMetaData: false,
                prsBarCnt: prsBarCnt,
                showPrgBar: showPrgBar
            });
        });
    }

    reLoadErrorMessages() {
        const expCatType = this.rfCategories[this.expCatType].value;
        this.orgDataSets.forEach((element, index) => {
            let errMsgs = [];
            const riskFactorListJsonNode = element.riskFactorListJsonNode.filter(item => item.expCat == expCatType);
            riskFactorListJsonNode.forEach(element1 => {
                if (element1.errMsg != '' && element1.errMsg != null) {
                    const errObj = { name: '', id: '', errMsg: '' };
                    errObj.name = element1.name;
                    errObj.id = element1.id;
                    errObj.errMsg = element1.errMsg;
                    errMsgs.push(errObj);
                }
            });
            const prsBarCnt = this.filledCntPercentage(index);
            this.setWiseControls[index].errMsgs = errMsgs;
            this.setWiseControls[index].prsBarCnt = prsBarCnt;
        });
    }

    selectAllChange(event, setId) {
        if (event.target.checked) {
            this.setWiseControls[setId].selectAllRF = true;
            this.setWiseControls[setId].checkedRFList = this.dataSets[setId].riskFactorListJsonNode.map(p => p.id);
        } else {
            this.setWiseControls[setId].selectAllRF = false;
            this.setWiseControls[setId].checkedRFList = [];
        }
    }

    selectRF(event, setId, id) {
        if (event.target.checked) {
            this.setWiseControls[setId].checkedRFList.push(id);
            if (this.setWiseControls[setId].checkedRFList.length == this.dataSets[setId].riskFactorListJsonNode.length) {
                this.setWiseControls[setId].selectAllRF = true;
            }
        } else {
            const checkedRFList = this.setWiseControls[setId].checkedRFList.filter(element => {
                return element != id;
            });
            this.setWiseControls[setId].checkedRFList = checkedRFList;
            this.setWiseControls[setId].selectAllRF = false;
        }
    }

    calCatExpTypes() {
        this.rfCategories.forEach((element, index) => {
            const cnt = this.countByExpType(element.value);
            const fcnt = this.filledCountByExpType(element.value);
            this.rfCategories[index].label = this.rfCategories[index].label1 + ' (' + fcnt + '/' + cnt + ')';
        });
    }

    countByExpType(type) {
        let cnt = 0;
        this.orgDataSets.forEach(element => {
            if (element.riskFactorListJsonNode !== null && element.riskFactorListJsonNode !== undefined) {
                const filt = element.riskFactorListJsonNode.filter(item => item.expCat == type);
                cnt = cnt + filt.length;
            }
        });
        return cnt;
    }

    filledCountByExpType(type) {
        let cnt = 0;
        const filtData = this.orgDataSets;
        filtData.forEach(element1 => {
            element1.riskFactorListJsonNode.forEach(element2 => {
                const shockHeaders = Object.keys(element2.shockValues);
                let isCnt = false;

                for (let s = 0; s < shockHeaders.length; s++) {
                    if (
                        type == element2.expCat &&
                        (null != element2.shockValues[shockHeaders[s]] && '' != element2.shockValues[shockHeaders[s]] + '')
                    ) {
                        isCnt = true;
                    } else {
                        isCnt = false;
                        break;
                    }
                }
                if (isCnt) {
                    cnt = cnt + 1;
                    isCnt = false;
                }
            });
        });
        return cnt;
    }

    refreshData(type) {
        let filtData;
        this.dataSets = this.orgDataSets;
        filtData = this.dataSets.map(element => {
            if (element.riskFactorListJsonNode !== null && element.riskFactorListJsonNode !== undefined) {
                return {
                    id: element.id,
                    riskFactorSetName: element.riskFactorSetName,
                    riskFactorSetType: element.riskFactorSetType,
                    riskFactorSetId: element.riskFactorSetId,
                    riskFactors: element.riskFactors,
                    lastModifiedBy: element.lastModifiedBy,
                    lastModifiedDate: element.lastModifiedDate,
                    expand: element.expand,
                    assetClassId: element.assetClassId,
                    riskFactorListJsonNode: element.riskFactorListJsonNode.filter(item => item.expCat == type)
                };
            } else {
                return {
                    id: element.id,
                    riskFactorSetName: element.riskFactorSetName,
                    riskFactorSetType: element.riskFactorSetType,
                    riskFactorSetId: element.riskFactorSetId,
                    riskFactors: element.riskFactors,
                    lastModifiedBy: element.lastModifiedBy,
                    lastModifiedDate: element.lastModifiedDate,
                    expand: element.expand,
                    assetClassId: element.assetClassId,
                    riskFactorListJsonNode: element.riskFactorListJsonNode
                };
            }
        });
        this.dataSets = filtData;
        // this.tempDataSets = Object.assign({}, filtData);
    }

    validateTab(id) {
        const expCat = this.rfCategories[this.expCatType].value;
        const modCat = this.rfCategories[1].value;
        this.isValid = true;
        this.orgDataSets.forEach((element1, index1) => {
            let riskFactorListJsonNode;
            if (id == 2) {
                riskFactorListJsonNode = element1.riskFactorListJsonNode.filter(item => item.expCat == expCat || item.expCat == modCat);
            } else {
                riskFactorListJsonNode = element1.riskFactorListJsonNode.filter(item => item.expCat == expCat);
            }
            riskFactorListJsonNode.forEach((element2, index2) => {
                const shockHeaders = Object.keys(element2.shockValues);
                shockHeaders.forEach(element3 => {
                    if (
                        null == element2.mthdlgyType ||
                        '' === element2.mthdlgyType ||
                        null == element2.shockUnits ||
                        '' === element2.shockUnits ||
                        null == element2.shockValues[element3] ||
                        '' === element2.shockValues[element3]
                    ) {
                        const pageNo = Math.ceil((index2 + 1) / DEFAULT_PAGE_SIZE);
                        this.setPage(pageNo, index1);
                        return (this.isValid = false);
                    }
                });
            });
        });
        return this.isValid;
    }

    validateAllTabs() {
        this.isValid = true;
        this.orgDataSets.forEach(element1 => {
            element1.riskFactorListJsonNode.forEach(element2 => {
                const shockHeaders = Object.keys(element2.shockValues);
                shockHeaders.forEach(element3 => {
                    if (
                        null == element2.mthdlgyType ||
                        '' === element2.mthdlgyType ||
                        null == element2.shockUnits ||
                        '' === element2.shockUnits ||
                        null == element2.shockValues[element3] ||
                        '' === element2.shockValues[element3]
                    ) {
                        return (this.isValid = false);
                    }
                });
            });
        });
        return this.isValid;
    }

    toggleexpcolM(id, val) {
        this.dataSets[id].expand = val;
        this.orgDataSets[id].expand = val;

        let flag = true;
        for (var i = 0; i < this.listOfRowsOpened.length; i++) {
            if (this.listOfRowsOpened[i] === id) {
                flag = false;
                this.listOfRowsOpened.splice(i, 1);
            }
        }
        if (flag) {
            this.listOfRowsOpened.push(id);
        }
    }

    toggleexpcol(id, val) {
        this.dataSets[id].expand = val;
        this.orgDataSets[id].expand = val;
    }

    changeExpTypeBtn(id) {
        this.istogglEnable = false;
        //this.onChangeScreen = true;
        const idx = this.rfCategories
            .map(function(e) {
                return e.value;
            })
            .indexOf(parseInt(id));
        if (this.validateTab(idx) || idx == '0' || this.expCatType == 2) {
            this.refreshData(id);
            this.changeExpBtnStyles(idx);
            this.expCatType = idx;
            if (this.rfCategories[idx].label1.toLowerCase() == BUSINESSRULE_LABEL) {
                this.addFormulas();
            }
            this.resetPaginationtoAllSets();
            this.reLoadErrorMessages();
            // let nodes = document.getElementsByClassName('minusNode');
            // this.expandTableRows(nodes);
        } else {
            this.showErrorValidations(true, 'Please fill all the required inputs...');
        }
    }

    changeExpBtnStyles(id) {
        if (id === 0) {
            this.firsttable = true;
            this.secondtable = false;
            this.thirdtable = false;
        } else if (id === 1) {
            this.firsttable = false;
            this.secondtable = true;
            this.thirdtable = false;
        } else if (id === 2) {
            this.firsttable = false;
            this.secondtable = false;
            this.thirdtable = true;
        }
        this.rfCategories.forEach((element, index) => {
            if (index == id) {
                return {
                    value: element.value,
                    label: element.label,
                    label1: element.label1,
                    applyPrimaryClass: element.applyPrimaryClass = true
                };
            } else {
                return {
                    value: element.value,
                    label: element.label,
                    label1: element.label1,
                    applyPrimaryClass: element.applyPrimaryClass = false
                };
            }
        });
    }

    changeRFTypeDD(obj, idObj) {
        const ids = idObj.split('_');
        const val = obj;
        const idx = this.rfCategories
            .map(function(e) {
                return e.value;
            })
            .indexOf(parseInt(val));
        const expCat = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].expCat;
        const shockValues = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
        const shockHeaders = Object.keys(shockValues);
        shockHeaders.forEach(element => {
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[element] = '';
        });
        this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].errMsg = '';
        this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].expCat = val;
        this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].mthdlgyType = null;
        const rfId = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].id;
        this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].dependentFactors = null;
        let riskFactorListJsonNode = this.orgDataSets[ids[0]].riskFactorListJsonNode;
        const newElement = riskFactorListJsonNode.filter(item => item.id == rfId)[0];
        riskFactorListJsonNode = riskFactorListJsonNode.filter(item => item.id != rfId);
        riskFactorListJsonNode.splice(0, 0, newElement);
        this.orgDataSets[ids[0]].riskFactorListJsonNode = riskFactorListJsonNode;

        const tabVal = this.rfCategories[this.expCatType].value;
        if (parseInt(val) > parseInt(tabVal)) {
            this.refreshData(this.expCatType);
            this.changeExpBtnStyles(this.expCatType);
            const currentPage = this.setWiseControls[ids[0]].pager.currentPage;
            if (this.setWiseControls[ids[0]].pager.startIndex === this.setWiseControls[ids[0]].pager.endIndex) {
                this.resetPaginationtoAllSets();
            } else {
                this.resetPaginationtoAllSets();
                this.setPage(currentPage, ids[0]);
            }
        } else {
            this.refreshData(val);
            this.changeExpBtnStyles(idx);
            this.expCatType = idx;
            this.resetPaginationtoAllSets();
        }
        this.calCatExpTypes();
        this.reLoadErrorMessages();
    }

    changeMedTypeDD(obj, idObj) {
        const ids = idObj.split('_');
        const val = obj;
        this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].mthdlgyType = val;
        const med = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].mthdlgyType;
        const medobj = this.methodologiesList.filter(item => item.value == med)[0];
        if (medobj.label.toLowerCase() === INTERPOLATION_LABEL) {
            const crvfmlyId = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].crvfmlyId;
            const mtrtyId = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].mtrtyId;
            if (crvfmlyId == null || crvfmlyId == '' || mtrtyId == null || mtrtyId == '') {
                setTimeout(() => {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]]['mthdlgyType'] = '';
                    this.showErrorValidations(true, 'Selected riskfactor not having any curve family');
                    return false;
                }, 10);
            }
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].bsnsRule = {
                isProxy: false,
                isintpol: true,
                proxy: '',
                interpolation: DEFAULT_IP_LINEAR_ID,
                proxyHiddenFormula: ''
            };
            const shockValues = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
            const shockHeaders = Object.keys(shockValues);
            shockHeaders.forEach(element => {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[element] = '';
            });
        } else if (medobj.label.toLowerCase() === PROXY_LABEL) {
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].bsnsRule = {
                isProxy: true,
                isintpol: false,
                proxy: '',
                interpolation: '',
                proxyHiddenFormula: ''
            };
            const shockValues = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
            const shockHeaders = Object.keys(shockValues);
            shockHeaders.forEach(element => {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[element] = '';
            });
        } else if (medobj.label.toLowerCase() === USERDEFINED_LABEL) {
            const shockValues = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
            const shockHeaders = Object.keys(shockValues);
            shockHeaders.forEach(element => {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[element] = '';
            });
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd = { isqua: false };
            this.reLoadErrorMessages();
            // this.colspan = this.colspan - 1;
        } else if (medobj.label.toLowerCase() === QUANTILE_LABEL) {
            const shockValues = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
            const shockHeaders = Object.keys(shockValues);
            shockHeaders.forEach(element => {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[element] = '';
            });
            const lkbkp = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd.lkbkp;
            if (lkbkp != undefined || lkbkp != null || lkbkp != '') {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd = { isqua: true, lkbkp: lkbkp };
            } else {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd = { isqua: true, lkbkp: DEFAULT_FREQUENCY_VAL };
            }
            this.reLoadErrorMessages();
            // this.colspan = this.colspan + 1;
        } else {
            /* this.scenarioService.getMedConfigList(val).subscribe((res: any) => {
                this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].mdlDrvn = res;
            }); */
        }
    }

    calDate(obj) {
        const utcSeconds = obj;
        const d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
        return this.months[d.getMonth()] + d.getDate() + ',' + d.getFullYear() + ' at ' + this.formatAMPM(d);
    }

    formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    showHideMetaData(setId) {
        /* if (!this.showMetaData) {
            this.colspan = 15;
        } else {
            this.colspan = 7;
        } */

        if (!this.setWiseControls[setId].showMetaData) {
            this.scenarioService.getMasterListForRiskFactorSelection(parseInt(this.scenarioObj.id)).subscribe(response => {
                this.masterDataObj = response['MASTER_DATA'];
                this.masterDataMap = response['MASTER_DATA_MAPPING'];
                this.setWiseControls[setId].showMetaData = !this.setWiseControls[setId].showMetaData;
            });
        } else {
            this.setWiseControls[setId].showMetaData = !this.setWiseControls[setId].showMetaData;
        }
    }

    loadMetaData() {
        this.scenarioService.getMasterListForRiskFactorSelection(parseInt(this.scenarioObj.id)).subscribe(response => {
            this.masterDataObj = response['MASTER_DATA'];
            this.masterDataMap = response['MASTER_DATA_MAPPING'];
        });
    }

    totalCntForSet(id) {
        let cnt = 0;
        const expCatType = this.rfCategories[this.expCatType].value;
        const filtData = this.orgDataSets[id];
        if (filtData.riskFactorListJsonNode !== null && filtData.riskFactorListJsonNode !== 'undefined') {
            const filt = filtData.riskFactorListJsonNode.filter(item => item.expCat == expCatType);
            cnt = filt.length;
        }
        return cnt;
    }

    totalFilledCntForSet(id) {
        let cnt = 0;
        const expCatType = this.rfCategories[this.expCatType].value;
        const filtData = this.orgDataSets[id];
        if (filtData.riskFactorListJsonNode !== null && filtData.riskFactorListJsonNode !== 'undefined') {
            const riskFactorListJsonNode = filtData.riskFactorListJsonNode.filter(item => item.expCat == expCatType);
            riskFactorListJsonNode.forEach(element2 => {
                const shockHeaders = Object.keys(element2.shockValues);
                let isCnt = false;
                for (let s = 0; s < shockHeaders.length; s++) {
                    if (null != element2.shockValues[shockHeaders[s]] && '' != element2.shockValues[shockHeaders[s]] + '') {
                        isCnt = true;
                    } else {
                        isCnt = false;
                        break;
                    }
                }
                if (isCnt) {
                    cnt = cnt + 1;
                    isCnt = false;
                }
            });
        }
        return cnt;
    }

    filledCntPercentage(id) {
        const tCnt = this.totalCntForSet(id);
        const filCnt = this.totalFilledCntForSet(id);
        return (filCnt / tCnt) * 100;
    }

    calSetWiseCnt(type, id) {
        const cnt = this.countBySetId(id, type);
        const fcnt = this.filledCountBySetId(id, type);
        return '(' + fcnt + '/' + cnt + ')';
    }

    countBySetId(id, type) {
        let cnt = 0;
        const filtData = this.orgDataSets[id];
        if (filtData.riskFactorListJsonNode !== null && filtData.riskFactorListJsonNode !== 'undefined') {
            const filt = filtData.riskFactorListJsonNode.filter(item => item.expCat == type);
            cnt = cnt + filt.length;
        }
        return cnt;
    }

    filledCountBySetId(id, type) {
        let cnt = 0;
        const filtData = this.orgDataSets[id];
        if (filtData.riskFactorListJsonNode !== null && filtData.riskFactorListJsonNode !== 'undefined') {
            const filt = filtData.riskFactorListJsonNode.forEach(element2 => {
                const shockHeaders = Object.keys(element2.shockValues);
                let isCnt = false;
                for (let s = 0; s < shockHeaders.length; s++) {
                    if (
                        type == element2.expCat &&
                        (null != element2.shockValues[shockHeaders[s]] && '' != element2.shockValues[shockHeaders[s]] + '')
                    ) {
                        isCnt = true;
                    } else {
                        isCnt = false;
                        break;
                    }
                }
                if (isCnt) {
                    cnt = cnt + 1;
                    isCnt = false;
                }
            });
        }
        return cnt;
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.scenarioObj.id }], { skipLocationChange: true });
    }

    goToPreviousPage() {
        this.istogglEnable = false;
        if (this.userCanAccess) {
            if (this.expCatType == 0) {
                this.navigateTo('scenario/selectRiskFactor');
            } else {
                const id = this.rfCategories[this.expCatType - 1].value;
                const idx = this.rfCategories
                    .map(function(e) {
                        return e.value;
                    })
                    .indexOf(parseInt(id));
                this.changeExpBtnStyles(idx);
                this.expCatType = idx;
                if (this.rfCategories[idx].label1.toLowerCase() == BUSINESSRULE_LABEL) {
                    this.addFormulas();
                }
                this.resetPaginationtoAllSets();
                this.reLoadErrorMessages();
                document.documentElement.scrollTop = 0;
            }
        } else {
            this.navigateTo('scenario/selectRiskFactor');
        }
    }

    saveDataSets(type, rType) {
        if (SCENARIO_OUTPUT == type) {
            if (this.validateTab(this.expCatType)) {
                if (this.expCatType == 2) {
                    this.validateAndSaveDataSets(type, rType);
                } else {
                    this.changeExpTypeBtn(this.rfCategories[this.expCatType + 1].value);
                    document.documentElement.scrollTop = 0;
                }
            } else {
                this.showErrorValidations(true, 'Please fill all the required inputs...');
            }
        } else {
            this.validateAndSaveDataSets(type, rType);
        }
    }

    validateAndSaveDataSets(type, rType) {
        const finalData = this.orgDataSets.map(element => {
            return {
                id: element.id,
                riskFactorSetName: element.riskFactorSetName,
                riskFactorSetType: element.riskFactorSetType,
                scenarioId: element.scenarioId,
                riskFactorListJSON: JSON.stringify(element.riskFactorListJsonNode),
                riskFactorListJsonNode: null,
                riskFactors: element.riskFactors,
                lastModifiedBy: element.lastModifiedBy,
                lastModifiedDate: this.scenarioObj.lastModifiedDate,
                assetClassId: element.assetClassId
            };
        });
        this.scenarioService
            .saveDataSets({
                scenarioDTO: JSON.stringify(this.scenarioObj),
                riskFactorSetDTO: JSON.stringify(finalData),
                status: type,
                isCalculated: this.isCalculated
            })
            .subscribe(
                response => {
                    this.scenarioObj = response;
                    this.showSuccessValidations(true, 'Data Sets saved successfully.');
                    if (SCENARIO_OUTPUT == type && rType == 'SN') {
                        this.navigateTo('scenario/scenarioOutput');
                    } else if (SCENARIO_SHOCKS == type && rType == 'SD') {
                        this.onChangeScreen = false;
                        this.navigateTo('scenario/scenarioShocks');
                    } else {
                        this.navigateTo('/scenario');
                    }
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        // this.router.navigate(['scenarioHome', { id: this.scenarioObj.id }], { skipLocationChange: true });
    }

    openDeleteDataModal(id) {
        this.modalService.open(this.deleteDataModal, {});
        this.setId = id;
    }

    openArithmaticFormulaDataModal(obj) {
        this.ids = obj.target.id.split('_');
        const id = this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].id;
        const name = this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].name;
        this.getselectedRiskFactors(id, name);
        this.modalService.open(this.arithmaticFormulaDataModal, {});
        this.arithmaticFormula = obj.target.value;
        this.riskFactorLibDTO.arithmaticFormula = this.dataSets[this.ids[0]].riskFactorListJsonNode[
            this.ids[1]
        ].bsnsRule.proxyHiddenFormula;
        if (this.riskFactorLibDTO.arithmaticFormula == 'null') {
            this.riskFactorLibDTO.arithmaticFormula = '';
        }

        this.setFormula();
    }

    getselectedRiskFactors(id, name) {
        this.selectedRiskFactors = [];
        const rfObj = this.rfCategories.filter(obj => {
            return obj.label1.toLowerCase() == BUSINESSRULE_LABEL;
        });
        let filt = [];
        let formulaList;
        this.orgDataSets.forEach(element => {
            element.riskFactorListJsonNode.forEach(riskfactorList => {
                var bool = false;
                if (riskfactorList.id == id) {
                    bool = true;
                }
                let formula = riskfactorList.bsnsRule.proxyHiddenFormula;
                if (formula != null && formula != undefined && formula != '') {
                    formulaList = riskfactorList.bsnsRule.proxyHiddenFormula.split(/\$[\- + = * / < > ( )]\$/);
                    formulaList.forEach(list => {
                        if (name.indexOf(list) > -1) {
                            bool = true;
                        }
                    });
                }
                if (!bool) {
                    filt.push(riskfactorList);
                }
            });
        });
        for (let i = 0; i < filt.length; i++) {
            this.selectedRiskFactors.push({ id: filt[i].id, name: filt[i].name });
        }
    }

    filterObjectKeys(keysArr, list) {
        const filtered = Object.keys(list)
            .filter(key => keysArr.includes(key))
            .reduce((obj, key) => {
                obj[key] = list[key];
                return obj;
            }, {});
        return filtered;
    }

    deleteRiskFactorSet(rfSetId) {
        if (rfSetId != null) {
            this.scenarioService
                .deleteRiskFactorSet({
                    id: rfSetId,
                    scenarioId: this.scenarioObj.id,
                    scenarioLastModifiedDate: this.scenarioObj.lastModifiedDate
                })
                .subscribe(
                    response => {
                        this.showSuccessValidations(true, 'Risk factor set deleted successfully.');
                        this.clearDataSet(rfSetId);
                        this.cancel();
                        this.reLoadErrorMessages();
                        this.setPage(1, this.setId);
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                        this.cancel();
                    }
                );
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

    cancel() {
        this.modalService.dismissAll();
        this.setId = null;
    }

    clearDataSet(setId) {
        for (let i = 0; i < this.orgDataSets.length; i++) {
            if (this.orgDataSets[i].id === setId) {
                this.orgDataSets.splice(i, 1);
            }
        }

        this.dataSets = this.orgDataSets;
        this.initShockView();
    }

    editDataSet(setId) {
        this.router.navigate(['scenario/selectRiskFactor', { id: this.scenarioObj.id, riskFactorSetId: setId }], {
            skipLocationChange: true
        });
    }

    updateShockForUnits(obj) {
        const val = obj.target.value;
        const ids = obj.target.id.split('_');
        let shockValues = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
        const rfName = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].name;
        const units = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockUnits;
        const unitobj = this.unitList.filter(item => item.value == units)[0];
        const shockKeys = Object.keys(shockValues);
        const prevUnits = this.getPreviousUnitValue(rfName, units);
        const prevUnitobj = this.unitList.filter(item => item.value == prevUnits)[0];
        for (let i = 0; i < shockKeys.length; i++) {
            let shockVal = shockValues[shockKeys[i]];
            if (shockVal !== '' && shockVal != null) {
                if (prevUnitobj.label == '%') {
                    shockVal = shockVal * 100;
                } else if (prevUnitobj.label == 'bps') {
                    shockVal = shockVal / 10000;
                }
                const units1 = this.tempDataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockUnits;
                if (unitobj.label == '%') {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[shockKeys[i]] = shockVal / 100;
                } else if (unitobj.label == 'bps') {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[shockKeys[i]] = shockVal * 10000;
                } else if (unitobj.label == 'abs') {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[shockKeys[i]] = shockVal;
                }
            }
        }
    }

    getPreviousUnitValue(name, currUnits) {
        for (let i = 0; i < this.tempDataSets.length; i++) {
            const riskFactorListJsonNode = this.tempDataSets[i].riskFactorListJsonNode;
            for (let j = 0; j < riskFactorListJsonNode.length; j++) {
                if (riskFactorListJsonNode[j].name == name) {
                    const units = riskFactorListJsonNode[j].shockUnits;
                    this.tempDataSets[i].riskFactorListJsonNode[j].shockUnits = currUnits;
                    return units;
                }
            }
        }
    }

    validateShockForUnits(obj) {
        const val = obj.target.value;
        const ids = obj.target.id.split('_');
        const shockVal = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[ids[2]];
        const units = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockUnits;
        const unitobj = this.unitList.filter(item => item.value === units)[0];
        if (unitobj && unitobj.label == '%' && (shockVal < -100 || shockVal > 100)) {
            // this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockVal = 0;
            // this.openAlertDataModal("Percentage can't be greater than 100.");
            const temp = shockVal + '';
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[ids[2]] = temp.slice(0, -1);
            // this.showErrorValidations(true, "Percentage can't be greater than 100.");
        } else if (shockVal) {
            let multiple = Math.pow(10, SHOCK_VALUE_DECIMAL);
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[ids[2]] = Math.round(shockVal * multiple) / multiple;
        }

        const prsBarCnt = this.filledCntPercentage(ids[0]);
        this.setWiseControls[ids[0]].prsBarCnt = prsBarCnt;
    }

    validateShockForQuantile(obj) {
        // const val = obj.target.value;
        this.onChangeScreen = true;
        const ids = obj.target.id.split('_');
        const qVal = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd.quap;
        // const units = this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockUnits;
        // const unitobj = this.unitList.filter(item => item.value === units)[0];
        if (qVal < 0 || qVal > 100) {
            const temp = qVal + '';
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd.quap = temp.slice(0, -1);
            // this.openAlertDataModal("Quantile Percentage can't be greater than 100.");
            this.showErrorValidations(true, 'Percentile column can have double values less than 100.');
        } else if (qVal) {
            let multiple = Math.pow(10, SHOCK_VALUE_DECIMAL);
            this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].preDtrmnd.quap = Math.round(qVal * multiple) / multiple;
        }
    }

    calculateShocks() {
        if (this.expCatType == 0) {
            this.calShocksForQuantile();
        } else if (this.expCatType == 1) {
            this.calculateShocksForModelDriven();
        } else if (this.expCatType == 2) {
            this.calShocksForInterPolation();
        }
        this.tempDataSets = JSON.parse(JSON.stringify(this.orgDataSets));
        return false;
    }

    calShocksForQuantile() {
        let riskFactorList = [];

        const idx = this.methodologiesList
            .map(function(e) {
                return e.label.toLowerCase();
            })
            .indexOf(QUANTILE_LABEL);
        const medId = this.methodologiesList[idx].value;

        const dataSets = this.orgDataSets;
        for (let i = 0; i < dataSets.length; i++) {
            const jsonData = dataSets[i].riskFactorListJsonNode;
            for (let j = 0; j < jsonData.length; j++) {
                if (jsonData[j].mthdlgyType == medId) {
                    const lkbkp = jsonData[j].preDtrmnd.lkbkp;
                    if (jsonData[j].preDtrmnd.quap == '' || jsonData[j].preDtrmnd.quap == null) {
                        this.isQuantile = false;
                        this.showErrorValidations(true, 'Please fill the value for ' + jsonData[j].name);
                        return false;
                    }
                    if (lkbkp == '' || lkbkp == null) {
                        this.isQuantile = false;
                        this.showErrorValidations(true, 'Please select the frequency for ' + jsonData[j].name);
                        return false;
                    }
                    const lkbkpObj = this.frequencyList.filter(item => item.value == lkbkp)[0];
                    const lkbkpVal = lkbkpObj.workingDays;
                    const units = jsonData[j].shockUnits;
                    const unitobj = this.unitList.filter(item => item.value == units)[0];
                    riskFactorList.push({
                        indexId: i + '_' + j,
                        rfId: jsonData[j].id,
                        lkbkPeriod: lkbkpVal,
                        unit: unitobj && null != unitobj ? unitobj.label : '%',
                        percentile: jsonData[j].preDtrmnd.quap
                    });
                }
            }
        }
        if (riskFactorList.length == 0) {
            this.showErrorValidations(true, 'Atleast one Quantile methodology need to be selected.');
            return false;
        }
        this.scenarioService
            .calQuantileForShocks({ scenarioDTO: JSON.stringify(this.scenarioObj), riskFactorSetDTO: JSON.stringify(riskFactorList) })
            .subscribe(
                response => {
                    // this.scenarioObj = response;
                    this.setShockValuesForQuantile(response);
                    this.showSuccessValidations(true, 'Quantile Percentile Calculated successfully.');
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
    }

    calculateShocksForModelDriven() {
        let riskFactorList = [];
        const mdId = this.rfCategories.filter(item => item.label1.toLowerCase() == MODELDRIVEN_LABEL)[0].value;
        const pdrId = this.rfCategories.filter(item => item.label1.toLowerCase() == PREDETERMINED_LABEL)[0].value;
        const dataSets = this.orgDataSets;
        let jsonData;
        for (let i = 0; i < dataSets.length; i++) {
            jsonData = dataSets[i].riskFactorListJsonNode;
            for (let j = 0; j < jsonData.length; j++) {
                if (jsonData[j].expCat == pdrId) {
                    const units = jsonData[j].shockUnits;
                    const mthdlgyType = jsonData[j].mthdlgyType;
                    const mthdlgyObj = this.methodologiesList.filter(item => item.value == mthdlgyType)[0];
                    const unitobj = this.unitList.filter(item => item.value == units)[0];
                    riskFactorList.push({
                        indexId: PREDETERMINED_LABEL + '_' + i + '_' + j,
                        rfId: jsonData[j].id,
                        rfName: jsonData[j].name,
                        isinput: 1,
                        unit: unitobj.label,
                        transType: jsonData[j].transType,
                        // shockValue: jsonData[j].shockVal,
                        medCode: mthdlgyObj.code,
                        shockValues: jsonData[j].shockValues,
                        setName: dataSets[i]['riskFactorSetName'],
                        assetClass: jsonData[j].astClsId,
                        subAssetClass: jsonData[j].subRskFctrId,
                        currency: jsonData[j].crncyId,
                        curveFamily: jsonData[j].crvfmlyId,
                        preferredVaribles: jsonData[j].preferredVaribles,
                        nonPreferredVaribles: jsonData[j].nonPreferredVaribles,
                        onlyWithPreffered: jsonData[j].onlyWithPreffered
                    });
                }
            }
        }

        // if (this.istogglEnable == undefined || !this.istogglEnable) {
        //     if (riskFactorList.length < 5) {
        //         this.showErrorValidations(true, 'Atleast 5 Predetermined shocks need to be selected.');
        //         return false;
        //     }
        // }

        if (this.istogglEnable) {
            let setDetails;

            for (let i = 0; i < dataSets.length; i++) {
                let prdDetails = [];
                setDetails = dataSets[i].riskFactorListJsonNode;
                for (let j = 0; j < setDetails.length; j++) {
                    if (setDetails[j].expCat == 1) {
                        prdDetails.push(setDetails[j]);
                    }
                }
                // if (prdDetails.length < 5) {
                //     this.showErrorValidations(true, 'Atleast 5 Predetermined shocks need to be selected for each set.');
                //     return false;
                // }
            }
        }
        for (let i = 0; i < dataSets.length; i++) {
            jsonData = dataSets[i].riskFactorListJsonNode;
            for (let j = 0; j < jsonData.length; j++) {
                if (jsonData[j].expCat == mdId) {
                    if (jsonData[j].mthdlgyType == null || jsonData[j].mthdlgyType == '') {
                        this.showErrorValidations(true, 'Please select the methodology for ' + jsonData[j].name);
                        return false;
                    }
                    const units = jsonData[j].shockUnits;
                    const mthdlgyType = jsonData[j].mthdlgyType;
                    const mthdlgyObj = this.methodologiesList.filter(item => item.value == mthdlgyType)[0];
                    const unitobj = this.unitList.filter(item => item.value == units)[0];
                    riskFactorList.push({
                        indexId: i + '_' + j,
                        rfId: jsonData[j].id,
                        rfName: jsonData[j].name,
                        isinput: 0,
                        unit: unitobj.label,
                        transType: jsonData[j].transType,
                        // shockValue: '',
                        medCode: mthdlgyObj.code,
                        shockValues: jsonData[j].shockValues,
                        setName: dataSets[i]['riskFactorSetName'],
                        assetClass: jsonData[j].astClsId,
                        subAssetClass: jsonData[j].subRskFctrId,
                        currency: jsonData[j].crncyId,
                        curveFamily: jsonData[j].crvfmlyId,
                        preferredVaribles: jsonData[j].preferredVaribles,
                        nonPreferredVaribles: jsonData[j].nonPreferredVaribles,
                        onlyWithPreffered: jsonData[j].onlyWithPreffered
                    });
                }
            }
        }

        if (riskFactorList.length == 5) {
            this.showErrorValidations(true, 'Atleast one model driven methodology should be present.');
            return false;
        }

        let tempCalcSetSpecific = this.scenarioObj.calcSetSpecific;

        this.scenarioObj.calcSetSpecific = this.calcSetSpecific;

        this.scenarioService
            .calculateShocksForModelDriven({
                scenarioDTO: JSON.stringify(this.scenarioObj),
                riskFactorSetDTO: JSON.stringify(riskFactorList)
            })
            .subscribe(
                response => {
                    this.setShockValuesForModelDriven(response);
                    this.isCalculated = true;
                },
                response => {
                    this.scenarioObj.calcSetSpecific = tempCalcSetSpecific;
                    this.showErrorValidations(true, response.error);
                }
            );
    }
    toggleEditable(event) {
        this.istogglEnable = event.target.checked;
    }

    calShocksForInterPolation() {
        let riskFactorList = [];
        const idx = this.methodologiesList
            .map(function(e) {
                return e.label.toLowerCase();
            })
            .indexOf(PROXY_LABEL);
        const pxyId = this.methodologiesList[idx].value;

        const idx1 = this.methodologiesList
            .map(function(e) {
                return e.label.toLowerCase();
            })
            .indexOf(INTERPOLATION_LABEL);

        const ipId = this.methodologiesList[idx1].value;
        const dataSets = this.orgDataSets;
        // const dataSets1 = this.dataSets;
        let jsonData;

        for (let i = 0; i < dataSets.length; i++) {
            jsonData = dataSets[i].riskFactorListJsonNode;
            for (let j = 0; j < jsonData.length; j++) {
                if (jsonData[j].mthdlgyType != ipId) {
                    const units = jsonData[j].shockUnits;
                    const mthdlgyType = jsonData[j].mthdlgyType;
                    const mthdlgyObj = this.methodologiesList.filter(item => item.value == mthdlgyType)[0];
                    const unitobj = this.unitList.filter(item => item.value == units)[0];

                    if (mthdlgyObj == null) {
                        this.showErrorValidations(true, 'Please select the Methodology for ' + jsonData[j].name);
                        return false;
                    }
                    if (jsonData[j].mthdlgyType == pxyId) {
                        const shockHeaders = Object.keys(jsonData[j].shockValues);
                        if (jsonData[j].shockValues[shockHeaders[0]] == '' || jsonData[j].shockValues[shockHeaders[0]] == null) {
                            this.showErrorValidations(true, 'Please fill the proxy value for ' + jsonData[j].name);
                            return false;
                        }
                    }

                    if (
                        jsonData[j].crvfmlyId != null &&
                        jsonData[j].crvfmlyId != '' &&
                        jsonData[j].mtrtyId != null &&
                        jsonData[j].mtrtyId != ''
                    ) {
                        riskFactorList.push({
                            indexId: PROXY_LABEL,
                            rfId: jsonData[j].id,
                            isinput: 1,
                            unit: unitobj.label,
                            // shockValue: jsonData[j].shockVal,
                            medCode: mthdlgyObj.code,
                            methodology: null,
                            shockValues: jsonData[j].shockValues,
                            mtrtyId: jsonData[j].mtrtyId,
                            crvfmlyId: jsonData[j].crvfmlyId
                        });
                    }
                }
            }
        }
        let isInterpolation = false;
        let isFeilds = false;
        for (let i = 0; i < dataSets.length; i++) {
            jsonData = dataSets[i].riskFactorListJsonNode;

            for (let j = 0; j < jsonData.length; j++) {
                if (jsonData[j].mthdlgyType == ipId) {
                    if (
                        (jsonData[j].bsnsRule.proxyHiddenFormula != null && jsonData[j].bsnsRule.proxyHiddenFormula != '') ||
                        (jsonData[j].bsnsRule.interpolation != null && jsonData[j].bsnsRule.interpolation != '')
                    ) {
                        isFeilds = true;
                    } else {
                        isFeilds = false;
                    }
                    if (!isFeilds) {
                        this.showErrorValidations(true, 'Please provide values for all fields');
                        return false;
                    }
                    if (jsonData[j].bsnsRule.interpolation != '') {
                        isInterpolation = true;
                    }
                    const units = jsonData[j].shockUnits;
                    const unitobj = this.unitList.filter(item => item.value == units)[0];
                    const mthdlgyType = jsonData[j].mthdlgyType;
                    const mthdlgyObj = this.methodologiesList.filter(item => item.value == mthdlgyType)[0];
                    const ip = jsonData[j].bsnsRule.interpolation;
                    const ipObj = this.interPolationList.filter(item => item.value == ip)[0];

                    const curvFilt = riskFactorList.filter(e => e.crvfmlyId == jsonData[j].crvfmlyId);
                    if (curvFilt.length < 2) {
                        this.showErrorValidations(
                            true,
                            jsonData[j].name + ' Risk factor have at least two inputs required for same curve family.'
                        );
                        return false;
                    }

                    if (mthdlgyObj == null) {
                        this.showErrorValidations(true, 'Please select the Methodology for ' + jsonData[j].name);
                        return false;
                    }

                    riskFactorList.push({
                        indexId: i + '_' + j,
                        rfId: jsonData[j].id,
                        isinput: 0,
                        unit: unitobj.label,
                        // shockValue: '',
                        medCode: mthdlgyObj.code,
                        shockValues: jsonData[j].shockValues,
                        methodology: ipObj.label,
                        mtrtyId: jsonData[j].mtrtyId,
                        crvfmlyId: jsonData[j].crvfmlyId
                    });
                }
            }
        }

        if (!isInterpolation) {
            this.showErrorValidations(true, 'Please select atleast one Methodology as Interpolation');
            return false;
        }

        this.scenarioService
            .calShocksForInterPolation({ scenarioDTO: JSON.stringify(this.scenarioObj), riskFactorSetDTO: JSON.stringify(riskFactorList) })
            .subscribe(
                response => {
                    this.setShockValuesForInterPolation(response);
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
    }

    setShockValuesForQuantile(obj) {
        for (let i = 0; i < obj.length; i++) {
            const ids = obj[i].indexId.split('_');
            const val = obj[i].shockVal;
            if (val) {
                // this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockVal = Math.round(val * 100) / 100;
                const shockValues = this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues;
                const shockHeaders = Object.keys(shockValues);
                if (isNaN(val)) {
                    this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[shockHeaders[0]] = 0;
                } else {
                    this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]].shockValues[shockHeaders[0]] = val;
                }
            }
        }
        this.reLoadErrorMessages();
    }

    /* setShockValuesForMLR1(obj) {
        for (let i = 0; i < obj.length; i++) {
            if (PREDETERMINED_LABEL != obj[i].indexId) {
                const ids = obj[i].indexId.split('_');
                const shockVal = obj[i].shockVal;
                const rsqVal = obj[i].rsq;
                const stdShockVal = obj[i].stdShockVal;
                if (shockVal) {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]]['shockVal'] = Math.round(shockVal * 100) / 100;
                }
                if (rsqVal) {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]]['rsq'] = Math.round(rsqVal * 100) / 100;
                }
                if (stdShockVal) {
                    this.dataSets[ids[0]].riskFactorListJsonNode[ids[1]]['stdShockVal'] = Math.round(stdShockVal * 100) / 100;
                }
            }
        }
    } */

    setShockValuesForModelDriven(obj) {
        let multiple = Math.pow(10, SHOCK_VALUE_DECIMAL);
        for (let i = 0; i < obj.length; i++) {
            const ids = obj[i].indexId.split('_');
            const rfId = obj[i].rfId;
            if (!(obj[i].indexId.indexOf(PREDETERMINED_LABEL) > -1)) {
                const errMsg = obj[i].errMsg;
                if (errMsg == '') {
                    const shockValues = obj[i].shockValues;
                    const rsqVal = obj[i].rsq;
                    const stdShockValues = obj[i].stdShockValues;
                    const dependentFactors = obj[i].dependentFactors;
                    const dependentFactorNames = obj[i].dependentFactorNames;
                    this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['errMsg'] = '';
                    if (shockValues) {
                        this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['shockValues'] = shockValues;
                    }
                    if (rsqVal) {
                        this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['rsq'] =
                            Math.round(rsqVal * multiple) / multiple;
                    }
                    if (stdShockValues) {
                        this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['stdShockValues'] = stdShockValues;
                    }
                    if (dependentFactors) {
                        this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['dependentFactors'] = dependentFactors;
                    }
                    if (dependentFactorNames) {
                        this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0][
                            'dependentFactorNames'
                        ] = dependentFactorNames;
                    }
                } else {
                    this.orgDataSets[ids[0]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['errMsg'] = errMsg;
                }
            } else {
                const stdShockValues = obj[i].stdShockValues;
                this.orgDataSets[ids[1]].riskFactorListJsonNode.filter(e => e.id == rfId)[0]['stdShockValues'] = stdShockValues;
            }
        }
        this.reLoadErrorMessages();
    }

    setShockValuesForInterPolation(obj) {
        for (let i = 0; i < obj.length; i++) {
            if (PROXY_LABEL != obj[i].indexId) {
                const ids = obj[i].indexId.split('_');
                const shockValues = obj[i].shockValues;
                const dependentFactors = obj[i].dependentFactors;

                if (shockValues) {
                    this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]]['shockValues'] = shockValues;
                }
                if (dependentFactors) {
                    this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]]['dependentFactors'] = dependentFactors;
                }
            }
        }
        this.reLoadErrorMessages();
    }

    getValue(id, master) {
        const t = this.masterDataObj[master].filter(e => e.value === id)[0];
        if (t) {
            return t.label;
        } else {
            return null;
        }
    }

    addFormulas() {
        const dataSets = this.dataSets;
        const operatorsMap = this.operatorsMap;
        const numArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        for (let i = 0; i < dataSets.length; i++) {
            let data = dataSets[i];
            for (let j = 0; j < data.riskFactorListJsonNode.length; j++) {
                let jsonData = data.riskFactorListJsonNode[j];
                if (jsonData.mthdlgyType == METHODOLOGY_PROXY) {
                    const rfConfigObj = this.rfConfigList.filter(item => item.ID == jsonData.id)[0];
                    let formula;
                    const re = /\$/gi;
                    let proxyHiddenFormula = jsonData.bsnsRule.proxyHiddenFormula;
                    if (
                        (rfConfigObj != null && rfConfigObj != undefined) ||
                        (proxyHiddenFormula != null && proxyHiddenFormula != undefined)
                    ) {
                        if (proxyHiddenFormula != null && proxyHiddenFormula != undefined) {
                            formula = proxyHiddenFormula.replace(re, '');
                        } else {
                            proxyHiddenFormula = rfConfigObj.FORMULA;
                            if (rfConfigObj.FORMULA != null) {
                                formula = rfConfigObj.FORMULA.replace(re, '');
                            }
                        }
                        if (proxyHiddenFormula != null && proxyHiddenFormula != undefined) {
                            this.dataSets[i].riskFactorListJsonNode[j].bsnsRule = {
                                isProxy: true,
                                isintpol: false,
                                proxy: formula,
                                interpolation: '',
                                proxyHiddenFormula: proxyHiddenFormula + ''
                            };
                        }
                        this.dataSets[i].riskFactorListJsonNode[j].dependentFactors = this.getDependentFactors(proxyHiddenFormula);
                    }
                    let formulaList = [];
                    if (formula && formula != null && formula != undefined) {
                        const shockValues = this.dataSets[i].riskFactorListJsonNode[i].shockValues;
                        const shockHeaders = Object.keys(shockValues);
                        let formula1 = formula;
                        const operatorsMapKeys = Object.keys(operatorsMap);
                        for (let q = 0; q < operatorsMapKeys.length; q++) {
                            if (!numArray.includes(operatorsMap[operatorsMapKeys[q]])) {
                                if (formula.includes(operatorsMap[operatorsMapKeys[q]])) {
                                    formula1 = formula1.replace(
                                        operatorsMap[operatorsMapKeys[q]],
                                        '&&' + operatorsMap[operatorsMapKeys[q]] + '&&'
                                    );
                                }
                            }
                        }
                        const formulas = formula1.split('&&');
                        if (formulas) {
                            this.calculateFormula(formulas, i, j, shockHeaders);
                        } else {
                            formulaList.push(formula1);
                            this.calculateFormula(formulaList, i, j, shockHeaders);
                        }
                    }
                }
            }
        }
    }

    getDependentFactors(proxyHiddenFormula) {
        const re = /\$/gi;
        let list = [];
        if (proxyHiddenFormula != null && proxyHiddenFormula != '') {
            list = proxyHiddenFormula.split(re);
        }
        let rfIds = null;
        list.forEach(element1 => {
            this.orgDataSets.forEach(element2 => {
                element2.riskFactorListJsonNode.forEach(element3 => {
                    if (element3.name == element1) {
                        rfIds = rfIds + element3.id + ',';
                    }
                });
            });
        });
        if (rfIds != null) {
            rfIds = rfIds.slice(0, -1);
        }
        return rfIds;
    }

    trackByIndex(index: number, obj: any) {
        return index;
    }

    addOperator = function(operator, type) {
        const supportId = this.getTypeFormulaMaxSupportId();
        const text = this.operatorsMap[operator];
        let operatorName = this.operatorsMap[operator];
        if (type === 'NUM') {
            operatorName = operatorName + 'C';
        }
        const typeFormulaLiIndex = this.getTypeFormulaElementIndexCM();
        let typeTemp = null;
        const last2Element = $('#formulaBuilderDiv>li:nth-child(' + (typeFormulaLiIndex - 1) + ')');
        if (last2Element.length > 0) {
            const last2ElementId = $(last2Element).attr('id');
            const last2ElementIds = last2ElementId.split('_');
            typeTemp = last2ElementIds[2];
        }
        if (typeTemp === 'NUM' && type === 'NUM') {
            const value = $(last2Element).attr('value');
            const textTemp = value.substr(0, value.length - 1);
            $(last2Element).attr('value', textTemp + operatorName);
            $(last2Element).attr('id', supportId + '_' + operator + '_' + type);
            const innerHtmlText =
                "<a href='javascript:void(0);' class='pclose' onclick='removeData(\"" +
                supportId +
                '_' +
                operator +
                '_' +
                type +
                '");\'>x</a>';

            $(last2Element).html(textTemp + text + innerHtmlText);
        } else {
            const spanTag =
                "<li id='" +
                supportId +
                '_' +
                operator +
                '_' +
                type +
                "' value='" +
                operatorName +
                "'>" +
                text +
                "<a href='javascript:void(0);' class='pclose' onclick='removeData(\"" +
                supportId +
                '_' +
                operator +
                '_' +
                type +
                '");\'>x</a></li>';
            $('#formulaBuilderDiv')
                .find(' > li:nth-child(' + typeFormulaLiIndex + ')')
                .before(spanTag);
        }
        $('#customMnemonicTaxonomyText').focus();
    };

    setFormula() {
        const re = /\$/gi;
        const res = this.riskFactorLibDTO.arithmaticFormula.split('$');
        this.arithmaticFormula = this.arithmaticFormula.replace(re, '');
        //this.riskFactorLibDTO.arithmaticFormula.replace('$','')
        for (let i = 0; i < res.length; i++) {
            switch (res[i]) {
                case this.operatorsMap.SUB:
                    this.addOperator('SUB', 'OPR');
                    break;
                case this.operatorsMap.MULT:
                    this.addOperator('MULT', 'OPR');
                    break;
                case this.operatorsMap.OPENL:
                    this.addOperator('OPENL', 'OPR');
                    break;
                case this.operatorsMap.MIN:
                    this.addOperator('MIN', 'OPR');
                    break;
                case this.operatorsMap.ADD:
                    this.addOperator('ADD', 'OPER');
                    break;
                case this.operatorsMap.DIVIDE:
                    this.addOperator('DIVIDE', 'OPER');
                    break;
                case this.operatorsMap.OPENR:
                    this.addOperator('OPENR', 'OPER');
                    break;
                case this.operatorsMap.MAX:
                    this.addOperator('MAX', 'OPER');
                    break;
                case this.operatorsMap.SIMPLEEQUAL:
                    this.addOperator('SIMPLEEQUAL', 'OPER');
                    break;
                case this.operatorsMap.LESSTHAN:
                    this.addOperator('LESSTHAN', 'OPER');
                    break;
                case this.operatorsMap.GREATERTHAN:
                    this.addOperator('GREATERTHAN', 'OPER');
                    break;
                case this.operatorsMap.NOTEQUAL:
                    this.addOperator('NOTEQUAL', 'OPER');
                    break;
                case this.operatorsMap.COMMA:
                    this.addOperator('COMMA', 'OPER');
                    break;
                default:
                    if (res[i] !== '') {
                        const numdata = parseInt(res[i]);
                        if (Number.isInteger(numdata)) {
                            const id = i.toString() + '_' + 'THREE_NUM';
                            const itemstring =
                                '<li id="' +
                                id +
                                '" value="' +
                                res[i] +
                                'C">' +
                                res[i] +
                                '<a href="javascript:void(0);" class="pclose" onclick="removeData(&quot;' +
                                id +
                                '&quot;);">x</a></li>';
                            $('#formulaBuilderDiv')
                                .find('li:last-child')
                                .before(itemstring);
                        } else {
                            const id = res[i] + '_' + 'TAXO';
                            const itemstring =
                                '<li id="' +
                                id +
                                '" value="' +
                                res[i] +
                                '">' +
                                res[i] +
                                '<a href="javascript:void(0);" class="pclose" onclick="removeData(&quot;' +
                                id +
                                '&quot;);">x</a></li>';
                            $('#formulaBuilderDiv')
                                .find('li:last-child')
                                .before(itemstring);
                        }
                    }
                    // this.addOperator('THREE','NUM');
                    break;
            }
            const itemstring =
                '<li id="' +
                i +
                'opr" value="' +
                res[i] +
                '">' +
                res[i] +
                '<a href="javascript:void(0);" class="pclose" onclick="removeData(&quot;' +
                i +
                'opr&quot;);">x</a></li>';
            // $("#formulaBuilderDiv").append(itemstring);
            //  $("#formulaBuilderDiv").find('input').before(itemstring)
        }

        $('#formulaBuilderDiv li').each(function(index, element) {
            if ('customTaxonomyTextIdLi' != $(element).attr('id')) {
                let liTag = '<li>' + $(element).html() + '</li>';
                $('#formulaBuilderDiv1').append(liTag);
            }
        });
    }

    getTypeFormulaMaxSupportId() {
        let supportId = 0;
        $('#formulaBuilderDivForValidation li').each(function(index, element) {
            const id = $(element).attr('id');
            const ids = id.split('_');
            supportId = supportId < parseInt(ids[0]) ? parseInt(ids[0]) : supportId;
        });
        $('#formulaBuilderDiv li').each(function(index, element) {
            const id = $(element).attr('id');
            const ids = id.split('_');
            supportId = supportId < parseInt(ids[0]) ? parseInt(ids[0]) : supportId;
        });
        return supportId + 1;
    }
    getTypeFormulaElementIndexCM() {
        let prevElement = 0;
        $('#formulaBuilderDiv li').each(function(index, element) {
            const id = $(element).attr('id');
            prevElement = index;
            if (id === 'customTaxonomyTextIdLi') {
                return false;
            }
        });
        return prevElement + 1;
    }

    applyFormulaForShocks() {
        //this.formulaList.push(this.riskFactorLibDTO.arithmaticFormula.split(/\$[\- + = * / < > ( )]\$/));
        const shockValues = this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].shockValues;
        const shockHeaders = Object.keys(shockValues);
        shockHeaders.forEach(element => {
            this.updateFormula(element);
        });
    }

    updateFormula(shockHeader) {
        let listcalc = '';
        let formeval = '';
        let licount = 1;
        const orgDataSets = this.orgDataSets;
        const operatorsMap = this.operatorsMap;
        $('#formulaBuilderDiv')
            .find('li')
            .each(function() {
                const text = $(this)
                    .clone()
                    .children()
                    .remove()
                    .end()
                    .text();
                if ($('#formulaBuilderDiv').find('li').length > licount) {
                    listcalc = listcalc + text.toString() + '$';
                    const operatorsMapKeys = Object.keys(operatorsMap);
                    for (let q = 0; q < operatorsMapKeys.length; q++) {
                        if (text.toString() == operatorsMap[operatorsMapKeys[q]]) {
                            formeval = formeval + text.toString();
                            break;
                        }
                    }

                    for (let x = 0; x < orgDataSets.length; x++) {
                        const element = orgDataSets[x];
                        const filt = element.riskFactorListJsonNode.filter(item => item.name == text.toString());
                        if (filt.length > 0) {
                            formeval = formeval + filt[0].shockValues[shockHeader];
                            break;
                        }
                    }
                }
                licount += 1;
            });
        this.riskFactorLibDTO.arithmaticFormula = listcalc.slice(0, -1);
        const re = /\$/gi;
        this.arithmaticFormula = listcalc.slice(0, -1);
        const formula = this.arithmaticFormula.replace(re, '');
        this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].bsnsRule = {
            isProxy: true,
            isintpol: false,
            proxy: formula,
            interpolation: '',
            proxyHiddenFormula: this.riskFactorLibDTO.arithmaticFormula
        };
        this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].dependentFactors = this.getDependentFactors(
            this.riskFactorLibDTO.arithmaticFormula
        );
        try {
            const val = eval(formeval);
            if (isNaN(val)) {
                this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].shockValues[shockHeader] = 0;
            } else {
                this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].shockValues[shockHeader] = val;
            }
        } catch (e) {
            this.dataSets[this.ids[0]].riskFactorListJsonNode[this.ids[1]].shockValues[shockHeader] = 0;
            this.showErrorValidations(true, 'Invalid Formula.');
        }
    }

    checkMedType(medId, id1, id2) {
        const medobj = this.methodologiesList.filter(item => item.value == medId)[0];
        if (medobj && medobj.label && medobj.label.toLowerCase() === QUANTILE_LABEL) {
            this.dataSets[id1].riskFactorListJsonNode[id2].preDtrmnd = { isqua: true };
            return true;
        } else {
            this.dataSets[id1].riskFactorListJsonNode[id2].preDtrmnd = { isqua: false };
            return false;
        }
    }

    getKeys(map) {
        return Array.from(Object.keys(map));
    }

    changeShockUnit(transType, idsObj) {
        const ids = idsObj.split('_');
        if (TRANSFORMATION_LOG == transType) {
            // const unitobj = this.unitList.filter(item => item.label == UNIT_PERCENTILE)[0];
            // this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]].units = unitobj.value;
            return true;
        } else if (TRANSFORMATION_ABS == transType) {
            // const unitobj = this.unitList.filter(item => item.label == UNIT_BPS)[0];
            // this.orgDataSets[ids[0]].riskFactorListJsonNode[ids[1]].units = unitobj.value;
            return true;
        } else {
            return false;
        }
    }

    deleteSelectedRF(setId) {
        /* this.modalHeader = 'Delete Risk factors';
        this.modalService.open(this.deleteRFModal, {}); */
        this.setId = setId;
        this.resetModelBusRuleValues('delete', setId, null, null, null);
        this.onChangeScreen = true;
    }

    deleteSelectedRF1(setId) {
        let checkedRFList = this.setWiseControls[setId].checkedRFList;
        let riskFactorListJsonNode = this.dataSets[setId].riskFactorListJsonNode;
        if (checkedRFList.length > 0) {
            checkedRFList.forEach(element => {
                riskFactorListJsonNode = riskFactorListJsonNode.filter(element1 => {
                    return element1.id != element;
                });
                checkedRFList = checkedRFList.filter(element2 => {
                    return element2 != element;
                });
            });
            this.setWiseControls[setId].checkedRFList = checkedRFList;
            this.dataSets[setId].riskFactorListJsonNode = riskFactorListJsonNode;
            this.orgDataSets[setId].riskFactorListJsonNode = riskFactorListJsonNode;
            this.calCatExpTypes();
        } else {
        }
    }

    setPage(page, setId) {
        this.filterDataSetWise(setId);

        const riskFactorListJsonNode = this.dataSets[setId].riskFactorListJsonNode;

        const totalSize = riskFactorListJsonNode.length;

        const totalPages = Math.ceil(totalSize / PAGE_SIZE);

        if (page > totalPages) {
            page = totalPages;
        }

        // get pager object from service
        this.setWiseControls[setId].pager = this.pagerService.getPager(totalSize, page);

        if (page < 1 || page > this.setWiseControls[setId].pager.totalPages) {
            this.dataSets[setId].riskFactorListJsonNode = [];
            return;
        }
        // get current page of items
        this.dataSets[setId].riskFactorListJsonNode = riskFactorListJsonNode.slice(
            this.setWiseControls[setId].pager.startIndex,
            this.setWiseControls[setId].pager.endIndex + 1
        );
    }

    filterDataSetWise(setId) {
        const expCatType = this.rfCategories[this.expCatType].value;
        let riskFactorListJsonNode = this.orgDataSets[setId].riskFactorListJsonNode.filter(element1 => {
            return element1.expCat == expCatType;
        });
        const filterObj = this.setWiseControls[setId].filterObj;
        const filterKeys = Object.keys(filterObj);

        filterKeys.forEach(element => {
            const filterValues = filterObj[element];
            if (element == 'rfName') {
                riskFactorListJsonNode = riskFactorListJsonNode.filter(element2 => {
                    if (
                        element2['name'] != '' &&
                        element2['name'] != null &&
                        element2['name'].toLowerCase().indexOf(filterValues.toLowerCase()) > -1
                    ) {
                        return element2;
                    }
                });
            } else if (element == 'errMsg' && filterObj['errMsg'].length > 0) {
                let rfIds = [];
                filterObj['errMsg'].forEach(element1 => {
                    if (element1 == 1) {
                        const ids = riskFactorListJsonNode.filter(element2 => {
                            if (element2['errMsg'] != '' && element2['errMsg'] != null && element2['errMsg'].length != 0) {
                                rfIds.push(element2['id']);
                            }
                        });
                    }
                    if (element1 == 2) {
                        riskFactorListJsonNode.filter(element2 => {
                            if (
                                (null == element2.shockValues[this.shockHeader] || '' == element2.shockValues[this.shockHeader] + '') &&
                                (element2['errMsg'] == '' || element2['errMsg'] == null)
                            ) {
                                rfIds.push(element2['id']);
                            }
                        });
                    }
                });
                riskFactorListJsonNode = riskFactorListJsonNode.filter(function(el) {
                    return rfIds.some(function(f) {
                        return el['id'] == f;
                    });
                });
            } else {
                /* filterValues.forEach(element1 => {
                    riskFactorListJsonNode = riskFactorListJsonNode.filter(element2 => {
                        return element2[element] == element1;
                    });
                }); */
                if (filterValues.length > 0) {
                    riskFactorListJsonNode = riskFactorListJsonNode.filter(function(el) {
                        return filterValues.some(function(f) {
                            return el[element] == f;
                        });
                    });
                }
            }
        });
        this.dataSets[setId].riskFactorListJsonNode = riskFactorListJsonNode;
    }

    resetPaginationtoAllSets() {
        this.orgDataSets.forEach((element, index) => {
            this.setPage(1, index);
        });
    }

    shockHeader;
    filterData(obj, setId) {
        this.setWiseControls[setId].selectAllRF = false;
        this.setWiseControls[setId].checkedRFList = [];
        this.shockHeader = obj;
        this.setPage(1, setId);
    }

    deleteRiskFactors() {
        let checkedRFList = this.setWiseControls[this.setId].checkedRFList;
        const deletedRFList = checkedRFList;
        let riskFactorListJsonNode = this.dataSets[this.setId].riskFactorListJsonNode;
        let orgRiskFactorListJsonNode = this.orgDataSets[this.setId].riskFactorListJsonNode;
        const rfSetId = this.dataSets[this.setId].id;
        if (checkedRFList.length > 0) {
            checkedRFList.forEach(element => {
                riskFactorListJsonNode = riskFactorListJsonNode.filter(element1 => {
                    return element1.id != element;
                });
                orgRiskFactorListJsonNode = orgRiskFactorListJsonNode.filter(element1 => {
                    return element1.id != element;
                });
                checkedRFList = checkedRFList.filter(element2 => {
                    return element2 != element;
                });
            });
            this.setWiseControls[this.setId].checkedRFList = checkedRFList;
            this.dataSets[this.setId].riskFactorListJsonNode = riskFactorListJsonNode;
            this.orgDataSets[this.setId].riskFactorListJsonNode = orgRiskFactorListJsonNode;
            orgRiskFactorListJsonNode.forEach(element => {
                this.changePreferredAndNonPreferred(this.setId, element, 'PREFERRED');
                this.changePreferredAndNonPreferred(this.setId, element, 'NON_PREFERRED');
            });
            if (this.orgDataSets[this.setId].riskFactorListJsonNode.length == 0) {
                this.deleteRiskFactorSet(rfSetId);
            } else {
                this.riskFactorSetObj = Object.create(this.orgDataSets[this.setId]);
                let riskFactorSetObj = this.orgDataSets[this.setId];
                this.riskFactorSetObj.scenarioLastModifiedDate = this.scenarioObj.lastModifiedDate;
                this.riskFactorSetObj.lastModifiedDate = this.scenarioObj.lastModifiedDate;
                this.riskFactorSetObj.riskFactorListJSON = JSON.stringify(this.orgDataSets[this.setId].riskFactorListJsonNode);
                this.riskFactorSetObj.riskFactorListJsonNode = null;
                this.riskFactorSetObj.riskFactors = orgRiskFactorListJsonNode.map(ele => ele.id) + '';
                this.riskFactorSetObj.id = riskFactorSetObj.id;
                this.riskFactorSetObj.riskFactorSetName = riskFactorSetObj.riskFactorSetName;
                this.riskFactorSetObj.riskFactorSetType = riskFactorSetObj.riskFactorSetType;
                this.riskFactorSetObj.scenarioId = riskFactorSetObj.scenarioId;
                this.riskFactorSetObj.lastModifiedBy = riskFactorSetObj.lastModifiedBy;
                this.riskFactorSetObj.assetClassId = riskFactorSetObj.assetClassId;
                this.riskFactorSetObj.riskFactorCount = riskFactorSetObj.riskFactorCount;
                this.riskFactorSetObj.status = riskFactorSetObj.status;

                this.scenarioService.saveRiskFactorSet(this.riskFactorSetObj).subscribe(
                    response => {
                        this.setWiseControls[this.setId].selectAllRF = false;
                        this.setWiseControls[this.setId].checkedRFList = [];
                        this.scenarioObj.lastModifiedDate = response['scenarioLastModifiedDate'];
                        this.showSuccessValidations(true, 'Risk factors Deleted successfully.');
                        this.reLoadErrorMessages();
                        this.setPage(this.setWiseControls[this.setId].pager.currentPage, this.setId);
                        // this.setPage(1, this.setId);
                        // this.calCatExpTypes();
                        this.cancel();
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                        this.cancel();
                    }
                );
            }
        }
    }

    enableCalculateBtn(setId) {
        let orgRiskFactorListJsonNode = this.orgDataSets[setId].riskFactorListJsonNode;
        const riskFactorListJsonNode = orgRiskFactorListJsonNode.filter(element1 => {
            return element1.expCat == this.expCatType;
        });
    }

    headerList = [];
    columns = [];
    records = [];

    openMetdlgyConfgMdl(metdlgyConfgMdl) {
        this.ismethodology = true;
        this.scenarioService.getMethodologyMasterData(this.scenarioObj.id).subscribe(
            response => {
                this.headerList = response['HEADERS'];
                this.columns = response['COLUMNS'];
                this.records = response['RECORDS'];

                this.modalService.open(metdlgyConfgMdl, { size: 'lg', windowClass: 'custom-modal-class' });
            },
            responseError => {
                this.showErrorValidations(true, responseError.error);
            }
        );
    }

    saveMethodologyConfigData() {
        let modelConfigList = [];
        if (this.validateConfig()) {
            for (let record = 0; record < this.records.length; record++) {
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

            this.scenarioObj.methodologyConfigDTOs = modelConfigList;
            this.scenarioService.saveMethodologyConfigData(this.scenarioObj).subscribe(
                response => {
                    this.scenarioObj.lastModifiedDate = response['lastModifiedDate'];
                    this.modalService.dismissAll();
                    if (this.ismethodology) {
                        this.showSuccessValidations(true, 'Data Saved Succesfully.');
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
        //this.navigateTo('scenario/scenarioConfig');
        this.scenarioObj.isVersionUpdated = isUpdate;
        this.scenarioService.updateShockTemplateObj(this.scenarioObj).subscribe(
            response => {
                //this.navigateTo('scenario/selectRiskFactor');
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    toggleSetAccordian(props: NgbPanelChangeEvent) {
        const panelId = props.panelId;
        const ids = panelId.split('-');
        this.setWiseControls[ids[1]].showPrgBar = !this.setWiseControls[ids[1]].showPrgBar;
    }
    /* getSelectedVariables(dependentFactors) {
        if (dependentFactors != null && dependentFactors != '') {
            let dependentFactorsList = [];
            let selectVariablesList = null;
            dependentFactorsList = dependentFactors.split(',');
            dependentFactorsList.forEach(element => {
                if (element != null && element != '') {
                    if (selectVariablesList == null) {
                        selectVariablesList = this.getValue(parseInt(element), 'SHOCK_RULE_KEY_ID');
                    } else {
                        selectVariablesList = selectVariablesList + ', ' + this.getValue(parseInt(element), 'SHOCK_RULE_KEY_ID');
                    }
                }
            });
            return selectVariablesList;
        }
    } */

    getPredeterminedList(setId, data) {
        let rowWiseControl = new Object();
        rowWiseControl['isClicked'] = false;
        rowWiseControl['nonPreferredVariblesList'] = [];
        rowWiseControl['preferredVariblesList'] = [];
        if (data.expCat == EXPANSION_CATEGORY_MODEL_DRIVEN) {
            let predefinedVariableList = [];
            this.orgDataSets[setId].riskFactorListJsonNode.forEach(element => {
                if (element.expCat == 1) {
                    predefinedVariableList.push({ id: element.id, name: element.name });
                }
            });
            if (!data.nonPreferredVaribles) {
                data.nonPreferredVaribles = [];
            }
            let variablesTemp = predefinedVariableList.filter(item => data.nonPreferredVaribles.indexOf(item.id) == -1);
            rowWiseControl['preferredVariblesList'] = Object.assign([], variablesTemp);
            if (!data.preferredVaribles) {
                data.preferredVaribles = [];
            }
            variablesTemp = predefinedVariableList.filter(item => data.preferredVaribles.indexOf(item.id) == -1);
            rowWiseControl['nonPreferredVariblesList'] = Object.assign([], variablesTemp);
        }
        this.rowWiseControls[data.id] = rowWiseControl;
    }

    changePreferredAndNonPreferred(setId, data, type) {
        let isCalculated = false;
        let riskFactorListJsonNode;
        let predefinedVariableList = [];
        let selectedList = [];
        let variablesTemp;
        this.orgDataSets[setId].riskFactorListJsonNode.forEach(element => {
            if (element.expCat == 1) {
                predefinedVariableList.push({ id: element.id, name: element.name });
            }
        });
        try {
            if (type == 'PREFERRED') {
                if (!data.preferredVaribles) {
                    data.preferredVaribles = [];
                }
                variablesTemp = predefinedVariableList.filter(item => data.preferredVaribles.indexOf(item.id) == -1);
                selectedList = this.tempDataSets[setId].riskFactorListJsonNode.filter(
                    item => item.id == data.id && data.preferredVaribles.length != item.preferredVaribles.length
                );
                this.changeType = 'PREFERRED';
            } else {
                if (!data.nonPreferredVaribles) {
                    data.nonPreferredVaribles = [];
                }
                variablesTemp = predefinedVariableList.filter(item => data.nonPreferredVaribles.indexOf(item.id) == -1);
                selectedList = this.tempDataSets[setId].riskFactorListJsonNode.filter(
                    item => item.id == data.id && data.nonPreferredVaribles.length != item.nonPreferredVaribles.length
                );
                this.changeType = 'NON_PREFERRED';
            }
        } catch (e) {}
        this.setId = setId;
        this.changedVal = data;
        this.resetErrMsg =
            'Already Calculated Shock Values for Model Driven and Business Rule Driven are lost, Do you want to continue with this change?';
        riskFactorListJsonNode = this.orgDataSets[setId].riskFactorListJsonNode.filter(
            item => item.expCat != EXPANSION_CATEGORY_PREDETERMINED && item.mthdlgyType != METHODOLOGY_PROXY
        );
        riskFactorListJsonNode.forEach(element1 => {
            const shockHeaders = Object.keys(element1.shockValues);
            shockHeaders.forEach(element2 => {
                if (null != element1.shockValues[element2] && '' != element1.shockValues[element2] + '') {
                    isCalculated = true;
                }
            });
        });
        if (isCalculated && selectedList.length > 0) {
            this.modalService.open(this.resetShockValues, {});
            return false;
        }
        if (type == 'PREFERRED') {
            this.rowWiseControls[data.id].nonPreferredVariblesList = Object.assign([], variablesTemp);
        } else {
            this.rowWiseControls[data.id].preferredVariblesList = Object.assign([], variablesTemp);
        }
    }

    downloadExcel(riskFactor) {
        const obj = new Object();
        obj['scenarioId'] = this.scenarioObj.id;
        obj['rfId'] = riskFactor.id;
        obj['rfName'] = riskFactor.name;
        let fileName = 'Maturities_Interpolation.xlsx';
        obj['downloadFileName'] = 'Maturities_Interpolation.xlsx';
        let executionType = 'interpolation';
        if (riskFactor.expCat == 2) {
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

    isModelCalculated(data) {
        const shockHeaders = Object.keys(data.shockValues);
        if (
            data.shockValues[shockHeaders[0]] + '' != '' &&
            data.shockValues[shockHeaders[0]] != null &&
            data.shockValues[shockHeaders[0]] != 0 &&
            (data.errMsg == '' || data.errMsg == null)
        ) {
            this.isRCalculated = true;
            return true;
        } else {
            return false;
        }
    }

    goToErrRF(id, setId) {
        const riskFactorListJsonNode = this.orgDataSets[setId].riskFactorListJsonNode.filter(
            item => item.expCat == EXPANSION_CATEGORY_MODEL_DRIVEN
        );
        const idx = riskFactorListJsonNode.findIndex(x => x['id'] == id);
        const pageNo = Math.ceil((idx + 1) / DEFAULT_PAGE_SIZE);
        this.setPage(pageNo, setId);
    }

    saveOldValue(obj, rfId, key) {
        this.oldVal = obj.target.value + '_' + rfId + '_' + key;
    }

    resetModelBusRuleValues(type, id1, id2, val, rfId) {
        if (this.userCanAccess) {
            this.onChangeScreen = true;
            this.changeType = type;
            this.setId = id1;
            this.rfId = id2;
            this.changedVal = val;
            let isCalculated = false;
            let riskFactorListJsonNode;
            if (this.expCatType + 1 == EXPANSION_CATEGORY_BUSINESS_RULE) {
                this.resetErrMsg =
                    'Already Calculated Shock Values for Business Rule Driven are lost, Do you want to continue with this change?';
                riskFactorListJsonNode = this.orgDataSets[this.setId].riskFactorListJsonNode.filter(
                    item => item.expCat == EXPANSION_CATEGORY_BUSINESS_RULE && item.mthdlgyType == METHODOLOGY_INTERPOLATION
                );
            } else {
                this.resetErrMsg =
                    'Already Calculated Shock Values for Model Driven and Business Rule Driven are lost, Do you want to continue with this change?';
                riskFactorListJsonNode = this.orgDataSets[this.setId].riskFactorListJsonNode.filter(
                    item => item.expCat != EXPANSION_CATEGORY_PREDETERMINED && item.mthdlgyType != METHODOLOGY_PROXY
                );
            }
            riskFactorListJsonNode.forEach(element1 => {
                const shockHeaders = Object.keys(element1.shockValues);
                shockHeaders.forEach(element2 => {
                    if (null != element1.shockValues[element2] && '' != element1.shockValues[element2] + '') {
                        isCalculated = true;
                    }
                });
            });

            if (type != 'shock' && type != 'delete') {
                const riskFactorListJsonNode1 = this.orgDataSets[this.setId].riskFactorListJsonNode.filter(item => item.id == rfId);
                this.oldVal = riskFactorListJsonNode1[0][type] + '_' + rfId + '_' + type;
            }
            if (isCalculated) {
                this.modalService.open(this.resetShockValues, {});
                return false;
            } else if (type == 'expCat') {
                if (this.expCatType + 1 == EXPANSION_CATEGORY_BUSINESS_RULE) {
                    this.modalService.open(this.resetShockValues, {});
                    return false;
                }
                this.changeRFTypeDD(this.changedVal, this.setId + '_' + this.rfId);
            } else if (this.changeType == 'mthdlgyType') {
                this.changeMedTypeDD(this.changedVal, this.setId + '_' + this.rfId);
            } else if (this.changeType == 'onlyWithPreffered') {
                this.getPredeterminedList(this.setId, this.changedVal);
            } else if (this.changeType == 'delete') {
                this.modalHeader = 'Delete Risk factors';
                this.modalService.open(this.deleteRFModal, {});
            }
        }
    }

    resetShocks() {
        let riskFactorListJsonNode;
        if (this.expCatType + 1 == EXPANSION_CATEGORY_BUSINESS_RULE) {
            riskFactorListJsonNode = this.orgDataSets[this.setId].riskFactorListJsonNode.filter(
                item => item.expCat == EXPANSION_CATEGORY_BUSINESS_RULE && item.mthdlgyType == METHODOLOGY_INTERPOLATION
            );
        } else {
            riskFactorListJsonNode = this.orgDataSets[this.setId].riskFactorListJsonNode.filter(
                item => item.expCat != EXPANSION_CATEGORY_PREDETERMINED && item.mthdlgyType != METHODOLOGY_PROXY
            );
        }
        riskFactorListJsonNode.forEach(element1 => {
            const shockHeaders = Object.keys(element1.shockValues);
            shockHeaders.forEach(element2 => {
                element1.shockValues[element2] = null;
            });
        });
        if (this.changeType == 'expCat') {
            this.changeRFTypeDD(this.changedVal, this.setId + '_' + this.rfId);
        } else if (this.changeType == 'mthdlgyType') {
            this.changeMedTypeDD(this.changedVal, this.setId + '_' + this.rfId);
        } else if (this.changeType == 'onlyWithPreffered') {
            this.getPredeterminedList(this.setId, this.changedVal);
        } else if (this.changeType == 'PREFERRED' || this.changeType == 'NON_PREFERRED') {
            this.changePreferredAndNonPreferred(this.setId, this.changedVal, this.changeType);
        } else if (this.changeType == 'delete') {
            this.deleteRiskFactors();
        }
        this.modalService.dismissAll();
    }

    resetToOldVal() {
        let oldVal;
        if (this.oldVal != undefined || this.oldVal != null) {
            oldVal = this.oldVal.split('_');
        }
        if (this.changeType == 'shock') {
            this.orgDataSets[this.setId].riskFactorListJsonNode.filter(item => item.id == [oldVal[1]])[0].shockValues[oldVal[2]] =
                oldVal[0];
        } else if (this.changeType == 'expCat') {
            this.orgDataSets[this.setId].riskFactorListJsonNode.filter(item => item.id == [oldVal[1]])[0][oldVal[2]] = parseInt(oldVal[0]);
        } else if (this.changeType == 'mthdlgyType') {
            this.orgDataSets[this.setId].riskFactorListJsonNode.filter(item => item.id == [oldVal[1]])[0][oldVal[2]] = oldVal[0];
            this.checkMedType(oldVal[0], this.setId, this.rfId);
        } else if (this.changeType == 'onlyWithPreffered') {
            this.orgDataSets[this.setId].riskFactorListJsonNode.forEach(element => {
                this.tempDataSets[this.setId].riskFactorListJsonNode.forEach(element1 => {
                    if (element1.expCat == 2 && element.expCat == 2 && element1.id == element.id) {
                        element.onlyWithPreffered = element1.onlyWithPreffered;
                    }
                });
            });
        } else if (this.changeType == 'PREFERRED' || this.changeType == 'NON_PREFERRED') {
            this.orgDataSets[this.setId].riskFactorListJsonNode.forEach(element => {
                this.tempDataSets[this.setId].riskFactorListJsonNode.forEach(element1 => {
                    if (element1.expCat == 2 && element.expCat == 2 && element1.id == element.id) {
                        element.preferredVaribles = element1.preferredVaribles;
                        element.nonPreferredVaribles = element1.nonPreferredVaribles;
                    }
                });
            });
        } else if (this.changeType == 'delete') {
            this.setWiseControls[this.setId].checkedRFList = [];
        }
        this.modalService.dismissAll();
        return false;
    }

    filterMasterData(masterList, colName, setId) {
        const expCatType = this.rfCategories[this.expCatType].value;
        let gridData = this.orgDataSets[setId].riskFactorListJsonNode
            .filter(item => item.expCat == expCatType)
            .map(element => {
                return parseInt(element[colName]);
            });

        let gridUniqData = Array.from(new Set(gridData));
        let filterList = masterList.filter(e => gridUniqData.indexOf(e.value) != -1);
        return filterList;
    }

    downloadMethodologyExcelFile(methodology) {
        /**Ids filtered based on methodology Id...(for now methodology='0'-to get all rf Ids except model methodology) */
        let rfIds = '';
        let rfNames = '';
        //const list = this.dataSets;
        const list = this.orgDataSets;
        list.forEach(element => {
            element.riskFactorListJsonNode.forEach(element1 => {
                const shockHeaders = Object.keys(element1.shockValues);

                if (
                    element1.expCat == '2' &&
                    (methodology == '0' || element1.mthdlgyType == methodology) &&
                    (element1.shockValues[shockHeaders[0]] + '' != '' &&
                        element1.shockValues[shockHeaders[0]] != null &&
                        element1.shockValues[shockHeaders[0]] != 0 &&
                        (element1.errMsg == '' || element1.errMsg == null))
                ) {
                    rfIds = rfIds + 'A_' + element1.id + ',';
                    rfNames = rfNames + element1.name + ',';
                }
            });
        });
        if (rfIds != null && rfNames != null) {
            rfIds = rfIds.slice(0, -1);
            rfNames = rfNames.slice(0, -1);
        }
        const obj = new Object();
        obj['scenarioId'] = this.scenarioObj.id;
        obj['rfIds'] = rfIds;
        obj['rfNames'] = rfNames;
        obj['fileName'] = 'RiskFactor_Result_Data.xlsx';
        obj['flag'] = this.isCalculated;
        obj['executionType'] = 'modeldriven';
        this.scenarioService.downloadMethodologyExcelFile(obj).subscribe(
            response => {
                let blob = new Blob([response]);
                let fileName = obj['fileName'];
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
    test() {
        console.log('==for scroll event==');
    }

    calculateFormula(data, row1, row2, shockHeaders) {
        // let shockHeader = 'Shock';
        let listcalc = '';
        const orgDataSets = this.orgDataSets;
        const operatorsMap = this.operatorsMap;
        shockHeaders.forEach(shockHeader => {
            let formeval = '';
            listcalc = '';
            for (let x = 0; x < data.length; x++) {
                listcalc = listcalc + data[x].toString().trim() + '$';
                const operatorsMapKeys = Object.keys(operatorsMap);
                for (let q = 0; q < operatorsMapKeys.length; q++) {
                    if (data[x] == operatorsMap[operatorsMapKeys[q]]) {
                        formeval = formeval + data[x];
                        break;
                    }
                }
                for (let i = 0; i < orgDataSets.length; i++) {
                    const element = orgDataSets[i];
                    const filt = element.riskFactorListJsonNode.filter(item => item.name == data[x].toString().trim());
                    if (filt.length > 0) {
                        formeval = formeval + filt[0].shockValues[shockHeader];
                        break;
                    }
                }
            }
            try {
                const val = eval(formeval);
                if (isNaN(val)) {
                    this.dataSets[row1].riskFactorListJsonNode[row2].shockValues[shockHeader] = 0;
                } else {
                    this.dataSets[row1].riskFactorListJsonNode[row2].shockValues[shockHeader] = val;
                }
            } catch (e) {
                this.dataSets[row1].riskFactorListJsonNode[row2].shockValues[shockHeader] = 0;
                // this.showErrorValidations(true, 'Invalid Formula.');
            }
        });
        this.riskFactorLibDTO.arithmaticFormula = listcalc.slice(0, -1);
        const re = /\$/gi;
        this.arithmaticFormula = listcalc.slice(0, -1);
        const formula = this.arithmaticFormula.replace(re, '');
        this.dataSets[row1].riskFactorListJsonNode[row2].bsnsRule = {
            isProxy: true,
            isintpol: false,
            proxy: formula,
            interpolation: '',
            proxyHiddenFormula: this.riskFactorLibDTO.arithmaticFormula
        };
        this.dataSets[row1].riskFactorListJsonNode[row2].dependentFactors = this.getDependentFactors(
            this.riskFactorLibDTO.arithmaticFormula
        );
    }
}
