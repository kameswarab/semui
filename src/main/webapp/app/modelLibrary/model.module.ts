import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SemSharedModule } from 'app/shared';
import { ModelDefinitionComponent } from './modelDefinition/modelDefinition.component';
import { MODELLIBRARY_ROUTE } from './model.route';
import { ModelService } from './model.service';
import { ModelLibraryTabsComponent } from './modelLibraryTabs/modelLibraryTabs.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModelConfigurationComponent } from './modelConfiguration/modelConfiguration.component';
import { ModelHomeComponent } from './home/modelHome.component';
import { ModelReviewComponent } from './modelReview/modelReview.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
    imports: [SemSharedModule, RouterModule.forRoot(MODELLIBRARY_ROUTE), NgSelectModule, NgMultiSelectDropDownModule],
    declarations: [
        ModelDefinitionComponent,
        ModelConfigurationComponent,
        ModelHomeComponent,
        ModelLibraryTabsComponent,
        ModelReviewComponent
    ],

    providers: [ModelService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModelLibraryModule {}
