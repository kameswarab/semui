import { OnInit, Component, Output, EventEmitter, Input } from '@angular/core';
import { ScenarioService } from 'app/Scenario/scenario.service';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'metadata-filter',
    templateUrl: './metadata_filter.component.html',
    styleUrls: []
})
export class MetaDataFilterComponent implements OnInit {
    @Output() loadMetaData = new EventEmitter();
    @Output() clearMetaData = new EventEmitter();
    @Output() errorMessage = new EventEmitter();

    @Input() filtersData: any;
    @Input() regSubclassificatnId: any;
    @Input() masterDataObjForFilters: {};
    @Input() myData: BehaviorSubject<{ id: null; value: null; masterData: null }> = new BehaviorSubject({
        id: null,
        value: null,
        masterData: null
    });
    createFilter = { SEARCH_STR: [''] };
    filtersApplied = false;
    filterIcon = false;
    filter;
    shockRegSubClassificatnId;
    classificationId;

    filterConfiguration: any;
    constructor(private scenarioService: ScenarioService) {}

    ngOnInit() {
        //if(this.regSubclassificatnId != null){
        this.myData.subscribe(responce => {
            this.classificationId = responce.id;
            this.regSubclassificatnId = responce.value;
            //this.masterDataObjForFilters = responce.masterData;
            if (this.filtersData) {
                this.createFilter = this.filtersData;
            }
            if (this.regSubclassificatnId || this.classificationId) {
                this.masterDataObjForFilters = responce.masterData;
                this.createFilter = { SEARCH_STR: [''] };
                this.filtersApplied = false;
                this.filterIcon = false;
                this.filter = null;
                this.shockRegSubClassificatnId = null;
                this.shockRegSubClassificatnId = this.regSubclassificatnId;
            }
            console.log('Filter applyin on init ', this.createFilter);
            console.log('Filter applyin on init on input ', this.filtersData);
            console.log('Filters Data apply in on init on input ', this.masterDataObjForFilters);
            if (this.masterDataObjForFilters == null || Object.keys(this.masterDataObjForFilters).length === 0) {
                this.masterDataObjForFilters = {};
                this.loadFiltersConfiguration();
            } else {
                this.filtersApplied = true;
                this.loadFiltersConfigurationOnLoad();
                //this.changeFilters();
            }

            //this.resetFilters();
        });
        // }else{
        //     console.log('Filter applyin on init on input ', this.filtersData);
        //     console.log('Filters Data apply in on init on input ', this.masterDataObjForFilters);
        //     if (this.filtersData) {
        //         this.createFilter = this.filtersData;
        //     }
        //     if (this.regSubclassificatnId) {
        //         this.shockRegSubClassificatnId = this.regSubclassificatnId;
        //     }

        //     console.log('Filter applyin on init ', this.createFilter);

        //     if (this.masterDataObjForFilters == null || Object.keys(this.masterDataObjForFilters).length === 0) {
        //         this.masterDataObjForFilters = {};
        //         this.loadFiltersConfiguration();
        //     } else {
        //         this.filtersApplied = true;
        //         this.loadFiltersConfigurationOnLoad();
        //     }
        // }
    }
    loadFiltersConfigurationOnLoad() {
        this.scenarioService.getFiltersConfiguration({}).subscribe(
            response => {
                this.filterConfiguration = response;
                this.loadMetaDataByFilter();
            },
            res => {
                this.errorMessage.emit(res.error);
            }
        );
    }

    loadFiltersConfiguration() {
        this.filtersApplied = false;
        this.filterIcon = false;

        this.scenarioService.getFiltersConfiguration({}).subscribe(
            response => {
                this.filterConfiguration = response;
                this.changeFilters();
            },
            res => {
                this.errorMessage.emit(res.error);
            }
        );
    }

    filterCheckboxChange(event, filter, value) {
        let list = this.createFilter[filter] || [];
        if (event.target.checked) {
            list.push(value);
        } else {
            list = list.filter(p => p != value);
        }

        this.createFilter[filter] = list;
        this.changeFilters();
    }
    changeSearchText(filter) {
        let val = this.createFilter[filter][0];
        if (val && val.length > 2) {
            this.filtersApplied = true;
        } else {
            this.filtersApplied = false;
            Object.keys(this.createFilter).forEach(key => {
                if (key != 'SEARCH_STR') {
                    this.filtersApplied = true;
                }
            });
        }
    }

    changeFilters() {
        this.filtersApplied = false;
        this.filterIcon = false;
        this.clearMetaData.emit();

        Object.keys(this.createFilter).forEach(key => {
            if (this.createFilter[key] && this.createFilter[key].length > 0) {
                if (key != 'SEARCH_STR') {
                    this.filtersApplied = true;
                }

                if (
                    key != 'SEARCH_STR' &&
                    key != 'ASSET_CLASS_ID' &&
                    key != 'SHOCK_RULE_KEY_ID' &&
                    key != 'RISK_FACTOR_TYPE_ID' &&
                    key != 'CURRENCY_ID'
                ) {
                    this.filterIcon = true;
                }
            }
        });

        let obj = {
            createFilter: this.createFilter,
            masterDataObjForFilters: this.masterDataObjForFilters,
            shockRegSubClassificatnId: this.regSubclassificatnId
        };

        this.scenarioService.getFiltersMetaData(obj).subscribe(
            response => {
                this.masterDataObjForFilters = response['MASTER_DATA'];
                this.filterConfiguration = response['MASTER_DATA_MAPPING'];
            },
            res => {
                this.errorMessage.emit(res.error);
            }
        );
    }

    resetFilters() {
        this.filtersApplied = false;
        this.filterIcon = false;
        this.createFilter = { SEARCH_STR: [''] };
        this.masterDataObjForFilters = {};
        this.regSubclassificatnId = this.regSubclassificatnId;

        this.changeFilters();
    }

    loadMetaDataByFilter() {
        let obj = {
            createFilter: this.createFilter,
            masterDataObjForFilters: this.masterDataObjForFilters
        };
        this.loadMetaData.emit(obj);
    }
}
