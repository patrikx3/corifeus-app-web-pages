import {
    Component,
    Injectable,
    ViewEncapsulation,
    ViewChild,
    NgZone,
    OnInit,
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import {
    MatSidenav
} from '@angular/material'

import {
    RouterService,
} from 'corifeus-web';

import { HttpClient } from '@angular/common/http';

import * as moment from 'moment';

import { CdnService} from '../service';

import {LocaleService, LocaleSubject, SettingsService} from 'corifeus-web';
import {NotifyService} from 'corifeus-web-material';

import { Observable, Subject } from 'rxjs';

import  { extractTitle } from '../utils/extracTitle';

declare global {
    interface Window {
        coryAppWebPagesNavigate: any
    }
}


@Component({
    selector: 'cory-layout',
    templateUrl: 'cory-layout.html',
    encapsulation: ViewEncapsulation.None
})

@Injectable()
export class Layout implements OnInit {

    private subject: Subject<string> = new Subject();

    menuMenuActive: any;
    menuRepoActive: any

    searchText: string;

    extractTitle = extractTitle;

    @ViewChild('menuSidenav', {read: MatSidenav})
    public menuSidenav : MatSidenav;

    currentRepo: string;

    body = document.getElementsByTagName('body')[0];

    i18n: any;
    config: any;

    repos: any[];

    packages: any;

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
        private http: HttpClient,
        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private zone: NgZone,
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

    ngOnInit() {
        this.subject.debounceTime(this.settings.debounce.default).subscribe(searchText => {
            this.handleSearch(searchText);
        });
    }

    handleSearch(searchText: string) {
        this.searchText = searchText.trim();
    }

    get reposSearch() {
        if (this.searchText === '' || this.searchText === undefined) {
            return this.repos;
        }
        const regexes : Array<RegExp> = [];
        this.searchText.split(/[\s,]+/).forEach(search => {
            if (search === '') {
                return;
            }
            regexes.push(
                new RegExp('.*' + search + '.*')
            )
        })
        return this.repos.filter(repo => {
            let found = false;
            for(let regex of regexes) {
                if (regex.test(repo)) {
                    found = true;
                    break;
                }
            }
            return found;
        })
    }

    async load() {
        if (this.packages === undefined) {
            const response : any = await this.http.get(this.settings.p3x.git.url).toPromise()
            this.packages = response.repo;
            this.repos = Object.keys(this.packages);
        }
        if (!this.packages.hasOwnProperty(this.currentRepo)) {
            this.currentRepo = 'corifeus';
        }
        this.packageJson = this.packages[this.currentRepo];
        this.title = this.packageJson.description;
        this.icon = this.packageJson.corifeus.icon !== undefined ? `fa ${this.packageJson.corifeus.icon}` : 'fa fa-bolt';
        document.title = this.title;
        this.noScript.innerHTML = '';
        this.repos.forEach((repo : any) => {
            const a = document.createElement('a');
            a.href = `/${repo}`;
            a.innerText = repo;
            this.noScript.appendChild(a)
        })
        window.coryAppWebPagesNavigate = async (path? : string) => {
            this.zone.run(() => {
                this.navigate(path);
            });
        };
    }

    async navigate(path? : string) {
        if (path === undefined) {
            path = `github/${this.currentRepo}/index.html`;
        }
        this.menuMenuActive = '';
        this.router.navigateTop([path]);
    }

    isOpenWrt() {
        return this.packageJson !== undefined && this.packageJson.corifeus !== undefined && this.packageJson.corifeus.hasOwnProperty('type') && this.packageJson.corifeus.type === 'openwrt';
    }

    packageMenuClose() {
//        this.body.style.overflowY = 'auto';
        this.menuSidenav.close();
    }


    packageMenuOpen() {
//        this.body.style.overflowY = 'hidden';
        this.menuSidenav.open();
    }

    search(searchText: string) {
        this.subject.next(searchText);
    }
}