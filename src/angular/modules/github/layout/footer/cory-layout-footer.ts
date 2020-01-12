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

import {NotifyService, ThemeService} from 'corifeus-web-material';



import {Layout} from "../cory-layout";

class Tooltip {
    GitHub: string = '';
    Npm: string = '';
    Translation: string = '';
    Theme: string = '';
    Developer: string = '';
    JetBrains: string = '';
}

@Component({
    selector: 'cory-layout-footer',
    templateUrl: 'cory-layout-footer.html',
})
@Injectable()
export class Footer {

    npmSvg: SafeUrl;
    jetbrainsSvg: SafeUrl;
    settings: any;
    i18n: any;

    linkJetBrains: string = "https://www.jetbrains.com/?from=patrikx3"

    decodeEntities: Function = decodeEntities;

    tooltip: Tooltip = new Tooltip()
    tooltipPosition: string = 'left'

    currentWidthAlias: string;

    currentYear = new Date().getFullYear();

    constructor(
        private notify: NotifyService,
        private theme: ThemeService,

        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private mediaQuery: MediaQueryService,
        private domSanitizer: DomSanitizer,
        public parent: Layout,
    ) {
        this.settings = settingsAll.data.pages;

        const npmSvg = require('../../../../../assets/npm-logo.svg')
        const jetbrainsSvg  = require('../../../../../assets/jetbrains-logo.svg')


        this.npmSvg = this.domSanitizer.bypassSecurityTrustUrl(npmSvg.default)
        this.jetbrainsSvg = this.domSanitizer.bypassSecurityTrustUrl(jetbrainsSvg.default)

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

        this.mediaQuery.subscribe((settings: MediaQuerySetting[]) => {
            settings.forEach((setting) => this.setTooltip(setting.name))
        })

    }

    private setTooltip(alias?: string) {
        if (alias !== undefined) {
            this.currentWidthAlias = alias;
        }
        switch (this.currentWidthAlias) {
            case 'pages-small':
                this.tooltip.GitHub = 'GitHub';
                this.tooltip.Npm = 'NPM';
                this.tooltip.Developer = decodeEntities(this.i18n.pages.title.developer + ' ' + this.currentYear);
                this.tooltip.JetBrains = decodeEntities(this.i18n.pages.title.sponsor.jetbrains);

                break;

            case 'pages-medium':
                this.tooltip.GitHub = "";
                this.tooltip.Npm = "";
                this.tooltip.Developer = decodeEntities(this.i18n.pages.title.developer + ' ' + this.currentYear);
                this.tooltip.JetBrains = decodeEntities(this.i18n.pages.title.sponsor.jetbrains);
                break;

            case 'pages-large':
            default:
                this.tooltip.GitHub = "";
                this.tooltip.Npm = "";
                this.tooltip.Developer = "";
                this.tooltip.JetBrains = "";
                break;
        }
    }

    public get linkDeveloper() {
        return `http://patrikx3.com/${this.locale.current}`;
    }

    public get linkNpm() {
        return `https://www.npmjs.com/package/${this.parent.packageJson.name}`;
    }

    public get linkGithub() {
        return `https://github.com/patrikx3/${this.parent.currentRepo}`;
    }

}
