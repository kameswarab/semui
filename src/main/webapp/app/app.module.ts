import './vendor.ts';

import { NgModule, APP_INITIALIZER, Inject } from '@angular/core';
import { Routes, Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2Webstorage, SessionStorageService, LocalStorageService } from 'ngx-webstorage';
import { NgbDatepickerConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgJhipsterModule } from 'ng-jhipster';
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { SemSharedModule } from 'app/shared';
import { SemCoreModule, AccountService } from 'app/core';
import { SemAppRoutingModule } from './app-routing.module';
import { SemHomeModule } from './home/home.module';
import { RiskInfoModule } from './riskfactorInfo/riskfactorInfo.module';
import { RiskLibModule } from './riskFactorLibrary/riskfactorLib.module';
import { RegulatoryMappingModule } from './regulatoryMapping/regulatoryMapping.module';
import { ArithmaticFormulaModule } from './arithmaticFormula/arithmaticFormula.module';
import { ShocksTemplateModule } from './shocksTemplate/shocksTemplate.module';
import { SemEntityModule } from './entities/entity.module';
import * as moment from 'moment';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { JhiMainComponent, NavbarComponent, FooterComponent, PageRibbonComponent, ErrorComponent, NavbarService } from './layouts';

// adding imports
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializer } from './utils/app-init';
import { MasterModule } from 'app/masters';
import { DataIngestionModule } from 'app/dataIngestion';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ScenarioModule } from './Scenario';
import { DataingestionFileUploadModule } from 'app/fileupload';
import { ModelLibraryModule } from './modelLibrary';
import { BulkRiskInfoModule } from 'app/bulkRiskFactor/bulkRiskfactorInfo.module';
import { AuthInterceptor } from 'app/blocks/interceptor/auth.interceptor';
import { LoadingIndicatorService } from 'app/services/loading-indicator.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthGuard } from './guards/authguard.service';

import { AnalysisModule } from 'app/analysis/analysis.module';
import { SemAdminModule } from './semAdmin';
import { AdministrationHome } from './administrationHomePage';
import { PagerService } from './pager.service';
import { ClientAdminModule } from './clientAdmin/client-admin.module';
import { ClientModule } from './Client';
import { ClientUserModule } from './clientUser/clientUser.module';
import { ApmService } from '@elastic/apm-rum-angular';
import { KIBANA_UI_SERVICE_API_URL } from 'app/app.constants';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ModelsModule } from './models';

@NgModule({
    imports: [
        BrowserModule,
        NgMultiSelectDropDownModule.forRoot(),
        NgbModule.forRoot(),
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-' }),
        NgJhipsterModule.forRoot({
            // set below to true to make alerts look like toast
            alertAsToast: false,
            alertTimeout: 5000
        }),
        SemSharedModule.forRoot(),
        MonacoEditorModule.forRoot(),
        SemCoreModule,
        SemHomeModule,
        SemAdminModule,
        RiskInfoModule,
        RiskLibModule,
        RegulatoryMappingModule,
        AdministrationHome,

        //  ArithmaticFormulaModule,
        ShocksTemplateModule,
        ModelLibraryModule,
        NgxSpinnerModule,
        NgSelectModule,
        ClientAdminModule,
        ClientModule,
        ClientUserModule,
        // jhipster-needle-angular-add-module JHipster will add new module here
        SemEntityModule,
        MasterModule,
        DataIngestionModule,
        ScenarioModule,
        BulkRiskInfoModule,
        AnalysisModule,
        DataingestionFileUploadModule,
        ModelsModule,
        KeycloakAngularModule,
        SemAppRoutingModule
    ],
    declarations: [JhiMainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, FooterComponent],
    providers: [
        LoadingIndicatorService,
        NavbarService,
        {
            provide: ApmService,
            useClass: ApmService,
            deps: [Router]
        },
        AuthGuard,
        PagerService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
            deps: [LocalStorageService, SessionStorageService, LoadingIndicatorService]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializer,
            multi: true,
            deps: [KeycloakService]
        },
        { provide: 'Window', useValue: window }
    ],
    exports: [],
    bootstrap: [JhiMainComponent]
})
export class SemAppModule {
    constructor(
        private dpConfig: NgbDatepickerConfig,
        public router: Router,
        protected route: ActivatedRoute,
        @Inject(ApmService) service: ApmService
    ) {
        this.dpConfig.minDate = { year: moment().year() - 100, month: 1, day: 1 };
        // API is exposed through this apm instance
        const apm = service.init({
            serviceName: 'sem',
            serverUrl: KIBANA_UI_SERVICE_API_URL
        });
    }

    //constructor(@Inject(ApmService) service: ApmService) {
}
