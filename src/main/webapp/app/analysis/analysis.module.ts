import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { ANALYSIS_ROUTES } from './analysis.route';
import { AnalysisComponent } from './analysis.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { AnalysisListComponent } from './analysisList.component';

@NgModule({
    imports: [
        SemSharedModule,
        RouterModule.forChild(ANALYSIS_ROUTES),
        NgSelectModule,
        AgGridModule.withComponents([AnalysisListComponent, AnalysisComponent])
    ],
    declarations: [AnalysisComponent, AnalysisListComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [],
    providers: []
})
export class AnalysisModule {}
