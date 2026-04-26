import {
    Component,
    Input,
    effect,
} from '@angular/core';

import { ThemeService } from '../../services/theme';

import {
    LocaleService, SettingsService,
    MediaQueryService,
} from '../../../web';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'cory-mat-theme-button',
    template: `
        <button [color]="color" #buttonTheme mat-button [matTooltip]="tooltip" (click)="switchTheme()" matTooltipPosition="left">
          @if (theme.selected === 'auto') {
            <i class="fa-solid fa-circle-half-stroke"></i>
          } @else if (theme.selected === 'cory-mat-theme-light-forest') {
            <i class="fa-solid fa-sun"></i>
          } @else {
            <i class="fa-solid fa-moon"></i>
          }
          <span class="cory-mat-hide-xsmall">
            @if (theme.selected === 'auto') {
              {{ i18n.material.title.auto }}
            } @else if (theme.selected === 'cory-mat-theme-light-forest') {
              {{ i18n.material.title.light }}
            } @else {
              {{ i18n.material.title.dark }}
            }
          </span>
        </button>
    `,
    imports: [
        MatMenuModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
    ],
})
export class ThemeButton {

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
        private mediaQuery: MediaQueryService,
    ) {
        this.settings = settingsAll.data.material;

        effect(() => {
            this.locale.state();
            this.i18n = this.locale.data;
            this.setTooltip();
        });

        effect(() => {
            const settings = this.mediaQuery.state();
            settings.forEach((setting) => this.setTooltip(setting.name));
        });
    }

    private setTooltip(alias?: string) {
        if (alias !== undefined) this.currentWidthAlias = alias;
        switch (this.currentWidthAlias) {
            case 'small':
                this.tooltip = this.locale.data?.material?.title?.theme;
                break;
            case 'large':
                this.tooltip = undefined;
                break;
        }
    }

    switchTheme() {
        const index = this.theme.all.indexOf(this.theme.selected);
        const nextIndex = index + 1;
        let nextTheme = this.theme.all[nextIndex];
        if (nextTheme === undefined) {
            nextTheme = this.theme.all[0];
        }
        this.theme.setTheme(nextTheme);
    }
}
