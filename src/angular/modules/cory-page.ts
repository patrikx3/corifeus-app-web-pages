import {
    Component,
    Host,
    NgZone,
    AfterViewChecked,
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { RouterService } from 'corifeus-web';

import { Layout } from '../layout/cory-layout';

import { CdnService, MarkdownService  } from '../service';

import { SettingsService } from 'corifeus-web';

@Component({
    selector: 'cory-page',
    template: `
        <span [innerHTML]="content | coryHtml"></span>
    `
})

export class Page implements AfterViewChecked{

    loaded: boolean = false;

    content: any;

    constructor(
        @Host() public parent: Layout,
        private markdown: MarkdownService,
        private cdn: CdnService,
        private router: RouterService,
        private route: ActivatedRoute,
        public http: HttpClient,
        private settings: SettingsService,
        private zone: NgZone,
    ) {
        this.markdown.context = this;

        this.route.url.subscribe((segment) => {
            const path = segment.join('/');
            this.navigate(path);
        })
    }

    async navigate(path? : string) {
        if (path === undefined || path === '') {
            path = `index.html`;
        };
        try {

            let text = await this.cdn.file(this.parent.currentRepo, path);

            if (path.toLowerCase().endsWith('.json')) {
                text = `
\`\`\`json
${text}
\`\`\`                    
`
            } else if (path.toLowerCase().endsWith('.yml')) {
                text = `
\`\`\`yaml
${text}
\`\`\`                    
`


            }

            this.content = this.markdown.render(text, this.parent);

        } catch(e) {
            console.error(e);
            this.router.navigateTop(['/github/corifeus/404']);
        }
    }

    ngAfterViewChecked() {
//        const e = document.querySelector(`${decodeURI(location.hash)}-parent`);
        const e = document.querySelector(`${location.hash}-parent`);
        if (!this.loaded && e) {
            this.loaded = true;
            e.scrollIntoView()
        }
    }
}



