import { Route, Routes } from '@angular/router';

import { MasterComponent, MasterConfigComponent } from './';
import { MasterConfigDataComponent } from 'app/masters/masterConfigData.component';
import { UserRouteAccessService } from 'app/core';

export const MASTER_ROUTE: Routes = [
    {
        path: 'dataUtility/masters',
        component: MasterComponent,
        data: {
            authorities: ['ROLE_MASTER'],
            pageTitle: 'Masters'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataUtility/masterConfig',
        component: MasterConfigComponent,
        data: {
            authorities: ['ROLE_MASTER'],
            pageTitle: 'Masters Configuration'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataUtility/masterConfig/masterConfigData',
        component: MasterConfigDataComponent,
        data: {
            authorities: [],
            pageTitle: 'Masters Configuration'
        }
    }
];
