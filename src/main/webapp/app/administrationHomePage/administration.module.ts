import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { ADMINISTRATION_ROUTE } from './administration.route';
import { AdministrationComponent } from './administration.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    imports: [SemSharedModule, NgSelectModule, RouterModule.forChild([ADMINISTRATION_ROUTE])],
    declarations: [AdministrationComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdministrationHome {}
