import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { DataIngestion_ROUTE, DataIngestionConfigComponent, DataIngestionService, DataIngestionConfigDataComponent } from '.';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    imports: [SemSharedModule, RouterModule.forChild(DataIngestion_ROUTE), NgSelectModule],
    declarations: [DataIngestionConfigComponent, DataIngestionConfigDataComponent],
    exports: [],
    providers: [DataIngestionService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DataIngestionModule {}
