import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd, NavigationError } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { LoadingIndicatorService } from 'app/services/loading-indicator.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as $ from 'jquery';

@Component({
    selector: 'jhi-main',
    templateUrl: './main.component.html'
})
export class JhiMainComponent implements OnInit {
    loading = false;

    constructor(
        private titleService: Title,
        private router: Router,
        private loadingIndicatorService: LoadingIndicatorService,
        private spinner: NgxSpinnerService
    ) {
        this.loadingIndicatorService.onLoadingChanged.subscribe(isLoading => {
            this.loading = isLoading;
            if (this.loading) {
                this.spinner.show();
            } else {
                this.spinner.hide();
            }
        });
    }

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = routeSnapshot.data && routeSnapshot.data['pageTitle'] ? routeSnapshot.data['pageTitle'] : 'semApp';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
            }
            if (event instanceof NavigationError && event.error.status === 404) {
                this.router.navigate(['/404']);
            }
        });
    }
}
/*Resize Table  Start*/
$(function() {
    var startX,
        startWidth,
        $handle,
        $table,
        pressed = false;

    $(document)
        .on({
            mousemove: function(event) {
                if (pressed) {
                    $handle.width(startWidth + (event.pageX - startX));
                }
            },
            mouseup: function() {
                if (pressed) {
                    $table.removeClass('resizing');
                    pressed = false;
                }
            }
        })
        .on('mousedown', '.table-resizable th', function(event) {
            $handle = $(this);
            pressed = true;
            startX = event.pageX;
            startWidth = $handle.width();

            $table = $handle.closest('.table-resizable').addClass('resizing');
        })
        .on('dblclick', '.table-resizable thead', function() {
            // Reset column sizes on double click
            $(this)
                .find('th[style]')
                .css('width', '');
        });
});
/*Resize Table  End*/
