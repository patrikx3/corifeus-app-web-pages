import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptionsArgs } from '@angular/http';

import { SettingsService } from 'corifeus-web';

const template = require('lodash/template');

import 'rxjs/add/operator/toPromise';

const cache : any = {};


@Injectable()
export class CdnService {

    private _repos : Promise<any[]>;

    private requestOptions: any

    private settings : any;

    constructor(
        private http: Http,
        private settingsAll: SettingsService
    ) {
        this.settings = settingsAll.data.pages;

        const headers = new Headers();
        headers.append('Authorization', `token ${atob(this.settings.github.token)}`);
        this.requestOptions = {
          headers: headers
        };
    }

    async repos() : Promise<any[]>  {
        if (this._repos === undefined) {
            const patternExcludes = this.settings.github['exclude-starts-with'];

            this._repos = this.http.get(this.settings.github.url.repos, this.requestOptions).toPromise().then((response) => {
                const result = response.json().filter((repo : any) => {
                    const name = repo.name.toLowerCase();
                    let excluded = false;
                    for(let patternExclude of patternExcludes) {
                        if (name.startsWith(patternExclude)) {
                            excluded = true;
                            break;
                        }
                    }
                    return !excluded;
                });
                return result;
            });
        }
        return this._repos;
    }

    url(repo: string, path: string) : string {
        const params = {
            user: this.settings.github.user,
            path: path,
            repo: repo
        };
        const url =template(this.settings.github.url.file)(params);
        return url;
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

    async repo(name: string) : Promise<any> {

        const repos = await this.repos();
        return repos.find((repo: any) => repo.name === name);
    }
}