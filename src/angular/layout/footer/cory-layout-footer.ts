import {
    Component,
    Injectable,
    Host,
} from '@angular/core';

import {
    DomSanitizer,
    SafeUrl,
} from '@angular/platform-browser';


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
    Npm: string
    Translation: string
    Theme: string
    Developer: string
    JetBrains: string
    NoSQLBooster: string
}


@Component({
    selector: 'cory-layout-footer',
    templateUrl: 'cory-layout-footer.html',
})
@Injectable()
export class Footer {

    npmSvg: SafeUrl  = require('../../../assets/npm-logo.svg');
    jetbrainsSvg: SafeUrl = require('../../../assets/jetbrains-logo.svg');
    nosqlboosterImage: string = "https://cdn.corifeus.com/assets/png/nosqlbooster-128x128.png";
    settings : any;
    i18n : any;

    linkJetBrains: string = "https://www.jetbrains.com"
    linkNoSQLBooster: string = "https://www.nosqlbooster.com"

    decodeEntities: Function = decodeEntities;

    tooltip: Tooltip = new Tooltip()
    tooltipPosition: string = 'left'

    currentWidthAlias: string;

    currentYear = new Date().getFullYear();

    constructor(
        private notify: NotifyService,
        private theme: ThemeService,
        @Host() public parent: Layout,
        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private mediaQuery: MediaQueryService,
        private domSanitizer: DomSanitizer
    ) {
        this.settings = settingsAll.data.pages;

        this.npmSvg = this.domSanitizer.bypassSecurityTrustUrl(require('../../../assets/npm-logo.svg'))
        this.jetbrainsSvg = this.domSanitizer.bypassSecurityTrustUrl(require('../../../assets/jetbrains-logo.svg'))

        this.locale.subscribe((data: LocaleSubject) => {
            this.i18n = data.locale.data;
            this.setTooltip();
        });

        this.mediaQuery.register([
            <MediaQuerySetting>{
                name: 'pages-small',
                min: 0,
                max: 599,
                type: MediaQuerySettingType.Width
            },
            <MediaQuerySetting>{
                name: 'pages-medium',
                min: 600,
                max: 840,
                type: MediaQuerySettingType.Width
            },
            <MediaQuerySetting>{
                name: 'pages-large',
                min: 841,
                max: Infinity,
                type: MediaQuerySettingType.Width
            },
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
            case 'pages-small':
                this.tooltip.GitHub = 'GitHub';
                this.tooltip.Npm = 'NPM';
                this.tooltip.Developer = decodeEntities(this.i18n.pages.title.developer + ' ' + this.currentYear);
                this.tooltip.NoSQLBooster = decodeEntities(this.i18n.pages.title.sponsor.nosqlbooster);
                this.tooltip.JetBrains= decodeEntities(this.i18n.pages.title.sponsor.jetbrains);

                break;

            case 'pages-medium':
                this.tooltip.GitHub = "";
                this.tooltip.Npm = "";
                this.tooltip.Developer = decodeEntities(this.i18n.pages.title.developer + ' ' + this.currentYear);
                this.tooltip.NoSQLBooster = decodeEntities(this.i18n.pages.title.sponsor.nosqlbooster);
                this.tooltip.JetBrains= decodeEntities(this.i18n.pages.title.sponsor.jetbrains);
                break;

            case 'pages-large':
                this.tooltip.GitHub = "";
                this.tooltip.GitHub = "";
                this.tooltip.Npm = "";
                this.tooltip.Developer = "";
                this.tooltip.NoSQLBooster = "";
                this.tooltip.JetBrains = "";
                break;
        }
    }

    public  get linkDeveloper() {
        return `http://patrikx3.com/${this.locale.current}`;
    }

    public  get linkNpm() {
        return `https://www.npmjs.com/package/${this.parent.packageJson.name}`;
    }

    public  get linkGithub() {
        return `https://github.com/patrikx3/${this.parent.currentRepo}`;
    }

}
