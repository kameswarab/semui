import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModelsService } from './models.service';
import { ModelsComponent } from './models.component';
import { MODELS_ROUTES } from './models.route';
import { UploadComponent } from './upload/upload.component';
import { EditorComponent } from './editor/editor.component';
import { ModelTabsComponent } from './modelTabs/modelTabs.component';
import { InputsComponent } from './inputs/inputs.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AgGridModule } from 'ag-grid-angular';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { TestOutputComponent } from './testOutput/testOutput.component';
import { ModelsListComponent } from './modelsList/modelsList.component';
import { ModelExecutionComponent } from './modelExecution/modelExecution.component';
import { OutputsComponent } from './outputs/outputs.component';

@NgModule({
    imports: [
        SemSharedModule,
        RouterModule.forChild(MODELS_ROUTES),
        NgSelectModule,
        AgGridModule.withComponents([]),
        MonacoEditorModule.forRoot(),
        NgxJsonViewerModule
    ],
    providers: [ModelsService],
    declarations: [
        ModelsComponent,
        ModelTabsComponent,
        UploadComponent,
        EditorComponent,
        InputsComponent,
        TestOutputComponent,
        ModelsListComponent,
        ModelExecutionComponent,
        OutputsComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModelsModule {}
