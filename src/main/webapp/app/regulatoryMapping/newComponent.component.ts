import { Component, Input, OnInit } from '@angular/core';
import { ICellRendererAngularComp, AgRendererComponent } from 'ag-grid-angular/main';
import { BulkRiskFactorInfoService } from 'app/bulkRiskFactor/bulkRiskfactorInfo.service';
import { RegulatoryMappingService } from 'app/regulatoryMapping/regulatoryMapping.service';

@Component({
    selector: 'jhi-display-cell',
    templateUrl: './newComponent.component.html',
    styleUrls: ['regulatoryMapping.css']
})
export class NewComponent implements AgRendererComponent, OnInit {
    params: any;
    constructor() {}
    ngOnInit() {}
    agInit(params: any): void {
        this.params = params;
    }
    refresh(params: any): boolean {
        return false;
    }
    onAdd($event) {}
    onRemove($event) {}
}
