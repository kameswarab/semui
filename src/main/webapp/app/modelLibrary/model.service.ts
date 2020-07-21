import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable()
export class ModelService {
    constructor(private http: HttpClient) {}

    getModelCreateMasterData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getModelCreateMasterData', id);
    }

    getModelData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getModelData', id);
    }

    saveModelData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/saveModelData', obj);
    }

    getModelDataList(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getAuthorizedModelDataList', obj);
    }

    getModelConfigureMasterData(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getModelConfigureMasterData', {});
    }

    getMethodologyMasterData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getMethodologyMasterData', id);
    }

    saveModelConfigData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/saveModelConfigData', obj);
    }

    getModelReviewRiskFactors(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getModelReviewRiskFactors', obj);
    }

    getRFModelLibraryData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getRFModelLibraryData', obj);
    }

    getRFModelLibraryGraphData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getRFModelLibraryGraphData', obj);
    }

    getModelRiskFactorsData(modelId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getModelRiskFactorsData', modelId);
    }

    deleteModelRiskFactor(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/deleteModelRiskFactor', obj);
    }

    updateModelRiskFactorsData(modelData): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/updateModelRiskFactorsData', modelData);
    }

    /* getMasterListForModelRiskFactors() {
        return this.http.post(SERVER_API_URL + 'api/model/getMasterListForModelRiskFactors', {});
    } */

    getDepRiskFactorsData(modelId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getDepRiskFactorsData', modelId);
    }

    getInDepRiskFactorsData(modelId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getInDepRiskFactorsData', modelId);
    }

    deleteModel(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/deleteModel', obj);
    }

    saveModelDepRiskFactors(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/saveModelDepRiskFactors', obj);
    }

    saveModelInDepRiskFactors(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/saveModelInDepRiskFactors', obj);
    }

    getQualityCheck(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getQualityCheck', obj);
    }

    getRiskFactorsFilterData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getRiskFactorsFilterData', obj);
    }

    saveModelReviewRFData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/saveModelReviewRFData', obj);
    }

    buildModel(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/buildModel', obj);
    }

    getCorrelationChart(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/analysis/getAnalysisData', obj);
    }
    getProcessDefinitions(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/get-process-definitions', 'MODEL');
    }
    checkAccess(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/designer-task', id);
    }

    getRoleModel(id: any): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/get-process-definition-model', id);
    }
    getCommentsList(id: any): any {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/comments-list', id);
    }
    sendForApprove(obj) {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/send-action', obj);
    }
    getAction(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/get-action', id);
    }
    taskAssigned(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/get-task-status', id);
    }
    saveRoles(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/flowable-roles', id);
    }
    reject(obj) {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/reject-action', obj);
    }
    /* taskAssignedDesigner(id) {
        return this.http.post(SERVER_API_URL + 'api/modelflowable/get-task-designer', id);
    } */
    getMasterListForRiskFactorSelection(id) {
        return this.http.post(SERVER_API_URL + 'api/model/getMasterListForRiskFactorSelection', id);
    }
    getRiskFactorsData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getRiskFactorsData', id);
    }
    getModelDetails(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getModelDetails', id);
    }
    getTimeSeriesData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getTimeSeriesData', obj);
    }
    getOpenTabsData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/getOpenTabsData', obj);
    }
    validateModel(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/validateModel', id);
    }
    downloadExcelFile(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/model/downloadExcelFile', obj, { responseType: 'arraybuffer' });
    }
    downloadTimeSeriesData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/downloadTimeSeriesData', obj, { responseType: 'arraybuffer' });
    }
}
