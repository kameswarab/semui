import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DATAINGESTION_SERVER_API_URL } from 'app/app.constants';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private headers: HttpHeaders;

    public fileConfigList: any[];

    constructor(private http: HttpClient) {
        this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    private handleError(error: any) {
        if (error instanceof Response) {
            return throwError(error.json()['error'] || 'backend server error');
        }
        return throwError(error || 'backend server error');
    }

    getFileConfiguration() {
        return this.http.get(DATAINGESTION_SERVER_API_URL + 'fileupload/getFileUploadConfiguration').pipe(
            map((response: Response) => {
                return response;
            }),
            catchError((error: Response) => {
                return this.handleError(error);
            })
        );
    }

    getAllFileUploads() {
        return this.http.get(DATAINGESTION_SERVER_API_URL + 'fileupload/getAllFileUploadsInformation').pipe(
            map((response: Response) => {
                return response;
            }),
            catchError((error: Response) => {
                return this.handleError(error);
            })
        );
    }

    saveUploadedTemplate(data: any) {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/saveUploadedTemplateTest', data);
    }

    getFileUploadInView(fileId): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/getFileUploadedDataInViewTest', parseInt(fileId));
    }

    getFileUploadFinalDataTableColumnConfiguration(data: any): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/getFileUploadFinalDataTableColumnConfiguration', data);
    }

    validateUploadedData(data: any): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/validateUploadedData', data);
    }

    insertUploadedData(data: any): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/insertFileDataIntoMasters', data);
    }

    getRefrenceFileConfiguration(fileConfigId): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/getRefrenceFileConfiguration', parseInt(fileConfigId));
    }

    deleteUploadedFile(fileId): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/deleteUploadedFile', parseInt(fileId));
    }

    getMasterConfigData(obj): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/getMasterConfigData', obj);
    }

    deleteMasterConfigData(masterId): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/deleteMasterConfigData', masterId);
    }

    downloadFileAttachement(formdata): Observable<any> {
        return this.http.post(DATAINGESTION_SERVER_API_URL + 'fileupload/downloadFileAttachement', formdata, {
            reportProgress: true,
            responseType: 'arraybuffer'
        });
    }
}
