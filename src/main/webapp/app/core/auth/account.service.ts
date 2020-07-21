import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { SERVER_API_URL, profile, USER_MANAGEMENT_SERVER_API_URL } from 'app/app.constants';
import { Account } from 'app/core/user/account.model';
import { AuthGuard } from 'app/guards/authguard.service';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userIdentity: any;
    private authenticated = false;
    private authenticationState = new Subject<any>();

    constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

    /*   fetch(): Observable<HttpResponse<Account>> {
        return this.http.get<Account>(SERVER_API_URL + 'api/account', { observe: 'response' });
    }

    save(account: any): Observable<HttpResponse<any>> {
        return this.http.post(SERVER_API_URL + 'api/account', account, { observe: 'response' });
    } */

    updatePassword(encrypted: any): Observable<any> {
        return this.http.post(USER_MANAGEMENT_SERVER_API_URL + 'api/clientUserResource/updatePassword', encrypted);
    }

    authenticate(identity) {
        this.userIdentity = identity;
        this.authenticated = identity !== null;
        this.authenticationState.next(this.userIdentity);
    }

    hasAnyAuthority(authorities: string[]): boolean {
        if (!this.authenticated || !this.userIdentity || !this.userIdentity.authorities) {
            return false;
        }

        for (let i = 0; i < authorities.length; i++) {
            if (this.userIdentity.authorities.includes(authorities[i])) {
                return true;
            }
        }

        return false;
    }

    hasAuthority(authority: string): Promise<boolean> {
        if (!this.authenticated) {
            return Promise.resolve(false);
        }

        return this.identity().then(
            id => {
                return Promise.resolve(id.authorities && id.authorities.includes(authority));
            },
            () => {
                return Promise.resolve(false);
            }
        );
    }

    identity(force?: boolean): Promise<any> {
        if (force) {
            this.userIdentity = undefined;
        }

        // check and see if we have retrieved the userIdentity data from the server.
        // if we have, reuse it by immediately resolving
        if (this.userIdentity) {
            return Promise.resolve(this.userIdentity);
        }
        //  this.keycloakService.isLoggedIn()
        // const account = this.keycloakService.loadUserProfile().;
        // retrieve the userIdentity data from the server, update the identity object, and then resolve.
        return this.keycloakService
            .loadUserProfile()
            .then(response => {
                const account = response;
                if (account) {
                    account['authorities'] = this.keycloakService.getUserRoles();
                    if (account['authorities'].length == 3) {
                        return false;
                    }
                    this.userIdentity = account;
                    this.authenticated = true;
                } else {
                    this.userIdentity = null;
                    this.authenticated = false;
                }
                this.authenticationState.next(this.userIdentity);
                return this.userIdentity;
            })
            .catch(err => {
                this.userIdentity = null;
                this.authenticated = false;
                this.authenticationState.next(this.userIdentity);
                return null;
            });
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }

    isIdentityResolved(): boolean {
        return this.userIdentity !== undefined;
    }

    getAuthenticationState(): Observable<any> {
        return this.authenticationState.asObservable();
    }

    getImageUrl(): string {
        return this.isIdentityResolved() ? this.userIdentity.imageUrl : null;
    }
    checkSessions(sessionId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/checksessions', sessionId);
    }
    killsessions(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/user-management/user-sessions', '');
    }
    validateSessions(sessionId): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/user-management/validate-sessions', sessionId);
    }
    checkMultipleSession(): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/user-management/check-sessions', '');
    }
}
