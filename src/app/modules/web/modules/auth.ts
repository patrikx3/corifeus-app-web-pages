import {
    Injectable,

    Inject
} from '@angular/core';

//import {
//    CookieService,
//} from '../services/cookie';

import {
    HttpShareService,
} from '../services/http/http-share';

import {HttpClient} from '@angular/common/http';

import {
    SettingsService,
} from '../services/settings';

import { Token } from "./auth-token";

@Injectable()
export class AuthService {

    constructor(
        private settings: SettingsService,
        //       private cookie: CookieService,
        private http: HttpClient,
        private httpShare: HttpShareService,
    ) {
    }

    public async login(login: any) {

        return new Promise(async (resolve, reject) => {
            const observable: any = await this.http.post(`${this.settings.data.core.server.url}/api/core/auth/login`, login, {
                observe: 'response'
            }).subscribe((response: any) => {
                    try {
                        if (response.headers.has(this.settings.data.core.header.token)) {
                            this.httpShare.token = response.headers.get(this.settings.data.core.header.token);
                        }
                    } catch (e) {
                        window.corifeus.core.http.error.push(e);
                    }
                    const body: any = response.body;
//                console.log(this.httpShare.token);
                    resolve(Token(body.token));
                },
                (err: Error) => {
                    this.httpShare.token = '';
                    reject(err)
                })
        });
    }

    public async verify() {
        await this.http.get(`${this.settings.data.core.server.url}/api/core/auth/verify`).toPromise();
        return Token(this.httpShare.token);
    }

    public async prolongate() {
        const response = await this.http.get(`${this.settings.data.core.server.url}/api/core/auth/prolongate`).toPromise();
        this.httpShare.token = `${response['token']}`;
        return Token(this.httpShare.token);
    }
}

