import { platformBrowser }    from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
enableProdMode();

import './bundle.common';

/*
import {Module} from './module';
platformBrowser().bootstrapModule(Module)
 */

import {ModuleNgFactory} from './module.ngfactory';
platformBrowser().bootstrapModuleFactory(ModuleNgFactory);



