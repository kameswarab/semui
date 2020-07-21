import { Route, Routes } from '@angular/router';

import { DataIngestionConfigComponent } from '.';
import { DataIngestionConfigDataComponent } from 'app/dataIngestion/dataIngestionConfigData.component';
import { UserRouteAccessService } from 'app/core';

export const DataIngestion_ROUTE: Routes = [
    {
        path: 'dataIngestionConfig',
        component: DataIngestionConfigComponent,
        data: {
            authorities: ['ROLE_DATA_MANAGER'],
            pageTitle: 'DataIngestion Configuration'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataIngestionConfigData',
        component: DataIngestionConfigDataComponent,
        data: {
            authorities: ['ROLE_DATA_MANAGER'],
            pageTitle: 'DataIngestion Configuration'
        },
        canActivate: [UserRouteAccessService]
    }
];
