import {NgModule, Injectable} from '@angular/core';
import {RouterModule} from '@angular/router';


import {Layout, Header, Footer} from './layout';
import {Status} from './component/cory-web-pages-build-status';
import {Page } from './page';
import {CdnService, MarkdownService} from './service';
import {  appRoutes } from './app.routes';

import { GlobalService } from "./service/global.service";

import {LocaleService, SettingsService} from './modules/web';
import {CorifeusMaterialModule} from "./modules/material/index";

import { environment } from '../environments/environment';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {HttpRequestCounterInterceptor} from "./http-request-counter.interceptor";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import { Application } from "./app.component";
import {BrowserModule} from "@angular/platform-browser";
import { PreloadAllModules } from '@angular/router';

import twemoji from 'twemoji'
/***
 * NEVER USE A EXPORT * AS, NEED THE EXACT COMPONENT FOR INJECTABLE FUNCTION!!!!
 */
@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CorifeusMaterialModule,
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
        }),
    ],
    entryComponents: [],
    declarations: [
        Application,
        Layout,
        Header,
        Footer,
        Page,
//        OpenCollective,
        Status
    ],
    providers: [
        GlobalService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpRequestCounterInterceptor,
            multi: true
        },
        CdnService,
        MarkdownService,
    ],
    bootstrap: [
        Application,
    ]
})
export class AppModule {
    constructor(
        private loc: LocaleService,
        private settings: SettingsService,
    ) {


        let settingsExtendJson = require('./json/settings.core.json');
        settings.extend('core', settingsExtendJson);
        settings.afterInit();

        const module = 'pages';

        const settingsJson = require('./json/settings.json');

        settings.register(module, settingsJson);

        loc.register(module, {
            en: require('./json/translation/english.json'),
           // hu: require('./json/translation/hungarian.json'),
        })
    }
}
