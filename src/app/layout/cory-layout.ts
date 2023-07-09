import {
    Component,
    Injectable,
    ViewEncapsulation,
    ViewChild,
    NgZone,
    OnInit,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';

import { ActivatedRoute, RouterOutlet } from '@angular/router';

import debounce from 'lodash/debounce'

import { Subscription } from 'rxjs'

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'

import {
    RouterService,
} from '../modules/web';

import {HttpClient} from '@angular/common/http';

const emojiRegex = require('emoji-regex');

import {LocaleService, LocaleSubject, SettingsService} from '../modules/web';
import {NotifyService} from '../modules/material';

import {extractStars, extractTitle} from '../utils/extrac-title';
import {extractTitleWithStars} from '../utils/extrac-title';
import {isMobile} from '../utils/is-mobile';
//import {clearTimeout} from "timers";

/*
import {
    DomSanitizer,
} from '@angular/platform-browser';
 */

import twemoji from 'twemoji'
import {environment} from "../../environments/environment";
import { MatButtonModule } from '@angular/material/button';
import { Footer } from './footer/cory-layout-footer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Status } from '../component/cory-web-pages-build-status';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { Header } from './header/cory-layout-header';
import { Loading } from '../modules/material/component/cory-mat-loading';

//FIXME corifeus - matrix
const regexFixCorifeusMatrix = /^(\/)?(corifeus)([^-])(\/)?(.*)/

declare global {
    interface Window {
        coryAppWebPagesNavigate: any,
        coryAppWebPagesNavigateHash: any,
    }
}


@Component({
    selector: 'cory-layout',
    templateUrl: 'cory-layout.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [Loading, Header, MatSidenavModule, MatMenuModule, MatFormFieldModule, MatInputModule, NgIf, MatIconModule, NgFor, MatCardModule, Status, MatTooltipModule, RouterOutlet, Footer, MatButtonModule]
})

@Injectable()
export class Layout implements OnInit, OnDestroy {

    subscriptions$: Array<Subscription> = []

    private debounceSearchText: Function;

    menuMenuActive: any;
    menuRepoActive: any

    searchText: string;

    extractTitle = extractTitle;

    sideNavOpened = false

    @ViewChild('menuSidenav', {read: MatSidenav, static: true})
    public menuSidenav: MatSidenav;

    @ViewChild('searchText', {read: ElementRef, static: true})
    public searchTextInputRefRead: ElementRef;

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
            code: '',
            publish: false,
        }
    }

    title: string;
    icon: string;



    noScript: any;

    public isMobile: boolean = false;

    constructor(
        private router: RouterService,
        private route: ActivatedRoute,
        protected notify: NotifyService,
        private http: HttpClient,
        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private zone: NgZone,
//        private sanitizer: DomSanitizer,
        private ref: ChangeDetectorRef
    ) {

        this.isMobile = isMobile();
        this.settings = settingsAll.data.pages;
        this.currentRepo = this.settings.github.defaultRepo;

        this.subscriptions$.push(
            this.locale.subscribe((data: LocaleSubject) => {
                this.i18n = data.locale.data.pages;
            })
        )


        this.noScript = document.getElementById('cory-seo');

        this.subscriptions$.push(
            this.route.params.subscribe((params) => {
                let repo = params.repo
                if (repo === 'corifeus' && repo === location.pathname.slice(1)) {
                    return this.navigate('matrix')
                }
                this.currentRepo = repo
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
        )
    }

    ngOnInit() {
        this.debounceSearchText = debounce(this.handleSearch, this.settings.debounce.default)


        this.menuSidenav.openedChange.subscribe(value => {
            this.sideNavOpened = value
            this.openedChange = value
        })

        this.menuSidenav.closedStart.subscribe(value => {
            this.sideNavOpened = false
        })
    }


    openedChange = false
    packageMenuOpen() {
//        this.body.style.overflowY = 'hidden';
//        console.log('this.menuSidenav.opened', this.menuSidenav.opened, 'this.openedChange', this.openedChange)
        if (this.menuSidenav.opened || this.openedChange) {
            return
        }
        this.menuSidenav.open();
        setTimeout(() => {
            if (this.isMobile) {
                this.searchTextInputRefRead.nativeElement.blur()
            }

//            /**
            const e = document.querySelector('.cory-mat-menu-item-active')
            if (e) {
//                e.scrollIntoView(true);
//                const viewportH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
//                window.scrollBy(0, (e.getBoundingClientRect().height-viewportH)/2);
                e.scrollIntoView({
                    block: "center",
                });
            }
//             **/

        }, 500)
    }

    handleSearch(searchText: string) {
        this.searchText = searchText.trim();
    }

    reposSearchInstance : Array<any> = undefined

    get reposSearch(): Array<any> {
        if (this.searchText === '' || this.searchText === undefined) {
            return this.repos;
        }
        if (this.reposSearchInstance === undefined) {
            const regexes: Array<RegExp> = [];
            this.searchText.split(/[\s,]+/).forEach(search => {
                if (search === '') {
                    return;
                }
                regexes.push(
                    new RegExp('.*' + search + '.*', 'i')
                )
            })
            this.reposSearchInstance = Object.values(this.packages).filter( (pkg: any) => {
                let found = false;
                for (let regex of regexes) {
                    if (regex.test(pkg.name) || regex.test(pkg.corifeus.reponame) || regex.test(pkg.corifeus.code)) {
                        found = true;
                        break;
                    }
                }
                return found;
            }).map((pkg : any) => pkg.corifeus.reponame)
        }
        return this.reposSearchInstance
    }

    async load() {
        if (this.packages === undefined) {
            const response: any = await this.http.get(this.settings.p3x.git.url).toPromise()
            this.packages = response.repo;

            let sortedObject = {}
            sortedObject = Object.keys(this.packages).sort((a, b) => {
                return this.packages[b].corifeus.stargazers_count - this.packages[a].corifeus.stargazers_count
            }).reduce((prev, curr, i) => {
                prev[i] = this.packages[curr]
                return prev
            }, {})
            this.packages = {};
            Object.keys(sortedObject).forEach(key => {
                const item = sortedObject[key]
                if (item.corifeus.prefix !== undefined) {
                    this.packages[item.name.substr(item.corifeus.prefix.length)] = item;
                } else {
                    this.packages[item.name] = item;
                }
            })
            this.ref.markForCheck()
            this.repos = Object.keys(this.packages);
        }
        if (!this.packages.hasOwnProperty(this.currentRepo)) {
            this.currentRepo = 'corifeus';
        }
        this.packageJson = this.packages[this.currentRepo];
        this.title = this.packageJson.description;
        this.icon = this.packageJson.corifeus.icon !== undefined ? `${this.packageJson.corifeus.icon}` : 'fas fa-bolt';
        document.title = this.title.replace(emojiRegex.default(), '');

        this.noScript.innerHTML = '';
        this.repos.forEach((repo: any) => {
            const a = document.createElement('a');
            a.href = `/${repo === 'corifeus' ? 'matrix' : repo}`;
            a.innerText = repo;
            this.noScript.appendChild(a)
            const a2 = document.createElement('a');
            a2.href = `https://github.com/patrikx3/${repo}`;
            a2.innerText = 'Github ' + repo;
            this.noScript.appendChild(a2)
        })
        window.coryAppWebPagesNavigate = (path?: string) => {
            this.zone.run(() => {
                if (path.includes('#')) {
                    const hashIndex = path.indexOf('#')
                    const pathMainPath = path.substring(0, hashIndex)
                    const hash = path.substring(hashIndex + 1)
                    this.navigate(pathMainPath);
                    window.coryAppWebPagesNavigateHash(hash)
                } else {
                    this.navigate(path);
                }
            });
        };

        window.coryAppWebPagesNavigateHash = (id: any) => {

            const scroll = (id: string) => {
                const el = document.getElementById(id);

                if (el === null) {
                    return;
                }
                el.scrollIntoView({
                    block: "center",
                })
            }

            if (typeof id === 'string') {
                const hash = `#${id.replace(/-parent$/, '')}`;
                if (history.pushState) {
                    history.pushState(null, null, `${location.pathname}${hash}`);
                } else {
                    location.hash = hash;
                }

                scroll(id);
            } else {
                id = `${id.id}`;
                setTimeout(() => {
                    scroll(id)
                }, 500)
            }

            return false;
        }

        document.getElementById('cory-mat-pages-title').innerHTML = this.renderTwemoji(this.packageJson.description)
    }

    async navigate(path?: string) {
        if (path === undefined) {
            path = `${this.currentRepo}/index.html`;
        }
        //FIXME corifeus - matrix
        //console.log(' ')
        //console.log(path)
        if (regexFixCorifeusMatrix.test(path)) {
            path = path.replace(regexFixCorifeusMatrix, 'matrix$3$5')
            //console.log(1, RegExp.$1, 2, RegExp.$2, 3, RegExp.$3, 4, RegExp.$4, 5, RegExp.$5, 6, RegExp.$6, 7, RegExp.$7)
            //console.log('match', path)
        }
        this.menuMenuActive = '';
//console.log('cory-layout', path);
        this.router.navigateTop([path]);
    }

    isOpenWrt() {
        return this.packageJson !== undefined && this.packageJson.corifeus !== undefined && this.packageJson.corifeus.hasOwnProperty('type') && this.packageJson.corifeus.type === 'openwrt';
    }

    packageMenuClose() {
//        this.body.style.overflowY = 'auto';
        this.menuSidenav.close();
    }



    search(searchText: string) {
        this.reposSearchInstance = undefined
        this.debounceSearchText(searchText);
    }

    renderTwemoji(text: string) {
        let options

        if (environment.production) {
            options = {
                folder: 'svg',
                ext: '.svg',
                base: '/assets/twemoji/',
            }
        } else {
            options = {
                folder: 'svg',
                ext: '.svg',
            }

        }

        return !text ? text : twemoji.parse(text, options)
    }

    keyDownFunction(event: any) {
        const repos = this.reposSearch;
        if (event.keyCode == 13 && repos.length === 1) {
            this.zone.run(() => {
                const navigate = `/${repos[0]}/index.html`
                this.debounceSearchText('');
                this.searchTextInputRefRead.nativeElement.blur()
                this.searchTextInputRefRead.nativeElement.value = '';
                this.packageMenuClose();
                this.navigate(navigate);
            });
        }
    }

    get showTitle() {
        const pathname = location.pathname.toLowerCase()
        const pieces = pathname.split('/')
//        console.log(pieces)
        const showTitle = pieces.length === 2 || (pieces.length === 3 && pieces[2] === 'index.html')
//        const showTitle = pathname.endsWith('index.html') || (!pathname.includes('.') && !pathname.includes('open-collective'));
        //console.log('showTitle', pathname, showTitle)
        return showTitle;
    }

    extractTitleWithStars(pkg: any) {
        const title = extractTitleWithStars(pkg);
        return title;
    }

    extractStars(stars: number) {
        return extractStars(stars)
    }

    ngOnDestroy(): void {
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }
}

