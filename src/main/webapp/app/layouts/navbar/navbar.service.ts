import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL, DATAINGESTION_SERVER_API_URL, R_MODEL_SERVICE_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable()
export class NavbarService {
    constructor(private http: HttpClient) {}

    reloadContextSEMService(): Observable<any> {
        return this.http.get(SERVER_API_URL + 'api/semService/reloadContext', {});
    }

    reloadContextDataIngestionService(): Observable<any> {
        return this.http.get(DATAINGESTION_SERVER_API_URL + 'dataIngestionService/reloadContext', {});
    }

    reloadContextRmodelService(): Observable<any> {
        return this.http.get(R_MODEL_SERVICE_API_URL + 'api/rmodelService/reloadContext', {});
    }
}
