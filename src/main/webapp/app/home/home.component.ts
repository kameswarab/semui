import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { HomeService } from './home.service';
import { ALERT_MSG_TIME_OUT, SCENARIO_TABS, MODEL_LIBRARY_TABS } from 'app/constants';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScenarioService } from 'app/Scenario';
import { Location } from '@angular/common';
import { ModelService } from 'app/modelLibrary';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: ['home.css']
})
export class HomeComponent implements OnInit {
    account: Account;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;

    records = [];
    recordsSub = [];
    scenarioId = 0;
    filters = {};
    scenarioCreated = 0;
    scenarioInProgress = 0;
    scenarioUnderReview = 0;
    scenarioRejected = 0;
    scenarioCompleted = 0;
    remainingScenarioCount = 0;
    riskFactorsCount = 0;

    modelRecords = [];
    modelRecordsSub = [];
    modelId = 0;
    modelFilters = {};
    modelCreated = 0;
    modelInProgress = 0;
    modelUnderReview = 0;
    modelRejected = 0;
    modelCompleted = 0;
    remainingModelsCount = 0;

    activityList = [];

    scenarioInProgressStatus = 'In Progress';
    scenarioUnderReviewStatus = 'Under Review';
    scenarioRejectedStatus = 'Rejected';
    scenarioCompletedStatus = 'Completed';
    scenarioInApprovalStatus = 'In Approval';

    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;

    @ViewChild('deleteModelDataModal')
    deleteModelDataModal: ElementRef;

    constructor(
        private router: Router,
        private modalService: NgbModal,
        private accountService: AccountService,
        private loginService: LoginService,
        private homeService: HomeService,
        private scenarioService: ScenarioService,
        private location: Location,
        private modelService: ModelService
    ) {}

    ngOnInit() {
        this.getHomePageInformation();

        /*   this.accountService.identity().then((account: Account) => {
            this.account = account;
        }); */
    }

    getHomePageInformation() {
        this.homeService.getHomePageInformation().subscribe(
            response => {
                this.records = response['RECORDS'];
                this.filters = response['FILTERS'];
                this.riskFactorsCount = response['RF_COUNT'];
                this.modelRecords = response['MODEL_RECORDS'];
                this.modelFilters = response['MODEL_FILTERS'];
                this.activityList = response['STATUS_LIST'];
                this.scenarioCreated = this.records.length;
                this.scenarioInProgress = this.records.filter(p => p['STATUS'] == this.scenarioInProgressStatus).length || 0;
                this.scenarioUnderReview =
                    this.records.filter(p => p['STATUS'] == this.scenarioUnderReviewStatus || p['STATUS'] == this.scenarioInApprovalStatus)
                        .length || 0;
                if (this.modelRecords) {
                    this.modelCreated = this.modelRecords.length;
                    this.modelInProgress =
                        this.modelRecords.filter(
                            p => p['STATUS'] == this.scenarioInProgressStatus || p['STATUS'] == this.scenarioUnderReviewStatus
                        ).length || 0;
                }
                if (this.records.length > 5) {
                    this.recordsSub = this.records.slice(0, 5);
                    this.remainingScenarioCount = this.records.length - 5;
                } else {
                    this.recordsSub = this.records;
                }
                if (this.modelRecords && this.modelRecords.length > 5) {
                    this.modelRecordsSub = this.modelRecords.slice(0, 5);
                    this.remainingModelsCount = this.modelRecords.length - 5;
                } else {
                    this.modelRecordsSub = this.modelRecords;
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    /**
     * scenario navigartions and deletions
     */

    navigateToScenario(item) {
        let id = null;
        let status = 1;

        if (item) {
            id = item['ID'];
            this.scenarioId = id;
            status = item['STATUS_ID'] || 1;
            if (status > 4) {
                status = 4;
            }
        }
        let tab = SCENARIO_TABS.filter(e => e.status == status)[0];
        this.location.replaceState('/scenario');
        this.router.navigate([tab.value, { id: id }], { skipLocationChange: true });
    }

    navigateToScenarioAtivity(item) {
        let id = null;
        let status = 1;

        if (item) {
            id = item.scenarioId;
            this.scenarioId = id;
            status = item.statusId || 1;
            if (status > 4) {
                status = 4;
            }
        }
        let tab = SCENARIO_TABS.filter(e => e.status == status)[0];
        this.location.replaceState('/scenario');
        this.router.navigate([tab.value, { id: id }], { skipLocationChange: true });
    }

    scenarioObj = null;
    openDeleteDataModal(obj) {
        this.modalService.open(this.deleteDataModal, {});
        this.scenarioObj = {
            id: obj.ID,
            lastModifiedDate: obj.LAST_MODIFIED_DATE
        };
    }

    deleteScenario() {
        if (this.scenarioObj != null) {
            this.scenarioService.deleteScenario(this.scenarioObj).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Scenario deleted successfully.');
                    this.cancel();
                    this.getHomePageInformation();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                    this.cancel();
                }
            );
        }
    }

    /**
     * end scenario navigartions and deletions
     */

    /**
     * model navigartions and deletions
     */

    navigateToModel(item) {
        let id = null;
        let status = 21;

        if (item) {
            id = item['ID'];
            this.scenarioId = id;
            status = item['STATUS_ID'] || 21;
            if (status > 23) {
                status = 23;
            }
        }
        let tab = MODEL_LIBRARY_TABS.filter(e => e.status == status)[0];
        this.location.replaceState('/model');
        this.router.navigate([tab.value, { id: id }], { skipLocationChange: true });
    }

    modelObj = null;
    openDeleteModelDataModal(obj) {
        this.modalService.open(this.deleteModelDataModal, {});
        this.modelObj = {
            id: obj.ID,
            lastModifiedDate: obj.LAST_MODIFIED_DATE
        };
    }

    deleteModel() {
        if (this.modelObj != null) {
            this.modelService.deleteModel(this.modelObj).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Scenario deleted successfully.');
                    this.cancel();
                    this.getHomePageInformation();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                    this.cancel();
                }
            );
        }
    }
    /**
     * end model navigartions and deletions
     */
    cancel() {
        this.modalService.dismissAll();
        this.scenarioObj = null;
        this.modelObj = null;
    }

    navigateTo(path) {
        this.router.navigate([path], { skipLocationChange: true });
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

    isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginService.login();
    }
}
