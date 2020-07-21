import { Route } from '@angular/router';

import { HomeComponent } from './';
import { UserRouteAccessService } from 'app/core';

export const HOME_ROUTE: Route = {
    path: 'home',
    component: HomeComponent,
    data: {
        authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER', 'ROLE_ADMIN', 'ROLE_MASTER', 'ROLE_DATA_MANAGER'],
        pageTitle: 'Home'
    },
    canActivate: [UserRouteAccessService]
};
