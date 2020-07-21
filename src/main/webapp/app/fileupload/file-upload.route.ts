import { Routes } from '@angular/router';
import { FileUploadComponent } from './file-upload.component';
import { ViewFileComponent } from 'app/fileupload/viewfile/view-file.component';
import { UserRouteAccessService } from 'app/core';

export const FILE_UPLOAD_ROUTE: Routes = [
    {
        path: 'fileUpload',
        component: FileUploadComponent,
        data: {
            authorities: ['ROLE_DATA_MANAGER'],
            pageTitle: 'Data Upload'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'viewFile',
        component: ViewFileComponent,
        data: {
            authorities: ['ROLE_DATA_MANAGER'],
            pageTitle: 'View File'
        },
        canActivate: [UserRouteAccessService]
    }
];
