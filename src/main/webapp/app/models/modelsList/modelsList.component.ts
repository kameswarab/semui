import { Component, OnInit } from '@angular/core';
import { PagerService } from 'app/pager.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, PAGE_SIZE } from 'app/constants';
import { ModelsService } from '../models.service';

@Component({
    selector: 'modelsList',
    templateUrl: './modelsList.component.html',
    styleUrls: []
})
export class ModelsListComponent implements OnInit {
    records = [];
    recordsSub = [];
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };
    pageSize = 10;

    constructor(
        private modelsService: ModelsService,
        private pagerService: PagerService,
        private router: Router,
        private modalService: NgbModal
    ) {}

    ngOnInit() {
        this.getApprovedModelsList();
    }

    getApprovedModelsList() {
        const obj = new Object();
        obj['schemaName'] = 'CRISIL';
        this.modelsService.getApprovedModelsList(obj).subscribe(
            response => {
                this.records = response['RECORDS'];
                this.setPage(1);
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

    openModelExecution(record) {
        this.router.navigate(
            [
                'ModelsList/modelExecution',
                {
                    id: record['ID'],
                    basePath: record['BASE_PATH'],
                    folderName: record['FOLDER_NAME'],
                    modelName: record['MODEL_NAME'],
                    inputType: record['INPUT_TYPE'],
                    outputType: record['OUTPUT_TYPE']
                }
            ],
            { skipLocationChange: true }
        );
    }
}
