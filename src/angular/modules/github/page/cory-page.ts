import {
    Component,
    Host,
    NgZone,
    AfterViewChecked,
    OnDestroy,
} from '@angular/core';

import {
    DomSanitizer
} from '@angular/platform-browser'

import { Subscription } from 'rxjs'

import {
    ActivatedRoute,
    NavigationStart,
    NavigationEnd,
} from '@angular/router';

import {HttpClient} from '@angular/common/http';

import {RouterService} from 'corifeus-web';

import { Layout} from "../layout";

import {CdnService, MarkdownService} from '../service';

import {SettingsService, LocaleService} from 'corifeus-web';


import {State} from 'corifeus-web';
import {
    NotifyService
} from 'corifeus-web-material';

const cache = {}

let testing = false



@Component({
    selector: 'cory-page',
    template: `
        <span *ngIf="content" [innerHTML]="transformHtml(content)"></span>
    `
})
export class Page implements AfterViewChecked, OnDestroy {

    subscriptions$: Array<Subscription> = []

    loaded: boolean = false;

    content: any;

    //parent: any;

    constructor(
        private markdown: MarkdownService,
        private cdn: CdnService,
        private router: RouterService,
        private activatedRoute: ActivatedRoute,
        public http: HttpClient,
        private settings: SettingsService,
        private zone: NgZone,
        protected notify: NotifyService,
        protected locale: LocaleService,
        private _sanitizer: DomSanitizer,
        private parent: Layout,
    ) {
        this.markdown.context = this;

       // this.parent = Globals.layout

        let currentUrlPathTimeout: any;

        let usingActivatedUrl = true;

        this.subscriptions$.push(
            this.router.events.subscribe(event => {
                if (event instanceof NavigationStart) {
                    usingActivatedUrl = false;
                    //const urlPath = event.url.substr(1)

                    clearTimeout(currentUrlPathTimeout);
                    currentUrlPathTimeout = setTimeout(() => {
//                    console.log('router', urlPath, 'usingActivatedUrl', usingActivatedUrl);
                        if (usingActivatedUrl === false) {
                            usingActivatedUrl = true;
//                        console.log('have to navigate', urlPath)
                            this.navigate()
                        }
                    }, 250)
                }
            })
        )

        this.subscriptions$.push(
            this.activatedRoute.url.subscribe((segment) => {
                usingActivatedUrl = true;
                const path = segment.join('/');
//            console.log('update activated route', path)
                this.navigate(path);
            })
        )
    }

    async navigate(path?: string) {
        if (path === undefined || path === '') {
            path = `index.html`;
        }

        try {
            const cacheKey = JSON.stringify({
                repo: this.parent.currentRepo,
                path: path
            })
            if (cache.hasOwnProperty(cacheKey)) {
                this.content = cache[cacheKey]
                return
            }
            State.NotFound = false;
            window.corifeus.core.http.status = 200;

            let text = await this.cdn.file(this.parent.currentRepo, path);

            const pathLower = path.toLowerCase()

            if (pathLower.endsWith('.json')) {
                text = `
\`\`\`json
${text}
\`\`\`
`
            } else if (pathLower.endsWith('.yml')) {
                text = `
\`\`\`yaml
${text}
\`\`\`
`

            } else if (pathLower.endsWith('.conf')) {
                text = `
\`\`\`nginxconf
${text}
\`\`\`
`

            }

            const html = await this.markdown.render(text, this.parent, pathLower);

            cache[cacheKey] = html

            this.content = html


        } catch (e) {
            //this.router.navigateTop(['/github/corifeus/404']);
            State.NotFound = true;
            window.corifeus.core.http.status = 404;
            this.content = `
                <div style="margin-top: 20px; font-size: 6em; opacity: 0.25;">
                    404
                </div>
                <div style="font-size: 3em; opacity: 0.75;">
                <i class="fas fa-thumbs-down"></i> ${this.locale.data.material.http['404']}
                </div>
                <div style="text-overflow: ellipsis; overflow: hidden; opacity: 0.7">
                ${location.toString()}
                </div>
                <br/>
                <div style="opacity: 0.5">${e.message}</div>
`
            console.error(e);

        } finally {


        }
    }

    ngAfterViewChecked() {
//        const e = document.querySelector(`${decodeURI(location.hash)}-parent`);
        const e = document.querySelector(`${location.hash}-parent`);
        if (!this.loaded && e) {
            this.loaded = true;
            e.scrollIntoView({
                block: "center",

            })
        }
        if (!testing) {
            testing = true;
            this.notify.info(this.parent.i18n.title.ready)
        }

    }

    transformHtml(html: string): any {
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }

    ngOnDestroy(): void {
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }
}



