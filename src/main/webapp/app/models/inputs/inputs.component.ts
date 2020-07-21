import { Component, OnInit } from '@angular/core';
import { ModelsService } from '../models.service';
import { PagerService } from 'app/pager.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
    selector: 'inputs',
    templateUrl: './inputs.component.html',
    styleUrls: []
})
export class InputsComponent implements OnInit {
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
    modelsData;
    basePath;
    folderName;
    modelName;
    modelId;
    fPath;
    fName;

    status = null;
    constructor(
        private modelsService: ModelsService,
        private pagerService: PagerService,
        private router: Router,
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

    getInputLayoutFile() {
        const obj = new Object();
        obj['basePath'] = this.basePath;
        obj['fPath'] = this.fPath;
        obj['fName'] = this.fName;
        obj['folderName'] = this.folderName;
        obj['modelId'] = this.modelId;

        this.modelsService.getInputLayoutFile(obj).subscribe(
            response => {
                this.modelsData = JSON.parse(response);
            },
            error => {
                this.modelsData = '';
                console.log(error);
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

    navigatetoModels() {
        this.router.navigate(['Models', {}], { skipLocationChange: true });
    }

    backtoEditor() {
        this.router.navigate(
            ['Models/editor', { id: this.modelId, modelName: this.modelName, basePath: this.basePath, folderName: this.folderName }],
            { skipLocationChange: true }
        );
    }

    nexttoOutput() {
        this.router.navigate(
            ['Models/testoutput', { id: this.modelId, modelName: this.modelName, basePath: this.basePath, folderName: this.folderName }],
            { skipLocationChange: true }
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

    getModelDetailed() {
        const obj = new Object();
        obj['modelId'] = this.modelId;
        obj['basePath'] = this.basePath;
        obj['schemaName'] = 'CRISIL';
        this.modelsService.getModelDetailed(obj).subscribe(
            response => {
                console.log(response);
                this.records = response['RECORDS'];
                const mainFile = this.records.filter(item => item['TYPE'] == '3')[0];
                this.fPath = mainFile['BASE_PATH'];
                this.fName = mainFile['FILE_NAME'];
                this.getInputLayoutFile();
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
            }
        );
    }
}
