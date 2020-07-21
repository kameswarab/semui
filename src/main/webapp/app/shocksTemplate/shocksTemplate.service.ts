import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL, MASTER_SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShocksTemplateService {
    constructor(private http: HttpClient) {}

    getPageNationData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getPageNationData', obj);
    }
    getScenarioList(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getScenarioList', {});
    }
    getRegulatoryList(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getRegulatoryList', obj);
    }
    saveShockTemplateDataOld(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/saveShockTemplateDataOld', obj);
    }

    saveShockTemplateData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/saveShockTemplateData', obj);
    }

    updateShockTemplateData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/updateShockTemplateData', obj);
    }

    getTemplateData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getTemplateData', id);
    }
    getSeverity(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getSeverity', id);
    }
    deleteTemplate(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/deleteTemplate', id);
    }

    getProjectionsShockTemplateData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getTemplateProjectionData', obj);
    }

    getTemplateProjectionData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getTemplateProjectionData', obj);
    }
    getTemplateProjectionDataInView(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getTemplateProjectionDataInView', obj);
    }
    getSeverityPeriodType(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getSeverityPeriodType', {});
    }

    getShockTemplateObject(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/shocks/getShockTemplateObject', id + '');
    }
}
