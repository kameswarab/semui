import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RegulatoryMappingService } from 'app/regulatoryMapping/regulatoryMapping.service';
import { Alert } from 'selenium-webdriver';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { url } from 'inspector';
import { ALERT_MSG_TIME_OUT } from 'app/constants';

@Component({
    selector: 'jhi-home',
    templateUrl: './regulatoryMapping.component.html',
    styleUrls: ['regulatoryMapping.css']
})
export class RegulatoryMappingComponent implements OnInit {
    regulatoryList: any[];
    RegulatorRFNameList: any[];
    // regulatoryMappingDTO: any = {};
    regulatoryNameList: any[];
    regulatoryMappingDTO = {
        sub_classification_id: null,
        regularity_rf_id: null,
        shockRuleKeyId: null,
        shockRuleKey: null
    };
    account: Account;
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
    rfId;
    rfName;
    rgName;
    rgId;
    createFilter: { SEARCH_STR: [''] };
    masterDataObjForFilters: {};
    filters;
    value;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    headerList = [];
    records = [];
    columns = [];
    configdata = [];
    totalSize = 0;
    masterId = 0;
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    isEdit = false;
    regTypeId = null;

    constructor(
        private regulatoryMappingService: RegulatoryMappingService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router
    ) {}
    ngOnInit() {
        this.regulatoryMappingDTO.shockRuleKeyId = this.route.snapshot.params.ID;
        this.regulatoryMappingDTO.shockRuleKey = this.route.snapshot.params.SHOCK_RULE_KEY_ID;
        this.regTypeId = this.route.snapshot.params.regTypeId;
        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }
        this.regulatoryMappingService.getRegulatoryList().subscribe((response: any) => {
            this.regulatoryList = response.regulatory;
            this.regulatoryNameList = response.regulatoryName;
        });
        this.getFileConfigData();
    }
    getRegulatorRFName(rfId) {
        this.regulatoryMappingService.getRegulatorRFName(rfId).subscribe((response: any) => {
            this.RegulatorRFNameList = response;
        });
    }
    saveRegulatoryMappingData() {
        if (!this.validate(this.regulatoryMappingDTO)) {
            return false;
        }
        if (this.records.length > 0) {
            if (
                this.records[0].id == '' &&
                this.rfId == this.regulatoryMappingDTO.shockRuleKeyId &&
                this.rgId == this.regulatoryMappingDTO.sub_classification_id
            ) {
                this.showErrorValidations(true, 'Regulatory Mapping Data already Exists.');
                this.regulatoryMappingDTO.sub_classification_id = '';
                this.regulatoryMappingDTO.regularity_rf_id = '';
                this.regulatoryMappingDTO.regularity_rf_id = '';
                this.regulatoryMappingDTO.shockRuleKeyId = '';
                return false;
            }
        }
        this.regulatoryMappingService.saveRegulatoryMappingData(this.regulatoryMappingDTO).subscribe(
            response => {
                // this.regulatoryMappingDTO = response;
                this.getFileConfigData();
                this.showSuccessValidations(true, 'Regulatory Mapping Data saved successfully.');
                this.regulatoryMappingDTO.sub_classification_id = '';
                this.regulatoryMappingDTO.regularity_rf_id = '';
                // this.RegulatorRFNameList  = [];
            },
            response => {
                this.showErrorValidations(true, response.error);
                this.regulatoryMappingDTO.sub_classification_id = '';
                this.regulatoryMappingDTO.regularity_rf_id = '';
            }
        );
    }

    validate(regulatoryMappingDTO: { sub_classification_id: any; regularity_rf_id: any; shockRuleKeyId: any; shockRuleKey: any }): any {
        if (!regulatoryMappingDTO.sub_classification_id) {
            this.showErrorValidations(true, 'Please Enter Regulator.');
            return false;
        } else if (!regulatoryMappingDTO.regularity_rf_id || regulatoryMappingDTO.regularity_rf_id == -1) {
            this.showErrorValidations(true, 'Please Select Regulator RiskFactor Name.');
            return false;
        } else if (!regulatoryMappingDTO.shockRuleKeyId) {
            this.showErrorValidations(true, 'Please Select ShockRuleKey.');
            return false;
        }
        return true;
    }
    getRegulationEdit(id) {
        this.isEdit = true;
        this.regulatoryMappingDTO.regularity_rf_id = '';
        this.regulatoryMappingService.getRegulationEdit(id).subscribe(
            response => {
                this.regulatoryMappingDTO = response;
                const rfRId = this.regulatoryMappingDTO.sub_classification_id;
                this.regulatoryMappingService.getRegulatorRFName(rfRId).subscribe((response: any) => {
                    this.RegulatorRFNameList = response;
                });
                //this.showSuccessValidations(true, 'Regulatory Mapping Data saved successfully.');
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    openDeleteDataModal(id) {
        this.modalService.open(this.deleteDataModal, { windowClass: 'myCustomModalClass' });
        this.masterId = id;
    }
    deleteMasterConfigData() {
        if (this.masterId) {
            this.regulatoryMappingService.getRegulationDelete(this.masterId).subscribe(
                response => {
                    this.showSuccessValidations(true, 'Data deleted successfully.');
                    this.regulatoryMappingDTO.sub_classification_id = '';
                    this.regulatoryMappingDTO.regularity_rf_id = '';
                    this.getFileConfigData();
                    this.cancel();
                },
                response => {
                    this.showErrorValidations(true, response.error);
                }
            );
        }
    }
    cancel() {
        this.modalService.dismissAll();
    }

    getFileConfigData() {
        this.regulatoryMappingService.getRegulatoryMappingData(this.regulatoryMappingDTO.shockRuleKeyId).subscribe(
            response => {
                this.configdata = response;
                this.headerList = [];
                this.records = [];
                this.columns = [];
                this.headerList = ['ID', 'SHOCK RULE KEYID', 'SHOCK RULE KEY', 'REGULATOR', 'RISK FACTOR REGULATOR NAME', 'ACTION'];
                this.columns = [0, 1, 2, 3, 4];
                this.records = response;
                this.totalSize = this.configdata.length;
                let resources = response['0'];
                this.rfId = resources[1];
                this.rfName = resources[2];
                this.rgName = resources[3];
                this.rgId = resources[4];
                this.regulatoryMappingDTO.shockRuleKeyId = this.rfId;
                this.regulatoryMappingDTO.shockRuleKey = this.rfName;
                if (Object.keys(this.filter.sortMap).length == 0) {
                    for (let i = 0; i < this.columns.length; i++) {
                        this.filter.sortMap[this.columns[i]] = '';
                    }
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
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
    getPageSizeDropdown() {
        let pageList = [];
        let pageSizeTemp = 0;
        for (let i = 1; i <= 5; i++) {
            pageSizeTemp += this.pageSize;
            pageList.push(pageSizeTemp);
        }
        return pageList;
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

    discardRegulatoryConfigData() {
        const filterData = new Object();
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['regTypeId'] = this.regTypeId;
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        this.router.navigate(['/dataUtility/regulatorinfo', filterData], { skipLocationChange: true });
    }
}
