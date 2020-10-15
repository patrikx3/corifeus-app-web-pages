import {NgModule, Injectable} from '@angular/core';
import {RouterModule} from '@angular/router';

import {
    MatSidenavModule,
} from '@angular/material/sidenav';

import {Layout, Header, Footer} from './layout';
import {Status} from './component/cory-web-pages-build-status';
import {Page } from './page';
import {CdnService, MarkdownService} from './service';
import {  githubRoutes } from './github.routes';

import {MatInputModule,} from '@angular/material/input'

import { CommonModule } from '@angular/common'

import {LocaleService, SettingsService} from '../web';
import {CorifeusMaterialModule} from "../material/index";

import { environment } from '../../../environments/environment';

/***
 * NEVER USE A EXPORT * AS, NEED THE EXACT COMPONENT FOR INJECTABLE FUNCTION!!!!
 */
@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        MatSidenavModule,
        CorifeusMaterialModule,
        RouterModule.forChild(githubRoutes),
    ],
    entryComponents: [],
    declarations: [
        Layout,
        Header,
        Footer,
        Page,
//        OpenCollective,
        Status
    ],
    providers: [
        CdnService,
        MarkdownService,
    ],
    bootstrap: [

    ]
})
export class GitHubModule {
    constructor(
        private loc: LocaleService,
        private settings: SettingsService,
    ) {
        const twemoji = require('twemoji').default;
        twemoji.folder = 'svg';
        twemoji.ext = '.svg';

        if (environment.production) {
            twemoji.base = '/assets/twemoji/';
        }

        let settingsExtendJson = require('./json/settings.core.json');
        settings.extend('core', settingsExtendJson);
        settings.afterInit();

        const module = 'pages';

        const settingsJson = require('./json/settings.json');

        settings.register(module, settingsJson);

        loc.register(module, {
            en: require('./json/translation/english.json'),
            hu: require('./json/translation/hungarian.json'),
        })
    }
}
