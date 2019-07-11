import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';

declare var process: any;
if (process.env === 'production') {
    enableProdMode();
}
import './bundle.common';

import {Module} from './module';

platformBrowserDynamic().bootstrapModule(Module);


