import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RegulatoryMappingService } from 'app/regulatoryMapping/regulatoryMapping.service';
import * as GC from '@grapecity/spread-sheets';

import { ALERT_MSG_TIME_OUT } from 'app/constants';

@Component({
    selector: 'jhi-home',
    templateUrl: './bulkRegulatoryMapping.component.html',
    styleUrls: ['regulatoryMapping.css']
})
export class BulkRegulatoryMappingComponent implements OnInit {
    dropdownList = [];
    params: any;
    rowHeight: any;
    selectedItems = [];
    dropdownSettings = {};
    assetClassList = [];
    assetClassIds = [];
    newColumns = [];
    regulatoryList = [];
    columnDefs = [];
    regulatoryNameList = [];
    rowData = [];
    backupData = [];
    dataList = [];
    shockIdList = [];
    headerList = [];
    headerListForSpread = [];
    dataListForSpread = [];
    columnList = [];
    tempData = [];
    regMapList = [];
    regSelectedItems = [];
    regTypeId = null;

    regTypeData = [];
    filterData = {
        assetIds: [],
        regType: null
    };
    gridApi;
    data = [];
    defaultColDef;
    regulatoryMappingDTOList = [];
    regulatoryMappingDTO = {
        sub_classification_id: null,
        regularity_rf_id: [],
        shockRuleKeyIdList: [],
        selSpreadSheetDataList: null
    };
    newComponentDL = [];
    clickedIndex = [];
    cacheBlockSize;
    maxBlocksInCache;
    sideBar;
    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    obj: any;
    mneerror: any;
    showerror: any;
    tempThis: any;

    createFilter = { SEARCH_STR: [''] };
    masterDataObjForFilters = {};
    filtersApplied = false;
    selectedFilter: any;

    checkList = [];
    shockRuleIdList = [];
    selectedSheetData = [];
    sheetList;
    isToggleEnabled;
    rfIds = [];
    option = {
        allowSelectLockedCells: true,
        allowSelectUnlockedCells: true,
        allowFilter: true,
        allowSort: false,
        allowResizeRows: true,
        allowResizeColumns: true,
        allowEditObjects: true,
        allowDragInsertRows: false,
        allowDragInsertColumns: false,
        allowInsertRows: false,
        allowInsertColumns: false,
        allowDeleteRows: false,
        allowDeleteColumns: false,
        allowClearContents: false
    };
    startLimit = 0;
    endLimit = 100;
    isScrolled = false;
    scrollCount = 0;

    startLimit1 = 0;
    endLimit1 = 100;
    isScrolled1 = false;
    scrollCount1 = 0;

    constructor(private router: Router, private route: ActivatedRoute, private regulatoryMappingService: RegulatoryMappingService) {
        this.cacheBlockSize = 100;
        this.rowHeight = 44;
        this.maxBlocksInCache = 2;
        this.sideBar = 'columns';
    }
    spread = null;
    sheet = null;
    ngOnInit() {
        this.newColumns = ['Transformation', 'treatment Methodology', 'RF Category', 'Methodology', 'Formula'];
        this.regTypeId = this.route.snapshot.params.regTypeId;
        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }

