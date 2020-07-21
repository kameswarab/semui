import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PagerService } from 'app/pager.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, PAGE_SIZE, MODEL_TABS } from 'app/constants';
import { ModelsService } from './models.service';
import * as Highcharts from 'highcharts';
import * as $ from 'jquery';

@Component({
    selector: 'models',
    templateUrl: './models.component.html',
    styleUrls: ['./models.component.css']
})
export class ModelsComponent implements OnInit {
    records = [];
    recordsSub = [];
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    id = null;
    pager = {
        pages: null,
        totalItems: null,
        currentPage: null,
        totalPages: null,
        startIndex: null,
        endIndex: null
    };
    pageSize = 10;
    highcharts = Highcharts;
    chartOptions = {};

    newModel = {
        modelName: null,
        modelType: null,
        // basePath: '/data/models'
        basePath: 'D:\\RModels'
    };
    @ViewChild('createModel')
    createModel: ElementRef;
    @ViewChild('deleteModal')
    deleteModal: ElementRef;
    languagesList = [
        { label: 'R', value: 'R' },
        { label: 'C++', value: 'cpp' },
        { label: 'Python', value: 'python' },
        { label: 'Excel', value: 'excel' }
    ];
    constructor(
        private modelsService: ModelsService,
        private pagerService: PagerService,
        private router: Router,
        private modalService: NgbModal
    ) {}

    ngOnInit() {
        this.getModelsList();
        // this.renderChart();
    }

    getModelsList() {
        const obj = new Object();
        obj['schemaName'] = 'CRISIL';
        this.modelsService.getModelsList(obj).subscribe(
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

    openModelFlow(record) {
        let id = null;
        let status = 31;
        if (record) {
            id = record['ID'];
            status = record['STATUS'] || 1;
            if (status >= 34) {
                status = 34;
            }
        }
        let tab = MODEL_TABS.filter(e => e.status == status)[0];
        let tabValue;
        if (tab == undefined) {
            tabValue = 'Models/upload';
        } else {
            tabValue = tab.value;
        }
        this.router.navigate(
            [
                tabValue,
                {
                    id: id,
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

    addNewModel() {
        this.modalService.open(this.createModel, {});
    }
    createNewModel() {
        if (!this.newModel.modelName || this.newModel.modelName == null) {
            this.showErrorValidations(true, 'Provide Model Name.');
            return false;
        } else if (!this.newModel.modelType || this.newModel.modelType == null) {
            this.showErrorValidations(true, 'Provide Model Type.');
            return false;
        }
        this.modelsService.createNewModel(this.newModel).subscribe(
            response => {
                this.showSuccessValidations(true, 'Model Created Successfully.');
                this.modalService.dismissAll();
                this.newModel.modelName = null;
                this.newModel.modelType = null;
                this.getModelsList();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    openDeleteModelFlow(record) {
        this.id = record['ID'];
        this.modalService.open(this.deleteModal, {});
    }
    deleteModel() {
        this.modelsService.deleteModel(this.id).subscribe(
            response => {
                this.showSuccessValidations(true, 'Model deleted successfully.');
                this.modalService.dismissAll();
                this.getModelsList();
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    renderChart() {
        let current = this;
        this.chartOptions = {
            chart: {
                type: 'column'
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                // alert('Category: ' + this.category + ', value: ' + this.y);
                                current.test(this.category, this.y);
                            }
                        }
                    }
                }
            },
            title: {
                text: "World's largest cities per 2017"
            },
            subtitle: {
                text: 'Source: <a href="http://en.wikipedia.org/wiki/List_of_cities_proper_by_population">Wikipedia</a>'
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Population (millions)'
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: 'Population in 2017: <b>{point.y:.1f} millions</b>'
            },
            series: [
                {
                    name: 'Population',
                    data: [
                        ['Shanghai', 24.2],
                        ['Beijing', 20.8],
                        ['Karachi', 14.9],
                        ['Shenzhen', 13.7],
                        ['Guangzhou', 13.1],
                        ['Istanbul', 12.7],
                        ['Mumbai', 12.4],
                        ['Moscow', 12.2],
                        ['São Paulo', 12.0],
                        ['Delhi', 11.7],
                        ['Kinshasa', 11.5],
                        ['Tianjin', 11.2],
                        ['Lahore', 11.1],
                        ['Jakarta', 10.6],
                        ['Dongguan', 10.6],
                        ['Lagos', 10.6],
                        ['Bengaluru', 10.3],
                        ['Seoul', 9.8],
                        ['Foshan', 9.3],
                        ['Tokyo', 9.3]
                    ],
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }
            ]
        };
    }

    test(cat, y) {
        alert(y);
    }
}
