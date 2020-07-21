import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { MasterService } from 'app/masters/master.service';
import { KeycloakService } from 'keycloak-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { PagerService } from 'app/pager.service';

@Component({
    selector: 'jhi-masters',
    templateUrl: './master.component.html',
    styleUrls: ['./master.css']
})
export class MasterComponent implements OnInit {
    @ViewChild('listingTabDiv')
    listingTabDiv: ElementRef;
    @ViewChild('createOrUpdateModal')
    createOrUpdateModal: ElementRef;
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    @ViewChild('deleteMultipleDataModal')
    deleteMultipleDataModal: ElementRef;
    @ViewChild('approveOrRejectDataModal')
    approveOrRejectDataModal: ElementRef;
    @ViewChild('seqOrderChangeModal')
    seqOrderChangeModal: ElementRef;
    @ViewChild('addDataModal')
    addDataModal: ElementRef;

    isarrow = false;
    masterList = [];
    headerList = [];
    sortList = [];
    filterList = [];
    records = [];
    columns = [];
    account: Account;
    allMastersList = [];
    selectedItem = null;
    operation: boolean;
    updateId: any;
    selectedTab = 'LIST';
    pageSize = 10;
    label: any;

    filter = {
        filterDescrption: null,
        arguments: [],
        pageIndex: 1,
        pageSize: this.pageSize,
        sorts: [],
        masterId: null,
        currentTab: 'LIST',
        filterModels: {},
        sortMap: {}
    };

    totalSize = 0;
    dropdownVal = null;
    error: any;
    wfTab = false;
    record = {};
    approveFlag: any;
    displayFailureMessage: string;
    displaySuccessMessage: string;
    isSuccess = false;
    isFailure = false;
    isEditFailure = false;
    formSubmitAttempt = false;
    changedSeqOrd = [];
    disableButtons = false;
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
    selectMstTable = false;
    selectAllMT = false;
    checkedMTList = [];
    masterDataIds;
    i: any;

    constructor(
        private masterService: MasterService,
        private accountService: AccountService,
        private loginService: LoginService,
        private modalService: NgbModal,
        private pagerService: PagerService
    ) {}

    openCreateOrUpdateModal(modalName) {
        if (this.filter.currentTab == 'LIST') {
            this.getSaveData(this.selectedItem.value);
        }
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

        this.getMasterData();
    }

    updateFilterDataMap(column, event) {
        let value = event.target.value;

        if (value.indexOf("'") !== -1) {
            value = "''";
        }
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
        this.pageNo = 1;
        this.filter.pageIndex = 1;
        this.getMasterData();
    }

