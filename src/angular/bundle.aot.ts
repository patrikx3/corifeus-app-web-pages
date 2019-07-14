import {enableProdMode} from '@angular/core';
enableProdMode();

import {platformBrowser} from '@angular/platform-browser';

import './bundle.common';

/*
import {ModuleNgFactory} from './module.ngfactory';
platformBrowser().bootstrapModuleFactory(ModuleNgFactory);
 */

import {Module} from './module';
platformBrowser().bootstrapModule(Module)



