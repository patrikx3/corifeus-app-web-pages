import {
    Component,
    ViewEncapsulation,
    ViewChild,
    NgZone,
    OnInit,
    ElementRef,
    ChangeDetectorRef,
    AfterViewInit,
    Renderer2,
    Inject,
    PLATFORM_ID,
    effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

declare global {
    interface Window {
      adsbygoogle: any[];
    }
  }

import { ActivatedRoute, RouterOutlet } from '@angular/router';

import debounce from 'lodash/debounce'

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'

import {
    RouterService,
} from '../modules/web';

import * as emojiRegex from 'emoji-regex'

import {LocaleService, SettingsService} from '../modules/web';
import {NotifyService} from '../modules/material';

import {extractStars, extractTitle} from '../utils/extrac-title';
import {extractTitleWithStars} from '../utils/extrac-title';
import {isMobile} from '../utils/is-mobile';

import twemoji from 'twemoji'
import {environment} from "../../environments/environment";
import { MatButtonModule } from '@angular/material/button';
import { Footer } from './footer/cory-layout-footer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Status } from '../component/cory-web-pages-build-status';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
    imports: [Loading, Header, MatSidenavModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, Status, MatTooltipModule, RouterOutlet, Footer, MatButtonModule]
})
export class Layout implements OnInit, AfterViewInit {

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

    body: HTMLElement;

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
    pageTitleHtml: SafeHtml = '';



    public isMobile: boolean = false;

    constructor(
        private router: RouterService,
        private route: ActivatedRoute,
        protected notify: NotifyService,
        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private zone: NgZone,
        private ref: ChangeDetectorRef,
        private titleService: Title,
        private metaService: Meta,
        private renderer: Renderer2,
        private sanitizer: DomSanitizer,
        @Inject(DOCUMENT) private document: Document,
        @Inject(PLATFORM_ID) private platformId: Object,
    ) {

        this.body = this.document.getElementsByTagName('body')[0];
        this.isMobile = isPlatformBrowser(this.platformId) ? isMobile() : false;
        this.settings = settingsAll.data.pages;
        this.currentRepo = this.settings.github.defaultRepo;

        effect(() => {
            this.locale.state();
            this.i18n = this.locale.data?.pages;
        });

        const paramsSig = toSignal(this.route.params, { initialValue: {} as any });
        effect(() => {
            const params = paramsSig();
            const repo = params['repo'];
            const pathname = isPlatformBrowser(this.platformId)
                ? location.pathname
                : (this.document.location?.pathname || '/');
            if (repo === 'corifeus' && repo === pathname.slice(1)) {
                this.navigate('matrix');
                return;
            }
            this.currentRepo = repo;
            if (repo === undefined) {
                this.currentRepo = this.settings.github.defaultRepo;
            }
            this.load();
        });
    }

    ngOnInit() {
        this.debounceSearchText = debounce(this.handleSearch, this.settings.debounce.default);
    }

    onSidenavOpenedChange(value: boolean) {
        this.sideNavOpened = value;
        this.openedChange = value;
    }

    onSidenavClosedStart() {
        this.sideNavOpened = false;
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
            const e = this.document.querySelector('.cory-mat-menu-item-active')
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
        this.reposSearchCache = undefined;
        this.reposSearchCacheKey = undefined;
    }

    private reposSearchCache: Array<any> = undefined;
    private reposSearchCacheKey: string = undefined;

    get reposSearch(): Array<any> {
        if (this.searchText === '' || this.searchText === undefined) {
            return this.repos;
        }
        if (this.reposSearchCacheKey === this.searchText && this.reposSearchCache !== undefined) {
            return this.reposSearchCache;
        }
        const regexes: Array<RegExp> = [];
        this.searchText.split(/[\s,]+/).forEach(search => {
            if (search === '') {
                return;
            }
            regexes.push(
                new RegExp('.*' + search + '.*', 'i')
            )
        })
        this.reposSearchCache = Object.values(this.packages).filter((pkg: any) => {
            for (let regex of regexes) {
                if (regex.test(pkg.name) || regex.test(pkg.corifeus.reponame) || regex.test(pkg.corifeus.code)) {
                    return true;
                }
            }
            return false;
        }).map((pkg: any) => pkg.corifeus.reponame);
        this.reposSearchCacheKey = this.searchText;
        return this.reposSearchCache;
    }

