import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MODEL_SERVICE_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable()
export class ModelsService {
    constructor(private http: HttpClient) {}

    getModelsList(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getModelsList', obj);
    }

    getApprovedModelsList(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getApprovedModelsList', obj);
    }

    getModelDetailed(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getModelDetailed', obj);
    }

    uploadZip(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/uploadZip', obj);
    }

    getInputLayoutFile(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getInputLayoutFile', obj, { responseType: 'text' });
    }

    getFileStructure(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getFileStructure', obj);
    }

    getSavedRFile(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getSavedRFile', obj, { responseType: 'text' });
    }

    getCSVFile(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getCSVFile', obj);
    }

    executeRFile(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/executeRFile', obj);
    }

    executeRFileBulk(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/executeRFileBulk', obj);
    }

    saveUploadedFiles(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/saveUploadedFiles', obj);
    }

    deleteFile(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/deleteFile', obj);
    }

    getOutputBarChart(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getOutputBarChart', obj);
    }

    updateFileContent(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/updateFileContent', obj);
    }

    changeTypeListdata(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/changeTypeListdata', obj);
    }

    saveOutputConfig(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/saveOutputConfig', obj);
    }

    getModelStatus(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/getModelStatus', obj);
    }
    addNewFile(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/addNewFile', obj);
    }
    updateModelsMaster(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/updateModelsMaster', obj);
    }
    updateModelStatus(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/updateModelStatus', obj);
    }
    updateExcelSheet(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/updateExcelSheet', obj);
    }
    createNewModel(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/createNewModel', obj);
    }
    deleteModel(obj): Observable<any> {
        return this.http.post(MODEL_SERVICE_API_URL + 'api/model/deleteModel', obj);
    }
}
