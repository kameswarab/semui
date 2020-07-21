import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoginService, AccountService, Account } from 'app/core';
import { Router } from '@angular/router';
import { ModelService } from '../model.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, MODEL_LIBRARY_TABS, PAGE_SIZE } from 'app/constants';
import { PagerService } from 'app/pager.service';
@Component({
    selector: 'model-create',
    templateUrl: './modelHome.component.html',
    // styleUrls: ['../model.css']
    styleUrls: []
})
export class ModelHomeComponent implements OnInit {
    account: Account;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    pageSize = 50;
    filters = {};
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
    classificationList = [];
    classificationList1 = [];
    selectedClfctn = 0;
    modelCreated = 0;
    modelInProgress = 0;
    modelUnderReview = 0;
    modelRejected = 0;
    modelCompleted = 0;
    modelInProgressStatus = 'In Progress';
    modelUnderReviewStatus = 'Under Review';
    modelRejectedStatus = 'Rejected';
    modelCompletedStatus = 'Completed';
    modelInApprovalStatus = 'In Approval';
    cardActive = 'ALL';
    scenarioCompletedStatus: any;
    scenarioUnderReviewStatus: any;
    scenarioRejectedStatus: any;
    scenarioInProgressStatus: any;

    createFilter = {
        SEARCH_STR: [''],
        STATUS: [],
        CREATED_DATE: []
    };
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

    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;

    constructor(
        private loginService: LoginService,
        private router: Router,
        private pagerService: PagerService,
        private modelService: ModelService,
        private modalService: NgbModal
    ) {}

    navigateToModel(item) {
        let id = null;
        let status = 21;
        if (item) {
            id = item['ID'];
            status = item['STATUS_ID'] || 1;
            if (status >= 23) {
                status = 23;
            }
        }
        let tab = MODEL_LIBRARY_TABS.filter(e => e.status == status)[0];
        this.router.navigate([tab.value, { id: id }], { skipLocationChange: true });
    }

    ngOnInit() {
        this.getModelDataList('ON_LOAD');
    }
    cardClickFunction(status) {
        this.cardActive = status;
        this.createFilter = {
            SEARCH_STR: [''],
            STATUS: [],
            CREATED_DATE: []
        };
        this.filtersApplied = false;
        if (status != 'ALL') {
            this.filtersApplied = true;
            if (status == this.scenarioUnderReviewStatus) {
                this.createFilter['STATUS'] = [status, this.modelInApprovalStatus];
            } else {
                this.createFilter['STATUS'] = [status];
            }
        }
        this.getModelDataList('FILTERS');
    }

    resetFilters() {
        this.filtersApplied = false;
        this.filterIcon = false;
        this.cardActive = 'ALL';
        this.createFilter = {
            SEARCH_STR: [''],
            STATUS: [],
            CREATED_DATE: []
        };
        this.getModelDataList('FILTERS');
    }

    filterCheckboxChange(event, filter, value) {
        this.filtersApplied = false;
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

        this.getModelDataList('FILTERS');
    }
    getModelDataList(type) {
        this.modelService.getModelDataList(this.createFilter).subscribe(
            response => {
                this.records = response['MODEL_RECORDS'];
                this.filters = response['MODEL_FILTERS'];
                if ('ON_LOAD' == type) {
                    this.modelCreated = this.records.length;
                    this.modelInProgress = this.records.filter(p => p['STATUS'] == this.modelInProgressStatus).length || 0;
                    this.modelUnderReview =
                        this.records.filter(p => p['STATUS'] == this.modelUnderReviewStatus || p['STATUS'] == this.modelInApprovalStatus)
                            .length || 0;
                    this.modelRejected = this.records.filter(p => p['STATUS'] == this.modelRejectedStatus).length || 0;
                    this.modelCompleted = this.records.filter(p => p['STATUS'] == this.modelCompletedStatus).length || 0;
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

    modelObj = null;
    openDeleteDataModal(obj) {
        this.modalService.open(this.deleteDataModal, {});
        this.modelObj = {
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
                this.modelService.getModelDetails(record['ID']).subscribe(
                    response => {
                        record['SET_INDEP_COUNT'] = response['SET_INDEP_COUNT'] || 0;
                        record['SET_DEP_COUNT'] = response['SET_DEP_COUNT'] || 0;
                        record['DESIGNERS'] = response['DESIGNERS'] || [];
                        record['BUSINESS_USERS'] = response['BUSINESS_USERS'] || [];
                        record['COLLAPSED'] = !record['COLLAPSED'];
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

    deleteModel() {
        if (this.modelObj != null) {
            this.modelService.deleteModel(this.modelObj).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Model deleted successfully.');
                    this.cancel();
                    this.getModelDataList('ON_LOAD');
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
}
