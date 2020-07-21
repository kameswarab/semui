import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { HOME_ROUTE, HomeComponent } from './';
import { HomeService } from './home.service';

@NgModule({
    imports: [SemSharedModule, RouterModule.forChild([HOME_ROUTE])],
    declarations: [HomeComponent],
    providers: [HomeService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SemHomeModule {}
