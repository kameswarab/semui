import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MODEL_TABS } from 'app/constants';

@Component({
    selector: 'model-tabs',
    templateUrl: './modelTabs.component.html',
    styleUrls: []
})
export class ModelTabsComponent implements OnInit {
    @Input() selectedTab;
    @Input() status;
    modelObj: any = {};
    basePath;
    modelId;
    folderName;
    tabsets = MODEL_TABS;

    constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

    ngOnInit() {
        this.modelId = this.activatedRoute.snapshot.params.id;
        this.basePath = this.activatedRoute.snapshot.params.basePath;
        this.folderName = this.activatedRoute.snapshot.params.folderName;
    }
    navigateTo(tab) {
        if (this.status + 1 >= tab.status) {
            this.selectedTab = tab.id;

            this.router.navigate([tab.value, { id: this.modelId, basePath: this.basePath, folderName: this.folderName }], {
                skipLocationChange: true
            });
        }
    }
}
