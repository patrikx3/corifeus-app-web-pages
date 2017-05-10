import { platformBrowser }    from '@angular/platform-browser';

// must be the first, or 2nd
import { enableProdMode } from '@angular/core';
enableProdMode();

import './bundle.common';

import {ModuleNgFactory} from '../../build/aot/src/angular/module.ngfactory';

platformBrowser().bootstrapModuleFactory(ModuleNgFactory);



