import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as GC from '@grapecity/spread-sheets';
import { FileUploadService } from 'app/fileupload/file-upload.service';
import { forEach } from '@angular/router/src/utils/collection';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-view-file',
    templateUrl: './view-file.component.html',
    styleUrls: ['../file-upload.css']
})
export class ViewFileComponent implements OnInit {
    account: Account;
    spread: any;
    sheet: any;

    spread1: any;
    sheet1: any;

    isSuccess: boolean;
    displaySuccessMessage = '';
    isFailure: boolean;
    displayFailureMessage = '';
    dataPosition = 'column';
    columnsData = [];
    fileId: Number;
    fileConfigId: Number;
    fileName: '';

    activeRowCount: any;
    activeColumnCount: any;
    validationMessages: any;
    validationResult: any;
    insertColumnValidationMessages: any;
    styles: any;
    previousValidationResult: any;
    insertData: boolean;
    validateData: boolean;
    status: string;
    isInsertableColumn: boolean;
    headerList: any;
    insertableSheetData: any;
    validationWaringMsg: any;
    uploadType = '';
    @ViewChild('ValidationDataModal')
    ValidationDataModal: ElementRef;
    rowOrColumnList = [{ label: 'column' }, { label: 'row' }];
    constructor(
        private accountService: AccountService,
        private fileUploadService: FileUploadService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router
    ) {}

    ngOnInit() {
        this.fileId = this.activatedRoute.snapshot.params.id;
        this.fileConfigId = this.activatedRoute.snapshot.params.fileUploadConfigId;
        this.status = this.activatedRoute.snapshot.params.status;
        this.fileName = this.activatedRoute.snapshot.params.fileName;
        this.uploadType = this.activatedRoute.snapshot.params.uploadType;
        if (this.status === 'File saved to server') {
            this.insertData = false;
            this.validateData = true;
        } else {
            this.insertData = false;
            this.validateData = false;
        }

        /* this.accountService.identity().then((account: Account) => {
            this.account = account;
        }); */

        this.columnsData = [];

        let data = {
            fileId: this.fileId,
            fileConfigId: this.fileConfigId
        };
        // this.validateData=true;
        this.fileUploadService.getFileUploadFinalDataTableColumnConfiguration(data).subscribe(
            response => {
                this.columnsData = response;
            },
            response => {
                console.log(response.error);
            }
        );

        this.spread = new GC.Spread.Sheets.Workbook(document.getElementById('viewFileData'));
        this.sheet = this.spread.getSheet(0);
        this.styles = this.sheet.getDefaultStyle();

        this.fileUploadService.getFileUploadInView(this.fileId).subscribe(
            response => {
                //let fileData = JSON.parse(response.fileData);
                let fileData = response;
                this.showDataInSpreadSheet(fileData);
            },
            response => {
                console.log(response.error);
            }
        );
    }

    showDataInSpreadSheet(fileData) {
        this.sheet.suspendPaint();

        this.headerList = fileData[0];
        let rowSize = fileData.length;
        this.activeRowCount = fileData.length;
        this.activeColumnCount = this.headerList.length;

        this.sheet.setColumnCount(this.headerList.length);
        this.sheet.setRowCount(rowSize);
        this.sheet.setArray(0, 0, fileData);
        this.sheet.getRange(0, 0, 1, this.headerList.length).backColor('#5296c4');
        this.sheet.frozenRowCount(1);

        for (let column = 0; column < this.headerList.length; column++) {
            //this.sheet.setValue(0,column,this.headerList[column],GC.Spread.Sheets.SheetArea.colHeader);
            this.sheet.setColumnWidth(column, 150);
        }

        this.sheet.resumePaint();
    }

