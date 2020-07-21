import { Component, OnInit } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScenarioService } from 'app/Scenario/scenario.service';
import { NgbDateMomentAdapter } from 'app/shared';
import { NgbDateStruct, NgbDatepickerConfig, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT } from 'app/constants';

@Component({
    selector: 'scenario-config',
    templateUrl: './scenarioConfiguration.component.html',
    styleUrls: ['../scenario.css']
})
export class ScenarioConfigurationComponent implements OnInit {
    account: Account;
    scenarioObj = {
        id: null,
        scenarioName: null,
        startDate: null,
        endDate: null,
        shockDate: null,
        returnHorizon: null,
        shockTemplate: 0,
        lastModifiedDate: null,
        scenarioProcessDefinition: null,
        processInstanceId: null,
        status: null,
        classification: null
    };
    userCanAccess = false;
    shockTemplateList = [];

    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;

    constructor(
        private accountService: AccountService,
        private loginService: LoginService,
        private activatedRoute: ActivatedRoute,
        private scenarioService: ScenarioService,
        private router: Router,
        private momentAdapter: NgbDateMomentAdapter,
        config: NgbDatepickerConfig,
        calendar: NgbCalendar
    ) {
        config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) >= 6;
    }

    ngOnInit() {
        /* this.accountService.identity().then((account: Account) => {
            this.account = account;
        }); */
        this.scenarioObj.id = this.activatedRoute.snapshot.params.id;
        if (this.scenarioObj.id && 'null' != this.scenarioObj.id) {
            this.scenarioService.getScenarioData(parseInt(this.scenarioObj.id)).subscribe(
                response => {
                    this.scenarioObj = response;
                    this.scenarioService.checkAccess(this.scenarioObj.id).subscribe(
                        id => {
                            this.userCanAccess = true;
                        },
                        id => {
                            this.userCanAccess = false;
                        }
                    );

                    let dateStruct: NgbDateStruct;
                    let date = new Date(this.scenarioObj.startDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.scenarioObj.startDate = this.momentAdapter.toModel(dateStruct);

                    date = new Date(this.scenarioObj.endDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.scenarioObj.endDate = this.momentAdapter.toModel(dateStruct);

                    date = new Date(this.scenarioObj.shockDate);
                    dateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
                    this.scenarioObj.shockDate = this.momentAdapter.toModel(dateStruct);

                    this.getScenarioConfigureMasterData();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else {
            this.scenarioObj.id = null;
            this.getScenarioConfigureMasterData();
        }
    }
    getScenarioConfigureMasterData() {
        this.shockTemplateList = [{ value: 0, label: 'User Defined' }];
        this.scenarioService.getScenarioConfigureMasterData(this.scenarioObj).subscribe(
            response => {
                this.shockTemplateList = this.shockTemplateList.concat(response['SHOCK_TEMPLATE_DATA']);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    navigateTo(path) {
        this.router.navigate([path, { id: this.scenarioObj.id }], { skipLocationChange: true });
    }

    saveScenarioConfig() {
        if (!this.validate(this.scenarioObj)) {
            return false;
        }

        this.scenarioService.saveScenarioConfig(this.scenarioObj).subscribe(
            response => {
                this.scenarioObj.id = response;
                this.navigateTo('scenario/selectRiskFactor');
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    validate(scenarioObj: {
        id: any;
        scenarioName: any;
        startDate: any;
        endDate: any;
        shockDate: any;
        returnHorizon: any;
        shockTemplate: number;
        lastModifiedDate: any;
    }): any {
        if (!scenarioObj.startDate) {
            this.showErrorValidations(true, 'Please Select Start Date.');
            return false;
        } else if (!scenarioObj.endDate) {
            this.showErrorValidations(true, 'Please Select End Date.');
            return false;
        } else if (!scenarioObj.shockDate) {
            this.showErrorValidations(true, 'Please Select Shock Date.');
            return false;
        } else if (scenarioObj.startDate >= scenarioObj.endDate) {
            this.showErrorValidations(true, 'Start date should be less than end date.');
            return false;
        }
        return true;
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

    /* isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginService.login();
    } */
}
