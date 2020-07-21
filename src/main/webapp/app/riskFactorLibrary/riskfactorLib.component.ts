import { Component, OnInit, Input } from '@angular/core';
import { RiskFactorLibService } from 'app/riskFactorLibrary/riskfactorLib.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import {
    ALERT_MSG_TIME_OUT,
    METHODOLOGY_INTERPOLATION,
    METHODOLOGY_PROXY,
    METHODOLOGY_USER_DEFINED,
    METHODOLOGY_QUANTILE,
    EXPANSION_CATEGORY_PREDETERMINED,
    EXPANSION_CATEGORY_MODEL_DRIVEN,
    EXPANSION_CATEGORY_BUSINESS_RULE,
    USERDEFINED_LABEL,
    QUANTILE_LABEL,
    PCAGROUP_LABEL,
    PROXY_LABEL,
    SELECT_COM_MAXSIZE
} from 'app/constants';

@Component({
    selector: 'jhi-home',
    templateUrl: './riskfactorLib.component.html',
    styleUrls: ['riskfactorLib.css']
})
export class RiskFactorLibComponent implements OnInit {
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

    riskFactorMasterData: any = [];
    riskFactorLibDTO: any = {};
    transformationList: any = [];
    misValTreatMethList: any = [];
    rfCategoryList: any = [];
    methodologyList: any = [];
    methodologyList1: any = [];
    pcaGroupList: any = [];
    dropDownSelecttionList: any = [];
    interpolationTypeList: any = [];
    interpolationTypeData: any = [];
    frequencies: any = [];
    curveFamilys: any = [];
    sectors: any = [];
    ratings: any = [];
    selected: any;
    linkID: any;
    dataCount: any;
    rfData: any;
    riskConfigData = {
        shockRuleKeyId: 0,
        shockRuleKey: 'NA',
        assetClass: null,
        riskfactortype: 'NA',
        subriskfactortype: 'NA',
        assetname: 'NA',
        country: null,
        currency: null,
        maturity: null,
        unit: null,
        sector: null,
        rating: null,
        frequency: null,
        curveFamily: null,
        description: null,
        expiryid: null,
        seniority: '',
        liquiditycategoryid: '',
        systemName: '',
        externalId: '',
        subRiskFactorType: ''
    };
    riskConfigDataobj = {
        shockRuleKeyId: 0,
        shockRuleKeyName: null,
        assetClassId: null,
        riskFactorTypeId: null,
        subRiskFactorType: null,
        assetName: null,
        countryId: null,
        currencyId: null,
        expiryId: null,
        maturityId: null,
        unitId: null,
        sectorId: null,
        seniority: null,
        liquidityCategoryId: null,
        ratingId: null,
        systemName: null,
        externalId: null,
        frequencyId: null,
        curveFamilyId: null,
        description: null
    };
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    obj: any;
    mneerror: any;
    showerror: any;
    userData: any[] = [];
    METHODOLOGY_INTERPOLATION = 13;
    METHODOLOGY_PROXY = 14;
    METHODOLOGY_USER_DEFINED = 15;
    METHODOLOGY_QUANTILE = 16;
    EXPANSION_CATEGORY_PREDETERMINED;
    EXPANSION_CATEGORY_MODEL_DRIVEN;
    EXPANSION_CATEGORY_BUSINESS_RULE;
    assetClass;
    filter;
    value;
    filterOrderMap = {};
    createFilter: {};
    masterDataObjForFilters = {};
    filterData: any;
    constructor(
        private riskfactorLibService: RiskFactorLibService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router
    ) {}
    ngOnInit() {
        this.METHODOLOGY_INTERPOLATION = METHODOLOGY_INTERPOLATION;
        this.METHODOLOGY_PROXY = METHODOLOGY_PROXY;
        this.METHODOLOGY_USER_DEFINED = METHODOLOGY_USER_DEFINED;
        this.METHODOLOGY_QUANTILE = METHODOLOGY_QUANTILE;
        this.EXPANSION_CATEGORY_PREDETERMINED = EXPANSION_CATEGORY_PREDETERMINED;
        this.EXPANSION_CATEGORY_MODEL_DRIVEN = EXPANSION_CATEGORY_MODEL_DRIVEN;
        this.EXPANSION_CATEGORY_BUSINESS_RULE = EXPANSION_CATEGORY_BUSINESS_RULE;
        this.linkID = this.route.snapshot.fragment;

        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }

