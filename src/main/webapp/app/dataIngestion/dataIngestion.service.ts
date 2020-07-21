import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { DATAINGESTION_SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable()
export class DataIngestionService {
    constructor(private http: HttpClient) {}

    saveMasterConfigData(data): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/saveMasterConfigData', data);
    }
    getAllTables(): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/getAllTables', {});
    }
    getAllMasterTables(): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/getAllMasterTables', {});
    }
    getAllColumns(selectedTableName): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/getAllColumnNames', selectedTableName);
    }
    getAllConfigNames(): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/getAllConfigNames', {});
    }
    getFileUploadConfigData(): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/getFileUploadConfigData', {});
    }
    deleteFileUploadConfig(Id): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/deleteFileUploadConfig', Id);
    }
    getDataById(Id): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/getDataById', Id);
    }
    updateConfigData(data, Id): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'config/updateConfigData/' + Id, data);
    }
}
