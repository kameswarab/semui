import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { ModelsComponent } from './models.component';
import { UploadComponent } from './upload/upload.component';
import { EditorComponent } from './editor/editor.component';
import { InputsComponent } from './inputs/inputs.component';
import { TestOutputComponent } from './testOutput/testOutput.component';
import { ModelsListComponent } from './modelsList/modelsList.component';
import { ModelExecutionComponent } from './modelExecution/modelExecution.component';
import { OutputsComponent } from './outputs/outputs.component';

export const MODELS_ROUTES: Routes = [
    {
        path: 'Models',
        component: ModelsComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'Models'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'Models/upload',
        component: UploadComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'Models/editor',
        component: EditorComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'Models/input',
        component: InputsComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'Models/testoutput',
        component: TestOutputComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'ModelsList',
        component: ModelsListComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'ModelsList/modelExecution',
        component: ModelExecutionComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'Models/output',
        component: OutputsComponent,
        data: {
            authorities: ['ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_REVIEWER'],
            pageTitle: 'upload'
        },
        canActivate: [UserRouteAccessService]
    }
];
