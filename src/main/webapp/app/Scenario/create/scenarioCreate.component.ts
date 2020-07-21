import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Account } from 'app/core';
import { ActivatedRoute } from '@angular/router';
import { ScenarioService } from 'app/Scenario/scenario.service';

import { Router } from '@angular/router';
import {
    SCENARIO_CLASSIFICATION_REGULATORY,
    SCENARIO_CLASSIFICATION_ADHOC,
    SCENARIO_CLASSIFICATION_INTERNAL,
    SCENARIO_DEFINED,
    ALERT_MSG_TIME_OUT,
    PROJECTION_ID,
    FREQ_ID_DAILY,
    FREQ_ID_WEEKLY,
    SCENARIO_REVIEW_INPROGRESS,
    SCENARIO_REJECTED
} from 'app/constants';
import { NgbDateMomentAdapter } from 'app/shared';
import { NgbDateStruct, NgbDatepickerConfig, NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'scenario-create',
    templateUrl: './scenarioCreate.component.html',
    styleUrls: ['../scenario.css']
})
export class ScenarioCreateComponent implements OnInit {
    account: Account;
    roleModelsList = [];
    processDefinitionsList: any[];
    wfId: any;

    scenarioObj = {
        id: null,
        scenarioName: null,
        description: null,
        classification: null,
        subClassification: null,
        type: null,
        severity: null,
        year: null,
        quarter: null,
        businessUsers: [],
        designerUsers: [],
        lastModifiedDate: null,
        lastModifiedBy: null,
        createdDate: null,
        status: null,
        shockTemplate: 0,
        scenarioProcessDefinition: null,
        returnHorizon: null,
        projectionPeriod: null,
        startDate: null,
        endDate: null,
        minDate: null,
        maxDate: null,
        startDateStr: null,
        endDateStr: null,
        createdBy: null,
        version: null,
        shockTemplateVersion: null,
        isVersionUpdated: null,
        overlapping: null
    };
    minDate = null;
    maxDate = null;
    oldScenarioObj = {
        oldscenarioName: null,
        oldClassification: null,
        oldSubClassification: null,
        oldType: null,
        oldSeverity: null,
        oldYear: null,
        oldQuarter: null,
        businessUsers: [],
        designerUsers: []
    };
    businessUsers = [];
    designerUsers = [];
    usersList = [];
    businessUserList = [];
    designerList = [];
    severityList = [];
    scenarioTypeList = [];
    classificationList = [];
    subClassificationList = [];
    subClassificationListTemp = [];
    quarterList = [];

    frequencyList = [];
    frequencyListOrg = [];

    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    onChangeScreen = false;
    ddChangeb = true;
    ddChanged = true;
    scenarioRegualtory = SCENARIO_CLASSIFICATION_REGULATORY;
    scenarioInternal = SCENARIO_CLASSIFICATION_INTERNAL;
    scenarioAdhoc = SCENARIO_CLASSIFICATION_ADHOC;
    userCanAccess = false;
    possibleStatuses = [SCENARIO_DEFINED];
    shockTemplateList = [];
    overlappingList = [{ value: 'true', label: 'TRUE' }, { value: 'false', label: 'FALSE' }];

    isNameEdit = false;

    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;

