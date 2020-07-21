import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { REGULATORY_MAPPING_ROUTE } from './regulatoryMapping.route';
import { RegulatoryMappingService } from './regulatoryMapping.service';
import { RegulatoryMappingComponent } from './regulatoryMapping.component';
import { BulkRegulatoryMappingComponent } from './bulkRegulatoryMapping.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NewComponent } from './newComponent.component';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
    imports: [
        SemSharedModule,
        NgMultiSelectDropDownModule,
        RouterModule.forChild(REGULATORY_MAPPING_ROUTE),
        NgSelectModule,
        AgGridModule.withComponents([])
    ],
    providers: [RegulatoryMappingService],
    declarations: [RegulatoryMappingComponent, BulkRegulatoryMappingComponent, NewComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    entryComponents: [NewComponent]
})
export class RegulatoryMappingModule {}
