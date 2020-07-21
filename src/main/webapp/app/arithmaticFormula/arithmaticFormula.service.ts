import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, IUserResponse } from './user.class';

@Injectable({ providedIn: 'root' })
export class ArithmaticFormulaService {
    constructor(private http: HttpClient) {}

    /*     taxonomySelectionChange(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/riskfactorInfo/getRiskFactors', {});
    } */

    search(filter: { name: string } = { name: '' }, page = 1): Observable<IUserResponse> {
        return this.http.get<IUserResponse>(SERVER_API_URL + 'api/riskfactorInfo/getRiskFactors').pipe(
            tap((response: IUserResponse) => {
                response.results = response.results
                    .map(user => new User(user.id, user.name))
                    // Not filtering in the server since in-memory-web-api has somewhat restricted api
                    .filter(user => user.name.includes(filter.name));

                return response;
            })
        );
    }
}
