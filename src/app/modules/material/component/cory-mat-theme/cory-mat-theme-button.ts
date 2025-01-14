import {
    Component,
    Input,
    OnDestroy,

} from '@angular/core';

import { Subscription } from 'rxjs'

import {
    ThemeService
} from '../../services/theme';


import {
    LocaleService, SettingsService, LocaleSubject,
    MediaQueryService, MediaQuerySettingType, MediaQuerySetting
} from "../../../web";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf, NgFor } from '@angular/common';
// requires to be in a mat-menu
@Component({
    selector: 'cory-mat-theme-button',
    template: `
        <button [color]="color" #buttonTheme mat-button [matTooltip]="tooltip" (click)="switchTheme()" matTooltipPosition="left">
            <i class="fa-solid fa-moon" *ngIf="this.theme.current !== 'cory-mat-theme-dark-matrix'"></i>
            <i class="fa-regular fa-lightbulb" *ngIf="this.theme.current === 'cory-mat-theme-dark-matrix'"></i>
            <span class="cory-mat-hide-xsmall">
            {{ theme.current === 'cory-mat-theme-dark-matrix' ? i18n.material.title.light : i18n.material.title.dark }}
            </span>
        </button>
`,
    imports: [
        NgIf,
        MatMenuModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        NgIf,
    ]
})
export class ThemeButton implements OnDestroy {

    subscriptions$: Array<Subscription> = []

    @Input('cory-tooltip-position')

    @Input('color')
    color: string = 'default';


    i18n: any;

    settings: any;

    tooltip: string;

    currentWidthAlias: string;

    constructor(
        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        protected theme: ThemeService,
        private mediaQuery: MediaQueryService
    ) {
        this.settings = settingsAll.data.material;

        //console.log('settings', this.settings);

        this.subscriptions$.push(
            this.locale.subscribe((data: LocaleSubject) => {
                this.i18n = data.locale.data;
                this.setTooltip();
            })
        )

        this.subscriptions$.push(
            this.mediaQuery.subscribe((settings: MediaQuerySetting[]) => {
                settings.forEach((setting) => this.setTooltip(setting.name))
            })
        )
    }

    private setTooltip(alias?: string) {
        if (alias !== undefined) {
            this.currentWidthAlias = alias;
        }
        switch (this.currentWidthAlias) {
            case 'small':
                this.tooltip = this.locale.data.material.title.theme;

                break;

            case 'large':
                this.tooltip = undefined;
                break;
        }

    }

    switchTheme() {
        // switch this.theme.all to the next theme
        const index = this.theme.all.indexOf(this.theme.current);
        const nextIndex = index + 1;
        let nextTheme = this.theme.all[nextIndex];
        if (nextTheme === undefined) {
            nextTheme = this.theme.all[0];
        }
        this.theme.setTheme(nextTheme);
    }

    ngOnDestroy(): void {
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }
}
