import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RiskFactorInfoService } from 'app/riskfactorInfo/riskfactorInfo.service';
import { ActivatedRoute, Router } from '@angular/router';
import 'ag-grid-enterprise';
import { GridOptions } from 'ag-grid/main';
import { ALERT_MSG_TIME_OUT } from 'app/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScenarioService } from 'app/Scenario';
import { AgGridEvent } from 'ag-grid-community';

declare var Plotly: any;
@Component({
    selector: 'jhi-home',
    templateUrl: './riskfactorInfo.component.html',
    styleUrls: ['riskfactorInfo.css']
})
export class RiskFactorInfoComponent implements OnInit {
    @ViewChild('sparkLineRFModal')
    sparkLineRFModal: ElementRef;
    /*for infinite scroling*/
    rowModelType;
    paginationPageSize;
    cacheOverflowSize;
    maxConcurrentDatasourceRequests;
    infiniteInitialRowCount;
    maxBlocksInCache;
    /* for filters */
    filterList = [];
    filterIcon = false;
    masterDataObj = {};
    masterDataMapObj = {};
    masterDataMap = {};
    filtersApplied = false;
    createFilter = { SEARCH_STR: [''] };
    filterOrderMap = {};
    masterDataObjForFilters = {};
    /* for filters end*/
    context: any;
    infoList: any = [];
    riskDetails: any = [];
    totalSize = 0;
    totalCount = 0;
    pageSize = 100;
    rowStarts: any;
    rowStartfrom: 1;
    rowEnds: any;
    headerList = [];
    records = [];
    recordsList = [];
    columns = [];
    columnsNew = [];
    displayFailureMessage: string;
    isFailure = false;
    masterId = 0;
    displaySuccessMessage: string;
    isSuccess = false;
    linkID: any;
    flag = false;
    deleteRow: any;
    userRole: any;
    columnDefs = [];
    assetclassid = [];
    description = [];
    RISKFACTORTYPEID = [];
    SUBRISKFACTORTYPE = [];
    shockrulekeyid = [];
    ASSETNAME = [];
    COUNTRYID = [];
    CURRENCYID = [];
    expiryid = [];
    MATURITYID = [];
    UNITID = [];
    SECTORID = [];
    seniority = [];
    RATINGID = [];
    systemname = [];
    externalid = [];
    liquiditycategoryid = [];
    FREQUENCYID = [];
    CURVEFAMILYID = [];
    DESCRIPTION = [];
    TRANSFORMATIONID = [];
    MISVALTREATMETHID = [];
    RFCATEGORYID = [];
    METHODOLOGYID = [];
    INTERPOLATIONTYPEID = [];
    ARITHMATICFORMULA = [];
    public listingGridOptions: GridOptions;
    paginationNumberFormatter;
    rowSelection;
    defaultColDef;
    selectedFilter: any;
    selectedValue: any;
    rowHeight: any;
    riskFactorSetObj = {
        id: null,
        riskFactorSetName: null
    };
    sideBar;
    getRowNodeId;
    components;
    overlayNoRowsTemplate;
    gridApi;
    gridColumnApi;
    gridObj: AgGridEvent;
    template1 = `<img data-action-type="edit" src="./content/images/svg/edit.png" alt="Sem-icons" class="img-edit">`;
    template2 = `<img data-action-type="tsPlot" src="./content/images/svg/graph2.png" alt="Sem-icons" style="cursor: pointer !important;margin-left: -6px;">`;
    error: any;
    itemList = [];
    columnList = [];
    shockIdList = [];
    downloadType: string;
    iscount: boolean;
    private gridOptions: GridOptions;
    constructor(
        private riskfactorInfoService: RiskFactorInfoService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal,
        private scenarioService: ScenarioService
    ) {
        this.rowHeight = 44;
        this.gridOptions = <GridOptions>{
            enableSorting: true,
            enableFilter: true
        };

        this.rowSelection = 'multiple';
        this.rowModelType = 'serverSide';
        this.paginationPageSize = 100;
        this.cacheOverflowSize = 2;
        this.maxConcurrentDatasourceRequests = 1;
        this.infiniteInitialRowCount = 1000;
        this.maxBlocksInCache = 2;
        this.sideBar = 'columns';
    }

