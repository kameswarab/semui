import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { FileUploadService } from 'app/fileupload/file-upload.service';
import { Route } from '@angular/compiler/src/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { HttpRequest, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { PAGE_SIZE } from 'app/constants';
import { PagerService } from 'app/pager.service';

@Component({
    selector: 'jhi-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['file-upload.css']
})
export class FileUploadComponent implements OnInit {
    isSuccess: boolean;
    displaySuccessMessage = '';
    isFailure: boolean;
    displayFailureMessage = '';

    account: Account;
    public fileConfigList: any = [];
    public fileConfigListRG: any = [];
    public fileData: File;
    public fileName: string = '';
    public duplicateFileName: boolean;
    public rowData: any = [];
    public fileConfigId: number = 1;
    public fileUploadName: string = '';
    public fileUploadInfo: any = [];
    public showError: boolean = false;
    public errMessage: string = '';
    referenceFileConfigList: any = [];
    referenceFileUploadId: number = 0;
    STATUS_INSERTED: string = 'Inserted';

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
    masterId = 0;
    headerList = [];
    records = [];
    columns = [];
    recordsSub = [];
    recordsSubReg = [];
    masterConfigDataTemp = {
        masterId: 0,
        masterTName: null,
        masterTableDisplayName: null,
        workflowReq: 'N',
        approvalReqBy: null,
        preAppMasterTName: null,
        mappingJSON: null
    };
    uploadedFileName: any;
    dataUpload;
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;