        this.riskConfigData.shockRuleKeyId = this.route.snapshot.params.ID;
        if (this.riskConfigData.shockRuleKeyId !== 0) {
            this.riskFactorLibDTO.shockRuleKeyId = this.riskConfigData.shockRuleKeyId;
            this.riskConfigData.shockRuleKey = this.route.snapshot.params.SHOCK_RULE_KEY_ID;
            if (this.route.snapshot.params.ASSET_CLASS_ID != 'null') {
                this.riskConfigData.assetClass = this.route.snapshot.params.ASSET_CLASS_ID;
            } else {
                this.riskConfigData.assetClass = '';
            }
            if (this.route.snapshot.params.ASSET_CLASS_ID != 'null') {
                this.riskConfigData.assetClass = this.route.snapshot.params.ASSET_CLASS_ID;
            } else {
                this.riskConfigData.assetClass = '';
            }
            if (this.route.snapshot.params.RISK_FACTOR_TYPE_ID != 'null') {
                this.riskConfigData.riskfactortype = this.route.snapshot.params.RISK_FACTOR_TYPE_ID;
            } else {
                this.riskConfigData.riskfactortype = '';
            }
            if (this.route.snapshot.params.SUB_RISK_FACTOR_TYPE != 'null') {
                this.riskConfigData.subriskfactortype = this.route.snapshot.params.SUB_RISK_FACTOR_TYPE;
            } else {
                this.riskConfigData.subriskfactortype = '';
            }
            if (this.route.snapshot.params.ASSET_NAME != 'null') {
                this.riskConfigData.assetname = this.route.snapshot.params.ASSET_NAME;
            } else {
                this.riskConfigData.assetname = '';
            }
            if (this.route.snapshot.params.COUNTRY_ID != 'null') {
                this.riskConfigData.country = this.route.snapshot.params.COUNTRY_ID;
            } else {
                this.riskConfigData.country = '';
            }
            if (this.route.snapshot.params.CURRENCY_ID != 'null') {
                this.riskConfigData.currency = this.route.snapshot.params.CURRENCY_ID;
            } else {
                this.riskConfigData.currency = '';
            }
            if (this.route.snapshot.params.MATURITY_ID != 'null') {
                this.riskConfigData.maturity = this.route.snapshot.params.MATURITY_ID;
            } else {
                this.riskConfigData.maturity = '';
            }
            if (this.route.snapshot.params.UNIT_ID != 'null') {
                this.riskConfigData.unit = this.route.snapshot.params.UNIT_ID;
            } else {
                this.riskConfigData.unit = '';
            }
            if (this.route.snapshot.params.SECTOR_ID != 'null') {
                this.riskConfigData.sector = this.route.snapshot.params.SECTOR_ID;
            } else {
                this.riskConfigData.sector = '';
            }
            if (this.route.snapshot.params.RATING_ID != 'null') {
                this.riskConfigData.rating = this.route.snapshot.params.RATING_ID;
            } else {
                this.riskConfigData.rating = '';
            }
            if (this.route.snapshot.params.FREQUENCY_ID != 'null') {
                this.riskConfigData.frequency = this.route.snapshot.params.FREQUENCY_ID;
            } else {
                this.riskConfigData.frequency = '';
            }
            if (this.route.snapshot.params.CURVE_FAMILY_ID != 'null') {
                this.riskConfigData.curveFamily = this.route.snapshot.params.CURVE_FAMILY_ID;
            } else {
                this.riskConfigData.curveFamily = '';
            }
            if (this.route.snapshot.params.DESCRIPTION != 'null') {
                this.riskConfigData.description = this.route.snapshot.params.DESCRIPTION;
            } else {
                this.riskConfigData.description = '';
            }
            if (this.route.snapshot.params.SENIORITY != 'null') {
                this.riskConfigData.seniority = this.route.snapshot.params.SENIORITY;
            } else {
                this.riskConfigData.seniority = '';
            }
            if (this.route.snapshot.params.EXPIRY_ID != 'null') {
                this.riskConfigData.expiryid = this.route.snapshot.params.EXPIRY_ID;
            } else {
                this.riskConfigData.expiryid = '';
            }
            if (this.route.snapshot.params.LIQUIDITY_CATEGORY_ID != 'null') {
                this.riskConfigData.liquiditycategoryid = this.route.snapshot.params.LIQUIDITY_CATEGORY_ID;
            } else {
                this.riskConfigData.liquiditycategoryid = '';
            }
            let systemName = this.route.snapshot.params.SYSTEM_NAME;
            if (systemName == 'null') {
                this.riskConfigData.systemName = '';
            } else {
                this.riskConfigData.systemName = systemName;
            }
            let externalId = this.route.snapshot.params.EXTERNAL_ID;
            if (externalId == 'null') {
                this.riskConfigData.externalId = '';
            } else {
                this.riskConfigData.externalId = externalId;
            }
        }

