import { Component, OnInit } from '@angular/core';
import { ModelsService } from '../models.service';
import { PagerService } from 'app/pager.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ALERT_MSG_TIME_OUT, PAGE_SIZE } from 'app/constants';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
declare var Plotly: any;
import * as Highcharts from 'highcharts';
import * as $ from 'jquery';

@Component({
    selector: 'modelExecution',
    templateUrl: './modelExecution.component.html',
    styleUrls: []
})
export class ModelExecutionComponent implements OnInit {
    records = [];
    records1 = [];
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
    data;
    basePath;
    folderName;
    rmodelData;
    inputData = true;
    fileData;
    uploadedFileName;
    file;
    multipleFileData = [];
    customersList;
    default;
    content;
    modelName;
    modelId;
    status = null;
    options = {
        scrollZoom: true,
        modeBarButtonsToRemove: [
            'zoom2d',
            'zoom3d',
            'zoomIn2d',
            'zoomOut2d',
            'pan',
            'pan2d',
            'autoScale2d',
            'hoverClosestCartesian',
            'hoverClosest3d',
            'hoverClosestGeo',
            'hoverClosestGl2d',
            'hoverClosestPie',
            'hoverCompareCartesian',
            'toggleSpikelines',
            'lasso2d',
            'select2d',
            'sendDataToCloud',
            'toImage',
            'resetCameraDefault3d',
            'resetCameraLastSave3d',
            'resetViews',
            'resetViewMapbox',
            'resetGeo',
            'zoomInGeo',
            'zoomOutGeo',
            'resetGeo',
            'hoverClosestGeo',
            'resetViews',
            'resetViewMapbox',
            'resetScale2d'
        ]
    };
    mainScriptFile;
    mainScriptLocation;
    rdsFiles = '';
    rdsFilesLocation;
    activeIds = 'toggle-1';
    fPath;
    fName;
    resultList = [];
    chartsList = [
        { value: 'barchart', label: 'Bar Chart' },
        { value: 'guagechart', label: 'Guage Chart' },
        { value: 'linechart', label: 'Line Chart' }
    ];
    chartType;
    xaxis;
    yaxis;
    chartSelection;
    highcharts = Highcharts;
    chartOptions = {};
    isShowChart = false;

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
        this.modelId = this.route.snapshot.params.id;
        this.modelName = this.route.snapshot.params.modelName;
        // this.renderInputs();
        this.getModelDetailed();
        this.getModelStatus();
        // this.showChart();
    }

    renderInputs() {
        const obj = new Object();
        obj['basePath'] = this.basePath;
        obj['fPath'] = this.fPath;
        obj['fName'] = this.fName;
        obj['folderName'] = this.folderName;
        obj['modelId'] = this.modelId;
        this.modelsService.getInputLayoutFile(obj).subscribe(
            response => {
                this.rmodelData = JSON.parse(response);
            },
            error => {
                this.data = '';
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

    execute() {
        if (this.inputData) {
            this.executeRFile();
        } else {
            this.executeRFileBulk();
        }
    }

    executeRFile() {
        if (!this.validate()) {
            return false;
        }
        let rdsFiles;
        if (this.rdsFiles != '') {
            rdsFiles = this.rdsFiles.substring(0, this.rdsFiles.length - 1);
        }

        let data = {
            id: this.modelId,
            modelName: this.mainScriptFile,
            modelLocation: this.basePath,
            folderName: this.folderName,
            input: this.rmodelData,
            outputType: 'json',
            rdsFiles: rdsFiles,
            rdsFilesLocation: this.basePath + '/' + this.rdsFilesLocation
        };
        this.modelsService.executeRFile(data).subscribe(
            response => {
                console.log(response);
                const res = Object.keys(JSON.parse(response[0].result)[0]);
                this.resultList = [];
                res.forEach(element => {
                    this.resultList.push({ label: element, chartType: '' });
                });
                this.records = JSON.parse(response[0].result);
                this.uploadedFileName = '';
                this.setPage(1);
                this.activeIds = 'toggle-2';
            },
            error => {
                console.log(error);
            }
        );
    }

    executeRFileBulk() {
        let validation = false;

        if (this.fileData == null) {
            validation = true;
            this.showErrorValidations(true, 'Please upload the file');
        }

        if (!validation) {
            let formData: FormData = new FormData();
            for (let i = 0; i < this.multipleFileData.length; i++) {
                formData.append('file', this.multipleFileData[i]);
            }
            this.multipleFileData = [];
            // formData.append('file', this.fileData);
            let rdsFiles;
            if (this.rdsFiles != '') {
                rdsFiles = this.rdsFiles.substring(0, this.rdsFiles.length - 1);
            }
            formData.append('modelId', this.modelId);
            formData.append('modelName', this.mainScriptFile);
            formData.append('modelLocation', this.basePath);
            formData.append('folderName', this.folderName);
            formData.append('outputType', 'json');
            formData.append('rdsFiles', rdsFiles);
            formData.append('rdsFilesLocation', this.basePath + '/' + this.rdsFilesLocation);

            this.modelsService.executeRFileBulk(formData).subscribe(
                response => {
                    console.log(response);
                    const res = Object.keys(JSON.parse(response[0].result)[0]);
                    this.resultList = [];
                    res.forEach(element => {
                        this.resultList.push({ label: element, chartType: '' });
                    });
                    this.records = JSON.parse(response[0].result);
                    this.uploadedFileName = '';
                    this.setPage(1);
                    this.activeIds = 'toggle-2';
                    // this.getOutputBarChart(res);
                    // this.customersList = JSON.parse(res);
                },
                response => {
                    this.uploadedFileName = '';
                    console.log('file upload error :' + response.error);
                    let errorMsg = response.error;
                    if ('InvalidFile' == errorMsg) {
                        this.showErrorValidations(true, 'Please choose the proper file to upload. only (.csv) files are accepted');
                    } else {
                        this.showErrorValidations(true, 'Inernal Server Error. Please check your uploaded File');
                    }
                }
            );
        }
    }

    validate() {
        let validFlag = true;
        for (let j = 0; j < this.rmodelData.length; j++) {
            let element = this.rmodelData[j]['inputJson'];
            for (let i = 0; i < element.length; i++) {
                if ((element[i].fieldValue == null || element[i].fieldValue == '') && element[i].isMandatory == 'Y') {
                    this.showErrorValidations(true, 'Please Enter ' + element[i].fieldName + ' in ' + this.rmodelData[j]['outerLabel']);
                    validFlag = false;
                    break;
                }
            }
            if (!validFlag) {
                break;
            }
        }
        return validFlag;
    }

    getOutputBarChart(json) {
        const obj = new Object();
        obj['schemaName'] = 'CRISIL';
        obj['json'] = json;
        obj['xAxis'] = this.xaxis;
        obj['yAxis'] = this.yaxis;
        obj['defyAxis'] = this.yaxis;
        this.modelsService.getOutputBarChart(obj).subscribe(
            response => {
                console.log('response:', response.result);
                this.content = response.result;
                this.activeIds = 'toggle-2';
            },
            response => {
                console.log('response:', response);
                this.showErrorValidations(true, response.error);
            }
        );
    }

    renderGuageChart(val) {
        // this.default = obj.Default;
        const gd = document.getElementById('gd');
        const data = [
            {
                domain: { x: [0, 1], y: [0, 1] },
                value: val,
                title: { text: 'Score' },
                type: 'indicator',
                mode: 'gauge+number'
            }
        ];
        const layout = { width: '100%', height: '100%', margin: { t: 0, b: 0 } };
        Plotly.newPlot(gd, data, layout, this.options, { responsive: true });
    }

    browsFile(event, data) {
        if (event.target.files.length == 1) {
            let files: FileList = event.target.files;
            this.fileData = files.item(0);
            this.rmodelData.forEach(element => {
                if (element.outerLabel == data.outerLabel) {
                    this.multipleFileData.push(this.fileData);
                }
            });
            this.uploadedFileName = this.fileData.name + '';
            let fileNameArry = this.fileData.name.split('.');
            if (fileNameArry.length > 1) {
                this.file = fileNameArry[0];
                let filextn = fileNameArry[1];
                if (!('xlsx' == filextn || 'xlx' == filextn || 'xlsm' == filextn || 'csv' == filextn)) {
                    this.showErrorValidations(true, 'Please choose the proper file to upload. only .xlsx,.xlx,.xlsm files are accepted');
                    this.uploadedFileName = '';
                    // this.clearDataFeilds();
                    return false;
                }
            }
        } else {
            this.file = '';
        }
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
    backtoInput() {
        this.router.navigate(
            ['Models/input', { basePath: this.basePath, folderName: this.folderName, id: this.modelId, modelName: this.modelName }],
            {
                skipLocationChange: true
            }
        );
    }

    nexttoOutput() {
        if (!this.validateNext()) {
            this.showErrorValidations(true, 'Please Map the all output configurations to proceed next.');
            return false;
        }

        const obj = new Object();
        obj['modelId'] = this.modelId;
        obj['modelOutPutConfig'] = this.resultList;
        this.modelsService.saveOutputConfig(obj).subscribe(
            response => {
                this.router.navigate(['Models/output', { basePath: this.basePath, folderName: this.folderName, modelId: this.modelId }], {
                    skipLocationChange: true
                });
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
            }
        );
    }

    validateNext() {
        let flag = true;
        let isxaxis = false;
        this.resultList.forEach(element => {
            if (element.chartType == '' || element.chartType == null) {
                flag = false;
            }
            if (element.chartType == 'xaxis') {
                isxaxis = true;
            }
        });
        if (!isxaxis) {
            flag = false;
        }

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
                this.records1 = response['RECORDS'];
                const mainFile = this.records1.filter(item => item['TYPE'] == '5')[0];
                this.mainScriptFile = mainFile['BASE_PATH'] + '/' + mainFile['FILE_NAME'];
                this.mainScriptLocation = mainFile['BASE_PATH'];

                const mainFile1 = this.records1.filter(item => item['TYPE'] == '3')[0];
                this.fPath = mainFile1['BASE_PATH'];
                this.fName = mainFile1['FILE_NAME'];
                this.renderInputs();

                this.records1.forEach(record => {
                    if (record['TYPE'] == '2') {
                        this.rdsFiles = this.rdsFiles + record['FILE_NAME'] + ',';
                        this.rdsFilesLocation = record['BASE_PATH'];
                    }
                });
            },
            error => {
                this.showErrorValidations(true, error);
                console.log(error);
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

    selectChartConfig(obj) {
        this.chartSelection = obj.value;
    }

    showChart() {
        this.isShowChart = true;
        document.getElementById('gd').innerHTML = '';
        const dataSeries = [];
        let xAxisLabels = [];
        this.records.forEach(element => {
            const data = [];
            data.push(element[this.xaxis]);
            xAxisLabels.push(element[this.xaxis]);
            data.push(parseFloat(element[this.yaxis]));
            dataSeries.push(data);
        });

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
                                current.renderGuageChart(this.y);
                            }
                        }
                    }
                }
            },
            title: {
                text: 'Bar Chart'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: xAxisLabels,
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
                    text: current.yaxis
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: ''
            },
            series: [
                {
                    name: current.xaxis,
                    data: dataSeries,
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

    navigatetoModelsList() {
        this.router.navigate(['ModelsList', {}], { skipLocationChange: true });
    }
}
