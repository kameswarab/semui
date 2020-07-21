import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { USER_MANAGEMENT_SERVER_API_URL, SERVER_API_URL } from 'app/app.constants';

@Injectable({
    providedIn: 'root'
})
export class ClientAdminService {
    constructor(private http: HttpClient) {}

    changeClient(obj: any) {
        return this.http.post(SERVER_API_URL + 'api/home/changeClient', obj);
    }

    getClientList(): Observable<any> {
        return this.http.get(USER_MANAGEMENT_SERVER_API_URL + 'api/getClientList');
    }

    saveUser(data: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/preApprovedResource/saveClient', data);
    }

    getClientAdminList(): Observable<any> {
        return this.http.get(USER_MANAGEMENT_SERVER_API_URL + 'api/preApprovedResource/getClientAdminList');
    }

    deleteClientAdminUser(userId: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/preApprovedResource/deleteClientAdminUser', userId);
    }

    getClientAdminById(userId: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/preApprovedResource/getClientAdminById', userId);
    }

    updateClientAdmin(userInfo: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/preApprovedResource/updateClientAdmin', userInfo);
    }

    downloadAttachment(formdata): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/preApprovedResource/downloadAttachment', formdata, {
            reportProgress: true,
            responseType: 'arraybuffer'
        });
    }
}
