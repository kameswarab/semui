import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { USER_MANAGEMENT_SERVER_API_URL } from 'app/app.constants';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    constructor(private http: HttpClient) {}

    saveData(data: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/saveUploadedData', data);
    }
    uploadData(data: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/uploadData', data);
    }
    getModules(): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/getModules', {});
    }
    getListingData(): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/getListingData', {});
    }
    delete(data): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/deleteData', data);
    }
    getClientById(update_ID): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/getClientById', update_ID);
    }
    downloadFile(fileName: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/downloadFile', fileName, {
            reportProgress: true,
            responseType: 'arraybuffer'
        });
    }
}
