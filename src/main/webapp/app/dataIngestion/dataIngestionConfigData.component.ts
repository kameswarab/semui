import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { DataIngestionService } from 'app/dataIngestion/dataIngestion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import { JsonPipe } from '@angular/common';
import { ALERT_MSG_TIME_OUT } from 'app/constants';

@Component({
    selector: 'dataIngestion-config-data',
    templateUrl: './dataIngestionConfigData.component.html',
    styleUrls: []
})
export class DataIngestionConfigDataComponent implements OnInit {
    //jokes: Object[];
    len: number = 1;
    configId: number;
    isUpdate = false;
    tableList = [];
    configName: string;
    account: Account;
    displayFailureMessage: string;
    isFailure = false;
    masterId = '0';
    displaySuccessMessage: string;
    isSuccess = false;
    templateFileName: string;

    masterConfigData = {
        configName: null,
        masterConfigList: null,
        templateFileName: null
    };
    configDto = {
        tableName: null,
        columnConfigurationInfo: []
    };
    configdtoTmp = {
        tableColumn: null,
        discription: null,
        isMappingRequired: null,
        masterTable: null,
        masterIdColumn: null,
        masterNameColumn: null,
        isMasterInsertionRequired: null,
        isValidationRequired: null,
        isNotNullRequired: null,
        isUniqueRequired: null,
        isInsertionUniqueCheck: null,
        isDataInDateFormat: null
    };
    columnTemp = {};
    masterConfigList = [];
    masterTableList = [];
    masterTableColumnList = [];
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    masterIdColumnList = [];
    masterNameColumnList = [];
    columnList = [];
    columnDataList = [];
    columnDataTmpList = [];
    configNameList = [];
    tempData = [];

    constructor(
        private masterService: DataIngestionService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.masterService.getAllTables().subscribe(
            response => {
                this.tableList = response;
            },
            errorResponse => {
                this.showErrorValidations(true, errorResponse.error);
            }
        );
        this.masterService.getAllMasterTables().subscribe(
            response => {
                this.masterTableList = response;
            },
            errorResponse => {
                this.showErrorValidations(true, errorResponse.error);
            }
        );
        this.masterService.getAllConfigNames().subscribe(
            response => {
                this.configNameList = response;
            },
            errorResponse => {
                this.showErrorValidations(true, errorResponse.error);
            }
        );
    }

    ngOnInit() {
        //this.configDto.columnData.push(this.configdtoTmp);
        if (this.route.snapshot.params.configId) {
            this.isUpdate = true;
            this.configId = this.route.snapshot.params.configId;
            this.configName = this.route.snapshot.params.configName;
            this.templateFileName = this.route.snapshot.params.templateFileName;
            this.masterService.getDataById(this.configId).subscribe(
                response => {
                    for (let index = 0; index < response.length; index++) {
                        this.tempData = response[index];
                        this.emptyConfigDto();
                        this.configDto.tableName = this.tempData[0];
                        this.configDto.columnConfigurationInfo = JSON.parse(this.tempData[1]);
                        this.masterConfigList[index] = this.configDto;
                    }
                },
                errorResponse => {
                    this.showErrorValidations(true, errorResponse.error);
                }
            );
        } else {
            this.emptyConfigDto();
            this.configDto.columnConfigurationInfo = [];
            this.masterConfigList.push(this.configDto);
        }
    }

    onMasterOptionSelected(j: number, masterTable) {
        this.masterService.getAllColumns(masterTable).subscribe(response => {
            this.masterNameColumnList = [];
            this.masterTableColumnList = response;
        });
    }

