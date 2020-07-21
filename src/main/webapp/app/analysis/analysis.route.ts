import { Route, Routes } from '@angular/router';

import { AnalysisListComponent } from './analysisList.component';
import { AnalysisComponent } from './analysis.component';
import { UserRouteAccessService } from 'app/core';

export const ANALYSIS_ROUTES: Routes = [
    {
        path: 'analysisList',
        component: AnalysisListComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Analysis'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'analysisList/analysis',
        component: AnalysisComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Analysis'
        },
        canActivate: [UserRouteAccessService]
    }
];
