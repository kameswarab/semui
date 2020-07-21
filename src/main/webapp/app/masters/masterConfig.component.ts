import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { MasterService } from 'app/masters/master.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { PagerService } from 'app/pager.service';

@Component({
    selector: 'jhi-masters-config',
    templateUrl: './masterConfig.component.html',
    styleUrls: ['master.css']
})
export class MasterConfigComponent implements OnInit {
    account: Account;
    pageSize = 10;
    filter = {
        filterDescrption: null,
        arguments: [],
        pageIndex: 1,
        pageSize: this.pageSize,
        sorts: [],
        masterId: null,
        filterModels: {},
        sortMap: {}
    };

    totalSize = 0;

    displayFailureMessage: string;
    isFailure = false;
    masterId = 0;
    displaySuccessMessage: string;
    isSuccess = false;
    headerList = [];
    records = [];
    columns = [];

    masterConfigDataTemp = {
        masterId: 0,
        masterTName: null,
        masterTableDisplayName: null,
        workflowReq: 'N',
        approvalReqBy: null,
        preAppMasterTName: null,
        mappingJSON: null
    };

    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    pager = {
        totalItems: null,
        currentPage: null,
        pageSize: null,
        totalPages: null,
        startPage: null,
        endPage: null,
        startIndex: null,
        endIndex: null,
        pages: null
    };
    pageNo = 1;

    constructor(
        private masterService: MasterService,
        private modalService: NgbModal,
        private router: Router,
        private pagerService: PagerService
    ) {}

    ngOnInit() {
        /* this.accountService.identity().then((account: Account) => {
            this.account = account;
        }); */
        this.getMasterConfigData();
    }

    getPageSizeDropdown() {
        let pageList = [];
        let pageSizeTemp = 0;
        for (let i = 1; i <= 5; i++) {
            pageSizeTemp += this.pageSize;
            pageList.push(pageSizeTemp);
        }
        return pageList;
    }

    getPageDropdown() {
        let pageList = [];
        let pages = this.totalSize / this.filter.pageSize;
        if (this.totalSize % this.filter.pageSize != 0) {
            pages = pages + 1;
        }
        for (let i = 1; i <= pages; i++) {
            pageList.push(i);
        }
        return pageList;
    }

    updateSortDataMap(column, value, btnValue) {
        if (value == '') {
            value = btnValue;
        } else if (value == 'DESC') {
            value = 'ASC';
        } else {
            value = 'DESC';
        }

        this.filter.sortMap[column] = value;

        let sortsMap = this.filter.sorts;

        let sortsMapTemp = [];

        sortsMapTemp.push({ columnName: column, sort: value });

        for (let i = 0; i < sortsMap.length; i++) {
            let sortsTemp = sortsMap[i];
            if (sortsTemp.columnName != column) {
                sortsMapTemp.push(sortsTemp);
            }
        }
        this.filter.sorts = sortsMapTemp;

        this.getMasterConfigData();
    }

    updateFilterDataMap(column, event) {
        let value = event.target.value;
        let filterMap = this.filter.arguments;

        let filterMapTemp = [];

        if (value && value != '') {
            filterMapTemp.push({ columnName: column, filterControlValue: value });
        }
        for (let i = 0; i < filterMap.length; i++) {
            let filterTemp = filterMap[i];
            if (filterTemp.columnName != column) {
                filterMapTemp.push(filterTemp);
            }
        }
        this.filter.arguments = filterMapTemp;

        this.getMasterConfigData();
    }

    getMasterDataByPage(pageId) {
        this.filter.pageIndex = pageId;
        this.filter.pageSize = 10;
        this.pageNo = pageId;
        this.getMasterConfigData();
    }

    getMasterConfigData() {
        this.masterService.getMasterConfigData(this.filter).subscribe(
            response => {
                this.headerList = [];
                this.records = [];
                this.columns = [];

                this.headerList = response['HEADERS'];
                this.columns = response['COLUMNS'];
                this.records = response['RECORDS'];
                this.totalSize = response['TOTALRECORDS'];

                if (Object.keys(this.filter.sortMap).length == 0) {
                    for (let i = 0; i < this.columns.length; i++) {
                        this.filter.sortMap[this.columns[i]] = '';
                    }
                }
                this.setPage(this.pageNo);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    deleteMasterConfigData() {
        if (this.masterId) {
            this.masterService.deleteMasterConfigData(this.masterId).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Data deleted successfully.');
                    this.getMasterConfigData();
                    this.cancel();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    navigateTo(data) {
        let obj = {
            masterId: data['ID'],
            masterTName: data['MASTER_TABLE_NAME'],
            masterTableDisplayName: data['MASTER_DISPLAY_NAME'],
            workflowReq: data['IS_WORKFLOW_REQ'],
            approvalReqBy: data['PRE_APPROVED_MASTER_TABLE_NAME'],
            preAppMasterTName: data['APPROVAL_REQ_BY'],
            mappingJSON: data['MASTER_MAPPING_JSON']
        };
        this.navigateToConfigure(obj);
    }
    navigateToConfigure(data) {
        this.router.navigate(['dataUtility/masterConfig/masterConfigData', data], { skipLocationChange: true });
    }

    openDeleteDataModal(id) {
        this.modalService.open(this.deleteDataModal, {});
        this.masterId = id;
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

    isAuthenticated() {
        /*  return this.accountService.isAuthenticated(); */
    }

    login() {
        /*  this.loginService.login(); */
    }

    setPage(page) {
        // get pager object from service
        this.pager = this.pagerService.getPager(this.totalSize, page);

        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        // get current page of items
        if (this.pageNo == 1) {
            this.records = this.records.slice(this.pager.startIndex, this.pager.endIndex + 1);
        }
    }
}
