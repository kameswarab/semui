import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { MASTER_ROUTE, MasterComponent, MasterConfigComponent, MasterService, MasterConfigDataComponent } from './';
import { NgSelectModule } from '@ng-select/ng-select';
import { SearchPipe } from './search.pipe';

@NgModule({
    imports: [SemSharedModule, NgSelectModule, RouterModule.forChild(MASTER_ROUTE)],
    declarations: [MasterComponent, SearchPipe, MasterConfigComponent, MasterConfigDataComponent],
    exports: [],
    providers: [MasterService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MasterModule {}
