import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { SERVER_API_URL } from '../../app.constants';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private localStorage: LocalStorageService,
        private sessionStorage: SessionStorageService,
        private loadingIndicatorService: LoadingIndicatorService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request || !request.url || (/^http/.test(request.url) && !(SERVER_API_URL && request.url.startsWith(SERVER_API_URL)))) {
            this.loadingIndicatorService.onStarted(request);
            return next.handle(request).pipe(
                tap(
                    (event: HttpEvent<any>) => {
                        if (event instanceof HttpResponse) {
                            this.loadingIndicatorService.onFinished(request);
                        }
                    },
                    (err: any) => {
                        if (err instanceof HttpErrorResponse) {
                            this.loadingIndicatorService.onFinished(request);
                        }
                    }
                )
            );
        }

        const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');
        if (!!token) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + token
                }
            });
        }
        if (request.url.indexOf('downloadTimeSeriesData') === -1) {
            this.loadingIndicatorService.onStarted(request);
        }
        return next.handle(request).pipe(
            tap(
                (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        if (request.url.indexOf('downloadTimeSeriesData') === -1) {
                            this.loadingIndicatorService.onFinished(request);
                        }
                    }
                },
                (err: any) => {
                    if (err instanceof HttpErrorResponse) {
                        if (request.url.indexOf('downloadTimeSeriesData') === -1) {
                            this.loadingIndicatorService.onFinished(request);
                        }
                    }
                }
            )
        );
    }
}
