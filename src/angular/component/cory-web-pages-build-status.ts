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
    <a target="_blank" href="https://travis-ci.org/patrikx3/{{ repo}}"><img src="https://travis-ci.org/patrikx3/{{ repo}}.svg?branch=master" [mdTooltip]="i18n.pages.title.travis" [mdTooltipPosition]="tooltipPosition"></a>
    
    <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/badges/quality-score.png?b=master" [mdTooltip]="i18n.pages.title.scrunitizer.quality" [mdTooltipPosition]="tooltipPosition"></a>
    
    <a target="_blank" href="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/?branch=master"><img src="https://scrutinizer-ci.com/g/patrikx3/{{ repo}}/badges/coverage.png?b=master"  [mdTooltip]="i18n.pages.title.scrunitizer.coverage" [mdTooltipPosition]="tooltipPosition"></a>
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