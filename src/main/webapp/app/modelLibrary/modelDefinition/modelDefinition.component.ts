import { Component, OnInit } from '@angular/core';
import { ModelService } from '../model.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, MODEL_REVIEW_IN_PROGRESS, MODEL_REJECTED } from 'app/constants';
@Component({
    selector: 'model-definition',
    templateUrl: './modelDefinition.component.html',
    styleUrls: []
})
export class ModelDefinitionComponent implements OnInit {
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    processDefinitionsList: any[];
    modelObj = {
        id: null,
        modelName: null,
        description: null,
        type: null,
        businessUsers: [],
        designerUsers: [],
        lastModifiedDate: null,
        status: null,
        modelProcessDefinition: [],
        lastModifiedBy: null,
        createdBy: null,
        createdDate: null
    };
    criPopover: any;
    yearList = [];
    quarterList = [];
    usersList = [];
    businessUsersList = [];
    designerList = [];
    scenarioTypeList = [];
    theCheckbox = false;
    wfId: any;
    userCanAccess = false;
    constructor(
        private modelService: ModelService,
        private modalService: NgbModal,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.modelObj.id = this.activatedRoute.snapshot.params.id;

        if (this.modelObj.id && 'null' !== this.modelObj.id) {
            this.modelService.getModelData(Number(this.modelObj.id)).subscribe(
                response => {
                    this.modelObj = response;
                    if (this.modelObj.status < MODEL_REVIEW_IN_PROGRESS || this.modelObj.status == MODEL_REJECTED) {
                        this.modelService.checkAccess(this.modelObj.id).subscribe(res => {
                            this.userCanAccess = res;
                        });
                    }
                    this.wfId = this.modelObj.modelProcessDefinition;
                    this.getModelCreateMasterData(Number(this.modelObj.id));
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        } else {
            this.getProcessDefinitions();
            this.modelObj.id = null;
            this.getModelCreateMasterData(Number(this.modelObj.id));
            this.userCanAccess = true;
        }
    }
    getModelCreateMasterData(id) {
        this.modelService.getModelCreateMasterData(id).subscribe(
            response => {
                this.scenarioTypeList = response['SCENARIO_TYPE_DATA'];
                this.businessUsersList = response['OWNERS'];
                this.designerList = response['DEVELOPERS'];
                /*  this.usersList = response['USERS_DATA'];
                  this.businessUserList = this.usersList;
                  this.designerList = this.businessUserList.filter(user => user.roles.indexOf('ROLE_DESIGNER') !== -1); */
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    navigateTo(path) {
        this.router.navigate([path, { id: this.modelObj.id }], { skipLocationChange: true });
    }

    saveDataSets(path) {
        this.modelObj.modelProcessDefinition = this.wfId;
        if (!this.validate(this.modelObj)) {
            return false;
        }
        this.modelService.saveModelData(this.modelObj).subscribe(
            response => {
                this.modelObj = response;
                this.navigateTo(path);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    validate(modelObj) {
        /*  if (!modelObj.type || 'null' == modelObj.type) {
            this.showErrorValidations(true, 'Please Select Model Type.');
            return false;
        } else */
        if (!modelObj.modelName || modelObj.modelName == 'null' || modelObj.modelName.length == 0) {
            this.showErrorValidations(true, 'Please Enter Model Name.');
            return false;
        } else if (!modelObj.businessUsers || modelObj.businessUsers.length == 0) {
            this.showErrorValidations(true, 'Please Select Model Owner.');
            return false;
        } else if (!modelObj.designerUsers || modelObj.designerUsers.length == 0) {
            this.showErrorValidations(true, 'Please Select Model Developer.');
            return false;
        } else if (!modelObj.description || modelObj.description == 'null' || modelObj.description.length == 0) {
            this.showErrorValidations(true, 'Please Enter Description.');
            return false;
        }
        return true;
    }

    cancel() {
        this.router.navigate(['model'], { skipLocationChange: true });
    }
    getProcessDefinitions() {
        this.modelService.getProcessDefinitions().subscribe(resposne => {
            this.processDefinitionsList = resposne.data;
            this.wfId = this.processDefinitionsList[0].id;
        });
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

    editModelName() {
        let ele = document.getElementById('model_Name').focus();
        return ele;
    }
}
