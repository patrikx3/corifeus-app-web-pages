import {
    Component,
    Input
} from '@angular/core';


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
<span>
    <a target="_blank" href="https://travis-ci.org/patrikx3/{{ repo}}"><img src="https://travis-ci.org/patrikx3/{{ repo}}.svg?branch=master" [matTooltip]="i18n.pages.title.travis" [matTooltipPosition]="tooltipPosition"></a>
    
    <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/badges/quality-score.png?b=master" [matTooltip]="i18n.pages.title.scrunitizer.quality" [matTooltipPosition]="tooltipPosition"></a>
    
    <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/badges/coverage.png?b=master"  [matTooltip]="i18n.pages.title.scrunitizer.coverage" [matTooltipPosition]="tooltipPosition"></a>
    
     <a target="_blank" href="https://www.facebook.com/corifeus.software"><img src="https://img.shields.io/badge/LIKE-Corifeus-3b5998.svg"  matTooltip="Corifeus Software Engineering" [matTooltipPosition]="tooltipPosition"></a>
</span>
`
})
export class Status  {
    @Input('cory-repo') repo: string;

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