import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { DataIngestionService } from 'app/dataIngestion/dataIngestion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ALERT_MSG_TIME_OUT } from 'app/constants';

@Component({
    selector: 'jhi-dataIngestion-config',
    templateUrl: './dataIngestionConfig.component.html',
    styleUrls: []
})
export class DataIngestionConfigComponent implements OnInit {
    account: Account;
    pageSize = 50;
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
    configId = 0;
    displaySuccessMessage: string;
    isSuccess = false;
    headerList = [];
    records = [];
    columns = [];
    configdata = [];

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

    constructor(private masterService: DataIngestionService, private modalService: NgbModal, private router: Router) {}

    ngOnInit() {
        /* this.accountService.identity().then((account: Account) => {
            this.account = account;
        }); */
        this.getFileConfigData();
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

        this.getFileConfigData();
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

        this.getFileConfigData();
    }

    getFileConfigData() {
        this.masterService.getFileUploadConfigData().subscribe(
            response => {
                this.configdata = response;
                this.headerList = [];
                this.records = [];
                this.columns = [];
                this.headerList = ['ID', 'CONFIG NAME', 'FILE TYPE'];
                this.columns = [0, 1, 2];
                this.records = response;
                this.totalSize = this.configdata.length;

                if (Object.keys(this.filter.sortMap).length == 0) {
                    for (let i = 0; i < this.columns.length; i++) {
                        this.filter.sortMap[this.columns[i]] = '';
                    }
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    deleteFileUploadConfig() {
        if (this.configId) {
            this.masterService.deleteFileUploadConfig(this.configId).subscribe(
                response => {
                    // this.showSuccessValidations(true, 'Data deleted successfully.');
                    this.getFileConfigData();
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
            configId: data[0],
            configName: data[1],
            fileType: data[2],
            templateFileName: data[3]
        };
        this.navigateToConfigure(obj);
    }
    navigateToConfigure(data) {
        this.router.navigate(['dataIngestionConfigData', data], { skipLocationChange: true });
    }

    openDeleteDataModal(id) {
        this.modalService.open(this.deleteDataModal, {});
        this.configId = id;
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
}