        this.rfData = {
            id: this.riskConfigData.shockRuleKeyId + '',
            name: this.riskConfigData.shockRuleKey
        };
        // this.riskfactorLibService.taxonomySelectionChange(rfData).subscribe(
        //     data => {
        //         Object.assign(this.userData, data);
        //     },
        //     error => {}
        // );

        this.riskfactorLibService.getRiskFactorMasterDataList().subscribe(
            response => {
                this.ratings = response.ratings;
                this.transformationList = response.transformationList;
                this.misValTreatMethList = response.misValTreatMethList;
                this.rfCategoryList = response.rfCategoryList;
                this.methodologyList = response.methodologyList;
                this.pcaGroupList = response.pcaGroupList;
                this.interpolationTypeData = response.interpolationTypeData;
                this.frequencies = response.frequencies;
                this.curveFamilys = response.curveFamily;
                this.sectors = response.sectors;
                this.assetClass = response.assetClass;
                let rating;
                if (this.riskConfigData.rating != 'null' && this.riskConfigData.rating != null && this.riskConfigData.rating != '') {
                    rating = this.ratings.filter(item => item.label == this.riskConfigData.rating)[0].value;
                } else {
                    this.riskConfigData.rating = '';
                }
                this.riskConfigData.rating = rating;
                let sector;
                if (this.riskConfigData.sector != 'null' && this.riskConfigData.sector != null && this.riskConfigData.sector != '') {
                    sector = this.sectors.filter(item => item.label == this.riskConfigData.sector)[0].value;
                } else {
                    this.riskConfigData.sector = '';
                }
                this.riskConfigData.sector = sector;

                let curveFamily;
                if (
                    this.riskConfigData.curveFamily != 'null' &&
                    this.riskConfigData.curveFamily != null &&
                    this.riskConfigData.curveFamily != ''
                ) {
                    curveFamily = this.curveFamilys.filter(item => item.label == this.riskConfigData.curveFamily)[0].value;
                } else {
                    this.riskConfigData.curveFamily = '';
                }
                this.riskConfigData.curveFamily = curveFamily;
                this.getRiskFactorLibData();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    getRiskFactorLibData() {
        this.riskfactorLibService.getRiskFactorLibraryData(this.riskConfigData.shockRuleKeyId).subscribe((response: any) => {
            if (response) {
                this.riskFactorLibDTO = response;
                this.methodologyList1 = this.methodologyList.filter(item => item.cat_id == this.riskFactorLibDTO.rfCategoryId);
                // const rfCategoryId = this.riskFactorLibDTO.rfCategoryId;
                /* this.riskfactorLibService.getMethodology(rfCategoryId).subscribe((response: any) => {
                    this.methodologyList = response;
                }); */
                const re = /\$/gi;
                let riskformula: String | null | undefined;
                riskformula = this.riskFactorLibDTO.arithmaticFormula;

                if (riskformula || riskformula === '') {
                    $('#divarthematitemplate').show();
                }

                if (riskformula !== undefined || !riskformula) {
                    // $('#divarthematitemplate').show();
                }
                if (this.riskFactorLibDTO.arithmaticFormula != null) {
                    this.riskFactorLibDTO.arithmaticFormula = this.riskFactorLibDTO.arithmaticFormula.replace(re, '');
                }
                if (riskformula != null) {
                    const res = riskformula.split('$');
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
                }
            }
            /*     if(response == null){
      this.riskFactorLibDTO = {
      shockRuleKeyId:null,
      pcaGroupId:null,
      interpolationTypeId:null,
      rfCategoryId : null,
      arithmaticFormula:null}
    }  */
        });
    }
    removeData(id) {
        $('#' + id).remove();
        $('#customTaxonomyTextId').focus();
    }

    validateartematicformula() {
        var listItems = $('#formulaBuilderDiv li');
        var liCount = $('#formulaBuilderDiv > li').length;
        var formula = '';
        var lastTaxo = 'OPER';
        var lastId = '';
        var invalidFormula = false;

        var liIdsStr = '';
        var liValuesStr = '';
        var liHtmlStr = '';
        var firstEq = '';
        var prevTaxo = '';
        var prevId = '';
        var lastEqulaIndex = -1;
        var tempListItems = []; //

        listItems.each(function(idx, li) {
            var idLi = $(li).attr('id');

            if (idLi != 'customTaxonomyTextIdLi') {
                var ids = idLi.split('_');
                var id = ids[1];
                var type = ids[2];
                if ((type == 'TAXO' && type == lastTaxo) || (lastTaxo == 'TAXO' && id == 'ZERO') || (lastId == 'ZERO' && type == 'TAXO')) {
                    invalidFormula = true;
                    return false;
                }

                var valueLi = $(li).attr('value');
                var htmlLi = $(li)
                    .clone() //clone the element
                    .children() //select all the children
                    .remove() //remove all the children
                    .end() //again go back to selected element
                    .text();

                if (type == 'TAXO') {
                    //
                    tempListItems.push(htmlLi);
                }

                formula += valueLi;
                if (firstEq == '' && type == 'OPER' && id == 'EQUAL' && prevTaxo == 'TAXO') {
                    firstEq = '=';
                    formula += valueLi;
                }
                lastTaxo = type;
                lastId = id;

                if (idx == 0) {
                    liIdsStr += idLi;
                    liValuesStr += valueLi;
                    liHtmlStr += htmlLi;
                } else {
                    liIdsStr += '<<>>' + idLi;
                    liValuesStr += '<<>>' + valueLi;
                    liHtmlStr += '<<>>' + htmlLi;
                }
                if (firstEq == '' && type == 'OPER' && id == 'EQUAL' && prevTaxo != 'OPER') {
                    var len = formula.length;
                    lastEqulaIndex = len - 1;
                }
                if (firstEq == '' && type == 'OPER' && id == 'EQUAL' && prevTaxo != 'OPER') {
                    var len = formula.length;
                    lastEqulaIndex = len - 1;
                }
                if (id == 'EQUAL' && prevId == 'EQUAL') {
                    invalidFormula = true;
                    return false;
                }
                prevTaxo = type;
                prevId = id;
            }
        });
    }

    if(invalidFormula) {
        if (invalidFormula) {
            this.showerror = true;
            $('.errorP').css('color', 'red');
            this.mneerror = 'Entered formula is invalid.Please recheck.';
            /**$timeout(function(){$scope.showerror=false;},3000);*/
        }
        return false;
    }

    validate(riskFactorLibDTO: {
        transformationId: any;
        misValTreatMethId: any;
        rfCategoryId: any;
        methodologyId: any;
        selected: any;
    }): any {
        if (!riskFactorLibDTO.transformationId) {
            this.showErrorValidations(true, 'Please Enter Transformation.');
            return false;
        } else if (!riskFactorLibDTO.misValTreatMethId) {
            this.showErrorValidations(true, 'Please Enter Mis Val Methodology.');
            return false;
        } else if (!riskFactorLibDTO.rfCategoryId) {
            this.showErrorValidations(true, 'Please Select RF CategoryId.');
            return false;
        } else if (!riskFactorLibDTO.methodologyId) {
            this.showErrorValidations(true, 'Please Select Methodology.');
            return false;
        }
        /*  else if (!riskFactorLibDTO.selected) {
            this.showErrorValidations(true, 'Please Enter ArithmaticFormula.');
            return false;
        } */
        return true;
    }
    saveRiskFactorLibConfigData() {
        // this.validateartematicformula();
        if (!this.validate(this.riskFactorLibDTO)) {
            return false;
        }

        // const listofvalues=   $("#formulaBuilderDiv").find("li");
        let listcalc = '';
        let licount = 1;
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
                }
                licount += 1;
                //riskFactorLibDTO.arithmaticFormula=   this.riskFactorLibDTO.arithmaticFormula.replace(re,"");
            });
        //listcalc=listcalc.slice(0, -1);
        this.riskFactorLibDTO.arithmaticFormula = listcalc.slice(0, -1);
        this.riskConfigDataobj.sectorId = this.riskConfigData.sector;
        this.riskConfigDataobj.ratingId = this.riskConfigData.rating;
        this.riskConfigDataobj.curveFamilyId = this.riskConfigData.curveFamily;
        this.riskConfigDataobj.systemName = this.riskConfigData.systemName;
        this.riskConfigDataobj.externalId = this.riskConfigData.externalId;
        this.riskConfigDataobj.seniority = this.riskConfigData.seniority;

