import {
    Component,
    Input,
    OnDestroy,
} from '@angular/core';

import { Subscription } from 'rxjs'

import {LocaleService, LocaleSubject} from "../modules/web";

@Component({
    selector: 'cory-web-pages-build-status',
    styles: [`
        .cory-web-pages-build-status {
            position: relative;
            top: 3px;
        }
    `],
    template: `
    <span *ngIf="pkg.corifeus.reponame !== undefined" class="cory-web-pages-build-status">
    <span *ngIf="pkg.corifeus.snap === true">
        <a href="https://snapcraft.io/{{ pkg.name }}" target="cory-pages-status-snap" matTooltip="Snap" [matTooltipPosition]="tooltipPosition">
            <img alt="{{ pkg.description }}" src="https://snapcraft.io/{{ pkg.name }}/badge.svg" />
        </a>
        &nbsp;
    </span>
    <span  *ngIf="pkg.corifeus.build !== false" >

        <a target="cory-pages-status-github-action" href="https://github.com/patrikx3/{{ pkg.corifeus.reponame }}/actions?query=workflow%3Acorifeus"><img src="https://github.com/patrikx3/{{ pkg.corifeus.reponame }}/workflows/nodejs/badge.svg" matTooltip="Github action status" [matTooltipPosition]="tooltipPosition"></a>
        <!--
        <a target="cory-pages-status-travis" href="https://travis-ci.com/patrikx3/{{ pkg.corifeus.reponame }}"><img src="https://api.travis-ci.com/patrikx3/{{ pkg.corifeus.reponame }}.svg?branch=master" [matTooltip]="i18n.pages.title.travis" [matTooltipPosition]="tooltipPosition"></a>
        -->

        &nbsp;

        <a target="cory-pages-status-uptimerobot" href="https://uptimerobot.patrikx3.com/"><img src="https://img.shields.io/uptimerobot/ratio/m780749701-41bcade28c1ea8154eda7cca.svg" alt="{{ i18n.pages.title.uptime }}" [matTooltip]="i18n.pages.title.uptime" [matTooltipPosition]="tooltipPosition"></a>

<!--
        &nbsp;
        <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ pkg.corifeus.reponame }}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ pkg.corifeus.reponame }}/badges/build.png?b=master" [matTooltip]="i18n.pages.title.scrunitizer.build" [matTooltipPosition]="tooltipPosition"></a>

        &nbsp;
        <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ pkg.corifeus.reponame }}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ pkg.corifeus.reponame }}/badges/quality-score.png?b=master" [matTooltip]="i18n.pages.title.scrunitizer.quality" [matTooltipPosition]="tooltipPosition"></a>
        &nbsp;
        <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ pkg.corifeus.reponame }}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ pkg.corifeus.reponame }}/badges/coverage.png?b=master"  [matTooltip]="i18n.pages.title.scrunitizer.coverage" [matTooltipPosition]="tooltipPosition"></a>
        -->
        &nbsp;
    </span>

    <span>
        <a target="_blank" href="https://paypal.me/patrikx3"><img [src]="i18n.pages.badge.donate" [matTooltip]="i18n.pages.title.donate" [matTooltipPosition]="tooltipPosition"></a>
        &nbsp;
        <a target="_blank" [href]="i18n.pages.url.contact"><img [src]="i18n.pages.badge.contact" [matTooltip]="i18n.pages.title.contact" [matTooltipPosition]="tooltipPosition"></a>
        <!--
        <span *ngIf="pkg.collective !== undefined" >
            &nbsp;
            <a fragment="backers" routerLink="/{{ pkg.corifeus.reponame }}/open-collective"><img src="https://opencollective.com/{{pkg.name}}/backers/badge.svg" [matTooltip]="i18n.pages.title.opencollective.backers" [matTooltipPosition]="tooltipPosition"></a>
        </span>
        <span *ngIf="pkg.collective !== undefined" >
            &nbsp;
            <a fragment="sponsors" routerLink="/{{ pkg.corifeus.reponame }}/open-collective"><img src="https://opencollective.com/{{pkg.name}}/sponsors/badge.svg" [matTooltip]="i18n.pages.title.opencollective.sponsors" [matTooltipPosition]="tooltipPosition"></a>
        </span>
        -->
        &nbsp;
         <a target="_blank" href="https://www.facebook.com/corifeus.software"><img [src]="i18n.pages.badge.facebook"  matTooltip="Corifeus Software Engineering" [matTooltipPosition]="tooltipPosition"></a>
    </span>

</span>
    `
})
export class Status implements OnDestroy {

    subscriptions$: Array<Subscription> = []

    @Input('cory-pkg') pkg: any;

    tooltipPosition: string = 'above'
    i18n: any

    constructor(
        protected locale: LocaleService,
    ) {

        this.subscriptions$.push(
            this.locale.subscribe((subject: LocaleSubject) => {
                this.i18n = subject.locale.data
            })
        )

    }

    ngOnDestroy(): void {
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }
}