    validateFile() {
        this.insertData = false;
        this.validationMessages = [];
        let activeSheet = this.spread.getActiveSheet();
        let sheetData = activeSheet.getArray(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount());
        if (sheetData.length == 0) {
            this.showErrorValidations(true, 'uploaded file should have data. please check');
            return false;
        }
        if (sheetData.length == 1) {
            this.showErrorValidations(true, 'uploaded file should have at least two rows of data to proceed. please check');
            return false;
        }

        if (!this.columnsData || this.columnsData.length == 0) {
            console.log('columns mapping data should be available ');
        } else if (this.fileConfigId == 1 && this.columnsData.length != activeSheet.getColumnCount()) {
            this.showErrorValidations(
                true,
                'uploaded file columns count should match with column configuration data count i.e ' +
                    this.columnsData.length +
                    ' . please check'
            );
            return false;
        } else {
            let emptyColumnConfigCount = 0;
            let isRowDataPresent: boolean;
            let isColumnDataPresent: boolean;
            for (let columnData of this.columnsData) {
                let isDataPosition: boolean;
                let isDataIn: boolean;
                let isDataFrom: boolean;
                if (columnData.dataPosition && columnData.dataPosition != 'null' && columnData.dataPosition != '') {
                    if (columnData.dataPosition == 'Row') {
                        isRowDataPresent = true;
                    } else if (columnData.dataPosition == 'Column') {
                        isColumnDataPresent = true;
                    }

                    isDataPosition = true;
                }
                if (columnData.dataIn && columnData.dataIn != 'null' && columnData.dataIn != '') {
                    isDataIn = true;
                }
                if (columnData.dataFrom && columnData.dataFrom != 'null' && columnData.dataFrom != '') {
                    isDataFrom = true;
                }

                if (!(isDataPosition && isDataIn && isDataFrom)) {
                    console.log(' columns config information should be filled properly ');
                    this.showErrorValidations(true, 'columns config information should be filled properly. please check');
                    return false;
                } else if (!isDataPosition && !isDataIn && !isDataFrom) {
                    emptyColumnConfigCount++;
                }
            }
            if (this.columnsData.length == emptyColumnConfigCount) {
                this.showErrorValidations(true, 'columns config information should be filled properly. please check');
                return false;
            }
        }

        if (this.previousValidationResult && Object.keys(this.previousValidationResult).length > 0) {
            this.removeValidations();
        }

        let data = {
            fileId: this.fileId,
            columnConfigData: this.columnsData,
            fileConfigId: this.fileConfigId,
            sheetData: sheetData
        };

        this.fileUploadService.validateUploadedData(data).subscribe(
            response => {
                console.log('success :', response);

                let successResult = response.insertResult;
                console.log('success result ', successResult);

                this.validationMessages = response.validationMessages;
                this.validationResult = response.validationResult;
                this.previousValidationResult = response.validationResult;
                this.insertColumnValidationMessages = response.insertColumnValidationMessages;

                if (this.validationResult && Object.keys(this.validationResult).length > 0) {
                    let isValidationMsgExists = false;
                    if (this.validationMessages && Object.keys(this.validationMessages).length > 0) {
                        isValidationMsgExists = true;
                        this.showErrorValidations(true, 'This file have validation issues. please reslove. ');
                    }

                    if (!isValidationMsgExists) {
                        if (this.insertColumnValidationMessages && Object.keys(this.insertColumnValidationMessages).length > 0) {
                            /*   this.showSuccessValidations(
                                true,
                                'This highlighted data is presented in the system. still you can proceed for save and that will be overriden.'
                            ); */

                            this.validationWaringMsg =
                                'This highlighted data is presented in the system. still you can proceed for save and that will be overriden.';
                            this.isInsertableColumn = true;
                            // this.insertData = true;
                            this.insertableSheetData = sheetData;
                            this.openWarningDataModal();
                        }
                    }

                    this.showValdations();
                } else if (successResult == 'success') {
                    // show the div for submit form to save
                    this.showSuccessValidations(true, 'Data Insertion is In Progress. Please refresh for the updated status');
                    //this.insertData = true;
                    this.validateData = false;
                    this.insertableSheetData = sheetData;
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    openWarningDataModal() {
        this.modalService.open(this.ValidationDataModal, {});
    }

    cancel() {
        this.modalService.dismissAll();
    }

    showValdations() {
        var style = new GC.Spread.Sheets.Style();
        style.backColor = 'red';

        this.sheet.suspendPaint();
        Object.keys(this.validationResult).forEach(key => {
            this.validationResult[key].forEach(obj => {
                this.sheet.setStyle(obj.rowId, obj.columnId, style);
            });
        });
        this.sheet.resumePaint();
    }

    removeValidations() {
        var style = new GC.Spread.Sheets.Style();
        style.backColor = 'white';
        //style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
        style.borderLeft = new GC.Spread.Sheets.LineBorder('#d9e4f4');
        style.borderTop = new GC.Spread.Sheets.LineBorder('#d9e4f4');
        style.borderRight = new GC.Spread.Sheets.LineBorder('#d9e4f4');
        style.borderBottom = new GC.Spread.Sheets.LineBorder('#d9e4f4');

        // var ns = GC.Spread.Sheets;

        this.sheet.suspendPaint();
        Object.keys(this.previousValidationResult).forEach(key => {
            this.previousValidationResult[key].forEach(obj => {
                this.sheet.setStyle(obj.rowId, obj.columnId, style, GC.Spread.Sheets.SheetArea.viewport);
                /*  var cell = this.sheet.getColumns(obj.rowId, obj.columnId);
                cell.value(10);
                cell.formatter("0.0%");
                cell.backColor("lightgreen");
                cell.borderLeft(new ns.LineBorder("gray", ns.LineStyle.double));
                cell.borderTop(new ns.LineBorder("gray", ns.LineStyle.double));
                cell.borderRight(new ns.LineBorder("gray", ns.LineStyle.double));
                cell.borderBottom(new ns.LineBorder("gray", ns.LineStyle.double)); */
            });
        });
        this.sheet.resumePaint();
    }
    // validationConformationData
    saveDataAfterValidationConfirmation() {
        console.log('validating the file id :' + this.fileId + ' config id :' + this.fileConfigId);
        this.validationMessages = [];
        //let activeSheet = this.spread.getActiveSheet();
        //let sheetData = activeSheet.getArray(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount());
        let sheetData = this.insertableSheetData;

        if (this.previousValidationResult && Object.keys(this.previousValidationResult).length > 0) {
            this.removeValidations();
        }

        let data = {
            fileId: this.fileId,
            columnConfigData: this.columnsData,
            fileConfigId: this.fileConfigId,
            sheetData: sheetData
        };

        this.fileUploadService.insertUploadedData(data).subscribe(
            response => {
                this.showSuccessValidations(true, response.success);
                this.insertData = false;
                this.validateData = false;
                this.cancel();
            },
            response => {
                console.log(response.error);
                this.cancel();
                this.showErrorValidations(true, response.error);
            }
        );
    }

    backToFileUpload() {
        console.log('back to file upload page');

        this.router.navigate(['fileUpload', { flag: this.uploadType }], { skipLocationChange: true });
    }
    setStyles() {
        let style = new GC.Spread.Sheets.Style();
        style.backColor = 'LemonChiffon';
    }

    showSuccessValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isFailure = false;
        this.isSuccess = showMessage;
        document.documentElement.scrollTop = 0;
        this.displaySuccessMessage = displayValidationMessage;
        setTimeout(() => {
            this.isSuccess = false;
            this.displaySuccessMessage = '';
        }, 20000);
    }

    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isSuccess = false;
        this.isFailure = showMessage;
        document.documentElement.scrollTop = 0;
        this.displayFailureMessage = displayValidationMessage;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, 20000);
    }

    /* isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginService.login();
    } */
}