    @ViewChild('updateShockValues')
    updateShockValues: ElementRef;
    constructor(
        private activatedRoute: ActivatedRoute,
        private scenarioService: ScenarioService,
        private router: Router,
        private momentAdapter: NgbDateMomentAdapter,
        config: NgbDatepickerConfig,
        calendar: NgbCalendar,
        private modalService: NgbModal
    ) {
        config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) >= 6;
    }

    ngOnInit() {
        // this.getProcessDefinitions();
        this.ddChangeb = false;
        this.ddChanged = false;
        this.scenarioObj.id = this.activatedRoute.snapshot.params.id;
        if (this.scenarioObj.id && 'null' !== this.scenarioObj.id) {
            this.scenarioService.getScenarioData(Number(this.scenarioObj.id)).subscribe(
                response => {
                    this.scenarioObj = response;
                    this.oldScenarioObj.oldClassification = this.scenarioObj.classification;
                    this.oldScenarioObj.oldSubClassification = this.scenarioObj.subClassification;
                    this.oldScenarioObj.oldType = this.scenarioObj.type;
                    this.oldScenarioObj.oldSeverity = this.scenarioObj.severity;
                    this.oldScenarioObj.oldYear = this.scenarioObj.year;
                    this.oldScenarioObj.oldQuarter = this.scenarioObj.quarter;
                    this.oldScenarioObj.oldscenarioName = this.scenarioObj.scenarioName;
                    this.oldScenarioObj.businessUsers = this.scenarioObj.businessUsers;
                    this.oldScenarioObj.designerUsers = this.scenarioObj.designerUsers;
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
                    this.wfId = this.scenarioObj.scenarioProcessDefinition;
                    this.setDateFormats();
                    this.getScenarioCreateMasterData(parseInt(this.scenarioObj.id));
                    this.getScenarioConfigureMasterData('N');
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else {
            this.getProcessDefinitions();
            this.scenarioObj.id = null;
            this.getScenarioCreateMasterData(0);
            this.userCanAccess = true;
        }
    }
    openLg(content) {
        this.modalService.open(content, { size: 'lg' });
    }

    setDateFormats() {
        let dateStruct: NgbDateStruct;
        let date = new Date(this.scenarioObj.startDate);
        dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        this.scenarioObj.startDate = this.momentAdapter.toModel(dateStruct);

        date = new Date(this.scenarioObj.endDate);
        dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        this.scenarioObj.endDate = this.momentAdapter.toModel(dateStruct);
    }

    getScenarioCreateMasterData(id) {
        this.scenarioService.getScenarioCreateMasterData(id).subscribe(
            response => {
                this.severityList = response['SEVERITY_DATA'];
                this.scenarioTypeList = response['SCENARIO_TYPE_DATA'];
                this.classificationList = response['CLASSIFICATION_DATA'];
                this.subClassificationList = response['SUB_CLASSIFICATION_DATA'];
                this.usersList = response['USERS_DATA'];
                this.businessUserList = response['BUSINESS_OWNERS'];
                this.designerList = response['DESIGNERS'];
                this.frequencyList = response['FREQUENCY_DATA'];
                this.frequencyListOrg = response['FREQUENCY_DATA'];
                let minMaxDates = response['MIN_MAX_DATES'];

                for (let i = 1; i <= 4; i++) {
                    this.quarterList.push({ value: 'Q' + i, label: 'Q' + i });
                }

                const clsfnId = this.scenarioObj.classification;
                this.subClassificationListTemp = [];
                if (clsfnId != null) {
                    this.subClassificationListTemp = this.subClassificationList.filter(clfn => clfn.classification === clsfnId);
                }
                let dateStruct: NgbDateStruct;
                if (id != 0) {
                    let startDate = new Date(this.scenarioObj.startDate);
                    if (startDate) {
                        dateStruct = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };
                        this.scenarioObj.startDate = this.momentAdapter.toModel(dateStruct);
                        this.minDate = dateStruct;

                        //  } else {
                        let objminDate = new Date(this.scenarioObj.minDate);
                        this.minDate = { year: objminDate.getFullYear(), month: objminDate.getMonth() + 1, day: objminDate.getDate() };
                    }

                    let endDate = new Date(this.scenarioObj.endDate);
                    if (endDate) {
                        dateStruct = { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate() };
                        this.scenarioObj.endDate = this.momentAdapter.toModel(dateStruct);
                        this.maxDate = dateStruct;
                        //    } else {
                        let objmaxDate = new Date(this.scenarioObj.maxDate);
                        this.maxDate = { year: objmaxDate.getFullYear(), month: objmaxDate.getMonth() + 1, day: objmaxDate.getDate() };
                    }
                } else {
                    let startDate = new Date(minMaxDates['MIN']);
                    let endDate = new Date(minMaxDates['MAX']);

                    dateStruct = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };
                    this.scenarioObj.startDate = this.momentAdapter.toModel(dateStruct);
                    this.minDate = dateStruct;

                    dateStruct = { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate() };
                    this.scenarioObj.endDate = this.momentAdapter.toModel(dateStruct);
                    this.maxDate = dateStruct;
                }
                this.changeScenrioType('EDIT');
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.scenarioObj.id }], { skipLocationChange: true });
    }

    /* yearChange(val) {
        this.scenarioObj.year = val;
        this.change('YEAR');
    } */

    change(type) {
        this.onChangeScreen = true;
        if (type === 'CLASSIFICATION') {
            this.scenarioObj.subClassification = null;
            this.scenarioObj.shockTemplate = 0;
            const clsfnId = this.scenarioObj.classification;
            this.subClassificationListTemp = [];
            if (clsfnId != null) {
                this.subClassificationListTemp = this.subClassificationList.filter(clfn => clfn.classification === clsfnId);
            }
        }
        if (type === 'SEVERITY' || type === 'SCENARIO_TYPE' || type === 'SUB_CLASSIFICATION' || type === 'ESTIMATION_FREQUENCY') {
            this.scenarioObj.shockTemplate = 0;
        }
        if (this.scenarioObj.id == null) {
            let scenarioName = null;
            if (this.scenarioObj.classification) {
                if (scenarioName == null) {
                    scenarioName = this.classificationList.filter(clfn => clfn.value === this.scenarioObj.classification)[0].label;
                }
            }
            if (this.scenarioObj.subClassification) {
                if (scenarioName == null) {
                    scenarioName = this.subClassificationList.filter(clfn => clfn.value === this.scenarioObj.subClassification)[0].label;
                } else {
                    scenarioName +=
                        '_' + this.subClassificationList.filter(clfn => clfn.value === this.scenarioObj.subClassification)[0].label;
                }
            }
            if (this.scenarioObj.type) {
                if (scenarioName == null) {
                    scenarioName = this.scenarioTypeList.filter(clfn => clfn.value === this.scenarioObj.type)[0].label;
                } else {
                    scenarioName += '_' + this.scenarioTypeList.filter(clfn => clfn.value === this.scenarioObj.type)[0].label;
                }
            }
            if (this.scenarioObj.severity) {
                if (scenarioName == null) {
                    scenarioName = this.severityList.filter(clfn => clfn.value === this.scenarioObj.severity)[0].label;
                } else {
                    scenarioName += '_' + this.severityList.filter(clfn => clfn.value === this.scenarioObj.severity)[0].label;
                }
            }
            /* if (this.scenarioObj.year) {
                if (scenarioName == null) {
                    scenarioName = this.scenarioObj.year;
                } else {
                    scenarioName += '_' + this.scenarioObj.year;
                }
            } */
            if (this.scenarioObj.quarter) {
                if (scenarioName == null) {
                    scenarioName = this.scenarioObj.quarter;
                } else {
                    scenarioName += '_' + this.scenarioObj.quarter;
                }
            }
            this.scenarioObj.scenarioName = scenarioName;
        }
    }

    changeProjectionNo(obj) {
        this.onChangeScreen = true;
        this.scenarioObj.shockTemplate = 0;
    }

    saveScenario(path) {
        this.onChangeScreen = false;
        this.scenarioObj.scenarioProcessDefinition = this.wfId;
        if (this.scenarioObj.type != PROJECTION_ID) {
            this.scenarioObj.projectionPeriod = null;
        }
        if (!this.validate(this.scenarioObj)) {
            return false;
        }
        const startDate = new Date(this.scenarioObj.startDate);
        const endDate = new Date(this.scenarioObj.endDate);
        this.scenarioObj.startDateStr = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
        this.scenarioObj.endDateStr = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
        this.scenarioService.saveScenarioData(this.scenarioObj).subscribe(
            response => {
                this.scenarioObj = response;
                this.showSuccessValidations(true, 'Saved successfully');
                this.navigateTo(path);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    cancel() {
        this.modalService.dismissAll();
        this.navigateTo('scenario/scenarioConfig');
    }
    save() {
        this.modalService.dismissAll();
    }

    validate(scenarioObj) {
        if (!scenarioObj.classification || 'null' == scenarioObj.classification) {
            this.showErrorValidations(true, 'Please Select Classification.');
            return false;
        } else if (
            scenarioObj.classification != this.scenarioAdhoc &&
            (!scenarioObj.subClassification || 'null' == scenarioObj.subClassification)
        ) {
            this.showErrorValidations(true, 'Please Provide A Value For Sub Classification.');
            return false;
        } else if (scenarioObj.classification != this.scenarioAdhoc && (!scenarioObj.type || 'null' == scenarioObj.type)) {
            this.showErrorValidations(true, 'Please Provide A Value For Scenario Type.');
            return false;
        } else if (scenarioObj.classification != this.scenarioAdhoc && (!scenarioObj.severity || 'null' == scenarioObj.severity)) {
            this.showErrorValidations(true, 'Please Provide A Value For Severity');
            return false;
        } /* else if (scenarioObj.classification != this.scenarioAdhoc && (!scenarioObj.year || 'null' == scenarioObj.year)) {
            this.showErrorValidations(true, 'Please Provide A Value For Year.');
            return false;
        }  else if (scenarioObj.classification == this.scenarioInternal && (!scenarioObj.quarter || 'null' == scenarioObj.quarter)) {
            this.showErrorValidations(true, 'Please Provide A Value For Quarter.');
            return false;
        }  */ else if (
            scenarioObj.classification !== this.scenarioAdhoc &&
            (!scenarioObj.businessUsers || scenarioObj.businessUsers.length == 0)
        ) {
            this.showErrorValidations(true, 'Please Provide A Value For Business Users.');
            return false;
        } else if (!scenarioObj.designerUsers || scenarioObj.designerUsers.length == 0) {
            this.showErrorValidations(true, 'Please Provide A Value For Designers.');
            return false;
        } else if (!scenarioObj.scenarioName || scenarioObj.scenarioName == 'null' || scenarioObj.scenarioName.length == 0) {
            this.showErrorValidations(true, 'Please Provide A Value For Scenario Name.');
            return false;
        } else if (!scenarioObj.returnHorizon || 'null' == scenarioObj.returnHorizon) {
            this.showErrorValidations(true, 'Please Provide A Value For Return Horizon.');
            return false;
        } else if (this.scenarioObj.type == PROJECTION_ID && this.scenarioObj.projectionPeriod == null) {
            this.showErrorValidations(true, 'Please Provide A Value For Projection Period.');
            return false;
        } else if (
            (this.scenarioObj.type == PROJECTION_ID && this.scenarioObj.projectionPeriod > '21') ||
            (this.scenarioObj.type == PROJECTION_ID && this.scenarioObj.projectionPeriod < '2')
        ) {
            this.showErrorValidations(true, 'Please Provide A Value For Projection Period 2 to 20.');
            return false;
        } else if (!scenarioObj.description || scenarioObj.description == 'null' || scenarioObj.description.length == 0) {
            this.showErrorValidations(true, 'Please Provide A Value For Description.');
            return false;
        } else if (!scenarioObj.startDate) {
            this.showErrorValidations(true, 'Please Select Start Date.');
            return false;
        } else if (!scenarioObj.endDate) {
            this.showErrorValidations(true, 'Please Select End Date.');
            return false;
        } /*  else if (!scenarioObj.shockDate) {
            this.showErrorValidations(true, 'Please Select Shock Date.');
            return false;
        }  */ else if (
            scenarioObj.startDate >= scenarioObj.endDate
        ) {
            this.showErrorValidations(true, 'Start date should be less than end date.');
            return false;
        } else if (!scenarioObj.overlapping || 'null' == scenarioObj.overlapping) {
            this.showErrorValidations(true, 'Please Select Overlapping.');
            return false;
        }

        return true;
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
    getProcessDefinitions() {
        this.scenarioService.getProcessDefinitions().subscribe(resposne => {
            this.processDefinitionsList = resposne.data;
            this.wfId = this.processDefinitionsList[0].id;
        });
    }

    getScenarioConfigureMasterData(vChange) {
        if (vChange == 'Y') {
            this.onChangeScreen = true;
        }
        this.shockTemplateList = [{ value: 0, label: 'User Defined' }];
        const date = new Date(this.scenarioObj.endDate);
        this.scenarioObj.year = date.getFullYear();
        this.scenarioService.getScenarioConfigureMasterData(this.scenarioObj).subscribe(
            response => {
                this.shockTemplateList = this.shockTemplateList.concat(response['SHOCK_TEMPLATE_DATA']);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    changedValue() {
        this.onChangeScreen = true;
    }
    changeValb() {
        if (this.ddChangeb) {
            this.onChangeScreen = true;
        }
        this.ddChangeb = true;
    }
    changeVald() {
        if (this.ddChanged) {
            this.onChangeScreen = true;
        }
        this.ddChanged = true;
    }

    editScenarioName() {
        let ele = document.getElementById('sceName').focus();
        return ele;
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

    changeScenrioType(type) {
        const ptype = this.scenarioObj.type;
        if (ptype == 2) {
            if (type == 'NEW') {
                this.scenarioObj.returnHorizon = null;
            }
            this.frequencyList = this.frequencyListOrg.filter(e => e.value !== FREQ_ID_DAILY && e.value !== FREQ_ID_WEEKLY);
        } else {
            this.frequencyList = this.frequencyListOrg;
        }
    }
}
