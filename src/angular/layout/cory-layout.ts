import {
    Component,
    Injectable,
    ViewEncapsulation,
    ViewChild,
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import {
    MdSidenav
} from '@angular/material'

import {
    RouterService,
} from 'corifeus-web';

import {
    Http
} from '@angular/http';

import * as moment from 'moment';

import { CdnService} from '../service';

import {LocaleService, LocaleSubject, SettingsService} from 'corifeus-web';
import {NotifyService} from 'corifeus-web-material';

import { Observable } from 'rxjs';

import  { extractTitle } from '../utils/extracTitle';

@Component({
    selector: 'cory-layout',
    templateUrl: 'cory-layout.html',
    encapsulation: ViewEncapsulation.None
})

@Injectable()
export class Layout  {

    menuMenuActive: any;
    menuRepoActive: any

    extractTitle = extractTitle;

    @ViewChild('menuSidenav', {read: MdSidenav})
    public menuSidenav : MdSidenav;

    currentRepo: string;

    body = document.getElementsByTagName('body')[0];

    i18n: any;
    config: any;

    repos: any[];
    public repo: any;

    packages: any = {};

    settings: any;

    packageJson: any = {
        version: undefined,
        corifeus: {
            ['time-stamp']: undefined,
            code : '',
            publish: false,
        }
    }

    title: string;
    icon: string;

    moment = moment;

    noScript: any;

    constructor(
        private cdn: CdnService,
        private router: RouterService,
        private route: ActivatedRoute,
        protected notify: NotifyService,
        private http: Http,
        protected locale: LocaleService,
        protected settingsAll: SettingsService
    ) {
        this.settings = settingsAll.data.pages;
        this.currentRepo = this.settings.github.defaultRepo;

        this.locale.subscribe((data: LocaleSubject) => {
            this.i18n = data.locale.data.pages;
        });

        this.noScript = document.getElementById('cory-seo');

        this.route.params.subscribe((params) => {
            this.currentRepo = params.repo
            if (params.repo === undefined) {
                this.currentRepo = this.settings.github.defaultRepo;
            }
            this.load();
            /*
            if (!location.pathname.endsWith('.html')) {
                this.navigate();
            }
            */
        })
    }


    async load() {
        let packageJsonResponse : any;
        [
            this.repos,
            this.repo,
            packageJsonResponse
        ] = await Promise.all([

            this.cdn.repos(),
            this.cdn.repo(this.currentRepo),
            this.cdn.file(this.currentRepo, 'package.json'),
        ]);
        this.packageJson = JSON.parse(packageJsonResponse.text());
        this.title = this.packageJson.description;
        this.icon = this.packageJson.corifeus.icon !== undefined ? `fa ${this.packageJson.corifeus.icon}` : 'fa fa-bolt';
        document.title = this.title;
        this.noScript.innerHTML = '';
        this.repos.forEach((repo : any) => {
            const a = document.createElement('a');
            a.href = `/${repo.name}`;
            a.innerText = repo.description;
            this.noScript.appendChild(a)
        })


        const packages = this.repos.map((repo) => {
            return new Promise(async(resolve, reject) => {
                try {
                    const pkg = await this.cdn.file(repo.name, 'package.json');
                    resolve({
                        pkgResponse: pkg,
                        repo: repo.name,
                    })
                } catch(e) {
                    reject(e);
                }
            })
        })
        const packageResult = await Promise.all(packages);
        packageResult.forEach((packageResultItem: any) => {
            const packageItem = JSON.parse(packageResultItem.pkgResponse.text());
            this.packages[packageResultItem.repo] = packageItem;
        })

    }

    async navigate(path? : string) {
        if (path === undefined) {
            path = `github/${this.currentRepo}/index.html`;
        }
        this.menuMenuActive = '';
        this.router.navigateTop([path]);
    }

    packageMenuClose() {
//        this.body.style.overflowY = 'auto';
        this.menuSidenav.close();
    }


    packageMenuOpen() {
//        this.body.style.overflowY = 'hidden';
        this.menuSidenav.open();
    }

}