import { NgModule } from '@angular/core';

import { CLIENT_ADMIN_ROUTE } from './client-admin.route';
import { RouterModule } from '@angular/router';
import { SemSharedModule } from 'app/shared';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ClientAdminComponent } from './client-admin.component';
import { ClientAdminListComponent } from './client-admin-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
    imports: [
        SemSharedModule,
        RouterModule.forChild(CLIENT_ADMIN_ROUTE),
        NgSelectModule,
        AgGridModule.withComponents([ClientAdminListComponent])
    ],
    declarations: [ClientAdminComponent, ClientAdminListComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientAdminModule {}
