import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { FileUploadComponent } from './file-upload.component';
import { FILE_UPLOAD_ROUTE } from './file-upload.route';
import { ViewFileComponent } from 'app/fileupload/viewfile/view-file.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    imports: [SemSharedModule, RouterModule.forChild(FILE_UPLOAD_ROUTE), NgSelectModule],
    declarations: [FileUploadComponent, ViewFileComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DataingestionFileUploadModule {}
