import { Component, OnInit } from '@angular/core';
import { BulkRiskFactorInfoService } from 'app/bulkRiskFactor/bulkRiskfactorInfo.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as GC from '@grapecity/spread-sheets';
import { RiskFactorLibService } from 'app/riskFactorLibrary/riskfactorLib.service';
import {
    ALERT_MSG_TIME_OUT,
    METHODOLOGY_USER_DEFINED,
    METHODOLOGY_QUANTILE,
    METHODOLOGY_INTERPOLATION,
    METHODOLOGY_PROXY
} from 'app/constants';

@Component({
    selector: 'jhi-home',
    templateUrl: './bulkRiskfactorInfo.component.html',
    styleUrls: ['bulkRiskfactorInfo.css']
})
export class BulkRiskFactorInfoComponent implements OnInit {
    infoList: any = [];
    transformationList = [];
    misValTreatMethList = [];
    columnList = [];
    headerList = [];
    dataList = [];
    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    assetClassList = [];
    assetClassIds = [];
    newColumns = [];
    transformationListData = [];
    misValTreatMethListData = [];
    rfCategoryList = [];
    rfCategoryListData = [];
    methodologyList = [];
    pcaGroupList = [];
    interpolationTypeData = [];
    methodologyListData = [];
    dropDownSelecttionList = [];
    interpolationTypeList = [];
    interpolationTypeListData = [];
    shockRuleIdList = [];
    tempThis: any;
    riskFactorIdList = [];
    riskFactorLibDTOList = [];
    shockIdList = [];
    methodologyListD = [];
    methodologyListDa = [];
    pcaGroupListD = [];
    interpolationTypeDataD = [];
    checkList = [];
    flag = false;
    selectedFilter: any;
    selectedValue: any;
    errorMsg: any;

    riskFactorLibDTO = {
        id: null,
        shockRuleKeyId: null,
        transformationId: null,
        misValTreatMethId: null,
        rfCategoryId: null,
        methodologyId: null,
        interpolationTypeId: null,
        arithmaticFormula: null,
        pcaGroupId: null,
        isDeleted: null
    };
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

    displayFailureMessage: string;
    isFailure = false;
    displaySuccessMessage: string;
    isSuccess = false;
    obj: any;
    mneerror: any;
    showerror: any;
    spread = null;
    sheet = null;

    createFilter = { SEARCH_STR: [''] };
    filterOrderMap = {};
    masterDataObjForFilters = {};
    filterList = [];
    filterIcon = false;
    masterDataObj = {};
    masterDataMapObj = {};
    masterDataMap = {};
    filtersApplied = false;
    startLimit = 0;
    endLimit = 100;
    displayResponse = [];
    isScrolled = false;
    scrollCount = 0;

    constructor(
        private riskfactorInfoService: BulkRiskFactorInfoService,
        private route: ActivatedRoute,
        private router: Router,
        private riskFactorService: RiskFactorLibService
    ) {}

    ngOnInit() {
        let appliedFilter = this.route.snapshot.params.createFilter;
        let filtersData = this.route.snapshot.params.masterDataObjForFilters;
        if (appliedFilter != null && appliedFilter != undefined) {
            this.createFilter = JSON.parse(appliedFilter);
        }
        if (filtersData != null && filtersData != undefined) {
            this.masterDataObjForFilters = JSON.parse(filtersData);
        }

        this.newColumns = ['Transformation', 'treatment Methodology', 'RF Category', 'Methodology', 'Formula'];

        this.loadMasterDataForBulkEdit();

        /*   this.riskFactorService.getTransformation().subscribe((response: any) => {
            
        });
        this.riskFactorService.getMisValTreatMeth().subscribe((response: any) => {
          
        });
        this.riskFactorService.getRfCategory().subscribe((response: any) => {
           
        });

        this.riskFactorService.getMethodologyData().subscribe((response: any) => {
           
        });

        this.riskFactorService.getPcaGroup().subscribe((response: any) => {
            
        });
        this.riskFactorService.getinterpolation().subscribe((response: any) => {
            
        }); */
    }

