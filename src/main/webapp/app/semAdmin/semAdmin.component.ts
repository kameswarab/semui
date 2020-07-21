import { Component, OnInit } from '@angular/core';

import { LoginService, AccountService, Account } from 'app/core';
import { Router } from '@angular/router';

@Component({
    selector: 'admin-home',
    templateUrl: './semAdmin.component.html'
})
export class SemAdminComponent implements OnInit {
    account: Account;
    constructor(private accountService: AccountService, private loginService: LoginService, private router: Router) {}

    ngOnInit() {
        this.accountService.identity().then((account: Account) => {
            this.account = account;
        });
    }

    isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    login() {
        this.loginService.login();
    }

    navigateTo(path) {
        this.router.navigate(['/fileUpload', { flag: path }], { skipLocationChange: true });
    }
}
