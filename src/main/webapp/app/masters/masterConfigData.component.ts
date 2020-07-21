import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { MasterService } from 'app/masters/master.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import { ALERT_MSG_TIME_OUT } from 'app/constants';

@Component({
    selector: 'masters-config-data',
    templateUrl: './masterConfigData.component.html',
    styleUrls: ['master.css']
})
export class MasterConfigDataComponent implements OnInit {
    account: Account;
    displayFailureMessage: string;
    isFailure = false;
    masterId = '0';
    displaySuccessMessage: string;
    isSuccess = false;
    masterConfigData = {
        masterId: 0,
        masterTName: null,
        masterTableDisplayName: null,
        workflowReq: false,
        approvalReqBy: 'NA',
        preAppMasterTName: 'NA',
        mappingJSON: null,
        masterConfigList: []
    };
    configDto = {
        columnName: null,
        displayColumnName: null,
        columnType: null,
        selectTableReference: '',
        dupRecordCanExist: false,
        filterEnabled: true,
        sortEnabled: true,
        displayRefColumnName: '',
        saveRefColumnName: '',
        required: true,
        referenceTableColumnList: []
    };
    masterConfigList = [];

    filteredMasterTableList = [];
    masterTableList = [];
    roleList = [];
    columnList = [];
    columnTypeList = [];
    searchInputVal = '';
    searchclr = true;
    constructor(
        private masterService: MasterService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        /* this.accountService.identity().then((account: Account) => {
            this.account = account;
        }); */
        this.masterConfigData.masterId = this.route.snapshot.params.masterId;
        this.searchInputVal = this.route.snapshot.params.searchInputVal;

        if (this.masterConfigData.masterId != 0) {
            this.masterConfigData.masterTName = this.route.snapshot.params.masterTName;
            this.masterConfigData.masterTableDisplayName = this.route.snapshot.params.masterTableDisplayName;
            this.masterConfigData.approvalReqBy = this.route.snapshot.params.approvalReqBy;
            this.masterConfigData.preAppMasterTName = this.route.snapshot.params.preAppMasterTName;
            this.masterConfigData.mappingJSON = this.route.snapshot.params.mappingJSON;

            if (this.route.snapshot.params.workflowReq == 'Y') {
                this.masterConfigData.workflowReq = true;
            } else {
                this.masterConfigData.workflowReq = false;
            }

            if (this.masterConfigData.mappingJSON) {
                const mappingJSON = JSON.parse(this.masterConfigData.mappingJSON);
                mappingJSON.forEach((element, index) => {
                    if (element.dupRecordCanExist == 'Y') {
                        mappingJSON[index].dupRecordCanExist = true;
                    } else {
                        mappingJSON[index].dupRecordCanExist = false;
                    }
                    if (element.filterEnabled == 'Y') {
                        mappingJSON[index].filterEnabled = true;
                    } else {
                        mappingJSON[index].filterEnabled = false;
                    }
                    if (element.sortEnabled == 'Y') {
                        mappingJSON[index].sortEnabled = true;
                    } else {
                        mappingJSON[index].sortEnabled = false;
                    }
                    if (element.required == 'Y') {
                        mappingJSON[index].required = true;
                    } else {
                        mappingJSON[index].required = false;
                    }
                });

                this.masterConfigData.masterConfigList = mappingJSON;
                this.masterConfigList = mappingJSON;
            } else {
                this.masterConfigList.push(Object.assign({}, this.configDto));
            }

            this.getColumnList();
        } else {
            this.masterConfigList.push(Object.assign({}, this.configDto));
        }

        if (this.searchInputVal == null || this.searchInputVal == undefined) {
            this.searchInputVal = 'default';
            this.getMasterDataForConfig();
        }
    }

