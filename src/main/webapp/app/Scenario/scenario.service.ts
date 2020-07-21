import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';
import { AccountService } from 'app/core';

@Injectable({
    providedIn: 'root'
})
export class ScenarioService {
    constructor(private http: HttpClient) {}

    getMethodologyMasterData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getMethodologyMasterData', id);
    }

    saveMethodologyConfigData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/saveMethodologyConfigData', obj);
    }

    getScenarioDataList(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getScenarioDataList', obj);
    }

    getScenarioDetails(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getScenarioDetails', id);
    }

    getScenarioData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getScenarioData', id);
    }

    saveScenarioData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/saveScenarioData', obj);
    }

    deleteScenario(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/deleteScenario', obj);
    }

    saveScenarioConfig(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/saveScenarioConfig', obj);
    }

    getScenarioCreateMasterData(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getScenarioCreateMasterData', id);
    }

    getScenarioConfigureMasterData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getScenarioConfigureMasterData', obj);
    }

    getRiskFactorsData(scenarioId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorsData', scenarioId);
    }

    saveRiskFactorSet(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/saveRiskFactorSet', obj);
    }

    saveRiskFactorSets(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/saveRiskFactorSets', obj);
    }

    overrideRiskFactor(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/overrideRiskFactor', obj);
    }

    getTemplateShockValues(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getTemplateShockValues', obj);
    }

    getScenarioList(scenarioObj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getScenarioListForClone', scenarioObj);
    }

    getRiskFactorSetData(id) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorSetData', id);
    }

    getRiskFactorSetDataForClone(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorSetDataForClone', obj);
    }

    getRiskFactorSetList(id) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorSetList', id);
    }

    getRiskFactorList(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorList', obj);
    }

    getRiskFactorTimeseriesData(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorTimeseriesData', obj);
    }

    saveRiskFactorSetName(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/saveRiskFactorSetName', obj);
    }

    getRiskFactorSetListForClone(id) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorSetListForClone', id);
    }

    getRiskFactorsOnRiskfactorSetId(riskFactorSetId) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorsOnRiskfactorSetId', riskFactorSetId);
    }

    deleteRiskFactorSet(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/deleteRiskFactorSet', obj);
    }

    getMasterListForRiskFactorSelection(id) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getMasterListForRiskFactorSelection', id);
    }

    getMasterListForOutput(id) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getMasterListForOutput', id);
    }

    exportOutput(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/exportOutput', obj, { responseType: 'arraybuffer' });
    }

    getRiskFactorMetrics(id) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getRiskFactorMetrics', id);
    }

    calculateQualityCheck(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/calculateQualityCheck', obj);
    }

    getDataSets(scenarioId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/methodologyapi/getDataSets', scenarioId);
    }

    getMedConfigList(medId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/methodologyapi/getMedConfigList', medId);
    }

    saveDataSets(finalData): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/methodologyapi/saveDataSets/', finalData);
    }

    calQuantileForShocks(finalData): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/methodologyapi/calQuantileForShocks/', finalData);
    }
    getProcessDefinitions(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/get-process-definitions', 'RMU');
    }

    getRoleModel(id: any): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/get-process-definition-model', id);
    }
    saveRoles(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/flowable-roles', id);
    }
    /* getModelMappedRoles(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/flowable-mapped-data', id);
    } */
    /*  action(body: any): any {
        return this.http.post(SERVER_API_URL + 'api/flowable/flowable-action', body);
    } */
    /* sendForReview(obj) {
        return this.http.post(SERVER_API_URL + 'api/flowable/send-action', obj);
    } */
    sendForApprove(obj) {
        return this.http.post(SERVER_API_URL + 'api/flowable/send-action', obj);
    }
    /* sendApproved(obj) {
        return this.http.post(SERVER_API_URL + 'api/flowable/send-action', obj);
    } */
    reject(obj) {
        return this.http.post(SERVER_API_URL + 'api/flowable/reject-action', obj);
    }
    calculateShocksForModelDriven(finalData): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/methodologyapi/calculateShocksForModelDriven', finalData);
    }

    calShocksForInterPolation(finalData): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/methodologyapi/calShocksForInterPolation', finalData);
    }

    /* isTaskAssigned(id: string): any {
        this.http.post(SERVER_API_URL + 'api/flowable/isTaskAssigned', id).subscribe(
            () => {
                return true;
            },
            () => false
        );
    } */
    taskAssigned(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/get-task-status', id);
    }
    /* taskAssignedDesigner(id) {
        return this.http.post(SERVER_API_URL + 'api/flowable/get-task-designer', id);
    } */
    checkAccess(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/designer-task', id);
    }
    getAction(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/get-action', id);
    }
    getCommentsList(id: any): any {
        return this.http.post(SERVER_API_URL + 'api/flowable/comments-list', id);
    }
    userCanAccess(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/flowable/loggedin-user-access', id);
    }
    getSparkLineDataForRFLibrary(id): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getSparkLineDataForRiskFactorTimeseriesPlot', id);
    }
    updateShockTemplateObj(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/updateShockTemplateObj', obj);
    }
    versionUpdate(obj) {
        return this.http.post(SERVER_API_URL + 'api/scenario/versionUpdate', obj);
    }

    getActivityLog(id: any) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getActivityLog', id);
    }

    downloadExcelFile(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/downloadExcelFile', obj, { responseType: 'arraybuffer' });
    }

    downloadTimeSeriesData(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/downloadTimeSeriesData', obj, { responseType: 'arraybuffer' });
    }

    getApprovedModelsByList(obj: any) {
        return this.http.post(SERVER_API_URL + 'api/scenario/getApprovedModelsByList', obj);
    }

    getFiltersConfiguration(obj: any): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getFiltersConfiguration', obj);
    }
    getFiltersMetaData(obj: any): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/getFiltersMetaData', obj);
    }
    downloadMethodologyExcelFile(obj): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/scenario/downloadMethodologyExcelFile', obj, { responseType: 'arraybuffer' });
    }
}
