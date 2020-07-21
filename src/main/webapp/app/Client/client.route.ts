import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core';
import { ClientListingComponent } from './client-listing.component';
import { ClientComponent } from './client.component';

export const HOME_ROUTE: Routes = [
    {
        path: 'administrationHome/clientList',
        component: ClientListingComponent,
        canActivate: [UserRouteAccessService],
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Client Listing'
        }
    },
    {
        path: 'administrationHome/clientList/client',
        component: ClientComponent,
        canActivate: [UserRouteAccessService],
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Create Client'
        }
    }
];
