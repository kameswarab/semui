import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'custom-multi-select',
    templateUrl: './custom-multi-select.component.html',
    styleUrls: []
})
export class CustomMultiSelectComponent implements OnInit, AfterViewInit, OnChanges {
    id = 0;
    @Input() items = [];
    @Input() bindValue = 'value';
    @Input() bindLabel = 'label';
    @Input() inputName: any;
    @Input() multiple = false;
    @Input() maxSelection = null;
    @Input() selectedItems = [];
    @Input() searchForItems = true;
    @Input() searchForSelectedItems = true;
    @Input() autoClose = 'outside';
    @Input() selectAllItems = true;
    @Input() selectedAllItems = true;
    @Input() serverSideSearch = false;
    @Input() searchItemStr;

    itemsTemp = [];
    selectedItemsTemp = [];
    selectedItemsMain = [];
    searchSelectedItemStr = null;

    @Output() selectChange = new EventEmitter();
    @Output() change = new EventEmitter();
    @Output() search = new EventEmitter();

    constructor() {}

    reset() {
        this.itemsTemp = [];
        if (!this.serverSideSearch) {
            this.searchItemStr = null;
        }
        this.searchSelectedItemStr = null;
    }

    ngOnInit() {
        this.id = Math.random();

        this.items.forEach(item => {
            if (this.selectedItems != undefined && this.selectedItems.indexOf(item[this.bindValue]) != -1) {
                this.selectedItemsMain = this.items.filter(item => this.selectedItems.indexOf(item[this.bindValue]) != -1);
            }
        });
        this.selectedItemsTemp = Object.assign([], this.selectedItemsMain);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.items) {
            this.items = changes.items.currentValue;
            this.reset();
            this.itemsTemp = this.items;

            if (this.selectedItems != undefined && this.selectedItems.length != this.selectedItemsMain.length) {
                this.selectedItemsMain = this.items.filter(item => this.selectedItems.indexOf(item[this.bindValue]) != -1);
                this.selectedItemsTemp = Object.assign([], this.selectedItemsMain);
            }
        }

        if (changes.selectedItems) {
            this.selectedItemsMain = [];
            this.selectedItemsTemp = [];
            this.selectedItems = changes.selectedItems.currentValue;
            this.selectedItemsMain = this.items.filter(item => this.selectedItems.indexOf(item[this.bindValue]) != -1);
            this.selectedItemsTemp = Object.assign([], this.selectedItemsMain);
        }

        if (changes.multiple) this.multiple = changes.multiple.currentValue;
        if (changes.maxSelection) this.maxSelection = changes.maxSelection.currentValue;
        if (changes.searchForItems) this.searchForItems = changes.searchForItems.currentValue;
        if (changes.searchForSelectedItems) this.searchForSelectedItems = changes.searchForSelectedItems.currentValue;
        if (changes.selectAllItems) this.selectAllItems = changes.selectAllItems.currentValue;
    }

    addItemCheck(item) {
        let checkList = this.selectedItemsMain.filter(p => p[this.bindValue] == item[this.bindValue]);
        if (checkList && checkList.length > 0) {
            return false;
        }
        return true;
    }

    selectAll(event) {
        this.searchItemStr = null;
        this.searchSelectedItemStr = null;
        if (event.target.checked) {
            if (this.multiple) {
                let itemValues = this.selectedItemsMain.map(item => item[this.bindValue]);
                let list = this.itemsTemp.filter(item => itemValues.indexOf(item[this.bindValue]) == -1);

                if (this.maxSelection && this.maxSelection < this.selectedItemsMain.length + list.length) {
                    event.target.checked = false;
                    return false;
                }

                this.selectedItemsMain = this.selectedItemsMain.concat(list);
                this.selectedItemsTemp = this.selectedItemsTemp.concat(list);
                event.target.checked = false;
                this.searchItems();
            }
        } else {
            this.selectedItemsMain = [];
            this.selectedItemsTemp = [];
            this.searchSelectedItems();
        }
        this.valueChanged();
    }

    changeSelection(event, item) {
        if (!this.serverSideSearch) {
            this.searchItemStr = null;
            this.searchSelectedItemStr = null;
        }
        if (event.target.checked) {
            if (this.multiple) {
                if (this.maxSelection && this.maxSelection <= this.selectedItemsMain.length) {
                    event.target.checked = false;
                    return false;
                }
                this.selectedItemsMain.push(item);
                this.selectedItemsTemp.push(item);
            } else {
                this.selectedItemsMain = [item];
                this.selectedItemsTemp = [item];
            }
            this.searchItems();
        } else {
            this.selectedItemsMain = this.selectedItemsMain.filter(p => p[this.bindValue] != item[this.bindValue]);
            this.selectedItemsTemp = this.selectedItemsTemp.filter(p => p[this.bindValue] != item[this.bindValue]);
            this.searchSelectedItems();
        }
        this.valueChanged();
    }

    searchItems() {
        if (!this.serverSideSearch) {
            if (this.searchItemStr) {
                this.itemsTemp = this.items.filter(
                    item => item[this.bindLabel].toLowerCase().indexOf(this.searchItemStr.toLowerCase()) !== -1
                );
            } else {
                this.itemsTemp = this.items;
            }
        } else {
            this.search.emit(this.searchItemStr);
        }
    }

    searchSelectedItems() {
        if (this.searchSelectedItemStr) {
            this.selectedItemsTemp = this.selectedItemsMain.filter(
                item => item[this.bindLabel].toLowerCase().indexOf(this.searchSelectedItemStr.toLowerCase()) !== -1
            );
        } else {
            this.selectedItemsTemp = Object.assign([], this.selectedItemsMain);
        }
    }

    ngAfterViewInit(): void {
        this.valueChanged();
    }

    valueChanged() {
        this.selectedItems = [];
        this.selectedItemsMain.forEach(item => {
            this.selectedItems.push(item[this.bindValue]);
        });

        this.selectChange.emit(this.selectedItems);
        this.change.emit(this.selectedItems);
    }
}
