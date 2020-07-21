import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SCENARIO_TABS } from 'app/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-scenario-tabs',
    templateUrl: './scenario-tabs.component.html',
    styleUrls: ['../scenario.css']
})
export class ScenarioTabsComponent implements OnInit {
    @Input() selectedTab;
    @Input() status;
    @Input() onChangeScreen;
    scenarioObj: any = {};
    tabsets = SCENARIO_TABS;
    temptab: any;
    @ViewChild('changeValues')
    changeValues: ElementRef;

    constructor(private activatedRoute: ActivatedRoute, private modalService: NgbModal, private router: Router) {}

    ngOnInit() {
        const id = this.activatedRoute.snapshot.params.id;
        if (id) {
            this.scenarioObj.id = id;
        }
    }
    navigateTo(tab) {
        this.temptab = tab;
        this.modalService.dismissAll();
        if (this.status >= tab.status && this.onChangeScreen) {
            this.modalService.open(this.changeValues, {});
        } else {
            if (this.status >= tab.status) {
                this.selectedTab = tab.id;
                this.router.navigate([tab.value, { id: this.scenarioObj.id }], { skipLocationChange: true });
            }
        }
    }
    navigateToTab() {
        this.modalService.dismissAll();
        this.onChangeScreen = false;
        // if (this.status >= tab.status) {
        this.selectedTab = this.temptab.id;
        this.router.navigate([this.temptab.value, { id: this.scenarioObj.id }], { skipLocationChange: true });
        //}
    }
    updatePopUp() {
        this.modalService.dismissAll();
    }
}
