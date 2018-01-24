/*
* Created by Pankush Manchanda 15,January 2017
* Http Interceptor to add diffrent function to http request like passing option in every request
* Advantage : Used to remove the code duplication
*/

import { Injectable } from '@angular/core';
import { ConnectionBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthService } from './services/authentication/auth.service';
import { ConfirmationDialogsService } from './services/dialog/confirmation.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw'

@Injectable()
export class AuthorizationWrapper extends Http {
    token: any;
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions
        , private router: Router, private authService: AuthService, private message: ConfirmationDialogsService) {
        super(backend, defaultOptions);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        return super.get(url, this.getRequestOptionArgs(options)).catch(this.onCatch)
            .do((res: Response) => {
                this.onSuccess(res);
            }, (error: any) => {
                this.onError(error);
            })
            .finally(() => {
                this.onEnd();
            });
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        return super.post(url, body, this.getRequestOptionArgs(
            options
        )).catch(
            this.onCatch
            ).do(
            (res: Response) => {
                this.onSuccess(res);
            }, (error: any) => {
                this.onError(error);
            })
            .finally(() => {
                this.onEnd();
            });
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        return super.put(url, body, this.getRequestOptionArgs(options)).catch(this.onCatch).do((res: Response) => {
            this.onSuccess(res);
        }, (error: any) => {
            this.onError(error);
        })
            .finally(() => {
                this.onEnd();
            });
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        return super.delete(url, this.getRequestOptionArgs(options)).catch(this.onCatch).do((res: Response) => {
            this.onSuccess(res);
        }, (error: any) => {
            this.onError(error);
        })
            .finally(() => {
                this.onEnd();
            });
    }

    // private updateUrl(req: string) {
    //     return environment.origin + req;
    // }

    private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        options.headers.append('Access-Control-Allow-Origin', '*');
        options.headers.append('Authorization', this.authService.getToken());
        return options;
    }
    private onEnd(): void {
    }
    private onSuccess(response: any) {
        if (response.json().data) {
            return response;
        } else if (response.json().statusCode === 5002) {
            this.router.navigate(['']);
            this.message.alert(response.json().errorMessage);
            this.authService.removeToken();
            return Observable.empty();
        } else {
            throw response;
        }
    }
    private onError(error: any) {
        return error;
    }

    private onCatch(error: any, caught?: Observable<Response>): Observable<Response> {
        // return Observable.throw(error);
        return Observable.throw(error);
    }
}