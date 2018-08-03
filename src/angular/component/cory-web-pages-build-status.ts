import {Component, Input} from '@angular/core';


import {LocaleService, LocaleSubject} from "corifeus-web";

@Component({
    selector: 'cory-web-pages-build-status',
    styles: [`
        span {
            position: relative;
            top: 3px;
        }
    `],
    template: `        
    <span *ngIf="pkg.corifeus.reponame !== undefined">
    <span  *ngIf="pkg.corifeus.build !== false" >
        
        <a target="cory-pages-status-travis" href="https://travis-ci.org/patrikx3/{{ pkg.corifeus.reponame }}"><img src="https://travis-ci.org/patrikx3/{{ pkg.corifeus.reponame }}.svg?branch=master" [matTooltip]="i18n.pages.title.travis" [matTooltipPosition]="tooltipPosition"></a>
        
        &nbsp;
        
        <a target="cory-pages-status-uptimerobot" href="https://uptimerobot.patrikx3.com/"><img src="https://img.shields.io/uptimerobot/ratio/m780749701-41bcade28c1ea8154eda7cca.svg" alt="Uptime Robot ratio (30 days)"></a>

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
         <a target="_blank" href="https://www.facebook.com/corifeus.software"><img [src]="i18n.pages.badge.like"  matTooltip="Corifeus Software Engineering" [matTooltipPosition]="tooltipPosition"></a>
        &nbsp;
        <a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QZVM4V6HVZJW6"><img [src]="i18n.pages.badge.donate" [matTooltip]="i18n.pages.title.donate" [matTooltipPosition]="tooltipPosition"></a>
        &nbsp;
        <a target="_blank" [href]="i18n.pages.url.contact"><img [src]="i18n.pages.badge.contact" [matTooltip]="i18n.pages.title.contact" [matTooltipPosition]="tooltipPosition"></a>         
        &nbsp;
        <a *ngIf="pkg.collective !== undefined" fragment="backers" routerLink="/github/{{ pkg.corifeus.reponame }}/open-collective"><img src="https://opencollective.com/{{pkg.name}}/backers/badge.svg" [matTooltip]="i18n.pages.title.opencollective.backers" [matTooltipPosition]="tooltipPosition"></a>
        &nbsp;
        <a *ngIf="pkg.collective !== undefined"  fragment="sponsors" routerLink="/github/{{ pkg.corifeus.reponame }}/open-collective"><img src="https://opencollective.com/{{pkg.name}}/sponsors/badge.svg" [matTooltip]="i18n.pages.title.opencollective.sponsors" [matTooltipPosition]="tooltipPosition"></a>
    </span>
            
</span>
    `
})
export class Status {
    @Input('cory-pkg') pkg: any;

    tooltipPosition: string = 'above'
    i18n: any

    constructor(
        protected locale: LocaleService,
    ) {

        this.locale.subscribe((subject: LocaleSubject) => {
            this.i18n = subject.locale.data
        });

    }
}