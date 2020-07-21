import { Route } from '@angular/router';

import { BulkRiskFactorInfoComponent } from './bulkRiskfactorInfo.component';
import { UserRouteAccessService } from 'app/core';

export const RISKFACTOR_INFO_ROUTE: Route = {
    path: 'dataUtility/riskfactorinfo/bulkRiskfactor',
    component: BulkRiskFactorInfoComponent,
    data: {
        authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
        pageTitle: 'Bulk RiskFactor Info'
    },
    canActivate: [UserRouteAccessService]
};
