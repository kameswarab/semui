import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core';
import { SemAdminComponent } from './semAdmin.component';

export const SEMADMIN_ROUTE: Route = {
    path: 'dataUtility',
    component: SemAdminComponent,
    data: {
        authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER', 'ROLE_ADMIN', 'ROLE_MASTER', 'ROLE_DATA_MANAGER'],
        pageTitle: ' Data Utility'
    },
    canActivate: [UserRouteAccessService]
};
