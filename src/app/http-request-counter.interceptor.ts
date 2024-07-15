import {Injectable, Injector, NgZone} from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {tap} from "rxjs/operators";
import { GlobalService } from "./service/global.service";

@Injectable()
export class HttpRequestCounterInterceptor implements HttpInterceptor {

    constructor(
        private globalService: GlobalService
    ) {
    }

    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.globalService.HttpCounter++;

        return next.handle(httpRequest).pipe(
            tap(
                (event: any) => {
                    if (event.type !== 0) {
                        this.globalService.HttpCounter--;
                    }
                },  (err: any) => {
                    this.globalService.HttpCounter--;
                }
            )
        )

    }
}
