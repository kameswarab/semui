import { Injectable } from '@angular/core';
import { JhiEventManager } from 'ng-jhipster';
import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GLOBAL_EXP_MSG } from 'app/constants';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
    GLOBAL_EXP_MSG;
    constructor(private eventManager: JhiEventManager) {
        this.GLOBAL_EXP_MSG = GLOBAL_EXP_MSG;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap(
                (event: HttpEvent<any>) => {},
                (err: any) => {
                    if (err instanceof HttpErrorResponse) {
                        let errMsg = new Object();
                        errMsg = err;
                        if (!(err.status === 401 && (err.message === '' || (err.url && err.url.includes('/api/account'))))) {
                            if ((err.status == 500 && !(err.error instanceof Object)) || err.status == 400) {
                                if (err.error instanceof Object) {
                                    errMsg['error'] = GLOBAL_EXP_MSG + ' error message : ' + err.statusText;
                                    this.eventManager.broadcast({ name: 'semApp.httpError', content: errMsg });
                                } else {
                                    this.eventManager.broadcast({ name: 'semApp.httpError', content: errMsg });
                                }
                            } else if (err.status == 417) {
                                this.eventManager.broadcast({ name: 'semApp.httpError', content: errMsg });
                            } else {
                                errMsg['error'] = GLOBAL_EXP_MSG + ' error message : ' + err.statusText;
                                this.eventManager.broadcast({ name: 'semApp.httpError', content: errMsg });
                            }
                        }
                    }
                }
            )
        );
    }
}