    loadMasterDataForBulkEdit() {
        this.riskFactorService.getMasterDataForBulkEdit().subscribe(
            response => {
                this.transformationList = response.transformationList;
                this.transformationListData = [];
                this.misValTreatMethList = response.misValTreatMethList;
                this.misValTreatMethListData = [];
                this.rfCategoryList = response.rfCategoryList;
                this.rfCategoryListData = [];
                this.methodologyListD = response.methodologyList;
                this.methodologyListDa = [];
                this.pcaGroupList = response.pcaGroupList;
                this.pcaGroupListD = [];
                this.interpolationTypeData = response.interpolationTypeData;
                this.interpolationTypeDataD = [];

                for (let i = 0; i < this.transformationList.length; i++) {
                    let tempComboData = { text: null, value: null };
                    tempComboData.text = this.transformationList[i].label;
                    tempComboData.value = this.transformationList[i].value;
                    this.transformationListData.push(tempComboData);
                }

                for (let i = 0; i < this.misValTreatMethList.length; i++) {
                    let tempComboData = { text: null, value: null };
                    tempComboData.text = this.misValTreatMethList[i].label;
                    tempComboData.value = this.misValTreatMethList[i].value;
                    this.misValTreatMethListData.push(tempComboData);
                }

                for (let i = 0; i < this.rfCategoryList.length; i++) {
                    let tempComboData = { text: null, value: null };
                    tempComboData.text = this.rfCategoryList[i].label;
                    tempComboData.value = this.rfCategoryList[i].value;
                    this.rfCategoryListData.push(tempComboData);
                }

                for (let i = 0; i < this.methodologyListD.length; i++) {
                    let tempComboData = { text: null, value: null };
                    tempComboData.text = this.methodologyListD[i].label;
                    tempComboData.value = this.methodologyListD[i].value;
                    this.methodologyListDa.push(tempComboData);
                }

                for (let i = 0; i < this.pcaGroupList.length; i++) {
                    let tempComboData = { text: null, value: null };
                    tempComboData.text = this.pcaGroupList[i].label;
                    tempComboData.value = this.pcaGroupList[i].value;
                    this.pcaGroupListD.push(tempComboData);
                }

                for (let i = 0; i < this.interpolationTypeData.length; i++) {
                    let tempComboData = { text: null, value: null };
                    tempComboData.text = this.interpolationTypeData[i].label;
                    tempComboData.value = this.interpolationTypeData[i].value;
                    this.interpolationTypeDataD.push(tempComboData);
                }
            },
            response => {
                this.showErrorValidations(true, response.error);
            }
        );
    }

    navigateToRiskinfo() {
        const filterData = [];
        filterData['createFilter'] = JSON.stringify(this.createFilter);
        filterData['filterOrderMap'] = JSON.stringify(this.filterOrderMap);
        filterData['masterDataObjForFilters'] = JSON.stringify(this.masterDataObjForFilters);
        let url = 'dataUtility/riskfactorinfo';
        this.router.navigate([url, filterData], { skipLocationChange: true });
    }

    getValue(id, ListData) {
        var valueById;
        if (id != null) {
            for (let i = 0; i < ListData.length; i++) {
                if (ListData[i].value == id) {
                    valueById = ListData[i].text;
                    break;
                }
            }
        }
        return valueById;
    }