    async load() {
        if (this.packages === undefined) {
            const httpResponse = await fetch(this.settings.p3x.git.url);
            const response: any = await httpResponse.json();
            this.packages = response.repo;

            let sortedObject = {}
            sortedObject = Object.keys(this.packages).sort((a, b) => {
                return (this.packages[b].corifeus.stargazers_count || 0) - (this.packages[a].corifeus.stargazers_count || 0)
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

        const plainTitle = this.title.replace(emojiRegex.default(), '');
        this.titleService.setTitle(plainTitle);

        const canonicalRepo = this.currentRepo === 'corifeus' ? 'matrix' : this.currentRepo;
        const canonicalUrl = `https://corifeus.com/${canonicalRepo}`;
        const description = `${plainTitle} - Open source documentation and packages by Corifeus`;

        // Update SEO meta tags dynamically
        this.metaService.updateTag({ name: 'description', content: description });
        this.metaService.updateTag({ property: 'og:title', content: plainTitle });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
        this.metaService.updateTag({ property: 'og:type', content: 'article' });
        this.metaService.updateTag({ name: 'twitter:title', content: plainTitle });
        this.metaService.updateTag({ name: 'twitter:description', content: description });
        this.metaService.updateTag({ name: 'twitter:url', content: canonicalUrl });

        // Update canonical link tag dynamically
        this.updateCanonicalUrl(canonicalUrl);

        // Update JSON-LD structured data
        this.updateJsonLd(canonicalUrl, plainTitle, description);

        const noScriptEl = this.document.getElementById('cory-seo');
        if (noScriptEl) {
            noScriptEl.innerHTML = '';
            this.repos.forEach((repo: any) => {
                const a = this.renderer.createElement('a');
                this.renderer.setAttribute(a, 'href', `/${repo === 'corifeus' ? 'matrix' : repo}`);
                a.innerText = repo;
                this.renderer.appendChild(noScriptEl, a);
                const a2 = this.renderer.createElement('a');
                this.renderer.setAttribute(a2, 'href', `https://github.com/patrikx3/${repo}`);
                a2.innerText = 'Github ' + repo;
                this.renderer.appendChild(noScriptEl, a2);
            })
        }
        if (isPlatformBrowser(this.platformId)) {
            window.coryAppWebPagesNavigate = (path?: string) => {
                this.zone.run(() => {
                    if (path && path.includes('#')) {
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
                    const el = this.document.getElementById(id);

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
                        history.pushState(null, '', `${location.pathname}${hash}`);
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
        }

        this.pageTitleHtml = this.sanitizer.bypassSecurityTrustHtml(
            this.renderTwemoji(this.packageJson.description),
        );
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
                base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/'
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
        const rawPath = typeof location !== 'undefined'
            ? location.pathname
            : (this.document.location?.pathname || '/' + (this.currentRepo || ''));
        const pathname = rawPath.toLowerCase()
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

    private updateCanonicalUrl(canonicalUrl: string) {
        let linkEl = this.document.getElementById('cory-canonical') as HTMLLinkElement | null;
        if (!linkEl) {
            linkEl = this.renderer.createElement('link') as HTMLLinkElement;
            this.renderer.setAttribute(linkEl, 'id', 'cory-canonical');
            this.renderer.setAttribute(linkEl, 'rel', 'canonical');
            this.renderer.appendChild(this.document.head, linkEl);

            const legacy = this.document.querySelector('link[rel="canonical"]:not(#cory-canonical)');
            if (legacy && legacy.parentNode) {
                legacy.parentNode.removeChild(legacy);
            }
        }
        this.renderer.setAttribute(linkEl, 'href', canonicalUrl);
    }

    private updateJsonLd(canonicalUrl: string, plainTitle: string, description: string) {
        let scriptEl = this.document.getElementById('cory-jsonld');
        if (!scriptEl) {
            scriptEl = this.renderer.createElement('script');
            this.renderer.setAttribute(scriptEl, 'id', 'cory-jsonld');
            this.renderer.setAttribute(scriptEl, 'type', 'application/ld+json');
            this.renderer.appendChild(this.document.head, scriptEl);
        }

        const pkg = this.packageJson || {};
        const corifeusMeta = pkg.corifeus || {};
        const version: string | undefined = pkg.version;
        const timeStamp: string | undefined = corifeusMeta['time-stamp'];
        const stargazers: number | undefined = corifeusMeta.stargazers_count;
        const code: string | undefined = corifeusMeta.code;
        const angularVersion: string | undefined = corifeusMeta.angular;
        const nodeVersion: string | undefined = corifeusMeta.nodejs;

        const breadcrumbs = {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Corifeus', item: 'https://corifeus.com/matrix' },
                { '@type': 'ListItem', position: 2, name: plainTitle, item: canonicalUrl },
            ],
        };

        const softwareSourceCode: any = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: plainTitle,
            alternateName: pkg.name,
            description,
            url: canonicalUrl,
            codeRepository: `https://github.com/patrikx3/${this.currentRepo}`,
            programmingLanguage: 'TypeScript',
            inLanguage: 'en',
            license: 'https://opensource.org/licenses/MIT',
            author: {
                '@type': 'Person',
                name: 'Patrik Laszlo',
                url: 'https://patrikx3.com',
                sameAs: [
                    'https://github.com/patrikx3',
                    'https://www.npmjs.com/~patrikx3',
                ],
            },
            publisher: {
                '@type': 'Organization',
                name: 'Corifeus',
                url: 'https://corifeus.com',
            },
            image: 'https://corifeus.com/assets/favicon.ico',
            keywords: [
                'corifeus', 'patrikx3', 'open source', pkg.name, code,
                'angular', 'nodejs', 'typescript',
            ].filter(Boolean).join(', '),
        };
        if (version) {
            softwareSourceCode.softwareVersion = version;
        }
        if (timeStamp) {
            softwareSourceCode.dateModified = timeStamp;
            softwareSourceCode.datePublished = timeStamp;
        }
        if (angularVersion || nodeVersion) {
            const runtime: string[] = [];
            if (angularVersion) runtime.push(`Angular ${angularVersion}`);
            if (nodeVersion) runtime.push(`Node ${nodeVersion}`);
            softwareSourceCode.runtimePlatform = runtime.join(', ');
        }
        if (typeof stargazers === 'number' && stargazers > 0) {
            softwareSourceCode.interactionStatistic = {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: stargazers,
            };
        }

        const graph = {
            '@context': 'https://schema.org',
            '@graph': [softwareSourceCode, breadcrumbs],
        };
        if (scriptEl) {
            scriptEl.textContent = JSON.stringify(graph);
        }
    }

    ngAfterViewInit() {
        /*
        setTimeout(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.error('AdSense error:', e);
          }
        }, 100); // Add a small delay to ensure DOM is rendered
        */
      }
}

