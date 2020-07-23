import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {SettingsService} from '../../web';

@Injectable()
export class CdnService {

    private settings: any;

    constructor(private http: HttpClient,
                private settingsAll: SettingsService) {
        this.settings = settingsAll.data.pages;
    }


    async file(repo: string, path: string) {
        const postfix = '.html';

        //FIXME corifeus - matrix
        if (repo === 'matrix') {
            repo = 'corifeus'
        }

        const index = `index${postfix}`;
        if (path.endsWith(index)) {
            path = path.substr(0, path.length - index.length) + 'README.md';
        }

        if (path.endsWith(postfix)) {
            path = path.substr(0, path.length - postfix.length) + '.md';
        }
        const url = `https://cdn.corifeus.com/git/${repo}/${path}`;
        const text = await this.http.get(url, {responseType: 'text'}).toPromise();
        return text;
    }


}
