import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { ArithmaticFormulaService } from './arithmaticFormula.service';
import { ArithmaticFormulaComponent } from './arithmaticFormula.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
    imports: [BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule, SemSharedModule],
    providers: [ArithmaticFormulaService],
    declarations: [ArithmaticFormulaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    exports: [ArithmaticFormulaComponent]
})
export class ArithmaticFormulaModule {}
