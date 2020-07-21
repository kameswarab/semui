import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateMomentAdapter } from './util/datepicker-adapter';
import { SemSharedLibsModule, SemSharedCommonModule, HasAnyAuthorityDirective } from './';
import { HighchartsChartModule } from 'highcharts-angular';
import { YearPickerComponent } from 'app/yearPicker/year-picker.component';
import { CustomMultiSelectComponent } from 'app/custom-multi-select/custom-multi-select.component';
import { NgInitDirective } from './NgInitDirective';
import { MetaDataFilterComponent } from 'app/utils/metadataFilter/metadata_filter.component';

@NgModule({
    imports: [SemSharedLibsModule, SemSharedCommonModule],
    declarations: [HasAnyAuthorityDirective, YearPickerComponent, CustomMultiSelectComponent, NgInitDirective, MetaDataFilterComponent],
    providers: [{ provide: NgbDateAdapter, useClass: NgbDateMomentAdapter }],
    exports: [
        SemSharedCommonModule,
        HasAnyAuthorityDirective,
        HighchartsChartModule,
        YearPickerComponent,
        MetaDataFilterComponent,
        CustomMultiSelectComponent,
        NgInitDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SemSharedModule {
    static forRoot() {
        return {
            ngModule: SemSharedModule
        };
    }
}
