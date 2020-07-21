import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL, MASTER_SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnalysisService {
    constructor(private http: HttpClient) {}

    getScenarioList(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getScenarioList', obj);
    }

    getScenarioRiskfactorInfo(obj: { SCENARIO_ID: number; RF_ID: number }) {
        return this.http.post(SERVER_API_URL + 'api/analysis/getScenarioRiskfactorInfo', obj);
    }

    getMasterList(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getMasterList', {});
    }

    getRiskFactorList(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getRiskFactorList', obj);
    }

    getAnalysisData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getAnalysisData', obj);
    }
    getScenarioData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getScenarioData', id);
    }

    getProjectionPeriods(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getProjectionPeriods', id);
    }
    getCurveFamilySelOnScenario(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getCurveFamilySelOnScenario', obj);
    }
}
