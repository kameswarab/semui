import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientUserRoutingModule } from './clientUser.routing';
import { SemSharedModule } from 'app/shared';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClientUserComponent } from './clientUser.component';

@NgModule({
    declarations: [ClientUserComponent],
    imports: [SemSharedModule, ClientUserRoutingModule, NgSelectModule, AgGridModule.forRoot([ClientUserComponent])],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientUserModule {}
