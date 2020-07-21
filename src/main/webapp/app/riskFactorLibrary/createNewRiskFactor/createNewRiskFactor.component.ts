import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskFactorLibService } from '../riskfactorLib.service';
import { RiskFactorInfoService } from 'app/riskfactorInfo';
import { ALERT_MSG_TIME_OUT, USERDEFINED_LABEL, QUANTILE_LABEL, PROXY_LABEL, PCAGROUP_LABEL } from 'app/constants';
import {
    METHODOLOGY_INTERPOLATION,
    METHODOLOGY_PROXY,
    METHODOLOGY_USER_DEFINED,
    METHODOLOGY_QUANTILE,
    EXPANSION_CATEGORY_PREDETERMINED,
    EXPANSION_CATEGORY_MODEL_DRIVEN,
    EXPANSION_CATEGORY_BUSINESS_RULE
} from 'app/constants';
@Component({
    selector: 'jhi-home',
    templateUrl: './createNewRiskFactor.component.html'
})
export class CreateNewRiskFactorComponent implements OnInit {
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    assetClasses;
    riskFactorTypes;
    riskFactorTypesNew;
    subRiskFactorTypes;
    assetNames;
    countries;
    currencies;
    maturities;
    units;
    sectors;
    ratings;
    frequencies;
    curveFamilys;
    transformationList;
    misValTreatMethList;
    rfCategoryList;
    methodologyList;
    pcaGroupList;
    interpolationTypeData;
    dropDownSelecttionList;
    interpolationTypeList;
    liquidityList;
    methodologyList1;
    riskFactorDto = {
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

    riskFactorLibDTO = {
        transformationId: null,
        misValTreatMethId: null,
        rfCategoryId: null,
        methodologyId: null,
        pcaGroupId: null,
        interpolationTypeId: null,
        arithmaticFormula: null,
        quantilePercentile: null,
        lookbackPeriod: null
    };
    userData;
    METHODOLOGY_INTERPOLATION = 13;
    METHODOLOGY_PROXY = 14;
    METHODOLOGY_USER_DEFINED = 15;
    METHODOLOGY_QUANTILE = 16;
    EXPANSION_CATEGORY_PREDETERMINED;
    EXPANSION_CATEGORY_MODEL_DRIVEN;
    EXPANSION_CATEGORY_BUSINESS_RULE;
    arg = false;
    createFilter: {};
    masterDataObjForFilters = {};

    constructor(
        private riskfactorInfoService: RiskFactorInfoService,
        private riskfactorLibService: RiskFactorLibService,
        private route: ActivatedRoute,
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

        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }

        this.riskfactorLibService.getRiskFactorMasterData().subscribe(
            response => {
                this.assetClasses = response.assetClasses;
                this.riskFactorTypes = response.riskFactorTypes;
                //this.subRiskFactorTypes = response.assetClasses;
                //this.assetNames = response.assetClasses;
                this.countries = response.countries;
                this.currencies = response.currencies;
                this.maturities = response.maturities;
                this.units = response.units;
                this.sectors = response.sectors;
                this.ratings = response.ratings;
                this.frequencies = response.frequencies;
                this.curveFamilys = response.curveFamily;
                this.transformationList = response.transformationList;
                this.misValTreatMethList = response.misValTreatMethList;
                this.rfCategoryList = response.rfCategoryList;
                this.methodologyList = response.methodologyList;
                this.pcaGroupList = response.pcaGroupList;
                this.interpolationTypeData = response.interpolationTypeData;
                this.userData = response.shockRuleKeysList;
                this.liquidityList = response.liquidityList;
                this.methodologyList1 = Object.assign([], this.methodologyList);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getMethodologyValue(rfCatId) {
        $('#divarthematitemplate').hide();
        /*  this.riskfactorLibService.getMethodology(rfCatId).subscribe((response: any) => {
            this.methodologyList = response;
        }); */

        this.methodologyList1 = this.methodologyList.filter(item => item.cat_id == rfCatId.value);
        this.riskFactorLibDTO.methodologyId = '';
    }

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

    /* getPcaGroupInterPolationValue(methdlgyId) {
        this.riskfactorLibService.getpcaGroup(methdlgyId).subscribe((response: any) => {
            try {
                this.dropDownSelecttionList = JSON.parse(response[0].label);
            } catch (e) {
                this.dropDownSelecttionList = [];
            }

            if (methdlgyId == METHODOLOGY_PROXY) {
                $('#divarthematitemplate').show();
            } else {
                $('#divarthematitemplate').hide();
            }
        });
    } */
    /*  getPcaGroupData(methdlgyId) {
        this.riskfactorLibService.getinterpolationType(methdlgyId).subscribe((response: any) => {
            this.interpolationTypeList = response;
        });
    } */

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
    removeData(id) {
        $('#' + id).remove();
        $('#customTaxonomyTextId').focus();
    }

    changeRiskFactorName(arg) {
        const assetClassObj = this.assetClasses.filter(obj => {
            return obj.value == this.riskFactorDto.assetClassId;
        });
        let assetClassId = '';
        if (assetClassObj.length > 0) {
            assetClassId = assetClassObj[0].label + ':';
        }

        const riskFactorTypeObj = this.riskFactorTypesNew.filter(obj => {
            return obj.asset_id == this.riskFactorDto.assetClassId;
        });

        const riskFactorTypeValue = this.riskFactorTypesNew.filter(obj => {
            return obj.value == this.riskFactorDto.riskFactorTypeId;
        });

        let riskFactorTypeId = '';
        if (riskFactorTypeObj.length > 0 && riskFactorTypeValue.length > 0) {
            if (arg == true) {
                this.riskFactorDto.riskFactorTypeId;
                riskFactorTypeId = riskFactorTypeValue[0].label + ':';
            } else {
                riskFactorTypeId = riskFactorTypeObj[0].label + ':';
            }
        }

        /* const assetNameObj = this.assetNames.filter(obj => { return obj.value == this.riskFactorDto.assetName;
        });
        let assetName = '';
        if (assetNameObj.length > 0) {
            assetName = assetNameObj[0].label;
        } */

        let assetName = '';
        if (this.riskFactorDto.assetName) {
            assetName = this.riskFactorDto.assetName + ':';
        }

        const countryObj = this.countries.filter(obj => {
            return obj.value == this.riskFactorDto.countryId;
        });
        let countryId = '';
        if (countryObj.length > 0) {
            countryId = countryObj[0].label + ':';
        }

        const sectorObj = this.sectors.filter(obj => {
            return obj.value == this.riskFactorDto.sectorId;
        });
        let sectorId = '';
        if (sectorObj.length > 0) {
            sectorId = sectorObj[0].label + ':';
        }

        const currencyObj = this.currencies.filter(obj => {
            return obj.value == this.riskFactorDto.currencyId;
        });
        let currencyId = '';
        if (currencyObj.length > 0) {
            currencyId = currencyObj[0].label + ':';
        }

        const expiryObj = this.maturities.filter(obj => {
            return obj.value == this.riskFactorDto.expiryId;
        });
        let expiryId = '';
        if (expiryObj.length > 0) {
            expiryId = expiryObj[0].label + ':';
        }

        const maturityObj = this.maturities.filter(obj => {
            return obj.value == this.riskFactorDto.maturityId;
        });
        let maturityId = '';
        if (maturityObj.length > 0) {
            maturityId = maturityObj[0].label + ':';
        }

        let subRiskFactorType = '';
        if (this.riskFactorDto.subRiskFactorType) {
            subRiskFactorType = this.riskFactorDto.subRiskFactorType + ':';
        }

        this.riskFactorDto.shockRuleKeyName =
            assetClassId + riskFactorTypeId + assetName + countryId + sectorId + subRiskFactorType + currencyId + expiryId + maturityId;
        this.riskFactorDto.shockRuleKeyName = this.riskFactorDto.shockRuleKeyName.substr(0, this.riskFactorDto.shockRuleKeyName.length - 1);
    }

    saveNewRiskFactorData() {
        if (this.validateRiskFactorData()) {
            this.getFormula();
            this.riskfactorLibService
                .saveRiskFactorData({
                    riskFactorLibDTO: JSON.stringify(this.riskFactorLibDTO),
                    metaDataDTO: JSON.stringify(this.riskFactorDto)
                })
                .subscribe(
                    response => {
                        this.showSuccessValidations(true, 'Risk Factor data saved successfully.');
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                    }
                );
        }
    }

    validateRiskFactorData() {
        let isValid = true;
        if (this.riskFactorDto.shockRuleKeyName == null || this.riskFactorDto.shockRuleKeyName == '') {
            isValid = false;
            this.showErrorValidations(true, 'Please provide a value for shock rule key.');
        } else if (this.riskFactorDto.assetClassId == null || this.riskFactorDto.assetClassId == '') {
            isValid = false;
            this.showErrorValidations(true, 'Please provide a value for asset class.');
        } else if (
            !this.riskFactorDto.riskFactorTypeId ||
            this.riskFactorDto.riskFactorTypeId == null ||
            this.riskFactorDto.riskFactorTypeId == ''
        ) {
            isValid = false;
            this.showErrorValidations(true, 'Please provide a value for risk factor type.');
        } else if (this.riskFactorDto.assetName == null || this.riskFactorDto.assetName == '') {
            isValid = false;
            this.showErrorValidations(true, 'Please provide a value for asset name.');
        } else if (this.riskFactorDto.countryId == null || this.riskFactorDto.countryId == '') {
            isValid = false;
            this.showErrorValidations(true, 'Please provide a value for country.');
        } else if (this.riskFactorDto.unitId == null || this.riskFactorDto.unitId == '') {
            isValid = false;
            this.showErrorValidations(true, 'Please provide a value for unit.');
        } else if (this.riskFactorDto.frequencyId == null || this.riskFactorDto.frequencyId == '') {
            isValid = false;
            this.showErrorValidations(true, 'Please  provide a value for frequency.');
        }

        return isValid;
    }

    getFormula() {
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
            });
        this.riskFactorLibDTO.arithmaticFormula = listcalc.slice(0, -1);
    }

    updateRiskFactorType(obj) {
        if (obj != null || obj != undefined) {
            this.riskFactorTypesNew = Object.assign([], this.riskFactorTypes.filter(item => item.asset_id == obj.value));
            if (this.riskFactorTypesNew.length > 0) {
                this.riskFactorDto.riskFactorTypeId = this.riskFactorTypesNew[0].value;
            }
        }
    }

    discardNewRiskFactorData() {
        const filterData = new Object();
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);

        this.router.navigate(['/dataUtility/riskfactorinfo', filterData], { skipLocationChange: true });
    }
}
