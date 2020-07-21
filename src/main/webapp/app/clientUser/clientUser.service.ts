import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { USER_MANAGEMENT_SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';
import { ClientUserModel } from './clientUser.model';

@Injectable({
    providedIn: 'root'
})
export class ClientUserService {
    constructor(private http: HttpClient) {}

    getUsers(obj) {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/clientUser/getUsers', obj);
    }

    getUserComments(id) {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/clientUser/getUserComments', id);
    }

    saveUser(obj): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/clientUser/saveUser', obj);
    }

    getSubRoles(): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/roleMaster/getClientUserRoles', {});
    }

    deleteUser(userId: number): any {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/clientUser/deleteUser', userId);
    }
}
