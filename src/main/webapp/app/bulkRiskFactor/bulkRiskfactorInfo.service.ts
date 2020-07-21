import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BulkRiskFactorInfoService {
    constructor(private http: HttpClient) {}

    /* getRiskInfo(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskInfo', {});
    } */
    /*  getRiskinfoByAssertClasses(data): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskinfoByAssertClasses', data);
    } */
    /* getRiskData(riskId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskDetails', riskId);
    } */
    /*  getAssetClasses(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getAssetClasses', {});
    } */
    saveBulkRiskFactorConfigData(data): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/saveBulkRiskFactorConfigData', data);
    }
    /* getRiskInfoByRiskIds(dataList): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskInfoByRiskIds', dataList);
    } */
    /*  getMasterDataList(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getMasterDataList', {});
    } */
    getRiskinfoByFilters(filters): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskinfoByFilters', filters);
    }
}
