import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { SEMADMIN_ROUTE } from './semAdmin.route';
import { SemAdminComponent } from './semAdmin.component';

@NgModule({
    imports: [SemSharedModule, RouterModule.forChild([SEMADMIN_ROUTE])],
    declarations: [SemAdminComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SemAdminModule {}
