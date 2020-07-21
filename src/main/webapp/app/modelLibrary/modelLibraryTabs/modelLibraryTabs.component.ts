import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MODEL_LIBRARY_TABS } from 'app/constants';

@Component({
    selector: 'model-library-tabs',
    templateUrl: './modelLibraryTabs.component.html',
    styleUrls: []
})
export class ModelLibraryTabsComponent implements OnInit {
    @Input() selectedTab;
    @Input() status;
    modelObj: any = {};
    tabsets = MODEL_LIBRARY_TABS;

    constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

    ngOnInit() {
        const data = this.activatedRoute.snapshot.params.id;
        if (data) {
            this.modelObj.id = data;
        }
    }
    navigateTo(tab) {
        if (this.status + 1 >= tab.status) {
            this.selectedTab = tab.id;

            this.router.navigate([tab.value, { id: this.modelObj.id }], { skipLocationChange: true });
        }
    }
}
