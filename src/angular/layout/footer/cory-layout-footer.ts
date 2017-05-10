import {
    Component,
    Injectable,
    Host,
} from '@angular/core';


import {
    LocaleService, SettingsService, LocaleSubject, decodeEntities,
    MediaQueryService, MediaQuerySettingType, MediaQuerySetting
} from "corifeus-web";

import { NotifyService, ThemeService } from 'corifeus-web-material';

import {
    Layout
} from '../cory-layout';

class Tooltip {
    GitHub: string
    Translation: string
    Theme: string
    Developer: string
    Sponsored: string
}

@Component({
    selector: 'cory-layout-footer',
    templateUrl: 'cory-layout-footer.html',
})
@Injectable()
export class Footer {

    settings : any;
    i18n : any;

    decodeEntities: Function = decodeEntities;

    tooltip: Tooltip = new Tooltip()
    tooltipPosition: string = 'above'

    currentWidthAlias: string;

    constructor(
        private notify: NotifyService,
        private theme: ThemeService,
        @Host() public parent: Layout,
        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private mediaQuery: MediaQueryService
    ) {
        this.settings = settingsAll.data.pages;

        this.locale.subscribe((data: LocaleSubject) => {
            this.i18n = data.locale.data;
            this.setTooltip();
        });

        this.mediaQuery.register([
            <MediaQuerySetting>{
                name: 'small',
                min: 0,
                max: 710,
                type: MediaQuerySettingType.Width
            },
            <MediaQuerySetting>{
                name: 'large',
                min: 711,
                max: Infinity,
                type: MediaQuerySettingType.Width
            }
        ])

        this.mediaQuery.subscribe((settings : MediaQuerySetting[]) => {
            settings.forEach((setting) => this.setTooltip(setting.name))
        })

    }

    private setTooltip(alias?: string) {
        if (alias !== undefined) {
            this.currentWidthAlias= alias;
        }
        switch (this.currentWidthAlias) {
            case 'small':
                this.tooltip.GitHub = 'GitHub';
                this.tooltip.Developer = decodeEntities(this.i18n.pages.title.developer);
                this.tooltip.Sponsored = this.i18n.pages.title.sponsored;

                break;

            default:
                this.tooltip.GitHub = undefined;
                this.tooltip.Developer = undefined;
                this.tooltip.Sponsored = undefined;
                break;
        }
    }

    public  get linkDeveloper() {
        return `http://patrikx3.tk/${this.locale.current}`;
    }

    public  get linkGithub() {
        return `https://github.com/patrikx3/${this.parent.currentRepo}`;
    }



}
