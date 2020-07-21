import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    ANALYSIS_TYPE_COMPARISION,
    ANALYSIS_TYPE_PROPAGATION,
    ANALYSIS_TYPE_PREDICTION,
    ANALYSIS_TYPE_TIMESERIES,
    ANALYSIS_TYPE_RATE_CURVE,
    ANALYSIS_TYPE_ACF,
    ANALYSIS_TYPE_HISTOGRAM,
    ANALYSIS_TYPE_BOX,
    ANALYSIS_TYPE_RATE_CORRELATION
} from 'app/constants';

@Component({
    selector: 'jhi-analysis-list',
    templateUrl: './analysisList.component.html',
    styleUrls: ['analysis.css']
})
export class AnalysisListComponent implements OnInit {
    analysisTypeConfigList = [];

    displayFailureMessage: string;
    isFailure = false;

    ANALYSIS_TYPE_COMPARISION = ANALYSIS_TYPE_COMPARISION;
    ANALYSIS_TYPE_PROPAGATION = ANALYSIS_TYPE_PROPAGATION;
    ANALYSIS_TYPE_PREDICTION = ANALYSIS_TYPE_PREDICTION;
    ANALYSIS_TYPE_RATE_CURVE = ANALYSIS_TYPE_RATE_CURVE;
    ANALYSIS_TYPE_TIMESERIES = ANALYSIS_TYPE_TIMESERIES;
    ANALYSIS_TYPE_HISTOGRAM = ANALYSIS_TYPE_HISTOGRAM;
    ANALYSIS_TYPE_ACF = ANALYSIS_TYPE_ACF;
    ANALYSIS_TYPE_BOX = ANALYSIS_TYPE_BOX;
    ANALYSIS_TYPE_RATE_CORRELATION = ANALYSIS_TYPE_RATE_CORRELATION;

    ngOnInit() {}

    constructor(private router: Router) {}

    getAnalysis(analysisType: Number) {
        this.router.navigate(['analysisList/analysis', { id: analysisType }], { skipLocationChange: true });
    }
}
