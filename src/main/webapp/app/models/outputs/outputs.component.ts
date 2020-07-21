import { Component, OnInit } from '@angular/core';
import { ModelsService } from '../models.service';
import { PagerService } from 'app/pager.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
    selector: 'outputs',
    templateUrl: './outputs.component.html',
    styleUrls: []
})
export class OutputsComponent implements OnInit {
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
    modelId;
    fPath;
    fName;
    nofoutputs;
    outputList = [
        { value: 'BarChart', label: 'BarChart' },
        { value: 'GuageChart', label: 'GuageChart' },
        { value: 'Table', label: 'Table' },
        { value: 'DropDown', label: 'DropDown' },
        { value: 'Value', label: 'Value' }
    ];
    outputConfig = [];

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
        this.modelId = this.route.snapshot.params.modelId;
        // this.getInputLayoutFile();
        // this.getModelDetailed();
    }

    renderOutputConfig(obj) {
        const val = obj.target.value;
        this.outputConfig = [];
        for (let i = 1; i <= val; i++) {
            this.outputConfig.push({ label: 'Output' + i, outputModal: '' });
        }
    }

    getInputLayoutFile() {
        const obj = new Object();
        obj['basePath'] = this.basePath;
        obj['fPath'] = this.fPath;
        obj['fName'] = this.fName;

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

    backtoTestOutput() {
        this.router.navigate(['Models/testoutput', { basePath: this.basePath, folderName: this.folderName, modelId: this.modelId }], {
            skipLocationChange: true
        });
    }

    nexttoTest() {
        if (!this.validate()) {
            this.showErrorValidations(true, 'Please Map the all output configurations to proceed next.');
            return false;
        }

        const obj = new Object();
        obj['modelId'] = this.modelId;
        this.modelsService.saveOutputConfig(obj).subscribe(
            response => {
                this.router.navigate(
                    ['Models/testoutput', { basePath: this.basePath, folderName: this.folderName, modelId: this.modelId }],
                    {
                        skipLocationChange: true
                    }
                );
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
            }
        );
    }

    validate() {
        let flag = true;
        if (this.nofoutputs == '' || this.nofoutputs == null) {
            flag = false;
            return flag;
        }

        this.outputConfig.forEach(element => {
            if (element.outputModal == '' || element.outputModal == null) {
                flag = false;
            }
        });
        return flag;
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
