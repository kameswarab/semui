import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SemSharedModule } from 'app/shared';
import { HOME_ROUTE } from './client.route';
import { AgGridModule } from 'ag-grid-angular';
import { ClientListingComponent } from './client-listing.component';
import { ClientComponent } from './client.component';

@NgModule({
    imports: [SemSharedModule, RouterModule.forChild(HOME_ROUTE), AgGridModule.withComponents([ClientListingComponent])],
    declarations: [ClientListingComponent, ClientComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientModule {}
