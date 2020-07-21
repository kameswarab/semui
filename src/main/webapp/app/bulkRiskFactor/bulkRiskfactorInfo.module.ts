import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { RISKFACTOR_INFO_ROUTE } from './bulkRiskfactorInfo.route';
import { BulkRiskFactorInfoService } from './bulkRiskfactorInfo.service';
import { BulkRiskFactorInfoComponent } from './bulkRiskfactorInfo.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
    imports: [SemSharedModule, NgMultiSelectDropDownModule, NgSelectModule, RouterModule.forChild([RISKFACTOR_INFO_ROUTE])],
    providers: [BulkRiskFactorInfoService],
    declarations: [BulkRiskFactorInfoComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class BulkRiskInfoModule {}
