import { Route, Routes } from '@angular/router';

import { ModelDefinitionComponent } from './modelDefinition/modelDefinition.component';
import { ModelConfigurationComponent } from './modelConfiguration/modelConfiguration.component';
import { ModelHomeComponent } from './home/modelHome.component';
import { ModelReviewComponent } from './modelReview/modelReview.component';
import { UserRouteAccessService } from 'app/core';

export const MODELLIBRARY_ROUTE: Routes = [
    {
        path: 'model',
        component: ModelHomeComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Model Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'model/modelDefinition',
        component: ModelDefinitionComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Model Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'model/modelConfig',
        component: ModelConfigurationComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Model Library'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'model/modelReview',
        component: ModelReviewComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Model Library'
        },
        canActivate: [UserRouteAccessService]
    }
];
