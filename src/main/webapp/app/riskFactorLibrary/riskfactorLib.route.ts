import { Routes } from '@angular/router';

import { RiskFactorLibComponent } from './riskfactorLib.component';
import { CreateNewRiskFactorComponent } from './createNewRiskFactor/createNewRiskFactor.component';
import { UserRouteAccessService } from 'app/core';

export const RISKFACTOR_LIB_ROUTE: Routes = [
    {
        path: 'dataUtility/riskfactorinfo/riskfactorLib',
        component: RiskFactorLibComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'RiskFactor Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataUtility/riskfactorinfo/createNewRiskFactor',
        component: CreateNewRiskFactorComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'RiskFactor Library'
        },
        canActivate: [UserRouteAccessService]
    }
];
