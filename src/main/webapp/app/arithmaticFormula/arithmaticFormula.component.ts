import { Component, OnInit, Input } from '@angular/core';
import { User, IUserResponse } from './user.class';
import { FormBuilder, FormGroup } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ArithmaticFormulaService } from './arithmaticFormula.service';
import * as $ from 'jquery';
import { RiskFactorLibService } from 'app/riskFactorLibrary/riskfactorLib.service';

@Component({
    selector: 'arithmatic-formula',
    templateUrl: './arithmaticFormula.component.html',
    styleUrls: ['arithmaticFormula.css'],
    host: {
        '(window:click)': 'onExit()'
    }
})
export class ArithmaticFormulaComponent implements OnInit {
    filteredUsers: Observable<IUserResponse>;
    usersForm: FormGroup;
    rfList: [];
    customMnemonicTaxonomyText: any;
    selected: any;
    /*********************************** Validation Rule ********************************************/
    operatorsMap = {
        ADD: '+',
        SUB: '-',
        MULT: '*',
        DIVIDE: '/',
        OPENL: '(',
        OPENR: ')',
        ZERO: '0',
        DOUBLEEQUAL: '==',
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
    ui: any;
    $: any;
    //@Input()

    @Input()
    rfData: any[] = [];
    @Input()
    userData: any[] = [];

    @Input()
    usedFrom: string;

    isExitFormula = false;
    shockRuleKeys = [];
    lastkeydownVal: number = 0;
    subscription: any;
    checkRiskFactor: any;
    limitVal = 100;

    constructor(
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private arithmaticFormulaService: ArithmaticFormulaService,
        private riskfactorLibService: RiskFactorLibService
    ) {}

    taxonomySelectionChange($event) {
        let SearchVal = (<HTMLInputElement>document.getElementById('customMnemonicTaxonomyText')).value;
        this.shockRuleKeys = [];
        //let matches = [];
        let obj = {
            checkRiskFactor: this.rfData,
            searchValue: SearchVal,
            limit: this.limitVal
        };

        if (SearchVal && SearchVal !== '' && SearchVal.length > 3) {
            if (this.usedFrom == 'shocksScreen') {
                this.shockRuleKeys = this.searchFromArray(this.userData, SearchVal);
                if (this.shockRuleKeys.includes(SearchVal)) {
                    this.selectChangeHandler(SearchVal);
                }
            } else {
                this.riskfactorLibService.taxonomySelectionChange(obj).subscribe(
                    data => {
                        this.shockRuleKeys = data.listRiskFacors;
                        this.isExitFormula = true;
                        if (this.shockRuleKeys.includes(SearchVal)) {
                            this.selectChangeHandler(SearchVal);
                        }
                    },
                    error => {}
                );
            }
        }
    }

    searchFromArray(arr, searchVal) {
        searchVal = searchVal.toLowerCase();
        let matches = [];
        let i = 0;
        let check = true;
        arr.forEach(value => {
            if (check) {
                let name = value['name'];
                if (name.toLowerCase().includes(searchVal)) {
                    matches.push(name);
                    if (i == 50) {
                        check = false;
                    }
                    i++;
                }
            }
        });
        return matches;
    }
    selectChangeHandler(id) {
        if (this.shockRuleKeys && this.shockRuleKeys.indexOf(id) !== -1) {
            this.onExit();
            this.customMnemonicTaxonomyText = null;
            //  $('#customMnemonicTaxonomyText').val('');
            this.shockRuleKeys = [];
            const spanTag =
                "<li id='" +
                id +
                "_TAXO' value='" +
                id +
                "'>" +
                id +
                "<a href='javascript:void(0);' class='pclose' onclick='removeData(\"" +
                id +
                '_TAXO");\'>x</a></li>';
            $('#formulaBuilderDiv')
                .find(' > li:nth-child(' + this.getTypeFormulaElementIndexCM() + ')')
                .before(spanTag);
            $('#customMnemonicTaxonomyText').val('');
        } else {
            //const shockRuleKeys = this.shockRuleKeys.filter(item => item.name == id);
            if (this.shockRuleKeys.length > 0) {
                //this.onExit();
                const spanTag =
                    "<li id='" +
                    id +
                    "_TAXO' value='" +
                    id +
                    "'>" +
                    id +
                    "<a href='javascript:void(0);' class='pclose' onclick='removeData(\"" +
                    id +
                    '_TAXO");\'>x</a></li>';
                $('#formulaBuilderDiv')
                    .find(' > li:nth-child(' + this.getTypeFormulaElementIndexCM() + ')')
                    .before(spanTag);
                $('#customMnemonicTaxonomyText').val('');
            }
        }
        // $('#customMnemonicTaxonomyText').focus();
    }

    ngOnInit() {
        this.usersForm = this.fb.group({
            userInput: null
        });
        this.filteredUsers = this.usersForm.get('userInput').valueChanges.pipe(
            debounceTime(300),
            switchMap(value => this.arithmaticFormulaService.search({ name: value }, 1))
        );
    }
    callalert = function() {
        $('#customMnemonicTaxonomyText').on('click', function() {});
    };
    displayFn(user: User) {
        if (user) {
            return user.name;
        }
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
    /* 
	addOperatorForValidation(operator){
   let supportId = this.getTypeFormulaMaxSupportId();
   var operatorName = this.operatorsMap[operator];
   var spanTag="<li id='"+supportId+"_"+operator+"_OPER' value='"+operatorName+"'  taxCode='"+operatorName+"'>"+operatorName+"<a href='javascript:void(0);' class='pclose' onclick='removeDataForValidation(\""+supportId+"_"+operator+"_OPER\");'>x</a></li>";
   $('#formulaBuilderDivForValidation').find(' > li:nth-child('+this.getTypeFormulaElementIndex()+')').before(spanTag);
   $( "#customValidationTaxonomyText" ).focus();
  } */
    /*   getTypeFormulaMaxSupportId(){
        let supportId=0;
    $("#formulaBuilderDivForValidation li").each(function(index,element) {
      var id=$(element).attr('id');
      var ids=id.split('_');
      supportId=supportId<parseInt(ids[0])?parseInt(ids[0]):supportId;
    });
    $("#formulaBuilderDiv li").each(function(index,element) {
      var id=$(element).attr('id');
      var ids=id.split('_');
      supportId=supportId<parseInt(ids[0])?parseInt(ids[0]):supportId;
    });
    return (supportId)+1;
        } */
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
    getTypeFormulaElementIndex() {
        let prevElement = 0;
        $('#formulaBuilderDivForValidation li').each(function(index, element) {
            const id = $(element).attr('id');
            prevElement = index;
            if (id === 'customTaxonomyTextIdLiForValidation') {
                return false;
            }
        });
        return prevElement + 1;
    }
    clearFormulaDiv = function() {
        $('#formulaBuilderDiv li:not(#customTaxonomyTextIdLi)').remove();
    };

    toggleMenu($event) {
        $event.stopPropagation();
        this.isExitFormula = !this.isExitFormula;
    }

    onExit() {
        this.isExitFormula = false;
    }
}