    getMethodologyValue(rfCatVal, sheet, len, spread, row_1) {
        var rfCategoryId = this.getValueFromId(rfCatVal, this.rfCategoryListData);
        let methodologyFilteredList = this.methodologyListD.filter(item => item.cat_id == rfCategoryId);

        this.methodologyListData = [];
        for (let i = 0; i < methodologyFilteredList.length; i++) {
            let tempComboData = { text: null, value: null };
            tempComboData.text = methodologyFilteredList[i].label;
            tempComboData.value = methodologyFilteredList[i].value;
            this.methodologyListData.push(tempComboData);
        }

        this.createCombo(this.methodologyListData, len + 1, sheet, row_1, null);

        var current = this;
        spread.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, args) {
            var sheet = args.sheet,
                row = args.row,
                col = args.col;
            var cellType = sheet.getCellType(row, col);
            if (cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox && col == len + 1) {
                if (sheet.getCell(row, col).value() == 'PCA group' || sheet.getCell(row, col).value() == 'Interpolation') {
                    current.getGroupData(sheet.getCell(row, col).value(), current.sheet, len, current.spread, row);
                }
            }
        });
    }

    createCombo(data, length, tempThis, row, value) {
        var combo = new GC.Spread.Sheets.CellTypes.ComboBox();
        combo.items(data).editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.text);
        this.sheet
            .getCell(row, length, GC.Spread.Sheets.SheetArea.viewport)
            .cellType(combo)
            .value(value);
        this.sheet.setColumnWidth(length, 150);
    }

    getGroupData(methdlgyVal, sheet, len, spread, row) {
        var methodologyId = this.getValueFromId(methdlgyVal, this.methodologyListData);
        let interpolationFilteredTypeList = this.interpolationTypeData.filter(item => item.METHDLGY_ID == methodologyId);
        this.interpolationTypeListData = [];
        for (let i = 0; i < interpolationFilteredTypeList.length; i++) {
            let tempComboData = { text: null, value: null };
            tempComboData.text = interpolationFilteredTypeList[i].label;
            tempComboData.value = interpolationFilteredTypeList[i].value;
            this.interpolationTypeListData.push(tempComboData);
        }

        this.createCombo(this.interpolationTypeListData, len + 2, sheet, row, null);
    }

    saveBulkRiskFactorConfigData() {
        this.checkList = [];
        this.shockRuleIdList = [];
        for (let row = 0, i = 0; row <= this.dataList.length; row++) {
            if (this.tempThis.getCell(row, 1).value() == true) {
                this.checkList.push(row);
                this.shockRuleIdList.push(this.shockIdList[row]);
                i++;
            }
        }
        if (this.shockRuleIdList.length == 0) {
            this.showErrorValidations(true, 'Please do proper mapping.');
            return false;
        }
        for (let i = 0; i < this.shockRuleIdList.length; i++) {
            this.riskFactorLibDTO.id = null;
            this.riskFactorLibDTO.shockRuleKeyId = this.shockRuleIdList[i];
            if (this.tempThis.getCell(this.checkList[i], this.headerList.length - 3).value() != null) {
                this.riskFactorLibDTO.transformationId = this.getValueFromId(
                    this.tempThis
                        .getCell(this.checkList[i], this.headerList.length - 3)
                        .value()
                        .trim(),
                    this.transformationListData
                );
            }
            if (this.tempThis.getCell(this.checkList[i], this.headerList.length - 2).value() != null) {
                this.riskFactorLibDTO.misValTreatMethId = this.getValueFromId(
                    this.tempThis
                        .getCell(this.checkList[i], this.headerList.length - 2)
                        .value()
                        .trim(),
                    this.misValTreatMethListData
                );
            }
            if (this.tempThis.getCell(this.checkList[i], this.headerList.length - 1).value() != null) {
                this.riskFactorLibDTO.rfCategoryId = this.getValueFromId(
                    this.tempThis.getCell(this.checkList[i], this.headerList.length - 1).value(),
                    this.rfCategoryListData
                );
            }
            if (this.tempThis.getCell(this.checkList[i], this.headerList.length).value() != null) {
                this.riskFactorLibDTO.methodologyId = this.getValueFromId(
                    this.tempThis.getCell(this.checkList[i], this.headerList.length).value(),
                    this.methodologyListDa
                );
            }
            if (this.tempThis.getCell(this.checkList[i], this.headerList.length).value() == 'PCA group') {
                this.riskFactorLibDTO.interpolationTypeId = null;
                this.riskFactorLibDTO.arithmaticFormula = null;
                this.riskFactorLibDTO.pcaGroupId = this.getValueFromId(
                    this.tempThis.getCell(this.checkList[i], this.headerList.length + 1).value(),
                    this.pcaGroupListD
                );
            } else if (this.tempThis.getCell(this.checkList[i], this.headerList.length).value() == 'Interpolation') {
                this.riskFactorLibDTO.interpolationTypeId = this.getValueFromId(
                    this.tempThis.getCell(this.checkList[i], this.headerList.length + 1).value(),
                    this.interpolationTypeDataD
                );
                this.riskFactorLibDTO.pcaGroupId = null;
                this.riskFactorLibDTO.arithmaticFormula = null;
            } else {
                this.riskFactorLibDTO.interpolationTypeId = null;
                this.riskFactorLibDTO.pcaGroupId = null;
                this.riskFactorLibDTO.arithmaticFormula = this.tempThis.getCell(this.checkList[i], this.headerList.length + 1).value();
            }
            this.riskFactorLibDTO.isDeleted = 'N';
            this.riskFactorLibDTOList.push(this.riskFactorLibDTO);
            this.emptyData();
        }

        this.riskfactorInfoService.saveBulkRiskFactorConfigData(this.riskFactorLibDTOList).subscribe(
            response => {
                // this.riskFactorLibDTO = response;
                this.showSuccessValidations(true, 'Bulk RiskFactorLibrary Data saved successfully.');
                this.riskFactorLibDTOList = [];
            },
            response => {
                this.showErrorValidations(true, response.error);
                this.riskFactorLibDTOList = [];
            }
        );
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

    emptyData() {
        this.riskFactorLibDTO = {
            id: null,
            shockRuleKeyId: null,
            transformationId: null,
            misValTreatMethId: null,
            rfCategoryId: null,
            methodologyId: null,
            interpolationTypeId: null,
            arithmaticFormula: null,
            pcaGroupId: null,
            isDeleted: null
        };
    }
    getValueFromId(value, data) {
        var id;
        for (let i = 0; i < data.length; i++) {
            if (data[i].text == value) {
                id = data[i].value;
                break;
            }
        }
        return id;
    }

    loadDataForAppliedFilter() {
        this.filterIcon = false;
        if (this.isScrolled) {
            this.startLimit = this.startLimit + 100;
        }
        let obj = {
            createFilter: this.createFilter,
            startLimit: this.startLimit,
            endLimit: this.endLimit
        };
        this.riskfactorInfoService.getRiskinfoByFilters(obj).subscribe((response: any) => {
            try {
                this.infoList = response;
                this.headerList = response['HEADERS'];
                const dataList = response['DATA'];
                const shockIdList = response['ShockIds'];
                const displayResponse = response['Time_Series_Data'];
                if (this.dataList.length == 0) {
                    this.dataList = dataList;
                    this.shockIdList = shockIdList;
                    this.displayResponse = displayResponse;
                } else {
                    this.dataList = this.dataList.concat(dataList);
                    this.shockIdList = this.shockIdList.concat(shockIdList);
                    this.displayResponse = this.displayResponse.concat(displayResponse);
                }
                this.scrollCount = Math.floor(this.dataList.length / 100);
                this.columnList = response['COLUMNS'];
                var data = [];
                for (let i = 0; i < this.shockIdList.length; i++) {
                    var isExists = false;
                    var index = 0;
                    for (let j = 0; j < this.displayResponse.length; j++) {
                        if (this.shockIdList[i] == this.displayResponse[j][7]) {
                            isExists = true;
                            index = j;
                            break;
                        }
                    }
                    if (isExists) data.push(this.displayResponse[index]);
                    else data.push(null);
                }
                if (this.startLimit == 0) {
                    let ele = document.getElementById('ss');
                    ele.innerHTML = '';
                    this.spread = new GC.Spread.Sheets.Workbook(ele);
                }
                this.sheet = this.spread.getSheet(0);
                this.sheet.suspendPaint();
                this.sheet.frozenColumnCount(4);
                this.tempThis = this.sheet;
                for (let column = 0; column < this.newColumns.length; column++) {
                    this.headerList.push(this.newColumns[column]);
                }
                this.sheet.setColumnCount(this.headerList.length + 2);
                this.sheet.setRowCount(this.dataList.length);

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

                var filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(-1, -1, -1, this.dataList.length));
                this.sheet.rowFilter(filter);
                this.sheet.setColumnVisible(2, false);
                this.sheet.setColumnVisible(0, false);
                this.sheet.setArray(this.startLimit, 2, this.dataList.slice(this.startLimit));

                this.sheet.options.isProtected = true;
                this.sheet.getRange(0, 1, this.sheet.getRowCount(), 1).locked(false);
                // this.sheet.getRange(0, 12, this.sheet.getRowCount(), 2).locked(false);
                this.sheet.getRange(0, 17, this.sheet.getRowCount(), 6).locked(false);
                this.sheet.options.protectionOptions = this.option;
                var len = this.headerList.length - 1;

                var ns = GC.Spread.Sheets;
                var style = this.sheet.getDefaultStyle();

                this.sheet.getRange(0, 3, this.sheet.getRowCount(), 14).backColor('lightgray');
                //this.sheet.getRange(0,14,this.sheet.getRowCount(),2).backColor("lightgray");

                style.borderLeft = new ns.LineBorder('gray', ns.LineStyle.thin);
                style.borderTop = new ns.LineBorder('gray', ns.LineStyle.thin);
                style.borderRight = new ns.LineBorder('gray', ns.LineStyle.thin);
                style.borderBottom = new ns.LineBorder('gray', ns.LineStyle.thin);

                // activeSheet.setFrozenColumnCount(1);

                var current = this;
                for (let i = this.startLimit; i < data.length; i++) {
                    if (data[i] != null) {
                        this.createCombo(
                            this.transformationListData,
                            this.headerList.length - 3,
                            this.tempThis,
                            i,
                            this.getValue(data[i][0], this.transformationListData)
                        );
                        this.createCombo(
                            this.misValTreatMethListData,
                            this.headerList.length - 2,
                            this.tempThis,
                            i,
                            this.getValue(data[i][1], this.misValTreatMethListData)
                        );
                        this.createCombo(
                            this.rfCategoryListData,
                            this.headerList.length - 1,
                            this.tempThis,
                            i,
                            this.getValue(data[i][2], this.rfCategoryListData)
                        );
                        this.createCombo(
                            this.methodologyListDa,
                            this.headerList.length,
                            this.tempThis,
                            i,
                            this.getValue(data[i][3], this.methodologyListDa)
                        );
                        if ('Proxy' == this.getValue(data[i][3], this.methodologyListDa)) {
                            this.sheet
                                .getCell(i, len + 2, GC.Spread.Sheets.SheetArea.viewport)
                                .cellType(this.sheet.getCellType(1, 0))
                                .value(data[i][6]);
                        } else {
                            if ('PCA group' == this.getValue(data[i][3], this.methodologyListDa))
                                this.createCombo(
                                    this.pcaGroupListD,
                                    this.headerList.length + 1,
                                    this.tempThis,
                                    i,
                                    this.getValue(data[i][4], this.pcaGroupListD)
                                );
                            if (this.getValue(data[i][3], this.methodologyListDa) == 'Interpolation')
                                this.createCombo(
                                    this.interpolationTypeDataD,
                                    this.headerList.length + 1,
                                    this.tempThis,
                                    i,
                                    this.getValue(data[i][5], this.interpolationTypeDataD)
                                );
                        }
                    } else {
                        this.createCombo(this.transformationListData, this.headerList.length - 3, this.tempThis, i, null);
                        this.createCombo(this.misValTreatMethListData, this.headerList.length - 2, this.tempThis, i, null);
                        this.createCombo(this.rfCategoryListData, this.headerList.length - 1, this.tempThis, i, null);
                    }
                }

                this.sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function(sender, args) {
                    if (args.newTopRow == current.dataList.length - 1) {
                        if (current.dataList.length / (current.scrollCount * 100) == 1) {
                            current.scrollCount = current.scrollCount + 1;
                            current.isScrolled = true;
                            current.loadDataForAppliedFilter();
                        }
                        return false;
                    }
                    return false;
                });

                this.spread.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, args) {
                    var sheet = args.sheet,
                        row = args.row,
                        col = args.col;
                    var cellType = sheet.getCellType(row, col);
                    if (cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) sheet.setValue(row, 1, true);
                    if (cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox && col == len) {
                        var c = null;
                        sheet
                            .getCell(row, len + 2, GC.Spread.Sheets.SheetArea.viewport)
                            .cellType(sheet.getCellType(1, 0))
                            .value(c);

                        current.getMethodologyValue(sheet.getCell(row, col).value(), current.sheet, len, current.spread, row);
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
                this.spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, function(e, args) {
                    let sheet = args.sheet;
                    let row = args.cellRange['row'];
                    let col = args.cellRange['col'];
                    let copiedData = args.pasteData['text'];
                    let mulCopyData = copiedData.split('\n');
                    let dropDownList = [];
                    let copiedDataList = [];
                    let rfCategoryval;

                    if (
                        col == current.headerList.length - 3 ||
                        col == current.headerList.length - 2 ||
                        col == current.headerList.length - 1 ||
                        col == current.headerList.length ||
                        col == current.headerList.length + 1
                    ) {
                        for (let j = 0; j < mulCopyData.length; j++) {
                            let combo = new GC.Spread.Sheets.CellTypes.ComboBox();
                            dropDownList = [];
                            sheet.setValue(row + j, 1, true);
                            /* let interpoltionList = current.interpolationTypeDataD.filter(
                                item => item.value == 1 || item.value == 2 || item.value == 3 || item.value == 4
                            ); */
                            if (col == current.headerList.length - 3) {
                                dropDownList = current.transformationListData;
                            } else if (col == current.headerList.length - 2) {
                                dropDownList = current.misValTreatMethListData;
                            } else if (col == current.headerList.length - 1) {
                                dropDownList = current.rfCategoryListData;
                            } else if (col == current.headerList.length) {
                                rfCategoryval = sheet.getCell(row + j, col - 1).value();
                                let value = sheet.getCell(row + j, len + 1).value();

                                if (rfCategoryval != null && mulCopyData.length > 0) {
                                    if (rfCategoryval == 'Pre determined') {
                                        dropDownList = current.methodologyListDa.filter(
                                            ele => ele['value'] == METHODOLOGY_USER_DEFINED || ele['value'] == METHODOLOGY_QUANTILE
                                        );
                                    } else if (rfCategoryval == 'Business Rule') {
                                        dropDownList = current.methodologyListDa.filter(
                                            ele => ele['value'] == METHODOLOGY_INTERPOLATION || ele['value'] == METHODOLOGY_PROXY
                                        );
                                    } else {
                                        dropDownList = current.methodologyListDa.filter(
                                            ele =>
                                                ele['value'] != METHODOLOGY_USER_DEFINED &&
                                                ele['value'] != METHODOLOGY_QUANTILE &&
                                                ele['value'] != METHODOLOGY_INTERPOLATION &&
                                                ele['value'] != METHODOLOGY_PROXY
                                        );
                                    }
                                } else {
                                    dropDownList = current.methodologyListDa;
                                    sheet.setValue(row + j, col, null);

                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value();
                                }
                            } else if (col == current.headerList.length + 1) {
                                dropDownList = current.interpolationTypeDataD;
                                rfCategoryval = sheet.getCell(row + j, col - 2).value();
                                if (rfCategoryval != 'Business Rule' || rfCategoryval == null || rfCategoryval == '') {
                                    sheet.setValue(row + j, len + 2, null);
                                    dropDownList = [];
                                }
                            }

                            if (dropDownList.length > 0) {
                                const data = mulCopyData[j].split('\t');
                                let set = dropDownList.filter(item => data.includes(item.text));
                                if (col == current.headerList.length - 3) {
                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value(mulCopyData[j]);
                                } else if (col == current.headerList.length - 2) {
                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value(mulCopyData[j]);
                                }
                                if (set.length == 0) {
                                    set = null;
                                    sheet.setValue(row + j, col, null);
                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value();
                                    if (rfCategoryval == 'Business Rule' && col == len + 1) {
                                        sheet.setValue(row + j, len + 2, null);
                                    }
                                } else {
                                    if (col == current.headerList.length - 3 || col == current.headerList.length - 2) {
                                        sheet.setValue(row + j, col, set[0].text);
                                    }
                                }
                                copiedDataList.push(set);

                                if (dropDownList == current.rfCategoryListData && copiedDataList[j] != null) {
                                    current.getMethodologyValue(
                                        sheet.getCell(row + j, col).value(),
                                        current.sheet,
                                        len,
                                        current.spread,
                                        row + j
                                    );
                                }
                                let methvalue = sheet.getCell(row + j, len + 1).value();
                                if (col == current.headerList.length && rfCategoryval == 'Pre determined') {
                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value();
                                }

                                if (col == current.headerList.length && rfCategoryval == 'Model Driven') {
                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value();
                                }
                                if (col == current.headerList.length && rfCategoryval == 'Business Rule') {
                                    combo.items(dropDownList);
                                    sheet
                                        .getCell(row + j, col, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo)
                                        .value();
                                }

                                if (rfCategoryval == 'Business Rule' && methvalue == 'Interpolation' && col == len + 1) {
                                    sheet.setValue(row + j, len + 2, null);
                                    let combo1 = new GC.Spread.Sheets.CellTypes.ComboBox();
                                    let combo2 = new GC.Spread.Sheets.CellTypes.ComboBox();
                                    combo1.items(dropDownList);
                                    sheet
                                        .getCell(row + j, len + 1, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo1)
                                        .value();

                                    combo2.items(current.interpolationTypeDataD);
                                    sheet
                                        .getCell(row + j, len + 2, GC.Spread.Sheets.SheetArea.viewport)
                                        .cellType(combo2)
                                        .value();
                                }
                                if (
                                    rfCategoryval == 'Business Rule' &&
                                    (methvalue == 'Interpolation' || methvalue == 'Proxy') &&
                                    col == len + 2
                                ) {
                                    let set1 = current.interpolationTypeDataD.filter(item => item.text == mulCopyData[j].trim());
                                    if (set1.length == 0) {
                                        sheet.setValue(row + j, len + 2, null);
                                    } else {
                                        sheet.setValue(row + j, len + 2, mulCopyData[j]);
                                    }
                                }
                                if (methvalue == null && col == len + 2) {
                                    sheet.setValue(row + j, len + 2, null);
                                }
                            }
                        }
                        let invalid = copiedDataList.filter(ele => ele == null);
                        if (
                            invalid.length == copiedDataList.length ||
                            (col == current.headerList.length + 1 && rfCategoryval != 'Business Rule')
                        ) {
                            current.showErrorValidations(true, 'Do not add Invalid data please add valid data.');
                        }
                    }
                });
                this.sheet.resumePaint();
            } catch (error) {
                this.sheet.resumePaint();
            }
            this.sheet.resumePaint();
        });
    }

    loadMetaDataByAppliedFilter(filtersData) {
        this.createFilter = filtersData.createFilter;
        this.masterDataObjForFilters = filtersData.masterDataObjForFilters;
        this.filtersApplied = true;
        this.dataList = [];
        this.shockIdList = [];
        this.startLimit = 0;
        this.isScrolled = false;
        this.displayResponse = [];
        this.startLimit = 0;
        this.isScrolled = false;
        this.loadDataForAppliedFilter();
    }

    showFilterComponentMessage(val) {
        this.showErrorValidations(true, val);
    }
    clearMetaData() {
        this.dataList = [];
        this.filtersApplied = false;
        this.createFilter = { SEARCH_STR: [''] };
        this.masterDataObjForFilters = {};
    }
}
