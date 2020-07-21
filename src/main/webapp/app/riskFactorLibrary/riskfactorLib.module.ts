import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { RISKFACTOR_LIB_ROUTE } from './riskfactorLib.route';
import { RiskFactorLibService } from './riskfactorLib.service';
import { RiskFactorLibComponent } from './riskfactorLib.component';
import { ArithmaticFormulaModule } from '../arithmaticFormula/arithmaticFormula.module';
import { CreateNewRiskFactorComponent } from './createNewRiskFactor/createNewRiskFactor.component';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
    imports: [SemSharedModule, NgSelectModule, ArithmaticFormulaModule, RouterModule.forChild(RISKFACTOR_LIB_ROUTE)],
    providers: [RiskFactorLibService],
    declarations: [RiskFactorLibComponent, CreateNewRiskFactorComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RiskLibModule {}
