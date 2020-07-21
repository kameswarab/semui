import { Routes } from '@angular/router';

import { RiskFactorInfoComponent } from './riskfactorInfo.component';
import { RegulatorInfoComponent } from './regulatorInfo.component';
import { UserRouteAccessService } from 'app/core';

export const RISKFACTOR_INFO_ROUTE: Routes = [
    {
        path: 'dataUtility/riskfactorinfo',
        component: RiskFactorInfoComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'RiskFactor Info'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataUtility/regulatorinfo',
        component: RegulatorInfoComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Regulator Info'
        },
        canActivate: [UserRouteAccessService]
    }
];
