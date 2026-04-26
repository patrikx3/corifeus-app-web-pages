import {
    Component,
    Input,
    effect,
} from '@angular/core';

import capitalize from 'lodash/capitalize';

import { Router } from '@angular/router';

import { LocaleService, SettingsService } from '../../modules/web';

import { extractTitle } from '../../utils/extrac-title';

import { Layout } from '../cory-layout';

import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
    selector: 'cory-layout-header',
    templateUrl: 'cory-layout-header.html',
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
    ],
})
export class Header {

    @Input() parent: Layout;

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

        effect(() => {
            this.locale.state();
            this.i18n = this.locale.data;
        });

        this.header = capitalize(this.settings.github.repoNames);
    }

    linkExternal(link: string) {
        return link.startsWith('http');
    }

    menuHref(link: string): string {
        return this.linkExternal(link) ? link : '/' + this.parent.currentRepo + '/' + link;
    }

    onMenuItemClick(event: MouseEvent, link: string) {
        this.parent.menuMenuActive = link;
        if (this.linkExternal(link)) return;
        event.preventDefault();
        this.parent.navigate('/' + this.parent.currentRepo + '/' + link);
    }

    navigateMenu(link: string) {
        if (this.linkExternal(link)) return window.open(link);
        this.parent.navigate('/' + this.parent.currentRepo + '/' + link);
    }

    generateIcon() {
        return `<i class="${this.parent.icon}"></i>`;
    }

    extractTitleWithStars(pkg: any) {
        return this.parent.extractTitleWithStars(pkg);
    }
}
