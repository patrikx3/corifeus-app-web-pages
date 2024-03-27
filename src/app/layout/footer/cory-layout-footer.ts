import {
    Component,
    Injectable,
    Host,
    OnDestroy,
    Input,
} from '@angular/core';

import {
    DomSanitizer,
    SafeUrl,
} from '@angular/platform-browser';

import { Subscription } from 'rxjs'

import {
    LocaleService, SettingsService, LocaleSubject, decodeEntities,
    MediaQueryService, MediaQuerySettingType, MediaQuerySetting
} from "../../modules/web";

import {NotifyService, ThemeService} from '../../modules/material';

import {Layout} from "../cory-layout";
import { MatIconModule } from '@angular/material/icon';
import { ThemeButton } from '../../modules/material/component/cory-mat-theme/cory-mat-theme-button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf } from '@angular/common';

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
    standalone: true,
    imports: [
        NgIf,
        MatToolbarModule,
        MatButtonModule,
        MatTooltipModule,
        ThemeButton,
        MatIconModule,
    ],
})
@Injectable()
export class Footer implements OnDestroy {

    @Input() parent: Layout

    subscriptions$: Array<Subscription> = []

    unsubscribeMediaQuery : Function

    npmSvg: SafeUrl;
    jetbrainsSvg: SafeUrl;
    settings: any;
    i18n: any;

    linkJetBrains: string = "https://www.jetbrains.com/?from=patrikx3"

    decodeEntities: Function = decodeEntities;

    tooltip: Tooltip = new Tooltip()

    currentWidthAlias: string;

    currentYear = new Date().getFullYear();

    constructor(
        private notify: NotifyService,
        private theme: ThemeService,

        protected locale: LocaleService,
        protected settingsAll: SettingsService,
        private mediaQuery: MediaQueryService,
        private domSanitizer: DomSanitizer,
        
    ) {
        this.settings = settingsAll.data.pages;

        this.subscriptions$.push(
            this.locale.subscribe((data: LocaleSubject) => {
                this.i18n = data.locale.data;
                this.setTooltip();
            })
        )

        this.unsubscribeMediaQuery = this.mediaQuery.register([
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

    ngOnDestroy(): void {
        this.unsubscribeMediaQuery()
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }
}
