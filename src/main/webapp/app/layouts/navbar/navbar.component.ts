import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { VERSION } from 'app/app.constants';
import { AccountService, LoginService } from 'app/core';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { KeycloakService } from 'keycloak-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { NavbarService } from './navbar.service';
import { ClientAdminService } from 'app/clientAdmin/client-admin.service';
import { HomeService } from 'app/home';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['navbar.css']
})
export class NavbarComponent implements OnInit {
    @ViewChild('deleteEntityModal')
    deleteEntityModal: ElementRef;

    @ViewChild('iprange')
    ipRangeModal: ElementRef;

    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    version: string;
    username: string;
    admin = false;
    sessionId: string;
    clientList = [];
    clientId = null;
    themeswitch = 'whitetheme';
    user = {};

    constructor(
        private loginService: LoginService,
        private accountService: AccountService,
        private profileService: ProfileService,
        private router: Router,
        private keycloakService: KeycloakService,
        private modalService: NgbModal,
        private homeService: HomeService,
        private location: Location,
        private clientAdminService: ClientAdminService,
        private navbarService: NavbarService
    ) {
        this.version = VERSION ? 'v' + VERSION : '';
        this.isNavbarCollapsed = true;
    }

    async ngOnInit() {
        this.username = await this.keycloakService.getUsername();
        this.sessionId = await this.keycloakService.getKeycloakInstance().sessionId;

        this.router.events.subscribe(val => {
            if (val instanceof NavigationEnd) {
                this.validateSessions();
            }
        });
        this.profileService.getProfileInfo().then(profileInfo => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
        await this.homeService.getUserData(this.username).subscribe(
            resp => {
                this.user = resp;
                this.clientId = this.user['clientId'];
                this.profileService.checkForValidIP(this.username).subscribe(
                    validity => {
                        if (!validity) {
                            this.modalService.open(this.ipRangeModal);
                            setTimeout(() => {
                                this.modalService.dismissAll();
                                this.logout();
                            }, 3000);
                            this.logout();
                        } else {
                            this.checkMultipleSession();
                        }
                    },
                    resp => {
                        this.logout();
                    }
                );
            },
            resp => {
                this.logout();
            }
        );
    }

    isError = false;

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

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    reloadContext() {
        this.navbarService.reloadContextSEMService().subscribe(response => {}, response => {});
        this.navbarService.reloadContextDataIngestionService().subscribe(response => {}, response => {});
        this.navbarService.reloadContextRmodelService().subscribe(response => {}, response => {});
    }

    isAuthenticated() {
        // this.validateSessions();
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginService.login();
    }

    logout() {
        /*         this.keycloakService.logout(
            '/'
        ); */
        this.router.navigate(['']).then(() => {
            this.keycloakService.logout();
        });
        this.collapseNavbar();
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }

    getImageUrl() {
        return this.isAuthenticated() ? this.accountService.getImageUrl() : null;
    }
    killSessions() {
        this.accountService.killsessions().subscribe(response => {
            this.modalService.dismissAll();
        });
    }
    validateSessions() {
        this.accountService.validateSessions(this.sessionId).subscribe(response => {
            if (response) {
                this.keycloakService.logout();
                // window.location.reload();
            }
        });
    }
    checkMultipleSession() {
        this.accountService.checkMultipleSession().subscribe(response => {
            if (response) {
                this.modalService.open(this.deleteEntityModal);
            }
        });
    }
    cancel() {
        this.modalService.dismissAll();
        this.keycloakService.logout();
    }

    encrypt(value) {
        let key = CryptoJS.enc.Utf8.parse('7061737323313233');
        let ivKey = CryptoJS.enc.Utf8.parse('7061737323313233');

        let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key, {
            keySize: 16,
            iv: ivKey,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    newPassword = null;
    confirmPassword = null;
    oldPassword = null;
    key = null;
    iv = null;
    errorMsg = null;

    changePasswordModal(modal) {
        this.isError = false;
        this.newPassword = this.confirmPassword = this.oldPassword = null;
        this.modalService.open(modal, { size: 'lg' });
    }

    changePassword(form: NgForm) {
        this.isError = false;
        if (form.valid) {
            if (this.newPassword === this.confirmPassword) {
                if (this.newPassword !== this.oldPassword) {
                    let values = this.oldPassword.trim() + ',' + this.newPassword.trim() + ',' + this.confirmPassword.trim();
                    let encrypted = this.encrypt(values);
                    this.accountService.updatePassword(encrypted).subscribe(
                        response => {
                            this.keycloakService.logout();
                        },
                        response => {
                            this.isError = true;
                            this.errorMsg = response.error.title;
                        }
                    );
                } else {
                    this.isError = true;
                    this.errorMsg = 'Old password and new password should not be same';
                }
            } else {
                this.isError = true;
                this.errorMsg = 'New Password and Confirm  Password is not matching';
            }
        }
    }
    //Theme Switcher Start
    changetheme(e) {
        const el: HTMLElement = document.getElementsByName('themeswitch')[0];
        el.setAttribute('id', e.target.value);
        this.themeswitch = e.target.value;
    }
    //Theme Switcher End
}
