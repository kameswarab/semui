import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule, NgbDateMomentAdapter } from 'app/shared';
import { SCENARIO_ROUTES } from './';
import { ScenarioHomeComponent } from 'app/Scenario/home/scenarioHome.component';
import { ScenarioCreateComponent } from 'app/Scenario/create/scenarioCreate.component';
import { ScenarioConfigurationComponent } from 'app/Scenario/configure/scenarioConfiguration.component';
import { ScenarioRiskFactorSelectionComponent } from 'app/Scenario/riskFactor/scenarioRiskFactorSelection.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ShockComponent } from './shocks/shocks.component';
import { ScenarioTabsComponent } from './scenario-tabs/scenario-tabs.component';
import { ArithmaticFormulaModule } from 'app/arithmaticFormula';
import { ScenarioOutputComponent } from 'app/Scenario/output/scenarioOutput.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import highmaps from 'highcharts/modules/map.src';
import more from 'highcharts/highcharts-more.src';
import { AgGridModule } from 'ag-grid-angular';

export function highchartsModules() {
    // apply Highcharts Modules to this array
    return [more, highmaps];
}

@NgModule({
    imports: [
        SemSharedModule,
        RouterModule.forChild(SCENARIO_ROUTES),
        NgMultiSelectDropDownModule.forRoot(),
        ArithmaticFormulaModule,
        NgSelectModule,
        ChartModule,
        AgGridModule.withComponents([ScenarioOutputComponent])
    ],
    declarations: [
        ScenarioHomeComponent,
        ScenarioCreateComponent,
        ScenarioConfigurationComponent,
        ScenarioRiskFactorSelectionComponent,
        ShockComponent,
        ScenarioOutputComponent,
        ScenarioTabsComponent
    ],

    providers: [NgbDateMomentAdapter, { provide: HIGHCHARTS_MODULES, useFactory: highchartsModules }],

    exports: [ScenarioTabsComponent, ScenarioOutputComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ScenarioModule {}
