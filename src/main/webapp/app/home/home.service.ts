import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from 'app/app.constants';

@Injectable()
export class HomeService {
    constructor(private http: HttpClient) {}

    getHomePageInformation(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/home/getHomePageInformation', {});
    }

    getUserData(username): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/home/getUserData', username);
    }
}
