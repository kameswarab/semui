import { NgModule } from '@angular/core';

import { SemSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent } from './';

@NgModule({
    imports: [SemSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [SemSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class SemSharedCommonModule {}
