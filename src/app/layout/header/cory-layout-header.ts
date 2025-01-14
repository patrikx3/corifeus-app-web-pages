import {
    Component,
    Host,
    OnDestroy,
    Input,
} from '@angular/core';

import capitalize from 'lodash/capitalize';

import {
    Router,
} from '@angular/router';

import {LocaleService, SettingsService, LocaleSubject} from "../../modules/web";

import {extractTitle} from '../../utils/extrac-title';

import {Layout} from "../cory-layout";

import { Subscription } from 'rxjs'
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'cory-layout-header',
    templateUrl: 'cory-layout-header.html',
    imports: [
        NgIf,
        MatToolbarModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        NgFor,
    ]
})
export class Header implements OnDestroy {

    @Input() parent: Layout

    subscriptions$: Array<Subscription> = []

    header: string;

    i18n: any;
    settings: any;

    extractTitle = extractTitle;

    constructor(

        private router: Router,
        protected locale: LocaleService,
        protected settingsAll: SettingsService,

    ) {
        this.settings = settingsAll.data.pages;

        this.subscriptions$.push(
            this.locale.subscribe((data: LocaleSubject) => {
                this.i18n = data.locale.data;
            })
        )

        this.header = capitalize(this.settings.github.repoNames);
    }


    linkExternal(link: string) {
        return link.startsWith('http');
    }

    navigateMenu(link: string) {
        if (this.linkExternal(link)) {
            return window.open(link);
        }
        this.parent.navigate('/' + this.parent.currentRepo + '/' + link);
    }

    generateIcon() {
        return `<i class="${this.parent.icon}"></i>`;
    }

    extractTitleWithStars(pkg: any) {
        return this.parent.extractTitleWithStars(pkg);
    }

    ngOnDestroy(): void {
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }
}
