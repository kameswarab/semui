import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL, MASTER_SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RiskFactorInfoService {
    constructor(private http: HttpClient) {}

    /* getRiskInfo(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskInfo', {});
    } */
    /*  getRiskData(riskId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskDetails', riskId);
    } */
    getPageNationData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getPageNationData', obj);
    }
    getPageNationRegulatorData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getPageNationRegulatorData', obj);
    }
}
