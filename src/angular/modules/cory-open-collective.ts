import {
    Component,
    Host,
    AfterContentChecked,
} from '@angular/core';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Layout } from '../layout/cory-layout';

import {LocaleService, LocaleSubject} from "corifeus-web";

const twemoji = require('twemoji').default;

@Component({
    selector: 'cory-open-collective',
    template: `
<span *ngIf="pkg.name !== undefined">
    
    <h1>{{ i18n.opencollective.contributors}}</h1>
    
    <div>
        {{ i18n.opencollective.contributorsMessage }}    
    </div>
      
    <div>
        <a href="https://github.com/patrikx3/{{ pkg.corifeus.reponame }}/graphs/contributors" target="_blank"><img src="https://opencollective.com/{{ pkg.name }}/contributors.svg?width=890&button=false" /></a>
        
    </div>   
    
    
   <h1><a id="#backers"></a>{{ i18n.opencollective.backers}}</h1>

    
    <div>
        {{ i18n.opencollective.backersMessage }}   
        <br/>
        <br/>
        <span [innerHTML]="twemojiPraise"></span>
        &nbsp;
        <a target="_blank" href="https://opencollective.com/{{pkg.name}}#backer">{{ i18n.opencollective.backersLink}}</a>    
    </div>
    
    
    <div>
        <a href="https://opencollective.com/{{pkg.name}}#backers" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/backers.svg?width=890"></a>
    </div>
    
    
    <h1><a id="#sponsors"></a>{{ i18n.opencollective.sponsors}}</h1>
    
    <div>
        {{ i18n.opencollective.sponsorsMessage }} 
        <br/>
        <br/>
        <span [innerHTML]="twemojiPraise"></span>
        &nbsp;
        <a target="_blank" href="https://opencollective.com/{{pkg.name}}#sponsor"> {{ i18n.opencollective.sponsorsMessageLink }}</a>
    </div>
    
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/0/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/0/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/1/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/1/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/2/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/2/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/3/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/3/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/4/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/4/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/5/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/5/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/6/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/6/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/7/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/7/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/8/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/8/avatar.svg"></a>
    <a href="https://opencollective.com/{{pkg.name}}/sponsor/9/website" target="_blank"><img src="https://opencollective.com/{{pkg.name}}/sponsor/9/avatar.svg"></a>
</span>        
    `
})
export class OpenCollective implements AfterContentChecked{

    public pkg: any;
    public twemojiPraise: SafeHtml;
    i18n: any

    constructor(
        @Host() public parent: Layout,
        public sanitize: DomSanitizer,
        protected locale: LocaleService,
    ) {
        this.twemojiPraise = sanitize.bypassSecurityTrustHtml(twemoji.parse('🙏', {
            folder: 'svg',
            ext: '.svg',
        }))

        this.locale.subscribe((subject: LocaleSubject) => {
            this.i18n = subject.locale.data.pages
        });

   }

   ngAfterContentChecked() {
       this.pkg = this.parent.packageJson;

   }
}