    emptyConfigDto() {
        this.configDto = { tableName: null, columnConfigurationInfo: [] };
    }
    emptyConfigdtoTmp() {
        this.configdtoTmp = {
            tableColumn: null,
            discription: null,
            isMappingRequired: null,
            masterTable: null,
            masterIdColumn: null,
            masterNameColumn: null,
            isMasterInsertionRequired: null,
            isValidationRequired: null,
            isNotNullRequired: null,
            isUniqueRequired: null,
            isInsertionUniqueCheck: null,
            isDataInDateFormat: null
        };
    }
    onOptionsSelected(j: number, selectedTableName) {
        //this.masterConfigList[j] = [];
        this.masterService.getAllColumns(selectedTableName).subscribe(
            response => {
                this.columnList = response;
                this.configDto.tableName = selectedTableName;
                for (var i = 0; i < this.columnList.length; i++) {
                    this.configdtoTmp.tableColumn = this.columnList[i];
                    this.configdtoTmp.discription = ' ';
                    this.configdtoTmp.isMappingRequired = 'No';
                    this.configdtoTmp.masterTable = ' ';
                    this.configdtoTmp.masterIdColumn = ' ';
                    this.configdtoTmp.masterNameColumn = ' ';
                    this.configdtoTmp.isMasterInsertionRequired = 'No';
                    this.configdtoTmp.isValidationRequired = 'No';
                    this.configdtoTmp.isNotNullRequired = 'No';
                    this.configdtoTmp.isUniqueRequired = 'No';
                    this.configdtoTmp.isInsertionUniqueCheck = 'No';
                    this.configdtoTmp.isDataInDateFormat = 'No';
                    this.columnDataList[i] = this.configdtoTmp;
                    this.emptyConfigdtoTmp();
                }
                // this.masterConfigData.masterConfigList[j] = this.configDto;
                this.columnDataTmpList[j] = [];
                this.columnDataTmpList[j] = this.columnDataList;
                this.configDto.columnConfigurationInfo = [];
                this.configDto.columnConfigurationInfo[0] = this.columnDataList[0];
                this.masterConfigList[j] = this.configDto;
                this.columnDataList = [];
                this.columnList = [];
                this.emptyConfigDto();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    handleChange(i, j) {
        if (this.masterConfigList[j].columnConfigurationInfo[i].masterTable != null) {
            this.masterConfigList[j].columnConfigurationInfo[i].masterTable = null;
        }
        if (this.masterConfigList[j].columnConfigurationInfo[i].masterIdColumn != null) {
            this.masterConfigList[j].columnConfigurationInfo[i].masterIdColumn = null;
        }
        if (this.masterConfigList[j].columnConfigurationInfo[i].masterNameColumn != null) {
            this.masterConfigList[j].columnConfigurationInfo[i].masterNameColumn = null;
        }
        if (this.masterConfigList[j].columnConfigurationInfo[i].isMasterInsertionRequired != 'No') {
            this.masterConfigList[j].columnConfigurationInfo[i].isMasterInsertionRequired = 'No';
        }
    }

    saveConfigDataMethod() {
        if (confirm('Are you sure to Save ??') && this.configName != null && this.templateFileName != null) {
            this.masterConfigData.configName = this.configName;
            this.masterConfigData.templateFileName = this.templateFileName;
            for (let index = 0; index < this.configNameList.length; index++) {
                if (this.configName == this.configNameList[index]) {
                    this.isFailure = true;
                    break;
                }
            }
            if (this.isFailure && !this.isUpdate) {
                this.showErrorValidations(true, 'Config Name Already exists! :' + this.configName);
            }
            if (!this.isFailure && !this.isUpdate) {
                this.masterConfigData.masterConfigList = this.masterConfigList;
                this.masterService.saveMasterConfigData(this.masterConfigData).subscribe(
                    response => {
                        this.router.navigate(['dataIngestionConfig', {}], { skipLocationChange: true });
                    },
                    errorResponse => {
                        this.showErrorValidations(true, errorResponse.error);
                    }
                );
            }
            if (this.isFailure && this.isUpdate) {
                this.masterConfigData.masterConfigList = this.masterConfigList;
                this.masterService.updateConfigData(this.masterConfigData, this.configId).subscribe(
                    response => {
                        this.router.navigate(['dataIngestionConfig', {}], { skipLocationChange: true });
                    },
                    errorResponse => {
                        this.showErrorValidations(true, errorResponse.error);
                    }
                );
            }
        } else {
            this.showErrorValidations(true, 'Enter Config Name! ');
        }
    }

    addColumn() {
        this.emptyConfigDto();
        this.masterConfigList.push(Object.assign({}, this.configDto));
    }

    deleteColumn(index) {
        this.masterConfigList.splice(index, 1);
    }

    addColumnData(j, i) {
        if (i < this.columnDataTmpList[j].length - 1 && this.columnDataTmpList[j][i + 1] != null) {
            this.columnTemp = this.columnDataTmpList[j][i + 1];
            this.masterConfigList[j].columnConfigurationInfo[i + 1] = this.columnTemp;
            this.columnTemp = {};
        } else {
            this.showErrorValidations(true, 'No more columns in this table! ');
        }
    }

    deleteColumnData(j, i) {
        this.masterConfigList[j].columnConfigurationInfo.splice(i, 1);
        //var len = this.columnDataTmpList[j].length;
        for (let index = i; index < this.columnDataTmpList[j].length - this.len; index++) {
            this.columnDataTmpList[j][index] = this.columnDataTmpList[j][index + 1];
        }
        this.columnDataTmpList[j][this.columnDataTmpList[j].length - this.len] = null;
        this.len++;
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
