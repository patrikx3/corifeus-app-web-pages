import {
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {LocaleService, SettingsService} from './modules/web';

@Component({
    selector: 'cory-web-pages-app',
    template: `
    <router-outlet></router-outlet>
  `,
    imports: [RouterOutlet]
})
export class Application {


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