    @ViewChild('fileUpload')
    fileUploadVariable: ElementRef;

    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };

    constructor(
        private accountService: AccountService,
        private fileUploadService: FileUploadService,
        private router: Router,
        private modalService: NgbModal,
        private http: HttpClient,
        private pagerService: PagerService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.dataUpload = this.activatedRoute.snapshot.params.flag;
        this.fileUploadService.getFileConfiguration().subscribe((response: any) => {
            this.fileConfigList = response;
            this.fileConfigListRG = this.fileConfigList;
            this.fileConfigList = this.fileConfigList.filter(p => p.id != 3);
            this.fileConfigListRG = this.fileConfigListRG.filter(p => p.id != 1 && p.id != 2);
        });

        this.accountService.identity().then((account: Account) => {
            this.account = account;
        });

        // this.loadAllFiles();
        this.getMasterConfigData();
    }

    getReferenceFilesData() {
        this.fileUploadService.getRefrenceFileConfiguration(this.fileConfigId).subscribe(
            response => {
                this.referenceFileConfigList = response;
            },
            response => {
                console.log(response.error);
            }
        );
    }

    setPage(page) {
        let recordsList = [];
        this.recordsSub = [];

        if (this.dataUpload == 'marketData') {
            recordsList = this.records.filter(p => p.fileUploadConfigId != 3);
        } else {
            recordsList = this.records.filter(p => p.fileUploadConfigId == 3);
        }
        let totalSize = recordsList.length;
        this.pager = this.pagerService.getPager(totalSize, page, PAGE_SIZE);
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this.recordsSub = recordsList.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    browsFile(event) {
        if (event.target.files.length == 1) {
            let files: FileList = event.target.files;
            this.fileData = files.item(0);
            this.uploadedFileName = this.fileData.name + '';
            let fileNameArry = this.fileData.name.split('.');
            if (fileNameArry.length > 1) {
                this.fileName = fileNameArry[0];
                let filextn = fileNameArry[1];
                if (!('xlsx' == filextn || 'xlx' == filextn || 'xlsm' == filextn)) {
                    this.showErrorValidations(true, 'Please choose the proper file to upload. only .xlsx,.xlx,.xlsm files are accepted');
                    this.uploadedFileName = '';
                    this.clearDataFeilds();
                    return false;
                }
            }

            //this.fileName = this.fileData.name.substring(0, this.fileData.name.indexOf('.xlsx'));
            this.validateFileName();
        } else {
            this.fileName = '';
        }
    }

    validateFileName() {
        this.duplicateFileName = false;

        this.rowData.forEach(row => {
            if (row.name.trim().toUpperCase() == this.fileName.trim().toUpperCase()) {
                this.duplicateFileName = true;
                return false;
            }
        });
    }

    clearDataFeilds() {
        //this.fileConfigList=[];
        //this.fileUploadInfo=[];
        //this.fileUploadVariable.nativeElement.value = '';
        this.fileData = null;
        this.fileUploadName = '';
        this.referenceFileUploadId = 0;
        this.fileConfigId = null;
    }

    downloadDataTypeFile() {
        let validation = false;
        if (null == this.fileConfigId) {
            validation = true;
            this.showErrorValidations(true, 'Please select the data type to download the file');
        }

        if (!validation) {
            let fileName = '';
            if (this.dataUpload == 'marketData') {
                for (let fileConfigObj of this.fileConfigList) {
                    if (fileConfigObj.id === this.fileConfigId) {
                        fileName = fileConfigObj.fileName;
                    }
                }
            } else {
                this.fileConfigId = 3;
                if (this.fileConfigListRG[0].id === this.fileConfigId) {
                    fileName = this.fileConfigListRG[0].fileName;
                }
            }

            console.log(' download filename :', fileName);

            let formdata: FormData = new FormData();
            formdata.append('fileConfigId', this.fileConfigId + '');

            this.fileUploadService.downloadFileAttachement(formdata).subscribe(
                response => {
                    if (response != undefined) {
                        var blob = new Blob([response]);
                        if (window.navigator.msSaveOrOpenBlob) {
                            window.navigator.msSaveOrOpenBlob(blob, fileName + '.xlsx');
                        } else {
                            var objectUrl = window.URL.createObjectURL(blob);
                            var a = document.createElement('a');
                            a.href = objectUrl;
                            a.download = fileName + '.xlsx';
                            a.target = '_blank';
                            a.click();
                            a.remove();
                        }
                    }
                },
                response => {
                    this.showErrorValidations(true, 'Internal server error while downloading the file.');
                }
            );
        }
    }

    upload() {
        console.log(' file upload file config id :' + this.fileConfigId);
        let validation = false;

        /*  if(this.fileUploadName.trim() === ""){
            validation=true;
        } */

        if (null == this.fileConfigId) {
            validation = true;
            this.showErrorValidations(true, 'Please select the data type');
        }

        if (this.fileData == null) {
            validation = true;
            this.showErrorValidations(true, 'Please upload the file');
        }

        /*  if(this.fileName.length == 0 || this.duplicateFileName){
          validation=true;
        } */
        if (this.dataUpload != 'marketData') {
            this.fileConfigId = 3;
        }
        if (!validation) {
            let formData: FormData = new FormData();
            formData.append('file', this.fileData);
            formData.append('fileUploadName', this.fileUploadName);
            formData.append('fileConfigId', this.fileConfigId + '');
            formData.append('referenceFileUploadId', this.referenceFileUploadId + '');

            this.fileUploadService.saveUploadedTemplate(formData).subscribe(
                response => {
                    this.showSuccessValidations(true, 'File uploaded successfully');
                    this.getMasterConfigData();
                    this.clearDataFeilds();
                    this.viewData(response);
                },
                response => {
                    console.log('file upload error :' + response.error);
                    let errorMsg = response.error;
                    if ('InvalidFile' == errorMsg) {
                        this.showErrorValidations(
                            true,
                            'Please choose the proper file to upload. only (.xlsx,.xlx,.xlsm) files are accepted'
                        );
                    } else {
                        this.showErrorValidations(true, 'Inernal Server Error. Please check your uploaded File');
                    }
                    //this.clearDataFeilds();
                }
            );
        }
    }

    viewData(fileInfo) {
        fileInfo['uploadType'] = this.dataUpload;
        console.log('file id', fileInfo.id);
        this.router.navigate(['viewFile', fileInfo], { skipLocationChange: true });
    }

    deleteData(fileInfo) {
        this.fileUploadService.deleteUploadedFile(fileInfo.id).subscribe(
            response => {
                this.showSuccessValidations(true, response);
                this.getMasterConfigData();
            },
            response => {
                console.log(response.error);
                this.showErrorValidations(true, response.error);
            }
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
        }, 10000);
    }

    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isSuccess = false;
        this.isFailure = showMessage;
        document.documentElement.scrollTop = 0;
        this.displayFailureMessage = displayValidationMessage;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, 10000);
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

    getMasterConfigData() {
        this.fileUploadService.getMasterConfigData(this.filter).subscribe(
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
                this.setPage(1);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    deleteMasterConfigData() {
        if (this.masterId) {
            this.fileUploadService.deleteMasterConfigData(this.masterId).subscribe(
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

    openDeleteDataModal(id) {
        this.modalService.open(this.deleteDataModal, {});
        this.masterId = id;
    }

    cancel() {
        this.modalService.dismissAll();
    }
}
