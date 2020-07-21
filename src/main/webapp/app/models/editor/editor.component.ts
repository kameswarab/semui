import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModelsService } from '../models.service';
import { GridOptions } from 'ag-grid-community';
import * as GC from '@grapecity/spread-sheets';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { ActivatedRoute, Router } from '@angular/router';
import 'ag-grid-enterprise';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    flag = false;
    spread: any;
    sheet: any;
    styles: any;
    code = '';
    rowData;
    columnDefs;
    defaultColDef;
    components;
    getDataPath;
    getRowNodeId;
    autoGroupColumnDef;
    gridApi;
    gridColumnApi;
    groupDefaultExpanded;
    basePath;
    folderName;
    modelName;
    fileName;
    fileType;
    language = 'r';
    theme = 'vs-dark';
    modelId;
    status = null;
    editorOptions = { theme: 'vs-dark', language: 'r' };
    languages = [{ label: 'cpp', value: 'cpp' }, { label: 'r', value: 'r' }];
    themes = [{ label: 'vs', value: 'vs' }, { label: 'vs-dark', value: 'vs-dark' }, { label: 'hc', value: 'hc-black' }];
    @ViewChild('newFile')
    newFile: ElementRef;
    newFileName = null;
    filePath = null;
    headerList: any;
    activeRowCount: any;
    activeColumnCount: any;
    newFileType;
    filesList = [
        { value: '1', label: '.R' },
        { value: '4', label: '.csv' },
        { value: '6', label: '.xlsx' },
        { value: '3', label: '.txt' } /* txt for json */
    ];
    private gridOptions: GridOptions;

    constructor(
        private modelsService: ModelsService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal
    ) {
        this.gridOptions = <GridOptions>{};
    }
    ngOnInit() {
        // this.editorOptions = { theme: this.theme, language: this.language };
        this.basePath = this.route.snapshot.params.basePath;
        this.folderName = this.route.snapshot.params.folderName;
        this.modelName = this.route.snapshot.params.modelName;
        this.modelId = this.route.snapshot.params.id;
        this.components = { fileCellRenderer: this.getFileCellRenderer() };
        this.groupDefaultExpanded = -1;
        this.getDataPath = function(data) {
            return data.filePath;
        };
        this.getRowNodeId = function(data) {
            return data.id;
        };
        this.autoGroupColumnDef = {
            headerName: 'Files',
            width: 500,
            cellRendererParams: {
                checkbox: true,
                suppressCount: true,
                innerRenderer: 'fileCellRenderer'
            }
        };
        this.defaultColDef = {
            sortable: true,
            resizable: true,
            filter: true
        };
        this.columnDefs = [];
        /* this.columnDefs = [
            {
                field: 'DateModified',
                comparator: function(d1, d2) {
                    return new Date(d1).getTime() < new Date(d2).getTime() ? -1 : 1;
                }
            },
            {
                field: 'Size',
                aggFunc: 'sum',
                valueFormatter: function(params) {
                    return params.value ? Math.round(params.value * 10) / 10 + ' MB' : '0 MB';
                }
            }
        ]; */
        this.getFileStructure();
        this.getModelStatus();
    }

    getFileStructure() {
        const obj = new Object();
        obj['schemaName'] = 'CRISIL';
        obj['basePath'] = this.basePath;
        obj['folderName'] = this.folderName;
        obj['modelId'] = this.modelId;
        this.modelsService.getFileStructure(obj).subscribe(
            response => {
                this.rowData = response;
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getFileCellRenderer() {
        function FileCellRenderer() {}
        FileCellRenderer.prototype.init = function(params) {
            var tempDiv = document.createElement('div');
            var value = params.value;
            var icon = getFileIcon(params.value.toLowerCase());
            tempDiv.innerHTML = icon ? '<span><i class="' + icon + '"></i>' + '<span class="filename"></span>' + value + '</span>' : value;
            this.eGui = tempDiv.firstChild;
        };
        FileCellRenderer.prototype.getGui = function() {
            return this.eGui;
        };
        return FileCellRenderer;
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
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

    onRowClicked(e) {
        if (e.event.target !== undefined) {
            this.fileName = e.data['filePath'];
            this.fileType = e.value;
            const fileExt = this.fileName[this.fileName.length - 1]
                .split('.')
                .pop()
                .toLowerCase();
            if (e.value.includes('.csv') || e.value.includes('.xls')) {
                this.getCSVFile();
            } else if (fileExt != 'rds') {
                this.getSavedRFile();
            }
        }
    }

    getCSVFile() {
        const obj = new Object();
        obj['basePath'] = this.basePath;
        obj['fileNames'] = this.fileName;
        obj['fileType'] = this.fileType;
        this.flag = true;
        this.modelsService.getCSVFile(obj).subscribe(response => {
            let fileData = response;
            setTimeout(() => {
                document.getElementById('viewFileData').innerHTML = '';
                this.spread = new GC.Spread.Sheets.Workbook(document.getElementById('viewFileData'));
                this.sheet = this.spread.getSheet(0);
                this.styles = this.sheet.getDefaultStyle();
                this.showDataInSpreadSheet(fileData);
            }, 100);
        });
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
    getSavedRFile() {
        const obj = new Object();
        obj['basePath'] = this.basePath;
        obj['fileNames'] = this.fileName;
        this.flag = false;
        this.modelsService.getSavedRFile(obj).subscribe(
            response => {
                this.code = response;
            },
            error => {
                this.code = '';
                console.log(error);
            }
        );
    }

    navigatetoModels() {
        this.router.navigate(['Models', {}], { skipLocationChange: true });
    }

    backtoUpload() {
        this.router.navigate(
            ['Models/upload', { id: this.modelId, modelName: this.modelName, basePath: this.basePath, folderName: this.folderName }],
            { skipLocationChange: true }
        );
    }

    nexttoInputs() {
        this.router.navigate(
            ['Models/input', { id: this.modelId, modelName: this.modelName, basePath: this.basePath, folderName: this.folderName }],
            { skipLocationChange: true }
        );
    }

    editorOptionLangChange(obj) {
        this.editorOptions = { theme: this.theme, language: obj };
    }

    editorOptionThemeChange(obj) {
        this.editorOptions = { theme: obj, language: this.language };
    }

    updateFileContent(flag) {
        const obj = new Object();
        obj['basePath'] = this.basePath;
        obj['fileNames'] = this.fileName;
        if (flag) {
            this.updateExcelSheet(obj);
        } else {
            this.updateCodeContent(obj);
        }
    }

    updateCodeContent(obj) {
        if (this.code == null || this.code == '') {
            this.showErrorValidations(true, 'There are no changes to save');
            return false;
        }
        obj['fileContent'] = this.code;
        this.modelsService.updateFileContent(obj).subscribe(
            response => {
                this.showSuccessValidations(true, 'Changes are saved Successfully');
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
            }
        );
    }

    updateExcelSheet(obj) {
        const activeSheet = this.spread.getActiveSheet();
        obj['sheetData'] = activeSheet.getArray(0, 0, activeSheet.getRowCount(), activeSheet.getColumnCount());
        this.modelsService.updateExcelSheet(obj).subscribe(
            response => {
                this.showSuccessValidations(true, 'Data updated successfully');
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

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

    addNewFilePopUP() {
        var selectedNode = this.gridApi.getSelectedNodes()[0];
        if (!selectedNode) {
            this.showErrorValidations(true, 'Select the folder to add new file.');
            return false;
        }
        this.filePath = selectedNode.childrenAfterGroup[0].data.filePath;
        this.modalService.open(this.newFile, {});
    }

    addNewFile() {
        if (!this.newFileName || this.newFileName == null || this.newFileName == undefined) {
            this.showErrorValidations(true, 'Provide FileName.');
            return false;
        }
        if (!this.newFileType || this.newFileType == null || this.newFileType == undefined) {
            this.showErrorValidations(true, 'Select type of file.');
            return false;
        }
        let fileTypeLabel = this.filesList.filter(p => p.value == this.newFileType)[0].label;
        const obj = new Object();
        obj['schemaName'] = 'CRISIL';
        obj['fileName'] = this.newFileName + fileTypeLabel;
        obj['modelId'] = this.modelId;
        obj['type'] = this.newFileType;
        const filePath = this.filePath;
        filePath.pop();
        const newFilePathToAdd = this.basePath + '\\' + filePath.join('\\') + '\\' + this.newFileName + fileTypeLabel;
        obj['basePath'] = filePath.join('\\');
        obj['newFilePathToAdd'] = newFilePathToAdd;
        this.modelsService.addNewFile(obj).subscribe(
            response => {
                this.modalService.dismissAll();
                this.newFileName = null;
                this.filePath = null;
                this.newFileType = null;
                fileTypeLabel = null;
                this.showSuccessValidations(true, 'File added Successfully');
                this.getFileStructure();
            },
            response => {
                this.modalService.dismissAll();
                this.showErrorValidations(true, response.error);
            }
        );
    }
}

function getFileIcon(filename) {
    return filename.endsWith('.r') || filename.endsWith('.csv') || filename.endsWith('.json') || filename.endsWith('.rds')
        ? 'far fa-file'
        : filename.endsWith('.xls')
        ? 'far fa-file-excel'
        : filename.endsWith('.txt')
        ? 'far fa-file'
        : filename.endsWith('.pdf')
        ? 'far fa-file-pdf'
        : 'far fa-folder';
}
