import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RiskFactorLibService {
    constructor(private http: HttpClient) {}

    /* getRiskInfo(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskInfo', {});
    } */

    /* getTransformation(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getTransformation', {});
    }
    getMisValTreatMeth(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getMisValTreatMeth', {});
    }
    getRfCategory(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRfCategory', {});
    } */
    getMarketData(ScenarioId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getMarketData', ScenarioId);
    }
    /*  getMethodology(rfCatId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getMethodology', rfCatId);
    }
    getpcaGroup(methdlgyId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getpcaGroup', methdlgyId);
    }
    getinterpolationType(methdlgyId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getinterpolationType', methdlgyId);
    } */

    saveRiskFacLibData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/saveRiskFacLibrary', obj);
    }

    getRiskFactorLibraryData(shockRuleKeyId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskFactorLibraryData', shockRuleKeyId);
    }

    /* getMethodologyData(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getMethodologyData', {});
    }

    getPcaGroup(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getPcaGroup', {});
    }
    getinterpolation(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getinterpolation', {});
    } */

    getRiskFactorMasterData(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskFactorMasterData', {});
    }

    getMasterDataForBulkEdit(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getMasterDataForBulkEdit', {});
    }

    taxonomySelectionChange(rfData): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskFactors', rfData);
    }

    getRiskFactorMasterDataList(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskFactorMasterDataList', {});
    }
    saveRiskFactorData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/saveRiskFactorData', obj);
    }
    deleteRiskFacLibData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/deleteRiskFacLibrary', obj);
    }
}
