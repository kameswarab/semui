import { Component, OnInit } from '@angular/core';
import { RiskFactorInfoService } from 'app/riskfactorInfo/riskfactorInfo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskFactorLibService } from 'app/riskFactorLibrary/riskfactorLib.service';
import 'ag-grid-enterprise';
import { GridOptions } from 'ag-grid/main';
import { BulkRiskFactorInfoService } from 'app/bulkRiskFactor';

import { ALERT_MSG_TIME_OUT } from 'app/constants';
@Component({
    selector: 'jhi-home',
    templateUrl: './regulatorInfo.component.html',
    styleUrls: ['riskfactorInfo.css']
})
export class RegulatorInfoComponent implements OnInit {
    infoList: any = [];
    riskDetails: any = [];
    totalSize = 0;
    pageSize = 100;
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

    /* for filters */
    filterList = [];
    filterIcon = false;
    rowHeight: any;
    masterDataObj = {};
    masterDataMapObj = {};
    masterDataMap = {};
    filtersApplied = false;
    createFilter = { SEARCH_STR: [''] };
    filterOrderMap = {};
    masterDataObjForFilters = {};
    shockIdList = [];
    paginationNumberFormatter;
    infiniteInitialRowCount;
    maxConcurrentDatasourceRequests;
    maxBlocksInCache;
    rowSelection;
    defaultColDef;
    /* for filters end*/
    //------------for Ag-grid-------------
    public listingGridOptions: GridOptions;
    columnDefs = [];
    rowData = [];
    SHOCKRULEKEYID = [];
    ASSETCLASSID = [];
    RISKFACTORTYPEID = [];
    SUBRISKFACTORTYPE = [];
    ASSETNAME = [];
    COUNTRYID = [];
    CURRENCYID = [];
    MATURITYID = [];
    UNITID = [];
    SECTORID = [];
    RATINGID = [];
    FREQUENCYID = [];
    CURVEFAMILYID = [];
    DESCRIPTION = [];
    rowModelType;
    cacheBlockSize;
    sideBar;
    getRowNodeId;
    components;
    gridApi;
    gridColumnApi;
    gridObj: any;
    selectedFilter: any;
    selectedValue: any;
    paginationPageSize;
    regTypeId = null;
    error: any;
    itemList = [];
    overlayNoRowsTemplate;
    iscount: boolean;
    rowEnds: any;
    context: any;
    columnNameVsUserName = {
        SHOCK_RULE_KEY_ID: 'SHOCK RULE KEY',
        ASSET_CLASS_ID: 'ASSET CLASS',
        RISK_FACTOR_TYPE_ID: 'RISKFACTOR TYPE',
        SUB_RISK_FACTOR_TYPE: 'SUBRISKFACTOR TYPE',
        ASSET_NAME: 'ASSET NAME',
        COUNTRY_ID: 'COUNTRY',
        CURRENCY_ID: 'CURRENCY',
        MATURITY_ID: 'MATURITY',
        UNIT_ID: 'UNIT',
        SECTOR_ID: 'SECTOR',
        RATING_ID: 'RATING',
        FREQUENCY_ID: 'FREQUENCY',
        CURVE_FAMILY_ID: 'CURVEFAMILY',
        DESCRIPTION: 'DESCRIPTION'
    };
    template1 = `<img  data-action-type="edit" src="./content/images/svg/edit.png" alt="Sem-icons" class="img-edit">`;
    constructor(
        private riskfactorInfoService: RiskFactorInfoService,
        private riskfactorLibService: RiskFactorLibService,
        private route: ActivatedRoute,
        private router: Router,
        private bulkRiskFactorInfoService: BulkRiskFactorInfoService
    ) {
        this.listingGridOptions = <GridOptions>{};
        this.listingGridOptions.rowHeight = 44;
        this.rowModelType = 'serverSide';
        this.maxBlocksInCache = 2;
        this.rowHeight = 44;
        this.paginationPageSize = 100;
        this.defaultColDef = {
            sortable: true,
            resizable: true
        };
        this.sideBar = 'columns';
        this.rowSelection = 'multiple';
        this.maxConcurrentDatasourceRequests = 2;
        this.infiniteInitialRowCount = 1;
        this.getRowNodeId = function(item) {
            return item.id;
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

        this.paginationNumberFormatter = function(params) {
            return params.value.toLocaleString();
        };
    }

    ngOnInit() {
        this.regTypeId = this.route.snapshot.params.regTypeId;
        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }
    }

    loadMetaDataByAppliedFilter(filtersData) {
        console.log('filtersData :', filtersData);
        this.filtersApplied = true;
        this.createFilter = filtersData.createFilter;
        this.masterDataObjForFilters = filtersData.masterDataObjForFilters;
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
                    iscount: this.iscount
                };
                this.riskfactorInfoService.getPageNationRegulatorData(obj).subscribe((response: any) => {
                    this.infoList = response;
                    this.headerList = response['HEADERS'];
                    this.itemList = response['RECORDS'];

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
                        if (this.SHOCKRULEKEYID.indexOf(element.SHOCK_RULE_KEY_ID) === -1) {
                            this.SHOCKRULEKEYID.push(element.SHOCK_RULE_KEY_ID);
                        }
                    });

