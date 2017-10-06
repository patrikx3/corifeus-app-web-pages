import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptionsArgs } from '@angular/http';

import { SettingsService } from 'corifeus-web';

const template = require('lodash/template');

import 'rxjs/add/operator/toPromise';

const cache : any = {};


@Injectable()
export class CdnService {

    private settings : any;

    constructor(
        private http: Http,
        private settingsAll: SettingsService
    ) {
        this.settings = settingsAll.data.pages;
    }


    async file(repo: string, path : string) : Promise<Response> {
        const postfix = '.html';

        const index = `index${postfix}`;
        if (path.endsWith(index)) {
            path = path.substr(0, path.length - index.length) + 'README.md';
        }

        if (path.endsWith(postfix)){
            path = path.substr(0, path.length - postfix.length) + '.md';
        }
        const url = `https://cdn.corifeus.com/git/${repo}/${path}`;
        if (cache[url] === undefined) {
            cache[url] = await this.http.get(url).toPromise();
        }
        return cache[url];
    }


}