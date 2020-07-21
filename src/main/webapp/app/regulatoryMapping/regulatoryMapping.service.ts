import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegulatoryMappingService {
    constructor(private http: HttpClient) {}
    getRegulatoryMappingData(shockRuleKeyId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulatoryMappingData', shockRuleKeyId);
    }
    saveRegulatoryMappingData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/saveRegulatoryMappingData', obj);
    }
    getRegulatory(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulatory', {});
    }
    getRegulatoryList(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulatoryList', {});
    }
    getRegulatorName(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulatoryName', {});
    }
    getRegulationEdit(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulationEdit', id);
    }
    getRegulationDelete(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulationDelete', id);
    }
    getRegulatorRFName(rfId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRegulatorRFName', rfId);
    }
    getRMInfoByAssertClasses(list): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/getRMInfoByAssertClasses', list);
    }
    saveRegulatoryMappingDataList(list): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/regulatory/saveRegulatoryMappingDataList', list);
    }
}
