import { Routes } from '@angular/router';
import { ClientAdminComponent } from 'app/clientAdmin/client-admin.component';
import { ClientAdminListComponent } from 'app/clientAdmin/client-admin-list.component';
import { UserRouteAccessService } from 'app/core';

export const CLIENT_ADMIN_ROUTE: Routes = [
    {
        path: 'administrationHome/clientAdmin',
        component: ClientAdminComponent,
        canActivate: [UserRouteAccessService],

        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Create Admin'
        }
    },
    {
        path: 'administrationHome/clientAdmin/:id',
        component: ClientAdminComponent,
        canActivate: [UserRouteAccessService],
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Update Client Admin'
        }
    },
    {
        path: 'administrationHome/clientAdminList',
        component: ClientAdminListComponent,
        canActivate: [UserRouteAccessService],
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Client Admin List'
        }
    }
];