    saveMasterData() {
        this.formSubmitAttempt = true;
        let flag = false;
        for (let i = 0; i < this.masterList.length; i++) {
            let column = this.masterList[i];
            if ('Y' == column.required && (column.columnValue == null || ((column.columnValue || '') + '').trim().length === 0)) {
                flag = true;
                break;
            }
            column.columnValue = ((column.columnValue || '') + '').trim();
        }
        if (flag) {
            return false;
        }
        const masterDto = {};
        masterDto['masterId'] = parseInt(this.selectedItem.value);
        masterDto['masterConfigList'] = this.masterList;

        this.masterService.saveMasterData(masterDto).subscribe(
            response => {
                this.showSuccessValidations(true, 'Data saved successfully.');
                this.navigateToTab(this.filter.currentTab);
                this.cancel();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    updateMasterData() {
        this.formSubmitAttempt = true;
        let flag = false;
        for (let i = 0; i < this.masterList.length; i++) {
            let column = this.masterList[i];
            if ('Y' == column.required && (column.columnValue == null || ((column.columnValue || '') + '').trim().length === 0)) {
                flag = true;
                break;
            }
            column.columnValue = ((column.columnValue || '') + '').trim();
        }
        if (flag) {
            return false;
        }
        if (this.masterList && this.masterList.length > 0) {
            const masterDto = {};
            masterDto['masterId'] = parseInt(this.selectedItem.value);
            masterDto['masterDataId'] = parseInt(this.updateId);
            masterDto['masterConfigList'] = this.masterList;

            this.masterService.updateMasterData(masterDto).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Data updated successfully.');
                    this.navigateToTab(this.filter.currentTab);
                    this.cancel();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    deleteMasterData() {
        if (this.updateId) {
            const send = {};
            send['masterId'] = parseInt(this.selectedItem.value);
            send['masterDataId'] = parseInt(this.updateId); /// id[0];
            this.masterService.deleteMasterData(send).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Data deleted successfully.');
                    this.navigateToTab(this.filter.currentTab);
                    this.cancel();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                    this.cancel();
                }
            );
        }
    }

    deleteMultipleMasterData() {
        if (this.masterDataIds) {
            let obj = {
                masterId: this.selectedItem.value + '',
                masterDataIds: this.masterDataIds
            };
            this.masterService.deleteMultipleMasterData(obj).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Data deleted successfully.');
                    this.navigateToTab(this.filter.currentTab);
                    this.cancel();
                    this.selectMstTable = true;
                    this.checkedMTList = [];
                    this.selectAllMT = false;
                },
                response => {
                    this.showErrorValidations(true, response.error);
                    this.cancel();
                    this.selectMstTable = true;
                    this.checkedMTList = [];
                    this.selectAllMT = false;
                }
            );
        }
    }

    ngOnInit() {
        this.masterService.getAllMasters().subscribe(response => {
            this.allMastersList = response;
            this.selectedItem = response[4];
            this.selectMstTable = true;
            this.navigateToTab(this.filter.currentTab);
        });

        /* this.accountService.identity().then((account: Account) => {
            this.account = account;

            if(this.account){
                this.masterService.getAllMasters().subscribe((response) => {
                    this.allMastersList = response;
                  });
            }

        }); */
    }

    getList(object) {
        this.pageNo = 1;
        this.disableButtons = false;
        this.selectedItem = object;
        if (this.selectedItem && 'null' != this.selectedItem) {
            if (this.listingTabDiv) {
                this.listingTabDiv.nativeElement.click();
            } else {
                this.navigateToTab(this.filter.currentTab);
            }
        }
    }

    navigateToTab(tab) {
        this.selectedTab = tab;
        let elements = document.getElementsByName('filterInput');

        for (let i = 0; i < elements.length; i++) {
            elements[i]['value'] = '';
        }
        // elements.forEach(ele => {
        //     ele['value'] = '';
        // });

        this.filter = {
            filterDescrption: null,
            arguments: [],
            pageIndex: 1,
            pageSize: this.filter.pageSize,
            sorts: [],
            masterId: null,
            currentTab: tab,
            filterModels: {},
            sortMap: {}
        };
        this.getMasterData();
    }

    getSaveData(id) {
        this.disableButtons = false;

        this.formSubmitAttempt = false;
        this.operation = true;
        this.masterList = [];
        this.masterService.getSaveMaster(id).subscribe(response => {
            this.masterList = response;
            this.openAddDataModal();
        });
    }

    getUpdateData(id) {
        //this.modalService.open(this.createOrUpdateModal, {});

        this.disableButtons = false;

        this.formSubmitAttempt = false;
        this.operation = false;
        this.masterList = [];
        this.updateId = id; // id[0];
        const send = {};
        send['masterId'] = parseInt(this.selectedItem.value);
        send['masterDataId'] = id; // id[0];
        this.masterService.getUpdateMaster(send).subscribe(response => {
            this.masterList = response;
            this.openAddDataModal();
        });
    }

    onCellValueChanged(data, newValue) {
        this.changedSeqOrd = [];
        let oldValue = data['SEQ_ORDER'];
        data['SEQ_ORDER'] = newValue;
        this.modalService.open(this.seqOrderChangeModal).result.then(
            result => {},
            reason => {
                data['SEQ_ORDER'] = oldValue;
            }
        );
        this.changedSeqOrd.push(data);
    }

    openDeleteDataModal(id) {
        this.modalService.open(this.deleteDataModal, {});
        this.updateId = id;
    }

    openMultipleDeleteDataModal(ids) {
        this.modalService.open(this.deleteMultipleDataModal, {});
        this.masterDataIds = ids;
    }

    openAddDataModal() {
        this.modalService.open(this.addDataModal, { size: 'lg', windowClass: 'custom-modal-class' });
    }

    approveRecord() {
        this.masterService.updatePendingApproval(this.record).subscribe(
            response => {
                this.showSuccessValidations(true, response);
                this.navigateToTab('WF');
                this.cancel();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    cancel() {
        this.disableButtons = false;
        this.modalService.dismissAll();
        this.masterList = [];
    }

    approveRec(dataObject) {
        this.modalService.open(this.approveOrRejectDataModal, {});

        this.record = {};
        this.record['dataObject'] = dataObject;
        this.record['masterId'] = parseInt(this.selectedItem.value);
        this.record['approvalStatus'] = 'A';
        this.approveFlag = true;
    }

    rejectRec(dataObject) {
        this.modalService.open(this.approveOrRejectDataModal, {});

        this.record = {};
        this.record['dataObject'] = dataObject;
        this.record['masterId'] = parseInt(this.selectedItem.value);
        this.record['approvalStatus'] = 'R';
        this.approveFlag = false;
    }

    getMasterData() {
        this.filter.masterId = parseInt(this.selectedItem.value);

        this.masterService.findMaster(this.filter).subscribe(
            response => {
                //const userRole = this.keycloakService.isUserInRole('ROLE_ADMIN');

                this.masterList = [];
                this.headerList = [];
                this.sortList = [];
                this.filterList = [];

                this.records = [];
                this.columns = [];
                this.headerList = response['HEADERS'];
                this.columns = response['COLUMNS'];
                this.records = response['RECORDS'];
                this.totalSize = response['TOTALRECORDS'];
                const approvalReqBy = response['approvalReqBy'];
                this.dropdownVal = response['seqOrderList'];
                this.sortList = response['SORTLIST'];
                this.filterList = response['FILTERLIST'];

                if (Object.keys(this.filter.sortMap).length == 0) {
                    for (let i = 0; i < this.columns.length; i++) {
                        this.filter.sortMap[this.columns[i]] = '';
                    }
                }

                this.wfTab = true;
                this.setPage(this.pageNo);

                /*if (userRole && this.userDetails.username !== 'user') {
                    this.wfTab = true;
                } */
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getMasterDataByPage(pageId) {
        this.filter.pageIndex = pageId;
        this.filter.pageSize = 10;
        this.pageNo = pageId;
        this.getMasterData();
    }

    saveSequence() {
        const send = {
            masterId: parseInt(this.selectedItem.value),
            dataObjectList: this.changedSeqOrd
        };

        this.masterService.updateSeqOrder(send).subscribe(
            response => {
                this.showSuccessValidations(true, 'Sequence saved Successfully');
                this.navigateToTab(this.filter.currentTab);
                this.cancel();
            },
            response => this.showErrorValidations(true, response.error)
        );
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
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginService.login();
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

    expand() {
        this.isarrow = !this.isarrow;
        document.getElementById('table_block').removeAttribute('class');
        document.getElementById('table_block').setAttribute('class', 'col-md-9');
    }
    expand2() {
        this.isarrow = !this.isarrow;
        document.getElementById('table_block').removeAttribute('class');
        document.getElementById('table_block').setAttribute('class', 'col-md-12');
    }

    selectMT(event, id) {
        if (event.target.checked) {
            this.checkedMTList.push(id);
            if (this.checkedMTList.length == this.records.length) {
                this.selectAllMT = true;
            }
            this.selectMstTable = true;
        } else {
            const checkedMTList = this.checkedMTList.filter(element => {
                return element != id;
            });
            this.checkedMTList = checkedMTList;
            this.selectAllMT = false;
        }
    }

    selectAllChange(event) {
        if (event.target.checked) {
            this.selectAllMT = true;
            this.checkedMTList = this.records.map(p => p.ID);
        } else {
            this.selectAllMT = false;
            this.checkedMTList = [];
        }
    }
}
