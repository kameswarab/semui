import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core';
import { AdministrationComponent } from './administration.component';

export const ADMINISTRATION_ROUTE: Route = {
    path: 'administrationHome',
    component: AdministrationComponent,
    data: {
        authorities: ['ROLE_ADMIN', 'ROLE_SEM_ADMIN'],
        pageTitle: ' Administration'
    },
    canActivate: [UserRouteAccessService]
};
