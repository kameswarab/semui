import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SemSharedModule } from 'app/shared';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SHOCKS_TEMPLATE_ROUTE } from './shocksTemplate.route';
import { ShocksTemplateService } from './shocksTemplate.service';
import { ShocksTemplateComponent } from './shocksTemplate.component';
import { ShocksConfigComponent } from 'app/shocksTemplate/shocksMapping/shocks-config.component';

@NgModule({
    imports: [SemSharedModule, RouterModule.forChild(SHOCKS_TEMPLATE_ROUTE), NgSelectModule],
    providers: [ShocksTemplateService],
    declarations: [ShocksTemplateComponent, ShocksConfigComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ShocksTemplateModule {}
