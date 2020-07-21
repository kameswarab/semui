import { Component, OnInit } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { Router } from '@angular/router';
import { ClientAdminService } from 'app/clientAdmin/client-admin.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeycloakService } from 'keycloak-angular';
import { HomeService } from 'app/home';

@Component({
    selector: 'admin-home',
    templateUrl: './administration.component.html'
})
export class AdministrationComponent implements OnInit {
    account: Account;
    isNavbarCollapsed: boolean;
    clientList = [];
    user = {};
    username: string;
    clientId = null;
    isError = false;

    constructor(
        private accountService: AccountService,
        private clientAdminService: ClientAdminService,
        private loginService: LoginService,
        private modalService: NgbModal,
        private homeService: HomeService,
        private keycloakService: KeycloakService,
        private router: Router
    ) {}

    async ngOnInit() {
        this.username = await this.keycloakService.getUsername();
        this.accountService.identity().then((account: Account) => {
            this.account = account;
        });

        let observable = await this.homeService.getUserData(this.username);

        observable.subscribe(resp => {
            this.user = resp;
            this.clientId = this.user['clientId'];
        });
    }

    isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    login() {
        this.loginService.login();
    }

    navigateTo(path) {
        this.router.navigate([path, {}], { skipLocationChange: true });
    }

    changeClient() {
        if (this.clientId && this.username && this.clientId != this.user['clientId']) {
            this.clientAdminService.changeClient({ username: this.username, client: this.clientId }).subscribe(
                response => {
                    this.modalService.dismissAll();
                    this.router.navigate(['/'], { skipLocationChange: true });
                },
                () => {
                    this.isError = true;
                }
            );
        }
    }

    changeClientModal(modal) {
        this.isError = false;
        this.clientAdminService.getClientList().subscribe(
            response => {
                this.clientList = response;
                this.modalService.open(modal);
            },
            () => {
                this.modalService.open(modal);
            }
        );
    }
}