    ngOnInit() {
        this.linkID = this.route.snapshot.fragment;
        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }

        if (this.route.snapshot.params.message != null || this.route.snapshot.params.message != undefined) {
            this.showSuccessValidations(true, 'RiskFactorLibrary Data deleted successfully.');
        }
    }

    onRowClicked(e) {
        if (e.event.target !== undefined) {
            const data = e.data;
            let rfId = e.data.ID;
            let rfName = e.data.SHOCK_RULE_KEY_ID;
            const actionType = e.event.target.getAttribute('data-action-type');

            data['createFilter'] = JSON.stringify(this.createFilter);
            data['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
            switch (actionType) {
                case 'edit':
                    return this.navigateToConfigure(data);
            }
            switch (actionType) {
                case 'tsPlot':
                    return this.openSparkLineDataForRFLibrary(rfId, rfName);
            }
        }
    }

    goToBulkRiskinfo() {
        const filterData = [];
        filterData['createFilter'] = JSON.stringify(this.createFilter);

        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        let url = 'dataUtility/riskfactorinfo/bulkRiskfactor';
        this.router.navigate([url, filterData], { skipLocationChange: true });
    }
    navigateToConfigure(data) {
        this.router.navigate(['dataUtility/riskfactorinfo/riskfactorLib', data], { skipLocationChange: true });
    }
    navigateToNewRF(link) {
        const filterData = [];
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        this.router.navigate([link, filterData], { skipLocationChange: true });
    }
    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isFailure = showMessage;
        this.displayFailureMessage = displayValidationMessage;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
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
    removeData(id) {
        $('#' + id).remove();
        $('#customTaxonomyTextId').focus();
    }

    plotTimeseries(element, timeSeriesData, rfName) {
        let x = [];
        let text = [];
        let y = [];
        let i = 0;

        Object.keys(timeSeriesData).forEach(key => {
            x.push(key);
            y.push(timeSeriesData[key]);
            text.push(key + ',' + timeSeriesData[key]);
        });

        let data = [
            {
                x: x,
                y: y,
                hoverinfo: 'text',
                line: {
                    color: 'rgba(76, 17, 48, 1)',
                    width: 1
                },
                name: rfName,
                text: text,
                type: 'scatter'
            }
        ];

        var layout = {
            autosize: true,
            font: { family: 'roboto' },
            height: 400,
            hovermode: 'closest',
            margin: {
                l: 50,
                r: 20,
                b: 50,
                t: 50,
                pad: 10
            },
            showlegend: false,
            title: rfName,
            xaxis: {
                rangeslider: true,
                showline: true,
                tickmode: 'auto',
                type: 'date'
            },
            yaxis: {
                showline: true
            }
        };

        Plotly.newPlot(element, data, layout, { responsive: true });
    }
    openSparkLineDataForRFLibrary(rfId, rfName) {
        this.scenarioService.getSparkLineDataForRFLibrary(rfId).subscribe(
            response => {
                this.modalService.open(this.sparkLineRFModal, { size: 'lg', windowClass: 'custom-modal-class' });

                setTimeout(() => {
                    let element = document.getElementById('sparkLineChartId');
                    this.plotTimeseries(element, response, rfName);
                }, 100);
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }
    downloadTimeSeriesData() {
        let riskfactorIdList = [];

        if (this.itemList.length > 0) {
            this.itemList.forEach(element => {
                riskfactorIdList.push(element.ID);
            });
            let obj = {
                riskfactorIdList: riskfactorIdList
            };
            this.downloadType = 'Downloading';
            this.scenarioService.downloadTimeSeriesData(obj).subscribe(
                response => {
                    this.downloadType = 'Downloaded';
                    console.log(response);
                    let blob = new Blob([response]);
                    let fileName = 'MarketData.zip';
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, fileName);
                    } else {
                        var objectUrl = window.URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = objectUrl;
                        a.download = fileName;
                        a.target = '_blank';
                        a.click();
                        a.remove();
                    }
                },
                response => {
                    this.showErrorValidations(true, 'TimeSeries data not found for selected Risk Factors.');
                }
            );
        } else {
            this.showErrorValidations(true, 'No riskfactors to dowlonad the Market Data');
        }
    }
    agGridConfig() {
        this.getRowNodeId = function(item) {
            return item.id;
        };
        this.defaultColDef = {
            sortable: true,
            resizable: true
        };

        this.components = {
            loadingCellRenderer: params => {
                if (params.value !== undefined) {
                    return params.value;
                }
            }
        };

        this.overlayNoRowsTemplate =
            '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">No Records Found</span>';
        this.columnDefs = [
            {
                headerName: 'EDIT',
                template: this.template1,
                suppressMenu: true,
                suppressFilter: true,
                sortable: false,
                width: 40
            },
            {
                headerName: 'SHOCK RULE',
                children: [
                    {
                        headerName: 'SHOCK RULE KEY',
                        //  template: template12,
                        field: 'SHOCK_RULE_KEY_ID',
                        width: 250,
                        filter: 'agSetColumnFilter',
                        //cellRendererFramework: ViewDetailsComponent,
                        menuTabs: ['filterMenuTab'],
                        //suppressMenu: true,
                        filterParams: {
                            values: this.shockrulekeyid,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    }
                ]
            },
            {
                headerName: 'TS PLOT',
                children: [
                    {
                        headerName: 'TS PLOT',
                        field: 'TS PLOT',
                        template: this.template2,
                        width: 90,
                        suppressMenu: true,
                        suppressFilter: true,
                        sortable: false
                    }
                ]
            },

            {
                headerName: 'RISKFACTOR LIBRARY INFO',
                children: [
                    {
                        headerName: 'TRANSFORMATION',
                        // columnGroupShow: "closed",
                        field: 'TRANSFORMATION_ID',
                        width: 140,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.TRANSFORMATIONID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'MISVALTREATMETH',
                        // columnGroupShow: "open",
                        field: 'MIS_VAL_TREAT_METH_ID',
                        width: 140,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.MISVALTREATMETHID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'RF CATEGORY',
                        // columnGroupShow: "open",
                        field: 'RF_CATEGORY_ID',
                        width: 140,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.RFCATEGORYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'METHODOLOGY',
                        // columnGroupShow: "open",
                        field: 'METHODOLOGY_ID',
                        width: 130,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.METHODOLOGYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'INTERPOLATION',
                        // columnGroupShow: "open",
                        field: 'INTERPOLATION_TYPE_ID',
                        width: 140,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.INTERPOLATIONTYPEID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'PROXY',
                        // columnGroupShow: "open",
                        field: 'ARITHMATIC_FORMULA',
                        width: 140,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.ARITHMATICFORMULA,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    }
                ]
            },
            {
                headerName: 'META DATA INFO',
                children: [
                    {
                        headerName: 'ASSET CLASS',
                        field: 'ASSET_CLASS_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.assetclassid,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    /*  {
                                        headerName: 'DESCRIPTION',
                                        field: 'DESCRIPTION',
                                        width: 160,
                                        filter: 'agSetColumnFilter',
                                        menuTabs: ['filterMenuTab'],
                                        filterParams: {
                                            values: this.description,
                                            newRowsAction: 'keep'
                                        }
                                    }, */

                    {
                        headerName: 'RISK FACTOR TYPE',
                        field: 'RISK_FACTOR_TYPE_ID',
                        width: 130,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.RISKFACTORTYPEID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'SUB RISK TYPE',
                        field: 'SUB_RISK_FACTOR_TYPE',
                        width: 150,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.SUBRISKFACTORTYPE,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    ,
                    {
                        headerName: 'ASSET NAME',
                        field: 'ASSET_NAME',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.ASSETNAME,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'COUNTRY',
                        field: 'COUNTRY_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.COUNTRYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'CURRENCY',
                        field: 'CURRENCY_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.CURRENCYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'EXPIRY ID',
                        field: 'EXPIRY_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.expiryid,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'MATURITY',
                        field: 'MATURITY_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.MATURITYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'UNIT',
                        field: 'UNIT_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.UNITID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'SECTOR',
                        field: 'SECTOR_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.SECTORID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'SENIORITY',
                        field: 'SENIORITY',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.seniority,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'RATING',
                        field: 'RATING_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.RATINGID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'LIQUIDITYCATEGORY ID',
                        field: 'LIQUIDITY_CATEGORY_ID',
                        width: 150,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.liquiditycategoryid,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'SYSTEM NAME',
                        field: 'SYSTEM_NAME',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.systemname,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'EXTERNAL ID',
                        field: 'EXTERNAL_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.externalid,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'FREQUENCY',
                        field: 'FREQUENCY_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.FREQUENCYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'CURVE FAMILY',
                        field: 'CURVE_FAMILY_ID',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.CURVEFAMILYID,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    },
                    {
                        headerName: 'DESCRIPTION',
                        field: 'DESCRIPTION',
                        width: 120,
                        filter: 'agSetColumnFilter',
                        menuTabs: ['filterMenuTab'],
                        filterParams: {
                            values: this.DESCRIPTION,
                            newRowsAction: 'keep',
                            selectAllOnMiniFilter: true,
                            clearButton: true
                        }
                    }
                ]
            }
        ];

        this.context = { componentParent: this };
    }

    loadMetaDataByAppliedFilter(filtersData) {
        this.filtersApplied = false;
        this.createFilter = filtersData.createFilter;
        this.masterDataObjForFilters = filtersData.masterDataObjForFilters;
        this.filtersApplied = true;
        this.loadDataForAppliedFilter('');
    }

    showFilterComponentMessage(val) {
        this.showErrorValidations(true, val);
    }
    clearMetaData() {
        this.itemList = [];
        this.filtersApplied = false;
        this.createFilter = { SEARCH_STR: [''] };
        this.masterDataObjForFilters = {};
    }

    onGridReady(params) {
        this.gridObj = params;
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.loadDataForAppliedFilter(params);
    }

    loadDataForAppliedFilter(params) {
        this.agGridConfig();
        this.iscount = true;
        let ds = this.datasource();
        this.gridApi.setServerSideDatasource(ds);
    }

    datasource() {
        return {
            getRows: params => {
                let obj = {
                    createFilter: this.createFilter,
                    pageIndex: params.request.startRow || 0,
                    pageSize: this.pageSize,
                    filterModels: params.request.filterModel,
                    iscount: this.iscount
                };

                let page = params.request.endRow / 100;
                // if (this.totalSize >= params.request.startRow) {
                this.riskfactorInfoService.getPageNationData(obj).subscribe(
                    (response: any) => {
                        this.filtersApplied = true;
                        this.infoList = response;
                        this.headerList = response['HEADERS'];
                        this.itemList = response['RECORDS'];
                        this.columnList = response['COLUMNS'];
                        if (this.iscount) {
                            this.totalSize = response['TOTALRECORDS'];
                            this.iscount = false;
                        }

                        setTimeout(() => {
                            let lastRow = -1;
                            if (this.totalSize <= params.request.endRow) {
                                lastRow = this.totalSize;
                            }
                            params.successCallback(this.itemList, lastRow);
                            this.gridApi.resetRowHeights();
                            if (this.totalSize === 0) {
                                this.gridApi.showNoRowsOverlay();
                            }
                        }, 500);

                        this.rowEnds = params.request.endRow;
                        if (this.totalSize < this.rowEnds) {
                            this.rowEnds = this.totalSize;
                        }

                        this.itemList.forEach(element => {
                            if (this.shockrulekeyid.indexOf(element.SHOCK_RULE_KEY_ID) === -1) {
                                this.shockrulekeyid.push(element.SHOCK_RULE_KEY_ID);
                            }
                            if (this.TRANSFORMATIONID.indexOf(element.TRANSFORMATION_ID) === -1) {
                                this.TRANSFORMATIONID.push(element.TRANSFORMATION_ID);
                            }

                            if (this.MISVALTREATMETHID.indexOf(element.MIS_VAL_TREAT_METH_ID) === -1) {
                                this.MISVALTREATMETHID.push(element.MIS_VAL_TREAT_METH_ID);
                            }
                            if (this.RFCATEGORYID.indexOf(element.RF_CATEGORY_ID) === -1) {
                                this.RFCATEGORYID.push(element.RF_CATEGORY_ID);
                            }
                            if (this.METHODOLOGYID.indexOf(element.METHODOLOGY_ID) === -1) {
                                this.METHODOLOGYID.push(element.METHODOLOGY_ID);
                            }
                            if (this.INTERPOLATIONTYPEID.indexOf(element.INTERPOLATION_TYPE_ID) === -1) {
                                this.INTERPOLATIONTYPEID.push(element.INTERPOLATION_TYPE_ID);
                            }
                            if (this.ARITHMATICFORMULA.indexOf(element.ARITHMATIC_FORMULA) === -1) {
                                this.ARITHMATICFORMULA.push(element.ARITHMATIC_FORMULA);
                            }
                            if (this.assetclassid.indexOf(element.ASSET_CLASS_ID) === -1) {
                                this.assetclassid.push(element.ASSET_CLASS_ID);
                            }
                            if (this.description.indexOf(element.DESCRIPTION) === -1) {
                                this.description.push(element.DESCRIPTION);
                            }

                            // this.shockruleKey= this.shockruleKey.filter((el, i, a) => i === a.indexOf(el));
                            if (this.RISKFACTORTYPEID.indexOf(element.RISK_FACTOR_TYPE_ID) === -1) {
                                this.RISKFACTORTYPEID.push(element.RISK_FACTOR_TYPE_ID);
                            }

                            if (this.SUBRISKFACTORTYPE.indexOf(element.SUB_RISK_FACTOR_TYPE) === -1) {
                                this.SUBRISKFACTORTYPE.push(element.SUB_RISK_FACTOR_TYPE);
                            }

                            if (this.ASSETNAME.indexOf(element.ASSET_NAME) === -1) {
                                this.ASSETNAME.push(element.ASSET_NAME);
                            }

                            if (this.COUNTRYID.indexOf(element.COUNTRY_ID) === -1) {
                                this.COUNTRYID.push(element.COUNTRY_ID);
                            }

                            if (this.CURRENCYID.indexOf(element.CURRENCY_ID) === -1) {
                                this.CURRENCYID.push(element.CURRENCY_ID);
                            }

                            if (this.expiryid.indexOf(element.EXPIRY_ID) === -1) {
                                this.expiryid.push(element.EXPIRY_ID);
                            }

                            if (this.MATURITYID.indexOf(element.MATURITY_ID) === -1) {
                                this.MATURITYID.push(element.MATURITY_ID);
                            }

                            if (this.UNITID.indexOf(element.UNIT_ID) === -1) {
                                this.UNITID.push(element.UNIT_ID);
                            }

                            if (this.seniority.indexOf(element.SENIORITY) === -1) {
                                this.seniority.push(element.SENIORITY);
                            }

                            if (this.SECTORID.indexOf(element.SECTOR_ID) === -1) {
                                this.SECTORID.push(element.SECTOR_ID);
                            }

                            if (this.liquiditycategoryid.indexOf(element.LIQUIDITY_CATEGORY_ID) === -1) {
                                this.liquiditycategoryid.push(element.LIQUIDITY_CATEGORY_ID);
                            }

                            if (this.RATINGID.indexOf(element.RATING_ID) === -1) {
                                this.RATINGID.push(element.RATING_ID);
                            }

                            if (this.systemname.indexOf(element.SYSTEM_NAME) === -1) {
                                this.systemname.push(element.SYSTEM_NAME);
                            }

                            if (this.externalid.indexOf(element.EXTERNAL_ID) === -1) {
                                this.externalid.push(element.EXTERNAL_ID);
                            }

                            if (this.FREQUENCYID.indexOf(element.FREQUENCY_ID) === -1) {
                                this.FREQUENCYID.push(element.FREQUENCY_ID);
                            }

                            if (this.CURVEFAMILYID.indexOf(element.CURVE_FAMILY_ID) === -1) {
                                this.CURVEFAMILYID.push(element.CURVE_FAMILY_ID);
                            }

                            if (this.DESCRIPTION.indexOf(element.DESCRIPTION) === -1) {
                                this.DESCRIPTION.push(element.DESCRIPTION);
                            }
                        });
                    },
                    error => (this.error = error)
                );
                // }
            }
        };
    }
}
