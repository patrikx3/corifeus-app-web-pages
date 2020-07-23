import {NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';

import {CorifeusMaterialModule } from './modules/material/module';

import {Application} from './application';

import {  moduleRoutes } from './module.routes';
//import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


/***
 * NEVER USE A EXPORT * AS, NEED THE EXACT COMPONENT FOR INJECTABLE FUNCTION!!!!
 */

@NgModule({
    imports: [
        //NoopAnimationsModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(moduleRoutes),
        CorifeusMaterialModule,
    ],
    entryComponents: [],
    declarations: [
        Application,
    ],
    providers: [

    ],
    bootstrap: [
        Application
    ]
})
export class Module {

}
