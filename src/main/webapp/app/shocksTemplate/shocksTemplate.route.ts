import { Route, Routes } from '@angular/router';
import { ShocksTemplateComponent } from './shocksTemplate.component';
import { ShocksConfigComponent } from 'app/shocksTemplate/shocksMapping/shocks-config.component';
import { UserRouteAccessService } from 'app/core';
export const SHOCKS_TEMPLATE_ROUTE: Routes = [
    {
        path: 'dataUtility/shocksTemplate',
        component: ShocksTemplateComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Shocks Template'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataUtility/shocksTemplate/shocksConfig',
        component: ShocksConfigComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Shocks Template Config'
        },
        canActivate: [UserRouteAccessService]
    }
];
