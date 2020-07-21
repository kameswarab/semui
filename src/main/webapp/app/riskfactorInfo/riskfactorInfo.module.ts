import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { RISKFACTOR_INFO_ROUTE } from './riskfactorInfo.route';
import { RiskFactorInfoService } from './riskfactorInfo.service';
import { RiskFactorInfoComponent } from './riskfactorInfo.component';
import { RegulatorInfoComponent } from './regulatorInfo.component';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
    imports: [
        SemSharedModule,
        RouterModule.forChild(RISKFACTOR_INFO_ROUTE),
        AgGridModule.withComponents([RiskFactorInfoComponent, RegulatorInfoComponent]),
        NgSelectModule
    ],
    providers: [RiskFactorInfoService],
    declarations: [RiskFactorInfoComponent, RegulatorInfoComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class RiskInfoModule {}