        this.regulatoryMappingService.getRegulatory().subscribe((response: any) => {
            this.regulatoryList = response;
            this.regMapList = [];
            for (let column = 0; column < this.regulatoryList.length; column++) {
                let temp = { item_id: null, item_text: null };
                temp.item_id = this.regulatoryList[column].value + '';
                temp.item_text = this.regulatoryList[column].label + '';
                this.regMapList.push(temp);
            }
        });
    }

    loadMetaDataByAppliedFilter(filtersData) {
        this.createFilter = filtersData.createFilter;
        this.masterDataObjForFilters = filtersData.masterDataObjForFilters;
        this.headerList = [];
        // this.dataList = [];
        this.headerListForSpread = [];
        // this.dataListForSpread = [];
        this.selectedSheetData = [];
        this.isFailure = false;
        this.isSuccess = false;

        if (!this.regTypeId || this.regTypeId == 'null' || this.regTypeId == 'undefined') {
            this.showErrorValidations(true, 'Please Enter Regulator Type');
            return false;
        }

        this.filtersApplied = true;
        this.startLimit = 0;
        this.isScrolled = false;
        this.dataList = [];

        this.startLimit1 = 0;
        this.isScrolled1 = false;
        this.dataListForSpread = [];
        this.getRegulatoryData();
    }

    showFilterComponentMessage(val) {
        this.showErrorValidations(true, val);
    }

    clearMetaData() {
        this.headerList = [];
        this.dataList = [];
        this.headerListForSpread = [];
        this.dataListForSpread = [];
        this.selectedSheetData = [];
        this.isFailure = false;
        this.isSuccess = false;
        this.filtersApplied = false;
        this.createFilter = { SEARCH_STR: [''] };
        this.masterDataObjForFilters = {};
    }

    getRegulatoryData() {
        if (this.isScrolled) {
            this.startLimit = this.startLimit + 100;
        }
        if (this.isScrolled1) {
            this.startLimit1 = this.startLimit1 + 100;
        }
        let obj = {
            createFilter: this.createFilter,
            regularityType: this.regTypeId,
            startLimit: this.startLimit,
            endLimit: this.endLimit,
            startLimit1: this.startLimit1,
            endLimit1: this.endLimit1
        };

        this.regulatoryMappingService.getRMInfoByAssertClasses(obj).subscribe((response: any) => {
            try {
                this.headerList = response['HEADERS'];
                const dataList = response['DATA'];
                this.headerListForSpread = response['HEADERSFORSPREAD'];
                const dataListForSpread = response['DATAFORSPREAD'];

                if (this.dataList.length == 0) {
                    this.dataList = dataList;
                } else {
                    if (this.isScrolled) {
                        this.dataList = this.dataList.concat(dataList);
                    }
                }

                if (this.dataListForSpread.length == 0) {
                    this.dataListForSpread = dataListForSpread;
                } else {
                    if (this.isScrolled1) {
                        this.dataListForSpread = this.dataListForSpread.concat(dataListForSpread);
                    }
                }

                this.scrollCount = Math.floor(this.dataList.length / 100);

                this.scrollCount1 = Math.floor(this.dataListForSpread.length / 100);

                if (this.startLimit == 0 && this.startLimit1 == 0) {
                    let ele = document.getElementById('viewSpreadSheet');
                    ele.innerHTML = '';
                    this.spread = new GC.Spread.Sheets.Workbook(ele);
                }
                let sheetCounts = this.spread.getSheetCount();
                if (sheetCounts == 1 && this.startLimit == 0) {
                    var newSheetInstance = new GC.Spread.Sheets.Worksheet('Regulatory Master Data');
                    this.spread.addSheet(sheetCounts, newSheetInstance);
                }

                let sheetCount = this.spread.getSheetCount();
                for (var i = 0; i < sheetCount; i++) {
                    this.sheet = this.spread.getSheet(i);
                    var sheetName = this.sheet.name();
                    if (i == 0) {
                        this.sheet.name('Regulatory Mapping');
                        this.sheet = this.spread.getSheet(0);
                        this.sheet.suspendPaint();
                        this.sheet.frozenColumnCount(4);
                        this.sheet.setColumnCount(this.headerList.length + 2);
                        this.sheet.setRowCount(this.dataList.length);
                        this.tempThis = this.sheet;
                        var sel = 'Select';
                        this.sheet.setValue(0, 1, sel, GC.Spread.Sheets.SheetArea.colHeader);
                        this.sheet.setColumnWidth(1, 60);
                        var captionCellType = new GC.Spread.Sheets.CellTypes.CheckBox();

                        for (let column = this.startLimit; column <= this.dataList.length; column++) {
                            this.sheet.setCellType(column, 1, captionCellType);
                            this.sheet
                                .getCell(column, 1)
                                .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
                                .vAlign(GC.Spread.Sheets.VerticalAlign.center);
                        }

                        for (let column = 2; column <= this.headerList.length + 1; column++) {
                            this.sheet.setValue(0, column, this.headerList[column - 2], GC.Spread.Sheets.SheetArea.colHeader);
                            this.sheet.setColumnWidth(column, 150);
                        }

                        var filter = new GC.Spread.Sheets.Filter.HideRowFilter(
                            new GC.Spread.Sheets.Range(-1, -1, -1, this.dataList.length)
                        );
                        this.sheet.rowFilter(filter);
                        this.sheet.setColumnVisible(2, false);
                        this.sheet.setColumnVisible(0, false);
                        this.sheet.setArray(this.startLimit, 2, this.dataList.slice(this.startLimit));

                        this.sheet.options.isProtected = true;
                        this.sheet.getRange(0, 4, this.sheet.getRowCount(), 1).locked(false);
                        this.sheet.options.protectionOptions = this.option;
                        let current = this;
                        this.sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
                            if (args.newTopRow == current.dataList.length - 1) {
                                if (current.dataList.length / (current.scrollCount * 100) == 1) {
                                    current.scrollCount = current.scrollCount + 1;
                                    current.isScrolled = true;
                                    current.getRegulatoryData();
                                }
                                return false;
                            }
                            return false;
                        });

                        this.spread.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, args) {
                            var sheet = args.sheet,
                                row = args.row,
                                col = args.col;
                            if (args.newValue == null) {
                                sheet.setValue(row, 1, null);
                            } else {
                                sheet.setValue(row, 1, true);
                            }
                        });

                        this.spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, function(e, args) {
                            var sheet = args.sheet,
                                row = args.cellRange['row'],
                                col = args.cellRange['col'];
                            let copiedData = args.pasteData['text'];
                            let mulCopyData = copiedData.split('\n');

                            for (let j = 0; j < mulCopyData.length; j++) {
                                if (mulCopyData[j].trim() == '') {
                                    sheet.setValue(row + j, 1, null);
                                } else {
                                    sheet.setValue(row + j, 1, true);
                                }
                            }
                        });
                        this.spread.bind(GC.Spread.Sheets.Events.DragFillBlockCompleted, function(e, args) {
                            var sheet = args.sheet,
                                row = args.fillRange['row'],
                                col = args.fillRange['col'],
                                rowCount = args.fillRange['rowCount'];

                            for (let j = 0; j < rowCount; j++) {
                                sheet.setValue(row + j, 1, true);
                            }
                        });

                        this.sheet.resumePaint();
                    } else {
                        this.sheet.suspendPaint();
                        this.sheet.frozenColumnCount(4);
                        this.sheet.setColumnCount(this.headerListForSpread.length + 2);
                        this.sheet.setRowCount(this.dataListForSpread.length);
                        var sel = 'Select';
                        this.sheet.setValue(0, 1, sel, GC.Spread.Sheets.SheetArea.colHeader);
                        this.sheet.setColumnWidth(1, 60);
                        var captionCellType = new GC.Spread.Sheets.CellTypes.CheckBox();
                        for (let column = this.startLimit1; column <= this.dataListForSpread.length; column++) {
                            this.sheet.setCellType(column, 1, captionCellType);
                            this.sheet
                                .getCell(column, 1)
                                .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
                                .vAlign(GC.Spread.Sheets.VerticalAlign.center);
                        }
                        for (let column = 2; column <= this.headerListForSpread.length + 1; column++) {
                            this.sheet.setValue(0, column, this.headerListForSpread[column - 2], GC.Spread.Sheets.SheetArea.colHeader);
                            this.sheet.setColumnWidth(column, 180);
                        }
                        var filter = new GC.Spread.Sheets.Filter.HideRowFilter(
                            new GC.Spread.Sheets.Range(-1, -1, -1, this.dataListForSpread.length)
                        );
                        let current1 = this;
                        this.sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
                            if (args.newTopRow == current1.dataListForSpread.length - 1) {
                                if (current1.dataListForSpread.length / (current1.scrollCount1 * 100) == 1) {
                                    current1.scrollCount1 = current1.scrollCount1 + 1;
                                    current1.isScrolled1 = true;
                                    current1.getRegulatoryData();
                                }
                                return false;
                            }
                            return false;
                        });
                        this.sheet.rowFilter(filter);
                        this.sheet.setColumnVisible(2, false);
                        this.sheet.setColumnVisible(1, false);
                        this.sheet.setColumnVisible(0, false);
                        this.sheet.setArray(this.startLimit1, 2, this.dataListForSpread.slice(this.startLimit1));
                        this.sheet.resumePaint();
                    }
                }
            } catch (error) {
                this.sheet.resumePaint();
            }
        });
    }

    removeValidations(row) {
        var style = new GC.Spread.Sheets.Style();
        style.backColor = 'white';
        style.borderLeft = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        style.borderTop = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        style.borderRight = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        style.borderBottom = new GC.Spread.Sheets.LineBorder('#d9e4f4', GC.Spread.Sheets.LineStyle.thin);
        this.sheet.suspendPaint();
        this.sheet.setStyle(row, 4, style, GC.Spread.Sheets.SheetArea.viewport);
        this.sheet.resumePaint();
    }

    goToRegMap() {
        const filterData = [];
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['regTypeId'] = this.regTypeId;
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        let url = 'dataUtility/regulatorinfo/bulkRegulatoryMapping';
        this.router.navigate([url, filterData], { skipLocationChange: true });
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
    saveBulkRegulatorData() {
        this.checkList = [];
        this.shockRuleIdList = [];

        let sheetData = [];
        let sheetDataArray = [];
        let finalCheckedDatatemp = [];
        let finalCheckedData = [];

        let activeSheet = this.spread.getActiveSheet();
        sheetData = activeSheet.getArray(0, 2, activeSheet.getRowCount(), 1);
        finalCheckedDatatemp = activeSheet.getArray(0, 1, activeSheet.getRowCount(), 4);

        for (let j = 0; j < sheetData.length; j++) {
            sheetDataArray.push(sheetData[j][0]);
        }
        for (let j = 0; j < finalCheckedDatatemp.length; j++) {
            if (finalCheckedDatatemp[j][0] == true) {
                finalCheckedData.push(finalCheckedDatatemp[j]);
            }
        }
        for (let i = 0; i < finalCheckedData.length; i++) {
            if (finalCheckedData[i][1] != null) {
                this.shockRuleIdList.push(finalCheckedData[i][1]);
            }
        }
        if (this.rfIds != null && this.rfIds.length > 0) {
            for (let i = 0; i < this.rfIds.length; i++) {
                let rowIndex = sheetDataArray.indexOf(this.rfIds[i]);
                this.removeValidations(rowIndex);
            }
        }

        this.regulatoryMappingDTO.shockRuleKeyIdList = this.shockRuleIdList;
        this.regulatoryMappingDTO.sub_classification_id = this.regTypeId;
        let checkedList = [];
        checkedList = this.getUnique(finalCheckedData, 1);
        this.regulatoryMappingDTO.selSpreadSheetDataList = checkedList;
        this.regulatoryMappingService.saveRegulatoryMappingDataList(this.regulatoryMappingDTO).subscribe(
            response => {
                this.rfIds = response;
                for (let i = 0; i < this.rfIds.length; i++) {
                    let rowIndex = sheetDataArray.indexOf(this.rfIds[i]);
                    this.displayValidations(rowIndex);
                }
                if (response.length == 0) {
                    this.showSuccessValidations(true, 'Bulk Regulatory Data saved successfully.');
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    getUnique(arr, comp) {
        const unique = arr
            .map(e => e[comp])

            .map((e, i, final) => final.indexOf(e) === i && i)

            .filter(e => arr[e])
            .map(e => arr[e]);

        return unique;
    }

    displayValidations(rowIndex) {
        let style = new GC.Spread.Sheets.Style();
        this.sheet = this.spread.getActiveSheet();
        style.backColor = 'red';
        style.borderLeft = new GC.Spread.Sheets.LineBorder('#000000');
        style.borderTop = new GC.Spread.Sheets.LineBorder('#000000');
        style.borderRight = new GC.Spread.Sheets.LineBorder('#000000');
        style.borderBottom = new GC.Spread.Sheets.LineBorder('#000000');
        this.sheet.suspendPaint();
        let r = this.sheet.getRange(rowIndex, 4, 1, 1);
        r.setBorder(new GC.Spread.Sheets.LineBorder('#000000', GC.Spread.Sheets.LineStyle.thin), { all: true });
        this.sheet.setStyle(rowIndex, 4, style);
        this.sheet.getCell(rowIndex, 4, GC.Spread.Sheets.SheetArea.viewport).locked(false);

        this.sheet.resumePaint();
    }

    isExists(index, selectedValue) {
        let originalVal = this.backupData[index];
        if (originalVal != selectedValue) {
            return true;
        }
    }

    navigateToRegularityInfo() {
        const filterData = [];
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        filterData['regTypeId'] = this.regTypeId;
        let url = 'dataUtility/regulatorinfo';
        this.router.navigate([url, filterData], { skipLocationChange: true });
    }
}
