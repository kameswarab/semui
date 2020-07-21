import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL, MASTER_SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable()
export class MasterService {
    constructor(private http: HttpClient) {}

    getAllMasters(): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getAllMasters', {});
    }
    findMaster(id): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getMasterData', id);
    }
    getSaveMaster(id): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getSaveMasterData', id);
    }
    getUpdateMaster(id): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getUpdateMasterData', id);
    }
    saveMasterData(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/saveMasterData', obj);
    }
    updateMasterData(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/updateMasterData', obj);
    }
    deleteMasterData(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/deleteMasterData', obj);
    }
    deleteMultipleMasterData(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/deleteMultipleMasterData', obj);
    }
    updatePendingApproval(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/updatePendingApproval', obj);
    }
    updateSeqOrder(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/updateSeqOrder', obj);
    }
    getMasterConfigData(obj): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getMasterConfigData', obj);
    }
    deleteMasterConfigData(masterId): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/deleteMasterConfigData', masterId);
    }
    getMasterDataForConfig(val): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getMasterDataForConfig', val);
    }
    getColumnList(tableName): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/getColumnList', tableName);
    }
    saveMasterConfigData(data): Observable<any> {
        return this.http.post(MASTER_SERVER_API_URL + 'api/masters/saveMasterConfigData', data);
    }
}