                    this.getRowNodeId = function(item) {
                        return item.id;
                    };
                    let columnDefsTemp = [
                        {
                            headerName: 'EDIT',
                            template: this.template1,
                            filter: 'agSetColumnFilter',
                            menuTabs: ['filterMenuTab'],
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
                                    field: 'SHOCK_RULE_KEY_ID',
                                    filter: 'agSetColumnFilter',
                                    menuTabs: ['filterMenuTab'],
                                    filterParams: {
                                        values: this.SHOCKRULEKEYID,
                                        newRowsAction: 'keep',
                                        selectAllOnMiniFilter: true,
                                        clearButton: true
                                    }
                                }
                            ]
                        }
                    ];

                    let childDefs = [];
                    let record = this.itemList[0];
                    let headers = Object.keys(record);
                    let regulatoryMapHeaders;
                    let child = [];

                    regulatoryMapHeaders = headers.filter(
                        p =>
                            p != 'SHOCK_RULE_KEY_ID' &&
                            p != 'ID' &&
                            p != 'ASSET_CLASS_ID' &&
                            p != 'RISK_FACTOR_TYPE_ID' &&
                            p != 'SUB_RISK_FACTOR_TYPE' &&
                            p != 'ASSET_NAME' &&
                            p != 'COUNTRY_ID' &&
                            p != 'CURRENCY_ID' &&
                            p != 'MATURITY_ID' &&
                            p != 'UNIT_ID' &&
                            p != 'SECTOR_ID' &&
                            p != 'RATING_ID' &&
                            p != 'FREQUENCY_ID' &&
                            p != 'CURVE_FAMILY_ID' &&
                            p != 'DESCRIPTION'
                    );
                    regulatoryMapHeaders.forEach(regulatoryHeader => {
                        child.push({
                            headerName: regulatoryHeader.toUpperCase(),
                            field: regulatoryHeader,
                            filter: 'agSetColumnFilter',
                            menuTabs: ['filterMenuTab'],
                            filterParams: {
                                newRowsAction: 'keep',
                                selectAllOnMiniFilter: true,
                                clearButton: true
                            }
                        });
                    });
                    columnDefsTemp.push({ headerName: 'REGULATORY MAPPING INFO', children: child });

                    let headersList;
                    headersList = headers.filter(
                        p =>
                            p == 'ASSET_CLASS_ID' ||
                            p == 'RISK_FACTOR_TYPE_ID' ||
                            p == 'SUB_RISK_FACTOR_TYPE' ||
                            p == 'ASSET_NAME' ||
                            p == 'COUNTRY_ID' ||
                            p == 'CURRENCY_ID' ||
                            p == 'MATURITY_ID' ||
                            p == 'UNIT_ID' ||
                            p == 'SECTOR_ID' ||
                            p == 'RATING_ID' ||
                            p == 'FREQUENCY_ID' ||
                            p == 'CURVE_FAMILY_ID' ||
                            p == 'DESCRIPTION'
                    );

                    headersList.forEach(header => {
                        childDefs.push({
                            headerName: this.columnNameVsUserName[header],
                            field: header,
                            filter: 'agSetColumnFilter',
                            menuTabs: ['filterMenuTab'],
                            filterParams: {
                                newRowsAction: 'keep',
                                selectAllOnMiniFilter: true,
                                clearButton: true
                            }
                        });
                    });
                    columnDefsTemp.push({ headerName: 'META DATA INFO', children: childDefs });
                    this.columnDefs = columnDefsTemp;

                    this.context = { componentParent: this };
                });
            }
        };
    }

    onRowClicked(e) {
        if (e.event.target !== undefined) {
            const data = e.data;
            const actionType = e.event.target.getAttribute('data-action-type');
            data['createFilter'] = JSON.stringify(this.createFilter);
            data['regTypeId'] = this.regTypeId;
            data['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
            switch (actionType) {
                case 'edit':
                    return this.navigateToRegulatoryMapping(data);
            }
        }
    }
    navigateToRegulatoryMapping(data) {
        this.router.navigate(['dataUtility/regulatorinfo/regulatoryMapping', data], { skipLocationChange: true });
    }
    showErrorValidations(showMessage: boolean, displayValidationMessage: string) {
        this.isFailure = showMessage;
        this.displayFailureMessage = displayValidationMessage;
        setTimeout(() => {
            this.isFailure = false;
            this.displayFailureMessage = '';
        }, ALERT_MSG_TIME_OUT);
    }

    goToBulkRM() {
        const filterData = [];
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['regTypeId'] = this.regTypeId;
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        let url = 'dataUtility/regulatorinfo/bulkRegulatoryMapping';
        this.router.navigate([url, filterData], { skipLocationChange: true });
    }
}
