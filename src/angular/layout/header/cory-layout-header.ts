import {
    Component,
    Host
} from '@angular/core';

const hasIn = require('lodash/hasIn');
const capitalize = require('lodash/capitalize');

import {
    Router,
} from '@angular/router';

import {
    Layout
} from '../cory-layout';

import { LocaleService, SettingsService, LocaleSubject } from "corifeus-web";

import  { extractTitle } from '../../utils/extracTitle';

@Component({
    selector: 'cory-layout-header',
    templateUrl: 'cory-layout-header.html',

})
export class Header {

    header : string;

    i18n : any;
    settings: any;

    extractTitle = extractTitle;

    constructor(
        @Host() public parent: Layout,
        private router: Router,
        protected locale: LocaleService,
        protected settingsAll: SettingsService
    ) {
        this.settings = settingsAll.data.pages;

        this.locale.subscribe((data : LocaleSubject) => {
            this.i18n = data.locale.data;
        });

        this.header =  capitalize(this.settings.github.repoNames );
    }


    linkExternal(link : string) {
        return link.startsWith('http');
    }

    navigateMenu(link : string) {
        if (this.linkExternal(link)) {
            return window.open(link);
        }
        this.parent.navigate('github/' + this.parent.currentRepo + '/' + link );
    }

}