import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, PAGE_SIZE } from 'app/constants';
import { ModelsService } from '../models.service';
import { PagerService } from 'app/pager.service';

@Component({
    selector: 'upload',
    templateUrl: './upload.component.html',
    styleUrls: []
})
export class UploadComponent implements OnInit {
    records = [];
    recordsSub = [];
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    uploadedZipFileName;
    zipFileData;
    zipFile;
    basePath;
    folderName;
    modelName;
    fileName;
    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };
    pageSize = 10;
    changedTypeList = [];
    modelId;
    status = null;
    filesList = [
        { value: '1', label: 'R script(.R)' },
        { value: '2', label: 'RDS files(.RDS)' },
        { value: '3', label: 'Input format(json, csv)' },
        { value: '4', label: 'Sample Input (csv)' },
        { value: '5', label: 'Main Rscript(.R)' },
        { value: '6', label: 'Sample Input (xlsx)' }
    ];
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    constructor(
        private modelsService: ModelsService,
        private router: Router,
        private pagerService: PagerService,
        private modalService: NgbModal,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.basePath = this.route.snapshot.params.basePath;
        this.folderName = this.route.snapshot.params.folderName;
        this.modelName = this.route.snapshot.params.modelName;
        this.modelId = this.route.snapshot.params.id;
        this.getModelDetailed();
        this.getModelStatus();
    }

    getModelDetailed() {
        const obj = new Object();
        obj['modelId'] = this.modelId;
        obj['basePath'] = this.basePath;
        obj['schemaName'] = 'CRISIL';
        let count = 1;
        this.modelsService.getModelDetailed(obj).subscribe(
            response => {
                console.log(response);
                this.records = response['RECORDS'];
                this.records.forEach(record => {
                    record['srno'] = count++;
                    const fileExt = record['FILE_NAME']
                        .split('.')
                        .pop()
                        .toLowerCase();
                    if (!record['TYPE'] || record['TYPE'] == undefined || record['TYPE'] == null || record['TYPE'] == 'null') {
                        if (fileExt == 'r') {
                            record['TYPE'] = '1';
                        } else if (fileExt == 'rds') {
                            record['TYPE'] = '2';
                        } else if (fileExt == 'json') {
                            record['TYPE'] = '3';
                        } else if (fileExt == 'csv') {
                            record['TYPE'] = '4';
                        } else if (fileExt == 'xlsx') {
                            record['TYPE'] = '6';
                        } else {
                            record['TYPE'] = null;
                        }
                    }
                });
                this.setPage(1);
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
            }
        );
    }

    browseZipFile(event) {
        if (event.target.files.length == 1) {
            const files: FileList = event.target.files;
            this.zipFileData = files.item(0);
            this.uploadedZipFileName = this.zipFileData.name + '';
            const fileNameArry = this.zipFileData.name.split('.');
            if (fileNameArry.length > 1) {
                this.zipFile = fileNameArry[0];
                const filextn = fileNameArry[1];
                if (!('zip' == filextn)) {
                    this.showErrorValidations(true, 'Please choose the proper file to upload. only .zip files are accepted');
                    this.uploadedZipFileName = '';
                    // this.clearDataFeilds();
                    return false;
                }
            }
        } else {
            this.zipFile = '';
        }
    }

    navigatetoModels() {
        this.router.navigate(['Models', {}], { skipLocationChange: true });
    }

    uploadZip() {
        if (this.zipFileData == undefined || !this.zipFileData) {
            this.showErrorValidations(true, 'Please browse and upload the zip file.');
            return false;
        }
        let formData: FormData = new FormData();

        formData.append('file', this.zipFileData);
        formData.append('basePath', this.basePath);
        formData.append('folderName', this.folderName);
        formData.append('modelId', this.modelId);

        this.modelsService.uploadZip(formData).subscribe(
            response => {
                this.showSuccessValidations(true, 'Upload zip files successfull.');
                this.getModelDetailed();
            },
            response => {
                console.log('file upload error :' + response.error);
                const errorMsg = response.error;
                if ('InvalidFile' == errorMsg) {
                    this.showErrorValidations(true, 'Please choose the proper file to upload. only (.zip) files only accepted');
                } else {
                    this.showErrorValidations(true, 'Inernal Server Error. Please check your uploaded File');
                }
            }
        );
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

    setPage(page) {
        let totalSize = this.records.length;
        this.pager = this.pagerService.getPager(totalSize, page, PAGE_SIZE);
        this.recordsSub = [];
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        this.recordsSub = this.records.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    nexttoEditor(path) {
        this.router.navigate(
            [
                path,
                {
                    id: this.modelId,
                    basePath: this.basePath,
                    folderName: this.folderName,
                    modelName: this.modelName
                    /* inputType: record['INPUT_TYPE'],
                    outputType: record['OUTPUT_TYPE'] */
                }
            ],
            { skipLocationChange: true }
        );
    }

    validate() {
        let isEmpty = true;
        const mainFile = this.records.filter(item => item['TYPE'] == '5');
        const inputFormat = this.records.filter(item => item['TYPE'] == '3');
        for (let i = 0; i < this.records.length; i++) {
            if (
                !this.records[i]['TYPE'] ||
                this.records[i]['TYPE'] == undefined ||
                this.records[i]['TYPE'] == null ||
                this.records[i]['TYPE'] == 'null'
            ) {
                this.showErrorValidations(true, 'Please select type for filename: ' + this.records[i]['FILE_NAME']);
                isEmpty = false;
                break;
            } else if (mainFile.length > 1 || mainFile.length < 1) {
                this.showErrorValidations(true, 'Please select main RScript(.R) type for one file');
                isEmpty = false;
                break;
            } else if (inputFormat.length > 1 || inputFormat.length < 1) {
                this.showErrorValidations(true, 'Please select Input format(json, csv) type for one file');
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    }
    saveUploadedFiles(path) {
        if (this.records.length == 0) {
            this.showErrorValidations(true, 'Please upload zip file and continue to next step');
            return false;
        }
        if (!this.validate()) {
            return false;
        }
        let obj = new Object();
        obj['schemaName'] = 'CRISIL';
        obj['modelId'] = this.modelId;
        obj['fileData'] = this.records;
        this.modelsService.changeTypeListdata(obj).subscribe(
            response => {
                this.showSuccessValidations(true, 'Successfully saved changes.');
                this.getModelDetailed();
                this.nexttoEditor(path);
                /*  this.changedTypeList = []; */
            },
            response => {
                this.showErrorValidations(true, 'Inernal Server Error. Please check your uploaded File');
            }
        );
    }

    openDeleteDataModal(record) {
        this.modalService.open(this.deleteDataModal, {});
        this.fileName = record.FILE_NAME;
    }
    deleteFile() {
        let obj = new Object();
        obj['schemaName'] = 'CRISIL';
        obj['modelId'] = this.modelId;
        obj['basePath'] = this.basePath;
        obj['folderName'] = this.folderName;
        obj['fileName'] = this.fileName;
        console.log('delete record', obj);
        this.modelsService.deleteFile(obj).subscribe(
            response => {
                this.modalService.dismissAll();
                this.showSuccessValidations(true, 'Successfully deleted file.');
                this.getModelDetailed();
            },
            response => {
                this.modalService.dismissAll();
                this.showErrorValidations(true, 'Inernal Server Error. Please check');
            }
        );
    }

    /* changeFileType(record) {
        const list = this.changedTypeList.filter(item => item.ID == record.ID);
        if (list.length == 0) {
            this.changedTypeList.push(record);
        }
    } */
    getModelStatus() {
        const obj = new Object();
        obj['schemaName'] = 'CRISIL';
        obj['modelId'] = this.modelId;
        this.modelsService.getModelStatus(obj).subscribe(
            response => {
                this.status = response;
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
            }
        );
    }
}
