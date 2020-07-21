import { Routes } from '@angular/router';
import {
    ScenarioCreateComponent,
    ScenarioHomeComponent,
    ScenarioConfigurationComponent,
    ScenarioRiskFactorSelectionComponent
} from 'app/Scenario';
import { ShockComponent } from './shocks/shocks.component';
import { ScenarioOutputComponent } from './output/scenarioOutput.component';
import { UserRouteAccessService } from 'app/core';

export const SCENARIO_ROUTES: Routes = [
    {
        path: 'scenario',
        component: ScenarioHomeComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Scenario Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'scenario/createScenario',
        component: ScenarioCreateComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Scenario Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'scenario/scenarioConfig',
        component: ScenarioConfigurationComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Scenario Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'scenario/selectRiskFactor',
        component: ScenarioRiskFactorSelectionComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Scenario Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'scenario/scenarioShocks',
        component: ShockComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Shocks'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'scenario/scenarioOutput',
        component: ScenarioOutputComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Output'
        },
        canActivate: [UserRouteAccessService]
    }
];
