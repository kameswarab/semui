import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ShocksTemplateService } from 'app/shocksTemplate/shocksTemplate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagerService } from 'app/pager.service';

@Component({
    selector: 'jhi-home',
    templateUrl: './shocksTemplate.component.html',
    styleUrls: ['./shocksTemplate.css']
})
export class ShocksTemplateComponent implements OnInit {
    headerList = [];
    columns = [];
    records = [];
    totalSize = 0;
    pageSize = 10;
    disableButtons = false;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    @Input()
    classificationName = 'Regulatory';
    id = 0;
    filter = {
        arguments: [],
        pageIndex: 1,
        pageSize: this.pageSize,
        sorts: [],
        filterModels: {},
        sortMap: {}
    };
    @ViewChild('deleteDataModal')
    deleteDataModal: ElementRef;
    pager = {
        totalItems: null,
        currentPage: null,
        pageSize: null,
        totalPages: null,
        startPage: null,
        endPage: null,
        startIndex: null,
        endIndex: null,
        pages: null
    };
    pageNo = 1;
    constructor(
        private shocksTemplateService: ShocksTemplateService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router,
        private pagerService: PagerService
    ) {}

    ngOnInit() {
        this.getPageNationData();
    }
    getPageNationData() {
        this.shocksTemplateService.getPageNationData(this.filter).subscribe(
            response => {
                this.headerList = [];
                this.records = [];
                this.columns = [];

                this.headerList = response['HEADERS'];
                this.columns = response['COLUMNS'];
                this.records = response['RECORDS'];
                this.totalSize = response['TOTALRECORDS'];

                if (Object.keys(this.filter.sortMap).length === 0) {
                    for (let i = 0; i < this.columns.length; i++) {
                        this.filter.sortMap[this.columns[i]] = '';
                    }
                }
                this.setPage(this.pageNo);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getMasterDataByPage(pageId) {
        this.filter.pageIndex = pageId;
        this.filter.pageSize = 10;
        this.pageNo = pageId;
        this.getPageNationData();
    }

    getPageDropdown() {
        const pageList = [];
        let pages = this.totalSize / this.filter.pageSize;
        if (this.totalSize % this.filter.pageSize !== 0) {
            pages = pages + 1;
        }
        for (let i = 1; i <= pages; i++) {
            pageList.push(i);
        }
        return pageList;
    }

    getPageSizeDropdown() {
        const pageList = [];
        let pageSizeTemp = 0;
        for (let i = 1; i <= 5; i++) {
            pageSizeTemp += this.pageSize;
            pageList.push(pageSizeTemp);
        }
        return pageList;
    }

    updateSortDataMap(column, value, btnValue) {
        if (value === '') {
            value = btnValue;
        } else if (value === 'DESC') {
            value = 'ASC';
        } else {
            value = 'DESC';
        }
        this.filter.sortMap[column] = value;
        const sortsMap = this.filter.sorts;
        const sortsMapTemp = [];
        sortsMapTemp.push({ columnName: column, sort: value });
        for (let i = 0; i < sortsMap.length; i++) {
            const sortsTemp = sortsMap[i];
            if (sortsTemp.columnName !== column) {
                sortsMapTemp.push(sortsTemp);
            }
        }
        this.filter.sorts = sortsMapTemp;
        this.getPageNationData();
    }
    updateFilterDataMap(column, event) {
        const value = event.target.value;
        const filterMap = this.filter.arguments;
        const filterMapTemp = [];
        if (value && value !== '') {
            filterMapTemp.push({ columnName: column, filterControlValue: value });
        }
        for (let i = 0; i < filterMap.length; i++) {
            const filterTemp = filterMap[i];
            if (filterTemp.columnName !== column) {
                filterMapTemp.push(filterTemp);
            }
        }
        this.filter.arguments = filterMapTemp;
        this.pageNo = 1;
        this.filter.pageIndex = 1;
        this.getPageNationData();
    }
    navigateToConfigure() {
        this.router.navigate(['/dataUtility/shocksTemplate/shocksConfig'], { skipLocationChange: true });
    }

    viewData(data) {
        const obj = {
            id: data['ID'],
            name: data['TEMPLATE_NAME'],
            scenarioType: data['SCENARIO_NAME'],
            subClassification: data['SUBCLASSIFICATION_NAME'],
            subClassificationId: data['SUBCLASSIFICATION_ID']
        };
        this.navigateToEdit(obj);
    }

    openDeleteDataModal(data) {
        this.modalService.open(this.deleteDataModal, { windowClass: 'myCustomModalClass' });
        const obj = {
            id: data['ID']
        };
        this.id = obj.id;
    }

    deleteData() {
        /* const obj = {
            id: data['ID']
        }; */
        this.shocksTemplateService.deleteTemplate(this.id).subscribe(
            response => {
                this.showSuccessValidations(true, 'Template deleted successfully.');
                this.getPageNationData();
                this.cancel();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    navigateToEditOld(data) {
        this.router.navigate(['dataUtility/shocksTemplate/shocksMapping', data], { skipLocationChange: true });
    }
    navigateToEdit(data) {
        this.router.navigate(['dataUtility/shocksTemplate/shocksConfig', data], { skipLocationChange: true });
    }

    cancel() {
        this.modalService.dismissAll();
        this.router.navigate(['dataUtility/shocksTemplate'], { skipLocationChange: true });
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
        // get pager object from service
        this.pager = this.pagerService.getPager(this.totalSize, page);

        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        // get current page of items
        if (this.pageNo == 1) {
            this.records = this.records.slice(this.pager.startIndex, this.pager.endIndex + 1);
        }
    }
}
