import { NgModule , Injectable  } from '@angular/core';
import { RouterModule } from '@angular/router';


import { CorifeusMaterialModule, ThemeService } from 'corifeus-web-material';
import { LocaleService, SettingsService } from 'corifeus-web';

import { Application } from './application';
import { Layout, Header, Footer } from './layout';
import { Status} from './component/cory-web-pages-build-status';
import { Page } from './modules';
import { CdnService,  MarkdownService } from './service';


import { routes } from './routes';

/***
 * NEVER USE A EXPORT * AS, NEED THE EXACT COMPONENT FOR INJECTABLE FUNCTION!!!!
 */

@NgModule({
    imports: [
        CorifeusMaterialModule,
        RouterModule.forRoot(routes),
    ],
    entryComponents: [

    ],
    declarations: [
        Application,
        Layout,
        Header,
        Footer,
        Page,

        Status
    ],
    providers: [
        CdnService,
        MarkdownService,
    ],
    bootstrap: [
        Application
    ]
})
export class Module {
    constructor(
        private loc : LocaleService,
        private settings: SettingsService,
        private theme: ThemeService,
    ) {
        let settingsExtendJson= require('../json/settings.core.json');
        settings.extend('core', settingsExtendJson);
        settings.afterInit();

        const module = 'pages';

        const settingsJson = require('../json/settings.json');

        if (location.origin === 'http://localhost:8080') {
            settingsJson.defaultDomain = 'localhost:8080'
        }
        settings.register(module, settingsJson);

        loc.register(module, {
            en: require('../json/translation/english.json'),
            hu: require('../json/translation/hungarian.json'),
        })
    }
}