    getMasterDataForConfig() {
        let searchValue = this.searchInputVal;
        if (searchValue == '' || searchValue == null) {
            this.showErrorValidations(true, 'Please provide value in Search Table.');
            return false;
        }
        this.masterService.getMasterDataForConfig(searchValue).subscribe(
            response => {
                this.filteredMasterTableList = response['FILTERED_MASTER_TABLES'];
                this.masterTableList = response['ALL_MASTER_TABLE'];
                this.roleList = response['ROLE_MASTER'];
                this.columnTypeList = response['COLUMN_TYPE_MASTER'];
                if (this.searchInputVal == 'default') {
                    this.searchInputVal = null;
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getRefColumnList(dto) {
        if (dto.columnType == 'select' && dto.selectTableReference) {
            this.masterService.getColumnList(dto.selectTableReference).subscribe(
                response => {
                    dto.referenceTableColumnList = response['COLUMNS'];
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }

    getColumnList() {
        const tableName = this.masterConfigData.masterTName;

        this.masterService.getColumnList(tableName).subscribe(
            response => {
                this.columnList = response['COLUMNS'];
                if (!this.masterConfigList || this.masterConfigList.length == 0) {
                    this.masterConfigList = [];
                    this.addColumn();
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    addColumn() {
        this.masterConfigList.push(Object.assign({}, this.configDto));
    }

    deleteColumn(index) {
        this.masterConfigList.splice(index, 1);
    }

    saveMasterConfigData() {
        /*workflow check */
        if (this.masterConfigData.workflowReq) {
            if (
                !this.masterConfigData.preAppMasterTName ||
                'null' == this.masterConfigData.preAppMasterTName ||
                null == this.masterConfigData.preAppMasterTName ||
                '' == this.masterConfigData.preAppMasterTName
            ) {
                this.showErrorValidations(true, 'Please select Pre approved table name.');
                return false;
            } else if (
                !this.masterConfigData.approvalReqBy ||
                null == this.masterConfigData.approvalReqBy ||
                'null' == this.masterConfigData.approvalReqBy ||
                '' == this.masterConfigData.approvalReqBy
            ) {
                this.showErrorValidations(true, 'Please select Approval by.');
                return false;
            }
        } else {
            this.masterConfigData.preAppMasterTName = 'NA';
            this.masterConfigData.approvalReqBy = 'NA';
        }

        /*columns check */
        if (this.masterConfigList && this.masterConfigList.length > 0) {
            const pkDtoList = this.masterConfigList.filter(configDto => configDto.columnType === 'pk');
            if (!pkDtoList || pkDtoList.length != 1) {
                this.showErrorValidations(true, 'There should be one Primary column.');
                return false;
            }
            const validDtoList = this.masterConfigList.filter(
                configDto =>
                    configDto.columnName !== '' &&
                    configDto.columnName !== null &&
                    configDto.columnName !== 'null' &&
                    configDto.columnType !== 'pk'
            );
            if (!validDtoList || validDtoList.length == 0) {
                this.showErrorValidations(true, 'There should be at least one data column.');
                return false;
            }

            let pkDto = pkDtoList[0];

            let dupPKColumnList = validDtoList.filter(e => e.columnName == pkDto.columnName);
            if (dupPKColumnList && dupPKColumnList.length > 0) {
                this.showErrorValidations(true, 'Primary key column should not be there as data column.');
                return false;
            }

            const objectToCheckDuplicates = [];

            let isError = false;

            for (let index = 0; index < validDtoList.length; index++) {
                let configDto = validDtoList[index];

                if (!configDto.columnType || '' == configDto.columnType || 'null' == configDto.columnType || null == configDto.columnType) {
                    this.showErrorValidations(true, 'Please select column type for column :' + configDto.columnName);
                    isError = true;
                    return false;
                } else if (
                    !configDto.displayColumnName ||
                    '' == configDto.displayColumnName ||
                    'null' == configDto.displayColumnName ||
                    null == configDto.displayColumnName
                ) {
                    this.showErrorValidations(true, 'Please select display column name for column :' + configDto.columnName);
                    isError = true;
                    return false;
                } else if (
                    configDto.columnType == 'select' &&
                    (!configDto.selectTableReference ||
                        '' == configDto.selectTableReference ||
                        'null' == configDto.selectTableReference ||
                        null == configDto.selectTableReference ||
                        !configDto.saveRefColumnName ||
                        '' == configDto.saveRefColumnName ||
                        'null' == configDto.saveRefColumnName ||
                        null == configDto.saveRefColumnName ||
                        !configDto.displayColumnName ||
                        '' == configDto.displayColumnName ||
                        'null' == configDto.displayColumnName ||
                        null == configDto.displayColumnName)
                ) {
                    this.showErrorValidations(true, 'Please select reference table and columns for column :' + configDto.columnName);
                    isError = true;
                    return false;
                } else if (configDto.columnType != 'select') {
                    configDto.selectTableReference = '';
                    configDto.saveRefColumnName = '';
                    configDto.displayRefColumnName = '';
                }
                if (objectToCheckDuplicates.indexOf(configDto.columnName) != -1) {
                    this.showErrorValidations(true, 'Please check that selected duplicate column for :' + configDto.columnName);
                    isError = true;
                } else {
                    objectToCheckDuplicates.push(configDto.columnName);
                }
            }

            if (isError) {
                return false;
            }

            validDtoList.push(pkDtoList[0]);

            this.masterConfigData.masterConfigList = validDtoList;

            let masterConfigDataNew = new Object();
            masterConfigDataNew = Object.assign(this.masterConfigData, {});
            if (masterConfigDataNew['workflowReq']) {
                masterConfigDataNew['workflowReq'] = 'Y';
            } else {
                masterConfigDataNew['workflowReq'] = 'N';
            }
            let masterConfigList = masterConfigDataNew['masterConfigList'];
            masterConfigList.forEach((element, index) => {
                if (element.dupRecordCanExist) {
                    masterConfigList[index].dupRecordCanExist = 'Y';
                } else {
                    masterConfigList[index].dupRecordCanExist = 'N';
                }
                if (element.filterEnabled) {
                    masterConfigList[index].filterEnabled = 'Y';
                } else {
                    masterConfigList[index].filterEnabled = 'N';
                }
                if (element.sortEnabled) {
                    masterConfigList[index].sortEnabled = 'Y';
                } else {
                    masterConfigList[index].sortEnabled = 'N';
                }
                if (element.required) {
                    masterConfigList[index].required = 'Y';
                } else {
                    masterConfigList[index].required = 'N';
                }
            });

            this.masterService.saveMasterConfigData(masterConfigDataNew).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Data saved successfully');
                    this.router.navigate(['dataUtility/masterConfig', {}], { skipLocationChange: true });
                },
                errorResponse => {
                    this.showErrorValidations(true, errorResponse.error);
                }
            );
        } else {
            return false;
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

    isAuthenticated() {
        /*  return this.accountService.isAuthenticated(); */
    }

    login() {
        /*  this.loginService.login(); */
    }
    navigateTo(path) {
        this.router.navigate([path]);
    }
    discard() {
        this.navigateTo('dataUtility/masterConfig');
    }
    expand() {
        this.searchclr = !this.searchclr;
    }
}