        this.riskfactorLibService
            .saveRiskFacLibData({
                riskFactorLibDTO: JSON.stringify(this.riskFactorLibDTO),
                metaDataDTO: JSON.stringify(this.riskConfigDataobj)
            })
            .subscribe(
                response => {
                    // this.riskFactorLibDTO = response;
                    this.showSuccessValidations(true, 'RiskFactorLibrary Data saved successfully.');
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        const re = /\$/gi;
        this.riskFactorLibDTO.arithmaticFormula = this.riskFactorLibDTO.arithmaticFormula.replace(re, '');
    }

    deleteRiskFactorLibConfigData() {
        this.riskfactorLibService
            .deleteRiskFacLibData({
                riskFactorLibDTO: JSON.stringify(this.riskFactorLibDTO)
            })
            .subscribe(
                response => {
                    // this.riskFactorLibDTO = response;
                    let url = 'dataUtility/riskfactorinfo';
                    this.router.navigate([url, { message: 'RiskFactorLibrary Data deleted successfully.' }], { skipLocationChange: true });
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
    }
    getMethodologyValue(rfCatId) {
        $('#divarthematitemplate').hide();
        this.methodologyList1 = this.methodologyList.filter(item => item.cat_id == rfCatId.value);
        this.riskFactorLibDTO.methodologyId = '';
    }
    getMarketDataValue() {
        if (this.riskFactorLibDTO.rfCategoryId != 3) {
            this.riskfactorLibService.getMarketData(this.riskConfigData.shockRuleKeyId).subscribe(
                (response: any) => {
                    this.dataCount = response;
                    if (this.dataCount === 0) {
                        this.showErrorValidations(
                            true,
                            'Only risk factors with time series data can have ‘Benchmark’ or ‘Model driven’ expansion categorization.'
                        );
                        this.riskFactorLibDTO.rfCategoryId = '';
                        $('#MethodologyVal').hide();
                    }
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
        $('#MethodologyVal').show();
    }
    /* getPcaGroupInterPolationValue(methdlgyId) {
        this.riskfactorLibService.getpcaGroup(methdlgyId).subscribe((response: any) => {
            try {
                this.dropDownSelecttionList = JSON.parse(response[0].label);
            } catch (e) {
                this.dropDownSelecttionList = [];
            }

            if (methdlgyId === '14') {
                $('#divarthematitemplate').show();
            } else {
                $('#divarthematitemplate').hide();
            }
        });
    } */

    methodologyChange(methdlgyId) {
        const medObj = this.methodologyList.filter(item => item.value == methdlgyId.value)[0];
        const medName = medObj.label.toLowerCase();
        if (medName == USERDEFINED_LABEL || medName == QUANTILE_LABEL) {
            return false;
        } /* else if (medName == PCAGROUP_LABEL) {
            this.getPcaGroupInterPolationValue(methdlgyId.value);
            // this.getPcaGroupData(methdlgyId.value);
        } */ else if (
            medName == PROXY_LABEL
        ) {
            $('#divarthematitemplate').show();
        } else {
            $('#divarthematitemplate').hide();
        }
    }

    /*  getPcaGroupData(methdlgyId) {
        this.riskfactorLibService.getinterpolationType(methdlgyId).subscribe((response: any) => {
            this.interpolationTypeList = response;
        });
    } */
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
    discardRiskFactorLibConfigData() {
        const filterData = new Object();
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['filterOrderMap'] = JSON.stringify(this.filterOrderMap);
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        filterData['value'] = this.value;

        this.router.navigate(['/dataUtility/riskfactorinfo', filterData], { skipLocationChange: true });
    }
}
