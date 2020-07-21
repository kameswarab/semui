import { Route, Routes } from '@angular/router';

import { RegulatoryMappingComponent } from './regulatoryMapping.component';
import { BulkRegulatoryMappingComponent } from './bulkRegulatoryMapping.component';
import { UserRouteAccessService } from 'app/core';
export const REGULATORY_MAPPING_ROUTE: Routes = [
    {
        path: 'dataUtility/regulatorinfo/regulatoryMapping',
        component: RegulatoryMappingComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Regulatory Mapping'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'dataUtility/regulatorinfo/bulkRegulatoryMapping',
        component: BulkRegulatoryMappingComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Bulk Regulatory Mapping'
        },
        canActivate: [UserRouteAccessService]
    }
];
