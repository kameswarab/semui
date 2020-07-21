import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Account } from 'app/core';
import { Router } from '@angular/router';
import { ScenarioService } from 'app/Scenario/scenario.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, SCENARIO_TABS, PAGE_SIZE } from 'app/constants';
import { PagerService } from 'app/pager.service';
@Component({
    selector: 'scenario-create',
    templateUrl: './scenarioHome.component.html',
    styleUrls: ['../scenario.css']
})
export class ScenarioHomeComponent implements OnInit {
    account: Account;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    pageSize = 10;
    filter = {
        filterDescrption: null,
        arguments: [],
        pageIndex: 1,
        pageSize: this.pageSize,
        sorts: [],
        masterId: null,
        filterModels: {},
        sortMap: {},
        totalSize: 0,
        isServerSideFilter: true
    };
    records = [];
    recordsSub = [];
    scenarioId = 0;
    filters = {};
    scenarioCreated = 0;
    scenarioInProgress = 0;
    scenarioUnderReview = 0;
    scenarioRejected = 0;
    scenarioCompleted = 0;

    scenarioInProgressStatus = 'In Progress';
    scenarioUnderReviewStatus = 'Under Review';
    scenarioRejectedStatus = 'Rejected';
    scenarioCompletedStatus = 'Completed';
    scenarioInApprovalStatus = 'In Approval';

    cardActive = 'ALL';

    createFilter = {
        SEARCH_STR: [''],
        SCENARIO_TYPE: [],
        STATUS: [],
        CREATED_DATE: [],
        CLASSIFICATION: [],
        SEVERITY: []
    };

    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;

    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };
    filtersApplied = false;
    filterIcon = false;

    constructor(
        private router: Router,
        private scenarioService: ScenarioService,
        private modalService: NgbModal,
        private pagerService: PagerService
    ) {}

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

        this.router.navigate([tab.value, { id: id }], { skipLocationChange: true });
    }

    ngOnInit() {
        this.getScenarioDataList('ON_LOAD');
    }

    cardClickFunction(status) {
        this.cardActive = status;
        this.createFilter = {
            SEARCH_STR: [''],
            SCENARIO_TYPE: [],
            STATUS: [],
            CREATED_DATE: [],
            CLASSIFICATION: [],
            SEVERITY: []
        };
        this.filtersApplied = false;
        if (status != 'ALL') {
            this.filtersApplied = true;
            if (status == this.scenarioUnderReviewStatus) {
                this.createFilter['STATUS'] = [status, this.scenarioInApprovalStatus];
            } else {
                this.createFilter['STATUS'] = [status];
            }
        }
        this.getScenarioDataList('FILTERS');
    }

    resetFilters() {
        this.filtersApplied = false;
        this.filterIcon = false;
        this.cardActive = 'ALL';
        this.createFilter = {
            SEARCH_STR: [''],
            SCENARIO_TYPE: [],
            STATUS: [],
            CREATED_DATE: [],
            CLASSIFICATION: [],
            SEVERITY: []
        };
        this.getScenarioDataList('FILTERS');
    }

    filterCheckboxChange(event, filter, value) {
        this.filtersApplied = false;
        this.filterIcon = false;
        if (filter != 'SEARCH_STR') {
            let list = this.createFilter[filter] || [];
            if (event.target.checked) {
                list.push(value);
            } else {
                list = list.filter(p => p != value);
            }
            this.createFilter[filter] = list;
        }
        Object.keys(this.createFilter).forEach(key => {
            if (key == 'SEARCH_STR') {
                let str = this.createFilter['SEARCH_STR'][0];
                if (str && str.length > 0) {
                    this.filtersApplied = true;
                }
            } else {
                if (this.createFilter[key] && this.createFilter[key].length > 0) {
                    this.filtersApplied = true;
                    if (key != 'STATUS' && key != 'CREATED_DATE' && key != 'SCENARIO_TYPE') {
                        this.filterIcon = true;
                    }
                }
            }
        });
        this.getScenarioDataList('FILTERS');
    }

    getScenarioDataList(type) {
        this.scenarioService.getScenarioDataList(this.createFilter).subscribe(
            response => {
                this.records = response['RECORDS'];
                this.filters = response['FILTERS'];
                if ('ON_LOAD' == type) {
                    this.scenarioCreated = this.records.length;
                    this.scenarioInProgress = this.records.filter(p => p['STATUS'] == this.scenarioInProgressStatus).length || 0;
                    this.scenarioUnderReview =
                        this.records.filter(
                            p => p['STATUS'] == this.scenarioUnderReviewStatus || p['STATUS'] == this.scenarioInApprovalStatus
                        ).length || 0;
                    this.scenarioRejected = this.records.filter(p => p['STATUS'] == this.scenarioRejectedStatus).length || 0;
                    this.scenarioCompleted = this.records.filter(p => p['STATUS'] == this.scenarioCompletedStatus).length || 0;
                }
                if (this.pager.currentPage != null) {
                    if (this.pager.currentPage * this.pageSize >= this.records.length) {
                        this.setPage(1);
                    } else {
                        this.setPage(this.pager.currentPage);
                    }
                } else {
                    this.setPage(1);
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    setPage(page) {
        let totalSize = this.records.length;
        this.pager = this.pagerService.getPager(totalSize, page, PAGE_SIZE);
        this.recordsSub = [];
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        this.recordsSub = this.records.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    getScenarioCreateMasterData(id) {
        /* this.scenarioService.getScenarioCreateMasterData(id).subscribe(
            response => {
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        ); */
    }

    scenarioObj = null;
    openDeleteDataModal(obj) {
        this.modalService.open(this.deleteDataModal, {});
        this.scenarioObj = {
            id: obj.ID,
            lastModifiedDate: obj.LAST_MODIFIED_DATE
        };
    }

    expandDetails(record) {
        let collapsed = record['COLLAPSED'];
        if (!collapsed) {
            if ('DESIGNERS' in record) {
                record['COLLAPSED'] = !record['COLLAPSED'];
            } else {
                this.scenarioService.getScenarioDetails(record['ID']).subscribe(
                    response => {
                        record['SET_COUNT'] = response['SET_COUNT'] || 0;
                        record['DESIGNERS'] = response['DESIGNERS'] || [];
                        record['BUSINESS_USERS'] = response['BUSINESS_USERS'] || 0;
                        record['COLLAPSED'] = !record['COLLAPSED'];
                        record['CREATED_BY'] = response['CREATED_BY'];
                    },
                    response => {
                        this.showErrorValidations(true, response.error);
                    }
                );
            }
        } else {
            record['COLLAPSED'] = !record['COLLAPSED'];
        }
    }

    deleteScenario() {
        if (this.scenarioObj != null) {
            this.scenarioService.deleteScenario(this.scenarioObj).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Scenario deleted successfully.');
                    this.cancel();
                    this.getScenarioDataList('ON_LOAD');
                },
                response => {
                    this.showErrorValidations(true, response.error);
                    this.cancel();
                }
            );
        }
    }

    cancel() {
        this.modalService.dismissAll();
        this.scenarioObj = null;
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
}
